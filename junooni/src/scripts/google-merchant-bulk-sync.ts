import { ExecArgs } from "@medusajs/framework/types"
import { GoogleMerchantService } from "../modules/google-merchant/service"
import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

export default async function googleMerchantBulkSync({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("[GoogleMerchant] Starting bulk sync...")

  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  const dataSourceId = process.env.GOOGLE_MERCHANT_DATASOURCE_ID

  if (!merchantId || !saKeyJson || !dataSourceId) {
    throw new Error("Missing: GOOGLE_MERCHANT_ID, GOOGLE_MERCHANT_SA_KEY, GOOGLE_MERCHANT_DATASOURCE_ID")
  }

  const merchantService = new GoogleMerchantService(
    { merchantId, dataSourceId, serviceAccountKeyJson: saKeyJson },
    logger
  )

  const PAGE_SIZE = 50
  let offset = 0
  let totalSynced = 0
  let totalFailed = 0
  let totalSkipped = 0

  while (true) {
    const { data: products } = await query.graph({
      entity: "product",
      filters: { status: "published" },
      fields: [
        "id", "title", "handle", "description", "status",
        "thumbnail", "metadata",
        "collection.title",
        "images.*",
        "variants.*",
        "variants.metadata",   // ← variant_images lives here
        "variants.options.*",
        "variants.prices.*",
      ],
      pagination: {
        take: PAGE_SIZE,
        skip: offset,
      },
    })

    if (!products || products.length === 0) break

    logger.info(`[GoogleMerchant] Processing ${offset + 1}–${offset + products.length}`)

    const allMerchantProducts = products.flatMap(mapProductToMerchantProducts)
    const totalVariants = products.reduce((acc: number, p: any) => acc + (p.variants?.length || 0), 0)
    totalSkipped += totalVariants - allMerchantProducts.length

    if (allMerchantProducts.length > 0) {
      const results = await merchantService.batchUpsert(allMerchantProducts)
      totalSynced += results.succeeded
      totalFailed += results.failed
      if (results.errors.length > 0) {
        logger.warn(`[GoogleMerchant] Errors:\n${results.errors.slice(0, 3).join("\n")}`)
      }
    }

    offset += products.length
    if (products.length < PAGE_SIZE) break
  }

  logger.info(`[GoogleMerchant] Done. Synced: ${totalSynced}, Failed: ${totalFailed}, Skipped: ${totalSkipped}`)
}
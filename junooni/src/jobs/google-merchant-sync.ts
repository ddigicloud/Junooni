import { MedusaContainer } from "@medusajs/framework/types"
import { GoogleMerchantService } from "../modules/google-merchant/service"
import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

export default async function googleMerchantSyncJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("[GoogleMerchant] Scheduled sync starting...")

  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  const dataSourceId = process.env.GOOGLE_MERCHANT_DATASOURCE_ID

  if (!merchantId || !saKeyJson || !dataSourceId) {
    logger.error("[GoogleMerchant] Missing env vars — skipping scheduled sync")
    return
  }

  const merchantService = new GoogleMerchantService(
    { merchantId, dataSourceId, serviceAccountKeyJson: saKeyJson },
    logger
  )

  const PAGE_SIZE = 50
  let offset = 0
  let totalSynced = 0
  let totalFailed = 0

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
        "variants.metadata",
        "variants.options.*",
        "variants.prices.*",
      ],
      pagination: {
        take: PAGE_SIZE,
        skip: offset,
        order: { created_at: "DESC" },
      },
    })

    if (!products || products.length === 0) break

    const allMerchantProducts = products.flatMap(mapProductToMerchantProducts)

    if (allMerchantProducts.length > 0) {
      const results = await merchantService.batchUpsert(allMerchantProducts)
      totalSynced += results.succeeded
      totalFailed += results.failed
    }

    offset += products.length
    if (products.length < PAGE_SIZE) break
  }

  logger.info(`[GoogleMerchant] Scheduled sync done. Synced: ${totalSynced}, Failed: ${totalFailed}`)
}

// Runs every 24 hours at 2 AM
export const config = {
  name: "google-merchant-daily-sync",
  schedule: "0 2 * * *",
}
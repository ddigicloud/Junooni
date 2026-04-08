import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { GoogleMerchantService } from "../modules/google-merchant/service"

function getMerchantService(logger: any): GoogleMerchantService {
  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  if (!merchantId || !saKeyJson) throw new Error("Missing Google Merchant env vars")
  return new GoogleMerchantService({ merchantId, serviceAccountKeyJson: saKeyJson }, logger)
}

export default async function productDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; variant_ids?: string[] }>) {
  const logger = container.resolve("logger")

  try {
    const merchantService = getMerchantService(logger)

    // We don't have the product anymore (it's deleted), but we should have
    // stored a mapping. If you have variant SKUs, use those.
    // Fallback: use the variant IDs that come with the event
    const variantIds = data.variant_ids || []

    if (variantIds.length === 0) {
      logger.warn(
        `[GoogleMerchant] product.deleted fired for ${data.id} but no variant_ids in payload`
      )
      return
    }

    for (const variantId of variantIds) {
      // SKUs aren't in the delete event — use the junooni-{id} fallback
      // If you always set SKUs, swap this for the SKU lookup
      await merchantService.deleteProduct(`junooni-${variantId}`)
    }
  } catch (err) {
    logger.error(`[GoogleMerchant] product.deleted handler failed: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
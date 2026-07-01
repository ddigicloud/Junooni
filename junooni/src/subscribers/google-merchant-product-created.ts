// import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
// import { GoogleMerchantService } from "../modules/google-merchant/service"
// import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

// // ─── Shared service instance (module-level singleton) ─────────────────────────

// function getMerchantService(logger: SubscriberArgs<any>["container"]["logger"]): GoogleMerchantService {
//   const merchantId = process.env.GOOGLE_MERCHANT_ID
//   const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY

//   if (!merchantId || !saKeyJson) {
//     throw new Error(
//       "Missing GOOGLE_MERCHANT_ID or GOOGLE_MERCHANT_SA_KEY env vars"
//     )
//   }

//   return new GoogleMerchantService(
//     { merchantId, serviceAccountKeyJson: saKeyJson },
//     logger
//   )
// }

// // ─── Helper: load full product with variants from Medusa ──────────────────────

// async function getFullProduct(productId: string, container: any) {
//   const productService = container.resolve("productModuleService")
//   return productService.retrieveProduct(productId, {
//     relations: [
//       "variants",
//       "variants.prices",
//       "variants.options",
//       "variants.options.option",
//       "images",
//       "collection",
//       "tags",
//     ],
//   })
// }

// // ─── Subscriber: Product Created ─────────────────────────────────────────────

// export default async function productCreatedHandler({
//   event: { data },
//   container,
// }: SubscriberArgs<{ id: string }>) {
//   const logger = container.resolve("logger")

//   try {
//     const product = await getFullProduct(data.id, container)
//     const merchantService = getMerchantService(logger)
//     const merchantProducts = mapProductToMerchantProducts(product)

//     if (merchantProducts.length === 0) {
//       logger.info(
//         `[GoogleMerchant] Skipping product ${data.id} — no publishable variants`
//       )
//       return
//     }

//     const results = await Promise.allSettled(
//       merchantProducts.map((p) => merchantService.upsertProduct(p))
//     )

//     const failed = results.filter(
//       (r) => r.status === "fulfilled" && !r.value.success
//     )
//     if (failed.length > 0) {
//       logger.warn(
//         `[GoogleMerchant] ${failed.length}/${merchantProducts.length} variants failed to sync for product ${data.id}`
//       )
//     }
//   } catch (err) {
//     logger.error(`[GoogleMerchant] product.created handler failed: ${err}`)
//   }
// }

// export const config: SubscriberConfig = {
//   event: "product.created",
// }


// subscribers/product-created.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { GoogleMerchantService } from "../modules/google-merchant/service"
import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

function getMerchantService(logger: SubscriberArgs<any>["container"]["logger"]): GoogleMerchantService {
  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY

  if (!merchantId || !saKeyJson) {
    throw new Error(
      "Missing GOOGLE_MERCHANT_ID or GOOGLE_MERCHANT_SA_KEY env vars"
    )
  }

  return new GoogleMerchantService(
    { merchantId, serviceAccountKeyJson: saKeyJson },
    logger
  )
}

async function getFullProduct(productId: string, container: any) {
  const productService = container.resolve("productModuleService")
  return productService.retrieveProduct(productId, {
    relations: [
      "variants",
      "variants.prices",
      "variants.options",
      "variants.options.option",
      "variants.images",
      "images",
      "collection",
      "tags",
      "sales_channels",
    ],
  })
}

export default async function productCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const product = await getFullProduct(data.id, container)

    // mapProductToMerchantProducts already gates on status === "published"
    // and Default Sales Channel membership — nothing further needed here.
    const merchantService = getMerchantService(logger)
    const merchantProducts = mapProductToMerchantProducts(product)

    if (merchantProducts.length === 0) {
      logger.info(
        `[GoogleMerchant] Skipping product ${data.id} — not published, not in Default Sales Channel, or no valid variants`
      )
      return
    }

    const results = await Promise.allSettled(
      merchantProducts.map((p) => merchantService.upsertProduct(p))
    )

    const failed = results.filter(
      (r) => r.status === "fulfilled" && !r.value.success
    )
    if (failed.length > 0) {
      logger.warn(
        `[GoogleMerchant] ${failed.length}/${merchantProducts.length} variants failed to sync for product ${data.id}`
      )
    }
  } catch (err) {
    logger.error(`[GoogleMerchant] product.created handler failed: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
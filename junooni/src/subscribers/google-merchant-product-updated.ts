// import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
// import { GoogleMerchantService } from "../modules/google-merchant/service"
// import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

// function getMerchantService(logger: any): GoogleMerchantService {
//   const merchantId = process.env.GOOGLE_MERCHANT_ID
//   const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
//   if (!merchantId || !saKeyJson) throw new Error("Missing Google Merchant env vars")
//   return new GoogleMerchantService({ merchantId, serviceAccountKeyJson: saKeyJson }, logger)
// }

// async function getFullProduct(productId: string, container: any) {
//   const productService = container.resolve("productModuleService")
//   return productService.retrieveProduct(productId, {
//     relations: [
//       "variants", "variants.prices", "variants.options",
//       "variants.options.option", "images", "collection", "tags",
//     ],
//   })
// }

// export default async function productUpdatedHandler({
//   event: { data },
//   container,
// }: SubscriberArgs<{ id: string }>) {
//   const logger = container.resolve("logger")

//   try {
//     const product = await getFullProduct(data.id, container)
//     const merchantService = getMerchantService(logger)

//     // If product is now a draft, remove it from Google
//     if (product.status === "draft") {
//       logger.info(
//         `[GoogleMerchant] Product ${data.id} is draft — removing from Merchant Center`
//       )
//       for (const variant of product.variants) {
//         const offerId = variant.sku || `junooni-${variant.id}`
//         await merchantService.deleteProduct(offerId)
//       }
//       return
//     }

//     // Otherwise sync all variants (upsert handles both new and updated)
//     const merchantProducts = mapProductToMerchantProducts(product)
//     if (merchantProducts.length === 0) return

//     await Promise.allSettled(
//       merchantProducts.map((p) => merchantService.upsertProduct(p))
//     )
//   } catch (err) {
//     logger.error(`[GoogleMerchant] product.updated handler failed: ${err}`)
//   }
// }

// export const config: SubscriberConfig = {
//   event: "product.updated",
// }

// subscribers/product-updated.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { GoogleMerchantService } from "../modules/google-merchant/service"
import { mapProductToMerchantProducts } from "../modules/google-merchant/mapper"

function getMerchantService(logger: any): GoogleMerchantService {
  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  if (!merchantId || !saKeyJson) throw new Error("Missing Google Merchant env vars")
  return new GoogleMerchantService({ merchantId, serviceAccountKeyJson: saKeyJson }, logger)
}

async function getFullProduct(productId: string, container: any) {
  const productService = container.resolve("productModuleService")
  return productService.retrieveProduct(productId, {
    relations: [
      "variants", "variants.prices", "variants.options",
      "variants.options.option", "variants.images",
      "images", "collection", "tags", "sales_channels",
    ],
  })
}

function isDefaultSalesChannel(product: any): boolean {
  return (product.sales_channels || []).some(
    (sc: any) => sc.name === "Default Sales Channel"
  )
}

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const product = await getFullProduct(data.id, container)
    const merchantService = getMerchantService(logger)

    // Remove from Google if no longer published OR no longer in Default Sales Channel
    const shouldBeListed = product.status === "published" && isDefaultSalesChannel(product)

    if (!shouldBeListed) {
      logger.info(
        `[GoogleMerchant] Product ${data.id} is not eligible (status=${product.status}, default_channel=${isDefaultSalesChannel(product)}) — removing from Merchant Center`
      )
      for (const variant of product.variants) {
        const offerId = variant.sku || `junooni-${variant.id}`
        await merchantService.deleteProduct(offerId)
      }
      return
    }

    // Otherwise sync all variants (upsert handles both new and updated)
    const merchantProducts = mapProductToMerchantProducts(product)
    if (merchantProducts.length === 0) return

    await Promise.allSettled(
      merchantProducts.map((p) => merchantService.upsertProduct(p))
    )
  } catch (err) {
    logger.error(`[GoogleMerchant] product.updated handler failed: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
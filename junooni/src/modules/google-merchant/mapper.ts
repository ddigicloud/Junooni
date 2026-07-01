// const STORE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://junooni.com"

// export function mapProductToMerchantProducts(product: any): any[] {
//   if (product.status !== "published") return []

//   return (product.variants || [])
//     .map((variant: any) => {
//       // ── Price ──────────────────────────────────────────────────────────────
//       const inrPrice = variant.prices?.find(
//         (p: any) => p.currency_code?.toLowerCase() === "inr"
//       )
//       if (!inrPrice) return null

//       // ── Variant-specific images from metadata.variant_images ───────────────
//       let variantImages: string[] = []
//       try {
//         const raw = variant.metadata?.variant_images
//         if (raw) {
//           const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
//           variantImages = Array.isArray(parsed)
//             ? parsed.filter((url: string) => url && url.startsWith("http"))
//             : []
//         }
//       } catch {}

//       // ── Fallback: color_images from metadata ───────────────────────────────
//       if (variantImages.length === 0) {
//         try {
//           const raw = variant.metadata?.color_images
//           if (raw) {
//             const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
//             variantImages = Array.isArray(parsed)
//               ? parsed
//                   .map((img: any) => img?.url || img)
//                   .filter((url: string) => url && url.startsWith("http"))
//               : []
//           }
//         } catch {}
//       }

//       // ── Fallback: product thumbnail + product images ───────────────────────
//       if (variantImages.length === 0) {
//         const productImages = [
//           product.thumbnail,
//           ...(product.images || []).map((img: any) => img?.url),
//         ].filter((url: string) => url && url.startsWith("http"))
//         variantImages = productImages
//       }

//       if (variantImages.length === 0) return null

//       const primaryImage = variantImages[0]
//       const additionalImages = variantImages.slice(1, 10)

//       // ── Title ──────────────────────────────────────────────────────────────
//       const variantOptions = (variant.options || [])
//         .map((o: any) => o.value)
//         .filter(Boolean)
//         .join(" / ")

//       const title = variantOptions
//         ? `${product.title} - ${variantOptions}`
//         : product.title

//       // ── Brand ──────────────────────────────────────────────────────────────
//       const brandName =
//         product.brand?.name ||
//         (product.metadata?.brand_name as string) ||
//         "JUNOONI"

//       // ── Price micros ───────────────────────────────────────────────────────
//       const amountMicros = String(Math.round(inrPrice.amount * 1_000_000))

//       // ── Availability ───────────────────────────────────────────────────────
//       const inventoryQty = variant.inventory_quantity ?? 1

//       const offerId = variant.sku || `junooni-${variant.id}`

//       return {
//         offerId,
//         contentLanguage: "en",
//         feedLabel: "IN",
//         productAttributes: {
//           title: title.slice(0, 150),
//           description: (product.description || title).replace(/<[^>]*>/g, "").slice(0, 5000),
//           link: `${STORE_BASE_URL}/in/products/${product.handle}`,
//           imageLink: primaryImage,
//           ...(additionalImages.length > 0 && { additionalImageLinks: additionalImages }),
//           availability: inventoryQty > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
//           condition: "NEW",
//           brand: brandName,
//           price: {
//             amountMicros,
//             currencyCode: "INR",
//           },
//           productTypes: product.collection
//             ? [`JUNOONI > ${product.collection.title}`]
//             : ["JUNOONI > Creator Merch"],
//           identifierExists: false,
//         },
//       }
//     })
//     .filter(Boolean)
// }

// modules/google-merchant/mapper.ts
const STORE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://junooni.com"

const DEFAULT_SALES_CHANNEL_NAME = "Default Sales Channel"

function hasDefaultSalesChannel(product: any): boolean {
  const channels = product.sales_channels || []
  return channels.some((sc: any) => sc.name === DEFAULT_SALES_CHANNEL_NAME)
}

export function mapProductToMerchantProducts(product: any): any[] {
  // ── Gate 1: must be published ─────────────────────────────────────────────
  if (product.status !== "published") return []

  // ── Gate 2: must be assigned to Default Sales Channel ─────────────────────
  if (!hasDefaultSalesChannel(product)) return []

  return (product.variants || [])
    .map((variant: any) => {
      // ── Price ──────────────────────────────────────────────────────────────
      const inrPrice = variant.prices?.find(
        (p: any) => p.currency_code?.toLowerCase() === "inr"
      )
      if (!inrPrice) return null

      // ── Images: pull from variant.images (real image relation) ─────────────
      let variantImages: string[] = (variant.images || [])
        .map((img: any) => img?.url)
        .filter((url: string) => url && url.startsWith("http"))

      // ── Fallback: product thumbnail + product images ───────────────────────
      if (variantImages.length === 0) {
        const productImages = [
          product.thumbnail,
          ...(product.images || []).map((img: any) => img?.url),
        ].filter((url: string) => url && url.startsWith("http"))
        variantImages = productImages
      }

      if (variantImages.length === 0) return null

      const primaryImage = variantImages[0]
      const additionalImages = variantImages.slice(1, 10)

      // ── Title ──────────────────────────────────────────────────────────────
      const variantOptions = (variant.options || [])
        .map((o: any) => o.value)
        .filter(Boolean)
        .join(" / ")

      const title = variantOptions
        ? `${product.title} - ${variantOptions}`
        : product.title

      // ── Brand ──────────────────────────────────────────────────────────────
      const brandName =
        product.brand?.name ||
        (product.metadata?.brand_name as string) ||
        "JUNOONI"

      // ── Price micros ───────────────────────────────────────────────────────
      const amountMicros = String(Math.round(inrPrice.amount * 1_000_000))

      // ── Availability ───────────────────────────────────────────────────────
      const inventoryQty = variant.inventory_quantity ?? 1

      const offerId = variant.sku || `junooni-${variant.id}`

      return {
        offerId,
        contentLanguage: "en",
        feedLabel: "IN",
        productAttributes: {
          title: title.slice(0, 150),
          description: (product.description || title).replace(/<[^>]*>/g, "").slice(0, 5000),
          link: `${STORE_BASE_URL}/in/products/${product.handle}`,
          imageLink: primaryImage,
          ...(additionalImages.length > 0 && { additionalImageLinks: additionalImages }),
          availability: inventoryQty > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
          condition: "NEW",
          brand: brandName,
          price: {
            amountMicros,
            currencyCode: "INR",
          },
          productTypes: product.collection
            ? [`JUNOONI > ${product.collection.title}`]
            : ["JUNOONI > Creator Merch"],
          identifierExists: false,
        },
      }
    })
    .filter(Boolean)
}
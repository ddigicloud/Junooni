import { retriveVendorsProducts } from "@lib/data/vendors"
import CreatorInstagramClient from "./CreatorInstagramClient"

export default async function CreatorInstagram({
  vendorsList,
}: {
  vendorsList: any[]
}) {
  try {
    const spotlightVendor = vendorsList?.find((vendor) => {
      // Check metadata object AND root level — Medusa sometimes flattens metadata
      const val =
        vendor.metadata?.creator_spotlight ??
        vendor.creator_spotlight

      if (typeof val === "string") return val.toLowerCase() === "true"
      return !!val
    })

    if (!spotlightVendor) {
      console.log("[CreatorInstagram] No spotlight vendor found. Vendors:", 
        vendorsList?.map(v => ({ name: v.name, meta: v.metadata, cs: v.creator_spotlight }))
      )
      return null
    }

    console.log("[CreatorInstagram] Spotlight vendor:", spotlightVendor.name, spotlightVendor.id)

    const productsResponse = await retriveVendorsProducts(spotlightVendor.id)
    console.log("[CreatorInstagram] Products response:", JSON.stringify(productsResponse))

    const rawProducts: any[] = productsResponse?.products || []

    const products = rawProducts.slice(0, 8).map((product: any) => {
      const thumbnail =
        product.thumbnail ||
        product.images?.[0]?.url ||
        product.images?.[0] ||
        null

      let priceAmount: number | null = null
      let currencyCode = "INR"

      const firstVariant = product.variants?.[0]
      if (firstVariant?.prices?.length > 0) {
        const inrPrice =
          firstVariant.prices.find(
            (p: any) => p.currency_code?.toUpperCase() === "INR"
          ) || firstVariant.prices[0]

        if (inrPrice) {
          priceAmount = (inrPrice.amount ?? 0)
          currencyCode = inrPrice.currency_code || "INR"
        }
      }

      return {
        id: product.id,
        title: product.title || "Unnamed Product",
        handle: product.handle || null,
        thumbnail,
        price: priceAmount,
        currencyCode: String(currencyCode).toUpperCase(),
      }
    })

    const vendor = {
      id: spotlightVendor.id,
      name: spotlightVendor.name,
      handle: spotlightVendor.handle,
      displayName: spotlightVendor.metadata?.display_name || spotlightVendor.name,
      bio:
        spotlightVendor.metadata?.bio ||
        spotlightVendor.creator_bio ||
        "Discover amazing products from this featured creator.",
      profileImage:
        spotlightVendor.metadata?.profile_image ||
        spotlightVendor.logo ||
        null,
      shopUrl:
        spotlightVendor.metadata?.shop_url ||
        `/creator/${spotlightVendor.handle}`,
      instagramUrl: spotlightVendor.metadata?.instagram_url || null,
      youtubeUrl: spotlightVendor.metadata?.youtube_url || null,
      instagramFollowers: spotlightVendor.metadata?.instagram_followers || 6600000,
      youtubeFollowers: spotlightVendor.metadata?.youtube_followers || 288000,
    }

    return <CreatorInstagramClient vendor={vendor} products={products} />
  } catch (err) {
    console.error("[CreatorInstagram] Server fetch failed:", err)
    return null
  }
}
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  // ✅ FIX 1: Filter featured collections server-side (same as before)
  const featuredCollections = collections.filter(
    (collection) =>
      collection.metadata !== null &&
      typeof collection.metadata.HomefeaturedCollection === "string" &&
      collection.metadata.HomefeaturedCollection.length > 0
  )

  // ✅ FIX 2: Fetch ALL collections' products in parallel on the server
  // No more useEffect waterfall — products arrive with the HTML
  const collectionsWithProducts = await Promise.all(
    featuredCollections.map(async (collection) => {
      try {
        const {
          response: { products },
        } = await listProducts({
          regionId: region.id,
          queryParams: {
            collection_id: collection.id,
            fields: "*vendor,*tags,*metadata,*variants.calculated_price",
            // ✅ FIX 3: Limit to what's visible — don't over-fetch
            limit: 10,
          },
        })
        return { collection, products: products || [] }
      } catch (error) {
        console.error(`Error fetching products for collection ${collection.id}:`, error)
        return { collection, products: [] }
      }
    })
  )

  // Filter out collections that ended up with no products
  const validCollections = collectionsWithProducts.filter(
    ({ products }) => products.length > 0
  )

  if (validCollections.length === 0) return null

  return validCollections.map(({ collection, products }) => (
    <li key={collection.id}>
      {/* ✅ FIX 4: Products passed as prop — ProductRail renders immediately */}
      <ProductRail
        collection={collection}
        region={region}
        products={products}
      />
    </li>
  ))
}
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function BestSellers({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  const featuredCollections = collections.filter(
    (collection) =>
      collection.metadata !== null &&
      typeof collection.metadata.HomefeaturedCollection2 === "string" &&
      collection.metadata.HomefeaturedCollection2.length > 0
  )

  // ✅ Fetch all bestseller collections in parallel on the server
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
            limit: 10,
          },
        })
        return { collection, products: products || [] }
      } catch (error) {
        console.error(`Error fetching bestsellers for collection ${collection.id}:`, error)
        return { collection, products: [] }
      }
    })
  )

  const validCollections = collectionsWithProducts.filter(
    ({ products }) => products.length > 0
  )

  if (validCollections.length === 0) return null

  return validCollections.map(({ collection, products }) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} products={products} />
    </li>
  ))
}
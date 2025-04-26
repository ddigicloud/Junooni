import { HttpTypes } from "@medusajs/types"
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
      typeof collection.metadata.HomefeaturedCollection2 === 'string' && 
      collection.metadata.HomefeaturedCollection2.length > 0
  )

  return featuredCollections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
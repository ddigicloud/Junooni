import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import SliderControls from "./SliderControls"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="py-12 content-container small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      
      <div className="relative">
        {/* Slider container */}
        <div className="overflow-x-auto hide-scrollbar" id={`product-rail-${collection.id}`}>
          <ul className="flex w-max">
            {pricedProducts.map((product) => (
              <li key={product.id} className="flex-shrink-0 min-w-[50%] small:min-w-[33.333%] pr-6">
                <ProductPreview product={product} region={region} isFeatured />
              </li>
            ))}
          </ul>
        </div>
        
        {/* Client component for slider controls only */}
        <SliderControls sliderId={`product-rail-${collection.id}`} itemCount={pricedProducts.length} />
      </div>
    </div>
  )
}
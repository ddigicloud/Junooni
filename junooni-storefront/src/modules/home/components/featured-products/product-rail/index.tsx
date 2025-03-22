import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import SliderControls from "./SliderControls"
import { ArrowRight } from "lucide-react"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  // Fetch products for this collection with all necessary data fields
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*vendor,*tags,*metadata,*variants.calculated_price",
    },
  })

  // Don't render anything if no products are found
  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="py-16 content-container">
      {/* Section header with collection title and "View all" link */}
      <div className="flex items-center justify-between mb-8">
        <Text className="text-4xl font-bold tracking-tight">{collection.title}</Text>
        <a 
          href={`/collections/${collection.handle}`} 
          className="flex items-center font-medium text-black transition-colors group hover:text-gray-700"
        >
          <span className="border-b border-transparent group-hover:border-current">View all</span>
          <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
     
      {/* Product slider with relative positioning for controls */}
      <div className="relative pb-8">
        {/* Slider container - ID is important for SliderControls to work */}
        <div 
          className="overflow-x-auto hide-scrollbar scroll-smooth" 
          id={`product-rail-${collection.id}`}
        >
          {/* Product list with consistent sizing */}
          <ul className="flex gap-6 w-max">
            {pricedProducts.map((product) => (
              <li 
                key={product.id} 
                className="flex-shrink-0 w-64"
              >
                <ProductPreview 
                  product={product} 
                  region={region} 
                  isFeatured 
                />
              </li>
            ))}
          </ul>
        </div>
       
        {/* Client component for slider controls */}
        <SliderControls 
          sliderId={`product-rail-${collection.id}`} 
          itemCount={pricedProducts.length} 
        />
      </div>
    </div>
  )
}
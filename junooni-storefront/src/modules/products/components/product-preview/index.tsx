import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { Heart } from "lucide-react"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const pricedProduct = await listProducts({
    regionId: region.id,
    queryParams: { id: [product.id!] },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`}>
      <div data-testid="product-wrapper" className="relative group h-full flex flex-col">
        {/* Product image container with overlay effects */}
        <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
          {/* Wishlist button */}
          <button 
            className="absolute z-10 p-2 transition-all duration-300 bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100 hover:bg-gray-50"
            aria-label="Add to wishlist"
          >
            <Heart className="w-5 h-5 text-gray-700 transition-all hover:text-black hover:fill-current" />
          </button>
          
          {/* Product tags */}
          <div className="absolute z-10 flex flex-wrap gap-2 left-3 top-3 max-w-[85%]">
            {product.tags?.map((tag) => (
              <span 
                key={tag.id} 
                className="px-2 py-1 text-xs font-medium text-white rounded bg-[#e65100] whitespace-nowrap"
              >
                {tag.value}
              </span>
            ))}
          </div>
          
          {/* Product image with hover effect */}
          <div className="transition-transform duration-500 group-hover:scale-105 h-full">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>
          
          {/* Quick add overlay - optional */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all translate-y-full opacity-0 bg-white/90 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-sm font-medium">Quick view</span>
          </div>
        </div>
        
        {/* Product info */}
        <div className="flex-grow">
          {/* Vendor name */}
          <div className="text-xs text-gray-500 mb-1">
            By {product.vendor ? product.vendor.name : "Junooni"}
          </div>
          
          {/* Product title and price */}
          <div className="flex justify-between items-start mb-2">
            <Text 
              className="text-base font-medium leading-tight line-clamp-2 pr-2" 
              data-testid="product-title"
            >
              {product.title}
            </Text>
            <div className="font-semibold text-gray-900 whitespace-nowrap">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
        
        {/* Color options */}
        {product.metadata && Object.entries(product.metadata).length > 0 && (
          <div className="mt-auto pt-3">
            <ul className="flex items-center gap-x-1">
              {Object.entries(product.metadata).map(([key, value], index) => (
                <li key={index}>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm cursor-pointer transition-transform hover:scale-110" 
                    style={{ backgroundColor: `${value}` }}
                    title={key}
                  ></div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
}
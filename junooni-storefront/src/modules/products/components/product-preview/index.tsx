import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

import WishlistButton from "@modules/wishlists/components/wishlist-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // Fetch price information for the product
  const pricedProduct = await listProducts({
    regionId: region.id,
    queryParams: { id: [product.id!] },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    return null
  }

  // Get the cheapest price for the product
  const { cheapestPrice } = getProductPrice({
    product,
  })


  return (
    
      <div data-testid="product-wrapper" className="relative flex flex-col h-full group">
        {/* Product image container with overlay effects - controls the aspect ratio */}
        <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
          {/* Wishlist button */}
         

          <WishlistButton variantId={product.variants?.[0]?.id}/>
          
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
          
          {/* Image container with transform effect - wraps the Thumbnail */}
          <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>
          
          {/* Quick add overlay - appears on hover */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all translate-y-full opacity-0 bg-white/90 group-hover:translate-y-0 group-hover:opacity-100">
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <span className="text-sm font-medium">Quick view</span>
            </LocalizedClientLink>
          </div>
        </div>
        
        {/* Product info section */}
        <div className="flex-grow" >
          {/* Vendor name */}
          <div className="mb-1 text-xs text-gray-500">
            By {product.vendor ? product.vendor.name : "Junooni"}
          </div>
           
          {/* Product title and price */}
          <div className="flex items-start justify-between mb-2">
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <Text 
              className="pr-2 text-base font-medium leading-tight line-clamp-2" 
              data-testid="product-title"
            >
              {product.title}
            </Text>
            </LocalizedClientLink>
            <div className="font-semibold text-gray-900 whitespace-nowrap">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
        
        {/* Color options - shown if product has color metadata */}
        {product.metadata && Object.entries(product.metadata).length > 0 && (
          <div className="pt-3 mt-auto">
            <ul className="flex items-center gap-x-1">
              {Object.entries(product.metadata).map(([key, value], index) => (
                <li key={index}>
                  <div 
                    className="w-6 h-6 transition-transform border border-gray-200 rounded-full shadow-sm cursor-pointer hover:scale-110" 
                    style={{ backgroundColor: `${value}` }}
                    title={key}
                  ></div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
 
  )
}
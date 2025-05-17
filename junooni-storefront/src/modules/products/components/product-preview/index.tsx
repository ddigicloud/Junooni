

// import { Text } from "@medusajs/ui"
// import { listProducts } from "@lib/data/products"
// import { getProductPrice } from "@lib/util/get-product-price"
// import { HttpTypes } from "@medusajs/types"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import Thumbnail from "../thumbnail"
// import PreviewPrice from "./price"
// import ColorSwatches from "@modules/products/components/product-preview/color-swatches"
// import WishlistButton from "@modules/wishlists/components/wishlist-button"

// export default async function ProductPreview({
//   product,
//   isFeatured,
//   region,
// }: {
//   product: HttpTypes.StoreProduct
//   isFeatured?: boolean
//   region: HttpTypes.StoreRegion
// }) {
//   // Fetch price information for the product
//   const pricedProduct = await listProducts({
//     regionId: region.id,
//     queryParams: { id: [product.id!] },
//   }).then(({ response }) => response.products[0])

//   if (!pricedProduct) {
//     return null
//   }

//   // Get the cheapest price for the product
//   const { cheapestPrice } = getProductPrice({
//     product,
//   })

//   return (
//     <div data-testid="product-wrapper" className="relative flex flex-col h-full group">
//       {/* Wrap the entire card in a link, but use pointer-events-none to allow inner elements to receive clicks */}
//       <LocalizedClientLink 
//         href={`/products/${product.handle}`} 
//         className="absolute inset-0 z-10 w-full h-full"
//         aria-label={`View ${product.title} details`}
//       >
//         <span className="sr-only">View product details</span>
//       </LocalizedClientLink>
      
//       {/* Product image container with overlay effects - controls the aspect ratio */}
//       <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
//         {/* Wishlist button - use pointer-events-auto to override the parent's pointer-events-none */}
//         <div className="absolute top-0 right-0 z-20">
//           <div className="pointer-events-auto">
//             <WishlistButton variantId={product.variants?.[0]?.id}/>
//           </div>
//         </div>
        
//         {/* Product tags */}
//         <div className="absolute z-10 flex flex-wrap gap-2 left-3 top-3 max-w-[85%]">
//           {product.tags?.map((tag) => (
//             <span 
//               key={tag.id} 
//               className="px-2 py-1 text-xs font-medium text-white rounded bg-[#e65100] whitespace-nowrap"
//             >
//               {tag.value}
//             </span>
//           ))}
//         </div>
        
//         {/* Image container with transform effect - wraps the Thumbnail */}
//         <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
//           <Thumbnail
//             thumbnail={product.thumbnail}
//             images={product.images}
//             size="full"
//             isFeatured={isFeatured}
//           />
//         </div>
//       </div>
      
//       {/* Product info section */}
//       <div className="flex-grow">
//         {/* Vendor name */}
//         <div className="mb-1 text-xs text-gray-500">
//           {/* By { product.vendor.name} */}
//         </div>
         
//         {/* Product title and price */}
//         <div className="flex items-start justify-between mb-2">
//           <Text 
//             className="pr-2 text-base font-medium leading-tight line-clamp-2" 
//             data-testid="product-title"
//           >
//             {product.title}
//           </Text>
//           <div className="font-semibold text-gray-900 whitespace-nowrap">
//             {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
//           </div>
//         </div>
        
//         {/* Color options - shown if product has color metadata */}
//         <ColorSwatches product={product} showSelected={false} />
//       </div>
//     </div>
//   )
// }




import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import ColorSwatches from "@modules/products/components/product-preview/color-swatches"
import WishlistButton from "@modules/wishlists/components/wishlist-button"
import { VariantPrice } from "types/global"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  if (!product) return null

  try {
    const pricedProduct = await listProducts({
      regionId: region.id,
      queryParams: { id: [product.id!] },
    }).then(({ response }) => response.products[0])

    if (!pricedProduct) {
      return null
    }

    const { cheapestPrice } = getProductPrice({
      product: pricedProduct,
    })

    let formattedPrice: VariantPrice | null = null;
    
    if (cheapestPrice) {
      formattedPrice = {
        calculated_price: cheapestPrice.calculated_price,
        original_price: cheapestPrice.percentage_diff > 0 ? cheapestPrice.original_price : undefined,
        price_type: cheapestPrice.percentage_diff > 0 ? "sale" : "default",
        currency_code: cheapestPrice.currency_code
      }
    }

    const brandName = product.vendor?.name || "Junooni Store";
    let discountPercentage = cheapestPrice?.percentage_diff || null;

    return (
      <div data-testid="product-wrapper" className="group bg-white h-full rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="relative overflow-hidden rounded-t-sm aspect-[3/4]">
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton variantId={product.variants?.[0]?.id} />
          </div>
          
          <div className="absolute z-10 left-2 top-2">
            {discountPercentage && discountPercentage > 0 && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-pink-500 rounded-sm">
                {discountPercentage}% OFF
              </span>
            )}
          </div>
          
          <div className="h-full w-full bg-gray-100">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          <div className="absolute inset-x-0 -bottom-10 group-hover:bottom-0 transition-all duration-300 bg-white bg-opacity-95 py-2 px-3">
            <p className="text-xs font-medium text-gray-800">Similar Products</p>
          </div>
          
          <LocalizedClientLink 
            href={`/products/${product.handle}`}
            className="absolute inset-0 z-5"
            aria-label={`View ${product.title}`}
          >
            <span className="sr-only">View product details</span>
          </LocalizedClientLink>
        </div>
        
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1 truncate">
          By  {brandName}
          </h3>
           
          <p className="text-xs text-gray-500 mb-2 line-clamp-1" data-testid="product-title">
            {product.title}
          </p>
          
          <div className="flex items-center gap-1 mb-2">
            {formattedPrice ? (
              <PreviewPrice price={formattedPrice} />
            ) : (
              <span className="text-sm font-medium text-gray-900">
                Price unavailable
              </span>
            )}
          </div>
          
          <ColorSwatches product={product} showSelected={false} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering product preview:", error);
    
    return (
      <div data-testid="product-wrapper" className="group bg-white h-full rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="relative overflow-hidden rounded-t-sm aspect-[3/4]">
          <div className="h-full w-full bg-gray-100">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="w-full h-full object-cover"
            />
          </div>
          
          <LocalizedClientLink 
            href={`/products/${product.handle}`}
            className="absolute inset-0"
            aria-label={`View ${product.title}`}
          >
            <span className="sr-only">View product details</span>
          </LocalizedClientLink>
        </div>
        
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1 truncate">
             {product.vendor ? `By ${product.vendor?.name}` : " By Brand"}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1" data-testid="product-title">
            {product.title}
          </p>
          <div className="font-medium text-sm text-pink-600">
            Price unavailable
          </div>
        </div>
      </div>
    )
  }
}


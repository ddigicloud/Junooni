// "use client"

// import { addToCart } from "@lib/data/cart"
// import { useIntersection } from "@lib/hooks/use-in-view"
// import { HttpTypes } from "@medusajs/types"
// import { Button } from "@medusajs/ui"
// import Divider from "@modules/common/components/divider"
// import OptionSelect from "@modules/products/components/product-actions/option-select"
// import { isEqual } from "lodash"
// import { useParams } from "next/navigation"
// import { useEffect, useMemo, useRef, useState } from "react"
// import ProductPrice from "../product-price"
// import MobileActions from "./mobile-actions"

// type ProductActionsProps = {
//   product: HttpTypes.StoreProduct
//   region: HttpTypes.StoreRegion
//   disabled?: boolean
// }

// // Helper function to convert variant options into a key-value map
// const optionsAsKeymap = (
//   variantOptions?: HttpTypes.StoreProductVariant["options"]
// ) => {
//   return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
//     acc[varopt.option_id] = varopt.value
//     return acc
//   }, {}) ?? {}
// }

// export default function ProductActions({
//   product,
//   disabled,
// }: ProductActionsProps) {
//   const [options, setOptions] = useState<Record<string, string | undefined>>({})
//   const [isAdding, setIsAdding] = useState(false)
//   const [quantity, setQuantity] = useState(1) // Quantity state
//   const countryCode = useParams().countryCode as string

//   useEffect(() => {
//     // Ensure product.variants is not null or undefined before accessing it
//     if (product.variants && product.variants.length > 0) {
//       const firstVariantOptions = optionsAsKeymap(product.variants[0].options)
//       setOptions(firstVariantOptions ?? {})
//     }
//   }, [product.variants])

//   const selectedVariant = useMemo(() => {
//     if (!product.variants || product.variants.length === 0) {
//       return undefined
//     }
//     return product.variants.find((v) => {
//       const variantOptions = optionsAsKeymap(v.options)
//       return isEqual(variantOptions, options)
//     })
//   }, [product.variants, options])

//   const setOptionValue = (optionId: string, value: string) => {
//     setOptions((prev) => ({
//       ...prev,
//       [optionId]: value,
//     }))
//   }

//   const isValidVariant = useMemo(() => {
//     return product.variants?.some((v) => {
//       const variantOptions = optionsAsKeymap(v.options)
//       return isEqual(variantOptions, options)
//     }) ?? false
//   }, [product.variants, options])

//   const inStock = useMemo(() => {
//     if (selectedVariant && !selectedVariant.manage_inventory) return true
//     if (selectedVariant?.allow_backorder) return true
//     if (
//       selectedVariant?.manage_inventory &&
//       (selectedVariant?.inventory_quantity || 0) > 0
//     ) {
//       return true
//     }
//     return false
//   }, [selectedVariant])

//   const actionsRef = useRef<HTMLDivElement>(null)
//   const inView = useIntersection(actionsRef, "0px")

//   const handleAddToCart = async () => {
//     if (!selectedVariant?.id) return null

//     setIsAdding(true)

//     await addToCart({
//       variantId: selectedVariant.id,
//       quantity,
//       countryCode,
//     })

//     setIsAdding(false)
//   }

//   // Increase quantity
//   const increaseQuantity = () => {
//     setQuantity((prev) => prev + 1)
//   }

//   // Decrease quantity (ensure it doesn't go below 1)
//   const decreaseQuantity = () => {
//     setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
//   }



//   return (
//     <>
//       <div className="flex flex-col gap-y-2" ref={actionsRef}>
//         <div>
//           {(product.variants?.length ?? 0) > 1 && (
//             <div className="flex flex-col gap-4 gap-y-4">
//               {(product.options || []).map((option) => {
//                 return (
//                   <div key={option.id}>
//                     <OptionSelect
//                       option={option}
//                       current={options[option.id]}
//                       updateOption={setOptionValue}
//                       title={option.title ?? ""}
//                       data-testid="product-options"
//                       disabled={!!disabled || isAdding}
                      
//                     />
//                   </div>
//                 )
//               })}

//               {/* Quantity Selector */}
//               <div>
//                 <h2 className="mb-2">Quantity</h2>
//                 <div className="flex items-center gap-4 px-2 py-1 border border-gray-300 w-max rounded-3xl">
//                   <Button
//                     onClick={decreaseQuantity}
//                     variant="secondary"
//                     className="w-8 h-8 text-lg font-semibold shadow-none hover:bg-transparent disabled:bg-transparent disabled:shadow-none"
//                     disabled={quantity <= 1}
//                   >
//                     -
//                   </Button>
//                   <span className="text-lg font-semibold">{quantity}</span>
//                   <Button
//                     onClick={increaseQuantity}
//                     variant="secondary"
//                     className="w-8 h-8 text-lg font-semibold shadow-none hover:bg-transparent bg-none disabled:bg-transparent disabled:shadow-none"
//                   >
//                     +
//                   </Button>
//                 </div>
//               </div>

//               <Divider />
//             </div>
//           )}
//         </div>

//         <ProductPrice product={product} variant={selectedVariant} />

//         <div className="flex items-center justify-between gap-3">
//           <Button
//             onClick={handleAddToCart}
//             disabled={
//               !inStock ||
//               !selectedVariant ||
//               !!disabled ||
//               isAdding ||
//               !isValidVariant
//             }
//             variant="primary"
//             className="w-full h-10"
//             isLoading={isAdding}
//             data-testid="add-product-button"
//           >
//             {!selectedVariant && !options
//               ? "Select variant"
//               : !inStock || !isValidVariant
//               ? "Out of stock"
//               : "Add to cart"}
//           </Button>

//           {inStock && (
//             <Button
//               variant="primary"
//               className="w-full h-10"
//               disabled={
//                 !inStock ||
//                 !selectedVariant ||
//                 !!disabled ||
//                 isAdding ||
//                 !isValidVariant
//               }
//             >
//               {!selectedVariant && !options
//                 ? "Select variant"
//                 : !inStock || !isValidVariant
//                 ? "Out of stock"
//                 : "Buy it now"}
//             </Button>
//           )}
//         </div>

//         <MobileActions
//           product={product}
//           variant={selectedVariant}
//           options={options}
//           updateOptions={setOptionValue}
//           inStock={inStock}
//           handleAddToCart={handleAddToCart}
//           isAdding={isAdding}
//           show={!inView}
//           optionsDisabled={!!disabled || isAdding}
//         />
//       </div>
//     </>
//   )
// }


"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import WishlistButton from "@modules/wishlists/components/wishlist-button"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import InlineWishlistButton from "./InlineWishlistButton"
import { Heart, Share2, ShoppingCart,ArrowRight} from "lucide-react";
import ShareButton from "./ShareButton"; // (top of your file, add import)

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

function stripHtml(html: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
}
// Helper function to convert variant options into a key-value map
const optionsAsKeymap = (
  variantOptions?: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {}) ?? {}
}


export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1) // Quantity state
  const [optionMetadata, setOptionMetadata] = useState<Record<string, any>>({}) // Store color metadata
  const countryCode = useParams().countryCode as string
  const [addedVariantIds, setAddedVariantIds] = useState<string[]>([])
  
  useEffect(() => {
    // Ensure product.variants is not null or undefined before accessing it
    if (product.variants && product.variants.length > 0) {
      const firstVariantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(firstVariantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Find Color option ID for easier reference
  const colorOptionId = useMemo(() => {
    return product.options?.find(opt => opt.title === "Color")?.id
  }, [product.options])

  const setOptionValue = (optionId: string, value: string, metadata?: Record<string, any>) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))

    // Store metadata if provided
    if (metadata) {
      setOptionMetadata(prev => ({
        ...prev,
        [optionId]: metadata
      }))
    }
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    }) ?? false
  }, [product.variants, options])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) return true
    if (selectedVariant?.allow_backorder) return true
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    // Get the selected color if it exists
    const selectedColorOptionId = colorOptionId
    const selectedColorValue = selectedColorOptionId ? options[selectedColorOptionId] : null
    const colorHexMetadata = selectedColorOptionId && optionMetadata[selectedColorOptionId]?.colorHex

    // Create metadata object for the cart
    const lineItemMetadata: Record<string, any> = {}
    
    // Add color information to metadata if available
    if (selectedColorValue) {
      lineItemMetadata.selectedColor = selectedColorValue
      if (colorHexMetadata) {
        lineItemMetadata.colorHex = colorHexMetadata
      }
    }

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
      metadata: Object.keys(lineItemMetadata).length > 0 ? lineItemMetadata : undefined
    })

     // Track this variant as added
    setAddedVariantIds((prev) => [...new Set([...prev, selectedVariant.id])])
    setIsAdding(false)
  }
  
  
  // Increase quantity
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // Decrease quantity (ensure it doesn't go below 1)
  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const isVariantInCart = selectedVariant ? addedVariantIds.includes(selectedVariant.id) : false
  
  const wishlistVariantId = selectedVariant?.id || product.variants?.[0]?.id
  
  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-4 gap-y-4">
              <ProductPrice product={product} variant={selectedVariant} />
              {/* Subtitle (show only if available, otherwise display: none) */}
              <p
                className="mb-2 text-gray-700"
                style={{ display: product.subtitle && stripHtml(product.subtitle).trim() ? "block" : "none" }}
                dangerouslySetInnerHTML={{ __html: product.subtitle }}
              />
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                      product={product}
                    />
                  </div>
                )
              })}

              {/* Quantity Selector */}
              <div>
                <h2 className="mb-2">Quantity</h2>
                <div className="flex items-center gap-4 px-2 py-1 border border-gray-300 w-max rounded-3xl">
                  <Button
                    onClick={decreaseQuantity}
                    variant="secondary"
                    className="w-8 h-8 text-lg font-semibold shadow-none hover:bg-transparent disabled:bg-transparent disabled:shadow-none"
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <Button
                    onClick={increaseQuantity}
                    variant="secondary"
                    className="w-8 h-8 text-lg font-semibold shadow-none hover:bg-transparent bg-none disabled:bg-transparent disabled:shadow-none"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Divider />
            </div>
          )}
        </div>

        {/* <ProductPrice product={product} variant={selectedVariant} /> */}

                <div className="flex items-center justify-start gap-3">
                    <Button
                      onClick={isVariantInCart ? () => window.location.href = '/cart' : handleAddToCart}
                      disabled={
                        !inStock ||
                        !selectedVariant ||
                        !!disabled ||
                        isAdding ||
                        !isValidVariant
                      }
                      variant="primary"
                      className="text-lg font-medium mb-2 w-full h-12 text-white bg-[#e65100] hover:bg-[#d84315] shadow-none border-none"
                      isLoading={isAdding}
                      data-testid="add-product-button"
                    >
                      {!selectedVariant && !options
                        ? "Select variant"
                        : !inStock || !isValidVariant
                        ? "Out of stock"
                        : (
                          <>
                          <ShoppingCart size={18} className="mr-2" />
                          {isVariantInCart ? (
                            <>
                              Go to Cart
                              <ArrowRight size={24} className="ml-2 " />
                            </>
                          ) : (
                            "Add to Cart"
                          )}
                        </>
                        
                        )}
                    </Button>
          
                  {/* <Button
                    onClick={handleAddToCart}
                    disabled={
                      !inStock ||
                      !selectedVariant ||
                      !!disabled ||
                      isAdding ||
                      !isValidVariant
                    }
                    variant="primary"
                    // className="w-1/2 h-10"
                    className="text-lg font-medium mb-2 w-full h-12 text-white bg-[#E65100] hover:bg-[#d84315] shadow-none hover:shadow-none focus:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    isLoading={isAdding}
                    data-testid="add-product-button"
                  >
                    {!selectedVariant && !options
                      ? "Select variant"
                      : !inStock || !isValidVariant
                      ? "Out of stock"
                      : (
                        <>
                          <ShoppingCart size={18} className="mr-2" />
                          Add to Cart
                        </>
                      )}
                  </Button> */}
        
                  {/* Social Buttons */}
                    <div className="flex items-center gap-2 mt-4 mb-6">
                      {/* <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                        <Heart size={20} />
                      </button> */}
                      <div className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                      <InlineWishlistButton variantId={wishlistVariantId} />
                    </div>
                       <ShareButton url={typeof window !== "undefined" ? window.location.href : ""} title={product.title} />
                      {/* <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                        <Share2 size={20} />
                      </button> */}
                    </div>
        
                  {/* {inStock && (
                    <Button
                      variant="primary"
                      className="w-full h-10"
                      disabled={
                        !inStock ||
                        !selectedVariant ||
                        !!disabled ||
                        isAdding ||
                        !isValidVariant
                      }
                    >
                      {!selectedVariant && !options
                        ? "Select variant"
                        : !inStock || !isValidVariant
                        ? "Out of stock"
                        : "Buy it now"}
                    </Button>
                  )} */}
                </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
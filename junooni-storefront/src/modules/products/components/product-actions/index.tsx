"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import WishlistButton from "@modules/wishlists/components/wishlist-button"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import InlineWishlistButton from "./InlineWishlistButton"
import { Heart, Share2, ShoppingCart, ArrowRight, X, Ruler  } from "lucide-react";
import ShareButton from "./ShareButton"; // (top of your file, add import)

// Extend the StoreProduct type to include size_chart
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  size_chart?: {
    id: string
    name?: string
    chart?: string
    sku?: string
    manufacturer?: string
    manufacturer_sku?: string
    chart_url?: string
    created_at: string
    updated_at: string
    deleted_at?: string
  }
}

type ProductActionsProps = {
  product: ExtendedStoreProduct
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
  const [showSizeChart, setShowSizeChart] = useState(false) // Size chart visibility state
  const countryCode = useParams().countryCode as string
  const [addedVariantIds, setAddedVariantIds] = useState<string[]>([])
  
  // Find Color option ID for easier reference - MOVED UP
  const colorOptionId = useMemo(() => {
    return product.options?.find(opt => opt.title === "Color")?.id
  }, [product.options])
  
  useEffect(() => {
    // Ensure product.variants is not null or undefined before accessing it
    if (product.variants && product.variants.length > 0) {
      const firstVariantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(firstVariantOptions ?? {})
      
      // Dispatch initial color event for image filtering
      if (colorOptionId && firstVariantOptions && firstVariantOptions[colorOptionId]) {
        try {
          const event = new CustomEvent('colorOptionChanged', {
            detail: { color: firstVariantOptions[colorOptionId] }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.warn('Failed to dispatch initial color event:', error);
        }
      }
    }
  }, [product.variants, colorOptionId])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

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

    // Dispatch custom event for color changes to update product images
    if (optionId === colorOptionId) {
      const event = new CustomEvent('colorOptionChanged', {
        detail: { color: value, metadata }
      });
      window.dispatchEvent(event);
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
          <div className="flex flex-col gap-4 gap-y-4">
            {/* PRICE IS NOW ALWAYS SHOWN - MOVED OUTSIDE THE CONDITION */}
            
            {/* Subtitle (show only if available, otherwise display: none) */}
            <p
              className="mb-2 text-gray-700"
              style={{ display: product.subtitle && stripHtml(product.subtitle).trim() ? "block" : "none" }}
              dangerouslySetInnerHTML={{ __html: product.subtitle }}
            />
            <ProductPrice product={product} variant={selectedVariant} />
            
            {/* OPTIONS, SIZE, COLOR - ONLY FOR MULTI-VARIANT PRODUCTS */}
            {(product.variants?.length ?? 0) > 1 && (
              <>
                {(product.options || []).map((option) => {
                  // Special handling for Size option to include size chart link
                  if (option.title === "Size") {
                    return (
                      <div key={option.id}>
                        {/* Custom header for Size with Size Chart link */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-base">Select {option.title}</span>
                          {product.size_chart && product.size_chart.chart && (
                            <button
                              onClick={() => setShowSizeChart(true)}
                              className="text-[#e65100] hover:text-[#d84315] text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                              SIZE CHART
                              <Ruler size={14} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                        
                        {/* Size options without title since we rendered it above */}
                        <div className="flex flex-wrap gap-3" data-testid="product-options">
                          {(option.values ?? []).map((v) => (
                            <button
                              onClick={() => setOptionValue(option.id, v.value)}
                              key={v.value}
                              className={clx(
                                "border rounded-md text-sm font-medium px-4 py-2 min-w-[60px] h-10 flex items-center justify-center transition-all",
                                {
                                  "bg-[#E65100] text-white border-[#E65100]": v.value === options[option.id],
                                  "border-gray-300 hover:border-[#E65100] bg-white text-gray-700": v.value !== options[option.id],
                                }
                              )}
                              disabled={!!disabled || isAdding}
                              data-testid="option-button"
                            >
                              {v.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  // Regular handling for non-Size options
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
              </>
            )}
          </div>
        </div>

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

          {/* Social Buttons */}
          <div className="flex items-center gap-2 mt-4 mb-6">
            <div className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
            <InlineWishlistButton variantId={wishlistVariantId} />
          </div>
             <ShareButton url={typeof window !== "undefined" ? window.location.href : ""} title={product.title} />
          </div>
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

      {/* Size Chart Modal */}
      {showSizeChart && product.size_chart && product.size_chart.chart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto relative w-full mt-8">
            {/* Close Button */}
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute z-10 p-2 bg-gray-100 rounded-full top-4 right-4 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            
            {/* Size Chart Content */}
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: product.size_chart.chart }}
            />
          </div>
        </div>
      )}
    </>
  )
}
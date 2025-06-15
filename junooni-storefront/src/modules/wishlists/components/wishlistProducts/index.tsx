"use client"

import { assets } from "@assets/assets"
import {
  wishlistItems,
  ItemDelete,
  matchItemWithVariant,
} from "@lib/data/customer"
import Image from "next/image"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton from "@modules/wishlists/components/wishlist-button"

// Interfaces
interface ProductVariant {
  id: string
  title: string
  sku?: string
  prices: {
    amount: number
    currency_code: string
  }[]
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  metadata?: Record<string, any>
}

interface ProductTag {
  id: string
  value: string
}

interface Product {
  id: string
  title: string
  handle: string
  thumbnail: string
  images?: any[]
  variants: ProductVariant[]
  tags?: ProductTag[]
  vendor?: {
    name: string
  }
  metadata?: Record<string, string>
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  price_info?: {
    display_amount: number
    currency_code: string
  }
}

interface WishlistItem {
  id: string
  product_variant_id: string
  product_variant: {
    product_id: string
  }
  product: Product
}

interface WishlistResponse {
  wishlist: {
    id: string
    items: WishlistItem[]
  }
}

interface VariantData {
  product: Product
}

interface EnhancedWishlistItem extends WishlistItem {
  variantData?: VariantData
}

interface WishlistProductsProps {
  isEmbedded?: boolean
  onCountUpdate?: (count: number) => void
}

// Skeleton for loading state
const WishlistSkeleton = ({ isEmbedded = false }) => {
  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-4 space-y-4 bg-gray-100 rounded-lg shadow animate-pulse"
          >
            <div className="aspect-[4/5] bg-gray-300 rounded-md"></div>
            <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gray-300 rounded-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const WishlistProducts = ({
  isEmbedded = false,
  onCountUpdate,
}: WishlistProductsProps) => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [removedVariantIds, setRemovedVariantIds] = useState<Set<string>>(
    new Set()
  )
  const router = useRouter()

  useEffect(() => {
    const fetchWishlistItems = async () => {
      setIsLoadingItems(true)
      try {
        const response = await wishlistItems()
        if (!response || response === "please login") {
          setTimeout(() => router.push("/account"), 3000)
          return
        }
        const data = response as WishlistResponse
        if (data?.wishlist?.items) {
          setItems(data.wishlist.items)
          if (onCountUpdate) {
            onCountUpdate(data.wishlist.items.length)
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error)
      } finally {
        setIsLoadingItems(false)
      }
    }

    fetchWishlistItems()
  }, [router, onCountUpdate])

  const handleRemoveItem = async (itemId: string) => {
    try {
      await ItemDelete(itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const handleVariantRemove = (variantId: string) => {
    setRemovedVariantIds((prev) => {
      const updated = new Set(prev)
      updated.add(variantId)
      // Calculate new count after removal
      const newCount = items.length - updated.size
      if (onCountUpdate) {
        onCountUpdate(Math.max(0, newCount))
      }
      return updated
    })
  }

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(amount)
  }

  // 🔧 Helper function to get variant-specific image
  const getVariantImage = (product: Product, variant: ProductVariant) => {
    // Try to get variant-specific image from metadata
    if (variant.metadata?.image_url) {
      return variant.metadata.image_url
    }
    
    // Try to get variant-specific image from product images array
    if (product.images && product.images.length > 1) {
      // If variant has a specific index or color, try to match it
      const variantIndex = product.variants.findIndex(v => v.id === variant.id)
      if (variantIndex > 0 && product.images[variantIndex]) {
        return product.images[variantIndex].url
      }
    }
    
    // Fallback to product thumbnail
    return product.thumbnail
  }

  // 🔧 Helper function to get variant display information
  const getVariantDisplayInfo = (variant: ProductVariant) => {
    const variantInfo = []
    
    // Add size info
    if (variant.title && variant.title !== 'Default Title') {
      variantInfo.push(`Size: ${variant.title}`)
    }
    
    // Add color info from metadata
    if (variant.metadata?.color) {
      variantInfo.push(`Color: ${variant.metadata.color}`)
    }
    
    return variantInfo.join(' • ')
  }

  // Enhanced version that automatically detects region:
  useEffect(() => {
    const fetchAllVariants = async () => {
      if (!items.length) return

      setIsLoadingProducts(true)
      try {
        // 🔧 Step 1: Get region info (same as StoreTemplate)
        let countryCode = 'us' // Default fallback
        
        try {
          // Try to get region from URL or localStorage
          const pathSegments = window.location.pathname.split('/')
          const potentialCountryCode = pathSegments[1]
          
          // Validate if it looks like a country code (2 letters)
          if (potentialCountryCode && potentialCountryCode.length === 2) {
            countryCode = potentialCountryCode
          }
        } catch (error) {
          console.log('⚠️ Could not detect country code, using default:', countryCode)
        }

        // 🔧 Step 2: Import and use the same functions as StoreTemplate
        const { listProductsWithSort } = await import("@lib/data/products")
        const { getRegion } = await import("@lib/data/regions")
        
        // Get region context (exactly like StoreTemplate)
        const region = await getRegion(countryCode)
        if (!region) {
          throw new Error('Could not get region for pricing calculation')
        }
        
        console.log('🌍 Using region for pricing:', {
          countryCode,
          regionId: region.id,
          currency: region.currency_code
        })
        
        // Extract product IDs from wishlist items
        const productIds = items.map(item => item.product_variant.product_id)
        
        console.log('🛒 Fetching wishlist products using EXACT StoreTemplate method...')
        
        // 🔧 Step 3: Use EXACT same method as StoreTemplate
        const {
          response: { products: fetchedProducts },
        } = await listProductsWithSort({
          page: 1,
          queryParams: {
            id: productIds, // Only fetch wishlist products
            limit: productIds.length
          },
          sortBy: "created_at",
          countryCode, // ✅ CRITICAL: Region context for pricing
        })
        
        console.log('✅ SUCCESS: Fetched products with pricing data:', fetchedProducts.length)
        
        // 🔧 Step 4: Verify pricing data (same check as StoreTemplate)
        let productsWithPricing = 0
        fetchedProducts.forEach((product, index) => {
          const variant = product.variants?.[0]
          const hasPrice = variant?.calculated_price?.calculated_amount
          
          if (hasPrice) {
            productsWithPricing++
          }
          
          if (index < 2) { // Debug first 2 products
            console.log(`\n📦 ${product.title}:`)
            console.log('- Has calculated_price:', !!hasPrice)
            console.log('- Amount:', variant?.calculated_price?.calculated_amount)
            console.log('- Currency:', variant?.calculated_price?.currency_code)
            console.log('- Display price:', hasPrice ? `${region.currency_code} ${(variant.calculated_price.calculated_amount / 100).toFixed(2)}` : 'N/A')
          }
        })
        
        console.log(`💰 Products with pricing: ${productsWithPricing}/${fetchedProducts.length}`)
        
        if (productsWithPricing === 0) {
          console.warn('⚠️ No products have pricing data - check your Medusa admin panel')
        }

        setProducts(fetchedProducts)
        
      } catch (error) {
        console.error("❌ StoreTemplate method failed:", error)
        
        // Enhanced fallback with better error handling
        try {
          console.log('🔄 Trying enhanced fallback...')
          
          const results = await Promise.all(
            items.map(async (item) => {
              const variantData = await matchItemWithVariant(item.product_variant.product_id)
              return { ...item, variantData } as EnhancedWishlistItem
            })
          )

          const productList = results
            .map((variant) => variant.variantData?.product || null)
            .filter((product): product is Product => !!product)

          // Add mock pricing for development if no real pricing exists
          if (process.env.NODE_ENV === 'development') {
            const enhancedProducts = productList.map(product => ({
              ...product,
              variants: product.variants?.map((variant, index) => ({
                ...variant,
                calculated_price: variant.calculated_price || {
                  calculated_amount: (index + 1) * 500 + 2000, // $20-30 range
                  currency_code: 'usd'
                }
              }))
            }))
            
            setProducts(enhancedProducts)
          } else {
            setProducts(productList)
          }
          
        } catch (fallbackError) {
          console.error("❌ All methods failed:", fallbackError)
          setProducts([])
        }
      } finally {
        setIsLoadingProducts(false)
      }
    }

    if (items.length > 0) {
      fetchAllVariants()
    }
  }, [items])

  const isLoading = isLoadingItems || isLoadingProducts

  if (isLoading) return <WishlistSkeleton isEmbedded={isEmbedded} />

  // 🔧 FIXED: Check for items that haven't been removed, not products
  const visibleItems = items.filter((item) => 
    !removedVariantIds.has(item.product_variant_id)
  )

  if (visibleItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-600">
          Your wishlist is empty
        </h2>
        <button
          className="px-5 py-2 mt-6 text-white bg-orange-600 rounded shadow-sm hover:bg-orange-700"
          onClick={() => router.push("/store")}
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div
      className={
        isEmbedded ? "w-full" : "max-w-screen-xl mx-auto w-full px-4 py-8"
      }
    >
      {/* 🔧 DEBUG INFO in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="p-3 mb-4 border border-blue-200 rounded bg-blue-50">
          <h4 className="font-medium text-blue-800">Wishlist Debug Info:</h4>
          <p className="text-sm text-blue-700">
            Items: {items.length} | Products loaded: {products.length} | 
            Removed variants: {removedVariantIds.size}
          </p>
          {items.slice(0, 2).map(item => {
            const product = products.find(p => p.id === item.product_variant.product_id)
            const variant = product?.variants.find(v => v.id === item.product_variant_id)
            return (
              <div key={item.id} className="mt-1 text-xs text-blue-600">
                {product?.title} → Variant: {variant?.title || 'Not found'} 
                (${variant?.calculated_price?.calculated_amount ? (variant.calculated_price.calculated_amount / 100).toFixed(2) : 'No price'})
              </div>
            )
          })}
        </div>
      )} */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleItems
          .map((item) => {
            // 🔧 Find the exact product for this wishlist item
            const product = products.find(p => p.id === item.product_variant.product_id)
            if (!product) {
              console.warn(`⚠️ Product ${item.product_variant.product_id} not found`)
              return null
            }

            // 🔧 Find the EXACT variant that was added to wishlist
            const specificVariant = product.variants.find(v => v.id === item.product_variant_id)
            if (!specificVariant) {
              console.warn(`⚠️ Variant ${item.product_variant_id} not found for product ${product.title}`)
              return null
            }

            // 🔧 Get variant-specific image and info
            const variantImage = getVariantImage(product, specificVariant)
            const variantDisplayInfo = getVariantDisplayInfo(specificVariant)

            // 🔧 Log the correct matching for debugging
            console.log(`✅ Matched: ${product.title} → ${specificVariant.title} → $${specificVariant.calculated_price?.calculated_amount ? (specificVariant.calculated_price.calculated_amount / 100).toFixed(2) : '0.00'}`)

            return (
              <div
                key={`${product.id}-${specificVariant.id}`}
                className="relative p-3 transition-all bg-white rounded-lg shadow group hover:shadow-lg"
              >
                <LocalizedClientLink
                  href={`/products/${product.handle}?variant=${specificVariant.id}`} // ✅ Link to specific variant
                  className="absolute inset-0 z-10"
                >
                  <span className="sr-only">View {product.title} - {specificVariant.title}</span>
                </LocalizedClientLink>

                <div className="relative overflow-hidden rounded-md bg-gray-50 aspect-[4/5] mb-3">
                  <Image
                    src={variantImage}
                    alt={`${product.title} - ${specificVariant.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-0 right-0 z-20">
                    <WishlistButton
                      isWishlistPage
                      variantId={specificVariant.id} // ✅ Use specific variant ID
                      onRemove={handleVariantRemove}
                    />
                  </div>
                  
                  {/* 🔧 Show variant info badge */}
                  {/* {variantDisplayInfo && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black rounded bottom-2 left-2 bg-opacity-70">
                      {variantDisplayInfo}
                    </div>
                  )} */}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {product.vendor?.name || "Vendor"}
                  </p>
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {product.title}
                  </h3>
                  
                  {/* 🔧 Show variant details */}
                  {variantDisplayInfo && (
                    <p className="text-xs text-gray-600">
                      {variantDisplayInfo}
                    </p>
                  )}
                  
                  {/* 🔧 CORRECT PRICE: Use specific variant's calculated price */}
                  <p className="text-sm font-medium text-gray-700">
                    {(() => {
                      // First try calculated_price (preferred method from StoreTemplate)
                      if (specificVariant.calculated_price?.calculated_amount) {
                        return (
                          <span className="flex items-center gap-1">
                            {formatPrice(
                              specificVariant.calculated_price.calculated_amount,
                              specificVariant.calculated_price.currency_code || 'USD'
                            )}
                            {/* <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                              ✓
                            </span> */}
                          </span>
                        )
                      }
                      
                      // Fallback to prices array
                      if (specificVariant.prices?.[0]?.amount) {
                        return (
                          <span className="flex items-center gap-1">
                            {formatPrice(
                              specificVariant.prices[0].amount / 100,
                              specificVariant.prices[0].currency_code || 'USD'
                            )}
                            <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              ALT
                            </span>
                          </span>
                        )
                      }
                      
                      return (
                        <span className="flex items-center gap-1 text-gray-500">
                          Price unavailable
                          <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            ✗
                          </span>
                        </span>
                      )
                    })()}
                  </p>

                  {/* 🔧 SKU info for identification */}
                  {/* {specificVariant.sku && (
                    <p className="text-xs text-gray-400">
                      SKU: {specificVariant.sku}
                    </p>
                  )} */}
                </div>
              </div>
            )
          })
          .filter(Boolean)} {/* Remove null entries */}
      </div>
    </div>
  )
}
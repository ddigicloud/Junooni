"use client"

import { assets } from "@assets/assets"
// import {
//   wishlistItems,
//   ItemDelete,
//   matchItemWithVariant,
// } from "@lib/data/customer"
import Image from "next/image"
import { wishlistItems, ItemDelete } from "@lib/data/wishlist-client"
import { matchItemWithVariant } from "@lib/data/customer"
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
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [removedVariantIds, setRemovedVariantIds] = useState<Set<string>>(
    new Set()
  )
  const router = useRouter()

  // ✅ Single merged useEffect — no waterfall, no re-render between fetches
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)

      try {
        // ✅ Detect country code
        let countryCode = "in"
        try {
          const pathSegments = window.location.pathname.split("/")
          const potential = pathSegments[1]
          if (potential && potential.length === 2) countryCode = potential
        } catch {}

        // ✅ Run wishlistItems + getRegion in PARALLEL — saves 300-500ms
        const { getRegion } = await import("@lib/data/regions")

        const [response, region] = await Promise.all([
          wishlistItems(),
          getRegion(countryCode),
        ])

        // ✅ Auth check — no redirect, just show empty state
        if (!response || response === "please login") {
          return
        }

        const data = response as WishlistResponse
        const fetchedItems = data?.wishlist?.items ?? []

        setItems(fetchedItems)
        if (onCountUpdate) onCountUpdate(fetchedItems.length)

        // ✅ Bail early if nothing to fetch
        if (!fetchedItems.length || !region) return

        // ✅ Fetch products immediately — no waiting for re-render of items state
        const { listProductsWithSort } = await import("@lib/data/products")
        const productIds = fetchedItems.map(
          (item) => item.product_variant.product_id
        )

        const {
          response: { products: fetchedProducts },
        } = await listProductsWithSort({
          page: 1,
          queryParams: {
            id: productIds,
            limit: productIds.length,
          },
          sortBy: "created_at",
          countryCode,
        })

        setProducts(fetchedProducts)
      } catch (error) {
        // Fallback: try matchItemWithVariant per item
        try {
          const fallbackResponse = await wishlistItems()
          if (!fallbackResponse || fallbackResponse === "please login") return

          const fallbackData = fallbackResponse as WishlistResponse
          const fallbackItems = fallbackData?.wishlist?.items ?? []

          if (!fallbackItems.length) return

          const results = await Promise.all(
            fallbackItems.map(async (item) => {
              const variantData = await matchItemWithVariant(
                item.product_variant.product_id
              )
              return { ...item, variantData } as EnhancedWishlistItem
            })
          )

          const productList = results
            .map((variant) => variant.variantData?.product || null)
            .filter((product): product is Product => !!product)

          setItems(fallbackItems)
          setProducts(productList)
          if (onCountUpdate) onCountUpdate(fallbackItems.length)
        } catch {
          setProducts([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [onCountUpdate]) // ✅ No router, no items in deps — no unnecessary re-runs

  const handleRemoveItem = async (itemId: string) => {
    try {
      await ItemDelete(itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch {}
  }

  const handleVariantRemove = (variantId: string) => {
    setRemovedVariantIds((prev) => {
      const updated = new Set(prev)
      updated.add(variantId)
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

  const getVariantImage = (product: Product, variant: ProductVariant) => {
    if (variant.metadata?.image_url) {
      return variant.metadata.image_url
    }
    if (product.images && product.images.length > 1) {
      const variantIndex = product.variants.findIndex((v) => v.id === variant.id)
      if (variantIndex > 0 && product.images[variantIndex]) {
        return product.images[variantIndex].url
      }
    }
    return product.thumbnail
  }

  const getVariantDisplayInfo = (variant: ProductVariant) => {
    const variantInfo = []
    if (variant.title && variant.title !== "Default Title") {
      variantInfo.push(`Size: ${variant.title}`)
    }
    if (variant.metadata?.color) {
      variantInfo.push(`Color: ${variant.metadata.color}`)
    }
    return variantInfo.join(" • ")
  }

  if (isLoading) return <WishlistSkeleton isEmbedded={isEmbedded} />

  const visibleItems = items.filter(
    (item) => !removedVariantIds.has(item.product_variant_id)
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
        isEmbedded
          ? "w-full"
          : "max-w-screen-xl mx-auto w-full sm:px-4 md:px-4 sm:py-8 md:py-8 px-0 py-3"
      }
    >
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleItems
          .map((item) => {
            const product = products.find(
              (p) => p.id === item.product_variant.product_id
            )
            if (!product) return null

            const specificVariant = product.variants.find(
              (v) => v.id === item.product_variant_id
            )
            if (!specificVariant) return null

            const variantImage = getVariantImage(product, specificVariant)
            const variantDisplayInfo = getVariantDisplayInfo(specificVariant)

            return (
              <div
                key={`${product.id}-${specificVariant.id}`}
                className="relative p-3 transition-all bg-white shadow group hover:shadow-lg"
              >
                <LocalizedClientLink
                  href={`/products/${product.handle}?variant=${specificVariant.id}`}
                  className="absolute inset-0 z-10"
                >
                  <span className="sr-only">
                    View {product.title} - {specificVariant.title}
                  </span>
                </LocalizedClientLink>

                <div className="relative overflow-hidden rounded-md bg-gray-50 aspect-auto mb-3">
                  <img
                    src={variantImage}
                    alt={`${product.title} - ${specificVariant.title}`}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-0 right-0 z-20">
                    <WishlistButton
                      isWishlistPage
                      variantId={specificVariant.id}
                      onRemove={handleVariantRemove}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {product.vendor?.name || "Vendor"}
                  </p>
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {product.title}
                  </h3>

                  {variantDisplayInfo && (
                    <p className="text-xs text-gray-600">{variantDisplayInfo}</p>
                  )}

                  <p className="text-sm font-medium text-gray-700">
                    {(() => {
                      if (specificVariant.calculated_price?.calculated_amount) {
                        return (
                          <span>
                            {formatPrice(
                              specificVariant.calculated_price.calculated_amount,
                              specificVariant.calculated_price.currency_code ||
                                "USD"
                            )}
                          </span>
                        )
                      }
                      if (specificVariant.prices?.[0]?.amount) {
                        return (
                          <span className="flex items-center gap-1">
                            {formatPrice(
                              specificVariant.prices[0].amount / 100,
                              specificVariant.prices[0].currency_code || "USD"
                            )}
                            <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              ALT
                            </span>
                          </span>
                        )
                      }
                      return (
                        <span className="text-gray-500">Price unavailable</span>
                      )
                    })()}
                  </p>
                </div>
              </div>
            )
          })
          .filter(Boolean)}
      </div>
    </div>
  )
}
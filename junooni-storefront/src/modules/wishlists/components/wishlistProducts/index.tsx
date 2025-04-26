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
  prices: {
    amount: number
    currency_code: string
  }[]
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
}

// Skeleton for loading state
const WishlistSkeleton = ({ isEmbedded = false }) => {
  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg shadow bg-gray-100 p-4 animate-pulse space-y-4"
          >
            <div className="aspect-[4/5] bg-gray-300 rounded-md"></div>
            <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-300"></div>
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
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error)
      } finally {
        setIsLoadingItems(false)
      }
    }

    fetchWishlistItems()
  }, [router])

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
      return updated
    })
  }

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(amount / 100)
  }

  useEffect(() => {
    const fetchAllVariants = async () => {
      if (!items.length) return

      setIsLoadingProducts(true)
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const variantData = await matchItemWithVariant(
              item.product_variant.product_id
            )
            return { ...item, variantData } as EnhancedWishlistItem
          })
        )

        const productList = results
          .map((variant) => variant.variantData?.product || null)
          .filter((product): product is Product => !!product)

        setProducts(productList)
      } catch (error) {
        console.error("Error fetching product details:", error)
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

  const visibleProducts = products.filter((product) => {
    const variantId = product.variants?.[0]?.id
    return variantId && !removedVariantIds.has(variantId)
  })

  if (visibleProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-600">
          Your wishlist is empty
        </h2>
        <button
          className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded shadow-sm"
          onClick={() => router.push("/products")}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product) => {
          const variant = product.variants[0]
          return (
            <div
              key={product.id}
              className="relative group bg-white rounded-lg shadow hover:shadow-lg transition-all p-3"
            >
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">View {product.title}</span>
              </LocalizedClientLink>

              <div className="relative overflow-hidden rounded-md bg-gray-50 aspect-[4/5] mb-3">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-0 right-0 z-20">
                  <WishlistButton
                    isWishlistPage
                    variantId={variant?.id}
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
                <p className="text-sm font-medium text-gray-700">
                  {formatPrice(
                    variant?.prices?.[0]?.amount || 0,
                    variant?.prices?.[0]?.currency_code || "USD"
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

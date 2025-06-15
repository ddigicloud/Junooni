"use client"

import { Text } from "@medusajs/ui"
import { Region } from "@medusajs/medusa"
import { ProductPreviewType } from "@modules/products/types"
import Link from "next/link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import InlineWishlistButton from "@modules/products/components/product-actions/InlineWishlistButton"
import { Heart, Star } from "lucide-react"

type ProductPreviewProps = {
  product: ProductPreviewType
  region: Region
  listView?: boolean
}

const ProductPreview = ({ product, region, listView = false }: ProductPreviewProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const { handle, title, thumbnail, variants, collection, metadata } = product
  
  const price = product.variants[0]?.prices?.find(
    (p) => p.currency_code === region.currency_code
  )
  
  const wishlistVariantId = variants?.[0]?.id
  // Check if product is on sale
  const originalPrice = price?.original_amount
  const hasDiscount = originalPrice && originalPrice > price.amount
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price.amount) / originalPrice) * 100) 
    : 0
  
  // Determine if product is new (released within the last 30 days)
  const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  // Check if product is limited edition
  const isLimited = metadata?.limited_edition === "true"
  
  // Get product rating
  const rating = metadata?.rating ? parseFloat(metadata.rating) : null
  const reviewCount = metadata?.review_count ? parseInt(metadata.review_count) : null
  
  return (
    <Link href={`/products/${handle}`} passHref>
      <div
        className="relative h-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <Thumbnail 
            thumbnail={thumbnail} 
            size="full" 
            className={`object-cover transition-transform duration-500 group-hover:scale-105 h-full w-full`}
          />
          
          {/* Badges */}
          <div className="absolute flex flex-col gap-2 left-3 top-3">
            {isNew && (
              <span className="px-2 py-1 text-xs text-white bg-black rounded">
                New
              </span>
            )}
            {isLimited && (
              <span className="px-2 py-1 text-xs text-white rounded bg-primary-500">
                Limited Edition
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Wishlist button */}
          {/* <button className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100">
            <Heart size={18} />
          </button> */}
          <div className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
            <InlineWishlistButton variantId={wishlistVariantId} />
          </div>
          
          {/* Quick add to cart - only show on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
            <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between">
            <Text className="font-medium text-gray-900 transition-colors group-hover:text-primary-500">
              {title}
            </Text>
            <div className="text-right">
              {hasDiscount ? (
                <div>
                  <Text className="font-semibold">
                    {price?.currency_code.toUpperCase()} {(price?.amount / 100).toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-500 line-through">
                    {price?.currency_code.toUpperCase()} {(originalPrice / 100).toFixed(2)}
                  </Text>
                </div>
              ) : (
                <Text className="font-semibold">
                  {price?.currency_code.toUpperCase()} {(price?.amount / 100).toFixed(2)}
                </Text>
              )}
            </div>
          </div>
          
          {/* Collection name */}
          {collection && (
            <Text className="mt-1 text-sm text-gray-500">
              {collection.title}
            </Text>
          )}
          
          {/* Star Rating */}
          {rating && (
            <div className="flex items-center mt-2">
              <div className="flex mr-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill={i < Math.floor(rating) ? "currentColor" : "none"}
                    size={14}
                    className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              {reviewCount && (
                <span className="text-xs text-gray-600">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductPreview
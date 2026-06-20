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
  
  const { handle, title, variants, collection, metadata } = product
  
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
  
  // Get vendor/brand name (using collection title as vendor)
  const vendorName = collection?.title || metadata?.brand || "Brand Name"
  
  // Mock color options (in real implementation, these would come from product variants)
  const colorOptions = variants?.slice(0, 4) || []
  
  return (
    <div className="relative bg-white group">
      <Link href={`/products/${handle}`} className="block">
        {/* Image Section */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <Thumbnail 
            thumbnail={product.thumbnail} 
            size="full" 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Wishlist Button - Positioned on image */}
          {/* <div className="absolute z-10 top-2 right-2">
            <div className="flex items-center justify-center w-8 h-8 transition-shadow bg-white rounded-full shadow-sm hover:shadow-md">
              <InlineWishlistButton variantId={wishlistVariantId} />
            </div>
          </div> */}
        </div>
        
        {/* Content Section - Below Image */}
        <div className="p-3 space-y-2">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-1">
            {isNew && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-green-500 rounded">
                NEW
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded">
                {discountPercentage}% OFF
              </span>
            )}
            {isLimited && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded">
                LIMITED
              </span>
            )}
          </div>
          
          {/* Product Name */}
          <div className="min-h-[2.5rem]">
            <Text className="text-sm font-medium leading-tight text-gray-900 line-clamp-2">
              {title}
            </Text>
          </div>
          
          {/* Vendor Name */}
          <div>
            <Text className="text-xs font-medium text-gray-600">
              {vendorName}
            </Text>
          </div>
          
          {/* Color Options */}
          {colorOptions.length > 0 && (
            <div className="flex items-center gap-1">
              {colorOptions.slice(0, 4).map((variant, index) => (
                <div
                  key={variant.id || index}
                  className="w-4 h-4 border border-gray-200 rounded-full"
                  style={{
                    backgroundColor: variant.metadata?.color || 
                      ['#000000', '#FF0000', '#0000FF', '#00FF00'][index]
                  }}
                />
              ))}
              {colorOptions.length > 4 && (
                <span className="ml-1 text-xs text-gray-500">
                  +{colorOptions.length - 4} more
                </span>
              )}
            </div>
          )}
          
          {/* Price Row */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <Text className="text-sm font-bold text-gray-900">
                  ₹{(price?.amount / 100).toFixed(0)}
                </Text>
                <Text className="text-xs text-gray-500 line-through">
                  ₹{(originalPrice / 100).toFixed(0)}
                </Text>
                <Text className="text-xs font-medium text-green-600">
                  {discountPercentage}% off
                </Text>
              </>
            ) : (
              <Text className="text-sm font-bold text-gray-900">
                ₹{(price?.amount / 100).toFixed(0)}
              </Text>
            )}
          </div>
          
          {/* Review Section */}
          {rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill={i < Math.floor(rating) ? "#FFC107" : "none"}
                    size={12}
                    className={i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
              <Text className="text-xs text-gray-600">
                {rating.toFixed(1)}
              </Text>
              {reviewCount && (
                <Text className="text-xs text-gray-500">
                  ({reviewCount.toLocaleString()})
                </Text>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default ProductPreview
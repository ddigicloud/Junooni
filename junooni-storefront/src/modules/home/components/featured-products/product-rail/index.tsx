"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import SliderControls from "./SliderControls"
import { ArrowRight } from "lucide-react"
import { useBatchReviews } from "@lib/hooks/useBatchReviews"

interface ProductRailProps {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  // ✅ FIX: Products now come from server — no fetch needed here
  products: any[]
}

export default function ProductRail({ collection, region, products }: ProductRailProps) {
  // ✅ Reviews-only fetch on client side — this is the only remaining async call
  // It fires immediately on mount with products already available (no waterfall)
  const { reviewsData, loading: reviewsLoading } = useBatchReviews(products, {
    enabled: products.length > 0,
    batchSize: 5,
    batchDelay: 100,
  })

  // No products — render nothing (already filtered in parent, but safety check)
  if (!products || products.length === 0) return null

  return (
    <div className="py-8 sm:py-12 md:py-12 content-container">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <Text className="text-4xl font-bold tracking-tight">{collection.title}</Text>
        <a
          href={`/collections/${collection.handle}`}
          className="flex items-center font-medium text-black transition-colors group hover:text-gray-700"
        >
          <span className="border-b border-transparent group-hover:border-current">View all</span>
          <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>

      {/* Product slider */}
      <div className="relative pb-8">
        <div
          className="overflow-x-auto hide-scrollbar scroll-smooth"
          id={`product-rail-${collection.id}`}
        >
          <ul className="flex gap-6 w-max">
            {products.map((product, index) => {
              const productReviewData = reviewsData[product.id] || {
                averageRating: 0,
                reviewCount: 0,
              }

              return (
                <li key={product.id} className="flex-shrink-0 w-64">
                  <ProductPreview
                    product={product}
                    region={region}
                    reviewData={{
                      averageRating: productReviewData.averageRating,
                      reviewCount: productReviewData.reviewCount,
                      // ✅ Only show loading spinner if reviews haven't resolved yet
                      isLoading: reviewsLoading && !reviewsData[product.id],
                    }}
                    isFeatured
                  />
                </li>
              )
            })}
          </ul>
        </div>

        <SliderControls
          sliderId={`product-rail-${collection.id}`}
          itemCount={products.length}
        />
      </div>
    </div>
  )
}
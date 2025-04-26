"use client"
import { getProductReviews } from "@lib/data/products"
import { Star, StarSolid } from "@medusajs/icons"
import { StoreProductReview } from "types/global"
import { Button } from "@medusajs/ui"
import { useState, useEffect } from "react"
import ProductReviewsForm from "./form"

type ProductReviewsProps = {
  productId: string;
  productHandle?: string;
}

// Skeleton component for the reviews
const ReviewsSkeleton = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="pb-4 border-b sm:pb-6">
          <div className="flex flex-col mb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-32 h-4 mb-1 bg-gray-200 rounded animate-pulse sm:mb-0" />
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="flex mb-1 sm:mb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 mr-1 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
          
          <div className="w-1/2 h-4 mb-1 bg-gray-200 rounded animate-pulse sm:mb-2" />
          <div className="w-full h-16 mb-3 bg-gray-200 rounded animate-pulse sm:mb-4" />
        </div>
      ))}
    </div>
  );
};

// Skeleton component for the rating summary
const RatingSummarySkeleton = () => {
  return (
    <div className="p-3 mb-3 rounded-lg bg-gray-50 sm:p-4 sm:mb-4">
      <div className="w-16 h-8 mx-auto mb-1 bg-gray-200 rounded animate-pulse sm:mb-2" />
      <div className="flex justify-center mb-1 sm:mb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 mx-1 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-4 mx-auto mb-2 bg-gray-200 rounded w-36 animate-pulse sm:mb-4" />
    </div>
  );
};

export default function ProductReviews({
  productId,
  productHandle,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const defaultLimit = 10
  const [reviews, setReviews] = useState<StoreProductReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [hasMoreReviews, setHasMoreReviews] = useState(false)
  const [count, setCount] = useState(0)
  const [sortOption, setSortOption] = useState("most_recent")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchReviews = (pageNum = page, refresh = false) => {
    setIsLoading(true)
    return getProductReviews({
      productId,
      limit: defaultLimit,
      offset: (pageNum - 1) * defaultLimit,
    }).then(({ reviews: paginatedReviews, average_rating, count, limit }) => {
      if (refresh) {
        setReviews(paginatedReviews)
      } else {
        setReviews((prev) => {
          const newReviews = paginatedReviews.filter(
            (review) => !prev.some((r) => r.id === review.id)
          )
          return [...prev, ...newReviews]
        })
      }
      
      setAverageRating(average_rating || 0)
      setHasMoreReviews(count > limit * pageNum)
      
      // Ensure count is a number and set it
      const reviewCount = typeof count === 'number' ? count : paginatedReviews.length;
      setCount(reviewCount)
      
      return { averageRating: average_rating, count: reviewCount }
    }).catch(error => {
      console.error("Error fetching reviews:", error)
      return { averageRating: 0, count: 0 }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    fetchReviews()
  }, [page, productId])

  // Callback for when review is successfully submitted
  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    // Refresh reviews to show the new one
    fetchReviews(1, true)
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value)
    // Here you would implement actual sorting logic
    // For now, we'll just refresh the reviews
    fetchReviews(1, true)
  }

  return (
    <div className="product-page-constraint" id="reviews">
      <h2 className="mb-8 text-2xl font-bold text-start">Product Reviews ({reviews.length})</h2>
      
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left column - Rating summary */}
        <div className="w-full lg:w-1/3">
          {isLoading && page === 1 ? (
            <RatingSummarySkeleton />
          ) : (
            <div className="p-3 mb-3 rounded-lg bg-gray-50 sm:p-4 sm:mb-4">
              <h3 className="mb-1 text-xl font-bold text-center sm:text-2xl sm:mb-2">
                {averageRating.toFixed(1)}
              </h3>
              <div className="flex justify-center mb-1 text-yellow-400 sm:mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(averageRating) ? (
                      <StarSolid className="text-ui-tag-orange-icon" />
                    ) : (
                      <Star className="text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
              <p className="mb-2 text-xs text-center text-gray-600 sm:text-sm sm:mb-4">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full bg-[#e65100] border-none text-white font-medium hover:bg-[#d84315]"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Write a Review
          </Button>
          
          {/* Review form appears directly below the button */}
          {showReviewForm && (
            <div className="mt-4">
              <ProductReviewsForm 
                productId={productId} 
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}
        </div>
        
        {/* Right column - Reviews list */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-medium sm:text-base">Customer Reviews</h3>
            <select 
              className="p-1 text-xs border rounded sm:text-sm"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="most_recent">Most Recent</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="lowest_rated">Lowest Rated</option>
            </select>
          </div>
          
          {isLoading && page === 1 ? (
            <ReviewsSkeleton />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b sm:pb-6">
                    <div className="flex flex-col mb-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-1 sm:mb-0">
                        <div className="mr-2 text-sm font-medium">
                          {review.first_name} {review.last_name}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 sm:text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex mb-1 text-yellow-400 sm:mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>
                          {i < review.rating ? (
                            <StarSolid className="text-ui-tag-orange-icon" />
                          ) : (
                            <Star className="text-gray-300" />
                          )}
                        </span>
                      ))}
                    </div>
                    
                    {review.title && (
                      <h4 className="mb-1 text-sm font-medium sm:mb-2">{review.title}</h4>
                    )}
                    <p className="mb-3 text-xs text-gray-700 sm:text-sm sm:mb-4">
                      {review.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-xs text-center text-gray-500 sm:text-sm sm:py-8">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
            </div>
          )}
          
          {hasMoreReviews && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="secondary" 
                onClick={() => setPage(page + 1)}
                className="text-sm"
                disabled={isLoading}
              >
                {isLoading && page > 1 ? "Loading..." : "Load more reviews"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
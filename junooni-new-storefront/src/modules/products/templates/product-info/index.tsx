"use client"
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getProductReviews } from "@lib/data/products";


type ProductInfoProps = {
  product: HttpTypes.StoreProduct;
};

const ReviewsSkeleton = () => {
  return (
    <div className="flex items-center">
      <div className="flex mr-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 mr-1 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="w-8 h-4 mr-2 bg-gray-200 rounded animate-pulse" />
      <div className="w-1 h-4 mx-2 bg-gray-200 rounded animate-pulse" />
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch actual review data
    setIsLoading(true);
    getProductReviews({
      productId: product.id,
      limit: 100, // Increase limit to get all reviews and accurate count
      offset: 0,
    })
      .then(({ reviews: paginatedReviews, average_rating, count }) => {
        setAverageRating(average_rating || 0);
        // Use the actual length of reviews array for the count
        const actualCount = paginatedReviews?.length || 0;
        setReviewCount(actualCount);
        console.log("ProductInfo - reviews count:", actualCount, "API count:", count);
      })
      .catch((error) => {
        console.error("Error fetching product reviews:", error);
        // Fallback to default values on error
        setAverageRating(0);
        setReviewCount(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [product.id]);

  return (
    <div>
      {/* Product Title */}
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">{product.title}</h1>
     
      {/* Ratings */}
      <div className="flex items-center mb-4">
        {isLoading ? (
          <ReviewsSkeleton />
        ) : reviewCount > 0 ? (
          <>
            <div className="flex mr-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                  size={16}
                  className={i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
            <span className="mx-2 text-gray-400">|</span>
            <LocalizedClientLink href={`/products/${product.handle}#reviews`} className="text-sm text-gray-600 hover:underline">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </LocalizedClientLink>
          </>
        ) : (
          <LocalizedClientLink href={`/products/${product.handle}#reviews`} className="text-sm text-gray-600 hover:underline">
            No reviews yet. Be the first to review!
          </LocalizedClientLink>
        )}
      </div>
     
      {/* Short Description */}
      {/* <p className="mb-6 text-gray-700">
        {product.description}
      </p> */}
      {/* Short Description */}
      {/* <p
        className="mb-2 text-gray-700"
        dangerouslySetInnerHTML={{ __html: product.subtitle }}
      /> */}

     
      {/* Collection Link (if available) */}
      {/* {product.collection && (
        <div className="mb-4">
          <span className="text-sm text-gray-600">Collection: </span>
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm font-medium text-[#e65100] hover:underline"
          >
            {product.collection.title}
          </LocalizedClientLink>
        </div>
      )} */}
    </div>
  );
};

export default ProductInfo;
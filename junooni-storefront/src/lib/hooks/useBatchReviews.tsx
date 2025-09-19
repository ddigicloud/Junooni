// src/lib/hooks/useBatchReviews.ts - FIXED VERSION
import { useState, useEffect } from 'react';
import { getProductReviews } from '@lib/data/products';

interface Product {
  id: string;
  title?: string;
  [key: string]: any;
}

interface ReviewData {
  averageRating: number;
  reviewCount: number;
}

interface ReviewsDataMap {
  [productId: string]: ReviewData;
}

interface UseBatchReviewsReturn {
  reviewsData: ReviewsDataMap;
  loading: boolean;
  error: string | null;
}

interface UseBatchReviewsOptions {
  enabled?: boolean;
  batchSize?: number;
  batchDelay?: number;
}

export const useBatchReviews = (
  products: Product[] = [], 
  options: UseBatchReviewsOptions = {}
): UseBatchReviewsReturn => {
  const { enabled = true, batchSize = 5, batchDelay = 100 } = options;
  
  const [reviewsData, setReviewsData] = useState<ReviewsDataMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !products.length) return;

    let isCancelled = false;
    
    const fetchBatchReviews = async (): Promise<void> => {
      //console.log(`🔄 Starting batch review fetch for ${products.length} products`);
      setLoading(true);
      setError(null);

      try {
        // Create batches to avoid overwhelming the API
        const batches: Product[][] = [];
        
        for (let i = 0; i < products.length; i += batchSize) {
          batches.push(products.slice(i, i + batchSize));
        }

        //console.log(`📦 Created ${batches.length} batches`);

        const allReviewsData: ReviewsDataMap = {};

        // Process batches with delay between them
        for (const [batchIndex, batch] of batches.entries()) {
          if (isCancelled) break;

          //console.log(`⚡ Processing batch ${batchIndex + 1}/${batches.length}`);

          // Fetch reviews for current batch in parallel
          const batchPromises = batch.map(async (product): Promise<ReviewData & { productId: string }> => {
            try {
              //console.log(`🔍 Fetching reviews for: ${product.title || product.id}`);
              
              // Get more reviews to ensure we see the actual count
              const result = await getProductReviews({
                productId: product.id,
                limit: 50, // Increased limit to see if count changes
                offset: 0,
              });
              
              // 🚨 DEBUG: Log the complete API response
              // console.log(`📊 API Response for ${product.title}:`, {
              //   productId: product.id,
              //   average_rating: result.average_rating,
              //   count: result.count,
              //   reviews_length: result.reviews?.length,
              //   limit: result.limit,
              //   offset: result.offset,
              //   fullResult: result
              // });
              
              // FIX: Use reviews.length as fallback since count seems unreliable
              let reviewCount = result.count || 0;
              
              // If count is 0 but we have reviews array, use the array length
              if (reviewCount === 0 && result.reviews && Array.isArray(result.reviews)) {
                reviewCount = result.reviews.length;
                //console.log(`🔧 Fixed count for ${product.title}: using reviews.length = ${reviewCount}`);
              }
              
              // If count is still 0 but we have an average_rating > 0, there might be reviews
              if (reviewCount === 0 && result.average_rating > 0) {
                //console.log(`⚠️ Suspicious: ${product.title} has rating ${result.average_rating} but count is 0`);
                // You might want to use a default count like 1 or estimate from rating
                reviewCount = 1; // Assuming at least 1 review if there's a rating
              }
              
              const finalData = {
                productId: product.id,
                averageRating: result.average_rating || 0,
                reviewCount: reviewCount
              };
              
              //console.log(`✅ Final data for ${product.title}:`, finalData);
              
              return finalData;
            } catch (err) {
              //console.error(`❌ Error fetching reviews for product ${product.title}:`, err);
              return {
                productId: product.id,
                averageRating: 0,
                reviewCount: 0
              };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          
          //console.log(`📊 Batch ${batchIndex + 1} results:`, batchResults);
          
          // Add batch results to main data object
          batchResults.forEach(result => {
            if (!isCancelled) {
              allReviewsData[result.productId] = {
                averageRating: result.averageRating,
                reviewCount: result.reviewCount
              };
            }
          });

          // Update state incrementally for better UX
          if (!isCancelled) {
            //console.log(`💾 Updating state with batch ${batchIndex + 1} results`);
            setReviewsData(prev => {
              const updated = { ...prev, ...allReviewsData };
              //console.log(`📈 Updated reviews data:`, updated);
              return updated;
            });
          }

          // Small delay between batches to be API-friendly
          if (batchIndex < batches.length - 1) {
            //console.log(`⏱️ Waiting ${batchDelay}ms before next batch`);
            await new Promise(resolve => setTimeout(resolve, batchDelay));
          }
        }

        //console.log(`🎉 Finished fetching all reviews. Final data:`, allReviewsData);

      } catch (err) {
        if (!isCancelled) {
          //console.error('❌ Error fetching batch reviews:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
        }
      } finally {
        if (!isCancelled) {
          //console.log('🏁 Setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchBatchReviews();

    return () => {
      //console.log('🧹 Cleanup: cancelling batch reviews fetch');
      isCancelled = true;
    };
  }, [products, enabled, batchSize, batchDelay]);

  // console.log(`📤 useBatchReviews returning:`, {
  //   reviewsDataKeys: Object.keys(reviewsData),
  //   reviewsData,
  //   loading,
  //   error
  // });

  return { reviewsData, loading, error };
};

// Simpler version for faster parallel loading (if your API can handle it)
export const useSimpleBatchReviews = (
  products: Product[] = [], 
  enabled: boolean = true
): Omit<UseBatchReviewsReturn, 'error'> => {
  const [reviewsData, setReviewsData] = useState<ReviewsDataMap>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !products.length) return;

    let isCancelled = false;
    
    const fetchAllReviews = async (): Promise<void> => {
      setLoading(true);

      try {
        // Fetch all reviews in parallel (faster but more API load)
        const reviewPromises = products.map(async (product): Promise<ReviewData & { productId: string }> => {
          try {
            const result = await getProductReviews({
              productId: product.id,
              limit: 50,
              offset: 0,
            });
            
            // Use reviews.length as fallback for count
            let reviewCount = result.count || 0;
            if (reviewCount === 0 && result.reviews && Array.isArray(result.reviews)) {
              reviewCount = result.reviews.length;
            }
            if (reviewCount === 0 && result.average_rating > 0) {
              reviewCount = 1; // Estimate if there's a rating but no count
            }
            
            return {
              productId: product.id,
              averageRating: result.average_rating || 0,
              reviewCount: reviewCount
            };
          } catch (err) {
            return {
              productId: product.id,
              averageRating: 0,
              reviewCount: 0
            };
          }
        });

        const results = await Promise.all(reviewPromises);
        
        if (!isCancelled) {
          const reviewsMap: ReviewsDataMap = {};
          results.forEach(result => {
            reviewsMap[result.productId] = {
              averageRating: result.averageRating,
              reviewCount: result.reviewCount
            };
          });
          
          setReviewsData(reviewsMap);
        }

      } catch (err) {
        //console.error('Error fetching reviews:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllReviews();

    return () => {
      isCancelled = true;
    };
  }, [products, enabled]);

  return { reviewsData, loading };
};
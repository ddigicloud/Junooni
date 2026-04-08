import { useState, useEffect } from 'react';

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

const fetchProductReviews = async (productId: string, limit = 50) => {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const response = await fetch(
    `${backendUrl}/store/products/${productId}/reviews?limit=${limit}&offset=0&order=-created_at`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": apiKey,
      },
    }
  )

  if (!response.ok) throw new Error(`Failed to fetch reviews for ${productId}`)
  return response.json()
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
      setLoading(true);
      setError(null);

      try {
        const batches: Product[][] = [];
        for (let i = 0; i < products.length; i += batchSize) {
          batches.push(products.slice(i, i + batchSize));
        }

        const allReviewsData: ReviewsDataMap = {};

        for (const [batchIndex, batch] of batches.entries()) {
          if (isCancelled) break;

          const batchPromises = batch.map(async (product) => {
            try {
              const result = await fetchProductReviews(product.id, 50)

              let reviewCount = result.count || 0;
              if (reviewCount === 0 && result.reviews?.length) {
                reviewCount = result.reviews.length;
              }
              if (reviewCount === 0 && result.average_rating > 0) {
                reviewCount = 1;
              }

              return {
                productId: product.id,
                averageRating: result.average_rating || 0,
                reviewCount,
              };
            } catch {
              return { productId: product.id, averageRating: 0, reviewCount: 0 };
            }
          });

          const batchResults = await Promise.all(batchPromises);

          batchResults.forEach(result => {
            if (!isCancelled) {
              allReviewsData[result.productId] = {
                averageRating: result.averageRating,
                reviewCount: result.reviewCount,
              };
            }
          });

          if (!isCancelled) {
            setReviewsData(prev => ({ ...prev, ...allReviewsData }));
          }

          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, batchDelay));
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchBatchReviews();
    return () => { isCancelled = true; };
  }, [products, enabled, batchSize, batchDelay]);

  return { reviewsData, loading, error };
};

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
        const reviewPromises = products.map(async (product) => {
          try {
            const result = await fetchProductReviews(product.id, 50)

            let reviewCount = result.count || 0;
            if (reviewCount === 0 && result.reviews?.length) {
              reviewCount = result.reviews.length;
            }
            if (reviewCount === 0 && result.average_rating > 0) {
              reviewCount = 1;
            }

            return { productId: product.id, averageRating: result.average_rating || 0, reviewCount };
          } catch {
            return { productId: product.id, averageRating: 0, reviewCount: 0 };
          }
        });

        const results = await Promise.all(reviewPromises);

        if (!isCancelled) {
          const reviewsMap: ReviewsDataMap = {};
          results.forEach(r => {
            reviewsMap[r.productId] = { averageRating: r.averageRating, reviewCount: r.reviewCount };
          });
          setReviewsData(reviewsMap);
        }
      } catch {
        // silent
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchAllReviews();
    return () => { isCancelled = true; };
  }, [products, enabled]);

  return { reviewsData, loading };
};
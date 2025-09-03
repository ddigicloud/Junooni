// PaginatedProductsDisplay.tsx - WITH BATCH REVIEWS
"use client"

import { useEffect } from "react"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { HttpTypes } from "@medusajs/types"
import { useBatchReviews } from "@lib/hooks/useBatchReviews" // Adjust import path as needed

type PaginatedProductsDisplayProps = {
  products: any[]
  totalCount: number
  currentPage: number
  totalPages: number
  region: HttpTypes.StoreRegion
  selectedColors?: string[] // Color selection for image variants
}

export default function PaginatedProductsDisplay({
  products = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  region,
  selectedColors = []
}: PaginatedProductsDisplayProps) {

  // Batch fetch reviews for all products on this page
  const { reviewsData, loading: reviewsLoading } = useBatchReviews(products, {
    enabled: products.length > 0,
    batchSize: 5, // Adjust based on your API limits
    batchDelay: 100, // Small delay between batches
  })

  // Debug logging
  useEffect(() => {
    //console.log('📦 PaginatedProductsDisplay:')
    //console.log('- products length:', products.length)
    //console.log('- totalCount:', totalCount)
    //console.log('- currentPage:', currentPage)
    //console.log('- totalPages:', totalPages)
    //console.log('- selectedColors for image selection:', selectedColors)
    //console.log('- reviewsLoading:', reviewsLoading)
    //console.log('- reviewsData loaded:', Object.keys(reviewsData).length, '/', products.length)
  }, [products, totalCount, currentPage, totalPages, selectedColors, reviewsLoading, reviewsData])

  // Enhanced debugging with color info
  useEffect(() => {
    //console.log('\n🔍 PAGINATEDPRODUCTSDISPLAY DETAILED DEBUG:')
    // console.log('- region received:', region ? {
    //   id: region.id,
    //   currency_code: region.currency_code,
    //   name: region.name
    // } : 'NULL REGION')
    //console.log('- selectedColors for ProductPreview:', selectedColors)
    //console.log('- Color-based image selection:', selectedColors.length > 0 ? 'ENABLED' : 'DISABLED')
    //console.log('- Reviews batch loading:', reviewsLoading ? 'IN PROGRESS' : 'COMPLETE')
    //console.log('- Reviews data:', reviewsData)
    
    if (products.length > 0) {
      const sampleProduct = products[0]
      //console.log('- First product title:', sampleProduct.title)
      //console.log('- First product has variants:', !!sampleProduct.variants)
      //console.log('- First product variants length:', sampleProduct.variants?.length || 0)
      
      if (sampleProduct.variants?.[0]?.calculated_price) {
        //console.log('- First product calculated_amount:', sampleProduct.variants[0].calculated_price.calculated_amount)
        //console.log('- First product currency_code:', sampleProduct.variants[0].calculated_price.currency_code)
        //console.log('✅ PRODUCT DATA LOOKS CORRECT FOR PRODUCTPREVIEW')
      } else {
        //console.log('❌ PRODUCT MISSING PRICE DATA - PRODUCTPREVIEW WILL SHOW N/A')
      }
      
      // Check review data for first product
      const firstProductReviewData = reviewsData[sampleProduct.id]
      if (firstProductReviewData) {
        //console.log('- First product review data:', firstProductReviewData)
        //console.log('✅ REVIEW DATA AVAILABLE FOR FIRST PRODUCT')
      } else {
        //console.log('⏳ REVIEW DATA NOT YET LOADED FOR FIRST PRODUCT')
      }
      
      // Check if product has color data for the selected colors
      if (selectedColors.length > 0 && sampleProduct.metadata?.color_hex_values) {
        //console.log('- First product has color metadata for image selection')
        try {
          const colorData = typeof sampleProduct.metadata.color_hex_values === 'string' 
            ? JSON.parse(sampleProduct.metadata.color_hex_values)
            : sampleProduct.metadata.color_hex_values
          //console.log('- Available colors in first product:', Array.isArray(colorData) ? colorData.map(c => c.name) : 'Invalid format')
        } catch (e) {
          //console.log('- Color data parsing failed for first product')
        }
      }
    }
  }, [products, region, selectedColors, reviewsData, reviewsLoading])
  
  // Safety checks
  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <h2 className="text-2xl font-medium text-gray-900">Loading...</h2>
        <p className="mt-2 text-base text-gray-500">Please wait while we load the products.</p>
      </div>
    )
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
        <p className="mt-2 text-base text-gray-500">Try adjusting your filters to find what you're looking for.</p>
        {selectedColors.length > 0 && (
          <p className="mt-1 text-sm text-orange-600">
            No products found with {selectedColors.join(', ')} color variant{selectedColors.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Sort & View Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-gray-600">
            Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{totalCount}</span> products
          </p>
          {/* Debug info for reviews loading */}
          {/* {reviewsLoading && (
            <p className="text-sm text-blue-600">
              ⏳ Loading reviews... ({Object.keys(reviewsData).length}/{products.length} loaded)
            </p>
          )} */}
        </div>
      </div>
      
      {/* Products Grid */}
      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((product, index) => {
          if (!product || !product.id) return null
          
          // Get review data for this product
          const productReviewData = reviewsData[product.id] || {
            averageRating: 0,
            reviewCount: 0
          }
          
          // Enhanced debug for color-based image selection (first product only)
          if (index === 0) {
            //console.log(`\n🎯 PASSING TO PRODUCTPREVIEW #${index}:`)
            //console.log('- Product:', product.title)
            //console.log('- Region:', region?.currency_code || 'NO REGION')
            //console.log('- Has price data:', !!product.variants?.[0]?.calculated_price?.calculated_amount)
            //console.log('- selectedColors passed:', selectedColors)
            //console.log('- Color-based image selection:', selectedColors.length > 0 ? 'ENABLED' : 'DISABLED')
            // console.log('- Review data passed:', {
            //   averageRating: productReviewData.averageRating,
            //   reviewCount: productReviewData.reviewCount,
            //   isLoading: reviewsLoading && !reviewsData[product.id]
            // })
          }
          
          return (
            <li key={product.id} className="overflow-hidden transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm group hover:shadow-md">
              <ProductPreview 
                product={product} 
                region={region}
                selectedColors={selectedColors} // Color selection for image variants
                // Pass review data as props to avoid individual API calls
                reviewData={{
                  averageRating: productReviewData.averageRating,
                  reviewCount: productReviewData.reviewCount,
                  isLoading: reviewsLoading && !reviewsData[product.id]
                }}
              />
            </li>
          )
        })}
      </ul>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={currentPage}
          totalPages={totalPages}
        />
      )}
      
      {/* Debug info in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="p-3 mt-6 space-y-2 border-l-4 border-blue-400 rounded bg-blue-50">
          <div className="text-sm">
            <p className="font-medium text-blue-800">🔧 Developer Info:</p>
            
            {selectedColors.length > 0 && (
              <p className="text-blue-700">
                Color-based image selection is active for: <strong>{selectedColors.join(', ')}</strong>
              </p>
            )}
            
            <p className="text-blue-700">
              Reviews: {Object.keys(reviewsData).length}/{products.length} loaded 
              {reviewsLoading && ' (still loading...)'}
            </p>
            
            {Object.keys(reviewsData).length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-blue-600 cursor-pointer">Review Data Details</summary>
                <pre className="mt-1 overflow-auto text-xs text-blue-600 max-h-32">
                  {JSON.stringify(reviewsData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )} */}
    </div>
  )
}
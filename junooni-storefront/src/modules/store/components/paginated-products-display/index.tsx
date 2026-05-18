// // PaginatedProductsDisplay.tsx - WITH BATCH REVIEWS
// "use client"

// import { useEffect } from "react"
// import ProductPreview from "@modules/products/components/product-preview"
// import { Pagination } from "@modules/store/components/pagination"
// import { HttpTypes } from "@medusajs/types"
// import { useBatchReviews } from "@lib/hooks/useBatchReviews" // Adjust import path as needed

// type PaginatedProductsDisplayProps = {
//   products: any[]
//   totalCount: number
//   currentPage: number
//   totalPages: number
//   region: HttpTypes.StoreRegion
//   selectedColors?: string[] // Color selection for image variants
// }

// export default function PaginatedProductsDisplay({
//   products = [],
//   totalCount = 0,
//   currentPage = 1,
//   totalPages = 1,
//   region,
//   selectedColors = []
// }: PaginatedProductsDisplayProps) {

//   // Batch fetch reviews for all products on this page
//   const { reviewsData, loading: reviewsLoading } = useBatchReviews(products, {
//     enabled: products.length > 0,
//     batchSize: 5, // Adjust based on your API limits
//     batchDelay: 100, // Small delay between batches
//   })

//   // Safety checks
//   if (!region) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-12">
//         <h2 className="text-2xl font-medium text-gray-900">Loading...</h2>
//         <p className="mt-2 text-base text-gray-500">Please wait while we load the products.</p>
//       </div>
//     )
//   }

//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-12">
//         <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
//         <p className="mt-2 text-base text-gray-500">Try adjusting your filters to find what you're looking for.</p>
//         {selectedColors.length > 0 && (
//           <p className="mt-1 text-sm text-orange-600">
//             No products found with {selectedColors.join(', ')} color variant{selectedColors.length > 1 ? 's' : ''}
//           </p>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="w-full">
//       {/* Sort & View Options */}
//       <div className="flex flex-wrap items-center justify-between gap-4 px-2 mb-6 md:px-0">
//         <div className="flex flex-col gap-1">
//           <p className="text-gray-600">
//             Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{totalCount}</span> products
//           </p>
//         </div>
//       </div>
      
//       {/* Products Grid */}
//       <ul
//         className="grid grid-cols-2 gap-0 sm:gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//         data-testid="products-list"
//       >
//         {products.map((product, index) => {
//           if (!product || !product.id) return null
          
//           // Get review data for this product
//           const productReviewData = reviewsData[product.id] || {
//             averageRating: 0,
//             reviewCount: 0
//           }
          
//           return (
//             <li key={product.id} className="overflow-hidden transition-shadow bg-white border border-gray-100 rounded-none shadow-sm md:rounded-lg group hover:shadow-md">
//               <ProductPreview 
//                 product={product} 
//                 region={region}
//                 selectedColors={selectedColors} // Color selection for image variants
//                 // Pass review data as props to avoid individual API calls
//                 reviewData={{
//                   averageRating: productReviewData.averageRating,
//                   reviewCount: productReviewData.reviewCount,
//                   isLoading: reviewsLoading && !reviewsData[product.id]
//                 }}
//               />
//             </li>
//           )
//         })}
//       </ul>
      
//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Pagination
//           data-testid="product-pagination"
//           page={currentPage}
//           totalPages={totalPages}
//         />
//       )}
      
//     </div>
//   )
// }

// PaginatedProductsDisplay.tsx - WITH BATCH REVIEWS + onPageChange
"use client"

import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { HttpTypes } from "@medusajs/types"
import { useBatchReviews } from "@lib/hooks/useBatchReviews"

type PaginatedProductsDisplayProps = {
  products: any[]
  totalCount: number
  currentPage: number
  totalPages: number
  region: HttpTypes.StoreRegion
  selectedColors?: string[]
  onPageChange?: (page: number) => void  // ← client-side pagination handler
}

export default function PaginatedProductsDisplay({
  products = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  region,
  selectedColors = [],
  onPageChange,
}: PaginatedProductsDisplayProps) {

  const { reviewsData, loading: reviewsLoading } = useBatchReviews(products, {
    enabled: products.length > 0,
    batchSize: 5,
    batchDelay: 100,
  })

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
        <p className="mt-2 text-base text-gray-500">
          Try adjusting your filters to find what you're looking for.
        </p>
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
      {/* Product count */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 mb-6 md:px-0">
        <p className="text-gray-600">
          Showing <span className="font-medium">{products.length}</span> of{" "}
          <span className="font-medium">{totalCount}</span> products
        </p>
      </div>

      {/* Products grid */}
      <ul
        className="grid grid-cols-2 gap-0 sm:gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((product) => {
          if (!product || !product.id) return null

          const productReviewData = reviewsData[product.id] || {
            averageRating: 0,
            reviewCount: 0,
          }

          return (
            <li
              key={product.id}
              className="overflow-hidden transition-shadow bg-white border border-gray-100 rounded-none shadow-sm md:rounded-lg group hover:shadow-md"
            >
              <ProductPreview
                product={product}
                region={region}
                selectedColors={selectedColors}
                reviewData={{
                  averageRating: productReviewData.averageRating,
                  reviewCount: productReviewData.reviewCount,
                  isLoading: reviewsLoading && !reviewsData[product.id],
                }}
              />
            </li>
          )
        })}
      </ul>

      {/* Pagination — passes onPageChange so it's client-side when available */}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
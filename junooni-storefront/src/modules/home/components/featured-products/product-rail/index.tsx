// "use client"

// import { useEffect, useState } from "react"
// import { listProducts } from "@lib/data/products"
// import { HttpTypes } from "@medusajs/types"
// import { Text } from "@medusajs/ui"
// import ProductPreview from "@modules/products/components/product-preview"
// import SliderControls from "./SliderControls"
// import { ArrowRight } from "lucide-react"
// import { useBatchReviews } from "@lib/hooks/useBatchReviews"

// interface ProductRailProps {
//   collection: HttpTypes.StoreCollection
//   region: HttpTypes.StoreRegion
// }

// export default function ProductRail({ collection, region }: ProductRailProps) {
//   const [products, setProducts] = useState<any[]>([])
//   const [isLoadingProducts, setIsLoadingProducts] = useState(true)

//   // Fetch products on client side
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoadingProducts(true)
//         const {
//           response: { products: pricedProducts },
//         } = await listProducts({
//           regionId: region.id,
//           queryParams: {
//             collection_id: collection.id,
//             fields: "*vendor,*tags,*metadata,*variants.calculated_price",
//           },
//         })
//         setProducts(pricedProducts || [])
//       } catch (error) {
//         console.error("Error fetching products:", error)
//         setProducts([])
//       } finally {
//         setIsLoadingProducts(false)
//       }
//     }

//     fetchProducts()
//   }, [collection.id, region.id])

//   // Batch fetch reviews for all products
//   const { reviewsData, loading: reviewsLoading } = useBatchReviews(products, {
//     enabled: products.length > 0,
//     batchSize: 5, // Adjust batch size based on your API limits
//     batchDelay: 100, // Small delay between batches
//   })

//   // Don't render anything if no products are found
//   if (!isLoadingProducts && (!products || products.length === 0)) {
//     return null
//   }

//   // Show loading state while fetching products
//   if (isLoadingProducts) {
//     return (
//       <div className="py-16 content-container">
//         <div className="flex items-center justify-between mb-8">
//           <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
//           <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
//         </div>
//         <div className="flex gap-6">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="flex-shrink-0 w-64">
//               <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
//               <div className="h-4 mb-2 bg-gray-200 rounded animate-pulse"></div>
//               <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="py-8 sm:py-12 md:py-12 content-container">
//       {/* Section header with collection title and "View all" link */}
//       <div className="flex items-center justify-between mb-8">
//         <Text className="text-4xl font-bold tracking-tight">{collection.title}</Text>
//         <a 
//           href={`/collections/${collection.handle}`} 
//           className="flex items-center font-medium text-black transition-colors group hover:text-gray-700"
//         >
//           <span className="border-b border-transparent group-hover:border-current">View all</span>
//           <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
//         </a>
//       </div>
     
//       {/* Product slider with relative positioning for controls */}
//       <div className="relative pb-8">
//         {/* Slider container - ID is important for SliderControls to work */}
//         <div 
//           className="overflow-x-auto hide-scrollbar scroll-smooth" 
//           id={`product-rail-${collection.id}`}
//         >
//           {/* Product list with consistent sizing */}
//           <ul className="flex gap-6 w-max">
//             {products.map((product) => {
//               // Get review data for this product
//               const productReviewData = reviewsData[product.id] || {
//                 averageRating: 0,
//                 reviewCount: 0
//               }

//               return (
//                 <li 
//                   key={product.id} 
//                   className="flex-shrink-0 w-64"
//                 >
//                   <ProductPreview 
//                     product={product} 
//                     region={region}
//                     // Pass review data as props
//                     reviewData={{
//                       averageRating: productReviewData.averageRating,
//                       reviewCount: productReviewData.reviewCount,
//                       isLoading: reviewsLoading && !reviewsData[product.id]
//                     }}
//                     isFeatured 
//                   />
//                 </li>
//               )
//             })}
//           </ul>
//         </div>
       
//         {/* Client component for slider controls */}
//         <SliderControls 
//           sliderId={`product-rail-${collection.id}`} 
//           itemCount={products.length} 
//         />
//       </div>
//     </div>
//   )
// }

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
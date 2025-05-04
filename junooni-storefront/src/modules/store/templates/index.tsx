// import { Suspense } from "react"

// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// import PaginatedProducts from "./paginated-products"

// const StoreTemplate = ({
//   sortBy,
//   page,
//   countryCode,
//   categoryId,
//   brands,
//   colors,
//   price,
// }: {
//   sortBy?: SortOptions
//   page?: string
//   countryCode: string
//   categoryId?: string
//   brands?: string
//   colors?: string
//   price?: string
// }) => {
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
//   const brandArray = brands ? brands.split(",") : []
//   const colorArray = colors ? colors.split(",") : []
  
//   // Process price range parameter
//   let minPrice, maxPrice
//   if (price) {
//     const [min, max] = price.split("-").map(p => parseInt(p, 10))
//     minPrice = min
//     maxPrice = max
//   }

//   return (
//     <div
//       className="flex flex-col py-6 small:flex-row small:items-start content-container"
//       data-testid="category-container"
//     >
//       <RefinementList sortBy={sort} />
//       <div className="w-full">
//         <div className="mb-8 text-2xl-semi">
//           <h1 data-testid="store-page-title">All products</h1>
//         </div>
//         <Suspense fallback={<SkeletonProductGrid />}>
//           <PaginatedProducts
//             sortBy={sort}
//             page={pageNumber}
//             countryCode={countryCode}
//             categoryId={categoryId}
//             brands={brandArray.length > 0 ? brandArray : undefined}
//             colors={colorArray.length > 0 ? colorArray : undefined}
//             minPrice={minPrice}
//             maxPrice={maxPrice}
//           />
//         </Suspense>
//       </div>
//     </div>
//   )
// }

// export default StoreTemplate

import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categoryHandle,
  creators,
  colors,
  price,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
  creators?: string
  colors?: string
  price?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const creatorArray = creators ? creators.split(",") : []
  const colorArray = colors ? colors.split(",") : []
  
  // Process price range parameter
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }

  return (
    <div
      className="flex flex-col py-6 small:flex-row small:items-start content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            categoryHandle={categoryHandle}
            creators={creatorArray.length > 0 ? creatorArray : undefined}
            colors={colorArray.length > 0 ? colorArray : undefined}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
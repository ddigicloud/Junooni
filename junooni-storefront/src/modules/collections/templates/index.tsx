// import { Suspense } from "react"
// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import PaginatedProducts from "@modules/store/templates/paginated-products"
// import { HttpTypes } from "@medusajs/types"
// import { listCategories } from "@lib/data/categories"
// import { retriveVendors } from "@lib/data/vendors"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"

// type CollectionTemplateProps = {
//   sortBy?: SortOptions
//   collection: HttpTypes.StoreCollection
//   page?: string
//   countryCode: string
//   categoryHandle?: string
//   vendors?: string
//   colors?: string
//   price?: string
// }

// export default async function CollectionTemplate({
//   sortBy,
//   collection,
//   page,
//   countryCode,
//   categoryHandle,
//   vendors,
//   colors,
//   price,
// }: CollectionTemplateProps) {
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
  
//   // Fetch categories and vendors
//   const categories = await listCategories()
//   const vendorsData = await retriveVendors()
  
//   // Map vendors to the format expected by the UI
//   const formattedVendors = vendorsData.map(vendor => ({
//     id: vendor.id,
//     name: vendor.name,
//     handle: vendor.handle
//   }))
  
//   // Convert vendor names from URL to handles for filtering
//   let vendorHandles: string[] = []
//   if (vendors) {
//     const vendorNames = vendors.split(",")
//     vendorHandles = vendorsData
//       .filter(vendor => vendorNames.includes(vendor.name))
//       .map(vendor => vendor.handle)
//   }
  
//   const colorArray = colors ? colors.split(",") : []
  
//   let minPrice, maxPrice
//   if (price) {
//     const [min, max] = price.split("-").map(p => parseInt(p, 10))
//     minPrice = min
//     maxPrice = max
//   }
  
//   // Get current category handle if a category is selected
//   const selectedCategoryHandle = categoryHandle || ""

//   return (
//     <div className="flex flex-col gap-8 py-8 mt-16 small:flex-row small:items-start content-container max-w-screen-xl mx-auto px-4">
//       <aside className="w-full small:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100">
//         <RefinementList
//           sortBy={sort}
//           categories={categories}
//           vendors={formattedVendors}
//           products={collection.products}
//           isCollectionPage={true} // Explicitly set to true for collection pages
//         />
//       </aside>
//       <div className="w-full">
//         <div className="flex flex-col gap-1 mb-8">
//           <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
//             <LocalizedClientLink
//               className="hover:text-black"
//               href="/"
//             >
//               Home
//             </LocalizedClientLink>
//             <span className="mx-2">/</span>
//             <span className="font-medium text-gray-900">{collection.title}</span>
//           </div>
          
//           <h1 className="text-3xl font-bold text-gray-900">{collection.title}</h1>
//         </div>
        
//         {collection.description && (
//           <div className="mb-8 text-base-regular bg-gray-50 p-4 rounded-lg">
//             <p className="text-gray-700">{collection.description}</p>
//           </div>
//         )}
        
//         <Suspense
//           fallback={
//             <SkeletonProductGrid
//               numberOfProducts={collection.products?.length || 12}
//             />
//           }
//         >
//           <PaginatedProducts
//             sortBy={sort}
//             page={pageNumber}
//             collectionId={collection.id}
//             countryCode={countryCode}
//             categoryHandle={selectedCategoryHandle}
//             vendors={vendorHandles}
//             colors={colorArray}
//             minPrice={minPrice}
//             maxPrice={maxPrice}
//           />
//         </Suspense>
//       </div>
//     </div>
//   )
// }

// import { Suspense } from "react"
// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import PaginatedProducts from "@modules/store/templates/paginated-products"
// import { HttpTypes } from "@medusajs/types"
// import { listCategories } from "@lib/data/categories"
// import { retriveVendors } from "@lib/data/vendors"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import MobileFilterToggle from "@modules/store/components/mobile-filter-toggle"

// type CollectionTemplateProps = {
//   sortBy?: SortOptions
//   collection: HttpTypes.StoreCollection
//   page?: string
//   countryCode: string
//   categoryHandle?: string
//   vendors?: string
//   colors?: string
//   price?: string
// }

// export default async function CollectionTemplate({
//   sortBy,
//   collection,
//   page,
//   countryCode,
//   categoryHandle,
//   vendors,
//   colors,
//   price,
// }: CollectionTemplateProps) {
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
  
//   // Fetch categories and vendors
//   const categories = await listCategories()
//   const vendorsData = await retriveVendors()
  
//   // Map vendors to the format expected by the UI
//   const formattedVendors = vendorsData.map(vendor => ({
//     id: vendor.id,
//     name: vendor.name,
//     handle: vendor.handle
//   }))
  
//   // Convert vendor names from URL to handles for filtering
//   let vendorHandles: string[] = []
//   if (vendors) {
//     const vendorNames = vendors.split(",")
//     vendorHandles = vendorsData
//       .filter(vendor => vendorNames.includes(vendor.name))
//       .map(vendor => vendor.handle)
//   }
  
//   const colorArray = colors ? colors.split(",") : []
  
//   let minPrice, maxPrice
//   if (price) {
//     const [min, max] = price.split("-").map(p => parseInt(p, 10))
//     minPrice = min
//     maxPrice = max
//   }
  
//   // Get current category handle if a category is selected
//   const selectedCategoryHandle = categoryHandle || ""

//   return (
//     <div className="flex flex-col">
//       {/* Myntra-style top announcement bar */}
//       <div className="bg-pink-600 text-white py-2 px-4 text-center text-sm font-medium w-full">
//         FLAT ₹300 OFF + FREE SHIPPING ON FIRST ORDER | CODE: MYNTRA300
//       </div>
      
//       <div className="max-w-screen-xl mx-auto px-4 py-6">
//         {/* Breadcrumb */}
//         <div className="mb-4 text-sm text-gray-500">
//           <LocalizedClientLink href="/" className="hover:text-pink-500">
//             Home
//           </LocalizedClientLink>
//           <span className="mx-2">/</span>
//           <span className="font-medium text-gray-900">{collection.title}</span>
//         </div>
        
//         {/* Collection Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
//           {collection.description && (
//             <p className="text-gray-500 mt-1 text-sm">{collection.description}</p>
//           )}
//         </div>
        
//         {/* Mobile Filters Toggle - Client Component */}
//         <div className="lg:hidden mb-6">
//           <MobileFilterToggle />
//         </div>
        
//         <div className="lg:flex flex-col  gap-6">
//           {/* Desktop Filters Sidebar */}
//           <aside className="hidden lg:block w-64 flex-shrink-0">
//             <div className="sticky top-20">
//               <RefinementList
//                 sortBy={sort}
//                 categories={categories}
//                 vendors={formattedVendors}
//                 products={collection.products}
//                 isCollectionPage={true}
//               />
//             </div>
//           </aside>
          
//           {/* Product Grid */}
//           <div className="w-full">
//             <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length || 12} />}>
//               <PaginatedProducts
//                 sortBy={sort}
//                 page={pageNumber}
//                 collectionId={collection.id}
//                 countryCode={countryCode}
//                 categoryHandle={selectedCategoryHandle}
//                 vendors={vendorHandles}
//                 colors={colorArray}
//                 minPrice={minPrice}
//                 maxPrice={maxPrice}
//               />
//             </Suspense>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MobileFilterToggle from "@modules/store/components/mobile-filter-toggle"

type CollectionTemplateProps = {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  categoryHandle?: string
  vendors?: string
  colors?: string
  price?: string
}

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  categoryHandle,
  vendors,
  colors,
  price,
}: CollectionTemplateProps) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  
  // Fetch categories and vendors
  const categories = await listCategories()
  const vendorsData = await retriveVendors()
  
  // Map vendors to the format expected by the UI
  const formattedVendors = vendorsData.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    handle: vendor.handle
  }))
  
  // Convert vendor names from URL to handles for filtering
  let vendorHandles: string[] = []
  if (vendors) {
    const vendorNames = vendors.split(",")
    vendorHandles = vendorsData
      .filter(vendor => vendorNames.includes(vendor.name))
      .map(vendor => vendor.handle)
  }
  
  const colorArray = colors ? colors.split(",") : []
  
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }
  
  // Get current category handle if a category is selected
  const selectedCategoryHandle = categoryHandle || ""

  return (
    <div className="flex flex-col w-full bg-gray-50">
      {/* Myntra-style top announcement bar */}
      <div className="bg-pink-600 text-white py-2 px-4 text-center text-xs md:text-sm font-medium w-full">
        FLAT ₹300 OFF + FREE SHIPPING ON FIRST ORDER | CODE: MYNTRA300
      </div>
      
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-500">
          <LocalizedClientLink href="/" className="hover:text-pink-500">
            Home
          </LocalizedClientLink>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{collection.title}</span>
        </div>
        
        {/* Collection Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
          {collection.description && (
            <p className="text-gray-500 mt-1 text-sm">{collection.description}</p>
          )}
        </div>
        
        {/* Product count display */}
        <div className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{collection.products?.length || 0}</span> products found
        </div>
        
        {/* Mobile Filters Toggle - Client Component */}
        <div className="lg:hidden mb-6 w-full">
          <MobileFilterToggle 
            sortBy={sort}
            categories={categories}
            vendors={formattedVendors}
            products={collection.products}
            isCollectionPage={true}
          />
        </div>
        
        <div className="flex flex-col lg:flex-row w-full gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-sm shadow-sm p-4">
              <RefinementList
                sortBy={sort}
                categories={categories}
                vendors={formattedVendors}
                products={collection.products}
                isCollectionPage={true}
              />
            </div>
          </aside>
          
          {/* Product Grid with full-width Suspense boundary */}
          <div className="flex-grow w-full">
            <Suspense fallback={
              <SkeletonProductGrid 
                numberOfProducts={collection.products?.length || 12} 
                showSidebar={true}
              />
            }>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                collectionId={collection.id}
                countryCode={countryCode}
                categoryHandle={selectedCategoryHandle}
                vendors={vendorHandles}
                colors={colorArray}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
// import { Suspense } from "react"
// import { notFound } from "next/navigation"
// import InteractiveLink from "@modules/common/components/interactive-link"
// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import PaginatedProducts from "@modules/store/templates/paginated-products"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import { HttpTypes } from "@medusajs/types"

// type CategoryTemplateProps = {
//   category: HttpTypes.StoreProductCategory
//   sortBy?: SortOptions
//   page?: string
//   countryCode: string
//   vendors?: string
//   colors?: string
//   price?: string
// }

// export default async function CategoryTemplate({
//   category,
//   sortBy,
//   page,
//   countryCode,
//   vendors,
//   colors,
//   price,
// }: CategoryTemplateProps) {
//   if (!category || !countryCode) notFound()
  
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
  
//   // Extract unique vendors directly from category products for accurate filtering
//   const uniqueVendors = new Map()
//   if (category.products && category.products.length > 0) {
//     category.products.forEach(product => {
//       if (product.vendor) {
//         uniqueVendors.set(product.vendor.id, {
//           id: product.vendor.id,
//           name: product.vendor.name,
//           handle: product.vendor.handle
//         })
//       }
//     })
//   }
  
//   // Use only vendors found in products
//   const formattedVendors = Array.from(uniqueVendors.values())
  
//   // Convert vendor names from URL to handles for filtering
//   let vendorHandles: string[] = []
//   if (vendors) {
//     const vendorNames = vendors.split(",")
//     vendorHandles = formattedVendors
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

//   // Get parent categories for breadcrumbs
//   const parents = [] as HttpTypes.StoreProductCategory[]
//   const getParents = (category: HttpTypes.StoreProductCategory) => {
//     if (category.parent_category) {
//       parents.push(category.parent_category)
//       getParents(category.parent_category)
//     }
//   }
//   getParents(category)

//   // Get direct subcategories of current category only
//   const subcategories = category.category_children || []

//   return (
//     <div className="flex flex-col gap-8 py-8 mt-16 small:flex-row small:items-start content-container max-w-screen-xl mx-auto px-4">
//       <aside className="w-full small:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100">
//         <RefinementList
//           sortBy={sort}
//           vendors={formattedVendors}
//           products={category.products || []}
//           currentCategory={category}
//           subcategories={subcategories}
//           isCollectionPage={false} // This is a category page
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
            
//             {parents.length > 0 && parents.slice().reverse().map((parent) => (
//               <div key={parent.id} className="flex items-center">
//                 <LocalizedClientLink
//                   className="hover:text-black"
//                   href={`/categories/${parent.handle}`}
//                 >
//                   {parent.name}
//                 </LocalizedClientLink>
//                 <span className="mx-2">/</span>
//               </div>
//             ))}
            
//             <span className="font-medium text-gray-900">{category.name}</span>
//           </div>
          
//           <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
//         </div>
        
//         {category.description && (
//           <div className="mb-8 text-base-regular bg-gray-50 p-4 rounded-lg">
//             <p className="text-gray-700">{category.description}</p>
//           </div>
//         )}
        
//         <Suspense
//           fallback={
//             <SkeletonProductGrid
//               numberOfProducts={category.products?.length || 12}
//             />
//           }
//         >
//           <PaginatedProducts
//             sortBy={sort}
//             page={pageNumber}
//             categoryId={category.id}
//             countryCode={countryCode}
//             vendors={vendorHandles}
//             colors={colorArray}
//             minPrice={minPrice}
//             maxPrice={maxPrice}
//             categoryProducts={category.products || []}
//           />
//         </Suspense>
//       </div>
//     </div>
//   )
// }

// import { Suspense } from "react"
// import { notFound } from "next/navigation"
// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import PaginatedProducts from "@modules/store/templates/paginated-products"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import { HttpTypes } from "@medusajs/types"
// import MobileFilterToggle from "@modules/store/components/mobile-filter-toggle"

// type CategoryTemplateProps = {
//   category: HttpTypes.StoreProductCategory
//   sortBy?: SortOptions
//   page?: string
//   countryCode: string
//   vendors?: string
//   colors?: string
//   price?: string
// }

// export default async function CategoryTemplate({
//   category,
//   sortBy,
//   page,
//   countryCode,
//   vendors,
//   colors,
//   price,
// }: CategoryTemplateProps) {
//   if (!category || !countryCode) notFound()
  
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
  
//   // Extract unique vendors directly from category products for accurate filtering
//   const uniqueVendors = new Map()
//   if (category.products && category.products.length > 0) {
//     category.products.forEach(product => {
//       if (product.vendor) {
//         uniqueVendors.set(product.vendor.id, {
//           id: product.vendor.id,
//           name: product.vendor.name,
//           handle: product.vendor.handle
//         })
//       }
//     })
//   }
  
//   // Use only vendors found in products
//   const formattedVendors = Array.from(uniqueVendors.values())
  
//   // Convert vendor names from URL to handles for filtering
//   let vendorHandles: string[] = []
//   if (vendors) {
//     const vendorNames = vendors.split(",")
//     vendorHandles = formattedVendors
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

//   // Get parent categories for breadcrumbs
//   const parents = [] as HttpTypes.StoreProductCategory[]
//   const getParents = (category: HttpTypes.StoreProductCategory) => {
//     if (category.parent_category) {
//       parents.push(category.parent_category)
//       getParents(category.parent_category)
//     }
//   }
//   getParents(category)

//   // Get direct subcategories of current category only
//   const subcategories = category.category_children || []

//   return (
//     <div className="flex flex-col">
//       {/* Myntra-style top announcement bar */}
//       <div className="bg-pink-600 text-white py-2 px-4 text-center text-sm font-medium w-full">
//         {/* Myntra typically has some offer text here */}
//         FLAT ₹300 OFF + FREE SHIPPING ON FIRST ORDER | CODE: MYNTRA300
//       </div>
      
//       <div className="max-w-screen-xl mx-auto px-4 py-6">
//         {/* Breadcrumb */}
//         <div className="mb-4 text-sm text-gray-500">
//           <LocalizedClientLink href="/" className="hover:text-pink-500">
//             Home
//           </LocalizedClientLink>
//           <span className="mx-2">/</span>
          
//           {parents.length > 0 && parents.slice().reverse().map((parent) => (
//             <div key={parent.id} className="inline">
//               <LocalizedClientLink
//                 className="hover:text-pink-500"
//                 href={`/categories/${parent.handle}`}
//               >
//                 {parent.name}
//               </LocalizedClientLink>
//               <span className="mx-2">/</span>
//             </div>
//           ))}
          
//           <span className="font-medium text-gray-900">{category.name}</span>
//         </div>
        
//         {/* Category Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
//           {category.description && (
//             <p className="text-gray-500 mt-1 text-sm">{category.description}</p>
//           )}
//         </div>
        
//         {/* Mobile Filters Toggle - Client Component */}
//         <div className="lg:hidden mb-6">
//           <MobileFilterToggle />
//         </div>
        
//         <div className="flex flex-col lg:flex-row gap-6">
//           {/* Desktop Filters Sidebar */}
//           <aside className="hidden lg:block w-64 flex-shrink-0">
//             <div className="sticky top-20">
//               <RefinementList
//                 sortBy={sort}
//                 vendors={formattedVendors}
//                 products={category.products || []}
//                 currentCategory={category}
//                 subcategories={subcategories}
//                 isCollectionPage={false}
//               />
//             </div>
//           </aside>
          
//           {/* Product Grid */}
//           <div className="flex-grow">
//             <Suspense fallback={<SkeletonProductGrid numberOfProducts={category.products?.length || 12} />}>
//               <PaginatedProducts
//                 sortBy={sort}
//                 page={pageNumber}
//                 categoryId={category.id}
//                 countryCode={countryCode}
//                 vendors={vendorHandles}
//                 colors={colorArray}
//                 minPrice={minPrice}
//                 maxPrice={maxPrice}
//                 categoryProducts={category.products || []}
//               />
//             </Suspense>
//           </div>
//         </div>
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

// type CategoryTemplateProps = {
//   sortBy?: SortOptions
//   category: HttpTypes.StoreCategory
//   page?: string
//   countryCode: string
//   vendors?: string
//   colors?: string
//   price?: string
//   parentCategories?: HttpTypes.StoreCategory[]
//   childCategories?: HttpTypes.StoreCategory[]
// }

// export default async function CategoryTemplate({
//   sortBy,
//   category,
//   page,
//   countryCode,
//   vendors,
//   colors,
//   price,
//   parentCategories = [],
//   childCategories = [],
// }: CategoryTemplateProps) {
//   const pageNumber = page ? parseInt(page) : 1
//   const sort = sortBy || "created_at"
  
//   // Fetch vendors data
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

//   // Build breadcrumb path
//   const breadcrumbs = []
//   breadcrumbs.push({ name: "Home", href: "/" })
  
//   if (parentCategories.length > 0) {
//     // Add parent categories to breadcrumb
//     parentCategories.forEach(parent => {
//       breadcrumbs.push({
//         name: parent.name,
//         href: `/categories/${parent.handle}`
//       })
//     })
//   }
  
//   // Add current category to breadcrumb
//   breadcrumbs.push({
//     name: category.name,
//     href: `/categories/${category.handle}`,
//     current: true
//   })

//   return (
//     <div className="flex flex-col w-full bg-gray-50">
//       {/* Myntra-style top announcement bar */}
//       <div className="bg-pink-600 text-white py-2 px-4 text-center text-xs md:text-sm font-medium w-full">
//         FLAT ₹300 OFF + FREE SHIPPING ON FIRST ORDER | CODE: JUNOONI300
//       </div>
      
//       <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
//         {/* Breadcrumb */}
//         <nav className="mb-4 text-sm text-gray-500">
//           <ol className="flex items-center flex-wrap">
//             {breadcrumbs.map((breadcrumb, index) => (
//               <li key={breadcrumb.name} className="flex items-center">
//                 {index > 0 && <span className="mx-2">/</span>}
//                 {breadcrumb.current ? (
//                   <span className="font-medium text-gray-900">{breadcrumb.name}</span>
//                 ) : (
//                   <LocalizedClientLink href={breadcrumb.href} className="hover:text-pink-500">
//                     {breadcrumb.name}
//                   </LocalizedClientLink>
//                 )}
//               </li>
//             ))}
//           </ol>
//         </nav>
        
//         {/* Category Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
//           {category.description && (
//             <p className="text-gray-500 mt-1 text-sm">{category.description}</p>
//           )}
//         </div>
        
//         {/* Sub-categories display - horizontal scrollable list */}
//         {childCategories.length > 0 && (
//           <div className="mb-6">
//             <h2 className="text-lg font-medium text-gray-900 mb-3">Browse Sub-Categories</h2>
//             <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar">
//               {childCategories.map((subCategory) => (
//                 <LocalizedClientLink 
//                   key={subCategory.id}
//                   href={`/categories/${subCategory.handle}`}
//                   className="flex flex-col items-center min-w-[100px] bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow"
//                 >
//                   <div className="w-16 h-16 rounded-full bg-gray-100 mb-2 flex items-center justify-center">
//                     {/* You can add category icons here if available */}
//                     <span className="text-lg text-gray-500">{subCategory.name.charAt(0)}</span>
//                   </div>
//                   <span className="text-xs font-medium text-center">{subCategory.name}</span>
//                 </LocalizedClientLink>
//               ))}
//             </div>
//           </div>
//         )}
        
//         {/* Mobile Filters Toggle */}
//         <div className="lg:hidden mb-6 w-full">
//           <MobileFilterToggle 
//             sortBy={sort}
//             categories={[category, ...childCategories]}
//             vendors={formattedVendors}
//             currentCategory={category}
//             subcategories={childCategories}
//           />
//         </div>
        
//         <div className="flex flex-col lg:flex-row w-full gap-6">
//           {/* Desktop Filters Sidebar */}
//           <aside className="hidden lg:block w-64 flex-shrink-0">
//             <div className="sticky top-20 bg-white rounded-sm shadow-sm p-4">
//               <RefinementList
//                 sortBy={sort}
//                 categories={[category, ...childCategories]}
//                 vendors={formattedVendors}
//                 currentCategory={category}
//                 subcategories={childCategories}
//               />
//             </div>
//           </aside>
          
//           {/* Product Grid with full-width Suspense boundary */}
//           <div className="flex-grow w-full">
//             <Suspense fallback={
//               <SkeletonProductGrid 
//                 numberOfProducts={12}
//                 showSidebar={true}
//               />
//             }>
//               <PaginatedProducts
//                 sortBy={sort}
//                 page={pageNumber}
//                 categoryId={category.id}
//                 categoryHandle={category.handle}
//                 countryCode={countryCode}
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

// @modules/categories/templates/index.tsx
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

type CategoryTemplateProps = {
  sortBy?: SortOptions
  category: HttpTypes.StoreCategory
  page?: string
  countryCode: string
  vendors?: string
  colors?: string
  price?: string
  parentCategories?: HttpTypes.StoreCategory[]
  childCategories?: HttpTypes.StoreCategory[]
}

export default async function CategoryTemplate({
  sortBy,
  category,
  page,
  countryCode,
  vendors,
  colors,
  price,
  parentCategories = [],
  childCategories = [],
}: CategoryTemplateProps) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  
  // Fetch vendors data
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
    const vendorParams = vendors.split(",")
    vendorHandles = vendorsData
      .filter(vendor => vendorParams.includes(vendor.handle)) // Important: filter by handle, not name
      .map(vendor => vendor.handle)
  }
  
  const colorArray = colors ? colors.split(",") : []
  
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }

  // Build breadcrumb path
  const breadcrumbs = []
  breadcrumbs.push({ name: "Home", href: "/" })
  
  if (parentCategories.length > 0) {
    // Add parent categories to breadcrumb
    parentCategories.forEach(parent => {
      breadcrumbs.push({
        name: parent.name,
        href: `/categories/${parent.handle}`
      })
    })
  }
  
  // Add current category to breadcrumb
  breadcrumbs.push({
    name: category.name,
    href: `/categories/${category.handle}`,
    current: true
  })

  return (
    <div className="flex flex-col w-full bg-gray-50">
      {/* Myntra-style top announcement bar */}
      <div className="bg-pink-600 text-white py-2 px-4 text-center text-xs md:text-sm font-medium w-full">
        FLAT ₹300 OFF + FREE SHIPPING ON FIRST ORDER | CODE: JUNOONI300
      </div>
      
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center flex-wrap">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.name} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {breadcrumb.current ? (
                  <span className="font-medium text-gray-900">{breadcrumb.name}</span>
                ) : (
                  <LocalizedClientLink href={breadcrumb.href} className="hover:text-pink-500">
                    {breadcrumb.name}
                  </LocalizedClientLink>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Category Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500 mt-1 text-sm">{category.description}</p>
          )}
        </div>
        
        {/* Sub-categories display - horizontal scrollable list */}
        {childCategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Browse Sub-Categories</h2>
            <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar">
              {childCategories.map((subCategory) => (
                <LocalizedClientLink 
                  key={subCategory.id}
                  href={`/categories/${subCategory.handle}`}
                  className="flex flex-col items-center min-w-[100px] bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 mb-2 flex items-center justify-center">
                    {/* You can add category icons here if available */}
                    <span className="text-lg text-gray-500">{subCategory.name.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-medium text-center">{subCategory.name}</span>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-6 w-full">
          <MobileFilterToggle 
            sortBy={sort}
            vendors={formattedVendors}
            products={category.products || []}  
            currentCategory={category}
            subcategories={childCategories}
            isCollectionPage={false}
          />
        </div>
        
        <div className="flex flex-col lg:flex-row w-full gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-sm shadow-sm p-4">
              <RefinementList
                sortBy={sort}
                categories={[category, ...childCategories]}
                vendors={formattedVendors}
                products={category.products || []}
                currentCategory={category}
                subcategories={childCategories}
                isCollectionPage={false}
              />
            </div>
          </aside>
          
          {/* Product Grid with full-width Suspense boundary */}
          <div className="flex-grow w-full">
            <Suspense fallback={
              <SkeletonProductGrid 
                numberOfProducts={12}
                showSidebar={true}
              />
            }>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                categoryHandle={category.handle}
                countryCode={countryCode}
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
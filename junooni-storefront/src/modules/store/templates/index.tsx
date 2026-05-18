// import React, { Suspense } from "react"
// import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
// import { listCategories } from "@lib/data/categories"
// import { retriveVendors } from "@lib/data/vendors"
// import { getRegion } from "@lib/data/regions"
// import { redirect } from "next/navigation"
// import MobileStoreWrapper from "@modules/store/components/mobile-store-wrapper"
// import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"

// const PRODUCT_LIMIT = 20

// function buildFilterUrl(params: {
//   page?: number
//   vendors?: string[]
//   colors?: string[]
//   collections?: string[]
//   categories?: string[]
//   minPrice?: number
//   maxPrice?: number
//   sortBy?: string
// }): string {
//   const urlParams = new URLSearchParams()
//   if (params.page) urlParams.set('page', params.page.toString())
//   if (params.vendors?.length) urlParams.set('vendors', params.vendors.join(','))
//   if (params.colors?.length) urlParams.set('colors', params.colors.join(','))
//   if (params.collections?.length) urlParams.set('collections', params.collections.join(','))
//   if (params.categories?.length) urlParams.set('categories', params.categories.join(','))
//   if (params.minPrice !== undefined || params.maxPrice !== undefined) {
//     urlParams.set('price', `₹{params.minPrice || 0}-₹{params.maxPrice || 1000}`)
//   }
//   if (params.sortBy && params.sortBy !== 'created_at') urlParams.set('sortBy', params.sortBy)
//   return `/store?${urlParams.toString()}`
// }

// const normalizeColorName = (colorName: string): string => {
//   return colorName
//     .trim()
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     .replace(/([a-z])(\d)/g, '$1 $2')
//     .replace(/(\d)([a-z])/gi, '$1 $2')
//     .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
//     .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
//     .replace(/\s+/g, ' ')
//     .toLowerCase()
//     .split(' ')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ')
// }

// const calculatePriceRange = (products: any[]): { minPrice: number, maxPrice: number } => {
//   if (!products || products.length === 0) return { minPrice: 0, maxPrice: 1000 }
//   const prices: number[] = []
//   products.forEach(product => {
//     if (product.variants && product.variants.length > 0) {
//       product.variants.forEach(variant => {
//         let price = variant.calculated_price?.calculated_amount
//         if (!price && variant.prices && variant.prices.length > 0) {
//           price = parseFloat(variant.prices[0].amount || '0') / 100
//         }
//         if (price && typeof price === 'number' && price > 0) {
//           prices.push(Math.round(price))
//         }
//       })
//     }
//   })
//   if (prices.length === 0) return { minPrice: 0, maxPrice: 1000 }
//   return { minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) }
// }

// // ─── Skeleton shown INSTANTLY when page changes ──────────────────────────────
// function ProductsLoadingSkeleton() {
//   return (
//     <div className="w-full">
//       <div className="hidden mt-4 mb-6 md:flex md:justify-end">
//         <div className="w-40 bg-gray-100 rounded h-9 animate-pulse" />
//       </div>
//       <div className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8">
//         {Array.from({ length: 12 }).map((_, i) => (
//           <div key={i} className="flex flex-col gap-2">
//             <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />
//             <div className="w-3/4 h-4 mt-2 bg-gray-100 rounded animate-pulse" />
//             <div className="w-1/2 h-4 bg-gray-100 rounded animate-pulse" />
//             <div className="w-1/3 h-5 bg-gray-100 rounded animate-pulse" />
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ─── ALL product fetching/filtering logic lives here ─────────────────────────
// // This is a separate async component so Suspense can stream it independently
// async function ProductsFetcher({
//   sortBy,
//   page,
//   collectionId,
//   categoryId,
//   productsIds,
//   countryCode,
//   vendors,
//   colors,
//   collections,
//   categories,
//   minPrice,
//   maxPrice,
//   region,
//   vendorsData,
//   categoriesData,
// }: {
//   sortBy: SortOptions
//   page: number
//   collectionId?: string
//   categoryId?: string
//   productsIds?: string[]
//   countryCode: string
//   vendors?: string[]
//   colors?: string[]
//   collections?: string[]
//   categories?: string[]
//   minPrice?: number
//   maxPrice?: number
//   region: any
//   vendorsData: any[]
//   categoriesData: any[]
// }) {
//   const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
//   const hasClientSideFilters = vendors?.length || colors?.length || collections?.length || categories?.length
//   const hasAnyFilters = hasClientSideFilters || hasPriceFilter
//   const hasColorFilter = (colors?.length ?? 0) > 0

//   const queryParams: any = {}
//   if (collectionId) queryParams["collection_id"] = [collectionId]
//   if (categoryId) queryParams["category_id"] = [categoryId]
//   if (productsIds) queryParams["id"] = productsIds

//   let products = []
//   let count = 0
//   let totalPages = 1
//   let allProducts: any[] = []
//   let productsForPriceCalculation: any[] = []

//   try {
//     const { listProductsWithSort } = await import("@lib/data/products")

//     const { response: { products: fetchedProducts } } = await listProductsWithSort({
//       page: 1,
//       queryParams: { ...queryParams, limit: 1000 },
//       sortBy,
//       countryCode,
//     })

//     allProducts = fetchedProducts

//     if (hasAnyFilters) {
//       let filteredProducts = [...allProducts]

//       if (collections?.length) {
//         filteredProducts = filteredProducts.filter(product =>
//           product.collection && collections.includes(product.collection.handle)
//         )
//       }

//       if (categories?.length) {
//         filteredProducts = filteredProducts.filter(product =>
//           product.categories?.some((cat: any) => categories.includes(cat.handle))
//         )
//       }

//       if (vendors?.length) {
//         const { retriveVendors: getVendors } = await import("@lib/data/vendors")
//         const vData = await getVendors()
//         const vendorHandles = vData
//           .filter(v => vendors.includes(v.name))
//           .map(v => v.handle)
//         filteredProducts = filteredProducts.filter(product =>
//           product.vendor && vendorHandles.includes(product.vendor.handle)
//         )
//       }

//       if (colors?.length) {
//         filteredProducts = filteredProducts.filter(product => {
//           const productColors = new Set<string>()

//           if (product.metadata?.color_hex_values) {
//             let colorsData = product.metadata.color_hex_values
//             if (typeof colorsData === 'string') {
//               try { colorsData = JSON.parse(colorsData) } catch { return false }
//             }
//             if (Array.isArray(colorsData)) {
//               colorsData.forEach((color: any) => {
//                 if (color?.name) productColors.add(normalizeColorName(color.name).toLowerCase().trim())
//               })
//             }
//           }

//           product.variants?.forEach((variant: any) => {
//             if (variant.metadata?.color) {
//               productColors.add(normalizeColorName(variant.metadata.color).toLowerCase().trim())
//             }
//           })

//           if (productColors.size === 0) return false

//           return colors.some(c =>
//             productColors.has(normalizeColorName(c).toLowerCase().trim())
//           )
//         })
//       }

//       if (hasPriceFilter) {
//         filteredProducts = filteredProducts.filter(product => {
//           const price = product.variants?.[0]?.calculated_price?.calculated_amount
//           if (!price) return false
//           return (minPrice === undefined || price >= minPrice) &&
//                  (maxPrice === undefined || price <= maxPrice)
//         })
//       }

//       count = filteredProducts.length
//       totalPages = Math.ceil(count / PRODUCT_LIMIT) || 1

//       if (page > totalPages && totalPages > 0) {
//         redirect(buildFilterUrl({ page: 1, vendors, colors, collections, categories, minPrice, maxPrice, sortBy }))
//       }

//       const start = (Math.min(page, totalPages) - 1) * PRODUCT_LIMIT
//       products = filteredProducts.slice(start, start + PRODUCT_LIMIT)

//     } else {
//       const { response: { products: paginatedProducts, count: totalCount } } = await listProductsWithSort({
//         page,
//         queryParams: { ...queryParams, limit: PRODUCT_LIMIT },
//         sortBy,
//         countryCode,
//       })
//       products = paginatedProducts
//       count = totalCount
//       totalPages = Math.ceil(count / PRODUCT_LIMIT)
//     }
//   } catch {
//     products = []
//     allProducts = []
//     count = 0
//     totalPages = 1
//   }

//   // Price range calculation
//   productsForPriceCalculation = categories?.length
//     ? allProducts.filter(p => p.categories?.some((c: any) => categories.includes(c.handle)))
//     : allProducts

//   const dynamicPriceRange = calculatePriceRange(productsForPriceCalculation)

//   // Extract unique colors
//   const uniqueColors = new Map()
//   allProducts.forEach(product => {
//     if (product.metadata?.color_hex_values) {
//       let colorsData = product.metadata.color_hex_values
//       if (typeof colorsData === 'string') {
//         try { colorsData = JSON.parse(colorsData) } catch { return }
//       }
//       if (Array.isArray(colorsData)) {
//         colorsData.forEach((color: any) => {
//           if (color.name && color.hex) {
//             let cleanHex = color.hex.trim()
//             if (!cleanHex.startsWith('#')) cleanHex = '#' + cleanHex
//             if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
//               const normalizedName = normalizeColorName(color.name)
//               uniqueColors.set(normalizedName.toLowerCase(), { name: normalizedName, hex: cleanHex })
//             }
//           }
//         })
//       }
//     }
//   })
//   const availableColors = Array.from(uniqueColors.values())

//   return (
//     <FilterHandlersWrapper
//       sortBy={sortBy}
//       page={page}
//       countryCode={countryCode}
//       vendors={vendors || []}
//       colors={colors || []}
//       collections={collections || []}
//       categories={categories || []}
//       minPrice={minPrice}
//       maxPrice={maxPrice}
//       products={products}
//       totalCount={count}
//       totalPages={totalPages}
//       region={region}
//       vendorsData={vendorsData}
//       collectionsData={[]}
//       categoriesData={categoriesData}
//       availableColors={availableColors}
//       selectedColors={colors || []}
//       dynamicPriceRange={dynamicPriceRange}
//     />
//   )
// }

// // ─── Main StoreTemplate — renders SHELL instantly ─────────────────────────────
// export default async function StoreTemplate({
//   sortBy,
//   page,
//   collectionId,
//   categoryId,
//   productsIds,
//   countryCode,
//   vendors,
//   colors,
//   collections,
//   categories,
//   minPrice,
//   maxPrice,
// }: {
//   sortBy?: SortOptions
//   page?: number
//   collectionId?: string
//   categoryId?: string
//   productsIds?: string[]
//   countryCode: string
//   vendors?: string[]
//   colors?: string[]
//   collections?: string[]
//   categories?: string[]
//   minPrice?: number
//   maxPrice?: number
// }) {
//   const pageNumber = page || 1
//   const sort = sortBy || "created_at"

//   const region = await getRegion(countryCode)
//   if (!region) return null

//   // Only fetch sidebar data here — fast, parallel
//   // const [categoriesData, vendorsData] = await Promise.all([
//   //   listCategories(),
//   //   retriveVendors(),
//   // ])
//   const { listProductsWithSort } = await import("@lib/data/products")

//   const [categoriesData, vendorsData, { response: { products: sidebarProducts } }] = await Promise.all([
//     listCategories(),
//     retriveVendors(),
//     listProductsWithSort({
//       page: 1,
//       queryParams: { limit: 1000 },
//       sortBy: sort,
//       countryCode,
//     }),
//   ])

//   const hasAnyFilters = vendors?.length || colors?.length || collections?.length ||
//     categories?.length || minPrice !== undefined || maxPrice !== undefined

//   // Provide minimal RefinementList props for the shell
//   // (price range and colors will be updated once ProductsFetcher resolves)
//   //const shellPriceRange = { minPrice: minPrice ?? 0, maxPrice: maxPrice ?? 1000 }
//   const calculatedRange = calculatePriceRange(sidebarProducts)
//   const shellPriceRange = {
//     minPrice: minPrice ?? calculatedRange.minPrice,
//     maxPrice: maxPrice ?? calculatedRange.maxPrice,
//   }

//   return (
//     <MobileStoreWrapper
//       sortBy={sort}
//       hasActiveFilters={!!hasAnyFilters}
//       count={0}
//       filterContent={
//         <RefinementList
//           sortBy={sort}
//           search={true}
//           vendors={vendorsData}
//           categories={categoriesData}
//           products={sidebarProducts} 
//           availableColors={[]}
//           dynamicPriceRange={shellPriceRange}
//         />
//       }
//     >
//       <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">
//         <div className="hidden md:block">
//           <RefinementList
//             sortBy={sort}
//             search={true}
//             vendors={vendorsData}
//             categories={categoriesData}
//             products={sidebarProducts} 
//             availableColors={[]}
//             dynamicPriceRange={shellPriceRange}
//           />
//         </div>
//         <div className="w-full px-0 ml-0 md:ml-4 sm:px-0">
//           <div className="px-2 mt-0 mb-0 small:mt-12 text-2xl-semi">
//             <h1 data-testid="store-page-title mt-8">All products</h1>
//           </div>
//           <div className="justify-start hidden mt-4 mb-6 md:flex md:justify-end">
//             <SortWrapper sortBy={sort} data-testid="sort-above-grid" />
//           </div>

//           {/* ✅ KEY: Suspense means skeleton shows INSTANTLY on page click */}
//           <Suspense fallback={<ProductsLoadingSkeleton />}>
//             <ProductsFetcher
//               sortBy={sort}
//               page={pageNumber}
//               collectionId={collectionId}
//               categoryId={categoryId}
//               productsIds={productsIds}
//               countryCode={countryCode}
//               vendors={vendors}
//               colors={colors}
//               collections={collections}
//               categories={categories}
//               minPrice={minPrice}
//               maxPrice={maxPrice}
//               region={region}
//               vendorsData={vendorsData}
//               categoriesData={categoriesData}
//             />
//           </Suspense>
//         </div>
//       </div>
//     </MobileStoreWrapper>
//   )
// }

import React, { Suspense } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { getRegion } from "@lib/data/regions"
import MobileStoreWrapper from "@modules/store/components/mobile-store-wrapper"
import ClientStoreShell from "@modules/store/components/client-store-shell/client-store-shell"

// ─── Skeleton — shown only on first page load ─────────────────────────────────
function StoreLoadingSkeleton() {
  return (
    <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col gap-4 w-[220px] flex-shrink-0 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="h-5 mb-3 bg-gray-200 rounded w-28" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 mb-2 bg-gray-100 rounded" />
            ))}
          </div>
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="w-full ml-0 md:ml-4">
        <div className="w-48 h-8 mb-6 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className="w-full aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              />
              <div className="w-3/4 h-4 mt-2 bg-gray-100 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-1/3 h-5 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Data fetcher — ONE server fetch, then client takes over ─────────────────
async function StoreDataFetcher({
  sortBy,
  countryCode,
  initialVendors,
  initialColors,
  initialCollections,
  initialCategories,
  initialMinPrice,
  initialMaxPrice,
  initialPage,
}: {
  sortBy: SortOptions
  countryCode: string
  initialVendors: string[]
  initialColors: string[]
  initialCollections: string[]
  initialCategories: string[]
  initialMinPrice?: number
  initialMaxPrice?: number
  initialPage: number
}) {
  const { listProductsWithSort } = await import("@lib/data/products")
  const region = await getRegion(countryCode)
  if (!region) return null

  // ONE parallel fetch — all data in a single round trip
  const [categoriesData, vendorsData, { response: { products: allProducts } }] =
    await Promise.all([
      listCategories(),
      retriveVendors(),
      listProductsWithSort({
        page: 1,
        queryParams: { limit: 1000 },
        sortBy: "created_at", // always default order — client handles sorting
        countryCode,
      }),
    ])

  return (
    <ClientStoreShell
      allProducts={allProducts}
      categoriesData={categoriesData}
      vendorsData={vendorsData}
      region={region}
      countryCode={countryCode}
      initialSortBy={sortBy}
      initialVendors={initialVendors}
      initialColors={initialColors}
      initialCollections={initialCollections}
      initialCategories={initialCategories}
      initialMinPrice={initialMinPrice}
      initialMaxPrice={initialMaxPrice}
      initialPage={initialPage}
    />
  )
}

// ─── Main StoreTemplate ───────────────────────────────────────────────────────
export default async function StoreTemplate({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  vendors,
  colors,
  collections,
  categories,
  minPrice,
  maxPrice,
}: {
  sortBy?: SortOptions
  page?: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  minPrice?: number
  maxPrice?: number
}) {
  const sort = sortBy || "created_at"
  const pageNumber = page || 1
  const hasAnyFilters =
    vendors?.length ||
    colors?.length ||
    collections?.length ||
    categories?.length ||
    minPrice !== undefined ||
    maxPrice !== undefined

  return (
    <MobileStoreWrapper
      sortBy={sort}
      hasActiveFilters={!!hasAnyFilters}
      count={0}
      filterContent={<div />}
    >
      {/*
        Suspense shows skeleton on FIRST page load only.
        After StoreDataFetcher resolves → ClientStoreShell renders.
        Every filter/sort/page action after that is 100% client-side = instant.
        No more 6-7 second delays.
      */}
      <Suspense fallback={<StoreLoadingSkeleton />}>
        <StoreDataFetcher
          sortBy={sort}
          countryCode={countryCode}
          initialVendors={vendors || []}
          initialColors={colors || []}
          initialCollections={collections || []}
          initialCategories={categories || []}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialPage={pageNumber}
        />
      </Suspense>
    </MobileStoreWrapper>
  )
}
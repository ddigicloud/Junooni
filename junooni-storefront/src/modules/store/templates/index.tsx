import React, { Suspense } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { getRegion } from "@lib/data/regions"
import MobileStoreWrapper from "@modules/store/components/mobile-store-wrapper"
import ClientStoreShell from "@modules/store/components/client-store-shell/client-store-shell"
import { listProductsForStore } from "@lib/data/products"  // add this

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
  const { listProductsForStore } = await import("@lib/data/products")
  const region = await getRegion(countryCode)
  if (!region) return null

  // Fetch first batch + metadata in parallel — this is what unblocks the skeleton
  const [categoriesData, vendorsData, firstBatch] = await Promise.all([
    listCategories(),
    retriveVendors(),
    listProductsForStore({ offset: 0, limit: 50, countryCode }),
  ])

  return (
    <ClientStoreShell
      initialProducts={firstBatch.products}      // ← renamed from allProducts
      totalCount={firstBatch.count}              // ← pass total so client knows how many batches remain
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
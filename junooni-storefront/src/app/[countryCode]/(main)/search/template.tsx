import React, { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import SearchResultsPage from "@modules/search/components/search-result-page/index"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default async function SearchResultsTemplate({
  searchParams,
  countryCode = "dk"
}: {
  searchParams?: Promise<{
    q?: string
    page?: string
    sortBy?: SortOptions
    vendors?: string
    colors?: string
    collections?: string
    categories?: string
    price?: string
  }>
  countryCode?: string
}) {
  console.log('🔍 [Template] SearchResultsTemplate started')
  
  // Get region for currency formatting
  const region = await getRegion(countryCode)
  if (!region) {
    return (
      <div className="content-container py-12 text-center">
        <div className="text-red-600 mb-4">Region not found for country: {countryCode}</div>
        <div className="text-gray-600">Please check your country code and try again.</div>
      </div>
    )
  }

  console.log('🔍 [Template] Basic info:', {
    countryCode,
    regionCurrency: region.currency_code,
    regionId: region.id,
    regionName: region.name
  })

  return (
    <div className="content-container">
      {/* 🎯 SIMPLIFIED: SearchResultsPage handles ALL UI elements */}
      <Suspense fallback={
        <div className="py-6">
          {/* Loading skeleton for title */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          </div>
          
          {/* Loading skeleton for layout */}
          <div className="flex flex-col small:flex-row small:items-start">
            {/* Sidebar skeleton */}
            <div className="w-full small:w-[300px] small:mr-6 mb-6 small:mb-0">
              <div className="space-y-6">
                {/* Filter sections skeleton */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main content skeleton */}
            <div className="w-full">
              {/* Sort controls skeleton */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-10 bg-gray-200 rounded animate-pulse w-24 small:hidden"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              
              {/* Products grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }>
        <SearchResultsPage
          countryCode={countryCode}
          region={region}
        />
      </Suspense>
    </div>
  )
}
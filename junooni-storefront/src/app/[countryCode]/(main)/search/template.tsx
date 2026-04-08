import React, { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import SearchResultsPage from "@modules/search/components/search-result-page/index"

export default async function SearchResultsTemplate({
  searchParams,
  countryCode: countryCodeProp,
}: {
  searchParams?: Record<string, string>
  countryCode?: string
}) {
  const countryCode = countryCodeProp || "in"  // ← always fallback, no early return

  const region = await getRegion(countryCode)

  if (!region) {
    return (
      <div className="py-24 text-center content-container">
        <p className="mb-2 text-red-600">
          Region not found for: <strong>{countryCode}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="content-container">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResultsPage
          countryCode={countryCode}
          region={region}
        />
      </Suspense>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="py-6 animate-pulse">
      <div className="mb-8">
        <div className="w-1/3 h-8 mb-3 bg-gray-200 rounded" />
        <div className="w-1/4 h-4 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-col gap-6 small:flex-row small:items-start">
        <div className="w-full small:w-[300px] shrink-0 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-1/2 h-5 bg-gray-200 rounded" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="w-3/4 h-4 bg-gray-200 rounded" />
              ))}
            </div>
          ))}
        </div>
        <div className="w-full">
          <div className="flex justify-end mb-6">
            <div className="w-32 bg-gray-200 rounded h-9" />
          </div>
          <div className="grid grid-cols-2 gap-4 small:grid-cols-3 small:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-gray-200 rounded-lg aspect-square" />
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-1/2 h-4 bg-gray-200 rounded" />
                <div className="w-1/3 h-5 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
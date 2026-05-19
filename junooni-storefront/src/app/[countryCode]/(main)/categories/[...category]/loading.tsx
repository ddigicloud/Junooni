// src/app/[countryCode]/(main)/categories/[handle]/loading.tsx
// Shows instantly when clicking any category — no more 8-9 second blank screen

export default function CategoryPageLoading() {
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

      {/* Main content */}
      <div className="w-full ml-0 md:ml-4">
        {/* Breadcrumb */}
        <div className="hidden mb-4 md:flex gap-2 items-center">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
        </div>

        {/* Category title */}
        <div className="px-2 mt-2 mb-0 small:mt-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-64" />
        </div>

        {/* Sort bar */}
        <div className="hidden mt-4 mb-6 md:flex justify-end">
          <div className="h-9 bg-gray-100 rounded animate-pulse w-40" />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton({ index }: { index: number }) {
  const delay = `${index * 40}ms`
  return (
    <div className="flex flex-col gap-2">
      <div
        className="w-full aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"
        style={{ animationDelay: delay }}
      />
      <div className="w-3/4 h-4 mt-2 bg-gray-100 rounded animate-pulse" style={{ animationDelay: delay }} />
      <div className="w-1/2 h-4 bg-gray-100 rounded animate-pulse" style={{ animationDelay: delay }} />
      <div className="w-1/3 h-5 bg-gray-100 rounded animate-pulse" style={{ animationDelay: delay }} />
    </div>
  )
}
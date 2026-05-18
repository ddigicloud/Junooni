"use client"

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 70}ms`
  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div
        className="w-full bg-gray-200 animate-pulse"
        style={{ aspectRatio: "1 / 1", animationDelay: delay }}
      />
      <div className="p-3 space-y-2">
        <div className="w-4/5 h-3.5 bg-gray-200 rounded animate-pulse" style={{ animationDelay: delay }} />
        <div className="w-3/5 h-3 bg-gray-100 rounded animate-pulse" style={{ animationDelay: delay }} />
        <div className="w-16 h-4 mt-1 bg-gray-200 rounded animate-pulse" style={{ animationDelay: delay }} />
      </div>
    </div>
  )
}

export default function CollectionDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 h-9 animate-pulse" />
      <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-28 animate-pulse" />
        <div className="flex gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-2 h-3 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-28 animate-pulse" />
        </div>

        {/* Collection banner skeleton */}
        <div className="w-full h-48 mb-8 bg-gray-200 rounded-2xl animate-pulse" />

        {/* Title + count */}
        <div className="mb-8">
          <div className="w-48 h-8 mb-2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-28 animate-pulse" />
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="flex-shrink-0 hidden w-52 sm:block">
            <div className="p-4 space-y-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${55 + i * 18}px` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="h-4 mb-5 bg-gray-200 rounded w-36 animate-pulse" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
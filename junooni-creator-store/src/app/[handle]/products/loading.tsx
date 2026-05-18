// src/app/[handle]/products/loading.tsx
"use client"

// ── Must be defined BEFORE the default export ──────────────────────────────
function ProductCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 80}ms`

  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div
        className="w-full bg-gray-200 animate-pulse"
        style={{ aspectRatio: "1 / 1", animationDelay: delay }}
      />
      <div className="p-3 space-y-2">
        <div
          className="w-4/5 h-3.5 bg-gray-200 rounded animate-pulse"
          style={{ animationDelay: delay }}
        />
        <div
          className="w-3/5 h-3 bg-gray-100 rounded animate-pulse"
          style={{ animationDelay: delay }}
        />
        <div
          className="w-16 h-4 mt-1 bg-gray-200 rounded animate-pulse"
          style={{ animationDelay: delay }}
        />
      </div>
    </div>
  )
}

// ── Default export LAST ─────────────────────────────────────────────────────
export default function ProductsLoading() {
  const SKELETON_COUNT = 6

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
        <div className="mb-8">
          <div className="w-40 h-8 mb-2 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0 hidden w-52 sm:block">
            <div className="p-4 space-y-5 bg-white border border-gray-100 rounded-xl">
              <div>
                <div className="h-3 mb-2 bg-gray-200 rounded w-14 animate-pulse" />
                <div className="w-full bg-gray-100 rounded-lg h-9 animate-pulse" />
              </div>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 15}px` }} />
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-full h-2 mb-2 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex justify-between">
                  <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="h-4 mb-5 bg-gray-200 rounded w-36 animate-pulse" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
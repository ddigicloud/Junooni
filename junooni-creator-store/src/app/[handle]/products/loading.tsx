// src/app/[handle]/products/loading.tsx
"use client"

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 80}ms`

  return (
    <div className="overflow-hidden border rounded-xl"
      style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
      <div
        className="w-full animate-pulse"
        style={{ aspectRatio: "1 / 1", animationDelay: delay, backgroundColor: "var(--skeleton-mid, #e5e7eb)" }}
      />
      <div className="p-3 space-y-2">
        <div
          className="w-4/5 h-3.5 rounded animate-pulse"
          style={{ animationDelay: delay, backgroundColor: "var(--skeleton-mid, #e5e7eb)" }}
        />
        <div
          className="w-3/5 h-3 rounded animate-pulse"
          style={{ animationDelay: delay, backgroundColor: "var(--skeleton-light, #f3f4f6)" }}
        />
        <div
          className="w-16 h-4 mt-1 rounded animate-pulse"
          style={{ animationDelay: delay, backgroundColor: "var(--skeleton-mid, #e5e7eb)" }}
        />
      </div>
    </div>
  )
}

export default function ProductsLoading() {
  const SKELETON_COUNT = 6

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--skeleton-bg, #f9fafb)" }}>
      {/* Announcement bar skeleton — uses brand primary */}
      <div className="h-9 animate-pulse" style={{ backgroundColor: "var(--brand-primary, #e65100)" }} />

      {/* Header skeleton */}
      <div className="flex items-center justify-between h-16 px-6 border-b"
        style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
        <div className="h-6 rounded w-28 animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        <div className="flex gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        </div>
      </div>

      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="w-40 h-8 mb-2 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="w-20 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar skeleton */}
          <div className="flex-shrink-0 hidden w-52 sm:block">
            <div className="p-4 space-y-5 border rounded-xl"
              style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
              <div>
                <div className="h-3 mb-2 rounded w-14 animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                <div className="w-full rounded-lg h-9 animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
              </div>
              <div className="h-px" style={{ backgroundColor: "var(--skeleton-border, #f3f4f6)" }} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-20 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                  <div className="w-3 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
                    <div className="h-3 rounded animate-pulse" style={{ width: `${60 + i * 15}px`, backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
                  </div>
                ))}
              </div>
              <div className="h-px" style={{ backgroundColor: "var(--skeleton-border, #f3f4f6)" }} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-16 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                  <div className="w-3 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                </div>
                <div className="w-full h-2 mb-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
                <div className="flex justify-between">
                  <div className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
                  <div className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="flex-1">
            <div className="h-4 mb-5 rounded w-36 animate-pulse" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
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
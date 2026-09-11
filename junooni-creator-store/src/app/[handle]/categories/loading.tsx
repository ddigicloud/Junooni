// src/app/[handle]/categories/loading.tsx
"use client"

function CategoryCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 60}ms`
  return (
    <div className="overflow-hidden border rounded-xl"
      style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
      <div
        className="w-full animate-pulse"
        style={{ aspectRatio: "3 / 2", animationDelay: delay, backgroundColor: "var(--skeleton-mid, #e5e7eb)" }}
      />
      <div className="p-4 space-y-2">
        <div className="w-2/3 h-4 rounded animate-pulse"
          style={{ animationDelay: delay, backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        <div className="w-1/3 h-3 rounded animate-pulse"
          style={{ animationDelay: delay, backgroundColor: "var(--brand-primary, #e5e7eb)", opacity: 0.2 }} />
      </div>
    </div>
  )
}

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--skeleton-bg, #f9fafb)" }}>

      {/* Announcement bar — brand primary */}
      <div className="h-9 animate-pulse"
        style={{ backgroundColor: "var(--brand-primary, #e65100)" }} />

      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b"
        style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
        <div className="h-6 rounded w-28 animate-pulse"
          style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        <div className="flex gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-16 h-4 rounded animate-pulse"
              style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded animate-pulse"
            style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="w-6 h-6 rounded animate-pulse"
            style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6">
        <div className="mb-8">
          <div className="w-32 h-8 mb-2 rounded animate-pulse"
            style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="w-48 h-4 rounded animate-pulse"
            style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
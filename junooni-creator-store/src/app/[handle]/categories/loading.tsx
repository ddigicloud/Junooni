// src/app/[handle]/categories/loading.tsx
"use client"

function CategoryCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 60}ms`
  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div
        className="w-full bg-gray-200 animate-pulse"
        style={{ aspectRatio: "3 / 2", animationDelay: delay }}
      />
      <div className="p-4 space-y-2">
        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: delay }} />
        <div className="w-1/3 h-3 bg-gray-100 rounded animate-pulse" style={{ animationDelay: delay }} />
      </div>
    </div>
  )
}

export default function CategoriesLoading() {
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
          <div className="w-32 h-8 mb-2 bg-gray-200 rounded animate-pulse" />
          <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
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
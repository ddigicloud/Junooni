// src/app/[handle]/collections/loading.tsx
"use client"

function CollectionCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 60}ms`
  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
      {/* Banner image area — wider aspect for collections */}
      <div
        className="w-full bg-gray-200 animate-pulse"
        style={{ aspectRatio: "16 / 9", animationDelay: delay }}
      />
      <div className="p-4 space-y-2">
        {/* Collection name */}
        <div
          className="w-3/5 h-4 bg-gray-200 rounded animate-pulse"
          style={{ animationDelay: delay }}
        />
        {/* Product count */}
        <div
          className="w-1/4 h-3 bg-gray-100 rounded animate-pulse"
          style={{ animationDelay: delay }}
        />
      </div>
    </div>
  )
}

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Announcement bar */}
      <div className="bg-orange-500 h-9 animate-pulse" />

      {/* Header */}
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

      {/* Content */}
      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6">

        {/* Page title */}
        <div className="mb-8">
          <div className="h-8 mb-2 bg-gray-200 rounded w-36 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-52 animate-pulse" />
        </div>

        {/* Collection grid — 2 col mobile, 3 desktop */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollectionCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
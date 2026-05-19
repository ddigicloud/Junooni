// src/app/[countryCode]/(main)/creators/loading.tsx
// Shows instantly when navigating to /creators — no more blank 8-9 second wait

export default function CreatorsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header skeleton */}
      <header className="sticky top-0 z-40 mt-16 bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-7 bg-gray-200 rounded animate-pulse w-36" />
            </div>
          </div>
          {/* Search bar skeleton */}
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-full animate-pulse w-24" />
          </div>
        </div>
      </header>

      {/* Grid skeleton */}
      <main className="px-1 py-6 sm:px-4">
        <div className="grid grid-cols-2 gap-1 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <VendorCardSkeleton key={i} index={i} />
          ))}
        </div>
      </main>
    </div>
  )
}

function VendorCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 50}ms`
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Cover photo */}
      <div
        className="h-32 bg-gray-200 animate-pulse"
        style={{ animationDelay: delay }}
      />
      {/* Avatar — overlapping */}
      <div className="flex justify-center -mt-10">
        <div
          className="w-20 h-20 bg-gray-300 border-4 border-white rounded-full animate-pulse"
          style={{ animationDelay: delay }}
        />
      </div>
      {/* Content */}
      <div className="px-4 pt-3 pb-4 text-center space-y-2">
        <div
          className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"
          style={{ animationDelay: delay }}
        />
        <div
          className="h-3 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"
          style={{ animationDelay: delay }}
        />
        <div
          className="h-5 bg-orange-100 rounded-full animate-pulse w-20 mx-auto"
          style={{ animationDelay: delay }}
        />
        <div
          className="h-3 bg-gray-100 rounded animate-pulse w-full"
          style={{ animationDelay: delay }}
        />
        <div
          className="h-3 bg-gray-100 rounded animate-pulse w-5/6"
          style={{ animationDelay: delay }}
        />
        {/* Follow row */}
        <div className="flex items-center justify-between pt-3 border-t mt-2">
          <div
            className="h-3 bg-gray-100 rounded animate-pulse w-20"
            style={{ animationDelay: delay }}
          />
          <div
            className="h-7 bg-orange-200 rounded-full animate-pulse w-16"
            style={{ animationDelay: delay }}
          />
        </div>
      </div>
    </div>
  )
}
// src/app/[countryCode]/(main)/creator/[handle]/loading.tsx
// Next.js shows this INSTANTLY when navigating to any /creator/[handle] page.
// The user sees this the moment they click — no more 7-8 second blank screen.

export default function CreatorPageLoading() {
  return (
    <div className="min-h-screen pt-16 overflow-x-hidden bg-gray-50 md:pt-18">

      {/* Cover photo skeleton */}
      <div className="w-full h-64 bg-gray-200 animate-pulse md:h-80 lg:h-96" />

      <div className="w-full px-0 mx-auto max-w-7xl sm:px-4 lg:px-8">
        <div className="relative w-full mb-8 -mt-12 md:-mt-16">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 md:p-6 md:pb-0">

              {/* Profile section */}
              <div className="flex flex-col gap-6 md:flex-row">

                {/* Avatar skeleton */}
                <div className="relative flex-shrink-0 w-32 h-32 -mt-8 md:w-40 md:h-40 md:-mt-16">
                  <div className="w-full h-full bg-gray-200 border-4 border-white rounded-full shadow-lg animate-pulse" />
                </div>

                <div className="flex-grow">
                  {/* Name + handle */}
                  <div className="hidden md:block mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-8 mb-2 bg-gray-200 rounded animate-pulse w-48" />
                        <div className="h-5 bg-gray-100 rounded-full animate-pulse w-32" />
                      </div>
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <div className="h-10 bg-gray-200 rounded-full animate-pulse w-28" />
                        <div className="h-10 bg-gray-100 rounded-full animate-pulse w-24" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile name */}
                  <div className="md:hidden mb-4">
                    <div className="h-7 mb-2 bg-gray-200 rounded animate-pulse w-40" />
                    <div className="h-5 bg-gray-100 rounded-full animate-pulse w-28" />
                  </div>

                  {/* Role + stats */}
                  <div className="flex gap-6 mb-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-32" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/5" />
                  </div>

                  {/* Social icons */}
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile action buttons */}
              <div className="flex gap-3 mt-4 md:hidden">
                <div className="flex-1 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-full animate-pulse w-28" />
              </div>

              {/* Fans banner skeleton */}
              <div className="my-8 h-32 bg-orange-100 rounded-lg animate-pulse" />

              {/* Products section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-7 bg-gray-200 rounded animate-pulse w-36" />
                  <div className="h-9 bg-gray-100 rounded animate-pulse w-40" />
                </div>

                {/* Product grid skeleton */}
                <div className="grid grid-cols-2 gap-0 -mx-4 md:grid-cols-3 sm:-mx-6 lg:grid-cols-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} index={i} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton({ index }: { index: number }) {
  const delay = `${index * 60}ms`
  return (
    <div className="relative flex flex-col h-full p-1 border border-gray-100 shadow-sm sm:p-3">
      {/* Image */}
      <div
        className="w-full bg-gray-200 rounded-lg aspect-[4/5] mb-4 animate-pulse"
        style={{ animationDelay: delay }}
      />
      {/* Vendor name */}
      <div
        className="h-3 bg-gray-100 rounded animate-pulse mb-2 w-20"
        style={{ animationDelay: delay }}
      />
      {/* Product title */}
      <div
        className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-4/5"
        style={{ animationDelay: delay }}
      />
      {/* Color dots */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map(j => (
          <div
            key={j}
            className="w-5 h-5 bg-gray-100 rounded-full animate-pulse"
            style={{ animationDelay: delay }}
          />
        ))}
      </div>
      {/* Price */}
      <div
        className="h-4 bg-gray-200 rounded animate-pulse w-16"
        style={{ animationDelay: delay }}
      />
      {/* Stars */}
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5].map(j => (
          <div
            key={j}
            className="w-3 h-3 bg-gray-100 rounded animate-pulse"
            style={{ animationDelay: delay }}
          />
        ))}
      </div>
    </div>
  )
}
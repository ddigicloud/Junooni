// src/app/[countryCode]/(main)/loading.tsx

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero skeleton */}
      <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />

      <div className="flex flex-col bg-white">
        <main className="flex-grow">

          {/* VendorList skeleton */}
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <div className="w-40 mb-6 bg-gray-100 rounded h-7 animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                  <div className="w-16 h-3 mx-auto bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                </div>
              ))}
            </div>
          </div>

          {/* FeaturedProducts skeleton */}
          <div className="px-4 pt-12 mx-auto max-w-7xl">
            <div className="w-48 h-8 mb-8 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="mb-4 bg-gray-100 rounded-lg aspect-[4/5] animate-pulse" />
                  <div className="w-1/3 h-3 mb-2 bg-gray-100 rounded animate-pulse" />
                  <div className="w-3/4 h-4 mb-2 bg-gray-100 rounded animate-pulse" />
                  <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* HomeCategories skeleton */}
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <div className="w-40 mb-6 bg-gray-100 rounded h-7 animate-pulse" />
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>

          {/* CollectionBanner skeleton */}
          <div className="w-full h-48 bg-gray-100 animate-pulse" />

          {/* Bestsellers skeleton */}
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <div className="w-40 mb-6 bg-gray-100 rounded h-7 animate-pulse" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="mb-4 bg-gray-100 rounded-lg aspect-[4/5] animate-pulse" />
                  <div className="w-3/4 h-4 mb-2 bg-gray-100 rounded animate-pulse" />
                  <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
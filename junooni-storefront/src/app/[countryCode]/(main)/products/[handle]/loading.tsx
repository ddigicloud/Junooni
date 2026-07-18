// src/app/[countryCode]/(main)/loading.tsx

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero skeleton */}
      <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />

      <div className="flex flex-col bg-white">
        <main className="flex-grow">

          {/* Featured Creators / VendorList skeleton — portrait cards */}
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <div className="w-48 h-8 bg-gray-100 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-56"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Portrait image */}
                  <div
                    className="w-full mb-3 bg-gray-100 rounded-lg animate-pulse"
                    style={{ aspectRatio: "3/4" }}
                  />
                  {/* Creator name */}
                  <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* FeaturedProducts skeleton — portrait product cards */}
          <div className="px-4 pt-4 pb-12 mx-auto max-w-7xl">
            <div className="w-48 h-8 mb-8 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  {/* Portrait image */}
                  <div
                    className="w-full mb-3 bg-gray-100 rounded-lg animate-pulse"
                    style={{ aspectRatio: "4/5" }}
                  />
                  {/* Vendor name */}
                  <div className="w-1/3 h-3 mb-2 bg-gray-100 rounded animate-pulse" />
                  {/* Product name */}
                  <div className="w-3/4 h-4 mb-2 bg-gray-100 rounded animate-pulse" />
                  {/* Price */}
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
                <div key={i} style={{ animationDelay: `${i * 60}ms` }}>
                  <div
                    className="w-full mb-2 bg-gray-100 rounded-lg animate-pulse"
                    style={{ aspectRatio: "1/1" }}
                  />
                  <div className="w-2/3 h-3 mx-auto bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* CollectionBanner skeleton */}
          <div className="w-full h-48 bg-gray-100 animate-pulse" />

          {/* Bestsellers skeleton — portrait product cards */}
          <div className="px-4 py-12 mx-auto max-w-7xl">
            <div className="w-40 mb-6 bg-gray-100 rounded h-7 animate-pulse" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <div
                    className="w-full mb-3 bg-gray-100 rounded-lg animate-pulse"
                    style={{ aspectRatio: "4/5" }}
                  />
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
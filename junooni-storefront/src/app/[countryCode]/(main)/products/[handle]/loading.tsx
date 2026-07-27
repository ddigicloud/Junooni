export default function ProductLoading() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto">
        {/* Main product card */}
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5">

            {/* ── Left: Image Gallery (col-span-3) ── */}
            <div className="p-4 md:col-span-3">
              {/* Main image */}
              <div className="w-full mb-3 bg-gray-100 rounded-lg aspect-square animate-pulse" />

              {/* Thumbnail strip */}
              <div className="flex gap-2 mt-2">
                {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                    className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* ── Right: Product Details (col-span-2) ── */}
            <div className="p-4 md:p-8 md:col-span-2">

              {/* Vendor info row */}
              <div className="flex items-center gap-2 mb-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex flex-col gap-1">
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                  <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>

              {/* ProductInfo skeleton */}
              {/* Title */}
              <div className="w-4/5 mb-2 bg-gray-200 rounded h-7 animate-pulse" />
              <div className="w-2/5 h-5 mb-4 bg-gray-100 rounded animate-pulse" />

              {/* Price */}
              <div className="w-1/3 h-8 mb-6 bg-gray-200 rounded animate-pulse" />

              {/* ProductActions skeleton */}
              {/* Size/color option buttons */}
              <div className="mb-4">
                <div className="w-10 h-3 mb-2 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded h-9 w-14 animate-pulse"
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
              ))}
            </div>
          </div>

              {/* Quantity + Add to cart */}
              <div className="flex gap-3 mb-6">
                <div className="w-24 bg-gray-100 rounded h-11 animate-pulse" />
                <div className="h-11 flex-1 bg-[#e65100]/20 rounded animate-pulse" />
              </div>

              {/* Shipping & Returns block */}
              <div className="py-6 mb-6 border-t border-b">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-2">
                      {/* Icon placeholder */}
                      <div className="w-4 h-4 mt-0.5 rounded bg-gray-100 animate-pulse flex-shrink-0"
                        style={{ animationDelay: `${i * 70}ms` }} />
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"
                          style={{ animationDelay: `${i * 70}ms` }} />
                        <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse"
                          style={{ animationDelay: `${i * 70 + 30}ms` }} />
                      </div>
                </div>
              ))}
            </div>
          </div>

              {/* Authenticity guarantee bar */}
              <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50">
                <div className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="flex flex-col flex-1 gap-1">
                  <div className="h-3 bg-gray-200 rounded w-36 animate-pulse" />
                  <div className="h-2.5 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
            </div>
          </div>

        {/* ── Product Tabs ── */}
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          {/* Tab headers */}
          <div className="flex px-4 border-b">
            {[80, 64, 72].map((w, i) => (
              <div
                key={i}
                className="py-4 mr-6"
              >
                <div
                  className={`h-3.5 rounded animate-pulse ${i === 0 ? "bg-[#e65100]/30" : "bg-gray-100"}`}
                  style={{ width: w, animationDelay: `${i * 60}ms` }}
                />
              </div>
            ))}
          </div>

          {/* Tab body */}
          <div className="flex flex-col gap-3 p-6">
            <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
            <div className="w-5/6 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="w-4/6 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="w-3/4 h-3 bg-gray-100 rounded animate-pulse" style={{ animationDelay: "80ms" }} />
          </div>
        </div>

        {/* ── Related Products ── */}
        <div className="mb-12">
          {/* Section header */}
          <div className="w-40 h-6 mb-6 bg-gray-200 rounded animate-pulse" />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden bg-white rounded-lg shadow-sm"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="bg-gray-100 aspect-square animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 80 + 20}ms` }} />
                  <div className="w-1/2 h-3 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 80 + 40}ms` }} />
                </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}
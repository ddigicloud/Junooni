export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">

      {/* ── Header skeleton ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          {/* Logo */}
          <div className="w-28 h-7 bg-gray-200 rounded-lg" />
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-14 h-4 bg-gray-200 rounded" />
          </div>
          {/* Icons */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Product detail ── */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="grid items-start gap-16 md:grid-cols-2">

          {/* ── Left: Gallery skeleton ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
            {/* Thumbnail strip */}
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
              ))}
            </div>
          </div>

          {/* ── Right: Product info skeleton ── */}
          <div className="sticky top-24 space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <div className="w-3/4 h-9 bg-gray-200 rounded-lg" />
              <div className="w-1/2 h-9 bg-gray-200 rounded-lg" />
            </div>

            {/* Price */}
            <div className="w-28 h-8 bg-gray-200 rounded-lg" />

            {/* Color swatches */}
            <div className="space-y-2.5">
              <div className="w-16 h-3 bg-gray-200 rounded" />
              <div className="flex gap-2.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>

            {/* Size buttons */}
            <div className="space-y-2.5">
              <div className="w-12 h-3 bg-gray-200 rounded" />
              <div className="flex gap-2 flex-wrap">
                {["XS", "S", "M", "L", "XL", "XXL"].map((_, i) => (
                  <div key={i} className="w-14 h-9 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>

            {/* Quantity + ATC */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-28 h-12 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 h-12 bg-gray-200 rounded-full" />
            </div>

            {/* Secure badge */}
            <div className="w-64 h-3 bg-gray-100 rounded mx-auto" />

            {/* Description accordion */}
            <div className="pt-6 space-y-4 border-t border-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 border-b border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Related products skeleton ── */}
        <div className="mt-24 pt-12 border-t border-gray-100">
          <div className="w-40 h-4 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-1/3 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer skeleton ── */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-12 mt-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-20 h-3 bg-gray-200 rounded" />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between mx-auto max-w-7xl">
          <div className="w-32 h-3 bg-gray-200 rounded" />
          <div className="w-48 h-3 bg-gray-200 rounded" />
        </div>
      </div>

    </div>
  )
}
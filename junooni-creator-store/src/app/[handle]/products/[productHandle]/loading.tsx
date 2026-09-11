export default function ProductLoading() {
  return (
    <div className="min-h-screen animate-pulse"
      style={{ backgroundColor: "var(--skeleton-card, #ffffff)" }}>

      {/* ── Header skeleton ── */}
      <div className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "var(--skeleton-card, #ffffff)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="w-28 h-7 rounded-lg" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
            <div className="w-20 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
            <div className="w-14 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          </div>
        </div>
      </div>

      {/* ── Product detail ── */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="grid items-start gap-16 md:grid-cols-2">

          {/* ── Left: Gallery skeleton ── */}
          <div className="space-y-3">
            <div className="w-full aspect-square rounded-2xl" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-xl shrink-0" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              ))}
            </div>
          </div>

          {/* ── Right: Product info skeleton ── */}
          <div className="sticky top-24 space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <div className="w-3/4 h-9 rounded-lg" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              <div className="w-1/2 h-9 rounded-lg" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
            </div>

            {/* Price — uses brand primary at low opacity */}
            <div className="w-28 h-8 rounded-lg"
              style={{ backgroundColor: "var(--brand-primary, #e5e7eb)", opacity: 0.2 }} />

            {/* Color swatches */}
            <div className="space-y-2.5">
              <div className="w-16 h-3 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              <div className="flex gap-2.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                ))}
              </div>
            </div>

            {/* Size buttons */}
            <div className="space-y-2.5">
              <div className="w-12 h-3 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              <div className="flex gap-2 flex-wrap">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <div key={s} className="w-14 h-9 rounded-full" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                ))}
              </div>
            </div>

            {/* Quantity + ATC — ATC uses brand primary at low opacity */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-28 h-12 rounded-full shrink-0" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              <div className="flex-1 h-12 rounded-full"
                style={{ backgroundColor: "var(--brand-primary, #e5e7eb)", opacity: 0.25 }} />
            </div>

            {/* Secure badge */}
            <div className="w-64 h-3 rounded mx-auto" style={{ backgroundColor: "var(--skeleton-light, #f3f4f6)" }} />

            {/* Description accordion */}
            <div className="pt-6 space-y-4 border-t" style={{ borderColor: "var(--skeleton-border, #f3f4f6)" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 border-b space-y-2" style={{ borderColor: "var(--skeleton-border, #f3f4f6)" }}>
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Related products skeleton ── */}
        <div className="mt-24 pt-12 border-t" style={{ borderColor: "var(--skeleton-border, #f3f4f6)" }}>
          <div className="w-40 h-4 rounded mb-8" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="w-full aspect-square rounded-xl" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                <div className="w-3/4 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
                <div className="w-1/3 h-4 rounded"
                  style={{ backgroundColor: "var(--brand-primary, #e5e7eb)", opacity: 0.2 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer skeleton ── */}
      <div className="border-t px-6 py-12 mt-8"
        style={{ backgroundColor: "var(--skeleton-bg, #f9fafb)", borderColor: "var(--skeleton-border, #f3f4f6)" }}>
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-24 h-4 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-20 h-3 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t flex items-center justify-between mx-auto max-w-7xl"
          style={{ borderColor: "var(--skeleton-border, #f3f4f6)" }}>
          <div className="w-32 h-3 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
          <div className="w-48 h-3 rounded" style={{ backgroundColor: "var(--skeleton-mid, #e5e7eb)" }} />
        </div>
      </div>

    </div>
  )
}
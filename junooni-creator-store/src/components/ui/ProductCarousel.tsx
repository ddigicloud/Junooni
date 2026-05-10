// "use client"

// import { useState, useRef } from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import ProductCard from "./ProductCard"

// interface Props {
//   products: any[]
//   handle: string
//   title?: string
//   brandPrimary?: string
//   variant?: "light" | "dark"
// }

// export default function ProductCarousel({
//   products, handle, title, brandPrimary = "#e65100", variant = "light",
// }: Props) {
//   const isDark = variant === "dark"
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const containerRef = useRef<HTMLDivElement>(null)

//   const visibleCount = 3
//   const maxIndex = Math.max(0, products.length - visibleCount)

//   const scrollTo = (index: number) => {
//     const clamped = Math.max(0, Math.min(index, maxIndex))
//     setCurrentIndex(clamped)
//     if (containerRef.current) {
//       const cardWidth = containerRef.current.scrollWidth / products.length
//       containerRef.current.scrollTo({
//         left: clamped * cardWidth,
//         behavior: "smooth",
//       })
//     }
//   }

//   const canPrev = currentIndex > 0
//   const canNext = currentIndex < maxIndex

//   if (!products.length) return null

//   return (
//     <div className="relative">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         {/* Title or empty spacer */}
//         {title ? (
//           <div className="flex items-center gap-4">
//             <h2 className={`text-xs uppercase tracking-[0.2em] font-semibold ${isDark ? "text-white/50" : "text-gray-400"}`}>
//               {title}
//             </h2>
//             <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"} w-32`} />
//           </div>
//         ) : (
//           <div />
//         )}

//         {/* Nav buttons — always shown if enough products */}
//         {products.length > visibleCount && (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => scrollTo(currentIndex - 1)}
//               disabled={!canPrev}
//               className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
//                 canPrev
//                   ? isDark
//                     ? "border-white/30 text-white hover:border-white hover:bg-white/10"
//                     : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
//                   : isDark
//                     ? "border-white/10 text-white/20 cursor-not-allowed"
//                     : "border-gray-100 text-gray-300 cursor-not-allowed"
//               }`}
//               style={canPrev ? { borderColor: brandPrimary, color: brandPrimary } : {}}
//               aria-label="Previous"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => scrollTo(currentIndex + 1)}
//               disabled={!canNext}
//               className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
//                 canNext
//                   ? isDark
//                     ? "border-white/30 text-white hover:border-white hover:bg-white/10"
//                     : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
//                   : isDark
//                     ? "border-white/10 text-white/20 cursor-not-allowed"
//                     : "border-gray-100 text-gray-300 cursor-not-allowed"
//               }`}
//               style={canNext ? { borderColor: brandPrimary, color: brandPrimary } : {}}
//               aria-label="Next"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Scrollable track */}
//       <div
//         ref={containerRef}
//         className="flex gap-4 pb-2 overflow-x-auto scrollbar-hide scroll-smooth"
//         style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//       >
//         {products.map((product) => (
//           <div
//             key={product.id}
//             className="shrink-0"
//             style={{ width: "calc(33.33% - 11px)", minWidth: 200 }}
//           >
//             <ProductCard
//               product={product}
//               handle={handle}
//               brandPrimary={brandPrimary}
//               variant={variant}
//             />
//           </div>
//         ))}
//       </div>

//       {/* Dot indicators */}
//       {products.length > visibleCount && (
//         <div className="flex justify-center gap-1.5 mt-5">
//           {Array.from({ length: maxIndex + 1 }).map((_, i) => (
//             <button
//               key={i}
//               onClick={() => scrollTo(i)}
//               className="transition-all rounded-full"
//               style={{
//                 width: i === currentIndex ? 20 : 6,
//                 height: 6,
//                 background: i === currentIndex ? brandPrimary : isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb",
//               }}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "./ProductCard"

interface Props {
  products: any[]
  handle: string
  title?: string
  brandPrimary?: string
  variant?: "light" | "dark"
  aspectRatio?: "square" | "portrait" | "landscape"
  alignment?: "left" | "center"
  showPrice?: boolean
  showHover?: boolean
  showSoldOutBadge?: boolean
}

export default function ProductCarousel({
  products,
  handle,
  title,
  brandPrimary = "#e65100",
  variant = "light",
  aspectRatio = "square",
  alignment = "left",
  showPrice = true,
  showHover = true,
  showSoldOutBadge = true,
}: Props) {
  const isDark = variant === "dark"
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleCount = 3
  const maxIndex = Math.max(0, products.length - visibleCount)

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(clamped)
    if (containerRef.current) {
      const cardWidth = containerRef.current.scrollWidth / products.length
      containerRef.current.scrollTo({
        left: clamped * cardWidth,
        behavior: "smooth",
      })
    }
  }

  const canPrev = currentIndex > 0
  const canNext = currentIndex < maxIndex

  if (!products.length) return null

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {title ? (
          <div className="flex items-center gap-4">
            <h2 className={`text-xs uppercase tracking-[0.2em] font-semibold ${isDark ? "text-white/50" : "text-gray-400"}`}>
              {title}
            </h2>
            <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"} w-32`} />
          </div>
        ) : (
          <div />
        )}

        {products.length > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo(currentIndex - 1)}
              disabled={!canPrev}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                canPrev
                  ? isDark
                    ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                    : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
                  : isDark
                    ? "border-white/10 text-white/20 cursor-not-allowed"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              style={canPrev ? { borderColor: brandPrimary, color: brandPrimary } : {}}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo(currentIndex + 1)}
              disabled={!canNext}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                canNext
                  ? isDark
                    ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                    : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
                  : isDark
                    ? "border-white/10 text-white/20 cursor-not-allowed"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              style={canNext ? { borderColor: brandPrimary, color: brandPrimary } : {}}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable track */}
      <div
        ref={containerRef}
        className="flex gap-4 pb-2 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0"
            style={{ width: "calc(33.33% - 11px)", minWidth: 200 }}
          >
            <ProductCard
              product={product}
              handle={handle}
              brandPrimary={brandPrimary}
              variant={variant}
              aspectRatio={aspectRatio}
              alignment={alignment}
              showPrice={showPrice}
              showHover={showHover}
              showSoldOutBadge={showSoldOutBadge}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {products.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="transition-all rounded-full"
              style={{
                width: i === currentIndex ? 20 : 6,
                height: 6,
                background: i === currentIndex
                  ? brandPrimary
                  : isDark ? "rgba(255,255,255,0.2)" : "#e5e7eb",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
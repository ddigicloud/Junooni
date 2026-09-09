// // src/components/product/ProductGallery.tsx
// "use client"

// import Image from "next/image"
// import { useGallery } from "./GalleryContext"

// interface Props {
//   initialImages: { id?: string; url: string }[]
//   fallbackThumbnail?: string
//   productTitle: string
//   isDark: boolean
// }

// export default function ProductGallery({
//   fallbackThumbnail,
//   productTitle,
//   isDark,
// }: Props) {
//   const { images, activeIndex, setActiveIndex } = useGallery()

//   const mainImage =
//     images[activeIndex]?.url ?? images[0]?.url ?? fallbackThumbnail

//   return (
//     <div className="space-y-4">
//       {/* Main image */}
//       <div className="relative overflow-hidden bg-gray-100 aspect-square rounded-2xl">
//         {mainImage ? (
//           <Image
//             key={mainImage}                  // key forces re-render on src change
//             src={mainImage}
//             alt={productTitle}
//             fill
//             className="object-cover transition-opacity duration-300"
//             priority
//           />
//         ) : (
//           <div className="flex items-center justify-center w-full h-full">
//             <span className="text-6xl opacity-20">🛍</span>
//           </div>
//         )}
//       </div>

//       {/* Thumbnail strip — only show when 2+ images */}
//       {images.length > 1 && (
//         <div className="grid grid-cols-4 gap-3">
//           {images.slice(0, 8).map((img, i) => (
//             <button
//               key={img.id ?? img.url}
//               onClick={() => setActiveIndex(i)}
//               className={`relative overflow-hidden aspect-square rounded-xl border-2 transition-all focus:outline-0 ${
//                 i === activeIndex
//                   ? "border-[var(--brand-primary)] scale-105 shadow-md"
//                   : isDark
//                   ? "border-white/10 opacity-100 hover:opacity-100 hover:border-white/30"
//                   : "border-gray-100 opacity-100 hover:opacity-100 hover:border-gray-300"
//               }`}
//             >
//               <Image
//                 src={img.url}
//                 alt={`${productTitle} view ${i + 1}`}
//                 fill
//                 className="object-cover"
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }



// src/components/product/ProductGallery.tsx
"use client"

import Image from "next/image"
import { useGallery } from "./GalleryContext"

interface Props {
  initialImages: { id?: string; url: string }[]
  fallbackThumbnail?: string
  productTitle: string
  isDark: boolean
  borderRadius?: number
  thumbnailPosition?: "below" | "left"
}

export default function ProductGallery({
  fallbackThumbnail,
  productTitle,
  isDark,
  borderRadius = 16,
  thumbnailPosition = "below",
}: Props) {
  const { images, activeIndex, setActiveIndex } = useGallery()

  const mainImage =
    images[activeIndex]?.url ?? images[0]?.url ?? fallbackThumbnail

  const radius = `${borderRadius}px`
  const hasMultiple = images.length > 1

  // ── Left column layout ──────────────────────────────────────────────────────
  if (thumbnailPosition === "left" && hasMultiple) {
    return (
      <div className="flex gap-3">
        {/* Thumbnail column — left side */}
        <div className="flex flex-col gap-2 shrink-0 w-[72px]">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img.id ?? img.url}
              onClick={() => setActiveIndex(i)}
              className={`relative overflow-hidden aspect-square border-2 transition-all focus:outline-0 w-full`}
              style={{
                borderRadius: `${Math.min(borderRadius, 10)}px`,
                borderColor: i === activeIndex
                  ? "var(--brand-primary)"
                  : isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                transform: i === activeIndex ? "scale(1.05)" : "scale(1)",
              }}
            >
              <Image
                src={img.url}
                alt={`${productTitle} view ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative flex-1 overflow-hidden bg-gray-100 aspect-square"
          style={{ borderRadius: radius }}>
          {mainImage ? (
            <Image
              key={mainImage}
              src={mainImage}
              alt={productTitle}
              fill
              className="object-cover transition-opacity duration-300"
              priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-6xl opacity-20">🛍</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Below layout (default) ──────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square"
        style={{ borderRadius: radius }}>
        {mainImage ? (
          <Image
            key={mainImage}
            src={mainImage}
            alt={productTitle}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-6xl opacity-20">🛍</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip — only show when 2+ images */}
      {hasMultiple && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={img.id ?? img.url}
              onClick={() => setActiveIndex(i)}
              className="relative overflow-hidden aspect-square border-2 transition-all focus:outline-0"
              style={{
                borderRadius: `${Math.min(borderRadius, 12)}px`,
                borderColor: i === activeIndex
                  ? "var(--brand-primary)"
                  : isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6",
                transform: i === activeIndex ? "scale(1.05)" : "scale(1)",
                boxShadow: i === activeIndex ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <Image
                src={img.url}
                alt={`${productTitle} view ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
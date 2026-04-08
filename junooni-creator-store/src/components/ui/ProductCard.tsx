"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", white: "#ffffff", red: "#ef4444", blue: "#3b82f6",
  navy: "#1e3a5f", "navy blue": "#1e3a5f", green: "#22c55e",
  yellow: "#eab308", orange: "#f97316", pink: "#ec4899", purple: "#a855f7",
  grey: "#9ca3af", gray: "#9ca3af", brown: "#92400e", beige: "#d4a96a",
  "golden yellow": "#d97706", maroon: "#7f1d1d", cream: "#fef3c7",
  "olive green": "#3d5a00", teal: "#0d9488", "sky blue": "#38bdf8",
  "dark green": "#14532d", "light blue": "#bfdbfe", "charcoal grey": "#374151",
  "bottle green": "#064e3b", "forest green": "#15803d", coral: "#fb7185",
  lavender: "#c4b5fd", mint: "#6ee7b7", "rust orange": "#c2410c",
}

function getColorHex(name: string): string {
  return COLOR_MAP[name.toLowerCase().trim()] ?? "#e5e7eb"
}

function formatINR(paise: number): string {
  const rupees = Math.round(paise)
  const s = String(rupees)
  if (s.length <= 3) return `₹${s}`
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const parts: string[] = []
  let i = rest.length
  while (i > 0) {
    const take = parts.length === 0 ? (i % 2 === 0 ? 2 : 1) : 2
    parts.unshift(rest.slice(Math.max(0, i - take), i))
    i -= take
  }
  return `₹${[...parts, last3].join(",")}`
}

function getColorImage(product: any, colorOptionId: string, colorValue: string): string | null {
  // Find any variant with this color to access its metadata
  const variant = product.variants?.find((v: any) =>
    v.options?.some(
      (o: any) =>
        (o.option_id === colorOptionId || o.option?.id === colorOptionId) &&
        o.value === colorValue
    )
  )
  if (!variant) return null

  const meta = variant.metadata

  // 1. Try metadata.option_images — array of {option_name, option_value, url}
  if (meta?.option_images) {
    try {
      const parsed = typeof meta.option_images === "string"
        ? JSON.parse(meta.option_images)
        : meta.option_images
      const match = parsed.find(
        (e: any) =>
          e.option_value?.toLowerCase() === colorValue.toLowerCase() &&
          e.option_name?.toLowerCase() === "color"
      )
      if (match?.url) return match.url
    } catch {}
  }

  // 2. Try metadata.color_images — array of {color, url}
  if (meta?.color_images) {
    try {
      const parsed = typeof meta.color_images === "string"
        ? JSON.parse(meta.color_images)
        : meta.color_images
      const match = parsed.find(
        (e: any) => e.color?.toLowerCase() === colorValue.toLowerCase()
      )
      if (match?.url) return match.url
    } catch {}
  }

  // 3. Try metadata.variant_images — simple array of URLs (first one = front)
  if (meta?.variant_images) {
    try {
      const parsed = typeof meta.variant_images === "string"
        ? JSON.parse(meta.variant_images)
        : meta.variant_images
      if (Array.isArray(parsed) && parsed[0]) return parsed[0]
    } catch {}
  }

  // 4. Fallback: variant.images[0].url (same for all colors but better than nothing)
  return variant.images?.[0]?.url ?? null
}

function getColorSwatches(product: any) {
  const colorOption = product.options?.find(
    (o: any) => o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "colour"
  )
  if (!colorOption) return []

  const seen = new Set<string>()
  const swatches: { value: string; hex: string; image: string | null }[] = []

  for (const val of colorOption.values ?? []) {
    if (seen.has(val.value)) continue
    seen.add(val.value)
    const image = getColorImage(product, colorOption.id, val.value)
    swatches.push({ value: val.value, hex: getColorHex(val.value), image })
  }
  return swatches
}

interface Props {
  product: any
  handle: string
  brandPrimary?: string
  variant?: "light" | "dark"
}

export default function ProductCard({ product, handle, brandPrimary = "#e65100", variant = "light" }: Props) {
  const isDark = variant === "dark"
  const [isWished, setIsWished] = useState(false)
  // activeImage: null means show product.thumbnail, string means show that URL
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const swatches = getColorSwatches(product)
  const visibleSwatches = swatches.slice(0, 4)
  const extraColors = swatches.length - 4
  const price = product.variants?.[0]?.prices?.[0]?.amount
  const priceStr = price !== undefined ? formatINR(price) : null

  // displayImage: activeImage (set on hover) OR product.thumbnail
  // We use a CSS trick — render BOTH images and toggle opacity
  // This avoids any state/hydration timing issues
  const defaultImage = product.thumbnail ?? null

  const handleMouseEnter = (swatch: { value: string; image: string | null }) => {
    setActiveColor(swatch.value)
    if (swatch.image) setActiveImage(swatch.image)
  }

  const handleMouseLeave = () => {
    setActiveColor(null)
    setActiveImage(null)
  }

  const handleWish = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsWished(w => !w)
  }, [])

  return (
    <div className="group relative">
      <Link href={`/${handle}/products/${product.handle}`}>
        <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-50"} transition-transform duration-200 group-hover:-translate-y-1`}>

          {/* Image container — overlay technique to avoid hydration issues */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {/* Default image — always rendered */}
            {defaultImage && (
              <Image
                src={defaultImage}
                alt={product.title}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  mounted && activeImage ? "opacity-0" : "opacity-100"
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Hover image — only rendered client-side when a color with image is hovered */}
            {mounted && activeImage && (
              <Image
                src={activeImage}
                alt={activeColor ?? product.title}
                fill
                className="object-cover transition-opacity duration-300 opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Color label */}
            {mounted && activeColor && (
              <span
                className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-medium text-white pointer-events-none whitespace-nowrap z-10"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                {activeColor}
              </span>
            )}

            {/* Wishlist */}
            {/* <button
              onClick={handleWish}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <Heart className="w-4 h-4" fill={isWished ? "#ef4444" : "none"} stroke={isWished ? "#ef4444" : "#6b7280"} />
            </button> */}
          </div>

          {/* Info */}
          <div className="p-3">
            <h2 className={`font-medium text-md leading-snug mb-1 line-clamp-2 h-10 ${isDark ? "text-white" : "text-gray-900"}`}>
              {product.title}
            </h2>

            {priceStr && (
              <p className="text-md font-bold mb-2" style={{ color: brandPrimary }}>
                {priceStr}
              </p>
            )}

            {visibleSwatches.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                {visibleSwatches.map(swatch => (
                  <button
                    key={swatch.value}
                    onClick={e => e.preventDefault()}
                    onMouseEnter={() => handleMouseEnter(swatch)}
                    onMouseLeave={handleMouseLeave}
                    title={swatch.value}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-150 focus:outline-none"
                    style={{
                      background: swatch.hex,
                      outline: activeColor === swatch.value
                        ? `2px solid ${brandPrimary}`
                        : "2px solid transparent",
                      outlineOffset: "1px",
                    }}
                  />
                ))}
                {extraColors > 0 && (
                  <span className={`text-[10px] font-medium ${isDark ? "text-white/50" : "text-gray-400"}`}>
                    +{extraColors}
                  </span>
                )}
              </div>
            )}

            {/* <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3 h-3" fill="none" stroke="#d1d5db" />
              ))}
              <span className={`text-[10px] ml-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                No reviews
              </span>
            </div> */}
          </div>
        </div>
      </Link>
    </div>
  )
}
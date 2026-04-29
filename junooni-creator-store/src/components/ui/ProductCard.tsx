"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

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
  skyblue: "#38bdf8", offwhite: "#fafaf7", "off white": "#fafaf7",
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
    const take = (parts.length === 0 ? (i % 2 === 0 ? 2 : 1) : 2)
    parts.unshift(rest.slice(Math.max(0, i - take), i))
    i -= take
  }
  return `₹${[...parts, last3].join(",")}`
}

function safeParseJson<T>(val: any, fallback: T): T {
  if (!val) return fallback
  if (typeof val !== "string") return val as T
  try { return JSON.parse(val) } catch { return fallback }
}

/**
 * Get the best image URL for a given color value.
 *
 * Data structure (from API response):
 * - variant.metadata.color_images: JSON array of [{color, url}]
 * - variant.metadata.option_images: JSON array of [{option_name, option_value, url}]
 * - variant.metadata.variant_images: JSON array of URLs
 * - variant.images[]: native Medusa variant-image association
 * - product.images[]: all product images, filenames contain color slug
 *   e.g. "mockup-front-beige.png", "mockup-front-skyblue.png"
 *
 * Priority: color_images > option_images > variant.images > filename slug match
 */
function getColorImage(
  product: any,
  colorOptionId: string,
  colorValue: string
): string | null {
  const colorLower = colorValue.toLowerCase().trim()
  const colorSlug  = colorLower.replace(/\s+/g, "_")  // "golden yellow" → "golden_yellow"
  const colorSlug2 = colorLower.replace(/\s+/g, "")   // "golden yellow" → "goldenyellow"

  // Find the variant matching this color
  const variant = product.variants?.find((v: any) =>
    v.options?.some((o: any) => {
      const id = o.option_id ?? o.option?.id ?? o.id
      return id === colorOptionId && o.value === colorValue
    })
  )

  if (variant) {
    const meta = variant.metadata ?? {}

    // 1. metadata.color_images — [{color, url}] — most reliable
    const colorImages = safeParseJson<any[]>(meta.color_images, [])
    const colorMatch = colorImages.find(
      (e: any) => e.color?.toLowerCase().trim() === colorLower
    )
    if (colorMatch?.url) return colorMatch.url

    // 2. metadata.option_images — [{option_name, option_value, url}]
    const optionImages = safeParseJson<any[]>(meta.option_images, [])
    const optionMatch = optionImages.find(
      (e: any) =>
        e.option_value?.toLowerCase().trim() === colorLower &&
        e.option_name?.toLowerCase() === "color"
    )
    if (optionMatch?.url) return optionMatch.url

    // 3. metadata.variant_images — first URL in the array
    const variantImages = safeParseJson<string[]>(meta.variant_images, [])
    if (variantImages.length > 0) return variantImages[0]

    // 4. variant.images[] — native association
    if (Array.isArray(variant.images) && variant.images.length > 0) {
      return variant.images[0]?.url ?? null
    }
  }

  // 5. Match by filename slug in product.images[]
  // Filenames follow pattern: mockup-front-{colorslug}.png
  // e.g. "mockup-front-beige.png", "mockup-front-golden_yellow.png"
  const allImages: any[] = product.images ?? []
  const slugMatch = allImages.find((img: any) => {
    const filename = (img.url ?? "").toLowerCase()
    return (
      filename.includes(`-${colorSlug}.`) ||
      filename.includes(`-${colorSlug}-`) ||
      filename.includes(`-${colorSlug2}.`) ||
      filename.includes(`_${colorSlug}.`)
    )
  })
  if (slugMatch?.url) return slugMatch.url

  return null
}

function getColorSwatches(product: any) {
  const colorOption = product.options?.find(
    (o: any) =>
      o.title?.toLowerCase() === "color" ||
      o.title?.toLowerCase() === "colour"
  )
  if (!colorOption) return []

  // Use metadata.color_hex_values for accurate brand hex colors
  // e.g. [{"name":"SkyBlue","hex":"#87CEEB"},{"name":"Beige","hex":"#ebcd8b"}]
  const hexValues = safeParseJson<{name: string; hex: string}[]>(
    product.metadata?.color_hex_values, []
  )

  const seen = new Set<string>()
  const swatches: { value: string; hex: string; image: string | null }[] = []

  for (const val of colorOption.values ?? []) {
    if (seen.has(val.value)) continue
    seen.add(val.value)

    // Try metadata hex first, then fallback to COLOR_MAP
    const metaHex = hexValues.find(
      (h) => h.name?.toLowerCase() === val.value?.toLowerCase()
    )?.hex
    const hex = metaHex ?? getColorHex(val.value)
    const image = getColorImage(product, colorOption.id, val.value)

    swatches.push({ value: val.value, hex, image })
  }
  return swatches
}

interface Props {
  product: any
  handle: string
  brandPrimary?: string
  variant?: "light" | "dark"
}

export default function ProductCard({
  product,
  handle,
  brandPrimary = "#e65100",
  variant = "light",
}: Props) {
  const isDark = variant === "dark"
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const swatches = getColorSwatches(product)
  const visibleSwatches = swatches.slice(0, 4)
  const extraColors = swatches.length - 4

  const price = product.variants?.[0]?.prices?.[0]?.amount
  const priceStr = price !== undefined ? formatINR(price) : null
  const defaultImage = product.thumbnail ?? null

  const handleMouseEnter = (swatch: { value: string; image: string | null }) => {
    setActiveColor(swatch.value)
    // Only swap image if this color has one — otherwise keep showing thumbnail
    if (swatch.image) setActiveImage(swatch.image)
  }

  const handleMouseLeave = () => {
    setActiveColor(null)
    setActiveImage(null)
  }

  // The image to actually display
  const displayImage = (mounted && activeImage) ? activeImage : defaultImage

  return (
    <div className="relative group">
      <Link href={`/${handle}/products/${product.handle}`}>
        <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-50"} transition-transform duration-200 group-hover:-translate-y-1`}>

          {/* Image */}
          <div className="relative overflow-hidden bg-gray-100 aspect-square">
            {displayImage && (
              <Image
                key={displayImage} // key change forces re-render on image swap
                src={displayImage}
                alt={activeColor ?? product.title}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Color label on hover */}
            {mounted && activeColor && (
              <span
                className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-medium text-white pointer-events-none whitespace-nowrap z-10"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                {activeColor}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h2 className={`font-medium text-md leading-snug mb-1 line-clamp-2 h-10 ${isDark ? "text-white" : "text-gray-900"}`}>
              {product.title}
            </h2>

            {priceStr && (
              <p className="mb-2 font-bold text-md" style={{ color: brandPrimary }}>
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
                    className="w-6 h-6 transition-transform border-2 border-white rounded-full shadow-sm hover:scale-150 focus:outline-none"
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
          </div>
        </div>
      </Link>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/api"
import { addToCart } from "@/lib/cart"
import { useCart } from "@/context/CartContext"
import AddToCartButton from "@/components/cart/AddToCartButton"
import CartIconButton from "@/components/cart/CartIconButton"
import ProductGallery from "../ProductGallery"
import { GalleryProvider , useGallery } from "../GalleryContext"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import SizeChartModal from "@/components/store/SizeChartModal"
import {
  ShoppingCart, Check, Loader2, Minus, Plus,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductDetailSettings {
  element_order?: Array<"title" | "price" | "colors" | "sizes" | "quantity" | "atc" | "description" | "meta">
  title_size?: "sm" | "md" | "lg" | "xl"
  title_weight?: "normal" | "semibold" | "bold" | "extrabold"
  title_color?: string
  price_color?: string
  price_size?: "sm" | "md" | "lg" | "xl"
  colors_label?: string
  show_color_label?: boolean
  color_swatch_size?: "sm" | "md" | "lg"
  sizes_label?: string
  show_size_label?: boolean
  size_style?: "pill" | "box" | "underline"
  atc_label?: string
  atc_style?: "filled" | "outline" | "pill"
  atc_full_width?: boolean
  show_quantity?: boolean
  show_description?: boolean
  description_collapsed?: boolean
  show_secure_badge?: boolean
  secure_badge_text?: string
}

interface Props {
  vendor: any
  initialStore: any
  product: any
  products: any[]
  categories: any[]
  collections: any[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const hexColorMap_fallback: Record<string, string> = {
  "off white": "#f5f0e8", "offwhite": "#f5f0e8", "cream": "#fffdd0",
  "ivory": "#fffff0", "beige": "#f5f5dc", "khaki": "#c3b091",
  "light gray": "#d3d3d3", "light grey": "#d3d3d3", "charcoal": "#36454f",
  "ash": "#b2beb5", "baby pink": "#f4c2c2", "light pink": "#ffb6c1",
  "blush": "#de5d83", "rose": "#ff007f", "coral": "#ff7f50",
  "hot pink": "#ff69b4", "sky blue": "#87ceeb", "baby blue": "#89cff0",
  "royal blue": "#4169e1", "cobalt": "#0047ab", "denim": "#1560bd",
  "midnight blue": "#191970", "mint": "#99dfd4", "mint green": "#98ff98",
  "olive green": "#556b2f", "bottle green": "#006a4e", "army green": "#4b5320",
  "sage green": "#8a9a5b", "wine": "#722f37", "maroon": "#800000",
  "rust": "#b7410e", "mustard": "#ffdb58", "golden yellow": "#ffc30b",
  "lavender": "#e6e6fa", "lilac": "#c8a2c8", "mauve": "#e0b0ff",
  "plum": "#8e4585", "brown": "#964b00", "caramel": "#c68642",
  "tan": "#d2b48c", "nude": "#e3bc9a", "gold": "#ffd700", "silver": "#c0c0c0",
  "multicolor": "linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
  "multi": "linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
  "white": "#ffffff", "black": "#000000", "red": "#ef4444",
  "blue": "#3b82f6", "green": "#22c55e", "yellow": "#eab308",
  "purple": "#a855f7", "pink": "#ec4899", "orange": "#f97316",
  "gray": "#6b7280", "grey": "#6b7280", "navy": "#1e3a5f",
  "teal": "#14b8a6", "cyan": "#06b6d4", "indigo": "#6366f1",
}

function isLightHex(hex: string): boolean {
  if (!hex.startsWith("#") || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 200
}

// REPLACE WITH:
function DescriptionSection({ product, isDark, brandPrimary, vendor }: {
  product: any; isDark: boolean; brandPrimary: string; vendor: any
}) {
  const [openSection, setOpenSection] = useState<string | null>("description")

  const toggle = (id: string) => setOpenSection(o => o === id ? null : id)

  const productDetails: string[] = (() => {
    try {
      const raw = product?.metadata?.product_details
      if (!raw) return []
      return JSON.parse(raw)
    } catch { return [] }
  })()

  const descriptionStory: string = product?.metadata?.description_story ?? ""
  const description: string = product?.description ?? ""

  // REPLACE WITH:
  const border  = isDark ? "border-white/10" : "border-gray-200"
  const subText = isDark ? "text-white/50"  : "text-gray-400"
  const bodyText = isDark ? "text-white/80" : "text-gray-700"
  const headingText = isDark ? "text-white" : "text-gray-900"

  const AccordionRow = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
    const isOpen = openSection === id
    return (
      <div className={`border-b ${border}`}>
        <button
          onClick={() => toggle(id)}
          className={`w-full flex items-center justify-between py-4 text-sm font-semibold text-left transition-colors ${headingText}`}
        >
          <span>{label}</span>
          <span className={`text-xl leading-none transition-transform duration-200 ${subText} ${isOpen ? "rotate-45" : ""}`}>
            +
          </span>
        </button>
        {isOpen && (
          <div className="pb-5">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`pt-8 border-t ${border}`}>
      {/* Story — always visible above accordion */}
      {descriptionStory && (
        <div
          className={`prose prose-sm max-w-none leading-relaxed mb-8 ${isDark ? "prose-invert text-white/70" : "text-gray-600"}`}
          dangerouslySetInnerHTML={{ __html: descriptionStory }}
        />
      )}

      {/* Accordion rows */}
      <AccordionRow id="description" label="Description">
        {description ? (
          <div
            className={`prose prose-sm max-w-none leading-relaxed ${isDark ? "prose-invert text-white/70" : "text-gray-600"}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <p className={`text-sm ${subText}`}>No description available.</p>
        )}
      </AccordionRow>

      <AccordionRow id="details" label="Product Details">
        {productDetails.length > 0 ? (
          <ul className="space-y-2">
            {productDetails.map((detail, i) => (
              <li key={i} className={`flex items-center gap-2.5 text-sm ${bodyText}`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: brandPrimary }} />
                {detail}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${subText}`}>No product details available.</p>
        )}
      </AccordionRow>

      <AccordionRow id="quality" label="Quality & Returns">
        <div className="space-y-3">
          <p className={`text-sm leading-relaxed ${bodyText}`}>
            Quality is guaranteed. If there is a print error or visible quality issue, we'll replace or refund it.
          </p>
          <p className={`text-sm leading-relaxed ${bodyText}`}>
            Because the products are made to order, we do not accept general returns or sizing-related returns.
          </p>
          <a
            href={`/${vendor.handle}/p/returns-refunds`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
            style={{ color: brandPrimary }}
          >
            View Returns & Refunds Policy →
          </a>
        </div>
      </AccordionRow>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProductPageClient({
  vendor, initialStore, product, products, categories, collections,
}: Props) {
  const [store, setStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const { openCart, refreshCart } = useCart()

  // ── Editor bridge ──────────────────────────────────────────────────────────
  useEffect(() => {
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setStore(e.data.store)
        setSelectedSectionId(e.data.selectedId ?? null)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // ── Store-derived values ───────────────────────────────────────────────────
  const brandPrimary   = store?.primary_color   ?? "#e65100"
  const brandSecondary = store?.secondary_color ?? "#ac1900"
  const isDark         = store?.template === "bold"
  const pd: ProductDetailSettings = store?.product_detail ?? {}

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  const bgColor = isDark ? "bg-black text-white" : "bg-white text-gray-900"

  // ── Product detail style helpers ───────────────────────────────────────────
  const titleSizeClass = {
    sm: "text-2xl", md: "text-3xl", lg: "text-4xl", xl: "text-5xl"
  }[pd.title_size ?? "lg"]

  const titleWeightClass = {
    normal: "font-normal", semibold: "font-semibold",
    bold: "font-bold", extrabold: "font-extrabold"
  }[pd.title_weight ?? "bold"]

  const priceSizeClass = {
    sm: "text-xl", md: "text-2xl", lg: "text-3xl", xl: "text-4xl"
  }[pd.price_size ?? "lg"]

  const swatchSizeClass = {
    sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10"
  }[pd.color_swatch_size ?? "md"]

  const elementOrder = pd.element_order ??
    ["title", "price", "colors", "sizes", "quantity", "atc", "description", "meta"]

  // ── Product options ────────────────────────────────────────────────────────
  const productOpts: any[] = product?.options ?? []
  const colorOption = productOpts.find((o: any) =>
    o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "colour"
  )
  const sizeOption = productOpts.find((o: any) => o.title?.toLowerCase() === "size")
  const colorNames: string[] = colorOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []
  const sizeNames:  string[] = sizeOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []

  // ── Color hex resolution ───────────────────────────────────────────────────
  const hexColorMap: Record<string, string> = {}
  try {
    const raw = product?.metadata?.color_hex_values
    if (raw) {
      const parsed: { name: string; hex: string }[] = JSON.parse(raw)
      for (const c of parsed) hexColorMap[c.name.toLowerCase().trim()] = c.hex
    }
  } catch {}

  const resolveHex = (name: string): string | null => {
    const key = name.toLowerCase().trim()
    return hexColorMap[key] ?? hexColorMap_fallback[key] ?? null
  }

  // ── Variant image mapping ──────────────────────────────────────────────────
  const allImages: any[] = product?.images ?? []
  const getImageForColor = (colorName: string): string | null => {
    const slug = colorName.toLowerCase().replace(/\s+/g, "_")
    const front = allImages.find(img =>
      img.url?.toLowerCase().includes(slug) && img.url?.toLowerCase().includes("front")
    )
    if (front) return front.url
    return allImages.find(img => img.url?.toLowerCase().includes(slug))?.url ?? null
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string>(colorNames[0] ?? "")
  const [selectedSize,  setSelectedSize]  = useState<string>(sizeNames[0] ?? "")
  const [quantity,   setQuantity]  = useState(1)
  const [isAdding,   setIsAdding]  = useState(false)
  const [added,      setAdded]     = useState(false)
  const [cartError,  setCartError] = useState<string | null>(null)
  const [descOpen,   setDescOpen]  = useState(!(pd.description_collapsed ?? false))

  // Sync descOpen when settings change
  useEffect(() => {
    setDescOpen(!(pd.description_collapsed ?? false))
  }, [pd.description_collapsed])

  // ── Display image ──────────────────────────────────────────────────────────
  const displayImage = (selectedColor ? getImageForColor(selectedColor) : null)
    ?? product?.thumbnail ?? null

  // ── Variant resolution ─────────────────────────────────────────────────────
  const findVariant = () => {
    if (!product?.variants?.length) return null
    return product.variants.find((v: any) => {
      const opts: any[] = v.options ?? []
      if (opts.length === 0) {
        const title = v.title ?? ""
        return (
          (!selectedColor || title.toLowerCase().includes(selectedColor.toLowerCase())) &&
          (!selectedSize  || title.toLowerCase().includes(selectedSize.toLowerCase()))
        )
      }
      const hasColor = !selectedColor || opts.some((o: any) =>
        (o.value ?? o.option_value ?? "").toLowerCase() === selectedColor.toLowerCase()
      )
      const hasSize = !selectedSize || opts.some((o: any) =>
        (o.value ?? o.option_value ?? "").toLowerCase() === selectedSize.toLowerCase()
      )
      return hasColor && hasSize
    }) ?? product.variants[0]
  }
  const selectedVariant = findVariant()

  // ── Price ──────────────────────────────────────────────────────────────────
  const getPrice = (): string => {
    const v = selectedVariant ?? product?.variants?.[0]
    if (!v) return ""
    if (v.calculated_price?.calculated_amount != null)
      return `₹${Number(v.calculated_price.calculated_amount).toLocaleString("en-IN")}`
    const raw = v.prices?.[0]?.amount
    if (raw != null)
      return `₹${Number(raw).toLocaleString("en-IN")}`
    return ""
  }

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) { setCartError("Please select all options"); return }
    setIsAdding(true); setCartError(null)
    try {
      await addToCart({ handle: vendor.handle, variantId: selectedVariant.id, quantity })
      await refreshCart()
      setAdded(true); openCart()
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      setCartError(e?.message ?? "Failed to add to cart")
    } finally { setIsAdding(false) }
  }

  // ── Page sections (editor-added below product) ─────────────────────────────
  const pageSections: any[] = store?.sections?.page_layouts?.product?.sections ?? []
  const isEditorMode = typeof window !== "undefined" && window.parent !== window

  // ── Initial gallery images ─────────────────────────────────────────────────
  const firstVariant = product.variants?.[0]
  const initialImages: any[] = firstVariant?.images?.length > 0
    ? firstVariant.images
    : (product.images ?? []).slice(0, 4)

    const currentImages = (() => {
  if (!selectedColor) return initialImages

  const colorSlug = selectedColor.toLowerCase().replace(/\s+/g, "_")

  const colorImages = allImages.filter((img: any) =>
    img.url?.toLowerCase().includes(colorSlug)
  )

  if (colorImages.length === 0) return initialImages

  // Sort: front first, then back, then others
  return [...colorImages].sort((a: any, b: any) => {
    const aUrl = a.url?.toLowerCase() ?? ""
    const bUrl = b.url?.toLowerCase() ?? ""
    if (aUrl.includes("front") && !bUrl.includes("front")) return -1
    if (!aUrl.includes("front") && bUrl.includes("front")) return 1
    return 0
  })

})() 

  // ── Render element by key ──────────────────────────────────────────────────
  const renderElement = (el: string) => {
    switch (el) {

      case "title":
        return (
          <h1 key="title"
            className={`${titleSizeClass} ${titleWeightClass} leading-tight`}
            style={{ color: pd.title_color ?? (isDark ? "#ffffff" : "#111827") }}
          >
            {product.title}
          </h1>
        )

      case "price": {
        const price = getPrice()
        if (!price) return null
        return (
          <p key="price" className={`${priceSizeClass} font-semibold`}
            style={{ color: pd.price_color ?? brandPrimary }}>
            {price}
          </p>
        )
      }

      case "colors":
        if (!colorNames.length) return null
        return (
          <div key="colors">
            {(pd.show_color_label ?? true) && (
              <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                {pd.colors_label ?? "Color"}
                {selectedColor && (
                  <span className="ml-2 font-normal normal-case opacity-70">
                    — {selectedColor}
                  </span>
                )}
              </p>
            )}
            <div className="flex items-center gap-2.5 flex-wrap">
              {colorNames.map(name => {
                const hex = resolveHex(name)
                const isGrad = hex?.startsWith("linear-gradient")
                const light = hex && !isGrad ? isLightHex(hex) : false
                const isSelected = selectedColor === name
                return (
                  <button
                    key={name}
                    title={name}
                    onClick={() => setSelectedColor(name)}
                    className={`${swatchSizeClass} rounded-full transition-all shrink-0 hover:scale-110`}
                    style={{
                      ...(isGrad
                        ? { background: hex! }
                        : { backgroundColor: hex ?? "#cccccc" }),
                      boxShadow: isSelected
                        ? `0 0 0 2.5px white, 0 0 0 4.5px ${brandPrimary}`
                        : light
                          ? "0 0 0 1.5px #d1d5db, 0 1px 4px rgba(0,0,0,0.12)"
                          : "0 0 0 2px rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.2)",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                )
              })}
            </div>
          </div>
        )

      case "sizes":
        if (!sizeNames.length) return null
        return (
          <div key="sizes">
            {(pd.show_size_label ?? true) && (
              <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                {pd.sizes_label ?? "Size"}
                {selectedSize && (
                  <span className="ml-2 font-normal normal-case opacity-70">
                    — {selectedSize}
                  </span>
                )}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {sizeNames.map(size => {
                const isSelected = selectedSize === size
                const style = pd.size_style ?? "pill"
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`transition-all text-sm font-semibold ${
                      style === "box"
                        ? "px-3 py-1.5 rounded-lg border-2"
                        : style === "underline"
                          ? "px-2 py-1 border-b-2 bg-transparent rounded-none"
                          : "px-4 py-1.5 rounded-full border-2"
                    }`}
                    style={{
                      borderColor: isSelected ? brandPrimary : `${brandPrimary}30`,
                      backgroundColor:
                        isSelected && style !== "underline" ? brandPrimary : "transparent",
                      color:
                        isSelected && style !== "underline"
                          ? "#ffffff"
                          : (isDark ? "#ffffff" : "#374151"),
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>

            {product.size_chart && (
              <div className="mt-2">
                <SizeChartModal
                  sizeChart={product.size_chart}
                  brandPrimary={brandPrimary}
                  isDark={isDark}
                />
              </div>
            )}

          </div>
        )

      case "quantity":
        if (!(pd.show_quantity ?? true)) return null
        return (
          <div key="quantity"
            className="flex items-center overflow-hidden border-2 border-gray-200 rounded-full w-fit">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex items-center justify-center w-10 h-12 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-sm font-semibold text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="flex items-center justify-center w-10 h-12 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )

      case "atc": {
        const style = pd.atc_style ?? "pill"
        const fullWidth = pd.atc_full_width ?? true
        return (
          <div key="atc">
            {cartError && (
              <p className="px-3 py-2 mb-2 text-sm text-red-500 border border-red-100 rounded-lg bg-red-50">
                {cartError}
              </p>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex items-center justify-center gap-2.5 py-3.5 font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-70 ${
                fullWidth ? "w-full" : "px-8"
              } ${
                style === "filled"   ? "rounded-xl" :
                style === "outline"  ? "rounded-full border-2 bg-transparent" :
                                       "rounded-full"
              }`}
              style={{
                background: added
                  ? "#16a34a"
                  : style === "outline"
                    ? "transparent"
                    : `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)`,
                borderColor: style === "outline" ? brandPrimary : undefined,
                color: style === "outline" && !added ? brandPrimary : "#ffffff",
              }}
            >
              {isAdding ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
              ) : added ? (
                <><Check className="w-4 h-4" />Added to cart!</>
              ) : (
                <><ShoppingCart className="w-4 h-4" />{pd.atc_label ?? "Add to Cart"}</>
              )}
            </button>
          </div>
        )
      }

      // REPLACE WITH:
      case "description":
        if (!(pd.show_description ?? true)) return null
        return <DescriptionSection key="description" product={product} isDark={isDark} brandPrimary={brandPrimary} vendor={vendor} />

      case "meta":
        if (!(pd.show_secure_badge ?? true)) return null
        return (
          <p key="meta"
            className={`text-xs text-center ${isDark ? "text-white/30" : "text-gray-400"}`}>
            {pd.secure_badge_text ?? "Secure checkout via Junooni · Powered by Razorpay"}
          </p>
        )

      default: return null
    }
  }

  // ── Section renderer (editor-added sections below product) ─────────────────
  const renderPageSection = (section: any) => {
    const sectionBg   = section.background_color ?? undefined
    const sectionText = section.text_color ?? undefined
    const isSelected  = selectedSectionId === section.id

    return (
      <div
        key={section.id}
        data-section-id={section.id}
        onClick={() => {
          if (isEditorMode && section.id) {
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: section.id }, "*")
          }
        }}
        className={`relative transition-all ${isEditorMode ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: sectionBg,
          ...(isSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}),
        }}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
            style={{ background: "#e65100", borderBottomRightRadius: "6px" }}>
            Editing
          </div>
        )}

        {/* Featured / upsell */}
        {section.type === "featured" && (
          <div className="px-4 py-12 z-0 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div className="mx-auto max-w-7xl">
              {section.title && (
                <h2 className="mb-6 text-2xl font-bold"
                  style={{ color: sectionText ?? (isDark ? "#fff" : "#111827") }}>
                  {section.title}
                </h2>
              )}
              <div className={`grid gap-6 ${
                section.columns === 2 ? "grid-cols-2" :
                section.columns === 4 ? "grid-cols-2 md:grid-cols-4" :
                "grid-cols-2 md:grid-cols-3"
              }`}>
                {(section.product_ids?.length
                  ? products.filter((p: any) => section.product_ids.includes(p.id))
                  : products
                      .filter((p: any) => p.handle !== product.handle)
                      .slice(0, section.limit ?? 4)
                ).map((p: any) => (
                  <Link key={p.id}
                    href={`/${vendor.handle}/products/${p.handle}`}
                    className="group">
                    <div className={`aspect-square relative rounded-xl overflow-hidden mb-3 ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}>
                      {p.thumbnail && (
                        <Image src={p.thumbnail} alt={p.title} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {p.title}
                    </p>
                    {p.variants?.[0]?.prices?.[0]?.amount && (
                      <p className="text-sm" style={{ color: brandPrimary }}>
                        {formatPrice(p.variants[0].prices[0].amount)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image with Text */}
        {section.type === "image_text" && (
          <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div className="max-w-6xl mx-auto">
              <div className={`flex gap-10 items-center ${
                (section.mobile_image_position ?? "top") === "top" ? "flex-col" : "flex-col-reverse"
              } ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="w-full md:w-1/2 shrink-0">
                  {section.image ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
                      <Image src={section.image} alt={section.title ?? "Image"} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-2xl bg-gray-100 aspect-[4/3]">
                      <span className="text-5xl opacity-20">🖼️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {section.title && (
                    <h2 className="mb-4 text-3xl font-bold leading-tight"
                      style={{ color: sectionText ?? (isDark ? "#fff" : "#111827") }}
                      dangerouslySetInnerHTML={{ __html: section.title }} />
                  )}
                  {section.text && (
                    <div className="mb-6 text-base leading-relaxed prose-sm prose max-w-none"
                      style={{ color: sectionText ? `${sectionText}cc` : (isDark ? "#d1d5db" : "#4b5563") }}
                      dangerouslySetInnerHTML={{ __html: section.text }} />
                  )}
                  {section.cta_label && (
                    <Link href={section.cta_url ?? "#"}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
                      {section.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video with Text */}
        {section.type === "video_text" && (() => {
          const videoUrl = section.video_text_url ?? ""
          const getEmbed = (url: string) => {
            const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
            if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
            const vm = url.match(/vimeo\.com\/(\d+)/)
            if (vm) return `https://player.vimeo.com/video/${vm[1]}`
            return null
          }
          const embedUrl = videoUrl ? getEmbed(videoUrl) : null
          return (
            <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg }}>
              <div className="max-w-6xl mx-auto">
                <div className={`flex gap-10 items-center ${
                  (section.mobile_image_position ?? "top") === "top" ? "flex-col" : "flex-col-reverse"
                } ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="w-full md:w-1/2 shrink-0">
                    {embedUrl ? (
                      <div className="relative w-full overflow-hidden shadow-xl rounded-2xl"
                        style={{ paddingBottom: "56.25%" }}>
                        <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen style={{ border: 0 }} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-gray-100 rounded-2xl aspect-video">
                        <span className="text-5xl opacity-20">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {section.title && (
                      <h2 className="mb-4 text-3xl font-bold leading-tight"
                        style={{ color: sectionText ?? (isDark ? "#fff" : "#111827") }}
                        dangerouslySetInnerHTML={{ __html: section.title }} />
                    )}
                    {section.text && (
                      <div className="mb-6 text-base leading-relaxed prose-sm prose max-w-none"
                        style={{ color: sectionText ? `${sectionText}cc` : (isDark ? "#d1d5db" : "#4b5563") }}
                        dangerouslySetInnerHTML={{ __html: section.text }} />
                    )}
                    {section.cta_label && (
                      <Link href={section.cta_url ?? "#"}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
                        {section.cta_label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Text */}
        {section.type === "text" && section.text && (
          <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div className="max-w-3xl mx-auto prose prose-lg"
              style={{ color: sectionText ?? (isDark ? "#d1d5db" : "#374151") }}
              dangerouslySetInnerHTML={{ __html: section.text }} />
          </div>
        )}

        {/* Image */}
        {section.type === "image" && section.image && (
          <div className="w-full" style={{ backgroundColor: sectionBg }}>
            <img src={section.image} alt={section.title ?? "Image"}
              className="w-full object-cover max-h-[600px]" />
          </div>
        )}

        {/* Video */}
        {section.type === "video" && (() => {
          const raw = section.video_url ?? ""
          const yt = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
          const vm = raw.match(/vimeo\.com\/(\d+)/)
          const embedUrl = yt
            ? `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
            : vm ? `https://player.vimeo.com/video/${vm[1]}` : null
          if (!embedUrl) return null
          return (
            <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg }}>
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="mb-6 text-2xl font-bold text-center"
                    style={{ color: sectionText ?? (isDark ? "#fff" : "#111827") }}>
                    {section.title}
                  </h2>
                )}
                <div className="relative w-full overflow-hidden shadow-xl rounded-2xl"
                  style={{ paddingBottom: "56.25%" }}>
                  <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ border: 0 }} />
                </div>
              </div>
            </div>
          )
        })()}

        {/* Ticker */}
        {section.type === "ticker" && (() => {
          const items: string[] = section.ticker_items ?? ["Official creator merchandise"]
          const sep = section.ticker_separator ?? "✦"
          const speed = section.ticker_speed ?? 40
          const bg = sectionBg ?? section.background_color ?? "#111827"
          const fg = sectionText ?? section.text_color ?? "#ffffff"
          const line = items.join(`  ${sep}  `)
          const duration = Math.round(200 - speed * 1.5)
          return (
            <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
              <style>{`
                @keyframes prod-ticker {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .prod-ticker-inner {
                  display: inline-flex;
                  white-space: nowrap;
                  animation: prod-ticker ${duration}s linear infinite;
                }
              `}</style>
              <div className="text-sm font-medium tracking-wide prod-ticker-inner" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Divider */}
        {section.type === "divider" && <hr className="my-6 border-gray-100" />}

        {/* Custom HTML */}
        {section.type === "html" && section.html_content && (
          <div className="w-full" style={{ backgroundColor: sectionBg }}>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:system-ui,sans-serif}</style></head><body>${section.html_content}</body></html>`}
              className="w-full border-0"
              style={{ minHeight: "200px" }}
              sandbox="allow-scripts allow-same-origin"
              onLoad={e => {
                try {
                  const doc = (e.currentTarget as HTMLIFrameElement).contentDocument
                  if (doc?.body)
                    (e.currentTarget as HTMLIFrameElement).style.height =
                      doc.body.scrollHeight + 32 + "px"
                } catch {}
              }}
            />
          </div>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={brandStyles} className={`min-h-screen ${bgColor}`}>

      {/* Header — live store so nav/colors update instantly */}
      <StoreHeader
        vendor={vendor}
        store={store}
        categories={categories}
        collections={collections}
        products={products}
      />

      {/* Product detail */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <GalleryProvider initialImages={currentImages} key={selectedColor}>
          <div className="grid items-start gap-16 mb-6 md:grid-cols-2">

            {/* Left: Gallery — updates on color select */}
            <ProductGallery
              initialImages={initialImages}
              fallbackThumbnail={displayImage ?? product.thumbnail}
              productTitle={product.title}
              isDark={isDark}
            />

            {/* Right: Dynamic element order */}
            <div className="sticky space-y-5 top-24">
              <p className="mb-1 text-xs font-medium tracking-widest uppercase"
                style={{ color: brandPrimary }}>
                {vendor.name}
              </p>
              {elementOrder.map(el => renderElement(el))}
            </div>

          </div>
        </GalleryProvider>

        {/* Editor-added sections below product */}
        {pageSections.filter(s => !s.hidden).map(renderPageSection)}

        {/* Default related products — only shown when no editor sections exist */}
        {pageSections.length === 0 && products.length > 1 && (
          <div className={`mt-24 pt-12 z-0 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
            <h2 className={`text-sm uppercase tracking-widest font-semibold mb-8 ${
              isDark ? "text-white/60" : "text-gray-500"
            }`}>
              More from {vendor.name}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products
                .filter((p: any) => p.handle !== product.handle)
                .slice(0, 4)
                .map((p: any) => (
                  <Link key={p.id}
                    href={`/${vendor.handle}/products/${p.handle}`}
                    className="group">
                    <div className={`aspect-square relative rounded-xl overflow-hidden mb-3 ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}>
                      {p.thumbnail && (
                        <Image src={p.thumbnail} alt={p.title} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {p.title}
                    </p>
                    {p.variants?.[0]?.prices?.[0]?.amount && (
                      <p className="text-sm" style={{ color: brandPrimary }}>
                        {formatPrice(p.variants[0].prices[0].amount)}
                      </p>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      <StoreFooter
        vendor={vendor}
        store={store}
        categories={categories}
        collections={collections}
      />
    </div>
  )
}
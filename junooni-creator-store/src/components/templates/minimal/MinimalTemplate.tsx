"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, ShoppingCart, Instagram, Youtube, Twitter, Facebook, ArrowRight, ChevronRight, Loader2, Check, Minus, Plus } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { useCart } from "@/context/CartContext"
import type { PublicVendor, VendorStore, Product, StoreSection, CategoryMeta, CollectionMeta } from "@/lib/types"
import ProductCarousel from "@/components/ui/ProductCarousel"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import minimaltee from "../../../../public/minimaltee.jpeg"
import minimalhoodie from "../../../../public/minimalhoodie.jpeg"
import minimalcap from "../../../../public/minimalcap.jpeg"
import minimalmug from "../../../../public/minimalmug.jpeg"
import minimalcollectionsummer from "../../../../public/minimal-collection-summer.jpeg"
import minimalcollectionfavourites from "../../../../public/minimal-collection-favourites.jpeg"
import minimalcollectionlimited from "../../../../public/minimal-collection-limited.jpeg"
import minimalcollectionaccessories from "../../../../public/minimal-collection-accessories.jpeg"
import minimaltemplatebanner from "../../../../public/minimal-template-banner.jpeg"

// NEW
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "junooni.com"

function resolveUrl(url: string | undefined | null, handle: string, bare = false): string {
  if (!url) return "#"
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:")) return url
  if (url.startsWith("#")) return url
  if (bare) return url.startsWith("/") ? url : `/${url}`
  if (url.startsWith(`/${handle}/`) || url === `/${handle}`) return url
  return `/${handle}${url.startsWith("/") ? url : `/${url}`}`
}

interface Props {
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
}

// ADD right before: export default function MinimalTemplate(
function TickerStrip({ section }: { section: any }) {
  const items: string[] = section.ticker_items ?? ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"]
  const sep = section.ticker_separator ?? "✦"
  const speed = section.ticker_speed ?? 40
  const bg = section.background_color ?? "#111827"
  const fg = section.text_color ?? "#ffffff"
  // const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").trim()
  // const cleanItems = items.map(stripHtml)
  // const line = cleanItems.join(`  ${sep}  `)
  const line = items.join(`  ${sep}  `)
  const repeated = Array(8).fill(line).join(`  ${sep}  `)
  const fullLine = `${repeated}  ${sep}  `
  const duration = Math.max(5, 100 - speed)
  return (
    <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes junooni-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .junooni-ticker-inner {
          display: inline-flex;
          white-space: nowrap;
          animation: junooni-ticker ${duration}s linear infinite;
        }
      `}</style>
      <div className="text-sm font-medium tracking-wide junooni-ticker-inner" style={{ color: fg }}>
        <span>{fullLine}</span>
        <span>{fullLine}</span>
      </div>
    </div>
  )
}

function AnnouncementStrip({ section }: { section: any }) {
  const bg = section.background_color ?? "#e65100"
  const fg = section.text_color ?? "#ffffff"
  if (!section.title) return null
  return (
    <div className="w-full px-4 py-2 text-sm font-medium text-center"
      style={{ backgroundColor: bg, color: fg }}
      dangerouslySetInnerHTML={{ __html: section.title }} />
  )
}

const FAKE_PRODUCTS = [
  { id: "fake_1", title: "Classic Creator Tee", price: "₹699", image: minimaltee },
  { id: "fake_2", title: "Limited Drop Hoodie", price: "₹1,299", image: minimalhoodie },
  { id: "fake_3", title: "Signature Cap", price: "₹499", image: minimalcap },
  { id: "fake_4", title: "Fan Favourite Mug", price: "₹399", image: minimalmug },
]

function PlaceholderProductGrid({ columns = 3, brandPrimary }: { columns?: number; brandPrimary: string }) {
  const gridClass =
    columns === 2 ? "grid-cols-2" :
    columns === 4 ? "grid-cols-2 md:grid-cols-4" :
    "grid-cols-2 md:grid-cols-3"

  const items = FAKE_PRODUCTS.slice(0, columns)

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {items.map((p) => (
        <div key={p.id} className="space-y-3 cursor-default select-none">
          <div className="overflow-hidden bg-gray-100 aspect-square rounded-2xl">
            <img
              src={typeof p.image === "string" ? p.image : (p.image as any).src}
              alt={p.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{p.title}</p>
            <p className="text-sm font-semibold" style={{ color: brandPrimary }}>{p.price}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlaceholderCollectionGrid({ columns = 3, brandPrimary }: { columns?: number; brandPrimary: string }) {
  const gridClass = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
  const FAKE_COLLECTIONS = [
    { id: "fc_1", title: "Summer Drops", image: minimalcollectionsummer },
    { id: "fc_2", title: "Fan Favourites", image: minimalcollectionfavourites },
    { id: "fc_3", title: "Limited Edition", image: minimalcollectionlimited },
    { id: "fc_4", title: "Accessories", image: minimalcollectionaccessories },
  ].slice(0, columns)

  return (
    <div className={`grid ${gridClass} gap-5`}>
      {FAKE_COLLECTIONS.map(col => (
        <div key={col.id} className="relative overflow-hidden rounded-2xl aspect-[4/3] cursor-default select-none">
          <img
            src={typeof col.image === "string" ? col.image : (col.image as any).src}
            alt={col.title}
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-lg font-bold text-white">{col.title}</p>
            <p className="text-white/70 text-sm mt-0.5">0 products</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlaceholderFeaturedProduct({ brandPrimary, sectionBg, sectionText, imageLeft = true }: {
  brandPrimary: string; sectionBg?: string; sectionText?: string; imageLeft?: boolean
}) {
  return (
    <div className={`flex flex-col gap-12 items-start ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      <div className="w-full md:w-[48%] shrink-0">
        <div className="overflow-hidden cursor-default select-none aspect-square rounded-3xl">
          <img
            src={minimaltee.src}
            alt="Product"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <div className="flex-1 space-y-5 md:pt-2">
        {/* <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>
          Fan Favourite
        </p> */}
        <h2 className="text-3xl font-bold" style={{ color: sectionText ?? "#111827" }}>
          Classic Creator Tee
        </h2>
        <p className="text-base leading-relaxed" style={{ color: sectionText ? `${sectionText}bb` : "#4b5563" }}>
          Your product description will appear here. Tell your fans what makes this drop special.
        </p>
        <p className="text-2xl font-bold" style={{ color: brandPrimary }}>₹699</p>
        <div className="flex flex-wrap items-center gap-2">
          {["S", "M", "L", "XL"].map(s => (
            <span key={s} className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 cursor-default select-none"
              style={{ borderColor: `${brandPrimary}30`, color: sectionText ?? "#374151" }}>
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center overflow-hidden border-2 rounded-full shrink-0"
            style={{ borderColor: "#e5e7eb" }}>
            <span className="flex items-center justify-center w-10 h-12 text-gray-400">−</span>
            <span className="w-8 text-sm font-semibold text-center text-gray-900">1</span>
            <span className="flex items-center justify-center w-10 h-12 text-gray-400">+</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-sm cursor-default select-none"
            style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}>
            🛒 Add to Cart
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MinimalTemplate({ vendor, store: initialStore, products, categories, collections }: Props) {
  const [liveStore, setLiveStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [bare, setBare] = useState(false)

  // useEffect(() => {
  //   setIsEditorMode(window.parent !== window)
  // }, [])

  // NEW
  useEffect(() => {
    setIsEditorMode(window.parent !== window)
    const hostname = window.location.hostname.replace(/:.*$/, "").toLowerCase()
    const isMarketplace = hostname === ROOT_DOMAIN || hostname === "localhost" || hostname === "junooni.com"
    setBare(!isMarketplace)
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setLiveStore(e.data.store)
        setSelectedSectionId(e.data.selectedId ?? null)
      }
    }
    window.addEventListener("message", handler)
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")
    return () => window.removeEventListener("message", handler)
  }, [])

  const store = liveStore ?? initialStore
  const sections = store?.sections?.sections ?? defaultSections(vendor)
  const brandPrimary = store?.primary_color ?? "#e65100"
  const fontClass =
    store?.font === "poppins"       ? "font-poppins" :
    store?.font === "playfair"      ? "font-playfair" :
    store?.font === "dm-sans"       ? "font-dm-sans" :
    store?.font === "space-grotesk" ? "font-space-grotesk" :
    store?.font === "nunito"     ? "font-nunito" :
    store?.font === "raleway"    ? "font-raleway" :
    store?.font === "montserrat" ? "font-montserrat" :
    "font-inter"
  const handle = vendor?.handle ?? ""
  const productCard = (store as any)?.product_card ?? {}
  const cardAspectRatio = productCard.aspect_ratio ?? "square"
  const cardAlignment   = productCard.alignment ?? "left"
  const cardShowPrice   = productCard.show_price !== false
  const cardShowHover   = productCard.show_hover !== false
  const cardShowSoldOut = productCard.show_sold_out_badge !== false

  // console.log("store.sticky_header =", (store as any)?.sticky_header)
  // console.log("wrapSticky =", (store as any)?.sticky_header !== false)

   // Header-zone sections — announcement + ticker
  const headerZoneSectionIds = new Set(
    sections
      .filter((s: any) => s.type === "announcement" || s.type === "ticker")
      .map((s: any) => s.id)
  )
  // All tickers/announcements are handled by StoreHeader (above or below nav)
  // so filter them all out from the body sections map

  return (
    <div className={`min-h-screen bg-white ${fontClass}`}>
       <style>{`
        .rte-content a { text-decoration: underline; text-decoration-color: currentColor; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; }
      `}</style>
      
      {/* ── HEADER (handles announcements + tickers internally) ── */}
      <StoreHeader
        vendor={vendor}
        store={store}
        categories={categories}
        collections={collections}
        products={products}
      />

      {/* ── PAGE SECTIONS ── */}
       {sections.filter(s => !(s as any).hidden && !headerZoneSectionIds.has((s as any).id)).map((section) => {
        const secId = (section as any).id
        const isSelected = secId && selectedSectionId === secId
        // const [isEditorMode, setIsEditorMode] = useState(false)
        // useEffect(() => {
        //   setIsEditorMode(window.parent !== window)
        // }, [])
        const secBg   = (section as any).background_color
        const secText = (section as any).text_color
        return (
          <div
            key={secId}
            data-section-id={secId}
            onClick={() => isEditorMode && secId && window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: secId }, "*")}
            onDoubleClick={() => isEditorMode && secId && window.parent?.postMessage({ type: "SECTION_DBLCLICK", sectionId: secId }, "*")}
            className={`relative transition-all ${isEditorMode && secId ? "cursor-pointer" : ""}`}
            style={isSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}}
          >
            {isSelected && (
              <div className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
                style={{ background: "#e65100", borderBottomRightRadius: "6px" }}>
                Editing
              </div>
            )}
            <MinimalSection
              section={section}
              vendor={vendor}
              store={store}
              products={products}
              categories={categories}
              collections={collections}
              brandPrimary={brandPrimary}
              sectionBg={secBg}
              sectionText={secText}
              cardAspectRatio={cardAspectRatio}
              cardAlignment={cardAlignment}
              cardShowPrice={cardShowPrice}
              cardShowHover={cardShowHover}
              cardShowSoldOut={cardShowSoldOut}
              bare={bare}
              isEditorMode={isEditorMode}
            />
          </div>
        )
      })}

      {/* ── FOOTER ── */}
      <StoreFooter vendor={vendor} store={store} categories={categories} collections={collections} />
    </div>
  )
}

// ── Section renderer ──────────────────────────────────────────────────────────

function MinimalSection({ section, vendor, store, products, categories, collections, brandPrimary, sectionBg, sectionText, cardAspectRatio, cardAlignment, cardShowPrice, cardShowHover, cardShowSoldOut, bare, isEditorMode }: {
  section: StoreSection
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
  brandPrimary: string
  sectionBg?: string
  sectionText?: string
  cardAspectRatio: string
  cardAlignment: string
  cardShowPrice: boolean
  cardShowHover: boolean
  cardShowSoldOut: boolean
  bare: boolean
  isEditorMode: boolean
}) {
  const handle = vendor?.handle ?? ""
  if ((section as any).hidden) return null

  switch (section.type) {
    case "announcement": {
      const bg = (section as any).background_color ?? "#e65100"
      const fg = (section as any).text_color ?? "#ffffff"
      if (!(section as any).title) return null
      return (
        <div className="w-full px-4 py-2 text-sm font-medium text-center"
          style={{ backgroundColor: bg, color: fg }}
          dangerouslySetInnerHTML={{ __html: (section as any).title }} />
      )
    }

    // ── Hero ───────────────────────────────────────────────────────────────────
    case "hero": {
      // overlay_color/overlay_text_color = hero-specific (image tint + text)
      // sectionBg/sectionText = section-level bg/text override (independent)
      const overlayColor     = (section as any).overlay_color === "none"
        ? undefined
        : (section as any).overlay_color as string | undefined
      const overlayTextColor = (section as any).overlay_text_color as string | undefined

      const headlineColor = overlayTextColor ?? sectionText ?? "#111827"
      const subtextColor  = overlayTextColor
        ? `${overlayTextColor}99`
        : sectionText
          ? `${sectionText}99`
          : "#6b7280"

      // Secondary CTA — always read from section data, never hardcode
      const secCtaLabel = (section as any).cta_secondary_label as string | undefined
      const secCtaUrl   = (section as any).cta_secondary_url   as string | undefined

      const heroPaddingY = (section as any).hero_padding_y ?? 64
      const heroMinHeight = heroPaddingY * 2 + 80
      return (
        <section
          className="relative overflow-hidden border-b border-gray-100"
          style={{
            backgroundColor: sectionBg ?? "#f9fafb",
            minHeight: `${heroMinHeight}px`,
          }}
        >
                    {/* Background image — desktop + optional mobile override */}
          {(section.background_image ?? store?.hero_image) && (
            <div
              className="absolute inset-x-0 top-0"
              style={{ height: `max(100%, ${heroMinHeight}px)`, minHeight: `${heroMinHeight}px` }}
            >
              {/* Mobile image — shown only on small screens when set */}
              {(section as any).background_image_mobile && (
                <Image
                  src={(section as any).background_image_mobile}
                  alt="Hero mobile"
                  fill
                  sizes="100vw"
                  className="object-cover object-top md:hidden"
                  style={{ opacity: overlayColor ? 1 : 0.15 }}
                />
              )}
              {/* Desktop image — hidden on mobile when mobile image is set */}
              <Image
                src={section.background_image ?? store!.hero_image!}
                alt="Hero"
                fill
                sizes="100vw"
                className={`object-cover object-top ${
                  (section as any).background_image_mobile ? "hidden md:block" : ""
                }`}
                style={{ opacity: overlayColor ? 1 : 0.15 }}
              />
              {overlayColor && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: overlayColor,
                    opacity: ((section as any).overlay_opacity ?? 55) / 100,
                  }}
                />
              )}
            </div>
          )}

          <div className="relative z-10 px-6 mx-auto max-w-7xl"
            style={{
              paddingTop:    `${heroPaddingY}px`,
              paddingBottom: `${heroPaddingY}px`,
            }}>
            <div className={`flex flex-col gap-12 ${
              (section as any).hide_right_image
                ? (section as any).text_alignment === "center" ? "items-center text-center"
                : (section as any).text_alignment === "right"  ? "items-end text-right"
                : "items-start text-left"
                : "items-center md:flex-row"
            }`}>
              {/* Text side */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Creator badge */}
                {((section as any).hero_badge ?? "Official Merch Store") && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                    style={{ background: `${brandPrimary}15`, color: headlineColor }}>
                    {/* <ShoppingBag className="w-3.5 h-3.5" /> */}
                    {(section as any).hero_badge ?? "Official Merch Store"}
                  </div>
                )}

                <h1
                  className={`mb-4 font-extrabold leading-tight ${
                    (section as any).headline_size === "sm"
                      ? "text-2xl md:text-4xl"
                      : (section as any).headline_size === "md"
                        ? "text-3xl md:text-5xl"
                        : "text-4xl md:text-6xl"
                  }`}
                  style={{ color: headlineColor, whiteSpace: "pre-wrap" }}
                >
                  {section.headline}
                </h1>

                {(section.subtext || store?.tagline || "Your tagline goes here") && (
                  <p className={`max-w-md mb-8 text-lg leading-relaxed ${
                    (section as any).hide_right_image
                      ? (section as any).text_alignment === "center" ? "mx-auto"
                      : (section as any).text_alignment === "right"  ? "ml-auto"
                      : ""
                      : ""
                  }`} style={{ color: subtextColor }}>
                    {section.subtext || store?.tagline }
                  </p>
                )}

               <div className={`flex flex-wrap gap-3 ${
                  (section as any).hide_right_image
                    ? (section as any).text_alignment === "center" ? "justify-center"
                    : (section as any).text_alignment === "right"  ? "justify-end"
                    : "justify-start"
                    : "justify-start"
                }`}>
                  {/* Primary CTA */}
                  {section.cta_label && (
                    <Link
                      href={resolveUrl(section.cta_url ?? "/products", handle, bare)}
                      className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                      style={{
                        background: (section as any).cta_bg_color
                          ? (section as any).cta_bg_color
                          : store?.secondary_color && store.secondary_color !== "#ffffff" && store.secondary_color !== "#000000"
                            ? `linear-gradient(135deg, ${brandPrimary} 0%, ${store.secondary_color} 100%)`
                            : `linear-gradient(135deg, ${brandPrimary} 0%, ${brandPrimary}cc 100%)`,
                        color: (section as any).cta_text_color ?? "#ffffff",
                        borderRadius: `${(section as any).cta_border_radius ?? 50}px`,
                        border: (section as any).cta_border_color
                          ? `2px solid ${(section as any).cta_border_color}`
                          : "2px solid transparent",
                      }}
                    >
                      {section.cta_label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {secCtaLabel && (
                    <Link
                      href={resolveUrl(secCtaUrl ?? "/products", handle, bare)}
                      className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold transition-all hover:opacity-90"
                      style={{
                        color: (section as any).sec_cta_text_color ?? headlineColor,
                        background: (section as any).sec_cta_bg_color ?? "transparent",
                        borderRadius: `${(section as any).sec_cta_border_radius ?? 50}px`,
                        border: (section as any).sec_cta_border_color
                          ? `2px solid ${(section as any).sec_cta_border_color}`
                          : overlayTextColor
                            ? `2px solid ${overlayTextColor}50`
                            : sectionText
                              ? `2px solid ${sectionText}40`
                              : "2px solid #e5e7eb",
                      }}
                    >
                      {secCtaLabel}
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Creator image/logo side */}
             {/* Creator image/logo side — hidden when hide_right_image is true */}
              {!(section as any).hide_right_image && ((section as any).hero_image_right ?? minimaltemplatebanner) && (
                <motion.div
                  className="w-full shrink-0 md:w-80 lg:w-96"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <div className="relative overflow-hidden shadow-2xl aspect-square rounded-3xl">
                    <Image
                      src={(section as any).hero_image_right ?? "/minimal-template-banner.png"}
                      alt={vendor.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )
    }

    // ── Featured products ──────────────────────────────────────────────────────
    case "featured": {
      const featured = section.product_ids?.length
        ? products.filter(p => section.product_ids!.includes(p.id))
        : products.slice(0, 6)
      
      if (!featured.length && !isEditorMode) return null  // ← change
      
      return (
        <section id="products" className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: sectionText ?? "#111827" }}>{section.title ?? "Featured"}</h2>
                <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>Hand-picked for you</p>
              </div>
            </div>
            {featured.length === 0 ? (
              <PlaceholderProductGrid columns={(section as any).columns ?? 4} brandPrimary={brandPrimary} />
            ) : (
              <ProductCarousel products={featured} handle={handle} brandPrimary={brandPrimary} variant="light"
                aspectRatio={cardAspectRatio} alignment={cardAlignment} showPrice={cardShowPrice}
                showHover={cardShowHover} showSoldOutBadge={cardShowSoldOut} columns={(section as any).columns ?? 4} />
            )}
          </div>
        </section>
      )
    }

    // ── All products collection ────────────────────────────────────────────────
    case "collection": {
      const limited = products.slice(0, section.limit ?? 12)
      
      if (!limited.length && !isEditorMode) return null  // ← change

      return (
                <section id="products" className="px-4 sm:px-6" style={{
          backgroundColor: sectionBg ?? "#f9fafb",
          paddingTop: `${(section as any).padding_top ?? 64}px`,
          paddingBottom: `${(section as any).padding_bottom ?? 64}px`,
        }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 style={{
                  color: sectionText ?? "#111827",
                  fontSize: (section as any).title_size === "sm" ? "1.25rem" : (section as any).title_size === "md" ? "1.5rem" : "1.875rem",
                  fontWeight: (section as any).title_weight === "black" ? 900 : (section as any).title_weight === "normal" ? 400 : 700,
                  lineHeight: 1.2,
                }}>
                  {section.title ?? "All Products"}
                </h2>
                {(section as any).subtitle && (
                  <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}99` : "#6b7280" }}>
                    {(section as any).subtitle}
                  </p>
                )}
                {section.show_product_count !== false && (
                  <p className="mt-1 text-xs" style={{ color: sectionText ? `${sectionText}60` : "#9ca3af" }}>
                    {limited.length > 0 ? `${products.length} products available` : "No products yet"}
                  </p>
                )}
              </div>
              {(section as any).view_all_url && (
                <Link href={resolveUrl((section as any).view_all_url, handle, bare)}
                  className="flex items-center gap-1 text-sm font-semibold shrink-0 ml-4 transition-opacity hover:opacity-70"
                  style={{ color: brandPrimary }}>
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            {limited.length === 0 ? (
              <PlaceholderProductGrid columns={(section as any).columns ?? 3} brandPrimary={brandPrimary} />
            ) : (
              <ProductCarousel products={limited} handle={handle} brandPrimary={brandPrimary} variant="light"
                aspectRatio={cardAspectRatio} alignment={cardAlignment} showPrice={cardShowPrice}
                showHover={cardShowHover} showSoldOutBadge={cardShowSoldOut} columns={(section as any).columns ?? 3}
                cardBorderRadius={(section as any).card_border_radius}
                cardBgColor={(section as any).card_bg_color} />
            )}
          </div>
        </section>
      )
    }

    // ── Collections showcase ───────────────────────────────────────────────────
    case "featured_collections": {
      const selectedIds: string[] = (section as any).collection_ids ?? []
      const toShow = selectedIds.length
        ? collections.filter(c => selectedIds.includes(c.id) || selectedIds.includes(c.handle))
        : collections

      if (!toShow.length && !isEditorMode) return null

      const cols = (section as any).columns ?? 3
      const gridClass = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"

      const colAspect  = (section as any).card_aspect_ratio ?? "4/3"
      const colRadius  = (section as any).card_border_radius ?? 16
      const labelPos   = (section as any).label_position ?? "over"
      const labelAlign = (section as any).label_alignment ?? "left"
      const labelJustify = labelAlign === "center" ? "text-center" : labelAlign === "right" ? "text-right" : "text-left"

      return (
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 style={{
                  color: sectionText ?? "#111827",
                  fontSize: (section as any).title_size === "sm" ? "1.25rem" : (section as any).title_size === "md" ? "1.5rem" : "1.875rem",
                  fontWeight: (section as any).title_weight === "black" ? 900 : (section as any).title_weight === "normal" ? 400 : 700,
                  lineHeight: 1.2,
                }}>
                  {(section as any).title ?? "Shop by Collection"}
                </h2>
                {(section as any).subtitle && (
                  <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}99` : "#6b7280" }}>
                    {(section as any).subtitle}
                  </p>
                )}
              </div>
              {toShow.length > 0 && (
                <Link href={bare ? `/collections` : `/${handle}/collections`}
                  className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2"
                  style={{ color: brandPrimary }}>
                  View all <span>→</span>
                </Link>
              )}
            </div>

            {toShow.length === 0 ? (
              <PlaceholderCollectionGrid columns={cols} brandPrimary={brandPrimary} />
            ) : (
              <div className={`grid ${gridClass} gap-5`}>
                {toShow.map(col => {
                  const thumb = (col as any).thumbnail
                    ?? products.find(p => (p as any).collection?.handle === col.handle)?.thumbnail
                    ?? products.find(p =>
                        ((section as any).collection_ids ?? []).length === 0 ||
                        (p as any).collection?.id === col.id
                      )?.images?.[0]?.url
                  const productCount = products.filter(p => (p as any).collection?.handle === col.handle).length
                  const href = bare ? `/collections/${col.handle}` : `/${handle}/collections/${col.handle}`

                  return (
                    <div key={col.id}>
                      {/* Card image */}
                      <Link href={href}
                        className="group block overflow-hidden bg-gray-100"
                        style={{
                          borderRadius: `${colRadius}px`,
                          aspectRatio: colAspect.replace("/", " / "),
                          display: "block",
                        }}>
                        <div className="relative w-full h-full">
                          {thumb
                            ? <Image src={thumb} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            : <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                <span className="text-4xl">🛍️</span>
                              </div>
                          }
                          {labelPos === "over" && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-lg font-bold leading-tight text-white">{col.title}</p>
                                {productCount > 0 && (
                                  <p className="text-white/70 text-sm mt-0.5">
                                    {productCount} product{productCount !== 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                              <div className="absolute transition-opacity opacity-0 top-3 right-3 group-hover:opacity-100">
                                <span className="text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                  Shop →
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </Link>

                      {/* Label below image */}
                      {labelPos === "below" && (
                        <div className={`mt-2 px-1 ${labelJustify}`}>
                          <p className="text-sm font-semibold leading-tight"
                            style={{ color: sectionText ?? "#111827" }}>
                            {col.title}
                          </p>
                          {productCount > 0 && (
                            <p className="text-xs mt-0.5"
                              style={{ color: sectionText ? `${sectionText}70` : "#9ca3af" }}>
                              {productCount} product{productCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )
    }

    // case "divider": {
    //   return <hr className="mt-6 border-gray-100" />
    // }

       case "divider": {
      const thickness    = (section as any).divider_thickness ?? 1
      const color        = (section as any).divider_color ?? "#e5e7eb"
      const paddingTop   = (section as any).padding_top ?? 16
      const paddingBottom = (section as any).padding_bottom ?? 16
      const widthPct     = (section as any).divider_width ?? 100
      return (
        <div style={{
          backgroundColor: sectionBg ?? "transparent",
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          display: "flex",
          justifyContent: "center",
        }}>
          <div style={{
            width: `${widthPct}%`,
            height: `${thickness}px`,
            backgroundColor: color,
            borderRadius: `${thickness}px`,
          }} />
        </div>
      )
    }

    // ── About ──────────────────────────────────────────────────────────────────
    case "about": return (
      <section id="about" className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col ${section.image_position === "right" ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
            {(section.image ?? vendor.coverphoto ?? vendor.logo) && (
              <div className="w-full md:w-2/5 shrink-0">
                <div className="relative overflow-hidden shadow-xl aspect-square rounded-3xl">
                  <Image src={section.image ?? vendor.coverphoto ?? vendor.logo!} alt={vendor.name} fill className="object-cover" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ background: brandPrimary }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>About</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold" style={{ color: sectionText ?? "#111827" }}>{section.title ?? vendor.name}</h2>
              <p className="text-base leading-relaxed rte-content" style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}
                dangerouslySetInnerHTML={{ __html: section.text ?? vendor.creator_bio ?? "Official merchandise store." }} />
              {vendor.creator_title && <p className="mt-4 text-sm font-medium" style={{ color: brandPrimary }}>{vendor.creator_title}</p>}
            </div>
          </div>
        </div>
      </section>
    )

    // ── Social ─────────────────────────────────────────────────────────────────
    case "social": {
      const socials = [
        { key: "show_instagram", label: "", icon: Instagram, getUrl: (v: PublicVendor) => v.instagram ? `https://instagram.com/${v.instagram}` : null },
        { key: "show_youtube",   label: "",   icon: Youtube,   getUrl: (v: PublicVendor) => v.youtube   ? `https://youtube.com/${v.youtube}`   : null },
        { key: "show_twitter", label: "", icon: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, getUrl: (v: PublicVendor) => v.xtwitter ? `https://twitter.com/${v.xtwitter}` : null },
        { key: "show_facebook",  label: "",  icon: Facebook,  getUrl: (v: PublicVendor) => v.facebook  ? `https://facebook.com/${v.facebook}` : null },
      ].filter(s => (section as any)[s.key] && s.getUrl(vendor))
      if (!socials.length) return null
      return (
        <section className="px-6 py-12" style={{ backgroundColor: sectionBg ?? "#f9fafb" }}>
          <div className="max-w-4xl mx-auto text-center">
            {section.title && <h2 className="mb-6 text-xl font-bold" style={{ color: sectionText ?? "#111827" }}>{section.title}</h2>}
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map(s => {
                const Icon = s.icon
                const btnColor = sectionText ?? brandPrimary
                return (
                  <a key={s.key} href={s.getUrl(vendor)!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all hover:scale-105"
                    style={{ borderColor: btnColor, color: btnColor, background: "transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = btnColor; (e.currentTarget as HTMLElement).style.color = sectionBg ?? "#ffffff" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = btnColor }}
                  >
                    <Icon className="w-4 h-4" />{s.label}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )
    }

    case "html": {
      const htmlContent = (section as any).html_content
      if (!htmlContent) return null
      const isFullDoc = /<!DOCTYPE|<html/i.test(htmlContent)
      const srcDoc = isFullDoc ? htmlContent : `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:system-ui,sans-serif}</style></head><body>${htmlContent}</body></html>`
      return (
        <section className="w-full" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <iframe srcDoc={srcDoc} className="w-full border-0" style={{ minHeight: "200px" }}
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={e => {
              try {
                const doc = (e.currentTarget as HTMLIFrameElement).contentDocument
                if (doc?.body) (e.currentTarget as HTMLIFrameElement).style.height = doc.body.scrollHeight + 32 + "px"
              } catch {}
            }}
            title="Custom HTML section" />
        </section>
      )
    }

    case "text": {
      if (!(section as any).text) return null
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-3xl mx-auto prose prose-lg rte-content" style={{ color: sectionText ?? "#374151" }}
            dangerouslySetInnerHTML={{
              __html: (section as any).text
                .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/(<li>[\s\S]*?<\/li>?)+/g, (b: string) => `<ul>${b}</ul>`)
                .replace(/^(?!<)(.+)$/gm, (l: string) => l.trim() ? `<p>${l}</p>` : "")
            }}
          />
        </section>
      )
    }

    case "image": {
      const img = (section as any).image

      if (!img) {
        if (!isEditorMode) return null
        return (
          <section style={{
            backgroundColor: sectionBg ?? "transparent",
            paddingTop:    `${(section as any).padding_top    ?? 0}px`,
            paddingBottom: `${(section as any).padding_bottom ?? 0}px`,
          }}>
            <div className="flex items-center justify-center h-48 mx-6 border-2 border-gray-300 border-dashed rounded-xl">
              <div className="text-center">
                <span className="text-4xl">🖼️</span>
                <p className="mt-2 text-sm text-gray-400">Upload an image in the left panel</p>
              </div>
            </div>
          </section>
        )
      }

      const heightMode     = (section as any).image_height_mode ?? "auto"
      const widthMode      = (section as any).image_width_mode  ?? "full"
      const fit            = (section as any).image_fit         ?? "cover"
      const overlayPct     = (section as any).overlay_opacity   ?? 0
      const radius         = (section as any).border_radius     ?? 0
      const titlePlacement = (section as any).title_placement   ?? "over"
      const titlePos       = (section as any).title_position    ?? "center"

      const justifyMap: Record<string, string> = {
        left: "justify-start", center: "justify-center", right: "justify-end",
      }

      const imgStyle: React.CSSProperties = {
        objectFit:    fit as any,
        borderRadius: radius,
        width:        "100%",
        display:      "block",
        ...(heightMode === "fixed"  ? { height: `${(section as any).image_height_px ?? 400}px` } : {}),
        ...(heightMode === "screen" ? { height: `${(section as any).image_height_vh ?? 70}vh`  } : {}),
        ...(heightMode === "auto"   ? { height: "auto", maxHeight: "600px"                      } : {}),
      }

      const wrapStyle: React.CSSProperties = {
        backgroundColor: sectionBg ?? "transparent",
        paddingTop:    `${(section as any).padding_top    ?? 0}px`,
        paddingBottom: `${(section as any).padding_bottom ?? 0}px`,
      }

      const innerStyle: React.CSSProperties = {
        ...(widthMode === "contained" ? { maxWidth: "1280px", margin: "0 auto", padding: "0 24px" } : {}),
        ...(widthMode === "custom"    ? { maxWidth: `${(section as any).image_width_pct ?? 80}%`, margin: "0 auto" } : {}),
      }

      const titleEl = section.title ? (
        <div className={`flex w-full ${justifyMap[titlePos]}`}>
          <h2
            className="px-2 py-1 text-2xl font-bold"
            style={{ color: (section as any).title_color ?? (sectionText ?? "#111827") }}
          >
            {section.title}
          </h2>
        </div>
      ) : null

      const imgContent = (
        <div style={{ position: "relative", borderRadius: radius, overflow: "hidden" }}>
          <img
            src={img}
            alt={(section as any).image_alt ?? section.title ?? "Section image"}
            style={imgStyle}
          />
          {overlayPct > 0 && (
            <div style={{
              position: "absolute", inset: 0,
              background: (section as any).overlay_color ?? "#000000",
              opacity:    overlayPct / 100,
            }} />
          )}
          {section.title && titlePlacement === "over" && (
            <div className={`absolute inset-0 flex items-center px-6 ${justifyMap[titlePos]}`}>
              <h2
                className="text-2xl font-bold drop-shadow-lg"
                style={{ color: (section as any).title_color ?? "#ffffff" }}
              >
                {section.title}
              </h2>
            </div>
          )}
        </div>
      )

      return (
        <section style={wrapStyle}>
          <div style={innerStyle}>
            {titlePlacement === "above" && titleEl}
            {(section as any).image_link
              ? <a href={(section as any).image_link}>{imgContent}</a>
              : imgContent
            }
            {titlePlacement === "below" && titleEl}
          </div>
        </section>
      )
    }

        case "image_slider": {
      const slides: any[] = (section as any).slides ?? []
      if (!slides.length) return null

      const height     = (section as any).slider_height    ?? 400
      const autoplay   = (section as any).slider_autoplay  !== false
      const interval   = (section as any).slider_interval  ?? 4
      const fit        = (section as any).slider_fit       ?? "cover"
      const showDots   = (section as any).slider_show_dots   !== false
      const showArrows = (section as any).slider_show_arrows !== false

      return (
        <section style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <ImageSlider
            slides={slides}
            height={height}
            autoplay={autoplay}
            interval={interval}
            fit={fit}
            showDots={showDots}
            showArrows={showArrows}
            brandPrimary={brandPrimary}
            handle={handle}
            bare={bare}
          />
        </section>
      )
    }

    case "video": {
      const rawUrl: string = (section as any).video_url ?? ""
      if (!rawUrl) return null
      const getEmbedUrl = (url: string): string | null => {
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
        if (ytMatch) {
          const autoplay = (section as any).video_autoplay ? "1" : "0"
          return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${autoplay}&mute=1&rel=0&modestbranding=1`
        }
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
        if (vimeoMatch) {
          const autoplay = (section as any).video_autoplay ? "1" : "0"
          return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoplay}&muted=1`
        }
        return null
      }
      const embedUrl = getEmbedUrl(rawUrl)
      if (!embedUrl) return null
      const isYouTube = rawUrl.includes("youtube") || rawUrl.includes("youtu.be")
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-4xl mx-auto">
            {section.title && <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: sectionText ?? "#111827" }}>{section.title}</h2>}
            <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe src={embedUrl} title={section.title ?? "Video"} className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen style={{ border: 0 }} />
              {isYouTube && !(section as any).video_autoplay && (
                <div className="absolute pointer-events-none bottom-3 right-3">
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <svg viewBox="0 0 90 20" className="w-auto h-3 fill-white opacity-80">
                      <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5701 5.35042 27.9727 3.12324ZM11.4253 14.2854V5.71458L18.8477 10.0001L11.4253 14.2854Z"/>
                      <path d="M34.6024 13.0036L31.3945 1.41846H34.1932L35.3174 6.6242C35.6043 7.8785 35.8136 8.9 35.954 9.6893H36.0468C36.1813 8.7574 36.3905 7.7358 36.6773 6.6242L37.8641 1.41846H40.6627L37.3945 13.0036V18.561H34.6023V13.0036H34.6024ZM41.4697 18.561V6.08839H43.9675V7.77215H44.0604C44.6487 6.40806 45.5843 5.72598 46.8673 5.72598C47.9247 5.72598 48.6481 6.1401 49.0378 6.96833C49.4275 7.77277 49.6226 9.01684 49.6226 10.7006V18.561H47.0675V10.9045C47.0675 9.90776 46.9749 9.21135 46.7897 8.81518C46.6046 8.4191 46.2711 8.22104 45.7892 8.22104C45.4353 8.22104 45.1154 8.33802 44.8295 8.57197C44.5436 8.80592 44.3306 9.13281 44.1907 9.55263V18.561H41.4697ZM51.9353 3.02631V1.41846H54.6563V3.02631H51.9353ZM51.9353 18.561V6.08839H54.6563V18.561H51.9353ZM57.3801 13.0959C57.3801 13.6375 57.4122 14.0516 57.4764 14.3385C57.5405 14.6253 57.6654 14.8546 57.8508 15.026C58.0361 15.1974 58.3066 15.2832 58.6621 15.2832C59.175 15.2832 59.5227 15.097 59.7082 14.7246C59.8936 14.3522 59.9869 13.7564 59.9973 12.9368L62.4053 13.0876C62.4157 13.2386 62.4209 13.4362 62.4209 13.6803C62.4209 14.9187 62.0739 15.8507 61.3799 16.4762C60.686 17.1016 59.6863 17.4143 58.381 17.4143C56.8232 17.4143 55.7177 16.9603 55.0643 16.0524C54.411 15.1445 54.0843 13.7277 54.0843 11.8019V9.83501C54.0843 7.8364 54.4185 6.40468 55.0871 5.54074C55.7556 4.6768 56.8736 4.24483 58.441 4.24483C59.5508 4.24483 60.4147 4.45441 61.0325 4.87353C61.6503 5.29266 62.0826 5.93781 62.3295 6.80838C62.5765 7.67896 62.7 8.85891 62.7 10.3482V12.2842H57.3801V13.0959ZM59.9973 9.1545V8.04199C59.9973 7.28258 59.9084 6.71525 59.7305 6.33998C59.5527 5.96472 59.2374 5.77708 58.7844 5.77708C58.3508 5.77708 58.0444 5.96883 57.8647 6.35231C57.685 6.73579 57.5912 7.29899 57.5834 8.04199V9.1545H59.9973Z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )
    }

    case "links": {
      const links = (section as any).links ?? []
      if (!links.length) return null
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-lg mx-auto">
            {section.title && <h2 className="mb-6 text-xl font-bold text-center" style={{ color: sectionText ?? "#111827" }}>{section.title}</h2>}
            <div className="space-y-3">
              {links.map((link: any, i: number) => {
                const btnColor = sectionText ?? brandPrimary
                return (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-6 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                    style={{ border: `2px solid ${btnColor}`, color: btnColor, background: "transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = btnColor; (e.currentTarget as HTMLElement).style.color = sectionBg ?? "#ffffff" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = btnColor }}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )
    }

    // ── Ticker / Scrolling marquee ─────────────────────────────────────────────
    case "ticker": {
      const items: string[] = (section as any).ticker_items ?? ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"]
      const sep = (section as any).ticker_separator ?? "✦"
      const speed = (section as any).ticker_speed ?? 40
      const bg    = sectionBg ?? (section as any).background_color ?? "#111827"
      const fg    = sectionText ?? (section as any).text_color ?? "#ffffff"
      // Duplicate content to fill scroll seamlessly
      // const line = items.join(`  ${sep}  `)
      // const fullLine = `${line}  ${sep}  ${line}  ${sep}  `
      // REPLACE WITH:
      // const stripHtml = (s: string) => {
      //   try {
      //     const tmp = document.createElement("div")
      //     tmp.innerHTML = s
      //     return (tmp.textContent ?? tmp.innerText ?? "").trim()
      //   } catch {
      //     return s.replace(/<[^>]*>/g, "").trim()
      //   }
      // }
      // const cleanItems = items.map(stripHtml)
      // const line = cleanItems.join(`  ${sep}  `)
      const line = items.join(`  ${sep}  `)
      // Repeat enough times to fill the viewport with no gaps
      const repeated = Array(8).fill(line).join(`  ${sep}  `)
      const fullLine = `${repeated}  ${sep}  `
      // Duration in seconds based on speed (invert: higher speed = shorter duration)
      const duration = Math.max(5, 100 - speed)
      return (
        <section className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
          <style>{`
            @keyframes junooni-ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .junooni-ticker-inner {
              display: inline-flex;
              white-space: nowrap;
              animation: junooni-ticker ${duration}s linear infinite;
            }
          `}</style>
          {/* <div className="text-sm font-medium tracking-wide junooni-ticker-inner" style={{ color: fg }}>
            <span>{fullLine}</span>
            <span>{fullLine}</span>
          </div> */}
          <div
            className="text-sm font-medium tracking-wide junooni-ticker-inner"
            style={{ color: fg }}
            dangerouslySetInnerHTML={{ __html: fullLine + fullLine }}
          />
        </section>
      )
    }

    // ── Image with Text ────────────────────────────────────────────────────────
       case "image_text": {
      const imageLeft = (section.image_position ?? "left") === "left"
      const mobileImageTop = ((section as any).mobile_image_position ?? "top") === "top"
      const proportion = (section as any).image_proportion ?? "1/2"
      const minHeight = (section as any).section_min_height ?? 400

      const imageWidthClass =
        proportion === "2/5"   ? "md:w-2/5" :
        proportion === "3/5"   ? "md:w-3/5" :
        proportion === "full"  ? "md:w-full" :
        "md:w-1/2"

      const imageAspect =
        proportion === "portrait" ? "aspect-[3/4]" :
        proportion === "square"   ? "aspect-square"  :
        proportion === "full"     ? "aspect-[21/9]"  :
        "aspect-[4/3]"

      return (
        <section className="overflow-hidden" style={{
          backgroundColor: sectionBg ?? "transparent",
          minHeight: `${minHeight}px`,
        }}>
          <div className={`flex ${mobileImageTop ? "flex-col" : "flex-col-reverse"} ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} h-full`}
            style={{ minHeight: `${minHeight}px` }}>
              {/* Image side — full bleed, no padding, no rounding */}
              <div className={`w-full ${imageWidthClass} shrink-0 relative`}
                style={{ minHeight: `${Math.min(minHeight, 400)}px` }}>
                {section.image ? (
                  <Image src={section.image} alt={section.title ?? "Section image"} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100" style={{ minHeight: `${Math.min(minHeight, 400)}px` }}>
                    <span className="text-5xl opacity-20">🖼️</span>
                  </div>
                )}
              </div>
              {/* Text side — keeps padding */}
              <div className="flex-1 flex flex-col justify-center px-8 py-14">
                {section.title && (
                  <h2 className="mb-4 text-3xl font-bold leading-tight" style={{ color: sectionText ?? "#111827" }}
                    dangerouslySetInnerHTML={{ __html: section.title }} />
                )}
                {section.text && (
                  <div className="mb-6 text-base leading-relaxed prose-sm prose rte-content max-w-none" style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}
                    dangerouslySetInnerHTML={{ __html: section.text }} />
                )}
                {section.cta_label && (
                  <div className="mt-2">
                    <Link href={resolveUrl(section.cta_url, handle, bare)}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                      style={{
                        background: (section as any).cta_bg_color ?? `linear-gradient(135deg, ${brandPrimary} 0%, ${store?.secondary_color ?? brandPrimary} 100%)`,
                        color: (section as any).cta_text_color ?? "#ffffff",
                        borderRadius: `${(section as any).cta_border_radius ?? 50}px`,
                        border: (section as any).cta_border_color ? `2px solid ${(section as any).cta_border_color}` : "2px solid transparent",
                      }}>
                      {section.cta_label}
                    </Link>
                  </div>
                )}
              </div>
          </div>
        </section>
      )
    }

    // ── Video with Text ────────────────────────────────────────────────────────
    case "video_text": {
      const videoUrl: string = (section as any).video_text_url ?? ""
      const imageLeft = (section.image_position ?? "left") === "left"
      const mobileVideoTop = ((section as any).mobile_image_position ?? "top") === "top"

      const getEmbedUrl = (url: string): string | null => {
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
        return null
      }

      const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null

      return (
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-6xl mx-auto">
            <div className={`flex gap-10 items-center ${mobileVideoTop ? "flex-col" : "flex-col-reverse"} ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
              {/* Video side */}
              <div className="w-full md:w-1/2 shrink-0">
                {embedUrl ? (
                  <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
                    <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 0 }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-2xl aspect-video">
                    <span className="text-5xl opacity-20">🎬</span>
                  </div>
                )}
              </div>
              {/* Text side */}
              <div className="flex-1">
                {section.title && (
                  <h2 className="mb-4 text-3xl font-bold leading-tight" style={{ color: sectionText ?? "#111827" }}
                    dangerouslySetInnerHTML={{ __html: section.title }} />
                )}
                {section.text && (
                  <div className="mb-6 text-base leading-relaxed prose-sm prose rte-content max-w-none" style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}
                    dangerouslySetInnerHTML={{ __html: section.text }} />
                )}
                {section.cta_label && (
                  <Link href={resolveUrl(section.cta_url, handle, bare)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full hover:opacity-90 hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}>
                    {section.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    }

    // ── Featured Product — interactive mini product page ──────────────────────
    case "featured_product": {
      const productId: string = (section as any).featured_product_id ?? ""
      const product = productId ? products.find(p => p.id === productId) : products[0]

      if (!product && !isEditorMode) return null

      return (
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "#f9fafb" }}>
          <div className="max-w-6xl mx-auto">
            {/* {section.title && (
              <p className="mb-8 text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>
                {section.title}
              </p>
            )} */}
            {!product ? (
              <PlaceholderFeaturedProduct
                brandPrimary={brandPrimary}
                sectionBg={sectionBg}
                sectionText={sectionText}
                imageLeft={(section.image_position ?? "left") === "left"}
              />
            ) : (
              <FeaturedProductWidget
                section={section}
                product={product as any}
                handle={handle}
                brandPrimary={brandPrimary}
                sectionBg={sectionBg}
                sectionText={sectionText}
              />
            )}
          </div>
        </section>
      )
    }
     default: return null
  }
}

// ── FeaturedProductWidget — fully interactive mini product page ───────────────

function FeaturedProductWidget({ section, product, handle, brandPrimary, sectionBg, sectionText }: {
  section: any
  product: any
  handle: string
  brandPrimary: string
  sectionBg?: string
  sectionText?: string
}) {
  const { openCart, refreshCart } = useCart()

  const showTitle  = section.featured_product_show_title  !== false
  const showPrice  = section.featured_product_show_price  !== false
  const showColors = section.featured_product_show_colors !== false
  const heading    = section.featured_product_heading as string | undefined
  const imageLeft  = (section.image_position ?? "left") === "left"

  // ── Parse metadata hex colors ──────────────────────────────────────────────
  const hexColorMap: Record<string, string> = {}
  try {
    const rawHex = product?.metadata?.color_hex_values
    if (rawHex) {
      const parsed: { name: string; hex: string }[] = JSON.parse(rawHex)
      for (const c of parsed) hexColorMap[c.name.toLowerCase().trim()] = c.hex
    }
  } catch {}

  const fallbackMap: Record<string, string> = {
    "off white":"#f5f0e8","offwhite":"#f5f0e8","cream":"#fffdd0","ivory":"#fffff0",
    "beige":"#f5f5dc","khaki":"#c3b091","light gray":"#d3d3d3","light grey":"#d3d3d3",
    "charcoal":"#36454f","ash":"#b2beb5","baby pink":"#f4c2c2","light pink":"#ffb6c1",
    "blush":"#de5d83","rose":"#ff007f","coral":"#ff7f50","hot pink":"#ff69b4",
    "sky blue":"#87ceeb","baby blue":"#89cff0","royal blue":"#4169e1","cobalt":"#0047ab",
    "denim":"#1560bd","midnight blue":"#191970","mint":"#98ff98","mint green":"#98ff98",
    "olive green":"#556b2f","bottle green":"#006a4e","army green":"#4b5320",
    "sage green":"#8a9a5b","wine":"#722f37","maroon":"#800000","rust":"#b7410e",
    "mustard":"#ffdb58","golden yellow":"#ffc30b","lavender":"#e6e6fa","lilac":"#c8a2c8",
    "mauve":"#e0b0ff","plum":"#8e4585","brown":"#964b00","caramel":"#c68642",
    "tan":"#d2b48c","nude":"#e3bc9a","gold":"#ffd700","silver":"#c0c0c0",
    "multicolor":"linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
    "multi":"linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
  }

  const resolveHex = (name: string): string | null => {
    const key = name.toLowerCase().trim()
    return hexColorMap[key] ?? fallbackMap[key] ?? null
  }

  const isLightHex = (hex: string): boolean => {
    if (!hex.startsWith("#") || hex.length < 7) return false
    const r = parseInt(hex.slice(1,3),16)
    const g = parseInt(hex.slice(3,5),16)
    const b = parseInt(hex.slice(5,7),16)
    return (r*299 + g*587 + b*114)/1000 > 200
  }

  // ── Product options parsing ────────────────────────────────────────────────
  const productOpts: any[] = product?.options ?? []

  const colorOption = productOpts.find((o: any) => o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "colour")
  const sizeOption  = productOpts.find((o: any) => o.title?.toLowerCase() === "size")
  const colorNames: string[] = colorOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []
  const sizeNames:  string[] = sizeOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []

  // ── Variant-image mapping from product.images + color slug ────────────────
  const allImages: any[] = product?.images ?? []

  const getImagesForColor = (colorName: string): string | null => {
    const colorSlug = colorName.toLowerCase().replace(/\s+/g, "_")
    // Try to find a "front" mockup image for this color
    const frontMatch = allImages.find((img: any) =>
      img.url?.toLowerCase().includes(colorSlug) && img.url?.toLowerCase().includes("front")
    )
    if (frontMatch) return frontMatch.url
    // Any image for this color
    const anyMatch = allImages.find((img: any) => img.url?.toLowerCase().includes(colorSlug))
    return anyMatch?.url ?? null
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string>(colorNames[0] ?? "")
  const [selectedSize,  setSelectedSize]  = useState<string>(sizeNames[0] ?? "")
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)

  // Thumbnail: try color-matched image, fall back to product thumbnail
  const displayImage = (selectedColor ? getImagesForColor(selectedColor) : null)
    ?? product?.thumbnail
    ?? null

  // ── Variant resolution ─────────────────────────────────────────────────────
  const findVariant = () => {
    if (!product?.variants?.length) return null
    return product.variants.find((v: any) => {
      const opts: any[] = v.options ?? []
      const hasColor = !selectedColor || opts.some((o: any) => {
        const val = o.value ?? o.option_value ?? ""
        return val.toLowerCase() === selectedColor.toLowerCase()
      })
      const hasSize = !selectedSize || opts.some((o: any) => {
        const val = o.value ?? o.option_value ?? ""
        return val.toLowerCase() === selectedSize.toLowerCase()
      })
      // Fallback: match by variant title
      if (opts.length === 0) {
        const title = v.title ?? ""
        const titleHasColor = !selectedColor || title.toLowerCase().includes(selectedColor.toLowerCase())
        const titleHasSize  = !selectedSize  || title.toLowerCase().includes(selectedSize.toLowerCase())
        return titleHasColor && titleHasSize
      }
      return hasColor && hasSize
    }) ?? product.variants[0]
  }

  const selectedVariant = findVariant()

  // ── Price display ──────────────────────────────────────────────────────────
  const getPrice = (variant?: any): string => {
    const v = variant ?? selectedVariant ?? product?.variants?.[0]
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
    if (!selectedVariant?.id) {
      setCartError("Please select all options")
      return
    }
    setIsAdding(true)
    setCartError(null)
    try {
      await addToCart({ handle, variantId: selectedVariant.id, quantity })
      await refreshCart()
      setAdded(true)
      openCart()
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      setCartError(e?.message ?? "Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const MAX_COLORS = 88
  const visibleColors = colorNames.slice(0, MAX_COLORS)
  const overflowCount = colorNames.length - MAX_COLORS

  if (!product) return null

  return (
    <section className="px-4 py-8 sm:px-6" style={{ backgroundColor: sectionBg ?? "#f9fafb" }}>
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        {section.title && (
          <p className="mb-8 text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>
            {section.title}
          </p>
        )}

        <div className={`flex flex-col gap-12 items-start ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>

          {/* ── Image side — updates on color select ── */}
          <div className="w-full md:w-[48%] shrink-0">
            <div className="relative overflow-hidden bg-gray-100 rounded-3xl aspect-square">
              {displayImage ? (
                <Image
                  key={displayImage}
                  src={displayImage}
                  alt={product.title ?? "Product"}
                  fill
                  className="object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-6xl opacity-20">🛍️</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Info + interactive controls ── */}
          <div className="flex-1 space-y-5 md:pt-2">

            {/* Creator heading */}
            {heading && (
              <h2 className="text-3xl font-bold leading-tight" style={{ color: sectionText ?? "#111827" }}>
                {heading}
              </h2>
            )}

            {/* Product title */}
            {showTitle && product.title && (
              <p className="text-lg font-semibold" style={{ color: sectionText ?? "#374151" }}>
                {product.title}
              </p>
            )}

            {/* Story/description */}
            {section.text && (
              <div className="text-base leading-relaxed prose-sm prose rte-content max-w-none" style={{ color: sectionText ? `${sectionText}bb` : "#4b5563" }}
                dangerouslySetInnerHTML={{ __html: section.text }} />
            )}

            {/* Price */}
            {showPrice && getPrice() && (
              <p className="text-2xl font-bold" style={{ color: brandPrimary }}>
                {getPrice()}
              </p>
            )}

            {/* Color swatches — interactive */}
            {showColors && colorNames.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: sectionText ? `${sectionText}` : "#9ca3af" }}>
                  Color
                  {selectedColor && (
                    <span className="ml-2 font-normal normal-case" style={{ color: sectionText ? `${sectionText}` : "#6b7280" }}>
                      — {selectedColor}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {visibleColors.map(colorName => {
                    const hex = resolveHex(colorName)
                    const isGrad = hex?.startsWith("linear-gradient")
                    const light = hex && !isGrad ? isLightHex(hex) : false
                    const isSelected = selectedColor === colorName
                    return (
                      <button
                        key={colorName}
                        title={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className="w-8 h-8 transition-all rounded-full shrink-0 hover:scale-110"
                        style={{
                          ...(isGrad ? { background: hex! } : { backgroundColor: hex ?? colorName }),
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
                  {overflowCount > 0 && (
                    <span className="ml-1 text-xs font-medium" style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>
                      +{overflowCount} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Size — interactive */}
            {sizeNames.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: sectionText ? `${sectionText}` : "#9ca3af" }}>
                  Size
                  {selectedSize && (
                    <span className="ml-2 font-normal normal-case" style={{ color: sectionText ? `${sectionText}` : "#6b7280" }}>
                      — {selectedSize}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {sizeNames.map(size => {
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
                        style={{
                          borderColor: isSelected ? brandPrimary : sectionText ? `${sectionText}30` : `${brandPrimary}30`,
                          backgroundColor: isSelected ? brandPrimary : "transparent",
                          color: isSelected ? "#ffffff" : (sectionText ?? "#374151"),
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cart error */}
            {cartError && (
              <p className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg bg-red-50">
                {cartError}
              </p>
            )}

            {/* Quantity + Add to Cart */}
             {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 pt-1">
              {/* Quantity stepper */}
              <div className="flex items-center overflow-hidden border-2 rounded-full shrink-0"
                style={{ borderColor: sectionText ? `${sectionText}30` : "#e5e7eb" }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex items-center justify-center w-10 h-12 transition-colors"
                  style={{ color: sectionText ?? "#6b7280" }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-sm font-semibold text-center"
                  style={{ color: sectionText ?? "#111827" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="flex items-center justify-center w-10 h-12 transition-colors"
                  style={{ color: sectionText ?? "#6b7280" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-70"
                style={{ background: added ? "#16a34a" : `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
              >
                {isAdding ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                ) : added ? (
                  <><Check className="w-4 h-4" />Added to cart!</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" />Add to Cart</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ImageSlider component ─────────────────────────────────────────────────────
// "use client"
function ImageSlider({ slides, height, autoplay, interval, fit, showDots, showArrows, brandPrimary, handle, bare }: {
  slides: { image: string; caption?: string; link?: string }[]
  height: number
  autoplay: boolean
  interval: number
  fit: string
  showDots: boolean
  showArrows: boolean
  brandPrimary: string
  handle: string
  bare: boolean
}) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (idx: number) => {
    setCurrent((idx + slides.length) % slides.length)
  }

  useEffect(() => {
    if (!autoplay || slides.length < 2) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), interval * 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoplay, interval, slides.length])

  const slide = slides[current]
  if (!slide?.image) return null

  const content = (
    <div className="relative w-full overflow-hidden select-none" style={{ height }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          <Image
            src={s.image}
            alt={s.caption ?? `Slide ${i + 1}`}
            fill
            sizes="100vw"
            className="transition-opacity duration-500"
            style={{ objectFit: fit as any }}
          />
          {/* Caption */}
          {s.caption && (
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-sm font-semibold text-white drop-shadow">{s.caption}</p>
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={e => { e.preventDefault(); go(current - 1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={e => { e.preventDefault(); go(current + 1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="transition-all duration-200 rounded-full"
              style={{
                width:  i === current ? 20 : 6,
                height: 6,
                background: i === current ? brandPrimary : "rgba(255,255,255,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )

  return slide.link ? (
    <Link href={resolveUrl(slide.link, handle, bare)}>{content}</Link>
  ) : content
}

// ── Default sections ──────────────────────────────────────────────────────────

function defaultSections(vendor: PublicVendor | undefined): StoreSection[] {
  return [
    { type: "hero", headline: vendor?.name ?? undefined, subtext: vendor?.creator_title ?? undefined, cta_label: "Shop Now", cta_secondary_label: "Browse all", cta_secondary_url: "/products", hero_image_right: undefined } as any,
    { type: "collection", title: "All Products", limit: 12 },
    { type: "divider" },
    { type: "about", title: "About Me" },
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true, show_facebook: true },
  ]
}
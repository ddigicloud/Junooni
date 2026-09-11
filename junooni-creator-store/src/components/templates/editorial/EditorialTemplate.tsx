"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Loader2, Check, Minus, Plus } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { useCart } from "@/context/CartContext"
import type { PublicVendor, VendorStore, Product, StoreSection, CategoryMeta, CollectionMeta } from "@/lib/types"
import ProductCard from "@/components/ui/ProductCard"
import AnnouncementBar from "@/components/sections/AnnouncementBar"
import ProductCarousel from "@/components/ui/ProductCarousel"
import SocialSection from "@/components/sections/SocialSection"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import creatortee from "../../../../public/editorial-creator-tee.jpeg"
import signaturecap from "../../../../public/editorial-signature-cap.jpeg"
import editorialhoodie from "../../../../public/editorial-hoodie.jpeg"
import editorialcollectionsummer from "../../../../public/editorial-collection-summer.jpeg"
import editorialcollectionfavourites from "../../../../public/editorial-collection-favourites.jpeg"
import editorialcollectionaccessories from "../../../../public/editorial-collection-accessories.jpeg"
import editorialcollectionlimited from "../../../../public/editorial-collection-limited.jpeg"
import editorialtemplatebanner from "../../../../public/editorial-template-banner.jpeg"

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

const FAKE_PRODUCTS = [
  { id: "fake_1", title: "Classic Creator Tee", price: "₹699", image: creatortee },
  { id: "fake_2", title: "Limited Drop Hoodie", price: "₹1,299", image: editorialhoodie },
  { id: "fake_3", title: "Signature Cap", price: "₹499", image: signaturecap },
]

function PlaceholderProductGrid({ columns = 3, brandPrimary }: { columns?: number; brandPrimary: string }) {
  const gridClass = columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
  return (
    <div className={`grid ${gridClass} gap-6`}>
      {FAKE_PRODUCTS.slice(0, columns > 3 ? 4 : 3).map((p) => (
        <div key={p.id} className="space-y-3 cursor-default select-none">
          <div className="overflow-hidden bg-gray-100 aspect-square rounded-2xl">
            <img src={typeof p.image === "string" ? p.image : p.image.src} alt={p.title}
              className="object-cover w-full h-full" />
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
    { id: "fc_1", title: "Summer Drops", image: editorialcollectionsummer },
    { id: "fc_2", title: "Fan Favourites", image: editorialcollectionfavourites },
    { id: "fc_3", title: "Limited Edition", image: editorialcollectionlimited },
    { id: "fc_4", title: "Accessories", image: editorialcollectionaccessories },
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

export default function EditorialTemplate({ vendor, store: initialStore, products, categories, collections }: Props) {
  const [liveStore, setLiveStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [bare, setBare] = useState(false)

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
  const fontClass = store?.font === "playfair" ? "font-playfair" : store?.font === "poppins" ? "font-poppins" : "font-inter"
  const handle = vendor.handle

  const headerZoneSectionIds = new Set(
    sections
      .filter((s: any) => s.type === "announcement" || s.type === "ticker")
      .map((s: any) => s.id)
  )

  return (
    <div className={`min-h-screen bg-[#fafaf8] ${fontClass}`}>
      <style>{`
        .rte-content a { text-decoration: underline; text-decoration-color: currentColor; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; }
      `}</style>

      {/* ── HEADER ── */}
      <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />

      {/* ── PAGE SECTIONS ── */}
      {sections.filter(s => !(s as any).hidden && !headerZoneSectionIds.has((s as any).id)).map((section) => {
        const secId = (section as any).id
        const isSelected = secId && selectedSectionId === secId
        const secBg = (section as any).background_color
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
            <EditorialSection
              section={section}
              vendor={vendor}
              store={store}
              products={products}
              categories={categories}
              collections={collections}
              brandPrimary={brandPrimary}
              sectionBg={secBg}
              sectionText={secText}
              bare={bare}
              isEditorMode={isEditorMode}
              handle={handle}
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

function EditorialSection({
  section, vendor, store, products, categories, collections,
  brandPrimary, sectionBg, sectionText, bare, isEditorMode, handle,
}: {
  section: StoreSection
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
  brandPrimary: string
  sectionBg?: string
  sectionText?: string
  bare: boolean
  isEditorMode: boolean
  handle: string
}) {
  if ((section as any).hidden) return null

  switch (section.type) {

    // ── Announcement (handled by header zone filter, but keep as safety) ───
    case "announcement": return null

    // ── Ticker ─────────────────────────────────────────────────────────────
    case "ticker": {
      const items: string[] = (section as any).ticker_items ?? ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"]
      const sep = (section as any).ticker_separator ?? "✦"
      const speed = (section as any).ticker_speed ?? 40
      const bg = sectionBg ?? (section as any).background_color ?? "#111827"
      const fg = sectionText ?? (section as any).text_color ?? "#ffffff"
      const line = items.join(`  ${sep}  `)
      const repeated = Array(8).fill(line).join(`  ${sep}  `)
      const fullLine = `${repeated}  ${sep}  `
      const duration = Math.max(5, 100 - speed)
      return (
        <section className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
          <style>{`
            @keyframes editorial-ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .editorial-ticker-inner {
              display: inline-flex;
              white-space: nowrap;
              animation: editorial-ticker ${duration}s linear infinite;
            }
          `}</style>
          <div
            className="text-sm font-medium tracking-wide editorial-ticker-inner"
            style={{ color: fg }}
            dangerouslySetInnerHTML={{ __html: fullLine + fullLine }}
          />
        </section>
      )
    }

    // ── Hero ────────────────────────────────────────────────────────────────
    case "hero": {
      const overlayColor     = (section as any).overlay_color      as string | undefined
      const overlayTextColor = (section as any).overlay_text_color as string | undefined
      const headlineColor    = overlayTextColor ?? sectionText ?? "#111827"
      const secCtaLabel      = (section as any).cta_secondary_label as string | undefined
      const secCtaUrl        = (section as any).cta_secondary_url   as string | undefined

      // ── Collect all images for the card deck ──────────────────────────────
      const heroImages: string[] = (() => {
        const PLACEHOLDERS = [
          "/minimal-template-banner.png",
          "/bold-template-banner.png",
          "/editorial-template-banner.png",
        ]
        const placeholder = typeof editorialtemplatebanner === "string"
          ? editorialtemplatebanner
          : (editorialtemplatebanner as any).src ?? (editorialtemplatebanner as any).default ?? ""

        const imgs: string[] = []

        // Only push hero_image_right if it's a real uploaded image
        const main = (section as any).hero_image_right
        if (main && !PLACEHOLDERS.includes(main)) imgs.push(main)

        // Additional uploaded images
        const extra: string[] = (section as any).hero_images ?? []
        extra.forEach(img => { if (img && !imgs.includes(img)) imgs.push(img) })

        // Always ensure at least 3 items so deck always shows 3 cards
        while (imgs.length < 3) imgs.push(placeholder)
        return imgs
      })()

      return (
        <EditorialHeroSection
          section={section}
          vendor={vendor}
          store={store}
          brandPrimary={brandPrimary}
          sectionBg={sectionBg}
          sectionText={sectionText}
          headlineColor={headlineColor}
          overlayColor={overlayColor}
          overlayTextColor={overlayTextColor}
          secCtaLabel={secCtaLabel}
          secCtaUrl={secCtaUrl}
          heroImages={heroImages}
          handle={handle}
          bare={bare}
          editorialtemplatebanner={editorialtemplatebanner}
        />
      )
    }

    // ── Featured products ───────────────────────────────────────────────────
    case "featured": {
      const featured = section.product_ids?.length
        ? products.filter(p => section.product_ids!.includes(p.id))
        : products.slice(0, 3)

      if (!featured.length && !isEditorMode) return null

      const [first, ...rest] = featured
      return (
        <section id="products" className="px-6 py-16 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold"
                  style={{ color: sectionText ? `${sectionText}80` : "#6b7280" }}>{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            {featured.length === 0 ? (
              <PlaceholderProductGrid columns={3} brandPrimary={brandPrimary} />
            ) : first && (
              <div className="grid gap-8 mb-8 md:grid-cols-2">
                <ProductCard product={first} handle={handle} />
                <div className="grid grid-cols-2 gap-4">
                  {rest.slice(0, 4).map(p => (
                    <ProductCard key={p.id} product={p} handle={handle} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )
    }

    // ── All products collection ─────────────────────────────────────────────
    case "collection": {
      const limited = (section.product_ids && section.product_ids.length > 0)
        ? section.product_ids
            .map((id: string) => products.find((p: any) => p.id === id))
            .filter(Boolean)
            .slice(0, section.limit ?? 12)
        : products.slice(0, section.limit ?? 12)
      if (!limited.length && !isEditorMode) return null
      return (
        <section id="products" className="py-16 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-6xl mx-auto px-6">
            {section.title && (
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold"
                  style={{ color: sectionText ? `${sectionText}80` : "#6b7280" }}>{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
          </div>
          {limited.length === 0 ? (
            <div className="px-6">
              <PlaceholderProductGrid columns={(section as any).columns ?? 3} brandPrimary={brandPrimary} />
            </div>
          ) : (
            <div className="px-6">
              <ProductCarousel products={limited} handle={handle} bare={bare} brandPrimary={brandPrimary} variant="light" />
            </div>
          )}
        </section>
      )
    }

    // ── Collections showcase ────────────────────────────────────────────────
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
                            ? <Image src={thumb} alt={col.title} fill quality={90} className="object-cover transition-transform duration-500 group-hover:scale-105" />
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

    // ── About ───────────────────────────────────────────────────────────────
    case "about": return (
      <section id="about" className="px-6 py-16 border-t border-gray-100"
        style={{ backgroundColor: sectionBg ?? "transparent" }}>
        <div className="grid max-w-6xl gap-12 mx-auto md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: brandPrimary }} />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold"
                style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>
                {section.title ?? "About"}
              </span>
            </div>
            {(section.image ?? vendor.logo) && (
              <div className="relative mt-6 overflow-hidden aspect-square rounded-xl">
                <Image src={section.image ?? vendor.logo!} alt={vendor.name} fill quality={90} className="object-cover" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center md:col-span-2">
          <div className="text-lg leading-relaxed rte-content"
            style={{ color: sectionText ?? "#374151", fontFamily: "var(--font-playfair)" }}
            dangerouslySetInnerHTML={{ __html: section.text || vendor.creator_bio || "Share your story with your fans here." }} />
            {vendor.creator_title && (
              <p className="mt-6 text-sm tracking-widest uppercase" style={{ color: brandPrimary }}>{vendor.creator_title}</p>
            )}
          </div>
        </div>
      </section>
    )

    // ── Social ──────────────────────────────────────────────────────────────
    case "social": return (
      <div id="social">
        <SocialSection section={section} vendor={vendor} />
      </div>
    )

    // ── Divider ─────────────────────────────────────────────────────────────
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

    // ── Text ────────────────────────────────────────────────────────────────
    case "text": {
      if (!(section as any).text) return null
      return (
        <section className="px-6 py-12 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-3xl mx-auto prose prose-lg rte-content"
            style={{ color: sectionText ?? "#374151" }}
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

    // ── Image ───────────────────────────────────────────────────────────────
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

      const heightMode = (section as any).image_height_mode ?? "auto"
      const widthMode  = (section as any).image_width_mode  ?? "full"
      const fit        = (section as any).image_fit         ?? "cover"
      const overlayPct = (section as any).overlay_opacity   ?? 0
      const radius     = (section as any).border_radius     ?? 0

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
              opacity: overlayPct / 100,
            }} />
          )}
          {section.title && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <h2 className="text-2xl font-bold drop-shadow-lg"
                style={{ color: (section as any).title_color ?? "#ffffff" }}>
                {section.title}
              </h2>
            </div>
          )}
        </div>
      )

      return (
        <section style={wrapStyle}>
          <div style={innerStyle}>
            {(section as any).image_link
              ? <a href={(section as any).image_link}>{imgContent}</a>
              : imgContent}
          </div>
        </section>
      )
    }

    // ── Image with Text ─────────────────────────────────────────────────────
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
        <section className="overflow-hidden border-t border-gray-100" style={{
          backgroundColor: sectionBg ?? "transparent",
          minHeight: `${minHeight}px`,
        }}>
          <div className={`flex ${mobileImageTop ? "flex-col" : "flex-col-reverse"} ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} h-full`}
            style={{ minHeight: `${minHeight}px` }}>
              {/* Image side — full bleed */}
              <div className={`w-full ${imageWidthClass} shrink-0 relative`}
                style={{ minHeight: `${Math.min(minHeight, 400)}px` }}>
                {section.image ? (
                  <Image src={section.image} alt={section.title ?? "Section image"} fill quality={90} className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100" style={{ minHeight: `${Math.min(minHeight, 400)}px` }}>
                    <span className="text-5xl opacity-20">🖼️</span>
                  </div>
                )}
              </div>
              {/* Text side */}
              <div className="flex-1 flex flex-col justify-center px-10 py-14">
                {section.title && (
                  <h2 className="mb-4 text-3xl font-bold leading-tight"
                    style={{ color: sectionText ?? "#111827", fontFamily: "var(--font-playfair)" }}
                    dangerouslySetInnerHTML={{ __html: section.title }} />
                )}
                {section.text && (
                  <div className="mb-6 text-base leading-relaxed prose-sm prose rte-content max-w-none"
                    style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}
                    dangerouslySetInnerHTML={{ __html: section.text }} />
                )}
                {section.cta_label && (
                  <div className="mt-2">
                    <Link href={resolveUrl(section.cta_url, handle, bare)}
                      className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-80"
                      style={{
                        background: (section as any).cta_bg_color ? (section as any).cta_bg_color : "transparent",
                        color: (section as any).cta_text_color ?? brandPrimary,
                        borderRadius: `${(section as any).cta_border_radius ?? 2}px`,
                        border: (section as any).cta_border_color
                          ? `2px solid ${(section as any).cta_border_color}`
                          : "none",
                        paddingBottom: (section as any).cta_bg_color ? undefined : "2px",
                        borderBottom: !(section as any).cta_bg_color ? `2px solid ${brandPrimary}` : undefined,
                        padding: (section as any).cta_bg_color ? "0.75rem 1.5rem" : undefined,
                      }}>
                      {section.cta_label} {!(section as any).cta_bg_color && <span>→</span>}
                    </Link>
                  </div>
                )}
              </div>
          </div>
        </section>
      )
    }

    // ── Video with Text ─────────────────────────────────────────────────────
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
        <section className="px-6 py-16 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-6xl mx-auto">
            <div className={`flex gap-10 items-center ${mobileVideoTop ? "flex-col" : "flex-col-reverse"} ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="w-full md:w-1/2 shrink-0">
                {embedUrl ? (
                  <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
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
                    style={{ color: sectionText ?? "#111827", fontFamily: "var(--font-playfair)" }}
                    dangerouslySetInnerHTML={{ __html: section.title }} />
                )}
                {section.text && (
                  <div className="mb-6 text-base leading-relaxed prose-sm prose rte-content max-w-none"
                    style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}
                    dangerouslySetInnerHTML={{ __html: section.text }} />
                )}
                {section.cta_label && (
                  <Link href={resolveUrl(section.cta_url, handle, bare)}
                    className="inline-flex items-center gap-2 pb-1 text-sm font-semibold tracking-widest uppercase transition-opacity border-b-2 hover:opacity-70"
                    style={{ borderColor: brandPrimary, color: brandPrimary }}>
                    {section.cta_label} <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    }

    // ── Video ───────────────────────────────────────────────────────────────
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
      return (
        <section className="px-6 py-12 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-4xl mx-auto">
            {section.title && (
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold"
                  style={{ color: sectionText ? `${sectionText}80` : "#6b7280" }}>{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe src={embedUrl} title={section.title ?? "Video"}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen style={{ border: 0 }} />
            </div>
          </div>
        </section>
      )
    }

    // ── Featured Product ────────────────────────────────────────────────────
    case "featured_product": {
      const productId: string = (section as any).featured_product_id ?? ""
      const product = productId ? products.find(p => p.id === productId) : products[0]
      if (!product && !isEditorMode) return null
      return (
        <section className="px-6 py-16 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-6xl mx-auto">
            {!product ? (
              <div className={`flex flex-col gap-12 items-start ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="w-full md:w-[48%] shrink-0">
                  <div className="overflow-hidden cursor-default select-none aspect-square rounded-3xl">
                    <img
                      src={creatortee.src}
                      alt="Product"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-5 md:pt-2">
                  <h2 className="text-3xl font-bold" style={{ color: sectionText ?? "#111827", fontFamily: "var(--font-playfair)" }}>Classic Creator Tee</h2>
                  <p className="text-base leading-relaxed" style={{ color: sectionText ? `${sectionText}bb` : "#4b5563" }}>Your product description will appear here.</p>
                  <p className="text-2xl font-bold" style={{ color: brandPrimary }}>₹699</p>
                </div>
              </div>
            ) : (
              <EditorialFeaturedProduct
                section={section}
                product={product as any}
                handle={handle}
                brandPrimary={brandPrimary}
                sectionBg={sectionBg}
                sectionText={sectionText}
                bare={bare}
              />
            )}
          </div>
        </section>
      )
    }

    // ── HTML ────────────────────────────────────────────────────────────────
        case "html": {
      const htmlContent = (section as any).html_content
      if (!htmlContent) return null
      const isFullDoc = /<!DOCTYPE|<html/i.test(htmlContent)
      const srcDoc = isFullDoc
        ? htmlContent
        : `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box}body{margin:0;padding:0;overflow:hidden}</style></head><body>${htmlContent}</body></html>`

      const desktopH = (section as any).html_height ?? 300
      const mobileH  = (section as any).html_height_mobile ?? desktopH
      const widthVal  = (section as any).html_width === "lg" ? "80%"
                      : (section as any).html_width === "md" ? "60%"
                      : "100%"

      return (
        <section className="w-full" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <style>{`
            .html-section-frame {
              height: ${mobileH}px;
            }
            @media (min-width: 768px) {
              .html-section-frame {
                height: ${desktopH}px;
              }
            }
          `}</style>
          <iframe
            srcDoc={srcDoc}
            className="html-section-frame border-0"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Custom HTML section"
            style={{
              width: widthVal,
              display: "block",
              margin: "0 auto",
              overflow: "hidden",
            }}
          />
        </section>
      )
    }

    // ── Links ───────────────────────────────────────────────────────────────
    case "links": {
      const links = (section as any).links ?? []
      if (!links.length) return null
      return (
        <section className="px-6 py-12 border-t border-gray-100"
          style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="max-w-lg mx-auto">
            {section.title && (
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold"
                  style={{ color: sectionText ? `${sectionText}80` : "#6b7280" }}>{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div className="space-y-3">
              {links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ border: `2px solid ${brandPrimary}`, color: brandPrimary, background: "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = brandPrimary; (e.currentTarget as HTMLElement).style.color = "#fff" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = brandPrimary }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    }

    // ── Image Slider ────────────────────────────────────────────────────────
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
          <EditorialImageSlider
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

    default: return null
  }
}

// ── EditorialHeroSection — Stacked Card Deck Hero ─────────────────────────────

// ── EditorialHeroSection — Stacked Card Deck Hero ─────────────────────────────

function EditorialHeroSection({
  section, vendor, store, brandPrimary, sectionBg, sectionText,
  headlineColor, overlayColor, overlayTextColor, secCtaLabel, secCtaUrl,
  heroImages, handle, bare, editorialtemplatebanner,
}: {
  section: any; vendor: any; store: any; brandPrimary: string
  sectionBg?: string; sectionText?: string; headlineColor: string
  overlayColor?: string; overlayTextColor?: string
  secCtaLabel?: string; secCtaUrl?: string
  heroImages: string[]; handle: string; bare: boolean
  editorialtemplatebanner: any
}) {
  const total = heroImages.length
  // `order` is the actual display order — order[0] is always the front card
  const [order, setOrder] = useState(() => heroImages.map((_, i) => i))
  const [departing, setDeparting] = useState<number | null>(null) // index of card doing fling anim
  const [showArrows, setShowArrows] = useState(false)
  const isAnimating = departing !== null
  const autoSlide = !!(section as any).auto_slide
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)

  // sync order array length when heroImages changes
  useEffect(() => {
    setOrder(heroImages.map((_, i) => i))
    setDeparting(null)
  }, [heroImages.length])

  // auto-slide
  useEffect(() => {
    if (!autoSlide || total <= 1) return
    autoRef.current = setTimeout(goNext, 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [order, autoSlide, total])

  const goNext = () => {
    if (isAnimating || total <= 1) return
    const frontIdx = order[0]
    setDeparting(frontIdx)
    // After CSS keyframe finishes (600ms), move front card to back of order
    setTimeout(() => {
      setOrder(prev => {
        const next = [...prev]
        const [front] = next.splice(0, 1)
        next.push(front)
        return next
      })
      setDeparting(null)
    }, 600)
  }

  const goPrev = () => {
    if (isAnimating || total <= 1) return
    setOrder(prev => {
      const next = [...prev]
      const back = next.pop()!
      next.unshift(back)
      return next
    })
  }

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev()
    touchStartX.current = null
  }

  const bgColor = sectionBg ?? "#f7f4ef"
  const isLight = !bgColor.startsWith("#0") && !bgColor.startsWith("#1") && bgColor !== "#000000"

  // Slot visual config: slot 0 = front, 1 = mid, 2 = back
 const slotConfig = [
    { x: 0,  y: 0,  rot: 0,  scale: 1,    brightness: 1,    opacity: 1,    z: 30 },
    { x: 28, y: 14, rot: 5,  scale: 0.93, brightness: 0.92, opacity: 0.95, z: 20 },
    { x: 52, y: 26, rot: 10, scale: 0.86, brightness: 0.82, opacity: 0.88, z: 10 },
  ]

  const activeImageIdx = order[0] ?? 0
  const animId = `fling-${departing}`

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: bgColor, minHeight: "min(90vh, 700px)" }}
    >
      {/* Inject fling keyframe — only while animating */}
      {departing !== null && (
        <style>{`
          @keyframes ${animId} {
            0%   { transform: translate(0px,    0px)    rotate(0deg)   scale(1);    opacity: 1;    filter: brightness(1); }
            60%  { transform: translate(-160px, -120px) rotate(-18deg) scale(0.85); opacity: 0.5;  filter: brightness(0.6); }
            100% { transform: translate(-220px, -80px)  rotate(-22deg) scale(0.78); opacity: 0;    filter: brightness(0.3); }
          }
        `}</style>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 md:gap-0 min-h-[min(90vh,700px)]">

        {/* ── LEFT text ── */}
        <motion.div
          className="flex-1 flex flex-col justify-center md:pr-12"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {(section.hero_badge ?? "Official Collection") && (
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px" style={{ background: brandPrimary }} />
              <span className="text-[10px] uppercase tracking-[0.4em] font-semibold"
                style={{ color: brandPrimary }}>
                {section.hero_badge ?? "Official Collection"}
              </span>
            </div>
          )}

          <h1
            className={`font-extrabold leading-[1.0] mb-5 ${
              section.headline_size === "sm" ? "text-4xl md:text-5xl" :
              section.headline_size === "md" ? "text-5xl md:text-6xl" :
              "text-5xl md:text-7xl"
            }`}
            style={{ color: headlineColor, fontFamily: "var(--font-playfair)", letterSpacing: "-0.02em", whiteSpace: "pre-wrap" }}
          >
            {section.headline}
          </h1>

          <div className="w-16 h-0.5 mb-5" style={{ background: brandPrimary }} />

          {(section.subtext || store?.tagline) && (
            <p className="text-base leading-relaxed mb-8 max-w-xs"
              style={{ color: isLight ? "#6b7280" : `${headlineColor}99` }}>
              {section.subtext || store?.tagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-8">
                        {section.cta_label && (
              <Link
                href={resolveUrl(section.cta_url ?? "/products", handle, bare)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 hover:gap-4"
                style={{
                  background: (section as any).cta_bg_color ?? brandPrimary,
                  color: (section as any).cta_text_color ?? "#ffffff",
                  borderRadius: `${(section as any).cta_border_radius ?? 2}px`,
                  border: (section as any).cta_border_color
                    ? `2px solid ${(section as any).cta_border_color}`
                    : "2px solid transparent",
                }}
              >
                {section.cta_label} <span>→</span>
              </Link>
            )}
            {secCtaLabel && (
              <Link
                href={resolveUrl(secCtaUrl ?? "/products", handle, bare)}
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest transition-all hover:gap-3"
                style={{
                  color: (section as any).sec_cta_text_color ?? (isLight ? "#374151" : headlineColor),
                  background: (section as any).sec_cta_bg_color ?? "transparent",
                  borderRadius: `${(section as any).sec_cta_border_radius ?? 2}px`,
                  border: (section as any).sec_cta_border_color
                    ? `2px solid ${(section as any).sec_cta_border_color}`
                    : "none",
                  opacity: (section as any).sec_cta_text_color ? 1 : 0.7,
                }}
              >
                {secCtaLabel} <span>↗</span>
              </Link>
            )}
          </div>

          {/* {total > 1 && (
            <div className="flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button key={i}
                  onClick={() => !isAnimating && setOrder(prev => {
                    // rotate order until i is at front
                    const idx = prev.indexOf(i)
                    if (idx <= 0) return prev
                    return [...prev.slice(idx), ...prev.slice(0, idx)]
                  })}
                  style={{
                    width: order[0] === i ? "24px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: order[0] === i ? brandPrimary : (isLight ? "#d1d5db" : "#ffffff40"),
                    transition: "all 0.3s ease",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
              <span className="ml-2 text-[10px] font-semibold tabular-nums"
                style={{ color: isLight ? "#9ca3af" : "#ffffff60" }}>
                {String(activeImageIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          )} */}
        </motion.div>

        {/* ── RIGHT card deck ── */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: "min(360px, 88vw)", height: "min(480px, 72vw)" }}
          onMouseEnter={() => setShowArrows(true)}
          onMouseLeave={() => setShowArrows(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/*
            KEY INSIGHT: each card is keyed by its IMAGE INDEX not slot position.
            This means the same DOM node always renders the same image.
            We only control visual slot via inline style transforms.
            The departing card gets a CSS @keyframe animation applied directly —
            no React state drives its position mid-animation.
          */}
          {order.map((imgIdx, slot) => {
            if (slot > 2) return null // only render 3 cards
            const cfg = slotConfig[slot]
            const isFront    = slot === 0
            const isDeparting = imgIdx === departing

            const restStyle: React.CSSProperties = {
              position: "absolute",
              inset: 0,
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: isFront
                ? "0 25px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15)"
                : "0 10px 30px rgba(0,0,0,0.15)",
              zIndex: cfg.z,
              transformOrigin: "bottom left",
              willChange: "transform",
              // When departing: play keyframe, ignore transform/opacity/filter below
              // When NOT departing: CSS transition snaps cards into slot positions
              ...(isDeparting ? {
                animation: `${animId} 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                transition: "none",
                pointerEvents: "none",
              } : {
                transform: `translate(${cfg.x}px, ${cfg.y}px) rotate(${cfg.rot}deg) scale(${cfg.scale})`,
                opacity: cfg.opacity,
                filter: `brightness(${cfg.brightness})`,
                transition: "transform 500ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity 400ms ease, filter 400ms ease",
                cursor: isFront && total > 1 ? "pointer" : "default",
              }),
            }

            return (
              <div
                key={imgIdx}
                style={restStyle}
                onClick={() => isFront && !isDeparting && goNext()}
              >
                <img
                  src={heroImages[imgIdx]}
                  alt={`${vendor.name} — look ${imgIdx + 1}`}
                  className="w-full h-full object-cover object-top select-none"
                  draggable={false}
                />

                {isFront && !isDeparting && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 55%)" }} />
                )}

                {isFront && !isDeparting && total > 1 && (
                  <>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white backdrop-blur-sm pointer-events-none"
                      style={{ background: "rgba(0,0,0,0.35)" }}>
                      {activeImageIdx + 1} / {total}
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium text-white backdrop-blur-sm pointer-events-none"
                      style={{ background: "rgba(0,0,0,0.22)" }}>
                      tap to flip ↩
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center hover:scale-110"
                style={{
                  color: brandPrimary,
                  opacity: showArrows ? 1 : 0,
                  pointerEvents: showArrows ? "auto" : "none",
                  transition: "opacity 0.2s ease, transform 0.15s ease",
                  background: "none",
                  border: "none",
                  padding: "4px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ── EditorialFeaturedProduct ──────────────────────────────────────────────────

function EditorialFeaturedProduct({ section, product, handle, brandPrimary, sectionBg, sectionText, bare }: {
  section: any
  product: any
  handle: string
  brandPrimary: string
  sectionBg?: string
  sectionText?: string
  bare: boolean
}) {
  const { openCart, refreshCart } = useCart()

  const showTitle  = section.featured_product_show_title  !== false
  const showPrice  = section.featured_product_show_price  !== false
  const showColors = section.featured_product_show_colors !== false
  const heading    = section.featured_product_heading as string | undefined
  const imageLeft  = (section.image_position ?? "left") === "left"

  const hexColorMap: Record<string, string> = {}
  try {
    const rawHex = product?.metadata?.color_hex_values
    if (rawHex) {
      const parsed: { name: string; hex: string }[] = JSON.parse(rawHex)
      for (const c of parsed) hexColorMap[c.name.toLowerCase().trim()] = c.hex
    }
  } catch {}

  const fallbackMap: Record<string, string> = {
    "off white":"#f5f0e8","offwhite":"#f5f0e8","cream":"#fffdd0","beige":"#f5f5dc",
    "charcoal":"#36454f","ash":"#b2beb5","baby pink":"#f4c2c2","light pink":"#ffb6c1",
    "sky blue":"#87ceeb","royal blue":"#4169e1","mint":"#98ff98","olive green":"#556b2f",
    "wine":"#722f37","maroon":"#800000","rust":"#b7410e","mustard":"#ffdb58",
    "lavender":"#e6e6fa","brown":"#964b00","gold":"#ffd700","silver":"#c0c0c0",
    "multicolor":"linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
    "multi":"linear-gradient(135deg,#f00,#f70,#ff0,#0f0,#00f,#8b00ff)",
  }

  const resolveHex = (name: string) => hexColorMap[name.toLowerCase().trim()] ?? fallbackMap[name.toLowerCase().trim()] ?? null
  const isLightHex = (hex: string) => {
    if (!hex.startsWith("#") || hex.length < 7) return false
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return (r*299 + g*587 + b*114)/1000 > 200
  }

  const productOpts: any[] = product?.options ?? []
  const colorOption = productOpts.find((o: any) => o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "colour")
  const sizeOption  = productOpts.find((o: any) => o.title?.toLowerCase() === "size")
  const colorNames: string[] = colorOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []
  const sizeNames:  string[] = sizeOption?.values?.map((v: any) => v.value).filter(Boolean) ?? []
  const allImages: any[] = product?.images ?? []

  const getImagesForColor = (colorName: string): string | null => {
    const colorSlug = colorName.toLowerCase().replace(/\s+/g, "_")
    const frontMatch = allImages.find((img: any) => img.url?.toLowerCase().includes(colorSlug) && img.url?.toLowerCase().includes("front"))
    if (frontMatch) return frontMatch.url
    const anyMatch = allImages.find((img: any) => img.url?.toLowerCase().includes(colorSlug))
    return anyMatch?.url ?? null
  }

  const [selectedColor, setSelectedColor] = useState<string>(colorNames[0] ?? "")
  const [selectedSize,  setSelectedSize]  = useState<string>(sizeNames[0] ?? "")
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)

  const displayImage = (selectedColor ? getImagesForColor(selectedColor) : null) ?? product?.thumbnail ?? null

  const findVariant = () => {
    if (!product?.variants?.length) return null
    return product.variants.find((v: any) => {
      const opts: any[] = v.options ?? []
      const hasColor = !selectedColor || opts.some((o: any) => (o.value ?? o.option_value ?? "").toLowerCase() === selectedColor.toLowerCase())
      const hasSize  = !selectedSize  || opts.some((o: any) => (o.value ?? o.option_value ?? "").toLowerCase() === selectedSize.toLowerCase())
      if (opts.length === 0) {
        const title = v.title ?? ""
        return (!selectedColor || title.toLowerCase().includes(selectedColor.toLowerCase())) &&
               (!selectedSize  || title.toLowerCase().includes(selectedSize.toLowerCase()))
      }
      return hasColor && hasSize
    }) ?? product.variants[0]
  }

  const selectedVariant = findVariant()

  const getPrice = (): string => {
    const v = selectedVariant ?? product?.variants?.[0]
    if (!v) return ""
    if (v.calculated_price?.calculated_amount != null) return `₹${Number(v.calculated_price.calculated_amount).toLocaleString("en-IN")}`
    const raw = v.prices?.[0]?.amount
    if (raw != null) return `₹${Number(raw).toLocaleString("en-IN")}`
    return ""
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) { setCartError("Please select all options"); return }
    setIsAdding(true); setCartError(null)
    try {
      await addToCart({ handle, variantId: selectedVariant.id, quantity })
      await refreshCart()
      setAdded(true); openCart()
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      setCartError(e?.message ?? "Failed to add to cart")
    } finally { setIsAdding(false) }
  }

  if (!product) return null

  return (
    <div className={`flex flex-col gap-12 items-start ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      <div className="w-full md:w-[48%] shrink-0">
        <div className="relative overflow-hidden bg-gray-100 rounded-2xl aspect-[3/4]">
          {displayImage ? (
            <Image key={displayImage} src={displayImage} alt={product.title ?? "Product"} fill quality={90}
              sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-opacity duration-300" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-6xl opacity-20">🛍️</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 md:pt-2">
        {heading && (
          <h2 className="text-3xl font-bold leading-tight"
            style={{ color: sectionText ?? "#111827", fontFamily: "var(--font-playfair)" }}>
            {heading}
          </h2>
        )}
        {showTitle && product.title && (
          <p className="text-lg font-semibold" style={{ color: sectionText ?? "#374151" }}>{product.title}</p>
        )}
        {section.text && (
          <div className="text-base leading-relaxed prose-sm prose rte-content max-w-none"
            style={{ color: sectionText ? `${sectionText}bb` : "#4b5563" }}
            dangerouslySetInnerHTML={{ __html: section.text }} />
        )}
        {showPrice && getPrice() && (
          <p className="text-2xl font-bold" style={{ color: brandPrimary }}>{getPrice()}</p>
        )}

        {showColors && colorNames.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
              style={{ color: sectionText ?? "#9ca3af" }}>
              Color{selectedColor && <span className="ml-2 font-normal normal-case"> — {selectedColor}</span>}
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              {colorNames.slice(0, 88).map(colorName => {
                const hex = resolveHex(colorName)
                const isGrad = hex?.startsWith("linear-gradient")
                const light = hex && !isGrad ? isLightHex(hex) : false
                const isSelected = selectedColor === colorName
                return (
                  <button key={colorName} title={colorName} onClick={() => setSelectedColor(colorName)}
                    className="w-8 h-8 transition-all rounded-full shrink-0 hover:scale-110"
                    style={{
                      ...(isGrad ? { background: hex! } : { backgroundColor: hex ?? colorName }),
                      boxShadow: isSelected
                        ? `0 0 0 2.5px white, 0 0 0 4.5px ${brandPrimary}`
                        : light ? "0 0 0 1.5px #d1d5db, 0 1px 4px rgba(0,0,0,0.12)"
                        : "0 0 0 2px rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.2)",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {sizeNames.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
              style={{ color: sectionText ?? "#9ca3af" }}>
              Size{selectedSize && <span className="ml-2 font-normal normal-case"> — {selectedSize}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {sizeNames.map(size => {
                const isSelected = selectedSize === size
                return (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: isSelected ? brandPrimary : `${brandPrimary}30`,
                      backgroundColor: isSelected ? brandPrimary : "transparent",
                      color: isSelected ? "#ffffff" : (sectionText ?? "#374151"),
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                    }}>
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {cartError && (
          <p className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg bg-red-50">{cartError}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center overflow-hidden border-2 rounded-full shrink-0"
            style={{ borderColor: "#e5e7eb" }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex items-center justify-center w-10 h-12 text-gray-500 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-sm font-semibold text-center text-gray-900">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}
              className="flex items-center justify-center w-10 h-12 text-gray-500 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={handleAddToCart} disabled={isAdding}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-70"
            style={{ background: added ? "#16a34a" : `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}>
            {isAdding ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> :
             added    ? <><Check className="w-4 h-4" />Added to cart!</> :
                        <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── EditorialImageSlider component ───────────────────────────────────────────

function EditorialImageSlider({ slides, height, autoplay, interval, fit, showDots, showArrows, brandPrimary, handle, bare }: {
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

  const go = (idx: number) => setCurrent((idx + slides.length) % slides.length)

  useEffect(() => {
    if (!autoplay || slides.length < 2) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), interval * 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoplay, interval, slides.length])

  const slide = slides[current]
  if (!slide?.image) return null

  const content = (
    <div className="relative w-full overflow-hidden select-none" style={{ height }}>
      {slides.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}>
          <Image src={s.image} alt={s.caption ?? `Slide ${i + 1}`} fill quality={90} sizes="100vw"
            className="transition-opacity duration-500" style={{ objectFit: fit as any }} />
          {s.caption && (
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-sm font-semibold text-white drop-shadow">{s.caption}</p>
            </div>
          )}
        </div>
      ))}
      {showArrows && slides.length > 1 && (
        <>
          <button onClick={e => { e.preventDefault(); go(current - 1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={e => { e.preventDefault(); go(current + 1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="transition-all duration-200 rounded-full"
              style={{ width: i === current ? 20 : 6, height: 6,
                background: i === current ? brandPrimary : "rgba(255,255,255,0.6)" }} />
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

function defaultSections(vendor: PublicVendor): StoreSection[] {
  return [
    { type: "hero", headline: vendor.name, subtext: vendor.creator_title ?? undefined, cta_label: "Shop the Collection", cta_url: "/products", hero_image_right: undefined } as any,
    { type: "collection", title: "The Collection", limit: 12 },
    ...(vendor.creator_bio ? [{ type: "about" as const, title: "The Creator" }] : []),
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true },
  ]
}
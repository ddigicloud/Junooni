"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Instagram, Youtube, Twitter, Facebook, ArrowRight, ChevronRight } from "lucide-react"
import type { PublicVendor, VendorStore, Product, StoreSection, CategoryMeta, CollectionMeta } from "@/lib/types"
import ProductCarousel from "@/components/ui/ProductCarousel"
import AnnouncementBar from "@/components/sections/AnnouncementBar"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

interface Props {
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
}

export default function MinimalTemplate({ vendor, store: initialStore, products, categories, collections }: Props) {
  const [liveStore, setLiveStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

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

  const store = liveStore
  const sections = store?.sections?.sections ?? defaultSections(vendor)
  const brandPrimary = store?.primary_color ?? "#e65100"
  const fontClass = store?.font === "poppins" ? "font-poppins" : store?.font === "playfair" ? "font-playfair" : "font-inter"
  const handle = vendor.handle

  return (
    <div className={`min-h-screen bg-white ${fontClass}`}>
      {/* ── HEADER + ANNOUNCEMENT ── */}
      {(() => {
        const stickyHdr = (store as any)?.sticky_header !== false
        const stickyAnn = (store as any)?.sticky_announcement !== false
        const wrapSticky = stickyHdr || stickyAnn
        const annSections = sections.filter(s => s.type === "announcement" && !(s as any).hidden)
        return (
          <div className={wrapSticky ? "sticky top-0 z-40" : "relative"}>
            {annSections.map((s, i) => (
              <AnnouncementBar key={i} section={s as any} />
            ))}
            <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />
          </div>
        )
      })()}

      {/* ── PAGE SECTIONS ── */}
      {sections.filter(s => !(s as any).hidden).map((section, i) => {
        const secId = (section as any).id
        const isSelected = secId && selectedSectionId === secId
        const isEditorMode = typeof window !== "undefined" && window.parent !== window
        const secBg   = (section as any).background_color
        const secText = (section as any).text_color
        return (
          <div
            key={i}
            onClick={() => isEditorMode && secId && window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: secId }, "*")}
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

function MinimalSection({ section, vendor, store, products, categories, collections, brandPrimary, sectionBg, sectionText }: {
  section: StoreSection
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
  brandPrimary: string
  sectionBg?: string
  sectionText?: string
}) {
  const handle = vendor.handle
  if ((section as any).hidden) return null

  switch (section.type) {
    case "announcement": return null

    // ── Hero ───────────────────────────────────────────────────────────────────
    case "hero": {
      // overlay_color/overlay_text_color = hero-specific (image tint + text)
      // sectionBg/sectionText = section-level bg/text override (independent)
      const overlayColor     = (section as any).overlay_color      as string | undefined
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

      return (
        <section
          className="relative overflow-hidden border-b border-gray-100"
          style={{ backgroundColor: sectionBg ?? "#f9fafb" }}
        >
          {/* Background image */}
          {(section.background_image ?? store?.hero_image) && (
            <div className="absolute inset-0">
              <Image
                src={section.background_image ?? store!.hero_image!}
                alt="Hero"
                fill
                className="object-cover"
                style={{ opacity: overlayColor ? 1 : 0.15 }}
              />
              {/* Colour overlay tint on top of image */}
              {overlayColor && (
                <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: 0.55 }} />
              )}
            </div>
          )}

          <div className="relative z-10 px-6 py-16 mx-auto max-w-7xl md:py-24">
            <div className="flex flex-col items-center gap-12 md:flex-row">
              {/* Text side */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Creator badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                  style={{ background: `${brandPrimary}15`, color: brandPrimary }}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Official Merch Store
                </div>

                <h1
                  className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl"
                  style={{ color: headlineColor }}
                >
                  {section.headline ?? vendor.name}
                </h1>

                {(section.subtext ?? store?.tagline) && (
                  <p className="max-w-md mb-8 text-lg leading-relaxed" style={{ color: subtextColor }}>
                    {section.subtext ?? store?.tagline}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  {/* Primary CTA */}
                  {section.cta_label && (
                    <Link
                      href={section.cta_url ?? `/${handle}/products`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
                    >
                      {section.cta_label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {/* Secondary CTA — only render if label is set */}
                  {secCtaLabel && (
                    <Link
                      href={secCtaUrl ?? `/${handle}/products`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border-2 transition-all hover:border-gray-400"
                      style={{
                        color: headlineColor,
                        borderColor: overlayTextColor
                          ? `${overlayTextColor}50`
                          : sectionText
                            ? `${sectionText}40`
                            : "#e5e7eb",
                      }}
                    >
                      {secCtaLabel}
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Creator image/logo side */}
              {(vendor.coverphoto ?? vendor.logo) && (
                <motion.div
                  className="w-full shrink-0 md:w-80 lg:w-96"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <div className="relative overflow-hidden shadow-2xl aspect-square rounded-3xl">
                    <Image src={vendor.coverphoto ?? vendor.logo!} alt={vendor.name} fill className="object-cover" priority />
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
      if (!featured.length) return null
      return (
        <section id="products" className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: sectionText ?? "#111827" }}>{section.title ?? "Featured"}</h2>
                <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>Hand-picked for you</p>
              </div>
              <Link href={`/${handle}/products`} className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2" style={{ color: brandPrimary }}>
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductCarousel products={featured} handle={handle} brandPrimary={brandPrimary} variant="light" />
          </div>
        </section>
      )
    }

    // ── All products collection ────────────────────────────────────────────────
    case "collection": {
      const limited = products.slice(0, section.limit ?? 12)
      if (!limited.length) return null
      return (
        <section id="products" className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "#f9fafb" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: sectionText ?? "#111827" }}>{section.title ?? "All Products"}</h2>
                <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>{products.length} products available</p>
              </div>
              <Link href={`/${handle}/products`} className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2" style={{ color: brandPrimary }}>
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductCarousel products={limited} handle={handle} brandPrimary={brandPrimary} variant="light" />
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
      if (!toShow.length) return null
      const cols = (section as any).columns ?? 3
      const gridClass = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
      return (
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: sectionText ?? "#111827" }}>
                {(section as any).title ?? "Shop by Collection"}
              </h2>
              <Link href={`/${handle}/collections`} className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2" style={{ color: brandPrimary }}>
                View all <span>→</span>
              </Link>
            </div>
            <div className={`grid ${gridClass} gap-5`}>
              {toShow.map(col => {
                const thumb = (col as any).thumbnail
                  ?? products.find(p => (p as any).collection?.handle === col.handle)?.thumbnail
                  ?? products.find(p => ((section as any).collection_ids ?? []).length === 0 || (p as any).collection?.id === col.id)?.images?.[0]?.url
                const productCount = products.filter(p => (p as any).collection?.handle === col.handle).length
                return (
                  <Link key={col.id} href={`/${handle}/collections/${col.handle}`} className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3] block">
                    {thumb
                      ? <Image src={thumb} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"><span className="text-4xl">🛍️</span></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-lg font-bold leading-tight text-white">{col.title}</p>
                      {productCount > 0 && <p className="text-white/70 text-sm mt-0.5">{productCount} product{productCount !== 1 ? "s" : ""}</p>}
                    </div>
                    <div className="absolute transition-opacity opacity-0 top-3 right-3 group-hover:opacity-100">
                      <span className="text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">Shop →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )
    }

    case "divider": {
      if (!collections.length) return <hr className="mx-6 border-gray-100" />
      return (
        <section className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: sectionText ?? "#111827" }}>Collections</h2>
                <p className="mt-1 text-sm" style={{ color: sectionText ? `${sectionText}80` : "#9ca3af" }}>Shop by collection</p>
              </div>
              <Link href={`/${handle}/collections`} className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2" style={{ color: brandPrimary }}>
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {collections.slice(0, 4).map(col => {
                const colThumb = (col as any).thumbnail
                const colProductIds = (col as any).product_ids ?? []
                const colProduct = colProductIds.length > 0
                  ? products.find(p => colProductIds.includes(p.id))
                  : products.find(p => (p as any).collection?.handle === col.handle)
                const coverImg = colThumb || colProduct?.thumbnail
                return (
                  <Link key={col.id} href={`/${handle}/collections/${col.handle}`}
                    className="overflow-hidden transition-all border border-gray-100 shadow-sm group rounded-2xl hover:shadow-md"
                    style={{ backgroundColor: sectionBg ? `${sectionBg}cc` : "#ffffff" }}>
                    <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                      {coverImg
                        ? <Image src={coverImg} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="flex items-center justify-center w-full h-full"><span className="text-3xl opacity-20">🛍</span></div>}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold" style={{ color: sectionText ?? "#111827" }}>{col.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: brandPrimary }}>{col.product_count} items</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
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
              <p className="text-base leading-relaxed" style={{ color: sectionText ? `${sectionText}cc` : "#4b5563" }}>
                {section.text ?? vendor.creator_bio ?? "Official merchandise store."}
              </p>
              {vendor.creator_title && <p className="mt-4 text-sm font-medium" style={{ color: brandPrimary }}>{vendor.creator_title}</p>}
            </div>
          </div>
        </div>
      </section>
    )

    // ── Social ─────────────────────────────────────────────────────────────────
    case "social": {
      const socials = [
        { key: "show_instagram", label: "Instagram", icon: Instagram, getUrl: (v: PublicVendor) => v.instagram ? `https://instagram.com/${v.instagram}` : null },
        { key: "show_youtube",   label: "YouTube",   icon: Youtube,   getUrl: (v: PublicVendor) => v.youtube   ? `https://youtube.com/${v.youtube}`   : null },
        { key: "show_twitter",   label: "Twitter",   icon: Twitter,   getUrl: (v: PublicVendor) => v.xtwitter  ? `https://twitter.com/${v.xtwitter}`  : null },
        { key: "show_facebook",  label: "Facebook",  icon: Facebook,  getUrl: (v: PublicVendor) => v.facebook  ? `https://facebook.com/${v.facebook}` : null },
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
          <div className="max-w-3xl mx-auto prose prose-lg" style={{ color: sectionText ?? "#374151" }}
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
      if (!(section as any).image) return null
      return (
        <section className="w-full" style={{ backgroundColor: sectionBg ?? "transparent" }}>
          <img src={(section as any).image} alt={section.title ?? "Section image"} className="w-full object-cover max-h-[600px]" />
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

    default: return null
  }
}

// ── Default sections ──────────────────────────────────────────────────────────

function defaultSections(vendor: PublicVendor): StoreSection[] {
  return [
    { type: "hero", headline: vendor.name, subtext: vendor.creator_title ?? undefined, cta_label: "Shop Now", cta_secondary_label: "Browse all", cta_secondary_url: "/products" } as any,
    { type: "collection", title: "All Products", limit: 12 },
    { type: "divider" },
    { type: "about", title: "About Me" },
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true, show_facebook: true },
  ]
}
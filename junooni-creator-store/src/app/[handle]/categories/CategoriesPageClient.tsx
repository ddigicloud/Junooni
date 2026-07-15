"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

const FAKE_CATEGORIES = [
  { id: "fcat_1", name: "T-Shirts",     image: "/minimaltee.jpeg",     count: 12 },
  { id: "fcat_2", name: "Hoodies",      image: "/minimalhoodie.jpeg",  count: 8  },
  { id: "fcat_3", name: "Accessories",  image: "/minimalcap.jpeg",     count: 6  },
  { id: "fcat_4", name: "Limited Drops",image: "/minimalmug.jpeg",     count: 4  },
]

interface Props {
  vendor: any
  initialStore: any
  products: any[]
  categories: any[]
  collections: any[]
  handle: string
}

export default function CategoriesPageClient({
  vendor, initialStore, products, categories, collections, handle,
}: Props) {
  const [store, setStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

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

  const brandPrimary   = store?.primary_color   ?? "#e65100"
  const brandSecondary = store?.secondary_color ?? "#000"
  const isDark         = store?.template === "bold"

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  const fontClass =
  store?.font === "poppins"       ? "font-poppins" :
  store?.font === "playfair"      ? "font-playfair" :
  store?.font === "dm-sans"       ? "font-dm-sans" :
  store?.font === "space-grotesk" ? "font-space-grotesk" :
  store?.font === "nunito"        ? "font-nunito" :
  store?.font === "raleway"       ? "font-raleway" :
  store?.font === "montserrat"    ? "font-montserrat" :
  "font-inter"

  const pageSections: any[] = store?.sections?.page_layouts?.categories?.sections ?? []
  const [isEditorMode, setIsEditorMode] = useState(false)
  useEffect(() => {
    setIsEditorMode(window.parent !== window)
  }, [])

  // Virtual grid settings section
  const gridSettings = pageSections.find((s: any) => s.id === "__category_grid__") ?? {}
  const gridColumns  = gridSettings.columns ?? 4
  const gridTitle    = gridSettings.title   ?? "Categories"
  const gridBg       = gridSettings.background_color
  const gridText     = gridSettings.text_color

  // Only real sections (not virtual) shown below grid
  const visibleSections = pageSections.filter(
    (s: any) => s.id !== "__category_grid__" && !s.hidden
  )

  const isGridSelected = selectedSectionId === "__category_grid__"

  const gridColClass =
    gridColumns === 2 ? "grid-cols-2" :
    gridColumns === 3 ? "grid-cols-2 sm:grid-cols-3" :
    gridColumns === 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" :
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

  const renderSection = (section: any) => {
    const isSelected = selectedSectionId === section.id
    const secBg   = section.background_color ?? undefined
    const secText = section.text_color ?? undefined

    return (
      <div
        key={section.id}
        data-section-id={section.id}
        onClick={() => {
          if (isEditorMode && section.id)
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: section.id }, "*")
        }}
        onDoubleClick={() => {
          if (isEditorMode && section.id)
            window.parent?.postMessage({ type: "SECTION_DBLCLICK", sectionId: section.id }, "*")
        }}
        className={`relative transition-all ${isEditorMode ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: secBg,
          color: secText,
          ...(isSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}),
        }}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
            style={{ background: "#e65100", borderBottomRightRadius: "6px" }}>
            Editing
          </div>
        )}

        {section.type === "hero" && (
          <div className="relative overflow-hidden py-16 px-6"
            style={{ backgroundColor: secBg ?? (isDark ? "#111" : "#f9fafb") }}>
            {section.background_image && (
              <div className="absolute inset-0">
                <Image src={section.background_image} alt="Hero" fill className="object-cover opacity-20" />
              </div>
            )}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              {section.headline && (
                <h2 className="text-4xl font-extrabold mb-4"
                  style={{ color: section.overlay_text_color ?? secText ?? (isDark ? "#fff" : "#111827") }}>
                  {section.headline}
                </h2>
              )}
              {section.subtext && (
                <p className="text-lg opacity-70 mb-6"
                  style={{ color: secText ?? (isDark ? "#fff" : "#4b5563") }}>
                  {section.subtext}
                </p>
              )}
              {section.cta_label && (
                <Link href={section.cta_url ?? "#"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
                  {section.cta_label}
                </Link>
              )}
            </div>
          </div>
        )}

        {section.type === "ticker" && (() => {
          const items: string[] = section.ticker_items ?? ["Official creator merchandise"]
          const sep = section.ticker_separator ?? "✦"
          const speed = section.ticker_speed ?? 40
          const bg = secBg ?? "#111827"
          const fg = secText ?? "#ffffff"
          const line = items.join(`  ${sep}  `)
          const duration = Math.round(200 - speed * 1.5)
          return (
            <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
              <style>{`
                @keyframes cat-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                .cat-ticker-inner { display:inline-flex; white-space:nowrap; animation:cat-ticker ${duration}s linear infinite; }
              `}</style>
              <div className="cat-ticker-inner text-sm font-medium tracking-wide" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
              </div>
            </div>
          )
        })()}

        {section.type === "image_text" && (
          <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: secBg }}>
            <div className="mx-auto max-w-6xl">
              <div className={`flex gap-10 items-center ${
                (section.mobile_image_position ?? "top") === "top" ? "flex-col" : "flex-col-reverse"
              } ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="w-full md:w-1/2 shrink-0">
                  {section.image ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
                      <Image src={section.image} alt={section.title ?? ""} fill className="object-cover" />
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
                      style={{ color: secText ?? (isDark ? "#fff" : "#111827") }}
                      dangerouslySetInnerHTML={{ __html: section.title }} />
                  )}
                  {section.text && (
                    <div className="text-base leading-relaxed mb-6 prose prose-sm max-w-none"
                      style={{ color: secText ? `${secText}cc` : (isDark ? "#d1d5db" : "#4b5563") }}
                      dangerouslySetInnerHTML={{ __html: section.text }} />
                  )}
                  {section.cta_label && (
                    <Link href={section.cta_url ?? "#"}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold hover:opacity-90 text-sm"
                      style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
                      {section.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {section.type === "text" && section.text && (
          <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: secBg }}>
            <div className="max-w-3xl mx-auto prose prose-lg"
              style={{ color: secText ?? (isDark ? "#d1d5db" : "#374151") }}
              dangerouslySetInnerHTML={{ __html: section.text }} />
          </div>
        )}

        {section.type === "image" && (() => {
          if (!section.image) {
            if (!isEditorMode) return null
            return (
              <div style={{
                backgroundColor: secBg ?? "transparent",
                paddingTop:    `${section.padding_top    ?? 0}px`,
                paddingBottom: `${section.padding_bottom ?? 0}px`,
              }}>
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 mx-6 rounded-xl">
                  <div className="text-center">
                    <span className="text-4xl">🖼️</span>
                    <p className="text-sm text-gray-400 mt-2">Upload an image in the left panel</p>
                  </div>
                </div>
              </div>
            )
          }

          const heightMode     = section.image_height_mode ?? "auto"
          const widthMode      = section.image_width_mode  ?? "full"
          const fit            = section.image_fit         ?? "cover"
          const overlayPct     = section.overlay_opacity   ?? 0
          const radius         = section.border_radius     ?? 0
          const titlePlacement = section.title_placement   ?? "over"
          const titlePos       = section.title_position    ?? "center"

          const justifyMap: Record<string, string> = {
            left: "justify-start", center: "justify-center", right: "justify-end",
          }

          const imgStyle: React.CSSProperties = {
            objectFit:    fit as any,
            borderRadius: radius,
            width:        "100%",
            display:      "block",
            ...(heightMode === "fixed"  ? { height: `${section.image_height_px ?? 400}px` } : {}),
            ...(heightMode === "screen" ? { height: `${section.image_height_vh ?? 70}vh`  } : {}),
            ...(heightMode === "auto"   ? { height: "auto", maxHeight: "600px"            } : {}),
          }

          const wrapStyle: React.CSSProperties = {
            backgroundColor: secBg ?? "transparent",
            paddingTop:    `${section.padding_top    ?? 0}px`,
            paddingBottom: `${section.padding_bottom ?? 0}px`,
          }

          const innerStyle: React.CSSProperties = {
            ...(widthMode === "contained" ? { maxWidth: "1280px", margin: "0 auto", padding: "0 24px" } : {}),
            ...(widthMode === "custom"    ? { maxWidth: `${section.image_width_pct ?? 80}%`, margin: "0 auto" } : {}),
          }

          const titleEl = section.title ? (
            <div className={`flex w-full ${justifyMap[titlePos]}`}>
              <h2
                className="text-2xl font-bold px-2 py-1"
                style={{ color: section.title_color ?? (isDark ? "#ffffff" : "#111827") }}
              >
                {section.title}
              </h2>
            </div>
          ) : null

          const imgContent = (
            <div style={{ position: "relative", borderRadius: radius, overflow: "hidden" }}>
              <img
                src={section.image}
                alt={section.image_alt ?? section.title ?? ""}
                style={imgStyle}
              />
              {overlayPct > 0 && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: section.overlay_color ?? "#000000",
                  opacity:    overlayPct / 100,
                }} />
              )}
              {section.title && titlePlacement === "over" && (
                <div className={`absolute inset-0 flex items-center px-6 ${justifyMap[titlePos]}`}>
                  <h2
                    className="text-2xl font-bold drop-shadow-lg"
                    style={{ color: section.title_color ?? "#ffffff" }}
                  >
                    {section.title}
                  </h2>
                </div>
              )}
            </div>
          )

          return (
            <div style={wrapStyle}>
              <div style={innerStyle}>
                {titlePlacement === "above" && titleEl}
                {section.image_link
                  ? <a href={section.image_link}>{imgContent}</a>
                  : imgContent
                }
                {titlePlacement === "below" && titleEl}
              </div>
            </div>
          )
        })()}

        {section.type === "video" && (() => {
          const raw = section.video_url ?? ""
          const yt = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
          const vm = raw.match(/vimeo\.com\/(\d+)/)
          const embedUrl = yt
            ? `https://www.youtube.com/embed/${yt[1]}?rel=0`
            : vm ? `https://player.vimeo.com/video/${vm[1]}` : null
          if (!embedUrl) return null
          return (
            <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: secBg }}>
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="mb-6 text-2xl font-bold text-center"
                    style={{ color: secText ?? (isDark ? "#fff" : "#111827") }}>
                    {section.title}
                  </h2>
                )}
                <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ border: 0 }} />
                </div>
              </div>
            </div>
          )
        })()}

        {section.type === "divider" && (
          <div className="px-6" style={{
            backgroundColor: section.background_color ?? undefined,
            paddingTop: `${section.padding_top ?? 16}px`,
            paddingBottom: `${section.padding_bottom ?? 16}px`,
          }}>
            <div style={{
              height: `${(section as any).divider_thickness ?? 1}px`,
              backgroundColor: (section as any).divider_color ?? "#e5e7eb",
              borderRadius: `${(section as any).divider_thickness ?? 1}px`,
            }} />
          </div>
        )}

        {section.type === "html" && section.html_content && (
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:system-ui,sans-serif}</style></head><body>${section.html_content}</body></html>`}
            className="w-full border-0" style={{ minHeight: "150px" }}
            sandbox="allow-scripts allow-same-origin"
            onLoad={e => {
              try {
                const doc = (e.currentTarget as HTMLIFrameElement).contentDocument
                if (doc?.body)
                  (e.currentTarget as HTMLIFrameElement).style.height = doc.body.scrollHeight + 32 + "px"
              } catch {}
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"} ${fontClass}`}>
      <StoreHeader
        vendor={vendor} store={store}
        categories={categories} collections={collections} products={products}
      />

      {/* ── Category Grid — always first, click to edit in right panel ── */}
      <div
        data-section-id="__category_grid__"
        onClick={() => {
          if (isEditorMode)
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: "__category_grid__" }, "*")
        }}
        onDoubleClick={() => {
          if (isEditorMode)
            window.parent?.postMessage({ type: "SECTION_DBLCLICK", sectionId: "__category_grid__" }, "*")
        }}
        className={`relative transition-all ${isEditorMode ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: gridBg ?? undefined,
          ...(isGridSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}),
        }}
      >
        {isGridSelected && (
          <div className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
            style={{ background: "#e65100", borderBottomRightRadius: "6px" }}>
            Editing
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            {/* <p className="text-xs uppercase tracking-widest font-semibold mb-1"
              style={{ color: brandPrimary }}>
              {vendor.name}
            </p> */}
            <h1 className="text-3xl font-bold"
              style={{ color: gridText ?? (isDark ? "#ffffff" : "#111827") }}>
              {gridTitle}
            </h1>
          </div>

          {categories.length === 0 ? (
            <div className={`grid ${gridColClass} gap-4`}>
              {FAKE_CATEGORIES.slice(0, gridColumns).map(cat => (
                <div key={cat.id} className={`rounded-2xl overflow-hidden border cursor-default select-none ${
                  isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"
                } shadow-sm`}>
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-sm mb-0.5"
                      style={{ color: gridText ?? (isDark ? "#ffffff" : "#111827") }}>
                      {cat.name}
                    </h2>
                    <p className="text-xs" style={{ color: brandPrimary }}>
                      {cat.count} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid ${gridColClass} gap-4`}>
              {categories.map((cat: any) => {
                const thumb = products.find((p: any) =>
                  p.categories?.some((c: any) => c.handle === cat.handle)
                )?.thumbnail
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.handle}`}
                    className={`group rounded-2xl overflow-hidden border ${
                      isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"
                    } shadow-sm hover:shadow-md transition-all`}
                    onClick={e => { if (isEditorMode) e.preventDefault() }}
                  >
                    <div className="aspect-square relative bg-gray-100 overflow-hidden">
                      {thumb ? (
                        <Image src={thumb} alt={cat.name} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                          <span className="text-4xl opacity-20">🏷</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-sm mb-0.5"
                        style={{ color: gridText ?? (isDark ? "#ffffff" : "#111827") }}>
                        {cat.name}
                      </h2>
                      <p className="text-xs" style={{ color: brandPrimary }}>
                        {cat.product_count} item{cat.product_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Editor sections BELOW the grid ── */}
      {visibleSections.map(renderSection)}

      <StoreFooter
        vendor={vendor} store={store}
        categories={categories} collections={collections}
      />
    </div>
  )
}
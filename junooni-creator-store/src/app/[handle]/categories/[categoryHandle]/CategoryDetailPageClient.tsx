"use client"

import { useEffect, useState } from "react"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import ProductGrid from "@/components/store/ProductGrid"
import Image from "next/image"
import Link from "next/link"

interface Props {
  vendor: any
  initialStore: any
  products: any[]
  catProducts: any[]
  categories: any[]
  collections: any[]
  category: any
  handle: string
  categoryHandle: string
}

export default function CategoryDetailPageClient({
  vendor, initialStore, products, catProducts, categories,
  collections, category, handle, categoryHandle,
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

  // Page sections from editor (category layout key)
  const pageSections: any[] = store?.sections?.page_layouts?.category?.sections ?? []
  const visibleSections = pageSections.filter(s => !s.hidden)
  const isEditorMode = typeof window !== "undefined" && window.parent !== window
  const gridSettings = pageSections.find((s: any) => s.id === "__category_products__") ?? {}
    const gridColumns    = gridSettings.columns ?? 3
    const gridBg         = gridSettings.background_color
    const gridText       = gridSettings.text_color
    const showFilters          = gridSettings.show_filters           !== false
    const showSort             = gridSettings.show_sort              !== false
    const showPriceFilter      = gridSettings.show_price_filter      !== false
    const showCategoryFilter   = gridSettings.show_category_filter   !== false
    const showCollectionFilter = gridSettings.show_collection_filter !== false

    const filterOrder = gridSettings.filter_order ?? ["sort", "price", "category", "collection"]

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
          <div className="relative px-6 py-16 overflow-hidden"
            style={{ backgroundColor: secBg ?? (isDark ? "#111" : "#f9fafb") }}>
            {section.background_image && (
              <div className="absolute inset-0">
                <Image src={section.background_image} alt="Hero" fill className="object-cover opacity-20" />
              </div>
            )}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              {section.headline && (
                <h2 className="mb-4 text-4xl font-extrabold"
                  style={{ color: section.overlay_text_color ?? secText ?? (isDark ? "#fff" : "#111827") }}>
                  {section.headline}
                </h2>
              )}
              {section.subtext && (
                <p className="mb-6 text-lg opacity-70"
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
          const sep      = section.ticker_separator ?? "✦"
          const speed    = section.ticker_speed ?? 40
          const bg       = secBg ?? "#111827"
          const fg       = secText ?? "#ffffff"
          const line     = items.join(`  ${sep}  `)
          const duration = Math.round(200 - speed * 1.5)
          return (
            <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
              <style>{`
                @keyframes catdet-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                .catdet-ticker-inner { display:inline-flex; white-space:nowrap; animation:catdet-ticker ${duration}s linear infinite; }
              `}</style>
              <div className="text-sm font-medium tracking-wide catdet-ticker-inner" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
              </div>
            </div>
          )
        })()}

        {section.type === "image_text" && (
          <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: secBg }}>
            <div className="max-w-6xl mx-auto">
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
                    <div className="mb-6 text-base leading-relaxed prose-sm prose max-w-none"
                      style={{ color: secText ? `${secText}cc` : (isDark ? "#d1d5db" : "#4b5563") }}
                      dangerouslySetInnerHTML={{ __html: section.text }} />
                  )}
                  {section.cta_label && (
                    <Link href={section.cta_url ?? "#"}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full hover:opacity-90"
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

        {section.type === "image" && section.image && (
          <div className="w-full" style={{ backgroundColor: secBg }}>
            <img src={section.image} alt={section.title ?? ""}
              className="w-full object-cover max-h-[500px]" />
          </div>
        )}

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

        {section.type === "divider" && <hr className="my-4 border-gray-200" />}

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
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
      <StoreHeader
        vendor={vendor} store={store}
        categories={categories} collections={collections} products={products}
      />

      {/* Sections ABOVE the product grid */}
      {visibleSections.filter(s => s.type !== "collection").map(renderSection)}

      {/* ── Category Product Grid ── */}
      <div
        className="px-4 py-10 mx-auto max-w-7xl sm:px-6"
        style={{ backgroundColor: gridBg ?? undefined }}
        >
        <div className="mb-8">
            <p className="mb-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: brandPrimary }}>
            Category
            </p>
            <h1 className="text-3xl font-bold"
            style={{ color: gridText ?? (isDark ? "#ffffff" : "#111827") }}>
            {category.name}
            </h1>
            <p className="mt-1 text-sm"
            style={{ color: gridText ? `${gridText}80` : (isDark ? "rgba(255,255,255,0.5)" : "#6b7280") }}>
            {catProducts.length} product{catProducts.length !== 1 ? "s" : ""}
            </p>
        </div>

        {catProducts.length === 0 ? (
            <div className="py-20 text-center">
            <p className={`text-lg ${isDark ? "text-white/40" : "text-gray-400"}`}>
                No products in this category yet
            </p>
            </div>
        ) : (
            <ProductGrid
            products={catProducts}
            categories={categories}
            collections={collections}
            handle={handle}
            textColor={gridText}
            brandPrimary={brandPrimary}
            isDark={isDark}
            activeCategoryHandle={categoryHandle}
            columns={gridColumns}
            filterOrder={filterOrder}
            showFilters={showFilters}
            showSort={showSort}
            showPriceFilter={showPriceFilter}
            showCategoryFilter={showCategoryFilter}
            showCollectionFilter={showCollectionFilter}
            />
        )}
        </div>

      <StoreFooter
        vendor={vendor} store={store}
        categories={categories} collections={collections}
      />
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import ProductCard from "@/components/ui/ProductCard"
import ProductGrid from "@/components/store/ProductGrid"

interface Props {
  vendor: any
  initialStore: any
  products: any[]
  collectionProducts: any[]
  categories: any[]
  collections: any[]
  col: any
  handle: string
  collectionHandle: string
}

export default function CollectionDetailPageClient({
  vendor, initialStore, products, collectionProducts: initialColProducts,
  categories, collections, col, handle, collectionHandle,
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

  // All page sections for the collection layout key
  const pageSections: any[] = store?.sections?.page_layouts?.collection?.sections ?? []

  // Virtual section settings — reads __collection_products__ for grid config
  const gridSettings = pageSections.find((s: any) => s.id === "__collection_products__") ?? {}
  const gridColumns  = gridSettings.columns ?? 3
  const gridBg       = gridSettings.background_color
  const gridText     = gridSettings.text_color
  const showProductCount = gridSettings.show_product_count !== false

  const showFilters          = gridSettings.show_filters           !== false
  const showSort             = gridSettings.show_sort              !== false
  const showPriceFilter      = gridSettings.show_price_filter      !== false
  const showCategoryFilter   = gridSettings.show_category_filter   !== false
  //const showCollectionFilter = gridSettings.show_collection_filter !== false
  const filterOrder: string[] = gridSettings.filter_order ?? ["sort", "price", "category"]
  const cardAspectRatio  = store?.product_card?.aspect_ratio        ?? "square"
  const cardAlignment    = store?.product_card?.alignment           ?? "left"
  const cardShowPrice    = store?.product_card?.show_price          !== false
  const cardShowHover    = store?.product_card?.show_hover          !== false
  const cardShowSoldOut  = store?.product_card?.show_sold_out_badge !== false

  // Real editor sections — exclude virtual + hidden
  const visibleSections = pageSections.filter(
    (s: any) => s.id !== "__collection_products__" && !s.hidden
  )

  const [isEditorMode, setIsEditorMode] = useState(false)
  useEffect(() => {
    setIsEditorMode(window.parent !== window)
  }, [])
  const isGridSelected = selectedSectionId === "__collection_products__"

  const colClass =
    gridColumns === 2 ? "grid-cols-2" :
    gridColumns === 4 ? "grid-cols-2 md:grid-cols-4" :
    "grid-cols-2 md:grid-cols-3"

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

        {section.type === "hero" && (
          <div className="relative overflow-hidden py-16 px-6"
            style={{ backgroundColor: secBg ?? (isDark ? "#111" : "#f9fafb") }}>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              {section.headline && (
                <h2 className="text-4xl font-extrabold mb-4"
                  style={{ color: section.overlay_text_color ?? secText ?? (isDark ? "#fff" : "#111827") }}>
                  {section.headline}
                </h2>
              )}
              {section.subtext && (
                <p className="text-lg opacity-70 mb-6">{section.subtext}</p>
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
                @keyframes col-det-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                .col-det-ticker-inner { display:inline-flex; white-space:nowrap; animation:col-det-ticker ${duration}s linear infinite; }
              `}</style>
              <div className="col-det-ticker-inner text-sm font-medium tracking-wide" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
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

        {section.type === "image_text" && (
          <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: secBg }}>
            <div className="mx-auto max-w-6xl">
              <div className={`flex gap-10 items-center flex-col md:flex-row ${
                (section.image_position ?? "left") === "right" ? "md:flex-row-reverse" : ""
              }`}>
                <div className="w-full md:w-1/2 shrink-0">
                  {section.image ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
                      <img src={section.image} alt={section.title ?? ""} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-2xl bg-gray-100 aspect-[4/3]">
                      <span className="text-5xl opacity-20">🖼️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {section.title && (
                    <h2 className="mb-4 text-3xl font-bold"
                      style={{ color: secText ?? (isDark ? "#fff" : "#111827") }}>
                      {section.title}
                    </h2>
                  )}
                  {section.text && (
                    <div className="text-base leading-relaxed mb-6"
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
      </div>
    )
  }

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white"} ${fontClass}`}>
      <div className="sticky top-0 z-40">
        <StoreHeader
          vendor={vendor} store={store}
          categories={categories} collections={collections} products={products}
        />
      </div>

      {/* ── Collection hero — always first ── */}
      <div className={`border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        {col.thumbnail && (
          <div className="relative h-48 overflow-hidden md:h-64">
            <img src={col.thumbnail} alt={col.title}
              className="object-cover w-full h-full opacity-60" />
            <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-white/60"}`} />
          </div>
        )}
        <div className="max-w-7xl px-4 py-8 mx-auto sm:px-6">
          <Link href={`/${vendor.handle}/collections`}
            className="flex items-center gap-1.5 text-sm mb-4 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: brandPrimary }}
            onClick={e => { if (isEditorMode) e.preventDefault() }}>
            <ArrowLeft className="w-3.5 h-3.5" />Back to collections
          </Link>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {col.title}
          </h1>
          {col.description && (
            <p className={`text-base max-w-xl ${isDark ? "text-white/60" : "text-gray-500"}`}>
              {col.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Editor sections ABOVE the product grid ── */}
      {/* {visibleSections.map(renderSection)} */}

      {/* ── Product grid — virtual, click to edit in editor ── */}
      <div
        data-section-id="__collection_products__"
        onClick={() => {
          if (isEditorMode)
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: "__collection_products__" }, "*")
        }}
        onDoubleClick={() => {
          if (isEditorMode)
            window.parent?.postMessage({ type: "SECTION_DBLCLICK", sectionId: "__collection_products__" }, "*")
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

        <div className="max-w-7xl px-4 py-10 mx-auto sm:px-6">
          {gridSettings.title && (
            <h2 className="text-2xl font-bold mb-6"
              style={{ color: gridText ?? (isDark ? "#fff" : "#111827") }}>
              {gridSettings.title}
            </h2>
          )}

          {showProductCount && (
            <p className="mb-6 text-sm" style={{ color: brandPrimary }}>
              {initialColProducts.length} product{initialColProducts.length !== 1 ? "s" : ""}
            </p>
          )}

          <ProductGrid
            products={initialColProducts}
            categories={categories}
            collections={collections}
            handle={vendor.handle}
            brandPrimary={brandPrimary}
            isDark={isDark}
            columns={gridColumns}
            showFilters={showFilters}
            showSort={showSort}
            showPriceFilter={showPriceFilter}
            showCategoryFilter={showCategoryFilter}
            // showCollectionFilter={showCollectionFilter}
            filterOrder={filterOrder}
            cardAspectRatio={cardAspectRatio}
            cardAlignment={cardAlignment}
            cardShowPrice={cardShowPrice}
            cardShowHover={cardShowHover}
            cardShowSoldOut={cardShowSoldOut}
          />
        </div>
      </div>

      {visibleSections.map(renderSection)}

      <StoreFooter
        vendor={vendor} store={store}
        categories={categories} collections={collections}
      />
    </div>
  )
}
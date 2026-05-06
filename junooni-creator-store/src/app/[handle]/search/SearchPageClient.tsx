"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, X } from "lucide-react"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import ProductCard from "@/components/ui/ProductCard"
import type { Product } from "@/lib/types"

interface Props {
  vendor: any
  initialStore: any
  products: Product[]
  categories: any[]
  collections: any[]
  handle: string
  initialQuery: string
}

export default function SearchPageClient({
  vendor, initialStore, products, categories, collections, handle, initialQuery,
}: Props) {
  const [store, setStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [query, setQuery] = useState(initialQuery)

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

  const pageSections: any[] = store?.sections?.page_layouts?.search?.sections ?? []
  const visibleSections = pageSections.filter((s: any) => !s.hidden)
  const isEditorMode = typeof window !== "undefined" && window.parent !== window

  // ── Search logic ──────────────────────────────────────────────────────────
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.categories?.some((c: any) => c.name.toLowerCase().includes(q)) ||
      (p as any).collection?.title?.toLowerCase().includes(q)
    )
  }, [query, products])

  // ── Section renderer ──────────────────────────────────────────────────────
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

        {section.type === "text" && section.text && (
          <div className="px-4 py-12 sm:px-6">
            <div className="max-w-3xl mx-auto prose prose-lg"
              style={{ color: secText ?? (isDark ? "#d1d5db" : "#374151") }}
              dangerouslySetInnerHTML={{ __html: section.text }} />
          </div>
        )}

        {section.type === "image" && section.image && (
          <div className="w-full">
            <img src={section.image} alt={section.title ?? ""}
              className="w-full object-cover max-h-[500px]" />
          </div>
        )}

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
                @keyframes search-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                .search-ticker-inner { display:inline-flex; white-space:nowrap; animation:search-ticker ${duration}s linear infinite; }
              `}</style>
              <div className="search-ticker-inner text-sm font-medium tracking-wide" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
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

  const textColor = isDark ? "text-white" : "text-gray-900"
  const subText   = isDark ? "text-white/50" : "text-gray-500"
  const inputBg   = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
      <StoreHeader
        vendor={vendor} store={store}
        categories={categories} collections={collections} products={products}
      />

      {/* ── Editor sections above search ── */}
      {/* {visibleSections.map(renderSection)} */}

      {/* ── Search UI — always shown ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className={`text-3xl font-bold mb-6 ${textColor}`}>Search</h1>

        <div className="relative mb-8">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/40" : "text-gray-400"}`} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            autoFocus={!isEditorMode}
            className={`w-full pl-12 pr-12 py-4 rounded-2xl border text-base ${inputBg} focus:outline-none focus:ring-2 transition-all`}
            style={{ "--tw-ring-color": brandPrimary } as any}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!query.trim() ? (
          <div className="py-16 text-center">
            <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/20" : "text-gray-200"}`} />
            <p className={`text-base ${subText}`}>Start typing to search products</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center">
            <p className={`text-lg font-medium mb-2 ${textColor}`}>No results for "{query}"</p>
            <p className={`text-sm ${subText}`}>Try a different search term</p>
          </div>
        ) : (
          <div>
            <p className={`text-sm mb-5 ${subText}`}>
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <span className={`font-medium ${textColor}`}>"{query}"</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handle={handle}
                  brandPrimary={brandPrimary}
                  variant={isDark ? "dark" : "light"}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {visibleSections.map(renderSection)}

      <StoreFooter
        vendor={vendor} store={store}
        categories={categories} collections={collections}
      />
    </div>
  )
}
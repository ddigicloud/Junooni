"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import ProductCard from "@/components/ui/ProductCard"
import type { Product, CategoryMeta, CollectionMeta } from "@/lib/types"
import { formatPrice } from "@/lib/api"

interface Props {
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
  handle: string
  brandPrimary?: string
  textColor?: string  // add this
  isDark?: boolean
  filterOrder?: string[]
  activeCategoryHandle?: string
  activeCollectionHandle?: string
  // ── Editor-controlled props ──
  columns?: number        // 2 | 3 | 4  (default 3)
  limit?: number          // max products to show (default 48)
  showSoldOut?: boolean   // show sold-out products (default true)
  showFilters?: boolean         // show entire filter sidebar (default true)
  showSort?: boolean            // show sort dropdown (default true)
  showPriceFilter?: boolean     // show price range filter (default true)
  showCategoryFilter?: boolean  // show category checkboxes (default true)
  showCollectionFilter?: boolean // show collection checkboxes (default true)
  cardAspectRatio?:  "square" | "portrait" | "landscape"
  cardAlignment?:    "left" | "center"
  cardShowPrice?:    boolean
  cardShowHover?:    boolean
  cardShowSoldOut?:  boolean
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc"

export default function ProductGrid({
  products: allProducts,
  categories,
  collections,
  handle,
  brandPrimary = "#e65100",
  isDark = false,
  activeCategoryHandle,
  activeCollectionHandle,
  textColor: textColorProp,
  // Editor-controlled — all have sensible defaults
  columns = 3,
  limit = 48,
  showSoldOut = true,
  showFilters = true,
  showSort = true,
  showPriceFilter = true,
  showCategoryFilter = true,
  showCollectionFilter = true,
  filterOrder = ["sort", "price", "category", "collection"],
  cardAspectRatio = "square",
  cardAlignment = "left",
  cardShowPrice = true,
  cardShowHover = true,
  cardShowSoldOut = true,
}: Props) {

  // Apply limit and sold-out filter first (these come from the editor)
  const products = useMemo(() => {
    let result = showSoldOut
      ? allProducts
      : allProducts.filter(p =>
          p.variants?.some((v: any) => (v.inventory_quantity ?? 1) > 0)
        )
    return result.slice(0, limit)
  }, [allProducts, showSoldOut, limit])

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeCategoryHandle ? [activeCategoryHandle] : []
  )
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    activeCollectionHandle ? [activeCollectionHandle] : []
  )
  const [sort, setSort] = useState<SortOption>("newest")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [catExpanded, setCatExpanded] = useState(true)
  const [colExpanded, setColExpanded] = useState(true)
  const [priceExpanded, setPriceExpanded] = useState(true)

  // ── Price range derived from products ──────────────────────────────────────
  const allPrices = useMemo(() =>
    products
      .map(p => p.variants?.[0]?.prices?.[0]?.amount ?? 0)
      .filter(v => v > 0),
    [products]
  )
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0
  const globalMax = allPrices.length ? Math.max(...allPrices) : 100000
  const [priceRange, setPriceRange] = useState<[number, number]>([globalMin, globalMax])

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...products]

    if (selectedCategories.length) {
      result = result.filter(p =>
        p.categories?.some(c => selectedCategories.includes(c.handle))
      )
    }
    if (selectedCollections.length) {
      result = result.filter(p =>
        p.collection && selectedCollections.includes(p.collection.handle)
      )
    }
    result = result.filter(p => {
      const price = p.variants?.[0]?.prices?.[0]?.amount ?? 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => (a.variants?.[0]?.prices?.[0]?.amount ?? 0) - (b.variants?.[0]?.prices?.[0]?.amount ?? 0))
        break
      case "price_desc":
        result.sort((a, b) => (b.variants?.[0]?.prices?.[0]?.amount ?? 0) - (a.variants?.[0]?.prices?.[0]?.amount ?? 0))
        break
      case "name_asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  }, [products, selectedCategories, selectedCollections, sort, priceRange])

  const toggleCat = (h: string) =>
    setSelectedCategories(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])
  const toggleCol = (h: string) =>
    setSelectedCollections(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedCollections([])
    setPriceRange([globalMin, globalMax])
  }

  const activeFilters =
    selectedCategories.length +
    selectedCollections.length +
    (priceRange[0] !== globalMin || priceRange[1] !== globalMax ? 1 : 0)

  // ── Grid column class based on editor setting ───────────────────────────────
  const gridColClass =
    columns === 2 ? "grid-cols-2" :
    columns === 4 ? "grid-cols-2 sm:grid-cols-4" :
    columns === 5 ? "grid-cols-2 sm:grid-cols-5" :
    "grid-cols-2 sm:grid-cols-3"  // default 3

  const inputBg    = isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
  const labelColor = isDark ? "text-white/50" : "text-gray-400"
  const textColor  = textColorProp ?? (isDark ? "text-white" : "text-gray-900")
  const subText    = textColorProp ? `opacity-70` : (isDark ? "text-white/50" : "text-gray-500")
  const divider    = isDark ? "border-white/10" : "border-gray-100"
  const sidebarBg  = isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"

  // ── Price range slider ──────────────────────────────────────────────────────
  const PriceRangeSlider = useCallback(() => {
    const minRef = useRef<HTMLInputElement>(null)
    const maxRef = useRef<HTMLInputElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const minLabelRef = useRef<HTMLSpanElement>(null)
    const maxLabelRef = useRef<HTMLSpanElement>(null)

    const updateTrack = (minVal: number, maxVal: number) => {
      if (!trackRef.current) return
      const minPct = globalMax === globalMin ? 0 : ((minVal - globalMin) / (globalMax - globalMin)) * 100
      const maxPct = globalMax === globalMin ? 0 : ((maxVal - globalMin) / (globalMax - globalMin)) * 100
      trackRef.current.style.left = `${minPct}%`
      trackRef.current.style.width = `${maxPct - minPct}%`
      if (minLabelRef.current) minLabelRef.current.textContent = formatPrice(minVal)
      if (maxLabelRef.current) maxLabelRef.current.textContent = formatPrice(maxVal)
    }

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), priceRange[1] - 1)
      e.target.value = String(val)
      updateTrack(val, priceRange[1])
    }
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), priceRange[0] + 1)
      e.target.value = String(val)
      updateTrack(priceRange[0], val)
    }
    const commitMin = () => { if (minRef.current) setPriceRange([Number(minRef.current.value), priceRange[1]]) }
    const commitMax = () => { if (maxRef.current) setPriceRange([priceRange[0], Number(maxRef.current.value)]) }

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span ref={minLabelRef} className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[0])}</span>
          <span ref={maxLabelRef} className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[1])}</span>
        </div>
        <div className="relative flex items-center" style={{ height: "20px" }}>
          <div className="absolute w-full rounded-full" style={{ height: "6px", background: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }} />
          <div
            ref={trackRef}
            className="absolute rounded-full"
            style={{
              height: "6px",
              left: `${globalMax === globalMin ? 0 : ((priceRange[0] - globalMin) / (globalMax - globalMin)) * 100}%`,
              width: `${globalMax === globalMin ? 0 : ((priceRange[1] - priceRange[0]) / (globalMax - globalMin)) * 100}%`,
              background: brandPrimary,
              pointerEvents: "none",
            }}
          />
          <input ref={minRef} type="range" min={globalMin} max={globalMax} step={1} defaultValue={priceRange[0]}
            onChange={handleMinChange} onMouseUp={commitMin} onTouchEnd={commitMin} className="price-thumb"
            style={{ position: "absolute", width: "100%", height: "6px", appearance: "none", background: "transparent", pointerEvents: "none",
              zIndex: priceRange[0] >= priceRange[1] - (globalMax - globalMin) * 0.05 ? 5 : 3 }} />
          <input ref={maxRef} type="range" min={globalMin} max={globalMax} step={1} defaultValue={priceRange[1]}
            onChange={handleMaxChange} onMouseUp={commitMax} onTouchEnd={commitMax} className="price-thumb"
            style={{ position: "absolute", width: "100%", height: "6px", appearance: "none", background: "transparent", pointerEvents: "none", zIndex: 4 }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${labelColor}`}>Min</p>
            <input type="number" value={Math.round(priceRange[0] / 100)}
              onChange={e => { const val = Number(e.target.value) * 100; if (val >= globalMin && val < priceRange[1]) setPriceRange([val, priceRange[1]]) }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${inputBg} focus:outline-none`} />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${labelColor}`}>Max</p>
            <input type="number" value={Math.round(priceRange[1] / 100)}
              onChange={e => { const val = Number(e.target.value) * 100; if (val <= globalMax && val > priceRange[0]) setPriceRange([priceRange[0], val]) }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${inputBg} focus:outline-none`} />
          </div>
        </div>
        <style>{`
          .price-thumb { pointer-events: none; }
          .price-thumb::-webkit-slider-thumb { appearance: none; pointer-events: all; width: 18px; height: 18px; border-radius: 50%;
            background: ${brandPrimary}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: grab; }
          .price-thumb:active::-webkit-slider-thumb { cursor: grabbing; }
          .price-thumb::-moz-range-thumb { pointer-events: all; width: 18px; height: 18px; border-radius: 50%;
            background: ${brandPrimary}; border: 2px solid white; cursor: grab; }
        `}</style>
      </div>
    )
  }, [priceRange, globalMin, globalMax, brandPrimary, isDark])

  // ── Sidebar content — respects showSort / showPriceFilter / etc. ────────────
  const SidebarContent = () => (
    <div className="space-y-5">
      {filterOrder.map((id, i) => {
        const isLast = i === filterOrder.length - 1

        if (id === "sort" && showSort) return (
          <div key="sort">
            <p className={`text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}>Sort by</p>
            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
              className={`w-full text-sm px-3 py-2.5 rounded-xl border ${inputBg} focus:outline-none`}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A–Z</option>
            </select>
            {!isLast && <div className={`border-t ${divider} mt-5`} />}
          </div>
        )

        if (id === "price" && showPriceFilter && allPrices.length > 0) return (
          <div key="price">
            <button onClick={() => setPriceExpanded(!priceExpanded)}
              className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-3 ${labelColor}`}>
              Price Range
              {priceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {priceExpanded && <PriceRangeSlider />}
            {!isLast && <div className={`border-t ${divider} mt-5`} />}
          </div>
        )

        if (id === "category" && showCategoryFilter && categories.length > 0) return (
          <div key="category">
            <button onClick={() => setCatExpanded(!catExpanded)}
              className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}>
              Categories
              {catExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {catExpanded && (
              <div className="space-y-1.5">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" checked={selectedCategories.includes(cat.handle)}
                        onChange={() => toggleCat(cat.handle)} className="w-4 h-4 rounded accent-orange-500" />
                      <span className={`text-sm ${textColor} group-hover:opacity-70 transition-opacity`}>{cat.name}</span>
                    </div>
                    <span className={`text-xs ${subText}`}>{cat.product_count}</span>
                  </label>
                ))}
              </div>
            )}
            {!isLast && <div className={`border-t ${divider} mt-5`} />}
          </div>
        )

        if (id === "collection" && showCollectionFilter && collections.length > 0) return (
          <div key="collection">
            <button onClick={() => setColExpanded(!colExpanded)}
              className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}>
              Collections
              {colExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {colExpanded && (
              <div className="space-y-1.5">
                {collections.map(col => (
                  <label key={col.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" checked={selectedCollections.includes(col.handle)}
                        onChange={() => toggleCol(col.handle)} className="w-4 h-4 rounded accent-orange-500" />
                      <span className={`text-sm ${textColor} group-hover:opacity-70 transition-opacity`}>{col.title}</span>
                    </div>
                    <span className={`text-xs ${subText}`}>{col.product_count}</span>
                  </label>
                ))}
              </div>
            )}
            {!isLast && <div className={`border-t ${divider} mt-5`} />}
          </div>
        )

        return null
      })}

      {/* Clear all — always at bottom */}
      {activeFilters > 0 && (
        <>
          <div className={`border-t ${divider}`} />
          <button onClick={clearAll}
            className="w-full text-xs font-semibold py-2.5 rounded-xl border-2 transition-colors"
            style={{ borderColor: brandPrimary, color: brandPrimary }}>
            Clear all filters ({activeFilters})
          </button>
        </>
      )}
    </div>
  )

  // If all filter options are disabled, hide sidebar entirely
  const sidebarVisible = showFilters && (showSort || showPriceFilter || showCategoryFilter || showCollectionFilter)

  return (
    <div>
      {/* Mobile top bar — only if sidebar is enabled */}
      {sidebarVisible && (
        <div className="flex items-center justify-between mb-5 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              activeFilters > 0 ? "text-white border-transparent" : isDark ? "border-white/20 text-white" : "border-gray-200 text-gray-700"
            }`}
            style={activeFilters > 0 ? { background: brandPrimary, borderColor: brandPrimary } : {}}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
          <p className={`text-sm ${subText}`}>{filtered.length} products</p>
        </div>
      )}

      <div className="flex items-start gap-6">
        {/* Desktop sidebar — only if enabled */}
        {sidebarVisible && (
          <aside className={`hidden md:block w-52 shrink-0 sticky top-24 rounded-2xl border p-5 ${sidebarBg} shadow-sm`}>
            <div className="flex items-center justify-between mb-5">
              <p className={`text-sm font-bold ${textColor}`}>Filters</p>
              {activeFilters > 0 && (
                <button onClick={clearAll} className="text-xs font-medium underline" style={{ color: brandPrimary }}>
                  Clear ({activeFilters})
                </button>
              )}
            </div>
            <SidebarContent />
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {sidebarVisible && (
            <div className="items-center justify-between hidden mb-5 md:flex">
              <p
                className={`text-sm ${textColor}`}
                style={textColorProp ? { color: textColorProp } : undefined}
              >
                Showing <span className="font-semibold">{filtered.length}</span> of {products.length} products
              </p>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className={`text-lg font-medium mb-2 ${textColor}`}>No products found</p>
              <p className={`text-sm ${subText} mb-4`}>Try adjusting your filters</p>
              {activeFilters > 0 && (
                <button onClick={clearAll} className="text-sm font-semibold underline" style={{ color: brandPrimary }}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${gridColClass} gap-4`}>
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handle={handle}
                  brandPrimary={brandPrimary}
                  variant={isDark ? "dark" : "light"}
                  aspectRatio={cardAspectRatio}
                  alignment={cardAlignment}
                  showPrice={cardShowPrice}
                  showHover={cardShowHover}
                  showSoldOutBadge={cardShowSoldOut}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarVisible && sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-72 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p className={`font-bold ${textColor}`}>Filters & Sort</p>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className={`w-5 h-5 ${isDark ? "text-white/60" : "text-gray-500"}`} />
                </button>
              </div>
              <SidebarContent />
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full mt-6 py-3.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
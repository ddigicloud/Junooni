"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import ProductCard from "@/components/ui/ProductCard"
import type { Product, CategoryMeta, CollectionMeta } from "@/lib/types"
import { formatPrice } from "@/lib/api"
import minimalcap from "../../../public/minimalcap.jpeg"
import minimaltee from "../../../public/minimaltee.jpeg"
import minimalhoodie from "../../../public/minimalhoodie.jpeg"
import minimalmug from "../../../public/minimalmug.jpeg"

const FAKE_PRODUCTS_GRID = [
  { id: "fake_1", title: "Classic Creator Tee", price: "₹699", emoji: "👕", color: "#f3f4f6", image: minimaltee },
  { id: "fake_2", title: "Limited Drop Hoodie", price: "₹1,299", emoji: "👕", color: "#e5e7eb", image: minimalhoodie },
  { id: "fake_3", title: "Signature Cap", price: "₹499", emoji: "🧢", color: "#f9fafb", image: minimalcap },
  { id: "fake_4", title: "Fan Favourite Mug", price: "₹399", emoji: "☕", color: "#f3f4f6", image: minimalmug },
  { id: "fake_5", title: "Creator Hoodie", price: "₹999", emoji: "👕", color: "#e5e7eb", image: minimalhoodie },
  { id: "fake_6", title: "Exclusive Tote Bag", price: "₹349", emoji: "👜", color: "#f9fafb", image: minimaltee },
]

interface Props {
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
  handle: string
  brandPrimary?: string
  textColor?: string
  showProductCount?: boolean
  isDark?: boolean
  filterOrder?: string[]
  activeCategoryHandle?: string
  activeCollectionHandle?: string
  columns?: number
  limit?: number
  showSoldOut?: boolean
  showFilters?: boolean
  showSort?: boolean
  showPriceFilter?: boolean
  showCategoryFilter?: boolean
  showCollectionFilter?: boolean
  cardAspectRatio?:  "square" | "portrait" | "landscape"
  cardAlignment?:    "left" | "center"
  cardShowPrice?:    boolean
  cardShowHover?:    boolean
  cardShowSoldOut?:  boolean
  cardBorderRadius?: number
  cardBgColor?:      string
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc"

// ── PriceRangeSlider — fully outside ProductGrid so it never remounts ────────
function PriceRangeSlider({
  priceRange, globalMin, globalMax, brandPrimary, isDark,
  textColor, onChange,
}: {
  priceRange: [number, number]
  globalMin: number
  globalMax: number
  brandPrimary: string
  isDark: boolean
  textColor: string
  onChange: (range: [number, number]) => void
}){
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<"min" | "max" | null>(null)
  const priceRangeRef = useRef(priceRange)

  useEffect(() => {
    priceRangeRef.current = priceRange
  }, [priceRange])

  const pct = (val: number) =>
    globalMax === globalMin
      ? 0
      : ((val - globalMin) / (globalMax - globalMin)) * 100

  const valFromClientX = useCallback((clientX: number): number => {
    const track = trackRef.current
    if (!track) return globalMin
    const { left, width } = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width))
    if (ratio <= 0.01) return globalMin
    if (ratio >= 0.99) return globalMax
    const raw = Math.round(globalMin + ratio * (globalMax - globalMin))
    return Math.max(globalMin, Math.min(globalMax, raw))
  }, [globalMin, globalMax])

  const onTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const raw = valFromClientX(e.clientX)
    const [lo, hi] = priceRangeRef.current
    dragging.current = Math.abs(raw - lo) <= Math.abs(raw - hi) ? "min" : "max"
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (dragging.current === "min") {
      onChange([Math.min(raw, hi - 10), hi])
    } else {
      onChange([lo, Math.max(raw, lo + 10)])
    }
  }, [valFromClientX, onChange])

  const onTrackPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    e.preventDefault()
    const raw = valFromClientX(e.clientX)
    const [lo, hi] = priceRangeRef.current
    if (dragging.current === "min") {
      onChange([Math.min(raw, hi - 10), hi])
    } else {
      onChange([lo, Math.max(raw, lo + 10)])
    }
  }, [valFromClientX, onChange])

  const onTrackPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  const minPct = pct(priceRange[0])
  const maxPct = pct(priceRange[1])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[0])}</span>
        <span className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[1])}</span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={onTrackPointerUp}
        style={{
          position: "relative",
          height: 36,
          cursor: "pointer",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Rail */}
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          width: "100%",
          height: 6,
          borderRadius: 999,
          background: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
          pointerEvents: "none",
        }} />

        {/* Filled range */}
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          height: 6,
          borderRadius: 999,
          background: brandPrimary,
          pointerEvents: "none",
        }} />

        {/* Min thumb — visual only */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `${minPct}%`,
          transform: "translate(-50%, -50%)",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: brandPrimary,
          border: "3px solid white",
          boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }} />

        {/* Max thumb — visual only */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `${maxPct}%`,
          transform: "translate(-50%, -50%)",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: brandPrimary,
          border: "3px solid white",
          boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
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
  cardBorderRadius,
  cardBgColor,
  showProductCount = true,
}: Props) {

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

  const allPrices = useMemo(() =>
    products
      .map(p => p.variants?.[0]?.prices?.[0]?.amount ?? 0)
      .filter(v => v > 0),
    [products]
  )
  const globalMin = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0
  const globalMax = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 10000
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  useEffect(() => {
    setPriceRange([globalMin, globalMax])
  }, [globalMin, globalMax])

  const filtered = useMemo(() => {
    let result = [...products]

    if (selectedCategories.length) {
      result = result.filter(p =>
        p.categories?.some(c => selectedCategories.includes(c.handle))
      )
    }
    if (selectedCollections.length) {
      const selectedProductIds = new Set(
        collections
          .filter(c => selectedCollections.includes(c.handle))
          .flatMap(c => c.product_ids ?? [])
      )
      result = result.filter(p => selectedProductIds.has(p.id))
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
  }, [products, selectedCategories, selectedCollections, sort, priceRange, collections])

  const toggleCat = useCallback((h: string) =>
    setSelectedCategories(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]),
  [])
  const toggleCol = useCallback((h: string) =>
    setSelectedCollections(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]),
  [])

  const clearAll = useCallback(() => {
    setSelectedCategories([])
    setSelectedCollections([])
    setPriceRange([globalMin, globalMax])
  }, [globalMin, globalMax])

  const activeFilters =
    selectedCategories.length +
    selectedCollections.length +
    (priceRange[0] !== globalMin || priceRange[1] !== globalMax ? 1 : 0)

  const gridColClass =
    columns === 2 ? "grid-cols-2" :
    columns === 4 ? "grid-cols-2 sm:grid-cols-4" :
    columns === 5 ? "grid-cols-2 sm:grid-cols-5" :
    "grid-cols-2 sm:grid-cols-3"

  const inputBg    = isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
  const labelColor = isDark ? "text-white/50" : "text-gray-400"
  const textColor  = textColorProp ?? (isDark ? "text-white" : "text-gray-900")
  const subText    = textColorProp ? `opacity-70` : (isDark ? "text-white/50" : "text-gray-500")
  const divider    = isDark ? "border-white/10" : "border-gray-100"
  const sidebarBg  = isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"

  // ── KEY FIX: useMemo instead of inline component so PriceRangeSlider
  //    never unmounts on re-render (which killed pointer capture mid-drag) ──
  const sidebarContent = useMemo(() => (
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
            <button onClick={() => setPriceExpanded(v => !v)}
              className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-3 ${labelColor}`}>
              Price Range
              {priceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {priceExpanded && (
              <PriceRangeSlider
                priceRange={priceRange}
                globalMin={globalMin}
                globalMax={globalMax}
                brandPrimary={brandPrimary}
                isDark={isDark}
                textColor={textColor}
                onChange={setPriceRange}
              />
            )}
            {!isLast && <div className={`border-t ${divider} mt-5`} />}
          </div>
        )

        if (id === "category" && showCategoryFilter && categories.length > 0) return (
          <div key="category">
            <button onClick={() => setCatExpanded(v => !v)}
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
                          onChange={() => toggleCat(cat.handle)}
                          className="w-4 h-4 rounded accent-white"
                          style={{ outline: "1.5px solid black", outlineOffset: "-1px" }} />
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
            <button onClick={() => setColExpanded(v => !v)}
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
                        onChange={() => toggleCol(col.handle)}
                        className="w-4 h-4 rounded accent-white"
                        style={{ outline: "1.5px solid black", outlineOffset: "-1px" }} />
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
  ), [
    filterOrder, showSort, showPriceFilter, showCategoryFilter, showCollectionFilter,
    sort, priceRange, globalMin, globalMax, allPrices, brandPrimary, isDark,
    textColor, labelColor, inputBg, subText, divider,
    categories, collections, selectedCategories, selectedCollections,
    catExpanded, colExpanded, priceExpanded, activeFilters,
    toggleCat, toggleCol, clearAll,
  ])

  const sidebarVisible = showFilters && (showSort || showPriceFilter || showCategoryFilter || showCollectionFilter)

  return (
    <div>
      {/* Mobile top bar */}
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
        {/* Desktop sidebar */}
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
            {sidebarContent}
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {sidebarVisible && showProductCount && (
            <div className="items-center justify-between hidden mb-5 md:flex">
              <p className={`text-sm ${textColor}`} style={textColorProp ? { color: textColorProp } : undefined}>
                Showing <span className="font-semibold">{filtered.length}</span> of {products.length} products
              </p>
            </div>
          )}

          {allProducts.length === 0 ? (
            <div className={`grid ${gridColClass} gap-4`}>
              {FAKE_PRODUCTS_GRID.slice(0, columns * 2).map(p => (
                <div key={p.id} className="space-y-3 cursor-default select-none">
                  <div
                    className="aspect-square rounded-2xl flex items-center justify-center text-6xl"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.emoji}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${textColor}`}>{p.title}</p>
                    <p className="text-sm font-semibold" style={{ color: brandPrimary }}>{p.price}</p>
                  </div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
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
                  cardBorderRadius={cardBorderRadius}
                  cardBgColor={cardBgColor}
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
              {sidebarContent}
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
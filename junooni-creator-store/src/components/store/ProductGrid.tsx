"use client"

import { useState, useMemo, useCallback } from "react"
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
  isDark?: boolean
  activeCategoryHandle?: string
  activeCollectionHandle?: string
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc"

export default function ProductGrid({
  products, categories, collections, handle,
  brandPrimary = "#e65100", isDark = false,
  activeCategoryHandle, activeCollectionHandle,
}: Props) {
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

  // ── Price range derived from products ───────────────────────────────────────
  const allPrices = useMemo(() =>
    products
      .map(p => p.variants?.[0]?.prices?.[0]?.amount ?? 0)
      .filter(v => v > 0),
    [products]
  )
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0
  const globalMax = allPrices.length ? Math.max(...allPrices) : 100000

  const [priceRange, setPriceRange] = useState<[number, number]>([globalMin, globalMax])

  // ── Filter + sort ────────────────────────────────────────────────────────────
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

    // Price filter
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

  const inputBg = isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
  const labelColor = isDark ? "text-white/50" : "text-gray-400"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const subText = isDark ? "text-white/50" : "text-gray-500"
  const divider = isDark ? "border-white/10" : "border-gray-100"
  const sidebarBg = isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"

  // ── Price range slider ────────────────────────────────────────────────────────
  const PriceRangeSlider = () => {
    const rangePercent = (val: number) =>
      globalMax === globalMin ? 0 : ((val - globalMin) / (globalMax - globalMin)) * 100

    return (
      <div>
        {/* Display */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[0])}</span>
          <span className={`text-xs font-medium ${textColor}`}>{formatPrice(priceRange[1])}</span>
        </div>

        {/* Dual range slider using two overlapping inputs */}
        <div className="relative h-5 flex items-center">
          {/* Track background */}
          <div className={`absolute w-full h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
          {/* Active track */}
          <div
            className="absolute h-1.5 rounded-full"
            style={{
              left: `${rangePercent(priceRange[0])}%`,
              width: `${rangePercent(priceRange[1]) - rangePercent(priceRange[0])}%`,
              background: brandPrimary,
            }}
          />
          {/* Min input */}
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={priceRange[0]}
            onChange={e => {
              const val = Number(e.target.value)
              if (val <= priceRange[1]) setPriceRange([val, priceRange[1]])
            }}
            className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: priceRange[0] > globalMax - (globalMax - globalMin) * 0.1 ? 5 : 3 }}
          />
          {/* Max input */}
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            value={priceRange[1]}
            onChange={e => {
              const val = Number(e.target.value)
              if (val >= priceRange[0]) setPriceRange([priceRange[0], val])
            }}
            className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>

        {/* Manual inputs */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${labelColor}`}>Min</p>
            <input
              type="number"
              value={Math.round(priceRange[0] / 100)}
              onChange={e => {
                const val = Number(e.target.value) * 100
                if (val >= globalMin && val <= priceRange[1]) setPriceRange([val, priceRange[1]])
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${inputBg} focus:outline-none`}
              placeholder="Min"
            />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${labelColor}`}>Max</p>
            <input
              type="number"
              value={Math.round(priceRange[1] / 100)}
              onChange={e => {
                const val = Number(e.target.value) * 100
                if (val <= globalMax && val >= priceRange[0]) setPriceRange([priceRange[0], val])
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${inputBg} focus:outline-none`}
              placeholder="Max"
            />
          </div>
        </div>

        {/* Slider custom thumb CSS */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${brandPrimary};
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${brandPrimary};
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
        `}</style>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <p className={`text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}>Sort by</p>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className={`w-full text-sm px-3 py-2.5 rounded-xl border ${inputBg} focus:outline-none`}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A–Z</option>
        </select>
      </div>

      <div className={`border-t ${divider}`} />

      {/* Price range */}
      {allPrices.length > 0 && (
        <div>
          <button
            onClick={() => setPriceExpanded(!priceExpanded)}
            className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-3 ${labelColor}`}
          >
            Price Range
            {priceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {priceExpanded && <PriceRangeSlider />}
        </div>
      )}

      {(categories.length > 0 || collections.length > 0) && <div className={`border-t ${divider}`} />}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <button
            onClick={() => setCatExpanded(!catExpanded)}
            className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}
          >
            Categories
            {catExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {catExpanded && (
            <div className="space-y-1.5">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.handle)}
                      onChange={() => toggleCat(cat.handle)}
                      className="w-4 h-4 rounded accent-orange-500"
                    />
                    <span className={`text-sm ${textColor} group-hover:opacity-70 transition-opacity`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs ${subText}`}>{cat.product_count}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <div>
          <button
            onClick={() => setColExpanded(!colExpanded)}
            className={`w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2.5 ${labelColor}`}
          >
            Collections
            {colExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {colExpanded && (
            <div className="space-y-1.5">
              {collections.map(col => (
                <label key={col.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(col.handle)}
                      onChange={() => toggleCol(col.handle)}
                      className="w-4 h-4 rounded accent-orange-500"
                    />
                    <span className={`text-sm ${textColor} group-hover:opacity-70 transition-opacity`}>{col.title}</span>
                  </div>
                  <span className={`text-xs ${subText}`}>{col.product_count}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear all */}
      {activeFilters > 0 && (
        <>
          <div className={`border-t ${divider}`} />
          <button
            onClick={clearAll}
            className="w-full text-xs font-semibold py-2.5 rounded-xl border-2 transition-colors"
            style={{ borderColor: brandPrimary, color: brandPrimary }}
          >
            Clear all filters ({activeFilters})
          </button>
        </>
      )}
    </div>
  )

  return (
    <div>
      {/* Mobile top bar */}
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

      <div className="flex gap-6 items-start">
        {/* Desktop sidebar */}
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

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="hidden md:flex items-center justify-between mb-5">
            <p className={`text-sm ${subText}`}>
              Showing <span className={`font-semibold ${textColor}`}>{filtered.length}</span> of {products.length} products
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className={`text-lg font-medium mb-2 ${textColor}`}>No products found</p>
              <p className={`text-sm ${subText} mb-4`}>Try adjusting your filters</p>
              <button onClick={clearAll} className="text-sm font-semibold underline" style={{ color: brandPrimary }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handle={handle}
                  brandPrimary={brandPrimary}
                  variant={isDark ? "dark" : "light"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
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
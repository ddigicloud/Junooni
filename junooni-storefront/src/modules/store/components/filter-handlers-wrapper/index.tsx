"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
import { X } from "lucide-react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type Vendor = { id: string; name: string; handle: string }
type Collection = { id: string; title: string; handle: string }
type Category = { id: string; name: string; handle: string }

type FilterHandlersWrapperProps = {
  sortBy?: SortOptions
  page?: number
  categoryId?: string
  countryCode?: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  dynamicPriceRange?: { minPrice: number, maxPrice: number }
  minPrice?: number
  maxPrice?: number
  products?: any[]
  totalCount?: number
  totalPages?: number
  region?: HttpTypes.StoreRegion
  vendorsData?: Vendor[]
  collectionsData?: Collection[]
  categoriesData?: Category[]
  availableColors?: Array<{ name: string; hex: string }>
  selectedColors?: string[]
}

export default function FilterHandlersWrapper({
  sortBy = "created_at",
  page = 1,
  categoryId = "",
  countryCode = "",
  vendors: initialVendors = [],
  colors: initialColors = [],
  collections: initialCollections = [],
  categories: initialCategories = [],
  dynamicPriceRange = { minPrice: 0, maxPrice: 10000 },
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  products = [],
  totalCount = 0,
  totalPages = 1,
  region,
  vendorsData = [],
  collectionsData = [],
  categoriesData = [],
  availableColors = [],
  selectedColors = []
}: FilterHandlersWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [currentVendors, setCurrentVendors] = useState<string[]>(initialVendors)
  const [currentColors, setCurrentColors] = useState<string[]>(initialColors)
  const [currentCollections, setCurrentCollections] = useState<string[]>(initialCollections)
  const [currentCategories, setCurrentCategories] = useState<string[]>(initialCategories)
  const [currentMinPrice, setCurrentMinPrice] = useState<number | undefined>(initialMinPrice)
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number | undefined>(initialMaxPrice)

  // Sync state from URL on navigation
  useEffect(() => {
    const vendorsParam = searchParams?.get('vendors')
    const colorsParam = searchParams?.get('colors')
    const collectionsParam = searchParams?.get('collections')
    const categoriesParam = searchParams?.get('categories')
    const priceParam = searchParams?.get('price')

    setCurrentVendors(vendorsParam ? vendorsParam.split(',') : [])
    setCurrentColors(colorsParam ? colorsParam.split(',') : [])
    setCurrentCollections(collectionsParam ? collectionsParam.split(',') : [])
    setCurrentCategories(categoriesParam ? categoriesParam.split(',') : [])

    if (priceParam) {
      const [min, max] = priceParam.split('-').map(p => parseInt(p.replace('₹', ''), 10))
      setCurrentMinPrice(isNaN(min) ? undefined : min)
      setCurrentMaxPrice(isNaN(max) ? undefined : max)
    } else {
      setCurrentMinPrice(undefined)
      setCurrentMaxPrice(undefined)
    }
  }, [searchParams])

  const normalizeColorName = useCallback((colorName: string): string => {
    return colorName
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/gi, '$1 $2')
      .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
      .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const getColorHex = useCallback((colorName: string): string => {
    if (!availableColors || availableColors.length === 0) return '#6b7280'
    const normalizedInput = normalizeColorName(colorName).toLowerCase().trim()
    const match = availableColors.find(c =>
      normalizeColorName(c.name).toLowerCase().trim() === normalizedInput
    )
    if (match?.hex) {
      const hex = match.hex.startsWith('#') ? match.hex : '#' + match.hex
      return hex
    }
    const fallbacks: Record<string, string> = {
      'red': '#ef4444', 'blue': '#3b82f6', 'green': '#10b981',
      'yellow': '#f59e0b', 'purple': '#8b5cf6', 'pink': '#ec4899',
      'orange': '#f97316', 'black': '#000000', 'white': '#ffffff',
      'gray': '#6b7280', 'grey': '#6b7280', 'brown': '#92400e',
    }
    const key = normalizedInput.split(' ').find(w => fallbacks[w])
    return key ? fallbacks[key] : '#6b7280'
  }, [availableColors, normalizeColorName])

  const getVendorDisplayName = useCallback((handle: string) =>
    vendorsData.find(v => v.handle === handle)?.name ?? handle, [vendorsData])

  const getCollectionDisplayName = useCallback((handle: string) =>
    collectionsData.find(c => c.handle === handle)?.title ?? handle, [collectionsData])

  const getCategoryDisplayName = useCallback((handle: string) =>
    categoriesData.find(c => c.handle === handle)?.name ?? handle, [categoriesData])

  // ── Filter removal handlers — push URL instantly, no transition delay ────
  const pushFilter = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (!value) {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    if (name !== 'page') params.set('page', '1')
    // router.push updates URL INSTANTLY — Suspense key change triggers skeleton
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const handleRemoveVendor = useCallback((v: string) => {
    pushFilter("vendors", currentVendors.filter(x => x !== v).join(","))
  }, [currentVendors, pushFilter])

  const handleRemoveCollection = useCallback((c: string) => {
    pushFilter("collections", currentCollections.filter(x => x !== c).join(","))
  }, [currentCollections, pushFilter])

  const handleRemoveCategory = useCallback((c: string) => {
    pushFilter("categories", currentCategories.filter(x => x !== c).join(","))
  }, [currentCategories, pushFilter])

  const handleRemoveColor = useCallback((c: string) => {
    pushFilter("colors", currentColors.filter(x => x !== c).join(","))
  }, [currentColors, pushFilter])

  const handleRemovePriceFilter = useCallback(() => {
    pushFilter("price", "")
  }, [pushFilter])

  const handleClearAllFilters = useCallback(() => {
    router.push(`${pathname}?page=1`, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters =
    currentVendors.length > 0 ||
    currentColors.length > 0 ||
    currentCollections.length > 0 ||
    currentCategories.length > 0 ||
    currentMinPrice !== undefined ||
    currentMaxPrice !== undefined

  const colorsForImageSelection = selectedColors.length > 0 ? selectedColors : currentColors

  return (
    <div className="w-full">
      {/* Applied Filter Pills */}
      {hasActiveFilters && (
        <div className="p-4 mb-6 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Applied Filters:</h3>
            <button onClick={handleClearAllFilters} className="text-xs text-[#e65100] hover:underline">
              Clear All Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategories.map(handle => (
              <div key={`cat-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCategoryDisplayName(handle)}</span>
                <button onClick={() => handleRemoveCategory(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentCollections.map(handle => (
              <div key={`col-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCollectionDisplayName(handle)}</span>
                <button onClick={() => handleRemoveCollection(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentVendors.map(handle => (
              <div key={`ven-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getVendorDisplayName(handle)}</span>
                <button onClick={() => handleRemoveVendor(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentColors.map(color => (
              <div key={`clr-${color}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{normalizeColorName(color)}</span>
                <div
                  className="flex-shrink-0 w-4 h-4 border border-gray-300 rounded-full shadow-sm"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <button onClick={() => handleRemoveColor(color)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
              <div className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span>Price: ₹{currentMinPrice || 0} - ₹{currentMaxPrice || 10000}</span>
                <button onClick={handleRemovePriceFilter} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        NO isPending overlay here.
        Suspense in StoreTemplate handles the loading state — the skeleton
        shows immediately when the URL changes (Suspense key prop).
        The old isPending overlay was redundant AND it caused the 6-7 second
        freeze because it only appeared after the server round-trip started,
        not before.
      */}
      <PaginatedProductsDisplay
        products={products}
        totalCount={totalCount}
        currentPage={page}
        totalPages={totalPages}
        region={region}
        selectedColors={colorsForImageSelection}
      />
    </div>
  )
}
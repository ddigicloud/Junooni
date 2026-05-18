"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown, ChevronUp } from "lucide-react"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import VendorFilter from "@modules/store/components/vendor-filter"
import ColorFilter from "@modules/store/components/color-filter"
import PriceFilter from "@modules/store/components/price-filter"
import CollectionFilter from "@modules/store/components/collection-filter"

type Category = {
  id: string
  name: string
  handle: string
  parent_category_id?: string
  category_children?: Category[]
  mpath?: string
}
type Vendor = { id: string; name: string; handle: string }
type Collection = { id: string; title: string; handle: string }
type Color = { name: string; hex: string }

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Category[]
  vendors?: Vendor[]
  products?: HttpTypes.StoreProduct[]
  currentCategory?: HttpTypes.StoreProductCategory
  collections?: Collection[]
  selectedCollections?: string | string[]
  selectedVendors?: string | string[]
  selectedColors?: string | string[]
  // BUG FIX: Accept selectedCategories as array from ClientStoreShell state
  selectedCategories?: string[]
  isCollectionPage?: boolean
  initialVendorLimit?: number
  dynamicPriceRange?: { minPrice: number; maxPrice: number }
  availableColors?: Color[]
  // When provided by ClientStoreShell, this intercepts calls client-side
  setQueryParams?: (name: string, value: string) => void
}

const RefinementList = ({
  sortBy,
  categories = [],
  vendors = [],
  products = [],
  currentCategory,
  collections = [],
  selectedCollections = [],
  selectedVendors = [],
  selectedColors = [],
  selectedCategories: selectedCategoriesProp,
  isCollectionPage = false,
  initialVendorLimit = 10,
  dynamicPriceRange = { minPrice: 0, maxPrice: 10000 },
  availableColors,
  setQueryParams: externalSetQueryParams,
  'data-testid': dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const normalizeToArray = (value: string | string[] | undefined): string[] => {
    if (!value) return []
    if (typeof value === 'string') return value.split(',').filter(Boolean)
    return value
  }

  const propSelectedCollections = normalizeToArray(selectedCollections)
  const propSelectedVendors = normalizeToArray(selectedVendors)
  const propSelectedColors = normalizeToArray(selectedColors)

  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    category: true,
    collection: true,
    vendor: true,
    color: true,
    price: true,
  })
  const [categoryLimit, setCategoryLimit] = useState(10)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section as keyof typeof prev] }))
  }

  // ── setQueryParams: use external (ClientStoreShell) if provided ────────────
  // External = instant client-side state update, no server round-trip.
  // Internal fallback = router.push for pages that don't use ClientStoreShell.
  const setQueryParams = useCallback(
    (name: string, value: string) => {
      if (externalSetQueryParams) {
        externalSetQueryParams(name, value)
        return
      }
      // Fallback: URL navigation for non-ClientStoreShell pages
      const params = new URLSearchParams(searchParams)
      if (!value) params.delete(name)
      else params.set(name, value)
      if (name !== 'page') params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [externalSetQueryParams, searchParams, router, pathname]
  )

  // ── URL param reads (only used when externalSetQueryParams is NOT provided) ─
  const collectionsParam = searchParams.get("collections") || ""
  const colorsParam = searchParams.get("colors") || ""
  const vendorsParam = searchParams.get("vendors") || ""
  const priceParam = searchParams.get("price") || ""
  // BUG FIX: Read categories from URL only as fallback
  const categoriesParam = searchParams.get("categories") || ""

  const finalSelectedCollections = propSelectedCollections.length > 0
    ? propSelectedCollections
    : (collectionsParam ? collectionsParam.split(",") : [])

  const finalSelectedVendors = propSelectedVendors.length > 0
    ? propSelectedVendors
    : (vendorsParam ? vendorsParam.split(",") : [])

  const finalSelectedColors = propSelectedColors.length > 0
    ? propSelectedColors
    : (colorsParam ? colorsParam.split(",") : [])

  // BUG FIX: selectedCategories from ClientStoreShell state takes priority over URL
  const finalSelectedCategories = selectedCategoriesProp !== undefined
    ? selectedCategoriesProp
    : (categoriesParam ? categoriesParam.split(",") : [])

  const [minPrice, maxPrice] = priceParam
    ? priceParam.split("-").map((p) => parseInt(p, 10))
    : [dynamicPriceRange.minPrice, dynamicPriceRange.maxPrice]

  const PRICE_MIN = dynamicPriceRange.minPrice
  const PRICE_MAX = dynamicPriceRange.maxPrice

  // ── Category options ───────────────────────────────────────────────────────
  const getFilterableCategories = () => {
    if (!products || products.length === 0) return flattenCategories(categories)
    const productCategoryHandles = new Set<string>()
    products.forEach((product) => {
      product.categories?.forEach((cat) => {
        productCategoryHandles.add(cat.handle)
      })
    })
    return flattenCategories(categories.filter((c) => productCategoryHandles.has(c.handle)))
  }

  const getFilterableVendors = () => {
    if (!products || products.length === 0) return formatVendorsArray(vendors)
    const productVendors = new Map<string, Vendor>()
    products.forEach((product) => {
      if ((product as any).vendor) {
        const v = (product as any).vendor
        productVendors.set(v.handle, { id: v.id, name: v.name, handle: v.handle })
      }
    })
    return formatVendorsArray(Array.from(productVendors.values()))
  }

  const getFilterableCollections = () => {
    if (!products || products.length === 0 || !collections.length)
      return formatCollectionsArray(collections)
    const handles = new Set<string>()
    products.forEach((p) => { if (p.collection?.handle) handles.add(p.collection.handle) })
    return formatCollectionsArray(collections.filter((c) => handles.has(c.handle)))
  }

  const flattenCategories = (list: Category[]): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = []
    const seen = new Set<string>()
    const process = (cat: Category, level = 0) => {
      if (seen.has(cat.id)) return
      seen.add(cat.id)
      result.push({ value: cat.handle, label: `${"".repeat(level)} ${cat.name}` })
      cat.category_children?.forEach((child) => process(child, level + 1))
    }
    list.forEach((c) => process(c))
    return result
  }

  const formatVendorsArray = (list: Vendor[]): { value: string; label: string }[] => {
    const map = new Map<string, Vendor>()
    list.forEach((v) => { if (!map.has(v.handle)) map.set(v.handle, v) })
    return [
      { value: "", label: "All Vendors" },
      ...Array.from(map.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((v) => ({ value: v.name, label: v.name })),
    ]
  }

  const formatCollectionsArray = (list: Collection[]): { value: string; label: string }[] => {
    const map = new Map<string, Collection>()
    list.forEach((c) => { if (!map.has(c.handle)) map.set(c.handle, c) })
    return [
      { value: "", label: "All Collections" },
      ...Array.from(map.values())
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((c) => ({ value: c.handle, label: c.title })),
    ]
  }

  const getAvailableColors = (): Color[] => {
    if (availableColors?.length) return availableColors
    if (!products?.length) return []
    const map = new Map<string, Color>()
    products.forEach((product) => {
      if (!product.metadata?.color_hex_values) return
      try {
        const parsed = JSON.parse(product.metadata.color_hex_values as string)
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c.name && c.hex) {
              const name = c.name.trim().toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              map.set(name.toLowerCase(), { name, hex: c.hex })
            }
          })
        }
      } catch {}
    })
    return Array.from(map.values())
  }

  const formattedCategories = getFilterableCategories()
  const formattedVendors = getFilterableVendors()
  const formattedCollections = getFilterableCollections()
  const colorsWithHex = getAvailableColors()

  const showCategoryFilter = formattedCategories.length > 1
  const showCollectionFilter = !isCollectionPage && formattedCollections.length > 1
  const showVendorFilter = formattedVendors.length > 1
  const showColorFilter = colorsWithHex.length > 0

  const hasActiveFilters =
    finalSelectedCategories.length > 0 ||
    finalSelectedCollections.length > 0 ||
    finalSelectedVendors.length > 0 ||
    finalSelectedColors.length > 0 ||
    minPrice > PRICE_MIN ||
    maxPrice < PRICE_MAX

  const clearAllFilters = () => {
    if (externalSetQueryParams) {
      // ClientStoreShell will handle clearing all state
      router.push(`${pathname}?page=1`, { scroll: false })
    } else {
      const params = new URLSearchParams(searchParams)
      params.delete("categories")
      params.delete("category")
      params.delete("collections")
      params.delete("vendors")
      params.delete("colors")
      params.delete("price")
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <button className="text-sm text-[#e65100] hover:underline" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      {showCategoryFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3 text-[#e65100]"
            onClick={() => toggleSection('category')}
          >
            <h3 className="font-medium">Categories</h3>
            {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.category && (
            <div>
              <CategoryFilter
                categories={formattedCategories.slice(0, categoryLimit + 1)}
                // BUG FIX: Pass state array directly — instant deselect/clear,
                // no URL lag. CategoryFilter reads this instead of searchParams.
                selectedCategories={finalSelectedCategories}
                collection={products}
                setQueryParams={(name, value) => {
                  // Always use "categories" (plural) to match ClientStoreShell
                  setQueryParams("categories", value)
                }}
                data-testid={`${dataTestId}-category`}
              />
              {formattedCategories.length > categoryLimit + 1 && (
                <button
                  onClick={() => setCategoryLimit((prev) => prev + 10)}
                  className="-mt-2 text-sm font-medium text-[#e65100] hover:underline flex items-center gap-1"
                >
                  ({formattedCategories.length - categoryLimit - 1} more)
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              {categoryLimit > 10 && (
                <button
                  onClick={() => setCategoryLimit(10)}
                  className="mt-0 font-medium text-sm text-[#e65100] hover:underline flex items-center gap-1"
                >
                  Show less <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collections */}
      {showCollectionFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('collection')}
          >
            <h3 className="font-medium">Collections</h3>
            {expandedSections.collection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.collection && (
            <CollectionFilter
              collections={formattedCollections}
              selectedCollections={finalSelectedCollections.join(",")}
              setQueryParams={setQueryParams}
              collection={products}
              data-testid={`${dataTestId}-collection`}
            />
          )}
        </div>
      )}

      {/* Vendors */}
      {showVendorFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('vendor')}
          >
            <h3 className="font-medium">Creators</h3>
            {expandedSections.vendor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.vendor && (
            <VendorFilter
              vendors={formattedVendors}
              selectedVendors={finalSelectedVendors}
              setQueryParams={setQueryParams}
              collection={products}
              data-testid={`${dataTestId}-vendor`}
              initialLimit={initialVendorLimit}
            />
          )}
        </div>
      )}

      {/* Colors */}
      {showColorFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('color')}
          >
            <h3 className="font-medium">Colors</h3>
            {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.color && (
            <ColorFilter
              collection={products}
              availableColors={colorsWithHex}
              selectedColors={finalSelectedColors}
              setQueryParams={setQueryParams}
              data-testid={`${dataTestId}-color`}
            />
          )}
        </div>
      )}

      {/* Price */}
      {PRICE_MAX > 0 && (
        <div>
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('price')}
          >
            <h3 className="font-medium">Price Range</h3>
            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.price && (
            <PriceFilter
              min={dynamicPriceRange.minPrice}
              max={dynamicPriceRange.maxPrice}
              currentMin={minPrice || dynamicPriceRange.minPrice}
              currentMax={maxPrice || dynamicPriceRange.maxPrice}
              setQueryParams={setQueryParams}
              data-testid={`${dataTestId}-price`}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default RefinementList
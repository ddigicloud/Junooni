"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { X } from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeColorName = (colorName: string): string =>
  colorName
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, "$1 $2")
    .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, "$1 $2")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

const sortProducts = (products: any[], sortBy: SortOptions): any[] => {
  const sorted = [...products]
  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => {
        const pa = a.variants?.[0]?.calculated_price?.calculated_amount ?? Infinity
        const pb = b.variants?.[0]?.calculated_price?.calculated_amount ?? Infinity
        return pa - pb
      })
    case "price_desc":
      return sorted.sort((a, b) => {
        const pa = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
        const pb = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
        return pb - pa
      })
    case "name_asc":
    case "title_asc":
      return sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""))
    case "name_desc":
    case "title_desc":
      return sorted.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""))
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      )
  }
}

const extractColors = (products: any[]) => {
  const map = new Map<string, { name: string; hex: string }>()
  products.forEach((p) => {
    if (!p.metadata?.color_hex_values) return
    let data = p.metadata.color_hex_values
    if (typeof data === "string") {
      try { data = JSON.parse(data) } catch { return }
    }
    if (!Array.isArray(data)) return
    data.forEach((c: any) => {
      if (!c.name || !c.hex) return
      let hex = c.hex.trim()
      if (!hex.startsWith("#")) hex = "#" + hex
      if (!/^#[0-9A-F]{6}$/i.test(hex)) return
      const name = normalizeColorName(c.name)
      map.set(name.toLowerCase(), { name, hex })
    })
  })
  return Array.from(map.values())
}

const calcPriceRange = (products: any[]) => {
  const prices: number[] = []
  products.forEach((p) => {
    p.variants?.forEach((v: any) => {
      const price = v.calculated_price?.calculated_amount
      if (price && price > 0) prices.push(Math.round(price))
    })
  })
  if (!prices.length) return { minPrice: 0, maxPrice: 10000 }
  return {
    minPrice: Math.floor(Math.min(...prices)),
    maxPrice: Math.ceil(Math.max(...prices)),
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  category: HttpTypes.StoreProductCategory
  allProducts: any[]
  region: HttpTypes.StoreRegion
  countryCode: string
  initialSortBy: SortOptions
  initialVendorNames: string[]
  initialColors: string[]
  initialCollectionHandles: string[]
  initialMinPrice?: number
  initialMaxPrice?: number
  initialPage: number
  productLimit: number
}

export default function ClientCategoryShell({
  category,
  allProducts,
  region,
  countryCode,
  initialSortBy,
  initialVendorNames,
  initialColors,
  initialCollectionHandles,
  initialMinPrice,
  initialMaxPrice,
  initialPage,
  productLimit,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  // ── Filter state ───────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortOptions>(initialSortBy)
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initialVendorNames)
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors)
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialCollectionHandles)
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // ── Sync URL → state on back/forward ──────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const sp = new URLSearchParams(searchParams.toString())
    setSortBy((sp.get("sortBy") as SortOptions) || "created_at")
    setSelectedVendors(sp.get("vendors")?.split(",").filter(Boolean) || [])
    setSelectedColors(sp.get("colors")?.split(",").filter(Boolean) || [])
    setSelectedCollections(sp.get("collections")?.split(",").filter(Boolean) || [])
    setCurrentPage(parseInt(sp.get("page") || "1"))
    const priceParam = sp.get("price")
    if (priceParam) {
      const [mn, mx] = priceParam.split("-").map((p) => parseInt(p.replace(/[^\d]/g, ""), 10))
      setMinPrice(isNaN(mn) ? undefined : mn)
      setMaxPrice(isNaN(mx) ? undefined : mx)
    } else {
      setMinPrice(undefined)
      setMaxPrice(undefined)
    }
  }, [searchParams])

  // ── Sidebar derived data ───────────────────────────────────────────────────
  const availableColors = useMemo(() => extractColors(allProducts), [allProducts])
  const globalPriceRange = useMemo(() => calcPriceRange(allProducts), [allProducts])

  // Vendors from category products
  const categoryVendors = useMemo(() => {
    const map = new Map<string, any>()
    allProducts.forEach((p) => {
      if (p.vendor) map.set(p.vendor.handle, p.vendor)
    })
    return Array.from(map.values())
  }, [allProducts])

  // Collections from category products
  const categoryCollections = useMemo(() => {
    const map = new Map<string, any>()
    allProducts.forEach((p) => {
      if (p.collection) map.set(p.collection.id, p.collection)
    })
    return Array.from(map.values())
  }, [allProducts])

  // Breadcrumb parents
  const parents = useMemo(() => {
    const list: HttpTypes.StoreProductCategory[] = []
    const getParents = (cat: HttpTypes.StoreProductCategory) => {
      if (cat.parent_category) {
        list.push(cat.parent_category)
        getParents(cat.parent_category)
      }
    }
    getParents(category)
    return list
  }, [category])

  // ── CLIENT-SIDE FILTERING ─────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (selectedVendors.length) {
      result = result.filter((p) => p.vendor && selectedVendors.includes(p.vendor.name))
    }
    if (selectedCollections.length) {
      result = result.filter(
        (p) => p.collection && selectedCollections.includes(p.collection.handle)
      )
    }
    if (selectedColors.length) {
      result = result.filter((product) => {
        const productColors = new Set<string>()
        if (product.metadata?.color_hex_values) {
          let data = product.metadata.color_hex_values
          if (typeof data === "string") {
            try { data = JSON.parse(data) } catch { return false }
          }
          if (Array.isArray(data)) {
            data.forEach((c: any) => {
              if (c?.name) productColors.add(normalizeColorName(c.name).toLowerCase())
            })
          }
        }
        return selectedColors.some((c) =>
          productColors.has(normalizeColorName(c).toLowerCase())
        )
      })
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      result = result.filter((p) => {
        const price = p.variants?.[0]?.calculated_price?.calculated_amount
        if (!price) return false
        return (
          (minPrice === undefined || price >= minPrice) &&
          (maxPrice === undefined || price <= maxPrice)
        )
      })
    }

    return sortProducts(result, sortBy)
  }, [allProducts, selectedVendors, selectedColors, selectedCollections, minPrice, maxPrice, sortBy])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalCount = filteredProducts.length
  const totalPages = Math.ceil(totalCount / productLimit) || 1
  const safePage = Math.min(currentPage, totalPages)

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * productLimit
    return filteredProducts.slice(start, start + productLimit)
  }, [filteredProducts, safePage, productLimit])

  // ── setQueryParams — instant state + URL ──────────────────────────────────
  const setQueryParams = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case "sortBy":
          setSortBy((value as SortOptions) || "created_at")
          break
        case "vendors":
          setSelectedVendors(value ? value.split(",").filter(Boolean) : [])
          break
        case "colors":
          setSelectedColors(value ? value.split(",").filter(Boolean) : [])
          break
        case "collections":
          setSelectedCollections(value ? value.split(",").filter(Boolean) : [])
          break
        case "price": {
          if (!value) { setMinPrice(undefined); setMaxPrice(undefined) }
          else {
            const [mn, mx] = value.split("-").map((p) => parseInt(p.replace(/[^\d]/g, ""), 10))
            setMinPrice(isNaN(mn) ? undefined : mn)
            setMaxPrice(isNaN(mx) ? undefined : mx)
          }
          break
        }
        case "page":
          setCurrentPage(parseInt(value) || 1)
          return
      }
      setCurrentPage(1)

      const params = new URLSearchParams(searchParams.toString())
      if (!value) params.delete(name)
      else params.set(name, value)
      if (name !== "page") params.set("page", "1")
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage)
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", newPage.toString())
      router.push(`${pathname}?${params.toString()}`, { scroll: true })
    },
    [searchParams, router, pathname]
  )

  const clearAllFilters = useCallback(() => {
    setSortBy("created_at")
    setSelectedVendors([])
    setSelectedColors([])
    setSelectedCollections([])
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setCurrentPage(1)
    router.push(`${pathname}?page=1`, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters =
    selectedVendors.length > 0 ||
    selectedColors.length > 0 ||
    selectedCollections.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined

  const dynamicPriceRange = {
    minPrice: globalPriceRange.minPrice,
    maxPrice: globalPriceRange.maxPrice,
  }

  return (
    <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">

      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <RefinementList
          sortBy={sortBy}
          vendors={categoryVendors}
          products={allProducts}
          currentCategory={category}
          collections={categoryCollections}
          selectedCollections={selectedCollections}
          selectedVendors={selectedVendors}
          selectedColors={selectedColors}
          availableColors={availableColors}
          dynamicPriceRange={dynamicPriceRange}
          isCollectionPage={false}
          setQueryParams={setQueryParams}
        />
      </div>

      {/* Main content */}
      <div className="w-full px-0 ml-0 md:ml-4 sm:px-0 md:px-2">

        {/* Breadcrumb */}
        <div className="hidden mb-4 text-sm text-gray-600 md:block">
          <LocalizedClientLink href="/" className="hover:text-[#e65100]">
            Home
          </LocalizedClientLink>
          <span className="mx-1.5">/</span>
          {parents.length > 0 &&
            parents
              .slice()
              .reverse()
              .map((parent) => (
                <span key={parent.id}>
                  <LocalizedClientLink
                    className="hover:text-[#e65100]"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  <span className="mx-1.5">/</span>
                </span>
              ))}
          <span className="font-medium text-gray-900">{category.name}</span>
        </div>

        {/* Category header */}
        <div className="px-2 mt-2 mb-0 small:mt-12 text-2xl-semi sm:px-0 md:px-0">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Sort + active filters */}
        <div className="flex flex-col gap-3 mt-4 mb-4">
          <div className="flex justify-end">
            <SortWrapper
              sortBy={sortBy}
              data-testid="sort-above-grid"
              onSortChange={(newSort: SortOptions) => setQueryParams("sortBy", newSort)}
            />
          </div>

          {hasActiveFilters && (
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                <button onClick={clearAllFilters} className="text-xs text-[#e65100] hover:underline">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedVendors.map((v) => (
                  <Pill
                    key={`ven-${v}`}
                    label={v}
                    onRemove={() =>
                      setQueryParams("vendors", selectedVendors.filter((x) => x !== v).join(","))
                    }
                  />
                ))}
                {selectedCollections.map((c) => (
                  <Pill
                    key={`col-${c}`}
                    label={c}
                    onRemove={() =>
                      setQueryParams(
                        "collections",
                        selectedCollections.filter((x) => x !== c).join(",")
                      )
                    }
                  />
                ))}
                {selectedColors.map((c) => (
                  <Pill
                    key={`clr-${c}`}
                    label={normalizeColorName(c)}
                    onRemove={() =>
                      setQueryParams("colors", selectedColors.filter((x) => x !== c).join(","))
                    }
                  />
                ))}
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <Pill
                    label={`₹${minPrice ?? 0} – ₹${maxPrice ?? 10000}`}
                    onRemove={() => setQueryParams("price", "")}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <PaginatedProductsDisplay
          products={paginatedProducts}
          totalCount={totalCount}
          currentPage={safePage}
          totalPages={totalPages}
          region={region}
          selectedColors={selectedColors}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
      <span className="capitalize">{label}</span>
      <button
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-700"
      >
        <X size={11} />
      </button>
    </div>
  )
}
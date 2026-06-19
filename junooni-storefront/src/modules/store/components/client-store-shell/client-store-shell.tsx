"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
import { X } from "lucide-react"

const PRODUCT_LIMIT = 20

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
    default: // created_at
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
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
  initialProducts: any[]   // first 50 from server
  totalCount: number       // total product count from Medusa
  categoriesData: any[]
  vendorsData: any[]
  region: HttpTypes.StoreRegion
  countryCode: string
  initialSortBy: SortOptions
  initialVendors: string[]
  initialColors: string[]
  initialCollections: string[]
  initialCategories: string[]
  initialMinPrice?: number
  initialMaxPrice?: number
  initialPage: number
}

// ─── ClientStoreShell ─────────────────────────────────────────────────────────
export default function ClientStoreShell({
  initialProducts,
  totalCount,
  categoriesData,
  vendorsData,
  region,
  countryCode,
  initialSortBy,
  initialVendors,
  initialColors,
  initialCollections,
  initialCategories,
  initialMinPrice,
  initialMaxPrice,
  initialPage,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  // ── Product state — starts with first 50, grows as background batches arrive
  const [allProducts, setAllProducts] = useState<any[]>(initialProducts)
  const [loadingMore, setLoadingMore] = useState(totalCount > initialProducts.length)

  // ── Background batch fetch — fires after first paint, invisible to user ────
  useEffect(() => {
    // Nothing more to fetch
    if (totalCount <= initialProducts.length) return

    let cancelled = false

      const fetchRemaining = async () => {
      const BATCH = 100
      const remaining = totalCount - initialProducts.length
      const batches = Math.ceil(remaining / BATCH)

      // Fire ALL batch requests simultaneously instead of one by one
      const requests = Array.from({ length: batches }, (_, i) => {
        const offset = initialProducts.length + i * BATCH
        return fetch(
          `/api/store-products?offset=${offset}&limit=${BATCH}&countryCode=${countryCode}`
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data?.products ?? [])
          .catch(() => [])
      })

      const results = await Promise.all(requests)
      if (cancelled) return

      // Merge all batches at once — single state update, single re-render
      const allFresh = results.flat()
      if (allFresh.length) {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const fresh = allFresh.filter((p: any) => !existingIds.has(p.id))
          return fresh.length ? [...prev, ...fresh] : prev
        })
      }

      if (!cancelled) setLoadingMore(false)
    }

    fetchRemaining()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — only run once on mount

  // ── Filter state ───────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortOptions>(initialSortBy)
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initialVendors)
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors)
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialCollections)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories)
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // ── Sync URL → state on back/forward navigation ────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const sp = new URLSearchParams(searchParams.toString())
    setSortBy((sp.get("sortBy") as SortOptions) || "created_at")
    setSelectedVendors(sp.get("vendors")?.split(",").filter(Boolean) || [])
    setSelectedColors(sp.get("colors")?.split(",").filter(Boolean) || [])
    setSelectedCollections(sp.get("collections")?.split(",").filter(Boolean) || [])
    setSelectedCategories(sp.get("categories")?.split(",").filter(Boolean) || [])
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

  // ── Sidebar data — computed from all products loaded so far ───────────────
  // As more batches arrive, colors/price range expands automatically
  const availableColors = useMemo(() => extractColors(allProducts), [allProducts])
  const globalPriceRange = useMemo(() => calcPriceRange(allProducts), [allProducts])

  // ── CLIENT-SIDE FILTERING — runs in browser, instant ──────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (selectedCollections.length) {
      result = result.filter(
        (p) => p.collection && selectedCollections.includes(p.collection.handle)
      )
    }
    if (selectedCategories.length) {
      result = result.filter((p) =>
        p.categories?.some((c: any) => selectedCategories.includes(c.handle))
      )
    }
    if (selectedVendors.length) {
      result = result.filter((p) => p.vendor && selectedVendors.includes(p.vendor.name))
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
        product.variants?.forEach((v: any) => {
          if (v.metadata?.color)
            productColors.add(normalizeColorName(v.metadata.color).toLowerCase())
        })
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
  }, [
    allProducts,
    selectedVendors,
    selectedColors,
    selectedCollections,
    selectedCategories,
    minPrice,
    maxPrice,
    sortBy,
  ])

  // ── Client-side pagination ─────────────────────────────────────────────────
  const totalFilteredCount = filteredProducts.length
  const totalPages = Math.ceil(totalFilteredCount / PRODUCT_LIMIT) || 1
  const safePage = Math.min(currentPage, totalPages)

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PRODUCT_LIMIT
    return filteredProducts.slice(start, start + PRODUCT_LIMIT)
  }, [filteredProducts, safePage])

  // ── setQueryParams — called by RefinementList + SortWrapper ───────────────
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
        case "categories":
          setSelectedCategories(value ? value.split(",").filter(Boolean) : [])
          break
        case "price": {
          if (!value) {
            setMinPrice(undefined)
            setMaxPrice(undefined)
          } else {
            const [mn, mx] = value
              .split("-")
              .map((p) => parseInt(p.replace(/[^\d]/g, ""), 10))
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

  // ── Page change handler ────────────────────────────────────────────────────
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
    setSelectedCategories([])
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setCurrentPage(1)
    router.push(`${pathname}?page=1`, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters =
    selectedVendors.length > 0 ||
    selectedColors.length > 0 ||
    selectedCollections.length > 0 ||
    selectedCategories.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined

  const dynamicPriceRange = {
    minPrice: globalPriceRange.minPrice,
    maxPrice: globalPriceRange.maxPrice,
  }

  return (
    <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">

      {/* Desktop sidebar */}
      <div className="flex-shrink-0 hidden md:block">
        <RefinementList
          sortBy={sortBy}
          search={true}
          vendors={vendorsData}
          categories={categoriesData}
          products={allProducts}
          availableColors={availableColors}
          dynamicPriceRange={dynamicPriceRange}
          selectedVendors={selectedVendors}
          selectedColors={selectedColors}
          selectedCollections={selectedCollections}
          selectedCategories={selectedCategories}
          setQueryParams={setQueryParams}
        />
      </div>

      <div className="w-full px-0 ml-0 md:ml-4 sm:px-0">
        <div className="px-2 mt-0 mb-0 small:mt-12 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>

        {/* Sort + active filters row */}
        <div className="flex flex-col gap-3 mt-4 mb-4">
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-2">
             
              {loadingMore && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Loading more…
                </span>
              )}
            </div> */}
            <div/>
            <SortWrapper
              sortBy={sortBy}
              data-testid="sort-above-grid"
              onSortChange={(newSort: SortOptions) => setQueryParams("sortBy", newSort)}
            />
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#e65100] hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((h) => (
                  <Pill
                    key={`cat-${h}`}
                    label={categoriesData.find((c) => c.handle === h)?.name ?? h}
                    onRemove={() =>
                      setQueryParams(
                        "categories",
                        selectedCategories.filter((x) => x !== h).join(",")
                      )
                    }
                  />
                ))}
                {selectedVendors.map((v) => (
                  <Pill
                    key={`ven-${v}`}
                    label={v}
                    onRemove={() =>
                      setQueryParams(
                        "vendors",
                        selectedVendors.filter((x) => x !== v).join(",")
                      )
                    }
                  />
                ))}
                {selectedColors.map((c) => (
                  <Pill
                    key={`clr-${c}`}
                    label={normalizeColorName(c)}
                    onRemove={() =>
                      setQueryParams(
                        "colors",
                        selectedColors.filter((x) => x !== c).join(",")
                      )
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

        {/* Products grid */}
        <PaginatedProductsDisplay
          products={paginatedProducts}
          totalCount={totalCount}
          currentPage={safePage}
          totalPages={totalPages}
          region={region}
          selectedColors={selectedColors}
          onPageChange={handlePageChange}
        />

        {/*
          Bottom loading bar — only visible while background batches are still fetching.
          Placed below the grid so it never disrupts the product layout.
        */}
        {/* {loadingMore && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
            <span>Loading more products…</span>
          </div>
        )} */}
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
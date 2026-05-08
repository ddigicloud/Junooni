"use client"

import { useEffect, useState } from "react"
import ProductGrid from "@/components/store/ProductGrid"
import PageSections from "@/components/store/PageSections"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

interface Props {
  vendor: any
  initialStore: any
  products: any[]
  categories: any[]
  collections: any[]
  handle: string
}

export default function ProductsPageClient({
  vendor, initialStore, products, categories, collections, handle
}: Props) {
  const [store, setStore] = useState(initialStore)

  useEffect(() => {
    // Tell editor we're ready
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")

    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setStore(e.data.store)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Read section settings from live store state
  const pageSections: any[] = store?.sections?.page_layouts?.products?.sections ?? []
  const gridSection = pageSections.find((s: any) => s.type === "collection") ?? {}

  const brandPrimary   = store?.primary_color ?? "#e65100"
  const isDark         = store?.template === "bold"
  const gridColumns    = gridSection.columns        ?? 3
  const gridLimit      = gridSection.limit          ?? 48
  const showSoldOut    = gridSection.show_sold_out  !== false
  const gridTitle      = gridSection.title          ?? "All Products"
  const gridBg         = gridSection.background_color
  const gridTextColor  = gridSection.text_color

  const showFilters          = gridSection.show_filters           !== false
  const showSort             = gridSection.show_sort              !== false
  const showPriceFilter      = gridSection.show_price_filter      !== false
  const showCategoryFilter   = gridSection.show_category_filter   !== false
  const showCollectionFilter = gridSection.show_collection_filter !== false

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": store?.secondary_color ?? "#000",
  } as React.CSSProperties

  // Selected section highlight (same pattern as MinimalTemplate)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE") {
        setSelectedSectionId(e.data.selectedId ?? null)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  const isEditorMode = typeof window !== "undefined" && window.parent !== window
  const sectionId = gridSection.id ?? "def_prod_grid"
  const isSelected = selectedSectionId === sectionId

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
      <StoreHeader
        vendor={vendor} store={store}
        categories={categories} collections={collections} products={products}
      />

      <PageSections
        layoutKey="products"
        store={store}
        vendor={vendor}
        products={products}
        categories={categories}
        collections={collections}
        brandPrimary={brandPrimary}
        isDark={isDark}
        position="top"
        skipTypes={["collection"]}
      />

      {/* Grid section — clicking tells editor which section is selected */}
      <div
        data-section-id={sectionId}
        onClick={() => {
          if (isEditorMode && sectionId) {
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId }, "*")
          }
        }}
        className={`px-4 py-10 mx-auto max-w-7xl sm:px-6 relative transition-all ${isEditorMode ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: gridBg ?? "transparent",
          ...(isSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}),
        }}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
            style={{ background: "#e65100", borderBottomRightRadius: "6px" }}>
            Editing
          </div>
        )}

        <div className="mb-8">
          {/* <p
            className="mb-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: brandPrimary }}
          >
            {vendor.name}
          </p> */}
          <h1
            className="text-3xl font-bold"
            style={{ color: gridTextColor ?? (isDark ? "#ffffff" : "#111827") }}
          >
            {gridTitle}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: gridTextColor ? `${gridTextColor}99` : (isDark ? "rgba(255,255,255,0.5)" : "#6b7280") }}
          >
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ProductGrid
          products={products}
          categories={categories}
          collections={collections}
          handle={handle}
          brandPrimary={brandPrimary}
          isDark={isDark}
          columns={gridColumns}
          limit={gridLimit}
          showSoldOut={showSoldOut}
          showFilters={showFilters}
          showSort={showSort}
          showPriceFilter={showPriceFilter}
          showCategoryFilter={showCategoryFilter}
          showCollectionFilter={showCollectionFilter}
        />
      </div>

      <PageSections
        layoutKey="products"
        store={store}
        vendor={vendor}
        products={products}
        categories={categories}
        collections={collections}
        brandPrimary={brandPrimary}
        isDark={isDark}
        position="all"
        skipTypes={["collection"]}
      />

      <StoreFooter
        vendor={vendor} store={store}
        categories={categories} collections={collections}
      />
    </div>
  )
}
import { useState, useRef, useEffect } from "react"
import { Globe, ChevronDown as ChevronDownIcon, ChevronRight, Check } from "lucide-react"
import type { StorePage } from "./types"

// ─── PageSwitcherPagesGroup ───────────────────────────────────────────────────

function PageSwitcherPagesGroup({ pages, currentPath, onSelect, setOpen, isDark, textFaint, hoverBg }: {
  pages: StorePage[]
  currentPath: string
  onSelect: (p: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  textFaint: string
  hoverBg: string
}) {
  const [expanded, setExpanded] = useState(false)
  const hasActive = pages.some(p => currentPath === `/pages/${p.slug}`)

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs transition-colors ${
          hasActive
            ? isDark ? "text-orange-400" : "text-orange-600"
            : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
        } ${hoverBg}`}
      >
        <span>
          Custom pages{hasActive && ` — ${pages.find(p => currentPath === `/pages/${p.slug}`)?.title}`}
        </span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && pages.map(p => {
        const path = `/pages/${p.slug}`
        return (
          <button
            key={p.id}
            onClick={() => { onSelect(path); setOpen(false) }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
              currentPath === path
                ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
            }`}
          >
            <span className="text-sm leading-none">📄</span>
            <span className="flex-1 truncate">{p.title}</span>
            {currentPath === path && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── PageSwitcherDropdown ─────────────────────────────────────────────────────

export function PageSwitcherDropdown({ currentPath, onSelect, pages, products = [], categories = [], collections = [], isDark, panelBorder, textPrimary, textFaint, hoverBg }: {
  currentPath: string
  onSelect: (path: string) => void
  pages: StorePage[]
  products?: { id: string; title: string; handle: string; thumbnail?: string }[]
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  isDark: boolean
  panelBorder: string
  textPrimary: string
  textFaint: string
  hoverBg: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const builtinPages = [
    { label: "Home page",    path: "/",           icon: "🏠" },
    { label: "All Products", path: "/products",   icon: "🛍️" },
    { label: "Categories",   path: "/categories", icon: "🏷️" },
    { label: "Collections",  path: "/collections",icon: "📦" },
    { label: "Search",       path: "/search",     icon: "🔍" },
  ]

  const currentLabel =
    currentPath === "/"             ? "Home page"      :
    currentPath === "/products"     ? "All Products"   :
    currentPath === "/categories"   ? "Categories"     :
    currentPath === "/collections"  ? "Collections"    :
    currentPath === "/search"       ? "Search"         :
    currentPath.startsWith("/products/")    ? "Product page"    :
    currentPath.startsWith("/collections/") ? "Collection page" :
    currentPath.startsWith("/categories/")  ? "Category page"   :
    currentPath.startsWith("/pages/")
      ? (pages.find(p => `/pages/${p.slug}` === currentPath)?.title ?? "Custom page")
      : "Home page"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          open
            ? isDark
              ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
              : "border-orange-400 bg-orange-50 text-orange-600"
            : isDark
              ? `border-gray-700 text-gray-300 ${hoverBg}`
              : `border-gray-300 text-gray-700 ${hoverBg}`
        }`}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline max-w-[120px] truncate">{currentLabel}</span>
        <ChevronDownIcon className="w-3 h-3 shrink-0" />
      </button>

      {open && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 w-64 rounded-xl border shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}>

          {/* Built-in pages */}
          <div className="p-1">
            <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
              Store pages
            </p>
            {builtinPages.map(p => (
              <button
                key={p.path}
                onClick={() => { onSelect(p.path); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                  currentPath === p.path
                    ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                    : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                }`}
              >
                {/* <span className="text-sm leading-none">{p.icon}</span> */}
                <span className="flex-1">{p.label}</span>
                {currentPath === p.path && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Custom pages */}
          {pages.length > 0 && (
            <PageSwitcherPagesGroup
              pages={pages}
              currentPath={currentPath}
              onSelect={onSelect}
              setOpen={setOpen}
              isDark={isDark}
              textFaint={textFaint}
              hoverBg={hoverBg}
            />
          )}

          {/* Product page template */}
          {products.length > 0 && (
            <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <div className="p-1">
                <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                  Product page
                </p>
                <button
                  onClick={() => { onSelect(`/products/${products[0].handle}`); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    currentPath.startsWith("/products/") && currentPath !== "/products"
                      ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                      : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                  }`}
                >
                  {/* <span className="text-sm leading-none">👕</span> */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">Product page template</p>
                    <p className={`text-[10px] ${textFaint}`}>Changes apply to all product pages</p>
                  </div>
                  {currentPath.startsWith("/products/") && currentPath !== "/products" && (
                    <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Collection page template */}
          {collections.length > 0 && (
            <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <div className="p-1">
                <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                  Collection page
                </p>
                <button
                  onClick={() => { onSelect(`/collections/${collections[0].handle}`); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    currentPath.startsWith("/collections/") && currentPath !== "/collections"
                      ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                      : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                  }`}
                >
                  {/* <span className="text-sm leading-none">🗂️</span> */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">Collection page template</p>
                    <p className={`text-[10px] ${textFaint}`}>Changes apply to all collection pages</p>
                  </div>
                  {currentPath.startsWith("/collections/") && currentPath !== "/collections" && (
                    <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Category page template */}
          {categories.length > 0 && (
            <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <div className="p-1">
                <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                  Category page
                </p>
                <button
                  onClick={() => { onSelect(`/categories/${categories[0].handle}`); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    currentPath.startsWith("/categories/") && currentPath !== "/categories"
                      ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                      : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                  }`}
                >
                  {/* <span className="text-sm leading-none">🏷️</span> */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">Category page template</p>
                    <p className={`text-[10px] ${textFaint}`}>Changes apply to all category pages</p>
                  </div>
                  {currentPath.startsWith("/categories/") && currentPath !== "/categories" && (
                    <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
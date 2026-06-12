import { useState, useRef, useEffect } from "react"
import { FileText, ChevronDown as ChevronDownIcon, ChevronRight, ChevronLeft, X, Search, ShoppingBag, Check, Tag, FolderOpen, Package, LayoutTemplate, Globe } from "lucide-react"
import type { StorePage } from "./types"
import { BUILTIN_PAGES } from "./constants"
import { createPortal } from "react-dom"

export let _linkInputProducts: { id: string; title: string; handle: string; thumbnail?: string }[] = []
export const _linkInputProductsRef: { current: { id: string; title: string; handle: string; thumbnail?: string }[] } = { current: [] }

const LINK_INPUT_DROPDOWN_HEIGHT = 280

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed
  if (!trimmed.includes(" ") && trimmed.includes(".")) return `https://${trimmed}`
  return trimmed
}

export function resolveUrlLabel(url: string, pages: StorePage[]): { label: string; icon: string } | null {
  if (!url || url === "#" || !url.trim()) return null

  const builtinMatch = BUILTIN_PAGES.find(p => p.url === url)
  if (builtinMatch) return { label: builtinMatch.label, icon: "🔗" }

  const pageMatch = pages.find(p => `/pages/${p.slug}` === url || `/p/${p.slug}` === url)
  if (pageMatch) return { label: pageMatch.title, icon: "📄" }

  const allProducts = _linkInputProductsRef.current.length > 0 ? _linkInputProductsRef.current : _linkInputProducts
  const product = allProducts.find(p => `/products/${p.handle}` === url)
  if (product) return { label: product.title, icon: "🛍️" }

  if (url.startsWith("http")) {
    try { return { label: new URL(url).hostname, icon: "🌐" } }
    catch { return { label: url.replace(/^https?:\/\//, ""), icon: "🌐" } }
  }

  if (url.startsWith("/")) {
    const clean = url
      .replace(/^\/products\//, "").replace(/^\/pages\//, "")
      .replace(/^\/collections\//, "").replace(/^\/categories\//, "")
      .replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    const icon = url.startsWith("/collections/") ? "📦"
      : url.startsWith("/categories/") ? "🗂️"
      : url.startsWith("/products/") ? "🛍️" : "🔗"
    return { label: clean, icon }
  }

  return null
}

function ProductPickerModal({ products, selectedProduct, onSelect, onClose, isDark }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any
  onSelect: (p: any) => void
  onClose: () => void
  isDark: boolean
}) {
  const [search, setSearch] = useState("")
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textFaint   = isDark ? "text-gray-500" : "text-gray-400"
  const hoverBg     = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
  const borderColor = isDark ? "border-gray-700" : "border-gray-200"
  const bgPanel     = isDark ? "bg-gray-800" : "bg-white"
  const filtered    = search.trim() ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase())) : products

  return createPortal(
    <div data-link-portal className="fixed flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ inset: 0, zIndex: 999999 }} onClick={onClose}>
      <div data-link-portal className={`w-[420px] max-w-[90vw] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${bgPanel} ${isDark ? "border-gray-700" : "border-gray-200"}`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary}`}>Select a product</h3>
          <button onClick={onClose} className={`p-1 rounded-lg ${hoverBg} ${textFaint}`}><X className="w-4 h-4" /></button>
        </div>
        <div className={`px-4 py-3 border-b ${borderColor}`}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${borderColor} ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
            <Search className={`w-3.5 h-3.5 shrink-0 ${textFaint}`} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className={`flex-1 text-sm bg-transparent focus:outline-none ${textPrimary} placeholder-gray-400`} />
            {search && <button onClick={() => setSearch("")} className={`${textFaint} hover:text-red-400`}><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>
        <div className="overflow-y-auto max-h-64">
          {filtered.length === 0
            ? <p className={`px-4 py-6 text-sm text-center italic ${textFaint}`}>No products found</p>
            : filtered.map(p => (
              <button key={p.id} onClick={() => onSelect(p)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${borderColor} last:border-0 ${selectedProduct?.id === p.id ? isDark ? "bg-orange-500/15" : "bg-orange-50" : hoverBg}`}>
                {selectedProduct?.id === p.id && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.title} className="object-cover w-10 h-10 rounded-xl shrink-0" />
                  : <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}><ShoppingBag className={`w-5 h-5 ${textFaint}`} /></div>}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>{p.title}</p>
                  <p className={`text-[11px] ${textFaint} truncate`}>/{p.handle}</p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ProductPagesGroup({ value, onChange, setOpen, isDark, searchQuery, onDrillIn }: {
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  searchQuery?: string
  onDrillIn?: () => void
}) {
  const faint     = isDark ? "text-gray-500" : "text-gray-400"
  const hoverBg   = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const products  = _linkInputProductsRef.current.length > 0 ? _linkInputProductsRef.current : _linkInputProducts
  const filteredProducts = searchQuery ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())) : []

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {searchQuery ? (
        filteredProducts.length > 0 ? (
          <div>
            <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${faint}`}>Product pages</p>
            <div className="pb-1">
              {filteredProducts.slice(0, 6).map(p => {
                const url = `/products/${p.handle}`
                return (
                  <button key={p.id} onClick={() => { onChange(url); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors text-left ${value === url ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`}`}>
                    {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="object-cover w-5 h-5 rounded shrink-0" />}
                    <span className="flex-1 truncate">{p.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null
      ) : (
        <button onClick={onDrillIn}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}>
          <div className="flex items-center gap-1.5">
            <Package className="w-3 h-3 opacity-50" />
            <span>Product pages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${faint}`}>{products.length}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      )}
    </div>
  )
}

function CollectionsGroup({ value, onChange, setOpen, isDark, searchQuery, collections, onDrillIn }: {
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  searchQuery?: string
  collections: { id: string; title: string; handle: string }[]
  onDrillIn?: () => void
}) {
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg   = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const faint     = isDark ? "text-gray-500" : "text-gray-400"
  const filtered  = searchQuery ? collections.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())) : collections

  if (searchQuery && filtered.length === 0) return null

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {searchQuery ? (
        <div>
          <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${faint}`}>Collections</p>
          {filtered.slice(0, 6).map(c => {
            const url = `/collections/${c.handle}`
            return (
              <button key={c.id} onClick={() => { onChange(url); setOpen(false) }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors text-left ${value === url ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`}`}>
                <span className="truncate">{c.title}</span>
                <span className={`font-mono text-[10px] ml-2 shrink-0 ${faint}`}>/collections/{c.handle}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <button onClick={onDrillIn}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}>
          <div className="flex items-center gap-1.5">
            <FolderOpen className="w-3 h-3 opacity-50" />
            <span>Collections</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${faint}`}>{collections.length}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      )}
    </div>
  )
}

function CategoriesGroup({ value, onChange, setOpen, isDark, searchQuery, categories, onDrillIn }: {
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  searchQuery?: string
  categories: { id: string; name: string; handle: string }[]
  onDrillIn?: () => void
}) {
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg   = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const faint     = isDark ? "text-gray-500" : "text-gray-400"
  const filtered  = searchQuery ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : categories

  if (searchQuery && filtered.length === 0) return null

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {searchQuery ? (
        <div>
          <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${faint}`}>Categories</p>
          {filtered.slice(0, 6).map(c => {
            const url = `/categories/${c.handle}`
            return (
              <button key={c.id} onClick={() => { onChange(url); setOpen(false) }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors text-left ${value === url ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`}`}>
                <span className="truncate">{c.name}</span>
                <span className={`font-mono text-[10px] ml-2 shrink-0 ${faint}`}>/categories/{c.handle}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <button onClick={onDrillIn}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 opacity-50" />
            <span>Categories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${faint}`}>{categories.length}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      )}
    </div>
  )
}

export function CustomPagesGroup({ pages, value, onChange, setOpen, isDark, onLabelSuggest, isSearching, onDrillIn }: {
  pages: StorePage[]
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  onLabelSuggest?: (label: string) => void
  isSearching?: boolean
  onDrillIn?: () => void
}) {
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg   = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const faint     = isDark ? "text-gray-500" : "text-gray-400"

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {isSearching ? (
        pages.map(p => (
          <button key={p.id}
            onClick={() => { onChange(`/pages/${p.slug}`); onLabelSuggest?.(p.title); setTimeout(() => setOpen(false), 0) }}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
              value === `/pages/${p.slug}` ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`
            }`}>
            <span className="pl-1 truncate">{p.title}</span>
            <span className={`font-mono text-[10px] ml-2 shrink-0 ${faint}`}>/pages/{p.slug}</span>
          </button>
        ))
      ) : (
        <button onClick={onDrillIn}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}>
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="w-3 h-3 opacity-50" />
            <span>Custom pages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${faint}`}>{pages.length}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      )}
    </div>
  )
}

export function LinkInput({ value, onChange, placeholder, isDark, pages = [], onLabelSuggest, collections = [], categories = [] }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  isDark: boolean
  pages?: StorePage[]
  onLabelSuggest?: (label: string) => void
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string }[]
}) {
  const [open, setOpen]               = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [displayValue, setDisplayValue] = useState(value)
  const [drillView, setDrillView]     = useState<"collections" | "categories" | "pages" | "products" | null>(null)
  const [atRoot, setAtRoot]           = useState(true)
  const ref    = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 })

  useEffect(() => { setDisplayValue(value) }, [value])

  const computePos = () => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    let panelLeft = 0
    let panelWidth = 260
    let el: HTMLElement | null = btnRef.current.parentElement
    while (el) {
      if (el.classList.contains("left-panel") || el.dataset.panel === "left") {
        const pr = el.getBoundingClientRect()
        panelLeft = pr.left
        panelWidth = pr.width
        break
      }
      el = el.parentElement
    }
    const safeLeft = panelLeft || Math.max(0, rect.right - panelWidth)
    setDropdownPos({ bottom: window.innerHeight - rect.top + 4, left: safeLeft })
  }

  useEffect(() => {
    if (!open) return
    computePos()
    const scrollEls = document.querySelectorAll(".custom-scrollbar, .overflow-y-auto")
    scrollEls.forEach(el => el.addEventListener("scroll", computePos, { passive: true }))
    window.addEventListener("resize", computePos, { passive: true })
    return () => {
      scrollEls.forEach(el => el.removeEventListener("scroll", computePos))
      window.removeEventListener("resize", computePos)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsidePortal = document.querySelector('[data-link-portal]')?.contains(target)
      if (isInsidePortal) return
      if (ref.current && !ref.current.contains(target)) {
        setOpen(false)
        setAtRoot(true)
        setDrillView(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleOpen = () => {
    computePos()
    setSearchQuery(displayValue)
    setAtRoot(true)
    setDrillView(null)
    setOpen(o => !o)
  }

  const looksLikeUrl = (v: string) =>
    v.startsWith("http") || v.startsWith("/") || (!v.includes(" ") && v.includes("."))

  const allProducts = _linkInputProductsRef.current.length > 0 ? _linkInputProductsRef.current : _linkInputProducts

  const drillTitle =
    drillView === "collections" ? "Collections" :
    drillView === "categories"  ? "Categories"  :
    drillView === "pages"       ? "Custom Pages" : "Product Pages"

  const drillItems = drillView === "collections"
    ? collections.map(c => ({ key: c.id, label: c.title, url: `/collections/${c.handle}`, thumb: undefined as string | undefined }))
    : drillView === "categories"
    ? categories.map(c => ({ key: c.id, label: c.name, url: `/categories/${c.handle}`, thumb: undefined as string | undefined }))
    : drillView === "pages"
    ? pages.map(p => ({ key: p.id, label: p.title, url: `/pages/${p.slug}`, thumb: undefined as string | undefined }))
    : allProducts.map(p => ({ key: p.id, label: p.title, url: `/products/${p.handle}`, thumb: p.thumbnail }))

  return (
    <div ref={ref} className="relative flex gap-1">
      {(() => {
        const resolved = resolveUrlLabel(displayValue, pages)
        const hasValue = displayValue && displayValue.trim() && displayValue !== "#"
        if (hasValue && !open) {
          return (
            <div ref={btnRef as any} onClick={() => { setSearchQuery(""); handleOpen() }}
              className={`flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-300 hover:border-gray-400"
              }`}>
              <span className="shrink-0 opacity-60">
                {displayValue.startsWith("/collections/") ? <FolderOpen className="w-3.5 h-3.5" /> :
                 displayValue.startsWith("/categories/")  ? <Tag className="w-3.5 h-3.5" /> :
                 displayValue.startsWith("/products/")    ? <Package className="w-3.5 h-3.5" /> :
                 displayValue.startsWith("/pages/")       ? <LayoutTemplate className="w-3.5 h-3.5" /> :
                 displayValue.startsWith("http")          ? <Globe className="w-3.5 h-3.5" /> :
                                                            <FileText className="w-3.5 h-3.5" />}
              </span>
              <span className={`text-sm truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {resolved?.label ?? displayValue}
              </span>
            </div>
          )
        }
        return (
          <input
            value={searchQuery || displayValue}
            onChange={e => {
              const v = e.target.value
              setSearchQuery(v)
              setDisplayValue(v)
              const normalized = normalizeUrl(v)
              if (normalized !== v) {
                setDisplayValue(normalized)
                onChange(normalized)
              } else if (v.startsWith("http") || v.startsWith("/") || v === "") {
                onChange(v)
              }
              if (!open) { computePos(); setOpen(true) }
            }}
            onFocus={() => { setSearchQuery(value); computePos(); setOpen(true) }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const isUrl = searchQuery.startsWith("http") || searchQuery.startsWith("/") || (!searchQuery.includes(" ") && searchQuery.includes("."))
                if (isUrl) {
                  const normalized = normalizeUrl(searchQuery.trim())
                  onChange(normalized)
                  setDisplayValue(normalized)
                  setOpen(false)
                  setSearchQuery("")
                }
              }
              if (e.key === "Escape") { setOpen(false); setSearchQuery("") }
            }}
            placeholder={placeholder ?? "Search or paste link"}
            className={`flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
              isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
            }`}
          />
        )
      })()}

      {value && !open ? (
        <button type="button" onClick={e => { e.stopPropagation(); onChange(""); setDisplayValue("") }} title="Clear"
          className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
            isDark ? "border-gray-700 text-gray-500 hover:border-red-800 hover:text-red-400" : "border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500"
          }`}>
          <X className="w-3 h-3" />
        </button>
      ) : (
        <button ref={btnRef} type="button" onClick={e => { e.stopPropagation(); handleOpen() }} title="Select a page"
          className={`shrink-0 flex items-center gap-0.5 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
            open
              ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
              : isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200" : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}>
          <FileText className="w-3 h-3" />
          <ChevronDownIcon className="w-2.5 h-2.5" />
        </button>
      )}

      {open && (
        <div
          className={`fixed z-[9999] rounded-xl border shadow-xl overflow-hidden ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
          style={{ bottom: dropdownPos.bottom, left: dropdownPos.left + 8, width: 244 }}
        >
          <div
           className="flex w-[200%] transition-transform duration-300 ease-out items-start overflow-hidden"
           style={{ transform: atRoot ? "translateX(0)" : "translateX(-50%)" }}
          >
            {/* ── ROOT PANEL ── */}
            <div className="w-1/2 overflow-y-auto shrink-0" style={{ maxHeight: LINK_INPUT_DROPDOWN_HEIGHT }}>
              <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-b ${
                isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"
              }`}>
                {searchQuery ? `Results for "${searchQuery}"` : "Select page"}
              </p>

              <div className={`px-1.5 py-1 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                {!searchQuery && (
                  <p className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Store pages
                  </p>
                )}
                {BUILTIN_PAGES
                  .filter(p => !searchQuery || p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.url.includes(searchQuery.toLowerCase()))
                  .map(p => (
                    <button key={p.url}
                      onClick={() => { onChange(p.url); setDisplayValue(p.url); onLabelSuggest?.(p.label); setOpen(false); setSearchQuery("") }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        value === p.url ? "bg-orange-500/10 text-orange-400" : isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                      }`}>
                      <span>{p.label}</span>
                    </button>
                  ))}
              </div>

              {/* ── URL suggestion row ── */}
              {searchQuery && looksLikeUrl(searchQuery) && (() => {
                const normalized = normalizeUrl(searchQuery)
                return (
                  <div className={`px-1.5 py-1 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                    <p className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Use this URL
                    </p>
                    <button
                      onClick={() => { onChange(normalized); setDisplayValue(normalized); setOpen(false); setSearchQuery("") }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                      }`}>
                      <Globe className="w-3 h-3 opacity-50 shrink-0" />
                      <span className="flex-1 font-mono truncate">{normalized}</span>
                      <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
                    </button>
                  </div>
                )
              })()}

              {searchQuery && (() => {
                const builtinMatches  = BUILTIN_PAGES.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.url.includes(searchQuery.toLowerCase()))
                const pageMatches     = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.includes(searchQuery.toLowerCase()))
                const productMatches  = _linkInputProductsRef.current.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                const totalMatches    = builtinMatches.length + pageMatches.length + productMatches.length
                if (totalMatches === 0 && !looksLikeUrl(searchQuery)) {
                  return (
                    <div className="px-3 py-4 text-center">
                      <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>No pages found for "{searchQuery}"</p>
                      <p className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Try a different search or paste a URL directly</p>
                    </div>
                  )
                }
                return null
              })()}

              {pages.length > 0 && (
                <CustomPagesGroup
                  pages={pages.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.includes(searchQuery.toLowerCase()))}
                  value={value}
                  onChange={v => { onChange(v); setDisplayValue(v); setOpen(false); setSearchQuery("") }}
                  setOpen={setOpen}
                  isDark={isDark}
                  onLabelSuggest={onLabelSuggest}
                  isSearching={!!searchQuery}
                  onDrillIn={() => { setDrillView("pages"); setAtRoot(false) }}
                />
              )}

              <CollectionsGroup
                value={displayValue}
                onChange={v => { onChange(v); setDisplayValue(v); setOpen(false); setSearchQuery("") }}
                setOpen={setOpen}
                isDark={isDark}
                searchQuery={searchQuery}
                collections={collections}
                onDrillIn={() => { setDrillView("collections"); setAtRoot(false) }}
              />

              <CategoriesGroup
                value={displayValue}
                onChange={v => { onChange(v); setDisplayValue(v); setOpen(false); setSearchQuery("") }}
                setOpen={setOpen}
                isDark={isDark}
                searchQuery={searchQuery}
                categories={categories}
                onDrillIn={() => { setDrillView("categories"); setAtRoot(false) }}
              />

              <ProductPagesGroup
                value={displayValue}
                onChange={v => { onChange(v); setDisplayValue(v); setOpen(false); setSearchQuery("") }}
                setOpen={setOpen}
                isDark={isDark}
                searchQuery={searchQuery}
                onDrillIn={() => { setDrillView("products"); setAtRoot(false) }}
              />
            </div>

            {/* ── DRILL PANEL ── */}
            <div className="flex flex-col w-1/2 shrink-0 overflow-y-auto" style={{ maxHeight: LINK_INPUT_DROPDOWN_HEIGHT }}>
              <div className={`flex items-center gap-1.5 px-2 py-2 border-b shrink-0 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <button onClick={() => { setAtRoot(true); setDrillView(null) }}
                  className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`text-xs font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{drillTitle}</span>
              </div>

              <div className="px-1.5 py-1">
                {drillItems.length === 0
                  ? <p className={`text-center text-xs py-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Nothing here yet</p>
                  : drillItems.map(item => (
                    <button key={item.key}
                      onClick={() => { onChange(item.url); setDisplayValue(item.url); if (drillView === "pages") onLabelSuggest?.(item.label); setOpen(false); setAtRoot(true); setDrillView(null); setSearchQuery("") }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        value === item.url ? "bg-orange-500/10 text-orange-400" : isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                      }`}>
                      {drillView === "products"
                        ? item.thumb
                          ? <img src={item.thumb} className="object-cover w-5 h-5 rounded shrink-0" />
                          : <Package className="w-3 h-3 opacity-50 shrink-0" />
                        : drillView === "collections"
                        ? <FolderOpen className="w-3 h-3 opacity-50 shrink-0" />
                        : drillView === "categories"
                        ? <Tag className="w-3 h-3 opacity-50 shrink-0" />
                        : <LayoutTemplate className="w-3 h-3 opacity-50 shrink-0" />
                      }
                      <span className="flex-1 truncate">{item.label}</span>
                      {value === item.url && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useRef, useEffect } from "react"
import { FileText, ChevronDown as ChevronDownIcon, ChevronRight, X, Search, ShoppingBag, Check } from "lucide-react"
import type { StorePage } from "./types"
import { BUILTIN_PAGES } from "./constants"
import { createPortal } from "react-dom"

// ─── Shared product refs (module-level, updated by editor) ───────────────────

export let _linkInputProducts: { id: string; title: string; handle: string; thumbnail?: string }[] = []
export const _linkInputProductsRef: { current: { id: string; title: string; handle: string; thumbnail?: string }[] } = { current: [] }

const LINK_INPUT_DROPDOWN_HEIGHT = 280

// ─── resolveUrlLabel ──────────────────────────────────────────────────────────

export function resolveUrlLabel(url: string, pages: StorePage[]): { label: string; icon: string } | null {
  if (!url || url === "#" || !url.trim()) return null

  const builtinMatch = BUILTIN_PAGES.find(p => p.url === url)
  if (builtinMatch) return { label: builtinMatch.label, icon: "🔗" }

  const pageMatch = pages.find(p =>
    `/pages/${p.slug}` === url || `/p/${p.slug}` === url
  )
  if (pageMatch) return { label: pageMatch.title, icon: "📄" }

  const allProducts = _linkInputProductsRef.current.length > 0
    ? _linkInputProductsRef.current
    : _linkInputProducts
  const product = allProducts.find(p => `/products/${p.handle}` === url)
  if (product) return { label: product.title, icon: "🛍️" }

  if (url.startsWith("http")) {
    try {
      return { label: new URL(url).hostname, icon: "🌐" }
    } catch {
      return { label: url.replace(/^https?:\/\//, ""), icon: "🌐" }
    }
  }

  if (url.startsWith("/")) {
    const clean = url
      .replace(/^\/products\//, "")
      .replace(/^\/pages\//, "")
      .replace(/^\/collections\//, "")
      .replace(/^\/categories\//, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
    return { label: clean, icon: "🔗" }
  }

  return null
}

// ─── ProductPickerModal (inline for link input) ───────────────────────────────

function ProductPickerModal({ products, selectedProduct, onSelect, onClose, isDark }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any
  onSelect: (p: any) => void
  onClose: () => void
  isDark: boolean
}) {
  const [search, setSearch] = useState("")
  const textPrimary  = isDark ? "text-white"     : "text-gray-900"
  const textFaint    = isDark ? "text-gray-500"   : "text-gray-400"
  const hoverBg      = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
  const borderColor  = isDark ? "border-gray-700" : "border-gray-200"
  const bgPanel      = isDark ? "bg-gray-800"     : "bg-white"
  const filtered = search.trim()
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  return createPortal( 
    <div
      className="fixed flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ inset: 0, zIndex: 999999 }}
      onClick={onClose}
    >
      <div
        className={`w-[420px] max-w-[90vw] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${bgPanel} ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary}`}>Select a product</h3>
          <button onClick={onClose} className={`p-1 rounded-lg ${hoverBg} ${textFaint}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={`px-4 py-3 border-b ${borderColor}`}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${borderColor} ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
            <Search className={`w-3.5 h-3.5 shrink-0 ${textFaint}`} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`flex-1 text-sm bg-transparent focus:outline-none ${textPrimary} placeholder-gray-400`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={`${textFaint} hover:text-red-400`}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto max-h-64">
          {filtered.length === 0
            ? <p className={`px-4 py-6 text-sm text-center italic ${textFaint}`}>No products found</p>
            : filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${borderColor} last:border-0 ${
                  selectedProduct?.id === p.id
                    ? isDark ? "bg-orange-500/15" : "bg-orange-50"
                    : hoverBg
                }`}
              >
                {selectedProduct?.id === p.id && (
                  <Check className="w-4 h-4 text-orange-400 shrink-0" />
                )}
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.title} className="object-cover w-10 h-10 rounded-xl shrink-0" />
                  : <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                      <ShoppingBag className={`w-5 h-5 ${textFaint}`} />
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>{p.title}</p>
                  <p className={`text-[11px] ${textFaint} truncate`}>/{p.handle}</p>
                </div>
              </button>
            ))
          }
        </div>
      </div>
    </div>,
  document.body
  )
}

// ─── ProductPagesGroup ────────────────────────────────────────────────────────

export function ProductPagesGroup({ value, onChange, setOpen, isDark, searchQuery }: {
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  searchQuery?: string
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const faint    = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg  = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const products = _linkInputProductsRef.current.length > 0
    ? _linkInputProductsRef.current
    : _linkInputProducts
  const selectedProduct = products.find(p => value === `/products/${p.handle}`) ?? null
  const filteredProducts = searchQuery
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {searchQuery ? (
        filteredProducts.length > 0 ? (
          <div>
            <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${faint}`}>
              Product pages
            </p>
            <div className="pb-1">
              {filteredProducts.slice(0, 6).map(p => {
                const url = `/products/${p.handle}`
                return (
                  <button
                    key={p.id}
                    onClick={() => { onChange(url); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors text-left ${
                      value === url ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`
                    }`}
                  >
                    {p.thumbnail && (
                      <img src={p.thumbnail} alt={p.title} className="object-cover w-5 h-5 rounded shrink-0" />
                    )}
                    <span className="flex-1 truncate">{p.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null
      ) : (
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}
        >
          <span>
            Product pages
            {selectedProduct && (
              <span className="ml-1.5 normal-case font-normal">— {selectedProduct.title}</span>
            )}
          </span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
      {modalOpen && !searchQuery && (
        <ProductPickerModal
          products={products}
          selectedProduct={selectedProduct}
          onSelect={p => { onChange(`/products/${p.handle}`); setOpen(false); setModalOpen(false) }}
          onClose={() => setModalOpen(false)}
          isDark={isDark}
        />
      )}
    </div>
  )
}

// ─── CustomPagesGroup ─────────────────────────────────────────────────────────

export function CustomPagesGroup({ pages, value, onChange, setOpen, isDark, onLabelSuggest, isSearching }: {
  pages: StorePage[]
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  onLabelSuggest?: (label: string) => void
  isSearching?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg   = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const faint     = isDark ? "text-gray-600" : "text-gray-400"

  useEffect(() => {
    if (isSearching) setExpanded(true)
    else setExpanded(false)
  }, [isSearching])

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}
      >
        <span>Custom pages</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && pages.map(p => (
        <button
          key={p.id}
          onClick={() => {
            onChange(`/pages/${p.slug}`)
            onLabelSuggest?.(p.title)
            setTimeout(() => setOpen(false), 0)
          }}
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
            value === `/pages/${p.slug}`
              ? "bg-orange-500/10 text-orange-400"
              : `${textColor} ${hoverBg}`
          }`}
        >
          <span className="pl-1 truncate">{p.title}</span>
          <span className={`font-mono text-[10px] ml-2 shrink-0 ${faint}`}>/pages/{p.slug}</span>
        </button>
      ))}
    </div>
  )
}

// ─── LinkInput ────────────────────────────────────────────────────────────────

export function LinkInput({ value, onChange, placeholder, isDark, pages = [], onLabelSuggest }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  isDark: boolean
  pages?: StorePage[]
  onLabelSuggest?: (label: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [displayValue, setDisplayValue] = useState(value)
  const ref    = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  useEffect(() => { setDisplayValue(value) }, [value])

  // ── compute position: always anchored to left edge of the sidebar panel ──
  const computePos = () => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    // Find the left panel container — walk up until we find it
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
    // Fallback: just use rect.left clamped so dropdown stays within ~260px panel
    const safeLeft = panelLeft || Math.max(0, rect.right - panelWidth)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const flipUp = spaceBelow < LINK_INPUT_DROPDOWN_HEIGHT && spaceAbove > spaceBelow
    setDropdownPos({
      top: flipUp ? rect.top - LINK_INPUT_DROPDOWN_HEIGHT - 4 : rect.bottom + 4,
      left: safeLeft,
    })
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleOpen = () => {
    computePos()
    setSearchQuery(displayValue)
    setOpen(o => !o)
  }

  return (
    <div ref={ref} className="relative flex gap-1">
      {(() => {
        const resolved = resolveUrlLabel(displayValue, pages)
        const hasValue = displayValue && displayValue.trim() && displayValue !== "#"
        if (hasValue && !open) {
          return (
            <div
              ref={btnRef as any}
              onClick={() => { setSearchQuery(""); handleOpen() }}
              className={`flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="text-sm shrink-0">{resolved?.icon ?? "🔗"}</span>
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
              if (v.startsWith("http") || v.startsWith("/") || v === "") onChange(v)
              if (!open) {
                computePos()
                setOpen(true)
              }
            }}
            onFocus={() => {
              setSearchQuery(value)
              computePos()
              setOpen(true)
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const isUrl = searchQuery.startsWith("http") || searchQuery.startsWith("/")
                if (isUrl) { onChange(searchQuery.trim()); setOpen(false); setSearchQuery("") }
              }
              if (e.key === "Escape") { setOpen(false); setSearchQuery("") }
            }}
            placeholder={placeholder ?? "Search or paste link"}
            className={`flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
              isDark
                ? "bg-gray-800 border border-gray-700 text-gray-200"
                : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
            }`}
          />
        )
      })()}

      {value && !open ? (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onChange(""); setDisplayValue("") }}
          title="Clear"
          className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
            isDark
              ? "border-gray-700 text-gray-500 hover:border-red-800 hover:text-red-400"
              : "border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500"
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      ) : (
        <button
          ref={btnRef}
          type="button"
          onClick={e => { e.stopPropagation(); handleOpen() }}
          title="Select a page"
          className={`shrink-0 flex items-center gap-0.5 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
            open
              ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
              : isDark
                ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          <FileText className="w-3 h-3" />
          <ChevronDownIcon className="w-2.5 h-2.5" />
        </button>
      )}

      {open && (
        <div
          className={`fixed z-[9999] rounded-xl border shadow-xl overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        style={{
          top: dropdownPos.top,
          left: dropdownPos.left + 8,
          width: 244,
          maxHeight: LINK_INPUT_DROPDOWN_HEIGHT,
          overflowY: "auto",
        }}
        >
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
              .filter(p =>
                !searchQuery ||
                p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.url.includes(searchQuery.toLowerCase())
              )
              .map(p => (
                <button
                  key={p.url}
                  onClick={() => {
                    onChange(p.url)
                    setDisplayValue(p.url)
                    onLabelSuggest?.(p.label)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    value === p.url
                      ? "bg-orange-500/10 text-orange-400"
                      : isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{p.label}</span>
                  <span className={`font-mono text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>{p.url}</span>
                </button>
              ))
            }
          </div>

          {searchQuery && (() => {
            const builtinMatches = BUILTIN_PAGES.filter(p =>
              p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.url.includes(searchQuery.toLowerCase())
            )
            const pageMatches = pages.filter(p =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.slug.includes(searchQuery.toLowerCase())
            )
            const productMatches = _linkInputProductsRef.current.filter(p =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            const totalMatches = builtinMatches.length + pageMatches.length + productMatches.length
            if (totalMatches === 0) {
              return (
                <div className="px-3 py-4 text-center">
                  <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No pages found for "{searchQuery}"
                  </p>
                  <p className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    Try a different search or paste a URL directly
                  </p>
                </div>
              )
            }
            return null
          })()}

          {pages.length > 0 && (
            <CustomPagesGroup
              pages={pages.filter(p =>
                !searchQuery ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.slug.includes(searchQuery.toLowerCase())
              )}
              value={value}
              onChange={v => {
                onChange(v)
                setDisplayValue(v)
                setOpen(false)
                setSearchQuery("")
              }}
              setOpen={setOpen}
              isDark={isDark}
              onLabelSuggest={onLabelSuggest}
              isSearching={!!searchQuery}
            />
          )}

          <ProductPagesGroup
            value={displayValue}
            onChange={v => {
              onChange(v)
              setDisplayValue(v)
              setOpen(false)
              setSearchQuery("")
            }}
            setOpen={setOpen}
            isDark={isDark}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  )
}
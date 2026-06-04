import { useState } from "react"
import { createPortal } from "react-dom"
import { X, Search, ShoppingBag } from "lucide-react"

// ─── ProductPickerModal ───────────────────────────────────────────────────────

export function ProductPickerModal({ products, selectedProduct, onSelect, onClose, isDark }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any
  onSelect: (p: any) => void
  onClose: () => void
  isDark: boolean
}) {
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState(selectedProduct?.id ?? null)

  const textPrimary = isDark ? "text-white"          : "text-gray-900"
  const textFaint   = isDark ? "text-gray-500"        : "text-gray-400"
  const hoverBg     = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
  const borderColor = isDark ? "border-gray-700"      : "border-gray-200"
  const bgPanel     = isDark ? "bg-gray-800"          : "bg-white"

  const filtered = search.trim()
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  // ── Portal: renders outside any overflow-hidden ancestor ──────────────────
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-[420px] max-w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${bgPanel} ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary}`}>
            Select a product to feature
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${hoverBg} ${textFaint}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
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
              <button
                onClick={() => setSearch("")}
                className={`${textFaint} hover:text-red-400`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Product list */}
        <div className="overflow-y-auto max-h-64">
          {filtered.length === 0 ? (
            <p className={`px-4 py-6 text-sm text-center italic ${textFaint}`}>
              No products found
            </p>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setPendingId(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${borderColor} last:border-0 ${
                  pendingId === p.id
                    ? isDark ? "bg-orange-500/15" : "bg-orange-50"
                    : hoverBg
                }`}
              >
                {/* Radio */}
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  pendingId === p.id
                    ? "border-orange-500 bg-orange-500"
                    : isDark ? "border-gray-600" : "border-gray-300"
                }`}>
                  {pendingId === p.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* Thumbnail */}
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="object-cover w-10 h-10 rounded-xl shrink-0"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <ShoppingBag className={`w-5 h-5 ${textFaint}`} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>{p.title}</p>
                  <p className={`text-[11px] ${textFaint} truncate`}>/{p.handle}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className={`flex items-center justify-end gap-2.5 px-4 py-3 border-t ${borderColor}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              isDark
                ? `border-gray-700 ${textFaint} hover:border-gray-500`
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            Cancel
          </button>
          <button
            disabled={!pendingId}
            onClick={() => {
              const p = products.find(x => x.id === pendingId)
              if (p) { onSelect(p); onClose() }
            }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #e65100 0%, #ac1900 100%)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body   // ← renders directly into <body>, escaping all overflow-hidden ancestors
  )
}

// ─── ProductPickerButton ──────────────────────────────────────────────────────

export function ProductPickerButton({ products, selectedProduct, onSelect, onClear, isDark, textFaint }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any
  onSelect: (p: any) => void
  onClear: () => void
  isDark: boolean
  textFaint: string
}) {
  const [open, setOpen] = useState(false)
  const textPrimary = isDark ? "text-white"      : "text-gray-900"
  const borderColor = isDark ? "border-gray-700" : "border-gray-200"

  return (
    <>
      {selectedProduct ? (
        <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border ${borderColor} ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
          {/* Thumbnail */}
          {selectedProduct.thumbnail && (
            <img
              src={selectedProduct.thumbnail}
              alt={selectedProduct.title}
              className="object-cover rounded-lg w-9 h-9 shrink-0"
            />
          )}

          {/* Title */}
          <div className="flex-1 min-w-0" title={selectedProduct.title}>
            <p className={`text-xs font-semibold truncate ${textPrimary}`}>
              {selectedProduct.title}
            </p>
          </div>

          {/* Change */}
          <button
            onClick={() => setOpen(true)}
            className="text-[10px] px-2 py-1 rounded-lg border border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors shrink-0"
          >
            Change
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className={`p-1 ${textFaint} hover:text-red-400 transition-colors shrink-0`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed text-xs font-medium transition-all ${
            isDark
              ? "border-gray-600 text-gray-400 hover:border-orange-500/50 hover:text-orange-400"
              : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Select a product
        </button>
      )}

      {open && (
        <ProductPickerModal
          products={products}
          selectedProduct={selectedProduct}
          onSelect={p => { onSelect(p); setOpen(false) }}
          onClose={() => setOpen(false)}
          isDark={isDark}
        />
      )}
    </>
  )
}
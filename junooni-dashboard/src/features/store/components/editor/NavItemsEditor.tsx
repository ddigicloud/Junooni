import { useState } from "react"
import {
  GripVertical, Plus, Trash2, ChevronUp, ChevronDown,
  ChevronRight, ChevronDown as ChevronDownIcon, Check
} from "lucide-react"
import type { NavItem, StorePage } from "./types"
import { genId } from "./helpers"
import { LinkInput } from "./LinkInput"

export function NavItemsEditor({
  label, items, onChange, isDark, pages, textFaint, textPrimary,
  collections = [], categories = [], products = [],
}: {
  label: string
  items: NavItem[]
  onChange: (items: NavItem[]) => void
  isDark: boolean
  pages: StorePage[]
  textFaint: string
  textPrimary: string
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  products?: { id: string; title: string; handle: string; thumbnail?: string }[]
}) {
  const [expandedId,           setExpandedId]           = useState<string | null>(null)
  const [expandedChildId,      setExpandedChildId]      = useState<string | null>(null)
  const [expandedGrandChildId, setExpandedGrandChildId] = useState<string | null>(null)
  const hoverBg          = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const vendorCollections = collections ?? []
  const vendorCategories  = categories ?? []
  const vendorProducts    = products ?? []

  // ── Item helpers ────────────────────────────────────────────────────────────
  const addItem = () => {
    const newId = genId()
    onChange([...items, { id: newId, label: "New Link", url: "" }])
    setExpandedId(newId)
  }

  const updateItem = (id: string, patch: Partial<NavItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  const removeItem = (id: string) => {
    onChange(items.filter(it => it.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const moveItem = (id: string, dir: "up" | "down") => {
    const arr  = [...items]
    const i    = arr.findIndex(it => it.id === id)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange(arr)
  }

  // ── Child helpers ───────────────────────────────────────────────────────────
  const addChild = (parentId: string) => {
    updateItem(parentId, {
      children: [
        ...(items.find(it => it.id === parentId)?.children ?? []),
        { id: genId(), label: "Sub Link", url: "/" },
      ]
    })
  }

  const updateChild = (parentId: string, childId: string, patch: Partial<NavItem>) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    updateItem(parentId, {
      children: (parent.children ?? []).map(c => c.id === childId ? { ...c, ...patch } : c)
    })
  }

  const removeChild = (parentId: string, childId: string) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    updateItem(parentId, {
      children: (parent.children ?? []).filter(c => c.id !== childId)
    })
    if (expandedChildId === childId) setExpandedChildId(null)
  }

  const moveChild = (parentId: string, childId: string, dir: "up" | "down") => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    const arr  = [...(parent.children ?? [])]
    const i    = arr.findIndex(c => c.id === childId)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    updateItem(parentId, { children: arr })
  }

  // ── Grandchild helpers ──────────────────────────────────────────────────────
  const addGrandChild = (parentId: string, childId: string) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    const child = (parent.children ?? []).find(c => c.id === childId)
    if (!child) return
    const newId = genId()
    updateChild(parentId, childId, {
      children: [...(child.children ?? []), { id: newId, label: "Sub Link", url: "/" }]
    })
  }

  const updateGrandChild = (parentId: string, childId: string, gcId: string, patch: Partial<NavItem>) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    const child = (parent.children ?? []).find(c => c.id === childId)
    if (!child) return
    updateChild(parentId, childId, {
      children: (child.children ?? []).map(gc => gc.id === gcId ? { ...gc, ...patch } : gc)
    })
  }

  const removeGrandChild = (parentId: string, childId: string, gcId: string) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    const child = (parent.children ?? []).find(c => c.id === childId)
    if (!child) return
    updateChild(parentId, childId, {
      children: (child.children ?? []).filter(gc => gc.id !== gcId)
    })
    if (expandedGrandChildId === gcId) setExpandedGrandChildId(null)
  }

  const isItemInvalid = (it: NavItem) =>
    (!it.url?.trim() || it.url === "#") &&
    (!it.children || it.children.length === 0) &&
    (it.label === "New Link" || it.label === "Untitled" || !it.label)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>{label}</p>
        <span className={`text-[10px] ${textFaint}`}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {items.length === 0 && (
        <p className={`text-[11px] italic py-2 ${textFaint}`}>
          No nav items yet. Add one below.
        </p>
      )}

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isExpanded  = expandedId === item.id
          const children    = item.children ?? []
          const hasChildren = Array.isArray(item.children) && item.children.length > 0
          const invalid     = isItemInvalid(item)
          const isSystemUrl = ["/collections", "/categories", "/products"].includes(item.url ?? "")
          const autoPopulate = item.autoPopulate !== false // default true

          return (
            <div
              key={item.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded
                  ? isDark ? "border-orange-500/40 bg-gray-800/80" : "border-orange-400/40 bg-orange-50/30"
                  : isDark ? "border-gray-700 bg-gray-800/50"       : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* ── Parent header row ── */}
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center flex-1 min-w-0 gap-1 text-left"
                >
                  <ChevronDownIcon className={`w-3.5 h-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : "-rotate-90"} ${textFaint}`} />
                  <span className={`flex-1 text-xs font-medium truncate ${textPrimary}`}>
                    {item.label || "Untitled"}
                    {children.length > 0 && (
                      <span className={`ml-1 text-[9px] ${textFaint}`}>({children.length})</span>
                    )}
                  </span>
                </button>
                {invalid && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" title="URL required" />
                )}
                <button
                  onClick={() => moveItem(item.id, "up")}
                  disabled={i === 0}
                  className={`p-0.5 rounded transition-colors ${i === 0 ? "opacity-30" : hoverBg} ${textFaint}`}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveItem(item.id, "down")}
                  disabled={i === items.length - 1}
                  className={`p-0.5 rounded transition-colors ${i === items.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-0.5 rounded hover:bg-red-900/30"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>

              {/* ── Expanded: parent fields + children ── */}
              {isExpanded && (
                <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="px-3 pt-2 pb-2.5 space-y-2">

                    {/* Label */}
                    <div>
                      <span className={`text-[10px] font-medium block mb-1 ${textFaint}`}>Label</span>
                      <input
                        value={item.label}
                        onChange={e => updateItem(item.id, { label: e.target.value })}
                        placeholder="e.g. Shop"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 border transition-colors ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                            : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                        }`}
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <span className={`text-[10px] font-medium block mb-1 ${textFaint}`}>
                        Link <span className="font-normal opacity-50">(optional if has children)</span>
                      </span>
                      <LinkInput
                        value={item.url}
                        onChange={v => updateItem(item.id, { url: v })}
                        placeholder="Search or paste link"
                        isDark={isDark}
                        pages={pages}
                        collections={vendorCollections}
                        categories={vendorCategories}
                        onLabelSuggest={suggested => {
                          if (!item.label || item.label === "New Link" || item.label === "Sub Link") {
                            updateItem(item.id, { label: suggested })
                          }
                        }}
                      />
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          className="relative shrink-0"
                          onClick={() => updateItem(item.id, { external: !item.external })}
                        >
                          <div className={`w-7 h-3.5 rounded-full transition-colors ${
                            item.external ? "bg-orange-500" : isDark ? "bg-gray-600" : "bg-gray-300"
                          }`} />
                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${
                            item.external ? "translate-x-3.5" : ""
                          }`} />
                        </div>
                        <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { if (!invalid) setExpandedId(null) }}
                          disabled={invalid}
                          title={invalid ? "Enter a URL first" : "Confirm"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            invalid
                              ? "opacity-30 cursor-not-allowed text-gray-400"
                              : isDark ? "text-green-400 hover:bg-green-900/30" : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark
                              ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Auto-populate toggle (only for system routes) ── */}
                  {isSystemUrl && (
                    <div className={`mx-3 mb-2 flex items-center justify-between px-2.5 py-2 rounded-lg border ${
                      isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50"
                    }`}>
                      <div>
                        <p className={`text-[11px] font-medium ${textPrimary}`}>Auto-populate dropdown</p>
                        <p className={`text-[9px] ${textFaint} opacity-70`}>
                          {autoPopulate ? "Showing live data" : "Manual mode — add items below"}
                        </p>
                      </div>
                      <div
                        className="relative cursor-pointer shrink-0"
                        onClick={() => updateItem(item.id, { autoPopulate: !autoPopulate })}
                      >
                        <div className={`w-8 h-4 rounded-full transition-colors ${
                          autoPopulate ? "bg-orange-500" : isDark ? "bg-gray-600" : "bg-gray-300"
                        }`} />
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                          autoPopulate ? "translate-x-4" : ""
                        }`} />
                      </div>
                    </div>
                  )}

                   {/* ── Show products preview toggle (only for system routes with auto-populate on) ── */}
                  {isSystemUrl && autoPopulate && (
                    <div className={`mx-3 mb-2 flex items-center justify-between px-2.5 py-2 rounded-lg border ${
                      isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50"
                    }`}>
                      <div>
                        <p className={`text-[11px] font-medium ${textPrimary}`}>Show products preview</p>
                        <p className={`text-[9px] ${textFaint} opacity-70`}>
                          {item.showProducts !== false ? "Product cards visible in dropdown" : "Only list items shown"}
                        </p>
                      </div>
                      <div
                        className="relative shrink-0 cursor-pointer"
                        onClick={() => updateItem(item.id, { showProducts: item.showProducts === false ? true : false })}
                      >
                        <div className={`w-8 h-4 rounded-full transition-colors ${
                          item.showProducts !== false ? "bg-orange-500" : isDark ? "bg-gray-600" : "bg-gray-300"
                        }`} />
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                          item.showProducts !== false ? "translate-x-4" : ""
                        }`} />
                      </div>
                    </div>
                  )}

                  {/* ── Children / Dropdown items ── */}
                  <div className={`mx-2 mb-2 rounded-lg border ${
                    isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50/80"
                  }`}>
                    <p className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider border-b ${
                      isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-200"
                    }`}>
                      Dropdown items
                    </p>
                    <div className="p-1.5 space-y-1">

                      {/* Auto-populated for system routes */}
                      {autoPopulate && isSystemUrl && !hasChildren &&
                        (() => {
                          const isCollections = item.url === "/collections"
                          const isCategories  = item.url === "/categories"
                            const autoItems = isCollections
                            ? vendorCollections.map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}` }))
                            : isCategories
                            ? vendorCategories.map(c => ({ id: c.id, label: c.name, url: `/categories/${c.handle}` }))
                            : [
                                { id: "all_products", label: "All Products", url: "/products" },
                                ...vendorCollections.map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}` })),
                              ]

                          if (autoItems.length === 0) return (
                            <p className={`text-[9px] px-1 pb-1 ${textFaint} opacity-70`}>
                              Loading items...
                            </p>
                          )

                          return (
                            <>
                              <p className={`text-[9px] px-1 pb-1 ${textFaint} opacity-70`}>
                                Auto-populated · Toggle off above to override
                              </p>
                              {autoItems.slice(0, 6).map(ai => (
                                <div key={ai.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                                  isDark ? "bg-gray-800/60" : "bg-gray-100/80"
                                }`}>
                                  <div className={`w-1 h-1 rounded-full shrink-0 ${isDark ? "bg-gray-600" : "bg-gray-400"}`} />
                                  <span className={`flex-1 text-[11px] truncate ${textFaint}`}>{ai.label}</span>
                                  <span className={`text-[9px] font-mono truncate max-w-[80px] ${textFaint} opacity-60`}>{ai.url}</span>
                                </div>
                              ))}
                              {autoItems.length > 6 && (
                                <p className={`text-[9px] px-1 pt-0.5 ${textFaint} opacity-50`}>
                                  +{autoItems.length - 6} more
                                </p>
                              )}
                            </>
                          )
                        })()
                      }

                      {/* Empty state for manual mode */}
                      {children.length === 0 && (!isSystemUrl || !autoPopulate) && (
                        <p className={`text-[10px] italic px-1 py-1 ${textFaint}`}>
                          No dropdown items yet.
                        </p>
                      )}

                      {/* Child items — shown when manual OR non-system */}
                      {(!autoPopulate || !isSystemUrl) && children.map((child, ci) => {
                        const isChildExpanded = expandedChildId === child.id
                        const grandChildren   = child.children ?? []
                        return (
                          <div
                            key={child.id}
                            className={`rounded-lg border overflow-hidden ${
                              isChildExpanded
                                ? isDark ? "border-orange-500/30 bg-gray-800"    : "border-orange-300/40 bg-orange-50/40"
                                : isDark ? "border-gray-700 bg-gray-800/60"      : "border-gray-200 bg-white"
                            }`}
                          >
                            {/* Child row */}
                            <div className="flex items-center gap-1.5 px-2 py-1.5">
                              <button
                                onClick={() => setExpandedChildId(isChildExpanded ? null : child.id)}
                                className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                              >
                                <ChevronRight className={`w-2.5 h-2.5 shrink-0 transition-transform ${isChildExpanded ? "rotate-90" : ""} ${textFaint}`} />
                                <span className={`text-[11px] font-medium truncate ${textPrimary}`}>
                                  {child.label || "Untitled"}
                                  {grandChildren.length > 0 && (
                                    <span className={`ml-1 text-[9px] ${textFaint}`}>({grandChildren.length})</span>
                                  )}
                                </span>
                              </button>
                              <button
                                onClick={() => moveChild(item.id, child.id, "up")}
                                disabled={ci === 0}
                                className={`p-0.5 rounded ${ci === 0 ? "opacity-30" : hoverBg} ${textFaint}`}
                              >
                                <ChevronUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => moveChild(item.id, child.id, "down")}
                                disabled={ci === children.length - 1}
                                className={`p-0.5 rounded ${ci === children.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}
                              >
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => removeChild(item.id, child.id)}
                                className="p-0.5 rounded hover:bg-red-900/30"
                              >
                                <Trash2 className="w-2.5 h-2.5 text-red-400" />
                              </button>
                            </div>

                            {/* Child expanded fields */}
                            {isChildExpanded && (
                              <div className={`px-2 pb-2 space-y-1.5 border-t ${
                                isDark ? "border-gray-700" : "border-orange-200/40"
                              }`}>
                                <div className="pt-1.5">
                                  <label className={`text-[10px] ${textFaint} block mb-1`}>Label</label>
                                  <input
                                    value={child.label}
                                    onChange={e => updateChild(item.id, child.id, { label: e.target.value })}
                                    placeholder="e.g. Red Wines"
                                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500 border ${
                                      isDark
                                        ? "bg-gray-800 border-gray-700 text-gray-200"
                                        : "bg-white border-gray-300 text-gray-800"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-[10px] ${textFaint} block mb-1`}>Link</label>
                                  <LinkInput
                                    value={child.url}
                                    onChange={v => updateChild(item.id, child.id, { url: v })}
                                    placeholder="/collections/red-wines"
                                    isDark={isDark}
                                    pages={pages}
                                    collections={vendorCollections}
                                    categories={vendorCategories}
                                    onLabelSuggest={suggested => {
                                      if (!child.label || child.label === "Sub Link") {
                                        updateChild(item.id, child.id, { label: suggested })
                                      }
                                    }}
                                  />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <div
                                    className="relative shrink-0"
                                    onClick={() => updateChild(item.id, child.id, { external: !child.external })}
                                  >
                                    <div className={`w-7 h-3.5 rounded-full transition-colors ${
                                      child.external ? "bg-orange-500" : "bg-gray-600"
                                    }`} />
                                    <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${
                                      child.external ? "translate-x-3.5" : ""
                                    }`} />
                                  </div>
                                  <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                                </label>

                                {/* ── Grandchildren ── */}
                                <div className={`rounded-lg border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                  <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider border-b ${
                                    isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-200"
                                  }`}>Sub-items</p>
                                  <div className="p-1 space-y-1">
                                    {grandChildren.length === 0 && (
                                      <p className={`text-[9px] italic px-1 py-0.5 ${textFaint}`}>No sub-items yet.</p>
                                    )}
                                    {grandChildren.map((gc, gci) => {
                                      const isGcExpanded = expandedGrandChildId === gc.id
                                      return (
                                        <div key={gc.id} className={`rounded border overflow-hidden ${
                                          isGcExpanded
                                            ? isDark ? "border-orange-500/20 bg-gray-800" : "border-orange-300/30 bg-orange-50/30"
                                            : isDark ? "border-gray-700 bg-gray-800/40"   : "border-gray-200 bg-white"
                                        }`}>
                                          <div className="flex items-center gap-1 px-1.5 py-1">
                                            <button
                                              onClick={() => setExpandedGrandChildId(isGcExpanded ? null : gc.id)}
                                              className="flex items-center flex-1 min-w-0 gap-1 text-left"
                                            >
                                              <ChevronRight className={`w-2 h-2 shrink-0 transition-transform ${isGcExpanded ? "rotate-90" : ""} ${textFaint}`} />
                                              <span className={`text-[10px] truncate ${textPrimary}`}>{gc.label || "Untitled"}</span>
                                            </button>
                                            <button
                                              onClick={() => removeGrandChild(item.id, child.id, gc.id)}
                                              className="p-0.5 rounded hover:bg-red-900/30"
                                            >
                                              <Trash2 className="w-2 h-2 text-red-400" />
                                            </button>
                                          </div>
                                          {isGcExpanded && (
                                            <div className={`px-2 pb-2 space-y-1.5 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                              <div className="pt-1.5">
                                                <label className={`text-[9px] ${textFaint} block mb-1`}>Label</label>
                                                <input
                                                  value={gc.label}
                                                  onChange={e => updateGrandChild(item.id, child.id, gc.id, { label: e.target.value })}
                                                  placeholder="e.g. Sub item"
                                                  className={`w-full rounded px-2 py-1 text-xs focus:outline-none border ${
                                                    isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"
                                                  }`}
                                                />
                                              </div>
                                              <div>
                                                <label className={`text-[9px] ${textFaint} block mb-1`}>Link</label>
                                                <LinkInput
                                                  value={gc.url}
                                                  onChange={v => updateGrandChild(item.id, child.id, gc.id, { url: v })}
                                                  placeholder="/path"
                                                  isDark={isDark}
                                                  pages={pages}
                                                  collections={vendorCollections}
                                                  categories={vendorCategories}
                                                  onLabelSuggest={suggested => {
                                                    if (!gc.label || gc.label === "Sub Link") {
                                                      updateGrandChild(item.id, child.id, gc.id, { label: suggested })
                                                    }
                                                  }}
                                                />
                                              </div>
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                  className="relative shrink-0"
                                                  onClick={() => updateGrandChild(item.id, child.id, gc.id, { external: !gc.external })}
                                                >
                                                  <div className={`w-7 h-3.5 rounded-full transition-colors ${
                                                    gc.external ? "bg-orange-500" : "bg-gray-600"
                                                  }`} />
                                                  <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${
                                                    gc.external ? "translate-x-3.5" : ""
                                                  }`} />
                                                </div>
                                                <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                                              </label>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                    <button
                                      onClick={() => addGrandChild(item.id, child.id)}
                                      className={`w-full flex items-center justify-center gap-1 py-1 rounded border border-dashed text-[9px] transition-all ${
                                        isDark
                                          ? "border-gray-700 text-gray-500 hover:border-orange-500/40 hover:text-orange-400"
                                          : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                                      }`}
                                    >
                                      <Plus className="w-2 h-2" />Add sub-item
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Add child button — shown in manual mode or non-system routes */}
                      {(!autoPopulate || !isSystemUrl) && (
                        <button
                          onClick={() => addChild(item.id)}
                          className={`w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed text-[10px] transition-all ${
                            isDark
                              ? "border-gray-700 text-gray-500 hover:border-orange-500/40 hover:text-orange-400"
                              : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" />Add dropdown item
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add item or warning */}
      {(() => {
        const hasInvalid = items.some(isItemInvalid)
        return hasInvalid ? (
          <div className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs ${
            isDark
              ? "border-red-800/50 bg-red-900/10 text-red-400"
              : "border-red-200 bg-red-50 text-red-500"
          }`}>
            <span className="w-3 h-3 rounded-full bg-red-400/20 text-red-400 text-[9px] flex items-center justify-center font-bold">!</span>
            Fill in the URL for existing items first
          </div>
        ) : (
          <button
            onClick={addItem}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${
              isDark
                ? "border-gray-700 border-dashed text-gray-400 hover:border-gray-500 hover:text-gray-300"
                : "border-gray-300 border-dashed text-gray-500 hover:border-gray-400"
            }`}
          >
            <Plus className="w-3 h-3" />Add nav item
          </button>
        )
      })()}

      <p className={`text-[10px] ${textFaint} opacity-60`}>
        Tip: Pages marked "Show in header nav" in the Pages tab are added automatically.
      </p>
    </div>
  )
}
import { useState } from "react"
import {
  GripVertical, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight
} from "lucide-react"
import type { FooterColumn, NavItem, StorePage } from "./types"
import { genId } from "./helpers"
import { LinkInput } from "./LinkInput"

// ─── FooterColumnsEditor ──────────────────────────────────────────────────────

export function FooterColumnsEditor({
  columns, onChange, columnsPerRow, onColumnsPerRowChange,
  columnsPerRowMobile, onColumnsPerRowMobileChange,
  isDark, pages, textFaint, textPrimary,
}: {
  columns: FooterColumn[]
  onChange: (cols: FooterColumn[]) => void
  columnsPerRow: number
  onColumnsPerRowChange: (n: number) => void
  columnsPerRowMobile: number
  onColumnsPerRowMobileChange: (n: number) => void
  isDark: boolean
  pages: StorePage[]
  textFaint: string
  textPrimary: string
}) {
  const [expandedColId,  setExpandedColId]  = useState<string | null>(null)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [draggingColId,  setDraggingColId]  = useState<string | null>(null)
  const [dragOverColId,  setDragOverColId]  = useState<number | null>(null)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<number | null>(null)
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"

  // ── Column helpers ──────────────────────────────────────────────────────────
  const addColumn = () => {
    onChange([...columns, { id: genId(), heading: "New Column", items: [] }])
  }

  const updateColumn = (id: string, patch: Partial<FooterColumn>) => {
    onChange(columns.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  const removeColumn = (id: string) => {
    onChange(columns.filter(c => c.id !== id))
    if (expandedColId === id) setExpandedColId(null)
  }

  const moveColumn = (id: string, dir: "up" | "down") => {
    const arr = [...columns]
    const i   = arr.findIndex(c => c.id === id)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange(arr)
  }

  // ── Item helpers ────────────────────────────────────────────────────────────
  const addItem = (colId: string) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: [...col.items, { id: genId(), label: "New Link", url: "/" }] })
  }

  const updateItem = (colId: string, itemId: string, patch: Partial<NavItem>) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: col.items.map(it => it.id === itemId ? { ...it, ...patch } : it) })
  }

  const removeItem = (colId: string, itemId: string) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: col.items.filter(it => it.id !== itemId) })
    if (expandedItemId === itemId) setExpandedItemId(null)
  }

  const moveItem = (colId: string, itemId: string, dir: "up" | "down") => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    const arr  = [...col.items]
    const i    = arr.findIndex(it => it.id === itemId)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    updateColumn(colId, { items: arr })
  }

  // ── Drop indicator components ───────────────────────────────────────────────
  const DropLine = ({ index }: { index: number }) => {
    const fromIdx       = columns.findIndex(c => c.id === draggingColId)
    const isAdjacentBelow = fromIdx === index - 1
    const isItself      = fromIdx === index
    const show = !!draggingColId && dragOverColId === index && !isAdjacentBelow && !isItself
    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragOverColId(index) }}
        className={`transition-all duration-150 overflow-hidden ${show ? "h-2 my-0.5" : "h-0 my-0"}`}
      >
        <div className="flex items-center h-full gap-1 px-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
          <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
          <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
        </div>
      </div>
    )
  }

  const ItemDropLine = ({ colId, index }: { colId: string; index: number }) => {
    const col     = columns.find(c => c.id === colId)
    if (!col) return null
    const fromIdx         = col.items.findIndex(it => it.id === draggingItemId)
    const isAdjacentBelow = fromIdx === index - 1
    const isItself        = fromIdx === index
    const show = !!draggingItemId && dragOverItemId === index && !isAdjacentBelow && !isItself
    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragOverItemId(index) }}
        className={`transition-all duration-150 overflow-hidden ${show ? "h-2 my-0.5" : "h-0 my-0"}`}
      >
        <div className="flex items-center h-full gap-1 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">

      {/* ── Columns per row desktop ── */}
      <div className={`p-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textFaint}`}>
          Columns per row (desktop)
        </p>
        <div className="grid grid-cols-5 gap-1">
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => onColumnsPerRowChange(n)}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                columnsPerRow === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {n}
            </button>
          ))}
        </div>
        <p className={`text-[9px] mt-1.5 ${textFaint} opacity-60`}>
          Mobile always stacks to 2 columns
        </p>
      </div>

      {/* ── Columns per row mobile ── */}
      <div className={`p-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textFaint}`}>
          Columns per row (mobile)
        </p>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => onColumnsPerRowMobileChange(n)}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                columnsPerRowMobile === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {n}
            </button>
          ))}
        </div>
        <p className={`text-[9px] mt-1.5 ${textFaint} opacity-60`}>
          1 = full width stacked, 2 = side by side, 3 = compact
        </p>
      </div>

      {/* ── Column count label ── */}
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>
          Footer columns
        </p>
        <span className={`text-[10px] ${textFaint}`}>
          {columns.length} column{columns.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Columns list ── */}
      <div
        className="space-y-2"
        onDragOver={e => e.preventDefault()}
        onDragEnd={() => { setDraggingColId(null); setDragOverColId(null) }}
      >
        {/* Drop line before first column */}
        <DropLine index={0} />

        {columns.map((col, ci) => {
          const isColExpanded = expandedColId === col.id
          return (
            <div key={col.id}>
              <div
                draggable
                onDragStart={e => { e.stopPropagation(); setDraggingColId(col.id) }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverColId(ci) }}
                onDrop={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!draggingColId || draggingColId === col.id) return
                  const arr     = [...columns]
                  const fromIdx = arr.findIndex(c => c.id === draggingColId)
                  if (fromIdx === -1 || dragOverColId === null) return
                  const [moved] = arr.splice(fromIdx, 1)
                  const insertAt = dragOverColId > fromIdx ? dragOverColId - 1 : dragOverColId
                  arr.splice(insertAt, 0, moved)
                  onChange(arr)
                  setDraggingColId(null)
                  setDragOverColId(null)
                }}
                className={`rounded-xl border overflow-hidden transition-all cursor-grab active:cursor-grabbing select-none ${
                  draggingColId === col.id ? "opacity-40 scale-[0.98]" : ""
                } ${
                  isColExpanded
                    ? isDark ? "border-orange-500/40 bg-gray-800/80" : "border-orange-400/40 bg-orange-50/20"
                    : isDark ? "border-gray-700 bg-gray-800/50"       : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* ── Column header row ── */}
                <div className="flex items-center gap-1.5 px-2 py-2">
                  {/* <GripVertical className={`w-3 h-3 shrink-0 transition-colors ${
                    isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  }`} /> */}
                  <button
                    onClick={() => setExpandedColId(isColExpanded ? null : col.id)}
                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                  >
                    <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isColExpanded ? "rotate-90" : ""} ${textFaint}`} />
                    <span className={`text-xs font-semibold truncate ${textPrimary}`}>{col.heading}</span>
                  </button>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                  }`}>
                    {col.items.length} links
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); moveColumn(col.id, "up") }}
                    disabled={ci === 0}
                    className={`p-0.5 rounded ${ci === 0 ? "opacity-30" : hoverBg} ${textFaint}`}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); moveColumn(col.id, "down") }}
                    disabled={ci === columns.length - 1}
                    className={`p-0.5 rounded ${ci === columns.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeColumn(col.id) }}
                    className="p-0.5 rounded hover:bg-red-900/30"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>

                {/* ── Column expanded content ── */}
                {isColExpanded && (
                  <div className={`border-t ${isDark ? "border-gray-700" : "border-orange-200/60"}`}>

                    {/* Heading edit */}
                    <div className="px-2 pt-2 pb-2">
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Column heading</label>
                      <input
                        value={col.heading}
                        onChange={e => updateColumn(col.id, { heading: e.target.value })}
                        placeholder="e.g. Shop"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500 border ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-gray-200"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>

                    {/* Links list */}
                    <div className={`mx-2 mb-2 rounded-lg border overflow-hidden ${
                      isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-white"
                    }`}>
                      <p className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider border-b ${
                        isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"
                      }`}>
                        Links
                      </p>

                      <div
                        className="p-1.5 space-y-1.5"
                        onDragEnd={() => { setDraggingItemId(null); setDragOverItemId(null) }}
                      >
                        {col.items.length === 0 && (
                          <p className={`text-[10px] italic px-1 py-1 ${textFaint}`}>No links yet.</p>
                        )}

                        {/* Drop line before first item */}
                        <ItemDropLine colId={col.id} index={0} />

                        {col.items.map((item, ii) => {
                          const colId         = col.id
                          const isItemExpanded = expandedItemId === item.id

                          return (
                            <div key={item.id}>
                              <div
                                draggable
                                onDragStart={e => { e.stopPropagation(); setDraggingItemId(item.id) }}
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(ii) }}
                                onDrop={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!draggingItemId || draggingItemId === item.id) return
                                  const currentCol = columns.find(c => c.id === colId)
                                  if (!currentCol) return
                                  const arr     = [...currentCol.items]
                                  const fromIdx = arr.findIndex(it => it.id === draggingItemId)
                                  if (fromIdx === -1 || dragOverItemId === null) return
                                  const [moved] = arr.splice(fromIdx, 1)
                                  const insertAt = dragOverItemId > fromIdx ? dragOverItemId - 1 : dragOverItemId
                                  arr.splice(insertAt, 0, moved)
                                  updateColumn(colId, { items: arr })
                                  setDraggingItemId(null)
                                  setDragOverItemId(null)
                                }}
                                className={`rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${
                                  draggingItemId === item.id ? "opacity-40 scale-[0.98]" : ""
                                } ${
                                  isItemExpanded
                                    ? isDark ? "border-orange-500/30 bg-gray-800"    : "border-orange-300/40 bg-orange-50/30"
                                    : isDark ? "border-gray-700 bg-gray-800/60"      : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                {/* Item row */}
                                <div className="flex items-center gap-1.5 px-2 py-1.5">
                                  {/* <GripVertical className={`w-2.5 h-2.5 shrink-0 transition-colors ${
                                    isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                                  }`} /> */}
                                  <button
                                    onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                                  >
                                    <ChevronRight className={`w-2.5 h-2.5 shrink-0 transition-transform ${isItemExpanded ? "rotate-90" : ""} ${textFaint}`} />
                                    <span className={`text-[11px] font-medium truncate ${textPrimary}`}>
                                      {item.label || "Untitled"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); moveItem(colId, item.id, "up") }}
                                    disabled={ii === 0}
                                    className={`p-0.5 rounded ${ii === 0 ? "opacity-30" : hoverBg} ${textFaint}`}
                                  >
                                    <ChevronUp className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); moveItem(colId, item.id, "down") }}
                                    disabled={ii === col.items.length - 1}
                                    className={`p-0.5 rounded ${ii === col.items.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}
                                  >
                                    <ChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); removeItem(colId, item.id) }}
                                    className="p-0.5 rounded hover:bg-red-900/30"
                                  >
                                    <Trash2 className="w-2.5 h-2.5 text-red-400" />
                                  </button>
                                </div>

                                {/* Item expanded fields */}
                                {isItemExpanded && (
                                  <div className={`px-2 pb-2 space-y-1.5 border-t ${
                                    isDark ? "border-gray-700" : "border-orange-200/40"
                                  }`}>
                                    <div className="pt-1.5">
                                      <label className={`text-[10px] ${textFaint} block mb-1`}>Label</label>
                                      <input
                                        value={item.label}
                                        onChange={e => updateItem(colId, item.id, { label: e.target.value })}
                                        placeholder="e.g. All Products"
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
                                        value={item.url}
                                        onChange={v => updateItem(colId, item.id, { url: v })}
                                        placeholder="/products"
                                        isDark={isDark}
                                        pages={pages}
                                      />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <div
                                        className="relative shrink-0"
                                        onClick={() => updateItem(colId, item.id, { external: !item.external })}
                                      >
                                        <div className={`w-7 h-3.5 rounded-full transition-colors ${
                                          item.external ? "bg-orange-500" : "bg-gray-600"
                                        }`} />
                                        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${
                                          item.external ? "translate-x-3.5" : ""
                                        }`} />
                                      </div>
                                      <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                                    </label>
                                  </div>
                                )}
                              </div>

                              {/* Drop line after each item */}
                              <ItemDropLine colId={col.id} index={ii + 1} />
                            </div>
                          )
                        })}

                        <button
                          onClick={() => addItem(col.id)}
                          className={`w-full flex items-center justify-center gap-1 py-1 mt-1 rounded-lg border border-dashed text-[10px] transition-all ${
                            isDark
                              ? "border-gray-700 text-gray-500 hover:border-orange-500/40 hover:text-orange-400"
                              : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" />Add link
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drop line after each column */}
              <DropLine index={ci + 1} />
            </div>
          )
        })}
      </div>

      {/* Add column button */}
      <button
        onClick={addColumn}
        className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed text-xs transition-all ${
          isDark
            ? "border-gray-700 text-gray-400 hover:border-orange-500/40 hover:text-orange-400"
            : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500"
        }`}
      >
        <Plus className="w-3 h-3" />Add column
      </button>
    </div>
  )
}
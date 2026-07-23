import { useState, useEffect } from "react"
import { ChevronLeft, Save, X, Trash2  } from "lucide-react"
import type { StorePage, PageTemplate } from "./types"
import { PAGE_TEMPLATES, BRAND } from "./constants"
import { slugify } from "./helpers"
import { LinkInput } from "./LinkInput"
import { RichTextEditor } from "./ui"

function getPageUrl(vendorHandle: string, slug: string): string {
  const base = import.meta.env.VITE_STORE_BASE_URL ?? `http://localhost:3000`
  return `${base}/${vendorHandle}/pages/${slug}`
}

function extractLastUpdated(content: string): string | null {
  const match = content.match(/\*Last updated: (.+?)\*/)
  return match ? match[1] : null
}

export function PageEditorPanel({ page, vendorHandle, onSave, onCancel, onDelete, isNew, isDark, onDraftChange, storeTemplate }: {
  page: StorePage
  vendorHandle: string
  isNew: boolean
  isDark: boolean
  storeTemplate?: string
  onSave: (p: StorePage) => void | Promise<void>
  onCancel: () => void
  onDelete: () => void
  onDraftChange?: (updated: StorePage) => void
}) {
  const [draft, setDraft] = useState({ ...page })

  const up = (patch: Partial<StorePage>) => {
    const updated = { ...draft, ...patch }
    setDraft(updated)
    onDraftChange?.(updated)
  }

  const textPrimary = isDark ? "text-white"     : "text-gray-900"
  const textFaint   = isDark ? "text-gray-500"  : "text-gray-400"
  const inputCls    = isDark
    ? "bg-gray-800 border border-gray-700 text-gray-200"
    : "bg-white border border-gray-300 text-gray-800"

  const isBoldTheme      = isDark || storeTemplate === "bold"
  const defaultBgColor   = isBoldTheme ? "#000000" : "#ffffff"
  const defaultTextColor = isBoldTheme ? "#ffffff" : "#111827"

  // Seed theme-appropriate defaults on first open if no colors set
  useEffect(() => {
    if (!(draft as any).bg_color || !(draft as any).text_color) {
      const patch: any = {}
      if (!(draft as any).bg_color)   patch.bg_color   = defaultBgColor
      if (!(draft as any).text_color) patch.text_color = defaultTextColor
      up(patch)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      {/* Back + Delete row */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onCancel}
          className={`flex items-center gap-1 text-xs ${textFaint} transition-colors`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />Back
        </button>
        {!isNew && (
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
        <input
          type="text"
          value={draft.title}
          onChange={e => up({
            title: e.target.value,
            ...(isNew ? { slug: slugify(e.target.value) } : {})
          })}
          placeholder="e.g. About Me"
          className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${inputCls}`}
        />
      </div>

      {/* Slug */}
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>URL slug</label>
        <div className="flex items-center">
          <span className={`px-2 py-1.5 border border-r-0 rounded-l-lg text-[10px] whitespace-nowrap ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-500"
              : "bg-gray-100 border-gray-300 text-gray-400"
          }`}>
            /pages/
          </span>
          <input
            value={draft.slug}
            onChange={e => up({ slug: slugify(e.target.value) })}
            className={`flex-1 rounded-r-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${inputCls}`}
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Content</label>

        {(draft.template === "terms" || draft.template === "privacy") && (
          <p className={`text-[10px] px-2.5 py-1.5 rounded-lg mb-2 ${
            isDark
              ? "bg-gray-800/50 text-gray-500 border border-gray-700"
              : "bg-gray-50 text-gray-400 border border-gray-200"
          }`}>
            🔒 Last updated: {extractLastUpdated(draft.content) ?? new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })} — auto-updated on save
          </p>
        )}

        <RichTextEditor
          value={draft.content
            .replace(/\*Last updated:.*?\*\n*/g, "")
            .replace(/^##\s+/gm, "")
            .trim()}
          onChange={v => {
            const isLegal = draft.template === "terms" || draft.template === "privacy"
            const today = new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })
            up({ content: isLegal ? `*Last updated: ${today}*\n\n${v}` : v })
          }}
          placeholder="Write page content here..."
          isDark={isDark}
          rows={10}
          showToolbar={true}
        />
      </div>

      {/* Background & Text color */}
      <div className={`pt-3 border-t space-y-2 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <p className={`text-[10px] uppercase tracking-wider font-semibold ${textFaint}`}>Page colors</p>

        {/* Background */}
        <div>
          <label className={`text-[10px] ${textFaint} block mb-1`}>Background</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={(draft as any).bg_color ?? defaultBgColor}
              onChange={e => up({ bg_color: e.target.value } as any)}
              className="border-0 rounded cursor-pointer w-7 h-7 shrink-0"
            />
            <input
              type="text"
              value={(draft as any).bg_color ?? defaultBgColor}
              onChange={e => up({ bg_color: e.target.value || defaultBgColor } as any)}
              className={`w-24 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${inputCls}`}
            />
            {(draft as any).bg_color && (draft as any).bg_color !== defaultBgColor && (
              <button onClick={() => up({ bg_color: defaultBgColor } as any)}
                className="text-gray-400 hover:text-red-400 shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Text color */}
        <div>
          <label className={`text-[10px] ${textFaint} block mb-1`}>Text</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={(draft as any).text_color ?? defaultTextColor}
              onChange={e => up({ text_color: e.target.value } as any)}
              className="border-0 rounded cursor-pointer w-7 h-7 shrink-0"
            />
            <input
              type="text"
              value={(draft as any).text_color ?? defaultTextColor}
              onChange={e => up({ text_color: e.target.value || defaultTextColor } as any)}
              className={`w-24 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${inputCls}`}
            />
            {(draft as any).text_color && (draft as any).text_color !== defaultTextColor && (
              <button onClick={() => up({ text_color: defaultTextColor } as any)}
                className="text-gray-400 hover:text-red-400 shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(draft)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}
        >
          <Save className="w-3 h-3" />
          {isNew ? "Create page" : "Save changes"}
        </button>
        <button
          onClick={onCancel}
          className={`px-3 py-2 rounded-lg border text-xs transition-colors ${
            isDark
              ? "border-gray-700 text-gray-400 hover:border-gray-500"
              : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
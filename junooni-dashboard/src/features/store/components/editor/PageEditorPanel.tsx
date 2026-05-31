import { useState } from "react"
import { ChevronLeft, Save, ExternalLink, X } from "lucide-react"
import type { StorePage, PageTemplate } from "./types"
import { PAGE_TEMPLATES, BRAND } from "./constants"
import { slugify } from "./helpers"
import { LinkInput } from "./LinkInput"

function getPageUrl(vendorHandle: string, slug: string): string {
  const base = import.meta.env.VITE_STORE_BASE_URL ?? `http://localhost:3000`
  return `${base}/${vendorHandle}/pages/${slug}`
}

export function PageEditorPanel({ page, vendorHandle, onSave, onCancel, onDelete, isNew, isDark, onDraftChange }: {
  page: StorePage
  vendorHandle: string
  isNew: boolean
  isDark: boolean
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
            Delete
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
        <a
          href={getPageUrl(vendorHandle, draft.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-orange-400 hover:text-orange-300 mt-1 flex items-center gap-1"
        >
          <ExternalLink className="w-2.5 h-2.5" />Preview page
        </a>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={`text-[10px] ${textFaint}`}>Content</label>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
            draft.content.trim().startsWith("<")
              ? "bg-red-900/20 border-red-800 text-red-400"
              : "bg-green-900/20 border-green-800 text-green-400"
          }`}>
            {draft.content.trim().startsWith("<") ? "HTML" : "Markdown"}
          </span>
        </div>

        {/* Date badge for legal pages */}
        {(draft.template === "terms" || draft.template === "privacy") && (() => {
          const match = draft.content.match(/\*Last updated:.*?\*/)
          const dateStr = match ? match[0].replace(/\*/g, "") : null
          return dateStr ? (
            <p className={`text-[10px] px-2.5 py-1.5 rounded-lg mb-1 ${
              isDark
                ? "bg-gray-800/50 text-gray-500 border border-gray-700"
                : "bg-gray-50 text-gray-400 border border-gray-200"
            }`}>
              🔒 {dateStr} — auto-updated on save
            </p>
          ) : null
        })()}

        <textarea
          value={draft.content.replace(/\*Last updated:.*?\*\n*/g, "")}
          onChange={e => {
            const today = new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })
            const hasDate = draft.template === "terms" || draft.template === "privacy"
            const newContent = hasDate
              ? `*Last updated: ${today}*\n\n${e.target.value}`
              : e.target.value
            up({ content: newContent })
          }}
          placeholder={"Markdown: ## Heading\n\nHTML: <div>...</div>"}
          rows={10}
          className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none font-mono text-xs ${inputCls}`}
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <p className={`text-[10px] ${textFaint}`}>Visibility</p>
        {[
          { key: "in_nav",    label: "Show in header nav", color: "blue"   },
          { key: "in_footer", label: "Show in footer",     color: "purple" },
        ].map(({ key, label, color }) => (
          <label
            key={key}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
              (draft as any)[key]
                ? `border-${color}-500/40 bg-${color}-500/10`
                : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={!!(draft as any)[key]}
              onChange={e => up({ [key]: e.target.checked } as any)}
              className="w-3.5 h-3.5 accent-orange-500"
            />
            <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {label}
            </span>
          </label>
        ))}
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
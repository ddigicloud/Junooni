import { useState, useRef } from "react"
import {
  Plus, X, Trash2, Loader2, ChevronUp, ChevronDown, ChevronRight,
  GripVertical, Check, ShoppingBag
} from "lucide-react"
import type { StoreSection, StorePage, FooterColumn } from "./types"
import { getDefaultFooterColumns } from "./helpers"
import { Field, StyleSection, EditorInput, EditorTextarea, UploadOnlyImageField } from "./ui"
import { LinkInput } from "./LinkInput"
import { FooterColumnsEditor } from "./FooterColumnsEditor"
import { NavItemsEditor } from "./NavItemsEditor"
import { ProductPickerButton } from "./ProductPicker"

// ─── ProductDetailSettings ────────────────────────────────────────────────────


// ─── ProductDetailSettings ────────────────────────────────────────────────────
// Flat expandable list. Each element row = reorder arrows + chevron to open settings.
// No "Element Order" wrapper. No duplicate sections below.
 
export function ProductDetailSettings({ settings, onChange, isDark, products = [], previewProductHandle = "" }: {
  settings: any
  onChange: (patch: any) => void
  isDark: boolean
  products?: { id: string; title: string; handle: string; thumbnail?: string; variants?: any[]; options?: any[] }[]
  previewProductHandle?: string
}) {
  const textFaint   = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white"    : "text-gray-900"
  const hoverBg     = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const borderCls   = isDark ? "border-gray-700" : "border-gray-200"
  const innerCls    = `px-3 pb-3 pt-2 border-t ${borderCls} space-y-2.5`
  const activeCls   = isDark ? "bg-gray-800" : "bg-orange-50/80"

  // ── Dynamic options from first product ────────────────────────────────────
  const firstProduct = previewProductHandle
  ? products.find(p => p.handle === previewProductHandle) ?? products[0]
  : products[0]
  const productOptions: { key: string; label: string }[] =
    firstProduct?.options?.map((o: any) => ({
      key: `option_${o.title.toLowerCase().replace(/\s+/g, "_")}`,
      label: o.title,
    })) ?? [
      { key: "colors", label: "Color Options" },
      { key: "sizes",  label: "Size Options"  },
    ]

  const optionKeys = productOptions.map(o => o.key)

  const staticBefore = ["title", "price"]
  const staticAfter  = ["quantity", "atc", "description", "meta"]
  const defaultOrder = [...staticBefore, ...optionKeys, ...staticAfter]

  // ── Migrate stored order — replace old colors/sizes with real option keys ─
  // AFTER
const storedOrder: string[] = settings.element_order ?? []
const order: string[] = storedOrder.length > 0
  ? (() => {
      // Find where colors/sizes/option_ keys were in stored order
      // and replace them in-place with current optionKeys
      const withoutOptions = storedOrder.filter(k =>
        !k.startsWith("option_") && !["colors", "sizes"].includes(k)
      )
      // Find insertion point — where first old option key was
      const firstOptionIdx = storedOrder.findIndex(k =>
        k.startsWith("option_") || ["colors", "sizes"].includes(k)
      )
      // Insert optionKeys at that position, or before "quantity" if not found
      const insertAt = firstOptionIdx !== -1
        ? firstOptionIdx
        : withoutOptions.indexOf("quantity") !== -1
          ? withoutOptions.indexOf("quantity")
          : 2
      const result = [...withoutOptions]
      result.splice(insertAt, 0, ...optionKeys)
      return result.filter((k, i, arr) => arr.indexOf(k) === i)
    })()
  : defaultOrder

  const [openKey, setOpenKey] = useState<string | null>(null)
  const toggleKey = (key: string) => setOpenKey(o => o === key ? null : key)

  const moveElement = (key: string, dir: "up" | "down") => {
    const arr  = [...order]
    const i    = arr.indexOf(key)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange({ element_order: arr })
  }

  const ELEMENT_META: Record<string, { label: string; icon: string }> = {
    title:       { label: "Product Title",    icon: "T"  },
    price:       { label: "Price",            icon: "₹"  },
    quantity:    { label: "Quantity Stepper", icon: "#"  },
    atc:         { label: "Add to Cart",      icon: "🛒" },
    description: { label: "Description",      icon: "📝" },
    meta:        { label: "Secure Badge",     icon: "🔒" },
    // dynamic option keys
    ...Object.fromEntries(
      productOptions.map(o => [
        o.key,
        {
          label: o.label,
          icon:
            o.label.toLowerCase().includes("color") || o.label.toLowerCase().includes("colour")
              ? "🎨"
              : o.label.toLowerCase().includes("size")
              ? "S"
              : "⚙️",
        },
      ])
    ),
  }

  const renderGenericOptionSettings = () => (
  <>
    <Field label="Button style" faint={textFaint}>
      <div className="grid grid-cols-3 gap-1">
        {(["pill","box","underline"] as const).map(s => (
          <button key={s} onClick={() => onChange({ size_style: s })}
            className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
              (settings.size_style ?? "pill") === s
                ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
            }`}>{s}</button>
        ))}
      </div>
    </Field>
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative shrink-0"
        onClick={() => onChange({ show_size_label: !(settings.show_size_label ?? true) })}>
        <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_size_label ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_size_label ?? true) ? "translate-x-4" : ""}`} />
      </div>
      <span className={`text-xs ${textPrimary}`}>Show option label</span>
    </label>
  </>
)
 
  // ── per-element settings renderers ──────────────────────────────────────────
 
  const renderTitleSettings = () => (
    <>
      <Field label="Size" faint={textFaint}>
        <div className="grid grid-cols-4 gap-1">
          {(["sm","md","lg","xl"] as const).map(s => (
            <button key={s} onClick={() => onChange({ title_size: s })}
              className={`py-1.5 rounded-lg border text-xs transition-all ${
                (settings.title_size ?? "lg") === s
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{s.toUpperCase()}</button>
          ))}
        </div>
      </Field>
      <Field label="Weight" faint={textFaint}>
        <div className="grid grid-cols-2 gap-1">
          {(["normal","semibold","bold","extrabold"] as const).map(w => (
            <button key={w} onClick={() => onChange({ title_weight: w })}
              className={`py-1.5 rounded-lg border text-[10px] transition-all ${
                (settings.title_weight ?? "bold") === w
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{w}</button>
          ))}
        </div>
      </Field>
      <Field label="Color" faint={textFaint}>
        <div className="flex gap-1.5">
          {settings.title_color ? (
            <>
              <input type="color" value={settings.title_color}
                onChange={e => onChange({ title_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <input type="text" value={settings.title_color}
                onChange={e => onChange({ title_color: e.target.value })}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                  isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                }`} />
              <button onClick={() => onChange({ title_color: undefined })} className="text-red-400 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button onClick={() => onChange({ title_color: isDark ? "#ffffff" : "#111827" })}
              className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                       : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
              }`}>
              <Plus className="w-3 h-3" />Set color
            </button>
          )}
        </div>
      </Field>
    </>
  )
 
  const renderPriceSettings = () => (
    <>
      <Field label="Size" faint={textFaint}>
        <div className="grid grid-cols-4 gap-1">
          {(["sm","md","lg","xl"] as const).map(s => (
            <button key={s} onClick={() => onChange({ price_size: s })}
              className={`py-1.5 rounded-lg border text-xs transition-all ${
                (settings.price_size ?? "lg") === s
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{s.toUpperCase()}</button>
          ))}
        </div>
      </Field>
      <Field label="Color" faint={textFaint}>
        <div className="flex gap-1.5">
          {settings.price_color ? (
            <>
              <input type="color" value={settings.price_color}
                onChange={e => onChange({ price_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <input type="text" value={settings.price_color}
                onChange={e => onChange({ price_color: e.target.value })}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                  isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                }`} />
              <button onClick={() => onChange({ price_color: undefined })} className="text-red-400 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button onClick={() => onChange({ price_color: "#e65100" })}
              className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                       : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
              }`}>
              <Plus className="w-3 h-3" />Set color
            </button>
          )}
        </div>
      </Field>
    </>
  )
 
  const renderColorsSettings = () => (
    <>
      <Field label="Label text" faint={textFaint}>
        <EditorInput value={settings.colors_label ?? "Color"}
          onChange={v => onChange({ colors_label: v })} placeholder="Color" isDark={isDark} />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative shrink-0"
          onClick={() => onChange({ show_color_label: !(settings.show_color_label ?? true) })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_color_label ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_color_label ?? true) ? "translate-x-4" : ""}`} />
        </div>
        <span className={`text-xs ${textPrimary}`}>Show color label</span>
      </label>
      <Field label="Swatch size" faint={textFaint}>
        <div className="grid grid-cols-3 gap-1">
          {(["sm","md","lg"] as const).map(s => (
            <button key={s} onClick={() => onChange({ color_swatch_size: s })}
              className={`py-1.5 rounded-lg border text-xs transition-all ${
                (settings.color_swatch_size ?? "md") === s
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{s.toUpperCase()}</button>
          ))}
        </div>
      </Field>
    </>
  )
 
  const renderSizesSettings = () => (
    <>
      <Field label="Label text" faint={textFaint}>
        <EditorInput value={settings.sizes_label ?? "Size"}
          onChange={v => onChange({ sizes_label: v })} placeholder="Size" isDark={isDark} />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative shrink-0"
          onClick={() => onChange({ show_size_label: !(settings.show_size_label ?? true) })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_size_label ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_size_label ?? true) ? "translate-x-4" : ""}`} />
        </div>
        <span className={`text-xs ${textPrimary}`}>Show size label</span>
      </label>
      <Field label="Button style" faint={textFaint}>
        <div className="grid grid-cols-3 gap-1">
          {(["pill","box","underline"] as const).map(s => (
            <button key={s} onClick={() => onChange({ size_style: s })}
              className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                (settings.size_style ?? "pill") === s
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{s}</button>
          ))}
        </div>
      </Field>
    </>
  )
 
  const renderQuantitySettings = () => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative shrink-0"
        onClick={() => onChange({ show_quantity: !(settings.show_quantity ?? true) })}>
        <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_quantity ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_quantity ?? true) ? "translate-x-4" : ""}`} />
      </div>
      <span className={`text-xs ${textPrimary}`}>Show quantity stepper</span>
    </label>
  )
 
  const renderAtcSettings = () => (
    <>
      <Field label="Button label" faint={textFaint}>
        <EditorInput value={settings.atc_label ?? "Add to Cart"}
          onChange={v => onChange({ atc_label: v })} placeholder="Add to Cart" isDark={isDark} />
      </Field>
      <Field label="Style" faint={textFaint}>
        <div className="grid grid-cols-3 gap-1">
          {(["filled","outline","pill"] as const).map(s => (
            <button key={s} onClick={() => onChange({ atc_style: s })}
              className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                (settings.atc_style ?? "pill") === s
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{s}</button>
          ))}
        </div>
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative shrink-0"
          onClick={() => onChange({ atc_full_width: !(settings.atc_full_width ?? true) })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${(settings.atc_full_width ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.atc_full_width ?? true) ? "translate-x-4" : ""}`} />
        </div>
        <span className={`text-xs ${textPrimary}`}>Full width button</span>
      </label>
    </>
  )
 
  const renderDescriptionSettings = () => (
    <>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative shrink-0"
          onClick={() => onChange({ description_collapsed: !(settings.description_collapsed ?? false) })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${(settings.description_collapsed ?? false) ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.description_collapsed ?? false) ? "translate-x-4" : ""}`} />
        </div>
        <span className={`text-xs ${textPrimary}`}>Collapsed by default</span>
      </label>
      <Field label="Accordion text color" faint={textFaint}>
        <div className="flex gap-1.5">
          {settings.accordion_text_color ? (
            <>
              <input type="color" value={settings.accordion_text_color}
                onChange={e => onChange({ accordion_text_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <input type="text" value={settings.accordion_text_color}
                onChange={e => onChange({ accordion_text_color: e.target.value })}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                  isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                }`} />
              <button onClick={() => onChange({ accordion_text_color: undefined })} className="text-red-400 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button onClick={() => onChange({ accordion_text_color: isDark ? "#ffffff" : "#111827" })}
              className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                       : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
              }`}>
              <Plus className="w-3 h-3" />Set color
            </button>
          )}
        </div>
      </Field>
    </>
  )
 
  const renderMetaSettings = () => (
    <>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative shrink-0"
          onClick={() => onChange({ show_secure_badge: !(settings.show_secure_badge ?? true) })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_secure_badge ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_secure_badge ?? true) ? "translate-x-4" : ""}`} />
        </div>
        <span className={`text-xs ${textPrimary}`}>Show secure badge</span>
      </label>
      {(settings.show_secure_badge ?? true) && (
        <Field label="Badge text" faint={textFaint}>
          <EditorInput
            value={settings.secure_badge_text ?? "Secure checkout via Junooni"}
            onChange={v => onChange({ secure_badge_text: v })}
            placeholder="Secure checkout via Junooni"
            isDark={isDark}
          />
        </Field>
      )}
    </>
  )
 
  const SETTINGS_MAP: Record<string, () => React.ReactNode> = {
  title:       renderTitleSettings,
  price:       renderPriceSettings,
  colors:      renderColorsSettings,
  sizes:       renderSizesSettings,
  quantity:    renderQuantitySettings,
  atc:         renderAtcSettings,
  description: renderDescriptionSettings,
  meta:        renderMetaSettings,
  ...Object.fromEntries(
    optionKeys.map(key => {
      const optionLabel = productOptions.find(o => o.key === key)?.label ?? ""
      const isColor = optionLabel.toLowerCase().includes("color") || optionLabel.toLowerCase().includes("colour")
      const isSize  = optionLabel.toLowerCase().includes("size")
      return [
        key,
        isColor ? renderColorsSettings :
        isSize  ? renderSizesSettings  :
                  renderGenericOptionSettings
      ]
    })
  ),
}
 
  // ── render ───────────────────────────────────────────────────────────────────
 
  return (
    <div className="space-y-1">
      {order.map((key, i) => {
        const meta = ELEMENT_META[key]
        if (!meta) return null
        const isOpen     = openKey === key
        const rowBg      = isOpen ? activeCls : ""
        const hasSettings = !!SETTINGS_MAP[key]
 
        return (
          <div key={key} className={`rounded-lg border ${borderCls}`}>
            {/* ── row ── */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg select-none ${rowBg}`}>
              {/* chevron — left */}
              {hasSettings ? (
                <button
                  onClick={() => toggleKey(key)}
                  className={`shrink-0 p-0.5 rounded transition-colors ${hoverBg}`}
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${textFaint} ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>
              ) : (
                <span className="w-4 shrink-0" />
              )}
 
              {/* icon + label — clickable to expand */}
              <div
                className={`flex items-center gap-2 flex-1 min-w-0 cursor-pointer ${hasSettings ? "" : "opacity-60"}`}
                onClick={() => hasSettings && toggleKey(key)}
              >
                <span className="w-5 text-sm text-center shrink-0">{meta.icon}</span>
                <span className={`text-[13px] font-medium truncate ${textPrimary}`}>{meta.label}</span>
              </div>
 
              {/* reorder arrows — right */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveElement(key, "up")}
                  disabled={i === 0}
                  className={`p-0.5 rounded transition-colors ${i === 0 ? "opacity-20 cursor-not-allowed" : hoverBg}`}
                >
                  <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                </button>
                <button
                  onClick={() => moveElement(key, "down")}
                  disabled={i === order.length - 1}
                  className={`p-0.5 rounded transition-colors ${i === order.length - 1 ? "opacity-20 cursor-not-allowed" : hoverBg}`}
                >
                  <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                </button>
              </div>
            </div>
 
            {/* ── expanded settings ── */}
            {isOpen && hasSettings && (
              <div className={innerCls}>
                {SETTINGS_MAP[key]()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
// ─── ColorOverride helper ─────────────────────────────────────────────────────

function ColorOverride({ section, onChange, isDark, textFaint }: {
  section: StoreSection
  onChange: (p: Partial<StoreSection>) => void
  isDark: boolean
  textFaint: string
}) {
  return (
    <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section colors override</p>
      <div className="grid grid-cols-2 gap-2">
        {/* Background */}
        <Field label="Background" faint={textFaint}>
          <div className="space-y-1.5">
            {section.background_color ? (
              <div className="flex gap-1.5 items-center">
                <input type="color" value={section.background_color}
                  onChange={e => onChange({ background_color: e.target.value })}
                  className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <input type="text" value={section.background_color}
                  onChange={e => onChange({ background_color: e.target.value })}
                  className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                    isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                  }`} />
                <button onClick={() => onChange({ background_color: undefined })}
                  className="text-red-400 shrink-0"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => onChange({ background_color: "#ffffff" })}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                  isDark
                    ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                    : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                }`}>
                <Plus className="w-3 h-3" />Set color
              </button>
            )}
          </div>
        </Field>
        {/* Text */}
        <Field label="Text" faint={textFaint}>
          <div className="space-y-1.5">
            {section.text_color ? (
              <div className="flex gap-1.5 items-center">
                <input type="color" value={section.text_color}
                  onChange={e => onChange({ text_color: e.target.value })}
                  className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <input type="text" value={section.text_color}
                  onChange={e => onChange({ text_color: e.target.value })}
                  className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                    isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                  }`} />
                <button onClick={() => onChange({ text_color: undefined })}
                  className="text-red-400 shrink-0"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => onChange({ text_color: "#000000" })}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                  isDark
                    ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                    : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                }`}>
                <Plus className="w-3 h-3" />Set color
              </button>
            )}
          </div>
        </Field>
      </div>
    </div>
  )
}

// ─── SectionSettings ──────────────────────────────────────────────────────────

export function SectionSettings({ section, onChange, token, backendUrl, isDark,
  collections = [], categories = [], pages = [], products = [],
  vendorHandle = "", currentLayoutKey = "home", storeLogo = "", storeTemplate = "",
}: {
  section: StoreSection
  onChange: (p: Partial<StoreSection>) => void
  token: string
  backendUrl: string
  isDark: boolean
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  pages?: StorePage[]
  products?: { id: string; title: string; handle: string; thumbnail?: string; variants?: any[]; options?: any[] }[]
  vendorHandle?: string
  storeLogo?: string
  currentLayoutKey?: string
  storeTemplate?: string
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<string>("")

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.files?.[0]?.url ?? null
  }

  const triggerUpload = (key: string) => { setUploadTarget(key); fileRef.current?.click() }

  const textFaint   = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white"    : "text-gray-900"

  const SKIP_COLOR_OVERRIDE = [
    "announcement", "divider", "html", "ticker",
    "category_grid", "category_products", "collections_grid", "collection_products", "image"
  ]

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
       onChange={async e => {
          if (!e.target.files?.[0]) return
          setUploadingKey(uploadTarget)
          const url = await uploadFile(e.target.files[0])
          if (url) {
            if (uploadTarget === "__hero_images__") {
              // Append to hero_images array
              const existing: string[] = (section as any).hero_images ?? []
              onChange({ hero_images: [...existing, url] } as any)
            } else {
              onChange({ [uploadTarget]: url })
            }
          }
          setUploadingKey(null)
          e.target.value = ""
        }} />

      {/* ── HERO ── */}
      {section.type === "hero" && (<>
        <Field label="Badge text" faint={textFaint}>
          <EditorInput value={(section as any).hero_badge ?? "Official Merch Store"}
            onChange={v => onChange({ hero_badge: v } as any)} placeholder="Official Merch Store" isDark={isDark} />
        </Field>
        <Field label="Headline" faint={textFaint}>
          <EditorInput value={section.headline ?? ""} onChange={v => onChange({ headline: v })}
            placeholder="My store is now live" isDark={isDark} />
        </Field>
        <Field label="Heading text size" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1">
            {(["sm","md","lg"] as const).map(size => (
              <button key={size} onClick={() => onChange({ headline_size: size })}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-all capitalize ${
                  (section.headline_size ?? "lg") === size
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                {size === "sm" ? "Small" : size === "md" ? "Regular" : "Large"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Subtext" faint={textFaint}>
          <EditorInput value={section.subtext ?? ""} onChange={v => onChange({ subtext: v })}
            placeholder="A supporting tagline" isDark={isDark} />
        </Field>
        <Field label="Primary CTA" faint={textFaint}>
          <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })}
            placeholder="Shop Now" isDark={isDark} />
        </Field>
        <Field label="CTA link" faint={textFaint}>
          <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })}
            placeholder="/products" isDark={isDark} pages={pages} collections={collections} categories={categories}/>
        </Field>
        <Field label="Secondary CTA" faint={textFaint}>
          <EditorInput value={section.cta_secondary_label ?? ""}
            onChange={v => onChange({ cta_secondary_label: v })} placeholder="Browse all" isDark={isDark} />
        </Field>
        <Field label="Secondary link" faint={textFaint}>
          <LinkInput value={section.cta_secondary_url ?? ""}
            onChange={v => onChange({ cta_secondary_url: v })} placeholder="/products" isDark={isDark} pages={pages} collections={collections} categories={categories}/>
        </Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative shrink-0"
            onClick={() => onChange({ auto_slide: !(section as any).auto_slide })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${(section as any).auto_slide ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(section as any).auto_slide ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Auto-slide cards</span>
        </label>
        {/* <p className={`text-[10px] ${textFaint} opacity-60 -mt-2`}>
          Only applies to Editorial template card deck
        </p> */}

        {/* ── Show right image toggle — minimal template only ── */}
        {storeTemplate === "minimal" && (
          <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <div className="relative shrink-0"
                onClick={() => onChange({ hide_right_image: !(section as any).hide_right_image } as any)}>
                <div className={`w-8 h-4 rounded-full transition-colors ${(section as any).hide_right_image ? "bg-gray-600" : "bg-orange-500"}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(section as any).hide_right_image ? "" : "translate-x-4"}`} />
              </div>
              <span className={`text-xs ${textPrimary}`}>Show right side image</span>
            </label>

            {/* Text alignment — only when image is hidden */}
            {(section as any).hide_right_image && (
              <div>
                <label className={`text-[10px] ${textFaint} block mb-1.5`}>Text alignment</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["left", "center", "right"] as const).map(align => (
                    <button key={align}
                      onClick={() => onChange({ text_alignment: align } as any)}
                      className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                        ((section as any).text_alignment ?? "left") === align
                          ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                          : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                      }`}>
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <UploadOnlyImageField label="Background image" value={section.background_image ?? ""}
          onChange={v => onChange({ background_image: v || undefined })}
          onUpload={() => triggerUpload("background_image")}
          isUploading={uploadingKey === "background_image"} isDark={isDark} />
        {!(section as any).hide_right_image && (
            <UploadOnlyImageField label="Right side image"
              value={[
                "/minimal-template-banner.png",
                "/bold-template-banner.png",
                "/editorial-template-banner.png",
              ].includes((section as any).hero_image_right ?? "") ? "" : ((section as any).hero_image_right ?? "")}
              onChange={v => onChange({ hero_image_right: v || undefined } as any)}
              onUpload={() => triggerUpload("hero_image_right")}
              isUploading={uploadingKey === "hero_image_right"} isDark={isDark} previewHeight={120} />
          )}

        {/* ── Additional images for Editorial card deck ── */}
        {/* ── Additional images — only for editorial template ── */}
        {storeTemplate === "editorial" && (
        <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-[10px] ${textFaint}`}>
              Card deck images
            </label>
            <span className={`text-[10px] ${textFaint} opacity-50`}>
              {((section as any).hero_images ?? []).length} / 6
            </span>
          </div>
          <p className={`text-[10px] ${textFaint} opacity-60 mb-3`}>
            Upload up to 6 images — they cycle as cards in the editorial template hero.
          </p>

          {/* Existing uploaded images */}
          <div className="space-y-2 mb-2">
            {((section as any).hero_images ?? []).map((img: string, i: number) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                <img
                  src={img}
                  alt={`Card ${i + 1}`}
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                />
                <span className={`flex-1 text-[10px] truncate ${textFaint}`}>
                  Image {i + 1}
                </span>
                {/* Move up */}
                {i > 0 && (
                  <button
                    onClick={() => {
                      const imgs = [...((section as any).hero_images ?? [])]
                      ;[imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]]
                      onChange({ hero_images: imgs } as any)
                    }}
                    className={`p-1 rounded transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2L2 6h6L5 2z" fill="currentColor"/>
                    </svg>
                  </button>
                )}
                {/* Move down */}
                {i < ((section as any).hero_images ?? []).length - 1 && (
                  <button
                    onClick={() => {
                      const imgs = [...((section as any).hero_images ?? [])]
                      ;[imgs[i], imgs[i + 1]] = [imgs[i + 1], imgs[i]]
                      onChange({ hero_images: imgs } as any)
                    }}
                    className={`p-1 rounded transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 8L2 4h6L5 8z" fill="currentColor"/>
                    </svg>
                  </button>
                )}
                {/* Remove */}
                <button
                  onClick={() => {
                    const imgs = ((section as any).hero_images ?? []).filter((_: string, j: number) => j !== i)
                    onChange({ hero_images: imgs.length > 0 ? imgs : undefined } as any)
                  }}
                  className="p-1 rounded hover:bg-red-900/30 text-red-400 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add image button */}
           {((section as any).hero_image_right && !([
            "/minimal-template-banner.png",
            "/bold-template-banner.png",
              "/editorial-template-banner.png",
            ].includes((section as any).hero_image_right ?? ""))) &&
            ((section as any).hero_images ?? []).length < 6 && (
            <button
              onClick={() => {
                setUploadTarget("__hero_images__")
                fileRef.current?.click()
              }}
              disabled={uploadingKey === "__hero_images__"}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed text-xs transition-all ${
                isDark
                  ? "border-gray-700 text-gray-400 hover:border-orange-500/50 hover:text-orange-400"
                  : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              {uploadingKey === "__hero_images__"
                ? <><Loader2 className="w-3 h-3 animate-spin" />Uploading...</>
                : <><Plus className="w-3 h-3" />Add image</>
              }
            </button>
          )}
        </div>
         )}
        <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <p className={`text-[10px] ${textFaint} mb-2`}>Hero overlay & text</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Overlay color" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.overlay_color ?? "#000000"}
                  onChange={e => onChange({ overlay_color: e.target.value })}
                  className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.overlay_color ?? ""}
                  onChange={v => onChange({ overlay_color: v })} placeholder="#000000" isDark={isDark} />
              </div>
            </Field>
            <Field label="Text color" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.overlay_text_color ?? "#ffffff"}
                  onChange={e => onChange({ overlay_text_color: e.target.value })}
                  className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.overlay_text_color ?? ""}
                  onChange={v => onChange({ overlay_text_color: v })} placeholder="#ffffff" isDark={isDark} />
              </div>
            </Field>
          </div>
        </div>
      </>)}

      {/* ── ANNOUNCEMENT ── */}
      {section.type === "announcement" && (<>
        <Field label="Message" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Free shipping on orders above ₹999 🎉" isDark={isDark} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#e65100"}
                onChange={e => onChange({ background_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.background_color ?? "#e65100"}
                onChange={v => onChange({ background_color: v })} isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"}
                onChange={e => onChange({ text_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.text_color ?? "#ffffff"}
                onChange={v => onChange({ text_color: v })} isDark={isDark} />
            </div>
          </Field>
        </div>
        {/* {section.title && (
          <div className="px-3 py-2 text-xs font-medium text-center rounded-lg"
            style={{ background: section.background_color ?? "#e65100", color: section.text_color ?? "#ffffff" }}
            dangerouslySetInnerHTML={{ __html: section.title }} />
        )} */}
      </>)}

      {/* ── COLLECTION / FEATURED ── */}
      {(section.type === "collection" || section.type === "featured") && (<>
        <Field label="Section title" faint={textFaint}>
          <EditorInput value={section.title ?? ""}
            onChange={v => onChange({ title: v })}
            placeholder={section.type === "featured" ? "Featured Drops" : "All Products"}
            isDark={isDark} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Max products" faint={textFaint}>
            <input type="number" min={1} max={48} value={section.limit ?? 12}
              onChange={e => onChange({ limit: parseInt(e.target.value) || 12 })}
              className={`w-full px-2 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-orange-500 ${
                isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"
              }`} />
          </Field>
          <Field label="Columns" faint={textFaint}>
            <div className="flex gap-1">
              {([2,3,4] as const).map(n => (
                <button key={n} onClick={() => onChange({ columns: n })}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${
                    section.columns === n || (!section.columns && n === 3)
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{n}</button>
              ))}
            </div>
          </Field>
        </div>
        {section.type === "featured" && (
          <Field label="Specific product IDs (one per line)" faint={textFaint}>
            <EditorTextarea value={section.product_ids?.join("\n") ?? ""}
              onChange={v => onChange({ product_ids: v.split("\n").map(s => s.trim()).filter(Boolean) })}
              placeholder={"prod_01...\nprod_02..."} rows={3} isDark={isDark}  pages={pages} collections={collections} categories={categories}/>
            <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Leave empty to show latest products</p>
          </Field>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_product_count: !(section.show_product_count ?? true) })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_product_count !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_product_count !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show product count</span>
        </label>
        {/* <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_sold_out: !section.show_sold_out })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_sold_out !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_sold_out !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show sold-out products</span>
        </label> */}
        {/* ── Filter settings — only for All Products page ── */}
        {currentLayoutKey === "products" && (<>
          <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Filter sidebar</p>
            <div className="space-y-2">
              {[
                { key: "show_filters", label: "Show filters", def: true },
              ].map(({ key, label, def }) => {
                const val = (section as any)[key] !== undefined ? (section as any)[key] : def
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div className="relative shrink-0"
                      onClick={() => onChange({ [key]: !val } as any)}>
                      <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                    </div>
                    <span className={`text-xs ${textPrimary}`}>{label}</span>
                  </label>
                )
              })}

              {(section as any).show_filters !== false && (
                <div className="space-y-2 pl-2 border-l-2 border-orange-500/20 ml-1">
                  {[
                    { key: "show_sort",              label: "Show sort dropdown",      def: true },
                    { key: "show_price_filter",      label: "Show price filter",       def: true },
                    { key: "show_category_filter",   label: "Show category filter",    def: true },
                    { key: "show_collection_filter", label: "Show collection filter",  def: true },
                  ].map(({ key, label, def }) => {
                    const val = (section as any)[key] !== undefined ? (section as any)[key] : def
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative shrink-0"
                          onClick={() => onChange({ [key]: !val } as any)}>
                          <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                        </div>
                        <span className={`text-xs ${textPrimary}`}>{label}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <Field label="Filter order" faint={textFaint}>
            <p className={`text-[10px] mb-2 ${textFaint} opacity-70`}>Use arrows to reorder.</p>
            <div className="space-y-1.5">
              {((section as any).filter_order ?? ["sort","price","category","collection"]).map((id: string, i: number, arr: string[]) => {
                const labels: Record<string,string> = {
                  sort: "Sort", price: "Price Range",
                  category: "Categories", collection: "Collections"
                }
                return (
                  <div key={id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
                    isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                  }`}>
                    <GripVertical className={`w-3.5 h-3.5 shrink-0 ${textFaint}`} />
                    <span className={`flex-1 text-xs ${textPrimary}`}>{labels[id] ?? id}</span>
                    <button disabled={i === 0} onClick={() => {
                      const newArr = [...arr]
                      ;[newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]]
                      onChange({ filter_order: newArr } as any)
                    }} className={`p-0.5 rounded ${i === 0 ? "opacity-30" : ""}`}>
                      <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                    </button>
                    <button disabled={i === arr.length - 1} onClick={() => {
                      const newArr = [...arr]
                      ;[newArr[i], newArr[i+1]] = [newArr[i+1], newArr[i]]
                      onChange({ filter_order: newArr } as any)
                    }} className={`p-0.5 rounded ${i === arr.length - 1 ? "opacity-30" : ""}`}>
                      <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </Field>
        </>)}
      </>)}

      {/* ── ABOUT ── */}
      {section.type === "about" && (<>
        <Field label="Title" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="About Me" isDark={isDark} />
        </Field>
        <Field label="Content" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Share your story..." rows={6} isDark={isDark}  pages={pages} collections={collections} categories={categories}/>
        </Field>
        <UploadOnlyImageField label="Image" value={section.image ?? ""}
          onChange={v => onChange({ image: v || undefined })}
          onUpload={() => triggerUpload("image")}
          isUploading={uploadingKey === "image"} isDark={isDark} />
        <Field label="Image position" faint={textFaint}>
          <div className="flex gap-2">
            {(["left","right"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  (section.image_position ?? "left") === pos
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                }`}>Image {pos}</button>
            ))}
          </div>
        </Field>
      </>)}

      {/* ── SOCIAL ── */}
      {section.type === "social" && (
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint} opacity-70 mb-1`}>Toggle which platforms to show</p>
          {[
            { key: "show_instagram", label: "Instagram", color: "#E1306C" },
            { key: "show_youtube",   label: "YouTube",   color: "#FF0000" },
            { key: "show_twitter",   label: "X",         color: "#1DA1F2" },
            { key: "show_facebook",  label: "Facebook",  color: "#1877F2" },
          ].map(({ key, label, color }) => (
            <label key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-transparent ${
              isDark ? "bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700" : "bg-gray-50 hover:bg-gray-100"
            }`}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className={`flex-1 text-sm ${textPrimary}`}>{label}</span>
              <div className="relative w-8 h-4 shrink-0"
                onClick={() => onChange({ [key]: !(section as any)[key] })}>
                <div className={`w-8 h-4 rounded-full transition-colors ${(section as any)[key] ? "bg-orange-500" : "bg-gray-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(section as any)[key] ? "translate-x-4" : ""}`} />
              </div>
            </label>
          ))}
        </div>
      )}

      {/* ── TEXT ── */}
      {section.type === "text" && (
        <Field label="Content" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Write your content..." rows={10} isDark={isDark}  pages={pages} collections={collections} categories={categories}/>
        </Field>
      )}

      {/* ── IMAGE ── */}
      {section.type === "image" && (<>
        <UploadOnlyImageField label="Image" value={section.image ?? ""}
          onChange={v => onChange({ image: v || undefined })}
          onUpload={() => triggerUpload("image")}
          isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={140} />

        <Field label="Alt text" faint={textFaint}>
          <EditorInput value={(section as any).image_alt ?? ""}
            onChange={v => onChange({ image_alt: v } as any)}
            placeholder="Describe the image..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Used for accessibility and SEO.</p>
        </Field>

        <Field label="Section title (optional)" faint={textFaint}>
          <EditorInput value={section.title ?? ""}
            onChange={v => onChange({ title: v })}
            placeholder="e.g. Our Story" isDark={isDark} />
        </Field>

        {section.title && (<>
          <Field label="Title position" faint={textFaint}>
            <div className="grid grid-cols-3 gap-1">
              {(["left","center","right"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ title_position: pos } as any)}
                  className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    ((section as any).title_position ?? "center") === pos
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{pos}</button>
              ))}
            </div>
          </Field>

          <Field label="Title placement" faint={textFaint}>
            <div className="grid grid-cols-2 gap-1">
              {([
                { val: "above", label: "Above image" },
                { val: "over",  label: "Over image"  },
                { val: "below", label: "Below image" },
              ] as const).map(({ val, label }) => (
                <button key={val} onClick={() => onChange({ title_placement: val } as any)}
                  className={`py-1.5 rounded-lg border text-xs transition-all ${
                    ((section as any).title_placement ?? "over") === val
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{label}</button>
              ))}
            </div>
          </Field>

          <Field label="Title color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color"
                value={(section as any).title_color ?? "#ffffff"}
                onChange={e => onChange({ title_color: e.target.value } as any)}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={(section as any).title_color ?? "#ffffff"}
                onChange={v => onChange({ title_color: v } as any)}
                placeholder="#ffffff" isDark={isDark} />
            </div>
          </Field>
        </>)}

        <Field label="Image height" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {([
              { val: "auto",   label: "Auto"   },
              { val: "fixed",  label: "Fixed"  },
              { val: "screen", label: "Screen" },
            ] as const).map(({ val, label }) => (
              <button key={val} onClick={() => onChange({ image_height_mode: val } as any)}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  ((section as any).image_height_mode ?? "auto") === val
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{label}</button>
            ))}
          </div>
          {(section as any).image_height_mode === "fixed" && (
            <div className="flex items-center gap-3">
              <input type="range" min={100} max={800} step={20}
                value={(section as any).image_height_px ?? 400}
                onChange={e => onChange({ image_height_px: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-12 text-right shrink-0 ${textFaint}`}>
                {(section as any).image_height_px ?? 400}px
              </span>
            </div>
          )}
          {(section as any).image_height_mode === "screen" && (
            <div className="flex items-center gap-3">
              <input type="range" min={30} max={100} step={5}
                value={(section as any).image_height_vh ?? 70}
                onChange={e => onChange({ image_height_vh: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-10 text-right shrink-0 ${textFaint}`}>
                {(section as any).image_height_vh ?? 70}vh
              </span>
            </div>
          )}
        </Field>

        <Field label="Image width" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1">
            {([
              { val: "full",      label: "Full"      },
              { val: "contained", label: "Contained" },
              { val: "custom",    label: "Custom"    },
            ] as const).map(({ val, label }) => (
              <button key={val} onClick={() => onChange({ image_width_mode: val } as any)}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  ((section as any).image_width_mode ?? "full") === val
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{label}</button>
            ))}
          </div>
          {(section as any).image_width_mode === "custom" && (
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={20} max={100} step={5}
                value={(section as any).image_width_pct ?? 80}
                onChange={e => onChange({ image_width_pct: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-10 text-right shrink-0 ${textFaint}`}>
                {(section as any).image_width_pct ?? 80}%
              </span>
            </div>
          )}
        </Field>

        <Field label="Object fit" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1">
            {([
              { val: "cover",   label: "Cover"   },
              { val: "contain", label: "Contain" },
              { val: "fill",    label: "Fill"    },
            ] as const).map(({ val, label }) => (
              <button key={val} onClick={() => onChange({ image_fit: val } as any)}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  ((section as any).image_fit ?? "cover") === val
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{label}</button>
            ))}
          </div>
        </Field>

        <Field label="Overlay opacity" faint={textFaint}>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={90} step={5}
              value={(section as any).overlay_opacity ?? 0}
              onChange={e => onChange({ overlay_opacity: Number(e.target.value) } as any)}
              className="flex-1 accent-orange-500" />
            <span className={`text-xs w-8 text-right shrink-0 ${textFaint}`}>
              {(section as any).overlay_opacity ?? 0}%
            </span>
          </div>
          {((section as any).overlay_opacity ?? 0) > 0 && (
            <div className="flex gap-1.5 mt-2">
              <input type="color"
                value={(section as any).overlay_color ?? "#000000"}
                onChange={e => onChange({ overlay_color: e.target.value } as any)}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={(section as any).overlay_color ?? "#000000"}
                onChange={v => onChange({ overlay_color: v } as any)}
                placeholder="#000000" isDark={isDark} />
            </div>
          )}
        </Field>

        <Field label="Corner radius" faint={textFaint}>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={32} step={2}
              value={(section as any).border_radius ?? 0}
              onChange={e => onChange({ border_radius: Number(e.target.value) } as any)}
              className="flex-1 accent-orange-500" />
            <span className={`text-xs w-8 text-right shrink-0 ${textFaint}`}>
              {(section as any).border_radius ?? 0}px
            </span>
          </div>
        </Field>

        <Field label="Padding (top / bottom)" faint={textFaint}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] w-8 shrink-0 ${textFaint}`}>Top</span>
              <input type="range" min={0} max={120} step={4}
                value={(section as any).padding_top ?? 0}
                onChange={e => onChange({ padding_top: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-10 text-right shrink-0 ${textFaint}`}>
                {(section as any).padding_top ?? 0}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] w-8 shrink-0 ${textFaint}`}>Bottom</span>
              <input type="range" min={0} max={120} step={4}
                value={(section as any).padding_bottom ?? 0}
                onChange={e => onChange({ padding_bottom: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-10 text-right shrink-0 ${textFaint}`}>
                {(section as any).padding_bottom ?? 0}px
              </span>
            </div>
          </div>
        </Field>

        <Field label="Link (optional)" faint={textFaint}>
          <LinkInput value={(section as any).image_link ?? ""}
            onChange={v => onChange({ image_link: v } as any)}
            placeholder="/products" isDark={isDark}
            pages={pages} collections={collections} categories={categories} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Makes the entire image clickable.</p>
        </Field>

        {/* Background only — text color not applicable for image sections */}
        <Field label="Background color" faint={textFaint}>
          <div className="space-y-1.5">
            {section.background_color ? (
              <div className="flex gap-1.5 items-center">
                <input type="color" value={section.background_color}
                  onChange={e => onChange({ background_color: e.target.value })}
                  className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <input type="text" value={section.background_color}
                  onChange={e => onChange({ background_color: e.target.value })}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                    isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                  }`} />
                <button onClick={() => onChange({ background_color: undefined })}
                  className="text-red-400 shrink-0"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => onChange({ background_color: "#ffffff" })}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                  isDark
                    ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                    : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                }`}>
                <Plus className="w-3 h-3" />Set color
              </button>
            )}
          </div>
        </Field>
      </>)}

      {/* ── VIDEO ── */}
      {section.type === "video" && (<>
        <Field label="Section title (optional)" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Watch me" isDark={isDark} />
        </Field>
        <Field label="Video URL" faint={textFaint}>
          <EditorInput value={section.video_url ?? ""} onChange={v => onChange({ video_url: v })}
            placeholder="https://youtube.com/watch?v=..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>YouTube and Vimeo supported</p>
        </Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ video_autoplay: !section.video_autoplay })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.video_autoplay ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.video_autoplay ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Autoplay (muted)</span>
        </label>
      </>)}

      {/* ── LINKS ── */}
      {section.type === "links" && (<>
        <Field label="Section title" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="My Links" isDark={isDark} />
        </Field>
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint}`}>Links</p>
          {(section.links ?? []).map((link, i) => (
            <div key={link.id} className={`p-2 rounded-lg border space-y-1.5 ${
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-1.5">
                <EditorInput value={link.label}
                  onChange={v => { const links = [...(section.links ?? [])]; links[i] = { ...links[i], label: v }; onChange({ links }) }}
                  placeholder="Button label" isDark={isDark} />
                <button onClick={() => { const links = (section.links ?? []).filter((_, j) => j !== i); onChange({ links }) }}
                  className="p-1 text-red-400 rounded hover:bg-red-900/30 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <LinkInput value={link.url}
                onChange={v => { const links = [...(section.links ?? [])]; links[i] = { ...links[i], url: v }; onChange({ links }) }}
                placeholder="https://... or /path" isDark={isDark} pages={pages} collections={collections} categories={categories}/>
            </div>
          ))}
          <button onClick={() => onChange({ links: [...(section.links ?? []), { id: `l_${Date.now()}`, label: "New Link", url: "" }] })}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${
              isDark
                ? "border-gray-700 border-dashed text-gray-400 hover:border-gray-500 hover:text-gray-300"
                : "border-gray-300 border-dashed text-gray-500 hover:border-gray-400"
            }`}>
            <Plus className="w-3 h-3" />Add link
          </button>
        </div>
      </>)}

      {/* ── FEATURED COLLECTIONS ── */}
      {section.type === "featured_collections" && (<>
        <Field label="Section title" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Shop by Collection" isDark={isDark} />
        </Field>
        <Field label="Columns" faint={textFaint}>
          <div className="flex gap-1.5">
            {([2,3,4] as const).map(n => (
              <button key={n} onClick={() => onChange({ columns: n })}
                className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${
                  section.columns === n || (!section.columns && n === 3)
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{n}</button>
            ))}
          </div>
        </Field>
        <Field label="Choose collections" faint={textFaint}>
          <p className={`text-[10px] mb-2 ${textFaint}`}>Select which collections to display. Leave empty to show all.</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {collections.length === 0
              ? <p className={`text-[11px] italic ${textFaint}`}>No collections found.</p>
              : collections.map(col => {
                const selected = (section.collection_ids ?? []).includes(col.id)
                return (
                  <label key={col.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                    selected
                      ? isDark ? "border-violet-500/50 bg-violet-500/10" : "border-violet-400/50 bg-violet-50"
                      : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="checkbox" checked={selected}
                      onChange={e => {
                        const ids = section.collection_ids ?? []
                        onChange({ collection_ids: e.target.checked ? [...ids, col.id] : ids.filter(id => id !== col.id) })
                      }}
                      className="w-3.5 h-3.5 accent-violet-500 shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{col.title}</p>
                      <p className={`text-[10px] truncate ${textFaint}`}>/{col.handle}</p>
                    </div>
                    {selected && <span className="ml-auto text-[10px] font-semibold text-violet-500">✓</span>}
                  </label>
                )
              })
            }
          </div>
          {(section.collection_ids ?? []).length > 0 && (
            <button onClick={() => onChange({ collection_ids: [] })}
              className={`mt-2 text-[10px] ${textFaint} hover:text-red-400 transition-colors`}>
              Clear selection (show all)
            </button>
          )}
        </Field>
      </>)}

      {/* ── HTML ── */}
      {section.type === "html" && (
        <Field label="Custom HTML / CSS / JS" faint={textFaint}>
          <EditorTextarea value={section.html_content ?? ""}
            onChange={v => onChange({ html_content: v })}
            placeholder={"<div style=\"padding:40px;text-align:center\">\n  <h2>Custom content</h2>\n</div>"}
            rows={12} isDark={isDark} mono  pages={pages} collections={collections} categories={categories}/>
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Rendered in an isolated iframe.</p>
        </Field>
      )}

      {/* ── DIVIDER ── */}
      {section.type === "divider" && (
        <div className="space-y-3">
          <Field label="Thickness (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={16} value={(section as any).divider_thickness ?? 1}
                onChange={e => onChange({ divider_thickness: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-6 text-right ${textFaint}`}>{(section as any).divider_thickness ?? 1}</span>
            </div>
          </Field>
          <Field label="Color" faint={textFaint}>
            <div className="flex gap-1.5 items-center">
              <input type="color" value={(section as any).divider_color ?? "#e5e7eb"}
                onChange={e => onChange({ divider_color: e.target.value } as any)}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={(section as any).divider_color ?? "#e5e7eb"}
                onChange={v => onChange({ divider_color: v } as any)} placeholder="#e5e7eb" isDark={isDark} />
            </div>
          </Field>
          <Field label="Padding top (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={120} step={4} value={(section as any).padding_top ?? 16}
                onChange={e => onChange({ padding_top: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-8 text-right ${textFaint}`}>{(section as any).padding_top ?? 16}px</span>
            </div>
          </Field>
          <Field label="Padding bottom (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={120} step={4} value={(section as any).padding_bottom ?? 16}
                onChange={e => onChange({ padding_bottom: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-8 text-right ${textFaint}`}>{(section as any).padding_bottom ?? 16}px</span>
            </div>
          </Field>
        </div>
      )}

      {/* ── TICKER ── */}
      {section.type === "ticker" && (<>
        <Field label="Ticker items (one per line)" faint={textFaint}>
          <EditorTextarea
            value={(section.ticker_items ?? []).join("\n")}
            onChange={v => onChange({ ticker_items: v.split("\n").map(s => s.trim()).filter(Boolean) })}
            placeholder="Free shipping on orders above ₹999"
            rows={5} isDark={isDark}   pages={pages} collections={collections} categories={categories} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Each line is one item in the scroll.</p>
        </Field>
        <Field label="Separator between items" faint={textFaint}>
          <EditorInput value={section.ticker_separator ?? "✦"}
            onChange={v => onChange({ ticker_separator: v })} placeholder="✦  •  |" isDark={isDark} />
        </Field>
        <Field label="Scroll speed" faint={textFaint}>
          <div className="flex items-center gap-3">
            <input type="range" min={10} max={100} value={section.ticker_speed ?? 40}
              onChange={e => onChange({ ticker_speed: Number(e.target.value) })}
              className="flex-1 accent-orange-500" />
            <span className={`text-xs w-8 text-right ${textFaint}`}>{section.ticker_speed ?? 40}</span>
          </div>
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Lower = slower, higher = faster.</p>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#111827"}
                onChange={e => onChange({ background_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={section.background_color ?? "#111827"}
                onChange={v => onChange({ background_color: v })} isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"}
                onChange={e => onChange({ text_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={section.text_color ?? "#ffffff"}
                onChange={v => onChange({ text_color: v })} isDark={isDark} />
            </div>
          </Field>
        </div>
        {/* {(section.ticker_items ?? []).length > 0 && (
          <div className="px-3 py-2 overflow-hidden text-xs font-medium rounded-lg"
            style={{ background: section.background_color ?? "#111827", color: section.text_color ?? "#ffffff" }}>
            {(section.ticker_items ?? []).join(` ${section.ticker_separator ?? "✦"} `)}
          </div>
        )} */}
      </>)}

      {/* ── IMAGE WITH TEXT ── */}
      {section.type === "image_text" && (<>
        <Field label="Heading" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Our Story" isDark={isDark} />
        </Field>
        <Field label="Body text" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Share something meaningful..." rows={5} isDark={isDark} pages={pages} collections={collections} categories={categories} />
        </Field>
        <Field label="Button label" faint={textFaint}>
          <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })}
            placeholder="Learn More" isDark={isDark} />
        </Field>
        <Field label="Button link" faint={textFaint}>
          <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })}
            placeholder="/products" isDark={isDark} pages={pages} collections={collections} categories={categories}/>
        </Field>
        <UploadOnlyImageField label="Image" value={section.image ?? ""}
          onChange={v => onChange({ image: v || undefined })}
          onUpload={() => triggerUpload("image")}
          isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={120} />
        <Field label="Desktop — image position" faint={textFaint}>
          <div className="flex gap-2">
            {(["left","right"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  (section.image_position ?? "left") === pos
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                }`}>🖥 Image {pos}</button>
            ))}
          </div>
        </Field>
        <Field label="Mobile — image position" faint={textFaint}>
          <div className="flex gap-2">
            {(["top","bottom"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ mobile_image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  (section.mobile_image_position ?? "top") === pos
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                }`}>📱 Image {pos}</button>
            ))}
          </div>
        </Field>
      </>)}

      {/* ── VIDEO WITH TEXT ── */}
      {section.type === "video_text" && (<>
        <Field label="Heading" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Watch & Shop" isDark={isDark} />
        </Field>
        <Field label="Body text" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Tell your audience what this video is about..." rows={4} isDark={isDark}  pages={pages} collections={collections} categories={categories}/>
        </Field>
        <Field label="Button label" faint={textFaint}>
          <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })}
            placeholder="Shop Now" isDark={isDark} />
        </Field>
        <Field label="Button link" faint={textFaint}>
          <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })}
            placeholder="/products" isDark={isDark} pages={pages} collections={collections} categories={categories}/>
        </Field>
        <Field label="Video URL" faint={textFaint}>
          <EditorInput value={section.video_text_url ?? ""}
            onChange={v => onChange({ video_text_url: v })}
            placeholder="https://youtube.com/watch?v=..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>YouTube and Vimeo supported</p>
        </Field>
        <Field label="Desktop — video side" faint={textFaint}>
          <div className="flex gap-2">
            {(["left","right"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  (section.image_position ?? "left") === pos
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                }`}>🖥 Video {pos}</button>
            ))}
          </div>
        </Field>
        <Field label="Mobile — video position" faint={textFaint}>
          <div className="flex gap-2">
            {(["top","bottom"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ mobile_image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  (section.mobile_image_position ?? "top") === pos
                    ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                }`}>📱 Video {pos}</button>
            ))}
          </div>
        </Field>
      </>)}

      {/* ── FEATURED PRODUCT ── */}
      {section.type === "featured_product" && (() => {
        const selectedProduct = products.find(p => p.id === section.featured_product_id) ?? null
        const showTitle  = section.featured_product_show_title  !== false
        const showPrice  = section.featured_product_show_price  !== false
        const showColors = section.featured_product_show_colors !== false
        return (<>
          <Field label="Section label" faint={textFaint}>
            <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
              placeholder="Fan Favourite" isDark={isDark} />
          </Field>
          <Field label="Select product" faint={textFaint}>
            <ProductPickerButton
              products={products}
              selectedProduct={selectedProduct}
              onSelect={p => onChange({ featured_product_id: p.id, cta_url: `/products/${p.handle}` })}
              onClear={() => onChange({ featured_product_id: undefined, cta_url: "" })}
              isDark={isDark}
              textFaint={textFaint}
            />
          </Field>
          <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Product info under image</p>
            <div className="space-y-2">
              {[
                { key: "featured_product_show_title",  label: "Show product title",  val: showTitle  },
                { key: "featured_product_show_price",  label: "Show product price",  val: showPrice  },
                { key: "featured_product_show_colors", label: "Show color variants", val: showColors },
              ].map(({ key, label, val }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative shrink-0" onClick={() => onChange({ [key]: !val })}>
                    <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                  </div>
                  <span className={`text-xs ${textFaint}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Text side content</p>
            <div className="space-y-2">
              <Field label="Heading" faint={textFaint}>
                <EditorInput value={section.featured_product_heading ?? ""}
                  onChange={v => onChange({ featured_product_heading: v })}
                  placeholder="e.g. The one everyone's talking about" isDark={isDark} />
              </Field>
              <Field label="Description / story" faint={textFaint}>
                <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
                  placeholder="Describe why this product is special..." rows={4} isDark={isDark}  pages={pages} collections={collections} categories={categories}/>
              </Field>
            </div>
          </div>
          <Field label="Product image side" faint={textFaint}>
            <div className="flex gap-2">
              {(["left","right"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                    (section.image_position ?? "right") === pos
                      ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"
                  }`}>Image {pos}</button>
              ))}
            </div>
          </Field>
        </>)
      })()}

      {/* ── HEADER ── */}
      {section.type === "header" && (<>
        <StyleSection title="Logo Size" isDark={isDark}>
          <div className="space-y-3">
            <Field label={`Desktop size — ${section.logo_size_desktop ?? 36}px`} faint={textFaint}>
              <input type="range" min={20} max={80} step={2}
                value={section.logo_size_desktop ?? 36}
                onChange={e => onChange({ logo_size_desktop: Number(e.target.value) })}
                className="w-full accent-orange-500" />
            </Field>
            <Field label={`Mobile size — ${section.logo_size_mobile ?? 28}px`} faint={textFaint}>
              <input type="range" min={16} max={46} step={2}
                value={section.logo_size_mobile ?? 28}
                onChange={e => onChange({ logo_size_mobile: Number(e.target.value) })}
                className="w-full accent-orange-500" />
            </Field>
            {storeLogo && (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                <img src={storeLogo} alt="logo preview"
                  style={{ height: section.logo_size_desktop ?? 36 }}
                  className="object-contain w-auto" />
                <span className={`text-[10px] ${textFaint}`}>Desktop preview</span>
              </div>
            )}
          </div>
        </StyleSection>
        <NavItemsEditor
          label="Header navigation"
          items={section.nav_items ?? []}
          onChange={items => onChange({ nav_items: items })}
          isDark={isDark}
          pages={pages}
          textFaint={textFaint}
          textPrimary={textPrimary}
          collections={collections}
          categories={categories}
          products={products}
        />
      </>)}

      {/* ── FOOTER ── */}
      {section.type === "footer" && (<>
        <StyleSection title="Footer Logo Size" isDark={isDark}>
          <div className="space-y-3">
            <Field label={`Desktop — ${section.footer_logo_size_desktop ?? 36}px`} faint={textFaint}>
              <input type="range" min={20} max={120} step={2}
                value={section.footer_logo_size_desktop ?? 36}
                onChange={e => onChange({ footer_logo_size_desktop: Number(e.target.value) })}
                className="w-full accent-orange-500" />
            </Field>
            <Field label={`Mobile — ${section.footer_logo_size_mobile ?? 28}px`} faint={textFaint}>
              <input type="range" min={16} max={80} step={2}
                value={section.footer_logo_size_mobile ?? 28}
                onChange={e => onChange({ footer_logo_size_mobile: Number(e.target.value) })}
                className="w-full accent-orange-500" />
            </Field>
          </div>
        </StyleSection>
        <FooterColumnsEditor
          columns={section.footer_columns ?? getDefaultFooterColumns(collections, categories, pages)}
          onChange={cols => onChange({ footer_columns: cols })}
          columnsPerRow={section.footer_columns_per_row ?? 4}
          onColumnsPerRowChange={n => onChange({ footer_columns_per_row: n })}
          columnsPerRowMobile={section.footer_columns_per_row_mobile ?? 2}
          onColumnsPerRowMobileChange={n => onChange({ footer_columns_per_row_mobile: n })}
          isDark={isDark}
          pages={pages}
          textFaint={textFaint}
          textPrimary={textPrimary}
          collections={collections}
          categories={categories}
        />
      </>)}

      {/* ── CATEGORY GRID ── */}
      {(section.type === "category_grid" || section.type === "collections_grid" || section.type === "category_products" || section.type === "collection_products") && (<>
        <Field label="Page heading" faint={textFaint}>
          <EditorInput value={section.title ?? ""}
            onChange={v => onChange({ title: v })}
            placeholder={
              section.type === "category_grid" ? "Categories" :
              section.type === "collections_grid" ? "Collections" : "Products"
            }
            isDark={isDark} />
        </Field>
        <Field label="Columns" faint={textFaint}>
          <div className="grid grid-cols-4 gap-1">
            {([2,3,4,5] as const).map(n => (
              <button key={n} onClick={() => onChange({ columns: n })}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  (section.columns ?? (section.type === "category_grid" ? 4 : 3)) === n
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{n}</button>
            ))}
          </div>
        </Field>

        {(section.type === "collection_products" || section.type === "category_products") && (
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative" onClick={() => onChange({ show_product_count: !(section.show_product_count ?? true) })}>
              <div className={`w-8 h-4 rounded-full transition-colors ${section.show_product_count !== false ? "bg-orange-500" : "bg-gray-600"}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_product_count !== false ? "translate-x-4" : ""}`} />
            </div>
            <span className={`text-xs ${textPrimary}`}>Show product count</span>
          </label>
        )}
        
        {/* ── Filter settings for category/collection detail pages ── */}
        {(section.type === "category_products" || section.type === "collection_products") && (<>
          <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Filter sidebar</p>
            <div className="space-y-2">
              {[{ key: "show_filters", label: "Show filters", def: true }].map(({ key, label, def }) => {
                const val = (section as any)[key] !== undefined ? (section as any)[key] : def
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div className="relative shrink-0"
                      onClick={() => onChange({ [key]: !val } as any)}>
                      <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                    </div>
                    <span className={`text-xs ${textPrimary}`}>{label}</span>
                  </label>
                )
              })}

              {(section as any).show_filters !== false && (
                <div className="space-y-2 pl-2 border-l-2 border-orange-500/20 ml-1">
                  {[
                    { key: "show_sort",          label: "Show sort dropdown", def: true },
                    { key: "show_price_filter",  label: "Show price filter",  def: true },
                    ...(section.type !== "category_products"   ? [{ key: "show_category_filter",   label: "Show category filter",   def: true }] : []),
                    ...(section.type !== "collection_products" ? [{ key: "show_collection_filter", label: "Show collection filter", def: true }] : []),
                  ].map(({ key, label, def }) => {
                    const val = (section as any)[key] !== undefined ? (section as any)[key] : def
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative shrink-0"
                          onClick={() => onChange({ [key]: !val } as any)}>
                          <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                        </div>
                        <span className={`text-xs ${textPrimary}`}>{label}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <Field label="Filter order" faint={textFaint}>
            <p className={`text-[10px] mb-2 ${textFaint} opacity-70`}>Use arrows to reorder.</p>
            <div className="space-y-1.5">
              {((section as any).filter_order ?? (
                  section.type === "category_products"
                    ? ["sort","price","collection"]
                    : ["sort","price","category"]
                )).filter((id: string) =>
                  section.type === "category_products" ? id !== "category" :
                  section.type === "collection_products" ? id !== "collection" : true
                ).map((id: string, i: number, arr: string[]) => {
                const labels: Record<string,string> = {
                  sort: "Sort", price: "Price Range",
                  category: "Categories", collection: "Collections"
                }
                return (
                  <div key={id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
                    isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                  }`}>
                    <GripVertical className={`w-3.5 h-3.5 shrink-0 ${textFaint}`} />
                    <span className={`flex-1 text-xs ${textPrimary}`}>{labels[id] ?? id}</span>
                    <button disabled={i === 0} onClick={() => {
                      const newArr = [...arr]
                      ;[newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]]
                      onChange({ filter_order: newArr } as any)
                    }} className={`p-0.5 rounded ${i === 0 ? "opacity-30" : ""}`}>
                      <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                    </button>
                    <button disabled={i === arr.length - 1} onClick={() => {
                      const newArr = [...arr]
                      ;[newArr[i], newArr[i+1]] = [newArr[i+1], newArr[i]]
                      onChange({ filter_order: newArr } as any)
                    }} className={`p-0.5 rounded ${i === arr.length - 1 ? "opacity-30" : ""}`}>
                      <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </Field>
        </>)}
        <ColorOverride section={section} onChange={onChange} isDark={isDark} textFaint={textFaint} />
      </>)}

      {/* ── SECTION COLORS OVERRIDE (for all other types) ── */}
      {!SKIP_COLOR_OVERRIDE.includes(section.type) && (
        <ColorOverride section={section} onChange={onChange} isDark={isDark} textFaint={textFaint} />
      )}
    </div>
  )
}
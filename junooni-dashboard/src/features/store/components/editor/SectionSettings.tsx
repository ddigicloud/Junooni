import { useState, useRef } from "react"
import {
  Plus, X, Trash2, Loader2, ChevronUp, ChevronDown,
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

export function ProductDetailSettings({ settings, onChange, isDark }: {
  settings: any
  onChange: (patch: any) => void
  isDark: boolean
}) {
  const textFaint   = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white"    : "text-gray-900"
  const hoverBg     = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"

  const defaultOrder = ["title", "price", "colors", "sizes", "quantity", "atc", "description", "meta"]
  const order = settings.element_order ?? defaultOrder

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
    colors:      { label: "Color Options",    icon: "🎨" },
    sizes:       { label: "Size Options",     icon: "S"  },
    quantity:    { label: "Quantity Stepper", icon: "#"  },
    atc:         { label: "Add to Cart",      icon: "🛒" },
    description: { label: "Description",      icon: "📝" },
    meta:        { label: "Secure Badge",     icon: "🔒" },
  }

  return (
    <div className="space-y-4">

      {/* Element order */}
      <StyleSection title="Element Order" isDark={isDark}>
        <p className={`text-[10px] ${textFaint} mb-2 opacity-70`}>
          Drag or use arrows to reorder product page elements.
        </p>
        <div className="space-y-1.5">
          {order.map((key: string, i: number) => {
            const meta = ELEMENT_META[key]
            if (!meta) return null
            return (
              <div key={key} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
                isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
              }`}>
                <GripVertical className={`w-3 h-3 shrink-0 ${textFaint}`} />
                <span className="w-5 text-sm text-center">{meta.icon}</span>
                <span className={`flex-1 text-xs font-medium ${textPrimary}`}>{meta.label}</span>
                <button onClick={() => moveElement(key, "up")} disabled={i === 0}
                  className={`p-0.5 rounded ${i === 0 ? "opacity-30" : hoverBg}`}>
                  <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                </button>
                <button onClick={() => moveElement(key, "down")} disabled={i === order.length - 1}
                  className={`p-0.5 rounded ${i === order.length - 1 ? "opacity-30" : hoverBg}`}>
                  <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                </button>
              </div>
            )
          })}
        </div>
      </StyleSection>

      {/* Title settings */}
      <StyleSection title="Product Title" isDark={isDark}>
        <div className="space-y-2.5">
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
            <div className="grid grid-cols-4 gap-1">
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
      </StyleSection>

      {/* Price settings */}
      <StyleSection title="Price" isDark={isDark}>
        <div className="space-y-2.5">
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
      </StyleSection>

      {/* Color swatches */}
      <StyleSection title="Color Options" isDark={isDark}>
        <div className="space-y-2.5">
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
        </div>
      </StyleSection>

      {/* Size options */}
      <StyleSection title="Size Options" isDark={isDark}>
        <div className="space-y-2.5">
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
        </div>
      </StyleSection>

      {/* Add to Cart */}
      <StyleSection title="Add to Cart Button" isDark={isDark}>
        <div className="space-y-2.5">
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
        </div>
      </StyleSection>

      {/* Visibility toggles */}
      <StyleSection title="Show / Hide Elements" isDark={isDark}>
        <div className="space-y-2">
          {[
            { key: "show_quantity",         label: "Quantity stepper",              def: true  },
            { key: "show_description",       label: "Description",                  def: true  },
            { key: "description_collapsed",  label: "Description collapsed by default", def: false },
            { key: "show_secure_badge",      label: "Secure checkout badge",        def: true  },
          ].map(({ key, label, def }) => {
            const val = settings[key] !== undefined ? settings[key] : def
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div className="relative shrink-0" onClick={() => onChange({ [key]: !val })}>
                  <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                </div>
                <span className={`text-xs ${textPrimary}`}>{label}</span>
              </label>
            )
          })}
        </div>
      </StyleSection>

      {/* Secure badge text */}
      {(settings.show_secure_badge ?? true) && (
        <StyleSection title="Secure Badge Text" isDark={isDark}>
          <EditorInput
            value={settings.secure_badge_text ?? "Secure checkout via Junooni"}
            onChange={v => onChange({ secure_badge_text: v })}
            placeholder="Secure checkout via Junooni"
            isDark={isDark}
          />
        </StyleSection>
      )}
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
  vendorHandle = "", currentLayoutKey = "home", storeLogo = "",
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
    "category_grid", "category_products", "collections_grid", "collection_products"
  ]

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async e => {
          if (!e.target.files?.[0]) return
          setUploadingKey(uploadTarget)
          const url = await uploadFile(e.target.files[0])
          if (url) onChange({ [uploadTarget]: url })
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
            placeholder="/products" isDark={isDark} pages={pages} />
        </Field>
        <Field label="Secondary CTA" faint={textFaint}>
          <EditorInput value={section.cta_secondary_label ?? ""}
            onChange={v => onChange({ cta_secondary_label: v })} placeholder="Browse all" isDark={isDark} />
        </Field>
        <Field label="Secondary link" faint={textFaint}>
          <LinkInput value={section.cta_secondary_url ?? ""}
            onChange={v => onChange({ cta_secondary_url: v })} placeholder="/products" isDark={isDark} pages={pages} />
        </Field>
        <UploadOnlyImageField label="Background image" value={section.background_image ?? ""}
          onChange={v => onChange({ background_image: v || undefined })}
          onUpload={() => triggerUpload("background_image")}
          isUploading={uploadingKey === "background_image"} isDark={isDark} />
        <UploadOnlyImageField label="Right side image" value={(section as any).hero_image_right ?? ""}
          onChange={v => onChange({ hero_image_right: v || undefined } as any)}
          onUpload={() => triggerUpload("hero_image_right")}
          isUploading={uploadingKey === "hero_image_right"} isDark={isDark} previewHeight={120} />
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
        {section.title && (
          <div className="px-3 py-2 text-xs font-medium text-center rounded-lg"
            style={{ background: section.background_color ?? "#e65100", color: section.text_color ?? "#ffffff" }}
            dangerouslySetInnerHTML={{ __html: section.title }} />
        )}
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
              placeholder={"prod_01...\nprod_02..."} rows={3} isDark={isDark} />
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
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_sold_out: !section.show_sold_out })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_sold_out !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_sold_out !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show sold-out products</span>
        </label>
      </>)}

      {/* ── ABOUT ── */}
      {section.type === "about" && (<>
        <Field label="Title" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="About Me" isDark={isDark} />
        </Field>
        <Field label="Content" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Share your story..." rows={6} isDark={isDark} />
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
            placeholder="Write your content..." rows={10} isDark={isDark} />
        </Field>
      )}

      {/* ── IMAGE ── */}
      {section.type === "image" && (
        <UploadOnlyImageField label="Image" value={section.image ?? ""}
          onChange={v => onChange({ image: v || undefined })}
          onUpload={() => triggerUpload("image")}
          isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={140} />
      )}

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
                placeholder="https://... or /path" isDark={isDark} pages={pages} />
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
            rows={12} isDark={isDark} mono />
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
            rows={5} isDark={isDark} />
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
        {(section.ticker_items ?? []).length > 0 && (
          <div className="px-3 py-2 overflow-hidden text-xs font-medium rounded-lg"
            style={{ background: section.background_color ?? "#111827", color: section.text_color ?? "#ffffff" }}>
            {(section.ticker_items ?? []).join(` ${section.ticker_separator ?? "✦"} `)}
          </div>
        )}
      </>)}

      {/* ── IMAGE WITH TEXT ── */}
      {section.type === "image_text" && (<>
        <Field label="Heading" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })}
            placeholder="Our Story" isDark={isDark} />
        </Field>
        <Field label="Body text" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })}
            placeholder="Share something meaningful..." rows={5} isDark={isDark} />
        </Field>
        <Field label="Button label" faint={textFaint}>
          <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })}
            placeholder="Learn More" isDark={isDark} />
        </Field>
        <Field label="Button link" faint={textFaint}>
          <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })}
            placeholder="/products" isDark={isDark} pages={pages} />
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
            placeholder="Tell your audience what this video is about..." rows={4} isDark={isDark} />
        </Field>
        <Field label="Button label" faint={textFaint}>
          <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })}
            placeholder="Shop Now" isDark={isDark} />
        </Field>
        <Field label="Button link" faint={textFaint}>
          <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })}
            placeholder="/products" isDark={isDark} pages={pages} />
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
                  placeholder="Describe why this product is special..." rows={4} isDark={isDark} />
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
        <ColorOverride section={section} onChange={onChange} isDark={isDark} textFaint={textFaint} />
      </>)}

      {/* ── SECTION COLORS OVERRIDE (for all other types) ── */}
      {!SKIP_COLOR_OVERRIDE.includes(section.type) && (
        <ColorOverride section={section} onChange={onChange} isDark={isDark} textFaint={textFaint} />
      )}
    </div>
  )
}
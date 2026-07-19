import React, { useState, useCallback, useEffect } from "react"
import {
  GripVertical, Plus, Trash2, ChevronUp, ChevronDown, X, ChevronLeft,
  Eye, EyeOff, Copy, Menu, Layout, Megaphone, ShoppingBag,
  Check, Upload, Loader2, Image as ImageIcon, Globe, AlignLeft,
  AlignCenter, Moon, Sun, Pencil, PanelLeftClose
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { createPortal } from "react-dom"
import type {
  EditorTab, SectionType, StoreSection, StorePage,
  VendorStore, PageTemplate, FooterColumn, NavItem
} from "./types"
import {
  SECTION_CATEGORIES, PAGE_LAYOUT_META,
  PAGE_ALLOWED_SECTIONS, FONTS, TEMPLATES, PAGE_TEMPLATES,
} from "./constants"
import { SectionSettings, ProductDetailSettings } from "./SectionSettings"
import { SECTION_BLOCKS as SECTION_BLOCKS_WITH_ICONS } from "./sectionBlocks"
import { genId, getLayoutKeyForPath, getPageSections, setPageSections, getDefaultFooterColumns } from "./helpers"
import { StyleSection, Field, EditorInput, EditorTextarea, UploadOnlyImageField } from "./ui"
import { PageEditorPanel } from "./PageEditorPanel"
import boldpreview from "@/assets/bold-preview.jpeg"
import minimalpreview from "@/assets/minimal-preview.jpeg"
import editorialpreview from "@/assets/editorial-preview.jpeg"

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeftPanelProps {
  // tabs
  activeTab: EditorTab
  setActiveTab: (t: EditorTab) => void
  // theme
  isDark: boolean
  store: VendorStore
  panelBg: string
  panelBorder: string
  textPrimary: string
  textMuted: string
  textFaint: string
  hoverBg: string
  inputCls: string
  // sections
  sections: StoreSection[]
  bodySections: StoreSection[]
  headerSections: StoreSection[]
  footerSections: StoreSection[]
  homeSections: StoreSection[]
  bodySectionPickerOpen: boolean
  setBodySectionPickerOpen: (v: boolean) => void
  updateSection: (id: string, patch: Partial<StoreSection>) => void
  store_product_detail?: any
  // selection
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  // drag
  isDragging: string | null
  setIsDragging: (id: string | null) => void
  dragOver: number | null
  setDragOver: (i: number | null) => void
  // add section
  addSectionOpen: boolean
  setAddSectionOpen: (v: boolean) => void
  addSectionFilter: string
  setAddSectionFilter: (v: string) => void
  insertAtIndex: number | null
  setInsertAtIndex: (i: number | null) => void
  // layout
  currentLayoutKey: string
  currentLayoutMeta: typeof PAGE_LAYOUT_META[string]
  // data
  pages: StorePage[]
  vendorCollections: { id: string; title: string; handle: string }[]
  vendorCategories: { id: string; name: string; handle: string; product_count: number }[]
  vendorProducts: { id: string; title: string; handle: string; thumbnail?: string }[]
  vendorHandle: string
  storeLogo?: string
  storeFavicon?: string
  storeStatus?: string
  storeSubdomain?: string
  storeTemplate?: string
  storeFont?: string
  storePrimaryColor?: string
  storeSecondaryColor?: string
  storeCustomDomain?: string
  storeSeoTitle?: string
  storeSeoDescription?: string
  storeOgImage?: string
  storeProductCard?: any
  storeStickyHeader?: boolean
  storeStickyAnnouncement?: boolean
  storeInstagram?: string
  storeYoutube?: string
  storeTwitter?: string
  storeFacebook?: string
  storeCustomCss?: string
  storeDomainVerified?: boolean
  storeTagline?: string
  storeHeroImage?: string
  // uploads
  isUploadingLogo: boolean
  isUploadingFav: boolean
  isUploadingOg: boolean
  setIsUploadingLogo: (v: boolean) => void
  setIsUploadingFav: (v: boolean) => void
  setIsUploadingOg: (v: boolean) => void
  fileLogoRef: React.RefObject<HTMLInputElement>
  fileFavRef: React.RefObject<HTMLInputElement>
  fileOgRef: React.RefObject<HTMLInputElement>
  uploadFile: (file: File) => Promise<string | null>
  setStore: React.Dispatch<React.SetStateAction<VendorStore>>
  // section actions
  patchStore: (updater: (p: VendorStore) => VendorStore) => void
  addSection: (type: SectionType, explicitInsertIndex?: number | null) => void
  removeSection: (id: string) => void
  duplicateSection: (id: string) => void
  toggleSection: (id: string) => void
  moveSection: (id: string, dir: "up" | "down") => void
  handleDragStart: (id: string) => void
  handleDragOver: (e: React.DragEvent, idx: number) => void
  handleDrop: (e: React.DragEvent, toId: string) => void
  handleBodyDrop: (e: React.DragEvent) => void
  handleBodyDragOver: (e: React.DragEvent) => void
  // panels
  setRightPanelOpen: (v: boolean) => void
  setLeftPanelOpen: (v: boolean) => void
  setHeaderPickerOpen: (v: boolean) => void
  // pages
  editingPage: StorePage | null
  setEditingPage: (p: StorePage | null) => void
  savePage: (p: StorePage) => void
  deletePage: (id: string) => void
  startNewPage: (t: PageTemplate) => void
  // misc
  previewPagePath: string
  hasStore: boolean
  token: string
  backendUrl: string
  triggerDrillId?: string | null
  switchTheme: (templateId: string) => void
}

// ─── LeftPanel ────────────────────────────────────────────────────────────────

function CheckoutSettingsPanel({
  settings, onChange, isDark, textFaint, textPrimary, inputCls,
}: {
  settings: any
  onChange: (patch: any) => void
  isDark: boolean
  textFaint: string
  textPrimary: string
  inputCls: string
}) {
  const logoPosition  = settings.logo_position ?? "center"
  const logoSize      = settings.logo_size ?? "medium"
  const showBackLink  = settings.show_back_link !== false
  const showTrustNote = settings.show_trust_note !== false
  const isLogoLeft    = logoPosition === "left"

  return (
    <div className="space-y-4">
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1.5`}>Logo position</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["left", "center"] as const).map(pos => (
            <button key={pos} onClick={() => onChange({ logo_position: pos })}
              className={`py-2 rounded-lg border text-[11px] capitalize transition-all ${
                logoPosition === pos
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={`text-[10px] ${textFaint} block mb-1.5`}>Logo size</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(["small", "medium", "large"] as const).map(size => (
            <button key={size} onClick={() => onChange({ logo_size: size })}
              className={`py-2 rounded-lg border text-[11px] capitalize transition-all ${
                logoSize === size
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
        isLogoLeft
          ? `cursor-not-allowed opacity-50 ${isDark ? "border-gray-700" : "border-gray-200"}`
          : `cursor-pointer ${showBackLink ? "border-orange-500/40 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`
      }`}>
        <div
          className="relative mt-0.5 shrink-0"
          onClick={() => { if (!isLogoLeft) onChange({ show_back_link: !showBackLink }) }}
        >
          <div className={`w-8 h-4 rounded-full transition-colors ${
            isLogoLeft ? "bg-gray-400" : showBackLink ? "bg-orange-500" : "bg-gray-600"
          }`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
            !isLogoLeft && showBackLink ? "translate-x-4" : ""
          }`} />
        </div>
        <div>
          <p className={`text-xs font-medium ${textPrimary}`}>Show "Back to store" text</p>
          <p className={`text-[10px] mt-0.5 ${textFaint}`}>
            {isLogoLeft ? "Not needed — the logo already links back when positioned left" : "The back arrow always stays — this only toggles the label next to it"}
          </p>
        </div>
      </label>

      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Banner message</label>
        <p className={`text-[10px] ${textFaint} opacity-70 mb-1.5`}>Shown above the step indicator. Leave blank to hide.</p>
        <EditorInput
          value={settings.banner_text ?? ""}
          onChange={(v: string) => onChange({ banner_text: v })}
          placeholder="You're almost there! Free shipping on all orders 🎉"
          isDark={isDark}
        />
      </div>

      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Accent color</label>
        <p className={`text-[10px] ${textFaint} opacity-70 mb-1.5`}>Used for the step indicator and pay button. Defaults to your store's primary color.</p>
        <div className="flex items-center gap-2">
          <input type="color"
            value={settings.accent_color || "#e65100"}
            onChange={e => onChange({ accent_color: e.target.value })}
            className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
          <input type="text"
            value={settings.accent_color ?? ""}
            onChange={e => onChange({ accent_color: e.target.value })}
            placeholder="Store primary color"
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${inputCls}`} />
        </div>
      </div>

      <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
        showTrustNote ? "border-orange-500/40 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`
      }`}>
        <div className="relative mt-0.5 shrink-0" onClick={() => onChange({ show_trust_note: !showTrustNote })}>
          <div className={`w-8 h-4 rounded-full transition-colors ${showTrustNote ? "bg-orange-500" : "bg-gray-600"}`} />
          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${showTrustNote ? "translate-x-4" : ""}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-medium ${textPrimary}`}>Show trust note</p>
          <p className={`text-[10px] mt-0.5 ${textFaint}`}>Small reassurance line below the order summary</p>
        </div>
      </label>

      {showTrustNote && (
        <EditorInput
          value={settings.trust_note ?? ""}
          onChange={(v: string) => onChange({ trust_note: v })}
          placeholder="🔒 Secure checkout · SSL encrypted"
          isDark={isDark}
        />
      )}
    </div>
  )
}

export const LeftPanel = React.memo(function LeftPanel(props: LeftPanelProps) {
  const {
    activeTab, setActiveTab, isDark, panelBg, panelBorder,  updateSection, store_product_detail,
    textPrimary, textMuted, textFaint, hoverBg, inputCls, bodySectionPickerOpen, setBodySectionPickerOpen,
    sections, bodySections, headerSections, footerSections, homeSections,
    selectedId, setSelectedId, isDragging, setIsDragging, dragOver, setDragOver,
    addSectionOpen, setAddSectionOpen, addSectionFilter, setAddSectionFilter,
    insertAtIndex, setInsertAtIndex, currentLayoutKey, currentLayoutMeta,
    pages, vendorCollections, vendorCategories, vendorProducts, vendorHandle,
    // individual store fields instead of whole store object
    storeLogo,storeFavicon, storeStatus, storeSubdomain, storeTemplate, storeFont,
    storePrimaryColor, storeSecondaryColor, storeCustomDomain,
    storeSeoTitle, storeSeoDescription, storeOgImage, storeProductCard,
    storeStickyHeader, storeStickyAnnouncement,
    storeInstagram, storeYoutube, storeTwitter, storeFacebook,
    storeCustomCss, storeDomainVerified, storeTagline, storeHeroImage,
    isUploadingLogo, isUploadingFav, isUploadingOg,
    setIsUploadingLogo, setIsUploadingFav, setIsUploadingOg,
    fileLogoRef, fileFavRef, fileOgRef, uploadFile, setStore, patchStore,
    addSection, removeSection, duplicateSection, toggleSection, moveSection,
    handleDragStart, handleDragOver, handleDrop, handleBodyDrop, handleBodyDragOver,
    setRightPanelOpen, setLeftPanelOpen, setHeaderPickerOpen,
    editingPage, setEditingPage, savePage, deletePage, startNewPage,
    previewPagePath, hasStore, token, backendUrl, triggerDrillId, store, switchTheme,
  } = props

    const [drillSection, setDrillSection] = useState<StoreSection | null>(null)
    const [drillVirtual, setDrillVirtual] = useState<string | null>(null)
    const [localDragging, setLocalDragging] = useState(false)
    const draggingIdRef = React.useRef<string | null>(null)
    // Replace the existing dragOverId state + ref with this:
    const [dragOverId, setDragOverIdState] = useState<string | null>(null)
    const dragOverIdRef = React.useRef<string | null>(null)
    const setDragOverId = (id: string | null) => {
    dragOverIdRef.current = id
    setDragOverIdState(id)
    }
    
    const pendingInsertRef = React.useRef<number | null>(null)
    const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null)
    // const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
    const [draggedHeight, setDraggedHeight] = useState(44)
    // const [dropTargetId, setDropTargetId] = useState<string | null>(null)
    // const [dropPosition, setDropPosition] = useState<"before" | "after">("after")
    // const dropTargetRef = React.useRef<{ id: string | null; pos: "before" | "after" }>({ id: null, pos: "after" })

    // useEffect(() => {
    // if (!isDragging) return

    // const onDrag = (e: DragEvent) => {
    //     if (e.clientX === 0 && e.clientY === 0) return
    //     setDragPos({ x: e.clientX, y: e.clientY })
    // }

    // const cleanup = () => {
    //     setIsDragging(null)
    //     setPlaceholderIndex(null)
    //     setDragOver(null)
    //     setDragPos({ x: 0, y: 0 })
    // }

    // window.addEventListener("drag", onDrag)
    // window.addEventListener("dragend", cleanup)
    // window.addEventListener("mouseup", cleanup)   // ← catches drop outside any dropzone

    // return () => {
    //     window.removeEventListener("drag", onDrag)
    //     window.removeEventListener("dragend", cleanup)
    //     window.removeEventListener("mouseup", cleanup)
    // }
    // }, [isDragging])

  useEffect(() => {
    if (!triggerDrillId) return
    // Handle virtual section IDs
    const virtualIds = [
      "__product_detail__",
      "__checkout_settings__",
      "__category_grid__",
      "__category_products__",
      "__collections_grid__",
      "__collection_products__",
      "__page_content__",
    ]
    if (virtualIds.includes(triggerDrillId)) {
      setDrillVirtual(triggerDrillId)
      setDrillSection(null)
      return
    }
    // Handle real sections
    const sec = homeSections.find(s => s.id === triggerDrillId)
      ?? sections.find(s => s.id === triggerDrillId)
    if (sec) {
      setDrillSection(sec)
      setDrillVirtual(null)
    }
  }, [triggerDrillId])

    // ── Global dragend cleanup ────────────────────────────────────────────────
    useEffect(() => {
        const cleanup = () => {
            requestAnimationFrame(() => {
            setIsDragging(null)
            setDragOver(null)
            setDragOverId(null)
            setSelectedId(null)
            })
        }
        window.addEventListener("dragend", cleanup)
        return () => window.removeEventListener("dragend", cleanup)
    }, [])

  // NEW — close drill panel on page switch
    const prevLayoutKeyRef = React.useRef(currentLayoutKey)
    useEffect(() => {
    if (prevLayoutKeyRef.current !== currentLayoutKey) {
        setDrillSection(null)
        setDrillVirtual(null)
        setSelectedId(null)
        prevLayoutKeyRef.current = currentLayoutKey
    }
    }, [currentLayoutKey])

  // ── paste everything from LeftPanelContent here ───────────────────────────
   if (drillSection || drillVirtual) {
    const sectionLabel =
      drillVirtual === "__checkout_settings__"   ? "Checkout Settings"   :
      drillVirtual === "__product_detail__"      ? "Product Detail"      :
      drillVirtual === "__category_grid__"       ? "Category Grid"       :
      drillVirtual === "__category_products__"   ? "Category Products"   :
      drillVirtual === "__collections_grid__"    ? "Collections Grid"    :
      drillVirtual === "__collection_products__" ? "Collection Products" :
      drillSection?.type === "header"            ? "Store Header"        :
      drillSection?.type === "footer"            ? "Store Footer"        :
      SECTION_BLOCKS_WITH_ICONS.find(b => b.type === drillSection?.type)?.label ?? drillSection?.type ?? ""

    const sectionColor = SECTION_BLOCKS_WITH_ICONS.find(b => b.type === drillSection?.type)?.color ?? "#666"
    const sectionIcon  = SECTION_BLOCKS_WITH_ICONS.find(b => b.type === drillSection?.type)?.icon

    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ width: '300px' }}>
        {/* ── Drill-in header ── */}
        {drillVirtual !== "__page_content__" && (
        <div className={`flex items-center gap-2 px-3 py-2.5 border-b shrink-0 ${panelBorder}`}>
            <button
            onClick={() => { setDrillSection(null); setDrillVirtual(null) }}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
            <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center flex-1 min-w-0 gap-2">
            {sectionIcon && (
                <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0"
                style={{ background: `${sectionColor}20`, color: sectionColor }}>
                {sectionIcon}
                </div>
            )}
            <span className={`text-sm font-semibold truncate ${textPrimary}`}>{sectionLabel}</span>
            </div>
            {drillSection && !["header","footer"].includes(drillSection.type) && (
            <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => {
                toggleSection(drillSection.id)
                setDrillSection(s => s ? { ...s, hidden: !s.hidden } : s)
                }}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                title={drillSection.hidden ? "Show" : "Hide"}>
                {drillSection.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { duplicateSection(drillSection.id); setDrillSection(null) }}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                title="Duplicate">
                <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { removeSection(drillSection.id); setDrillSection(null); setDrillVirtual(null) }}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-900/30 text-red-400"
                title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            )}
        </div>
        )}

        {/* ── Drill-in body ── */}
        <div className="flex-1 px-3 py-3 overflow-y-auto overscroll-contain custom-scrollbar">
          {drillVirtual === "__checkout_settings__" ? (
            <CheckoutSettingsPanel
                settings={store.checkout_settings ?? {}}
                onChange={patch => patchStore(p => ({ ...p, checkout_settings: { ...(p.checkout_settings ?? {}), ...patch } }))}
                isDark={isDark}
                textFaint={textFaint}
                textPrimary={textPrimary}
                inputCls={inputCls}
            />
            ) : drillVirtual === "__product_detail__" ? (
            <ProductDetailSettings
                settings={store_product_detail ?? {}}
                onChange={patch => patchStore(p => ({ ...p, product_detail: { ...(p.product_detail ?? {}), ...patch } }))}
                isDark={isDark}
                products={vendorProducts}
                previewProductHandle={previewPagePath.replace("/products/", "")}
            />
            ) : drillVirtual === "__category_grid__" ? (
            <SectionSettings
                section={(() => {
                const existing = getPageSections(store, "categories")
                return existing.find((s: any) => s.id === "__category_grid__")
                    ?? { id: "__category_grid__", type: "category_grid" as SectionType, title: "Categories", columns: 4 }
                })()}
                onChange={patch => {
                patchStore(p => {
                    const existing = getPageSections(p, "categories")
                    const updated = existing.find((s: any) => s.id === "__category_grid__")
                    ? existing.map((s: any) => s.id === "__category_grid__" ? { ...s, ...patch } : s)
                    : [{ id: "__category_grid__", type: "category_grid", ...patch }, ...existing]
                    return setPageSections(p, "categories", updated)
                })
                }}
                token={token} backendUrl={backendUrl} isDark={isDark}
                collections={vendorCollections} categories={vendorCategories}
                pages={pages} storeLogo={storeLogo ?? ""}
                products={vendorProducts} vendorHandle={vendorHandle}
                currentLayoutKey="categories"
            />
            ) : drillVirtual === "__collections_grid__" ? (
            <SectionSettings
                section={(() => {
                const existing = getPageSections(store, "collections")
                return existing.find((s: any) => s.id === "__collections_grid__")
                    ?? { id: "__collections_grid__", type: "collections_grid" as SectionType, title: "Collections", columns: 3 }
                })()}
                onChange={patch => {
                patchStore(p => {
                    const existing = getPageSections(p, "collections")
                    const updated = existing.find((s: any) => s.id === "__collections_grid__")
                    ? existing.map((s: any) => s.id === "__collections_grid__" ? { ...s, ...patch } : s)
                    : [{ id: "__collections_grid__", type: "collections_grid", ...patch }, ...existing]
                    return setPageSections(p, "collections", updated)
                })
                }}
                token={token} backendUrl={backendUrl} isDark={isDark}
                collections={vendorCollections} categories={vendorCategories}
                pages={pages} storeLogo={storeLogo ?? ""}
                products={vendorProducts} vendorHandle={vendorHandle}
                currentLayoutKey="collections"
            />
            ) : drillVirtual === "__category_products__" ? (
            <SectionSettings
                section={(() => {
                const existing = getPageSections(store, "category")
                return existing.find((s: any) => s.id === "__category_products__")
                    ?? { id: "__category_products__", type: "category_products" as SectionType, title: "Products", columns: 3 }
                })()}
                onChange={patch => {
                patchStore(p => {
                    const existing = getPageSections(p, "category")
                    const updated = existing.find((s: any) => s.id === "__category_products__")
                    ? existing.map((s: any) => s.id === "__category_products__" ? { ...s, ...patch } : s)
                    : [...existing, { id: "__category_products__", type: "category_products", ...patch }]
                    return setPageSections(p, "category", updated)
                })
                }}
                token={token} backendUrl={backendUrl} isDark={isDark}
                collections={vendorCollections} categories={vendorCategories}
                pages={pages} storeLogo={storeLogo ?? ""}
                products={vendorProducts} vendorHandle={vendorHandle}
                currentLayoutKey="category"
            />
            ) : drillVirtual === "__collection_products__" ? (
            <SectionSettings
                section={(() => {
                const existing = getPageSections(store, "collection")
                return existing.find((s: any) => s.id === "__collection_products__")
                    ?? { id: "__collection_products__", type: "collection_products" as SectionType, title: "Products", columns: 3 }
                })()}
                onChange={patch => {
                patchStore(p => {
                    const existing = getPageSections(p, "collection")
                    const updated = existing.find((s: any) => s.id === "__collection_products__")
                    ? existing.map((s: any) => s.id === "__collection_products__" ? { ...s, ...patch } : s)
                    : [...existing, { id: "__collection_products__", type: "collection_products", ...patch }]
                    return setPageSections(p, "collection", updated)
                })
                }}
                token={token} backendUrl={backendUrl} isDark={isDark}
                collections={vendorCollections} categories={vendorCategories}
                pages={pages} storeLogo={storeLogo ?? ""}
                products={vendorProducts} vendorHandle={vendorHandle}
                currentLayoutKey="collection"
            />
            ) : drillVirtual === "__page_content__" ? (
            (() => {
                const pageSlug = currentLayoutKey.replace("page_", "")
                const currentPage = pages.find(p => p.slug === pageSlug)
                if (!currentPage) return <p className={`text-xs ${textFaint} p-2`}>Page not found</p>
                return (
                <PageEditorPanel
                    page={currentPage}
                    vendorHandle={vendorHandle}
                    onSave={(updated) => {
                    savePage(updated)
                    setDrillVirtual(null)
                    }}
                    onCancel={() => setDrillVirtual(null)}
                    onDelete={() => {
                    deletePage(currentPage.id)
                    setDrillVirtual(null)
                    }}
                    isNew={false}
                    isDark={isDark}
                    storeTemplate={storeTemplate}
                    onDraftChange={(updated) => {
                    patchStore(p => {
                        const existing = p.pages?.pages ?? []
                        const updatedPages = existing.find(pg => pg.id === updated.id)
                        ? existing.map(pg => pg.id === updated.id ? updated : pg)
                        : [...existing, updated]
                        return { ...p, pages: { pages: updatedPages } }
                    })
                    }}
                />
                )
            })()
            ) : drillSection ? (
            <SectionSettings
              section={drillSection}
              onChange={patch => {
                updateSection(drillSection.id, patch)
                setDrillSection(s => s ? { ...s, ...patch } : s)
              }}
              token={token}
              backendUrl={backendUrl}
              isDark={isDark}
              collections={vendorCollections}
              categories={vendorCategories}
              pages={pages}
              storeLogo={storeLogo ?? ""}
              products={vendorProducts}
              vendorHandle={vendorHandle}
              currentLayoutKey={currentLayoutKey}
              storeTemplate={storeTemplate}
            />
          ) : null}
        </div>

        {/* ── Move up/down footer for real sections ── */}
        {drillSection && !["header","footer"].includes(drillSection.type) && (
          <div className={`border-t ${panelBorder} px-3 py-2 flex gap-1.5 shrink-0`}>
            <button onClick={() => moveSection(drillSection.id, "up")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
                isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              <ChevronUp className="w-3 h-3" />Up
            </button>
            <button onClick={() => moveSection(drillSection.id, "down")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
                isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}>
              <ChevronDown className="w-3 h-3" />Down
            </button>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ width: '300px' }}>
      <div className={`flex shrink-0 border-b ${panelBorder}`}>
        {([
          { id: "layout", label: "Layout" },
          { id: "style",  label: "Style"  },
          { id: "pages",  label: "Pages"  },
          { id: "theme",  label: "Theme"  },
        ] as { id: EditorTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-all border-b-2 ${
              activeTab === t.id
                ? "border-orange-500 text-orange-500"
                : `border-transparent ${textFaint} ${hoverBg}`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">

            {/* ══ LAYOUT TAB ══════════════════════════════════════════════ */}
            {activeTab === "layout" && (() => {
            const headerIdx = homeSections.findIndex(s => s.type === "header")
            const headerSections = sections.filter(s => {
                if (s.type !== "announcement" && s.type !== "ticker") return false
                const sIdx = homeSections.findIndex(h => h.id === s.id)
                return headerIdx === -1 || sIdx < headerIdx
            })
            const footerSections = sections.filter(s => s.type === "footer")
            const layoutBodySections = sections.filter(s => {
              if (["header", "announcement", "ticker", "footer"].includes(s.type)) return false
              if (currentLayoutKey === "product" && s.type === "featured") return false
              return true
            })
            const SectionRow = ({ s, idx }: { s: typeof sections[0], idx: number }) => {
            const block = SECTION_BLOCKS_WITH_ICONS.find(b => b.type === s.type)
            const isSelected = selectedId === s.id
            const isBeingDragged = isDragging === s.id || localDragging
            const isDragOver = dragOverId === s.id

            return (
                <div className="relative">
                {/* Insertion line ABOVE this item */}
                {isDragOver && isDragging && isDragging !== s.id && (
                    <div className="absolute inset-x-0 flex items-center pointer-events-none"
                    style={{ top: "-1px", zIndex: 20 }}>
                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                    <div className="flex-1 h-0.5 bg-orange-500" />
                    </div>
                )}
                <div
                    draggable
                    data-drag-id={s.id}
                   onDragStart={e => {
                    setLocalDragging(true)
                    e.dataTransfer.effectAllowed = "move"
                    const ghost = document.createElement("div")
                    ghost.style.cssText = "position:fixed;top:-999px;left:-999px;opacity:0;width:1px;height:1px;"
                    document.body.appendChild(ghost)
                    e.dataTransfer.setDragImage(ghost, 0, 0)
                    ;(e.currentTarget as any)._dragGhost = ghost
                    requestAnimationFrame(() => {
                        handleDragStart(s.id)
                    })
                    }}
                    onDragEnd={e => {
                    setLocalDragging(false)
                    const ghost = (e.currentTarget as any)._dragGhost
                    if (ghost && document.body.contains(ghost)) {
                        document.body.removeChild(ghost)
                    }
                    ;(e.currentTarget as any)._dragGhost = null
                    requestAnimationFrame(() => {
                        setIsDragging(null)
                        setDragOver(null)
                        setDragOverId(null)
                        setSelectedId(null)
                    })
                    }}
                    // onDrop={e => {
                    // e.preventDefault()
                    // e.stopPropagation()
                    // const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    // const midY = rect.top + rect.height / 2
                    // let dropId = s.id
                    // if (e.clientY >= midY) {
                    //   let el: HTMLElement | null = e.currentTarget as HTMLElement
                    //   while (el && !el.dataset.dragId) el = el.parentElement
                    //   const outerWrapper = el?.parentElement
                    //   let nextSibling = outerWrapper?.nextElementSibling
                    //   while (nextSibling && !nextSibling.querySelector("[data-drag-id]")) {
                    //     nextSibling = nextSibling.nextElementSibling
                    //   }
                    //   dropId = nextSibling?.querySelector("[data-drag-id]")?.getAttribute("data-drag-id") ?? s.id
                    // }
                    // handleDrop(e, dropId)
                    // setIsDragging(null)
                    // setDragOver(null)
                    // setDragOverId(null)
                    // setSelectedId(null)
                    // }}
                   onDragOver={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = "move"
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const midY = rect.top + rect.height / 2
                    if (e.clientY < midY) {
                      if (dragOverId !== s.id) setDragOverId(s.id)
                    } else {
                      // Walk up to find the outer section wrapper, then find next section
                      let el: HTMLElement | null = e.currentTarget as HTMLElement
                      while (el && !el.dataset.dragId) el = el.parentElement
                      const outerWrapper = el?.parentElement
                      let nextSibling = outerWrapper?.nextElementSibling
                      // Skip AddBetweenLine divs (they have no data-drag-id inside)
                      while (nextSibling && !nextSibling.querySelector("[data-drag-id]")) {
                        nextSibling = nextSibling.nextElementSibling
                      }
                      const nextId = nextSibling?.querySelector("[data-drag-id]")?.getAttribute("data-drag-id") ?? s.id
                      if (dragOverId !== nextId) setDragOverId(nextId)
                    }
                    }}
                    onDrop={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDrop(e, s.id)
                    setIsDragging(null)
                    setDragOver(null)
                    setDragOverId(null)
                    setSelectedId(null)
                    }}
                    onClick={() => {
                    setDrillSection(s)
                    setSelectedId(s.id)
                    }}
                    className={[
                      "group/row flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer select-none transition-all duration-150",
                      isSelected
                        ? isDark
                          ? "bg-orange-500/15 ring-1 ring-orange-500/30"
                          : "bg-orange-500/10 ring-1 ring-orange-400/25"
                        : isDark
                          ? "hover:bg-gray-700/60"
                          : "bg-gray-100/80 hover:bg-gray-200/70",
                    ].join(" ")}
                    style={{ transition: "all 0.15s ease" }}
                >
                   <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150 ${
                      isSelected ? "ring-1 ring-orange-400/30" : ""
                    }`}
                    style={{
                      color: isSelected ? (block?.color ?? "#f97316") : (block?.color ?? "#666"),
                      background: isSelected
                        ? `${block?.color ?? "#f97316"}22`
                        : "transparent",
                    }}>
                    {block?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                   <p className={`text-[13px] font-semibold truncate transition-colors duration-150 ${
                      isSelected
                        ? "text-orange-500"
                        : isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {block?.label ?? s.type}
                    </p>
                    </div>
                    <button
                    onClick={e => { e.stopPropagation(); toggleSection(s.id) }}
                    className={`transition-opacity p-1 rounded-md shrink-0 ${
                        s.hidden ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                    }`}
                    style={{ color: s.hidden ? (isDark ? "#ef4444" : "#f87171") : (isDark ? "#6b7280" : "#9ca3af") }}
                    >
                    {s.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <div
                    className="transition-colors cursor-grab active:cursor-grabbing shrink-0"
                    style={{ color: isDark ? "#4b5563" : "#d1d5db" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isDark ? "#6b7280" : "#9ca3af"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isDark ? "#4b5563" : "#d1d5db"}
                    onMouseDown={e => e.stopPropagation()}
                    >
                    <GripVertical className="w-4 h-4" />
                    </div>
                </div>
                </div>
            )
            }

                const ZoneLabel = ({ label, color }: { label: string; color: string }) => (
                <div className="flex items-center gap-2 px-1 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest opacity-50"
                    style={{ color }}>{label}</span>
                <div className="flex-1 h-px opacity-20" style={{ background: color }} />
                </div>
            )

        const AddBetweenLine = ({ afterIndex }: { afterIndex: number }) => {
        const isOpen = addSectionOpen && insertAtIndex === afterIndex
        if (isDragging) return <div style={{ height: "10px", margin: "0" }} />

        return (
            <div
            className="relative"
            style={{ height: "10px", margin: "0" }}
            >
            <div className="absolute inset-x-0 flex items-center transition-opacity opacity-0 hover:opacity-100 group/line" style={{ top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
                <div className={`flex-1 h-px ${isDark ? "bg-orange-500/60" : "bg-orange-400/60"}`} />
                <button
                onClick={e => {
                    e.stopPropagation()
                    if (isOpen) {
                    setAddSectionOpen(false)
                    setInsertAtIndex(null)
                    pendingInsertRef.current = null
                    } else {
                    pendingInsertRef.current = afterIndex
                    setInsertAtIndex(afterIndex)
                    setAddSectionOpen(true)
                    setAddSectionFilter("all")
                    setBodySectionPickerOpen(true)
                    }
                }}
                className="flex items-center justify-center w-4 h-4 mx-1 text-white transition-colors bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 shrink-0"
                >
                <Plus className="w-2.5 h-2.5" />
                </button>
                <div className={`flex-1 h-px ${isDark ? "bg-orange-500/60" : "bg-orange-400/60"}`} />
            </div>
            </div>
        )
        }

           const AddBetweenButton = ({ afterIndex, zone }: { afterIndex: number; zone: string }) => {
            const isOpen = addSectionOpen && insertAtIndex === afterIndex
            return (
                <div className="pt-1">
                <button
                    onClick={() => {
                    if (isOpen) {
                        setAddSectionOpen(false)
                        setInsertAtIndex(null)
                        pendingInsertRef.current = null
                    } else {
                        const idx = afterIndex === -1 ? null : afterIndex
                        pendingInsertRef.current = idx
                        setInsertAtIndex(idx)
                        setAddSectionOpen(true)
                        setAddSectionFilter("all")
                        setBodySectionPickerOpen(true)
                    }
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed text-xs font-medium transition-all ${
                    isOpen
                        ? isDark ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "bg-orange-50 text-orange-500 border-orange-300"
                        : isDark ? "border-orange-800/50 text-orange-400 hover:border-orange-600 hover:bg-orange-900/20" : "border-orange-300 text-orange-500 hover:border-orange-400 hover:bg-orange-50"
                    }`}
                >
                    <Plus className="w-3 h-3" /> Add section
                </button>
                </div>
            )
            }

            return (
                <div
                    className="p-2 pb-4 space-y-1"
                    onDragEnd={() => {
                        requestAnimationFrame(() => {
                        setIsDragging(null)
                        setDragOver(null)
                        setDragOverId(null)
                        setSelectedId(null)
                        })
                    }}
                    onDragLeave={(e) => {
                        // Only reset if leaving the entire panel (not just a child element)
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        requestAnimationFrame(() => {
                            setDragOverId(null)
                        })
                        }
                    }}
                >

                {currentLayoutKey !== "checkout" && (
                <>
                {/* ── HEADER ZONE ── */}
                <ZoneLabel label="Header" color="#6366f1" />
                <div className={`rounded-xl ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <div className="p-1.5 space-y-1">

                    {headerSections.length === 0 ? (
                    <div className={`flex items-center gap-2 px-2 py-2 rounded-lg opacity-50 border border-dashed ${
                        isDark ? "border-indigo-800 text-indigo-400" : "border-indigo-300 text-indigo-500"
                    }`}>
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-indigo-500/20">
                        <Megaphone className="w-3 h-3 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">Announcement Bar</p>
                        <p className={`text-[10px] ${textFaint}`}>Click "Add header section" to add one</p>
                        </div>
                    </div>
                    ) : (
                    <>
                        {headerSections.map((s, i) => {
                        const globalIdx = sections.findIndex(x => x.id === s.id)
                        const block = SECTION_BLOCKS_WITH_ICONS.find(b => b.type === s.type)
                        const isSelected = selectedId === s.id
                        const isDragTarget = !!isDragging &&
                            headerSections.some(hs => hs.id === isDragging) &&
                            dragOver === globalIdx &&
                            isDragging !== s.id

                        return (
                        <div key={s.id} className="relative">
                            {isDragTarget && (
                            <div className="absolute flex items-center pointer-events-none inset-x-2"
                                style={{ top: "-2px", zIndex: 10 }}>
                                <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                            </div>
                            )}
                            <div
                                draggable
                                onDragStart={e => {
                                e.dataTransfer.effectAllowed = "move"
                                const ghost = document.createElement("div")
                                ghost.style.cssText = "position:fixed;top:-999px;left:-999px;opacity:0;width:1px;height:1px;"
                                document.body.appendChild(ghost)
                                e.dataTransfer.setDragImage(ghost, 0, 0)
                                ;(e.currentTarget as any)._dragGhost = ghost
                                draggingIdRef.current = s.id
                                handleDragStart(s.id)
                                }}
                                onDragEnd={e => {
                                const ghost = (e.currentTarget as any)._dragGhost
                                if (ghost && document.body.contains(ghost)) {
                                    document.body.removeChild(ghost)
                                }
                                ;(e.currentTarget as any)._dragGhost = null
                                draggingIdRef.current = null
                                requestAnimationFrame(() => {
                                    setIsDragging(null)
                                    setDragOver(null)
                                    setDragOverId(null)
                                })
                                }}
                                onDragOver={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                e.dataTransfer.dropEffect = "move"
                                if (draggingIdRef.current === s.id) return
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                const midY = rect.top + rect.height / 2
                                const targetIdx = e.clientY < midY ? globalIdx : globalIdx + 1
                                const draggingGlobalIdx = sections.findIndex(x => x.id === draggingIdRef.current)
                                // Skip no-op positions: dropping right where the item already is
                                if (targetIdx === draggingGlobalIdx || targetIdx === draggingGlobalIdx + 1) {
                                    if (dragOver !== null) setDragOver(null)
                                    return
                                }
                                if (dragOver !== targetIdx) setDragOver(targetIdx)
                                }}
                               onDrop={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!draggingIdRef.current) return
                                const draggingId = draggingIdRef.current
                                // Capture BEFORE patchStore — e.currentTarget becomes null after handler returns
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                const clientY = e.clientY
                                patchStore(p => {
                                    const arr = [...(p.sections?.sections ?? [])]
                                    const from = arr.findIndex(x => x.id === draggingId)
                                    if (from === -1) return p
                                    const [moved] = arr.splice(from, 1)
                                    const midY = rect.top + rect.height / 2
                                    let insertAt = clientY < midY ? globalIdx : globalIdx + 1
                                    if (from < insertAt) insertAt -= 1
                                    arr.splice(insertAt, 0, moved)
                                    return { ...p, sections: { ...p.sections, sections: arr } }
                                })
                                draggingIdRef.current = null
                                setIsDragging(null)
                                setDragOver(null)
                                }}
                                onClick={() => { setDrillSection(s); setSelectedId(s.id) }}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 select-none group/row border-l-2 ${
                                isDragging === s.id ? "opacity-40 scale-[0.98]" : ""
                                } ${
                                isSelected
                                    ? isDark ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"
                                    : isDark ? `border-transparent bg-gray-800/60 hover:bg-gray-700/80` : `border-transparent bg-gray-100 hover:bg-gray-200/80`
                                } ${s.hidden ? "opacity-40" : ""}`}
                            >
                                {/* <div className="cursor-grab active:cursor-grabbing shrink-0"
                                onMouseDown={e => e.stopPropagation()}>
                                <GripVertical className={`w-3.5 h-3.5 opacity-0 group-hover/row:opacity-40 transition-opacity ${textFaint}`} />
                                </div> */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                                style={{color: block?.color ?? "#6366f1" }}>
                                {block?.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                <p className={`text-[14px] font-medium truncate ${textPrimary}`}>
                                    {block?.label ?? s.type}
                                </p>
                                </div>
                                {/* Drag handle only */}
                                <div className="transition-colors cursor-grab active:cursor-grabbing shrink-0"
                                  style={{ color: isDark ? "#4b5563" : "#d1d5db" }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isDark ? "#6b7280" : "#9ca3af"}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isDark ? "#4b5563" : "#d1d5db"}
                                  onMouseDown={e => e.stopPropagation()}>
                                  <GripVertical className="w-4 h-4" />
                                </div>
                            </div>
                            </div>
                        )
                        })}

                        {(() => {
                        const lastHeaderSection = headerSections[headerSections.length - 1]
                        const lastGlobalIdx = sections.findIndex(x => x.id === lastHeaderSection?.id)
                        const isDropTargetBeforeHeader = !!isDragging &&
                            headerSections.some(hs => hs.id === isDragging) &&
                            dragOver === lastGlobalIdx + 1

                        return (
                            <div
                            className="relative"
                            style={{ height: "6px" }}
                            onDragOver={e => {
                                e.preventDefault()
                                setDragOver(lastGlobalIdx + 1)
                            }}
                            onDrop={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!isDragging) return
                                patchStore(p => {
                                const arr = [...(p.sections?.sections ?? [])]
                                const from = arr.findIndex(s => s.id === isDragging)
                                if (from === -1) return p
                                const [moved] = arr.splice(from, 1)
                                const headerIdx = arr.findIndex(s => s.type === "header")
                                const insertAt = headerIdx !== -1 ? headerIdx : arr.length
                                arr.splice(insertAt, 0, moved)
                                return { ...p, sections: { ...p.sections, sections: arr } }
                                })
                                setIsDragging(null)
                                setDragOver(null)
                            }}
                            >
                            {isDropTargetBeforeHeader && (
                                <div className="absolute flex items-center pointer-events-none inset-x-2"
                                style={{ top: "2px", zIndex: 10 }}>
                                <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                </div>
                            )}
                            </div>
                        )
                        })()}
                    </>
                    )}

                {(() => {
                    const headerSec = homeSections.find(s => s.type === "header")
                    const isHeaderSelected = selectedId === (headerSec?.id ?? "__store_header__")
                    const storeHeaderHomeIdx = headerSec
                        ? homeSections.findIndex(x => x.id === headerSec.id)
                        : -1
                    const isDraggingHeaderSection = !!isDragging &&
                        headerSections.some(hs => hs.id === isDragging)
                    const isDropTarget = isDraggingHeaderSection && dragOver === storeHeaderHomeIdx + 1

                    return (
                        <div className="relative">
                        <div
                            onDragOver={e => {
                            if (isDraggingHeaderSection) {
                                e.preventDefault()
                                e.stopPropagation()
                                setDragOver(storeHeaderHomeIdx + 1)
                            }
                            }}
                            onDrop={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!isDragging || !isDraggingHeaderSection) return
                            patchStore(p => {
                                const arr = [...(p.sections?.sections ?? [])]
                                const from = arr.findIndex(s => s.id === isDragging)
                                if (from === -1) return p
                                const [moved] = arr.splice(from, 1)
                                const newHeaderIdx = arr.findIndex(s => s.type === "header")
                                const insertAt = newHeaderIdx !== -1 ? newHeaderIdx + 1 : arr.length
                                arr.splice(insertAt, 0, moved)
                                return { ...p, sections: { ...p.sections, sections: arr } }
                            })
                            setIsDragging(null)
                            setDragOver(null)
                            }}
                            onClick={() => {
                            let hSec = homeSections.find((s: any) => s.type === "header")
                            const defaultNavItems: NavItem[] = [
                                { id: "nav_home",        label: "Home",         url: "/" },
                                { id: "nav_products",    label: "All Products", url: "/products" },
                                ...(vendorCollections.length > 0 ? [{ id: "nav_collections", label: "Collections", url: "/collections" }] : []),
                                ...(vendorCategories.length  > 0 ? [{ id: "nav_categories",  label: "Categories",  url: "/categories"  }] : []),
                                ...pages.filter(p => p.in_nav).map(p => ({ id: p.id, label: p.title, url: `/pages/${p.slug}` })),
                            ]
                            if (!hSec) {
                                const newId = `s_header_${Date.now()}`
                                hSec = { id: newId, type: "header" as SectionType, logo_position: "left", show_social_icons: false, nav_items: defaultNavItems }
                                patchStore(p => ({ ...p, sections: { ...p.sections, sections: [...(p.sections?.sections ?? []), hSec] } }))
                            } else if (!hSec.nav_items || hSec.nav_items.length === 0) {
                                hSec = { ...hSec, nav_items: defaultNavItems }
                                patchStore(p => ({ ...p, sections: { ...p.sections, sections: (p.sections?.sections ?? []).map((s: any) => s.id === hSec!.id ? hSec! : s) } }))
                            }
                            setDrillSection(hSec)
                            setSelectedId(hSec.id)
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            isHeaderSelected
                                ? "bg-orange-500/15 border-orange-500/40"
                                : isDropTarget
                                ? isDark ? "border-orange-400/60 bg-orange-900/20" : "border-orange-400/60 bg-orange-50"
                                : `${isDark ? "border-orange-800/40 bg-orange-900/20 hover:border-orange-600/50" : "border-orange-200/60 bg-orange-50/50 hover:border-orange-400/60"}`
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="text-orange-500">
                                <rect x="0" y="0" width="12" height="1.5" rx="0.75" fill="currentColor"/>
                                <rect x="0" y="4" width="8" height="1.5" rx="0.75" fill="currentColor"/>
                                <rect x="0" y="8" width="10" height="1.5" rx="0.75" fill="currentColor"/>
                            </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Store Header
                            </p>
                            <p className={`text-[10px] ${textFaint}`}>Nav • Logo • Search • Cart</p>
                            </div>
                            {/* <span className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                            isHeaderSelected
                                ? isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                                : isDark ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-100 text-indigo-500"
                            }`}>
                            {isHeaderSelected ? "Edit" : "Auto"}
                            </span> */}
                        </div>

                        {isDropTarget && (
                            <div className="absolute flex items-center pointer-events-none inset-x-2" style={{ bottom: "-3px", zIndex: 10 }}>
                            <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                            <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                            </div>
                        )}
                        </div>
                    )
                    })()}

                    {/* ── Below-header tickers/announcements ── */}
                    {(() => {
                      const headerIdx = homeSections.findIndex(s => s.type === "header")
                      const belowHeader = homeSections.filter((s, i) =>
                        i > headerIdx && (s.type === "ticker" || s.type === "announcement")
                      )
                      if (belowHeader.length === 0) return null
                      return (
                        <div className="px-1 mt-1">
                          {/* <p className={`text-[9px] uppercase tracking-widest font-semibold mb-1 opacity-40 ${textFaint}`}>
                            Below nav bar
                          </p> */}
                          {belowHeader.map(s => {
                            const block = SECTION_BLOCKS_WITH_ICONS.find(b => b.type === s.type)
                            const isSelected = selectedId === s.id
                            return (
                              <div key={s.id}
                                onClick={() => { setDrillSection(s); setSelectedId(s.id) }}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer border transition-all ${
                                  isSelected
                                    ? isDark ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"
                                    : `border-transparent ${hoverBg}`
                                }`}>
                                <div className="flex items-center justify-center rounded-lg w-7 h-7 shrink-0"
                                  style={{ background: `${block?.color ?? "#6366f1"}18`, color: block?.color ?? "#6366f1" }}>
                                  {block?.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[12px] font-medium truncate ${textPrimary}`}>
                                    {block?.label ?? s.type}
                                  </p>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 shrink-0">
                                  <button onClick={e => { e.stopPropagation(); removeSection(s.id) }}
                                    className={`p-1 rounded-md ${isDark ? "hover:bg-red-900/40" : "hover:bg-red-50"}`}>
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                </div>

                <div className="px-1.5 pb-1.5">
                    <button
                    onClick={() => setHeaderPickerOpen(true)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed text-xs font-medium transition-all ${
                        isDark
                        ? "border-orange-800/50 text-orange-400 hover:orange-indigo-600 hover:bg-orange-900/20"
                        : "border-orange-300 text-orange-500 hover:border-orange-400 hover:bg-orange-50"
                    }`}
                    >
                    <Plus className="w-3 h-3" /> Add header section
                    </button>
                </div>
                </div>
                 </>
                )}

                {/* ── BODY ZONE ── */}
                <ZoneLabel 
                    label={
                        currentLayoutKey === "home" || currentLayoutKey.startsWith("page_") 
                        ? "Body" 
                        : currentLayoutMeta.label
                    } 
                    color="#e65100" 
                />
                    <div className={`rounded-xl ${isDark ? "border-gray-800" : "border-gray-200"}`}>

                    {currentLayoutKey === "product" && (
                    <div className="px-1.5 pt-1.5">
                        <div
                        onClick={() => {
                            setDrillVirtual("__product_detail__")
                            setSelectedId("__product_detail__")
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer border transition-all ${
                            selectedId === "__product_detail__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : `border-transparent ${hoverBg}`
                        }`}
                        >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <ShoppingBag className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${textPrimary}`}>Product Detail</p>
                            <p className={`text-[10px] ${textFaint}`}>Title · Price · Colors · Sizes · ATC</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                        </div>
                    </div>
                    )}

                    {currentLayoutKey === "checkout" && (
                    <div className="px-1.5 pt-1.5">
                        <div
                        onClick={() => {
                            setDrillVirtual("__checkout_settings__")
                            setSelectedId("__checkout_settings__")
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer border transition-all ${
                            selectedId === "__checkout_settings__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : `border-transparent ${hoverBg}`
                        }`}
                        >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${textPrimary}`}>Checkout Settings</p>
                            <p className={`text-[10px] ${textFaint}`}>Logo · Banner · Accent color · Trust note</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                        </div>
                    </div>
                    )}

                    <div className="p-1.5 space-y-0.5">

                    {currentLayoutKey === "categories" && (
                        <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                        <div
                            onClick={() => {
                            const key = "categories"
                            patchStore(p => {
                                const existing = getPageSections(p, key)
                                if (existing.find((s: any) => s.id === "__category_grid__")) return p
                                return setPageSections(p, key, [
                                { id: "__category_grid__", type: "category_grid" as SectionType, title: "Categories", columns: 4 },
                                ...existing,
                                ])
                            })
                            setDrillVirtual("__category_grid__")
                            setSelectedId("__category_grid__")
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            selectedId === "__category_grid__"
                                ? "bg-orange-500/15 border-orange-500/40"
                                : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Category Grid
                            </p>
                            <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            selectedId === "__category_grid__"
                                ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                                : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                            }`}>Edit</span>
                        </div>
                       {bodySections.length === 0 ? (
                        <div className="py-3 text-center">
                        <p className={`text-[10px] ${textFaint} opacity-60`}>Add sections below the category grid</p>
                        </div>
                        ) : (
                        bodySections.map((s, i) => (
                        <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                        </div>
                        ))
                        )}
                        {bodySections.length > 0 && (
                        <div
                            className="relative"
                            style={{ height: "12px" }}
                            onDragOver={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (dragOverId !== "__end__") setDragOverId("__end__")
                            }}
                            onDrop={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBodyDrop(e)
                            setDragOverId(null)
                            setIsDragging(null)
                            setDragOver(null)
                            }}
                        >
                            {dragOverId === "__end__" && isDragging && (
                            <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-orange-500" />
                            </div>
                            )}
                        </div>
                        )}
                        </div>
                    )}

                    {currentLayoutKey === "collection" && (
                        <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                        <div
                            onClick={() => {
                            const key = "collection"
                            patchStore(p => {
                                const existing = getPageSections(p, key)
                                if (existing.find((s: any) => s.id === "__collection_products__")) return p
                                return setPageSections(p, key, [
                                ...existing,
                                { id: "__collection_products__", type: "collection_products" as SectionType, title: "Products", columns: 3 },
                                ])
                            })
                            setDrillVirtual("__collection_products__")
                            setSelectedId("__collection_products__")
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            selectedId === "__collection_products__"
                                ? "bg-orange-500/15 border-orange-500/40"
                                : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Collection Products
                            </p>
                            <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            selectedId === "__collection_products__"
                                ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                                : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                            }`}>Edit</span>
                        </div>
                        {bodySections.length === 0 ? (
                            <div className="py-3 text-center">
                            <p className={`text-[10px] ${textFaint} opacity-60`}>
                                Add sections below the products
                            </p>
                            </div>
                        ) : (
                            bodySections.map((s, i) => (
                            <div key={s.id}>
                                <SectionRow s={s} idx={i} />
                                {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                            </div>
                            ))
                        )}
                        {bodySections.length > 0 && (
                        <div
                            className="relative"
                            style={{ height: "12px" }}
                            onDragOver={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (dragOverId !== "__end__") setDragOverId("__end__")
                            }}
                            onDrop={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBodyDrop(e)
                            setDragOverId(null)
                            setIsDragging(null)
                            setDragOver(null)
                            }}
                        >
                            {dragOverId === "__end__" && isDragging && (
                            <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-orange-500" />
                            </div>
                            )}
                        </div>
                        )}
                        </div>
                    )}

                    {currentLayoutKey === "collections" && (
                        <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                        <div
                            onClick={() => {
                            const key = "collections"
                            patchStore(p => {
                                const existing = getPageSections(p, key)
                                if (existing.find((s: any) => s.id === "__collections_grid__")) return p
                                return setPageSections(p, key, [
                                { id: "__collections_grid__", type: "collections_grid" as SectionType, title: "Collections", columns: 3 },
                                ...existing.filter((s: any) => s.id !== "__collections_grid__"),
                                ])
                            })
                            setDrillVirtual("__collections_grid__")
                            setSelectedId("__collections_grid__")
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            selectedId === "__collections_grid__"
                                ? "bg-orange-500/15 border-orange-500/40"
                                : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Collections Grid
                            </p>
                            <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            selectedId === "__collections_grid__"
                                ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                                : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                            }`}>Edit</span>
                        </div>
                        {bodySections.length === 0 ? (
                        <div className="py-3 text-center">
                        <p className={`text-[10px] ${textFaint} opacity-60`}>
                            Add sections below the collections grid
                        </p>
                        </div>
                        ) : (
                        bodySections.map((s, i) => (
                        <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                        </div>
                        ))
                        )}
                        {bodySections.length > 0 && (
                        <div
                            className="relative"
                            style={{ height: "12px" }}
                            onDragOver={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (dragOverId !== "__end__") setDragOverId("__end__")
                            }}
                            onDrop={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBodyDrop(e)
                            setDragOverId(null)
                            setIsDragging(null)
                            setDragOver(null)
                            }}
                        >
                            {dragOverId === "__end__" && isDragging && (
                            <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-orange-500" />
                            </div>
                            )}
                        </div>
                        )}
                        </div>
                    )}

                    {currentLayoutKey === "category" && (
                        <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                        <div
                            onClick={() => {
                            const key = "category"
                            patchStore(p => {
                                const existing = getPageSections(p, key)
                                if (existing.find((s: any) => s.id === "__category_products__")) return p
                                return setPageSections(p, key, [
                                ...existing,
                                { id: "__category_products__", type: "category_products" as SectionType, title: "Products", columns: 3 },
                                ])
                            })
                            setDrillVirtual("__category_products__")
                            setSelectedId("__category_products__")
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            selectedId === "__category_products__"
                                ? "bg-orange-500/15 border-orange-500/40"
                                : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Category Products
                            </p>
                            <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            selectedId === "__category_products__"
                                ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                                : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                            }`}>Edit</span>
                        </div>
                        {bodySections.length === 0 ? (
                            <div className="py-1 text-center">
                            <p className={`text-[10px] ${textFaint} opacity-60`}>Add sections below the products</p>
                            </div>
                        ) : (
                            bodySections.map((s, i) => (
                            <div key={s.id}>
                                <SectionRow s={s} idx={i} />
                                {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                            </div>
                            ))
                        )}
                        {bodySections.length > 0 && (
                        <div
                            className="relative"
                            style={{ height: "12px" }}
                            onDragOver={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (dragOverId !== "__end__") setDragOverId("__end__")
                            }}
                            onDrop={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBodyDrop(e)
                            setDragOverId(null)
                            setIsDragging(null)
                            setDragOver(null)
                            }}
                        >
                            {dragOverId === "__end__" && isDragging && (
                            <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-orange-500" />
                            </div>
                            )}
                        </div>
                        )}
                        </div>
                    )}

                      {!["categories", "collections", "category", "home"].includes(currentLayoutKey) &&
                        !currentLayoutKey.startsWith("page_") &&
                        ["products", "cart", "search", "product"].includes(currentLayoutKey) && (
                        <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                            {bodySections.filter(s => !(currentLayoutKey === "product" && s.type === "featured")).length === 0 ? (
                            <div className="py-3 text-center">
                                <p className={`text-[10px] ${textFaint} opacity-60`}>
                                Add sections below the system content
                                </p>
                            </div>
                            ) : (
                            bodySections.filter(s => !(currentLayoutKey === "product" && s.type === "featured")).map((s, i, arr) => (
                                <div key={s.id}>
                                <SectionRow s={s} idx={i} />
                                {i < arr.length - 1 && <AddBetweenLine afterIndex={i} />}
                                </div>
                            ))
                            )}
                            {bodySections.filter(s => !(currentLayoutKey === "product" && s.type === "featured")).length > 0 && (
                            <div
                                className="relative"
                                style={{ height: "12px" }}
                                onDragOver={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (dragOverId !== "__end__") setDragOverId("__end__")
                                }}
                                onDrop={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleBodyDrop(e)
                                setDragOverId(null)
                                setIsDragging(null)
                                setDragOver(null)
                                }}
                            >
                                {dragOverId === "__end__" && isDragging && (
                                <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                    <div className="flex-1 h-0.5 bg-orange-500" />
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                    )}

                    {currentLayoutKey === "home" && (
                        <div
                            onDragOver={e => { e.preventDefault(); handleBodyDragOver(e) }}
                            onDrop={e => { handleBodyDrop(e); setDragOverId(null) }}
                        >
                            {layoutBodySections.length === 0 && (
                            <div className="py-6 space-y-1 text-center">
                                <p className={`text-xs font-medium ${textFaint}`}>No sections yet</p>
                                <p className={`text-[10px] ${textFaint} opacity-60`}>Click "+ Add section" to build this page</p>
                            </div>
                            )}
                        {layoutBodySections.map((s, i, arr) => {
                            //const globalIdx = sections.findIndex(x => x.id === s.id)
                            return (
                                <React.Fragment key={s.id}>
                                <SectionRow s={s} idx={i} />
                                {i < arr.length - 1 && <AddBetweenLine afterIndex={i} />}
                                </React.Fragment>
                            )
                            })}
                            {layoutBodySections.length > 0 && (
                            <div
                                className="relative"
                                style={{ height: "12px" }}
                                onDragOver={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (dragOverId !== "__end__") setDragOverId("__end__")
                                }}
                                onDrop={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleBodyDrop(e)
                                setDragOverId(null)
                                }}
                            >
                                {dragOverId === "__end__" && isDragging && (
                                <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                    <div className="flex-1 h-0.5 bg-orange-500" />
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                        )}

                    {currentLayoutKey.startsWith("page_") && (
                     <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>

                        {/* ── Page Content virtual section ── */}
                        {(() => {
                        const pageSlug = currentLayoutKey.replace("page_", "")
                        const currentPage = pages.find(p => p.slug === pageSlug)
                        if (!currentPage) return null
                        return (
                            <div
                            onClick={() => {
                                setDrillVirtual("__page_content__")
                                setSelectedId("__page_content__")
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all mb-1 ${
                                isDark ? "border-orange-800/40 bg-orange-900/20 hover:border-orange-600/50" : "border-orange-200/60 bg-orange-50/50 hover:border-orange-400/60"
                            }`}
                            >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                                <Pencil className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                Page Content
                                </p>
                                <p className={`text-[10px] ${textFaint}`}>Title · Body text — click to edit</p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                            }`}>Edit</span>
                            </div>
                        )
                        })()}

                        {layoutBodySections.length === 0 && (
                        <div className="py-6 space-y-1 text-center">
                            <p className={`text-xs font-medium ${textFaint}`}>No sections yet</p>
                            <p className={`text-[10px] ${textFaint} opacity-60`}>
                            Click "+ Add section" to build this page
                            </p>
                        </div>
                        )}
                       {layoutBodySections.map((s, i, arr) => {
                        //const globalIdx = sections.findIndex(x => x.id === s.id)
                        return (
                            <React.Fragment key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < arr.length - 1 && <AddBetweenLine afterIndex={i} />}
                            </React.Fragment>
                        )
                        })}
                        {placeholderIndex === layoutBodySections.length && isDragging && (
                        <div
                            style={{ height: draggedHeight, opacity: 0.4 }}
                            className={`rounded-lg border-2 border-dashed my-0.5 ${
                            isDark ? "border-orange-500 bg-orange-900/20" : "border-orange-400 bg-orange-50"
                            }`}
                        />
                        )}
                        {layoutBodySections.length > 0 && (
                            <div
                            className="relative"
                            style={{ height: "12px" }}
                            onDragOver={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (dragOverId !== "__end__") setDragOverId("__end__")
                            }}
                            onDrop={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleBodyDrop(e)
                                setDragOverId(null)
                                setIsDragging(null)
                                setDragOver(null)
                            }}
                            >
                            {dragOverId === "__end__" && isDragging && (
                                <div className="absolute inset-x-0 flex items-center pointer-events-none" style={{ top: "5px", zIndex: 20 }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                                <div className="flex-1 h-0.5 bg-orange-500" />
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                        )}

                    </div>

                    {currentLayoutKey !== "checkout" && (
                    <div className="px-1.5 pb-1.5">
                        <AddBetweenButton afterIndex={-1} zone="body-end" />
                    </div>
                    )}
                </div>

                {currentLayoutKey !== "checkout" && (
                <>
                {/* ── FOOTER ZONE ── */}
                <ZoneLabel label="Footer" color="#0ea5e9" />
                <div className={`rounded-xl ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                    <div className="p-1.5 space-y-1">
                    {footerSections.filter(s => s.type !== "footer").map((s, i) => <SectionRow key={s.id} s={s} idx={i} />)}
                    {(() => {
                        const footerSec = homeSections.find(s => s.type === "footer")
                        const isFooterSelected = selectedId === (footerSec?.id ?? "__store_footer__")
                        return (
                        <div
                            onClick={() => {
                            const currentSections = homeSections

                             const defaultFooterColumns: FooterColumn[] = getDefaultFooterColumns(
                                vendorCollections, vendorCategories, pages, {
                                instagram_url: storeInstagram,
                                youtube_url:   storeYoutube,
                                twitter_url:   storeTwitter,
                                facebook_url:  storeFacebook,
                            }
                            )

                            let fSec = currentSections.find((s: any) => s.type === "footer")

                            if (!fSec) {
                                const newId = `s_footer_${Date.now()}`
                                fSec = {
                                id: newId,
                                type: "footer" as SectionType,
                                show_newsletter: false,
                                footer_columns: defaultFooterColumns,
                                }
                                patchStore(p => ({
                                ...p,
                                sections: {
                                    ...p.sections,
                                    sections: [...(p.sections?.sections ?? []), fSec],
                                }
                                }))
                            } else {
                                const seenHeadings = new Set<string>()
                                const deduped = [...(fSec.footer_columns ?? [])].reverse().filter(c => {
                                const key = c.heading.toLowerCase().trim()
                                if (seenHeadings.has(key)) return false
                                seenHeadings.add(key)
                                return true
                                }).reverse()

                                const existingHeadings = deduped.map((c: FooterColumn) => c.heading.toLowerCase().trim())
                                const missingCols = defaultFooterColumns.filter(
                                dc => !existingHeadings.includes(dc.heading.toLowerCase().trim())
                                )

                                const needsUpdate = deduped.length !== (fSec.footer_columns ?? []).length || missingCols.length > 0

                                if (needsUpdate) {
                                fSec = {
                                    ...fSec,
                                    footer_columns: [...deduped, ...missingCols],
                                }
                                patchStore(p => ({
                                    ...p,
                                    sections: {
                                    ...p.sections,
                                    sections: (p.sections?.sections ?? []).map((s: any) =>
                                        s.id === fSec!.id ? fSec! : s
                                    ),
                                    }
                                }))
                                }
                            }

                             setDrillSection(fSec)
                             setSelectedId(fSec.id)
                            }}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            isFooterSelected
                                ? "bg-orange-500/15 border-orange-500/40"
                                : `${isDark ? "border-orange-800/40 bg-orange-900/20 hover:border-orange-600/50" : "border-orange-200/60 bg-orange-50/50 hover:border-orange-400/60"}`
                            }`}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                            <Layout className="w-3 h-3 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>Store Footer</p>
                            <p className={`text-[10px] ${textFaint}`}>Links • Social • Copyright</p>
                            </div>
                            {/* <span className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                            isFooterSelected
                                ? isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-600"
                                : isDark ? "bg-sky-900/50 text-sky-400" : "bg-sky-100 text-sky-500"
                            }`}>
                            {isFooterSelected ? "Edit" : "Auto"}
                            </span> */}
                        </div>
                        )
                    })()}
                    </div>
                </div>
                </>
                )}
                </div>
            )
            })()}

            {/* ══ STYLE TAB ═══════════════════════════════════════════════ */}
            {activeTab === "style" && (
            <div className="p-3 space-y-3">
                <StyleSection title="Logo & Favicon" isDark={isDark}>
                <div className="space-y-3">
                    <div>
                    <p className={`text-[10px] ${textFaint} mb-2`}>Store logo</p>
                    <div className="flex items-center gap-2">
                        <div onClick={() => fileLogoRef.current?.click()}
                        className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                        {storeLogo ? <img src={storeLogo} alt="logo" className="object-contain w-full h-full p-1" /> : <ImageIcon className={`w-5 h-5 ${textFaint}`} />}
                        </div>
                        <div className="flex-1 space-y-1">
                        <button onClick={() => fileLogoRef.current?.click()} disabled={isUploadingLogo}
                            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                            {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{storeLogo ? "Change" : "Upload"}
                        </button>
                        {storeLogo && (
                            <button onClick={() => setStore(p => ({ ...p, store_logo: undefined }))}
                            className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-red-900 text-[10px] text-red-400 hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-2.5 h-2.5" />Remove
                            </button>
                        )}
                        </div>
                    </div>
                    <input ref={fileLogoRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { if (e.target.files?.[0]) { setIsUploadingLogo(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, store_logo: url })); setIsUploadingLogo(false) } }} />
                    </div>
                    <div>
                    <p className={`text-[10px] ${textFaint} mb-2`}>Favicon <span className="opacity-60">(browser tab icon)</span></p>
                    <div className="flex items-center gap-2">
                        <div onClick={() => fileFavRef.current?.click()}
                        className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                        {storeFavicon ? <img src={storeFavicon} alt="fav" className="object-contain w-full h-full" /> : <Globe className={`w-4 h-4 ${textFaint}`} />}
                        </div>
                        <button onClick={() => fileFavRef.current?.click()} disabled={isUploadingFav}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                        {isUploadingFav ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{storeFavicon ? "Change" : "Upload"}
                        </button>
                        {storeFavicon && (
                        <button onClick={() => setStore(p => ({ ...p, store_favicon: undefined }))} className="p-1.5 rounded border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        )}
                    </div>
                    <input ref={fileFavRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { if (e.target.files?.[0]) { setIsUploadingFav(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, store_favicon: url })); setIsUploadingFav(false) } }} />
                    </div>
                </div>
                </StyleSection>

                <StyleSection title="Colors" isDark={isDark}>
                <div className="space-y-2.5">
                    {[
                    { key: "primary_color",   label: "Primary",   hint: "Buttons & links", default: "#e65100" },
                    { key: "secondary_color", label: "Secondary", hint: "Gradients",        default: "#ac1900" },
                    ].map(({ key, label, hint, default: def }) => (
                    <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                        <label className={`text-[10px] ${textFaint}`}>{label}</label>
                        <span className={`text-[10px] ${textFaint} opacity-60`}>{hint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <input type="color"
                            value={(store as any)[key] ?? def}
                            onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                            className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                        <input type="text"
                            value={(store as any)[key] ?? def}
                            onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${inputCls}`} />
                        </div>
                    </div>
                    ))}
                </div>
                </StyleSection>

                <StyleSection title="Typography" isDark={isDark}>
                <div className="space-y-1.5">
                    {FONTS.map(f => (
                    <button key={f.id} onClick={() => setStore(p => ({ ...p, font: f.id }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${storeFont === f.id ? "border-orange-500/50 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}`}>
                        <span className={`text-xs ${textPrimary}`}>{f.name}</span>
                        {storeFont === f.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </button>
                    ))}
                </div>
                </StyleSection>

                <StyleSection title="Social Links" isDark={isDark}>
                <div className="space-y-2">
                    <p className={`text-[10px] ${textFaint} opacity-70 mb-2`}>These appear in your header and footer when enabled.</p>
                    {[
                    { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/yourhandle", color: "#E1306C" },
                    { key: "youtube_url",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel", color: "#FF0000" },
                    { key: "twitter_url",   label: "X",         placeholder: "https://x.com/yourhandle",         color: "#1DA1F2" },
                    { key: "facebook_url",  label: "Facebook",  placeholder: "https://facebook.com/yourpage",    color: "#1877F2" },
                    ].map(({ key, label, placeholder, color }) => (
                    <div key={key}>
                        <label className={`text-[10px] ${textFaint} flex items-center gap-1 mb-1`}>
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />{label}
                        </label>
                        <input value={(store as any)[key] ?? ""} onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className={`w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 ${inputCls}`} />
                    </div>
                    ))}
                </div>
                </StyleSection>

                <StyleSection title="Product Cards" isDark={isDark}>
                <div className="space-y-3">
                    <div>
                    <label className={`text-[10px] ${textFaint} block mb-1.5`}>Image aspect ratio</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {(["square", "portrait", "landscape"] as const).map(ratio => (
                        <button key={ratio} onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, aspect_ratio: ratio } }))}
                            className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${storeProductCard?.aspect_ratio === ratio || (!storeProductCard?.aspect_ratio && ratio === "square") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                            {ratio}
                        </button>
                        ))}
                    </div>
                    </div>
                    <div>
                    <label className={`text-[10px] ${textFaint} block mb-1.5`}>Alignment</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {(["left", "center"] as const).map(align => (
                        <button key={align} onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, alignment: align } }))}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[10px] capitalize transition-all ${storeProductCard?.alignment === align || (!storeProductCard?.alignment && align === "left") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                            {align === "left" ? <AlignLeft className="w-3 h-3" /> : <AlignCenter className="w-3 h-3" />}{align}
                        </button>
                        ))}
                    </div>
                    </div>
                    <div className="space-y-2">
                    {[
                        { key: "show_price", label: "Show price", default: true },
                        { key: "show_hover", label: "Hover zoom effect", default: true },
                        // { key: "show_sold_out_badge", label: "Show sold-out badge", default: true },
                    ].map(({ key, label, default: def }) => {
                        const val = (storeProductCard as any)?.[key] !== undefined ? (storeProductCard as any)[key] : def
                        return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <div className="relative shrink-0" onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, [key]: !val } }))}>
                            <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                            </div>
                            <span className={`text-xs ${textPrimary}`}>{label}</span>
                        </label>
                        )
                    })}
                    </div>
                </div>
                </StyleSection>

                <StyleSection title="Header Behaviour" isDark={isDark}>
                <div className="space-y-2.5">
                    {[
                    { key: "sticky_header", label: "Sticky header", hint: "Stays fixed while scrolling", def: true },
                    //{ key: "sticky_announcement", label: "Sticky announcement bar", hint: "Bar stays at top", def: true },
                    ].map(({ key, label, hint, def }) => {
                    const val = (store as any)[key] !== undefined ? (store as any)[key] : def
                    return (
                        <label key={key} className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${val ? "border-orange-500/40 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`}>
                        <div className="relative mt-0.5 shrink-0" onClick={() => setStore(p => ({ ...p, [key]: !val }))}>
                            <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${textPrimary}`}>{label}</p>
                            <p className={`text-[10px] mt-0.5 ${textFaint}`}>{hint}</p>
                        </div>
                        </label>
                    )
                    })}
                </div>
                </StyleSection>

                {/* <StyleSection title="SEO & Social Sharing" isDark={isDark}>
                <div className="space-y-2.5">
                    <div>
                    <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
                    <EditorInput value={storeSeoTitle ?? ""} onChange={v => setStore(p => ({ ...p, seo_title: v }))} placeholder={`${vendorHandle} — Official Merch`} isDark={isDark} />
                    <p className={`text-[10px] mt-0.5 ${storeSeoTitle && storeSeoTitle.length > 55 ? "text-amber-400" : textFaint}`}>{(storeSeoTitle ?? "").length}/60</p>
                    </div>
                    <div>
                    <label className={`text-[10px] ${textFaint} block mb-1`}>Meta description</label>
                    <textarea
                        value={storeSeoDescription ?? ""}
                        onChange={e => setStore(p => ({ ...p, seo_description: e.target.value }))}
                        placeholder="Shop official merch from..."
                        rows={3}
                        className={`w-full rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-orange-500 resize-none ${inputCls}`}
                    />
                    <p className={`text-[10px] mt-0.5 ${storeSeoDescription && storeSeoDescription.length > 150 ? "text-amber-400" : textFaint}`}>{(storeSeoDescription ?? "").length}/160</p>
                    </div>
                    <div>
                    <label className={`text-[10px] ${textFaint} block mb-1`}>Social share image (OG Image)</label>
                    <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}
                        onClick={() => fileOgRef.current?.click()}>
                        {storeOgImage
                        ? <img src={storeOgImage} alt="og" className="object-cover w-full h-full" />
                        : <div className="text-center"><ImageIcon className={`w-5 h-5 mx-auto mb-1 ${textFaint}`} /><p className={`text-[10px] ${textFaint}`}>1200×630px recommended</p></div>}
                    </div>
                    <input ref={fileOgRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { if (e.target.files?.[0]) { setIsUploadingOg(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, og_image: url })); setIsUploadingOg(false) } }} />
                    </div>
                </div>
                </StyleSection> */}

            </div>
            )}

            {/* ══ PAGES TAB ═══════════════════════════════════════════════ */}
            {activeTab === "pages" && (
            <div className="p-2">
                {editingPage ? (
                <PageEditorPanel page={editingPage} vendorHandle={vendorHandle}
                    onSave={savePage} onCancel={() => setEditingPage(null)}
                    onDelete={() => { deletePage(editingPage.id); setEditingPage(null) }}
                    isNew={!pages.find(p => p.id === editingPage.id)} isDark={isDark}
                    onDraftChange={(updated) => {
                    patchStore(p => {
                        const existing = p.pages?.pages ?? []
                        const updatedPages = existing.find(pg => pg.id === updated.id)
                        ? existing.map(pg => pg.id === updated.id ? updated : pg)
                        : [...existing, updated]
                        return { ...p, pages: { pages: updatedPages } }
                    })
                    }} />
                ) : (
                <>
                    {/* ── Custom pages ── */}
                    <p className={`text-[10px] uppercase tracking-wider px-1 py-2 font-semibold ${textFaint}`}>
                    Custom pages
                    </p>

                    {pages.filter(page => !["terms", "privacy", "returns", "contact"].includes(page.template ?? "")).map(page => (
                    <div key={page.id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg}`}>
                        <span className="text-sm shrink-0">{PAGE_TEMPLATES.find(t => t.id === page.template)?.icon ?? "📄"}</span>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingPage(page)}>
                        <p className={`text-xs font-medium truncate ${textPrimary}`}>{page.title}</p>
                        <p className={`text-[10px] font-mono ${textFaint}`}>/pages/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        {/* {page.in_nav && <span className="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">Nav</span>}
                        {page.in_footer && <span className="text-[9px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">Footer</span>} */}
                        <button onClick={() => setEditingPage(page)} className="p-0.5 rounded hover:bg-gray-700">
                            <Pencil className={`w-2.5 h-2.5 ${textMuted}`} />
                        </button>
                        <button onClick={() => deletePage(page.id)} className="p-0.5 rounded hover:bg-red-900/50">
                            <Trash2 className="w-2.5 h-2.5 text-red-400" />
                        </button>
                        </div>
                    </div>
                    ))}

                    {pages.filter(page => !["terms", "privacy", "returns", "contact"].includes(page.template ?? "")).length === 0 && (
                    <p className={`px-2 py-2 text-xs ${textFaint}`}>No custom pages yet.</p>
                    )}

                    <div className={`pt-2 mt-2 border-t ${panelBorder}`}>
                    <button
                        onClick={() => startNewPage("blank")}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed text-xs font-medium transition-all ${
                        isDark
                            ? "border-indigo-800/50 text-indigo-400 hover:border-indigo-600 hover:bg-indigo-900/20"
                            : "border-indigo-300 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50"
                        }`}
                    >
                        <Plus className="w-3 h-3" /> Add new page
                    </button>
                    </div>

                    {/* ── Policies and support pages ── */}
                    <p className={`text-[10px] uppercase tracking-wider px-1 pt-4 pb-2 font-semibold ${textFaint}`}>
                    Policies and support pages
                    </p>

                    {pages.filter(page => ["terms", "privacy", "returns", "contact"].includes(page.template ?? "")).map(page => (
                    <div key={page.id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg}`}>
                        <span className="text-sm shrink-0">
                        {PAGE_TEMPLATES.find(t => t.id === page.template)?.icon ?? "📄"}
                        </span>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingPage(page)}>
                        <p className={`text-xs font-medium truncate ${textPrimary}`}>{page.title}</p>
                        <p className={`text-[10px] font-mono ${textFaint}`}>/pages/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        {page.in_nav && (
                            <span className="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">Nav</span>
                        )}
                        {page.in_footer && (
                            <span className="text-[9px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">Footer</span>
                        )}
                        <button onClick={() => setEditingPage(page)} className="p-0.5 rounded hover:bg-gray-700">
                            <Pencil className={`w-2.5 h-2.5 ${textMuted}`} />
                        </button>
                        </div>
                    </div>
                    ))}

                    {/* Managed pages notice */}
                    <div className={`mt-3 mx-1 p-3 rounded-xl border text-xs leading-relaxed ${
                    isDark
                        ? "border-gray-700 bg-gray-800/50 text-gray-400"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}>
                    <p className="mb-2.5">
                        📋 These pages are auto-generated by JUNOONI. You can customize them, but once you do you will no longer receive automatic updates.
                    </p>
                    {/* <button
                        onClick={() => {
                        const firstPolicy = pages.find(p =>
                            ["terms", "privacy", "returns"].includes(p.template ?? "")
                        )
                        if (firstPolicy) setEditingPage(firstPolicy)
                        }}
                        className={`w-full py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isDark
                            ? "border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-gray-700"
                            : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-white"
                        }`}
                    >
                        Customize these pages
                    </button> */}
                    </div>
                </>
                )}
            </div>
            )}

            {/* ══ THEME TAB ═══════════════════════════════════════════════ */}
            {activeTab === "theme" && (
            <div className="p-3 space-y-4">

                {/* ── Active theme ── */}
                <div>
                <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${textFaint}`}>
                    Active theme
                </p>
                {(() => {
                    const activeId = storeTemplate ?? "minimal"
                    const active = TEMPLATES.find(t => t.id === activeId) ?? TEMPLATES[0]
                    const previewSrc =
                    activeId === "bold"      ? (typeof boldpreview === "string" ? boldpreview : (boldpreview as any).src) :
                    activeId === "editorial" ? (typeof editorialpreview === "string" ? editorialpreview : (editorialpreview as any).src) :
                    (typeof minimalpreview === "string" ? minimalpreview : (minimalpreview as any).src)

                    return (
                    <div className={`rounded-xl border-2 overflow-hidden ${isDark ? "border-orange-500/60" : "border-orange-500/60"}`}>
                        {/* Scrolling preview */}
                        <div className="w-full overflow-hidden" style={{ height: "130px" }}>
                        <div
                            className="w-full transition-transform duration-[3s] ease-in-out"
                            style={{ transform: "translateY(0)" }}
                            onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement
                            const img = el.querySelector("img") as HTMLImageElement
                            if (img) {
                                const scrollDist = img.naturalHeight * (el.offsetWidth / img.naturalWidth) - 130
                                el.style.transform = `translateY(-${scrollDist}px)`
                                el.style.transitionDuration = `${Math.max(2, scrollDist / 60)}s`
                            }
                            }}
                            onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.transform = "translateY(0)"
                            el.style.transitionDuration = "1s"
                            }}
                        >
                            <img src={previewSrc} alt={`${active.name} preview`} className="block w-full" />
                        </div>
                        </div>

                        {/* Footer bar */}
                        <div className={`flex items-center justify-between px-3 py-2 ${
                        activeId === "bold" ? "bg-gray-900" :
                        activeId === "editorial" ? "bg-stone-100" :
                        isDark ? "bg-gray-800" : "bg-gray-50"
                        }`}>
                        <div>
                            <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-semibold ${
                                activeId === "bold" ? "text-white" :
                                activeId === "editorial" ? "text-stone-800" : textPrimary
                            }`}>{active.name}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                                Live theme
                            </span>
                            </div>
                            <p className={`text-[10px] ${
                            activeId === "bold" ? "text-gray-500" :
                            activeId === "editorial" ? "text-stone-500" : textFaint
                            }`}>{active.desc}</p>
                        </div>
                        </div>
                    </div>
                    )
                })()}
                </div>

                {/* ── Inactive themes ── */}
                <div>
                <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${textFaint}`}>
                    Inactive themes
                </p>
                <div className="space-y-2">
                    {TEMPLATES.filter(t => t.id !== (storeTemplate ?? "minimal")).map(t => {
                    const previewSrc =
                        t.id === "bold"      ? (typeof boldpreview === "string" ? boldpreview : (boldpreview as any).src) :
                        t.id === "editorial" ? (typeof editorialpreview === "string" ? editorialpreview : (editorialpreview as any).src) :
                        (typeof minimalpreview === "string" ? minimalpreview : (minimalpreview as any).src)

                    const hasSavedData = !!(store.theme_data?.[t.id]?.sections?.length)

                    return (
                        <div key={t.id} className={`rounded-xl border overflow-hidden ${
                        isDark ? "border-gray-700" : "border-gray-200"
                        }`}>
                        {/* Scrolling preview */}
                        <div className="w-full overflow-hidden" style={{ height: "100px" }}>
                            <div
                            className="w-full transition-transform duration-[3s] ease-in-out"
                            style={{ transform: "translateY(0)" }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement
                                const img = el.querySelector("img") as HTMLImageElement
                                if (img) {
                                const scrollDist = img.naturalHeight * (el.offsetWidth / img.naturalWidth) - 100
                                el.style.transform = `translateY(-${scrollDist}px)`
                                el.style.transitionDuration = `${Math.max(2, scrollDist / 60)}s`
                                }
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement
                                el.style.transform = "translateY(0)"
                                el.style.transitionDuration = "1s"
                            }}
                            >
                            <img src={previewSrc} alt={`${t.name} preview`} className="block w-full" />
                            </div>
                        </div>

                        {/* Footer bar */}
                        <div className={`flex items-center justify-between px-3 py-2 ${
                            t.id === "bold" ? "bg-gray-900" :
                            t.id === "editorial" ? "bg-stone-100" :
                            isDark ? "bg-gray-800" : "bg-gray-50"
                        }`}>
                            <div>
                            <p className={`text-xs font-semibold ${
                                t.id === "bold" ? "text-white" :
                                t.id === "editorial" ? "text-stone-800" : textPrimary
                            }`}>{t.name}</p>
                            <p className={`text-[10px] ${
                                t.id === "bold" ? "text-gray-500" :
                                t.id === "editorial" ? "text-stone-500" : textFaint
                            }`}>
                                {hasSavedData ? "Has saved customizations" : t.desc}
                            </p>
                            </div>
                            <button
                            onClick={() => switchTheme(t.id)}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                                isDark
                                ? "bg-gray-700 text-gray-200 hover:bg-orange-500/20 hover:text-orange-400"
                                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                            >
                            Activate
                            </button>
                        </div>
                        </div>
                    )
                    })}
                </div>
                </div>

            </div>
            )}
        </div>
    </div>
    )
})
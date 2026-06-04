"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft, Save, Loader2, GripVertical, Plus, Trash2,
  ChevronUp, ChevronDown, X, Monitor, Smartphone, RefreshCw,
  ExternalLink, Layout, Palette, FileText, Layers,
  Eye, EyeOff, Settings, Globe, Image as ImageIcon,
  Type, Star, Megaphone, Minus, Share2, ShoppingBag,
  BookOpen, Upload, Check, ChevronRight, ChevronDown as ChevronDownIcon,
  Pencil, Copy, Instagram, Youtube, Twitter, Facebook,
  Video, Link as LinkIcon, Grid, AlignLeft, AlignCenter,
  Radio, Zap, Moon, Sun, MoreVertical, Columns, Menu, Search,
  PanelLeftClose
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoreUrl, getPreviewUrl, getPageUrl } from "@/lib/store-urls"
import { LeftPanel } from "./components/editor/LeftPanel"

// ── Split file imports ────────────────────────────────────────────────────────
import type {
  SectionType, EditorTab, PageTemplate, StoreSection,
  StorePage, VendorStore, FooterColumn, NavItem,
  ProductDetailSettings as ProductDetailSettingsType,
} from "./components/editor/types"
import {
  BRAND, SECTION_CATEGORIES, PAGE_LAYOUT_META,
  PAGE_ALLOWED_SECTIONS, FONTS, TEMPLATES, PAGE_TEMPLATES, BUILTIN_PAGES,
} from "./components/editor/constants"
import { SECTION_BLOCKS as SECTION_BLOCKS_WITH_ICONS } from "./components/editor/sectionBlocks"
import {
  slugify, genId, getLayoutKeyForPath, getPageSections,
  setPageSections, getDefaultFooterColumns, sanitizeRichText,
} from "./components/editor/helpers"
import { StyleSection, Field, EditorInput, EditorTextarea, UploadOnlyImageField } from "./components/editor/ui"
import {
  LinkInput, _linkInputProducts, _linkInputProductsRef,
} from "./components/editor/LinkInput"
import { PageSwitcherDropdown } from "./components/editor/PageSwitcher"
import { ProductPickerModal, ProductPickerButton } from "./components/editor/ProductPicker"
import { FooterColumnsEditor } from "./components/editor/FooterColumnsEditor"
import { NavItemsEditor } from "./components/editor/NavItemsEditor"
import { PageEditorPanel } from "./components/editor/PageEditorPanel"
import { SectionSettings, ProductDetailSettings } from "./components/editor/SectionSettings"

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StoreEditorPage() {
  const navigate   = useNavigate()
  const { toast }  = useToast()
  const [bodySectionPickerOpen, setBodySectionPickerOpen] = useState(false)
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const fileLogoRef = useRef<HTMLInputElement>(null)
  const fileFavRef  = useRef<HTMLInputElement>(null)
  const fileOgRef   = useRef<HTMLInputElement>(null)

  // ── State ─────────────────────────────────────────────────────────────────
  const [store,            setStore]            = useState<VendorStore>({})
  const [hasUnsavedChanges,setHasUnsavedChanges]= useState(false)
  const [vendorHandle,     setVendorHandle]     = useState("")
  const [isLoading,        setIsLoading]        = useState(true)
  const [isSaving,         setIsSaving]         = useState(false)
  const [hasStore,         setHasStore]         = useState(false)
  const [iframeReady,      setIframeReady]      = useState(false)
  const [selectedId,       setSelectedId]       = useState<string | null>(null)
  const [viewport,         setViewport]         = useState<"desktop" | "mobile">("desktop")
  const [activeTab,        setActiveTab]        = useState<EditorTab>("layout")
  const [editingPage,      setEditingPage]      = useState<StorePage | null>(null)
  const [isDragging,       setIsDragging]       = useState<string | null>(null)
  const [dragOver,         setDragOver]         = useState<number | null>(null)
  const [isUploadingLogo,  setIsUploadingLogo]  = useState(false)
  const [isUploadingFav,   setIsUploadingFav]   = useState(false)
  const [isUploadingOg,    setIsUploadingOg]    = useState(false)
  const [editorTheme,      setEditorTheme]      = useState<"dark" | "light">("light")
  const [addSectionOpen,   setAddSectionOpen]   = useState(false)
  const [addSectionFilter, setAddSectionFilter] = useState("all")
  const [insertAtIndex,    setInsertAtIndex]    = useState<number | null>(null)
  const [vendorCollections,setVendorCollections]= useState<{ id: string; title: string; handle: string }[]>([])
  const [vendorCategories, setVendorCategories] = useState<{ id: string; name: string; handle: string; product_count: number }[]>([])
  const [vendorProducts,   setVendorProducts]   = useState<{ id: string; title: string; handle: string; thumbnail?: string; variants?: any[]; options?: any[] }[]>([])
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [leftPanelOpen,    setLeftPanelOpen]    = useState(false)
  const [leftPanelCollapsed,setLeftPanelCollapsed]=useState(false)
  const [headerPickerOpen, setHeaderPickerOpen] = useState(false)
  const [rightPanelOpen,   setRightPanelOpen]   = useState(false)
  const [previewPagePath,  setPreviewPagePath]  = useState<string>("/")
  const [triggerDrillId,   setTriggerDrillId]   = useState<string | null>(null)

  // Add this before all useEffects

  // ── Sync products to module-level ref ────────────────────────────────────
  useEffect(() => {
    _linkInputProductsRef.current = vendorProducts
  }, [vendorProducts])

  const isDark = editorTheme === "dark"
  const token  = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL

  // ── Style constants ───────────────────────────────────────────────────────
  const panelBg     = useMemo(() => isDark ? "bg-gray-900"       : "bg-white",       [isDark])
  const panelBorder = useMemo(() => isDark ? "border-gray-800"   : "border-gray-200",[isDark])
  const textPrimary = useMemo(() => isDark ? "text-white"        : "text-gray-900",  [isDark])
  const textMuted   = useMemo(() => isDark ? "text-gray-400"     : "text-gray-500",  [isDark])
  const textFaint   = useMemo(() => isDark ? "text-gray-500"     : "text-gray-400",  [isDark])
  const inputCls    = useMemo(() => isDark
    ? "bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-orange-500"
    : "bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500"
  , [isDark])
  const hoverBg = useMemo(() => isDark ? "hover:bg-gray-800" : "hover:bg-gray-50", [isDark])

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentLayoutKey  = getLayoutKeyForPath(previewPagePath)
  const currentLayoutMeta = PAGE_LAYOUT_META[currentLayoutKey] ?? PAGE_LAYOUT_META.home

  const homeSections = (store.sections?.sections ?? [])
    .map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  const headerSections = homeSections.filter(s =>
    s.type === "announcement" || s.type === "ticker"
  )
  const footerSections = homeSections.filter(s => s.type === "footer")
  const bodySections = currentLayoutKey === "home"
    ? homeSections.filter(s =>
        !["header", "announcement", "ticker", "footer"].includes(s.type)
      )
    : getPageSections(store, currentLayoutKey).filter(s =>
        s.id !== "__category_grid__" &&
        s.id !== "__category_products__" &&
        s.id !== "__collections_grid__" &&
        s.id !== "__collection_products__"
      )

  const sections = currentLayoutKey === "home"
    ? homeSections
    : [...headerSections, ...bodySections, ...footerSections].filter(s =>
        s.id !== "__category_grid__" &&
        s.id !== "__category_products__" &&
        s.id !== "__collections_grid__" &&
        s.id !== "__collection_products__"
      )

  const pages   = store.pages?.pages ?? []
  const isLive  = store.status === "live"

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        let vd: any = {}
        const vRes = await fetch(`${backendUrl}/vendors/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (vRes.ok) {
          vd = await vRes.json()
          setVendorHandle(vd.vendor?.handle ?? "")
        }

        const sRes = await fetch(`${backendUrl}/vendors/me/store`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (sRes.ok) {
          const sd = await sRes.json()
          if (sd.store) {
            const secs = (sd.store.sections?.sections ?? []).map(
              (s: any) => ({ ...s, id: s.id ?? genId() })
            )
            const rawLayouts = sd.store.sections?.page_layouts ?? {}
            const mappedLayouts: Record<string, { sections: any[] }> = {}
            for (const [key, layout] of Object.entries(rawLayouts)) {
              mappedLayouts[key] = {
                sections: ((layout as any).sections ?? []).map(
                  (s: any) => ({ ...s, id: s.id ?? genId() })
                )
              }
            }

            // Deduplicate footer columns on load
            const rawFooterSec = secs.find((s: any) => s.type === "footer")
            if (rawFooterSec?.footer_columns) {
              const seen = new Set<string>()
              const deduped = rawFooterSec.footer_columns.filter((c: FooterColumn) => {
                const key = c.heading.toLowerCase().trim()
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
              if (deduped.length !== rawFooterSec.footer_columns.length) {
                const idx = secs.findIndex((s: any) => s.type === "footer")
                secs[idx] = { ...rawFooterSec, footer_columns: deduped }
              }
            }

            const loadedStore = {
              ...sd.store,
              sections: { sections: secs, page_layouts: mappedLayouts }
            }

            // Auto-seed legal pages
            const existingPages: any[] = loadedStore.pages?.pages ?? []
            const hasTerms   = existingPages.some((p: any) => p.template === "terms")
            const hasPrivacy = existingPages.some((p: any) => p.template === "privacy")
            const hasReturns = existingPages.some((p: any) => p.template === "returns")

            if (!hasTerms || !hasPrivacy || !hasReturns) {
              const today = new Date().toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })
              const seedPages = [...existingPages]
              if (!hasTerms) seedPages.push({
                id: `page_${Date.now()}_terms`,
                title: "Terms of Service", slug: "terms-of-service", template: "terms",
                in_nav: false, in_footer: true, created_at: new Date().toISOString(),
                content: PAGE_TEMPLATES.find(t => t.id === "terms")!.defaultContent.replace("{{CREATED_DATE}}", today),
              })
              if (!hasPrivacy) seedPages.push({
                id: `page_${Date.now() + 1}_privacy`,
                title: "Privacy Policy", slug: "privacy-policy", template: "privacy",
                in_nav: false, in_footer: true, created_at: new Date().toISOString(),
                content: PAGE_TEMPLATES.find(t => t.id === "privacy")!.defaultContent.replace("{{CREATED_DATE}}", today),
              })
              if (!hasReturns) seedPages.push({
                id: `page_${Date.now() + 2}_returns`,
                title: "Returns & Refunds", slug: "returns-refunds", template: "returns",
                in_nav: false, in_footer: true, created_at: new Date().toISOString(),
                content: PAGE_TEMPLATES.find(t => t.id === "returns")!.defaultContent.replace("{{CREATED_DATE}}", today),
              })
              loadedStore.pages = { pages: seedPages }
              fetch(`${backendUrl}/vendors/me/store`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...loadedStore, pages: loadedStore.pages }),
              }).catch(e => console.warn("Auto-save seeded pages failed:", e))
            }

            setStore({
              ...loadedStore,
              instagram_url: loadedStore.instagram_url || vd.vendor?.instagram || "",
              youtube_url:   loadedStore.youtube_url   || vd.vendor?.youtube   || "",
              twitter_url:   loadedStore.twitter_url   || vd.vendor?.xtwitter  || "",
              facebook_url:  loadedStore.facebook_url  || vd.vendor?.facebook  || "",
            })
            setHasStore(true)

            const storeCollections = sd.store.collections?.collections ?? []
            setVendorCollections(storeCollections.map((c: any) => ({
              id: c.id, title: c.title ?? c.name ?? c.handle, handle: c.handle,
            })))
          }
        }

        try {
          const prodRes = await fetch(
            `${backendUrl}/vendors/products?limit=200&status=published&store_only=true`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (prodRes.ok) {
            const prodData = await prodRes.json()
            const prods = (prodData.products ?? []).filter((p: any) => p.status === "published")
            setVendorProducts(prods.map((p: any) => ({
              id: p.id, title: p.title, handle: p.handle,
              thumbnail: p.thumbnail, variants: p.variants, options: p.options,
            })))
            const catMap = new Map<string, { id: string; name: string; handle: string; product_count: number }>()
            for (const p of prods) {
              for (const c of (p.categories ?? [])) {
                if (!c?.id) continue
                const existing = catMap.get(c.id)
                catMap.set(c.id, {
                  id: c.id, name: c.name ?? c.handle, handle: c.handle,
                  product_count: (existing?.product_count ?? 0) + 1,
                })
              }
            }
            setVendorCategories([...catMap.values()].filter(c => c.product_count > 0))
          }
        } catch (e) { console.warn("Could not load products/categories:", e) }

      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  // ── Track unsaved changes ─────────────────────────────────────────────────
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isLoading) return
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setHasUnsavedChanges(true)
  }, [store, isLoading])

  useEffect(() => {
    const handleDragEnd = () => { setIsDragging(null); setDragOver(null) }
    document.addEventListener("dragend", handleDragEnd)
    return () => document.removeEventListener("dragend", handleDragEnd)
  }, [])

  // ── postMessage sync ──────────────────────────────────────────────────────
  const isSyncingRef = useRef(false)
  const syncToIframe = useCallback(() => {
    if (!iframeReady) return
    isSyncingRef.current = true
    iframeRef.current?.contentWindow?.postMessage({ type: "STORE_UPDATE", store, selectedId }, "*")
    setTimeout(() => { isSyncingRef.current = false }, 100)
  }, [store, selectedId, iframeReady])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "SECTION_CLICK" && !isSyncingRef.current) {
        setSelectedId(e.data.sectionId)
        setActiveTab("layout")
      }
      if (e.data?.type === "SECTION_DBLCLICK" && !isSyncingRef.current) {
        setSelectedId(e.data.sectionId)
        setActiveTab("layout")
        setTriggerDrillId(e.data.sectionId)
        setTimeout(() => setTriggerDrillId(null), 100)
      }
      if (e.data?.type === "IFRAME_READY") {
        setIframeReady(true)
        setTimeout(() => syncToIframe(), 100)
      }
      if (e.data?.type === "IFRAME_NAVIGATION") {
        const path: string = e.data.path ?? "/"
        const normalized =
          path === "/" ? "/" :
          path.startsWith("/products/")    ? `/products/${path.split("/")[2]}`    :
          path.startsWith("/collections/") ? `/collections/${path.split("/")[2]}` :
          path.startsWith("/categories/")  ? `/categories/${path.split("/")[2]}`  :
          path
        setPreviewPagePath(normalized)
        setSelectedId(null)
        setRightPanelOpen(false)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [syncToIframe])

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!iframeReady) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => syncToIframe(), 50)
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current) }
  }, [store, selectedId, iframeReady, syncToIframe])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...store, subdomain: store.subdomain || vendorHandle }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setStore(p => ({ ...p, ...data.store }))
      setHasStore(true)
      setHasUnsavedChanges(false)
      iframeRef.current?.contentWindow?.postMessage({ type: "STORE_UPDATE", store: data.store, selectedId }, "*")
      iframeRef.current?.contentWindow?.postMessage({ type: "STORE_SAVED" }, "*")
      toast({ title: "Saved! ✓", description: "Your store has been updated." })
      if (previewPagePath.startsWith("/pages/")) {
        setTimeout(() => {
          if (iframeRef.current) {
            const src = iframeRef.current.src
            iframeRef.current.src = ""
            setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src }, 100)
          }
        }, 600)
      }
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  // ── Toggle live/draft ─────────────────────────────────────────────────────
  const handleToggleStatus = async () => {
    const newStatus = store.status === "live" ? "draft" : "live"
    setIsTogglingStatus(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setStore(p => ({ ...p, status: newStatus }))
      toast({ title: newStatus === "live" ? "🎉 Store is now live!" : "Store set to draft" })
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsTogglingStatus(false) }
  }

  // ── File upload ───────────────────────────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.files?.[0]?.url ?? null
  }

  // ── Section helpers ───────────────────────────────────────────────────────
  const patchStore = useCallback((updater: (p: VendorStore) => VendorStore) => setStore(updater), [])

  const updateSection = useCallback((id: string, patch: Partial<StoreSection>) => {
    patchStore(p => {
      const homeSecs = p.sections?.sections ?? []
      if (homeSecs.some(s => s.id === id)) {
        return { ...p, sections: { ...p.sections, sections: homeSecs.map(s => s.id === id ? { ...s, ...patch } : s) } }
      }
      const key     = getLayoutKeyForPath(previewPagePath)
      const current = getPageSections(p, key)
      return setPageSections(p, key, current.map(s => s.id === id ? { ...s, ...patch } : s))
    })
  }, [patchStore, previewPagePath])

  const removeSection = useCallback((id: string) => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => setPageSections(p, key, getPageSections(p, key).filter(s => s.id !== id)))
    if (selectedId === id) { setSelectedId(null); setRightPanelOpen(false) }
  }, [previewPagePath, selectedId, patchStore])

  const duplicateSection = useCallback((id: string) => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr = [...getPageSections(p, key)]
      const idx = arr.findIndex(s => s.id === id)
      if (idx === -1) return p
      const copy = { ...arr[idx], id: genId() }
      arr.splice(idx + 1, 0, copy)
      return setPageSections(p, key, arr)
    })
  }, [previewPagePath, patchStore])

  const toggleSection = (id: string) => {
    const s = sections.find(s => s.id === id)
    if (s) updateSection(id, { hidden: !s.hidden })
  }

  const moveSection = (id: string, dir: "up" | "down") => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr  = [...getPageSections(p, key)]
      const i    = arr.findIndex(s => s.id === id)
      const swap = dir === "up" ? i - 1 : i + 1
      if (swap < 0 || swap >= arr.length) return p
      ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
      return setPageSections(p, key, arr)
    })
  }

  const addSection = (type: SectionType, explicitInsertIndex?: number | null) => {
    console.log("🔍 addSection called", {
    type,
    explicitInsertIndex,
    insertAtIndex,
    capturedWillBe: explicitInsertIndex !== undefined ? explicitInsertIndex : insertAtIndex
  })
  const key = getLayoutKeyForPath(previewPagePath)
  const capturedInsertAtIndex = explicitInsertIndex !== undefined ? explicitInsertIndex : insertAtIndex

  const ns: StoreSection = {
    id: genId(), type,
    ...(type === "hero"         ? { headline: "Your Headline", subtext: "Your tagline goes here", cta_label: "Shop Now", cta_secondary_label: "Browse all", cta_secondary_url: "/products" } : {}),
    ...(type === "collection"   ? { title: "All Products", limit: 12, columns: 3, show_sold_out: true } : {}),
    ...(type === "featured"     ? { title: "Featured Drops", limit: 4, columns: 4 } : {}),
    ...(type === "about"        ? { title: "About Me", text: "Share your story..." } : {}),
    ...(type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: BRAND.primary, text_color: "#ffffff" } : {}),
    ...(type === "social"       ? { show_instagram: true, show_youtube: true, show_twitter: true } : {}),
    ...(type === "video"        ? { title: "Watch me", video_url: "" } : {}),
    ...(type === "text"         ? { text: "Add your content here." } : {}),
    ...(type === "links"        ? { title: "My Links", links: [{ id: genId(), label: "My YouTube", url: "https://youtube.com" }, { id: genId(), label: "Latest Drop", url: "#" }] } : {}),
    ...(type === "html"         ? { html_content: "<div style=\"padding:40px;text-align:center\">\n  <h2>Custom Section</h2>\n</div>" } : {}),
    ...(type === "featured_collections" ? { title: "Shop by Collection", collection_ids: [], columns: 3 } : {}),
    ...(type === "header"       ? { logo_position: "left", show_social_icons: false, nav_items: [] } : {}),
    ...(type === "footer"       ? { show_newsletter: false } : {}),
    ...(type === "ticker"       ? { ticker_items: ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"], ticker_speed: 40, ticker_separator: "✦", background_color: "#111827", text_color: "#ffffff" } : {}),
    ...(type === "image_text"   ? { title: "Our Story", text: "Share something meaningful.", image_position: "left", cta_label: "Learn More", cta_url: "#about" } : {}),
    ...(type === "video_text"   ? { title: "Watch & Shop", text: "Tell your audience what this video is about.", image_position: "left", video_text_url: "", cta_label: "Shop Now", cta_url: "/products" } : {}),
    ...(type === "featured_product" ? { title: "Fan Favourite", text: "Describe why this product is special.", image_position: "right", cta_label: "Get Yours", cta_url: "/products" } : {}),
  }

  patchStore(p => {
    if (key === "home") {
      const arr = [...(p.sections?.sections ?? [])]
      console.log("🟡 addSection patchStore called", { type, capturedInsertAtIndex, arrLength: arr.length })

      // ── Special fixed-position types ──────────────────────────────────────
      if (type === "header") {
        arr.unshift(ns)
        return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
      }

      if (type === "footer") {
        arr.push(ns)
        return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
      }

      // ── Announcement / Ticker: ONLY auto-place in header zone
      //    when capturedInsertAtIndex is null (added via header picker,
      //    not via body "+ Add section" button)
      if ((type === "announcement" || type === "ticker") && capturedInsertAtIndex === null) {
        console.log("🔴 TICKER GOING TO HEADER ZONE — capturedInsertAtIndex is null!")
        const lastHeaderZoneIdx = arr.reduce((last, s, i) =>
          (s.type === "announcement" || s.type === "ticker") ? i : last, -1)
        const headerIdx = arr.findIndex(s => s.type === "header")
        if (lastHeaderZoneIdx !== -1) {
          arr.splice(lastHeaderZoneIdx + 1, 0, ns)
        } else if (headerIdx !== -1) {
          arr.splice(headerIdx, 0, ns)
        } else {
          arr.unshift(ns)
        }
        return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
      }

      // ── All other body sections (including announcement/ticker with
      //    explicit insertAtIndex from body zone) ──────────────────────────
      const bodyOnlyArr = arr.filter(s =>
        !["header", "footer"].includes(s.type)
      )

      if (capturedInsertAtIndex !== null && capturedInsertAtIndex !== -1) {
        const targetSection = capturedInsertAtIndex >= bodyOnlyArr.length
          ? null
          : bodyOnlyArr[capturedInsertAtIndex]
        if (targetSection) {
          const absoluteIdx = arr.findIndex(s => s.id === targetSection.id)
          arr.splice(absoluteIdx + 1, 0, ns)
        } else {
          const footerI = arr.findIndex(s => s.type === "footer")
          if (footerI !== -1) arr.splice(footerI, 0, ns)
          else arr.push(ns)
        }
      } else if (capturedInsertAtIndex === -1) {
        // Explicit "before footer" signal
        const footerI = arr.findIndex(s => s.type === "footer")
        if (footerI !== -1) arr.splice(footerI, 0, ns)
        else arr.push(ns)
      } else {
        // capturedInsertAtIndex is null but NOT announcement/ticker
        // Default: insert before footer
        const footerIdx = arr.findIndex(s => s.type === "footer")
        if (footerIdx !== -1) arr.splice(footerIdx, 0, ns)
        else arr.push(ns)
      }

      return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }

    } else {
      // ── Non-home pages ────────────────────────────────────────────────────
      const current = getPageSections(p, key)
      const realSections = current.filter((s: any) =>
        s.id !== "__category_grid__" && s.id !== "__category_products__" &&
        s.id !== "__collections_grid__" && s.id !== "__collection_products__"
      )
      const virtualSections = current.filter((s: any) =>
        s.id === "__category_grid__" || s.id === "__category_products__" ||
        s.id === "__collections_grid__" || s.id === "__collection_products__"
      )
      const insertIdx = capturedInsertAtIndex !== null ? capturedInsertAtIndex + 1 : realSections.length
      realSections.splice(insertIdx, 0, ns)
      // For category layout, always put virtual sections (category_products) BEFORE real sections
      return key === "category"
        ? setPageSections(p, key, [...virtualSections, ...realSections])
        : setPageSections(p, key, [...realSections, ...virtualSections])
    }
  })
   console.log("✅ addSection complete — new section id:", ns.id, "type:", type)

  setInsertAtIndex(null)
  setSelectedId(ns.id)
  setAddSectionOpen(false)
  setActiveTab("layout")
  setLeftPanelOpen(false)
  setRightPanelOpen(true)
}

const addSectionAferId = (type: SectionType, afterId: string | null) => {
    const ns: StoreSection = {
      id: genId(), type,
      ...(type === "hero"         ? { headline: "Your Headline", subtext: "Your tagline goes here", cta_label: "Shop Now", cta_secondary_label: "Browse all", cta_secondary_url: "/products" } : {}),
      ...(type === "collection"   ? { title: "All Products", limit: 12, columns: 3, show_sold_out: true } : {}),
      ...(type === "featured"     ? { title: "Featured Drops", limit: 4, columns: 4 } : {}),
      ...(type === "about"        ? { title: "About Me", text: "Share your story..." } : {}),
      ...(type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: BRAND.primary, text_color: "#ffffff" } : {}),
      ...(type === "social"       ? { show_instagram: true, show_youtube: true, show_twitter: true } : {}),
      ...(type === "video"        ? { title: "Watch me", video_url: "" } : {}),
      ...(type === "text"         ? { text: "Add your content here." } : {}),
      ...(type === "links"        ? { title: "My Links", links: [{ id: genId(), label: "My YouTube", url: "https://youtube.com" }, { id: genId(), label: "Latest Drop", url: "#" }] } : {}),
      ...(type === "html"         ? { html_content: "<div style=\"padding:40px;text-align:center\">\n  <h2>Custom Section</h2>\n</div>" } : {}),
      ...(type === "featured_collections" ? { title: "Shop by Collection", collection_ids: [], columns: 3 } : {}),
      ...(type === "ticker"       ? { ticker_items: ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"], ticker_speed: 40, ticker_separator: "✦", background_color: "#111827", text_color: "#ffffff" } : {}),
      ...(type === "image_text"   ? { title: "Our Story", text: "Share something meaningful.", image_position: "left", cta_label: "Learn More", cta_url: "#about" } : {}),
      ...(type === "video_text"   ? { title: "Watch & Shop", text: "Tell your audience what this video is about.", image_position: "left", video_text_url: "", cta_label: "Shop Now", cta_url: "/products" } : {}),
      ...(type === "featured_product" ? { title: "Fan Favourite", text: "Describe why this product is special.", image_position: "right", cta_label: "Get Yours", cta_url: "/products" } : {}),
    }
    patchStore(p => {
      const arr = [...(p.sections?.sections ?? [])]
      if (afterId) {
        const afterIdx = arr.findIndex(s => s.id === afterId)
        if (afterIdx !== -1) {
          arr.splice(afterIdx + 1, 0, ns)
          return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
        }
      }
      const footerI = arr.findIndex(s => s.type === "footer")
      if (footerI !== -1) arr.splice(footerI, 0, ns)
      else arr.push(ns)
      return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
    })
    setInsertAtIndex(null)
    setSelectedId(ns.id)
    setAddSectionOpen(false)
    setActiveTab("layout")
    setLeftPanelOpen(false)
    setRightPanelOpen(true)
  }
  
  const handleDragStart = (id: string) => setIsDragging(id)
  const handleDragOver  = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx) }
  const handleDrop      = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (!isDragging) return
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr     = [...getPageSections(p, key)]
      const fromIdx = arr.findIndex(s => s.id === isDragging)
      if (fromIdx === -1) return p
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      return setPageSections(p, key, arr)
    })
    setIsDragging(null); setDragOver(null)
  }
  const handleBodyDrop     = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging) return
    // Don't handle drops of header-zone sections
    const isHeaderZone = headerSections.some(h => h.id === isDragging)
    if (isHeaderZone) return
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr     = [...getPageSections(p, key)]
      const fromIdx = arr.findIndex(s => s.id === isDragging)
      if (fromIdx === -1) return p
      const [moved] = arr.splice(fromIdx, 1)
      const toIdx   = dragOver !== null ? dragOver : arr.length
      arr.splice(toIdx, 0, moved)
      return setPageSections(p, key, arr)
    })
    setIsDragging(null); setDragOver(null)
  }
  const handleBodyDragOver = (e: React.DragEvent) => e.preventDefault()

  // ── Page helpers ──────────────────────────────────────────────────────────
  const savePage = (page: StorePage) => {
    const existing = pages.find(p => p.id === page.id)
    const updated  = existing
      ? pages.map(p => p.id === page.id ? page : p)
      : [...pages, page]
    patchStore(p => {
      const freshStore = { ...p, pages: { pages: updated } }
      fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(freshStore),
      })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}`)
          setHasUnsavedChanges(false)
          toast({ title: "Page saved ✓", description: "Your page has been updated." })
          if (iframeRef.current) {
            const src = iframeRef.current.src
            iframeRef.current.src = ""
            setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src }, 100)
          }
        })
        .catch(e => toast({ title: "Save failed", description: String(e), variant: "destructive" }))
      return freshStore
    })
    setEditingPage(null)
  }

  const deletePage = (id: string) => {
    patchStore(p => ({ ...p, pages: { pages: pages.filter(pg => pg.id !== id) } }))
    if (editingPage?.id === id) setEditingPage(null)
  }

  const startNewPage = (template: PageTemplate) => {
    const tmpl  = PAGE_TEMPLATES.find(t => t.id === template)!
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    const content = tmpl.defaultContent.replace("{{CREATED_DATE}}", today)
    setEditingPage({
      id: `page_${Date.now()}`,
      title: tmpl.label === "Blank" ? "New Page" : tmpl.label,
      slug: slugify(tmpl.label),
      template, content, in_nav: true, in_footer: false,
      created_at: new Date().toISOString(),
    })
  }

  // ── Selected section ──────────────────────────────────────────────────────
  const selectedSection = selectedId
    ? (sections.find(s => s.id === selectedId) ?? homeSections.find(s => s.id === selectedId) ?? null)
    : null

  // ── Preview URL ───────────────────────────────────────────────────────────
  const basePreviewUrl = vendorHandle ? getPreviewUrl(vendorHandle) : null
  const previewUrl = (() => {
    if (!basePreviewUrl) return null
    try {
      const u = new URL(basePreviewUrl)
      if (previewPagePath !== "/") {
        u.pathname = u.pathname.replace(/\/$/, "") + previewPagePath
      }
      return u.toString()
    } catch {
      if (previewPagePath === "/") return basePreviewUrl
      const [base, qs] = basePreviewUrl.split("?")
      return `${base.replace(/\/$/, "")}${previewPagePath}${qs ? "?" + qs : ""}`
    }
  })()

  // ── Virtual panel flags ───────────────────────────────────────────────────
  const isProductDetailPanel      = selectedId === "__product_detail__"
  const isCategoryGridPanel       = selectedId === "__category_grid__"
  const isCategoryProductsPanel   = selectedId === "__category_products__"
  const isCollectionsGridPanel    = selectedId === "__collections_grid__"
  const isCollectionProductsPanel = selectedId === "__collection_products__"
  const isVirtualPanel = isProductDetailPanel || isCategoryGridPanel ||
    isCategoryProductsPanel || isCollectionsGridPanel || isCollectionProductsPanel

  const categoryGridSection = isCategoryGridPanel
    ? (getPageSections(store, "categories").find((s: any) => s.id === "__category_grid__")
      ?? { id: "__category_grid__", type: "category_grid" as SectionType, title: "Categories", columns: 4 })
    : null
  const collectionsGridSection = isCollectionsGridPanel
    ? (getPageSections(store, "collections").find((s: any) => s.id === "__collections_grid__")
      ?? { id: "__collections_grid__", type: "collections_grid" as SectionType, title: "Collections", columns: 3 })
    : null
  const categoryProductsSection = isCategoryProductsPanel
    ? (getPageSections(store, "category").find((s: any) => s.id === "__category_products__")
      ?? { id: "__category_products__", type: "category_products" as SectionType, title: "Products", columns: 3 })
    : null
  const collectionProductsSection = isCollectionProductsPanel
    ? (getPageSections(store, "collection").find((s: any) => s.id === "__collection_products__")
      ?? { id: "__collection_products__", type: "collection_products" as SectionType, title: "Products", columns: 3 })
    : null

  // ── Loading screen ────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )

  // ── Add section picker (reused in left panel) ─────────────────────────────
  const AddSectionPicker = ({ afterIndex, zone }: { afterIndex: number; zone: string }) => {
    const isOpen = addSectionOpen && insertAtIndex === afterIndex
    return (
      <div className="pt-1">
        <button
          onClick={() => {
            if (isOpen) { setAddSectionOpen(false); setInsertAtIndex(null) }
            else { setInsertAtIndex(afterIndex); setAddSectionOpen(true); setAddSectionFilter("all") }
          }}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            isOpen
              ? isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-500"
              : isDark ? `${textFaint} ${hoverBg}` : `text-gray-400 ${hoverBg}`
          }`}
        >
          <Plus className="w-3 h-3" /> Add section
        </button>
        {isOpen && (
          <div className={`mt-1 rounded-xl border overflow-hidden shadow-xl ${
            isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}>
            <div className={`flex items-center justify-between px-2 py-1.5 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>Add section</span>
              <button onClick={() => { setAddSectionOpen(false); setInsertAtIndex(null) }}
                className={`p-0.5 rounded ${textFaint} hover:text-red-400`}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className={`flex gap-1 p-1.5 overflow-x-auto border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              {[{ id: "all", label: "All" }, ...SECTION_CATEGORIES].map(cat => (
                <button key={cat.id} onClick={() => setAddSectionFilter(cat.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                    addSectionFilter === cat.id ? "bg-orange-500 text-white" : `${textFaint} ${hoverBg}`
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-52">
              {SECTION_BLOCKS_WITH_ICONS
                .filter(b => {
                  const allowed = PAGE_ALLOWED_SECTIONS[currentLayoutKey] ?? PAGE_ALLOWED_SECTIONS.home
                  return allowed.includes(b.type) &&
                    !["ticker", "announcement"].includes(b.type) &&
                    (addSectionFilter === "all" || b.category === addSectionFilter)
                })
                .map(block => (
                  <button key={block.type} onClick={() => addSection(block.type)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 transition-all text-left ${hoverBg} border-t ${
                      isDark ? "border-gray-700/50" : "border-gray-100"
                    }`}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
                      style={{ background: `${block.color}20`, color: block.color }}>
                      {block.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${textPrimary}`}>{block.label}</p>
                      <p className={`text-[10px] ${textFaint}`}>{block.desc}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Right panel content ───────────────────────────────────────────────────
  const RightPanelContent = (isVirtualPanel || selectedSection) ? (
    <>
      <div className="flex justify-center pt-2 pb-1 md:hidden shrink-0">
        <div className="w-10 h-1 bg-gray-600 rounded-full" />
      </div>
      <div className={`flex items-center justify-between px-3 py-2.5 border-b shrink-0 ${panelBorder}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${textPrimary}`}>
            {isProductDetailPanel      ? "Product Detail"      :
             isCategoryGridPanel       ? "Category Grid"       :
             isCategoryProductsPanel   ? "Category Products"   :
             isCollectionsGridPanel    ? "Collections Grid"    :
             isCollectionProductsPanel ? "Collection Products" :
             selectedSection?.type === "header" ? "Store Header" :
             SECTION_BLOCKS_WITH_ICONS.find(b => b.type === selectedSection?.type)?.label ?? selectedSection?.type}
          </span>
        </div>
        <button onClick={() => { setSelectedId(null); setRightPanelOpen(false) }}
          className={`p-1 ${textFaint} transition-colors`}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto overscroll-contain">
        {isProductDetailPanel ? (
          <ProductDetailSettings
            settings={store.product_detail ?? {}}
            onChange={patch => patchStore(p => ({ ...p, product_detail: { ...(p.product_detail ?? {}), ...patch } }))}
            isDark={isDark}
          />
        ) : isCategoryGridPanel && categoryGridSection ? (
          <SectionSettings
            section={categoryGridSection as any}
            onChange={patch => {
              const existing = getPageSections(store, "categories")
              const updated  = existing.find((s: any) => s.id === "__category_grid__")
                ? existing.map((s: any) => s.id === "__category_grid__" ? { ...s, ...patch } : s)
                : [{ id: "__category_grid__", type: "category_grid", ...patch }, ...existing]
              patchStore(p => setPageSections(p, "categories", updated))
            }}
            token={token ?? ""} backendUrl={backendUrl} isDark={isDark}
            collections={vendorCollections} categories={vendorCategories}
            pages={pages} storeLogo={store.store_logo ?? ""}
            products={vendorProducts} vendorHandle={vendorHandle}
            currentLayoutKey="categories"
          />
        ) : isCategoryProductsPanel && categoryProductsSection ? (
          <SectionSettings
            section={categoryProductsSection as any}
            onChange={patch => {
              const existing = getPageSections(store, "category")
              const updated  = existing.find((s: any) => s.id === "__category_products__")
                ? existing.map((s: any) => s.id === "__category_products__" ? { ...s, ...patch } : s)
                : [...existing, { id: "__category_products__", type: "category_products", ...patch }]
              patchStore(p => setPageSections(p, "category", updated))
            }}
            token={token ?? ""} backendUrl={backendUrl} isDark={isDark}
            collections={vendorCollections} categories={vendorCategories}
            pages={pages} storeLogo={store.store_logo ?? ""}
            products={vendorProducts} vendorHandle={vendorHandle}
            currentLayoutKey="category"
          />
        ) : isCollectionsGridPanel && collectionsGridSection ? (
          <SectionSettings
            section={collectionsGridSection as any}
            onChange={patch => {
              const existing = getPageSections(store, "collections")
              const updated  = existing.find((s: any) => s.id === "__collections_grid__")
                ? existing.map((s: any) => s.id === "__collections_grid__" ? { ...s, ...patch } : s)
                : [{ id: "__collections_grid__", type: "collections_grid", ...patch }, ...existing]
              patchStore(p => setPageSections(p, "collections", updated))
            }}
            token={token ?? ""} backendUrl={backendUrl} isDark={isDark}
            collections={vendorCollections} categories={vendorCategories}
            pages={pages} storeLogo={store.store_logo ?? ""}
            products={vendorProducts} vendorHandle={vendorHandle}
            currentLayoutKey="collections"
          />
        ) : isCollectionProductsPanel && collectionProductsSection ? (
          <SectionSettings
            section={collectionProductsSection as any}
            onChange={patch => {
              const existing = getPageSections(store, "collection")
              const updated  = existing.find((s: any) => s.id === "__collection_products__")
                ? existing.map((s: any) => s.id === "__collection_products__" ? { ...s, ...patch } : s)
                : [...existing, { id: "__collection_products__", type: "collection_products", ...patch }]
              patchStore(p => setPageSections(p, "collection", updated))
            }}
            token={token ?? ""} backendUrl={backendUrl} isDark={isDark}
            collections={vendorCollections} categories={vendorCategories}
            pages={pages} storeLogo={store.store_logo ?? ""}
            products={vendorProducts} vendorHandle={vendorHandle}
            currentLayoutKey="collection"
          />
        ) : selectedSection ? (
          <SectionSettings
            section={selectedSection}
            onChange={patch => updateSection(selectedSection.id, patch)}
            token={token ?? ""} backendUrl={backendUrl} isDark={isDark}
            collections={vendorCollections} categories={vendorCategories}
            pages={pages} storeLogo={store.store_logo ?? ""}
            products={vendorProducts} vendorHandle={vendorHandle}
            currentLayoutKey={currentLayoutKey}
          />
        ) : null}
      </div>

      {!isVirtualPanel && selectedSection && (
        <div className={`border-t ${panelBorder} px-3 py-2 flex gap-1.5 shrink-0`}>
          <button onClick={() => moveSection(selectedSection.id, "up")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
              isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}>
            <ChevronUp className="w-3 h-3" />Up
          </button>
          <button onClick={() => moveSection(selectedSection.id, "down")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
              isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}>
            <ChevronDown className="w-3 h-3" />Down
          </button>
          <button onClick={() => duplicateSection(selectedSection.id)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
              isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`} title="Duplicate">
            <Copy className="w-3 h-3" />
          </button>
          <button onClick={() => toggleSection(selectedSection.id)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
              isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`} title={selectedSection.hidden ? "Show" : "Hide"}>
            {selectedSection.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button onClick={() => removeSection(selectedSection.id)}
            className="px-2.5 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-900/30 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  ) : null
 

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
      <style>{`
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className={`flex items-center justify-between px-3 py-2 border-b shrink-0 z-20 ${panelBg} ${panelBorder}`}>
        <div className="flex items-center min-w-0 gap-2">
          <button
            className={`md:hidden p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}
            onClick={() => setLeftPanelOpen(o => !o)}>
            <Menu className="w-4 h-4" />
          </button>
          <button
            className={`hidden md:flex items-center justify-center p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            onClick={() => setLeftPanelCollapsed(c => !c)}>
            {leftPanelCollapsed ? <Menu className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          <Link to="/store" className={`flex items-center gap-1 text-xs ${textMuted} transition-colors shrink-0`}>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
          <span className={`text-sm font-semibold ${textPrimary} hidden sm:inline`}>Store Editor</span>
        </div>

        <div className="flex items-center gap-2">
          <PageSwitcherDropdown
            currentPath={previewPagePath}
            onSelect={path => { setPreviewPagePath(path); setSelectedId(null); setRightPanelOpen(false) }}
            pages={pages}
            products={vendorProducts}
            collections={vendorCollections}
            categories={vendorCategories}
            isDark={isDark}
            panelBorder={panelBorder}
            textPrimary={textPrimary}
            textFaint={textFaint}
            hoverBg={hoverBg}
          />
          <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            <button onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-md transition-colors ${viewport === "desktop" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}>
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-md transition-colors ${viewport === "mobile" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}>
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {vendorHandle && (
            <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
              className={`hidden sm:flex items-center gap-1 text-xs ${textMuted} px-2 py-1.5 rounded-lg border ${panelBorder} transition-colors`}>
              <ExternalLink className="w-3 h-3" />Visit
            </a>
          )}
          <button onClick={() => { setIframeReady(false); iframeRef.current?.contentWindow?.location.reload() }}
            className={`p-1.5 ${textMuted} transition-colors hidden sm:block`}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleToggleStatus} disabled={isTogglingStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isLive
                ? "bg-green-500/15 border-green-500/40 text-green-400 hover:bg-green-500/25"
                : "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
            }`}>
            {isTogglingStatus
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-gray-500"}`} />
            }
            {isLive ? "Live" : "Draft"}
          </button>
          <button onClick={() => setEditorTheme(t => t === "dark" ? "light" : "dark")}
            className={`p-1.5 rounded-md transition-colors ${isDark ? "text-yellow-400" : "text-gray-500"}`}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Button size="sm" onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`gap-1 px-3 text-xs text-white h-7 transition-colors ${
              hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-500 cursor-default"
            }`}>
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            <span className="hidden sm:inline">{hasUnsavedChanges ? "Save" : "Saved"}</span>
          </Button>
        </div>
      </div>

      {/* ── 3-PANEL BODY ── */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {leftPanelOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setLeftPanelOpen(false)} />
        )}

        {/* Left panel */}
        <div className={`flex flex-col border-r overflow-hidden ${panelBg} ${panelBorder} md:shrink-0 md:relative md:translate-x-0 md:z-auto md:shadow-none fixed top-0 bottom-0 left-0 z-40 w-72 transition-all duration-300 ${
          leftPanelOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${leftPanelCollapsed ? "md:w-0 md:border-r-0" : "md:w-65"}`}>
          <div className={`md:hidden flex items-center justify-between px-3 py-2.5 border-b ${panelBorder}`}>
            <span className={`text-sm font-semibold ${textPrimary}`}>Editor</span>
            <button onClick={() => setLeftPanelOpen(false)}
              className={`p-1 rounded-lg ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
         {!leftPanelCollapsed && (
            <LeftPanel
              activeTab={activeTab} setActiveTab={setActiveTab}
              store={store}
              isDark={isDark} panelBg={panelBg} panelBorder={panelBorder}
              bodySectionPickerOpen={bodySectionPickerOpen}
              setBodySectionPickerOpen={setBodySectionPickerOpen}
              textPrimary={textPrimary} textMuted={textMuted} textFaint={textFaint}
              hoverBg={hoverBg} inputCls={inputCls}
              sections={sections} bodySections={bodySections}
              headerSections={headerSections} footerSections={footerSections}
              homeSections={homeSections}
              selectedId={selectedId} setSelectedId={setSelectedId}
              isDragging={isDragging} setIsDragging={setIsDragging}
              dragOver={dragOver} setDragOver={setDragOver}
              addSectionOpen={addSectionOpen} setAddSectionOpen={setAddSectionOpen}
              addSectionFilter={addSectionFilter} setAddSectionFilter={setAddSectionFilter}
              insertAtIndex={insertAtIndex} setInsertAtIndex={setInsertAtIndex}
              currentLayoutKey={currentLayoutKey} currentLayoutMeta={currentLayoutMeta}
              pages={pages} vendorCollections={vendorCollections}
              vendorCategories={vendorCategories} vendorProducts={vendorProducts}
              vendorHandle={vendorHandle} 
              storeLogo={store.store_logo}
              storeFavicon={store.store_favicon}
              storeStatus={store.status}
              storeSubdomain={store.subdomain}
              storeTemplate={store.template}
              storeFont={store.font}
              storePrimaryColor={store.primary_color}
              storeSecondaryColor={store.secondary_color}
              storeCustomDomain={store.custom_domain}
              storeSeoTitle={store.seo_title}
              storeSeoDescription={store.seo_description}
              storeOgImage={store.og_image}
              storeProductCard={store.product_card}
              storeStickyHeader={store.sticky_header}
              storeStickyAnnouncement={store.sticky_announcement}
              storeInstagram={store.instagram_url}
              storeYoutube={store.youtube_url}
              storeTwitter={store.twitter_url}
              storeFacebook={store.facebook_url}
              storeCustomCss={store.custom_css}
              storeDomainVerified={store.domain_verified}
              storeTagline={store.tagline}
              storeHeroImage={store.hero_image}
              isUploadingLogo={isUploadingLogo}
              isUploadingFav={isUploadingFav}
              isUploadingOg={isUploadingOg}
              setIsUploadingLogo={setIsUploadingLogo}
              setIsUploadingFav={setIsUploadingFav}
              setIsUploadingOg={setIsUploadingOg}
              updateSection={updateSection}
              store_product_detail={store.product_detail}
              fileLogoRef={fileLogoRef} fileFavRef={fileFavRef} fileOgRef={fileOgRef}
              uploadFile={uploadFile} setStore={setStore} patchStore={patchStore}
              addSection={addSection} removeSection={removeSection}
              duplicateSection={duplicateSection} toggleSection={toggleSection}
              moveSection={moveSection} handleDragStart={handleDragStart}
              handleDragOver={handleDragOver} handleDrop={handleDrop}
              handleBodyDrop={handleBodyDrop} handleBodyDragOver={handleBodyDragOver}
              setRightPanelOpen={setRightPanelOpen} setLeftPanelOpen={setLeftPanelOpen}
              setHeaderPickerOpen={setHeaderPickerOpen}
              editingPage={editingPage} setEditingPage={setEditingPage}
              savePage={savePage} deletePage={deletePage} startNewPage={startNewPage}
              previewPagePath={previewPagePath} hasStore={hasStore}
              token={token} backendUrl={backendUrl}
              triggerDrillId={triggerDrillId}
            />
          )}
        </div>

        {/* Center preview */}
        <div className={`relative flex flex-col items-center flex-1 min-w-0 min-h-0 overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
          <div className={`relative transition-all duration-300 flex-1 overflow-hidden w-full min-h-0 ${
            viewport === "mobile" ? "max-w-[390px] rounded-[2rem] border-4 border-gray-700 shadow-2xl my-2 mx-auto" : ""
          }`}>
            {!iframeReady && (
              <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Loading preview...</p>
              </div>
            )}
            {previewUrl && (
              <iframe ref={iframeRef} src={previewUrl}
                className="w-full h-full bg-white border-0"
                onLoad={() => setIframeReady(true)}
                title="Store preview" allow="same-origin" />
            )}
            {iframeReady && !selectedId && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white/70 pointer-events-none whitespace-nowrap">
                Click any section to edit it
              </div>
            )}
          </div>
        </div>

        {/* Right panel — desktop */}
        {rightPanelOpen && selectedSection && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setRightPanelOpen(false)} />
        )}
        {/* <div className={`flex-col border-l overflow-hidden transition-all duration-300 ${panelBg} ${panelBorder} hidden md:flex ${
          (selectedSection || isVirtualPanel) ? "md:w-72" : "md:w-0 md:border-l-0"
        }`}>
          {RightPanelContent}
        </div> */}

        {/* Right panel — mobile */}
        {/* <div className={`md:hidden fixed left-0 right-0 bottom-0 z-40 flex flex-col ${panelBg} border-t ${panelBorder} rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          rightPanelOpen && (selectedSection || isVirtualPanel) ? "translate-y-0" : "translate-y-full"
        }`} style={{ maxHeight: "70vh", minHeight: (selectedSection || isProductDetailPanel) ? "300px" : undefined }}>
          {RightPanelContent}
        </div> */}
      </div>

      {/* ── Header section picker modal ── */}
      {headerPickerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setHeaderPickerOpen(false)}>
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <h3 className={`text-base font-semibold ${textPrimary}`}>Add section</h3>
              <button onClick={() => setHeaderPickerOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${hoverBg} ${textFaint}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {[
              { type: "announcement" as SectionType, label: "Announcement bar", desc: "Top banner with a short promotional message", color: "#f59e0b" },
              { type: "ticker"       as SectionType, label: "Scrolling ticker",  desc: "Animated marquee strip for offers or updates",  color: "#6366f1" },
            ].map((item, idx) => (
              <button key={item.type}
                onClick={() => {
                  const ns: StoreSection = {
                    id: genId(), type: item.type,
                    ...(item.type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: "#e65100", text_color: "#ffffff" } : {}),
                    ...(item.type === "ticker" ? { ticker_items: ["Free shipping on orders above ₹999", "New drops every week"], ticker_speed: 40, ticker_separator: "✦", background_color: "#111827", text_color: "#ffffff" } : {}),
                  }
                  patchStore(p => ({ ...p, sections: { ...p.sections, sections: [ns, ...(p.sections?.sections ?? [])] } }))
                  setSelectedId(ns.id)
                  setRightPanelOpen(true)
                  setHeaderPickerOpen(false)
                  setHasUnsavedChanges(true)
                }}
                className={`w-full flex items-center gap-4 px-5 py-5 text-left transition-colors ${
                  idx < 1 ? `border-b ${isDark ? "border-gray-800" : "border-gray-100"}` : ""
                } ${isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50"}`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
                  style={{ background: `${item.color}15`, color: item.color }}>
                  {item.type === "announcement" ? <Megaphone className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textPrimary}`}>{item.label}</p>
                  <p className={`text-xs mt-1 leading-relaxed ${textFaint}`}>{item.desc}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDark
                    ? "bg-gray-700 text-gray-200 hover:bg-orange-500/20 hover:text-orange-400"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}>Add</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Body section picker modal ── */}
      {bodySectionPickerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setBodySectionPickerOpen(false); setInsertAtIndex(null) }}>
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <h3 className={`text-base font-semibold ${textPrimary}`}>Add section</h3>
              <button onClick={() => { setBodySectionPickerOpen(false); setInsertAtIndex(null) }}
                className={`p-1.5 rounded-lg transition-colors ${hoverBg} ${textFaint}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category filter tabs */}
            <div className={`flex gap-1.5 p-3 border-b overflow-x-auto ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              {[{ id: "all", label: "All" }, ...SECTION_CATEGORIES].map(cat => (
                <button key={cat.id} onClick={() => setAddSectionFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    addSectionFilter === cat.id ? "bg-orange-500 text-white" : `${textFaint} ${hoverBg}`
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Section blocks */}
            <div className="overflow-y-auto max-h-[60vh]">
              {SECTION_BLOCKS_WITH_ICONS
                .filter(b => {
                  const allowed = PAGE_ALLOWED_SECTIONS[currentLayoutKey] ?? PAGE_ALLOWED_SECTIONS.home
                  return allowed.includes(b.type) &&
                    !["ticker", "announcement"].includes(b.type) &&
                    (addSectionFilter === "all" || b.category === addSectionFilter)
                })
                .map((block, idx, arr) => (
                  <button key={block.type}
                    onClick={() => {
                      const idx = insertAtIndex !== null ? insertAtIndex : bodySections.length - 1
                      const safeIdx = Math.max(idx, 0)
                      const targetId = bodySections[safeIdx]?.id ?? null
                      addSectionAferId(block.type, targetId)
                      setBodySectionPickerOpen(false)
                      setInsertAtIndex(null)
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                      idx < arr.length - 1 ? `border-b ${isDark ? "border-gray-800" : "border-gray-100"}` : ""
                    } ${isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl shrink-0"
                      style={{ background: `${block.color}15`, color: block.color }}>
                      {block.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${textPrimary}`}>{block.label}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${textFaint}`}>{block.desc}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
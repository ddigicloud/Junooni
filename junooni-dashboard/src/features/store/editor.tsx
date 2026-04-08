"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Radio, Zap, Moon, Sun, MoreVertical, Columns,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "header" | "hero" | "featured" | "collection" | "featured_collections" | "about" | "social" |
  "announcement" | "divider" | "image" | "text" | "html" | "video" | "links" | "footer"
type EditorTab = "layout" | "style" | "pages" | "theme"
type PageTemplate = "blank" | "about" | "faq" | "contact" | "links"

interface NavItem { id: string; label: string; url: string; external?: boolean; children?: NavItem[] }

interface StoreSection {
  id: string; type: SectionType; hidden?: boolean
  title?: string; headline?: string; subtext?: string
  cta_label?: string; cta_url?: string; cta_secondary_label?: string; cta_secondary_url?: string
  background_image?: string; background_color?: string; text_color?: string
  text?: string; image?: string; image_position?: "left" | "right"
  product_ids?: string[]; collection_ids?: string[]; limit?: number; columns?: 2 | 3 | 4; show_sold_out?: boolean
  show_instagram?: boolean; show_youtube?: boolean; show_twitter?: boolean; show_facebook?: boolean
  html_content?: string; video_url?: string; video_autoplay?: boolean
  links?: { id: string; label: string; url: string; icon?: string }[]
  // header-specific
  logo_position?: "left" | "center"; show_social_icons?: boolean; nav_items?: NavItem[]
  // footer-specific
  footer_nav_items?: NavItem[]; show_newsletter?: boolean
}

interface StorePage {
  id: string; title: string; slug: string; template: PageTemplate
  content: string; in_nav: boolean; in_footer: boolean; created_at: string
}

interface ProductCardSettings {
  aspect_ratio?: "square" | "portrait" | "landscape"
  show_price?: boolean; show_hover?: boolean; alignment?: "left" | "center"
  show_sold_out_badge?: boolean; columns_desktop?: 3 | 4 | 5
}

interface VendorStore {
  id?: string; subdomain?: string; custom_domain?: string; domain_verified?: boolean
  template?: string; status?: string; font?: string
  primary_color?: string; secondary_color?: string; accent_color?: string
  background_color?: string; text_color?: string; hero_image?: string
  tagline?: string; announcement_text?: string
  store_logo?: string; store_favicon?: string
  sections?: { sections: StoreSection[] }
  pages?: { pages: StorePage[] }
  seo_title?: string; seo_description?: string; og_image?: string
  border_radius?: "none" | "sm" | "md" | "lg" | "full"
  button_style?: "filled" | "outline" | "ghost"
  product_card?: ProductCardSettings
  sticky_header?: boolean; sticky_announcement?: boolean
  // social links
  instagram_url?: string; youtube_url?: string; twitter_url?: string
  facebook_url?: string; tiktok_url?: string; discord_url?: string
  // custom css
  custom_css?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

const SECTION_BLOCKS = [
  { type: "announcement" as SectionType, label: "Announcement Bar", icon: <Megaphone className="w-3.5 h-3.5" />, desc: "Top banner with message", color: "#f59e0b", category: "layout" },
  { type: "hero"         as SectionType, label: "Hero Banner",      icon: <ImageIcon className="w-3.5 h-3.5" />, desc: "Big headline + CTA buttons", color: "#8b5cf6", category: "layout" },
  { type: "collection"   as SectionType, label: "Product Grid",     icon: <ShoppingBag className="w-3.5 h-3.5" />, desc: "All products / filtered grid", color: "#e65100", category: "products" },
  { type: "featured"     as SectionType, label: "Featured Products",icon: <Star className="w-3.5 h-3.5" />, desc: "Hand-picked highlights", color: "#ec4899", category: "products" },
  { type: "featured_collections" as SectionType, label: "Collections Showcase", icon: <Layers className="w-3.5 h-3.5" />, desc: "Pick collections to feature", color: "#7c3aed", category: "products" },
  { type: "about"        as SectionType, label: "About",            icon: <BookOpen className="w-3.5 h-3.5" />, desc: "Story + image block", color: "#10b981", category: "content" },
  { type: "text"         as SectionType, label: "Text Block",       icon: <Type className="w-3.5 h-3.5" />, desc: "Rich text / Markdown", color: "#14b8a6", category: "content" },
  { type: "image"        as SectionType, label: "Image",            icon: <ImageIcon className="w-3.5 h-3.5" />, desc: "Full-width image", color: "#6366f1", category: "content" },
  { type: "video"        as SectionType, label: "Video",            icon: <Video className="w-3.5 h-3.5" />, desc: "YouTube / Vimeo embed", color: "#f43f5e", category: "content" },
  { type: "social"       as SectionType, label: "Social Links",     icon: <Share2 className="w-3.5 h-3.5" />, desc: "Instagram, YouTube etc.", color: "#3b82f6", category: "content" },
  { type: "links"        as SectionType, label: "Link List",        icon: <LinkIcon className="w-3.5 h-3.5" />, desc: "Bio-style link buttons", color: "#0ea5e9", category: "content" },
  { type: "html"         as SectionType, label: "Custom HTML",      icon: <Settings className="w-3.5 h-3.5" />, desc: "Raw HTML / CSS / JS", color: "#ef4444", category: "advanced" },
  { type: "divider"      as SectionType, label: "Divider",          icon: <Minus className="w-3.5 h-3.5" />, desc: "Visual separator", color: "#9ca3af", category: "layout" },
]

const SECTION_CATEGORIES = [
  { id: "layout",    label: "Layout" },
  { id: "products",  label: "Products" },
  { id: "content",   label: "Content" },
  { id: "advanced",  label: "Advanced" },
]

const FONTS = [
  { id: "inter",      name: "Inter",           class: "font-sans" },
  { id: "poppins",    name: "Poppins",         class: "font-sans" },
  { id: "playfair",   name: "Playfair Display",class: "font-serif" },
  { id: "dm-sans",    name: "DM Sans",         class: "font-sans" },
  { id: "space-grotesk", name: "Space Grotesk",class: "font-sans" },
]

const TEMPLATES = [
  { id: "minimal",   name: "Minimal",   desc: "Clean, white" },
  { id: "bold",      name: "Bold",      desc: "Dark & dramatic" },
  { id: "editorial", name: "Editorial", desc: "Magazine style" },
]

const PAGE_TEMPLATES = [
  { id: "blank" as PageTemplate,   label: "Blank",   icon: "📄", defaultContent: "" },
  { id: "about" as PageTemplate,   label: "About Me",icon: "👋", defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq" as PageTemplate,     label: "FAQ",     icon: "❓", defaultContent: "## Frequently Asked Questions\n\n**Q: How long does shipping take?**\nA: 5-7 business days.\n\n**Q: Do you ship internationally?**\nA: Yes!" },
  { id: "contact" as PageTemplate, label: "Contact", icon: "✉️", defaultContent: "## Contact Us\n\nReach out at your@email.com\n\nWe typically respond within 24 hours." },
  { id: "links" as PageTemplate,   label: "Links",   icon: "🔗", defaultContent: "" },
]

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
function genId() { return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StoreEditorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const fileLogoRef = useRef<HTMLInputElement>(null)
  const fileFavRef = useRef<HTMLInputElement>(null)
  const fileOgRef = useRef<HTMLInputElement>(null)

  const [store, setStore] = useState<VendorStore>({})
  const [vendorHandle, setVendorHandle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState<EditorTab>("layout")
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFav, setIsUploadingFav] = useState(false)
  const [isUploadingOg, setIsUploadingOg] = useState(false)
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("dark")
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [addSectionFilter, setAddSectionFilter] = useState("all")
  const [vendorCollections, setVendorCollections] = useState<{ id: string; title: string; handle: string }[]>([])
  const isDark = editorTheme === "dark"
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL

  const sections = (store.sections?.sections ?? []).map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  const pages = store.pages?.pages ?? []

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        const vRes = await fetch(`${backendUrl}/vendors/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (vRes.ok) { const vd = await vRes.json(); setVendorHandle(vd.vendor?.handle ?? "") }
        const sRes = await fetch(`${backendUrl}/vendors/me/store`, { headers: { Authorization: `Bearer ${token}` } })
        if (sRes.ok) {
          const sd = await sRes.json()
          if (sd.store) {
            const secs = (sd.store.sections?.sections ?? []).map((s: any, i: number) => ({ ...s, id: s.id ?? genId() }))
            setStore({ ...sd.store, sections: { sections: secs } })
            setHasStore(true)
          }
        }
        // Fetch vendor collections for the featured_collections section picker
        try {
          const colRes = await fetch(`${backendUrl}/vendors/me/store/collections`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (colRes.ok) {
            const colData = await colRes.json()
            const cols = colData.collections?.collections ?? colData.collections ?? []
            setVendorCollections(cols.map((c: any) => ({
              id:     c.id     ?? c.handle,
              title:  c.title  ?? c.name ?? c.handle,
              handle: c.handle ?? c.id,
            })))
          }
        } catch (e) { console.warn("Could not load collections for editor:", e) }
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  // ── postMessage listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "SECTION_CLICK") { setSelectedId(e.data.sectionId); setActiveTab("layout") }
      if (e.data?.type === "IFRAME_READY") { setIframeReady(true); setTimeout(() => syncToIframe(), 100) }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [store, selectedId])

  const syncToIframe = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "STORE_UPDATE", store, selectedId }, "*")
  }, [store, selectedId])

  useEffect(() => { if (iframeReady) syncToIframe() }, [store, selectedId, iframeReady])

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
      toast({ title: "Saved! ✓", description: "Your store has been updated." })
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
      toast({ title: newStatus === "live" ? "🎉 Store is now live!" : "Store set to draft", description: newStatus === "live" ? `Accessible at ${vendorHandle}.junooni.com` : "Visitors will see a coming soon page." })
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsTogglingStatus(false) }
  }

  // ── File upload helper ────────────────────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.files?.[0]?.url ?? null
  }

  // ── Section helpers ───────────────────────────────────────────────────────
  const patchStore = useCallback((updater: (p: VendorStore) => VendorStore) => setStore(updater), [])
  const updateSection = useCallback((id: string, patch: Partial<StoreSection>) => {
    patchStore(p => ({ ...p, sections: { sections: (p.sections?.sections ?? []).map(s => s.id === id ? { ...s, ...patch } : s) } }))
  }, [patchStore])
  const removeSection = (id: string) => {
    patchStore(p => ({ ...p, sections: { sections: (p.sections?.sections ?? []).filter(s => s.id !== id) } }))
    if (selectedId === id) setSelectedId(null)
  }
  const duplicateSection = (id: string) => {
    const arr = [...(store.sections?.sections ?? [])]
    const idx = arr.findIndex(s => s.id === id)
    if (idx === -1) return
    const copy = { ...arr[idx], id: genId() }
    arr.splice(idx + 1, 0, copy)
    patchStore(p => ({ ...p, sections: { sections: arr } }))
  }
  const toggleSection = (id: string) => {
    const s = sections.find(s => s.id === id)
    if (s) updateSection(id, { hidden: !s.hidden })
  }
  const moveSection = (id: string, dir: "up" | "down") => {
    const arr = [...(store.sections?.sections ?? [])]
    const i = arr.findIndex(s => s.id === id); const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    patchStore(p => ({ ...p, sections: { sections: arr } }))
  }
  const addSection = (type: SectionType) => {
    const ns: StoreSection = {
      id: genId(), type,
      ...(type === "hero" ? { headline: "Your Headline", subtext: "Your tagline goes here", cta_label: "Shop Now", cta_secondary_label: "Browse all" } : {}),
      ...(type === "collection" ? { title: "All Products", limit: 12, columns: 3, show_sold_out: true } : {}),
      ...(type === "featured" ? { title: "Featured Drops", limit: 4, columns: 4 } : {}),
      ...(type === "about" ? { title: "About Me", text: "Share your story..." } : {}),
      ...(type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: BRAND.primary, text_color: "#ffffff" } : {}),
      ...(type === "social" ? { show_instagram: true, show_youtube: true, show_twitter: true } : {}),
      ...(type === "video" ? { title: "Watch me", video_url: "" } : {}),
      ...(type === "text" ? { text: "Add your content here." } : {}),
      ...(type === "links" ? { title: "My Links", links: [{ id: genId(), label: "My YouTube", url: "https://youtube.com" }, { id: genId(), label: "Latest Drop", url: "#" }] } : {}),
      ...(type === "html" ? { html_content: "<div style=\"padding:40px;text-align:center\">\n  <h2>Custom Section</h2>\n  <p>Add any HTML here</p>\n</div>" } : {}),
      ...(type === "featured_collections" ? { title: "Shop by Collection", collection_ids: [], columns: 3 } : {}),
      ...(type === "header" ? { logo_position: "left", show_social_icons: false } : {}),
      ...(type === "footer" ? { show_newsletter: false } : {}),
    }
    patchStore(p => ({ ...p, sections: { sections: [...(p.sections?.sections ?? []), ns] } }))
    setSelectedId(ns.id)
    setAddSectionOpen(false)
    setActiveTab("layout")
  }
  const handleDragStart = (id: string) => setIsDragging(id)
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx) }
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (!isDragging) return
    const arr = [...(store.sections?.sections ?? [])]
    const fromIdx = arr.findIndex(s => s.id === isDragging)
    if (fromIdx === -1) return
    const [moved] = arr.splice(fromIdx, 1); arr.splice(toIdx, 0, moved)
    patchStore(p => ({ ...p, sections: { sections: arr } }))
    setIsDragging(null); setDragOver(null)
  }

  // ── Page helpers ──────────────────────────────────────────────────────────
  const savePage = (page: StorePage) => {
    const existing = pages.find(p => p.id === page.id)
    const updated = existing ? pages.map(p => p.id === page.id ? page : p) : [...pages, page]
    patchStore(p => ({ ...p, pages: { pages: updated } }))
    setEditingPage(null)
  }
  const deletePage = (id: string) => {
    patchStore(p => ({ ...p, pages: { pages: pages.filter(pg => pg.id !== id) } }))
    if (editingPage?.id === id) setEditingPage(null)
  }
  const startNewPage = (template: PageTemplate) => {
    const tmpl = PAGE_TEMPLATES.find(t => t.id === template)!
    setEditingPage({ id: `page_${Date.now()}`, title: tmpl.label === "Blank" ? "New Page" : tmpl.label, slug: slugify(tmpl.label), template, content: tmpl.defaultContent, in_nav: true, in_footer: false, created_at: new Date().toISOString() })
  }

  const selectedSection = selectedId ? sections.find(s => s.id === selectedId) ?? null : null
  const previewUrl = vendorHandle ? `http://localhost:3001/${vendorHandle}?__editor=1` : null
  const isLive = store.status === "live"

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  )

  // ── Panel helpers ─────────────────────────────────────────────────────────
  const panelBg = isDark ? "bg-gray-900" : "bg-white"
  const panelBorder = isDark ? "border-gray-800" : "border-gray-200"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textMuted = isDark ? "text-gray-400" : "text-gray-500"
  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  const inputCls = `bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-orange-500`
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>

      {/* ── TOP BAR ── */}
      <div className={`flex items-center justify-between px-3 py-2 border-b shrink-0 z-20 ${panelBg} ${panelBorder}`}>
        {/* Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link to="/store" className={`flex items-center gap-1 text-xs ${textMuted} hover:${textPrimary} transition-colors shrink-0`}>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className={`w-px h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
          <span className={`text-sm font-semibold ${textPrimary} hidden sm:inline`}>Store Editor</span>
        </div>

        {/* Center — viewport */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <button onClick={() => setViewport("desktop")} className={`p-1.5 rounded-md transition-colors ${viewport === "desktop" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}><Monitor className="w-3.5 h-3.5" /></button>
          <button onClick={() => setViewport("mobile")} className={`p-1.5 rounded-md transition-colors ${viewport === "mobile" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}><Smartphone className="w-3.5 h-3.5" /></button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {vendorHandle && (
            <a href={`http://localhost:3001/${vendorHandle}`} target="_blank" rel="noopener noreferrer"
              className={`hidden sm:flex items-center gap-1 text-xs ${textMuted} hover:${textPrimary} px-2 py-1.5 rounded-lg border ${panelBorder} transition-colors`}>
              <ExternalLink className="w-3 h-3" />Visit
            </a>
          )}
          <button onClick={() => { setIframeReady(false); iframeRef.current?.contentWindow?.location.reload() }}
            className={`p-1.5 ${textMuted} hover:${textPrimary} transition-colors`}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {/* Live/Draft toggle */}
          <button
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isLive ? "bg-green-500/15 border-green-500/40 text-green-400 hover:bg-green-500/25" : "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"}`}
          >
            {isTogglingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-gray-500"}`} />}
            {isLive ? "Live" : "Draft"}
          </button>
          {/* Theme toggle */}
          <button onClick={() => setEditorTheme(t => t === "dark" ? "light" : "dark")}
            className={`p-1.5 rounded-md transition-colors ${isDark ? "text-yellow-400 hover:text-yellow-300" : "text-gray-500 hover:text-gray-800"}`}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}
            className="gap-1 bg-orange-600 hover:bg-orange-700 text-white h-7 px-3 text-xs">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
      </div>

      {/* ── 3-PANEL BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className={`w-64 shrink-0 flex flex-col border-r overflow-hidden ${panelBg} ${panelBorder}`}>
          {/* Tab nav */}
          <div className={`grid grid-cols-4 p-1.5 gap-0.5 shrink-0 border-b ${panelBorder}`}>
            {([
              { id: "layout", icon: <Layout className="w-3.5 h-3.5" />, label: "Layout" },
              { id: "style",  icon: <Palette className="w-3.5 h-3.5" />,  label: "Style" },
              { id: "pages",  icon: <FileText className="w-3.5 h-3.5" />, label: "Pages" },
              { id: "theme",  icon: <Layers className="w-3.5 h-3.5" />,   label: "Theme" },
            ] as { id: EditorTab; icon: React.ReactNode; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${activeTab === t.id ? (isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900") : `${textFaint} ${hoverBg}`}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">

            {/* ══ LAYOUT TAB ══════════════════════════════════════════════ */}
            {activeTab === "layout" && (
              <div className="p-2 space-y-1">
                {/* Section list */}
                {sections.map((s, idx) => {
                  const block = SECTION_BLOCKS.find(b => b.type === s.type)
                  const isSelected = selectedId === s.id
                  return (
                    <div key={s.id} draggable
                      onDragStart={() => handleDragStart(s.id)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={e => handleDrop(e, idx)}
                      onDragEnd={() => { setIsDragging(null); setDragOver(null) }}
                      onClick={() => setSelectedId(isSelected ? null : s.id)}
                      className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all select-none ${
                        isSelected ? "bg-orange-500/15 border border-orange-500/40" :
                        dragOver === idx ? `border border-dashed ${isDark ? "bg-gray-700/50 border-gray-500" : "bg-gray-100 border-gray-300"}` :
                        `border border-transparent ${hoverBg}`
                      } ${s.hidden ? "opacity-40" : ""}`}>
                      <GripVertical className={`w-3 h-3 shrink-0 cursor-grab ${textFaint} group-hover:${textMuted}`} />
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${block?.color ?? "#666"}22`, color: block?.color ?? "#666" }}>{block?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${textPrimary}`}>{block?.label}</p>
                        <p className={`text-[10px] truncate ${textFaint}`}>{s.headline || s.title || s.type}</p>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                        <button onClick={e => { e.stopPropagation(); duplicateSection(s.id) }} className={`p-0.5 rounded ${hoverBg}`} title="Duplicate">
                          <Copy className={`w-2.5 h-2.5 ${textMuted}`} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); toggleSection(s.id) }} className={`p-0.5 rounded ${hoverBg}`}>
                          {s.hidden ? <Eye className={`w-2.5 h-2.5 ${textMuted}`} /> : <EyeOff className={`w-2.5 h-2.5 ${textMuted}`} />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); removeSection(s.id) }} className="p-0.5 rounded hover:bg-red-900/50">
                          <Trash2 className="w-2.5 h-2.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {sections.length === 0 && (
                  <div className="py-8 text-center">
                    <p className={`text-xs ${textFaint}`}>No sections yet</p>
                    <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Click "+ Add section" below</p>
                  </div>
                )}

                {/* Add section */}
                <div className={`pt-2 border-t ${panelBorder}`}>
                  <button
                    onClick={() => setAddSectionOpen(!addSectionOpen)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium transition-all ${isDark ? "text-orange-400 hover:bg-gray-800 border border-dashed border-gray-700 hover:border-orange-500/50" : "text-orange-600 hover:bg-orange-50 border border-dashed border-gray-300"}`}>
                    <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add section</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${addSectionOpen ? "rotate-90" : ""}`} />
                  </button>

                  {addSectionOpen && (
                    <div className={`mt-1.5 rounded-xl border overflow-hidden ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                      {/* Category filter */}
                      <div className="flex gap-1 p-1.5 overflow-x-auto">
                        {[{ id: "all", label: "All" }, ...SECTION_CATEGORIES].map(cat => (
                          <button key={cat.id} onClick={() => setAddSectionFilter(cat.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${addSectionFilter === cat.id ? "bg-orange-500 text-white" : `${textFaint} ${hoverBg}`}`}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      {/* Block list */}
                      {SECTION_BLOCKS
                        .filter(b => addSectionFilter === "all" || b.category === addSectionFilter)
                        .map(block => (
                        <button key={block.type} onClick={() => addSection(block.type)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 transition-all text-left ${hoverBg} border-t ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${block.color}20`, color: block.color }}>{block.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${textPrimary}`}>{block.label}</p>
                            <p className={`text-[10px] ${textFaint}`}>{block.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STYLE TAB ═══════════════════════════════════════════════ */}
            {activeTab === "style" && (
              <div className="p-3 space-y-3">

                {/* Logo & Favicon */}
                <StyleSection title="Logo & Favicon" isDark={isDark}>
                  <div className="space-y-3">
                    {/* Logo */}
                    <div>
                      <p className={`text-[10px] ${textFaint} mb-2`}>Store logo</p>
                      <div className="flex items-center gap-2">
                        <div onClick={() => fileLogoRef.current?.click()}
                          className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                          {store.store_logo ? <img src={store.store_logo} alt="logo" className="w-full h-full object-contain p-1" /> : <ImageIcon className={`w-5 h-5 ${textFaint}`} />}
                        </div>
                        <div className="space-y-1 flex-1">
                          <button onClick={() => fileLogoRef.current?.click()} disabled={isUploadingLogo}
                            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                            {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{store.store_logo ? "Change" : "Upload"}
                          </button>
                          {store.store_logo && (
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
                    {/* Favicon */}
                    <div>
                      <p className={`text-[10px] ${textFaint} mb-2`}>Favicon <span className="opacity-60">(browser tab icon)</span></p>
                      <div className="flex items-center gap-2">
                        <div onClick={() => fileFavRef.current?.click()}
                          className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                          {store.store_favicon ? <img src={store.store_favicon} alt="fav" className="w-full h-full object-contain" /> : <Globe className={`w-4 h-4 ${textFaint}`} />}
                        </div>
                        <button onClick={() => fileFavRef.current?.click()} disabled={isUploadingFav}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                          {isUploadingFav ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{store.store_favicon ? "Change" : "Upload"}
                        </button>
                        {store.store_favicon && (
                          <button onClick={() => setStore(p => ({ ...p, store_favicon: undefined }))} className="p-1.5 rounded border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <input ref={fileFavRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { if (e.target.files?.[0]) { setIsUploadingFav(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, store_favicon: url })); setIsUploadingFav(false) } }} />
                    </div>
                  </div>
                </StyleSection>

                {/* Colors */}
                <StyleSection title="Colors" isDark={isDark}>
                  <div className="space-y-2.5">
                    {[
                      { key: "primary_color",   label: "Primary",    hint: "Buttons & links" },
                      { key: "secondary_color", label: "Secondary",  hint: "Gradients" },
                      { key: "accent_color",    label: "Accent",     hint: "Highlights" },
                    ].map(({ key, label, hint }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className={`text-[10px] ${textFaint}`}>{label}</label>
                          <span className={`text-[10px] ${textFaint} opacity-60`}>{hint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="color" value={(store as any)[key] ?? "#000000"}
                            onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                            className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                          <input type="text" value={(store as any)[key] ?? ""}
                            onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${inputCls}`} />
                        </div>
                      </div>
                    ))}
                    <div className="h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${store.primary_color ?? "#e65100"}, ${store.secondary_color ?? "#ac1900"})` }}>
                      Preview Gradient
                    </div>
                  </div>
                </StyleSection>

                {/* Typography */}
                <StyleSection title="Typography" isDark={isDark}>
                  <div className="space-y-1.5">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => setStore(p => ({ ...p, font: f.id }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${store.font === f.id ? "border-orange-500/50 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}`}>
                        <span className={`text-xs ${textPrimary}`}>{f.name}</span>
                        {store.font === f.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                      </button>
                    ))}
                  </div>
                </StyleSection>

                {/* Social Links */}
                <StyleSection title="Social Links" isDark={isDark}>
                  <div className="space-y-2">
                    <p className={`text-[10px] ${textFaint} opacity-70 mb-2`}>These appear in your header and footer when enabled.</p>
                    {[
                      { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/yourhandle", color: "#E1306C" },
                      { key: "youtube_url",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel", color: "#FF0000" },
                      { key: "twitter_url",   label: "Twitter / X", placeholder: "https://x.com/yourhandle", color: "#1DA1F2" },
                      { key: "facebook_url",  label: "Facebook",  placeholder: "https://facebook.com/yourpage", color: "#1877F2" },
                      { key: "tiktok_url",    label: "TikTok",    placeholder: "https://tiktok.com/@yourhandle", color: "#000000" },
                      { key: "discord_url",   label: "Discord",   placeholder: "https://discord.gg/yourserver",  color: "#5865F2" },
                    ].map(({ key, label, placeholder, color }) => (
                      <div key={key}>
                        <label className={`text-[10px] ${textFaint} flex items-center gap-1 mb-1`}>
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                          {label}
                        </label>
                        <input value={(store as any)[key] ?? ""} onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className={`w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 ${inputCls}`} />
                      </div>
                    ))}
                  </div>
                </StyleSection>

                {/* Product Card */}
                <StyleSection title="Product Cards" isDark={isDark}>
                  <div className="space-y-3">
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1.5`}>Image aspect ratio</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["square", "portrait", "landscape"] as const).map(ratio => (
                          <button key={ratio} onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, aspect_ratio: ratio } }))}
                            className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${store.product_card?.aspect_ratio === ratio || (!store.product_card?.aspect_ratio && ratio === "square") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
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
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[10px] capitalize transition-all ${store.product_card?.alignment === align || (!store.product_card?.alignment && align === "left") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                            {align === "left" ? <AlignLeft className="w-3 h-3" /> : <AlignCenter className="w-3 h-3" />}{align}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: "show_price",        label: "Show price",          default: true },
                        { key: "show_hover",         label: "Hover zoom effect",   default: true },
                        { key: "show_sold_out_badge",label: "Show sold-out badge", default: true },
                      ].map(({ key, label, default: def }) => {
                        const val = (store.product_card as any)?.[key] !== undefined ? (store.product_card as any)[key] : def
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

                {/* Buttons & Shapes */}
                <StyleSection title="Buttons & Shapes" isDark={isDark}>
                  <div className="space-y-3">
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1.5`}>Button style</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["filled", "outline", "ghost"] as const).map(style => (
                          <button key={style} onClick={() => setStore(p => ({ ...p, button_style: style }))}
                            className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${store.button_style === style || (!store.button_style && style === "filled") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1.5`}>Corner radius</label>
                      <div className="grid grid-cols-5 gap-1">
                        {(["none", "sm", "md", "lg", "full"] as const).map((r, i) => (
                          <button key={r} onClick={() => setStore(p => ({ ...p, border_radius: r }))}
                            className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] transition-all ${store.border_radius === r || (!store.border_radius && r === "md") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}`}>
                            <div className="w-3.5 h-3.5 border border-current" style={{ borderRadius: ["0","2px","4px","8px","50%"][i] }} />
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </StyleSection>

                {/* Header behaviour */}
                <StyleSection title="Header Behaviour" isDark={isDark}>
                  <div className="space-y-2.5">
                    {[
                      { key: "sticky_header",       label: "Sticky header",           hint: "Stays fixed while scrolling", def: true },
                      { key: "sticky_announcement", label: "Sticky announcement bar", hint: "Bar stays at top", def: true },
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

                {/* SEO & Sharing */}
                <StyleSection title="SEO & Social Sharing" isDark={isDark}>
                  <div className="space-y-2.5">
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
                      <EditorInput value={store.seo_title ?? ""} onChange={v => setStore(p => ({ ...p, seo_title: v }))} placeholder={`${vendorHandle} — Official Merch`} isDark={isDark} />
                      <p className={`text-[10px] mt-0.5 ${store.seo_title && store.seo_title.length > 55 ? "text-amber-400" : textFaint}`}>{(store.seo_title ?? "").length}/60</p>
                    </div>
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Meta description</label>
                      <EditorTextarea value={store.seo_description ?? ""} onChange={v => setStore(p => ({ ...p, seo_description: v }))} placeholder="Shop official merch from..." rows={3} isDark={isDark} />
                      <p className={`text-[10px] mt-0.5 ${store.seo_description && store.seo_description.length > 150 ? "text-amber-400" : textFaint}`}>{(store.seo_description ?? "").length}/160</p>
                    </div>
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Social share image (OG Image)</label>
                      <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}
                        onClick={() => fileOgRef.current?.click()}>
                        {store.og_image ? <img src={store.og_image} alt="og" className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className={`w-5 h-5 mx-auto mb-1 ${textFaint}`} /><p className={`text-[10px] ${textFaint}`}>1200×630px recommended</p></div>}
                      </div>
                      <input ref={fileOgRef} type="file" accept="image/*" className="hidden"
                        onChange={async e => { if (e.target.files?.[0]) { setIsUploadingOg(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, og_image: url })); setIsUploadingOg(false) } }} />
                    </div>
                  </div>
                </StyleSection>

                {/* Custom CSS */}
                <StyleSection title="Custom CSS" isDark={isDark}>
                  <div>
                    <p className={`text-[10px] ${textFaint} mb-2 opacity-70`}>Advanced: inject CSS directly into your store. Use with care.</p>
                    <EditorTextarea value={store.custom_css ?? ""} onChange={v => setStore(p => ({ ...p, custom_css: v }))}
                      placeholder={"/* Add your CSS here */\n.hero-section { background: ... }"}
                      rows={6} isDark={isDark} mono />
                  </div>
                </StyleSection>

                {/* Domain */}
                <StyleSection title="Domain" isDark={isDark}>
                  <div className="space-y-2.5">
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Subdomain</label>
                      <div className="flex items-center">
                        <input value={store.subdomain ?? vendorHandle} onChange={e => setStore(p => ({ ...p, subdomain: e.target.value }))}
                          className={`flex-1 rounded-l-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 border-r-0 ${inputCls}`} />
                        <span className={`px-2 py-1.5 text-[10px] rounded-r-lg border ${isDark ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500"} whitespace-nowrap`}>.junooni.com</span>
                      </div>
                    </div>
                    <div>
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Custom domain <span className="opacity-60">(optional)</span></label>
                      <EditorInput value={store.custom_domain ?? ""} onChange={v => setStore(p => ({ ...p, custom_domain: v || undefined }))} placeholder="merch.yourname.com" isDark={isDark} />
                      {store.domain_verified && <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><Check className="w-2.5 h-2.5" />Domain verified</p>}
                    </div>
                  </div>
                </StyleSection>
              </div>
            )}

            {/* ══ PAGES TAB ═══════════════════════════════════════════════ */}
            {activeTab === "pages" && (
              <div className="p-2">
                {editingPage ? (
                  <PageEditorPanel page={editingPage} vendorHandle={vendorHandle}
                    onSave={savePage} onCancel={() => setEditingPage(null)}
                    onDelete={() => { deletePage(editingPage.id); setEditingPage(null) }}
                    isNew={!pages.find(p => p.id === editingPage.id)} isDark={isDark} />
                ) : (
                  <>
                    <p className={`text-[10px] uppercase tracking-wider px-1 py-2 ${textFaint}`}>Custom pages</p>
                    {pages.map(page => (
                      <div key={page.id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg} hover:border-${isDark ? "gray-700" : "gray-200"}`}>
                        <span className="text-sm shrink-0">{PAGE_TEMPLATES.find(t => t.id === page.template)?.icon ?? "📄"}</span>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingPage(page)}>
                          <p className={`text-xs font-medium truncate ${textPrimary}`}>{page.title}</p>
                          <p className={`text-[10px] font-mono ${textFaint}`}>/p/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                          {page.in_nav && <span className="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">Nav</span>}
                          {page.in_footer && <span className="text-[9px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">Footer</span>}
                          <button onClick={() => setEditingPage(page)} className="p-0.5 rounded hover:bg-gray-700"><Pencil className={`w-2.5 h-2.5 ${textMuted}`} /></button>
                          <button onClick={() => deletePage(page.id)} className="p-0.5 rounded hover:bg-red-900/50"><Trash2 className="w-2.5 h-2.5 text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                    {pages.length === 0 && <p className={`px-2 py-2 text-xs ${textFaint}`}>No custom pages yet.</p>}
                    <p className={`text-[10px] uppercase tracking-wider px-1 py-2 mt-2 border-t ${panelBorder} ${textFaint}`}>Create new page</p>
                    {PAGE_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => startNewPage(t.id)}
                        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg} text-left`}>
                        <span className="text-sm">{t.icon}</span>
                        <span className={`text-xs ${textPrimary}`}>{t.label}</span>
                        <Plus className={`w-3 h-3 ml-auto ${textFaint}`} />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ══ THEME TAB ═══════════════════════════════════════════════ */}
            {activeTab === "theme" && (
              <div className="p-3 space-y-3">
                <p className={`text-[10px] uppercase tracking-wider ${textFaint}`}>Template</p>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setStore(p => ({ ...p, template: t.id }))}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${store.template === t.id ? "border-orange-500/50 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600 bg-gray-800/50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}`}>
                      <div className={`w-full h-14 rounded-lg mb-2 flex items-center justify-center ${t.id === "bold" ? "bg-gray-900" : t.id === "editorial" ? "bg-stone-700" : "bg-gray-200"}`}>
                        <div className="space-y-1 w-full px-3">
                          <div className={`h-1.5 rounded w-1/2 mx-auto ${t.id === "bold" ? "bg-white/40" : "bg-gray-400"}`} />
                          <div className="grid grid-cols-3 gap-1">{[1,2,3].map(i => <div key={i} className={`h-4 rounded ${t.id === "bold" ? "bg-white/10" : "bg-gray-300"}`} />)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div><p className={`text-xs font-semibold ${textPrimary}`}>{t.name}</p><p className={`text-[10px] ${textFaint}`}>{t.desc}</p></div>
                        {store.template === t.id && <Check className="w-4 h-4 text-orange-400" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className={`pt-3 border-t ${panelBorder} space-y-2`}>
                  <p className={`text-[10px] uppercase tracking-wider ${textFaint}`}>Store identity</p>
                  <div>
                    <label className={`text-[10px] ${textFaint} block mb-1`}>Tagline</label>
                    <EditorInput value={store.tagline ?? ""} onChange={v => setStore(p => ({ ...p, tagline: v }))} placeholder="Official merch store" isDark={isDark} />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textFaint} block mb-1`}>Hero background image URL</label>
                    <EditorInput value={store.hero_image ?? ""} onChange={v => setStore(p => ({ ...p, hero_image: v || undefined }))} placeholder="https://..." isDark={isDark} />
                    {store.hero_image && <img src={store.hero_image} alt="hero" className="mt-2 w-full h-16 object-cover rounded-lg opacity-60" />}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── CENTER: PREVIEW ── */}
        <div className="flex-1 flex flex-col items-center overflow-hidden bg-gray-950 relative">
          <div className="w-full flex items-center justify-center py-1.5 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${isDark ? "bg-gray-800/80 border-gray-700 text-gray-400" : "bg-white/80 border-gray-300 text-gray-500"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-yellow-400"}`} />
              {vendorHandle}.junooni.com
            </div>
          </div>
          <div className={`relative transition-all duration-300 flex-1 overflow-hidden w-full ${viewport === "mobile" ? "max-w-[390px] rounded-[2rem] border-4 border-gray-700 shadow-2xl my-2 mx-auto" : ""}`}>
            {!iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-900">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <p className="text-xs text-gray-500">Loading preview...</p>
              </div>
            )}
            {previewUrl && (
              <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0 bg-white"
                onLoad={() => setIframeReady(true)} title="Store preview" allow="same-origin" />
            )}
            {iframeReady && !selectedId && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white/70 pointer-events-none whitespace-nowrap">
                Click any section to edit it
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: SECTION SETTINGS ── */}
        <div className={`shrink-0 flex flex-col border-l overflow-hidden transition-all duration-200 ${panelBg} ${panelBorder} ${selectedSection ? "w-72" : "w-0 border-l-0"}`}>
          {selectedSection && (
            <>
              <div className={`flex items-center justify-between px-3 py-2.5 border-b shrink-0 ${panelBorder}`}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: `${SECTION_BLOCKS.find(b => b.type === selectedSection.type)?.color ?? "#666"}20`, color: SECTION_BLOCKS.find(b => b.type === selectedSection.type)?.color ?? "#666" }}>
                    {SECTION_BLOCKS.find(b => b.type === selectedSection.type)?.icon}
                  </div>
                  <span className={`text-sm font-semibold ${textPrimary}`}>{SECTION_BLOCKS.find(b => b.type === selectedSection.type)?.label ?? selectedSection.type}</span>
                </div>
                <button onClick={() => setSelectedId(null)} className={`p-1 ${textFaint} hover:${textPrimary} transition-colors`}><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
                <SectionSettings
                  section={selectedSection}
                  onChange={patch => updateSection(selectedSection.id, patch)}
                  token={token ?? ""}
                  backendUrl={backendUrl}
                  isDark={isDark}
                  collections={vendorCollections}
                />
              </div>
              <div className={`border-t ${panelBorder} px-3 py-2 flex gap-1.5 shrink-0`}>
                <button onClick={() => moveSection(selectedSection.id, "up")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  <ChevronUp className="w-3 h-3" />Up
                </button>
                <button onClick={() => moveSection(selectedSection.id, "down")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  <ChevronDown className="w-3 h-3" />Down
                </button>
                <button onClick={() => duplicateSection(selectedSection.id)} className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`} title="Duplicate">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => toggleSection(selectedSection.id)} className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                  {selectedSection.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button onClick={() => removeSection(selectedSection.id)} className="px-2.5 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-900/30 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page Editor Panel ────────────────────────────────────────────────────────

function PageEditorPanel({ page, vendorHandle, onSave, onCancel, onDelete, isNew, isDark }: {
  page: StorePage; vendorHandle: string; isNew: boolean; isDark: boolean
  onSave: (p: StorePage) => void; onCancel: () => void; onDelete: () => void
}) {
  const [draft, setDraft] = useState({ ...page })
  const up = (patch: Partial<StorePage>) => setDraft(p => ({ ...p, ...patch }))
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textFaint = isDark ? "text-gray-500" : "text-gray-400"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-1">
        <button onClick={onCancel} className={`flex items-center gap-1 text-xs ${textFaint} hover:${textPrimary} transition-colors`}>
          <ChevronLeft className="w-3.5 h-3.5" />Back
        </button>
        {!isNew && <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300">Delete</button>}
      </div>
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
        <EditorInput value={draft.title} onChange={v => up({ title: v, ...(isNew ? { slug: slugify(v) } : {}) })} placeholder="e.g. About Me" isDark={isDark} />
      </div>
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>URL slug</label>
        <div className="flex items-center">
          <span className={`px-2 py-1.5 border border-r-0 rounded-l-lg text-[10px] whitespace-nowrap ${isDark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-300 text-gray-400"}`}>/p/</span>
          <input value={draft.slug} onChange={e => up({ slug: slugify(e.target.value) })}
            className={`flex-1 rounded-r-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"}`} />
        </div>
        <a href={`http://localhost:3001/${vendorHandle}/p/${draft.slug}`} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-orange-400 hover:text-orange-300 mt-1 flex items-center gap-1">
          <ExternalLink className="w-2.5 h-2.5" />Preview page
        </a>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={`text-[10px] ${textFaint}`}>Content</label>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${draft.content.trim().startsWith("<") ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"}`}>
            {draft.content.trim().startsWith("<") ? "HTML" : "Markdown"}
          </span>
        </div>
        <EditorTextarea value={draft.content} onChange={v => up({ content: v })}
          placeholder={"Markdown: ## Heading\n\nHTML: <div>...</div>"} rows={10} isDark={isDark} />
      </div>
      <div className="space-y-2">
        <p className={`text-[10px] ${textFaint}`}>Visibility</p>
        {[{ key: "in_nav", label: "Show in header nav", color: "blue" }, { key: "in_footer", label: "Show in footer", color: "purple" }].map(({ key, label, color }) => (
          <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${(draft as any)[key] ? `border-${color}-500/40 bg-${color}-500/10` : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`}>
            <input type="checkbox" checked={!!(draft as any)[key]} onChange={e => up({ [key]: e.target.checked } as any)} className="w-3.5 h-3.5 accent-orange-500" />
            <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(draft)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
          <Save className="w-3 h-3" />{isNew ? "Create page" : "Save changes"}
        </button>
        <button onClick={onCancel} className={`px-3 py-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Section Settings ─────────────────────────────────────────────────────────

function SectionSettings({ section, onChange, token, backendUrl, isDark, collections = [] }: {
  section: StoreSection; onChange: (p: Partial<StoreSection>) => void
  collections?: { id: string; title: string; handle: string }[]
  token: string; backendUrl: string; isDark: boolean
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<string>("")

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!res.ok) return null
    const data = await res.json(); return data.files?.[0]?.url ?? null
  }
  const triggerUpload = (key: string) => { setUploadTarget(key); fileRef.current?.click() }

  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white" : "text-gray-900"

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async e => {
          if (!e.target.files?.[0]) return
          setUploadingKey(uploadTarget)
          const url = await uploadFile(e.target.files[0])
          if (url) onChange({ [uploadTarget]: url })
          setUploadingKey(null); e.target.value = ""
        }} />

      {section.type === "hero" && (<>
        <Field label="Headline" faint={textFaint}><EditorInput value={section.headline ?? ""} onChange={v => onChange({ headline: v })} placeholder="Your big headline" isDark={isDark} /></Field>
        <Field label="Subtext" faint={textFaint}><EditorInput value={section.subtext ?? ""} onChange={v => onChange({ subtext: v })} placeholder="A supporting tagline" isDark={isDark} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Primary CTA" faint={textFaint}><EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })} placeholder="Shop Now" isDark={isDark} /></Field>
          <Field label="CTA link" faint={textFaint}><EditorInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="/products" isDark={isDark} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Secondary CTA" faint={textFaint}><EditorInput value={section.cta_secondary_label ?? ""} onChange={v => onChange({ cta_secondary_label: v })} placeholder="Browse all" isDark={isDark} /></Field>
          <Field label="Secondary link" faint={textFaint}><EditorInput value={section.cta_secondary_url ?? ""} onChange={v => onChange({ cta_secondary_url: v })} placeholder="/products" isDark={isDark} /></Field>
        </div>
        <ImageUploadField label="Background image" value={section.background_image ?? ""} onChange={v => onChange({ background_image: v || undefined })} onUpload={() => triggerUpload("background_image")} isUploading={uploadingKey === "background_image"} isDark={isDark} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Overlay color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#000000"} onChange={e => onChange({ background_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.background_color ?? ""} onChange={v => onChange({ background_color: v })} placeholder="#000000" isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"} onChange={e => onChange({ text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.text_color ?? ""} onChange={v => onChange({ text_color: v })} placeholder="#ffffff" isDark={isDark} />
            </div>
          </Field>
        </div>
      </>)}

      {section.type === "announcement" && (<>
        <Field label="Message" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Free shipping! 🎉" isDark={isDark} /></Field>
        <Field label="Link URL (optional)" faint={textFaint}><EditorInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="https://..." isDark={isDark} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#e65100"} onChange={e => onChange({ background_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.background_color ?? "#e65100"} onChange={v => onChange({ background_color: v })} isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"} onChange={e => onChange({ text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.text_color ?? "#ffffff"} onChange={v => onChange({ text_color: v })} isDark={isDark} />
            </div>
          </Field>
        </div>
        {section.title && (
          <div className="px-3 py-2 rounded-lg text-xs font-medium text-center" style={{ background: section.background_color ?? "#e65100", color: section.text_color ?? "#ffffff" }}>
            {section.title}
          </div>
        )}
      </>)}

      {(section.type === "collection" || section.type === "featured") && (<>
        <Field label="Section title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder={section.type === "featured" ? "Featured Drops" : "All Products"} isDark={isDark} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Max products" faint={textFaint}>
            <input type="number" min={1} max={48} value={section.limit ?? 12} onChange={e => onChange({ limit: parseInt(e.target.value) || 12 })}
              className={`w-full px-2 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"}`} />
          </Field>
          <Field label="Columns" faint={textFaint}>
            <div className="flex gap-1">
              {([2,3,4] as const).map(n => (
                <button key={n} onClick={() => onChange({ columns: n })}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${section.columns === n || (!section.columns && n === 3) ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>
        {section.type === "featured" && (
          <Field label="Specific product IDs (one per line)" faint={textFaint}>
            <EditorTextarea value={section.product_ids?.join("\n") ?? ""} onChange={v => onChange({ product_ids: v.split("\n").map(s => s.trim()).filter(Boolean) })} placeholder={"prod_01...\nprod_02..."} rows={3} isDark={isDark} />
            <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Leave empty to show latest products</p>
          </Field>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_sold_out: !section.show_sold_out })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_sold_out !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_sold_out !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show sold-out products</span>
        </label>
      </>)}

      {section.type === "about" && (<>
        <Field label="Title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="About Me" isDark={isDark} /></Field>
        <Field label="Content" faint={textFaint}><EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Share your story..." rows={6} isDark={isDark} /></Field>
        <ImageUploadField label="Image" value={section.image ?? ""} onChange={v => onChange({ image: v || undefined })} onUpload={() => triggerUpload("image")} isUploading={uploadingKey === "image"} isDark={isDark} />
        <Field label="Image position" faint={textFaint}>
          <div className="flex gap-2">
            {(["left", "right"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ image_position: pos })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.image_position ?? "left") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                Image {pos}
              </button>
            ))}
          </div>
        </Field>
      </>)}

      {section.type === "social" && (
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint} opacity-70 mb-1`}>Toggle which platforms to show</p>
          {[
            { key: "show_instagram", label: "Instagram", color: "#E1306C" },
            { key: "show_youtube",   label: "YouTube",   color: "#FF0000" },
            { key: "show_twitter",   label: "Twitter/X", color: "#1DA1F2" },
            { key: "show_facebook",  label: "Facebook",  color: "#1877F2" },
          ].map(({ key, label, color }) => (
            <label key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-transparent ${isDark ? "bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700" : "bg-gray-50 hover:bg-gray-100"}`}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className={`flex-1 text-sm ${textPrimary}`}>{label}</span>
              <div className="relative w-8 h-4 shrink-0" onClick={() => onChange({ [key]: !(section as any)[key] })}>
                <div className={`w-8 h-4 rounded-full transition-colors ${(section as any)[key] ? "bg-orange-500" : "bg-gray-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(section as any)[key] ? "translate-x-4" : ""}`} />
              </div>
            </label>
          ))}
        </div>
      )}

      {section.type === "text" && (
        <Field label="Content (Markdown supported)" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Write your content..." rows={10} isDark={isDark} />
        </Field>
      )}

      {section.type === "image" && (
        <ImageUploadField label="Image" value={section.image ?? ""} onChange={v => onChange({ image: v || undefined })} onUpload={() => triggerUpload("image")} isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={140} />
      )}

      {section.type === "video" && (<>
        <Field label="Section title (optional)" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Watch me" isDark={isDark} /></Field>
        <Field label="Video URL" faint={textFaint}>
          <EditorInput value={section.video_url ?? ""} onChange={v => onChange({ video_url: v })} placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>YouTube and Vimeo supported</p>
        </Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ video_autoplay: !section.video_autoplay })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.video_autoplay ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.video_autoplay ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Autoplay (muted)</span>
        </label>
        {section.video_url && (
          <div className="mt-1 p-2 rounded-lg text-[10px] text-green-400 border border-green-800/50 bg-green-900/20">
            ✓ Video URL set
          </div>
        )}
      </>)}

      {section.type === "links" && (<>
        <Field label="Section title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="My Links" isDark={isDark} /></Field>
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint}`}>Links</p>
          {(section.links ?? []).map((link, i) => (
            <div key={link.id} className={`p-2 rounded-lg border space-y-1.5 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-1.5">
                <EditorInput value={link.label} onChange={v => {
                  const links = [...(section.links ?? [])]; links[i] = { ...links[i], label: v }; onChange({ links })
                }} placeholder="Button label" isDark={isDark} />
                <button onClick={() => {
                  const links = (section.links ?? []).filter((_, j) => j !== i); onChange({ links })
                }} className="p-1 text-red-400 hover:bg-red-900/30 rounded shrink-0"><Trash2 className="w-3 h-3" /></button>
              </div>
              <EditorInput value={link.url} onChange={v => {
                const links = [...(section.links ?? [])]; links[i] = { ...links[i], url: v }; onChange({ links })
              }} placeholder="https://..." isDark={isDark} />
            </div>
          ))}
          <button onClick={() => onChange({ links: [...(section.links ?? []), { id: `l_${Date.now()}`, label: "New Link", url: "" }] })}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 border-dashed text-gray-400 hover:border-gray-500 hover:text-gray-300" : "border-gray-300 border-dashed text-gray-500 hover:border-gray-400"}`}>
            <Plus className="w-3 h-3" />Add link
          </button>
        </div>
      </>)}

      {section.type === "featured_collections" && (<>
        <Field label="Section title" faint={textFaint}>
          <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Shop by Collection" isDark={isDark} />
        </Field>

        <Field label="Columns" faint={textFaint}>
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map(n => (
              <button key={n}
                onClick={() => onChange({ columns: n })}
                className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${section.columns === n || (!section.columns && n === 3) ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                {n}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Choose collections" faint={textFaint}>
          <p className={`text-[10px] mb-2 ${textFaint}`}>
            Select which collections to display. Leave empty to show all.
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(collections ?? []).length === 0 ? (
              <p className={`text-[11px] italic ${textFaint}`}>No collections found. Create collections in your dashboard first.</p>
            ) : (
              (collections ?? []).map(col => {
                const selected = (section.collection_ids ?? []).includes(col.id)
                return (
                  <label key={col.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                      selected
                        ? isDark ? "border-violet-500/50 bg-violet-500/10" : "border-violet-400/50 bg-violet-50"
                        : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={e => {
                        const ids = section.collection_ids ?? []
                        onChange({
                          collection_ids: e.target.checked
                            ? [...ids, col.id]
                            : ids.filter(id => id !== col.id)
                        })
                      }}
                      className="w-3.5 h-3.5 accent-violet-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{col.title}</p>
                      <p className={`text-[10px] truncate ${textFaint}`}>/{col.handle}</p>
                    </div>
                    {selected && (
                      <span className="ml-auto text-[10px] font-semibold text-violet-500">✓</span>
                    )}
                  </label>
                )
              })
            )}
          </div>
          {(section.collection_ids ?? []).length > 0 && (
            <button
              onClick={() => onChange({ collection_ids: [] })}
              className={`mt-2 text-[10px] ${textFaint} hover:text-red-400 transition-colors`}>
              Clear selection (show all)
            </button>
          )}
        </Field>
      </>)}

      {section.type === "html" && (
        <Field label="Custom HTML / CSS / JS" faint={textFaint}>
          <EditorTextarea value={section.html_content ?? ""} onChange={v => onChange({ html_content: v })}
            placeholder={"<div style=\"padding:40px;text-align:center\">\n  <h2>Custom content</h2>\n</div>"} rows={12} isDark={isDark} mono />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Rendered in an isolated iframe to prevent CSS leakage.</p>
        </Field>
      )}

      {section.type === "divider" && (
        <div className="py-6 text-center">
          <div className={`w-full h-px mb-3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <p className={`text-xs ${textFaint}`}>No settings — just a visual separator.</p>
        </div>
      )}

      {/* Section-level color overrides for any section */}
      {!["announcement", "divider", "html"].includes(section.type) && (
        <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section colors override</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Background" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.background_color ?? "#ffffff"} onChange={e => onChange({ background_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.background_color ?? ""} onChange={v => onChange({ background_color: v || undefined })} placeholder="default" isDark={isDark} />
              </div>
            </Field>
            <Field label="Text" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.text_color ?? "#000000"} onChange={e => onChange({ text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.text_color ?? ""} onChange={v => onChange({ text_color: v || undefined })} placeholder="default" isDark={isDark} />
              </div>
            </Field>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function StyleSection({ title, isDark, children }: { title: string; isDark: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
        <span className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{title}</span>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"} transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

function Field({ label, faint, children }: { label: string; faint: string; children: React.ReactNode }) {
  return <div><label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>{children}</div>
}

function EditorInput({ value, onChange, placeholder, isDark }: { value: string; onChange: (v: string) => void; placeholder?: string; isDark: boolean }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"}`} />
  )
}

function EditorTextarea({ value, onChange, placeholder, rows = 3, isDark, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; isDark: boolean; mono?: boolean }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none ${mono ? "font-mono text-xs" : ""} ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"}`} />
  )
}

function ImageUploadField({ label, value, onChange, onUpload, isUploading, isDark, previewHeight = 80 }: {
  label: string; value: string; onChange: (v: string) => void; onUpload: () => void
  isUploading: boolean; isDark: boolean; previewHeight?: number
}) {
  const faint = isDark ? "text-gray-500" : "text-gray-400"
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <EditorInput value={value} onChange={onChange} placeholder="https://... or upload below" isDark={isDark} />
          <button onClick={onUpload} disabled={isUploading}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 shrink-0 transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}>
            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          </button>
        </div>
        {value && (
          <div className="relative rounded-lg overflow-hidden border border-gray-700" style={{ height: previewHeight }}>
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
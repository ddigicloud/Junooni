"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Globe, Palette, Layout, Eye, Save, Trash2, GripVertical,
  CheckCircle2, AlertCircle, ExternalLink, Loader2,
  ChevronUp, ChevronDown, Sparkles, Monitor, ArrowRight, Lock,
  FileText, Plus, X, Instagram, Youtube, Twitter, Facebook, Upload,
} from "lucide-react"
import Junoonilogo from "@/assets/junooni_logo_brand_color.png"
import { ProfileDropdown } from "@/components/profile-dropdown"
import AdminImpersonationBanner from "@/components/AdminImpersonationBanner"

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

type StoreTemplate = "minimal" | "bold" | "editorial"
type StoreStatus   = "draft" | "live" | "paused"
type StoreFont     = "inter" | "poppins" | "playfair"
type SectionType   = "hero" | "featured" | "collection" | "about" | "social" | "announcement" | "divider"
type PageTemplate  = "blank" | "about" | "faq" | "contact"

interface StoreSection {
  type: SectionType
  title?: string; headline?: string; subtext?: string
  cta_label?: string; cta_url?: string; background_image?: string
  text?: string; image?: string; image_position?: "left" | "right"
  product_ids?: string[]; limit?: number
  show_instagram?: boolean; show_youtube?: boolean
  show_twitter?: boolean; show_facebook?: boolean
  background_color?: string; text_color?: string
}

interface StorePage {
  id: string
  title: string
  slug: string
  template: PageTemplate
  content: string
  in_nav: boolean
  in_footer: boolean
  created_at: string
}

interface VendorStore {
  id?: string
  subdomain: string | null; custom_domain: string | null; domain_verified: boolean
  template: StoreTemplate; status: StoreStatus; font: StoreFont
  primary_color: string; secondary_color: string
  hero_image: string | null; tagline: string | null; announcement_text: string | null
  store_logo: string | null; store_favicon: string | null
  sections: { sections: StoreSection[] } | null
  pages?: { pages: StorePage[] } | null
  seo_title: string | null; seo_description: string | null
}

const TEMPLATES = [
  { id: "minimal" as StoreTemplate, name: "Minimal", desc: "Clean, white, product-focused. Great for fashion and lifestyle." },
  { id: "bold" as StoreTemplate, name: "Bold", desc: "Dark background, big typography. Perfect for music artists." },
  { id: "editorial" as StoreTemplate, name: "Editorial", desc: "Magazine-style layout. Ideal for storytelling brands." },
]

const FONTS = [
  { id: "inter" as StoreFont, name: "Inter", sample: "Clean & Modern" },
  { id: "poppins" as StoreFont, name: "Poppins", sample: "Friendly & Round" },
  { id: "playfair" as StoreFont, name: "Playfair", sample: "Elegant & Serif" },
]

const PAGE_TEMPLATES: { id: PageTemplate; label: string; icon: string; desc: string; defaultContent: string }[] = [
  { id: "blank",   label: "Blank",   icon: "📄", desc: "Start from scratch",         defaultContent: "" },
  { id: "about",   label: "About",   icon: "👋", desc: "About me / my story",        defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq",     label: "FAQ",     icon: "❓", desc: "Frequently asked questions", defaultContent: "## FAQ\n\n**Q: How long does shipping take?**\nA: 5-7 business days.\n\n**Q: Can I return items?**\nA: Yes, within 30 days of delivery." },
  { id: "contact", label: "Contact", icon: "✉️", desc: "Contact / support page",     defaultContent: "## Contact Us\n\nHave questions? Reach out at your@email.com" },
]
const SECTION_META: Record<SectionType, { label: string; desc: string; icon: string }> = {
  hero:         { label: "Hero Banner",       desc: "Full-width banner with headline and CTA",  icon: "🖼️" },
  featured:     { label: "Featured Products", desc: "Hand-picked product showcase",             icon: "⭐" },
  collection:   { label: "All Products",      desc: "Auto-grid of all published products",      icon: "🛍️" },
  about:        { label: "About Section",     desc: "Your story with optional image",           icon: "📖" },
  social:       { label: "Social Links",      desc: "Instagram, YouTube, Twitter links",        icon: "🔗" },
  announcement: { label: "Announcement Bar",  desc: "Top-of-page banner text",                 icon: "📢" },
  divider:      { label: "Divider",           desc: "Visual separator between sections",        icon: "➖" },
}

const DEFAULT_STORE: VendorStore = {
  subdomain: null, custom_domain: null, domain_verified: false,
  template: "minimal", status: "draft", font: "inter",
  primary_color: "#e65100", secondary_color: "#000000",
  hero_image: null, tagline: null, announcement_text: null,
  store_logo: null, store_favicon: null,
  sections: { sections: [
    { type: "hero", headline: "", subtext: "", cta_label: "Shop Now" },
    { type: "collection", title: "All Products", limit: 12 },
    { type: "about", title: "About Me" },
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true },
  ]},
  pages: { pages: [] },
  seo_title: null, seo_description: null,
}

type Tab = "template" | "branding" | "sections" | "pages" | "domain" | "seo"
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "template", label: "Template", icon: <Layout className="w-4 h-4" /> },
  { id: "branding", label: "Branding", icon: <Palette className="w-4 h-4" /> },
  { id: "sections", label: "Sections", icon: <Monitor className="w-4 h-4" /> },
  { id: "pages",    label: "Pages",    icon: <FileText className="w-4 h-4" /> },
  { id: "domain",   label: "Domain",   icon: <Globe className="w-4 h-4" /> },
  { id: "seo",      label: "SEO",      icon: <Sparkles className="w-4 h-4" /> },
]

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function StorePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>("template")
  const [store, setStore] = useState<VendorStore>(DEFAULT_STORE)
  const [vendorHandle, setVendorHandle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [sellOnOwnStore, setSellOnOwnStore] = useState<boolean | null>(null)
  const [isEnabling, setIsEnabling] = useState(false)
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isNewPage, setIsNewPage] = useState(false)

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
  const coerce = (v: any) => v === true || v === 1 || v === "true" || v === "1"

  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        const vRes = await fetch(`${backendUrl}/vendors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (vRes.ok) {
          const vData = await vRes.json()
          setVendorHandle(vData.vendor?.handle ?? "")
          setSellOnOwnStore(coerce(vData.vendor?.sell_on_own_store))
        }
        const sRes = await fetch(`${backendUrl}/vendors/me/store`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (sRes.ok) {
          const sData = await sRes.json()
          if (sData.store) {
            setStore({ ...DEFAULT_STORE, ...sData.store, pages: sData.store.pages ?? { pages: [] } })
            setHasStore(true)
          }
        }
      } catch (e) { console.error("Failed to load store:", e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const handleEnableOwnStore = async () => {
    setIsEnabling(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sell_on_own_store: true }),
      })
      if (!res.ok) throw new Error("Failed to enable")
      setSellOnOwnStore(true)
      toast({ title: "Own store enabled!", description: "Configure your store below." })
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsEnabling(false) }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...store, subdomain: store.subdomain || vendorHandle || undefined }),
      })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      const data = await res.json()
      setStore(p => ({ ...p, ...data.store, pages: data.store.pages ?? p.pages }))
      setHasStore(true)
      toast({ title: "Store saved!", description: "Your store settings have been saved." })
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    const newStatus: StoreStatus = store.status === "live" ? "paused" : "live"
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...store, status: newStatus, subdomain: store.subdomain || vendorHandle }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      setStore(p => ({ ...p, status: newStatus }))
      setHasStore(true)
      toast({
        title: newStatus === "live" ? "Store is live! 🎉" : "Store paused",
        description: newStatus === "live" ? `Visit: ${store.subdomain || vendorHandle}.junooni.com` : "Your store is hidden.",
      })
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsPublishing(false) }
  }

  const sections = store.sections?.sections ?? []
  const pages = store.pages?.pages ?? []

  const updateSection = (i: number, patch: Partial<StoreSection>) =>
    setStore(p => ({ ...p, sections: { sections: sections.map((s, idx) => idx === i ? { ...s, ...patch } : s) } }))
  const removeSection = (i: number) =>
    setStore(p => ({ ...p, sections: { sections: sections.filter((_, idx) => idx !== i) } }))
  const moveSection = (i: number, dir: "up" | "down") => {
    const u = [...sections]; const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= u.length) return
    ;[u[i], u[swap]] = [u[swap], u[i]]
    setStore(p => ({ ...p, sections: { sections: u } }))
  }
  const addSection = (type: SectionType) =>
    setStore(p => ({ ...p, sections: { sections: [...sections, { type }] } }))

  // ── Page actions ────────────────────────────────────────────────────────────
  const savePage = (page: StorePage) => {
    const existing = pages.find(p => p.id === page.id)
    const updated = existing
      ? pages.map(p => p.id === page.id ? page : p)
      : [...pages, page]
    setStore(p => ({ ...p, pages: { pages: updated } }))
    setEditingPage(null)
    setIsNewPage(false)
  }

  const deletePage = (id: string) => {
    setStore(p => ({ ...p, pages: { pages: pages.filter(pg => pg.id !== id) } }))
    if (editingPage?.id === id) { setEditingPage(null); setIsNewPage(false) }
  }

  const startNewPage = (template: PageTemplate) => {
    const tmpl = PAGE_TEMPLATES.find(t => t.id === template)!
    const newPage: StorePage = {
      id: `page_${Date.now()}`,
      title: tmpl.label === "blank" ? "New Page" : tmpl.label,
      slug: tmpl.label === "blank" ? "new-page" : tmpl.id,
      template,
      content: tmpl.defaultContent,
      in_nav: false,
      in_footer: true,
      created_at: new Date().toISOString(),
    }
    setEditingPage(newPage)
    setIsNewPage(true)
  }

  const storeUrl = `${store.subdomain || vendorHandle}.junooni.com`

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
    </div>
  )

  // ── GATE ────────────────────────────────────────────────────────────────────
  if (!sellOnOwnStore) return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <span className="hidden text-sm font-semibold text-gray-700 md:block">My Store</span>
          </div>
          <ProfileDropdown />
        </div>
      </div>
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `${BRAND.primary}15` }}>
            <Lock className="w-9 h-9" style={{ color: BRAND.primary }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Own store not enabled</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Enable your own branded store at <span className="font-semibold text-gray-700">{vendorHandle}.junooni.com</span>.
          </p>
          <div className="text-left space-y-3 mb-8 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {[
              { icon: "🌐", text: "Your own URL — yourname.junooni.com" },
              { icon: "🎨", text: "Fully branded — your colors, fonts, layout" },
              { icon: "📄", text: "Page builder — hero, products, about, social" },
              { icon: "📝", text: "Custom pages — About, FAQ, Contact and more" },
              { icon: "🔗", text: "Custom domain — connect merch.yourname.com" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleEnableOwnStore} disabled={isEnabling} className="w-full py-5 text-base font-medium gap-2"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
            {isEnabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Enable my own store</>}
          </Button>
          <button onClick={() => navigate({ to: "/dashboard" })} className="mt-4 text-xs underline text-gray-400 hover:text-gray-600 transition-colors">
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )

  // ── MAIN ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <div className="absolute -translate-x-1/2 left-1/2 md:hidden">
              <Link to="/dashboard"><img src={Junoonilogo} alt="Junooni" className="h-8" /></Link>
            </div>
            <span className="hidden text-sm font-semibold text-gray-700 md:block">My Store</span>
            <Badge className={
              store.status === "live" ? "bg-green-100 text-green-800 border-green-200"
              : store.status === "paused" ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
            }>
              {store.status === "live" ? "● Live" : store.status === "paused" ? "⏸ Paused" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {hasStore && (
              <>
                <a href={`http://localhost:3001/${vendorHandle}`} target="_blank" rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
                  <Eye className="w-3.5 h-3.5" />Preview
                </a>
                <Link to="/store/editor"
                  className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border text-white transition-colors"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, borderColor: BRAND.primary }}>
                  <Layout className="w-3.5 h-3.5" />Edit layout
                </Link>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isPublishing} className="gap-1.5"
              style={{ background: store.status === "live" ? "#dc2626" : `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : store.status === "live" ? "Unpublish"
                : <><Globe className="w-3.5 h-3.5" />Publish</>}
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto max-w-5xl">
        {hasStore ? (
          <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-xl border border-green-100 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800">Your store: <span className="font-semibold">{storeUrl}</span></span>
            </div>
            <a href={`http://localhost:3001/${vendorHandle}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium">
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-xl border border-amber-100 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Store not created yet</p>
              <p className="text-xs text-amber-600 mt-0.5">Configure below then click Save.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-6 bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap min-w-fit ${
                activeTab === tab.id ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` } : {}}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TEMPLATE ─────────────────────────────────────────────────────── */}
        {activeTab === "template" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Choose your template</CardTitle>
                <CardDescription>Controls the overall look and feel of your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setStore(p => ({ ...p, template: t.id }))}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${store.template === t.id ? "shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                      style={store.template === t.id ? { borderColor: BRAND.primary } : {}}>
                      <div className={`w-full h-24 rounded-lg mb-3 flex items-center justify-center border ${t.id === "bold" ? "bg-gray-900" : t.id === "editorial" ? "bg-stone-50" : "bg-white"} border-gray-200`}>
                        <div className="text-center">
                          <div className={`w-16 h-2 rounded mx-auto mb-1.5 ${t.id === "bold" ? "bg-white/30" : "bg-gray-200"}`} />
                          <div className={`w-10 h-1.5 rounded mx-auto mb-2 ${t.id === "bold" ? "bg-white/20" : "bg-gray-100"}`} />
                          <div className="grid grid-cols-3 gap-1 px-2">
                            {[1,2,3].map(i => <div key={i} className={`h-4 rounded ${t.id === "bold" ? "bg-white/10" : "bg-gray-100"}`} />)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                        {store.template === t.id && <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.primary }} />}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Font</CardTitle>
                <CardDescription>Typeface for your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {FONTS.map(f => (
                    <button key={f.id} onClick={() => setStore(p => ({ ...p, font: f.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${store.font === f.id ? "shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                      style={store.font === f.id ? { borderColor: BRAND.primary } : {}}>
                      <p className="text-lg font-medium text-gray-900 mb-0.5">{f.name}</p>
                      <p className="text-xs text-gray-500">{f.sample}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── BRANDING ─────────────────────────────────────────────────────── */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brand colors</CardTitle>
                <CardDescription>Applied across your entire store.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {[
                    { key: "primary_color", label: "Primary color", hint: "Buttons, links, accents" },
                    { key: "secondary_color", label: "Secondary color", hint: "Hover states, gradients" },
                  ].map(({ key, label, hint }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={(store as any)[key]}
                          onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                          className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                        <Input value={(store as any)[key]}
                          onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                          className="font-mono text-sm" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Preview</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-4 py-2 rounded-full text-white text-sm font-medium"
                      style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}>
                      Shop Now
                    </div>
                    <div className="px-4 py-2 rounded-full text-sm font-medium border-2"
                      style={{ borderColor: store.primary_color, color: store.primary_color }}>
                      Learn More
                    </div>
                    <div className="w-8 h-8 rounded-full" style={{ background: store.primary_color }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Store identity</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <Field label="Tagline">
                  <Input value={store.tagline ?? ""} onChange={e => setStore(p => ({ ...p, tagline: e.target.value }))}
                    placeholder="e.g. Official merch for Na Insaafi fans" maxLength={120} />
                  <p className="text-xs text-gray-400 mt-1">Shown below your name in the store header</p>
                </Field>
                <Field label="Hero image URL">
                  <Input value={store.hero_image ?? ""} onChange={e => setStore(p => ({ ...p, hero_image: e.target.value || null }))}
                    placeholder="https://..." />
                  <p className="text-xs text-gray-400 mt-1">Used as the hero section background</p>
                  {store.hero_image && (
                    <div className="mt-3 h-32 rounded-xl overflow-hidden border border-gray-200">
                      <img src={store.hero_image} alt="Hero preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Store logo & favicon</CardTitle>
                <CardDescription>Logo replaces your store name in the header. Favicon appears in browser tabs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUploader
                  label="Store logo"
                  hint="PNG or SVG with transparent background recommended. Displayed at ~40px height."
                  aspectHint="Any ratio"
                  value={store.store_logo}
                  onUpload={url => setStore(p => ({ ...p, store_logo: url }))}
                  onClear={() => setStore(p => ({ ...p, store_logo: null }))}
                  token={token ?? ""}
                  backendUrl={backendUrl}
                />
                <ImageUploader
                  label="Favicon"
                  hint="Square image, ideally 64×64px or 32×32px. Shown in browser tabs and bookmarks."
                  aspectHint="Square (1:1)"
                  value={store.store_favicon}
                  onUpload={url => setStore(p => ({ ...p, store_favicon: url }))}
                  onClear={() => setStore(p => ({ ...p, store_favicon: null }))}
                  token={token ?? ""}
                  backendUrl={backendUrl}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Announcement bar</CardTitle>
                <CardDescription>Appears at the very top of your store.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Announcement text">
                  <Input value={store.announcement_text ?? ""} onChange={e => setStore(p => ({ ...p, announcement_text: e.target.value || null }))}
                    placeholder="e.g. Free shipping on orders above ₹999 🎉" maxLength={200} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social links</CardTitle>
                <CardDescription>These are pulled from your creator profile. Update them in Profile settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: <Instagram className="w-4 h-4" />, label: "Instagram", color: "#E1306C" },
                    { icon: <Youtube className="w-4 h-4" />, label: "YouTube", color: "#FF0000" },
                    { icon: <Twitter className="w-4 h-4" />, label: "Twitter / X", color: "#1DA1F2" },
                    { icon: <Facebook className="w-4 h-4" />, label: "Facebook", color: "#1877F2" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-500">
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <span>{s.label}</span>
                      <span className="ml-auto text-xs text-gray-400">From profile</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Go to <strong>Profile → Social links</strong> to update these.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── SECTIONS ─────────────────────────────────────────────────────── */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Homepage sections</CardTitle>
                <CardDescription>Add, remove and reorder sections on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sections.map((s, i) => (
                  <SectionCard key={i} index={i} section={s} total={sections.length}
                    onUpdate={patch => updateSection(i, patch)}
                    onRemove={() => removeSection(i)}
                    onMove={dir => moveSection(i, dir)}
                    token={token ?? ""}           // ← add
                    backendUrl={backendUrl}
                  />
                ))}
                {sections.length === 0 && (
                  <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-400">No sections yet. Add one below.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Add a section</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.keys(SECTION_META) as SectionType[]).map(type => (
                    <button key={type} onClick={() => addSection(type)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-center">
                      <span className="text-xl">{SECTION_META[type].icon}</span>
                      <span className="text-xs font-medium text-gray-700">{SECTION_META[type].label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── PAGES ────────────────────────────────────────────────────────── */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            {editingPage ? (
              /* ── Page editor ── */
              <PageEditor
                page={editingPage}
                isNew={isNewPage}
                vendorHandle={vendorHandle}
                onSave={savePage}
                onCancel={() => { setEditingPage(null); setIsNewPage(false) }}
                onDelete={isNewPage ? undefined : () => { deletePage(editingPage.id); }}
              />
            ) : (
              <>
                {/* Pages list */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Custom pages</CardTitle>
                    <CardDescription>
                      Create standalone pages like About, FAQ, or Contact. They appear at
                      <span className="font-mono"> yourstore.junooni.com/p/your-slug</span>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pages.length === 0 ? (
                      <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No pages yet. Create your first one below.</p>
                      </div>
                    ) : (
                      pages.map(page => (
                        <div key={page.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all">
                          <span className="text-lg">{PAGE_TEMPLATES.find(t => t.id === page.template)?.icon ?? "📄"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{page.title}</p>
                            <p className="text-xs text-gray-400 font-mono">/p/{page.slug}</p>
                          </div>
                          <div className="flex gap-1">
                            {page.in_nav && (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">Header</Badge>
                            )}
                            {page.in_footer && (
                              <Badge className="bg-purple-50 text-purple-700 border-purple-100 text-xs">Footer</Badge>
                            )}
                          </div>
                          <button onClick={() => { setEditingPage(page); setIsNewPage(false) }}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => deletePage(page.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Create new page */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Create a new page</CardTitle>
                    <CardDescription>Choose a template to get started quickly.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {PAGE_TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => startNewPage(t.id)}
                          className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left">
                          <span className="text-2xl">{t.icon}</span>
                          <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                          <p className="text-xs text-gray-400">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── DOMAIN ───────────────────────────────────────────────────────── */}
        {activeTab === "domain" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your subdomain</CardTitle>
                <CardDescription>Available by default — no setup needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Input value={store.subdomain ?? vendorHandle} onChange={e => setStore(p => ({ ...p, subdomain: e.target.value }))}
                    placeholder={vendorHandle} className="rounded-r-none border-r-0 font-mono" />
                  <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-500 whitespace-nowrap">
                    .junooni.com
                  </div>
                </div>
                <p className="text-xs text-gray-400">Your store: <span className="font-semibold text-gray-600">{store.subdomain || vendorHandle}.junooni.com</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom domain</CardTitle>
                <CardDescription>Connect your own domain like <span className="font-mono">merch.yourname.com</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Custom domain">
                  <Input value={store.custom_domain ?? ""} onChange={e => setStore(p => ({ ...p, custom_domain: e.target.value || null }))}
                    placeholder="merch.yourname.com" className="font-mono" />
                </Field>
                {store.custom_domain && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-3">
                    <p className="text-sm font-medium text-blue-800">DNS setup instructions</p>
                    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-50 border-b border-blue-100">
                            <th className="px-3 py-2 text-left text-blue-700">Type</th>
                            <th className="px-3 py-2 text-left text-blue-700">Name</th>
                            <th className="px-3 py-2 text-left text-blue-700">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 font-mono text-gray-700">CNAME</td>
                            <td className="px-3 py-2 font-mono text-gray-700">{store.custom_domain.split(".")[0]}</td>
                            <td className="px-3 py-2 font-mono text-gray-700">{store.subdomain || vendorHandle}.junooni.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {store.domain_verified
                      ? <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
                      : <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending — contact us to activate</Badge>
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── SEO ──────────────────────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search engine optimization</CardTitle>
              <CardDescription>How your store appears in Google search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Page title">
                <Input value={store.seo_title ?? ""} onChange={e => setStore(p => ({ ...p, seo_title: e.target.value || null }))}
                  placeholder="e.g. Tanishk Bagchi — Official Merch Store" maxLength={60} />
                <p className="text-xs text-gray-400 mt-1">{(store.seo_title ?? "").length}/60 characters</p>
              </Field>
              <Field label="Meta description">
                <Textarea value={store.seo_description ?? ""} onChange={e => setStore(p => ({ ...p, seo_description: e.target.value || null }))}
                  placeholder="e.g. Shop official merchandise from Tanishk Bagchi." maxLength={160} rows={3} />
                <p className="text-xs text-gray-400 mt-1">{(store.seo_description ?? "").length}/160 characters</p>
              </Field>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Google preview</p>
                <p className="text-xs text-green-700 truncate">{store.custom_domain ?? `${store.subdomain || vendorHandle}.junooni.com`} ›</p>
                <p className="text-base text-blue-700 font-medium truncate">{store.seo_title || `${vendorHandle} — Official Merch Store`}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{store.seo_description || "Shop official merchandise. Powered by Junooni."}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab !== "pages" && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


// ── Image Uploader ─────────────────────────────────────────────────────────────

function ImageUploader({
  label, hint, value, onUpload, onClear, aspectHint, token, backendUrl,
}: {
  label: string; hint: string; value: string | null
  onUpload: (url: string) => void; onClear: () => void
  aspectHint?: string; token: string; backendUrl: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const res = await fetch(`${backendUrl}/vendors/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      const url = data.files?.[0]?.url
      if (url) onUpload(url)
    } catch (e) {
      console.error("Upload error:", e)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {/* Preview box */}
        <div
          className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="text-center p-2">
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-[10px] text-gray-400 leading-tight">{aspectHint ?? "Click to upload"}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isUploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</>
              : <><Upload className="w-3.5 h-3.5" />{value ? "Change" : "Upload"}</>
            }
          </button>
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />Remove
            </button>
          )}
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}

// ── Page Editor ───────────────────────────────────────────────────────────────

function PageEditor({ page, isNew, vendorHandle, onSave, onCancel, onDelete }: {
  page: StorePage; isNew: boolean; vendorHandle: string
  onSave: (page: StorePage) => void
  onCancel: () => void
  onDelete?: () => void
}) {
  const [draft, setDraft] = useState<StorePage>({ ...page })

  const update = (patch: Partial<StorePage>) => setDraft(p => ({ ...p, ...patch }))

  const handleTitleChange = (title: string) => {
    update({ title, ...(isNew ? { slug: slugify(title) } : {}) })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{isNew ? "New page" : `Edit: ${page.title}`}</CardTitle>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Title */}
        <Field label="Page title">
          <Input value={draft.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. About Me" />
        </Field>

        {/* Slug */}
        <Field label="URL slug">
          <div className="flex items-center">
            <div className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-xs text-gray-500 whitespace-nowrap">
              /{vendorHandle}/p/
            </div>
            <Input value={draft.slug} onChange={e => update({ slug: slugify(e.target.value) })}
              placeholder="about-me" className="rounded-l-none font-mono" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Full URL: <span className="font-mono">{vendorHandle}.junooni.com/p/{draft.slug}</span>
          </p>
        </Field>


        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-600">Page content</label>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium"
              style={draft.content.trim().startsWith("<")
                ? { background: "#fff7ed", borderColor: "#fed7aa", color: "#c2410c" }
                : { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}>
              {draft.content.trim().startsWith("<") ? "⚡ HTML/CSS/JS" : "📝 Markdown"}
            </span>
          </div>
          <Textarea
            value={draft.content}
            onChange={e => update({ content: e.target.value })}
            placeholder="Markdown: ## Heading, **bold**, [link](url)\n\nHTML: start with < tag for full HTML/CSS/JS"
            rows={14}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Content starting with <code className="bg-gray-100 px-1 rounded">&lt;</code> renders as HTML/CSS/JS.
            Otherwise Markdown: **bold**, ## headings, [links](url), - lists
          </p>
        </div>

        {/* Show in nav */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
          <input type="checkbox" id="in_nav" checked={draft.in_nav}
            onChange={e => update({ in_nav: e.target.checked })}
            className="w-4 h-4 accent-orange-500" />
          <div>
            <label htmlFor="in_nav" className="text-sm font-medium text-gray-700 cursor-pointer">
              Show in navigation
            </label>
            <p className="text-xs text-gray-400">Adds this page to your store's nav menu</p>
          </div>
        </div>

        {/* Live preview */}
        {draft.content && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live preview</p>
              <span className="text-xs text-gray-400">Exactly how it appears on your store</span>
            </div>
            <iframe
              key={draft.content}
              srcDoc={
                draft.content.trim().startsWith("<")
                  ? (draft.content.includes("<html") || draft.content.includes("<!DOCTYPE")
                    ? draft.content
                    : `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:inherit;margin:0;padding:16px}</style></head><body>${draft.content}</body></html>`)
                  : `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
                      body{font-family:system-ui,sans-serif;padding:24px;color:#1f2937;line-height:1.6}
                      h1{font-size:1.875rem;font-weight:700;margin:0 0 1rem}
                      h2{font-size:1.5rem;font-weight:700;margin:2rem 0 0.75rem}
                      h3{font-size:1.25rem;font-weight:600;margin:1.5rem 0 0.5rem}
                      p{margin:0 0 1rem}
                      strong{font-weight:600}
                      em{font-style:italic}
                      a{color:#e65100;text-decoration:underline}
                      ul{margin:0 0 1rem;padding-left:1.5rem}
                      li{margin-bottom:0.25rem}
                      code{background:#f3f4f6;padding:0.125rem 0.375rem;border-radius:0.25rem;font-size:0.875rem}
                    </style></head><body>${
                      draft.content
                        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.+?)\*/g, "<em>$1</em>")
                        .replace(/`(.+?)`/g, "<code>$1</code>")
                        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
                        .replace(/^- (.+)$/gm, "<li>$1</li>")
                        .replace(/(<li>[\s\S]*?<\/li>?)+/g, (b) => `<ul>\${b}</ul>`)
                        .replace(/^(?!<)(.+)$/gm, (l) => l.trim() ? `<p>\${l}</p>` : "")
                    }</body></html>`
              }
              className="w-full border-0"
              style={{ height: "380px" }}
              sandbox="allow-scripts allow-same-origin"
              title="Page preview"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={() => onSave(draft)} className="flex-1 gap-2"
            style={{ background: `linear-gradient(135deg, #e65100 0%, #ac1900 100%)`, color: "white" }}>
            <Save className="w-4 h-4" />
            {isNew ? "Create page" : "Save changes"}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ index, section, total, onUpdate, onRemove, onMove, token, backendUrl }: {
  index: number; section: StoreSection; total: number
  onUpdate: (patch: Partial<StoreSection>) => void
  onRemove: () => void; onMove: (dir: "up" | "down") => void
  token: string        // ← add
  backendUrl: string   // ← add
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = SECTION_META[section.type]
  if (!meta) return null 

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <span className="text-base">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{meta.label}</p>
          <p className="text-xs text-gray-400 truncate">{meta.desc}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); onMove("up") }} disabled={index === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={e => { e.stopPropagation(); onMove("down") }} disabled={index === total - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={e => { e.stopPropagation(); onRemove() }}
            className="p-1 rounded hover:bg-red-50 transition-colors ml-1">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">

          {section.type === "hero" && (<>
            <Field label="Headline">
              <Input value={section.headline ?? ""} onChange={e => onUpdate({ headline: e.target.value })} placeholder="Your big headline" />
            </Field>
            <Field label="Subtext">
              <Input value={section.subtext ?? ""} onChange={e => onUpdate({ subtext: e.target.value })} placeholder="A short supporting line" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA button label">
                <Input value={section.cta_label ?? ""} onChange={e => onUpdate({ cta_label: e.target.value })} placeholder="Shop Now" />
              </Field>
              <Field label="CTA link (optional)">
                <Input value={section.cta_url ?? ""} onChange={e => onUpdate({ cta_url: e.target.value })} placeholder="https://..." />
              </Field>
            </div>
            <Field label="Background image URL">
              <Input value={section.background_image ?? ""} onChange={e => onUpdate({ background_image: e.target.value || undefined })} placeholder="https://..." />
              {section.background_image && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={section.background_image} alt="bg preview" className="w-full h-full object-cover" />
                </div>
              )}
            </Field>
          </>)}

          {section.type === "announcement" && (<>
            <Field label="Announcement text">
              <Input value={section.title ?? ""} onChange={e => onUpdate({ title: e.target.value })} placeholder="Free shipping on all orders! 🎉" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Background color">
                <div className="flex items-center gap-2">
                  <input type="color" value={section.background_color ?? "#e65100"}
                    onChange={e => onUpdate({ background_color: e.target.value })}
                    className="w-10 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
                  <Input value={section.background_color ?? "#e65100"}
                    onChange={e => onUpdate({ background_color: e.target.value })}
                    className="font-mono text-sm" />
                </div>
              </Field>
              <Field label="Text color">
                <div className="flex items-center gap-2">
                  <input type="color" value={section.text_color ?? "#ffffff"}
                    onChange={e => onUpdate({ text_color: e.target.value })}
                    className="w-10 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
                  <Input value={section.text_color ?? "#ffffff"}
                    onChange={e => onUpdate({ text_color: e.target.value })}
                    className="font-mono text-sm" />
                </div>
              </Field>
            </div>
            {section.title && (
              <div className="px-4 py-2 rounded-lg text-sm font-medium text-center"
                style={{ background: section.background_color ?? "#e65100", color: section.text_color ?? "#ffffff" }}>
                {section.title}
              </div>
            )}
          </>)}

          {section.type === "featured" && (<>
            <Field label="Section title">
              <Input value={section.title ?? ""} onChange={e => onUpdate({ title: e.target.value })} placeholder="Featured drops" />
            </Field>
            <Field label="Product IDs (comma separated)">
              <Input value={section.product_ids?.join(", ") ?? ""}
                onChange={e => onUpdate({ product_ids: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="prod_01ABC..., prod_01DEF..." />
              <p className="text-xs text-gray-400 mt-1">Leave empty to show latest products</p>
            </Field>
          </>)}

          {section.type === "collection" && (<>
            <Field label="Section title">
              <Input value={section.title ?? ""} onChange={e => onUpdate({ title: e.target.value })} placeholder="All Products" />
            </Field>
            <Field label="Max products to show">
              <Input type="number" value={section.limit ?? 12} onChange={e => onUpdate({ limit: parseInt(e.target.value) || 12 })} min={1} max={48} />
            </Field>
          </>)}

          {section.type === "about" && (<>
          <Field label="Section title">
            <Input value={section.title ?? ""} onChange={e => onUpdate({ title: e.target.value })} placeholder="About Me" />
          </Field>
          <Field label="Content (leave empty to use your bio)">
            <Textarea value={section.text ?? ""} onChange={e => onUpdate({ text: e.target.value })} placeholder="Your story..." rows={4} />
          </Field>

          {/* REPLACE the old Image URL field with this: */}
          <Field label="Image (leave empty to use cover photo)">
            <div className="flex gap-2 mb-2">
              <Input
                value={section.image ?? ""}
                onChange={e => onUpdate({ image: e.target.value || undefined })}
                placeholder="https://... or upload below"
                className="flex-1"
              />
            </div>
            {/* Upload button */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer w-fit">
              <Upload className="w-3.5 h-3.5" />
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append("files", file)
                  try {
                    const res = await fetch(`${backendUrl}/vendors/uploads`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    })
                    if (!res.ok) throw new Error("Upload failed")
                    const data = await res.json()
                    const url = data.files?.[0]?.url
                    if (url) onUpdate({ image: url })
                  } catch (err) {
                    console.error("Image upload failed:", err)
                  }
                }}
              />
            </label>
            {section.image && (
              <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-200 relative group">
                <img src={section.image} alt="about preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => onUpdate({ image: undefined })}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </Field>
            <Field label="Image position">
              <div className="flex gap-2">
                {(["left", "right"] as const).map(pos => (
                  <button key={pos} onClick={() => onUpdate({ image_position: pos })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                      (section.image_position ?? "left") === pos ? "text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    style={(section.image_position ?? "left") === pos ? { borderColor: "#e65100", background: "#e65100" } : {}}>
                    Image {pos}
                  </button>
                ))}
              </div>
            </Field>
          </>)}

          {section.type === "social" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Show social links</p>
              {[
                { key: "show_instagram", label: "Instagram", icon: "📸" },
                { key: "show_youtube",   label: "YouTube",   icon: "▶️" },
                { key: "show_twitter",   label: "Twitter / X", icon: "🐦" },
                { key: "show_facebook",  label: "Facebook",  icon: "👥" },
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                  <input type="checkbox" checked={!!(section as any)[key]}
                    onChange={e => onUpdate({ [key]: e.target.checked })}
                    className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-gray-700">{icon} {label}</span>
                </label>
              ))}
            </div>
          )}

          {section.type === "divider" && (
            <p className="text-xs text-gray-400">Just a visual separator — no settings needed.</p>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
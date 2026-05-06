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
  Globe, Palette, Layout, Eye, Save, Trash2,
  CheckCircle2, AlertCircle, ExternalLink, Loader2,
  ChevronUp, ChevronDown, Sparkles, Monitor, ArrowRight, Lock,
  FileText, Plus, X, Instagram, Youtube, Twitter, Facebook, Upload,
  Rocket, Crown, BarChart2, Image as ImageIcon, Zap, Settings, Copy,
  ArrowUpRight, Package, Users, ShoppingBag, Check, ChevronRight,
  Star, TrendingUp, Radio, Megaphone, BookOpen, Link as LinkIcon,
  Video, Share2, AlertTriangle, EyeOff
} from "lucide-react"
import { ProfileDropdown } from "@/components/profile-dropdown"
import AdminImpersonationBanner from "@/components/AdminImpersonationBanner"
import { getStoreUrl, getPreviewUrl, getPageUrl } from "@/lib/store-urls"

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

type StoreTemplate = "minimal" | "bold" | "editorial"
type StoreStatus   = "draft" | "live" | "paused"
type StoreFont     = "inter" | "poppins" | "playfair"
type SectionType   = "hero" | "featured" | "collection" | "about" | "social" | "announcement" | "divider" | "text" | "image" | "video" | "links" | "html"
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
  id: string; title: string; slug: string; template: PageTemplate
  content: string; in_nav: boolean; in_footer: boolean; created_at: string
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
  instagram_url?: string; youtube_url?: string; twitter_url?: string; facebook_url?: string
  password_enabled?: boolean
  store_password?: string | null
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
    { type: "social", show_instagram: true, show_youtube: true },
  ]},
  pages: { pages: [] },
  seo_title: null, seo_description: null,
  password_enabled: false, store_password: null,
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

interface SetupStep {
  id: string
  title: string
  desc: string
  icon: React.ReactNode
  check: (store: VendorStore) => boolean
  cta: string
  ctaLink?: string
  ctaAction?: "modal"
}

const SETUP_STEPS = (store: VendorStore, hasStore: boolean): SetupStep[] => [
  {
    id: "template",
    title: "Pick your store look",
    desc: "Choose a template and your brand colors to give your store a personality.",
    icon: <Palette className="w-5 h-5" />,
    check: (_s) => hasStore,
    cta: "Choose template",
    ctaAction: "modal",
  },
  {
    id: "branding",
    title: "Add your logo & tagline",
    desc: "Add your logo and write a short tagline so fans know it's really you.",
    icon: <ImageIcon className="w-5 h-5" />,
    check: (s) => !!(s.store_logo || s.tagline),
    cta: "Add branding",
    ctaAction: "modal",
  },
  {
    id: "launch",
    title: "Go live",
    desc: "Your store is in Draft mode. Publish it so fans can find and buy from it.",
    icon: <Rocket className="w-5 h-5" />,
    check: (s) => s.status === "live",
    cta: "Publish store",
    ctaAction: "modal",
  },
]

// ─── Confirm Dialog ──────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "info"
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "danger", onConfirm, onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "Escape") onCancel()
      if (e.key === "Enter") onConfirm()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  const iconBg = variant === "danger" ? "bg-red-50" : variant === "warning" ? "bg-amber-50" : "bg-blue-50"
  const iconColor = variant === "danger" ? "text-red-500" : variant === "warning" ? "text-amber-500" : "text-blue-500"
  const btnBg = variant === "danger" ? "bg-red-600 hover:bg-red-700" : variant === "warning" ? "bg-amber-500 hover:bg-amber-600" : `bg-[${BRAND.primary}]`

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-sm overflow-hidden duration-200 bg-white shadow-2xl rounded-2xl animate-in zoom-in-95 fade-in"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Top accent line */}
        <div className={`h-1 w-full ${variant === "danger" ? "bg-red-500" : variant === "warning" ? "bg-amber-400" : "bg-blue-500"}`} />

        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
            <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
          </div>

          {/* Content */}
          <h3 className="mb-2 text-base font-bold leading-snug text-gray-900">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-500">{description}</p>

          {/* Keyboard hint */}
          <p className="text-[11px] text-gray-300 mt-4">Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 text-[10px] font-mono">Enter</kbd> to confirm · <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 text-[10px] font-mono">Esc</kbd> to cancel</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StorePage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [store, setStore] = useState<VendorStore>(DEFAULT_STORE)
  const [vendorHandle, setVendorHandle] = useState("")
  const [vendorName, setVendorName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [sellOnOwnStore, setSellOnOwnStore] = useState<boolean | null>(null)
  const [isEnabling, setIsEnabling] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isNewPage, setIsNewPage] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>("free")

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
  const coerce = (v: any) => v === true || v === 1 || v === "true" || v === "1"

  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        const [vRes, sRes] = await Promise.all([
          fetch(`${backendUrl}/vendors/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/vendors/me/store`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (vRes.ok) {
          const vd = await vRes.json()
          setVendorHandle(vd.vendor?.handle ?? "")
          setVendorName(vd.vendor?.name ?? "")
          setSellOnOwnStore(coerce(vd.vendor?.sell_on_own_store))
          setCurrentPlan(vd.vendor?.plan ?? "free")
        }
        if (sRes.ok) {
          const sd = await sRes.json()
          if (sd.store) { setStore({ ...DEFAULT_STORE, ...sd.store }); setHasStore(true) }
        }
      } catch (e) { console.error("Failed to load vendor/store:", e) }
      setIsLoading(false)
    }
    load()
  }, [])

  const saveStore = async (patch?: Partial<VendorStore>) => {
    setIsSaving(true)
    const payload = { ...(patch ? { ...store, ...patch } : store), subdomain: store.subdomain || vendorHandle || undefined }
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setStore(p => ({ ...p, ...(patch ?? {}), ...(data.store ?? {}) }))
      setHasStore(true)
      toast({ title: "Saved!", description: "Your store has been updated." })
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const handlePublish = async () => {
    const newStatus: StoreStatus = store.status === "live" ? "draft" : "live"
    setIsPublishing(true)
    try {
      await saveStore({ status: newStatus })
      setStore(p => ({ ...p, status: newStatus }))
      if (newStatus === "live") {
        toast({ title: "🎉 You're live!", description: `Shop at ${store.subdomain || vendorHandle}.junooni.com` })
      }
    } catch {} finally { setIsPublishing(false) }
  }

  const handleEnableOwnStore = async () => {
    setIsEnabling(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sell_on_own_store: true }),
      })
      if (!res.ok) throw new Error("Failed")
      setSellOnOwnStore(true)
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsEnabling(false) }
  }

  const pages = store.pages?.pages ?? []
  const storeUrl = `${vendorHandle}.junooni.com`
  const isLive = store.status === "live"
  const setupSteps = SETUP_STEPS(store, hasStore)
  const completedSteps = setupSteps.filter(s => s.check(store)).length
  const setupDone = completedSteps === setupSteps.length

  const savePage = (page: StorePage) => {
    const existing = pages.find(p => p.id === page.id)
    const updated = existing ? pages.map(p => p.id === page.id ? page : p) : [...pages, page]
    setStore(p => ({ ...p, pages: { pages: updated } }))
    setEditingPage(null); setIsNewPage(false)
    saveStore({ pages: { pages: updated } })
  }
  const deletePage = (id: string) => {
    const updated = pages.filter(pg => pg.id !== id)
    setStore(p => ({ ...p, pages: { pages: updated } }))
    if (editingPage?.id === id) { setEditingPage(null); setIsNewPage(false) }
    saveStore({ pages: { pages: updated } })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl opacity-20 animate-ping" style={{ background: BRAND.primary }} />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-sm font-medium tracking-wide text-gray-400">Loading your store…</p>
      </div>
    </div>
  )

  // ── Gate: own store not enabled ──────────────────────────────────────
  if (!sellOnOwnStore) return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="container flex items-center justify-between px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-semibold text-gray-800">My Store</span>
          </div>
          <ProfileDropdown />
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[88vh] px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 shadow-sm rounded-2xl" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
              <ShoppingBag className="text-white w-7 h-7" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Launch your merch store</h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Get a free storefront at{" "}
              <span className="font-mono font-semibold text-gray-700">{vendorHandle || "yourname"}.junooni.com</span>
              <br />Zero inventory. No upfront cost.
            </p>
          </div>

          <div className="mb-5 overflow-hidden bg-white border border-gray-200 rounded-2xl">
            {[
              { icon: "🌐", title: "Your own URL",        sub: `${vendorHandle || "yourname"}.junooni.com` },
              { icon: "🎨", title: "Fully branded",       sub: "Your colors, fonts, logo" },
              { icon: "📦", title: "Print-on-demand",     sub: "We handle printing & shipping" },
              { icon: "💰", title: "You keep the margin", sub: "Set your own prices" },
              { icon: "📄", title: "Custom pages",        sub: "About, FAQ, Contact + more" },
            ].map((item, i, arr) => (
              <div key={item.title} className={`flex items-center gap-3.5 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                <span className="w-8 text-xl text-center shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>

          <button onClick={handleEnableOwnStore} disabled={isEnabling}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
            {isEnabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {isEnabling ? "Setting up…" : "Set up my store — it's free"}
          </button>
          <button onClick={() => navigate({ to: "/dashboard" })} className="block mx-auto mt-4 text-xs text-gray-400 transition-colors hover:text-gray-600">
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="container flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">My Store</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                {isLive ? "Live" : "Draft"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* {hasStore && (
              <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium">
                <Eye className="w-3.5 h-3.5" />Preview
              </a>
            )} */}
            <Link to="/store/editor"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
              <Layout className="w-3.5 h-3.5" />Store editor
            </Link>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container max-w-5xl px-4 mx-auto py-7">

        {/* ── Hero Banner ── */}
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-2xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isLive
                  ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Live
                    </span>
                  : <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />Draft
                    </span>
                }
              </div>
              <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {isLive ? `You're live, ${vendorName || "Creator"}! 🎉` : `Hey ${vendorName || "Creator"} 👋`}
              </h1>
              <p className="text-sm text-gray-500">
                {isLive
                  ? <>Your fans can shop at{" "}<a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-dotted underline-offset-2" style={{ color: BRAND.primary }}>{storeUrl}</a></>
                  : "Complete the setup below to publish your store and start selling."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasStore && (
                <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all">
                  <Eye className="w-4 h-4" />Preview
                </a>
              )}
              <button onClick={handlePublish} disabled={isPublishing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: isLive ? "#dc2626" : `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                {isPublishing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isLive
                    ? <><Radio className="w-4 h-4" />Unpublish</>
                    : <><Rocket className="w-4 h-4" />Go live</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Setup Checklist ── */}
        {!setupDone && (
          <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Store setup</h2>
                <p className="text-xs text-gray-400 mt-0.5">{completedSteps} of {setupSteps.length} steps completed</p>
              </div>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(completedSteps / setupSteps.length) * 100}%`, background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})` }} />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {setupSteps.map((step) => {
                const done = step.check(store)
                return (
                  <div key={step.id}
                    className={`flex items-center gap-4 px-6 py-4 ${done ? "bg-gray-50/50" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      {done ? <CheckCircle2 className="w-4.5 h-4.5" /> : step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{step.desc}</p>
                    </div>
                    {!done && (
                      step.ctaLink
                        ? <Link to={step.ctaLink as any}
                            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                            {step.cta}
                          </Link>
                        : <button onClick={() => setActiveModal(step.id)}
                            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                            {step.cta}
                          </button>
                    )}
                    {done && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Action cards ── */}
        <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2">

          {/* Store editor */}
          <Link to="/store/editor"
            className="flex items-center gap-4 p-5 transition-all bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
              <Layout className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Store editor</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">Hero, product grids, sections layout</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 transition-colors group-hover:text-gray-500 shrink-0" />
          </Link>

          {/* Branding */}
          <button onClick={() => setActiveModal("branding")}
            className="flex items-center gap-4 p-5 text-left transition-all bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm group">
            <div className="flex items-center justify-center text-purple-600 w-11 h-11 rounded-xl shrink-0 bg-purple-50">
              <Palette className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Branding & identity</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">Logo, colors, tagline, announcement</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 transition-colors group-hover:text-gray-500 shrink-0" />
          </button>

          {/* Custom pages */}
          <button onClick={() => setActiveModal("pages")}
            className="flex items-center gap-4 p-5 text-left transition-all bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm group">
            <div className="flex items-center justify-center text-blue-600 w-11 h-11 rounded-xl shrink-0 bg-blue-50">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Custom pages</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pages.length > 0
                  ? <><span className="font-semibold text-blue-600">{pages.length} page{pages.length !== 1 ? "s" : ""}</span> created</>
                  : "About, FAQ, Contact, or custom HTML"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 transition-colors group-hover:text-gray-500 shrink-0" />
          </button>

          {/* Domain & SEO */}
          <button onClick={() => setActiveModal("domain")}
            className="flex items-center gap-4 p-5 text-left transition-all bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-emerald-50 text-emerald-600">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Domain & SEO</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {store.custom_domain
                  ? <span className="font-mono font-semibold text-emerald-600">{store.custom_domain}</span>
                  : "Custom domain, meta title, description"}
              </p>
            </div>
            {store.domain_verified
              ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              : <ChevronRight className="w-4 h-4 text-gray-300 transition-colors group-hover:text-gray-500 shrink-0" />
            }
          </button>
        </div>

        {/* ── Upgrade nudge ── */}
        <div className="flex flex-col gap-4 p-5 bg-white border sm:flex-row sm:items-center border-amber-200 rounded-2xl">
          <div className="flex items-center flex-1 gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 shrink-0">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Unlock your full store potential</p>
              <p className="text-xs text-gray-500 mt-0.5">Remove Junooni branding, connect a custom domain, and get priority payouts.</p>
            </div>
          </div>
          <Link to="/store/membership"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
            <Crown className="w-3.5 h-3.5" />View plans
          </Link>
        </div>

      </div>

      {/* ── Modals ── */}
      {activeModal && (
        <Modal title={
          activeModal === "branding" ? "Branding & identity"
          : activeModal === "domain"   ? "Domain & SEO"
          : activeModal === "pages"    ? "Custom pages"
          : activeModal === "template" ? "Store look"
          : activeModal === "launch"   ? "Go live"
          : ""
        } onClose={() => setActiveModal(null)}>

          {(activeModal === "template" || activeModal === "launch") && (
            <TemplatePanel store={store} onChange={patch => setStore(p => ({ ...p, ...patch }))}
              onSave={() => { saveStore(); setActiveModal(null) }} isSaving={isSaving}
              vendorHandle={vendorHandle} isLive={isLive} onPublish={handlePublish} isPublishing={isPublishing} />
          )}
          {activeModal === "branding" && (
            <BrandingPanel store={store} onChange={patch => setStore(p => ({ ...p, ...patch }))}
              onSave={() => { saveStore(); setActiveModal(null) }} isSaving={isSaving}
              token={token ?? ""} backendUrl={backendUrl} vendorPlan={currentPlan} />
          )}
          {activeModal === "domain" && (
            <DomainSeoPanel store={store} onChange={patch => setStore(p => ({ ...p, ...patch }))}
              onSave={(patch) => { if (patch) saveStore(patch); else saveStore(); }} isSaving={isSaving}
              vendorHandle={vendorHandle} token={token ?? ""} backendUrl={backendUrl} vendorPlan={currentPlan} />
          )}
          {activeModal === "pages" && (
            <PagesPanel
              pages={pages}
              vendorHandle={vendorHandle}
              onSave={savePage}
              onDelete={deletePage}
              onClose={() => setActiveModal(null)}
            />
          )}
        </Modal>
      )}
    </div>
  )
}

// ─── Modal wrapper ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 px-2 py-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ─── Template + Launch panel ────────────────────────────────────────────────

const TEMPLATES = [
  { id: "minimal"   as StoreTemplate, name: "Minimal",   desc: "Clean, white, product-focused.",  preview: "bg-white" },
  { id: "bold"      as StoreTemplate, name: "Bold",      desc: "Dark, big typography.",            preview: "bg-gray-900" },
  { id: "editorial" as StoreTemplate, name: "Editorial", desc: "Magazine-style layout.",           preview: "bg-stone-50" },
]
const FONTS = [
  { id: "inter"    as StoreFont, name: "Inter",    sample: "Clean & Modern" },
  { id: "poppins"  as StoreFont, name: "Poppins",  sample: "Friendly & Round" },
  { id: "playfair" as StoreFont, name: "Playfair", sample: "Elegant & Serif" },
]

function TemplatePanel({ store, onChange, onSave, isSaving, vendorHandle, isLive, onPublish, isPublishing }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: () => void; isSaving: boolean
  vendorHandle: string; isLive: boolean; onPublish: () => void; isPublishing: boolean
}) {
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">Template</p>
        <p className="mb-4 text-xs text-gray-400">Choose a layout style for your store homepage.</p>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onChange({ template: t.id })}
              className={`text-left p-3 rounded-xl border-2 transition-all ${store.template === t.id ? "shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
              style={store.template === t.id ? { borderColor: BRAND.primary } : {}}>
              <div className={`w-full h-14 rounded-lg mb-2.5 ${t.preview} border border-gray-200 flex items-center justify-center overflow-hidden`}>
                <div className="w-10/12 space-y-1">
                  <div className={`h-1.5 rounded w-2/3 mx-auto ${t.id === "bold" ? "bg-white/30" : "bg-gray-300"}`} />
                  <div className="grid grid-cols-3 gap-0.5">{[1,2,3].map(i => <div key={i} className={`h-3 rounded ${t.id === "bold" ? "bg-white/10" : "bg-gray-100"}`} />)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-bold text-gray-800">{t.name}</p>
                {store.template === t.id && <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: BRAND.primary }}><Check className="w-2 h-2 text-white" /></div>}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">Font</p>
        <p className="mb-4 text-xs text-gray-400">Sets the typeface across your entire storefront.</p>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map(f => (
            <button key={f.id} onClick={() => onChange({ font: f.id })}
              className={`p-3.5 rounded-xl border-2 text-left transition-all ${store.font === f.id ? "shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
              style={store.font === f.id ? { borderColor: BRAND.primary } : {}}>
              <p className="text-sm font-bold text-gray-900">{f.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{f.sample}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={onSave} disabled={isSaving}
          className="flex items-center justify-center flex-1 gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
        </button>
        <button onClick={onPublish} disabled={isPublishing}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60">
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" />
            : isLive ? <><Radio className="w-4 h-4 text-red-500" />Unpublish</>
            : <><Rocket className="w-4 h-4" />Go live</>}
        </button>
      </div>
    </div>
  )
}

// ─── Branding panel ──────────────────────────────────────────────────────────

function BrandingPanel({ store, onChange, onSave, isSaving, token, backendUrl }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: () => void; isSaving: boolean; token: string; backendUrl: string
}) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File, setLoading: (b: boolean) => void, key: "store_logo" | "store_favicon") => {
    setLoading(true)
    try {
      const fd = new FormData(); fd.append("files", file)
      const res = await fetch(`${backendUrl}/vendors/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      const url = data.files?.[0]?.url
      if (url) onChange({ [key]: url })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">Brand colors</p>
        <p className="mb-4 text-xs text-gray-400">Used on buttons, links, and accents across your store.</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { key: "primary_color",   label: "Primary",   hint: "Buttons & links" },
            { key: "secondary_color", label: "Secondary",  hint: "Gradients" },
          ].map(({ key, label, hint }) => (
            <div key={key} className="border border-gray-200 rounded-xl p-3.5">
              <label className="block mb-2 text-xs font-semibold text-gray-600">{label} <span className="font-normal text-gray-400">· {hint}</span></label>
              <div className="flex items-center gap-2">
                <input type="color" value={(store as any)[key] ?? "#000000"}
                  onChange={e => onChange({ [key]: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0 bg-white" />
                <Input value={(store as any)[key] ?? ""} onChange={e => onChange({ [key]: e.target.value })}
                  className="font-mono text-sm h-9" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center text-xs font-bold text-white h-9 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}>
          Color preview
        </div>
      </div>

      {/* Logo */}
      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">Logo</p>
        <p className="mb-4 text-xs text-gray-400">PNG or SVG with transparent background recommended.</p>
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-20 h-20 overflow-hidden transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-xl bg-gray-50 hover:border-gray-400 shrink-0"
            onClick={() => logoRef.current?.click()}>
            {store.store_logo
              ? <img src={store.store_logo} alt="logo" className="object-contain w-full h-full p-2" />
              : <ImageIcon className="w-6 h-6 text-gray-300" />}
          </div>
          <div className="flex-1 space-y-2">
            <button onClick={() => logoRef.current?.click()} disabled={isUploadingLogo}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-60">
              {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {store.store_logo ? "Change logo" : "Upload logo"}
            </button>
            {store.store_logo && (
              <button onClick={() => onChange({ store_logo: null })}
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                <Trash2 className="w-3.5 h-3.5" />Remove logo
              </button>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], setIsUploadingLogo, "store_logo")} />
        </div>
      </div>

      {/* Tagline */}
      <Field label="Tagline" hint="Shown below your name in the store header">
        <Input value={store.tagline ?? ""} onChange={e => onChange({ tagline: e.target.value || null })}
          placeholder="e.g. Official merch for my fans" maxLength={120} />
      </Field>

      {/* Announcement */}
      <Field label="Announcement bar" hint="Banner at the top of your store">
        <Input value={store.announcement_text ?? ""} onChange={e => onChange({ announcement_text: e.target.value || null })}
          placeholder="Free shipping on orders above ₹999 🎉" maxLength={200} />
      </Field>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={onSave} disabled={isSaving}
          className="flex items-center justify-center flex-1 gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
        </button>
      </div>
    </div>
  )
}

// ─── Domain + SEO panel ──────────────────────────────────────────────────────

function DomainSeoPanel({ store, onChange, onSave, isSaving, vendorHandle, token, backendUrl, vendorPlan }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: (patch?: Partial<VendorStore>) => void; isSaving: boolean; vendorHandle: string
  token: string; backendUrl: string; vendorPlan?: string
}) {
  const [domainInput, setDomainInput] = useState(store.custom_domain ?? "")
  const [step, setStep] = useState<"idle" | "entered" | "dns" | "verifying" | "verified" | "failed">(
    store.domain_verified ? "verified" : store.custom_domain ? "dns" : "idle"
  )
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState("")
  const [confirmRemove, setConfirmRemove] = useState(false)

  const subdomain = store.subdomain || vendorHandle
  const isProPlan = vendorPlan === "pro" || vendorPlan === "enterprise"
  const VPS_IP = "134.209.145.195"

  const cleanDomain = (raw: string) => raw.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()

  const handleDomainChange = (raw: string) => {
    const cleaned = cleanDomain(raw)
    setDomainInput(cleaned)
    setVerifyError("")
    setStep(cleaned ? "entered" : "idle")
  }

  const handleSaveDomain = async () => {
    const cleaned = cleanDomain(domainInput)
    if (!cleaned) return
    onChange({ custom_domain: cleaned, domain_verified: false })
    await onSave()
    setStep("dns")
  }

  const handleVerifyDomain = async () => {
    setIsVerifying(true)
    setVerifyError("")
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store/verify-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: domainInput || store.custom_domain }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.verified) {
          onChange({ domain_verified: true })
          await onSave()
          setStep("verified")
        } else {
          setVerifyError(data.message ?? "DNS record not found yet. Make sure the A record is saved.")
          setStep("failed")
        }
      } else {
        setVerifyError("Verification check unavailable. Contact support@junooni.com to manually activate.")
        setStep("failed")
      }
    } catch {
      setVerifyError("Could not reach the server. Check your connection and try again.")
      setStep("failed")
    } finally {
      setIsVerifying(false)
    }
  }

  // ConfirmDialog-driven removal
  const confirmAndRemoveDomain = async () => {
    setConfirmRemove(false)
    setDomainInput("")
    setStep("idle")
    setVerifyError("")
    const patch = { custom_domain: null, domain_verified: false }
    onChange(patch)
    await onSave(patch)
  }

   function PasswordInputWithToggle({
  value, onChange, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const [localValue, setLocalValue] = useState(value)  // ← local copy

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}   // ← only update local
        onBlur={() => onChange(localValue)}              // ← sync to parent on blur
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-11 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

  return (
    <div className="space-y-7">

      {/* Confirm dialog for domain removal */}
      <ConfirmDialog
        open={confirmRemove}
        title="Remove custom domain?"
        description={`Your store will fall back to ${subdomain}.junooni.com. You can reconnect a domain at any time.`}
        confirmLabel="Yes, remove domain"
        cancelLabel="Keep domain"
        variant="danger"
        onConfirm={confirmAndRemoveDomain}
        onCancel={() => setConfirmRemove(false)}
      />

      {/* Junooni subdomain */}
      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">Your Junooni subdomain</p>
        <p className="mb-3 text-xs text-gray-400">Free on all plans — works automatically, no setup needed.</p>
        <div className="flex items-center overflow-hidden transition-colors border-2 border-emerald-200 rounded-xl bg-emerald-50 focus-within:border-emerald-400">
          <input
            value={vendorHandle}
            onChange={e => onChange({ subdomain: e.target.value })}
            className="flex-1 px-4 py-2.5 font-mono text-sm font-semibold bg-transparent focus:outline-none text-emerald-900"
            placeholder={vendorHandle}
          />
          <span className="px-4 py-2.5 text-sm font-semibold border-l text-emerald-700 bg-emerald-100 border-emerald-200 whitespace-nowrap">.junooni.com</span>
        </div>
        <div className="flex items-center gap-2 px-1 mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <p className="text-xs text-emerald-700">
            Live at{" "}
            <a href={`https://${vendorHandle}.junooni.com`} target="_blank" rel="noopener noreferrer"
              className="font-bold underline">{vendorHandle}.junooni.com</a>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Custom domain */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-gray-800">Custom domain</p>
          <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
            <Crown className="w-3 h-3" />Pro plan
          </span>
        </div>
        <p className="mb-4 text-xs text-gray-400">Connect <span className="font-mono text-gray-600">merch.yourname.com</span> to your store.</p>

        {!isProPlan && (
          <div className="flex items-start gap-4 p-4 border border-purple-200 rounded-xl bg-purple-50">
            <div className="flex items-center justify-center bg-purple-100 w-9 h-9 rounded-xl shrink-0">
              <Crown className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-bold text-purple-900">Upgrade to Pro for a custom domain</p>
              <p className="mb-3 text-xs leading-relaxed text-purple-700">
                Your store lives at <span className="font-mono font-semibold">{subdomain}.junooni.com</span>. Pro lets you connect <span className="font-mono">merch.yourname.com</span>.
              </p>
              <Link to="/store/membership"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                <Crown className="w-3 h-3" />View Pro plan
              </Link>
            </div>
          </div>
        )}

        {isProPlan && (
          <>
            {(step === "idle" || step === "entered") && (
              <div className="space-y-3">
                <div className="relative">
                  <Globe className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3.5 top-1/2" />
                  <input
                    value={domainInput}
                    onChange={e => handleDomainChange(e.target.value)}
                    placeholder="yourdomain.com or store.yourdomain.com"
                    className="w-full py-2.5 pl-10 pr-4 font-mono text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                <button onClick={handleSaveDomain} disabled={!domainInput || isSaving}
                  className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Save & get setup instructions
                </button>
              </div>
            )}

            {(step === "dns" || step === "failed") && (
              <div className="space-y-5">
                <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm font-bold text-gray-800">{store.custom_domain || domainInput}</span>
                  </div>
                  <button onClick={() => setConfirmRemove(true)} className="text-xs font-semibold text-red-400 transition-colors hover:text-red-600">Remove</button>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ background: "#7c3aed" }}>1</div>
                  Add these DNS records at your domain registrar
                </div>

                <div className="overflow-hidden border border-purple-200 rounded-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-purple-200 bg-purple-50">
                    <span className="text-xs font-bold tracking-wider text-purple-800 uppercase">DNS Records</span>
                    <button onClick={() => navigator.clipboard?.writeText(VPS_IP)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                      <Copy className="w-3 h-3" />Copy IP
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-2 font-bold text-left">Type</th>
                          <th className="pb-2 font-bold text-left">Host / Name</th>
                          <th className="pb-2 font-bold text-left">Points to</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          {
                            type: "A",
                            host: (store.custom_domain || domainInput).split(".").length > 2
                              ? (store.custom_domain || domainInput).split(".")[0] : "@",
                            target: VPS_IP
                          },
                          { type: "A", host: "www", target: VPS_IP }
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="py-2.5 pr-3"><span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono font-bold text-xs">{row.type}</span></td>
                            <td className="py-2.5 pr-3 font-mono font-semibold text-gray-700">{row.host}</td>
                            <td className="py-2.5 font-mono font-semibold text-gray-700">{row.target}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">Setup guides by registrar:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "GoDaddy",        url: "https://in.godaddy.com/help/add-an-a-record-19238" },
                      { name: "Namecheap",      url: "https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/" },
                      { name: "Cloudflare",     url: "https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" },
                      { name: "Google Domains", url: "https://support.google.com/domains/answer/3290350" },
                      { name: "BigRock",        url: "https://manage.bigrock.in/kb/answer/1853" },
                      { name: "Hostinger",      url: "https://www.hostinger.in/tutorials/how-to-point-domain-to-vps" },
                    ].map(r => (
                      <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 transition-all border border-gray-200 rounded-lg hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50">
                        {r.name} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-amber-800">DNS propagation takes <strong>5 min – 48 hours</strong> globally. Grab a coffee ☕</span>
                </div>

                {verifyError && (
                  <div className="flex items-start gap-2.5 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-red-700">{verifyError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ background: "#7c3aed" }}>2</div>
                  Once DNS is saved, verify here:
                </div>

                <button onClick={handleVerifyDomain} disabled={isVerifying}
                  className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                  {isVerifying
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Checking DNS…</>
                    : <><CheckCircle2 className="w-4 h-4" />Verify domain</>}
                </button>

                <p className="text-xs text-center text-gray-400">
                  Need help? <a href="mailto:support@junooni.com" className="font-medium text-purple-500 underline">support@junooni.com</a>
                </p>
              </div>
            )}

            {step === "verified" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 border border-emerald-200 rounded-xl bg-emerald-50">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-xl shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-800">Custom domain connected!</p>
                    <p className="text-xs text-emerald-700 font-mono mt-0.5">{store.custom_domain}</p>
                  </div>
                  <a href={`https://${store.custom_domain}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold transition-colors text-emerald-700 hover:text-emerald-900">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button onClick={() => setConfirmRemove(true)} className="w-full py-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                  Remove custom domain
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Password protection */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-gray-800">Password protection</p>
          <button
            onClick={() => onChange({ password_enabled: !store.password_enabled })}
            className="relative transition-colors rounded-full shrink-0 focus:outline-none"
            style={{ width: "44px", height: "24px", background: store.password_enabled ? BRAND.primary : "#e5e7eb" }}
            aria-label="Toggle password protection">
            <span
              className="absolute transition-transform duration-200 bg-white rounded-full shadow top-1"
              style={{ width: "16px", height: "16px", left: "4px", transform: store.password_enabled ? "translateX(20px)" : "translateX(0)" }} />
          </button>
        </div>
        <p className="mb-4 text-xs text-gray-400">Visitors must enter a password to view your store. Useful while setting up.</p>

        {store.password_enabled && (
          <div className="space-y-3">
            <PasswordInputWithToggle
              value={store.store_password ?? ""}
              onChange={val => onChange({ store_password: val || null })}
              placeholder="Set a store password"
            />
            <div className="flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-amber-800">Password-protected stores are still indexed by Google if set to Live. Use Draft mode to hide from search entirely.</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* SEO */}
      <div>
        <p className="mb-1 text-sm font-bold text-gray-800">SEO</p>
        <p className="mb-4 text-xs text-gray-400">Control how your store appears in Google search results.</p>
        <div className="space-y-4">
          <Field label="Page title" hint="60 characters max">
            <Input value={store.seo_title ?? ""} onChange={e => onChange({ seo_title: e.target.value || null })}
              placeholder={`${vendorHandle} — Official Merch Store`} maxLength={60} />
            <p className="mt-1 text-xs text-gray-400">{(store.seo_title ?? "").length}/60</p>
          </Field>
          <Field label="Meta description" hint="160 characters max">
            <Textarea value={store.seo_description ?? ""} onChange={e => onChange({ seo_description: e.target.value || null })}
              placeholder="Shop official merchandise..." maxLength={160} rows={3} />
            <p className="mt-1 text-xs text-gray-400">{(store.seo_description ?? "").length}/160</p>
          </Field>

          {/* Google preview */}
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Google preview</p>
            <p className="font-mono text-xs text-emerald-700 truncate mb-0.5">
              {store.custom_domain && store.domain_verified ? store.custom_domain : `${subdomain}.junooni.com`} ›
            </p>
            <p className="mb-1 text-sm font-semibold text-blue-700 truncate">{store.seo_title || `${vendorHandle} — Official Merch Store`}</p>
            <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">{store.seo_description || "Shop official merchandise. Powered by Junooni."}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button onClick={() => onSave()} disabled={isSaving}
          className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
        </button>
      </div>
    </div>
  )
}

// ─── Pages panel ──────────────────────────────────────────────────────────────

const PAGE_TEMPLATES_LIST = [
  { id: "blank"   as PageTemplate, label: "Blank",   icon: "📄", desc: "Start from scratch",         defaultContent: "" },
  { id: "about"   as PageTemplate, label: "About",   icon: "👋", desc: "About me / my story",        defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq"     as PageTemplate, label: "FAQ",     icon: "❓", desc: "Frequently asked questions", defaultContent: "## FAQ\n\n**Q: How long does shipping take?**\nA: 5-7 business days." },
  { id: "contact" as PageTemplate, label: "Contact", icon: "✉️", desc: "Contact / support page",     defaultContent: "## Contact Us\n\nReach out at your@email.com" },
]

function PagesPanel({ pages, vendorHandle, onSave, onDelete, onClose }: {
  pages: StorePage[]; vendorHandle: string
  onSave: (page: StorePage) => void; onDelete: (id: string) => void; onClose: () => void
}) {
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isNew, setIsNew] = useState(false)

  const startNew = (tmpl: typeof PAGE_TEMPLATES_LIST[0]) => {
    setEditingPage({
      id: `page_${Date.now()}`,
      title: tmpl.label === "blank" ? "New Page" : tmpl.label,
      slug: tmpl.label === "blank" ? "new-page" : tmpl.id,
      template: tmpl.id, content: tmpl.defaultContent,
      in_nav: false, in_footer: true, created_at: new Date().toISOString()
    })
    setIsNew(true)
  }

  if (editingPage) return (
    <PageEditorInline page={editingPage} isNew={isNew} vendorHandle={vendorHandle}
      onSave={p => { onSave(p); setEditingPage(null) }}
      onCancel={() => { setEditingPage(null); setIsNew(false) }}
      onDelete={isNew ? undefined : () => { onDelete(editingPage.id); setEditingPage(null) }} />
  )

  return (
    <div className="space-y-6">
      {pages.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">Your pages</p>
          <div className="space-y-2">
            {pages.map(page => (
              <div key={page.id}
                className="flex items-center gap-3 px-4 py-3 transition-all bg-white border border-gray-200 rounded-xl hover:border-gray-300">
                <span className="w-8 text-lg text-center shrink-0">{PAGE_TEMPLATES_LIST.find(t => t.id === page.template)?.icon ?? "📄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{page.title}</p>
                  <p className="font-mono text-xs text-gray-400 mt-0.5">/p/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {page.in_nav && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Nav</span>
                  )}
                  <button onClick={() => { setEditingPage(page); setIsNew(false) }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all">
                    Edit
                  </button>
                  <button onClick={() => onDelete(page.id)}
                    className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">Create a new page</p>
        <div className="grid grid-cols-2 gap-2">
          {PAGE_TEMPLATES_LIST.map(t => (
            <button key={t.id} onClick={() => startNew(t)}
              className="flex items-start gap-3 p-4 text-left transition-all border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 group">
              <span className="text-xl mt-0.5">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page editor (inline in modal) ──────────────────────────────────────────

function PageEditorInline({ page, isNew, vendorHandle, onSave, onCancel, onDelete }: {
  page: StorePage; isNew: boolean; vendorHandle: string
  onSave: (p: StorePage) => void; onCancel: () => void; onDelete?: () => void
}) {
  const [draft, setDraft] = useState<StorePage>({ ...page })
  const up = (patch: Partial<StorePage>) => setDraft(p => ({ ...p, ...patch }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />Back to pages
        </button>
        {onDelete && (
          <button onClick={onDelete}
            className="flex items-center gap-1 text-xs font-semibold text-red-400 transition-colors hover:text-red-600">
            <Trash2 className="w-3 h-3" />Delete page
          </button>
        )}
      </div>

      <Field label="Page title">
        <Input value={draft.title}
          onChange={e => up({ title: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })}
          placeholder="e.g. About Me" />
      </Field>

      <Field label="URL slug">
        <div className="flex items-center overflow-hidden transition-colors border border-gray-200 rounded-xl focus-within:border-gray-400">
          <div className="px-3 py-2.5 text-xs font-mono text-gray-500 bg-gray-50 border-r border-gray-200 whitespace-nowrap shrink-0">/p/</div>
          <input value={draft.slug} onChange={e => up({ slug: slugify(e.target.value) })} placeholder="about-me"
            className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none bg-white" />
        </div>
      </Field>

      <Field label="Content (Markdown or HTML)">
        <Textarea value={draft.content} onChange={e => up({ content: e.target.value })}
          placeholder={"## My heading\n\nYour content here…\n\n(Prefix with < to write HTML)"}
          rows={10} className="font-mono text-sm resize-none" />
        <p className="mt-1.5 text-xs text-gray-400">Start with a <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">&lt;</code> tag to use raw HTML. Otherwise Markdown: <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">## h2</code>, <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">**bold**</code></p>
      </Field>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={draft.in_nav} onChange={e => up({ in_nav: e.target.checked })}
          className="w-4 h-4 rounded accent-orange-500" />
        <span className="text-sm font-medium text-gray-700">Show in navigation menu</span>
      </label>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={() => onSave(draft)}
          className="flex items-center justify-center flex-1 gap-2 py-2.5 text-sm font-bold text-white transition-all rounded-xl hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          <Save className="w-4 h-4" />{isNew ? "Create page" : "Save changes"}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}
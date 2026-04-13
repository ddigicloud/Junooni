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
import { ProductsPrimaryButtons } from "@/features/products/components/ProductsPrimaryButtons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Globe, Palette, Layout, Eye, Save, Trash2,
  CheckCircle2, AlertCircle, ExternalLink, Loader2,
  ChevronUp, ChevronDown, Sparkles, Monitor, ArrowRight, Lock,
  FileText, Plus, X, Instagram, Youtube, Twitter, Facebook, Upload,
  Rocket, Crown, BarChart2, Image as ImageIcon, Zap, Settings, Copy,
  ArrowUpRight, Package, Users, ShoppingBag, Check, ChevronRight,
  Star, TrendingUp, Radio, Megaphone, BookOpen, Link as LinkIcon,
  Video, Share2,
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
}

interface VendorStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  hasProducts?: boolean
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
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// ─── Onboarding steps ─────────────────────────────────────────────────────────

interface SetupStep {
  id: string
  title: string
  desc: string
  icon: React.ReactNode
  check: (store: VendorStore, stats: VendorStats) => boolean
  cta: string
  ctaLink?: string
  ctaAction?: "modal"
}

const SETUP_STEPS = (
  store: VendorStore,
  stats: VendorStats,
  hasStore: boolean,
): SetupStep[] => [
  {
    id: "template",
    title: "Pick your store look",
    desc: "Choose a template and your brand colors to give your store a personality.",
    icon: <Palette className="w-5 h-5" />,
    check: (_s, _st) => hasStore,
    cta: "Choose template",
    ctaAction: "modal",
  },
  {
    id: "branding",
    title: "Add your logo & tagline",
    desc: "Add your logo and write a short tagline so fans know it\'s really you.",
    icon: <ImageIcon className="w-5 h-5" />,
    check: (s, _st) => !!(s.store_logo || s.tagline),
    cta: "Add branding",
    ctaAction: "modal",
  },
  {
    id: "product",
    title: "Add your first product",
    desc: "Create at least one product — a t-shirt, hoodie, mug, or anything you love.",
    icon: <Package className="w-5 h-5" />,
    check: (_s, st) => st.totalProducts > 0 || st.hasProducts === true,
    cta: "Add product",
    ctaAction: "modal",
  },
  {
    id: "launch",
    title: "Go live",
    desc: "Your store is in Draft mode. Publish it so fans can find and buy from it.",
    icon: <Rocket className="w-5 h-5" />,
    check: (s, _st) => s.status === "live",
    cta: "Publish store",
    ctaAction: "modal",
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

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
  const [stats, setStats] = useState<VendorStats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, hasProducts: false })
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isNewPage, setIsNewPage] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
  const coerce = (v: any) => v === true || v === 1 || v === "true" || v === "1"

  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }

      // Shared vendor ID used by multiple fetch blocks below
      let vendorIdForStats: string | null = null

      // Fetch vendor + store in parallel
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
          vendorIdForStats = vd.vendor?.id ?? null
        }
        if (sRes.ok) {
          const sd = await sRes.json()
          if (sd.store) { setStore({ ...DEFAULT_STORE, ...sd.store }); setHasStore(true) }
        }
      } catch (e) { console.error("Failed to load vendor/store:", e) }

      // Fetch products separately so a failure here doesn't block the page
      try {
        // Try multiple endpoints — different Medusa versions use different routes
        const productEndpoints = [
          `${backendUrl}/vendors/product?limit=1`,
          `${backendUrl}/vendors/me/products?limit=1`,
          `${backendUrl}/vendors/products?limit=1`,
        ]
        let productCount = 0
        for (const endpoint of productEndpoints) {
          try {
            const pRes = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
            if (!pRes.ok) continue
            const pd = await pRes.json()
            const list = pd.products ?? pd.data ?? (Array.isArray(pd) ? pd : [])
            const count = typeof pd.count === "number" ? pd.count
              : typeof pd.total === "number" ? pd.total
              : list.length
            productCount = Math.max(count, list.length)
            break // got a successful response
          } catch {}
        }
        setStats(p => ({ ...p, totalProducts: productCount, hasProducts: productCount > 0 }))
      } catch (e) { console.error("Failed to load products:", e) }

      // Fetch orders count + revenue from payout endpoint (same as /payouts page — fast)
      try {
        // Reuse vendor ID captured above — no extra /vendors/me call needed
        const vid = vendorIdForStats
        if (vid) {
            // Payout endpoint — same one the /payouts page uses
            // Returns total_earned (paise), total_pending_payout, current_balance
            const payRes = await fetch(`${backendUrl}/vendors/${vid}/payout`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (payRes.ok) {
              const pd = await payRes.json()
              const payoutInfo = pd.payout
              if (payoutInfo) {
                // total_earned is in paise — divide by 100 for rupees
                const totalEarnedPaise = payoutInfo.total_earned ?? 0
                const revenueInRupees = Math.round(totalEarnedPaise / 100)
                setStats(p => ({ ...p, totalRevenue: revenueInRupees }))
              }
            }

            // Step 3: order count — use limit=1 so backend returns just the count
            const oRes = await fetch(`${backendUrl}/vendors/orders?limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (oRes.ok) {
              const od = await oRes.json()
              // count/total field is always returned even with limit=1
              const orderCount = typeof od.count === "number" ? od.count
                : typeof od.total === "number" ? od.total
                : (od.orders ?? od.data ?? []).length
              setStats(p => ({ ...p, totalOrders: orderCount }))
            }
        }
      } catch (e) { console.error("Failed to load orders/revenue:", e) }

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
        toast({ title: "🎉 You\'re live!", description: `Shop at ${store.subdomain || vendorHandle}.junooni.com` })
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
  const storeUrl = `${store.subdomain || vendorHandle}.junooni.com`
  const isLive = store.status === "live"
  const setupSteps = SETUP_STEPS(store, stats, hasStore)
  const completedSteps = setupSteps.filter(s => s.check(store, stats)).length
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
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
    </div>
  )

  // ── Gate: own store not enabled ───────────────────────────────────────────
  if (!sellOnOwnStore) return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md border-gray-200 shadow-sm">
        <div className="container px-4 py-3 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-semibold text-gray-800">My Store</span>
          </div>
          <ProfileDropdown />
        </div>
      </header>
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${BRAND.primary}15` }}>
              <ShoppingBag className="w-9 h-9" style={{ color: BRAND.primary }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Launch your own merch store</h1>
            <p className="text-gray-500 text-sm">Get a fully branded storefront at <span className="font-semibold">{vendorHandle || "yourname"}.junooni.com</span> — free, no upfront cost.</p>
          </div>
          <div className="space-y-2.5 mb-7 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {[
              { icon: "🌐", title: "Your own URL",         sub: `${vendorHandle || "yourname"}.junooni.com` },
              { icon: "🎨", title: "Fully branded",        sub: "Your colors, fonts, logo" },
              { icon: "📦", title: "Print-on-demand",      sub: "We handle printing & shipping" },
              { icon: "💰", title: "You keep the margin",  sub: "Set your own prices" },
              { icon: "📄", title: "Custom pages",         sub: "About, FAQ, Contact + more" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 py-1">
                <span className="text-xl w-7 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleEnableOwnStore} disabled={isEnabling} className="w-full py-5 text-base font-semibold gap-2"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
            {isEnabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" />Set up my store</>}
          </Button>
          <button onClick={() => navigate({ to: "/dashboard" })} className="mt-4 block mx-auto text-xs underline text-gray-400 hover:text-gray-600 transition-colors">
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
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md border-gray-200 shadow-sm">
        <div className="container px-4 py-3 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-semibold text-gray-800">My Store</span>
            <Badge className={isLive
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
            }>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isLive ? "bg-green-500" : "bg-gray-400"}`} />
              {isLive ? "Live" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {hasStore && (
              <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
                <Eye className="w-3.5 h-3.5" />Preview
              </a>
            )}
            <Link to="/store/editor"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white transition-colors"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
              <Layout className="w-3.5 h-3.5" />Store editor
            </Link>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto max-w-5xl">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl mb-8 p-6 sm:p-8"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}18 0%, ${BRAND.secondary}10 100%)`, border: `1px solid ${BRAND.primary}25` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {isLive ? `🎉 Your store is live!` : `👋 Hey ${vendorName || "Creator"}!`}
              </h1>
              <p className="text-sm text-gray-600">
                {isLive
                  ? `Fans can shop at `
                  : `Your store is in draft mode. Complete the setup below to go live.`}
                {isLive && <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
                  className="font-semibold underline" style={{ color: BRAND.primary }}>{storeUrl}</a>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasStore && (
                <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-white text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors shadow-sm">
                  <Eye className="w-3.5 h-3.5" />Preview
                </a>
              )}
              <Button onClick={handlePublish} disabled={isPublishing || stats.totalProducts === 0}
                className="gap-2 px-5 py-2 text-sm font-semibold"
                style={{
                  background: isLive ? "#dc2626" : `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                  color: "white", opacity: stats.totalProducts === 0 ? 0.6 : 1
                }}>
                {isPublishing
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : isLive ? <><Radio className="w-3.5 h-3.5" />Unpublish</> : <><Rocket className="w-3.5 h-3.5" />Go live</>}
              </Button>
            </div>
          </div>
          {stats.totalProducts === 0 && !isLive && (
            <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 mt-4 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />Add at least one product before going live.
            </p>
          )}
        </div>

        {/* ── Setup checklist (only if not done) ── */}
        {!setupDone && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Setup checklist</h2>
                <p className="text-xs text-gray-500 mt-0.5">{completedSteps} of {setupSteps.length} done — finish these to go live</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(completedSteps / setupSteps.length) * 100}%`, background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})` }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">{Math.round((completedSteps / setupSteps.length) * 100)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {setupSteps.map((step, i) => {
                const done = step.check(store, stats)
                return (
                  <div key={step.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${done ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {done ? <Check className="w-4 h-4" /> : step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${done ? "text-green-800 line-through opacity-60" : "text-gray-900"}`}>{step.title}</p>
                          <p className={`text-xs mt-0.5 ${done ? "text-green-700 opacity-60" : "text-gray-500"}`}>{step.desc}</p>
                        </div>
                        {!done && (
                          step.ctaLink
                            ? <Link to={step.ctaLink as any} className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg text-white" style={{ background: BRAND.primary }}>{step.cta}</Link>
                            : <button onClick={() => setActiveModal(step.id)} className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg text-white" style={{ background: BRAND.primary }}>{step.cta}</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Stats row (only when has products or orders) ── */}
        {(stats.totalProducts > 0 || stats.totalOrders > 0) && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Products", value: stats.totalProducts, icon: <Package className="w-4 h-4" />, link: "/products" },
              { label: "Orders",   value: stats.totalOrders,   icon: <ShoppingBag className="w-4 h-4" />, link: "/orders" },
              { label: "Revenue",  value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: <TrendingUp className="w-4 h-4" />, link: "/payouts" },
            ].map(s => (
              <Link key={s.label} to={s.link as any}
                className="flex flex-col items-center gap-1 p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-center group">
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors">{s.icon}</div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* ── Main action cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          {/* Store editor */}
          <Link to="/store/editor"
            className="group relative overflow-hidden flex flex-col p-5 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>
                <Layout className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Store editor</h3>
            <p className="text-sm text-gray-500 flex-1">Drag-and-drop builder for your homepage layout, hero banner, product grids, and more.</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: BRAND.primary }}>
              Open editor <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Branding */}
          <button onClick={() => setActiveModal("branding")}
            className="group relative overflow-hidden flex flex-col p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
                <Palette className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Branding & identity</h3>
            <p className="text-sm text-gray-500 flex-1">Logo, colors, tagline, announcement bar, and social links.</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
              Edit branding <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Custom pages */}
          <button onClick={() => setActiveModal("pages")}
            className="group relative overflow-hidden flex flex-col p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Custom pages</h3>
            <p className="text-sm text-gray-500 flex-1">Create About, FAQ, Contact pages — or anything custom with HTML.</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
              {pages.length > 0 ? `${pages.length} page${pages.length !== 1 ? "s" : ""} created` : "Create a page"} <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Domain & SEO */}
          <button onClick={() => setActiveModal("domain")}
            className="group relative overflow-hidden flex flex-col p-5 rounded-2xl bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
                <Globe className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Domain & SEO</h3>
            <p className="text-sm text-gray-500 flex-1">Connect a custom domain, set your meta title, and write your SEO description.</p>
            <div className="mt-4 flex items-center gap-2">
              {store.custom_domain
                ? <Badge className="text-xs bg-green-100 text-green-800 border-green-200">{store.custom_domain}</Badge>
                : <span className="text-xs font-semibold text-green-600 flex items-center gap-1">Configure <ChevronRight className="w-3.5 h-3.5" /></span>}
            </div>
          </button>
        </div>

        {/* ── Upgrade nudge (only show on free plan) ── */}
        <div className="mb-8 p-5 rounded-2xl border border-amber-200 bg-amber-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Unlock your full store potential</p>
              <p className="text-xs text-amber-700 mt-0.5">Remove Junooni branding, go live, add a custom domain and get priority payouts.</p>
            </div>
          </div>
          <Link to="/store/membership" className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
            <Crown className="w-3.5 h-3.5" />View plans
          </Link>
        </div>

        {/* ── Quick links row ── */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: <Package className="w-4 h-4" />, label: "Products",   link: "/_authenticated/products",  color: "text-orange-600 bg-orange-50" },
            { icon: <ShoppingBag className="w-4 h-4" />, label: "Orders", link: "/_authenticated/orders",    color: "text-blue-600 bg-blue-50" },
            { icon: <BarChart2 className="w-4 h-4" />, label: "Analytics", link: "/_authenticated/analytics", color: "text-green-600 bg-green-50" },
            { icon: <Crown className="w-4 h-4" />, label: "Membership",   link: "/_authenticated/store/membership", color: "text-purple-600 bg-purple-50" },
          ].map(item => (
            <Link key={item.label} to={item.link as any}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
              <span className={`p-1 rounded-lg ${item.color}`}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div> */}
      </div>

      {/* ── Modals ── */}
      {activeModal && (
        <Modal title={
          activeModal === "branding" ? "Branding & identity"
          : activeModal === "domain"   ? "Domain & SEO"
          : activeModal === "pages"    ? "Custom pages"
          : activeModal === "template" ? "Store look"
          : activeModal === "launch"   ? "Go live"
          : activeModal === "product" ? "Add your first product"
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
              token={token ?? ""} backendUrl={backendUrl} />
          )}
          {activeModal === "domain" && (
            <DomainSeoPanel store={store} onChange={patch => setStore(p => ({ ...p, ...patch }))}
              onSave={() => saveStore()} isSaving={isSaving}
              vendorHandle={vendorHandle} token={token ?? ""} backendUrl={backendUrl} />
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
          {activeModal === "product" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <p className="text-sm text-gray-500 text-center">Choose how you'd like to add your first product:</p>
              <ProductsPrimaryButtons />
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Template + Launch panel ───────────────────────────────────────────────────

const TEMPLATES = [
  { id: "minimal" as StoreTemplate, name: "Minimal", desc: "Clean, white, product-focused. Great for fashion.", preview: "bg-white" },
  { id: "bold" as StoreTemplate,    name: "Bold",    desc: "Dark background, big typography. For music artists.", preview: "bg-gray-900" },
  { id: "editorial" as StoreTemplate, name: "Editorial", desc: "Magazine-style layout. For storytelling brands.", preview: "bg-stone-50" },
]
const FONTS = [
  { id: "inter" as StoreFont, name: "Inter", sample: "Clean & Modern" },
  { id: "poppins" as StoreFont, name: "Poppins", sample: "Friendly & Round" },
  { id: "playfair" as StoreFont, name: "Playfair", sample: "Elegant & Serif" },
]

function TemplatePanel({ store, onChange, onSave, isSaving, vendorHandle, isLive, onPublish, isPublishing }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: () => void; isSaving: boolean
  vendorHandle: string; isLive: boolean; onPublish: () => void; isPublishing: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Choose template</p>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onChange({ template: t.id })}
              className={`text-left p-3 rounded-xl border-2 transition-all ${store.template === t.id ? "shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
              style={store.template === t.id ? { borderColor: BRAND.primary } : {}}>
              <div className={`w-full h-16 rounded-lg mb-2 ${t.preview} border border-gray-200 flex items-center justify-center`}>
                <div className="space-y-1 w-10/12">
                  <div className={`h-1.5 rounded w-2/3 mx-auto ${t.id === "bold" ? "bg-white/30" : "bg-gray-300"}`} />
                  <div className="grid grid-cols-3 gap-0.5">{[1,2,3].map(i => <div key={i} className={`h-3 rounded ${t.id === "bold" ? "bg-white/10" : "bg-gray-100"}`} />)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-800">{t.name}</p>
                {store.template === t.id && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: BRAND.primary }} />}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Font</p>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map(f => (
            <button key={f.id} onClick={() => onChange({ font: f.id })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${store.font === f.id ? "" : "border-gray-200 hover:border-gray-300"}`}
              style={store.font === f.id ? { borderColor: BRAND.primary } : {}}>
              <p className="text-sm font-semibold text-gray-900">{f.name}</p>
              <p className="text-[10px] text-gray-400">{f.sample}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button onClick={onSave} disabled={isSaving} className="flex-1 gap-2" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
        </Button>
        <Button onClick={onPublish} disabled={isPublishing} variant="outline" className="gap-2">
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : isLive ? <><Radio className="w-4 h-4" />Unpublish</> : <><Rocket className="w-4 h-4" />Go live</>}
        </Button>
      </div>
    </div>
  )
}

// ─── Branding panel ────────────────────────────────────────────────────────────

function BrandingPanel({ store, onChange, onSave, isSaving, token, backendUrl }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: () => void; isSaving: boolean; token: string; backendUrl: string
}) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFav, setIsUploadingFav] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const favRef = useRef<HTMLInputElement>(null)

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
    <div className="space-y-5">
      {/* Colors */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Brand colors</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "primary_color",   label: "Primary", hint: "Buttons & links" },
            { key: "secondary_color", label: "Secondary", hint: "Gradients" },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1.5">{label} <span className="text-gray-400">— {hint}</span></label>
              <div className="flex items-center gap-2">
                <input type="color" value={(store as any)[key] ?? "#000000"}
                  onChange={e => onChange({ [key]: e.target.value })}
                  className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0" />
                <Input value={(store as any)[key] ?? ""} onChange={e => onChange({ [key]: e.target.value })} className="font-mono text-sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-8 rounded-xl flex items-center justify-center text-white text-xs font-semibold"
          style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}>
          Color preview
        </div>
      </div>

      {/* Logo */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Logo</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors shrink-0"
            onClick={() => logoRef.current?.click()}>
            {store.store_logo ? <img src={store.store_logo} alt="logo" className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
          </div>
          <div className="flex-1 space-y-1.5">
            <button onClick={() => logoRef.current?.click()} disabled={isUploadingLogo}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-gray-400 transition-colors">
              {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {store.store_logo ? "Change logo" : "Upload logo"}
            </button>
            {store.store_logo && (
              <button onClick={() => onChange({ store_logo: null })}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />Remove
              </button>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], setIsUploadingLogo, "store_logo")} />
        </div>
      </div>

      {/* Tagline */}
      <Field label="Tagline">
        <Input value={store.tagline ?? ""} onChange={e => onChange({ tagline: e.target.value || null })}
          placeholder="e.g. Official merch for my fans" maxLength={120} />
        <p className="text-xs text-gray-400 mt-1">Shown below your name in the store header</p>
      </Field>

      {/* Announcement */}
      <Field label="Announcement bar">
        <Input value={store.announcement_text ?? ""} onChange={e => onChange({ announcement_text: e.target.value || null })}
          placeholder="Free shipping on orders above ₹999 🎉" maxLength={200} />
        <p className="text-xs text-gray-400 mt-1">Appears as a banner across the top of your store</p>
      </Field>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button onClick={onSave} disabled={isSaving} className="flex-1 gap-2" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
        </Button>
      </div>
    </div>
  )
}

// ─── Domain + SEO panel ────────────────────────────────────────────────────────

function DomainSeoPanel({ store, onChange, onSave, isSaving, vendorHandle, token, backendUrl }: {
  store: VendorStore; onChange: (p: Partial<VendorStore>) => void
  onSave: () => void; isSaving: boolean; vendorHandle: string
  token: string; backendUrl: string
}) {
  const [domainInput, setDomainInput] = useState(store.custom_domain ?? "")
  const [step, setStep] = useState<"idle" | "entered" | "dns" | "verifying" | "verified" | "failed">(
    store.domain_verified ? "verified" : store.custom_domain ? "dns" : "idle"
  )
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState("")

  const subdomain = store.subdomain || vendorHandle

  // Remove protocol and trailing slash if user pastes full URL
  const cleanDomain = (raw: string) => raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .trim()

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
    // Save to backend immediately
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
        body: JSON.stringify({ domain: domainInput }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.verified) {
          onChange({ domain_verified: true })
          await onSave()
          setStep("verified")
        } else {
          setVerifyError(data.message ?? "DNS record not found yet. Make sure the CNAME is saved with your domain registrar.")
          setStep("failed")
        }
      } else {
        // Backend verify endpoint may not exist yet — check DNS manually as fallback
        setVerifyError("Verification check unavailable. Contact support@junooni.com to manually activate your domain.")
        setStep("failed")
      }
    } catch {
      setVerifyError("Could not reach the server. Check your connection and try again.")
      setStep("failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm("Remove custom domain? Your store will revert to the junooni.com subdomain.")) return
    setDomainInput("")
    setStep("idle")
    setVerifyError("")
    onChange({ custom_domain: null, domain_verified: false })
    await onSave()
  }

  return (
    <div className="space-y-6">

      {/* ── Subdomain ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1.5">Your free subdomain</p>
        <p className="text-xs text-gray-400 mb-2">Always available — no setup needed.</p>
        <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
          <input
            value={store.subdomain ?? vendorHandle}
            onChange={e => onChange({ subdomain: e.target.value })}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none font-mono"
            placeholder={vendorHandle}
          />
          <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-100 border-l border-gray-200 whitespace-nowrap">.junooni.com</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Store is live at: <span className="font-semibold text-gray-600">{subdomain}.junooni.com</span>
        </p>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Custom domain ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-700">Custom domain</p>
          <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
            <Crown className="w-3 h-3" />Pro plan
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">Connect your own domain like <span className="font-mono text-gray-600">merch.yourname.com</span></p>

        {/* Step 0 — idle / input */}
        {(step === "idle" || step === "entered") && (
          <div className="space-y-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={domainInput}
                onChange={e => handleDomainChange(e.target.value)}
                placeholder="merch.yourname.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 font-mono"
              />
            </div>
            {domainInput && (
              <div className="text-xs text-gray-500 px-1">
                Will connect: <span className="font-semibold text-gray-700 font-mono">{domainInput}</span>
              </div>
            )}
            <Button
              onClick={handleSaveDomain}
              disabled={!domainInput || isSaving}
              className="w-full gap-2 text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Save & get DNS instructions
            </Button>
          </div>
        )}

        {/* Step 1 — DNS instructions */}
        {(step === "dns" || step === "failed") && (
          <div className="space-y-4">
            {/* Current domain pill */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono font-semibold text-gray-800">{store.custom_domain || domainInput}</span>
              </div>
              <button onClick={handleRemoveDomain} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
              <span>Add this DNS record at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</span>
            </div>

            {/* DNS record card */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-100 border-b border-blue-200">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">DNS Record to add</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`${(store.custom_domain || domainInput).split(".")[0]}	${subdomain}.junooni.com`)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  <Copy className="w-3 h-3" />Copy
                </button>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-blue-600 uppercase tracking-wider">
                      <th className="text-left pb-2 font-semibold">Type</th>
                      <th className="text-left pb-2 font-semibold">Host / Name</th>
                      <th className="text-left pb-2 font-semibold">Value / Points to</th>
                      <th className="text-left pb-2 font-semibold">TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pr-4 py-1"><span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-mono font-bold text-xs">CNAME</span></td>
                      <td className="pr-4 py-1 font-mono text-blue-900 font-semibold text-xs">{(store.custom_domain || domainInput).split(".")[0]}</td>
                      <td className="pr-4 py-1 font-mono text-blue-900 text-xs">{subdomain}.junooni.com</td>
                      <td className="py-1 text-blue-700 text-xs">3600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Registrar guides */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Step-by-step guides for common registrars:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "GoDaddy",    url: "https://in.godaddy.com/help/add-a-cname-record-19236" },
                  { name: "Namecheap", url: "https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record/" },
                  { name: "Cloudflare",url: "https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" },
                  { name: "Google Domains", url: "https://support.google.com/domains/answer/3290350" },
                  { name: "BigRock",   url: "https://manage.bigrock.in/kb/answer/1853" },
                  { name: "Hostinger", url: "https://www.hostinger.in/tutorials/how-to-add-dns-records" },
                ].map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors text-center">
                    {r.name} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>DNS changes can take <strong>5 minutes to 48 hours</strong> to propagate. Come back and click verify once you've added the record.</span>
            </div>

            {verifyError && (
              <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-700">{verifyError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
              <span>Once the DNS record is added, click verify:</span>
            </div>

            <Button
              onClick={handleVerifyDomain}
              disabled={isVerifying}
              className="w-full gap-2 text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
              {isVerifying
                ? <><Loader2 className="w-4 h-4 animate-spin" />Checking DNS...</>
                : <><CheckCircle2 className="w-4 h-4" />Verify domain</>}
            </Button>

            <p className="text-center text-xs text-gray-400">
              Having trouble? Email <a href="mailto:support@junooni.com" className="underline" style={{ color: BRAND.primary }}>support@junooni.com</a> and we'll set it up for you.
            </p>
          </div>
        )}

        {/* Step 2 — Verified */}
        {step === "verified" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Domain connected!</p>
                <p className="text-xs text-green-700 font-mono mt-0.5">{store.custom_domain}</p>
              </div>
              <a href={`https://${store.custom_domain}`} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-xs text-green-700 hover:text-green-900 flex items-center gap-1 font-medium">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button onClick={handleRemoveDomain} className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1">
              Remove custom domain
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">SEO</p>
        <div className="space-y-3">
          <Field label="Page title">
            <Input value={store.seo_title ?? ""} onChange={e => onChange({ seo_title: e.target.value || null })}
              placeholder={`${vendorHandle} — Official Merch Store`} maxLength={60} />
            <p className="text-xs text-gray-400 mt-1">{(store.seo_title ?? "").length}/60</p>
          </Field>
          <Field label="Meta description">
            <Textarea value={store.seo_description ?? ""} onChange={e => onChange({ seo_description: e.target.value || null })}
              placeholder="Shop official merchandise..." maxLength={160} rows={3} />
            <p className="text-xs text-gray-400 mt-1">{(store.seo_description ?? "").length}/160</p>
          </Field>
          {/* Google preview */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Google preview</p>
            <p className="text-xs text-green-700 truncate font-mono">{store.custom_domain ?? `${subdomain}.junooni.com`} ›</p>
            <p className="text-sm text-blue-700 font-medium truncate">{store.seo_title || `${vendorHandle} — Official Merch Store`}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{store.seo_description || "Shop official merchandise. Powered by Junooni."}</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <Button onClick={onSave} disabled={isSaving} className="w-full gap-2"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
        </Button>
      </div>
    </div>
  )
}


// ─── Pages panel ──────────────────────────────────────────────────────────────

const PAGE_TEMPLATES_LIST = [
  { id: "blank" as PageTemplate,   label: "Blank",   icon: "📄", desc: "Start from scratch",         defaultContent: "" },
  { id: "about" as PageTemplate,   label: "About",   icon: "👋", desc: "About me / my story",        defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq" as PageTemplate,     label: "FAQ",     icon: "❓", desc: "Frequently asked questions", defaultContent: "## FAQ\n\n**Q: How long does shipping take?**\nA: 5-7 business days." },
  { id: "contact" as PageTemplate, label: "Contact", icon: "✉️", desc: "Contact / support page",     defaultContent: "## Contact Us\n\nReach out at your@email.com" },
]

function PagesPanel({ pages, vendorHandle, onSave, onDelete, onClose }: {
  pages: StorePage[]; vendorHandle: string
  onSave: (page: StorePage) => void; onDelete: (id: string) => void; onClose: () => void
}) {
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isNew, setIsNew] = useState(false)

  const startNew = (tmpl: typeof PAGE_TEMPLATES_LIST[0]) => {
    setEditingPage({ id: `page_${Date.now()}`, title: tmpl.label === "blank" ? "New Page" : tmpl.label, slug: tmpl.label === "blank" ? "new-page" : tmpl.id, template: tmpl.id, content: tmpl.defaultContent, in_nav: false, in_footer: true, created_at: new Date().toISOString() })
    setIsNew(true)
  }

  if (editingPage) return (
    <PageEditorInline page={editingPage} isNew={isNew} vendorHandle={vendorHandle}
      onSave={p => { onSave(p); setEditingPage(null) }}
      onCancel={() => { setEditingPage(null); setIsNew(false) }}
      onDelete={isNew ? undefined : () => { onDelete(editingPage.id); setEditingPage(null) }} />
  )

  return (
    <div className="space-y-4">
      {pages.length > 0 && (
        <div className="space-y-2">
          {pages.map(page => (
            <div key={page.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all">
              <span className="text-base">{PAGE_TEMPLATES_LIST.find(t => t.id === page.template)?.icon ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{page.title}</p>
                <p className="text-xs text-gray-400 font-mono">/p/{page.slug}</p>
              </div>
              <div className="flex gap-1">
                {page.in_nav && <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-100">Nav</Badge>}
              </div>
              <button onClick={() => { setEditingPage(page); setIsNew(false) }} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">Edit</button>
              <button onClick={() => onDelete(page.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Create a page</p>
        <div className="grid grid-cols-2 gap-2">
          {PAGE_TEMPLATES_LIST.map(t => (
            <button key={t.id} onClick={() => startNew(t)}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left">
              <span className="text-xl mt-0.5">{t.icon}</span>
              <div><p className="text-sm font-semibold text-gray-800">{t.label}</p><p className="text-xs text-gray-400">{t.desc}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page editor (inline in modal) ────────────────────────────────────────────

function PageEditorInline({ page, isNew, vendorHandle, onSave, onCancel, onDelete }: {
  page: StorePage; isNew: boolean; vendorHandle: string
  onSave: (p: StorePage) => void; onCancel: () => void; onDelete?: () => void
}) {
  const [draft, setDraft] = useState<StorePage>({ ...page })
  const up = (patch: Partial<StorePage>) => setDraft(p => ({ ...p, ...patch }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />Back
        </button>
        {onDelete && <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete page</button>}
      </div>
      <Field label="Page title">
        <Input value={draft.title} onChange={e => up({ title: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })} placeholder="e.g. About Me" />
      </Field>
      <Field label="URL slug">
        <div className="flex items-center">
          <div className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-xs text-gray-500 whitespace-nowrap">/p/</div>
          <Input value={draft.slug} onChange={e => up({ slug: slugify(e.target.value) })} placeholder="about-me" className="rounded-l-none font-mono" />
        </div>
      </Field>
      <Field label="Content (Markdown or HTML)">
        <Textarea value={draft.content} onChange={e => up({ content: e.target.value })}
          placeholder={"## My heading\n\nYour content...\n\n(or start with < for HTML)"} rows={10} className="font-mono text-sm" />
        <p className="text-xs text-gray-400 mt-1">Start with a <code>&lt;</code> tag to use HTML. Otherwise Markdown: ## h2, **bold**, - list</p>
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={draft.in_nav} onChange={e => up({ in_nav: e.target.checked })} className="w-4 h-4 accent-orange-500 rounded" />
        <span className="text-sm text-gray-700">Show in navigation menu</span>
      </label>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button onClick={() => onSave(draft)} className="flex-1 gap-2" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`, color: "white" }}>
          <Save className="w-4 h-4" />{isNew ? "Create page" : "Save changes"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ─── Shared ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>{children}</div>
}
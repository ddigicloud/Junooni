"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useMemo } from "react"
import { Search, Menu, X, ChevronDown, ArrowRight, ShoppingBag } from "lucide-react"
import CartIconButton from "@/components/cart/CartIconButton"
import { formatPrice } from "@/lib/api"
import type { PublicVendor, VendorStore, CategoryMeta, CollectionMeta, Product } from "@/lib/types"

interface Props {
  vendor: PublicVendor
  store: VendorStore | null
  categories?: CategoryMeta[]
  collections?: CollectionMeta[]
  products?: Product[]
  skipAnnouncement?: boolean
}

export default function StoreHeader({
  vendor, store,
  categories = [], collections = [], products = [], skipAnnouncement = false
}: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hoverItem, setHoverItem] = useState<string | undefined>(undefined)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const brandPrimary = store?.primary_color ?? "#e65100"
  const isDark = store?.template === "bold"
  const handle = vendor.handle
  const stickyHeader = (store as any)?.sticky_header !== false
  const stickyAnn    = (store as any)?.sticky_announcement !== false
  const wrapSticky   = stickyHeader || stickyAnn

  // All home sections
  const homeSections: any[] = (store as any)?.sections?.sections ?? []

  // Header section — creator-editable nav
  const headerSection = homeSections.find((s: any) => s.type === "header")
  const customNavItems: any[] = headerSection?.nav_items ?? []
  const logoPosition: "left" | "center" = headerSection?.logo_position ?? "left"
  const showSocialIcons: boolean = headerSection?.show_social_icons ?? false
  const logoSizeDesktop: number = headerSection?.logo_size_desktop ?? 36
  const logoSizeMobile: number  = headerSection?.logo_size_mobile  ?? 28

  // Section color overrides
  const headerBg   = headerSection?.background_color ?? null
  const headerText = headerSection?.text_color ?? null

  // Custom pages marked in_nav
  const inNavPages: any[] = ((store as any)?.pages?.pages ?? []).filter((p: any) => p.in_nav)

  const isActive = (href: string) => {
    if (href === `/${handle}` || href === `/${handle}/`) return pathname === `/${handle}`
    if (href === `/${handle}/products`) return pathname === `/${handle}/products`
    if (href === `/${handle}/collections`) return pathname === `/${handle}/collections`
    if (href === `/${handle}/categories`) return pathname === `/${handle}/categories`
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setSearchOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery("")
    }
  }, [searchOpen])

  useEffect(() => {
    const handler = () => {
      setActiveDropdown(null)
      setSearchOpen(false)
      setSearchQuery("")
    }
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setActiveDropdown(null)

    if (window.parent !== window) {
      const parts = pathname.split("/")
      const subPath = "/" + parts.slice(2).join("/")
      const normalizedPath = subPath === "/" || subPath === "//" ? "/" : subPath
      window.parent.postMessage({
        type: "IFRAME_NAVIGATION",
        path: normalizedPath,
      }, "*")
    }
  }, [pathname])

  const openDropdown = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setSearchOpen(false)
    setActiveDropdown(key)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 180)
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const toggleSearch = () => {
    setActiveDropdown(null)
    setSearchOpen(prev => !prev)
  }

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return products
      .filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.categories?.some(c => c.name.toLowerCase().includes(q)) ||
        p.collection?.title.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [searchQuery, products])

  const getPreviewProducts = (key: string, itemHandle?: string): Product[] => {
    if (!products.length) return []

    if (key === "shop") {
      if (!itemHandle) return products.slice(0, 8)
      const col = collections.find(c => c.handle === itemHandle)
      const ids: string[] = (col as any)?.product_ids ?? []
      if (ids.length) {
        const filtered = products.filter(p => ids.map(String).includes(String(p.id)))
        return filtered.length ? filtered.slice(0, 8) : products.slice(0, 8)
      }
      return products.slice(0, 8)
    }

    if (key === "collections" && itemHandle) {
      const col = collections.find(c => c.handle === itemHandle)
      const ids: string[] = (col as any)?.product_ids ?? []
      if (ids.length) {
        return products.filter(p => ids.map(String).includes(String(p.id))).slice(0, 8)
      }
      return []
    }

    if (key === "categories" && itemHandle) {
      const m = products.filter(p => p.categories?.some(c => c.handle === itemHandle))
      return m.length ? m.slice(0, 8) : []
    }

    return products.slice(0, 8)
  }

  const previewProducts = getPreviewProducts(activeDropdown ?? "shop", hoverItem)

  // Nav items
  const autoNavItems = [
    { id: "home",        label: "Home",        href: `/${handle}`,             type: "link" },
    { id: "shop",        label: "Shop",        href: `/${handle}/products`,    type: "dropdown" },
    ...(collections.length > 0 ? [{ id: "collections", label: "Collections", href: `/${handle}/collections`, type: "dropdown" }] : []),
    ...(categories.length  > 0 ? [{ id: "categories",  label: "Categories",  href: `/${handle}/categories`,  type: "dropdown" }] : []),
    ...inNavPages.map(p => ({ id: p.id, label: p.title, href: `/${handle}/pages/${p.slug}`, type: "link", external: p.external })),
  ]
  const navItems = customNavItems.length > 0 ? customNavItems : autoNavItems

  const bg         = isDark ? "bg-black/95 border-white/10" : "bg-white/95 border-gray-100"
  const textBase   = isDark ? "text-white" : "text-gray-900"
  const textMuted  = isDark ? "text-white/60" : "text-gray-500"
  const hoverBg    = isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
  const dropdownBg = isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-100"
  const divider    = isDark ? "border-white/10" : "border-gray-100"
  const inputBg    = isDark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"

  return (
    <div ref={headerRef} className={wrapSticky ? "sticky top-0 z-40" : "relative"}>

      {/* ── TICKERS ABOVE HEADER ─────────────────────────────────────────────── */}
      {/* ── TICKERS/ANNOUNCEMENTS ABOVE HEADER — rendered in array order ── */}
      {(() => {
        const headerIdx = homeSections.findIndex((s: any) => s.type === "header")
        return homeSections
          .filter((s: any, i: number) => {
            if (s.hidden) return false
            if (s.type !== "announcement" && s.type !== "ticker") return false
            if (headerIdx === -1) return false
            return i < headerIdx
          })
          .map((s: any) => {
            if (s.type === "ticker") return <TickerBar key={s.id} section={s} />
            if (s.type === "announcement" && !skipAnnouncement) {
              return (
                <div key={s.id} style={{ background: s.background_color ?? "#e65100", color: s.text_color ?? "#ffffff" }}>
                  {s.cta_url && !s.title?.includes('<a ') ? (
                    <a href={s.cta_url} className="block w-full px-4 py-2 text-xs font-medium text-center"
                      style={{ color: s.text_color ?? "#ffffff" }}
                      dangerouslySetInnerHTML={{ __html: s.title ?? "" }} />
                  ) : (
                    <p className="w-full px-4 py-2 text-xs font-medium text-center"
                      dangerouslySetInnerHTML={{ __html: s.title ?? "" }} />
                  )}
                </div>
              )
            }
            return null
          })
      })()}

      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <header
        className={`w-full backdrop-blur-md border-b shadow-sm ${bg}`}
        style={{
          ...(headerBg   ? { backgroundColor: headerBg }  : {}),
          ...(headerText ? { borderColor: `${headerText}20` } : {}),
        }}
      >
        <div className="relative flex items-center justify-between h-16 gap-6 px-4 mx-auto max-w-7xl sm:px-6">

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-full transition-colors shrink-0 ${isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900"}`}
            style={headerText ? { color: headerText } : {}}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>

          <Link href={`/${handle}`} className={`flex items-center gap-2.5 shrink-0 
            absolute left-1/2 -translate-x-1/2
            ${logoPosition === "center"
              ? "md:absolute md:left-1/2 md:-translate-x-1/2"
              : "md:static md:translate-x-0"   // ← resets absolute positioning on desktop
            }
          `}>
            {(store as any)?.store_logo
              ? <Image
                  src={(store as any).store_logo}
                  alt={vendor.name}
                  width={240}
                  height={logoSizeDesktop * 2}
                  className="object-contain w-auto md:hidden"
                  style={{ height: logoSizeMobile }}
                />
              : vendor.logo
              ? <div className="overflow-hidden rounded-full ring-2 ring-gray-100 md:hidden"
                  style={{ width: logoSizeMobile, height: logoSizeMobile }}>
                  <Image src={vendor.logo} alt={vendor.name} width={logoSizeMobile} height={logoSizeMobile} className="object-cover" />
                </div>
              : <div className="flex items-center justify-center font-bold text-white rounded-full md:hidden"
                  style={{ width: logoSizeMobile, height: logoSizeMobile, background: brandPrimary, fontSize: logoSizeMobile * 0.4 }}>
                  {vendor.name[0]?.toUpperCase()}
                </div>
            }
            {(store as any)?.store_logo
              ? <Image
                  src={(store as any).store_logo}
                  alt={vendor.name}
                  width={240}
                  height={logoSizeDesktop * 2}
                  className="hidden object-contain w-auto md:block"
                  style={{ height: logoSizeDesktop }}
                />
              : vendor.logo
              ? <div className="hidden overflow-hidden rounded-full ring-2 ring-gray-100 md:block"
                  style={{ width: logoSizeDesktop, height: logoSizeDesktop }}>
                  <Image src={vendor.logo} alt={vendor.name} width={logoSizeDesktop} height={logoSizeDesktop} className="object-cover" />
                </div>
              : <div className="items-center justify-center hidden font-bold text-white rounded-full md:flex"
                  style={{ width: logoSizeDesktop, height: logoSizeDesktop, background: brandPrimary, fontSize: logoSizeDesktop * 0.4 }}>
                  {vendor.name[0]?.toUpperCase()}
                </div>
            }
            {!(store as any)?.store_logo && (
              <span
                className={`font-semibold ${textBase}`}
                style={{
                  fontSize: logoSizeDesktop * 0.38,
                  ...(headerText ? { color: headerText } : {})
                }}
              >{vendor.name}</span>
            )}
          </Link>

          <nav className={`items-center flex-1 hidden gap-1 md:flex ${logoPosition === "center" ? "justify-start" : "justify-center"}`}>
            {navItems.map((item: any) => {
              const href = item.href ?? (item.url ? (item.url.startsWith("/") ? `/${handle}${item.url}` : item.url) : `/${handle}`)
              const navTextStyle = headerText ? { color: headerText, opacity: isActive(href) ? 1 : 0.7 } : {}

              const isSystemProducts    = item.url === "/products"    || item.id === "shop"
              const isSystemCollections = item.url === "/collections" || item.id === "collections"
              const isSystemCategories  = item.url === "/categories"  || item.id === "categories"
              const isSystemDropdown    = isSystemProducts || isSystemCollections || isSystemCategories
              const isDropdown = item.type === "dropdown" || isSystemDropdown
              const dropKey = isSystemProducts ? "shop" : isSystemCollections ? "collections" : isSystemCategories ? "categories" : null

              if (isDropdown && dropKey) {
                return (
                  <div key={item.id} className="relative"
                    onMouseEnter={() => {
                      openDropdown(dropKey)
                      setHoverItem(dropKey === "collections" ? collections[0]?.handle : dropKey === "categories" ? categories[0]?.handle : undefined)
                    }}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(href) ? "" : textMuted}`}
                      style={headerText
                        ? (isActive(href) ? { color: brandPrimary } : { color: headerText, opacity: 0.7 })
                        : (isActive(href) ? { color: brandPrimary } : {})
                      }>
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === dropKey ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                )
              }

              if (item.children && item.children.length > 0) {
                return (
                  <div key={item.id} className="relative"
                    onMouseEnter={() => openDropdown(`custom_${item.id}`)}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(href) ? "" : textMuted}`}
                      style={headerText
                        ? (isActive(href) ? { color: brandPrimary } : { color: headerText, opacity: 0.7 })
                        : (isActive(href) ? { color: brandPrimary } : {})
                      }>
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === `custom_${item.id}` ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === `custom_${item.id}` && (
                      <div
                        className={`absolute top-full left-0 mt-1 w-48 rounded-xl border shadow-xl overflow-hidden z-50 ${dropdownBg}`}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                      >
                        {item.children.map((child: any) => {
                          const childHref = child.href
                            ?? (child.url
                              ? (child.url.startsWith("http") ? child.url : `/${handle}${child.url.startsWith("/") ? child.url : `/${child.url}`}`)
                              : `/${handle}`)
                          return (
                            <Link key={child.id} href={childHref}
                              target={child.external ? "_blank" : undefined}
                              rel={child.external ? "noopener noreferrer" : undefined}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex items-center px-4 py-2.5 text-sm transition-colors border-b last:border-0 ${divider} ${isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link key={item.id}
                  href={href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(href) ? "" : textMuted}`}
                  style={headerText
                    ? (isActive(href) ? { color: brandPrimary } : { color: headerText, opacity: 0.7 })
                    : (isActive(href) ? { color: brandPrimary } : {})
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSearch}
              className={`p-2 rounded-full transition-all ${
                searchOpen
                  ? "text-white"
                  : isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900"
              }`}
              style={searchOpen ? { background: brandPrimary } : headerText ? { color: headerText } : {}}
              aria-label="Search"
            >
              {searchOpen ? <X style={{ width: 18, height: 18 }} /> : <Search style={{ width: 18, height: 18 }} />}
            </button>
            <CartIconButton brandPrimary={brandPrimary} iconColor={headerText ?? undefined} />
          </div>
        </div>
      </header>

      {/* ── TICKERS BELOW HEADER ─────────────────────────────────────────────── */}
     {/* ── TICKERS/ANNOUNCEMENTS BELOW HEADER ── */}
      {(() => {
        const headerIdx = homeSections.findIndex((s: any) => s.type === "header")
        if (headerIdx === -1) return null
        return homeSections
          .filter((s: any, i: number) => {
            if (s.hidden) return false
            if (s.type !== "announcement" && s.type !== "ticker") return false
            return i > headerIdx
          })
          .map((s: any) => {
            if (s.type === "ticker") return <TickerBar key={s.id} section={s} />
            if (s.type === "announcement" && !skipAnnouncement) {
              return (
                <div key={s.id} style={{ background: s.background_color ?? "#e65100", color: s.text_color ?? "#ffffff" }}>
                  {s.cta_url && !s.title?.includes('<a ') ? (
                    <a href={s.cta_url} className="block w-full px-4 py-2 text-xs font-medium text-center"
                      style={{ color: s.text_color ?? "#ffffff" }}
                      dangerouslySetInnerHTML={{ __html: s.title ?? "" }} />
                  ) : (
                    <p className="w-full px-4 py-2 text-xs font-medium text-center"
                      dangerouslySetInnerHTML={{ __html: s.title ?? "" }} />
                  )}
                </div>
              )
            }
            return null
          })
      })()}

      {/* ── SEARCH DROPDOWN ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className={`fixed left-0 right-0 z-[60] border-b shadow-2xl ${dropdownBg}`}
          style={{ top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64 }}
        >
          <div className="max-w-6xl px-6 py-5 mx-auto">
            <div className="relative mb-5">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-gray-400"}`} style={{ width: 18, height: 18 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, collections, categories..."
                className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${inputBg}`}
                style={{ "--tw-ring-color": brandPrimary } as any}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false)
                    window.location.href = `/${handle}/search?q=${encodeURIComponent(searchQuery.trim())}`
                  }
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery("") }
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery.length >= 2 ? (
              searchResults.length > 0 ? (
                <div>
                  <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4 lg:grid-cols-8">
                    {searchResults.map(p => (
                      <Link key={p.id} href={`/${handle}/products/${p.handle}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                        className="group"
                      >
                        <div className={`aspect-square rounded-xl overflow-hidden relative mb-2 ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                          {p.thumbnail
                            ? <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="128px" />
                            : <div className="flex items-center justify-center w-full h-full"><ShoppingBag className="w-5 h-5 opacity-20" /></div>
                          }
                        </div>
                        <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{p.title}</p>
                        {p.variants?.[0]?.prices?.[0]?.amount !== undefined && (
                          <p className="text-xs font-bold" style={{ color: brandPrimary }}>
                            {formatPrice(p.variants[0].prices[0].amount)}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/${handle}/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                    className="flex items-center gap-1.5 text-sm font-semibold pt-3 border-t"
                    style={{ color: brandPrimary, borderColor: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6" }}
                  >
                    View all results for "{searchQuery}" <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className={`py-8 text-center text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  No results for "<span className={isDark ? "text-white/70" : "text-gray-600"}>{searchQuery}</span>"
                </div>
              )
            ) : (
              <div>
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Popular</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  {products.slice(0, 8).map(p => (
                    <Link key={p.id} href={`/${handle}/products/${p.handle}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                      className="group"
                    >
                      <div className={`aspect-square rounded-xl overflow-hidden relative mb-2 ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                        {p.thumbnail
                          ? <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="128px" />
                          : <div className="flex items-center justify-center w-full h-full"><ShoppingBag className="w-5 h-5 opacity-20" /></div>
                        }
                      </div>
                      <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{p.title}</p>
                      {p.variants?.[0]?.prices?.[0]?.amount !== undefined && (
                        <p className="text-xs font-bold" style={{ color: brandPrimary }}>
                          {formatPrice(p.variants[0].prices[0].amount)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NAV MEGA DROPDOWN ─────────────────────────────────────────────────── */}
      {activeDropdown && !searchOpen && !activeDropdown.startsWith("custom_") && (
        <div
          className={`fixed left-0 right-0 z-[60] border-b shadow-2xl ${dropdownBg}`}
          style={{ top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64 }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="max-w-6xl px-6 py-6 mx-auto">
            <div className="flex gap-8">
              <div className="w-52 shrink-0">
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {activeDropdown === "shop" ? "Shop" : activeDropdown === "collections" ? "Collections" : "Categories"}
                </p>

                {activeDropdown === "shop" && (
                  <div className="space-y-0.5">
                    <DropdownLink href={`/${handle}/products`} label="All Products" sub={`${products.length} items`} brandPrimary={brandPrimary} isDark={isDark} active={!hoverItem} onHover={() => setHoverItem(undefined)} onClick={() => setActiveDropdown(null)} />
                    {collections.slice(0, 5).map(c => (
                      <DropdownLink key={c.id} href={`/${handle}/collections/${c.handle}`} label={c.title} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                    ))}
                    <div className={`pt-2 mt-2 border-t ${divider}`}>
                      <Link href={`/${handle}/products`} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                        View all products <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeDropdown === "collections" && (
                  <div className="space-y-0.5">
                    {collections.map(c => (
                      <DropdownLink key={c.id} href={`/${handle}/collections/${c.handle}`} label={c.title} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                    ))}
                    <div className={`pt-2 mt-2 border-t ${divider}`}>
                      <Link href={`/${handle}/collections`} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                        All collections <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeDropdown === "categories" && (
                  <div className="space-y-0.5">
                    {categories.map(c => (
                      <DropdownLink key={c.id} href={`/${handle}/categories/${c.handle}`} label={c.name} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                    ))}
                    <div className={`pt-2 mt-2 border-t ${divider}`}>
                      <Link href={`/${handle}/categories`} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                        All categories <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-100"} shrink-0`} />

              <div className="flex-1 min-w-0">
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {hoverItem
                    ? (collections.find(c => c.handle === hoverItem)?.title ?? categories.find(c => c.handle === hoverItem)?.name ?? "Products")
                    : "New Arrivals"
                  }
                </p>
                {previewProducts.length > 0 ? (
                  <div className="flex gap-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {previewProducts.map(p => (
                      <ProductPreviewCard key={p.id} product={p} handle={handle} brandPrimary={brandPrimary} isDark={isDark} onClick={() => setActiveDropdown(null)} />
                    ))}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-32 text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                    No products in this collection yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE NAV ────────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className={`md:hidden fixed inset-x-0 z-50 border-b shadow-lg ${isDark ? "bg-black border-white/10" : "bg-white border-gray-100"}`}
          style={{ top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64 }}>
          <div className="px-6 py-5 space-y-1">
            {navItems.map((item: any) => {
              const href = item.href
                ?? (item.url
                  ? (item.url.startsWith("http")
                    ? item.url
                    : `/${handle}${item.url.startsWith("/") ? item.url : `/${item.url}`}`)
                  : `/${handle}`)
              return (
                <div key={item.id}>
                  <Link
                    href={href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(href) ? "" : textMuted}`}
                    style={isActive(href) ? { color: brandPrimary } : {}}
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 mb-1">
                      {item.children.map((child: any) => {
                        const childHref = child.href
                          ?? (child.url
                            ? (child.url.startsWith("http") ? child.url : `/${handle}${child.url.startsWith("/") ? child.url : `/${child.url}`}`)
                            : `/${handle}`)
                        return (
                          <Link key={child.id} href={childHref}
                            target={child.external ? "_blank" : undefined}
                            rel={child.external ? "noopener noreferrer" : undefined}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(childHref) ? "" : textMuted}`}
                            style={isActive(childHref) ? { color: brandPrimary } : {}}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── TickerBar ─────────────────────────────────────────────────────────────────
// ── TickerBar ─────────────────────────────────────────────────────────────────
function TickerBar({ section }: { section: any }) {
  const rawItems: string[] = section.ticker_items ?? ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"]
  const sep = section.ticker_separator ?? "✦"
  const speed = section.ticker_speed ?? 40
  const bg = section.background_color ?? "#111827"
  const fg = section.text_color ?? "#ffffff"

  const duration = Math.max(2, 100 - speed)

  const items = rawItems
    .flatMap(raw => {
      return raw
        .split(/<\/p>|<br\s*\/?>/)
        .map(chunk => chunk.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim())
        .filter(chunk => chunk.length > 0)
    })
    .filter(item => item.length > 0)

  const unit = items.join(`  ${sep}  `) + `  ${sep}  `

  const REPEATS = 20
  const groupContent = Array(REPEATS).fill(unit).join("")

  const id = `ticker-${bg.replace("#", "")}`

  return (
    <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${id} {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .${id}-track {
          display: flex;
          white-space: nowrap;
          width: max-content;
          will-change: transform;
          animation: ${id} ${duration}s linear infinite;
        }
      `}</style>
      <div className={`${id}-track text-sm font-medium tracking-wide`} style={{ color: fg }}>
        <span>{groupContent}</span>
        <span>{groupContent}</span>
      </div>
    </div>
  )
}


// ── Dropdown link ─────────────────────────────────────────────────────────────
function DropdownLink({ href, label, sub, brandPrimary, isDark, active, onHover, onClick }: {
  href: string; label: string; sub?: string; brandPrimary: string; isDark: boolean
  active?: boolean; onHover?: () => void; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick} onMouseEnter={onHover}
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${active ? isDark ? "bg-white/10" : "bg-gray-50" : isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}
    >
      <span className={`text-sm font-medium transition-colors ${active ? "" : isDark ? "text-white/70 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}
        style={active ? { color: brandPrimary } : {}}>
        {label}
      </span>
      {sub && <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>{sub}</span>}
    </Link>
  )
}

// ── Product preview card ──────────────────────────────────────────────────────
function ProductPreviewCard({ product, handle, brandPrimary, isDark, onClick }: {
  product: Product; handle: string; brandPrimary: string; isDark: boolean; onClick: () => void
}) {
  const price = product.variants?.[0]?.prices?.[0]?.amount
  return (
    <Link href={`/${handle}/products/${product.handle}`} onClick={onClick} className="shrink-0 w-28 group">
      <div className={`w-28 h-28 rounded-xl overflow-hidden mb-2 relative ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
        {product.thumbnail
          ? <Image src={product.thumbnail} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="112px" />
          : <div className="flex items-center justify-center w-full h-full"><span className="text-2xl opacity-20">🛍</span></div>
        }
      </div>
      <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{product.title}</p>
      {price !== undefined && <p className="text-xs font-bold mt-0.5" style={{ color: brandPrimary }}>{formatPrice(price)}</p>}
    </Link>
  )
}
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useMemo } from "react"
import { Search, Menu, X, ChevronDown, ArrowRight, ShoppingBag } from "lucide-react"
import CartIconButton from "@/components/cart/CartIconButton"
import { formatPrice } from "@/lib/api"
import type { PublicVendor, VendorStore, CategoryMeta, CollectionMeta, Product } from "@/lib/types"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "junooni.com"

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
  const [mobileExpandedIds, setMobileExpandedIds] = useState<Set<string>>(new Set())
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hoverItem, setHoverItem] = useState<string | undefined>(undefined)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerBarRef = useRef<HTMLHeadingElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const toggleMobileId = (id: string) => setMobileExpandedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const brandPrimary = store?.primary_color ?? "#e65100"
  const isDark = store?.template === "bold"
  const handle = vendor?.handle ?? ""
  const stickyHeader = (store as any)?.sticky_header !== false

  // ── Bare mode detection ────────────────────────────────────────────────────
  // On the live subdomain (meenal.junooni.com) and custom domains, the
  // middleware keeps the browser URL clean — the handle is NOT in the path.
  // On the marketplace root (junooni.com / localhost) the handle IS in the path.
  // `bare` = true  → URLs are handle-free   (e.g. /products/mug)
  // `bare` = false → URLs include the handle (e.g. /meenal/products/mug)
  const [bare, setBare] = useState(false)
  useEffect(() => {
    const hostname = window.location.hostname.replace(/:.*$/, "").toLowerCase()
    const isMarketplace = hostname === ROOT_DOMAIN || hostname === "localhost"
    setBare(!isMarketplace)
  }, [])

  // Build an internal store path respecting bare mode.
  //   storePath("/")           → bare ? "/"            : "/{handle}"
  //   storePath("/products")   → bare ? "/products"    : "/{handle}/products"
  const storePath = (p: string) => {
    if (!p || p === "/") return bare ? "/" : `/${handle}`
    return bare ? p : `/${handle}${p}`
  }

  // Resolve a nav item's url (may be relative, absolute, or external http).
  const navHref = (url: string) =>
    url.startsWith("http")
      ? url
      : storePath(url.startsWith("/") ? url : `/${url}`)

  const homeSections: any[] = (store as any)?.sections?.sections ?? []

  const headerSection = homeSections.find((s: any) => s.type === "header")
  const customNavItems: any[] = headerSection?.nav_items ?? []
  const logoPosition: "left" | "center" = headerSection?.logo_position ?? "left"
  const logoSizeDesktop: number = headerSection?.logo_size_desktop ?? 36
  const logoSizeMobile: number  = headerSection?.logo_size_mobile  ?? 28

  const headerBg   = headerSection?.background_color ?? null
  const headerText = headerSection?.text_color ?? null

  const inNavPages: any[] = ((store as any)?.pages?.pages ?? []).filter((p: any) => p.in_nav)

  const isActive = (href: string) => {
    const home = storePath("/")
    if (href === home || href === `${home}/`) return pathname === home
    if (href === storePath("/products"))    return pathname === storePath("/products")
    if (href === storePath("/collections")) return pathname === storePath("/collections")
    if (href === storePath("/categories"))  return pathname === storePath("/categories")
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
      setMobileOpen(false) 
    }
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setActiveDropdown(null)
    if (window.parent !== window) {
      // Report the current store-relative path back to the editor.
      // Dev:  pathname is "/{handle}/categories" → strip the handle segment.
      // Prod: middleware keeps the browser URL clean ("/categories") → no
      //       handle present, so use the pathname as-is. The old code blindly
      //       did parts.slice(2), which on the subdomain sliced off the actual
      //       page and reported "/" — bouncing every page back to home.
      const isProd = process.env.NODE_ENV === "production"
      let subPath: string
      if (isProd) {
        subPath = pathname || "/"
      } else {
        subPath = pathname.replace(new RegExp(`^/${handle}(?=/|$)`), "") || "/"
      }
      const normalizedPath = subPath === "" || subPath === "//" ? "/" : subPath
      window.parent.postMessage({ type: "IFRAME_NAVIGATION", path: normalizedPath }, "*")
    }
  }, [pathname, handle])

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
     //console.log("[getPreviewProducts]", { key, itemHandle, productsLen: products.length, collectionsLen: collections.length })
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
      if (ids.length) return products.filter(p => ids.map(String).includes(String(p.id))).slice(0, 8)
      return []
    }
    if (key === "categories" && itemHandle) {
      const m = products.filter(p => p.categories?.some(c => c.handle === itemHandle))
      return m.length ? m.slice(0, 8) : []
    }
    return products.slice(0, 8)
  }

  const previewProducts = getPreviewProducts(activeDropdown ?? "shop", hoverItem)

  const autoNavItems = [
    { id: "home",        label: "Home",        href: storePath("/"),             type: "link" },
    { id: "shop",        label: "Shop",        href: storePath("/products"),     type: "dropdown" },
    ...(collections.length > 0 ? [{ id: "collections", label: "Collections", href: storePath("/collections"), type: "dropdown" }] : []),
    ...(categories.length  > 0 ? [{ id: "categories",  label: "Categories",  href: storePath("/categories"),  type: "dropdown" }] : []),
    ...inNavPages.map(p => ({ id: p.id, label: p.title, href: storePath(`/pages/${p.slug}`), type: "link", external: p.external })),
  ]
  const navItems = customNavItems.length > 0 ? customNavItems : autoNavItems

  const bg         = isDark ? "bg-black/95 border-white/10" : "bg-white/95 border-gray-100"
  const textBase   = isDark ? "text-white" : "text-gray-900"
  const textMuted  = isDark ? "text-white/60" : "text-gray-500"
  const dropdownBg = isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-100"
  const divider    = isDark ? "border-white/10" : "border-gray-100"
  const inputBg    = isDark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"

  //const dropdownTop      = headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64
  const dropdownTop      = headerBarRef.current ? headerBarRef.current.getBoundingClientRect().bottom : 64
  const dropdownBgColor  = isDark ? "#030712" : "#ffffff"
  const dropdownBorderColor = isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6"

  // AFTER — separate wrappers for announcement vs header
return (
  <div ref={headerRef} className={stickyHeader ? "sticky top-0 z-40" : "relative"}>

    {/* ── TICKERS/ANNOUNCEMENTS ABOVE HEADER ── */}
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

    {/* ── HEADER BAR — own sticky wrapper ── */}
    <header
      ref={headerBarRef}
        className={`w-full backdrop-blur-md border-b shadow-sm overflow-hidden ${bg}`}
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

          <Link href={storePath("/")} className={`flex items-center gap-2.5 shrink-0
            absolute left-1/2 -translate-x-1/2
            ${logoPosition === "center"
              ? "md:absolute md:left-1/2 md:-translate-x-1/2"
              : "md:static md:translate-x-0"
            }
          `}>
            {(store as any)?.store_logo
              ? <Image src={(store as any).store_logo} alt={vendor.name} width={240} height={logoSizeDesktop * 2} className="object-contain w-auto md:hidden" style={{ height: Math.min(logoSizeMobile, 48), maxHeight: "48px" }} />
              : vendor?.logo
              ? <div className="overflow-hidden rounded-full ring-2 ring-gray-100 md:hidden" style={{ width: Math.min(logoSizeMobile, 48), height: Math.min(logoSizeMobile, 48) }}>
                  <Image src={vendor.logo} alt={vendor.name} width={logoSizeMobile} height={logoSizeMobile} className="object-cover" />
                </div>
              : <div className="flex items-center justify-center font-bold text-white rounded-full md:hidden"
                  style={{ width: logoSizeMobile, height: logoSizeMobile, background: brandPrimary, fontSize: logoSizeMobile * 0.4 }}>
                  {vendor?.name?.[0]?.toUpperCase()}
                </div>
            }
            {(store as any)?.store_logo
              ? <Image src={(store as any).store_logo} alt={vendor.name} width={240} height={logoSizeDesktop * 2} className="hidden object-contain w-auto md:block" style={{ height: Math.min(logoSizeDesktop, 52), maxHeight: "52px" }} />
              : vendor?.logo
              ? <div className="hidden overflow-hidden rounded-full ring-2 ring-gray-100 md:block" style={{ width: Math.min(logoSizeDesktop, 52), height: Math.min(logoSizeDesktop, 52) }}>
                  <Image src={vendor.logo} alt={vendor.name} width={logoSizeDesktop} height={logoSizeDesktop} className="object-cover" />
                </div>
              : <div className="items-center justify-center hidden font-bold text-white rounded-full md:flex"
                  style={{ width: logoSizeDesktop, height: logoSizeDesktop, background: brandPrimary, fontSize: logoSizeDesktop * 0.4 }}>
                  {vendor?.name?.[0]?.toUpperCase()}
                </div>
            }
            {!(store as any)?.store_logo && (
              <span className={`font-semibold ${textBase}`}
                style={{ fontSize: logoSizeDesktop * 0.38, ...(headerText ? { color: headerText } : {}) }}>
                {vendor?.name}
              </span>
            )}
          </Link>

          <nav className={`items-center flex-1 hidden gap-1 md:flex ${logoPosition === "center" ? "justify-start" : "justify-center"}`}>
            {navItems.map((item: any) => {
              const href = item.href ?? (item.url ? navHref(item.url) : storePath("/"))

              const isSystemProducts    = item.url === "/products"    || item.id === "shop"
              const isSystemCollections = item.url === "/collections" || item.id === "collections"
              const isSystemCategories  = item.url === "/categories"  || item.id === "categories"
              const isSystemDropdown    = isSystemProducts || isSystemCollections || isSystemCategories
              const autoPopulate        = item.autoPopulate !== false
              const isDropdown = item.type === "dropdown" || (isSystemDropdown && autoPopulate)
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
                  </div>
                )
              }

              return (
                <Link key={item.id} href={href}
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
                searchOpen ? "text-white" : isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900"
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

      {/* ── SEARCH DROPDOWN ── */}
      {searchOpen && (
        <div className="fixed left-0 right-0 z-[60] border-b shadow-2xl"
          style={{ top: dropdownTop, backgroundColor: dropdownBgColor, borderColor: dropdownBorderColor }}>
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
                    window.location.href = storePath(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                  }
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery("") }
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
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
                      <Link key={p.id} href={storePath(`/products/${p.handle}`)}
                        onClick={() => { setSearchOpen(false); setSearchQuery("") }} className="group">
                        <div className={`aspect-square rounded-xl overflow-hidden relative mb-2 ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                          {p.thumbnail
                            ? <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="128px" />
                            : <div className="flex items-center justify-center w-full h-full"><ShoppingBag className="w-5 h-5 opacity-20" /></div>}
                        </div>
                        <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{p.title}</p>
                        {p.variants?.[0]?.prices?.[0]?.amount !== undefined && (
                          <p className="text-xs font-bold" style={{ color: brandPrimary }}>{formatPrice(p.variants[0].prices[0].amount)}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link href={storePath(`/search?q=${encodeURIComponent(searchQuery)}`)}
                    onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                    className="flex items-center gap-1.5 text-sm font-semibold pt-3 border-t"
                    style={{ color: brandPrimary, borderColor: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6" }}>
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
                    <Link key={p.id} href={storePath(`/products/${p.handle}`)}
                      onClick={() => { setSearchOpen(false); setSearchQuery("") }} className="group">
                      <div className={`aspect-square rounded-xl overflow-hidden relative mb-2 ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                        {p.thumbnail
                          ? <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="128px" />
                          : <div className="flex items-center justify-center w-full h-full"><ShoppingBag className="w-5 h-5 opacity-20" /></div>}
                      </div>
                      <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{p.title}</p>
                      {p.variants?.[0]?.prices?.[0]?.amount !== undefined && (
                        <p className="text-xs font-bold" style={{ color: brandPrimary }}>{formatPrice(p.variants[0].prices[0].amount)}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NAV MEGA DROPDOWN (system routes) ── */}
      {activeDropdown && !searchOpen && !activeDropdown.startsWith("custom_") && (() => {
        const activeNavItem = navItems.find((it: any) => {
          const isP   = it.url === "/products"    || it.id === "shop"
          const isC   = it.url === "/collections" || it.id === "collections"
          const isCat = it.url === "/categories"  || it.id === "categories"
          return (
            (activeDropdown === "shop"        && isP)   ||
            (activeDropdown === "collections" && isC)   ||
            (activeDropdown === "categories"  && isCat)
          )
        })
        const showProductsPanel = activeNavItem?.showProducts !== false
        const manualChildren: any[] = (activeNavItem?.autoPopulate === false && (activeNavItem?.children?.length ?? 0) > 0)
          ? activeNavItem.children : []

        return (
          <div className="fixed left-0 right-0 z-[60] border-b shadow-2xl"
            style={{ top: dropdownTop, backgroundColor: dropdownBgColor, borderColor: dropdownBorderColor }}
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
                      <DropdownLink href={storePath("/products")} label="All Products" sub={`${products.length} items`} brandPrimary={brandPrimary} isDark={isDark} active={!hoverItem} onHover={() => setHoverItem(undefined)} onClick={() => setActiveDropdown(null)} />
                      {collections.slice(0, 5).map(c => (
                        <DropdownLink key={c.id} href={storePath(`/collections/${c.handle}`)} label={c.title} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                      ))}
                      <div className={`pt-2 mt-2 border-t ${divider}`}>
                        <Link href={storePath("/products")} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                          View all products <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                  {activeDropdown === "collections" && (
                    <div className="space-y-0.5">
                      {collections.map(c => (
                        <DropdownLink key={c.id} href={storePath(`/collections/${c.handle}`)} label={c.title} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                      ))}
                      <div className={`pt-2 mt-2 border-t ${divider}`}>
                        <Link href={storePath("/collections")} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                          All collections <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                  {activeDropdown === "categories" && (
                    <div className="space-y-0.5">
                      {categories.map(c => (
                        <DropdownLink key={c.id} href={storePath(`/categories/${c.handle}`)} label={c.name} sub={`${c.product_count} items`} brandPrimary={brandPrimary} isDark={isDark} active={hoverItem === c.handle} onHover={() => setHoverItem(c.handle)} onClick={() => setActiveDropdown(null)} />
                      ))}
                      <div className={`pt-2 mt-2 border-t ${divider}`}>
                        <Link href={storePath("/categories")} onClick={() => setActiveDropdown(null)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandPrimary }}>
                          All categories <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {showProductsPanel && (
                  <>
                    <div className={`w-px shrink-0 ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                        {hoverItem
                          ? (collections.find(c => c.handle === hoverItem)?.title ?? categories.find(c => c.handle === hoverItem)?.name ?? "Products")
                          : "New Arrivals"}
                      </p>
                      {previewProducts.length > 0 ? (
                        <div className="flex gap-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                          {previewProducts.map(p => (
                            <ProductPreviewCard key={p.id} product={p} handle={handle} bare={bare} brandPrimary={brandPrimary} isDark={isDark} onClick={() => setActiveDropdown(null)} />
                          ))}
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center h-32 text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                          No products in this collection yet
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!showProductsPanel && manualChildren.length > 0 && (
                  <>
                    <div className={`w-px shrink-0 ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>More</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                        {manualChildren.map((child: any) => {
                          const childHref = child.url ? navHref(child.url) : storePath("/")
                          const grandChildren: any[] = child.children ?? []
                          return (
                            <div key={child.id} className="mb-3">
                              <Link href={childHref} onClick={() => setActiveDropdown(null)}
                                className={`block text-sm font-semibold mb-1 transition-colors ${isDark ? "text-white hover:text-white/80" : "text-gray-900 hover:text-gray-700"}`}>
                                {child.label}
                              </Link>
                              {grandChildren.map((gc: any) => {
                                const gcHref = gc.url ? navHref(gc.url) : storePath("/")
                                return (
                                  <Link key={gc.id} href={gcHref} onClick={() => setActiveDropdown(null)}
                                    className={`block py-0.5 text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                                    {gc.label}
                                  </Link>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── CUSTOM NAV ITEM DROPDOWN (outside nav, same level as mega dropdown) ── */}
      {activeDropdown?.startsWith("custom_") && !searchOpen && (() => {
        const activeItem = navItems.find((it: any) => `custom_${it.id}` === activeDropdown)
        if (!activeItem || !activeItem.children?.length) return null
        const hasAnyGrandChildren = activeItem.children.some((c: any) => (c.children ?? []).length > 0)

        return (
          <div className="fixed left-0 right-0 z-[60] border-b shadow-2xl"
            style={{ top: dropdownTop, backgroundColor: dropdownBgColor, borderColor: dropdownBorderColor }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="max-w-6xl px-6 py-6 mx-auto">
              {!hasAnyGrandChildren ? (
                <div className="flex gap-1">
                  {activeItem.children.map((child: any) => {
                    const childHref = child.href ?? (child.url ? navHref(child.url) : storePath("/"))
                    return (
                      <Link key={child.id} href={childHref}
                        target={child.external ? "_blank" : undefined}
                        rel={child.external ? "noopener noreferrer" : undefined}
                        onClick={() => setActiveDropdown(null)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="flex gap-10">
                  {activeItem.children.map((child: any) => {
                    const childHref = child.href ?? (child.url ? navHref(child.url) : null)
                    const grandChildren: any[] = child.children ?? []
                    return (
                      <div key={child.id} className="min-w-[140px]">
                        {childHref ? (
                          <Link href={childHref} target={child.external ? "_blank" : undefined} onClick={() => setActiveDropdown(null)}
                            className={`block text-xs font-bold uppercase tracking-wider mb-3 transition-colors ${isDark ? "text-white hover:text-white/70" : "text-gray-900 hover:text-gray-600"}`}>
                            {child.label}
                          </Link>
                        ) : (
                          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{child.label}</p>
                        )}
                        <div className="space-y-1.5">
                          {grandChildren.map((gc: any) => {
                            const gcHref = gc.href ?? (gc.url ? navHref(gc.url) : storePath("/"))
                            return (
                              <Link key={gc.id} href={gcHref}
                                target={gc.external ? "_blank" : undefined}
                                rel={gc.external ? "noopener noreferrer" : undefined}
                                onClick={() => setActiveDropdown(null)}
                                className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                                {gc.label}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* ── MOBILE NAV ── */}
      {mobileOpen && (
        <div className={`md:hidden fixed inset-x-0 z-50 border-b shadow-lg ${isDark ? "bg-black border-white/10" : "bg-white border-gray-100"}`}
          style={{ top: dropdownTop }}>
          <div className="px-4 py-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {navItems.map((item: any) => {
              const href = item.href ?? (item.url ? navHref(item.url) : storePath("/"))

              const isSystemCollections = item.url === "/collections" || item.id === "collections"
              const isSystemCategories  = item.url === "/categories"  || item.id === "categories"
              const autoPopulate        = item.autoPopulate !== false

              const manualChildren: any[] = item.children ?? []
              const autoChildren: any[] =
                autoPopulate && isSystemCollections ? collections.map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}`, children: [] })) :
                autoPopulate && isSystemCategories  ? categories.map(c => ({ id: c.id, label: c.name,  url: `/categories/${c.handle}`,  children: [] })) :
                []
              const mobileChildren = manualChildren.length > 0 ? manualChildren : autoChildren
              const hasChildren = mobileChildren.length > 0
              const isExpanded = mobileExpandedIds.has(item.id)

              return (
                <div key={item.id}>
                  <div className={`flex items-center rounded-lg transition-colors ${
                    isActive(href)
                      ? isDark ? "bg-white/5" : "bg-orange-50/60"
                      : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}>
                    <Link
                      href={hasChildren ? "#" : href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={e => {
                        if (hasChildren) { e.preventDefault(); toggleMobileId(item.id) }
                        else setMobileOpen(false)
                      }}
                      className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${isActive(href) ? "" : textMuted}`}
                      style={isActive(href) ? { color: brandPrimary } : {}}>
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button onClick={() => toggleMobileId(item.id)} className={`px-3 py-2.5 ${textMuted}`}>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className={`ml-3 mt-0.5 mb-1 rounded-lg border overflow-hidden ${
                      isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50/80"
                    }`}>
                      {mobileChildren.map((child: any) => {
                        const childHref = child.href ?? (child.url ? navHref(child.url) : storePath("/"))
                        const grandChildren: any[] = child.children ?? []
                        const hasGrandChildren = grandChildren.length > 0
                        const childKey = `child_${child.id}`
                        const isChildExpanded = mobileExpandedIds.has(childKey)

                        return (
                          <div key={child.id} className={`border-b last:border-0 ${isDark ? "border-white/10" : "border-gray-100"}`}>
                            <div className="flex items-center">
                              <Link
                                href={hasGrandChildren ? "#" : childHref}
                                target={child.external ? "_blank" : undefined}
                                rel={child.external ? "noopener noreferrer" : undefined}
                                onClick={e => {
                                  if (hasGrandChildren) { e.preventDefault(); toggleMobileId(childKey) }
                                  else setMobileOpen(false)
                                }}
                                className={`flex-1 px-4 py-2.5 text-sm transition-colors ${isActive(childHref) ? "" : textMuted}`}
                                style={isActive(childHref) ? { color: brandPrimary } : {}}>
                                {child.label}
                              </Link>
                              {hasGrandChildren && (
                                <button onClick={() => toggleMobileId(childKey)} className={`px-3 py-2.5 ${textMuted}`}>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isChildExpanded ? "rotate-180" : ""}`} />
                                </button>
                              )}
                            </div>
                            {hasGrandChildren && isChildExpanded && (
                              <div className={`ml-4 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                                {grandChildren.map((gc: any) => {
                                  const gcHref = gc.href ?? (gc.url ? navHref(gc.url) : storePath("/"))
                                  return (
                                    <Link key={gc.id} href={gcHref}
                                      target={gc.external ? "_blank" : undefined}
                                      rel={gc.external ? "noopener noreferrer" : undefined}
                                      onClick={() => setMobileOpen(false)}
                                      className={`block px-4 py-2 text-xs transition-colors border-b last:border-0 ${
                                        isDark ? "border-white/10 text-white/50 hover:text-white" : "border-gray-100 text-gray-400 hover:text-gray-900"
                                      }`}
                                      style={isActive(gcHref) ? { color: brandPrimary } : {}}>
                                      {gc.label}
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </div>
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
function TickerBar({ section }: { section: any }) {
  const rawItems: string[] = section.ticker_items ?? ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"]
  const sep = section.ticker_separator ?? "✦"
  const speed = section.ticker_speed ?? 40
  const bg = section.background_color ?? "#111827"
  const fg = section.text_color ?? "#ffffff"
  const duration = Math.max(2, 100 - speed)

  const items = rawItems
    .flatMap(raw => raw
      .split(/<\/p>|<br\s*\/?>/)
      .map(chunk => chunk.replace(/^<p[^>]*>/, "").replace(/&nbsp;/g, " ").trim())
      .filter(chunk => chunk.replace(/<[^>]*>/g, "").trim().length > 0)
    )
    .filter(item => item.length > 0)

  const REPEATS = 20
  const repeated = Array(REPEATS).fill(items).flat()
  const id = `ticker-${bg.replace("#", "")}`

  return (
    <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes ${id} { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .${id}-track { display: flex; white-space: nowrap; width: max-content; will-change: transform; animation: ${id} ${duration}s linear infinite; }
        .${id}-track a { color: inherit; text-decoration: underline; }
        .${id}-track a:hover { opacity: 0.8; }
      `}</style>
      <div className={`${id}-track text-sm font-medium tracking-wide`}>
        {[0, 1].map(copy => (
          <span key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {repeated.map((item, i) => (
              <span key={i} style={{ color: fg }}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
                {`  ${sep}  `}
              </span>
            ))}
          </span>
        ))}
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
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
        active ? isDark ? "bg-white/10" : "bg-gray-50" : isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
      }`}>
      <span className={`text-sm font-medium transition-colors ${active ? "" : isDark ? "text-white/70 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}
        style={active ? { color: brandPrimary } : {}}>
        {label}
      </span>
      {sub && <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>{sub}</span>}
    </Link>
  )
}

// ── Product preview card ──────────────────────────────────────────────────────
function ProductPreviewCard({ product, handle, bare, brandPrimary, isDark, onClick }: {
  product: Product; handle: string; bare: boolean; brandPrimary: string; isDark: boolean; onClick: () => void
}) {
  const price = product.variants?.[0]?.prices?.[0]?.amount
  const href = bare ? `/products/${product.handle}` : `/${handle}/products/${product.handle}`
  return (
    <Link href={href} onClick={onClick} className="shrink-0 w-28 group">
      <div className={`w-28 h-28 rounded-xl overflow-hidden mb-2 relative ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
        {product.thumbnail
          ? <Image src={product.thumbnail} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="112px" />
          : <div className="flex items-center justify-center w-full h-full"><span className="text-2xl opacity-20">🛍</span></div>}
      </div>
      <p className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{product.title}</p>
      {price !== undefined && <p className="text-xs font-bold mt-0.5" style={{ color: brandPrimary }}>{formatPrice(price)}</p>}
    </Link>
  )
}
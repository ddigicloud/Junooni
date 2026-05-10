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
}

export default function StoreHeader({
  vendor, store,
  categories = [], collections = [], products = [],
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

  const isActive = (href: string) =>
    href === `/${handle}` ? pathname === `/${handle}` : pathname.startsWith(href)

  // Close on outside click
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

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery("")
    }
  }, [searchOpen])

  // Close dropdowns on scroll
  useEffect(() => {
    const handler = () => {
      setActiveDropdown(null)
      setSearchOpen(false)
      setSearchQuery("")
    }
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
    setActiveDropdown(null)
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

  // ── Search results ──────────────────────────────────────────────────────────
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

  // ── Preview products for nav dropdown ──────────────────────────────────────
  const getPreviewProducts = (key: string, itemHandle?: string): Product[] => {
    if (!products.length) return []
    if (key === "shop") return products.slice(0, 8)
    if (key === "collections" && itemHandle) {
      const col = collections.find(c => c.handle === itemHandle)
      const ids: string[] = (col as any)?.product_ids ?? []
      if (ids.length) {
        return products
          .filter(p => ids.map(String).includes(String(p.id)))
          .slice(0, 8)
      }
      return [] // ← don't fall back to all products
    }
    if (key === "categories" && itemHandle) {
      const m = products.filter(p => p.categories?.some(c => c.handle === itemHandle))
      return m.length ? m.slice(0, 8) : []
    }
    return products.slice(0, 8)
  }

  const previewProducts = getPreviewProducts(activeDropdown ?? "shop", hoverItem)

  // Styles
  const bg = isDark ? "bg-black/95 border-white/10" : "bg-white/95 border-gray-100"
  const textBase = isDark ? "text-white" : "text-gray-900"
  const textMuted = isDark ? "text-white/60" : "text-gray-500"
  const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
  const dropdownBg = isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-100"
  const divider = isDark ? "border-white/10" : "border-gray-100"
  const inputBg = isDark ? "bg-white/10 border-white/20 text-white placeholder-white/40" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
  const stickyHeader = (store as any)?.sticky_header !== false

  return (
    <div ref={headerRef} className={stickyHeader ? "sticky top-0 z-40" : "relative"}>
      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <header className={`w-full backdrop-blur-md border-b shadow-sm ${bg}`}>
        <div className="relative flex items-center justify-between h-16 gap-6 px-4 mx-auto max-w-7xl sm:px-6">

          {/* Mobile hamburger - extreme left (md: hidden) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-full transition-colors shrink-0 ${isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>

          {/* Logo - absolutely centered on mobile, static on desktop */}
          <Link href={`/${handle}`} className="flex items-center gap-2.5 shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            {/* Store logo takes priority over vendor logo over initial */}
            {(store as any)?.store_logo
              ? <Image
                  src={(store as any).store_logo}
                  alt={vendor.name}
                  width={120} height={40}
                  className="object-contain w-auto h-9"
                />
              : vendor.logo
              ? <div className="w-8 h-8 overflow-hidden rounded-full ring-2 ring-gray-100">
                  <Image src={vendor.logo} alt={vendor.name} width={32} height={32} className="object-cover" />
                </div>
              : <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full" style={{ background: brandPrimary }}>
                  {vendor.name[0]?.toUpperCase()}
                </div>
            }
            {/* Hide text name if store logo is set */}
            {!(store as any)?.store_logo && (
              <span className={`font-semibold text-sm ${textBase}`}>{vendor.name}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="items-center justify-center flex-1 hidden gap-1 md:flex">
            <Link href={`/${handle}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(`/${handle}`) && pathname === `/${handle}` ? "" : textMuted}`}
              style={isActive(`/${handle}`) && pathname === `/${handle}` ? { color: brandPrimary } : {}}
            >
              Home
            </Link>

            {/* Shop */}
            <div className="relative"
              onMouseEnter={() => { openDropdown("shop"); setHoverItem(undefined) }}
              onMouseLeave={scheduleClose}
            >
              <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(`/${handle}/products`) ? "" : textMuted}`}
                style={isActive(`/${handle}/products`) ? { color: brandPrimary } : {}}>
                Shop
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "shop" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Collections */}
            {collections.length > 0 && (
              <div className="relative"
                onMouseEnter={() => { openDropdown("collections"); setHoverItem(collections[0]?.handle) }}
                onMouseLeave={scheduleClose}
              >
                <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(`/${handle}/collections`) ? "" : textMuted}`}
                  style={isActive(`/${handle}/collections`) ? { color: brandPrimary } : {}}>
                  Collections
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "collections" ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="relative"
                onMouseEnter={() => { openDropdown("categories"); setHoverItem(categories[0]?.handle) }}
                onMouseLeave={scheduleClose}
              >
                <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(`/${handle}/categories`) ? "" : textMuted}`}
                  style={isActive(`/${handle}/categories`) ? { color: brandPrimary } : {}}>
                  Categories
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "categories" ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}

            {/* Custom pages marked in_nav */}
            {((store as any)?.pages?.pages ?? [])
              .filter((p: any) => p.in_nav)
              .map((p: any) => (
                <Link
                  key={p.id}
                  href={`/${handle}/p/${p.slug}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(`/${handle}/p/${p.slug}`) ? "" : textMuted}`}
                  style={isActive(`/${handle}/p/${p.slug}`) ? { color: brandPrimary } : {}}
                >
                  {p.title}
                </Link>
              ))
            }
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search icon — toggles dropdown */}
            <button
              onClick={toggleSearch}
              className={`p-2 rounded-full transition-all ${
                searchOpen
                  ? "text-white"
                  : isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
              style={searchOpen ? { background: brandPrimary } : {}}
              aria-label="Search"
            >
              {searchOpen ? <X style={{ width: 18, height: 18 }} /> : <Search style={{ width: 18, height: 18 }} />}
            </button>
            {/* <WishlistIconButton handle={handle} brandPrimary={brandPrimary} /> */}
            <CartIconButton brandPrimary={brandPrimary} />
          </div>
        </div>
      </header>

      {/* ── SEARCH DROPDOWN ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className={`fixed left-0 right-0 z-[60] border-b shadow-2xl ${dropdownBg}`}
          style={{ top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64 }}
        >
          <div className="max-w-6xl px-6 py-5 mx-auto">
            {/* Search input */}
            <div className="relative mb-5">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${isDark ? "text-white/40" : "text-gray-400"}`} style={{ width: 18, height: 18 }} />
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

            {/* Results */}
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
                  {/* View all results link */}
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
              /* Popular / suggestions when no query */
              <div>
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  Popular
                </p>
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
      {activeDropdown && !searchOpen && (
        <div
          className={`fixed left-0 right-0 z-[60] border-b shadow-2xl ${dropdownBg}`}
          style={{ top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 64 }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="max-w-6xl px-6 py-6 mx-auto">
            <div className="flex gap-8">
              {/* Left links */}
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

              {/* Vertical divider */}
              <div className={`w-px ${isDark ? "bg-white/10" : "bg-gray-100"} shrink-0`} />

              {/* Right: product previews */}
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
            {[
              { label: "Home",         href: `/${handle}` },
              { label: "All Products", href: `/${handle}/products` },
              ...(collections.length ? [{ label: "Collections", href: `/${handle}/collections` }] : []),
              ...(categories.length  ? [{ label: "Categories",  href: `/${handle}/categories`  }] : []),
              { label: "Search",       href: `/${handle}/search` },
            ].map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${isActive(link.href) ? "" : textMuted}`}
                style={isActive(link.href) ? { color: brandPrimary } : {}}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
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
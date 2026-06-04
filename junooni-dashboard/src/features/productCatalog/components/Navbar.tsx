import { useEffect, useState } from "react"
import { ProfileDropdown } from "../../../components/profile-dropdown"
import { Link } from "@tanstack/react-router"
import { IconMenu2 as MenuIcon } from "@tabler/icons-react"
import { ChevronDown, X } from "lucide-react"
import JunooniLogo from "@/assets/junooni_logo_brand_color.png"

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL

// ─── Types ────────────────────────────────────────────────────────────────────

interface Breadcrumb {
  id: string
  doc: number
  url: string
  label: string
}

interface Category {
  id: number
  title: string
  slug: string
  parent: Category | null | number
  breadcrumbs?: Breadcrumb[]
  updatedAt: string
  createdAt: string
  children?: Category[]
}

interface NavLink {
  type: 'reference' | 'custom'
  label: string
  reference?: { relationTo: string; value: Category | number }
  url?: string | null
  newTab?: boolean | null
}

interface SubChildNavItem { id: string; link: NavLink }
interface ChildNavItem { id: string; link: NavLink; subChildren?: SubChildNavItem[] }
interface HeaderNavItem { id: string; link: NavLink; children?: ChildNavItem[] }

// ─── Module-level cache (shared across ALL Navbar instances / pages) ──────────
// Zero JSON.parse overhead. Persists for the entire tab session.

const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

let _cache: { data: Category[]; ts: number } | null = null
let _inFlight: Promise<Category[]> | null = null  // dedup concurrent mounts

function cacheGet(): Category[] | null {
  if (!_cache) return null
  if (Date.now() - _cache.ts > CACHE_TTL) { _cache = null; return null }
  return _cache.data
}

function cacheSet(data: Category[]): void {
  _cache = { data, ts: Date.now() }
}

/** Call on logout so next login fetches fresh data */
export function invalidateNavbarCache(): void {
  _cache = null
  _inFlight = null
}

// ─── Parse header navItems → Category tree ────────────────────────────────────

function parseHeaderNavItems(navItems: HeaderNavItem[]): Category[] {
  const categories: Category[] = []

  for (const navItem of navItems) {
    if (
      navItem.link.type !== 'reference' ||
      navItem.link.reference?.relationTo !== 'categories' ||
      typeof navItem.link.reference.value !== 'object'
    ) continue

    const parentCategory = { ...navItem.link.reference.value } as Category
    parentCategory.children = []

    for (const child of navItem.children ?? []) {
      if (
        child.link.type !== 'reference' ||
        child.link.reference?.relationTo !== 'categories' ||
        typeof child.link.reference.value !== 'object'
      ) continue

      const childCategory = { ...child.link.reference.value } as Category
      childCategory.children = []

      for (const subChild of child.subChildren ?? []) {
        if (
          subChild.link.type !== 'reference' ||
          subChild.link.reference?.relationTo !== 'categories' ||
          typeof subChild.link.reference.value !== 'object'
        ) continue
        childCategory.children.push({ ...subChild.link.reference.value } as Category)
      }

      parentCategory.children.push(childCategory)
    }

    categories.push(parentCategory)
  }

  return categories
}

// ─── Single fetch function with in-flight dedup ───────────────────────────────

async function fetchNavCategories(): Promise<Category[]> {
  // Already fetching? Return the same promise — only 1 network call fires
  if (_inFlight) return _inFlight

  _inFlight = (async () => {
    try {
      const res = await fetch(`${vite_payload}/api/globals/header?depth=2`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) return []

      const data = await res.json()
      const header = data.docs?.[0] ?? data
      if (!header?.navItems) return []

      const categories = parseHeaderNavItems(header.navItems)
      cacheSet(categories)
      return categories
    } catch (err) {
      console.error('[Navbar] fetch error:', err)
      return []
    } finally {
      _inFlight = null
    }
  })()

  return _inFlight
}

// ─── Component ────────────────────────────────────────────────────────────────

const BRAND = {
  primary: "#e65100",
  secondary: "#ac1900",
  accent: "#581845",
  light: "#FFC300",
  background: "#FFEFD5",
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999"
}

const Navbar = () => {
  // Initialize directly from cache — avoids loading flicker on page 2+
  const [organizedCategories, setOrganizedCategories] = useState<Category[]>(
    () => cacheGet() ?? []
  )
  const [loading, setLoading] = useState(() => !cacheGet())
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Cache hit on mount → nothing to do, already set via useState initializer
    if (cacheGet()) return

    // No cache — fetch (deduped if multiple components mount simultaneously)
    fetchNavCategories().then((categories) => {
      setOrganizedCategories(categories)
      setLoading(false)
    })
  }, []) // runs once per mount — but fetch only fires once per 15 min across all mounts

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const groupChildrenIntoColumns = (children?: Category[], columnsCount = 3) => {
    if (!children?.length) return []
    const result: Category[][] = []
    const itemsPerColumn = Math.ceil(children.length / columnsCount)
    for (let i = 0; i < columnsCount; i++) {
      const col = children.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
      if (col.length) result.push(col)
    }
    return result
  }

  const renderSubcategoryWithChildren = (subcategory: Category) => {
    const hasChildren = !!subcategory.children?.length
    return (
      <div key={subcategory.id} className="mb-4">
        <Link
          to={`/productCatalog/category/${subcategory.slug}`}
          className="block mb-2 font-medium text-gray-900 dark:text-gray-100 hover:text-[#e65100] dark:hover:text-[#ff6f00]"
          onClick={() => setMobileOpen(false)}
        >
          {subcategory.title}
        </Link>
        {hasChildren && (
          <ul className="ml-3 space-y-1">
            {subcategory.children!.map((child) => (
              <li key={child.id}>
                {child.children?.length ? (
                  renderSubcategoryWithChildren(child)
                ) : (
                  <Link
                    to={`/productCatalog/category/${child.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#e65100] dark:hover:text-[#ff6f00] block py-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      {/* Top bar */}
      <div className="py-3 sm:py-4 w-full max-w-[95%] mx-auto flex items-center justify-between min-h-[60px] relative">

        {/* Left */}
        <div className="flex items-center flex-shrink-0 gap-4">
          <button
            aria-label="Open menu"
            className="p-1 rounded-lg sm:hidden hover:bg-orange-50 dark:hover:bg-orange-950/20"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="w-6 h-6" style={{ color: BRAND.primary }} />
          </button>
          <Link to="/dashboard" className="hidden font-bold transition-transform duration-300 sm:inline-block brand-accent hover:scale-105 logo logo-glow">
            <img src={JunooniLogo} alt="Junooni Logo" className="h-6 sm:h-8" />
          </Link>
        </div>

        {/* Mobile centered logo */}
        <Link to="/dashboard" className="absolute font-bold transition-transform duration-300 transform -translate-x-1/2 sm:hidden left-1/2 brand-accent hover:scale-105 logo logo-glow">
          <img src={JunooniLogo} alt="Junooni Logo" className="h-8" />
        </Link>

        {/* Center: desktop nav */}
        <div className="relative items-center justify-center flex-1 hidden mx-4 overflow-hidden sm:flex">
          <div className="absolute top-0 bottom-0 left-0 z-10 w-8 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
          <div
            className="flex items-center gap-4 px-2 overflow-x-auto scroll-smooth scrollable-categories"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.scrollable-categories::-webkit-scrollbar { display: none; }`}</style>

            <Link
              to="/productCatalog/products"
              className="category-link font-medium text-gray-700 dark:text-gray-300 hover:text-[#e65100] dark:hover:text-[#ff6f00] px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 whitespace-nowrap flex-shrink-0"
            >
              All Products
            </Link>

            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
              ))
            ) : (
              organizedCategories.map((category) => (
                <div
                  key={category.id}
                  className="relative flex-shrink-0 group"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Link
                    to={`/productCatalog/category/${category.slug}`}
                    className={`category-link font-medium px-3 py-2 rounded-lg flex items-center gap-1 transition-all duration-300 whitespace-nowrap ${
                      activeCategory === category.id
                        ? "text-[#e65100] dark:text-[#ff6f00] bg-orange-50 dark:bg-orange-950/20"
                        : "text-gray-700 dark:text-gray-300 hover:text-[#e65100] dark:hover:text-[#ff6f00] hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    }`}
                  >
                    {category.title}
                    {!!category.children?.length && (
                      <ChevronDown size={14} className={`transition-transform ${activeCategory === category.id ? "rotate-180" : ""}`} />
                    )}
                  </Link>
                </div>
              ))
            )}
          </div>
          <div className="absolute top-0 bottom-0 right-0 z-10 w-8 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
        </div>

        {/* Right */}
        <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4">
          <div className="p-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="sm:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="sm:hidden fixed top-0 left-0 z-[101] h-screen w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <img src={JunooniLogo} alt="Junooni" className="w-auto h-7" />
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="h-[calc(100vh-80px)] bg-white dark:bg-gray-900">
              <div className="h-full px-4 py-4 overflow-y-auto">
                <Link
                  to="/productCatalog/products"
                  className="block px-3 py-3 mb-4 font-medium text-gray-800 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 dark:text-gray-200"
                  onClick={() => setMobileOpen(false)}
                >
                  All Products
                </Link>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizedCategories.map((category) => (
                      <div key={category.id} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                        <Link
                          to={`/productCatalog/category/${category.slug}`}
                          className="block mb-3 font-semibold text-gray-900 dark:text-gray-100 hover:text-[#e65100] dark:hover:text-[#ff6f00] transition-colors px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20"
                          onClick={() => setMobileOpen(false)}
                        >
                          {category.title}
                        </Link>
                        {!!category.children?.length && (
                          <div className="pl-4 space-y-2">
                            {category.children.map((sub) => (
                              <div key={sub.id} className="ml-2">
                                {renderSubcategoryWithChildren(sub)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop megamenu */}
      {!loading && organizedCategories.map((category) => {
        if (!category.children?.length) return null
        const columnGroups = groupChildrenIntoColumns(category.children, 3)
        return (
          <div
            key={category.id}
            className={`hidden sm:block absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-700 transition-all duration-200 ${
              activeCategory === category.id ? "opacity-100 visible" : "opacity-0 invisible -translate-y-2"
            }`}
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="grid max-w-5xl grid-cols-4 gap-6 px-6 py-6 mx-auto">
              {columnGroups.map((columnItems, i) => (
                <div key={i} className="space-y-4">
                  {columnItems.map((sub) => renderSubcategoryWithChildren(sub))}
                </div>
              ))}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Featured</h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Explore top picks in {category.title}</p>
                <Link
                  to={`/productCatalog/category/${category.slug}`}
                  className="inline-block px-3 py-1 text-sm text-[#e65100] border border-[#e65100] rounded hover:bg-[#e65100] hover:text-white transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Navbar
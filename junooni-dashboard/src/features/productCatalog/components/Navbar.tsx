import { useEffect, useState } from "react"
import { ProfileDropdown } from "../../../components/profile-dropdown"
import { Link } from "@tanstack/react-router"
import { IconMenu2 as MenuIcon } from "@tabler/icons-react"
import { ChevronDown, Menu, X } from "lucide-react"
import JunooniLogo from "@/assets/junooni_logo_brand_color.png"

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL

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
  reference?: {
    relationTo: string
    value: Category | number
  }
  url?: string | null
  newTab?: boolean | null
}

interface SubChildNavItem {
  id: string
  link: NavLink
}

interface ChildNavItem {
  id: string
  link: NavLink
  subChildren?: SubChildNavItem[]
}

interface HeaderNavItem {
  id: string
  link: NavLink
  children?: ChildNavItem[]
}

interface Header {
  id: number
  navItems: HeaderNavItem[]
  updatedAt: string
  createdAt: string
}

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
};

const Navbar = () => {
  const [organizedCategories, setOrganizedCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch from /api/headers with proper depth
        const response = await fetch(`${vite_payload}/api/globals/header?limit=1&depth=3`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        const data = await response.json()
        
        //console.log('API Response:', data)
        
        // Get the first (or latest) header
        const header = data.docs?.[0] || data
        
        if (!header || !header.navItems) {
          //console.warn('No header or navItems found')
          return
        }

        //console.log('Header navItems:', header.navItems)

        // Parse the header structure and build category hierarchy
        const categories = parseHeaderNavItems(header.navItems)
        
        //console.log('Parsed categories:', categories)
        setOrganizedCategories(categories)
      } catch (error) {
        //console.error('Error fetching header categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Parse header navItems structure into category hierarchy
  const parseHeaderNavItems = (navItems: HeaderNavItem[]): Category[] => {
    const categories: Category[] = []

    navItems.forEach((navItem) => {
      // Get the parent category
      if (navItem.link.type === 'reference' && 
          navItem.link.reference?.relationTo === 'categories' &&
          typeof navItem.link.reference.value === 'object') {
        
        const parentCategory = { ...navItem.link.reference.value } as Category
        parentCategory.children = []

        //console.log('Parent category:', parentCategory.title)

        // Process children if they exist
        if (navItem.children && navItem.children.length > 0) {
          navItem.children.forEach((child) => {
            if (child.link.type === 'reference' &&
                child.link.reference?.relationTo === 'categories' &&
                typeof child.link.reference.value === 'object') {
              
              const childCategory = { ...child.link.reference.value } as Category
              childCategory.children = []

              //console.log('  Child category:', childCategory.title)

              // Process subChildren if they exist
              if (child.subChildren && child.subChildren.length > 0) {
                child.subChildren.forEach((subChild) => {
                  if (subChild.link.type === 'reference' &&
                      subChild.link.reference?.relationTo === 'categories' &&
                      typeof subChild.link.reference.value === 'object') {
                    
                    const subChildCategory = { ...subChild.link.reference.value } as Category
                    //console.log('    SubChild category:', subChildCategory.title)
                    
                    childCategory.children!.push(subChildCategory)
                  }
                })
              }

              parentCategory.children!.push(childCategory)
            }
          })
        }

        categories.push(parentCategory)
      }
    })

    return categories
  }

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const groupChildrenIntoColumns = (children?: Category[], columnsCount = 3) => {
    if (!children || children.length === 0) return []
    const result: Category[][] = []
    const itemsPerColumn = Math.ceil(children.length / columnsCount)
    for (let i = 0; i < columnsCount; i++) {
      const startIndex = i * itemsPerColumn
      const columnItems = children.slice(startIndex, startIndex + itemsPerColumn)
      if (columnItems.length > 0) result.push(columnItems)
    }
    return result
  }

  const renderSubcategoryWithChildren = (subcategory: Category, parentPath: string = "") => {
    const hasChildren = subcategory.children && subcategory.children.length > 0
    
    // Build the full path
    const fullPath = parentPath 
      ? `${parentPath}/${subcategory.slug}` 
      : subcategory.slug

    return (
      <div key={subcategory.id} className="mb-4">
        <Link
          to={`/productCatalog/category/${fullPath}`}
          className="block mb-2 font-medium text-gray-900 dark:text-gray-100 hover:text-[#e65100] dark:hover:text-[#ff6f00]"
          onClick={() => setMobileOpen(false)}
        >
          {subcategory.title}
        </Link>
        {hasChildren && (
          <ul className="ml-3 space-y-1">
            {subcategory.children?.map((childCategory) => (
              <li key={childCategory.id}>
                {childCategory.children && childCategory.children.length > 0 ? (
                  <div className="mb-2">
                    {renderSubcategoryWithChildren(childCategory, fullPath)}
                  </div>
                ) : (
                  <Link
                    to={`/productCatalog/category/${fullPath}/${childCategory.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#e65100] dark:hover:text-[#ff6f00] block py-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    {childCategory.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="fixed z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      {/* Top navbar row - Desktop and Mobile */}
      <div className="py-3 sm:py-4 w-full max-w-[95%] mx-auto flex items-center justify-between min-h-[60px] relative">
        {/* Left: Hamburger (mobile only) + Logo (desktop only) */}
        <div className="flex items-center flex-shrink-0 gap-4">
          <button
            aria-label="Open menu"
            className="p-1 rounded-lg sm:hidden hover:bg-orange-50 dark:hover:bg-orange-950/20"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="w-6 h-6" style={{ color: BRAND.primary }}/>
          </button>

          {/* Desktop Logo */}
          <Link
            to="/dashboard"
            className="hidden font-bold transition-transform duration-300 sm:inline-block brand-accent hover:scale-105 logo logo-glow"
          >
            <img src={JunooniLogo} alt="Junooni Logo" className="h-6 sm:h-8" />
          </Link>
        </div>

        {/* Mobile Centered Logo */}
        <Link
          to="/dashboard"
          className="absolute font-bold transition-transform duration-300 transform -translate-x-1/2 sm:hidden left-1/2 brand-accent hover:scale-105 logo logo-glow"
        >
          <img src={JunooniLogo} alt="Junooni Logo" className="h-8" />
        </Link>

        {/* Center: Desktop categories with horizontal scroll (hidden on mobile) */}
        <div className="relative items-center justify-center flex-1 mx-4 overflow-hidden hidden sm:flex">
          {/* Fade effect on left */}
          <div className="absolute top-0 bottom-0 left-0 z-10 w-8 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
          
          {/* Scrollable container */}
          <div 
            className="flex items-center gap-4 px-2 overflow-x-auto scroll-smooth scrollable-categories"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
              .scrollable-categories::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            <Link
              to="/productCatalog/products"
              className="category-link font-medium text-gray-700 dark:text-gray-300 hover:text-[#e65100] dark:hover:text-[#ff6f00] px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 whitespace-nowrap flex-shrink-0"
            >
              All Products
            </Link>

            {organizedCategories.map((category) => {
              const hasChildren = category.children && category.children.length > 0
              return (
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
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          activeCategory === category.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
          
          {/* Fade effect on right */}
          <div className="absolute top-0 bottom-0 right-0 z-10 w-8 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
        </div>

        {/* Right: Profile */}
        <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4">
          <div className="p-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay and Off-Canvas */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Mobile Off-Canvas Menu */}
          <div className="sm:hidden fixed top-0 left-0 z-[101] h-screen w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <img src={JunooniLogo} alt="Junooni" className="w-auto h-7" />
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100vh-80px)] bg-white dark:bg-gray-900">
              <div className="h-full px-4 py-4 overflow-y-auto bg-white dark:bg-gray-900">
                {/* All Products Link */}
                <Link
                  to="/productCatalog/products"
                  className="block px-3 py-3 mb-4 font-medium text-gray-800 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 dark:text-gray-200"
                  onClick={() => setMobileOpen(false)}
                >
                  All Products
                </Link>

                {/* Categories */}
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

                      {category.children && category.children.length > 0 && (
                        <div className="pl-4 space-y-2">
                          {category.children.map((sub) => (
                            <div key={sub.id} className="ml-2">
                              {renderSubcategoryWithChildren(sub, category.slug)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Megamenu */}
      {organizedCategories.map((category) => {
        const hasChildren = category.children && category.children.length > 0
        if (!hasChildren) return null

        const columnGroups = groupChildrenIntoColumns(category.children, 3)

        return (
          <div
            key={category.id}
            className={`hidden sm:block absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-700 transition-all duration-200 ${
              activeCategory === category.id
                ? "opacity-100 visible"
                : "opacity-0 invisible -translate-y-2"
            }`}
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="grid max-w-5xl grid-cols-4 gap-6 px-6 py-6 mx-auto">
              {columnGroups.map((columnItems, i) => (
                <div key={i} className="space-y-4">
                  {columnItems.map((subcategory) =>
                    renderSubcategoryWithChildren(subcategory, category.slug)
                  )}
                </div>
              ))}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                  Featured
                </h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Explore top picks in {category.title}
                </p>
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
// 'use client'
// import { useHeaderTheme } from '@/providers/HeaderTheme'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import React, { useEffect, useState } from 'react'

// import type { Header } from '@/payload-types'

// import { Logo } from '@/components/Logo/Logo'
// import { HeaderNav } from './Nav'

// interface HeaderClientProps {
//   data: Header
// }

// export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
//   /* Storing the value in a useState to avoid hydration errors */
//   const [theme, setTheme] = useState<string | null>(null)
//   const { headerTheme, setHeaderTheme } = useHeaderTheme()
//   const pathname = usePathname()

//   useEffect(() => {
//     setHeaderTheme(null)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname])

//   useEffect(() => {
//     if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [headerTheme])

//   return (
//     <header className="container relative z-20 border-b border-gray-200" {...(theme ? { 'data-theme': theme } : {})}>
//       <div className="py-8 flex justify-between">
//         <Link href="/">
//           <Logo loading="eager" priority="high"  />
//         </Link>
//         <HeaderNav data={data} />
//       </div>
//     </header>
//   )
// }


'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  categories?: any[]
}

// Mega Menu Item Component (Desktop)
function MegaMenuItem({ category, allCategories }: { category: any; allCategories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get child categories
  const childCategories = allCategories.filter(cat => {
    if (!cat.parent) return false
    const parentId = typeof cat.parent === 'object' ? cat.parent.id : cat.parent
    const categoryId = category.id
    return parentId === categoryId
  })

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Parent Category Button */}
      <Link
        href={`/collection/${category.slug}`}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400 whitespace-nowrap"
      >
        <span>{category.title}</span>
        {childCategories.length > 0 && (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </Link>

      {/* Mega Menu Dropdown */}
      {childCategories.length > 0 && isOpen && (
        <div 
          className="fixed left-0 right-0 w-full bg-white border-t border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700"
          style={{ 
            zIndex: 9999,
            top: 'var(--header-height, 60px)',
            maxWidth: '100%',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container p-6 mx-auto">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {/* Featured Section */}
              {category.productCount > 0 && (
                <div className="col-span-1">
                  <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                    Featured
                  </h3>
                  <Link
                    href={`/collection/${category.slug}`}
                    className="block mb-2 text-sm text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400"
                  >
                    Explore {category.title}
                  </Link>
                  <Link
                    href={`/collection/${category.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 mt-3 text-sm font-semibold text-white transition-all rounded-lg hover:opacity-90"
                    style={{ backgroundColor: '#e65100' }}
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Child Categories */}
              <div className={`${category.productCount > 0 ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-2 md:col-span-3 lg:col-span-4'}`}>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {childCategories.map((child) => (
                    <div key={child.id} className="space-y-1">
                      <Link
                        href={`/collection/${child.slug}`}
                        className="block text-sm font-semibold text-gray-900 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                      >
                        {child.title}
                      </Link>
                      {child.productCount !== undefined && child.productCount > 0 && (
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {child.productCount} products
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile Menu Component
function MobileMenu({ categories, allCategories }: { categories: any[]; allCategories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Close menu when route changes
  const pathname = usePathname()
  useEffect(() => {
    setIsOpen(false)
    setExpandedCategory(null)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getChildCategories = (categoryId: string) => {
    return allCategories.filter(cat => {
      if (!cat.parent) return false
      const parentId = typeof cat.parent === 'object' ? cat.parent.id : cat.parent
      return parentId === categoryId
    })
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 text-gray-700 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl dark:bg-gray-800 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-2">
              {/* All Collections Link */}
              <Link
                href="/collection"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-white dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                All Collections
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Categories */}
              {categories.map((category) => {
                const childCategories = getChildCategories(category.id)
                const isExpanded = expandedCategory === category.id

                return (
                  <div key={category.id}>
                    {/* Parent Category */}
                    <div className="flex items-center">
                      <Link
                        href={`/collection/${category.slug}`}
                        className="flex-1 flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        {category.title}
                      </Link>
                      {childCategories.length > 0 && (
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Child Categories */}
                    {childCategories.length > 0 && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-200 dark:border-orange-900 pl-4">
                        {childCategories.map((child) => (
                          <Link
                            key={child.id}
                            href={`/collection/${child.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <span>{child.title}</span>
                            {child.productCount !== undefined && child.productCount > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {child.productCount}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, categories = [] }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  // Get only top-level categories
  // Get only top-level featured categories, reversed
// Get only top-level featured categories, reversed
// Get only top-level featured categories, reversed
const topLevelCategories = categories
  .filter((cat) => {
    if (!cat.parent) return true
    if (typeof cat.parent === 'object') {
      if (!cat.parent.id || cat.parent.id === null || cat.parent.id === undefined) {
        return true
      }
    }
    if (typeof cat.parent === 'string' && cat.parent.trim() === '') {
      return true
    }
    return false
  })
  .filter(cat => {
    //console.log('Category:', cat.title, 'featuredCategory:', cat.featuredCategory, 'type:', typeof cat.featuredCategory)
    return cat.featuredCategory === true
  })
  .reverse()

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
      {...(theme ? { 'data-theme': theme } : {})}
      style={{ '--header-height': '60px' } as React.CSSProperties}
    >
      <div className="container mx-auto">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between gap-3 px-1 py-3 lg:hidden">
          {/* Left: Hamburger Menu */}
          <div className="flex items-center">
            <MobileMenu categories={topLevelCategories} allCategories={categories} />
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo loading="eager" priority="high" />
          </Link>

          {/* Right: HeaderNav */}
          <div className="flex items-center">
            <HeaderNav data={data} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo loading="eager" priority="high" />
          </Link>

          {/* Categories Navigation */}
          {categories && categories.length > 0 && (
            <nav className="relative flex items-center flex-1 gap-1">
              {/* All Products Link */}
              <Link
                href="/collection"
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400 whitespace-nowrap"
              >
                All Collections
              </Link>

              {/* Separator */}
              <span className="text-gray-300 dark:text-gray-600">|</span>

              {/* Categories with Mega Menu */}
              {topLevelCategories.length > 0 ? (
                topLevelCategories.map((category) => (
                  <MegaMenuItem
                    key={category.id}
                    category={category}
                    allCategories={categories}
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No categories found
                </div>
              )}
            </nav>
          )}

          {/* Right Side - HeaderNav */}
          <div className="flex items-center flex-shrink-0">
            <HeaderNav data={data} />
          </div>
        </div>
      </div>
    </header>
  )
}
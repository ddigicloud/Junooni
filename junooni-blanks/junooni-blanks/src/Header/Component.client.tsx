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
}

// Helper function to get URL from link object
function getLinkUrl(link: any): string {
  if (!link) return '#'
  
  if (link.type === 'custom' && link.url) {
    return link.url
  }
  
  if (link.type === 'reference' && link.reference) {
    const ref = link.reference
    if (typeof ref === 'object' && ref !== null) {
      // Handle different collection types
      if (ref.relationTo === 'categories') {
        const value = ref.value
        if (typeof value === 'object' && value !== null) {
          return `/collection/${value.slug}`
        }
      }
      if (ref.relationTo === 'pages') {
        const value = ref.value
        if (typeof value === 'object' && value !== null) {
          return `/${value.slug}`
        }
      }
      if (ref.relationTo === 'posts') {
        const value = ref.value
        if (typeof value === 'object' && value !== null) {
          return `/posts/${value.slug}`
        }
      }
      
      // Fallback for other reference structures
      const slug = typeof ref.value === 'object' ? ref.value?.slug : ref.slug
      if (slug) {
        if (ref.relationTo === 'categories') return `/collection/${slug}`
        if (ref.relationTo === 'pages') return `/${slug}`
        if (ref.relationTo === 'posts') return `/posts/${slug}`
      }
    }
  }
  
  return '#'
}

// Mega Menu Item Component (Desktop)
function MegaMenuItem({ navItem }: { navItem: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const children = navItem.children || []
  const link = navItem.link
  const label = link?.label || 'Nav Item'
  const url = getLinkUrl(link)

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
      {/* Parent Nav Item Button */}
      <Link
        href={url}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400 whitespace-nowrap"
      >
        <span>{label}</span>
        {children.length > 0 && (
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
      {children.length > 0 && isOpen && (
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
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Featured Section */}
              <div className="space-y-3">
                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                  Featured
                </h3>
                <Link
                  href={url}
                  className="block mb-2 text-sm text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400"
                >
                  Explore {label}
                </Link>
                <Link
                  href={url}
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

              {/* Child Nav Items */}
              <div className="overflow-y-auto max-h-[70vh]">
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {children.map((child: any, index: number) => {
                    const childLink = child.link
                    const childLabel = childLink?.label || 'Child Item'
                    const childUrl = getLinkUrl(childLink)
                    const subChildren = child.subChildren || [] // ⭐ Access subChildren
                    
                    return (
                      <div key={index} className="space-y-2">
                        <Link
                          href={childUrl}
                          className="block text-sm font-semibold text-gray-900 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                        >
                          {childLabel}
                        </Link>
                        
                        {/* Render sub-children */}
                        {subChildren.length > 0 && (
                          <div className="ml-2 space-y-1 border-l-2 border-orange-100 dark:border-orange-900 pl-2">
                            {subChildren.map((subChild: any, subIndex: number) => {
                              const subChildLink = subChild.link
                              const subChildLabel = subChildLink?.label || 'Sub Item'
                              const subChildUrl = getLinkUrl(subChildLink)
                              
                              return (
                                <Link
                                  key={subIndex}
                                  href={subChildUrl}
                                  className="block text-xs text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                                >
                                  {subChildLabel}
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile Menu Component
function MobileMenu({ navItems }: { navItems: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const pathname = usePathname()
  useEffect(() => {
    setIsOpen(false)
    setExpandedItems(new Set())
  }, [pathname])

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

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
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

              {/* Nav Items */}
              {navItems.map((navItem, index) => {
                const children = navItem.children || []
                const isExpanded = expandedItems.has(String(index))
                const link = navItem.link
                const label = link?.label || 'Nav Item'
                const url = getLinkUrl(link)

                return (
                  <div key={index}>
                    {/* Parent Nav Item */}
                    <div className="flex items-center">
                      <Link
                        href={url}
                        className="flex-1 flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        {label}
                      </Link>
                      {children.length > 0 && (
                        <button
                          onClick={() => toggleItem(String(index))}
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

                    {/* Child Nav Items */}
                    {children.length > 0 && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-200 dark:border-orange-900 pl-4">
                        {children.map((child: any, childIndex: number) => {
                          const childLink = child.link
                          const childLabel = childLink?.label || 'Child Item'
                          const childUrl = getLinkUrl(childLink)
                          const subChildren = child.subChildren || [] // ⭐ Access subChildren
                          const childKey = `${index}-${childIndex}`
                          const isChildExpanded = expandedItems.has(childKey)
                          
                          return (
                            <div key={childIndex}>
                              {/* Child Item */}
                              <div className="flex items-center">
                                <Link
                                  href={childUrl}
                                  className="flex-1 flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                  {childLabel}
                                </Link>
                                {subChildren.length > 0 && (
                                  <button
                                    onClick={() => toggleItem(childKey)}
                                    className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <svg
                                      className={`w-4 h-4 transition-transform ${isChildExpanded ? 'rotate-180' : ''}`}
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

                              {/* Sub-children (third level) */}
                              {subChildren.length > 0 && isChildExpanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-100 dark:border-orange-800 pl-3">
                                  {subChildren.map((subChild: any, subIndex: number) => {
                                    const subChildLink = subChild.link
                                    const subChildLabel = subChildLink?.label || 'Sub Item'
                                    const subChildUrl = getLinkUrl(subChildLink)
                                    
                                    return (
                                      <Link
                                        key={subIndex}
                                        href={subChildUrl}
                                        className="block px-3 py-2 text-xs text-gray-600 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                      >
                                        {subChildLabel}
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
        </>
      )}
    </>
  )
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  const navItems = data.navItems || []

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
      {...(theme ? { 'data-theme': theme } : {})}
      style={{ '--header-height': '60px' } as React.CSSProperties}
    >
      <div className="container mx-auto">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between gap-3 px-1 py-3 lg:hidden">
          <div className="flex items-center">
            <MobileMenu navItems={navItems} />
          </div>
          <Link href="/" className="flex-shrink-0">
            <Logo loading="eager" priority="high" />
          </Link>
          <div className="flex items-center">
            <HeaderNav data={data} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-4">
          <Link href="/" className="flex-shrink-0">
            <Logo loading="eager" priority="high" />
          </Link>

          {navItems && navItems.length > 0 && (
            <nav className="relative flex items-center flex-1 gap-1">
              <Link
                href="/collection"
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400 whitespace-nowrap"
              >
                All Collections
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              {navItems.map((navItem, index) => (
                <MegaMenuItem key={index} navItem={navItem} />
              ))}
            </nav>
          )}

          <div className="flex items-center flex-shrink-0">
            <HeaderNav data={data} />
          </div>
        </div>
      </div>
    </header>
  )
}
"use client"

import React, { useState, useEffect } from 'react'
import { Filter, ArrowUpDown, X, Check } from 'lucide-react'
import { SortOptions } from '@modules/store/components/refinement-list/sort-products'

// Mobile Sort Modal Component
const MobileSortModal = ({
  isOpen,
  onClose,
  currentSort,
  onSortChange
}: {
  isOpen: boolean
  onClose: () => void
  currentSort: SortOptions
  onSortChange: (sort: SortOptions) => void
}) => {
  if (!isOpen) return null

  const sortOptions = [
    { value: 'created_at' as SortOptions, label: 'Latest', description: 'Newest products first' },
    { value: 'price_asc' as SortOptions, label: 'Price: Low to High', description: 'Cheapest first' },
    { value: 'price_desc' as SortOptions, label: 'Price: High to Low', description: 'Most expensive first' },
    { value: 'title_asc' as SortOptions, label: 'Name: A to Z', description: 'Alphabetical order' },
    { value: 'title_desc' as SortOptions, label: 'Name: Z to A', description: 'Reverse alphabetical' }
  ]

  const handleSortSelect = (sortValue: SortOptions) => {
    onSortChange(sortValue)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">SORT BY</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
              {currentSort === option.value && (
                <div className="flex-shrink-0 ml-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile Filter Modal Component  
const MobileFilterModal = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end px-4 py-1 mt-16 border-b border-gray-200 bg-white sticky top-0">
          {/* <h2 className="text-lg font-semibold text-gray-900">FILTERS</h2> */}
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom hook for scroll direction detection
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Only update direction if scroll difference is significant (reduces noise)
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past initial scroll threshold - hide bar
          setScrollDirection('down')
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show bar
          setScrollDirection('up')
        }
        setLastScrollY(currentScrollY)
      }

      // Hide the bar after 3 seconds of no scrolling when scrolled down
      if (currentScrollY > 100) {
        timeoutId = setTimeout(() => {
          setScrollDirection('down')
        }, 3000)
      }
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lastScrollY])

  return scrollDirection
}

// Main Mobile Store Wrapper Component
export default function MobileStoreWrapper({
  children,
  sortBy,
  hasActiveFilters,
  count,
  filterContent
}: {
  children: React.ReactNode
  sortBy: SortOptions
  hasActiveFilters: boolean
  count: number
  filterContent: React.ReactNode
}) {
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const scrollDirection = useScrollDirection()

  // Handle sort change
  const handleSortChange = (newSort: SortOptions) => {
    const params = new URLSearchParams(window.location.search)
    if (newSort === 'created_at') {
      params.delete('sortBy')
    } else {
      params.set('sortBy', newSort)
    }
    params.set('page', '1') // Reset to page 1 when sorting changes
    window.location.href = `${window.location.pathname}?${params.toString()}`
  }

  // Show bar when scrolling up or at top, hide when scrolling down
  const shouldShowBottomBar = scrollDirection === 'up' || scrollDirection === null

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        {/* Mobile Header */}
        {/* <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">All products</h1>
          <div className="mt-1 text-sm text-gray-600">
            {count > 0 ? (
              <span>{count} product{count !== 1 ? 's' : ''} found</span>
            ) : (
              <span>No products found</span>
            )}
          </div>
        </div> */}

        {/* Mobile Products Grid */}
        <div className="px-0 pb-20 mt-16">
          {children}
        </div>

        {/* Mobile Bottom Sort & Filter Bar */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            shouldShowBottomBar ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex h-12">
            <button
              onClick={() => setIsSortModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-r border-gray-200"
            >
              <ArrowUpDown size={18} />
              <span className="font-medium">SORT</span>
            </button>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors relative"
            >
              <Filter size={18} />
              <span className="font-medium">FILTER</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          {/* {count > 0 && (
            <div className="bg-gray-50 py-1 text-center">
              <span className="text-xs text-gray-600">
                {count.toLocaleString()} products
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* Desktop View - Show children as-is */}
      <div className="hidden md:block">
        {children}
      </div>

      {/* Mobile Sort Modal */}
      <MobileSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        currentSort={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        {filterContent}
      </MobileFilterModal>
    </>
  )
}
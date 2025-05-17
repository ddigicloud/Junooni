// @modules/store/components/mobile-filter-toggle/index.tsx
"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "../refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type MobileFilterToggleProps = {
  sortBy: SortOptions
  vendors?: any[]
  products?: HttpTypes.StoreProduct[]
  currentCategory?: HttpTypes.StoreProductCategory
  subcategories?: HttpTypes.StoreProductCategory[]
  isCollectionPage?: boolean
}

const MobileFilterToggle = ({
  sortBy,
  vendors = [],
  products = [],
  currentCategory,
  subcategories = [],
  isCollectionPage = false
}: MobileFilterToggleProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (name === "showMobileFilters") {
        if (value === "true") {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      }
      
      return params.toString()
    },
    [searchParams]
  )
  
  const toggleFilters = () => {
    const show = !open
    setOpen(show)
    const query = createQueryString("showMobileFilters", show ? "true" : "false")
    router.push(`${pathname}?${query}`, { scroll: false })
  }
  
  return (
    <div>
      <button
        onClick={toggleFilters}
        className="w-full flex items-center justify-center space-x-2 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Filter &amp; Sort</span>
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
            <h2 className="text-lg font-semibold">Filters &amp; Sort</h2>
            <button 
              onClick={toggleFilters}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <RefinementList
              sortBy={sortBy}
              vendors={vendors}
              products={products}
              currentCategory={currentCategory}
              subcategories={subcategories}
              isCollectionPage={isCollectionPage}
            />
          </div>
          
          <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={toggleFilters}
              className="w-full py-3 bg-pink-600 text-white rounded-md font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileFilterToggle
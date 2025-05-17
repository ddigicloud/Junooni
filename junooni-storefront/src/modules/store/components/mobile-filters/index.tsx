"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import RefinementList from "@modules/store/components/refinement-list"

type MobileFiltersProps = {
  sortBy: string
  categories?: any[]
  vendors?: any[]
  products?: any[]
  currentCategory?: any
  subcategories?: any[]
  isCollectionPage: boolean
}

const MobileFilters = ({
  sortBy,
  categories,
  vendors,
  products,
  currentCategory,
  subcategories,
  isCollectionPage
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const showMobileFilters = searchParams.get("showMobileFilters") === "true"
  
  // Close modal when clicking escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeMobileFilters()
      }
    }
    
    if (showMobileFilters) {
      document.addEventListener("keydown", handleEsc)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [showMobileFilters])
  
  const closeMobileFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("showMobileFilters")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  if (!showMobileFilters) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-900 uppercase text-base">FILTERS</h2>
          <button
            onClick={closeMobileFilters}
            className="p-2"
            aria-label="Close filters"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto px-4">
          {isCollectionPage ? (
            <RefinementList
              sortBy={sortBy}
              categories={categories}
              vendors={vendors}
              products={products}
              isCollectionPage={true}
            />
          ) : (
            <RefinementList
              sortBy={sortBy}
              vendors={vendors}
              products={products}
              currentCategory={currentCategory}
              subcategories={subcategories}
              isCollectionPage={false}
            />
          )}
        </div>
        
        <div className="p-4 border-t flex gap-3">
          <button
            className="flex-1 py-3 px-4 border border-gray-300 bg-white text-gray-700 rounded-sm font-medium"
            onClick={closeMobileFilters}
          >
            CANCEL
          </button>
          <button
            className="flex-1 py-3 px-4 bg-pink-500 text-white rounded-sm font-medium"
            onClick={closeMobileFilters}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileFilters
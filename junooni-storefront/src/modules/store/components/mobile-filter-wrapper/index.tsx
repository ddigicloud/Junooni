// components/MobileFilterWrapper.jsx
"use client"

import { useState, useEffect } from "react"
import MobileFilters from "@modules/store/components/mobile-filters"

export default function MobileFilterWrapper({ 
  children,
  sortBy,
  categories = [],
  subcategories = [],
  vendors = [],
  products = [],
  categoryId = "",
  selectedVendors = [],
  selectedColors = [],
  minPrice = 0,
  maxPrice = 1000,
  setQueryParams,
  clearAllFilters,
  isCollectionPage
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  
  // Add event listener for mobile filter toggle
  useEffect(() => {
    const toggleButton = document.getElementById('mobile-filters-toggle')
    
    if (toggleButton) {
      const handleClick = () => {
        setIsMobileFiltersOpen(true)
      }
      
      toggleButton.addEventListener('click', handleClick)
      
      return () => {
        toggleButton.removeEventListener('click', handleClick)
      }
    }
  }, [])
  
  return (
    <>
      {children}
      
      <MobileFilters 
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        sortBy={sortBy}
        categories={categories}
        subcategories={subcategories}
        vendors={vendors}
        products={products}
        categoryId={categoryId}
        selectedVendors={selectedVendors}
        selectedColors={selectedColors}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setQueryParams={setQueryParams}
        clearAllFilters={clearAllFilters}
        isCollectionPage={isCollectionPage}
      />
    </>
  )
}
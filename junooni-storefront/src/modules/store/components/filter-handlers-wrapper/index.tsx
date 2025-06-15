"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
import { X } from "lucide-react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type Vendor = {
  id: string;
  name: string;
  handle: string;
}

type Collection = {
  id: string;
  title: string;
  handle: string;
}

type Category = {
  id: string;
  name: string;
  handle: string;
}

type FilterHandlersWrapperProps = {
  sortBy?: SortOptions
  page?: number
  categoryId?: string
  countryCode?: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  products?: any[]
  totalCount?: number
  totalPages?: number
  region?: HttpTypes.StoreRegion
  vendorsData?: Vendor[]
  collectionsData?: Collection[]
  categoriesData?: Category[]
  availableColors?: Array<{ name: string; hex: string }> // ✅ Available colors for filter
  selectedColors?: string[] // ✅ Selected colors for image selection
}

export default function FilterHandlersWrapper({
  sortBy = "created_at",
  page = 1,
  categoryId = "",
  countryCode = "",
  vendors: initialVendors = [],
  colors: initialColors = [],
  collections: initialCollections = [],
  categories: initialCategories = [],
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  products = [],
  totalCount = 0,
  totalPages = 1,
  region,
  vendorsData = [],
  collectionsData = [],
  categoriesData = [],
  availableColors = [], // ✅ Available colors
  selectedColors = [] // ✅ Selected colors
}: FilterHandlersWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State to track current filters from URL params
  const [currentVendors, setCurrentVendors] = useState<string[]>(initialVendors)
  const [currentColors, setCurrentColors] = useState<string[]>(initialColors)
  const [currentCollections, setCurrentCollections] = useState<string[]>(initialCollections)
  const [currentCategories, setCurrentCategories] = useState<string[]>(initialCategories)
  const [currentMinPrice, setCurrentMinPrice] = useState<number | undefined>(initialMinPrice)
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number | undefined>(initialMaxPrice)

  // Update state when URL params change
  useEffect(() => {
    const vendorsParam = searchParams?.get('vendors')
    const colorsParam = searchParams?.get('colors')
    const collectionsParam = searchParams?.get('collections')
    const categoriesParam = searchParams?.get('categories')
    const priceParam = searchParams?.get('price')

    setCurrentVendors(vendorsParam ? vendorsParam.split(',') : [])
    setCurrentColors(colorsParam ? colorsParam.split(',') : [])
    setCurrentCollections(collectionsParam ? collectionsParam.split(',') : [])
    setCurrentCategories(categoriesParam ? categoriesParam.split(',') : [])

    if (priceParam) {
      const [min, max] = priceParam.split('-').map(p => parseInt(p, 10))
      setCurrentMinPrice(min)
      setCurrentMaxPrice(max)
    } else {
      setCurrentMinPrice(undefined)
      setCurrentMaxPrice(undefined)
    }
  }, [searchParams])

  console.log('🔧 FilterHandlersWrapper received:')
  console.log('- products length:', products?.length || 0)
  console.log('- totalCount:', totalCount)
  console.log('- totalPages:', totalPages)
  console.log('- region:', region?.id || 'No region')
  console.log('- currentVendors (handles):', currentVendors)
  console.log('- currentCollections (handles):', currentCollections)
  console.log('- currentCategories (handles):', currentCategories)
  console.log('- currentColors:', currentColors)
  console.log('- selectedColors for image selection:', selectedColors) // ✅ Log selected colors
  console.log('- availableColors for filters:', availableColors.length) // ✅ Log available colors
  console.log('- vendorsData for mapping:', vendorsData.length)
  console.log('- collectionsData for mapping:', collectionsData.length)
  console.log('- categoriesData for mapping:', categoriesData.length)

  // ✅ Color name normalizer (same as ColorFilter)
  const normalizeColorName = useCallback((colorName: string): string => {
    return colorName
      .trim()
      // Handle various patterns
      .replace(/([a-z])([A-Z])/g, '$1 $2')           // "lightPink" → "light Pink"
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')      // "HTMLParser" → "HTML Parser"  
      .replace(/([a-z])(\d)/g, '$1 $2')              // "red2" → "red 2"
      .replace(/(\d)([a-z])/gi, '$1 $2')             // "2red" → "2 red"
      // Handle concatenated color words
      .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
      .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
      // Normalize spaces
      .replace(/\s+/g, ' ')
      // Proper case
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [])

  // ✅ NEW: Get color hex value for display
  const getColorHex = useCallback((colorName: string): string => {
    if (!availableColors || availableColors.length === 0) {
      return '#6b7280'; // Default gray if no colors available
    }
    
    const normalizedInput = normalizeColorName(colorName).toLowerCase().trim();
    
    // Find exact matching color in availableColors
    const matchingColor = availableColors.find(color => 
      normalizeColorName(color.name).toLowerCase().trim() === normalizedInput
    );
    
    if (matchingColor && matchingColor.hex) {
      // Ensure hex starts with #
      let hex = matchingColor.hex.trim();
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }
      return hex;
    }
    
    // Fallback: try to match partial names
    const partialMatch = availableColors.find(color =>
      normalizeColorName(color.name).toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(normalizeColorName(color.name).toLowerCase())
    );
    
    if (partialMatch && partialMatch.hex) {
      let hex = partialMatch.hex.trim();
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }
      return hex;
    }
    
    // Ultimate fallback colors for common color names
    const fallbackColors = {
      'red': '#ef4444',
      'blue': '#3b82f6', 
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'orange': '#f97316',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'brown': '#92400e',
      'cyan': '#06b6d4',
      'indigo': '#6366f1',
      'lime': '#65a30d',
      'emerald': '#059669',
      'teal': '#0d9488',
      'sky': '#0ea5e9',
      'violet': '#7c3aed',
      'fuchsia': '#d946ef',
      'rose': '#f43f5e',
      'amber': '#f59e0b',
      'slate': '#64748b'
    };
    
    const fallbackKey = normalizedInput.split(' ').find(word => 
      fallbackColors[word as keyof typeof fallbackColors]
    );
    
    return fallbackKey ? fallbackColors[fallbackKey as keyof typeof fallbackColors] : '#6b7280';
  }, [availableColors, normalizeColorName]);

  // Map vendor handles to display names
  const getVendorDisplayName = useCallback((vendorHandle: string): string => {
    const vendor = vendorsData.find(v => v.handle === vendorHandle)
    if (vendor) {
      console.log(`📍 Mapped vendor handle "${vendorHandle}" → name "${vendor.name}"`)
      return vendor.name
    }
    console.warn(`⚠️ Vendor handle "${vendorHandle}" not found in vendorsData`)
    return formatDisplayName(vendorHandle)
  }, [vendorsData])

  // Map collection handles to display names
  const getCollectionDisplayName = useCallback((collectionHandle: string): string => {
    const collection = collectionsData.find(c => c.handle === collectionHandle)
    if (collection) {
      console.log(`📍 Mapped collection handle "${collectionHandle}" → title "${collection.title}"`)
      return collection.title
    }
    console.warn(`⚠️ Collection handle "${collectionHandle}" not found in collectionsData`)
    return formatDisplayName(collectionHandle)
  }, [collectionsData])

  // Map category handles to display names
  const getCategoryDisplayName = useCallback((categoryHandle: string): string => {
    const category = categoriesData.find(c => c.handle === categoryHandle)
    if (category) {
      console.log(`📍 Mapped category handle "${categoryHandle}" → name "${category.name}"`)
      return category.name
    }
    console.warn(`⚠️ Category handle "${categoryHandle}" not found in categoriesData`)
    return formatDisplayName(categoryHandle)
  }, [categoriesData])

  // Helper function to convert URL-safe names back to readable format
  const formatDisplayName = useCallback((name: string): string => {
    if (!name) return name

    const compoundWordMappings: { [key: string]: string } = {
      'latestdrops': 'Latest Drops',
      'newarrival': 'New Arrival',
      'newarrivals': 'New Arrivals',
      'bestseller': 'Best Seller',
      'bestsellers': 'Best Sellers',
      'hotdeals': 'Hot Deals',
      'summervibes': 'Summer Vibes',
      'winterwear': 'Winter Wear',
      'springfashion': 'Spring Fashion',
      'fallfashion': 'Fall Fashion',
      'menswear': 'Mens Wear',
      'womenswear': 'Womens Wear',
      'kidswear': 'Kids Wear',
      'sportswear': 'Sports Wear',
      'activewear': 'Active Wear',
      'streetwear': 'Street Wear',
      'formalwear': 'Formal Wear',
      'casualwear': 'Casual Wear',
      'workwear': 'Work Wear',
      'nightwear': 'Night Wear',
      'swimwear': 'Swim Wear',
      'footwear': 'Foot Wear',
      'handbags': 'Hand Bags',
      'sunglasses': 'Sun Glasses',
      'smartwatch': 'Smart Watch',
      'smartphone': 'Smart Phone',
      'headphones': 'Head Phones',
      'backpack': 'Back Pack',
      'backpacks': 'Back Packs',
      'crossbody': 'Cross Body',
      'tshirt': 'T Shirt',
      'tshirts': 'T Shirts',
      'polo': 'Polo',
      'polos': 'Polos'
    }
    
    const lowerName = name.toLowerCase()
    if (compoundWordMappings[lowerName]) {
      return compoundWordMappings[lowerName]
    }
    
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([0-9])([A-Z])/g, '$1 $2')
      .replace(/([a-z])(wear|drops|deals|vibes|bags|glasses|phone|watch|pack|shirt|body)$/i, '$1 $2')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  // ✅ Professional UX - Create query string helper with page reset
  const createQueryStringWithPageReset = useCallback(
    (name: string, value: string, resetPage = true) => {
      const params = new URLSearchParams(searchParams?.toString() || "")
      
      if (value === "") {
        params.delete(name)
      } else {
        params.set(name, value)
      }

      // ✅ PROFESSIONAL UX: Reset to page 1 when filters change
      if (resetPage && name !== 'page') {
        params.set('page', '1')
        console.log(`🔄 PROFESSIONAL UX: Resetting to page 1 due to filter change: ${name}`)
      }

      return params.toString()
    },
    [searchParams]
  )

  // Create query string helper (existing - for non-filter changes)
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "")
      
      if (value === "") {
        params.delete(name)
      } else {
        params.set(name, value)
      }

      return params.toString()
    },
    [searchParams]
  )

  // ✅ Set query params helper with page reset
  const setQueryParamsWithPageReset = useCallback((name: string, value: string, resetPage = true) => {
    const query = createQueryStringWithPageReset(name, value, resetPage)
    router.push(`${pathname}?${query}`, { scroll: false })
  }, [createQueryStringWithPageReset, router, pathname])

  // Set query params helper (existing - for non-filter changes)
  const setQueryParams = useCallback((name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }, [createQueryString, router, pathname])

  // ✅ Handler functions with page reset for professional UX
  const handleRemoveVendor = useCallback((vendorToRemove: string) => {
    console.log(`🗑️ Removing vendor handle: "${vendorToRemove}"`)
    const newVendors = currentVendors.filter(v => v !== vendorToRemove)
    console.log(`🗑️ New vendors array:`, newVendors)
    // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
    setQueryParamsWithPageReset("vendors", newVendors.join(","))
  }, [currentVendors, setQueryParamsWithPageReset])

  const handleRemoveCollection = useCallback((collectionToRemove: string) => {
    console.log(`🗑️ Removing collection handle: "${collectionToRemove}"`)
    const newCollections = currentCollections.filter(c => c !== collectionToRemove)
    console.log(`🗑️ New collections array:`, newCollections)
    // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
    setQueryParamsWithPageReset("collections", newCollections.join(","))
  }, [currentCollections, setQueryParamsWithPageReset])

  // ✅ Handler for removing categories with page reset
  const handleRemoveCategory = useCallback((categoryToRemove: string) => {
    console.log(`🗑️ Removing category handle: "${categoryToRemove}"`)
    const newCategories = currentCategories.filter(c => c !== categoryToRemove)
    console.log(`🗑️ New categories array:`, newCategories)
    // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
    setQueryParamsWithPageReset("categories", newCategories.join(","))
  }, [currentCategories, setQueryParamsWithPageReset])

  const handleRemoveColor = useCallback((colorToRemove: string) => {
    console.log(`🎨 Removing color: "${colorToRemove}" - This will affect image selection`)
    const newColors = currentColors.filter(c => c !== colorToRemove)
    // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
    setQueryParamsWithPageReset("colors", newColors.join(","))
  }, [currentColors, setQueryParamsWithPageReset])

  const handleRemovePriceFilter = useCallback(() => {
    // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
    setQueryParamsWithPageReset("price", "")
  }, [setQueryParamsWithPageReset])

  // ✅ Clear all filters and go to page 1
  const handleClearAllFilters = useCallback(() => {
    console.log('🔄 PROFESSIONAL UX: Clearing all filters and going to page 1')
    // Navigate to clean URL with only page=1
    router.push(`${pathname}?page=1`, { scroll: false })
  }, [router, pathname])

  // Check for active filters using current state
  const hasActiveFilters = (currentVendors && currentVendors.length > 0) || 
                          (currentColors && currentColors.length > 0) || 
                          (currentCollections && currentCollections.length > 0) ||
                          (currentCategories && currentCategories.length > 0) ||
                          (currentMinPrice !== undefined || currentMaxPrice !== undefined)

  // ✅ Determine which colors to pass for image selection
  const colorsForImageSelection = selectedColors.length > 0 ? selectedColors : currentColors
  
  console.log('🎨 COLOR SELECTION LOGIC:')
  console.log('- selectedColors prop:', selectedColors)
  console.log('- currentColors from URL:', currentColors) 
  console.log('- colorsForImageSelection (final):', colorsForImageSelection)

  return (
    <div className="w-full">
      {/* Applied Filter Pills */}
      {hasActiveFilters && (
        <div className="p-4 mb-6 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Applied Filters:</h3>
            {/* ✅ Clear All Filters Button */}
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-[#e65100] hover:text-[#e65100]"
            >
              Clear All Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            
            {/* ✅ Individual Category Pills */}
            {currentCategories && currentCategories.length > 0 && currentCategories.map((categoryHandle) => (
              <div key={`category-${categoryHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCategoryDisplayName(categoryHandle)}</span>
                <button 
                  onClick={() => handleRemoveCategory(categoryHandle)}
                  className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
                  title={`Remove ${getCategoryDisplayName(categoryHandle)}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Individual Collection Pills */}
            {currentCollections && currentCollections.length > 0 && currentCollections.map((collectionHandle) => (
              <div key={`collection-${collectionHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCollectionDisplayName(collectionHandle)}</span>
                <button 
                  onClick={() => handleRemoveCollection(collectionHandle)}
                  className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
                  title={`Remove ${getCollectionDisplayName(collectionHandle)}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Individual Vendor Pills - Display names, remove by handles */}
            {currentVendors && currentVendors.length > 0 && currentVendors.map((vendorHandle) => (
              <div key={`vendor-${vendorHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getVendorDisplayName(vendorHandle)}</span>
                <button 
                  onClick={() => handleRemoveVendor(vendorHandle)}
                  className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
                  title={`Remove ${getVendorDisplayName(vendorHandle)}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* ✅ ENHANCED: Individual Color Pills with actual color circles */}
            {currentColors && currentColors.length > 0 && currentColors.map((color) => {
              const colorHex = getColorHex(color);
              
              return (
                <div key={`color-${color}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                  <span className="capitalize">
                    {normalizeColorName(color)}
                  </span>
                  {/* ✅ ENHANCED: Real color circle that matches the actual color */}
                  <div 
                    className="flex-shrink-0 w-4 h-4 border border-gray-300 rounded-full shadow-sm"
                    style={{ backgroundColor: colorHex }}
                    title={`Color: ${normalizeColorName(color)} (${colorHex}) - Images showing this variant`}
                  />
                  <button 
                    onClick={() => handleRemoveColor(color)}
                    className="flex items-center justify-center w-4 h-4 text-gray-400 transition-colors hover:text-gray-600"
                    title={`Remove ${normalizeColorName(color)} (will change product images)`}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}

            {/* Price Range Pills */}
            {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
              <div className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span>
                  Price: ${currentMinPrice || 0} - ${currentMaxPrice || 1000}
                </span>
                <button 
                  onClick={() => handleRemovePriceFilter()}
                  className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
                  title="Remove price filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          
          {/* ✅ ENHANCED: Color selection info with visual indicators */}
          {/* {colorsForImageSelection.length > 0 && (
            <div className="mt-3 text-xs text-[#e65100] bg-orange-50 rounded px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1">
                {colorsForImageSelection.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 border border-orange-300 rounded-full"
                    style={{ backgroundColor: getColorHex(color) }}
                    title={normalizeColorName(color)}
                  />
                ))}
                {colorsForImageSelection.length > 3 && (
                  <span className="text-orange-600">+{colorsForImageSelection.length - 3}</span>
                )}
              </div>
              <span>
                Product images are showing the <strong>{colorsForImageSelection.join(', ')}</strong> variant{colorsForImageSelection.length > 1 ? 's' : ''} when available
              </span>
            </div>
          )} */}
        </div>
      )}

      {/* ✅ Products Display - Pass selected colors for image selection */}
      <PaginatedProductsDisplay
        products={products}
        totalCount={totalCount}
        currentPage={page}
        totalPages={totalPages}
        region={region}
        selectedColors={colorsForImageSelection} // ✅ CRITICAL: Pass selected colors for ProductPreview
      />
    </div>
  )
}
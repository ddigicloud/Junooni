// "use client"

// import { useRouter, useSearchParams, usePathname } from "next/navigation"
// import { useCallback, useEffect, useState,  useTransition } from "react"
// import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
// import { X } from "lucide-react"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import { HttpTypes } from "@medusajs/types"

// type Vendor = {
//   id: string;
//   name: string;
//   handle: string;
// }

// type Collection = {
//   id: string;
//   title: string;
//   handle: string;
// }

// type Category = {
//   id: string;
//   name: string;
//   handle: string;
// }

// type FilterHandlersWrapperProps = {
//   sortBy?: SortOptions
//   page?: number
//   categoryId?: string
//   countryCode?: string
//   vendors?: string[]
//   colors?: string[]
//   collections?: string[]
//   categories?: string[]
//   dynamicPriceRange?: { minPrice: number, maxPrice: number }
//   minPrice?: number
//   maxPrice?: number
//   products?: any[]
//   totalCount?: number
//   totalPages?: number
//   region?: HttpTypes.StoreRegion
//   vendorsData?: Vendor[]
//   collectionsData?: Collection[]
//   categoriesData?: Category[]
//   availableColors?: Array<{ name: string; hex: string }> // ✅ Available colors for filter
//   selectedColors?: string[] // ✅ Selected colors for image selection
// }

// export default function FilterHandlersWrapper({
//   sortBy = "created_at",
//   page = 1,
//   categoryId = "",
//   countryCode = "",
//   vendors: initialVendors = [],
//   colors: initialColors = [],
//   collections: initialCollections = [],
//   categories: initialCategories = [],
//   dynamicPriceRange = { minPrice: 0, maxPrice: 1000 },
//   minPrice: initialMinPrice,
//   maxPrice: initialMaxPrice,
//   products = [],
//   totalCount = 0,
//   totalPages = 1,
//   region,
//   vendorsData = [],
//   collectionsData = [],
//   categoriesData = [],
//   availableColors = [], // ✅ Available colors
//   selectedColors = [] // ✅ Selected colors
// }: FilterHandlersWrapperProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()

//   // State to track current filters from URL params
//   const [currentVendors, setCurrentVendors] = useState<string[]>(initialVendors)
//   const [currentColors, setCurrentColors] = useState<string[]>(initialColors)
//   const [currentCollections, setCurrentCollections] = useState<string[]>(initialCollections)
//   const [currentCategories, setCurrentCategories] = useState<string[]>(initialCategories)
//   const [currentMinPrice, setCurrentMinPrice] = useState<number | undefined>(initialMinPrice)
//   const [currentMaxPrice, setCurrentMaxPrice] = useState<number | undefined>(initialMaxPrice)
//   const [isPending, startTransition] = useTransition()

//   // Update state when URL params change
//   useEffect(() => {
//     const vendorsParam = searchParams?.get('vendors')
//     const colorsParam = searchParams?.get('colors')
//     const collectionsParam = searchParams?.get('collections')
//     const categoriesParam = searchParams?.get('categories')
//     const priceParam = searchParams?.get('price')

//     setCurrentVendors(vendorsParam ? vendorsParam.split(',') : [])
//     setCurrentColors(colorsParam ? colorsParam.split(',') : [])
//     setCurrentCollections(collectionsParam ? collectionsParam.split(',') : [])
//     setCurrentCategories(categoriesParam ? categoriesParam.split(',') : [])

//     if (priceParam) {
//       const [min, max] = priceParam.split('-').map(p => parseInt(p, 10))
//       setCurrentMinPrice(min)
//       setCurrentMaxPrice(max)
//     } else {
//       setCurrentMinPrice(undefined)
//       setCurrentMaxPrice(undefined)
//     }
//   }, [searchParams])

//   // ✅ Color name normalizer (same as ColorFilter)
//   const normalizeColorName = useCallback((colorName: string): string => {
//     return colorName
//       .trim()
//       // Handle various patterns
//       .replace(/([a-z])([A-Z])/g, '$1 $2')           // "lightPink" → "light Pink"
//       .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')      // "HTMLParser" → "HTML Parser"  
//       .replace(/([a-z])(\d)/g, '$1 $2')              // "red2" → "red 2"
//       .replace(/(\d)([a-z])/gi, '$1 $2')             // "2red" → "2 red"
//       // Handle concatenated color words
//       .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
//       .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
//       // Normalize spaces
//       .replace(/\s+/g, ' ')
//       // Proper case
//       .toLowerCase()
//       .split(' ')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   }, [])

//   // ✅ NEW: Get color hex value for display
//   const getColorHex = useCallback((colorName: string): string => {
//     if (!availableColors || availableColors.length === 0) {
//       return '#6b7280'; // Default gray if no colors available
//     }
    
//     const normalizedInput = normalizeColorName(colorName).toLowerCase().trim();
    
//     // Find exact matching color in availableColors
//     const matchingColor = availableColors.find(color => 
//       normalizeColorName(color.name).toLowerCase().trim() === normalizedInput
//     );
    
//     if (matchingColor && matchingColor.hex) {
//       // Ensure hex starts with #
//       let hex = matchingColor.hex.trim();
//       if (!hex.startsWith('#')) {
//         hex = '#' + hex;
//       }
//       return hex;
//     }
    
//     // Fallback: try to match partial names
//     const partialMatch = availableColors.find(color =>
//       normalizeColorName(color.name).toLowerCase().includes(normalizedInput) ||
//       normalizedInput.includes(normalizeColorName(color.name).toLowerCase())
//     );
    
//     if (partialMatch && partialMatch.hex) {
//       let hex = partialMatch.hex.trim();
//       if (!hex.startsWith('#')) {
//         hex = '#' + hex;
//       }
//       return hex;
//     }
    
//     // Ultimate fallback colors for common color names
//     const fallbackColors = {
//       'red': '#ef4444',
//       'blue': '#3b82f6', 
//       'green': '#10b981',
//       'yellow': '#f59e0b',
//       'purple': '#8b5cf6',
//       'pink': '#ec4899',
//       'orange': '#f97316',
//       'black': '#000000',
//       'white': '#ffffff',
//       'gray': '#6b7280',
//       'grey': '#6b7280',
//       'brown': '#92400e',
//       'cyan': '#06b6d4',
//       'indigo': '#6366f1',
//       'lime': '#65a30d',
//       'emerald': '#059669',
//       'teal': '#0d9488',
//       'sky': '#0ea5e9',
//       'violet': '#7c3aed',
//       'fuchsia': '#d946ef',
//       'rose': '#f43f5e',
//       'amber': '#f59e0b',
//       'slate': '#64748b'
//     };
    
//     const fallbackKey = normalizedInput.split(' ').find(word => 
//       fallbackColors[word as keyof typeof fallbackColors]
//     );
    
//     return fallbackKey ? fallbackColors[fallbackKey as keyof typeof fallbackColors] : '#6b7280';
//   }, [availableColors, normalizeColorName]);

//   // Map vendor handles to display names
//   const getVendorDisplayName = useCallback((vendorHandle: string): string => {
//     const vendor = vendorsData.find(v => v.handle === vendorHandle)
//     if (vendor) {
//       //console.log(`📍 Mapped vendor handle "${vendorHandle}" → name "${vendor.name}"`)
//       return vendor.name
//     }
//     //console.warn(`⚠️ Vendor handle "${vendorHandle}" not found in vendorsData`)
//     return formatDisplayName(vendorHandle)
//   }, [vendorsData])

//   // Map collection handles to display names
//   const getCollectionDisplayName = useCallback((collectionHandle: string): string => {
//     const collection = collectionsData.find(c => c.handle === collectionHandle)
//     if (collection) {
//       //console.log(`📍 Mapped collection handle "${collectionHandle}" → title "${collection.title}"`)
//       return collection.title
//     }
//     //console.warn(`⚠️ Collection handle "${collectionHandle}" not found in collectionsData`)
//     return formatDisplayName(collectionHandle)
//   }, [collectionsData])

//   // Map category handles to display names
//   const getCategoryDisplayName = useCallback((categoryHandle: string): string => {
//     const category = categoriesData.find(c => c.handle === categoryHandle)
//     if (category) {
//       //console.log(`📍 Mapped category handle "${categoryHandle}" → name "${category.name}"`)
//       return category.name
//     }
//     //console.warn(`⚠️ Category handle "${categoryHandle}" not found in categoriesData`)
//     return formatDisplayName(categoryHandle)
//   }, [categoriesData])

//   // Helper function to convert URL-safe names back to readable format
//   const formatDisplayName = useCallback((name: string): string => {
//     if (!name) return name

//     const compoundWordMappings: { [key: string]: string } = {
//       'latestdrops': 'Latest Drops',
//       'newarrival': 'New Arrival',
//       'newarrivals': 'New Arrivals',
//       'bestseller': 'Best Seller',
//       'bestsellers': 'Best Sellers',
//       'hotdeals': 'Hot Deals',
//       'summervibes': 'Summer Vibes',
//       'winterwear': 'Winter Wear',
//       'springfashion': 'Spring Fashion',
//       'fallfashion': 'Fall Fashion',
//       'menswear': 'Mens Wear',
//       'womenswear': 'Womens Wear',
//       'kidswear': 'Kids Wear',
//       'sportswear': 'Sports Wear',
//       'activewear': 'Active Wear',
//       'streetwear': 'Street Wear',
//       'formalwear': 'Formal Wear',
//       'casualwear': 'Casual Wear',
//       'workwear': 'Work Wear',
//       'nightwear': 'Night Wear',
//       'swimwear': 'Swim Wear',
//       'footwear': 'Foot Wear',
//       'handbags': 'Hand Bags',
//       'sunglasses': 'Sun Glasses',
//       'smartwatch': 'Smart Watch',
//       'smartphone': 'Smart Phone',
//       'headphones': 'Head Phones',
//       'backpack': 'Back Pack',
//       'backpacks': 'Back Packs',
//       'crossbody': 'Cross Body',
//       'tshirt': 'T Shirt',
//       'tshirts': 'T Shirts',
//       'polo': 'Polo',
//       'polos': 'Polos'
//     }
    
//     const lowerName = name.toLowerCase()
//     if (compoundWordMappings[lowerName]) {
//       return compoundWordMappings[lowerName]
//     }
    
//     return name
//       .replace(/[-_]/g, ' ')
//       .replace(/([a-z])([A-Z])/g, '$1 $2')
//       .replace(/([0-9])([A-Z])/g, '$1 $2')
//       .replace(/([a-z])(wear|drops|deals|vibes|bags|glasses|phone|watch|pack|shirt|body)$/i, '$1 $2')
//       .toLowerCase()
//       .split(' ')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ')
//   }, [])

//   // ✅ Professional UX - Create query string helper with page reset
//   const createQueryStringWithPageReset = useCallback(
//     (name: string, value: string, resetPage = true) => {
//       const params = new URLSearchParams(searchParams?.toString() || "")
      
//       if (value === "") {
//         params.delete(name)
//       } else {
//         params.set(name, value)
//       }

//       // ✅ PROFESSIONAL UX: Reset to page 1 when filters change
//       if (resetPage && name !== 'page') {
//         params.set('page', '1')
//         //console.log(`🔄 PROFESSIONAL UX: Resetting to page 1 due to filter change: ${name}`)
//       }

//       return params.toString()
//     },
//     [searchParams]
//   )

//   // Create query string helper (existing - for non-filter changes)
//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams?.toString() || "")
      
//       if (value === "") {
//         params.delete(name)
//       } else {
//         params.set(name, value)
//       }

//       return params.toString()
//     },
//     [searchParams]
//   )

//   // ✅ Set query params helper with page reset
//  const setQueryParamsWithPageReset = useCallback((name: string, value: string, resetPage = true) => {
//   const query = createQueryStringWithPageReset(name, value, resetPage)
//   startTransition(() => {
//     router.push(`${pathname}?${query}`, { scroll: false })
//   })
// }, [createQueryStringWithPageReset, router, pathname])

  
//    const setQueryParamsForPrice = useCallback((name: string, value: string) => {
//   const query = createQueryStringWithPageReset(name, value, true)
//   startTransition(() => {
//     router.push(`${pathname}?${query}`, { scroll: false })
//   })
// }, [createQueryStringWithPageReset, router, pathname])

//   // Set query params helper (existing - for non-filter changes)
//   const setQueryParams = useCallback((name: string, value: string) => {
//   const query = createQueryString(name, value)
//   startTransition(() => {
//     router.push(`${pathname}?${query}`, { scroll: false })
//   })
// }, [createQueryString, router, pathname])
//   // ✅ Handler functions with page reset for professional UX
//   const handleRemoveVendor = useCallback((vendorToRemove: string) => {
//     //console.log(`🗑️ Removing vendor handle: "${vendorToRemove}"`)
//     const newVendors = currentVendors.filter(v => v !== vendorToRemove)
//     //console.log(`🗑️ New vendors array:`, newVendors)
//     // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
//     setQueryParamsWithPageReset("vendors", newVendors.join(","))
//   }, [currentVendors, setQueryParamsWithPageReset])

//   const handleRemoveCollection = useCallback((collectionToRemove: string) => {
//     //console.log(`🗑️ Removing collection handle: "${collectionToRemove}"`)
//     const newCollections = currentCollections.filter(c => c !== collectionToRemove)
//     //console.log(`🗑️ New collections array:`, newCollections)
//     // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
//     setQueryParamsWithPageReset("collections", newCollections.join(","))
//   }, [currentCollections, setQueryParamsWithPageReset])

//   // ✅ Handler for removing categories with page reset
//   const handleRemoveCategory = useCallback((categoryToRemove: string) => {
//     //console.log(`🗑️ Removing category handle: "${categoryToRemove}"`)
//     const newCategories = currentCategories.filter(c => c !== categoryToRemove)
//     //console.log(`🗑️ New categories array:`, newCategories)
//     // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
//     setQueryParamsWithPageReset("categories", newCategories.join(","))
//   }, [currentCategories, setQueryParamsWithPageReset])

//   const handleRemoveColor = useCallback((colorToRemove: string) => {
//     //console.log(`🎨 Removing color: "${colorToRemove}" - This will affect image selection`)
//     const newColors = currentColors.filter(c => c !== colorToRemove)
//     // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
//     setQueryParamsWithPageReset("colors", newColors.join(","))
//   }, [currentColors, setQueryParamsWithPageReset])

//   const handleRemovePriceFilter = useCallback(() => {
//     // ✅ PROFESSIONAL UX: Reset to page 1 when filter changes
//     setQueryParamsWithPageReset("price", "")
//   }, [setQueryParamsWithPageReset])

//   // ✅ Clear all filters and go to page 1
//   const handleClearAllFilters = useCallback(() => {
//   startTransition(() => {
//     router.push(`${pathname}?page=1`, { scroll: false })
//   })
// }, [router, pathname])

//   // Check for active filters using current state
//   const hasActiveFilters = (currentVendors && currentVendors.length > 0) || 
//                           (currentColors && currentColors.length > 0) || 
//                           (currentCollections && currentCollections.length > 0) ||
//                           (currentCategories && currentCategories.length > 0) ||
//                           (currentMinPrice !== undefined || currentMaxPrice !== undefined)

//   // ✅ Determine which colors to pass for image selection
//   const colorsForImageSelection = selectedColors.length > 0 ? selectedColors : currentColors

//   return (
//     <div className="w-full">
//       {/* Applied Filter Pills */}
//       {hasActiveFilters && (
//         <div className="p-4 mb-6 rounded-lg bg-gray-50">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-medium">Applied Filters:</h3>
//             {/* ✅ Clear All Filters Button */}
//             <button
//               onClick={handleClearAllFilters}
//               className="text-xs text-[#e65100] hover:text-[#e65100]"
//             >
//               Clear All Filters
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
            
//             {/* ✅ Individual Category Pills */}
//             {currentCategories && currentCategories.length > 0 && currentCategories.map((categoryHandle) => (
//               <div key={`category-${categoryHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
//                 <span className="capitalize">{getCategoryDisplayName(categoryHandle)}</span>
//                 <button 
//                   onClick={() => handleRemoveCategory(categoryHandle)}
//                   className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
//                   title={`Remove ${getCategoryDisplayName(categoryHandle)}`}
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}

//             {/* Individual Collection Pills */}
//             {currentCollections && currentCollections.length > 0 && currentCollections.map((collectionHandle) => (
//               <div key={`collection-${collectionHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
//                 <span className="capitalize">{getCollectionDisplayName(collectionHandle)}</span>
//                 <button 
//                   onClick={() => handleRemoveCollection(collectionHandle)}
//                   className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
//                   title={`Remove ${getCollectionDisplayName(collectionHandle)}`}
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}

//             {/* Individual Vendor Pills - Display names, remove by handles */}
//             {currentVendors && currentVendors.length > 0 && currentVendors.map((vendorHandle) => (
//               <div key={`vendor-${vendorHandle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
//                 <span className="capitalize">{getVendorDisplayName(vendorHandle)}</span>
//                 <button 
//                   onClick={() => handleRemoveVendor(vendorHandle)}
//                   className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
//                   title={`Remove ${getVendorDisplayName(vendorHandle)}`}
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}

//             {/* ✅ ENHANCED: Individual Color Pills with actual color circles */}
//             {currentColors && currentColors.length > 0 && currentColors.map((color) => {
//               const colorHex = getColorHex(color);
              
//               return (
//                 <div key={`color-${color}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
//                   <span className="capitalize">
//                     {normalizeColorName(color)}
//                   </span>
//                   {/* ✅ ENHANCED: Real color circle that matches the actual color */}
//                   <div 
//                     className="flex-shrink-0 w-4 h-4 border border-gray-300 rounded-full shadow-sm"
//                     style={{ backgroundColor: colorHex }}
//                     title={`Color: ${normalizeColorName(color)} (${colorHex}) - Images showing this variant`}
//                   />
//                   <button 
//                     onClick={() => handleRemoveColor(color)}
//                     className="flex items-center justify-center w-4 h-4 text-gray-400 transition-colors hover:text-gray-600"
//                     title={`Remove ${normalizeColorName(color)} (will change product images)`}
//                   >
//                     <X size={12} />
//                   </button>
//                 </div>
//               );
//             })}

//             {/* Price Range Pills */}
//             {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
//               <div className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
//                 <span>
//                   Price: ₹{currentMinPrice || 0} - ₹{currentMaxPrice || 1000}
//                 </span>
//                 <button 
//                   onClick={() => handleRemovePriceFilter()}
//                   className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
//                   title="Remove price filter"
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ✅ Products Display - Pass selected colors for image selection */}
//      <div className="relative">
//         {isPending && (
//           <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 rounded-lg bg-white/60">
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-8 h-8 border-2 border-[#e65100] border-t-transparent rounded-full animate-spin" />
//               <span className="text-sm text-gray-500">Loading products...</span>
//             </div>
//           </div>
//         )}
//         <div className={`transition-opacity duration-200 ${isPending ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
//           <PaginatedProductsDisplay
//             products={products}
//             totalCount={totalCount}
//             currentPage={page}
//             totalPages={totalPages}
//             region={region}
//             selectedColors={colorsForImageSelection}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import PaginatedProductsDisplay from "@modules/store/components/paginated-products-display"
import { X } from "lucide-react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type Vendor = { id: string; name: string; handle: string }
type Collection = { id: string; title: string; handle: string }
type Category = { id: string; name: string; handle: string }

type FilterHandlersWrapperProps = {
  sortBy?: SortOptions
  page?: number
  categoryId?: string
  countryCode?: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  dynamicPriceRange?: { minPrice: number, maxPrice: number }
  minPrice?: number
  maxPrice?: number
  products?: any[]
  totalCount?: number
  totalPages?: number
  region?: HttpTypes.StoreRegion
  vendorsData?: Vendor[]
  collectionsData?: Collection[]
  categoriesData?: Category[]
  availableColors?: Array<{ name: string; hex: string }>
  selectedColors?: string[]
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
  dynamicPriceRange = { minPrice: 0, maxPrice: 10000 },
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  products = [],
  totalCount = 0,
  totalPages = 1,
  region,
  vendorsData = [],
  collectionsData = [],
  categoriesData = [],
  availableColors = [],
  selectedColors = []
}: FilterHandlersWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [currentVendors, setCurrentVendors] = useState<string[]>(initialVendors)
  const [currentColors, setCurrentColors] = useState<string[]>(initialColors)
  const [currentCollections, setCurrentCollections] = useState<string[]>(initialCollections)
  const [currentCategories, setCurrentCategories] = useState<string[]>(initialCategories)
  const [currentMinPrice, setCurrentMinPrice] = useState<number | undefined>(initialMinPrice)
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number | undefined>(initialMaxPrice)

  // Sync state from URL on navigation
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
      const [min, max] = priceParam.split('-').map(p => parseInt(p.replace('₹', ''), 10))
      setCurrentMinPrice(isNaN(min) ? undefined : min)
      setCurrentMaxPrice(isNaN(max) ? undefined : max)
    } else {
      setCurrentMinPrice(undefined)
      setCurrentMaxPrice(undefined)
    }
  }, [searchParams])

  const normalizeColorName = useCallback((colorName: string): string => {
    return colorName
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/gi, '$1 $2')
      .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
      .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const getColorHex = useCallback((colorName: string): string => {
    if (!availableColors || availableColors.length === 0) return '#6b7280'
    const normalizedInput = normalizeColorName(colorName).toLowerCase().trim()
    const match = availableColors.find(c =>
      normalizeColorName(c.name).toLowerCase().trim() === normalizedInput
    )
    if (match?.hex) {
      const hex = match.hex.startsWith('#') ? match.hex : '#' + match.hex
      return hex
    }
    const fallbacks: Record<string, string> = {
      'red': '#ef4444', 'blue': '#3b82f6', 'green': '#10b981',
      'yellow': '#f59e0b', 'purple': '#8b5cf6', 'pink': '#ec4899',
      'orange': '#f97316', 'black': '#000000', 'white': '#ffffff',
      'gray': '#6b7280', 'grey': '#6b7280', 'brown': '#92400e',
    }
    const key = normalizedInput.split(' ').find(w => fallbacks[w])
    return key ? fallbacks[key] : '#6b7280'
  }, [availableColors, normalizeColorName])

  const getVendorDisplayName = useCallback((handle: string) =>
    vendorsData.find(v => v.handle === handle)?.name ?? handle, [vendorsData])

  const getCollectionDisplayName = useCallback((handle: string) =>
    collectionsData.find(c => c.handle === handle)?.title ?? handle, [collectionsData])

  const getCategoryDisplayName = useCallback((handle: string) =>
    categoriesData.find(c => c.handle === handle)?.name ?? handle, [categoriesData])

  // ── Filter removal handlers — push URL instantly, no transition delay ────
  const pushFilter = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (!value) {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    if (name !== 'page') params.set('page', '1')
    // router.push updates URL INSTANTLY — Suspense key change triggers skeleton
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const handleRemoveVendor = useCallback((v: string) => {
    pushFilter("vendors", currentVendors.filter(x => x !== v).join(","))
  }, [currentVendors, pushFilter])

  const handleRemoveCollection = useCallback((c: string) => {
    pushFilter("collections", currentCollections.filter(x => x !== c).join(","))
  }, [currentCollections, pushFilter])

  const handleRemoveCategory = useCallback((c: string) => {
    pushFilter("categories", currentCategories.filter(x => x !== c).join(","))
  }, [currentCategories, pushFilter])

  const handleRemoveColor = useCallback((c: string) => {
    pushFilter("colors", currentColors.filter(x => x !== c).join(","))
  }, [currentColors, pushFilter])

  const handleRemovePriceFilter = useCallback(() => {
    pushFilter("price", "")
  }, [pushFilter])

  const handleClearAllFilters = useCallback(() => {
    router.push(`${pathname}?page=1`, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters =
    currentVendors.length > 0 ||
    currentColors.length > 0 ||
    currentCollections.length > 0 ||
    currentCategories.length > 0 ||
    currentMinPrice !== undefined ||
    currentMaxPrice !== undefined

  const colorsForImageSelection = selectedColors.length > 0 ? selectedColors : currentColors

  return (
    <div className="w-full">
      {/* Applied Filter Pills */}
      {hasActiveFilters && (
        <div className="p-4 mb-6 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Applied Filters:</h3>
            <button onClick={handleClearAllFilters} className="text-xs text-[#e65100] hover:underline">
              Clear All Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategories.map(handle => (
              <div key={`cat-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCategoryDisplayName(handle)}</span>
                <button onClick={() => handleRemoveCategory(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentCollections.map(handle => (
              <div key={`col-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getCollectionDisplayName(handle)}</span>
                <button onClick={() => handleRemoveCollection(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentVendors.map(handle => (
              <div key={`ven-${handle}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{getVendorDisplayName(handle)}</span>
                <button onClick={() => handleRemoveVendor(handle)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {currentColors.map(color => (
              <div key={`clr-${color}`} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span className="capitalize">{normalizeColorName(color)}</span>
                <div
                  className="flex-shrink-0 w-4 h-4 border border-gray-300 rounded-full shadow-sm"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <button onClick={() => handleRemoveColor(color)} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            ))}
            {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
              <div className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                <span>Price: ₹{currentMinPrice || 0} - ₹{currentMaxPrice || 10000}</span>
                <button onClick={handleRemovePriceFilter} className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        NO isPending overlay here.
        Suspense in StoreTemplate handles the loading state — the skeleton
        shows immediately when the URL changes (Suspense key prop).
        The old isPending overlay was redundant AND it caused the 6-7 second
        freeze because it only appeared after the server round-trip started,
        not before.
      */}
      <PaginatedProductsDisplay
        products={products}
        totalCount={totalCount}
        currentPage={page}
        totalPages={totalPages}
        region={region}
        selectedColors={colorsForImageSelection}
      />
    </div>
  )
}
// "use client"

// import { useState, useEffect } from "react"
// import { X, ChevronUp, ChevronDown } from "lucide-react"
// import SortProducts from "@modules/store/components/refinement-list/sort-products"
// import CategoryFilter from "@modules/store/components/category-filter"
// import VendorFilter from "@modules/store/components/vendor-filter"
// import ColorFilter from "@modules/store/components/color-filter"
// import PriceFilter from "@modules/store/components/price-filter"
// import SubcategoryFilter from "@modules/store/components/subcategory-filter"

// type MobileFiltersProps = {
//   isOpen: boolean
//   onClose: () => void
//   sortBy: string
//   categories?: any[]
//   subcategories?: any[]
//   vendors?: any[]
//   products?: any[]
//   categoryId?: string
//   selectedVendors: string[]
//   selectedColors: string[]
//   minPrice: number
//   maxPrice: number
//   setQueryParams: (name: string, value: string) => void
//   clearAllFilters: () => void
//   isCollectionPage: boolean
// }

// export default function MobileFilters({
//   isOpen,
//   onClose,
//   sortBy,
//   categories = [],
//   subcategories = [],
//   vendors = [],
//   products = [],
//   categoryId = "",
//   selectedVendors = [],
//   selectedColors = [],
//   minPrice = 0,
//   maxPrice = 1000,
//   setQueryParams,
//   clearAllFilters,
//   isCollectionPage
// }: MobileFiltersProps) {
//   // State for expandable sections
//   const [expandedSections, setExpandedSections] = useState({
//     sort: true,
//     category: true,
//     subcategory: true,
//     vendor: true,
//     color: true,
//     price: true
//   })
  
//   // Toggle section visibility
//   const toggleSection = (section: string) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }))
//   }
  
//   // Prevent body scroll when panel is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = 'auto'
//     }
    
//     return () => {
//       document.body.style.overflow = 'auto'
//     }
//   }, [isOpen])
  
//   if (!isOpen) return null

//   // Only show filters if there are options available
//   const showCategoryFilter = isCollectionPage && categories.length > 1
//   const showSubcategoryFilter = !isCollectionPage && subcategories.length > 0
//   const showVendorFilter = vendors.length > 1
//   const showColorFilter = products.length > 0

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
//       <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col h-full">
//         <div className="p-4 border-b flex justify-between items-center">
//           <h2 className="font-bold text-lg">Filters</h2>
//           <button
//             onClick={onClose}
//             className="p-2"
//           >
//             <X size={20} />
//           </button>
//         </div>
        
//         <div className="flex-grow overflow-y-auto p-4">
//           {/* Sort */}
//           <div className="mb-6">
//             <button
//               className="flex justify-between items-center w-full mb-3"
//               onClick={() => toggleSection('sort')}
//             >
//               <h3 className="font-medium text-lg">Sort By</h3>
//               {expandedSections.sort ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//             </button>
            
//             {expandedSections.sort && (
//               <SortProducts 
//                 sortBy={sortBy} 
//                 setQueryParams={setQueryParams} 
//               />
//             )}
//           </div>
          
//           {/* Categories (only in Collection pages) */}
//           {showCategoryFilter && (
//             <div className="mb-6">
//               <button
//                 className="flex justify-between items-center w-full mb-3"
//                 onClick={() => toggleSection('category')}
//               >
//                 <h3 className="font-medium text-lg">Categories</h3>
//                 {expandedSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
              
//               {expandedSections.category && (
//                 <CategoryFilter 
//                   categories={categories} 
//                   categoryId={categoryId} 
//                   setQueryParams={setQueryParams} 
//                 />
//               )}
//             </div>
//           )}
          
//           {/* Subcategories (only in Category pages) */}
//           {showSubcategoryFilter && (
//             <div className="mb-6">
//               <button
//                 className="flex justify-between items-center w-full mb-3"
//                 onClick={() => toggleSection('subcategory')}
//               >
//                 <h3 className="font-medium text-lg">Subcategories</h3>
//                 {expandedSections.subcategory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
              
//               {expandedSections.subcategory && (
//                 <SubcategoryFilter 
//                   subcategories={subcategories} 
//                 />
//               )}
//             </div>
//           )}
          
//           {/* Vendors */}
//           {showVendorFilter && (
//             <div className="mb-6">
//               <button
//                 className="flex justify-between items-center w-full mb-3"
//                 onClick={() => toggleSection('vendor')}
//               >
//                 <h3 className="font-medium text-lg">Vendors</h3>
//                 {expandedSections.vendor ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
              
//               {expandedSections.vendor && (
//                 <VendorFilter 
//                   vendors={vendors}
//                   selectedVendors={selectedVendors}
//                   setQueryParams={setQueryParams} 
//                 />
//               )}
//             </div>
//           )}
          
//           {/* Colors */}
//           {showColorFilter && (
//             <div className="mb-6">
//               <button
//                 className="flex justify-between items-center w-full mb-3"
//                 onClick={() => toggleSection('color')}
//               >
//                 <h3 className="font-medium text-lg">Colors</h3>
//                 {expandedSections.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//               </button>
              
//               {expandedSections.color && (
//                 <ColorFilter 
//                   collection={products} 
//                   selectedColors={selectedColors} 
//                   setQueryParams={setQueryParams} 
//                 />
//               )}
//             </div>
//           )}
          
//           {/* Price Range */}
//           <div className="mb-6">
//             <button
//               className="flex justify-between items-center w-full mb-3"
//               onClick={() => toggleSection('price')}
//             >
//               <h3 className="font-medium text-lg">Price Range</h3>
//               {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//             </button>
            
//             {expandedSections.price && (
//               <PriceFilter
//                 min={0}
//                 max={1000}
//                 currentMin={minPrice}
//                 currentMax={maxPrice}
//                 setQueryParams={setQueryParams}
//               />
//             )}
//           </div>
//         </div>
        
//         <div className="p-4 border-t flex gap-2">
//           <button
//             className="flex-1 py-2 border border-gray-300 rounded-md"
//             onClick={clearAllFilters}
//           >
//             Clear All
//           </button>
//           <button
//             className="flex-1 py-2 bg-black text-white rounded-md"
//             onClick={onClose}
//           >
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
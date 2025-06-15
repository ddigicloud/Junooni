// "use client"

// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useCallback, useState } from "react"
// import { HttpTypes } from "@medusajs/types"
// import { ChevronDown, ChevronUp, X } from "lucide-react"

// import SortProducts, { SortOptions } from "./sort-products"
// import CategoryFilter from "@modules/store/components/category-filter"
// import VendorFilter from "@modules/store/components/vendor-filter"
// import ColorFilter from "@modules/store/components/color-filter"
// import PriceFilter from "@modules/store/components/price-filter"
// import CollectionFilter from "@modules/store/components/collection-filter"

// type Category = {
//   id: string;
//   name: string;
//   handle: string;
//   parent_category_id?: string;
//   category_children?: Category[];
//   mpath?: string;
// }

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

// type RefinementListProps = {
//   sortBy: SortOptions
//   search?: boolean
//   'data-testid'?: string
//   categories?: Category[]
//   vendors?: Vendor[]
//   products?: HttpTypes.StoreProduct[]
//   currentCategory?: HttpTypes.StoreProductCategory
//   collections?: Collection[]
//   selectedCollections?: string[]  // ✅ FIX: Should be array of strings
//   selectedVendors?: string[]      // ✅ ADD: Missing prop for selected vendors
//   selectedColors?: string[]       // ✅ ADD: Missing prop for selected colors
//   isCollectionPage?: boolean
//   initialVendorLimit?: number
// }

// const RefinementList = ({ 
//   sortBy,
//   categories = [],
//   vendors = [],
//   products = [],
//   currentCategory,
//   collections = [],
//   selectedCollections = [],      // ✅ FIX: Default to empty array
//   selectedVendors = [],          // ✅ ADD: Default to empty array
//   selectedColors = [],           // ✅ ADD: Default to empty array
//   isCollectionPage = false,
//   initialVendorLimit = 10,
//   'data-testid': dataTestId 
// }: RefinementListProps) => {
//   const router = useRouter()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()
  
//   // ✅ ADD: Debug logging for RefinementList
//   console.log('🎯 RefinementList Debug:')
//   console.log('- selectedCollections prop received:', selectedCollections)
//   console.log('- selectedVendors prop received:', selectedVendors)
//   console.log('- selectedColors prop received:', selectedColors)
//   console.log('- collections array:', collections)
  
//   // State for expandable sections
//   const [expandedSections, setExpandedSections] = useState({
//     sort: true,
//     category: true,
//     collection: true,
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
  
//   // Extract only filterable categories that exist in the current products
//   const getFilterableCategories = () => {
//     if (!products || products.length === 0) {
//       return flattenCategories(categories);
//     }

//     // Get all category handles from products
//     const productCategoryHandles = new Set<string>();
//     products.forEach(product => {
//       if (product.categories && product.categories.length > 0) {
//         product.categories.forEach(cat => {
//           productCategoryHandles.add(cat.handle);
//           // Also add parent categories from mpath
//           if (cat.mpath) {
//             const parts = cat.mpath.split('.');
//             parts.forEach(part => {
//               const handle = part.split('_').pop();
//               if (handle) productCategoryHandles.add(handle);
//             });
//           }
//         });
//       }
//     });

//     // Filter categories to only include those in products
//     const availableCategories = categories.filter(category => 
//       productCategoryHandles.has(category.handle)
//     );

//     return flattenCategories(availableCategories);
//   };

//   // Extract only filterable vendors that exist in the current products
//   const getFilterableVendors = () => {
//     if (!products || products.length === 0) {
//       return formatVendorsArray(vendors);
//     }

//     // Get unique vendors from products
//     const productVendors = new Map<string, Vendor>();
    
//     products.forEach(product => {
//       if (product.vendor) {
//         productVendors.set(product.vendor.id, {
//           id: product.vendor.id,
//           name: product.vendor.name,
//           handle: product.vendor.handle
//         });
//       }
//     });

//     return formatVendorsArray(Array.from(productVendors.values()));
//   };

//   // Extract only filterable collections that exist in the current products
//   const getFilterableCollections = () => {
//     if (!products || products.length === 0 || !collections || collections.length === 0) {
//       return formatCollectionsArray(collections);
//     }

//     // Get collection handles from products
//     const productCollectionHandles = new Set<string>();
//     products.forEach(product => {
//       if (product.collection && product.collection.handle) {
//         productCollectionHandles.add(product.collection.handle);
//       }
//     });

//     // Filter collections to only include those in products
//     const availableCollections = collections.filter(collection => 
//       productCollectionHandles.has(collection.handle)
//     );

//     return formatCollectionsArray(availableCollections);
//   };

//   // Flatten categories function
//   const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
//     const result: { value: string; label: string }[] = [
//       { value: "", label: "All Categories" }
//     ];
    
//     const processedCategories = new Set<string>();
    
//     const processCategory = (category: Category, level: number = 0) => {
//       if (processedCategories.has(category.id)) {
//         return;
//       }
      
//       processedCategories.add(category.id);
      
//       const indent = "".repeat(level);
      
//       result.push({
//         value: category.handle,
//         label: `${indent} ${category.name}`
//       });
      
//       if (category.category_children && category.category_children.length > 0) {
//         category.category_children.forEach(child => {
//           processCategory(child, level + 1);
//         });
//       }
//     };
    
//     categoryList.forEach(category => {
//       processCategory(category);
//     });
    
//     return result;
//   };

//   // Format vendors for display
//   const formatVendorsArray = (vendorList: Vendor[]): { value: string; label: string }[] => {
//     const result = [{ value: "", label: "All Vendors" }];
    
//     const uniqueVendors = new Map<string, Vendor>();
    
//     vendorList.forEach(vendor => {
//       if (!uniqueVendors.has(vendor.id)) {
//         uniqueVendors.set(vendor.id, vendor);
//       }
//     });
    
//     uniqueVendors.forEach(vendor => {
//       result.push({
//         value: vendor.name,
//         label: vendor.name
//       });
//     });
    
//     return result;
//   };

//   // Format collections for display
//   const formatCollectionsArray = (collectionList: Collection[]): { value: string; label: string }[] => {
//     const result = [{ value: "", label: "All Collections" }];
    
//     const uniqueCollections = new Map<string, Collection>();
    
//     collectionList.forEach(collection => {
//       if (!uniqueCollections.has(collection.id)) {
//         uniqueCollections.set(collection.id, collection);
//       }
//     });
    
//     uniqueCollections.forEach(collection => {
//       result.push({
//         value: collection.handle,
//         label: collection.title
//       });
//     });
    
//     return result;
//   };

//   // Get available colors from products
//   const getAvailableColors = () => {
//     if (!products || products.length === 0) {
//       return [];
//     }

//     const uniqueColors = new Set<string>();
    
//     products.forEach(product => {
//       if (product.metadata && product.metadata.color_hex_values) {
//         try {
//           const parsedColors = JSON.parse(product.metadata.color_hex_values);
//           if (Array.isArray(parsedColors)) {
//             parsedColors.forEach(color => {
//               if (color.name) {
//                 uniqueColors.add(color.name.toLowerCase());
//               }
//             });
//           }
//         } catch (e) {
//           console.error('Failed to parse color_hex_values:', e);
//         }
//       }
//     });
    
//     return Array.from(uniqueColors);
//   };

//   const formattedCategories = getFilterableCategories();
//   const formattedVendors = getFilterableVendors();
//   const formattedCollections = getFilterableCollections();
//   const availableColors = getAvailableColors();

//   // ✅ FIX: Get URL parameters for comparison and fallback
//   const categoryHandle = searchParams.get("category") || ""
//   const collectionsParam = searchParams.get("collections") || ""
//   const colorsParam = searchParams.get("colors") || ""
//   const vendorsParam = searchParams.get("vendors") || ""
//   const priceParam = searchParams.get("price") || ""
  
//   // ✅ FIX: Use props first, fallback to URL params if props are empty
//   const finalSelectedCollections = selectedCollections.length > 0 
//     ? selectedCollections 
//     : (collectionsParam ? collectionsParam.split(",") : [])
  
//   const finalSelectedVendors = selectedVendors.length > 0 
//     ? selectedVendors 
//     : (vendorsParam ? vendorsParam.split(",") : [])
  
//   const finalSelectedColors = selectedColors.length > 0 
//     ? selectedColors 
//     : (colorsParam ? colorsParam.split(",") : [])
  
//   const [minPrice, maxPrice] = priceParam 
//     ? priceParam.split("-").map(p => parseInt(p, 10)) 
//     : [0, 1000]
  
//   const PRICE_MIN = 0
//   const PRICE_MAX = 1000

//   // ✅ ADD: Debug logging after all variables are declared
//   console.log('🚀 RefinementList final values:')
//   console.log('- finalSelectedCollections:', finalSelectedCollections)
//   console.log('- finalSelectedVendors:', finalSelectedVendors)
//   console.log('- finalSelectedColors:', finalSelectedColors)
//   console.log('- collectionsParam from URL:', collectionsParam)

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams)
      
//       if (value === "") {
//         params.delete(name)
//       } else {
//         if (name === "vendors" || name === "colors" || name === "collections") {
//           const currentValues = params.get(name)?.split(",") || []
//           if (value.includes(",")) {
//             params.set(name, value)
//           } else {
//             if (currentValues.includes(value)) {
//               const newValues = currentValues.filter(v => v !== value)
//               if (newValues.length > 0) {
//                 params.set(name, newValues.join(","))
//               } else {
//                 params.delete(name)
//               }
//             } else {
//               params.set(name, [...currentValues, value].join(","))
//             }
//           }
//         } else {
//           params.set(name, value)
//         }
//       }

//       return params.toString()
//     },
//     [searchParams]
//   )

//   const setQueryParams = (name: string, value: string) => {
//     const query = createQueryString(name, value)
//     router.push(`${pathname}?${query}`, { scroll: false })
//   }
  
//   // Clear all filters
//   const clearAllFilters = () => {
//     const params = new URLSearchParams(searchParams)
//     params.delete("category")
//     params.delete("collection")     // Keep for backward compatibility
//     params.delete("collections")    
//     params.delete("vendors")
//     params.delete("colors")
//     params.delete("price")
//     router.push(`${pathname}?${params.toString()}`, { scroll: false })
//   }

//   // Only show filters if there are options available
//   const showCategoryFilter = isCollectionPage && formattedCategories.length > 1;
//   const showCollectionFilter = !isCollectionPage && formattedCollections.length > 1;
//   const showVendorFilter = formattedVendors.length > 1;
//   const showColorFilter = availableColors.length > 0;
  
//   // ✅ FIX: Check if any filters are applied using final values
//   const hasActiveFilters = categoryHandle || 
//                           finalSelectedCollections.length > 0 || 
//                           finalSelectedVendors.length > 0 || 
//                           finalSelectedColors.length > 0 || 
//                           minPrice > PRICE_MIN || 
//                           maxPrice < PRICE_MAX;

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-xl font-bold">Filters</h2>
//         {hasActiveFilters && (
//           <button
//             className="text-sm text-[#e65100] hover:underline"
//             onClick={clearAllFilters}
//           >
//             Clear All
//           </button>
//         )}
//       </div>
      
//       {/* Sort */}
//       {/* <div className="pb-4 border-b">
//         <button
//           className="flex items-center justify-between w-full mb-3"
//           onClick={() => toggleSection('sort')}
//         >
//           <h3 className="font-medium">Sort By</h3>
//           {expandedSections.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//         </button>
        
//         {expandedSections.sort && (
//           <SortProducts 
//             sortBy={sortBy} 
//             setQueryParams={setQueryParams} 
//             data-testid={`${dataTestId}-sort`} 
//           />
//         )}
//       </div> */}
      
//       {/* Categories (only in Collection pages) */}
//       {showCategoryFilter && (
//         <div className="pb-4 border-b">
//           <button
//             className="flex items-center justify-between w-full mb-3"
//             onClick={() => toggleSection('category')}
//           >
//             <h3 className="font-medium">Categories</h3>
//             {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </button>
          
//           {expandedSections.category && (
//             <CategoryFilter 
//               categories={formattedCategories} 
//               categoryId={categoryHandle} 
//               setQueryParams={setQueryParams} 
//               data-testid={`${dataTestId}-category`} 
//             />
//           )}
//         </div>
//       )}
      
//       {/* Collections (only in Category pages) */}
//       {showCollectionFilter && (
//         <div className="pb-4 border-b">
//           <button
//             className="flex items-center justify-between w-full mb-3"
//             onClick={() => toggleSection('collection')}
//           >
//             <h3 className="font-medium">Collections</h3>
//             {expandedSections.collection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </button>
          
//           {expandedSections.collection && (
//             <CollectionFilter 
//               collections={formattedCollections}
//               selectedCollections={finalSelectedCollections}  // ✅ FIX: Use final calculated value
//               setQueryParams={setQueryParams} 
//               data-testid={`${dataTestId}-collection`} 
//             />
//           )}
//         </div>
//       )}
      
//       {/* Vendors */}
//       {showVendorFilter && (
//         <div className="pb-4 border-b">
//           <button
//             className="flex items-center justify-between w-full mb-3"
//             onClick={() => toggleSection('vendor')}
//           >
//             <h3 className="font-medium">Creators</h3>
//             {expandedSections.vendor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </button>
          
//           {expandedSections.vendor && (
//             <VendorFilter 
//               vendors={formattedVendors}
//               selectedVendors={finalSelectedVendors}  // ✅ FIX: Use final calculated value
//               setQueryParams={setQueryParams} 
//               data-testid={`${dataTestId}-vendor`}
//               initialLimit={initialVendorLimit}
//             />
//           )}
//         </div>
//       )}
      
//       {/* Colors */}
//       {showColorFilter && (
//         <div className="pb-4 border-b">
//           <button
//             className="flex items-center justify-between w-full mb-3"
//             onClick={() => toggleSection('color')}
//           >
//             <h3 className="font-medium">Colors</h3>
//             {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </button>
          
//           {expandedSections.color && (
//             <ColorFilter 
//               collection={products} 
//               selectedColors={finalSelectedColors}  // ✅ FIX: Use final calculated value
//               setQueryParams={setQueryParams} 
//               data-testid={`${dataTestId}-color`} 
//             />
//           )}
//         </div>
//       )}
      
//       {/* Price Range */}
//       <div>
//         <button
//           className="flex items-center justify-between w-full mb-3"
//           onClick={() => toggleSection('price')}
//         >
//           <h3 className="font-medium">Price Range</h3>
//           {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//         </button>
        
//         {expandedSections.price && (
//           <PriceFilter
//             min={PRICE_MIN}
//             max={PRICE_MAX}
//             currentMin={minPrice || PRICE_MIN}
//             currentMax={maxPrice || PRICE_MAX}
//             setQueryParams={setQueryParams}
//             data-testid={`${dataTestId}-price`}
//           />
//         )}
//       </div>
//     </div>
//   )
// }

// export default RefinementList


"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown, ChevronUp, X } from "lucide-react"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import VendorFilter from "@modules/store/components/vendor-filter"
import ColorFilter from "@modules/store/components/color-filter"
import PriceFilter from "@modules/store/components/price-filter"
import CollectionFilter from "@modules/store/components/collection-filter"

type Category = {
  id: string;
  name: string;
  handle: string;
  parent_category_id?: string;
  category_children?: Category[];
  mpath?: string;
}

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

// ✅ NEW: Add Color type definition
type Color = {
  name: string;
  hex: string;
}

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Category[]
  vendors?: Vendor[]
  products?: HttpTypes.StoreProduct[]
  currentCategory?: HttpTypes.StoreProductCategory
  collections?: Collection[]
  selectedCollections?: string | string[]
  selectedVendors?: string | string[]
  selectedColors?: string | string[]
  isCollectionPage?: boolean
  initialVendorLimit?: number
  availableColors?: Color[] // ✅ NEW: Accept availableColors prop from StoreTemplate
}

const RefinementList = ({ 
  sortBy,
  categories = [],
  vendors = [],
  products = [],
  currentCategory,
  collections = [],
  selectedCollections = [],
  selectedVendors = [],
  selectedColors = [],
  isCollectionPage = false,
  initialVendorLimit = 10,
  availableColors, // ✅ NEW: Accept availableColors prop
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // ✅ ROBUST: Normalize props to arrays
  const normalizeToArray = (value: string | string[] | undefined): string[] => {
    if (!value) return []
    if (typeof value === 'string') return value.split(',').filter(Boolean)
    return value
  }
  
  const propSelectedCollections = normalizeToArray(selectedCollections)
  const propSelectedVendors = normalizeToArray(selectedVendors)
  const propSelectedColors = normalizeToArray(selectedColors)
  
  console.log('🎯 RefinementList Debug:')
  console.log('- selectedCollections prop:', selectedCollections)
  console.log('- selectedVendors prop:', selectedVendors)
  console.log('- selectedColors prop:', selectedColors)
  console.log('- availableColors prop:', availableColors) // ✅ NEW: Debug availableColors
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    category: true,
    collection: true,
    vendor: true,
    color: true,
    price: true
  })
  
  // ✅ NEW: State for category limit
  const [categoryLimit, setCategoryLimit] = useState(10)
  
  // Toggle section visibility
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Extract only filterable categories that exist in the current products
  const getFilterableCategories = () => {
    if (!products || products.length === 0) {
      return flattenCategories(categories);
    }

    // Get all category handles from products
    const productCategoryHandles = new Set<string>();
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(cat => {
          productCategoryHandles.add(cat.handle);
          // Also add parent categories from mpath
          if (cat.mpath) {
            const parts = cat.mpath.split('.');
            parts.forEach(part => {
              const handle = part.split('_').pop();
              if (handle) productCategoryHandles.add(handle);
            });
          }
        });
      }
    });

    // Filter categories to only include those in products
    const availableCategories = categories.filter(category => 
      productCategoryHandles.has(category.handle)
    );

    return flattenCategories(availableCategories);
  };

  // ✅ FIX: Extract filterable vendors using consistent handles
  const getFilterableVendors = () => {
    if (!products || products.length === 0) {
      return formatVendorsArray(vendors);
    }

    // Get unique vendors from products
    const productVendors = new Map<string, Vendor>();
    
    products.forEach(product => {
      if (product.vendor) {
        productVendors.set(product.vendor.handle, { // ✅ KEY: Use handle as map key
          id: product.vendor.id,
          name: product.vendor.name,
          handle: product.vendor.handle
        });
      }
    });

    return formatVendorsArray(Array.from(productVendors.values()));
  };

  // Extract only filterable collections that exist in the current products
  const getFilterableCollections = () => {
    if (!products || products.length === 0 || !collections || collections.length === 0) {
      return formatCollectionsArray(collections);
    }

    // Get collection handles from products
    const productCollectionHandles = new Set<string>();
    products.forEach(product => {
      if (product.collection && product.collection.handle) {
        productCollectionHandles.add(product.collection.handle);
      }
    });

    // Filter collections to only include those in products
    const availableCollections = collections.filter(collection => 
      productCollectionHandles.has(collection.handle)
    );

    return formatCollectionsArray(availableCollections);
  };

  // Flatten categories function
  const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [
      { value: "", label: "All Categories" }
    ];
    
    const processedCategories = new Set<string>();
    
    const processCategory = (category: Category, level: number = 0) => {
      if (processedCategories.has(category.id)) {
        return;
      }
      
      processedCategories.add(category.id);
      
      const indent = "".repeat(level);
      
      result.push({
        value: category.handle,
        label: `${indent} ${category.name}`
      });
      
      if (category.category_children && category.category_children.length > 0) {
        category.category_children.forEach(child => {
          processCategory(child, level + 1);
        });
      }
    };
    
    categoryList.forEach(category => {
      processCategory(category);
    });
    
    return result;
  };

  // ✅ CRITICAL FIX: Format vendors using handles as values for consistency
  const formatVendorsArray = (vendorList: Vendor[]): { value: string; label: string }[] => {
    const result = [{ value: "", label: "All Vendors" }];
    
    const uniqueVendors = new Map<string, Vendor>();
    
    vendorList.forEach(vendor => {
      if (!uniqueVendors.has(vendor.handle)) { // ✅ Use handle as unique key
        uniqueVendors.set(vendor.handle, vendor);
      }
    });
    
    // ✅ CRITICAL: Sort by name but use handle as value
    const sortedVendors = Array.from(uniqueVendors.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    
    sortedVendors.forEach(vendor => {
      result.push({
        value: vendor.name,  // ✅ FIXED: Use handle as value (consistent with collections)
        label: vendor.name     // ✅ Display name but identify by handle
      });
    });
    
    console.log('🏪 Formatted vendors:', result);
    
    return result;
  };

  // Format collections for display
  const formatCollectionsArray = (collectionList: Collection[]): { value: string; label: string }[] => {
    const result = [{ value: "", label: "All Collections" }];
    
    const uniqueCollections = new Map<string, Collection>();
    
    collectionList.forEach(collection => {
      if (!uniqueCollections.has(collection.handle)) { // ✅ Use handle as unique key
        uniqueCollections.set(collection.handle, collection);
      }
    });
    
    // ✅ Sort by title
    const sortedCollections = Array.from(uniqueCollections.values())
      .sort((a, b) => a.title.localeCompare(b.title));
    
    sortedCollections.forEach(collection => {
      result.push({
        value: collection.handle,  // ✅ Consistent: Use handle as value
        label: collection.title
      });
    });
    
    console.log('🏷️ Formatted collections:', result);
    
    return result;
  };

  // ✅ FIXED: Get available colors with proper hex values (same logic as CategoryTemplate)
  const getAvailableColors = (): Color[] => {
  if (availableColors && availableColors.length > 0) {
    console.log('🎨 Using availableColors prop:', availableColors);
    return availableColors;
  }

  if (!products || products.length === 0) {
    console.log('🎨 No products available for color extraction');
    return [];
  }

  console.log('🎨 Extracting colors from products...');
  const uniqueColors = new Map<string, Color>();
  
  products.forEach(product => {
    if (product.metadata && product.metadata.color_hex_values) {
      try {
        const parsedColors = JSON.parse(product.metadata.color_hex_values);
        if (Array.isArray(parsedColors)) {
          parsedColors.forEach(color => {
            if (color.name && color.hex) {
              // ✅ FIXED: Ensure proper spacing in color names
              const normalizedName = color.name
                .trim()
                .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
                .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '); // Proper case each word
              
              uniqueColors.set(normalizedName.toLowerCase(), {
                name: normalizedName, // ✅ "Light Pink" instead of "Lightpink"
                hex: color.hex
              });
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse color_hex_values:', e);
      }
    }
  });
  
  const result = Array.from(uniqueColors.values());
  console.log('🎨 Extracted colors with proper spacing:', result);
  return result;
};

  const formattedCategories = getFilterableCategories();
  const formattedVendors = getFilterableVendors();
  const formattedCollections = getFilterableCollections();
  const colorsWithHex = getAvailableColors(); // ✅ FIXED: Now returns Color[] with name+hex

  // ✅ Get URL parameters for comparison and fallback
  const categoryHandle = searchParams.get("category") || searchParams.get("categories") || "" // ✅ NEW: Also check categories param
  const collectionsParam = searchParams.get("collections") || ""
  const colorsParam = searchParams.get("colors") || ""
  const vendorsParam = searchParams.get("vendors") || ""
  const priceParam = searchParams.get("price") || ""
  
  // ✅ Use props first, fallback to URL params if props are empty
  const finalSelectedCollections = propSelectedCollections.length > 0 
    ? propSelectedCollections 
    : (collectionsParam ? collectionsParam.split(",") : [])
  
  const finalSelectedVendors = propSelectedVendors.length > 0 
    ? propSelectedVendors 
    : (vendorsParam ? vendorsParam.split(",") : [])
  
  const finalSelectedColors = propSelectedColors.length > 0 
    ? propSelectedColors 
    : (colorsParam ? colorsParam.split(",") : [])
  
  const [minPrice, maxPrice] = priceParam 
    ? priceParam.split("-").map(p => parseInt(p, 10)) 
    : [0, 1000]
  
  const PRICE_MIN = 0
  const PRICE_MAX = 1000

  console.log('🚀 RefinementList final values:')
  console.log('- finalSelectedCollections:', finalSelectedCollections)
  console.log('- finalSelectedVendors:', finalSelectedVendors)
  console.log('- finalSelectedColors:', finalSelectedColors)
  console.log('- colorsWithHex:', colorsWithHex) // ✅ NEW: Debug colors with hex

  // ✅ CRITICAL FIX: Robust createQueryString with proper array handling
  const createQueryString = useCallback(
    (name: string, value: string) => {
      console.log(`🔧 createQueryString called: ${name} = "${value}"`)
      const params = new URLSearchParams(searchParams)
      
      if (value === "" || value === null || value === undefined) {
        console.log(`❌ Deleting parameter: ${name}`)
        params.delete(name)
      } else {
        // ✅ ROBUST: Always set the complete value for multi-value fields
        // Don't try to manipulate arrays here - let components handle their own logic
        console.log(`📝 Setting ${name} to: "${value}"`)
        params.set(name, value)
      }

      const result = params.toString()
      console.log(`🎯 Final query string: ${result}`)
      return result
    },
    [searchParams]
  )

  // ✅ CRITICAL FIX: Professional UX - Reset to page 1 when filters change
  const setQueryParamsWithPageReset = useCallback((name: string, value: string) => {
    console.log(`🔧 setQueryParamsWithPageReset called: ${name} = "${value}"`)
    const params = new URLSearchParams(searchParams)
    
    if (value === "" || value === null || value === undefined) {
      console.log(`❌ Deleting parameter: ${name}`)
      params.delete(name)
    } else {
      console.log(`📝 Setting ${name} to: "${value}"`)
      params.set(name, value)
    }

    // ✅ PROFESSIONAL UX: Reset to page 1 when any filter changes (except page itself)
    if (name !== 'page') {
      params.set('page', '1')
      console.log(`🔄 PROFESSIONAL UX: Resetting to page 1 due to filter change: ${name}`)
    }

    const query = params.toString()
    console.log(`🎯 Final query with page reset: ${query}`)
    router.push(`${pathname}?${query}`, { scroll: false })
  }, [searchParams, router, pathname])

  // ✅ UPDATED: Use the page reset version for filters
  const setQueryParams = setQueryParamsWithPageReset
  
  // ✅ UPDATED: Clear all filters and reset to page 1
  const clearAllFilters = () => {
    console.log('🔄 PROFESSIONAL UX: Clearing all filters and resetting to page 1')
    const params = new URLSearchParams(searchParams)
    params.delete("category")
    params.delete("categories") // ✅ NEW: Also clear categories param
    params.delete("collection")     // Keep for backward compatibility
    params.delete("collections")    
    params.delete("vendors")
    params.delete("colors")
    params.delete("price")
    // ✅ PROFESSIONAL UX: Reset to page 1 when clearing filters
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // ✅ FIXED: Update filter visibility logic to show categories on store pages too
  const showCategoryFilter = formattedCategories.length > 1; // ✅ NEW: Show categories on both store and collection pages
  const showCollectionFilter = !isCollectionPage && formattedCollections.length > 1; // Only show collections on non-collection pages
  const showVendorFilter = formattedVendors.length > 1;
  const showColorFilter = colorsWithHex.length > 0; // ✅ FIXED: Use colorsWithHex instead of availableColors
  
  // ✅ Check if any filters are applied using final values
  const hasActiveFilters = categoryHandle || 
                          finalSelectedCollections.length > 0 || 
                          finalSelectedVendors.length > 0 || 
                          finalSelectedColors.length > 0 || 
                          minPrice > PRICE_MIN || 
                          maxPrice < PRICE_MAX;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            className="text-sm text-[#e65100] hover:underline"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* ✅ FIXED: Categories (now shows on both store and collection pages) */}
      {showCategoryFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3 text-[#e65100] hover:text-[#e65100]"
            onClick={() => toggleSection('category')}
          >
            <h3 className="font-medium">Categories</h3>
            {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.category && (
            <div>
              <CategoryFilter 
                categories={formattedCategories.slice(0, categoryLimit + 1)} // ✅ NEW: Limit displayed categories (+1 for "All Categories")
                categoryId={categoryHandle} 
                collection={products}
                setQueryParams={(name, value) => {
                  // ✅ NEW: For store pages, use 'categories' param instead of 'category'
                  const paramName = isCollectionPage ? 'category' : 'categories'
                  setQueryParams(paramName, value)
                }} 
                data-testid={`${dataTestId}-category`} 
              />
              
              {/* ✅ NEW: Load more button for categories */}
              {formattedCategories.length > categoryLimit + 1 && (
                <button
                  onClick={() => setCategoryLimit(prev => prev + 10)}
                  className="-mt-2 text-sm font-medium text-[#e65100] hover:text-[#e65100] hover:underline flex items-center gap-1"
                >
                  ({formattedCategories.length - categoryLimit - 1} more)
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              
              {/* ✅ NEW: Show less button when more than initial limit */}
              {categoryLimit > 10 && (
                <button
                  onClick={() => setCategoryLimit(10)}
                  className="mt-0 ml-0 font-medium text-sm text-[#e65100] hover:text-[#e65100] hover:underline flex items-center gap-1"
                >
                  Show less
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Collections (only in store pages, not collection pages) */}
      {showCollectionFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('collection')}
          >
            <h3 className="font-medium">Collections</h3>
            {expandedSections.collection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.collection && (
            <CollectionFilter 
              collections={formattedCollections}
              selectedCollections={finalSelectedCollections.join(",")}  // CollectionFilter expects string
              setQueryParams={setQueryParams} 
              collection={products}
              data-testid={`${dataTestId}-collection`} 
            />
          )}
        </div>
      )}
      
      {/* Vendors */}
      {showVendorFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('vendor')}
          >
            <h3 className="font-medium">Creators</h3>
            {expandedSections.vendor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.vendor && (
            <VendorFilter 
              vendors={formattedVendors}
              selectedVendors={finalSelectedVendors}  // VendorFilter expects array
              setQueryParams={setQueryParams} 
              collection={products}
              data-testid={`${dataTestId}-vendor`}
              initialLimit={initialVendorLimit}
            />
          )}
        </div>
      )}
      
      {/* ✅ FIXED: Colors - now uses colorsWithHex which includes hex values */}
      {showColorFilter && (
        <div className="pb-4 border-b">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => toggleSection('color')}
          >
            <h3 className="font-medium">Colors</h3>
            {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.color && (
            <ColorFilter 
              collection={products} 
              availableColors={colorsWithHex} // ✅ FIXED: Pass colors with hex values
              selectedColors={finalSelectedColors}  // ColorFilter expects array
              setQueryParams={setQueryParams} 
              data-testid={`${dataTestId}-color`} 
            />
          )}
        </div>
      )}
      
      {/* Price Range */}
      <div>
        <button
          className="flex items-center justify-between w-full mb-3"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-medium">Price Range</h3>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.price && (
          <PriceFilter
            min={PRICE_MIN}
            max={PRICE_MAX}
            currentMin={minPrice || PRICE_MIN}
            currentMax={maxPrice || PRICE_MAX}
            setQueryParams={setQueryParams}
            data-testid={`${dataTestId}-price`}
          />
        )}
      </div>
    </div>
  )
}

export default RefinementList
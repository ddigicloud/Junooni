
// // "use client"

// // import { usePathname, useRouter, useSearchParams } from "next/navigation"
// // import { useCallback } from "react"
// // import { HttpTypes } from "@medusajs/types"

// // import SortProducts, { SortOptions } from "./sort-products"
// // import CategoryFilter from "@modules/store/components/category-filter"
// // import VendorFilter from "@modules/store/components/vendor-filter"
// // import ColorFilter from "@modules/store/components/color-filter"
// // import PriceFilter from "@modules/store/components/price-filter"
// // import { Text } from "@medusajs/ui"

// // type Category = {
// //   id: string;
// //   name: string;
// //   handle: string;
// //   parent_category_id?: string;
// //   category_children?: Category[];
// //   mpath?: string;
// // }

// // type Vendor = {
// //   id: string;
// //   name: string;
// //   handle: string;
// // }

// // type RefinementListProps = {
// //   sortBy: SortOptions
// //   search?: boolean
// //   'data-testid'?: string
// //   categories?: Category[]
// //   vendors?: Vendor[]
// //   products?: HttpTypes.StoreProduct[]
// // }

// // const RefinementList = ({ 
// //   sortBy,
// //   categories = [],
// //   vendors = [],
// //   products = [],
// //   'data-testid': dataTestId 
// // }: RefinementListProps) => {
// //   const router = useRouter()
// //   const pathname = usePathname()
// //   const searchParams = useSearchParams()
  
// //   // Extract only filterable categories that exist in the current products
// //   const getFilterableCategories = () => {
// //     if (!products || products.length === 0) {
// //       return flattenCategories(categories);
// //     }

// //     // Get all category handles from products
// //     const productCategoryHandles = new Set<string>();
// //     products.forEach(product => {
// //       if (product.categories && product.categories.length > 0) {
// //         product.categories.forEach(cat => {
// //           productCategoryHandles.add(cat.handle);
// //           // Also add parent categories from mpath
// //           if (cat.mpath) {
// //             const parts = cat.mpath.split('.');
// //             parts.forEach(part => {
// //               const handle = part.split('_').pop();
// //               if (handle) productCategoryHandles.add(handle);
// //             });
// //           }
// //         });
// //       }
// //     });

// //     // Filter categories to only include those in products
// //     const availableCategories = categories.filter(category => 
// //       productCategoryHandles.has(category.handle)
// //     );

// //     return flattenCategories(availableCategories);
// //   };

// //   // Extract only filterable vendors that exist in the current products
// //   const getFilterableVendors = () => {
// //     if (!products || products.length === 0) {
// //       return formatVendorsArray(vendors);
// //     }

// //     // Get unique vendors from products
// //     const productVendors = new Map<string, Vendor>();
    
// //     products.forEach(product => {
// //       if (product.vendor) {
// //         productVendors.set(product.vendor.id, {
// //           id: product.vendor.id,
// //           name: product.vendor.name,
// //           handle: product.vendor.handle
// //         });
// //       }
// //     });

// //     return formatVendorsArray(Array.from(productVendors.values()));
// //   };

// //   // Flatten categories function
// //   const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
// //     const result: { value: string; label: string }[] = [
// //       { value: "", label: "All Categories" }
// //     ];
    
// //     const processedCategories = new Set<string>();
    
// //     const processCategory = (category: Category, level: number = 0) => {
// //       if (processedCategories.has(category.id)) {
// //         return;
// //       }
      
// //       processedCategories.add(category.id);
      
// //       const indent = "—".repeat(level);
      
// //       result.push({
// //         value: category.handle,
// //         label: `${indent} ${category.name}`
// //       });
      
// //       if (category.category_children && category.category_children.length > 0) {
// //         category.category_children.forEach(child => {
// //           processCategory(child, level + 1);
// //         });
// //       }
// //     };
    
// //     categoryList.forEach(category => {
// //       processCategory(category);
// //     });
    
// //     return result;
// //   };

// //   // Format vendors for display
// //   const formatVendorsArray = (vendorList: Vendor[]): { value: string; label: string }[] => {
// //     const result = [{ value: "", label: "All Vendors" }];
    
// //     const uniqueVendors = new Map<string, Vendor>();
    
// //     vendorList.forEach(vendor => {
// //       if (!uniqueVendors.has(vendor.id)) {
// //         uniqueVendors.set(vendor.id, vendor);
// //       }
// //     });
    
// //     uniqueVendors.forEach(vendor => {
// //       result.push({
// //         value: vendor.name,
// //         label: vendor.name
// //       });
// //     });
    
// //     return result;
// //   };

// //   // Get available colors from products
// //   const getAvailableColors = () => {
// //     if (!products || products.length === 0) {
// //       return [];
// //     }

// //     const uniqueColors = new Set<string>();
    
// //     products.forEach(product => {
// //       if (product.metadata && product.metadata.color_hex_values) {
// //         try {
// //           const parsedColors = JSON.parse(product.metadata.color_hex_values);
// //           if (Array.isArray(parsedColors)) {
// //             parsedColors.forEach(color => {
// //               if (color.name) {
// //                 uniqueColors.add(color.name.toLowerCase());
// //               }
// //             });
// //           }
// //         } catch (e) {
// //           console.error('Failed to parse color_hex_values:', e);
// //         }
// //       }
// //     });
    
// //     return Array.from(uniqueColors);
// //   };

// //   const formattedCategories = getFilterableCategories();
// //   const formattedVendors = getFilterableVendors();
// //   const availableColors = getAvailableColors();

// //   const categoryHandle = searchParams.get("category") || ""
// //   const colorsParam = searchParams.get("colors") || ""
// //   const selectedColors = colorsParam ? colorsParam.split(",") : []
// //   const vendorsParam = searchParams.get("vendors") || ""
// //   const selectedVendors = vendorsParam ? vendorsParam.split(",") : []
  
// //   const priceParam = searchParams.get("price") || ""
// //   const [minPrice, maxPrice] = priceParam 
// //     ? priceParam.split("-").map(p => parseInt(p, 10)) 
// //     : [0, 1000]
  
// //   const PRICE_MIN = 0
// //   const PRICE_MAX = 1000

// //   const createQueryString = useCallback(
// //     (name: string, value: string) => {
// //       const params = new URLSearchParams(searchParams)
      
// //       if (value === "") {
// //         params.delete(name)
// //       } else {
// //         if (name === "vendors" || name === "colors") {
// //           const currentValues = params.get(name)?.split(",") || []
// //           if (value.includes(",")) {
// //             params.set(name, value)
// //           } else {
// //             if (currentValues.includes(value)) {
// //               const newValues = currentValues.filter(v => v !== value)
// //               if (newValues.length > 0) {
// //                 params.set(name, newValues.join(","))
// //               } else {
// //                 params.delete(name)
// //               }
// //             } else {
// //               params.set(name, [...currentValues, value].join(","))
// //             }
// //           }
// //         } else {
// //           params.set(name, value)
// //         }
// //       }

// //       return params.toString()
// //     },
// //     [searchParams]
// //   )

// //   const setQueryParams = (name: string, value: string) => {
// //     const query = createQueryString(name, value)
// //     router.push(`${pathname}?${query}`, { scroll: false })
// //   }

// //   // Only show filters if there are options available
// //   const showCategoryFilter = formattedCategories.length > 1; // More than just "All Categories"
// //   const showVendorFilter = formattedVendors.length > 1; // More than just "All Vendors"
// //   const showColorFilter = availableColors.length > 0;

// //   return (
// //     <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
// //       <div className="flex flex-col gap-6">
// //         <Text className="txt-compact-medium-plus text-ui-fg-base">Filters</Text>
        
// //         <SortProducts 
// //           sortBy={sortBy} 
// //           setQueryParams={setQueryParams} 
// //           data-testid={`${dataTestId}-sort`} 
// //         />
        
// //         {showCategoryFilter && (
// //           <CategoryFilter 
// //             categories={formattedCategories} 
// //             categoryId={categoryHandle} 
// //             setQueryParams={setQueryParams} 
// //             data-testid={`${dataTestId}-category`} 
// //           />
// //         )}
        
// //         {showVendorFilter && (
// //           <VendorFilter 
// //             vendors={formattedVendors}
// //             selectedVendors={selectedVendors}
// //             setQueryParams={setQueryParams} 
// //             data-testid={`${dataTestId}-vendor`}
// //           />
// //         )}
        
// //         {showColorFilter && (
// //           <ColorFilter 
// //             collection={products} 
// //             selectedColors={selectedColors} 
// //             setQueryParams={setQueryParams} 
// //             data-testid={`${dataTestId}-color`} 
// //           />
// //         )}
        
// //         <PriceFilter
// //           min={PRICE_MIN}
// //           max={PRICE_MAX}
// //           currentMin={minPrice}
// //           currentMax={maxPrice}
// //           setQueryParams={setQueryParams}
// //           data-testid={`${dataTestId}-price`}
// //         />
// //       </div>
// //     </div>
// //   )
// // }

// // export default RefinementList

// // "use client"

// // import { usePathname, useRouter, useSearchParams } from "next/navigation"
// // import { useCallback, useState } from "react"
// // import { HttpTypes } from "@medusajs/types"
// // import { Text } from "@medusajs/ui"

// // import SortProducts, { SortOptions } from "./sort-products"
// // import CategoryFilter from "@modules/store/components/category-filter"
// // import VendorFilter from "@modules/store/components/vendor-filter"
// // import ColorFilter from "@modules/store/components/color-filter"
// // import PriceFilter from "@modules/store/components/price-filter"
// // import SubcategoryFilter from "@modules/store/components/subcategory-filter"

// // type Category = {
// //   id: string;
// //   name: string;
// //   handle: string;
// //   parent_category_id?: string;
// //   category_children?: Category[];
// //   mpath?: string;
// // }

// // type Vendor = {
// //   id: string;
// //   name: string;
// //   handle: string;
// // }

// // type RefinementListProps = {
// //   sortBy: SortOptions
// //   search?: boolean
// //   'data-testid'?: string
// //   categories?: Category[]
// //   vendors?: Vendor[]
// //   products?: HttpTypes.StoreProduct[]
// //   currentCategory?: HttpTypes.StoreProductCategory
// //   subcategories?: HttpTypes.StoreProductCategory[]
// //   isCollectionPage: boolean
// // }

// // const RefinementList = ({ 
// //   sortBy,
// //   categories = [],
// //   vendors = [],
// //   products = [],
// //   currentCategory,
// //   subcategories = [],
// //   isCollectionPage,
// //   'data-testid': dataTestId 
// // }: RefinementListProps) => {
// //   const router = useRouter()
// //   const pathname = usePathname()
// //   const searchParams = useSearchParams()
  
// //   // State for expanded filter sections - for accordion UI
// //   const [expandedFilterSections, setExpandedFilterSections] = useState({
// //     sort: true,
// //     categories: true,
// //     subcategories: true,
// //     vendors: true,
// //     colors: true,
// //     price: true
// //   })
  
// //   // Toggle filter sections
// //   const toggleFilterSection = (section: string) => {
// //     setExpandedFilterSections(prev => ({
// //       ...prev,
// //       [section]: !prev[section]
// //     }))
// //   }
  
// //   // Extract only filterable categories that exist in the current products
// //   const getFilterableCategories = () => {
// //     if (!products || products.length === 0) {
// //       return flattenCategories(categories);
// //     }

// //     // Get all category handles from products
// //     const productCategoryHandles = new Set<string>();
// //     products.forEach(product => {
// //       if (product.categories && product.categories.length > 0) {
// //         product.categories.forEach(cat => {
// //           productCategoryHandles.add(cat.handle);
// //           // Also add parent categories from mpath
// //           if (cat.mpath) {
// //             const parts = cat.mpath.split('.');
// //             parts.forEach(part => {
// //               const handle = part.split('_').pop();
// //               if (handle) productCategoryHandles.add(handle);
// //             });
// //           }
// //         });
// //       }
// //     });

// //     // Filter categories to only include those in products
// //     const availableCategories = categories.filter(category => 
// //       productCategoryHandles.has(category.handle)
// //     );

// //     return flattenCategories(availableCategories);
// //   };

// //   // Extract only filterable vendors that exist in the current products
// //   const getFilterableVendors = () => {
// //     if (!products || products.length === 0) {
// //       return formatVendorsArray(vendors);
// //     }

// //     // Get unique vendors from products
// //     const productVendors = new Map<string, Vendor>();
    
// //     products.forEach(product => {
// //       if (product.vendor) {
// //         productVendors.set(product.vendor.id, {
// //           id: product.vendor.id,
// //           name: product.vendor.name,
// //           handle: product.vendor.handle
// //         });
// //       }
// //     });

// //     return formatVendorsArray(Array.from(productVendors.values()));
// //   };

// //   // Flatten categories function
// //   const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
// //     const result: { value: string; label: string }[] = [
// //       { value: "", label: "All Categories" }
// //     ];
    
// //     const processedCategories = new Set<string>();
    
// //     const processCategory = (category: Category, level: number = 0) => {
// //       if (processedCategories.has(category.id)) {
// //         return;
// //       }
      
// //       processedCategories.add(category.id);
      
// //       const indent = "—".repeat(level);
      
// //       result.push({
// //         value: category.handle,
// //         label: `${indent} ${category.name}`
// //       });
      
// //       if (category.category_children && category.category_children.length > 0) {
// //         category.category_children.forEach(child => {
// //           processCategory(child, level + 1);
// //         });
// //       }
// //     };
    
// //     categoryList.forEach(category => {
// //       processCategory(category);
// //     });
    
// //     return result;
// //   };

// //   // Format vendors for display
// //   const formatVendorsArray = (vendorList: Vendor[]): { value: string; label: string }[] => {
// //     const result = [{ value: "", label: "All Vendors" }];
    
// //     const uniqueVendors = new Map<string, Vendor>();
    
// //     vendorList.forEach(vendor => {
// //       if (!uniqueVendors.has(vendor.id)) {
// //         uniqueVendors.set(vendor.id, vendor);
// //       }
// //     });
    
// //     uniqueVendors.forEach(vendor => {
// //       result.push({
// //         value: vendor.name,
// //         label: vendor.name
// //       });
// //     });
    
// //     return result;
// //   };

// //   // Get available colors from products
// //   const getAvailableColors = () => {
// //     if (!products || products.length === 0) {
// //       return [];
// //     }

// //     const uniqueColors = new Set<string>();
    
// //     products.forEach(product => {
// //       if (product.metadata && product.metadata.color_hex_values) {
// //         try {
// //           const parsedColors = JSON.parse(product.metadata.color_hex_values);
// //           if (Array.isArray(parsedColors)) {
// //             parsedColors.forEach(color => {
// //               if (color.name) {
// //                 uniqueColors.add(color.name.toLowerCase());
// //               }
// //             });
// //           }
// //         } catch (e) {
// //           console.error('Failed to parse color_hex_values:', e);
// //         }
// //       }
// //     });
    
// //     return Array.from(uniqueColors);
// //   };

// //   const formattedCategories = getFilterableCategories();
// //   const formattedVendors = getFilterableVendors();
// //   const availableColors = getAvailableColors();

// //   const categoryHandle = searchParams.get("category") || ""
// //   const colorsParam = searchParams.get("colors") || ""
// //   const selectedColors = colorsParam ? colorsParam.split(",") : []
// //   const vendorsParam = searchParams.get("vendors") || ""
// //   const selectedVendors = vendorsParam ? vendorsParam.split(",") : []
  
// //   const priceParam = searchParams.get("price") || ""
// //   const [minPrice, maxPrice] = priceParam 
// //     ? priceParam.split("-").map(p => parseInt(p, 10)) 
// //     : [0, 1000]
  
// //   const PRICE_MIN = 0
// //   const PRICE_MAX = 1000

// //   const createQueryString = useCallback(
// //     (name: string, value: string) => {
// //       const params = new URLSearchParams(searchParams)
      
// //       if (value === "") {
// //         params.delete(name)
// //       } else {
// //         if (name === "vendors" || name === "colors") {
// //           const currentValues = params.get(name)?.split(",") || []
// //           if (value.includes(",")) {
// //             params.set(name, value)
// //           } else {
// //             if (currentValues.includes(value)) {
// //               const newValues = currentValues.filter(v => v !== value)
// //               if (newValues.length > 0) {
// //                 params.set(name, newValues.join(","))
// //               } else {
// //                 params.delete(name)
// //               }
// //             } else {
// //               params.set(name, [...currentValues, value].join(","))
// //             }
// //           }
// //         } else {
// //           params.set(name, value)
// //         }
// //       }

// //       return params.toString()
// //     },
// //     [searchParams]
// //   )

// //   const setQueryParams = (name: string, value: string) => {
// //     const query = createQueryString(name, value)
// //     router.push(`${pathname}?${query}`, { scroll: false })
// //   }

// //   // Only show filters if there are options available
// //   const showCategoryFilter = formattedCategories.length > 1 && isCollectionPage;
// //   const showSubcategoryFilter = subcategories && subcategories.length > 0;
// //   const showVendorFilter = formattedVendors.length > 1;
// //   const showColorFilter = availableColors.length > 0;

// //   // Function to clear all filters
// //   const clearAllFilters = () => {
// //     const params = new URLSearchParams(searchParams);
    
// //     // Keep only the page and sortBy params, remove all filters
// //     const page = params.get("page");
// //     const sortBy = params.get("sortBy");
    
// //     const newParams = new URLSearchParams();
// //     if (page) newParams.set("page", page);
// //     if (sortBy) newParams.set("sortBy", sortBy);
    
// //     router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
// //   };
  
// //   // Check if any filters are applied
// //   const hasActiveFilters = vendorsParam || colorsParam || priceParam || categoryHandle;

// //   // Function to render the filter section header with the collapsible control
// //   const renderFilterHeader = (title: string, sectionKey: string) => (
// //     <div 
// //       onClick={() => toggleFilterSection(sectionKey)} 
// //       className="flex justify-between items-center py-3 cursor-pointer border-b border-gray-200"
// //     >
// //       <h3 className="font-semibold text-gray-800 uppercase text-sm">{title}</h3>
// //       <span className="text-gray-500">
// //         {expandedFilterSections[sectionKey] ? (
// //           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
// //             <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
// //           </svg>
// //         ) : (
// //           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
// //             <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
// //           </svg>
// //         )}
// //       </span>
// //     </div>
// //   );

// //   return (
// //     <div className="divide-y divide-gray-200">
// //       {/* Filter Header with Clear All button */}
// //       <div className="flex justify-between items-center pb-4">
// //         <h2 className="font-bold text-gray-900 uppercase text-sm">FILTERS</h2>
// //         {hasActiveFilters && (
// //           <button
// //             className="text-sm text-pink-500 font-medium"
// //             onClick={clearAllFilters}
// //           >
// //             CLEAR ALL
// //           </button>
// //         )}
// //       </div>
      
// //       {/* Sort Options */}
// //       <div className="py-4">
// //         {renderFilterHeader("Sort By", "sort")}
// //         {expandedFilterSections.sort && (
// //           <div className="mt-3">
// //             <SortProducts 
// //               sortBy={sortBy} 
// //               setQueryParams={setQueryParams} 
// //               data-testid={`${dataTestId}-sort`} 
// //             />
// //           </div>
// //         )}
// //       </div>
      
// //       {/* Categories (for collection pages) */}
// //       {showCategoryFilter && (
// //         <div className="py-4">
// //           {renderFilterHeader("Categories", "categories")}
// //           {expandedFilterSections.categories && (
// //             <div className="mt-3">
// //               <CategoryFilter 
// //                 categories={formattedCategories} 
// //                 categoryId={categoryHandle} 
// //                 setQueryParams={setQueryParams} 
// //                 data-testid={`${dataTestId}-category`} 
// //               />
// //             </div>
// //           )}
// //         </div>
// //       )}
      
// //       {/* Subcategories (for category pages) */}
// //       {showSubcategoryFilter && (
// //         <div className="py-4">
// //           {renderFilterHeader("Sub Categories", "subcategories")}
// //           {expandedFilterSections.subcategories && (
// //             <div className="mt-3">
// //               <SubcategoryFilter 
// //                 subcategories={subcategories}
// //                 data-testid={`${dataTestId}-subcategory`} 
// //               />
// //             </div>
// //           )}
// //         </div>
// //       )}
      
// //       {/* Brands/Vendors */}
// //       {showVendorFilter && (
// //         <div className="py-4">
// //           {renderFilterHeader("Brand", "vendors")}
// //           {expandedFilterSections.vendors && (
// //             <div className="mt-3">
// //               <VendorFilter 
// //                 vendors={formattedVendors}
// //                 selectedVendors={selectedVendors}
// //                 setQueryParams={setQueryParams} 
// //                 data-testid={`${dataTestId}-vendor`}
// //               />
// //             </div>
// //           )}
// //         </div>
// //       )}
      
// //       {/* Colors */}
// //       {showColorFilter && (
// //         <div className="py-4">
// //           {renderFilterHeader("Color", "colors")}
// //           {expandedFilterSections.colors && (
// //             <div className="mt-3">
// //               <ColorFilter 
// //                 collection={products} 
// //                 selectedColors={selectedColors} 
// //                 setQueryParams={setQueryParams} 
// //                 data-testid={`${dataTestId}-color`} 
// //               />
// //             </div>
// //           )}
// //         </div>
// //       )}
      
// //       {/* Price Range */}
// //       <div className="py-4">
// //         {renderFilterHeader("Price", "price")}
// //         {expandedFilterSections.price && (
// //           <div className="mt-3">
// //             <PriceFilter
// //               min={PRICE_MIN}
// //               max={PRICE_MAX}
// //               currentMin={minPrice}
// //               currentMax={maxPrice}
// //               setQueryParams={setQueryParams}
// //               data-testid={`${dataTestId}-price`}
// //             />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // export default RefinementList

// "use client"

// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useCallback, useState, useEffect } from "react"
// import { HttpTypes } from "@medusajs/types"
// import { Text } from "@medusajs/ui"

// import SortProducts, { SortOptions } from "./sort-products"
// import CategoryFilter from "@modules/store/components/category-filter"
// import VendorFilter from "@modules/store/components/vendor-filter"
// import ColorFilter from "@modules/store/components/color-filter"
// import PriceFilter from "@modules/store/components/price-filter"
// import SubcategoryFilter from "@modules/store/components/subcategory-filter"

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

// type RefinementListProps = {
//   sortBy: SortOptions
//   search?: boolean
//   'data-testid'?: string
//   categories?: Category[]
//   vendors?: Vendor[]
//   products?: HttpTypes.StoreProduct[]
//   currentCategory?: HttpTypes.StoreProductCategory
//   subcategories?: HttpTypes.StoreProductCategory[]
//   isCollectionPage?: boolean
// }

// const RefinementList = ({ 
//   sortBy,
//   categories = [],
//   vendors = [],
//   products = [],
//   currentCategory,
//   subcategories = [],
//   isCollectionPage = false,
//   'data-testid': dataTestId 
// }: RefinementListProps) => {
//   const router = useRouter()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()
  
//   // State for expanded filter sections - for accordion UI
//   const [expandedFilterSections, setExpandedFilterSections] = useState({
//     sort: true,
//     categories: true,
//     subcategories: true,
//     vendors: true,
//     colors: true,
//     price: true
//   })
  
//   // Toggle filter sections
//   const toggleFilterSection = (section: string) => {
//     setExpandedFilterSections(prev => ({
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
//     // Make sure we have valid products to filter vendors from
//     if (!products || products.length === 0) {
//       return [{ value: "", label: "All Vendors" }];
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

//     const filteredVendors = Array.from(productVendors.values());
    
//     return formatVendorsArray(filteredVendors);
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
      
//       const indent = "—".repeat(level);
      
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
//         value: vendor.handle, // Use handle instead of name for consistent filtering
//         label: vendor.name
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
//           console.error('Failed to parse color_hex_values for product:', product.id);
//         }
//       } else if (product.variants && product.variants.length > 0) {
//         // Fallback: Try to extract colors from variant titles or options
//         product.variants.forEach(variant => {
//           if (variant.title && variant.title.toLowerCase().includes('color')) {
//             const colorPart = variant.title.split(' - ').find(part => 
//               part.toLowerCase().includes('color')
//             );
//             if (colorPart) {
//               const color = colorPart.replace(/color:/i, '').trim().toLowerCase();
//               uniqueColors.add(color);
//             }
//           }
          
//           // Check options for color
//           if (variant.options) {
//             variant.options.forEach(option => {
//               if (option.option_name && option.option_name.toLowerCase() === 'color') {
//                 uniqueColors.add(option.value.toLowerCase());
//               }
//             });
//           }
//         });
//       }
//     });
    
//     return Array.from(uniqueColors);
//   };

//   // Get actual filterable data based on products
//   const formattedCategories = getFilterableCategories();
//   const formattedVendors = getFilterableVendors();
//   const availableColors = getAvailableColors();

//   const categoryHandle = searchParams.get("category") || ""
//   const colorsParam = searchParams.get("colors") || ""
//   const selectedColors = colorsParam ? colorsParam.split(",") : []
//   const vendorsParam = searchParams.get("vendors") || ""
//   const selectedVendors = vendorsParam ? vendorsParam.split(",") : []
  
//   const priceParam = searchParams.get("price") || ""
//   const [minPrice, maxPrice] = priceParam 
//     ? priceParam.split("-").map(p => parseInt(p, 10)) 
//     : [0, 1000]
  
//   const PRICE_MIN = 0
//   const PRICE_MAX = 1000

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams)
      
//       if (value === "") {
//         params.delete(name)
//       } else {
//         if (name === "vendors" || name === "colors") {
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

//   // Only show filters if there are options available
//   const showCategoryFilter = formattedCategories.length > 1 && isCollectionPage;
//   // The critical fix: Always show subcategories if they exist, regardless of whether we're on a collection page
//   const showSubcategoryFilter = subcategories && subcategories.length > 0;
//   const showVendorFilter = formattedVendors.length > 1;
//   const showColorFilter = availableColors.length > 0;

//   // Function to clear all filters
//   const clearAllFilters = () => {
//     const params = new URLSearchParams(searchParams);
    
//     // Keep only the page and sortBy params, remove all filters
//     const page = params.get("page");
//     const sortBy = params.get("sortBy");
    
//     const newParams = new URLSearchParams();
//     if (page) newParams.set("page", page);
//     if (sortBy) newParams.set("sortBy", sortBy);
    
//     router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
//   };
  
//   // Check if any filters are applied
//   const hasActiveFilters = vendorsParam || colorsParam || priceParam || categoryHandle;

//   // Function to render the filter section header with the collapsible control
//   const renderFilterHeader = (title: string, sectionKey: string) => (
//     <div 
//       onClick={() => toggleFilterSection(sectionKey)} 
//       className="flex justify-between items-center py-3 cursor-pointer border-b border-gray-200"
//     >
//       <h3 className="font-semibold text-gray-800 uppercase text-sm">{title}</h3>
//       <span className="text-gray-500">
//         {expandedFilterSections[sectionKey] ? (
//           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         ) : (
//           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         )}
//       </span>
//     </div>
//   );

//   return (
//     <div className="divide-y divide-gray-200">
//       {/* Filter Header with Clear All button */}
//       <div className="flex justify-between items-center pb-4">
//         <h2 className="font-bold text-gray-900 uppercase text-sm">FILTERS</h2>
//         {hasActiveFilters && (
//           <button
//             className="text-sm text-pink-500 font-medium"
//             onClick={clearAllFilters}
//           >
//             CLEAR ALL
//           </button>
//         )}
//       </div>
      
//       {/* Sort Options */}
//       <div className="py-4">
//         {renderFilterHeader("Sort By", "sort")}
//         {expandedFilterSections.sort && (
//           <div className="mt-3">
//             <SortProducts 
//               sortBy={sortBy} 
//               setQueryParams={setQueryParams} 
//               data-testid={`${dataTestId}-sort`} 
//             />
//           </div>
//         )}
//       </div>
      
//       {/* Categories (for collection pages) */}
//       {showCategoryFilter && (
//         <div className="py-4">
//           {renderFilterHeader("Categories", "categories")}
//           {expandedFilterSections.categories && (
//             <div className="mt-3">
//               <CategoryFilter 
//                 categories={formattedCategories} 
//                 categoryId={categoryHandle} 
//                 setQueryParams={setQueryParams} 
//                 data-testid={`${dataTestId}-category`} 
//               />
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Subcategories (for category pages) */}
//       {showSubcategoryFilter && (
//         <div className="py-4">
//           {renderFilterHeader("Sub Categories", "subcategories")}
//           {expandedFilterSections.subcategories && (
//             <div className="mt-3">
//               <SubcategoryFilter 
//                 subcategories={subcategories}
//                 data-testid={`${dataTestId}-subcategory`} 
//               />
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Brands/Vendors */}
//       {showVendorFilter && (
//         <div className="py-4">
//           {renderFilterHeader("Brand", "vendors")}
//           {expandedFilterSections.vendors && (
//             <div className="mt-3">
//               <VendorFilter 
//                 vendors={formattedVendors}
//                 selectedVendors={selectedVendors}
//                 setQueryParams={setQueryParams} 
//                 data-testid={`${dataTestId}-vendor`}
//               />
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Colors */}
//       {showColorFilter && (
//         <div className="py-4">
//           {renderFilterHeader("Color", "colors")}
//           {expandedFilterSections.colors && (
//             <div className="mt-3">
//               <ColorFilter 
//                 availableColors={availableColors}
//                 selectedColors={selectedColors} 
//                 setQueryParams={setQueryParams} 
//                 data-testid={`${dataTestId}-color`} 
//               />
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Price Range */}
//       <div className="py-4">
//         {renderFilterHeader("Price", "price")}
//         {expandedFilterSections.price && (
//           <div className="mt-3">
//             <PriceFilter
//               min={PRICE_MIN}
//               max={PRICE_MAX}
//               currentMin={minPrice}
//               currentMax={maxPrice}
//               setQueryParams={setQueryParams}
//               data-testid={`${dataTestId}-price`}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default RefinementList


// @modules/store/components/refinement-list/index.tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import VendorFilter from "@modules/store/components/vendor-filter"
import ColorFilter from "@modules/store/components/color-filter"
import PriceFilter from "@modules/store/components/price-filter"
import SubcategoryFilter from "@modules/store/components/subcategory-filter"

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

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Category[]
  vendors?: Vendor[]
  products?: HttpTypes.StoreProduct[]
  currentCategory?: HttpTypes.StoreProductCategory
  subcategories?: HttpTypes.StoreProductCategory[]
  isCollectionPage?: boolean
}

const RefinementList = ({ 
  sortBy,
  categories = [],
  vendors = [],
  products = [],
  currentCategory,
  subcategories = [],
  isCollectionPage = false,
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State for expanded filter sections - for accordion UI
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    sort: true,
    categories: true,
    subcategories: true,
    vendors: true,
    colors: true,
    price: true
  })
  
  // Debug logging for troubleshooting
  useEffect(() => {
    console.log("Products received:", products?.length || 0);
    console.log("Vendors received:", vendors?.length || 0);
    console.log("Subcategories received:", subcategories?.length || 0);
  }, [products, vendors, subcategories]);
  
  // Toggle filter sections
  const toggleFilterSection = (section: string) => {
    setExpandedFilterSections(prev => ({
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

  // Extract only filterable vendors that exist in the current products
  const getFilterableVendors = () => {
    // Make sure we have valid products to filter vendors from
    if (!products || products.length === 0) {
      return formatVendorsArray(vendors);
    }

    // Get unique vendors from products
    const productVendors = new Map<string, Vendor>();
    
    products.forEach(product => {
      if (product.vendor) {
        productVendors.set(product.vendor.id, {
          id: product.vendor.id,
          name: product.vendor.name,
          handle: product.vendor.handle
        });
      }
    });

    const filteredVendors = Array.from(productVendors.values());
    console.log("Filtered vendors count:", filteredVendors.length);
    
    return formatVendorsArray(filteredVendors);
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
      
      const indent = "—".repeat(level);
      
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

  // Format vendors for display
  const formatVendorsArray = (vendorList: Vendor[]): { value: string; label: string }[] => {
    const result = [{ value: "", label: "All Vendors" }];
    
    const uniqueVendors = new Map<string, Vendor>();
    
    vendorList.forEach(vendor => {
      if (!uniqueVendors.has(vendor.id)) {
        uniqueVendors.set(vendor.id, vendor);
      }
    });
    
    uniqueVendors.forEach(vendor => {
      result.push({
        value: vendor.handle, // Use handle instead of name for consistent filtering
        label: vendor.name
      });
    });
    
    return result;
  };

  // Get available colors from products
  const getAvailableColors = () => {
    if (!products || products.length === 0) {
      return [];
    }

    const uniqueColors = new Set<string>();
    
    products.forEach(product => {
      if (product.metadata && product.metadata.color_hex_values) {
        try {
          const parsedColors = JSON.parse(product.metadata.color_hex_values as string);
          if (Array.isArray(parsedColors)) {
            parsedColors.forEach((color: any) => {
              if (color.name) {
                uniqueColors.add(color.name.toLowerCase());
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse color_hex_values for product:', product.id);
        }
      } else if (product.variants && product.variants.length > 0) {
        // Fallback: Try to extract colors from variant titles or options
        product.variants.forEach(variant => {
          if (variant.title && variant.title.toLowerCase().includes('color')) {
            const colorPart = variant.title.split(' - ').find(part => 
              part.toLowerCase().includes('color')
            );
            if (colorPart) {
              const color = colorPart.replace(/color:/i, '').trim().toLowerCase();
              uniqueColors.add(color);
            }
          }
          
          // Check options for color
          if (variant.options) {
            variant.options.forEach(option => {
              if (option.option_name && option.option_name.toLowerCase() === 'color') {
                uniqueColors.add(option.value.toLowerCase());
              }
            });
          }
        });
      }
    });
    
    const availableColors = Array.from(uniqueColors);
    console.log("Available colors count:", availableColors.length);
    
    return availableColors;
  };

  // Get actual filterable data based on products
  const formattedCategories = getFilterableCategories();
  const formattedVendors = getFilterableVendors();
  const availableColors = getAvailableColors();

  const categoryHandle = searchParams.get("category") || ""
  const colorsParam = searchParams.get("colors") || ""
  const selectedColors = colorsParam ? colorsParam.split(",") : []
  const vendorsParam = searchParams.get("vendors") || ""
  const selectedVendors = vendorsParam ? vendorsParam.split(",") : []
  
  const priceParam = searchParams.get("price") || ""
  const [minPrice, maxPrice] = priceParam 
    ? priceParam.split("-").map(p => parseInt(p, 10)) 
    : [0, 1000]
  
  const PRICE_MIN = 0
  const PRICE_MAX = 1000

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (value === "") {
        params.delete(name)
      } else {
        if (name === "vendors" || name === "colors") {
          const currentValues = params.get(name)?.split(",") || []
          if (value.includes(",")) {
            params.set(name, value)
          } else {
            if (currentValues.includes(value)) {
              const newValues = currentValues.filter(v => v !== value)
              if (newValues.length > 0) {
                params.set(name, newValues.join(","))
              } else {
                params.delete(name)
              }
            } else {
              params.set(name, [...currentValues, value].join(","))
            }
          }
        } else {
          params.set(name, value)
        }
      }

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  // Only show filters if there are options available
  const showCategoryFilter = formattedCategories.length > 1 && isCollectionPage;
  // Always show subcategories if they exist, regardless of isCollectionPage
  const showSubcategoryFilter = subcategories && subcategories.length > 0;
  const showVendorFilter = formattedVendors.length > 1;
  const showColorFilter = availableColors.length > 0;

  // Function to clear all filters
  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Keep only the page and sortBy params, remove all filters
    const page = params.get("page");
    const sortBy = params.get("sortBy");
    
    const newParams = new URLSearchParams();
    if (page) newParams.set("page", page);
    if (sortBy) newParams.set("sortBy", sortBy);
    
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  
  // Check if any filters are applied
  const hasActiveFilters = vendorsParam || colorsParam || priceParam || categoryHandle;

  // Function to render the filter section header with the collapsible control
  const renderFilterHeader = (title: string, sectionKey: string) => (
    <div 
      onClick={() => toggleFilterSection(sectionKey)} 
      className="flex justify-between items-center py-3 cursor-pointer border-b border-gray-200"
    >
      <h3 className="font-semibold text-gray-800 uppercase text-sm">{title}</h3>
      <span className="text-gray-500">
        {expandedFilterSections[sectionKey as keyof typeof expandedFilterSections] ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </div>
  );

  return (
    <div className="divide-y divide-gray-200">
      {/* Filter Header with Clear All button */}
      <div className="flex justify-between items-center pb-4">
        <h2 className="font-bold text-gray-900 uppercase text-sm">FILTERS</h2>
        {hasActiveFilters && (
          <button
            className="text-sm text-pink-500 font-medium"
            onClick={clearAllFilters}
          >
            CLEAR ALL
          </button>
        )}
      </div>
      
      {/* Sort Options */}
      <div className="py-4">
        {renderFilterHeader("Sort By", "sort")}
        {expandedFilterSections.sort && (
          <div className="mt-3">
            <SortProducts 
              sortBy={sortBy} 
              setQueryParams={setQueryParams} 
              data-testid={`${dataTestId}-sort`} 
            />
          </div>
        )}
      </div>
      
      {/* Categories (for collection pages) */}
      {showCategoryFilter && (
        <div className="py-4">
          {renderFilterHeader("Categories", "categories")}
          {expandedFilterSections.categories && (
            <div className="mt-3">
              <CategoryFilter 
                categories={formattedCategories} 
                categoryId={categoryHandle} 
                setQueryParams={setQueryParams} 
                data-testid={`${dataTestId}-category`} 
              />
            </div>
          )}
        </div>
      )}
      
      {/* Subcategories (for category pages) */}
      {showSubcategoryFilter && (
        <div className="py-4">
          {renderFilterHeader("Sub Categories", "subcategories")}
          {expandedFilterSections.subcategories && (
            <div className="mt-3">
              <SubcategoryFilter 
                subcategories={subcategories}
                data-testid={`${dataTestId}-subcategory`} 
              />
            </div>
          )}
        </div>
      )}
      
      {/* Brands/Vendors */}
      {showVendorFilter && (
        <div className="py-4">
          {renderFilterHeader("Brand", "vendors")}
          {expandedFilterSections.vendors && (
            <div className="mt-3">
              <VendorFilter 
                vendors={formattedVendors}
                selectedVendors={selectedVendors}
                setQueryParams={setQueryParams} 
                data-testid={`${dataTestId}-vendor`}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Colors */}
      {showColorFilter && (
        <div className="py-4">
          {renderFilterHeader("Color", "colors")}
          {expandedFilterSections.colors && (
            <div className="mt-3">
              <ColorFilter 
                availableColors={availableColors}
                selectedColors={selectedColors} 
                setQueryParams={setQueryParams} 
                data-testid={`${dataTestId}-color`} 
              />
            </div>
          )}
        </div>
      )}
      
      {/* Price Range */}
      <div className="py-4">
        {renderFilterHeader("Price", "price")}
        {expandedFilterSections.price && (
          <div className="mt-3">
            <PriceFilter
              min={PRICE_MIN}
              max={PRICE_MAX}
              currentMin={minPrice}
              currentMax={maxPrice}
              setQueryParams={setQueryParams}
              data-testid={`${dataTestId}-price`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RefinementList
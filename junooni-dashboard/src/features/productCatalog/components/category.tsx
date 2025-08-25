// import React, { useState, useEffect, useRef } from 'react';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Separator } from '@/components/ui/separator';
// import { Button } from '@/components/ui/button';
// import { ChevronDown, ChevronRight, X, ArrowLeft } from 'lucide-react';
// import Navbar from './Navbar';
// import { useParams } from '@tanstack/react-router';
// import ProductCard, { ProductCardSkeleton } from './ProductCard';
// import { Link } from '@tanstack/react-router';

// // Use the same environment variable as ProductCard component
// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// // Type definitions from your original file
// type SimplifiedProduct = {
//   id: string;
//   name: string;
//   price: number;
//   originalPrice?: number;
//   rating: number;
//   image: string;
//   availableColors?: string[];
//   category: string[];
//   isNew?: boolean;
//   onSale?: boolean;
//   description?: string;
//   colorOptions?: ColorOption[];
//   sizeOptions?: SizeOption[];
//   printingTechnologies?: PrintingTechnology[];
// };

// interface Image {
//   id: number;
//   alt: string;
//   url: string;
//   width: number;
//   height: number;
//   thumbnailURL?: string | null;
//   filename?: string;
//   mimeType?: string;
//   filesize?: number;
//   focalX?: number;
//   focalY?: number;
//   updatedAt?: string;
//   createdAt?: string;
// }

// interface DisplayImage {
//   id: string;
//   title: string | null;
//   image: Image;
//   caption: string | null;
// }

// interface ColorOption {
//   id: string;
//   colorName: string;
//   colorHex: string;
// }

// interface SizeOption {
//   id: string;
//   sizeName: string;
//   sizeDescription: string | null;
// }

// interface PrintingTechnology {
//   id: string;
//   technologyName: string;
//   customizationAreas: any[];
//   mockupPhotos: any[];
// }

// interface Dimensions {
//   x: number;
//   y: number;
//   customizableWidth: number;
//   customizableHeight: number;
// }

// interface ShippingInfo {
//   weight: number;
//   dimensions: string;
// }

// interface Breadcrumb {
//   id: string;
//   doc: number;
//   url: string;
//   label: string;
// }

// interface Category {
//   id: number;
//   title: string;
//   slug: string;
//   parent: Category | null;
//   breadcrumbs: Breadcrumb[];
//   updatedAt: string;
//   createdAt: string;
//   products?: APIProduct[];
// }

// interface ProductMetadata {
//   isBestSeller: boolean;
//   isStaffPick: boolean;
//   rating: number;
//   reviewCount: number;
// }

// interface Product {
//   id: number;
//   name: string;
//   cost: number;
//   sku: string;
//   brand: string;
//   Brandsku: string | null;
//   dimensions: Dimensions;
//   categories: Category[];
//   colorOptions: ColorOption[];
//   sizeOptions: SizeOption[];
//   sizeChart: any | null;
//   description: string | null;
//   features: any | null;
//   displayImages: DisplayImage[];
//   mockupImages: any[];
//   shippingInfo: ShippingInfo;
//   printingTechnologies: PrintingTechnology[];
//   updatedAt: string;
//   createdAt: string;
// }

// interface APIProduct {
//   id: number;
//   name: string;
//   cost: number;
//   sku: string;
//   brand: string;
//   Brandsku: string | null;
//   dimensions: Dimensions;
//   categories: Category[];
//   colorOptions: ColorOption[];
//   sizeOptions: SizeOption[];
//   sizeChart: any | null;
//   description: string;
//   features: any | null;
//   displayImages: DisplayImage[];
//   mockupImages: any[];
//   shippingInfo: ShippingInfo | null;
//   printingTechnologies: PrintingTechnology[];
//   updatedAt?: string;
//   createdAt?: string;
// }

// // Additional interfaces for filter components
// interface FilterSectionProps {
//   title: string;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
//   isMobile?: boolean;
// }

// interface MobileFilterOverlayProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onReset: () => void;
//   children: React.ReactNode;
// }


// interface ColorFilterProps {
//   colors: ColorOption[];
//   selectedColors: string[]; // Now contains color hex values instead of IDs
//   onChange: (selectedColors: string[]) => void;
// }

// interface CheckboxFilterProps {
//   items: Array<{ id: string; [key: string]: any }>;
//   selectedItems: string[];
//   onChange: (selectedItems: string[]) => void;
//   nameKey?: string;
//   valueKey?: string; // Added to support filtering by a specific property value
// }

// interface CategoryTreeProps {
//   categories: Category[];
//   currentCategoryId?: number | null;
//   onSelectCategory: (slug: string) => void;
// }

// // Helper function to determine if a color is light (for contrasting check mark)
// const isLightColor = (hex: string): boolean => {
//   // Convert hex to RGB
//   const hexWithoutHash = hex.replace('#', '');
//   const r = parseInt(hexWithoutHash.substring(0, 2), 16);
//   const g = parseInt(hexWithoutHash.substring(2, 4), 16);
//   const b = parseInt(hexWithoutHash.substring(4, 6), 16);
  
//   // Calculate perceived brightness (YIQ formula)
//   const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
//   // Return true if color is light (brightness > 128)
//   return brightness > 128;
// };

// // Custom hook for animation styles
// const useStyles = () => {
//   // Add the animation to the document if it doesn't exist
//   useEffect(() => {
//     if (!document.getElementById('slide-in-animation')) {
//       const style = document.createElement('style');
//       style.id = 'slide-in-animation';
//       style.innerHTML = `
//         @keyframes slide-in-right {
//           from {
//             transform: translateX(100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }
        
//         .animate-slide-in-right {
//           animation: slide-in-right 0.3s ease-out forwards;
//         }
//       `;
//       document.head.appendChild(style);
//     }
    
//     return () => {
//       const style = document.getElementById('slide-in-animation');
//       if (style) {
//         style.remove();
//       }
//     };
//   }, []);
// };

// // Mobile filter overlay that slides in from the right
// const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = ({ isOpen, onClose, onReset, children }) => {
//   const overlayRef = useRef<HTMLDivElement>(null);

//   // Handle click outside to close
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
    
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   // Prevent body scroll when overlay is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
    
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-white/90 z-50 flex justify-end">
//       <div 
//         ref={overlayRef}
//         className="bg-white w-full h-full overflow-y-auto shadow-xl animate-slide-in-right"
//       >
//         <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
//           <div className="flex items-center">
//             <button 
//               onClick={onClose}
//               className="mr-2 text-gray-500 hover:text-gray-700"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <h3 className="text-lg font-medium">Filters</h3>
//           </div>
//           <button 
//             onClick={() => {
//               onClose();
//               window.setTimeout(() => {
//                 onReset();
//               }, 100);
//             }}
//             className="text-sm"
//           >
//             Reset all
//           </button>
//         </div>
//         <div className="p-4">
//           {children}
//         </div>
//         <div className="p-4 border-t sticky bottom-0 bg-white">
//           <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
//             Show results
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // Filter section component - now responsive
// const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = false, isMobile = false }) => {
//   const [isOpen, setIsOpen] = useState(defaultOpen);
  
//   // For desktop view (min-width: 768px), always keep sections open
//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(min-width: 768px)');
//     const handleChange = (e: MediaQueryListEvent) => {
//       if (e.matches) {
//         setIsOpen(true);
//       } else if (!defaultOpen) {
//         setIsOpen(false);
//       }
//     };

//     // Set initial state based on current screen size
//     if (mediaQuery.matches) {
//       setIsOpen(true);
//     }

//     // Listen for changes
//     mediaQuery.addEventListener('change', handleChange);
    
//     return () => {
//       mediaQuery.removeEventListener('change', handleChange);
//     };
//   }, [defaultOpen]);

//   // In mobile mode, don't render the collapsible section
//   if (isMobile) {
//     return <>{children}</>;
//   }
  
//   return (
//     <div className="mb-4">
//       <button 
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center justify-between w-full py-2 text-left font-medium md:cursor-default"
//       >
//         {title}
//         <span className="md:hidden">
//           {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//         </span>
//       </button>
//       {isOpen && <div className="mt-2 pl-2">{children}</div>}
//     </div>
//   );
// };

// const ColorFilter: React.FC<ColorFilterProps> = ({ colors, selectedColors, onChange }) => {
//   // Deduplicate colors by colorHex value - this ensures we only show each unique color once
//   const uniqueColors = colors.filter((color, index, self) => 
//     index === self.findIndex((c) => c.colorHex === color.colorHex)
//   );
  
//   return (
//     <div className="flex flex-wrap gap-2">
//       {uniqueColors.map((color) => {
//         const isSelected = selectedColors.includes(color.colorHex);
//         return (
//           <button
//             key={color.colorHex}
//             type="button"
//             title={color.colorName}
//             aria-label={`${color.colorName} ${isSelected ? 'selected' : ''}`}
//             onClick={() => {
//               if (isSelected) {
//                 onChange(selectedColors.filter((hex) => hex !== color.colorHex));
//               } else {
//                 onChange([...selectedColors, color.colorHex]);
//               }
//             }}
//             className={`
//               w-7 h-7 rounded-full 
//               flex items-center justify-center
//               transition-all duration-200
//               ${isSelected ? 'ring-2 ring-offset-1 ring-black' : 'ring-1 ring-gray-200'}
//               ${color.colorHex.toLowerCase() === '#ffffff' || color.colorHex.toLowerCase() === '#fff' ? 'border border-gray-200' : ''}
//             `}
//             style={{ backgroundColor: color.colorHex }}
//           >
//             {isSelected && (
//               <span className={`text-xs ${isLightColor(color.colorHex) ? 'text-black' : 'text-white'}`}>
//                 ✓
//               </span>
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ 
//   items, 
//   selectedItems, 
//   onChange, 
//   nameKey = 'name',
//   valueKey
// }) => {
//   // Get the value to use for filtering - either the specified valueKey or fallback to id
//   const getItemValue = (item: any): string => {
//     if (valueKey && item[valueKey]) {
//       return item[valueKey];
//     }
//     return item.id;
//   };

//   // Deduplicate items based on the value we're filtering by
//   const uniqueItems = valueKey 
//     ? items.filter((item, index, self) => 
//         index === self.findIndex(i => i[valueKey] === item[valueKey])
//       )
//     : items;
  
//   return (
//     <div className="space-y-2">
//       {uniqueItems.map((item) => {
//         const value = getItemValue(item);
//         return (
//           <label key={value} className="flex items-center space-x-2 cursor-pointer">
//             <Checkbox 
//               checked={selectedItems.includes(value)} 
//               onCheckedChange={(checked) => {
//                 if (checked) {
//                   onChange([...selectedItems, value]);
//                 } else {
//                   onChange(selectedItems.filter((v) => v !== value));
//                 }
//               }}
//             />
//             <span className="text-sm">{item[nameKey]}</span>
//           </label>
//         );
//       })}
//     </div>
//   );
// };

// const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, currentCategoryId, onSelectCategory }) => {
//   // Find parent categories (those with no parent)
//   const parentCategories = categories.filter((cat) => !cat.parent);
  
//   // Function to recursively render a category and its children
//   const renderCategory = (category: Category) => {
//     // Find children
//     const children = categories.filter((cat) => 
//       cat.parent && cat.parent.id === category.id
//     );
    
//     const isActive = category.id === currentCategoryId;
    
//     return (
//       <div key={category.id} className="ml-2">
//         <button 
//           onClick={() => onSelectCategory(category.slug)}
//           className={`text-left hover:underline text-sm py-1 ${isActive ? 'font-bold' : ''}`}
//         >
//           {category.title}
//         </button>
//         {children.length > 0 && (
//           <div className="pl-3 border-l border-gray-200">
//             {children.map((child) => renderCategory(child))}
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   return (
//     <div className="space-y-1">
//       {parentCategories.map((cat) => renderCategory(cat))}
//     </div>
//   );
// };

// const CategoryPage: React.FC = () => {
//   // Add animation styles
//   useStyles();
  
//   const [simplifiedProducts, setSimplifiedProducts] = useState<SimplifiedProduct[]>([]);
//   const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<SimplifiedProduct[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  
//   // Filter states
//   const [selectedColorHexes, setSelectedColorHexes] = useState<string[]>([]);
//   const [selectedSizeNames, setSelectedSizeNames] = useState<string[]>([]);
//   const [selectedTechnologyNames, setSelectedTechnologyNames] = useState<string[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
//   // Mobile filter overlay states
//   const [activeFilterOverlay, setActiveFilterOverlay] = useState<string | null>(null);
//   const [isMobileView, setIsMobileView] = useState<boolean>(false);
  
//   // Available filter options (populated from products)
//   const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
//   const [availableSizes, setAvailableSizes] = useState<SizeOption[]>([]);
//   const [availableTechnologies, setAvailableTechnologies] = useState<PrintingTechnology[]>([]);

//   const params = useParams({strict:false});
//   const slug = params.slug as string;

//   // Check if we're in mobile view
//   useEffect(() => {
//     const checkMobileView = () => {
//       setIsMobileView(window.innerWidth < 768);
//     };
    
//     // Initial check
//     checkMobileView();
    
//     // Add resize listener
//     window.addEventListener('resize', checkMobileView);
    
//     return () => {
//       window.removeEventListener('resize', checkMobileView);
//     };
//   }, []);

//   // Open a specific filter overlay on mobile
//   const openFilterOverlay = (): void => {
//     setActiveFilterOverlay('all');
//   };

//   // Close the active filter overlay
//   const closeFilterOverlay = () => {
//     setActiveFilterOverlay(null);
//   };
  
//   // Get the count of active filters
//   const getTotalActiveFilterCount = (): number => {
//     return selectedColorHexes.length + 
//            selectedSizeNames.length + 
//            selectedTechnologyNames.length + 
//            selectedCategories.length;
//   };

//   // Fetch categories and products from API
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch(`${vite_payload}/api/categories`);
//         const data = await response.json();
//         setCategories(data.docs);
        
//         // Find the category matching the current slug
//         const matchedCategory = data.docs.find((item: Category) => item.slug === slug);
        
//         if (matchedCategory && matchedCategory.products) {
//           setCurrentCategory(matchedCategory);
//           console.log("Found category with products:", matchedCategory.title);
          
//           // Store the original API products
//           setApiProducts(matchedCategory.products);
          
//           // Extract all available filter options
//           const colors: ColorOption[] = [];
//           const sizes: SizeOption[] = [];
//           const technologies: PrintingTechnology[] = [];
          
//           matchedCategory.products.forEach((product: APIProduct) => {
//             // Add colors
//             if (product.colorOptions && product.colorOptions.length > 0) {
//               product.colorOptions.forEach((color: ColorOption) => {
//                 // Only add if not already in our array
//                 if (!colors.some((c) => c.id === color.id)) {
//                   colors.push(color);
//                 }
//               });
//             }
            
//             // Add sizes
//             if (product.sizeOptions && product.sizeOptions.length > 0) {
//               product.sizeOptions.forEach((size: SizeOption) => {
//                 if (!sizes.some((s) => s.id === size.id)) {
//                   sizes.push(size);
//                 }
//               });
//             }
            
//             // Add printing technologies
//             if (product.printingTechnologies && product.printingTechnologies.length > 0) {
//               product.printingTechnologies.forEach((tech: PrintingTechnology) => {
//                 if (!technologies.some((t) => t.id === tech.id)) {
//                   technologies.push(tech);
//                 }
//               });
//             }
//           });
          
//           setAvailableColors(colors);
//           setAvailableSizes(sizes);
//           setAvailableTechnologies(technologies);
          
//           // Convert API products to the simplified Product type for internal state
//           const formattedProducts: SimplifiedProduct[] = matchedCategory.products.map((apiProduct: APIProduct) => {
//             // Extract color hex values from the API color options
//             const productColors = apiProduct.colorOptions?.map((color: ColorOption) => color.colorHex) || [];
            
//             return {
//               id: String(apiProduct.id), // Keep as string for internal state
//               name: apiProduct.name,
//               price: apiProduct.cost, // Map 'cost' to 'price'
//               rating: 4.5, // Default rating if not in API
//               image: apiProduct.displayImages && apiProduct.displayImages.length > 0 
//                 ? apiProduct.displayImages[0].image.url 
//                 : '/placeholder-image.jpg',
//               category: apiProduct.categories.map((cat: Category) => cat.slug),
//               availableColors: productColors,
//               colorOptions: apiProduct.colorOptions || [],
//               sizeOptions: apiProduct.sizeOptions || [],
//               printingTechnologies: apiProduct.printingTechnologies || [],
//               description: apiProduct.description,
//               isNew: false, // Set default if not available in API
//               onSale: false, // Set default if not available in API
//             };
//           });
          
//           // Sort products by newest (default)
//           const sortedProducts = formattedProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
//           setSimplifiedProducts(sortedProducts);
//           setFilteredProducts(sortedProducts);
          
//           console.log("Set products:", formattedProducts.length);
//         } else {
//           console.log("No matching category found for slug:", slug);
//           setSimplifiedProducts([]);
//           setApiProducts([]);
//           setFilteredProducts([]);
//         }
        
//         setLoadingCategories(false);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//         setLoadingCategories(false);
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, [slug]);

//   // Apply filters when filter selections change
//   useEffect(() => {
//     if (simplifiedProducts.length === 0) return;
    
//     let results = [...simplifiedProducts];
    
//     // Filter by colors - now using colorHex values for matching
//     if (selectedColorHexes.length > 0) {
//       results = results.filter(product => 
//         product.colorOptions && product.colorOptions.some(color => 
//           selectedColorHexes.includes(color.colorHex)
//         )
//       );
//     }
    
//     // Filter by sizes - now using sizeName values for matching
//     if (selectedSizeNames.length > 0) {
//       results = results.filter(product => 
//         product.sizeOptions && product.sizeOptions.some(size => 
//           selectedSizeNames.includes(size.sizeName)
//         )
//       );
//     }
    
//     // Filter by printing technologies - now using technologyName for matching
//     if (selectedTechnologyNames.length > 0) {
//       results = results.filter(product => 
//         product.printingTechnologies && product.printingTechnologies.some(tech => 
//           selectedTechnologyNames.includes(tech.technologyName)
//         )
//       );
//     }
    
//     // Filter by categories (subcategories)
//     if (selectedCategories.length > 0) {
//       results = results.filter(product => 
//         product.category && product.category.some(cat => 
//           selectedCategories.includes(cat)
//         )
//       );
//     }
    
//     setFilteredProducts(results);
//   }, [simplifiedProducts, selectedColorHexes, selectedSizeNames, selectedTechnologyNames, selectedCategories]);

//   // Helper function to create metadata for ProductCard
//   const createProductMetadata = (productId: string): ProductMetadata => {
//     // Find the simplified product to get rating
//     const simplifiedProduct = simplifiedProducts.find(p => p.id === productId);
//     const rating = simplifiedProduct ? simplifiedProduct.rating : 4.5;
    
//     return {
//       isBestSeller: false, // Could be determined by sales data or other criteria
//       isStaffPick: false, // Could be a flag you set elsewhere
//       rating: rating,
//       reviewCount: Math.floor(10 + Math.random() * 140) // Just for demonstration
//     };
//   };

//   // Helper function to convert API product to the format expected by ProductCard
//   const getProductCardData = (productId: string): Product | null => {
//     // Find the original API product that matches this id
//     const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
    
//     if (!apiProduct) return null;
    
//     // Map to the exact Product interface expected by ProductCard and ProductPage
//     return {
//       id: apiProduct.id,
//       name: apiProduct.name,
//       cost: apiProduct.cost,
//       sku: apiProduct.sku,
//       brand: apiProduct.brand,
//       Brandsku: apiProduct.Brandsku,
//       dimensions: apiProduct.dimensions,
//       categories: apiProduct.categories,
//       colorOptions: apiProduct.colorOptions || [],
//       sizeOptions: apiProduct.sizeOptions || [],
//       sizeChart: apiProduct.sizeChart,
//       description: apiProduct.description,
//       features: apiProduct.features,
//       displayImages: apiProduct.displayImages || [],
//       mockupImages: apiProduct.mockupImages || [],
//       shippingInfo: apiProduct.shippingInfo || { weight: 0, dimensions: "0x0" },
//       printingTechnologies: apiProduct.printingTechnologies || [],
//       updatedAt: apiProduct.updatedAt || new Date().toISOString(),
//       createdAt: apiProduct.createdAt || new Date().toISOString()
//     };
//   };

//   // This function helps store the complete product data in sessionStorage
//   const storeCompleteProductData = (productId: string): void => {
//     const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
//     if (apiProduct) {
//       // Store the complete API product data for the product page to use
//       sessionStorage.setItem(`product_${apiProduct.id}`, JSON.stringify(apiProduct));
//     }
//   };
  
//   // Handle category selection
//   const handleCategorySelect = (categorySlug: string): void => {
//     // Navigate to the selected category
//     window.location.href = `/productCatalog/category/${categorySlug}`;
//   };
  
//   // Clear all filters
//   const clearAllFilters = (): void => {
//     setSelectedColorHexes([]);
//     setSelectedSizeNames([]);
//     setSelectedTechnologyNames([]);
//     setSelectedCategories([]);
//   };

//   return (
//     <>
//       <Navbar/>
//       <div className="container py-6 mx-auto">
//         <h1 className="mb-6 text-3xl font-bold">
//           {currentCategory ? currentCategory.title : "Online Store Essentials"}
//         </h1>
        
//         {/* Breadcrumb Navigation based on Category */}
//         {!loadingCategories && currentCategory && (
//           <div className="flex items-center mb-4 text-sm">
//             <a href="/" className="hover:underline">Home</a>
//             <span className="mx-2">/</span>
//             {currentCategory.breadcrumbs.map((crumb, idx) => (
//               <div key={crumb.id} className="flex items-center">
//                 {idx > 0 && <span className="mx-2">/</span>}
//                 <a href={crumb.url} className="hover:underline">{crumb.label}</a>
//               </div>
//             ))}
//           </div>
//         )}
        
//         {/* Category Pill Navigation */}
//         <div className="md:hidden flex flex-nowrap overflow-x-auto mb-4 gap-2 pb-2">
//           {
//             categories.map((item)=>(
//               <div className="border-gray-400 border rounded-full px-4 py-2 whitespace-nowrap text-sm">
//             <Link to={`/productCatalog/category/${item.slug}`}>
//                {item.title}
//             </Link>
//           </div>
//             ))
//           }
          
//         </div>
        
//         {/* Filter Button and Product Count */}
//         <div className="md:hidden flex items-center justify-between mb-4">
//           <div className="text-sm text-gray-700">
//             {filteredProducts.length} products
//           </div>
//           {isMobileView && (
//             <Button 
//               variant="outline"
//               size="sm"
//               className="flex items-center gap-1"
//               onClick={() => openFilterOverlay()}
//             >
//               <span>Filters</span>
//               {getTotalActiveFilterCount() > 0 && (
//                 <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
//                   {getTotalActiveFilterCount()}
//                 </Badge>
//               )}
//             </Button>
//           )}
//         </div>
        
//         <div className="flex flex-col md:flex-row gap-6">
//           {/* Filter Sidebar - Desktop version */}
//           <div className="w-full md:w-64 flex-shrink-0 hidden md:block">
//             {loading ? (
//               <div className="h-96 rounded-md bg-gray-100 animate-pulse"></div>
//             ) : (
//               <>
//                 {/* Desktop Filter Sections */}
//                 <div className="mb-6">
//                   <h3 className="mb-3 text-lg font-medium">Categories</h3>
//                   <CategoryTree 
//                     categories={categories} 
//                     currentCategoryId={currentCategory?.id}
//                     onSelectCategory={handleCategorySelect}
//                   />
//                 </div>
                
//                 <Separator className="my-4" />
                
//                 {/* Active Filters Summary */}
//                 {(selectedColorHexes.length > 0 || selectedSizeNames.length > 0 || 
//                   selectedTechnologyNames.length > 0 || selectedCategories.length > 0) && (
//                   <div className="mb-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="text-sm font-medium">Active Filters</h3>
//                       <Button 
//                         variant="ghost" 
//                         size="sm" 
//                         onClick={clearAllFilters}
//                         className="h-7 text-xs"
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                     <div className="flex flex-wrap gap-1">
//                       {selectedColorHexes.map(colorHex => {
//                         // Find the first color with this hex value
//                         const color = availableColors.find(c => c.colorHex === colorHex);
//                         return color ? (
//                           <Badge 
//                             key={`color-${colorHex}`} 
//                             variant="outline"
//                             className="flex items-center gap-1 pl-2"
//                           >
//                             <span 
//                               className="w-2 h-2 rounded-full" 
//                               style={{ backgroundColor: colorHex }}
//                             />
//                             {color.colorName}
//                             <button
//                               onClick={() => setSelectedColorHexes(selectedColorHexes.filter(hex => hex !== colorHex))}
//                               className="ml-1"
//                             >
//                               <X size={12} />
//                             </button>
//                           </Badge>
//                         ) : null;
//                       })}
                      
//                       {selectedSizeNames.map(sizeName => {
//                         // Find the first size with this name
//                         const size = availableSizes.find(s => s.sizeName === sizeName);
//                         return size ? (
//                           <Badge 
//                             key={`size-${sizeName}`} 
//                             variant="outline"
//                             className="flex items-center gap-1 pl-2"
//                           >
//                             {sizeName}
//                             <button
//                               onClick={() => setSelectedSizeNames(selectedSizeNames.filter(name => name !== sizeName))}
//                               className="ml-1"
//                             >
//                               <X size={12} />
//                             </button>
//                           </Badge>
//                         ) : null;
//                       })}
                      
//                       {selectedTechnologyNames.map(techName => {
//                         // Find the first technology with this name
//                         const tech = availableTechnologies.find(t => t.technologyName === techName);
//                         return tech ? (
//                           <Badge 
//                             key={`tech-${techName}`} 
//                             variant="outline"
//                             className="flex items-center gap-1 pl-2"
//                           >
//                             {techName}
//                             <button
//                               onClick={() => setSelectedTechnologyNames(selectedTechnologyNames.filter(name => name !== techName))}
//                               className="ml-1"
//                             >
//                               <X size={12} />
//                             </button>
//                           </Badge>
//                         ) : null;
//                       })}
//                     </div>
//                   </div>
//                 )}
                
//                 <Separator className="my-4" />
                
//                 {/* Color Filter */}
//                 {availableColors.length > 0 && (
//                   <FilterSection title="Colors" defaultOpen={true}>
//                     <ColorFilter 
//                       colors={availableColors}
//                       selectedColors={selectedColorHexes}
//                       onChange={setSelectedColorHexes}
//                     />
//                   </FilterSection>
//                 )}
                
//                 {/* Size Filter */}
//                 {availableSizes.length > 0 && (
//                   <FilterSection title="Sizes">
//                     <CheckboxFilter 
//                       items={availableSizes}
//                       selectedItems={selectedSizeNames}
//                       onChange={setSelectedSizeNames}
//                       nameKey="sizeName"
//                       valueKey="sizeName"
//                     />
//                   </FilterSection>
//                 )}
                
//                 {/* Printing Technologies Filter */}
//                 {availableTechnologies.length > 0 && (
//                   <FilterSection title="Printing Technologies">
//                     <CheckboxFilter 
//                       items={availableTechnologies}
//                       selectedItems={selectedTechnologyNames}
//                       onChange={setSelectedTechnologyNames}
//                       nameKey="technologyName"
//                       valueKey="technologyName"
//                     />
//                   </FilterSection>
//                 )}
//               </>
//             )}
//           </div>
          
//           {/* Mobile Filter Overlay - Main one with all filters */}
//           {isMobileView && (
//             <MobileFilterOverlay
//               isOpen={activeFilterOverlay === 'all'}
//               onClose={closeFilterOverlay}
//               onReset={clearAllFilters}
//             >
             
             
              
            
              
//               {/* Colors */}
//               {availableColors.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="text-base font-medium mb-4">Colors</h3>
//                   <ColorFilter 
//                     colors={availableColors}
//                     selectedColors={selectedColorHexes}
//                     onChange={setSelectedColorHexes}
//                   />
//                 </div>
//               )}
              
//               <Separator className="my-4" />
              
//               {/* Other filters */}
//               {availableSizes.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="text-base font-medium mb-2">Sizes</h3>
//                   <CheckboxFilter 
//                     items={availableSizes}
//                     selectedItems={selectedSizeNames}
//                     onChange={setSelectedSizeNames}
//                     nameKey="sizeName"
//                     valueKey="sizeName"
//                   />
//                 </div>
//               )}
              
//               {availableTechnologies.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="text-base font-medium mb-2">Printing Technologies</h3>
//                   <CheckboxFilter 
//                     items={availableTechnologies}
//                     selectedItems={selectedTechnologyNames}
//                     onChange={setSelectedTechnologyNames}
//                     nameKey="technologyName"
//                     valueKey="technologyName"
//                   />
//                 </div>
//               )}
//             </MobileFilterOverlay>
//           )}
          
          
//           {/* Products Grid */}
//           <div className="flex-1">
//             {loading ? (
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <ProductCardSkeleton key={index} />
//                 ))}
//               </div>
//             ) : (
//               <>
//                 <div className="hidden md:block mb-4">
//                   <span className="text-sm text-gray-500">
//                     {filteredProducts.length} products found
//                   </span>
//                 </div>
                
//                 {filteredProducts.length === 0 ? (
//                   <div className="p-6 text-center bg-gray-50 rounded-md">
//                     <h3 className="mb-2 text-lg font-medium">No products match your filters</h3>
//                     <p className="text-gray-500">Try adjusting your filter criteria or</p>
//                     <Button 
//                       onClick={clearAllFilters} 
//                       variant="outline" 
//                       className="mt-2"
//                     >
//                       Clear all filters
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                     {filteredProducts.map((product) => {
//                       // Get the product card data format
//                       const productCardData = getProductCardData(product.id);
//                       // Create metadata
//                       const productCardMetadata = createProductMetadata(product.id);
                      
//                       if (!productCardData) return null;
                      
//                       return (
//                         <div 
//                           key={product.id} 
//                           className="relative w-full max-w-full mx-auto"
//                           onClick={() => storeCompleteProductData(product.id)}
//                         >
//                           <ProductCard 
//                             product={productCardData}
//                             metadata={productCardMetadata}
//                           />
                          
//                           {/* Additional badges that aren't part of the standard ProductCard */}
//                           {product.isNew && (
//                             <Badge className="absolute top-2 left-2 z-20">New</Badge>
//                           )}
//                           {product.onSale && (
//                             <Badge variant="destructive" className="absolute top-2 right-2 z-20">
//                               Sale
//                             </Badge>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CategoryPage;

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, X, ArrowLeft, Filter, Grid, List, Search } from 'lucide-react';
import Navbar from './Navbar';
import { useParams } from '@tanstack/react-router';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { Link } from '@tanstack/react-router';

// Use the same environment variable as ProductCard component
const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Type definitions from your original file
type SimplifiedProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  availableColors?: string[];
  category: string[];
  isNew?: boolean;
  onSale?: boolean;
  description?: string;
  colorOptions?: ColorOption[];
  sizeOptions?: SizeOption[];
  printingTechnologies?: PrintingTechnology[];
};

interface Image {
  id: number;
  alt: string;
  url: string;
  width: number;
  height: number;
  thumbnailURL?: string | null;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  focalX?: number;
  focalY?: number;
  updatedAt?: string;
  createdAt?: string;
}

interface DisplayImage {
  id: string;
  title: string | null;
  image: Image;
  caption: string | null;
}

interface ColorOption {
  id: string;
  colorName: string;
  colorHex: string;
}

interface SizeOption {
  id: string;
  sizeName: string;
  sizeDescription: string | null;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: any[];
  mockupPhotos: any[];
}

interface Dimensions {
  x: number;
  y: number;
  customizableWidth: number;
  customizableHeight: number;
}

interface ShippingInfo {
  weight: number;
  dimensions: string;
}

interface Breadcrumb {
  id: string;
  doc: number;
  url: string;
  label: string;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  parent: Category | null;
  breadcrumbs: Breadcrumb[];
  updatedAt: string;
  createdAt: string;
  products?: APIProduct[];
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  Brandsku: string | null;
  dimensions: Dimensions;
  categories: Category[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  sizeChart: any | null;
  description: string | null;
  features: any | null;
  displayImages: DisplayImage[];
  mockupImages: any[];
  shippingInfo: ShippingInfo;
  printingTechnologies: PrintingTechnology[];
  updatedAt: string;
  createdAt: string;
}

interface APIProduct {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  Brandsku: string | null;
  dimensions: Dimensions;
  categories: Category[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  sizeChart: any | null;
  description: string;
  features: any | null;
  displayImages: DisplayImage[];
  mockupImages: any[];
  shippingInfo: ShippingInfo | null;
  printingTechnologies: PrintingTechnology[];
  updatedAt?: string;
  createdAt?: string;
}

// Additional interfaces for filter components
interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isMobile?: boolean;
}

interface MobileFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

interface ColorFilterProps {
  colors: ColorOption[];
  selectedColors: string[]; // Now contains color hex values instead of IDs
  onChange: (selectedColors: string[]) => void;
}

interface CheckboxFilterProps {
  items: Array<{ id: string; [key: string]: any }>;
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
  nameKey?: string;
  valueKey?: string; // Added to support filtering by a specific property value
}

interface CategoryTreeProps {
  categories: Category[];
  currentCategoryId?: number | null;
  onSelectCategory: (slug: string) => void;
}

// Helper function to determine if a color is light (for contrasting check mark)
const isLightColor = (hex: string): boolean => {
  // Convert hex to RGB
  const hexWithoutHash = hex.replace('#', '');
  const r = parseInt(hexWithoutHash.substring(0, 2), 16);
  const g = parseInt(hexWithoutHash.substring(2, 4), 16);
  const b = parseInt(hexWithoutHash.substring(4, 6), 16);
  
  // Calculate perceived brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is light (brightness > 128)
  return brightness > 128;
};

// Custom hook for animation styles
const useStyles = () => {
  // Add the animation to the document if it doesn't exist
  useEffect(() => {
    if (!document.getElementById('slide-in-animation')) {
      const style = document.createElement('style');
      style.id = 'slide-in-animation';
      style.innerHTML = `
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .filter-section {
          transition: all 0.2s ease-out;
        }
        
        .filter-section:hover {
          background-color: #fef7f0;
        }
        
        .category-pill {
          transition: all 0.2s ease-out;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 1px solid #e2e8f0;
        }
        
        .category-pill:hover {
          background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
          border-color: #e65100;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(230, 81, 0, 0.15);
        }
        
        .category-pill.active {
          background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
          border-color: #e65100;
          color: white;
          box-shadow: 0 2px 8px rgba(230, 81, 0, 0.2);
        }
        
        .filter-badge {
          background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
          color: white;
          border: none;
        }
        
        .product-grid {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.1s forwards;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const style = document.getElementById('slide-in-animation');
      if (style) {
        style.remove();
      }
    };
  }, []);
};

// Mobile filter overlay that slides in from the right
const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = ({ isOpen, onClose, onReset, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div 
        ref={overlayRef}
        className="bg-white w-full h-full overflow-y-auto shadow-2xl animate-slide-in-right"
      >
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-amber-50 sticky top-0 bg-white z-10 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-3 text-gray-600 hover:text-[#e65100] transition-colors p-1 rounded-lg hover:bg-orange-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
          </div>
          <button 
            onClick={() => {
              onClose();
              window.setTimeout(() => {
                onReset();
              }, 100);
            }}
            className="text-sm font-medium text-[#e65100] hover:text-orange-700 transition-colors px-3 py-1 rounded-lg hover:bg-orange-100"
          >
            Reset all
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-6 border-t bg-gray-50 sticky bottom-0 bg-white">
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-[#e65100] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
};

// Filter section component - now responsive
const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = false, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // For desktop view (min-width: 768px), always keep sections open
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsOpen(true);
      } else if (!defaultOpen) {
        setIsOpen(false);
      }
    };

    // Set initial state based on current screen size
    if (mediaQuery.matches) {
      setIsOpen(true);
    }

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [defaultOpen]);

  // In mobile mode, don't render the collapsible section
  if (isMobile) {
    return <>{children}</>;
  }
  
  return (
    <div className="mb-6 filter-section rounded-xl p-4 border border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left font-semibold text-gray-900 md:cursor-default hover:text-[#e65100] transition-colors"
      >
        {title}
        <span className="md:hidden">
          {isOpen ? <ChevronDown size={16} className="text-[#e65100]" /> : <ChevronRight size={16} className="text-[#e65100]" />}
        </span>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const ColorFilter: React.FC<ColorFilterProps> = ({ colors, selectedColors, onChange }) => {
  // Deduplicate colors by colorHex value - this ensures we only show each unique color once
  const uniqueColors = colors.filter((color, index, self) => 
    index === self.findIndex((c) => c.colorHex === color.colorHex)
  );
  
  return (
    <div className="flex flex-wrap gap-3">
      {uniqueColors.map((color) => {
        const isSelected = selectedColors.includes(color.colorHex);
        return (
          <button
            key={color.colorHex}
            type="button"
            title={color.colorName}
            aria-label={`${color.colorName} ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              if (isSelected) {
                onChange(selectedColors.filter((hex) => hex !== color.colorHex));
              } else {
                onChange([...selectedColors, color.colorHex]);
              }
            }}
            className={`
              w-9 h-9 rounded-full 
              flex items-center justify-center
              transition-all duration-200 transform hover:scale-110
              ${isSelected ? 'ring-3 ring-[#e65100] ring-offset-2 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300'}
              ${color.colorHex.toLowerCase() === '#ffffff' || color.colorHex.toLowerCase() === '#fff' ? 'border border-gray-200' : ''}
            `}
            style={{ backgroundColor: color.colorHex }}
          >
            {isSelected && (
              <span className={`text-sm font-bold ${isLightColor(color.colorHex) ? 'text-black' : 'text-white'}`}>
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ 
  items, 
  selectedItems, 
  onChange, 
  nameKey = 'name',
  valueKey
}) => {
  // Get the value to use for filtering - either the specified valueKey or fallback to id
  const getItemValue = (item: any): string => {
    if (valueKey && item[valueKey]) {
      return item[valueKey];
    }
    return item.id;
  };

  // Deduplicate items based on the value we're filtering by
  const uniqueItems = valueKey 
    ? items.filter((item, index, self) => 
        index === self.findIndex(i => i[valueKey] === item[valueKey])
      )
    : items;
  
  return (
    <div className="space-y-3">
      {uniqueItems.map((item) => {
        const value = getItemValue(item);
        const isSelected = selectedItems.includes(value);
        return (
          <label key={value} className="flex items-center space-x-3 cursor-pointer group hover:bg-orange-50 p-2 rounded-lg transition-colors">
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selectedItems, value]);
                } else {
                  onChange(selectedItems.filter((v) => v !== value));
                }
              }}
              className="data-[state=checked]:bg-[#e65100] data-[state=checked]:border-[#e65100]"
            />
            <span className={`text-sm transition-colors ${isSelected ? 'text-[#e65100] font-medium' : 'text-gray-700 group-hover:text-[#e65100]'}`}>
              {item[nameKey]}
            </span>
          </label>
        );
      })}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, currentCategoryId, onSelectCategory }) => {
  // Find parent categories (those with no parent)
  const parentCategories = categories.filter((cat) => !cat.parent);
  
  // Function to recursively render a category and its children
  const renderCategory = (category: Category) => {
    // Find children
    const children = categories.filter((cat) => 
      cat.parent && cat.parent.id === category.id
    );
    
    const isActive = category.id === currentCategoryId;
    
    return (
      <div key={category.id} className="ml-2">
        <button 
          onClick={() => onSelectCategory(category.slug)}
          className={`text-left hover:text-[#e65100] text-sm py-2 px-3 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'font-semibold text-[#e65100] bg-orange-50' 
              : 'text-gray-700 hover:bg-orange-50'
          }`}
        >
          {category.title}
        </button>
        {children.length > 0 && (
          <div className="pl-4 border-l-2 border-orange-100 ml-2">
            {children.map((child) => renderCategory(child))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-1">
      {parentCategories.map((cat) => renderCategory(cat))}
    </div>
  );
};

const CategoryPage: React.FC = () => {
  // Add animation styles
  useStyles();
  
  const [simplifiedProducts, setSimplifiedProducts] = useState<SimplifiedProduct[]>([]);
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SimplifiedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  
  // Filter states
  const [selectedColorHexes, setSelectedColorHexes] = useState<string[]>([]);
  const [selectedSizeNames, setSelectedSizeNames] = useState<string[]>([]);
  const [selectedTechnologyNames, setSelectedTechnologyNames] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Mobile filter overlay states
  const [activeFilterOverlay, setActiveFilterOverlay] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  
  // Available filter options (populated from products)
  const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
  const [availableSizes, setAvailableSizes] = useState<SizeOption[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<PrintingTechnology[]>([]);

  const params = useParams({strict:false});
  const slug = params.slug as string;

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Open a specific filter overlay on mobile
  const openFilterOverlay = (): void => {
    setActiveFilterOverlay('all');
  };

  // Close the active filter overlay
  const closeFilterOverlay = () => {
    setActiveFilterOverlay(null);
  };
  
  // Get the count of active filters
  const getTotalActiveFilterCount = (): number => {
    return selectedColorHexes.length + 
           selectedSizeNames.length + 
           selectedTechnologyNames.length + 
           selectedCategories.length;
  };

  // Fetch categories and products from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${vite_payload}/api/categories`);
        const data = await response.json();
        setCategories(data.docs);
        
        // Find the category matching the current slug
        const matchedCategory = data.docs.find((item: Category) => item.slug === slug);
        
        if (matchedCategory && matchedCategory.products) {
          setCurrentCategory(matchedCategory);
          console.log("Found category with products:", matchedCategory.title);
          
          // Store the original API products
          setApiProducts(matchedCategory.products);
          
          // Extract all available filter options
          const colors: ColorOption[] = [];
          const sizes: SizeOption[] = [];
          const technologies: PrintingTechnology[] = [];
          
          matchedCategory.products.forEach((product: APIProduct) => {
            // Add colors
            if (product.colorOptions && product.colorOptions.length > 0) {
              product.colorOptions.forEach((color: ColorOption) => {
                // Only add if not already in our array
                if (!colors.some((c) => c.id === color.id)) {
                  colors.push(color);
                }
              });
            }
            
            // Add sizes
            if (product.sizeOptions && product.sizeOptions.length > 0) {
              product.sizeOptions.forEach((size: SizeOption) => {
                if (!sizes.some((s) => s.id === size.id)) {
                  sizes.push(size);
                }
              });
            }
            
            // Add printing technologies
            if (product.printingTechnologies && product.printingTechnologies.length > 0) {
              product.printingTechnologies.forEach((tech: PrintingTechnology) => {
                if (!technologies.some((t) => t.id === tech.id)) {
                  technologies.push(tech);
                }
              });
            }
          });
          
          setAvailableColors(colors);
          setAvailableSizes(sizes);
          setAvailableTechnologies(technologies);
          
          // Convert API products to the simplified Product type for internal state
          const formattedProducts: SimplifiedProduct[] = matchedCategory.products.map((apiProduct: APIProduct) => {
            // Extract color hex values from the API color options
            const productColors = apiProduct.colorOptions?.map((color: ColorOption) => color.colorHex) || [];
            
            return {
              id: String(apiProduct.id), // Keep as string for internal state
              name: apiProduct.name,
              price: apiProduct.cost, // Map 'cost' to 'price'
              rating: 4.5, // Default rating if not in API
              image: apiProduct.displayImages && apiProduct.displayImages.length > 0 
                ? apiProduct.displayImages[0].image.url 
                : '/placeholder-image.jpg',
              category: apiProduct.categories.map((cat: Category) => cat.slug),
              availableColors: productColors,
              colorOptions: apiProduct.colorOptions || [],
              sizeOptions: apiProduct.sizeOptions || [],
              printingTechnologies: apiProduct.printingTechnologies || [],
              description: apiProduct.description,
              isNew: false, // Set default if not available in API
              onSale: false, // Set default if not available in API
            };
          });
          
          // Sort products by newest (default)
          const sortedProducts = formattedProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          setSimplifiedProducts(sortedProducts);
          setFilteredProducts(sortedProducts);
          
          console.log("Set products:", formattedProducts.length);
        } else {
          console.log("No matching category found for slug:", slug);
          setSimplifiedProducts([]);
          setApiProducts([]);
          setFilteredProducts([]);
        }
        
        setLoadingCategories(false);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoadingCategories(false);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [slug]);

  // Apply filters when filter selections change
  useEffect(() => {
    if (simplifiedProducts.length === 0) return;
    
    let results = [...simplifiedProducts];
    
    // Filter by colors - now using colorHex values for matching
    if (selectedColorHexes.length > 0) {
      results = results.filter(product => 
        product.colorOptions && product.colorOptions.some(color => 
          selectedColorHexes.includes(color.colorHex)
        )
      );
    }
    
    // Filter by sizes - now using sizeName values for matching
    if (selectedSizeNames.length > 0) {
      results = results.filter(product => 
        product.sizeOptions && product.sizeOptions.some(size => 
          selectedSizeNames.includes(size.sizeName)
        )
      );
    }
    
    // Filter by printing technologies - now using technologyName for matching
    if (selectedTechnologyNames.length > 0) {
      results = results.filter(product => 
        product.printingTechnologies && product.printingTechnologies.some(tech => 
          selectedTechnologyNames.includes(tech.technologyName)
        )
      );
    }
    
    // Filter by categories (subcategories)
    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        product.category && product.category.some(cat => 
          selectedCategories.includes(cat)
        )
      );
    }
    
    setFilteredProducts(results);
  }, [simplifiedProducts, selectedColorHexes, selectedSizeNames, selectedTechnologyNames, selectedCategories]);

  // Helper function to create metadata for ProductCard
  const createProductMetadata = (productId: string): ProductMetadata => {
    // Find the simplified product to get rating
    const simplifiedProduct = simplifiedProducts.find(p => p.id === productId);
    const rating = simplifiedProduct ? simplifiedProduct.rating : 4.5;
    
    return {
      isBestSeller: false, // Could be determined by sales data or other criteria
      isStaffPick: false, // Could be a flag you set elsewhere
      rating: rating,
      reviewCount: Math.floor(10 + Math.random() * 140) // Just for demonstration
    };
  };

  // Helper function to convert API product to the format expected by ProductCard
  const getProductCardData = (productId: string): Product | null => {
    // Find the original API product that matches this id
    const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
    
    if (!apiProduct) return null;
    
    // Map to the exact Product interface expected by ProductCard and ProductPage
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      cost: apiProduct.cost,
      sku: apiProduct.sku,
      brand: apiProduct.brand,
      Brandsku: apiProduct.Brandsku,
      dimensions: apiProduct.dimensions,
      categories: apiProduct.categories,
      colorOptions: apiProduct.colorOptions || [],
      sizeOptions: apiProduct.sizeOptions || [],
      sizeChart: apiProduct.sizeChart,
      description: apiProduct.description,
      features: apiProduct.features,
      displayImages: apiProduct.displayImages || [],
      mockupImages: apiProduct.mockupImages || [],
      shippingInfo: apiProduct.shippingInfo || { weight: 0, dimensions: "0x0" },
      printingTechnologies: apiProduct.printingTechnologies || [],
      updatedAt: apiProduct.updatedAt || new Date().toISOString(),
      createdAt: apiProduct.createdAt || new Date().toISOString()
    };
  };

  // This function helps store the complete product data in sessionStorage
  const storeCompleteProductData = (productId: string): void => {
    const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
    if (apiProduct) {
      // Store the complete API product data for the product page to use
      sessionStorage.setItem(`product_${apiProduct.id}`, JSON.stringify(apiProduct));
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (categorySlug: string): void => {
    // Navigate to the selected category
    window.location.href = `/productCatalog/category/${categorySlug}`;
  };
  
  // Clear all filters
  const clearAllFilters = (): void => {
    setSelectedColorHexes([]);
    setSelectedSizeNames([]);
    setSelectedTechnologyNames([]);
    setSelectedCategories([]);
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30">
        <div className="container py-8 mx-auto px-4 mt-12">
          {/* Hero Section */}
          <div className="mb-4 animate-fadeIn">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e65100] to-orange-600 bg-clip-text text-transparent">
              {currentCategory ? currentCategory.title : "Online Store Essentials"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Discover our curated collection of premium products designed to meet your needs.
            </p>
          </div>
          
          {/* Breadcrumb Navigation based on Category */}
          {!loadingCategories && currentCategory && (
            <div className="flex items-center mb-3 text-sm bg-white rounded-full px-4 py-2 shadow-sm border border-orange-100 w-fit animate-fadeIn">
              <a href="/" className="hover:text-[#e65100] transition-colors text-gray-600">Home</a>
              <span className="mx-2 text-gray-400">/</span>
              {currentCategory.breadcrumbs.map((crumb, idx) => (
                <div key={crumb.id} className="flex items-center">
                  {idx > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <a href={crumb.url} className="hover:text-[#e65100] transition-colors text-gray-600">{crumb.label}</a>
                </div>
              ))}
            </div>
          )}
          
          {/* Category Pill Navigation */}
          <div className="md:hidden flex flex-nowrap overflow-x-auto mb-6 gap-3 pb-2">
            {categories.map((item) => (
              <div 
                key={item.id}
                className={`category-pill rounded-full px-6 py-3 whitespace-nowrap text-sm font-medium cursor-pointer ${
                  currentCategory?.slug === item.slug ? 'active' : ''
                }`}
              >
                <Link to={`/productCatalog/category/${item.slug}`}>
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
          
          {/* Filter Button and Product Count */}
          <div className="md:hidden flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="text-sm text-gray-700 font-medium">
              <span className="text-[#e65100] font-semibold">{filteredProducts.length}</span> products found
            </div>
            {isMobileView && (
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transition-all duration-200"
                onClick={() => openFilterOverlay()}
              >
                <Filter size={16} />
                <span>Filters</span>
                {getTotalActiveFilterCount() > 0 && (
                  <Badge className="ml-1 h-5 min-w-5 px-1 filter-badge">
                    {getTotalActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter Sidebar - Desktop version */}
            <div className="w-full md:w-80 flex-shrink-0 hidden md:block">
              {loading ? (
                <div className="h-96 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
              ) : (
                <>
                  {/* Desktop Filter Sections */}
                  <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                    <h3 className="mb-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full"></div>
                      Categories
                    </h3>
                    <CategoryTree 
                      categories={categories} 
                      currentCategoryId={currentCategory?.id}
                      onSelectCategory={handleCategorySelect}
                    />
                  </div>
                  
                  {/* Active Filters Summary */}
                  {(selectedColorHexes.length > 0 || selectedSizeNames.length > 0 || 
                    selectedTechnologyNames.length > 0 || selectedCategories.length > 0) && (
                    <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-6 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full"></div>
                          Active Filters
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearAllFilters}
                          className="h-8 text-sm text-[#e65100] hover:text-orange-700 hover:bg-orange-50"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedColorHexes.map(colorHex => {
                          // Find the first color with this hex value
                          const color = availableColors.find(c => c.colorHex === colorHex);
                          return color ? (
                            <Badge 
                              key={`color-${colorHex}`} 
                              className="flex items-center gap-2 pl-2 pr-1 py-1 filter-badge"
                            >
                              <span 
                                className="w-3 h-3 rounded-full border border-white/30" 
                                style={{ backgroundColor: colorHex }}
                              />
                              {color.colorName}
                              <button
                                onClick={() => setSelectedColorHexes(selectedColorHexes.filter(hex => hex !== colorHex))}
                                className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                        
                        {selectedSizeNames.map(sizeName => {
                          // Find the first size with this name
                          const size = availableSizes.find(s => s.sizeName === sizeName);
                          return size ? (
                            <Badge 
                              key={`size-${sizeName}`} 
                              className="flex items-center gap-1 pl-2 pr-1 py-1 filter-badge"
                            >
                              {sizeName}
                              <button
                                onClick={() => setSelectedSizeNames(selectedSizeNames.filter(name => name !== sizeName))}
                                className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                        
                        {selectedTechnologyNames.map(techName => {
                          // Find the first technology with this name
                          const tech = availableTechnologies.find(t => t.technologyName === techName);
                          return tech ? (
                            <Badge 
                              key={`tech-${techName}`} 
                              className="flex items-center gap-1 pl-2 pr-1 py-1 filter-badge"
                            >
                              {techName}
                              <button
                                onClick={() => setSelectedTechnologyNames(selectedTechnologyNames.filter(name => name !== techName))}
                                className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Color Filter */}
                  {availableColors.length > 0 && (
                    <FilterSection title="Colors" defaultOpen={true}>
                      <ColorFilter 
                        colors={availableColors}
                        selectedColors={selectedColorHexes}
                        onChange={setSelectedColorHexes}
                      />
                    </FilterSection>
                  )}
                  
                  {/* Size Filter */}
                  {availableSizes.length > 0 && (
                    <FilterSection title="Sizes">
                      <CheckboxFilter 
                        items={availableSizes}
                        selectedItems={selectedSizeNames}
                        onChange={setSelectedSizeNames}
                        nameKey="sizeName"
                        valueKey="sizeName"
                      />
                    </FilterSection>
                  )}
                  
                  {/* Printing Technologies Filter */}
                  {availableTechnologies.length > 0 && (
                    <FilterSection title="Printing Technologies">
                      <CheckboxFilter 
                        items={availableTechnologies}
                        selectedItems={selectedTechnologyNames}
                        onChange={setSelectedTechnologyNames}
                        nameKey="technologyName"
                        valueKey="technologyName"
                      />
                    </FilterSection>
                  )}
                </>
              )}
            </div>
            
            {/* Mobile Filter Overlay - Main one with all filters */}
            {isMobileView && (
              <MobileFilterOverlay
                isOpen={activeFilterOverlay === 'all'}
                onClose={closeFilterOverlay}
                onReset={clearAllFilters}
              >
                {/* Colors */}
                {availableColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full"></div>
                      Colors
                    </h3>
                    <ColorFilter 
                      colors={availableColors}
                      selectedColors={selectedColorHexes}
                      onChange={setSelectedColorHexes}
                    />
                  </div>
                )}
                
                <Separator className="my-6" />
                
                {/* Other filters */}
                {availableSizes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full"></div>
                      Sizes
                    </h3>
                    <CheckboxFilter 
                      items={availableSizes}
                      selectedItems={selectedSizeNames}
                      onChange={setSelectedSizeNames}
                      nameKey="sizeName"
                      valueKey="sizeName"
                    />
                  </div>
                )}
                
                {availableTechnologies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full"></div>
                      Printing Technologies
                    </h3>
                    <CheckboxFilter 
                      items={availableTechnologies}
                      selectedItems={selectedTechnologyNames}
                      onChange={setSelectedTechnologyNames}
                      nameKey="technologyName"
                      valueKey="technologyName"
                    />
                  </div>
                )}
              </MobileFilterOverlay>
            )}
            
            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="hidden md:flex items-center justify-between mb-4 bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                    <span className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-[#e65100]">{filteredProducts.length}</span> products
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">View:</span>
                      <Button variant="outline" size="sm" className="p-2">
                        <Grid size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-orange-100 animate-fadeIn">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-[#e65100]" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-gray-900">No products found</h3>
                        <p className="text-gray-600 mb-6">We couldn't find any products matching your current filters. Try adjusting your criteria or explore our full collection.</p>
                        <Button 
                          onClick={clearAllFilters} 
                          className="bg-gradient-to-r from-[#e65100] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="product-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map((product, index) => {
                        // Get the product card data format
                        const productCardData = getProductCardData(product.id);
                        // Create metadata
                        const productCardMetadata = createProductMetadata(product.id);
                        
                        if (!productCardData) return null;
                        
                        return (
                          <div 
                            key={product.id} 
                            className="relative w-full max-w-full mx-auto group transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                            onClick={() => storeCompleteProductData(product.id)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <ProductCard 
                              product={productCardData}
                              metadata={productCardMetadata}
                            />
                            
                            {/* Additional badges that aren't part of the standard ProductCard */}
                            {product.isNew && (
                              <Badge className="absolute top-3 left-3 z-20 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium">
                                New
                              </Badge>
                            )}
                            {product.onSale && (
                              <Badge className="absolute top-3 right-3 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium">
                                Sale
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
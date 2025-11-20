// import React, { useState, useEffect } from 'react';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue,
//   SelectGroup,
//   SelectLabel
// } from '@/components/ui/select';
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
//   FormDescription,
// } from '@/components/ui/form';
// import { UseFormReturn } from 'react-hook-form';

// // Define the Category interface based on the API response
// interface Category {
//   id: string;
//   name: string;
//   handle?: string;
//   parent_category_id: string | null;
//   category_children?: Category[];
//   parent_category?: Category | null;
// }

// interface HierarchicalCategorySelectorProps {
//   form: UseFormReturn<any>;
//   categories: Category[];
//   name?: string;
// }

// const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({ 
//   form, 
//   categories, 
//   name = "category_id" 
// }) => {
//   // Pre-process the categories for easier access
//   const [structure, setStructure] = useState<{
//     rootCategories: Category[];
//     childrenMap: Map<string, Category[]>;
//     allCategories: Map<string, Category>;
//   }>({
//     rootCategories: [],
//     childrenMap: new Map(),
//     allCategories: new Map()
//   });
  
//   // This tracks the selected category at each level
//   const [selections, setSelections] = useState<string[]>([]);
  
//   // Process categories once on component mount
//   useEffect(() => {
//     try {
//       if (!Array.isArray(categories)) {
//         console.error("Categories is not an array:", categories);
//         return;
//       }
      
//       // Map of all categories by ID
//       const allCategoriesMap = new Map<string, Category>();
      
//       // Map of child categories by parent ID
//       const childrenByParent = new Map<string, Category[]>();
      
//       // Find all root categories
//       const roots: Category[] = [];
      
//       // First pass: build the maps
//       categories.forEach(cat => {
//         if (!cat || !cat.id) return;
        
//         // Add to all categories map
//         allCategoriesMap.set(cat.id, cat);
        
//         // Check if it's a root category
//         if (cat.parent_category_id === null) {
//           roots.push(cat);
//         }
//       });
      
//       // Second pass: build the children map
//       categories.forEach(cat => {
//         if (!cat || !cat.id) return;
        
//         // If it has a parent, add it to that parent's children list
//         if (cat.parent_category_id) {
//           if (!childrenByParent.has(cat.parent_category_id)) {
//             childrenByParent.set(cat.parent_category_id, []);
//           }
//           childrenByParent.get(cat.parent_category_id)?.push(cat);
//         }
//       });
      
//       // Sort roots by name or rank if available
//       roots.sort((a, b) => a.name.localeCompare(b.name));
      
//       // Sort children in each map entry
//       childrenByParent.forEach((children, parentId) => {
//         children.sort((a, b) => a.name.localeCompare(b.name));
//       });
      
//       // Update state with processed data
//       setStructure({
//         rootCategories: roots,
//         childrenMap: childrenByParent,
//         allCategories: allCategoriesMap
//       });
      
//       // Set initial selection if form already has a value
//       const currentValue = form.getValues(name);
//       if (currentValue && allCategoriesMap.has(currentValue)) {
//         // Find path from selected to root
//         const path: string[] = [];
//         let current: Category | undefined = allCategoriesMap.get(currentValue);
        
//         while (current) {
//           path.unshift(current.id);
//           if (current.parent_category_id) {
//             current = allCategoriesMap.get(current.parent_category_id);
//           } else {
//             break;
//           }
//         }
        
//         // Set all selections
//         setSelections(path);
//       }
      
//     } catch (error) {
//       console.error("Error processing categories:", error);
//     }
//   }, [categories, form, name]);
  
//   // Handle when user selects a category at a specific level
//   const handleSelect = (level: number, categoryId: string) => {
//     try {
//       console.log(`📊 Category selected at level ${level}:`, categoryId);
      
//       // Update selections up to this level, discard deeper levels
//       const newSelections = [...selections.slice(0, level), categoryId];
//       setSelections(newSelections);
      
//       // Update form with the most specific category
//       form.setValue(name, categoryId, {
//         shouldDirty: true,
//         shouldValidate: true,
//         shouldTouch: true
//       });
      
//       // Log the current form value for debugging
//       console.log(`📊 Current form value for "${name}":`, form.getValues(name));
//     } catch (error) {
//       console.error("❌ Error selecting category:", error);
//     }
//   };
  
//   // Render the component
//   return (
//     <FormField
//       control={form.control}
//       name={name}
//       render={({ field }) => (
//         <FormItem className="mb-5">
//           <FormLabel className="text-gray-700 font-medium">Product Category</FormLabel>
          
//           <div className="space-y-4">
//             {/* First level (root categories) */}
//             <Select
//               value={selections[0] || ''}
//               onValueChange={(value) => handleSelect(0, value)}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select a category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   {structure.rootCategories.map(category => (
//                     <SelectItem key={category.id} value={category.id}>
//                       {category.name}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
            
//             {/* Second level (if a root is selected) */}
//             {selections[0] && structure.childrenMap.has(selections[0]) && (
//               <Select
//                 value={selections[1] || ''}
//                 onValueChange={(value) => handleSelect(1, value)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select a subcategory" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     <SelectLabel>
//                       Subcategories of {structure.allCategories.get(selections[0])?.name}
//                     </SelectLabel>
//                     {structure.childrenMap.get(selections[0])?.map(category => (
//                       <SelectItem key={category.id} value={category.id}>
//                         {category.name}
//                       </SelectItem>
//                     ))}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             )}
            
//             {/* Third level (if a second-level category is selected) */}
//             {selections[1] && structure.childrenMap.has(selections[1]) && (
//               <Select
//                 value={selections[2] || ''}
//                 onValueChange={(value) => handleSelect(2, value)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select a sub-subcategory" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     <SelectLabel>
//                       Subcategories of {structure.allCategories.get(selections[1])?.name}
//                     </SelectLabel>
//                     {structure.childrenMap.get(selections[1])?.map(category => (
//                       <SelectItem key={category.id} value={category.id}>
//                         {category.name}
//                       </SelectItem>
//                     ))}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             )}
//           </div>
          
//           <FormDescription className="text-gray-500 text-sm mt-2">
//             Categorize your product to help customers find it
//           </FormDescription>
//           <FormMessage className="text-red-500" />
//         </FormItem>
//       )}
//     />
//   );
// };

// export default HierarchicalCategorySelector;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { IconX, IconCheck, IconChevronRight, IconArrowBack } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';

// Define the Category interface
interface Category {
  id: string;
  name: string;
  handle?: string;
  parent_category_id: string | null;
  category_children?: Category[];
  parent_category?: Category | null;
}

interface HierarchicalCategorySelectorProps {
  form: UseFormReturn<any>;
  categories: Category[];
  name?: string;
  isMultiSelect?: boolean;
}

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({ 
  form, 
  categories, 
  name = "category_id",
  isMultiSelect = false
}) => {
  // Category structure
  const [structure, setStructure] = useState<{
    rootCategories: Category[];
    childrenMap: Map<string, Category[]>;
    allCategories: Map<string, Category>;
  }>({
    rootCategories: [],
    childrenMap: new Map(),
    allCategories: new Map()
  });
  
  // Navigation state - stack of parent IDs
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  
  // Selected categories for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Dropdown open state
  const [isOpen, setIsOpen] = useState(false);
  
  // Dropdown ref for click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Process categories on mount
  useEffect(() => {
    try {
      if (!Array.isArray(categories)) {
        console.error("Categories is not an array:", categories);
        return;
      }
      
      const allCategoriesMap = new Map<string, Category>();
      const childrenByParent = new Map<string, Category[]>();
      const roots: Category[] = [];
      
      // Build maps
      categories.forEach(cat => {
        if (!cat || !cat.id) return;
        allCategoriesMap.set(cat.id, cat);
        
        if (cat.parent_category_id === null) {
          roots.push(cat);
        }
      });
      
      // Build children map
      categories.forEach(cat => {
        if (!cat || !cat.id) return;
        
        if (cat.parent_category_id) {
          if (!childrenByParent.has(cat.parent_category_id)) {
            childrenByParent.set(cat.parent_category_id, []);
          }
          childrenByParent.get(cat.parent_category_id)?.push(cat);
        }
      });
      
      // Sort
      roots.sort((a, b) => a.name.localeCompare(b.name));
      childrenByParent.forEach((children) => {
        children.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setStructure({
        rootCategories: roots,
        childrenMap: childrenByParent,
        allCategories: allCategoriesMap
      });
      
      // Initialize selected categories
      if (isMultiSelect) {
        const currentValues = form.getValues(name) || [];
        if (Array.isArray(currentValues) && currentValues.length > 0) {
          setSelectedCategories(currentValues);
        }
      }
      
    } catch (error) {
      console.error("Error processing categories:", error);
    }
  }, [categories, form, name, isMultiSelect]);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Reset navigation stack when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setNavigationStack([]);
    }
  }, [isOpen]);
  
  // Get current level categories
  const getCurrentLevelCategories = (): Category[] => {
    if (navigationStack.length === 0) {
      return structure.rootCategories;
    }
    
    const currentParentId = navigationStack[navigationStack.length - 1];
    return structure.childrenMap.get(currentParentId) || [];
  };
  
  // Get current parent category
  const getCurrentParentCategory = (): Category | undefined => {
    if (navigationStack.length === 0) return undefined;
    const currentParentId = navigationStack[navigationStack.length - 1];
    return structure.allCategories.get(currentParentId);
  };
  
  // Check if category has children
  const hasChildren = (categoryId: string): boolean => {
    return structure.childrenMap.has(categoryId) && 
           (structure.childrenMap.get(categoryId)?.length || 0) > 0;
  };
  
  // Check if category is selected
  const isCategorySelected = (categoryId: string): boolean => {
    if (!isMultiSelect) {
      return form.getValues(name) === categoryId;
    }
    return selectedCategories.includes(categoryId);
  };
  
  // Navigate into category children
  const navigateInto = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren(categoryId)) {
      setNavigationStack(prev => [...prev, categoryId]);
    }
  };
  
  // Navigate back to parent
  const navigateBack = () => {
    setNavigationStack(prev => prev.slice(0, -1));
  };
  
  // Toggle category selection
  const toggleCategorySelection = (categoryId: string) => {
    if (isMultiSelect) {
      let newSelectedCategories: string[];
      
      if (isCategorySelected(categoryId)) {
        newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
      } else {
        newSelectedCategories = [...selectedCategories, categoryId];
      }
      
      setSelectedCategories(newSelectedCategories);
      form.setValue(name, newSelectedCategories, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true
      });
    } else {
      form.setValue(name, categoryId, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true
      });
      setIsOpen(false);
    }
  };
  
  // Remove selected category
  const handleRemoveCategory = (categoryId: string) => {
    if (!isMultiSelect) return;
    
    const newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
    setSelectedCategories(newSelectedCategories);
    
    form.setValue(name, newSelectedCategories, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true
    });
  };
  
  // Get category name
  const getCategoryName = (categoryId: string): string => {
    const category = structure.allCategories.get(categoryId);
    return category ? category.name : '';
  };
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-5">
          <FormLabel className="text-gray-700 font-medium">
            Product {isMultiSelect ? 'Categories' : 'Category'}
          </FormLabel>
          
          {/* Display selected categories as badges */}
          {isMultiSelect && selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              {selectedCategories.map((categoryId) => {
                const category = structure.allCategories.get(categoryId);
                return category ? (
                  <Badge 
                    key={categoryId}
                    variant="outline"
                    className="text-[#e65100] border-[#e65100] bg-white pr-1 hover:bg-orange-100 transition-colors"
                  >
                    <span className="text-xs">{getCategoryName(categoryId)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveCategory(categoryId);
                      }}
                      className="ml-1.5 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      <IconX size={12} />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
          
          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-[#e65100]"
            >
              <span className="text-gray-700">
                {isMultiSelect && selectedCategories.length > 0
                  ? `${selectedCategories.length} selected`
                  : "Select categories..."}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Content */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                {/* Back button if not at root */}
                {navigationStack.length > 0 && (
                  <button
                    type="button"
                    onClick={navigateBack}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <IconArrowBack size={16} className="mr-2" />
                    <span className="font-medium">{getCurrentParentCategory()?.name}</span>
                  </button>
                )}
                
                {/* Category list */}
                <div>
                  {getCurrentLevelCategories().map((category) => {
                    const isSelected = isCategorySelected(category.id);
                    const categoryHasChildren = hasChildren(category.id);
                    
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                          isSelected ? 'bg-orange-50' : ''
                        }`}
                        onClick={() => toggleCategorySelection(category.id)}
                      >
                        <div className="flex items-center flex-1">
                          {isMultiSelect && isSelected && (
                            <IconCheck size={16} className="mr-2 text-[#e65100]" />
                          )}
                          <span className={isSelected ? 'font-medium text-[#e65100]' : 'text-gray-700'}>
                            {category.name}
                          </span>
                        </div>
                        
                        {/* Arrow button for navigation */}
                        {categoryHasChildren && (
                          <button
                            type="button"
                            onClick={(e) => navigateInto(category.id, e)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <IconChevronRight size={16} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <FormDescription className="text-gray-500 text-sm mt-2">
            {isMultiSelect 
              ? "Click on a category to select it. Click the arrow to navigate into subcategories."
              : "Select a category for your product"}
          </FormDescription>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default HierarchicalCategorySelector;
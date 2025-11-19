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

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
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
import { IconX, IconCheck, IconRefresh } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';

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
  
  // Navigation selections (for cascading dropdowns)
  const [selections, setSelections] = useState<string[]>([]);
  
  // Selected categories for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
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
      } else {
        const currentValue = form.getValues(name);
        if (currentValue && allCategoriesMap.has(currentValue)) {
          // Build path for single select
          const path: string[] = [];
          let current: Category | undefined = allCategoriesMap.get(currentValue);
          
          while (current) {
            path.unshift(current.id);
            if (current.parent_category_id) {
              current = allCategoriesMap.get(current.parent_category_id);
            } else {
              break;
            }
          }
          
          setSelections(path);
        }
      }
      
    } catch (error) {
      console.error("Error processing categories:", error);
    }
  }, [categories, form, name, isMultiSelect]);
  
  // Check if category is selected
  const isCategorySelected = (categoryId: string): boolean => {
    if (!isMultiSelect) {
      return form.getValues(name) === categoryId;
    }
    return selectedCategories.includes(categoryId);
  };
  
  // Reset navigation path
  const handleResetNavigation = () => {
    setSelections([]);
    console.log('🔄 Navigation reset - you can now select other parent categories');
  };
  
  // ✅ UPDATED: Auto-select categories when clicked
  const handleSelect = (level: number, categoryId: string) => {
    try {
      console.log(`📊 Category selected at level ${level}:`, categoryId);
      
      // Update navigation path
      const newSelections = [...selections.slice(0, level), categoryId];
      setSelections(newSelections);
      
      if (isMultiSelect) {
        // ✅ CHANGE 1: Automatically add/remove from selection
        let newSelectedCategories: string[];
        
        if (isCategorySelected(categoryId)) {
          // Remove if already selected
          newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
        } else {
          // Add if not selected
          newSelectedCategories = [...selectedCategories, categoryId];
        }
        
        setSelectedCategories(newSelectedCategories);
        form.setValue(name, newSelectedCategories, {
          shouldDirty: true,
          shouldValidate: true,
          shouldTouch: true
        });
        
        console.log('✅ Multi-select updated:', newSelectedCategories);
      } else {
        // Single-select: Update form immediately
        form.setValue(name, categoryId, {
          shouldDirty: true,
          shouldValidate: true,
          shouldTouch: true
        });
      }
      
    } catch (error) {
      console.error("❌ Error selecting category:", error);
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
  
  // ✅ CHANGE 2: Get only category name (not full path)
  const getCategoryName = (categoryId: string): string => {
    const category = structure.allCategories.get(categoryId);
    return category ? category.name : '';
  };
  
  // Get category full path (for debugging or other uses)
  const getCategoryPath = (categoryId: string): string => {
    const path: string[] = [];
    let current: Category | undefined = structure.allCategories.get(categoryId);
    
    while (current) {
      path.unshift(current.name);
      if (current.parent_category_id) {
        current = structure.allCategories.get(current.parent_category_id);
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  };
  
  // Get current category at level
  const getCurrentCategoryAtLevel = (level: number): Category | undefined => {
    const categoryId = selections[level];
    return categoryId ? structure.allCategories.get(categoryId) : undefined;
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
          
          {/* ✅ CHANGE 2: Display only category names in badges */}
          {isMultiSelect && selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              {selectedCategories.map((categoryId) => {
                const category = structure.allCategories.get(categoryId);
                return category ? (
                  <Badge 
                    key={categoryId}
                    variant="outline"
                    className="text-[#e65100] border-[#e65100] bg-white pr-1 hover:bg-orange-100 transition-colors"
                    title={getCategoryPath(categoryId)} // Show full path on hover
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
          
          {/* Show reset button when navigation is active */}
          {selections.length > 0 && (
            <div className="mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetNavigation}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <IconRefresh size={16} className="mr-1" />
                Reset & Select Other Categories
              </Button>
            </div>
          )}
          
          <div className="space-y-3">
            {/* ✅ CHANGE 1: Removed + buttons, click on dropdown auto-selects */}
            
            {/* Level 0: Root categories */}
            <Select
              value={selections[0] || ''}
              onValueChange={(value) => handleSelect(0, value)}
            >
              <SelectTrigger className="w-full border-gray-300 focus:ring-[#e65100]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {structure.rootCategories.map(category => {
                    const isSelected = isCategorySelected(category.id);
                    return (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className={isSelected ? "bg-orange-50 font-medium" : ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{category.name}</span>
                          {isMultiSelect && isSelected && (
                            <IconCheck size={16} className="ml-2 text-[#e65100]" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Level 1: Children of selected root */}
            {selections[0] && structure.childrenMap.has(selections[0]) && (
              <div className="ml-4">
                <Select
                  value={selections[1] || ''}
                  onValueChange={(value) => handleSelect(1, value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-[#e65100]">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-gray-500">
                        {getCurrentCategoryAtLevel(0)?.name}
                      </SelectLabel>
                      {structure.childrenMap.get(selections[0])?.map(category => {
                        const isSelected = isCategorySelected(category.id);
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className={isSelected ? "bg-orange-50 font-medium" : ""}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              {isMultiSelect && isSelected && (
                                <IconCheck size={16} className="ml-2 text-[#e65100]" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Level 2: Children of level 1 selection */}
            {selections[1] && structure.childrenMap.has(selections[1]) && (
              <div className="ml-8">
                <Select
                  value={selections[2] || ''}
                  onValueChange={(value) => handleSelect(2, value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-[#e65100]">
                    <SelectValue placeholder="Select sub-subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-gray-500">
                        {getCurrentCategoryAtLevel(1)?.name}
                      </SelectLabel>
                      {structure.childrenMap.get(selections[1])?.map(category => {
                        const isSelected = isCategorySelected(category.id);
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className={isSelected ? "bg-orange-50 font-medium" : ""}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              {isMultiSelect && isSelected && (
                                <IconCheck size={16} className="ml-2 text-[#e65100]" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Level 3: Children of level 2 selection */}
            {selections[2] && structure.childrenMap.has(selections[2]) && (
              <div className="ml-12">
                <Select
                  value={selections[3] || ''}
                  onValueChange={(value) => handleSelect(3, value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-[#e65100]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-gray-500">
                        {getCurrentCategoryAtLevel(2)?.name}
                      </SelectLabel>
                      {structure.childrenMap.get(selections[2])?.map(category => {
                        const isSelected = isCategorySelected(category.id);
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className={isSelected ? "bg-orange-50 font-medium" : ""}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              {isMultiSelect && isSelected && (
                                <IconCheck size={16} className="ml-2 text-[#e65100]" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <FormDescription className="text-gray-500 text-sm mt-2">
            {isMultiSelect 
              ? "Click on categories to select them. Click 'Reset' to select from other parent categories."
              : "Categorize your product to help customers find it"
            }
          </FormDescription>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default HierarchicalCategorySelector;
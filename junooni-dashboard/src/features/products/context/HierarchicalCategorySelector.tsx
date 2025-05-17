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
import { UseFormReturn } from 'react-hook-form';

// Define the Category interface based on the API response
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
}

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({ 
  form, 
  categories, 
  name = "category_id" 
}) => {
  // Pre-process the categories for easier access
  const [structure, setStructure] = useState<{
    rootCategories: Category[];
    childrenMap: Map<string, Category[]>;
    allCategories: Map<string, Category>;
  }>({
    rootCategories: [],
    childrenMap: new Map(),
    allCategories: new Map()
  });
  
  // This tracks the selected category at each level
  const [selections, setSelections] = useState<string[]>([]);
  
  // Process categories once on component mount
  useEffect(() => {
    try {
      if (!Array.isArray(categories)) {
        console.error("Categories is not an array:", categories);
        return;
      }
      
      // Map of all categories by ID
      const allCategoriesMap = new Map<string, Category>();
      
      // Map of child categories by parent ID
      const childrenByParent = new Map<string, Category[]>();
      
      // Find all root categories
      const roots: Category[] = [];
      
      // First pass: build the maps
      categories.forEach(cat => {
        if (!cat || !cat.id) return;
        
        // Add to all categories map
        allCategoriesMap.set(cat.id, cat);
        
        // Check if it's a root category
        if (cat.parent_category_id === null) {
          roots.push(cat);
        }
      });
      
      // Second pass: build the children map
      categories.forEach(cat => {
        if (!cat || !cat.id) return;
        
        // If it has a parent, add it to that parent's children list
        if (cat.parent_category_id) {
          if (!childrenByParent.has(cat.parent_category_id)) {
            childrenByParent.set(cat.parent_category_id, []);
          }
          childrenByParent.get(cat.parent_category_id)?.push(cat);
        }
      });
      
      // Sort roots by name or rank if available
      roots.sort((a, b) => a.name.localeCompare(b.name));
      
      // Sort children in each map entry
      childrenByParent.forEach((children, parentId) => {
        children.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      // Update state with processed data
      setStructure({
        rootCategories: roots,
        childrenMap: childrenByParent,
        allCategories: allCategoriesMap
      });
      
      // Set initial selection if form already has a value
      const currentValue = form.getValues(name);
      if (currentValue && allCategoriesMap.has(currentValue)) {
        // Find path from selected to root
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
        
        // Set all selections
        setSelections(path);
      }
      
    } catch (error) {
      console.error("Error processing categories:", error);
    }
  }, [categories, form, name]);
  
  // Handle when user selects a category at a specific level
  const handleSelect = (level: number, categoryId: string) => {
    try {
      console.log(`📊 Category selected at level ${level}:`, categoryId);
      
      // Update selections up to this level, discard deeper levels
      const newSelections = [...selections.slice(0, level), categoryId];
      setSelections(newSelections);
      
      // Update form with the most specific category
      form.setValue(name, categoryId, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true
      });
      
      // Log the current form value for debugging
      console.log(`📊 Current form value for "${name}":`, form.getValues(name));
    } catch (error) {
      console.error("❌ Error selecting category:", error);
    }
  };
  
  // Render the component
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-5">
          <FormLabel className="text-gray-700 font-medium">Product Category</FormLabel>
          
          <div className="space-y-4">
            {/* First level (root categories) */}
            <Select
              value={selections[0] || ''}
              onValueChange={(value) => handleSelect(0, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {structure.rootCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Second level (if a root is selected) */}
            {selections[0] && structure.childrenMap.has(selections[0]) && (
              <Select
                value={selections[1] || ''}
                onValueChange={(value) => handleSelect(1, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      Subcategories of {structure.allCategories.get(selections[0])?.name}
                    </SelectLabel>
                    {structure.childrenMap.get(selections[0])?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            
            {/* Third level (if a second-level category is selected) */}
            {selections[1] && structure.childrenMap.has(selections[1]) && (
              <Select
                value={selections[2] || ''}
                onValueChange={(value) => handleSelect(2, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a sub-subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      Subcategories of {structure.allCategories.get(selections[1])?.name}
                    </SelectLabel>
                    {structure.childrenMap.get(selections[1])?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <FormDescription className="text-gray-500 text-sm mt-2">
            Categorize your product to help customers find it
          </FormDescription>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default HierarchicalCategorySelector;
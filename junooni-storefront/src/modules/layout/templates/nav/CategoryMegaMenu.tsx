"use client";

import { NavLink } from "./NavLink";

// Define the interfaces for the 3-level category structure
interface CategoryLevel3 {
  id: string;
  name: string;
  handle: string;
}

interface CategoryLevel2 {
  id: string;
  name: string;
  handle: string;
  category_children?: CategoryLevel3[];
}

interface CategoryLevel1 {
  id: string;
  name: string;
  handle: string;
  parent_category?: any;
  category_children?: CategoryLevel2[];
}

// Define what NavLink expects (now supporting 3 levels)
interface SubmenuItemLevel3 {
  label: string;
  href: string;
}

interface SubmenuItemLevel2 {
  label: string;
  href: string;
  submenuItems?: SubmenuItemLevel3[];
}

interface SubmenuItemLevel1 {
  label: string;
  href: string;
  submenuItems: SubmenuItemLevel2[];
}

interface CategoryMegaMenuProps {
  categories: CategoryLevel1[];
}

export function CategoryMegaMenu({ categories = [] }: CategoryMegaMenuProps) {
  // This function identifies the levels in the category tree
  const organizeCategories = () => {
    // First, identify top-level categories (no parent)
    const topLevelCategories = categories.filter(cat => !cat.parent_category);
    
    // Create a map to organize subcategories by parent ID
    const categoryMap = new Map();
    categories.forEach(category => {
      if (category.parent_category) {
        const parentId = category.parent_category.id;
        if (!categoryMap.has(parentId)) {
          categoryMap.set(parentId, []);
        }
        categoryMap.get(parentId).push(category);
      }
    });
    
    // Now, build the full hierarchy
    const menuStructure = topLevelCategories.map(topCat => {
      // Find all level 2 categories for this top category
      const level2Categories = categoryMap.get(topCat.id) || [];
      
      // For each level 2 category, find its level 3 children
      const submenuItems = level2Categories.map((level2Cat: CategoryLevel1) => {
        const level3Categories = categoryMap.get(level2Cat.id) || [];
        
        // Convert level 3 to the NavLink format
        const level3Items = level3Categories.map((level3Cat: CategoryLevel1) => ({
          label: level3Cat.name,
          href: `/categories/${level3Cat.handle}`
        }));
        
        // Return the level 2 with its level 3 children
        return {
          label: level2Cat.name,
          href: `/categories/${level2Cat.handle}`,
          submenuItems: level3Items
        };
      });
      
      // Return the complete structure for this top-level category
      return {
        label: topCat.name,
        href: `/categories/${topCat.handle}`,
        submenuItems: submenuItems
      };
    });
    
    return menuStructure;
  };

  const menuItems = organizeCategories();

  return (
    <div className="flex items-center">
      {menuItems.map((item, index) => (
        <NavLink 
          key={index}
          href={item.href}
          label={item.label}
          submenuItems={item.submenuItems}
        />
      ))}
    </div>
  );
}
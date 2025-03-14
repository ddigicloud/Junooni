import { useEffect, useState } from "react"
import { ProfileDropdown } from "../../../components/profile-dropdown"
import { Link } from "@tanstack/react-router"
import { ThemeSwitch } from '@/components/theme-switch'

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL

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
  children?: Category[]; // Added for hierarchy
}

const Navbar = () => {
  const [organizedCategories, setOrganizedCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(`${vite_payload}/api/categories`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      const fetchedCategories = data.docs || data;
      
      // Organize categories hierarchically
      organizeCategories(fetchedCategories);
    }
    
    fetchCategories();
  }, []);
  
  // Function to organize categories into a hierarchical structure
  const organizeCategories = (flatCategories: Category[]) => {
    // Create a copy to avoid mutation
    const cats = [...flatCategories];
    
    // First pass: Create a map of all categories by ID for easy lookup
    const categoryMap = cats.reduce((map, category) => {
      map[category.id] = { ...category, children: [] };
      return map;
    }, {} as Record<number, Category>);
    
    // Second pass: Build the hierarchy
    const rootCategories: Category[] = [];
    
    cats.forEach(category => {
      const mappedCategory = categoryMap[category.id];
      
      if (!category.parent) {
        // This is a root category
        rootCategories.push(mappedCategory);
      } else {
        // This is a child category, add it to its parent's children
        const parentId = category.parent.id;
        if (categoryMap[parentId]) {
          categoryMap[parentId].children = categoryMap[parentId].children || [];
          categoryMap[parentId].children.push(mappedCategory);
        }
      }
    });
    
    setOrganizedCategories(rootCategories);
  };
  
  // Group child categories into columns for the megamenu
  const groupChildrenIntoColumns = (children?: Category[], columnsCount = 3) => {
    if (!children || children.length === 0) return [];
    
    const result: Category[][] = [];
    const itemsPerColumn = Math.ceil(children.length / columnsCount);
    
    for (let i = 0; i < columnsCount; i++) {
      const startIndex = i * itemsPerColumn;
      const columnItems = children.slice(startIndex, startIndex + itemsPerColumn);
      if (columnItems.length > 0) {
        result.push(columnItems);
      }
    }
    
    return result;
  };

  // Generate the full path for a category
  const getCategoryPath = (category: Category, parentPath = ""): string => {
    return parentPath ? `${parentPath}/${category.slug}` : category.slug;
  };
  
  // Renders subcategories and their children in the megamenu
  const renderSubcategoryWithChildren = (subcategory: Category, parentPath: string) => {
    const fullPath = getCategoryPath(subcategory, parentPath);
    const hasChildren = subcategory.children && subcategory.children.length > 0;
    
    return (
      <div key={subcategory.id} className="mb-4">
        <Link 
          to={fullPath}
          className="block mb-2 font-medium text-gray-800 dark:text-gray-200 hover:text-ui-primary dark:hover:text-ui-primary-dark"
        >
          {subcategory.title}
        </Link>
        
        {hasChildren && (
          <ul className="space-y-1">
            {subcategory.children?.map(childCategory => (
              <li key={childCategory.id}>
                <Link 
                  to={getCategoryPath(childCategory, fullPath)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-ui-primary dark:hover:text-ui-primary-dark"
                >
                  {childCategory.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  return (
    <div className="fixed w-[100%] z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Main navbar */}
      <div className="py-4 w-[100%] max-w-[95%] mx-auto flex items-center justify-between">
        <div className="font-mono text-2xl uppercase logo tracking-leading"><Link to="/dashboard">JUNOONI</Link></div>
        
        {/* Category links - redesigned to match the image */}
        <div className="flex items-center space-x-10">
        <Link to={'/productCatalog/products'} >All Products</Link>
          {organizedCategories.map((category) => (
            <div 
              key={category.id}
              className="relative group"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              
              <Link 
                to={`/productCatalog/category/${category.slug}`}
                className={` text-sm py-2 transition-colors duration-200 relative
                  ${activeCategory === category.id 
                    ? 'text-black dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
              >
                {category.title}
                
                <span className={`absolute left-0 right-0 bottom-0 h-[2px] bg-black dark:bg-white transform origin-left transition-transform duration-300 
                  ${activeCategory === category.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </div>
      
      {/* Megamenu dropdown */}
      {organizedCategories.map(category => {
        const hasChildren = category.children && category.children.length > 0;
        
        if (!hasChildren) return null;
        
        const columnGroups = groupChildrenIntoColumns(category.children);
        
        return (
          <div 
            key={`megamenu-${category.id}`}
            className={`absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 transition-all duration-300 ${
              activeCategory === category.id 
                ? 'opacity-100 translate-y-0 visible' 
                : 'opacity-0 -translate-y-2 invisible'
            }`}
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="max-w-[1200px] mx-auto py-6 px-6">
              <div className="grid grid-cols-4 gap-6">
                {/* Category columns */}
                {columnGroups.map((columnItems, columnIndex) => (
                  <div key={`column-${columnIndex}`} className="space-y-4">
                    {columnItems.map(subcategory => 
                      renderSubcategoryWithChildren(subcategory, category.slug)
                    )}
                  </div>
                ))}
                
                {/* Featured or promotional area */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
                  <div className="mb-2 text-lg font-medium">Featured</div>
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Explore our top selections in {category.title}</div>
                  <Link 
                    to={`${category.slug}/featured`}
                    className="px-4 py-2 text-sm text-white bg-black rounded-md dark:bg-white dark:text-black hover:bg-opacity-90"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Navbar;
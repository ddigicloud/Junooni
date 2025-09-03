// import { useEffect, useState } from "react"
// import { ProfileDropdown } from "../../../components/profile-dropdown"
// import { Link } from "@tanstack/react-router"
// import { ThemeSwitch } from '@/components/theme-switch'

// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL

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
//   children?: Category[]; // Added for hierarchy
// }

// const Navbar = () => {
//   const [organizedCategories, setOrganizedCategories] = useState<Category[]>([]);
//   const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const response = await fetch(`${vite_payload}/api/categories`, {
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
//       const fetchedCategories = data.docs || data;
      
//       // Organize categories hierarchically
//       organizeCategories(fetchedCategories);
//     }
    
//     fetchCategories();
//   }, []);
  
//   // Function to organize categories into a hierarchical structure
//   const organizeCategories = (flatCategories: Category[]) => {
//     // Create a copy to avoid mutation
//     const cats = [...flatCategories];
    
//     // First pass: Create a map of all categories by ID for easy lookup
//     const categoryMap = cats.reduce((map, category) => {
//       map[category.id] = { ...category, children: [] };
//       return map;
//     }, {} as Record<number, Category>);
    
//     // Second pass: Build the hierarchy
//     const rootCategories: Category[] = [];
    
//     cats.forEach(category => {
//       const mappedCategory = categoryMap[category.id];
      
//       if (!category.parent) {
//         // This is a root category
//         rootCategories.push(mappedCategory);
//       } else {
//         // This is a child category, add it to its parent's children
//         const parentId = category.parent.id;
//         if (categoryMap[parentId]) {
//           categoryMap[parentId].children = categoryMap[parentId].children || [];
//           categoryMap[parentId].children.push(mappedCategory);
//         }
//       }
//     });
    
//     setOrganizedCategories(rootCategories);
//   };
  
//   // Group child categories into columns for the megamenu
//   const groupChildrenIntoColumns = (children?: Category[], columnsCount = 3) => {
//     if (!children || children.length === 0) return [];
    
//     const result: Category[][] = [];
//     const itemsPerColumn = Math.ceil(children.length / columnsCount);
    
//     for (let i = 0; i < columnsCount; i++) {
//       const startIndex = i * itemsPerColumn;
//       const columnItems = children.slice(startIndex, startIndex + itemsPerColumn);
//       if (columnItems.length > 0) {
//         result.push(columnItems);
//       }
//     }
    
//     return result;
//   };

//   // Generate the full path for a category
//   const getCategoryPath = (category: Category, parentPath = ""): string => {
//     return parentPath ? `${parentPath}/${category.slug}` : category.slug;
//   };
  
//   // Renders subcategories and their children in the megamenu
//   const renderSubcategoryWithChildren = (subcategory: Category, parentPath: string) => {
//     const fullPath = getCategoryPath(subcategory, parentPath);
//     const hasChildren = subcategory.children && subcategory.children.length > 0;
    
//     return (
//       <div key={subcategory.id} className="mb-4">
//         <Link 
//           to={fullPath}
//           className="block mb-2 font-medium text-gray-800 dark:text-gray-200 hover:text-ui-primary dark:hover:text-ui-primary-dark"
//         >
//           {subcategory.title}
//         </Link>
        
//         {hasChildren && (
//           <ul className="space-y-1">
//             {subcategory.children?.map(childCategory => (
//               <li key={childCategory.id}>
//                 <Link 
//                   to={getCategoryPath(childCategory, fullPath)}
//                   className="text-sm text-gray-600 dark:text-gray-400 hover:text-ui-primary dark:hover:text-ui-primary-dark"
//                 >
//                   {childCategory.title}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     );
//   };
  
//   return (
//     <div className="fixed w-[100%] z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
//       {/* Main navbar */}
//       <div className="py-4 w-[100%] max-w-[95%] mx-auto flex items-center justify-between">
//         <div className="font-mono text-2xl uppercase logo tracking-leading"><Link to="/dashboard">JUNOONI</Link></div>
        
//         {/* Category links - redesigned to match the image */}
//         <div className="flex items-center space-x-10">
//         <Link to={'/productCatalog/products'} >All Products</Link>
//           {organizedCategories.map((category) => (
//             <div 
//               key={category.id}
//               className="relative group"
//               onMouseEnter={() => setActiveCategory(category.id)}
//               onMouseLeave={() => setActiveCategory(null)}
//             >
              
//               <Link 
//                 to={`/productCatalog/category/${category.slug}`}
//                 className={` text-sm py-2 transition-colors duration-200 relative
//                   ${activeCategory === category.id 
//                     ? 'text-black dark:text-white' 
//                     : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
//                   }`}
//               >
//                 {category.title}
                
//                 <span className={`absolute left-0 right-0 bottom-0 h-[2px] bg-black dark:bg-white transform origin-left transition-transform duration-300 
//                   ${activeCategory === category.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
//               </Link>
//             </div>
//           ))}
//         </div>
        
//         <div className="flex items-center gap-4">
//           <ThemeSwitch />
//           <ProfileDropdown />
//         </div>
//       </div>
      
//       {/* Megamenu dropdown */}
//       {organizedCategories.map(category => {
//         const hasChildren = category.children && category.children.length > 0;
        
//         if (!hasChildren) return null;
        
//         const columnGroups = groupChildrenIntoColumns(category.children);
        
//         return (
//           <div 
//             key={`megamenu-${category.id}`}
//             className={`absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 transition-all duration-300 ${
//               activeCategory === category.id 
//                 ? 'opacity-100 translate-y-0 visible' 
//                 : 'opacity-0 -translate-y-2 invisible'
//             }`}
//             onMouseEnter={() => setActiveCategory(category.id)}
//             onMouseLeave={() => setActiveCategory(null)}
//           >
//             <div className="max-w-[1200px] mx-auto py-6 px-6">
//               <div className="grid grid-cols-4 gap-6">
//                 {/* Category columns */}
//                 {columnGroups.map((columnItems, columnIndex) => (
//                   <div key={`column-${columnIndex}`} className="space-y-4">
//                     {columnItems.map(subcategory => 
//                       renderSubcategoryWithChildren(subcategory, category.slug)
//                     )}
//                   </div>
//                 ))}
                
//                 {/* Featured or promotional area */}
//                 <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
//                   <div className="mb-2 text-lg font-medium">Featured</div>
//                   <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Explore our top selections in {category.title}</div>
//                   <Link 
//                     to={`${category.slug}/featured`}
//                     className="px-4 py-2 text-sm text-white bg-black rounded-md dark:bg-white dark:text-black hover:bg-opacity-90"
//                   >
//                     View Collection
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Navbar;

import { useEffect, useState } from "react"
import { ProfileDropdown } from "../../../components/profile-dropdown"
import { Link } from "@tanstack/react-router"
import { ThemeSwitch } from '@/components/theme-switch'
import { ChevronDown, Star, TrendingUp } from 'lucide-react'

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

  // Add custom styles for animations
  useEffect(() => {
    if (!document.getElementById('navbar-styles')) {
      const style = document.createElement('style');
      style.id = 'navbar-styles';
      style.innerHTML = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        .navbar-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #fef7f0 50%, #ffffff 100%);
        }
        
        .dark .navbar-gradient {
          background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
        }
        
        .category-hover-effect {
          position: relative;
          overflow: hidden;
        }
        
        .category-hover-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(230, 81, 0, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .category-hover-effect:hover::before {
          left: 100%;
        }
        
        .logo-glow {
          text-shadow: 0 0 20px rgba(230, 81, 0, 0.3);
        }
        
        .brand-accent {
          background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .megamenu-shadow {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .featured-card {
          background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
          position: relative;
          overflow: hidden;
        }
        
        .featured-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          border-radius: 50%;
          transform: translate(30px, -30px);
        }
        
        .category-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .category-link:hover {
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const style = document.getElementById('navbar-styles');
      if (style) {
        style.remove();
      }
    };
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
          to={`/productCatalog/category/${fullPath}`}
          className="block mb-2 font-medium text-gray-900 dark:text-gray-100 hover:text-[#e65100] dark:hover:text-[#ff6f00] transition-colors duration-200"
        >
          {subcategory.title}
        </Link>
        
        {hasChildren && (
          <ul className="space-y-1 ml-0">
            {subcategory.children?.map(childCategory => (
              <li key={childCategory.id}>
                <Link 
                  to={`/productCatalog/category/${getCategoryPath(childCategory, fullPath)}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#e65100] dark:hover:text-[#ff6f00] transition-colors duration-200 block py-1"
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
    <div className="fixed w-full z-50 navbar-gradient backdrop-blur-sm border-b border-orange-200/30 dark:border-gray-700/50">
      {/* Main navbar */}
      <div className="py-4 w-full max-w-[95%] mx-auto flex items-center justify-between">
        {/* Logo with enhanced styling */}
        <div className="font-mono text-2xl uppercase logo tracking-wide logo-glow">
          <Link 
            to="/dashboard" 
            className="brand-accent font-bold hover:scale-105 transition-transform duration-300 inline-block"
          >
            <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-6 sm:h-8" />
          </Link>
        </div>
        
        {/* Category links - enhanced design */}
        <div className="flex items-center space-x-8">
          <Link 
            to={'/productCatalog/products'} 
            className="category-link font-medium text-gray-700 dark:text-gray-300 hover:text-[#e65100] dark:hover:text-[#ff6f00] px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-300"
          >
            All Products
          </Link>
          
          {organizedCategories.map((category) => {
            const hasChildren = category.children && category.children.length > 0;
            
            return (
              <div 
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link 
                  to={`/productCatalog/category/${category.slug}`}
                  className={`category-link font-medium px-3 py-2 rounded-lg transition-all duration-300 relative flex items-center gap-1
                    ${activeCategory === category.id 
                      ? 'text-[#e65100] dark:text-[#ff6f00] bg-orange-50 dark:bg-orange-950/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#e65100] dark:hover:text-[#ff6f00] hover:bg-orange-50 dark:hover:bg-orange-950/20'
                    }`}
                >
                  {category.title}
                  {hasChildren && (
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${
                        activeCategory === category.id ? 'rotate-180' : 'group-hover:translate-y-0.5'
                      }`} 
                    />
                  )}
                  
                  {/* Enhanced underline effect */}
                  <span className={`absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-[#e65100] to-[#ff6f00] transform origin-left transition-transform duration-300 
                    ${activeCategory === category.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
              </div>
            );
          })}
        </div>
        
        {/* Right side controls with enhanced styling */}
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors duration-300">
            <ThemeSwitch />
          </div>
          <div className="p-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors duration-300">
            <ProfileDropdown />
          </div>
        </div>
      </div>
      
      {/* Simple Professional Megamenu dropdown */}
      {organizedCategories.map(category => {
        const hasChildren = category.children && category.children.length > 0;
        
        if (!hasChildren) return null;
        
        const columnGroups = groupChildrenIntoColumns(category.children, 3);
        
        return (
          <div 
            key={`megamenu-${category.id}`}
            className={`absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-700 z-40 transition-all duration-200 ease-out ${
              activeCategory === category.id 
                ? 'opacity-100 translate-y-0 visible' 
                : 'opacity-0 -translate-y-2 invisible'
            }`}
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="max-w-5xl mx-auto py-6 px-6">
              <div className="grid grid-cols-4 gap-6">
                {/* Category columns */}
                {columnGroups.map((columnItems, columnIndex) => (
                  <div key={`column-${columnIndex}`} className="space-y-4">
                    {columnItems.map(subcategory => 
                      renderSubcategoryWithChildren(subcategory, category.slug)
                    )}
                  </div>
                ))}
                
                {/* Simple Featured Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Featured
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Explore top picks in {category.title}
                  </p>
                  <Link 
                    to={`/productCatalog/category/${category.slug}`}
                    className="inline-block px-3 py-1 text-sm text-[#e65100] hover:text-white hover:bg-[#e65100] border border-[#e65100] rounded transition-all duration-200"
                  >
                    View All
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
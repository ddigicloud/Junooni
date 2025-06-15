"use client";

import React, { useState, useRef, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@modules/layout/components/search-button";
import { Search, UserCircle, ShoppingCart, Heart } from "lucide-react";
import { useNavContext } from "./NavContext"; // Import the NavContext hook

// Animation variants for menu transitions
const menuVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0.0, 0.2, 1] // Material Design easing
    }
  },
  visible: { 
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: [0.0, 0.0, 0.2, 1] // Material Design easing
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0.0, 0.2, 1] // Material Design easing
    }
  }
};

// Define the interfaces for the category structure
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

interface MobileMenuProps {
  categories: CategoryLevel1[];
}

// Define a type for tracking expanded categories
interface ExpandedState {
  [key: string]: boolean;
}

export default function MobileMenu({ categories = [] }: MobileMenuProps) {
  // Get the navigation context to coordinate with desktop navigation
  // Now include the isPast100vh and isHomePage values
  const { isAnyMenuHovered, isPast100vh, isHomePage } = useNavContext();
  
  // Menu state
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<ExpandedState>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<ExpandedState>({});
  
  // Refs
  const menuPanelRef = useRef<HTMLDivElement>(null);

  // Organize categories into a navigable structure - memoize this calculation
  const organizeCategories = React.useMemo(() => {
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
   
    return {
      topLevelCategories,
      categoryMap
    };
  }, [categories]);

  const { topLevelCategories, categoryMap } = organizeCategories;

  // Toggle the main menu
  const toggleMenu = () => {
    // Toggle body scroll lock when menu opens/closes
    if (!isOpen) {
      // Lock scrolling on body when opening menu
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when closing menu
      document.body.style.overflow = '';
      
      // Reset expanded states
      setExpandedCategories({});
      setExpandedSubcategories({});
    }
    setIsOpen(!isOpen);
  };
  
  // Cleanup effect to ensure scroll is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Toggle a category's expanded state with improved animation
  const toggleCategory = (categoryId: string) => {
    // First handle child categories if we're closing
    if (expandedCategories[categoryId]) {
      // Close any expanded subcategories when closing a category
      setExpandedSubcategories((prev) => {
        const newState = { ...prev };
        // Close any subcategories from this parent
        categoryMap.get(categoryId)?.forEach((subcategory: CategoryLevel2) => {
          delete newState[subcategory.id];
        });
        return newState;
      });
      
      // Short delay to allow child animations to start before parent
      setTimeout(() => {
        setExpandedCategories((prev) => ({
          ...prev,
          [categoryId]: !prev[categoryId]
        }));
      }, 50);
    } else {
      // Simply expand if we're opening
      setExpandedCategories((prev) => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    }
  };
  
  // Toggle a subcategory's expanded state
  const toggleSubcategory = (categoryId: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Navigate to a category and close menu
  const handleNavigate = () => {
    setIsOpen(false);
    setExpandedCategories({});
    setExpandedSubcategories({});
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node) && isOpen) {
        toggleMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Determine the hamburger icon color based on page type and scroll position
  // Replace your current getHamburgerColor function with this one
const getHamburgerColor = () => {

  return isHomePage && !isPast100vh && !isAnyMenuHovered 
    ? "text-white" 
    : "text-black";
};
  
  return (
    <div>
      {/* Hamburger Menu Toggle Button - Color changes based on navigation context and scroll position */}
      <button 
        onClick={toggleMenu} 
        className={`p-1 focus:outline-none transition-colors duration-300 ${getHamburgerColor()}`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <RxHamburgerMenu className="w-6 h-6" />
      </button>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[1001] bg-black"
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              ref={menuPanelRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="fixed inset-y-0 left-0 z-[1002] w-full max-w-full bg-white shadow-xl flex flex-col h-full"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <LocalizedClientLink
                  href="/"
                  className="text-xl font-semibold text-black uppercase transition-colors duration-200 hover:text-gray-700"
                  data-testid="nav-store-link"
                  onClick={handleNavigate}
                >
                  JUNOONI
                </LocalizedClientLink>
                <div className="mt-auto">
                  <div className="flex justify-end py-2">
                    <LocalizedClientLink
                      href="/account"
                      className="flex items-center px-3 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                      onClick={handleNavigate}
                    >
                      <UserCircle className="w-5 h-5"/>
                    </LocalizedClientLink>
                    {/* <LocalizedClientLink
                      href="/search"
                      className="flex items-center px-3 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                      onClick={handleNavigate}
                    >
                      <Search className="w-5 h-5"/>
                    </LocalizedClientLink> */}
                    <div className="relative mt-2 ml-2 mr-2">
                      <SearchBar categories={categories}/>
                    </div>
                    <LocalizedClientLink
                      href="/wishlist"
                      className="flex items-center px-3 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                      onClick={handleNavigate}
                    >
                      <Heart className="w-5 h-5"/>
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/cart"
                      className="flex items-center px-3 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                      onClick={handleNavigate}
                    >
                      <ShoppingCart className="w-5 h-5"/>
                    </LocalizedClientLink>
                  </div>
                </div>
                <button 
                  onClick={toggleMenu} 
                  className="p-1 text-black focus:outline-none"
                  aria-label="Close menu"
                >
                  <IoMdClose className="w-5 h-5" />
                </button>
              </div>
              
              {/* Categories List with Myntra-style Vertical Hierarchy */}
              <div className="flex-1 overflow-y-auto">
                {topLevelCategories.map((category) => {
                  // Check if category has children
                  const hasChildren = categoryMap.has(category.id) && categoryMap.get(category.id).length > 0;
                  const isExpanded = !!expandedCategories[category.id];
                  
                  return (
                    <div key={category.id} className="border-b border-gray-100">
                      {/* Level 1 Category */}
                      <div 
                        className={`flex items-center justify-between px-4 py-3 ${isExpanded ? 'bg-gray-100' : ''} transition-colors duration-200`}
                      >
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="flex-1 text-sm text-black"
                          onClick={handleNavigate}
                        >
                          {category.name}
                        </LocalizedClientLink>
                        
                        {/* Expand/Collapse Toggle for Parent Category */}
                        {hasChildren && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-2 transition-all duration-200 rounded-full focus:outline-none active:bg-gray-200"
                            aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
                          >
                            {isExpanded ? (
                              <IoChevronUp className="w-4 h-4 text-gray-700" />
                            ) : (
                              <IoChevronDown className="w-4 h-4 text-gray-700" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Level 2 Subcategories (collapsed by default) */}
                      <AnimatePresence>
                        {hasChildren && isExpanded && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={menuVariants}
                            className="overflow-hidden"
                          >
                            {categoryMap.get(category.id).map((subcategory: CategoryLevel2) => {
                              // Check if subcategory has children
                              const hasSubChildren = categoryMap.has(subcategory.id) && 
                                                     categoryMap.get(subcategory.id).length > 0;
                              const isSubExpanded = !!expandedSubcategories[subcategory.id];
                              
                              return (
                                <div key={subcategory.id} className="border-t border-gray-100">
                                  {/* Level 2 Subcategory */}
                                  <div 
                                    className={`flex items-center justify-between px-6 py-3 ${isSubExpanded ? 'bg-gray-100' : 'bg-white'} transition-colors duration-200`}
                                  >
                                    <LocalizedClientLink
                                      href={`/categories/${subcategory.handle}`}
                                      className="flex-1 pl-2 text-sm text-black"
                                      onClick={handleNavigate}
                                    >
                                      {subcategory.name}
                                    </LocalizedClientLink>
                                    
                                    {/* Expand/Collapse Toggle for Subcategory */}
                                    {hasSubChildren && (
                                      <button
                                        onClick={() => toggleSubcategory(subcategory.id)}
                                        className="transition-all duration-200 rounded-full focus:outline-none active:bg-gray-200"
                                        aria-label={isSubExpanded ? `Collapse ${subcategory.name}` : `Expand ${subcategory.name}`}
                                      >
                                        {isSubExpanded ? (
                                          <IoChevronUp className="w-4 h-4 text-gray-700" />
                                        ) : (
                                          <IoChevronDown className="w-4 h-4 text-gray-700" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Level 3 Sub-subcategories (collapsed by default) */}
                                  <AnimatePresence>
                                    {hasSubChildren && isSubExpanded && (
                                      <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={menuVariants}
                                        className="overflow-hidden bg-gray-50"
                                      >
                                        {categoryMap.get(subcategory.id).map((subsubcategory: CategoryLevel3) => (
                                          <div key={subsubcategory.id} className="border-t border-gray-100">
                                            <div className="px-10 py-2">
                                              <LocalizedClientLink
                                                href={`/categories/${subsubcategory.handle}`}
                                                className="block w-full pl-2 text-sm text-black"
                                                onClick={handleNavigate}
                                              >
                                                {subsubcategory.name}
                                              </LocalizedClientLink>
                                            </div>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              
              {/* Additional Navigation Links */}
              {/* <div className="mt-auto border-t border-gray-200">
                <div className="flex justify-end py-2">
                  <LocalizedClientLink
                    href="/account"
                    className="flex items-center px-4 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                    onClick={handleNavigate}
                  >
                    <UserCircle className="w-5 h-5"/>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/search"
                    className="flex items-center px-4 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                    onClick={handleNavigate}
                  >
                    <Search className="w-5 h-5"/>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/cart"
                    className="flex items-center px-4 py-3 text-base text-black transition-colors duration-200 hover:text-gray-700"
                    onClick={handleNavigate}
                  >
                    <ShoppingCart className="w-5 h-5"/>
                  </LocalizedClientLink>
                </div>
              </div> */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
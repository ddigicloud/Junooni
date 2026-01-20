import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, X, ArrowLeft, Filter, Grid, List, Search } from 'lucide-react';
import Navbar from './Navbar';
import { useParams } from '@tanstack/react-router';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { Link } from '@tanstack/react-router';

// Use the same environment variable as ProductCard component
const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Helper function to parse the rich text description from payload
const parseRichTextDescription = (description: any): string => {
  if (!description || !description.root || !description.root.children) {
    return "Discover our curated collection of premium products designed to meet your needs.";
  }
  
  let extractedText = "";
  
  const extractTextFromChildren = (children: any[]): string => {
    let text = "";
    children.forEach((child: any) => {
      if (child.type === "text") {
        text += child.text + " ";
      } else if (child.children && Array.isArray(child.children)) {
        text += extractTextFromChildren(child.children);
      }
    });
    return text;
  };
  
  description.root.children.forEach((child: any) => {
    if (child.children && Array.isArray(child.children)) {
      extractedText += extractTextFromChildren(child.children);
    }
  });
  
  return extractedText.trim() || "Discover our curated collection of premium products designed to meet your needs.";
};

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
  description?: any;
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
  selectedColors: string[];
  onChange: (selectedColors: string[]) => void;
}

interface CheckboxFilterProps {
  items: Array<{ id: string; [key: string]: any }>;
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
  nameKey?: string;
  valueKey?: string;
}

interface CategoryTreeProps {
  categories: Category[];
  currentCategoryId?: number | null;
  onSelectCategory: (slug: string) => void;
}

// Helper function to determine if a color is light (for contrasting check mark)
const isLightColor = (hex: string): boolean => {
  const hexWithoutHash = hex.replace('#', '');
  const r = parseInt(hexWithoutHash.substring(0, 2), 16);
  const g = parseInt(hexWithoutHash.substring(2, 4), 16);
  const b = parseInt(hexWithoutHash.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

// Helper function to parse the rich text description from payload
const parseRichTextContent = (description: any): { heading: string; subheading: string } => {
  const fallback = {
    heading: "Products",
    subheading: "Discover our curated collection of premium products designed to meet your needs."
  };

  if (!description || !description.root || !description.root.children) {
    return fallback;
  }
  
  const extractTextFromChildren = (children: any[]): string => {
    let text = "";
    children.forEach((child: any) => {
      if (child.type === "text") {
        text += child.text;
      } else if (child.children && Array.isArray(child.children)) {
        text += extractTextFromChildren(child.children);
      }
    });
    return text.trim();
  };
  
  let heading = fallback.heading;
  let subheading = fallback.subheading;
  
  description.root.children.forEach((child: any) => {
    if (child.type === "heading" && child.tag === "h1" && child.children) {
      heading = extractTextFromChildren(child.children);
    } else if (child.type === "paragraph" && child.children) {
      subheading = extractTextFromChildren(child.children);
    }
  });
  
  return { heading, subheading };
};

// Custom hook for animation styles
const useStyles = () => {
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div 
        ref={overlayRef}
        className="w-full h-full overflow-y-auto bg-white shadow-2xl animate-slide-in-right"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b bg-gradient-to-r from-orange-50 to-amber-50">
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
        <div className="sticky bottom-0 p-6 bg-white border-t bg-gray-50">
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
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsOpen(true);
      } else if (!defaultOpen) {
        setIsOpen(false);
      }
    };

    if (mediaQuery.matches) {
      setIsOpen(true);
    }

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [defaultOpen]);

  if (isMobile) {
    return <>{children}</>;
  }
  
  return (
    <div className="p-4 mb-6 border border-gray-100 filter-section rounded-xl">
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
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COLOR_COUNT = 12;
  
  // Memoize unique colors to prevent recalculation
  const uniqueColors = useMemo(() => 
    colors.filter((color, index, self) => 
      index === self.findIndex((c) => c.colorHex === color.colorHex)
    ),
    [colors]
  );
  
  const displayedColors = showAll ? uniqueColors : uniqueColors.slice(0, INITIAL_COLOR_COUNT);
  const hasMoreColors = uniqueColors.length > INITIAL_COLOR_COUNT;
  
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {displayedColors.map((color) => {
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
      
      {hasMoreColors && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm font-medium text-[#e65100] hover:text-orange-700 transition-colors flex items-center gap-1"
        >
          {showAll ? (
            <>
              <span>Show less</span>
              <ChevronRight size={16} className="rotate-[-90deg]" />
            </>
          ) : (
            <>
              <span>Show more ({uniqueColors.length - INITIAL_COLOR_COUNT} more)</span>
              <ChevronRight size={16} className="rotate-90" />
            </>
          )}
        </button>
      )}
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
  const getItemValue = (item: any): string => {
    if (valueKey && item[valueKey]) {
      return item[valueKey];
    }
    return item.id;
  };

  // Memoize unique items
  const uniqueItems = useMemo(() => 
    valueKey 
      ? items.filter((item, index, self) => 
          index === self.findIndex(i => i[valueKey] === item[valueKey])
        )
      : items,
    [items, valueKey]
  );
  
  return (
    <div className="space-y-3">
      {uniqueItems.map((item) => {
        const value = getItemValue(item);
        const isSelected = selectedItems.includes(value);
        return (
          <label key={value} className="flex items-center p-2 space-x-3 transition-colors rounded-lg cursor-pointer group hover:bg-orange-50">
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

const CategoryTree: React.FC<CategoryTreeProps> = React.memo(({ categories, currentCategoryId, onSelectCategory }) => {
  const parentCategories = useMemo(() => 
    categories.filter((cat) => !cat.parent),
    [categories]
  );
  
  const renderCategory = useCallback((category: Category) => {
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
          <div className="pl-4 ml-2 border-l-2 border-orange-100">
            {children.map((child) => renderCategory(child))}
          </div>
        )}
      </div>
    );
  }, [categories, currentCategoryId, onSelectCategory]);
  
  return (
    <div className="space-y-1">
      {parentCategories.map((cat) => renderCategory(cat))}
    </div>
  );
});

CategoryTree.displayName = 'CategoryTree';

const vite_backend = import.meta.env.VITE_MEDUSA_BACKEND_URL;
const BRAND = {
  primary: "#e65100", 
  secondary: "#ac1900", 
  accent: "#581845", 
  light: "#FFC300",
  background: "#FFEFD5", 
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999"
};

const CategoryPage: React.FC = () => {
  useStyles();
  
  const [simplifiedProducts, setSimplifiedProducts] = useState<SimplifiedProduct[]>([]);
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
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

  const params = useParams({strict:false});
  const slug = params.slug as string;

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Memoize available filter options extraction
  const { availableColors, availableSizes, availableTechnologies } = useMemo(() => {
    const colors: ColorOption[] = [];
    const sizes: SizeOption[] = [];
    const technologies: PrintingTechnology[] = [];
    
    apiProducts.forEach((product: APIProduct) => {
      if (product.colorOptions) {
        product.colorOptions.forEach((color: ColorOption) => {
          if (!colors.some((c) => c.id === color.id)) {
            colors.push(color);
          }
        });
      }
      
      if (product.sizeOptions) {
        product.sizeOptions.forEach((size: SizeOption) => {
          if (!sizes.some((s) => s.id === size.id)) {
            sizes.push(size);
          }
        });
      }
      
      if (product.printingTechnologies) {
        product.printingTechnologies.forEach((tech: PrintingTechnology) => {
          if (!technologies.some((t) => t.id === tech.id)) {
            technologies.push(tech);
          }
        });
      }
    });
    
    return { availableColors: colors, availableSizes: sizes, availableTechnologies: technologies };
  }, [apiProducts]);

  // Memoize filtered products - THIS IS THE KEY OPTIMIZATION
  const filteredProducts = useMemo(() => {
    if (simplifiedProducts.length === 0) return [];
    
    let results = [...simplifiedProducts];
    
    if (selectedColorHexes.length > 0) {
      results = results.filter(product => 
        product.colorOptions && product.colorOptions.some(color => 
          selectedColorHexes.includes(color.colorHex)
        )
      );
    }
    
    if (selectedSizeNames.length > 0) {
      results = results.filter(product => 
        product.sizeOptions && product.sizeOptions.some(size => 
          selectedSizeNames.includes(size.sizeName)
        )
      );
    }
    
    if (selectedTechnologyNames.length > 0) {
      results = results.filter(product => 
        product.printingTechnologies && product.printingTechnologies.some(tech => 
          selectedTechnologyNames.includes(tech.technologyName)
        )
      );
    }
    
    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        product.category && product.category.some(cat => 
          selectedCategories.includes(cat)
        )
      );
    }
    
    return results;
  }, [simplifiedProducts, selectedColorHexes, selectedSizeNames, selectedTechnologyNames, selectedCategories]);

  // Fetch categories and products from API - OPTIMIZED
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${vite_payload}/api/categories?limit=0&depth=2`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        setCategories(data.docs);
        
        const pathParts = window.location.pathname.split('/');
        const categoryIndex = pathParts.indexOf('category');
        const slugParts = pathParts.slice(categoryIndex + 1).filter(Boolean);
        const targetSlug = slugParts[slugParts.length - 1];
        
        const matchedCategory = data.docs.find((item: Category) => item.slug === targetSlug);
        
        if (matchedCategory) {
          setCurrentCategory(matchedCategory);
          
          if (matchedCategory.products && matchedCategory.products.length > 0) {
            setApiProducts(matchedCategory.products);
            
            const formattedProducts: SimplifiedProduct[] = matchedCategory.products.map((apiProduct: APIProduct) => {
              const productColors = apiProduct.colorOptions?.map((color: ColorOption) => color.colorHex) || [];
              
              return {
                id: String(apiProduct.id),
                name: apiProduct.name,
                price: apiProduct.cost,
                rating: 4.5,
                image: apiProduct.displayImages && apiProduct.displayImages.length > 0 
                  ? apiProduct.displayImages[0].image.url 
                  : '/placeholder-image.jpg',
                category: apiProduct.categories.map((cat: Category) => cat.slug),
                availableColors: productColors,
                colorOptions: apiProduct.colorOptions || [],
                sizeOptions: apiProduct.sizeOptions || [],
                printingTechnologies: apiProduct.printingTechnologies || [],
                description: apiProduct.description,
                isNew: false,
                onSale: false,
              };
            });
            
            const sortedProducts = formattedProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            
            setSimplifiedProducts(sortedProducts);
          } else {
            setSimplifiedProducts([]);
            setApiProducts([]);
          }
        } else {
          setCurrentCategory(null);
          setSimplifiedProducts([]);
          setApiProducts([]);
        }
        
        setLoadingCategories(false);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) {
          setLoadingCategories(false);
          setLoading(false);
        }
      }
    };

    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, [vite_payload]);

  // Memoize helper functions
  const createProductMetadata = useCallback((productId: string): ProductMetadata => {
    const simplifiedProduct = simplifiedProducts.find(p => p.id === productId);
    const rating = simplifiedProduct ? simplifiedProduct.rating : 4.5;
    
    return {
      isBestSeller: false,
      isStaffPick: false,
      rating: rating,
      reviewCount: Math.floor(10 + Math.random() * 140)
    };
  }, [simplifiedProducts]);

  const getProductCardData = useCallback((productId: string): Product | null => {
    const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
    
    if (!apiProduct) return null;
    
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
  }, [apiProducts]);

  const storeCompleteProductData = useCallback((productId: string): void => {
    const apiProduct = apiProducts.find(p => p.id === parseInt(productId));
    if (apiProduct) {
      sessionStorage.setItem(`product_${apiProduct.id}`, JSON.stringify(apiProduct));
    }
  }, [apiProducts]);
  
  const handleCategorySelect = useCallback((categorySlug: string): void => {
    window.location.href = `/productCatalog/category/${categorySlug}`;
  }, []);
  
  const clearAllFilters = useCallback((): void => {
    setSelectedColorHexes([]);
    setSelectedSizeNames([]);
    setSelectedTechnologyNames([]);
    setSelectedCategories([]);
  }, []);

  const openFilterOverlay = useCallback((): void => {
    setActiveFilterOverlay('all');
  }, []);

  const closeFilterOverlay = useCallback(() => {
    setActiveFilterOverlay(null);
  }, []);
  
  const getTotalActiveFilterCount = useCallback((): number => {
    return selectedColorHexes.length + 
           selectedSizeNames.length + 
           selectedTechnologyNames.length + 
           selectedCategories.length;
  }, [selectedColorHexes, selectedSizeNames, selectedTechnologyNames, selectedCategories]);

  // Memoize hero content
  const heroContent = useMemo(() => {
    return currentCategory && currentCategory.description 
      ? parseRichTextContent(currentCategory.description)
      : { heading: "Products", subheading: "Discover our curated collection of premium products designed to meet your needs." };
  }, [currentCategory]);

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30">
        <div className="container px-4 py-8 mx-auto mt-12">
          {/* Dynamic Hero Section */}
          <div className="sm:mt-12 mb-4 animate-fadeIn">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e65100] to-orange-600 bg-clip-text text-transparent">
              {heroContent.heading}
            </h1>
            <p className="max-w-2xl text-lg text-gray-600">
              {heroContent.subheading}
            </p>
          </div>
          
          {/* Category Pill Navigation */}
          <div className="flex gap-3 pb-2 mb-6 overflow-x-auto md:hidden flex-nowrap">
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
          <div className="flex items-center justify-between p-4 mb-6 bg-white border border-orange-100 shadow-sm md:hidden rounded-xl">
            <div className="text-sm font-medium text-gray-700">
              <span className="text-[#e65100] font-semibold">{filteredProducts.length}</span> products found
            </div>
            {isMobileView && (
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transition-all duration-200"
                onClick={openFilterOverlay}
              >
                <Filter size={16} />
                <span>Filters</span>
                {getTotalActiveFilterCount() > 0 && (
                  <Badge className="h-5 px-1 ml-1 min-w-5 filter-badge">
                    {getTotalActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            )}
          </div>
          
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Filter Sidebar - Desktop version */}
            <div className="flex-shrink-0 hidden w-full md:w-80 md:block">
              {loading ? (
                <div className="h-96 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
              ) : (
                <>
                  {/* Desktop Filter Sections */}
                  <div className="p-6 mb-8 bg-white border border-orange-100 shadow-sm rounded-xl">
                    <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
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
                  {getTotalActiveFilterCount() > 0 && (
                    <div className="p-6 mb-6 bg-white border border-orange-100 shadow-sm rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
                          const color = availableColors.find(c => c.colorHex === colorHex);
                          return color ? (
                            <Badge 
                              key={`color-${colorHex}`} 
                              className="flex items-center gap-2 py-1 pl-2 pr-1 filter-badge"
                            >
                              <span 
                                className="w-3 h-3 border rounded-full border-white/30" 
                                style={{ backgroundColor: colorHex }}
                              />
                              {color.colorName}
                              <button
                                onClick={() => setSelectedColorHexes(selectedColorHexes.filter(hex => hex !== colorHex))}
                                className="p-1 ml-1 transition-colors rounded-full hover:bg-white/20"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                        
                        {selectedSizeNames.map(sizeName => {
                          const size = availableSizes.find(s => s.sizeName === sizeName);
                          return size ? (
                            <Badge 
                              key={`size-${sizeName}`} 
                              className="flex items-center gap-1 py-1 pl-2 pr-1 filter-badge"
                            >
                              {sizeName}
                              <button
                                onClick={() => setSelectedSizeNames(selectedSizeNames.filter(name => name !== sizeName))}
                                className="p-1 ml-1 transition-colors rounded-full hover:bg-white/20"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                        
                        {selectedTechnologyNames.map(techName => {
                          const tech = availableTechnologies.find(t => t.technologyName === techName);
                          return tech ? (
                            <Badge 
                              key={`tech-${techName}`} 
                              className="flex items-center gap-1 py-1 pl-2 pr-1 filter-badge"
                            >
                              {techName}
                              <button
                                onClick={() => setSelectedTechnologyNames(selectedTechnologyNames.filter(name => name !== techName))}
                                className="p-1 ml-1 transition-colors rounded-full hover:bg-white/20"
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
            
            {/* Mobile Filter Overlay */}
            {isMobileView && (
              <MobileFilterOverlay
                isOpen={activeFilterOverlay === 'all'}
                onClose={closeFilterOverlay}
                onReset={clearAllFilters}
              >
                {availableColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
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
                
                {availableSizes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
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
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="items-center justify-between hidden p-4 mb-4 bg-white border border-orange-100 shadow-sm md:flex rounded-xl">
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
                    <div className="p-8 text-center bg-white border border-orange-100 shadow-sm rounded-xl animate-fadeIn">
                      <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                          <Search className="w-8 h-8 text-[#e65100]" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-gray-900">No products found</h3>
                        <p className="mb-6 text-gray-600">We couldn't find any products matching your current filters. Try adjusting your criteria or explore our full collection.</p>
                        <Button 
                          onClick={clearAllFilters} 
                          className="bg-gradient-to-r from-[#e65100] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 product-grid sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map((product, index) => {
                        const productCardData = getProductCardData(product.id);
                        const productCardMetadata = createProductMetadata(product.id);
                        
                        if (!productCardData) return null;
                        
                        return (
                          <div 
                            key={product.id} 
                            className="relative w-full max-w-full mx-auto group transform transition-all duration-300 hover:scale-[1.02]"
                            onClick={() => storeCompleteProductData(product.id)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <ProductCard 
                              product={productCardData}
                              metadata={productCardMetadata}
                            />
                            
                            {product.isNew && (
                              <Badge className="absolute z-20 font-medium text-white top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600">
                                New
                              </Badge>
                            )}
                            {product.onSale && (
                              <Badge className="absolute z-20 font-medium text-white top-3 right-3 bg-gradient-to-r from-red-500 to-red-600">
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
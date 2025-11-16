import { useEffect, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Define interfaces
interface Image {
  id: number;
  alt: string;
  url: string;
  width: number;
  height: number;
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

interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
  breadcrumbs?: any[];
  createdAt?: string;
  updatedAt?: string;
  parent?: number;
  products?: any[];
  slugLock?: boolean;
}

interface CategoryOption {
  slug: string;
  title: string;
}

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  categories: Category[];
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printingTechnologies: PrintingTechnology[];
  status: string;
  slug: string;
  productType: string;
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

type ProductMetadataMap = Record<number, ProductMetadata>;

const PRODUCTS_PER_PAGE = 12;

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<CategoryOption[]>([{ slug: "all", title: "All" }]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products and categories
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${vite_payload}/api/blank-products?limit=1000&depth=1`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${vite_payload}/api/categories?limit=100`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ]);

        // Handle products
        const productsData = await productsResponse.json();
        const fetchedProducts: Product[] = productsData.docs || productsData;
        setProducts(fetchedProducts);

        // Handle categories
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const fetchedCategories: Category[] = categoriesData.docs || categoriesData;
          
          const categoryOptions = [
            { slug: "all", title: "All" },
            ...fetchedCategories.map((cat: Category) => ({
              slug: cat.slug,
              title: cat.title
            }))
          ];
          
          setCategories(categoryOptions);
        } else {
          setCategories([
            { slug: "all", title: "All" },
            { slug: "women-tee", title: "Women Tee" },
            { slug: "apparel", title: "Apparel" },
            { slug: "accessories", title: "Accessories" },
            { slug: "home", title: "Home" },
            { slug: "promotional", title: "Promotional" }
          ]);
        }
        
        // Generate metadata
        const metadata: ProductMetadataMap = {};
        fetchedProducts.forEach((product: Product) => {
          metadata[product.id] = {
            isBestSeller: Math.random() > 0.3,
            isStaffPick: Math.random() > 0.6,
            rating: 3.5 + Math.random() * 1.5,
            reviewCount: Math.floor(10 + Math.random() * 140)
          };
        });
        
        setProductMetadata(metadata);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategories([
          { slug: "all", title: "All" },
          { slug: "women-tee", title: "Women Tee" },
          { slug: "apparel", title: "Apparel" },
          { slug: "accessories", title: "Accessories" },
          { slug: "home", title: "Home" },
          { slug: "promotional", title: "Promotional" }
        ]);
      } finally {
        setLoading(false);
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") {
      return matchesSearch;
    }
    
    const matchesCategory = product.categories && product.categories.some(category => 
      category.slug === selectedCategory
    );
    
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="px-2">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 border rounded-lg transition-colors ${
            currentPage === i
              ? 'bg-[#e65100] text-white border-[#e65100]'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="px-2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e65100] to-[#ff9800] opacity-5"></div>
        <div className="relative px-4 pt-20 pb-16 mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-3xl lg:text-5xl dark:text-white">
              Build Your Vision
              <span className="block text-[#e65100] text-2xl md:text-3xl lg:text-3xl font-medium mt-2">
                Choose from Premium Products
              </span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300">
              Transform your ideas into reality with our curated collection of high-quality blank products, 
              perfect for customization and branding.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="p-3 bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e65100] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="lg:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={categoriesLoading}
                    className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e65100] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50"
                  >
                    {categoriesLoading ? (
                      <option>Loading categories...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 pb-8 mx-auto sm:pb-20 max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="flex flex-col items-start justify-between p-6 mb-8 bg-white border border-gray-200 shadow-sm sm:flex-row sm:items-center dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Product Catalog
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? 'Loading...' : `${filteredProducts.length} products available`}
              {!loading && filteredProducts.length > PRODUCTS_PER_PAGE && (
                <span className="ml-2 text-sm">
                  (Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-xl">
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 mb-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="w-2/3 h-3 mb-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="w-1/3 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map((product) => {
                    const metadata = productMetadata[product.id] || {
                      isBestSeller: false,
                      isStaffPick: false,
                      rating: 4.0,
                      reviewCount: 0
                    };
                    
                    return (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        metadata={metadata} 
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {renderPaginationButtons()}
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-800">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                    No products found
                  </h3>
                  <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#e65100] hover:bg-[#d84315] transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;
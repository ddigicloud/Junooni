import { useEffect, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import Navbar from "./Navbar";
import { useToast } from "@/hooks/use-toast";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;
const vite_backend = import.meta.env.VITE_MEDUSA_BACKEND_URL;

// Define all the interfaces
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

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  status?: string;
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printingTechnologies: PrintingTechnology[];
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

type ProductMetadataMap = Record<number, ProductMetadata>;

const PRODUCTS_PER_PAGE = 12;

// Utility function to validate token
const validateToken = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return { isValid: false, hasActorId: false, actorId: null };

    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { isValid: false, hasActorId: false, actorId: null };
    }
    
    const actorId = payload.actor_id || payload.sub || payload.id;
    return { 
      isValid: true,
      hasActorId: !!actorId, 
      actorId: actorId 
    };
  } catch (error) {
    return { isValid: false, hasActorId: false, actorId: null };
  }
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    const validateAndVerify = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access products.",
            variant: "destructive",
          });
          window.location.href = '/sign-in';
          return;
        }
        
        const { isValid, hasActorId } = validateToken();
        
        if (!isValid) {
          localStorage.clear();
          toast({
            title: "Session Expired",
            description: "Please sign in again.",
            variant: "destructive",
          });
          window.location.href = '/sign-in';
          return;
        }
        
        if (!hasActorId) {
          toast({
            title: "Complete Your Profile",
            description: "Please complete your vendor profile.",
            variant: "destructive",
          });
          window.location.href = '/onboarding?step=basic-info';
          return;
        }
        
        // Verify with backend
        try {
          const response = await fetch(`${vite_backend}/vendors/me`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          });

          if (response.status === 401) {
            localStorage.clear();
            toast({
              title: "Session Expired",
              description: "Please sign in again.",
              variant: "destructive",
            });
            window.location.href = '/sign-in';
            return;
          }
        } catch (apiError) {
          console.error('Backend verification failed:', apiError);
        }
        
      } catch (err) {
        console.error('Authentication validation failed:', err);
        localStorage.clear();
        window.location.href = '/sign-in';
      }
    };

    validateAndVerify();
  }, [toast]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // OPTION 1: Filter in the API call (BEST - most efficient)
        // Use PayloadCMS query parameters to only fetch active products
        const response = await fetch(
          `${vite_payload}/api/blank-products?where[status][equals]=active&limit=1000&depth=1`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        const fetchedProducts: Product[] = data.docs || data;
        
        // OPTION 2: Filter after fetching (fallback if API filtering doesn't work)
        // Filter out draft products immediately after fetching
        const activeProducts = fetchedProducts.filter(
          (product) => product.status?.toLowerCase() !== 'draft'
        );
        
        // Set only active products to state
        setProducts(activeProducts);
        
        // Generate metadata only for active products
        const metadata: ProductMetadataMap = {};
        activeProducts.forEach((product: Product) => {
          metadata[product.id] = {
            isBestSeller: Math.random() > 0.3,
            isStaffPick: Math.random() > 0.6,
            rating: 3.5 + Math.random() * 1.5,
            reviewCount: Math.floor(10 + Math.random() * 140)
          };
        });
        
        setProductMetadata(metadata);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

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
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8 pt-28">
          {/* Enhanced Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#ff7043] rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              What would you like to 
              <span className="bg-gradient-to-r from-[#e65100] to-[#ff7043] bg-clip-text text-transparent"> create</span>?
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Discover our premium collection of customizable products. From apparel to accessories, bring your designs to life.
            </p>
            {!loading && products.length > PRODUCTS_PER_PAGE && (
              <p className="mt-4 text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
              </p>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(12)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => {
                    const metadata = productMetadata[product.id] || {
                      isBestSeller: false,
                      isStaffPick: false,
                      rating: 4.0,
                      reviewCount: 0
                    };
                    
                    return (
                      <div key={product.id} className="group">
                        <ProductCard 
                          product={product} 
                          metadata={metadata}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
                      <p className="text-gray-500">We're currently updating our catalog. Please check back soon!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {renderPaginationButtons()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { useToast } from '@/hooks/use-toast'
import { Link } from '@tanstack/react-router'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/product-columns'
import { DataTable } from './components/data-tables'
import ChatwootWidget from '@/components/ChatwootWidget'
import { ProductsPrimaryButtons, ProductsPrimaryButtonsHandle } from './components/ProductsPrimaryButtons'
import ProductsProvider from './context/products-context'
import { Product } from './context/product-modules/types'
import Junoonilogo from '../../assets/junooni_logo_brand_color.png' // Adjust path as needed
import { useEffect, useState, useRef } from 'react'
import { Package, Plus, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Junooni brand colors
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

// Simple token validation
const validateToken = (): boolean => {
  const token = localStorage.getItem("vendorToken");
  const tokenTimestamp = localStorage.getItem("vendorTokenTimestamp");
  
  if (!token || !tokenTimestamp) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorTokenTimestamp");
    return false;
  }
  
  const now = Date.now();
  const tokenAge = now - parseInt(tokenTimestamp);
  const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // If token is older than 1 hour, clear it
  if (tokenAge > ONE_HOUR) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorTokenTimestamp");
    return false;
  }
  
  return true;
};

// Pagination Component Props Interface
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

// Improved Mobile-Responsive Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    // For mobile screens, show fewer pages
    const isMobile = window.innerWidth < 640; // sm breakpoint
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (isMobile) {
        // Mobile: Show current page and adjacent pages only
        if (currentPage <= 2) {
          pages.push(1, 2);
          if (totalPages > 2) pages.push('...');
        } else if (currentPage >= totalPages - 1) {
          pages.push('...');
          pages.push(totalPages - 1, totalPages);
        } else {
          pages.push('...');
          pages.push(currentPage);
          pages.push('...');
        }
      } else {
        // Desktop: Show more pages
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
    }
    
    return pages;
  };

  return (
    <div className="w-full border-t" style={{ borderColor: `${BRAND.primary}11` }}>
      {/* Mobile-first responsive layout */}
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
        
        {/* Items per page selector - Full width on mobile */}
        <div className="flex items-center justify-center gap-2 text-xs sm:justify-start sm:text-sm">
          <span className="text-gray-600 whitespace-nowrap">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-16 h-7 text-xs sm:w-20 sm:h-8 sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-600 whitespace-nowrap">per page</span>
        </div>

        {/* Page info - Center on mobile */}
        <div className="text-xs text-center text-gray-600 sm:text-sm">
          <span className="inline sm:hidden">
            {totalItems > 0 ? startItem : 0}-{endItem} of {totalItems}
          </span>
          <span className="hidden sm:inline">
            Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} results
          </span>
        </div>

        {/* Page navigation - Compact on mobile */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 text-xs sm:h-8 sm:w-8 flex-shrink-0"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Page numbers with mobile-optimized display */}
          <div className="flex items-center gap-1 max-w-[200px] overflow-hidden">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 py-1 text-xs text-gray-500 flex-shrink-0">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-7 w-7 p-0 text-xs sm:h-8 sm:w-8 flex-shrink-0"
                  style={currentPage === page ? { backgroundColor: BRAND.primary } : {}}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 text-xs sm:h-8 sm:w-8 flex-shrink-0"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const popupButtonsRef = useRef<ProductsPrimaryButtonsHandle>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { toast } = useToast();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your products.",
        variant: "destructive",
      });
      
      window.location.href = '/sign-in';
      return;
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("vendorToken");
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const responseBody = await response.json();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseBody.message}`);
        }

        const responseBody = await response.json();
        setProducts(responseBody.products || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch products");
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Calculate pagination values
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  return (
  <div
    className="flex flex-col min-h-screen overflow-x-hidden"
    style={{
      background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                   radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
      backgroundColor: "white",
      color: BRAND.textPrimary,
    }}
  >
    <ProductsProvider>
      <div className="flex flex-1 overflow-x-hidden">
        {/* Sidebar is inside ProductsProvider (assumed handled there) */}

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
          {/* Fixed Header aligned with content, not full screen */}

          <Header
            className="border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90 flex-shrink-0"
          >
            <div className="flex items-center justify-between w-full px-2 py-2 sm:px-4 min-w-0">
              {/* Left section - Empty for mobile, search for desktop */}
              <div className="flex items-center min-w-0">
                <div className="hidden md:flex justify-center flex-1 max-w-2xl mx-4">
                  <div className="w-full max-w-md">
                    {/* <Search /> */}
                  </div>
                </div>
              </div>

              {/* Center section - Mobile Logo */}
              <div className="md:hidden mt-2 flex-shrink-0">
                <Link to="/dashboard" className="flex items-center">
                  <img src={Junoonilogo} alt="Junooni Logo" className="h-8 sm:h-10" />      
                </Link>
              </div>

              {/* Right section - Navigation + Profile */}
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <Link to="/dashboard">
                  <Button variant="ghost" className="hidden md:flex text-sm">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="ghost" className="hidden md:flex text-sm" style={{ color: BRAND.primary }}>
                    Products
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="ghost" className="hidden md:flex text-sm">
                    Orders
                  </Button>
                </Link>
                <Link to="/help-center">
                  <Button variant="ghost" className="hidden md:flex text-sm">
                    Help
                  </Button>
                </Link>
                <ProfileDropdown />
              </div>
            </div>
          </Header>

          {/* Main Page Content */}
          <Main className="flex-1 px-2 py-4 mx-auto sm:px-4 sm:py-6 w-full max-w-full overflow-x-hidden">
            {/* Page Header with Enhanced Styling */}
            <div className="mt-2 mb-6 sm:mt-4 sm:mb-8">
              <div className="flex flex-col justify-between mb-4 space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:mb-6">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Mobile brand indicator */}
                  <div
                    className="p-2 rounded-lg sm:hidden sm:p-3 flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                    }}
                  >
                    <Package className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl truncate"
                      style={{ color: BRAND.textPrimary }}
                    >
                      Your Products
                    </h2>
                    <p
                      className="mt-1 text-sm sm:text-base lg:text-lg truncate"
                      style={{ color: BRAND.textSecondary }}
                    >
                      Manage your product inventory and listings
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <ProductsPrimaryButtons />
                </div>
              </div>

              {/* Stats Cards */}
              {!loading && !error && (
                <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  <Card
                    className="border-l-4 shadow-md"
                    style={{ borderLeftColor: BRAND.primary }}
                  >
                    <CardContent className="p-2 sm:p-3 lg:p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 sm:text-sm truncate">Total Products</p>
                          <h3
                            className="text-lg font-bold sm:text-xl lg:text-2xl"
                            style={{ color: BRAND.primary }}
                          >
                            {products.length}
                          </h3>
                        </div>
                        <div
                          className="p-1 rounded-lg sm:p-2 lg:p-3 flex-shrink-0"
                          style={{ backgroundColor: `${BRAND.primary}22` }}
                        >
                          <Package
                            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                            style={{ color: BRAND.primary }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 shadow-md border-l-green-500">
                    <CardContent className="p-2 sm:p-3 lg:p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 sm:text-sm truncate">Published</p>
                          <h3 className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                            {products.filter((p) => p.status === "published").length}
                          </h3>
                        </div>
                        <div className="p-1 bg-green-100 rounded-lg sm:p-2 lg:p-3 flex-shrink-0">
                          <Package className="w-4 h-4 text-green-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 shadow-md border-l-amber-500">
                    <CardContent className="p-2 sm:p-3 lg:p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 sm:text-sm truncate">Draft</p>
                          <h3 className="text-lg font-bold text-amber-600 sm:text-xl lg:text-2xl">
                            {products.filter((p) => p.status === "draft").length}
                          </h3>
                        </div>
                        <div className="p-1 rounded-lg bg-amber-100 sm:p-2 lg:p-3 flex-shrink-0">
                          <Package className="w-4 h-4 text-amber-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 shadow-md border-l-blue-500">
                    <CardContent className="p-2 sm:p-3 lg:p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 sm:text-sm truncate">Categories</p>
                          <h3 className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl">
                            {new Set(products.map((p) => p.category)).size || 0}
                          </h3>
                        </div>
                        <div className="p-1 bg-blue-100 rounded-lg sm:p-2 lg:p-3 flex-shrink-0">
                          <Package className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <Card className="shadow-xl w-full overflow-hidden" data-table-container>
              <CardHeader
                className="border-b"
                style={{ borderColor: `${BRAND.primary}11` }}
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                      }}
                    >
                      <Package className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle
                        className="text-sm font-bold sm:text-base lg:text-lg truncate"
                        style={{ color: BRAND.secondary }}
                      >
                        Product Management
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate" style={{ color: BRAND.textSecondary }}>
                        {loading
                          ? "Loading..."
                          : products.length > 0
                          ? `Manage ${products.length} products`
                          : ""}
                      </CardDescription>

                    </div>
                  </div>

                  {!loading && !error && products.length > 0 && (
                    <div className="text-xs text-gray-500 sm:text-sm flex-shrink-0 ml-2">
                      {currentPage}/{totalPages}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader2
                        className="w-8 h-8 mx-auto mb-4 animate-spin"
                        style={{ color: BRAND.primary }}
                      />
                      <p className="text-gray-600">Loading your products...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-16 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h3 className="mb-2 text-lg font-medium text-red-600">
                      Error Loading Products
                    </h3>
                    <p className="mb-4 text-red-500">{error}</p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-16 text-center px-4">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-600">
                      No Products Yet
                    </h3>
                    <p className="mb-6 text-gray-500">
                      Start by adding your first product to your store
                    </p>
                    <Button
                      style={{ backgroundColor: BRAND.primary }}
                      onClick={() => popupButtonsRef.current?.openPopup()}
                      className="px-6 py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                    <div
                      style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
                    >
                      <ProductsPrimaryButtons ref={popupButtonsRef} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="p-2 sm:p-3 lg:p-6 overflow-x-auto">
                      <div className="min-w-[600px]">
                        <DataTable data={paginatedProducts} columns={columns} />
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={products.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            {!loading && products.length > 0 && (
              <Card className="mt-6 shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div
                      className="flex-shrink-0 p-2 rounded-lg sm:p-3"
                      style={{ backgroundColor: `${BRAND.primary}22` }}
                    >
                      <Package className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: BRAND.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="mb-2 text-base font-semibold sm:text-lg"
                        style={{ color: BRAND.secondary }}
                      >
                        Need Help Managing Products?
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">
                        Learn how to optimize your product listings, manage inventory, and
                        boost sales with our comprehensive guides.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                        className="hover:bg-orange-50"
                      >
                        View Product Guides
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Footer */}
            <div className="py-6 mt-4 border-t border-gray-200">
              <div className="container px-4 mx-auto text-center">
                <p className="text-sm" style={{ color: BRAND.textLight }}>
                  &copy; {new Date().getFullYear()} Junooni. All rights reserved.
                </p>
              </div>
            </div>
          </Main>
          {/* Footer */}
        </div>
      </div>
      <ChatwootWidget />
    </ProductsProvider>
  </div>
)

}
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { useToast } from '@/hooks/use-toast'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/product-columns'
import { DataTable } from './components/data-tables'
import ChatwootWidget from '@/components/ChatwootWidget'
import { ProductsPrimaryButtons } from './components/ProductsPrimaryButtons'
import ProductsProvider from './context/products-context'
import { useEffect, useState } from 'react'
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

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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
    
    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t sm:flex-row" 
         style={{ borderColor: `${BRAND.primary}11` }}>
      {/* Items per page selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Show</span>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
          <SelectTrigger className="w-20 h-8">
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
        <span className="text-sm text-gray-600">items per page</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600">
        Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} results
      </div>

      {/* Page navigation */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
              style={currentPage === page ? { backgroundColor: BRAND.primary } : {}}
            >
              {page}
            </Button>
          )
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                     radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
        backgroundColor: "white",
        color: BRAND.textPrimary
      }}
    >
      <ProductsProvider>
        {/* Enhanced Header */}
        <Header fixed className="border-b border-gray-200 shadow-sm w-full lg:w-[80%] backdrop-blur-md bg-white/90">
          {/* Left section - Brand */}
          <div className="flex items-center space-x-4">
            <div className="items-center hidden space-x-2 sm:flex">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: BRAND.primary }}
              >
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold" style={{ color: BRAND.secondary }}>
                  Products
                </h1>
              </div>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-md mx-4">
            <Search />
          </div>
          
          {/* Right section - Theme and Profile */}
          <div className='flex items-center ml-auto space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>

        <Main className="container px-4 py-6 mx-auto">
          {/* Page Header with Enhanced Styling */}
          <div className="mt-12 mb-8">
            <div className='flex flex-col justify-between mb-6 space-y-4 sm:flex-row sm:items-center sm:space-y-0'>
              <div className="flex items-center space-x-4">
                {/* Mobile brand indicator */}
                <div 
                  className="p-3 rounded-lg sm:hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` 
                  }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h2 className='text-2xl font-bold tracking-tight sm:text-3xl' style={{ color: BRAND.textPrimary }}>
                    Your Products
                  </h2>
                  <p className='mt-1 text-base sm:text-lg' style={{ color: BRAND.textSecondary }}>
                    Manage your product inventory and listings
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ProductsPrimaryButtons />
              </div>
            </div>

            {/* Stats Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 shadow-md" style={{ borderLeftColor: BRAND.primary }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Products</p>
                        <h3 className="text-2xl font-bold" style={{ color: BRAND.primary }}>
                          {products.length}
                        </h3>
                      </div>
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${BRAND.primary}22` }}
                      >
                        <Package className="w-6 h-6" style={{ color: BRAND.primary }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 shadow-md border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Published</p>
                        <h3 className="text-2xl font-bold text-green-600">
                          {products.filter(p => p.status === 'published').length}
                        </h3>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 shadow-md border-l-amber-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Draft</p>
                        <h3 className="text-2xl font-bold text-amber-600">
                          {products.filter(p => p.status === 'draft').length}
                        </h3>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-100">
                        <Package className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 shadow-md border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Categories</p>
                        <h3 className="text-2xl font-bold text-blue-600">
                          {new Set(products.map(p => p.category)).size || 0}
                        </h3>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <Card className="shadow-xl" data-table-container>
            <CardHeader className="border-b" style={{ borderColor: `${BRAND.primary}11` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` 
                    }}
                  >
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold" style={{ color: BRAND.secondary }}>
                      Product Management
                    </CardTitle>
                    <CardDescription style={{ color: BRAND.textSecondary }}>
                      {loading ? "Loading products..." : `Manage your ${products.length} products`}
                    </CardDescription>
                  </div>
                </div>
                
                {!loading && !error && products.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: BRAND.primary }} />
                    <p className="text-gray-600">Loading your products...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="mb-2 text-lg font-medium text-red-600">Error Loading Products</h3>
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
                <div className="py-16 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-600">No Products Yet</h3>
                  <p className="mb-6 text-gray-500">
                    Start by adding your first product to your store
                  </p>
                  <Button 
                    style={{ backgroundColor: BRAND.primary }}
                    className="px-6 py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="p-6">
                    <DataTable data={paginatedProducts} columns={columns} />
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
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div 
                    className="flex-shrink-0 p-3 rounded-lg"
                    style={{ backgroundColor: `${BRAND.primary}22` }}
                  >
                    <Package className="w-6 h-6" style={{ color: BRAND.primary }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold" style={{ color: BRAND.secondary }}>
                      Need Help Managing Products?
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Learn how to optimize your product listings, manage inventory, and boost sales with our comprehensive guides.
                    </p>
                    <Button 
                      variant="outline"
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
        </Main>
        
        <ChatwootWidget />
      </ProductsProvider>
    </div>
  )
}
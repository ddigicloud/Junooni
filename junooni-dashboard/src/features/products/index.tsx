// import { Header } from '@/components/layout/header'
// import { Main } from '@/components/layout/main'
// import { ProfileDropdown } from '@/components/profile-dropdown'
// import { Search } from '@/components/search'
// import { useToast } from '@/hooks/use-toast'
// import { ThemeSwitch } from '@/components/theme-switch'
// import { columns } from './components/product-columns'
// import { DataTable } from './components/data-tables'
// import ChatwootWidget from '@/components/ChatwootWidget'
// import { ProductsPrimaryButtons } from './components/ProductsPrimaryButtons'
// import ProductsProvider from './context/products-context'
// import { useEffect,useState } from 'react'

// export default function Products() {

//     const [products, setProducts] = useState([])
//  const { toast } = useToast();
//   // Add this useEffect near the top of your component, right after your state declarations
// useEffect(() => {
//   // Check if user is authenticated by looking for token
//   const token = localStorage.getItem('vendorToken');
  
//   // If no token is found, redirect to sign-in page
//   if (!token) {
//     // Show a toast notification
//     toast({
//       title: "Authentication Required",
//       description: "Please sign in to access your profile.",
//       variant: "destructive",
//     });
    
//     // Redirect to sign-in page
//     window.location.href = '/sign-in';
//     return;
//   }
// }, []); // Empty dependency array means this runs once when component mounts
//     useEffect(() => {
//       const fetchProducts = async () => {
//         const token = localStorage.getItem("vendorToken");
//         try {
//           const response = await fetch("http://localhost:9000/vendors/products", {
//             method: "GET", // GET request method (no body needed)
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
    
//           // Check if response is successful
//           if (!response.ok) {
//             const responseBody = await response.json();
//             throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseBody.message}`);
//           }
    
//           const responseBody = await response.json();
    
//           setProducts(responseBody.products);
//         } catch (error) {
//           console.error("Error fetching products:", error);
//         }
//       };
    
//       fetchProducts();
//     }, []);
  
  
  
//   return (
//     <ProductsProvider>
//       <Header fixed>
//         <Search />
//         <div className='flex items-center ml-auto space-x-4'>
//           <ThemeSwitch />
//           <ProfileDropdown />
//         </div>
//       </Header>

//       <Main>
//         <div className='flex flex-wrap items-center justify-between mb-2 space-y-2 gap-x-4'>
//           <div>
//             <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
//             <p className='text-muted-foreground'>Manage your product inventory here.</p>
//           </div>
//           <ProductsPrimaryButtons />
//         </div>
//         <div className='flex-1 px-4 py-1 -mx-4 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0'>
//           <DataTable data={products} columns={columns} />
//         </div>
//       </Main>
//       <ChatwootWidget />
//     </ProductsProvider>
//   )
// }


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
import { Package, Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        const response = await fetch("http://localhost:9000/vendors/products", {
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
        console.error("Error fetching products:", error);
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
          <Card className="shadow-xl">
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
                
                {!loading && !error && (
                  <Button 
                    size="sm"
                    style={{ backgroundColor: BRAND.primary }}
                    className="hidden sm:flex"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
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
                <div className="p-6">
                  <DataTable data={products} columns={columns} />
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
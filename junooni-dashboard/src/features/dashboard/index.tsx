import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {  ProductsPrimaryButtons, ProductsPrimaryButtonsHandle } from '@/features/products/components/ProductsPrimaryButtons';
import sellSometing from '@/assets/onlineShoping.svg'
import windowSoping from '@/assets/window_shoping.svg'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useToast } from "@/hooks/use-toast";
import ChatwootWidget from '@/components/ChatwootWidget'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { 
  CircleUser, 
  Package, 
  CreditCard, 
  ShoppingBag, 
  PlusSquare,
  Settings,
  ArrowRight,
  Clock,
  AlertTriangle,
  RefreshCw,
  CircleCheck,
  HelpCircle,
  BarChart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";


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

// Interface for order data
interface Order {
  id: string;
  display_id: number;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  currency_code: string;
}

// Interface for product data
interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  status: string;
  created_at: string;
}

// Interface for vendor data
interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  store_name?: string;
  business_name?: string;
  created_at: string;
  products_count?: number;
  verified?: boolean;
   gst_verification_status?: "pending" | "verified" | "failed";
}

// Status Badge component with icons
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "not_fulfilled":
      case "pending":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "partially_fulfilled":
      case "requires_action":
      case "processing":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium",
          icon: <RefreshCw className="w-3 h-3 mr-1" />
        };
      case "partially_shipped":
      case "shipped":
        return { 
          variant: "outline" as const, 
          className: "text-purple-700 bg-purple-50 border-purple-200 font-medium",
          icon: <CircleCheck className="w-3 h-3 mr-1" />
        };
      case "fulfilled":
      case "delivered":
      case "completed":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium",
          icon: <CircleCheck className="w-3 h-3 mr-1" />
        };
      case "cancelled":
      case "canceled":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "text-gray-700 bg-gray-50 border-gray-200 font-medium",
          icon: null
        };
    }
  };

  const { variant, className, icon } = getStatusProps(normalizedStatus);

  // Format status text for display
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "not_fulfilled":
        return "Pending";
      case "partially_fulfilled":
        return "Processing";
      case "fulfilled":
        return "Fulfilled";
      case "partially_shipped":
        return "Partially Shipped";
      case "shipped":
        return "Shipped";
      case "requires_action":
        return "Action Required";
      default:
        return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {formatStatus(status)}
    </Badge>
  );
};

// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};


// Dashboard Page Component
const DashboardPage = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greetingTime, setGreetingTime] = useState<string>("");
  const { toast } = useToast();
  const [showGSTVerificationMessage, setShowGSTVerificationMessage] = useState(false);
  const popupButtonsRef = useRef(null);
  

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime("Morning");
    else if (hour < 17) setGreetingTime("Afternoon");
    else setGreetingTime("Evening");
  }, []);
  
  // Fetch vendor, order, and product data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the vendor token from local storage
        const token = localStorage.getItem("vendorToken");
        
        console.log("token",token);
        if (!token) {
          setError("Authentication required. Please log in.");
          navigate({ to: '/sign-in' });
        
          setLoading(false);
          return;
        }

          // First, check if vendor exists from /vendors endpoint
      const vendorExistResponse = await fetch("http://localhost:9000/vendors/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!vendorExistResponse.ok) {
        throw new Error(`Error checking vendor existence: ${vendorExistResponse.statusText}`);
      }
      
      const vendorExistData = await vendorExistResponse.json();
      
      // Check if vendor exists
      const vendorExists = vendorExistData && Object.keys(vendorExistData).length > 0;
      
      if (!vendorExists) {
        //console.log("Vendor does not exist. Redirecting to onboarding page.");
        // Redirect to the basic-info step of onboarding
        window.location.href = '/onboarding?step=basic-info';
        setLoading(false);
        return;
      }
        // Fetch vendor profile from /vendors/me
        const vendorResponse = await fetch("http://localhost:9000/vendors/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!vendorResponse.ok) {
          throw new Error(`Error fetching vendor profile: ${vendorResponse.statusText}`);
        }
        
        const vendorData = await vendorResponse.json();
        console.log("Vendor data:", vendorData);
       
        // Transform vendor data
        const transformedVendor: Vendor = {
          id: vendorData.vendor?.id || "1",
          name: vendorData.vendor?.name || 
        (vendorData.vendor?.first_name && vendorData.vendor?.last_name ? 
          `${vendorData.vendor.first_name} ${vendorData.vendor.last_name}` : 
          "Creator"),
          email: vendorData.vendor?.email || "creator@junooni.com",
          avatar: vendorData.vendor?.logo || vendorData.vendor?.avatar || null,
          store_name: vendorData.vendor?.store_name || vendorData.vendor?.business_name || "My Junooni Store",
          created_at: vendorData.vendor?.created_at || new Date().toISOString(),
          products_count: vendorData.products_count || 0,
          verified: vendorData.vendor?.verified || vendorData.vendor?.verified_seller || false
        };
        
        setVendor(transformedVendor);
        
        // Fetch recent orders
        const orderResponse = await fetch("http://localhost:9000/vendors/orders?limit=5", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!orderResponse.ok) {
          throw new Error(`Error fetching orders: ${orderResponse.statusText}`);
        }
        
        const orderData = await orderResponse.json();
        //console.log("Order data:", orderData);
        
        // Transform orders
        const transformedOrders = orderData.orders.map((order: any, index: number) => {
          // Calculate total
          let totalAmount = 0;
          if (typeof order.total === 'number') {
            totalAmount = order.total;
          } else if (order.total && typeof order.total.value === 'string') {
            totalAmount = parseFloat(order.total.value);
          } else {
            totalAmount = (order.items || []).reduce((sum: number, item: any) => {
              const itemPrice = 
                (typeof item.unit_price === 'number') ? item.unit_price :
                (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
                (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0;
              
              const quantity = item.quantity || 1;
              return sum + (itemPrice * quantity);
            }, 0);
          }
          
          // Get display_id
          const baseIndex = index + 1;
          let display_id;
           
          // Try to extract a unique number from the order ID
          const allNumbers = order.id.match(/\d+/g);
          if (allNumbers && allNumbers.length > 0) {
            display_id = parseInt(allNumbers[allNumbers.length - 1]);
          } else {
            display_id = baseIndex;
          }
          
          return {
            id: order.id,
            display_id: display_id,
            customer: {
              first_name: order.customer?.first_name || order.billing_address?.first_name || "Guest",
              last_name: order.customer?.last_name || order.billing_address?.last_name || "",
              email: order.customer?.email || order.email || "customer@example.com"
            },
            created_at: order.created_at || order.createdAt || new Date().toISOString(),
            total: totalAmount,
            payment_status: order.payment_status || "pending",
            fulfillment_status: order.fulfillment_status || "not_fulfilled",
            currency_code: "INR"
          };
        });
        
        setOrders(transformedOrders);
        
        // Fetch products from /vendors/products
        const productResponse = await fetch("http://localhost:9000/vendors/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!productResponse.ok) {
          //console.warn(`Warning: Could not fetch products: ${productResponse.statusText}`);
          // Don't throw error here to allow dashboard to load even if products fail
        } else {
          const productData = await productResponse.json();
          //console.log("Product data:", productData);
          
          // Transform products
          const transformedProducts = (productData.products || []).map((product: any) => {
            return {
              id: product.id,
              title: product.title || product.name || "Unnamed Product",
              description: product.description || "",
              price: typeof product.price === 'number' 
                ? product.price 
                : product.price?.value 
                  ? parseFloat(product.price.value) 
                  : 0,
              image_url: product.thumbnail || product.image_url || product.images?.[0] || "",
              status: product.status || "draft",
              created_at: product.created_at || new Date().toISOString()
            };
          });
          
          setProducts(transformedProducts);
        }
      } catch (err: any) {
        //console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  
  // Calculate dashboard stats
  const calculateStats = () => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalOrders: 0
      };
    }
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const pendingOrders = orders.filter(order => 
      order.fulfillment_status === "not_fulfilled" || 
      order.fulfillment_status === "pending"
    ).length;
    
    const completedOrders = orders.filter(order => 
      order.fulfillment_status === "fulfilled" || 
      order.fulfillment_status === "delivered" || 
      order.fulfillment_status === "completed"
    ).length;
    
    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalOrders: orders.length
    };
  };
  
  const stats = calculateStats();
  
  // Handle login redirect if authentication fails
  const handleLoginRedirect = () => {
    navigate({ to: "/sign-in" });
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin" style={{ borderColor: BRAND.primary }}></div>
        <div className="mt-4 text-lg">Loading your dashboard...</div>
      </div>
    );
  }
  
  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen p-4">
  //       <div className="mb-8 text-center">
  //         <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
  //         <h2 className="mb-2 text-2xl font-bold">Authentication Required</h2>
  //         <p className="mb-6 text-gray-600">{error}</p>
  //         <Button onClick={handleLoginRedirect}>
  //           Log In
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }
  

  return (
    <div
      className="min-h-screen pb-12"
      style={{ 
        background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                     radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
        backgroundColor: "white"
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
              <Separator orientation='vertical' className='h-6 ml-2' />
              <div 
                className="mr-2 text-2xl font-bold" 
                style={{ color: BRAND.primary }}
              >
                <Link to="/dashboard">
                  <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
                </Link>
              </div>
              <span className="hidden text-gray-500 md:inline">|</span>
              <h1 className="hidden ml-2 text-lg font-semibold md:block" style={{ color: BRAND.secondary }}>
                Creator Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="hidden font-medium md:flex"
                style={{ color: BRAND.primary }}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
                asChild
              >
                <Link to="/products">Products</Link>
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
                asChild
              >
                <Link to="/orders">Orders</Link>
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
                asChild
              >
                <Link to="/help-center">Help</Link>
              </Button>
              
              {/* <Avatar className="w-8 h-8">
                <AvatarImage src={vendor?.avatar || ""} alt={vendor?.name || "Vendor"} />
                <AvatarFallback>{vendor?.name.substring(0, 2).toUpperCase() || "V"}</AvatarFallback>
              </Avatar> */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 pt-6 mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: BRAND.textPrimary }}>
              Good {greetingTime}, {vendor?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground" style={{ color: BRAND.textSecondary }}>
              Welcome to your Junooni dashboard. Here's an overview of your store.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              className="flex items-center gap-1" 
               onClick={() => popupButtonsRef.current?.openPopup()}
              style={{ backgroundColor: BRAND.primary }}
            >
              <PlusSquare className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </div>  
        </div> 

         <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
            <ProductsPrimaryButtons ref={popupButtonsRef} />
          </div>

          {/* Main Stats */}
        <div className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: BRAND.primary }}>
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats.totalOrders} orders
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingOrders}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs" 
                  style={{ color: BRAND.primary }}
                  asChild
                >
                  <Link to="/orders?status=pending">
                    View Pending Orders
                  </Link>
                </Button>
                <ArrowRight className="w-3 h-3" style={{ color: BRAND.primary }} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Products
              </CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.length}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs" 
                  style={{ color: BRAND.primary }}
                  asChild
                >
                  <Link to="/products">
                    Manage Products
                  </Link>
                </Button>
                <ArrowRight className="w-3 h-3" style={{ color: BRAND.primary }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Package className="w-5 h-5 mr-2 text-gray-500" />
                  Recent Orders
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  asChild
                >
                  <Link to="/orders">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-start space-x-3">
                      <div className="p-1.5 rounded-full bg-gray-100">
                        <Package className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            <Link 
                              to={`/orders/${order.id}`}
                              className="hover:underline"
                              style={{ color: BRAND.primary }}
                            >
                              #{order.display_id}
                            </Link> - {order.customer.first_name} {order.customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <StatusBadge status={order.fulfillment_status} />
                          <p className="text-xs font-medium">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-base font-medium text-gray-600">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Orders will appear here once customers place them</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Products & Quick Actions */}
          <div className="space-y-6">
            {/* Products Card */}
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <ShoppingBag className="w-5 h-5 mr-2 text-gray-500" />
                    Your Products
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    asChild
                  >
                    <Link to="/products">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 overflow-hidden bg-gray-200 rounded-md">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.title} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{product.title}</div>
                            <StatusBadge status={product.status} />
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-base font-medium text-gray-600">No products yet</h3>
                    <p className="mt-1 mb-4 text-sm text-gray-500">Add your first product to get started</p>
                    <Button 
                      size="sm"
                      asChild
                      style={{ backgroundColor: BRAND.primary }}
                    >
                      <Link to="/products/new">
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Add Product
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions Card */}
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-auto py-4"
                    asChild
                  >
                    <Link to="/products/new">
                      <PlusSquare className="w-6 h-6 mb-2" style={{ color: BRAND.primary }} />
                      <span>Add Product</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-auto py-4"
                    asChild
                  >
                    <Link to="/orders">
                      <Package className="w-6 h-6 mb-2 text-amber-600" />
                      <span>View Orders</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-auto py-4"
                    asChild
                  >
                    <Link to="/helpdesk">
                      <HelpCircle className="w-6 h-6 mb-2 text-blue-600" />
                      <span>Help & Guides</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-auto py-4"
                    asChild
                  >
                    <Link to="/settings">
                      <Settings className="w-6 h-6 mb-2 text-gray-600" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {showGSTVerificationMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
                  <h3 className="text-lg font-semibold">GST Verification Required</h3>
                </div>
                <p className="mb-4 text-gray-600">
                  You need to get your GST verified before you can add products to your store.
                </p>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGSTVerificationMessage(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    style={{ backgroundColor: BRAND.primary }}
                    onClick={() => {
                      setShowGSTVerificationMessage(false);
                      window.location.href = '/onboarding?step=business-details';
                    }}
                  >
                    Verify GST
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Help Section */}
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" style={{ color: BRAND.primary }} />
              Need Help Getting Started?
            </CardTitle>
            <CardDescription>
              Check out our guides and resources to help you grow your Junooni store
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="mb-2 font-medium">Junooni Creator Getting Started</h3>
              <p className="mb-4 text-sm text-gray-600">
                We have prepared helpful resources to guide you through setting up your products and managing your store.
              </p>
              <Button 
                className="w-full sm:w-auto"
                asChild
                style={{ backgroundColor: BRAND.primary }}
              >
                <Link to="/helpdesk">
                  Visit Help Center
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <ChatwootWidget />
      </div>
    </div>
  );
};

export default DashboardPage;
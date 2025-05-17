"use client"

import { useState, useEffect } from "react"
import { 
  Download, Search, MoreHorizontal, Filter, 
  Loader2, Calendar, CreditCard, 
  Package, Clock, ExternalLink,
  AlertTriangle, RefreshCw, Truck,
  Eye, ChevronDown, ChevronLeft,
  ChevronRight, CircleCheck
} from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"

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

// Define order types
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  display_id: number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  created_at: string
  total: number
  items: OrderItem[]
  payment_status: string
  fulfillment_status: string
  currency_code: string
}

// Status badge component with icons
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
          icon: <Truck className="w-3 h-3 mr-1" />
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

// Payment badge component with icons
const PaymentBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "captured":
      case "paid":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium",
          icon: <CreditCard className="w-3 h-3 mr-1" />
        };
      case "awaiting":
      case "pending":
      case "requires_action":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "failed":
      case "canceled":
      case "not_paid":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      case "refunded":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium",
          icon: <RefreshCw className="w-3 h-3 mr-1" />
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

  // Format payment status text for display
  const formatPaymentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "captured":
        return "Paid";
      case "not_paid":
        return "Unpaid";
      case "requires_action":
        return "Action Required";
      default:
        return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {formatPaymentStatus(status)}
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

// Summary Cards Component
const SummaryCards = ({ data }: { data: Order[] }) => {
  // Calculate summary metrics from actual orders
  const totalOrders = data.length;
  const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
  
  const pendingOrders = data.filter(order => 
    order.fulfillment_status === "not_fulfilled" || 
    order.fulfillment_status === "pending"
  ).length;
  
  const processingOrders = data.filter(order => 
    order.fulfillment_status === "processing" || 
    order.fulfillment_status === "partially_fulfilled"
  ).length;
  
  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = data.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Orders */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Today's Orders</p>
              <h3 className="text-2xl font-bold">{todayOrders.length}</h3>
              <p className="mt-1 text-sm text-gray-500">Revenue: {formatPrice(todayRevenue)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND.primary}22` }}>
              <Package className="w-6 h-6" style={{ color: BRAND.primary }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Orders */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Pending Orders</p>
              <h3 className="text-2xl font-bold">{pendingOrders}</h3>
              <p className="mt-1 text-sm text-gray-500">Needs fulfillment</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Processing Orders */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Processing</p>
              <h3 className="text-2xl font-bold">{processingOrders}</h3>
              <p className="mt-1 text-sm text-gray-500">Being prepared</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Revenue */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatPrice(totalRevenue)}</h3>
              <p className="mt-1 text-sm text-gray-500">From {totalOrders} orders</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function OrdersPage() {
  // State for orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [authError, setAuthError] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>("latest");
  
  // Current tab (status)
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the vendor token from local storage
        const token = localStorage.getItem("vendorToken");
        
        if (!token) {
          setAuthError(true);
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }
      
        // Make the API request with the token in the Authorization header
        const response = await fetch(`http://localhost:9000/vendors/orders?limit=${limit}&offset=${(page - 1) * limit}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      
        if (!response.ok) {
          if (response.status === 401) {
            setAuthError(true);
            setError("Your session has expired. Please log in again.");
          } else {
            setError(`Error fetching orders: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }
      
        const data = await response.json();
        console.log("Raw API response:", data);
    
        if (data && data.orders) {
          // Transform the API response to match the expected Order format
          const transformedOrders = data.orders.map((order: any, index: number) => {
            // Calculate the total without dividing by 100
            let totalAmount = 0;
            
            if (typeof order.total === 'number') {
              totalAmount = order.total;
            } else if (order.total && typeof order.total.value === 'string') {
              totalAmount = parseFloat(order.total.value);
            } else {
              // Calculate from items
              totalAmount = (order.items || []).reduce((sum: number, item: any) => {
                const itemPrice = 
                  (typeof item.unit_price === 'number') ? item.unit_price :
                  (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
                  (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0;
                
                const quantity = item.quantity || 1;
                
                return sum + (itemPrice * quantity);
              }, 0);
            }
            
            // Transform items
            const transformedItems = (order.items || []).map((item: any) => {
              const unitPrice = 
                (typeof item.unit_price === 'number') ? item.unit_price :
                (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
                (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0;
              
              const quantity = item.quantity || 1;
              
              return {
                id: item.id,
                name: item.title || item.product_title || "Unknown Product",
                quantity: quantity,
                price: unitPrice
              };
            });
            
            // Get display_id - default to offset + index + 1 to ensure uniqueness
            const baseIndex = (page - 1) * limit;
            let display_id;
             
            // Try to extract a unique number from the order ID
            const allNumbers = order.id.match(/\d+/g);
            if (allNumbers && allNumbers.length > 0) {
              display_id = parseInt(allNumbers[allNumbers.length - 1]);
            } else {
              display_id = baseIndex + index + 1;
            }
             
            return {
              id: order.id,
              display_id: display_id,
              customer: {
                first_name: order.customer?.first_name || order.customer?.billing_address?.first_name || order.billing_address?.first_name || "Guest",
                last_name: order.customer?.last_name || order.customer?.billing_address?.last_name || order.billing_address?.last_name || "",
                email: order.customer?.email || order.email || "—",
                phone: order.customer?.phone || order.phone || order.billing_address?.phone || order.shipping_address?.phone || undefined
              },
              created_at: order.created_at || order.createdAt || order.date_created || 
                (order.items?.[0]?.created_at) || new Date().toISOString(),
              total: totalAmount,
              items: transformedItems,
              payment_status: order.payment_status || "pending",
              fulfillment_status: order.fulfillment_status || "not_fulfilled",
              currency_code: "INR" // Using Indian Rupee for Junooni
            };
          });
          
          console.log("Final transformed orders:", transformedOrders);
          setOrders(transformedOrders);
          setCount(data.count || transformedOrders.length);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, limit]);
  
  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim().toLowerCase();
      if (
        !order.id.toLowerCase().includes(lowerSearch) &&
        !String(order.display_id).includes(lowerSearch) &&
        !customerName.includes(lowerSearch) &&
        !order.customer?.email.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
    }
    
    // Apply tab filter
    if (currentTab !== "all") {
      if (currentTab === "pending" && order.fulfillment_status !== "pending" && order.fulfillment_status !== "not_fulfilled") {
        return false;
      }
      if (currentTab === "processing" && order.fulfillment_status !== "processing" && order.fulfillment_status !== "partially_fulfilled") {
        return false;
      }
      if (currentTab === "shipped" && order.fulfillment_status !== "shipped" && order.fulfillment_status !== "partially_shipped") {
        return false;
      }
      if (currentTab === "completed" && order.fulfillment_status !== "fulfilled" && order.fulfillment_status !== "delivered" && order.fulfillment_status !== "completed") {
        return false;
      }
      if (currentTab === "cancelled" && order.fulfillment_status !== "cancelled" && order.fulfillment_status !== "canceled") {
        return false;
      }
    }
    
    // Apply status filter
    if (statusFilter !== "all" && order.fulfillment_status !== statusFilter) {
      return false;
    }
    
    // Apply payment filter
    if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
      return false;
    }
    
    // Apply date filter
    if (dateFilter) {
      const orderDate = new Date(order.created_at);
      const filterDate = new Date(dateFilter);
      
      if (
        orderDate.getDate() !== filterDate.getDate() ||
        orderDate.getMonth() !== filterDate.getMonth() ||
        orderDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortOrder) {
      case "latest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "highest":
        return b.total - a.total;
      case "lowest":
        return a.total - b.total;
      default:
        return 0;
    }
  });

  // Get unique values for filter dropdowns
  const fulfillmentStatusOptions = [...new Set(orders.map(order => order.fulfillment_status))];
  const paymentStatusOptions = [...new Set(orders.map(order => order.payment_status))];
  
  // Calculate status counts for tabs
  const pendingCount = orders.filter(order => 
    order.fulfillment_status === "pending" || 
    order.fulfillment_status === "not_fulfilled"
  ).length;
  
  const processingCount = orders.filter(order => 
    order.fulfillment_status === "processing" || 
    order.fulfillment_status === "partially_fulfilled"
  ).length;
  
  const shippedCount = orders.filter(order => 
    order.fulfillment_status === "shipped" || 
    order.fulfillment_status === "partially_shipped"
  ).length;
  
  const completedCount = orders.filter(order => 
    order.fulfillment_status === "fulfilled" || 
    order.fulfillment_status === "delivered" || 
    order.fulfillment_status === "completed"
  ).length;
  
  const cancelledCount = orders.filter(order => 
    order.fulfillment_status === "cancelled" || 
    order.fulfillment_status === "canceled"
  ).length;

  // Handle login redirect if authentication fails
  const handleLoginRedirect = () => {
    window.location.href = "/sign-in";
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "—"
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d)
  }
  
  // View order details on external page
  const viewOrderDetails = (orderId: string) => {
    window.open(`/orders/${orderId}`, '_blank');
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
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="mr-2 text-2xl font-bold" 
                style={{ color: BRAND.primary }}
              >
                JUNOONI
              </div>
              <span className="hidden text-gray-500 md:inline">|</span>
              <h1 className="hidden ml-2 text-lg font-semibold md:block" style={{ color: BRAND.secondary }}>
                Creator Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
                Products
              </Button>
              <Button 
                variant="ghost"
                className="hidden font-medium md:flex"
                style={{ color: BRAND.primary }}
              >
                Orders
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    
      <AlertDialog open={authError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              {error || "You must be logged in to view this page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLoginRedirect}>Log In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Main content */}
      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-2xl font-bold" style={{ color: BRAND.secondary }}>Orders</h1>
          <p className="text-sm text-muted-foreground">View and track your customer orders</p>
        </div>
        
        {/* Summary cards */}
        <SummaryCards data={orders} />
        
        {/* Status tab filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button 
            variant={currentTab === "all" ? "default" : "outline"} 
            onClick={() => setCurrentTab("all")}
            className={currentTab === "all" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : ""}
          >
            All Orders
            <Badge variant="secondary" className="ml-2 text-gray-800 bg-gray-100">
              {orders.length}
            </Badge>
          </Button>
          
          <Button 
            variant={currentTab === "pending" ? "default" : "outline"} 
            onClick={() => setCurrentTab("pending")}
            className={currentTab === "pending" ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200" : ""}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending
            <Badge variant="secondary" className="ml-2 bg-amber-50 text-amber-800">
              {pendingCount}
            </Badge>
          </Button>
          
          <Button 
            variant={currentTab === "processing" ? "default" : "outline"} 
            onClick={() => setCurrentTab("processing")}
            className={currentTab === "processing" ? "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200" : ""}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Processing
            <Badge variant="secondary" className="ml-2 text-blue-800 bg-blue-50">
              {processingCount}
            </Badge>
          </Button>
          
          <Button 
            variant={currentTab === "shipped" ? "default" : "outline"} 
            onClick={() => setCurrentTab("shipped")}
            className={currentTab === "shipped" ? "bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200" : ""}
          >
            <Truck className="w-4 h-4 mr-2" />
            Shipped
            <Badge variant="secondary" className="ml-2 text-purple-800 bg-purple-50">
              {shippedCount}
            </Badge>
          </Button>
          
          <Button 
            variant={currentTab === "completed" ? "default" : "outline"} 
            onClick={() => setCurrentTab("completed")}
            className={currentTab === "completed" ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-200" : ""}
          >
            <CircleCheck className="w-4 h-4 mr-2" />
            Completed
            <Badge variant="secondary" className="ml-2 text-green-800 bg-green-50">
              {completedCount}
            </Badge>
          </Button>
          
          <Button 
            variant={currentTab === "cancelled" ? "default" : "outline"} 
            onClick={() => setCurrentTab("cancelled")}
            className={currentTab === "cancelled" ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-200" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Cancelled
            <Badge variant="secondary" className="ml-2 text-red-800 bg-red-50">
              {cancelledCount}
            </Badge>
          </Button>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID, customer name, or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="px-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                {/* Calendar integration would go here */}
                <div className="p-4">
                  <p>Date filter placeholder</p>
                  <div className="flex items-center justify-center py-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDateFilter(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-36">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {fulfillmentStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={paymentFilter} 
              onValueChange={setPaymentFilter}
            >
              <SelectTrigger className="w-36">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {paymentStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sortOrder}
              onValueChange={setSortOrder}
            >
              <SelectTrigger className="w-36">
                <span>Sort By</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Total</SelectItem>
                <SelectItem value="lowest">Lowest Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Orders card */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold" style={{ color: BRAND.secondary }}>
                    Orders
                  </CardTitle>
                  <CardDescription className="text-base" style={{ color: BRAND.textSecondary }}>
                    {loading ? "Loading orders..." : `Showing ${filteredOrders.length} of ${count} orders`}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
      
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
              </div>
            ) : error && !authError ? (
              <div className="py-8 text-center text-destructive">
                <p>{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {filteredOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-1 text-lg font-medium text-gray-500">No orders found</h3>
                    <p className="mb-4 text-gray-400">
                      {searchTerm || statusFilter !== "all" || dateFilter ? 
                        "Try adjusting your filters" : 
                        "You don't have any orders yet"}
                    </p>
                    {(searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateFilter) && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setPaymentFilter("all");
                          setDateFilter(undefined);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-gray-50">
                          <TableHead className="w-[100px]">Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Items</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Payment</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="group hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <Button 
                                variant="link" 
                                className="h-auto p-0 font-medium"
                                style={{ color: BRAND.primary }}
                                onClick={() => viewOrderDetails(order.id)}
                              >
                                #{order.display_id}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {`${order.customer.first_name} ${order.customer.last_name}`.trim() || 'Guest'}
                            </TableCell>
                            <TableCell>
                              {order.customer.email}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell className="font-medium text-right">
                              {formatPrice(order.total, order.currency_code)}
                            </TableCell>
                            <TableCell className="text-center">
                              <StatusBadge status={order.fulfillment_status} />
                            </TableCell>
                            <TableCell className="text-center">
                              <PaymentBadge status={order.payment_status} />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => viewOrderDetails(order.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/orders/${order.id}`} className="flex items-center w-full">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Open in new tab
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Pagination */}
                {!loading && filteredOrders.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{filteredOrders.length}</span> of{" "}
                      <span className="font-medium">{count}</span> orders
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: Math.min(Math.ceil(count / limit), 5) }, (_, index) => (
                        <Button
                          key={index}
                          variant={page === index + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(index + 1)}
                          style={page === index + 1 ? { 
                            backgroundColor: BRAND.primary,
                            color: 'white' 
                          } : {}}
                        >
                          {index + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(count / limit)))}
                        disabled={page >= Math.ceil(count / limit)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Order Distribution Charts */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-7">
          <Card className="shadow-md md:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Order Distribution</CardTitle>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-sm">{pendingCount} orders</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${(pendingCount / Math.max(orders.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Processing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Processing</span>
                    </div>
                    <span className="text-sm">{processingCount} orders</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(processingCount / Math.max(orders.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Shipped */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm">Shipped</span>
                    </div>
                    <span className="text-sm">{shippedCount} orders</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(shippedCount / Math.max(orders.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Completed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="text-sm">{completedCount} orders</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(completedCount / Math.max(orders.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Cancelled */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Cancelled</span>
                    </div>
                    <span className="text-sm">{cancelledCount} orders</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(cancelledCount / Math.max(orders.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Orders */}
          <Card className="shadow-md md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
              <CardDescription>Latest orders received</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {filteredOrders.slice(0, 4).map((order, index) => (
                  <div key={order.id} className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-full bg-gray-100">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          <span 
                            className="cursor-pointer hover:underline"
                            style={{ color: BRAND.primary }}
                            onClick={() => viewOrderDetails(order.id)}
                          >
                            #{order.display_id}
                          </span> - {order.customer.first_name} {order.customer.last_name}
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
                
                {filteredOrders.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No recent orders found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-6 mt-12 border-t border-gray-200">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm" style={{ color: BRAND.textLight }}>
            &copy; {new Date().getFullYear()} Junooni. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
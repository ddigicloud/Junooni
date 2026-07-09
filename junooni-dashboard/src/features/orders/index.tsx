"use client"

import { useState, useEffect } from "react"
import * as XLSX from 'xlsx';
import DateFilter from '../orders/components/DateFilter/DateFilter'; // Adjust path to your DateFilter component
import { CalendarDays } from "lucide-react";
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Separator } from '@/components/ui/separator'
import { 
  Download, Search, MoreHorizontal, Filter, 
  Loader2, Calendar, CreditCard, 
  Package, Clock, ExternalLink,
  AlertTriangle, RefreshCw, Truck,
  Eye, ChevronDown, ChevronLeft,
  ChevronRight, CircleCheck, Info, XCircle
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import Junoonilogo from '../../assets/junooni_logo_brand_color.png' // Adjust path as needed
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { SidebarTrigger } from '@/components/ui/sidebar'
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
//import { Separator } from "@/components/ui/separator"
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

// ✅ Updated interfaces for vendor-filtered data with enhanced fields
interface VendorOrderItem {
  id: string
  title: string
  subtitle?: string
  quantity: number
  unit_price: number
  total: number
  product_cost?: number
  variant_sku?: string
  product_id?: string
  product_handle?: string
  claim_status?: 'returned' | 'replaced' | 'active'
  return_status?: 'requested' | 'received' | 'none'
  is_claim_item?: boolean
  claim_id?: string
  return_id?: string
  return_reason?: string
  claim_reason?: string
  tracking_numbers?: string[]
  tracking_urls?: string[]
  shipped_at?: string
  delivered_at?: string
  packed_at?: string
  shipping_provider?: string
  has_tracking?: boolean
  fulfillment_type?: string // ✅ Added fulfillment type for creator fulfillment filtering
}

interface VendorOrder {
  id: string
  custom_display_id: string | number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  created_at: string
  
  // ✅ Vendor-specific totals
  vendor_total: number
  vendor_subtotal: number
  vendor_shipping_total: number
  vendor_tax_total: number
  
  // ✅ Vendor-specific items
  vendor_items: VendorOrderItem[]
  status: string  // ✅ ADD THIS - captures "canceled" status
  canceled_at?: string  // ✅ ADD THIS
  payment_status: string
  vendor_payment_status: string
  payment_collections?: any[] // ✅ Added payment_collections for payment method detection
  vendor_payment_details?: any // ✅ Added vendor_payment_details for additional payment info
  // payment_collection?: any // ✅ REMOVED: Deprecated in favor of payment_collections
  fulfillment_status: string
  currency_code: string
  
  // ✅ Vendor information
  vendor_id: string
  vendor_handle: string
  vendor_payment_amount: number
  
  // Additional fields
  shipping_address?: any
  billing_address?: any
  is_vendor_filtered?: boolean
  
  // ✅ Claims and returns from backend
  claims?: any[]
  returns?: any[]
  claim_items?: any[]
  return_items?: any[]
  has_claims?: boolean
  has_returns?: boolean
}

// Status badge component with icons
const StatusBadge = ({ status, orderStatus, canceledAt }: {
  status: string
  orderStatus?: string
  canceledAt?: string
 }) => {

   // ✅ Check for canceled order first
  if (orderStatus === "canceled" || canceledAt) {
    return (
      <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 font-medium text-xs px-2 py-0.5">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Canceled
      </Badge>
    );
  }

  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "not_fulfilled":
      case "pending":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium text-xs px-2 py-0.5",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "partially_fulfilled":
      case "requires_action":
      case "processing":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium text-xs px-2 py-0.5",
          icon: <RefreshCw className="w-3 h-3 mr-1" />
        };
      case "partially_shipped":
      case "shipped":
        return { 
          variant: "outline" as const, 
          className: "text-purple-700 bg-purple-50 border-purple-200 font-medium text-xs px-2 py-0.5",
          icon: <Truck className="w-3 h-3 mr-1" />
        };
      case "fulfilled":
      case "delivered":
      case "completed":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium text-xs px-2 py-0.5",
          icon: <CircleCheck className="w-3 h-3 mr-1" />
        };
      case "cancelled":
      case "canceled":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium text-xs px-2 py-0.5",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "text-gray-700 bg-gray-50 border-gray-200 font-medium text-xs px-2 py-0.5",
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

// ✅ Standalone COD detection helper - shared by PaymentBadge and Excel export
const isCODPayment = (paymentCollections?: any[]): boolean => {
  if (paymentCollections && Array.isArray(paymentCollections) && paymentCollections.length > 0) {
    const paymentCollection = paymentCollections[0];

    if (paymentCollection.payments && Array.isArray(paymentCollection.payments) && paymentCollection.payments.length > 0) {
      const payment = paymentCollection.payments[0];
      const providerId = payment.provider_id?.toLowerCase() || '';

      if (providerId.includes('system_default') || providerId.includes('pp_system')) return true;
      if (providerId.includes('manual') || providerId.includes('cod') || providerId.includes('cash')) return true;
      if (providerId.includes('razorpay')) return false;

      if (paymentCollection.status === 'authorized' &&
          payment.captured_at === null &&
          paymentCollection.captured_amount === 0) {
        return true;
      }
    }

    if (paymentCollection.payment_providers && Array.isArray(paymentCollection.payment_providers) && paymentCollection.payment_providers.length > 0) {
      const provider = paymentCollection.payment_providers[0];
      const providerType = provider?.id?.toLowerCase() || '';
      if (providerType.includes('manual') || providerType.includes('cod') || providerType.includes('cash') || providerType.includes('system_default')) {
        return true;
      }
    }
  }
  return false;
};

// Payment badge component with icons
const PaymentBadge = ({ status, paymentCollections, vendorPaymentDetails, orderStatus, canceledAt }: { 
  status: string
  paymentCollections?: any[]
  vendorPaymentDetails?: any
  orderStatus?: string
  canceledAt?: string
}) => {
  // ✅ CHECK FOR REFUNDED OR CANCELED STATUS FIRST
  if (status === "refunded" || orderStatus === "canceled" || canceledAt) {
    return (
      <Badge variant="outline" className="font-medium text-red-700 border-red-200 bg-red-50">
        <XCircle className="w-3 h-3 mr-1" />
        Refunded
      </Badge>
    );
  }

  const normalizedStatus = status.toLowerCase();
  
  // ✅ Helper function to detect if payment is COD/Manual
  // const isCODPayment = () => {
  //   // Check payment_collections array
  //   if (paymentCollections && Array.isArray(paymentCollections) && paymentCollections.length > 0) {
  //     const paymentCollection = paymentCollections[0];
      
  //     // ✅ CRITICAL: Check payments array for provider_id
  //     if (paymentCollection.payments && Array.isArray(paymentCollection.payments) && paymentCollection.payments.length > 0) {
  //       const payment = paymentCollection.payments[0];
  //       const providerId = payment.provider_id?.toLowerCase() || '';
        
  //       // ✅ COD Detection Logic:
  //       // 1. Check if provider is system_default (COD)
  //       if (providerId.includes('system_default') || providerId.includes('pp_system')) {
  //         //console.log("✅ COD Payment Detected - Provider:", providerId);
  //         return true;
  //       }
        
  //       // 2. Check if provider explicitly mentions manual/cod/cash
  //       if (providerId.includes('manual') || providerId.includes('cod') || providerId.includes('cash')) {
  //         //console.log("✅ COD Payment Detected - Provider:", providerId);
  //         return true;
  //       }
        
  //       // 3. Check if it's Razorpay
  //       if (providerId.includes('razorpay')) {
  //         //console.log("✅ Razorpay Payment Detected - Provider:", providerId);
  //         return false;
  //       }
        
  //       // 4. Additional check: If payment is authorized but not captured (typical for COD)
  //       if (paymentCollection.status === 'authorized' && 
  //           payment.captured_at === null && 
  //           paymentCollection.captured_amount === 0) {
  //         //console.log("✅ COD Payment Detected - Authorized but not captured");
  //         return true;
  //       }
        
  //       //console.log("⚠️ Unknown provider:", providerId);
  //     }
      
  //     // Fallback: Check payment_providers array
  //     if (paymentCollection.payment_providers && Array.isArray(paymentCollection.payment_providers) && paymentCollection.payment_providers.length > 0) {
  //       const provider = paymentCollection.payment_providers[0];
  //       const providerType = provider?.id?.toLowerCase() || '';
        
  //       if (providerType.includes('manual') || providerType.includes('cod') || providerType.includes('cash') || providerType.includes('system_default')) {
  //         //console.log("✅ COD Payment Detected via payment_providers");
  //         return true;
  //       }
  //     }
  //   }
    
  //   //console.log("❌ Not COD - defaulting to Razorpay");
  //   return false;
  // };
  
  const getStatusProps = (status: string) => {
    const isCOD = isCODPayment(paymentCollections);
    
    switch (status) {
      case "captured":
      case "paid":
        // ✅ Check if it's COD or Razorpay
        if (isCOD) {
          return { 
            variant: "outline" as const, 
            className: "text-orange-700 bg-orange-50 border-orange-200 font-medium",
            icon: <Package className="w-3 h-3 mr-1" />,
            text: "COD"
          };
        } else {
          return { 
            variant: "outline" as const, 
            className: "text-green-700 bg-green-50 border-green-200 font-medium",
            icon: <CreditCard className="w-3 h-3 mr-1" />,
            text: "Paid"
          };
        }
      case "awaiting":
      case "pending":
      case "requires_action":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium",
          icon: <Clock className="w-3 h-3 mr-1" />,
          text: status === "requires_action" ? "Action Required" : status.charAt(0).toUpperCase() + status.slice(1)
        };
      case "failed":
      case "canceled":
      case "not_paid":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />,
          text: status === "not_paid" ? "Unpaid" : status.charAt(0).toUpperCase() + status.slice(1)
        };
      case "refunded":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium",
          icon: <RefreshCw className="w-3 h-3 mr-1" />,
          text: "Refunded"
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "text-gray-700 bg-gray-50 border-gray-200 font-medium",
          icon: null,
          text: status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        };
    }
  };

  const { variant, className, icon, text } = getStatusProps(normalizedStatus);

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {text}
    </Badge>
  );
};


// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,  // ✅ Show 2 decimal places
    minimumFractionDigits: 2   // ✅ Always show 2 decimals
  }).format(amount);
};

// ✅ Updated Summary Cards Component using vendor-specific data
// ✅ UPDATED: Summary Cards with time-based revenue filter
const SummaryCards = ({ 
  data, 
  revenueTimeFilter, 
  setRevenueTimeFilter 
}: { 
  data: VendorOrder[]
  revenueTimeFilter: 'today' | 'week' | 'month' | 'all'
  setRevenueTimeFilter: (filter: 'today' | 'week' | 'month' | 'all') => void
}) => {
  // Calculate summary metrics from vendor-filtered orders
  const totalOrders = data.length;
  
  // ✅ Calculate revenue based on selected time filter
  const getRevenueByTimeFilter = () => {
    const now = new Date();
    
    // Filter out canceled/refunded orders
    const activeOrders = data.filter(order => 
      order.status !== "canceled" && 
      !order.canceled_at && 
      order.payment_status !== "refunded"
    );
    
    let filteredOrders = activeOrders;
    
    switch (revenueTimeFilter) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        filteredOrders = activeOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= todayStart;
        });
        break;
        
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        filteredOrders = activeOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= weekStart;
        });
        break;
        
      case 'month':
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 30);
        monthStart.setHours(0, 0, 0, 0);
        filteredOrders = activeOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart;
        });
        break;
        
      case 'all':
      default:
        filteredOrders = activeOrders;
        break;
    }
    
    return {
      revenue: filteredOrders.reduce((sum, order) => sum + order.vendor_total, 0),
      count: filteredOrders.length
    };
  };
  
  const { revenue: filteredRevenue, count: filteredOrderCount } = getRevenueByTimeFilter();
  
  const pendingOrders = data.filter(order => 
    order.fulfillment_status === "not_fulfilled" || 
    order.fulfillment_status === "pending"
  ).length;
  
  const processingOrders = data.filter(order => {
    const isPending = order.fulfillment_status === "not_fulfilled" || 
                     order.fulfillment_status === "pending";
    
    const hasCreatorFulfillmentProducts = order.vendor_items.some(item => 
      item.fulfillment_type === "Creator-fulfilment"
    );
    
    return isPending && hasCreatorFulfillmentProducts;
  }).length;
  
  // Today's orders for the first card
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = data.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  });
  
  const todayRevenue = todayOrders
    .filter(order => 
      order.status !== "canceled" && 
      !order.canceled_at && 
      order.payment_status !== "refunded"
    )
    .reduce((sum, order) => sum + order.vendor_total, 0);
  
  // Helper to get time filter label
  const getTimeFilterLabel = () => {
    switch (revenueTimeFilter) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'all': return 'All Time';
    }
  };
  
  return (
    <div className="mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2 snap-x snap-mandatory">
        {/* Today's Orders */}
        <Card className="shadow-md min-w-[85vw] sm:min-w-0 sm:flex-1 snap-center">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-500">Today's Orders</p>
                <h3 className="text-lg font-bold">{todayOrders.length}</h3>
                <p className="mt-1 text-sm text-gray-500">Revenue: {formatPrice(todayRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND.primary}22` }}>
                <Package className="w-6 h-6" style={{ color: BRAND.primary }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Orders */}
        <Card className="shadow-md min-w-[85vw] sm:min-w-0 sm:flex-1 snap-center">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-500">Pending Orders</p>
                <h3 className="text-lg font-bold">{pendingOrders}</h3>
                <p className="mt-1 text-sm text-gray-500">Your products to fulfill</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Creator Fulfillment Orders */}
        <Card className="shadow-md min-w-[85vw] sm:min-w-0 sm:flex-1 snap-center">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-500">Creator Fulfillment</p>
                <h3 className="text-lg font-bold">{processingOrders}</h3>
                <p className="mt-1 text-sm text-gray-500">Products you need to fulfill</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ✅ UPDATED: Total Revenue with Time Filter Dropdown */}
        <Card className="shadow-md min-w-[85vw] sm:min-w-0 sm:flex-1 snap-center">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">Your Revenue</p>
                  <Select value={revenueTimeFilter} onValueChange={setRevenueTimeFilter}>
                    <SelectTrigger className="w-auto h-6 px-2 text-xs border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="text-lg font-bold">{formatPrice(filteredRevenue)}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  From {filteredOrderCount} {filteredOrderCount === 1 ? 'order' : 'orders'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  // ✅ Updated state for vendor-filtered orders
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [authError, setAuthError] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  
  // ✅ NEW: Product fulfillment type lookup
  const [productFulfillmentMap, setProductFulfillmentMap] = useState<Map<string, string>>(new Map());
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ ADD: Revenue time filter state
  const [revenueTimeFilter, setRevenueTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [dateFilterMode, setDateFilterMode] = useState<'single' | 'range'>('single');
  
  // Current tab (status)
  const [currentTab, setCurrentTab] = useState("all");
  
  // ✅ NEW: Fetch vendor products to get fulfillment types
  const fetchVendorProducts = async (token: string): Promise<Map<string, string>> => {
    try {
      
      const productResponse = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          
        },
        credentials: "include"
      });
      
      if (!productResponse.ok) {
        return new Map();
      }
      
      const productData = await productResponse.json();
      // Create a map of product_id -> fulfillment_type
      const fulfillmentMap = new Map<string, string>();
      
      if (productData.products && Array.isArray(productData.products)) {
        productData.products.forEach((product: any) => {
          
          if (product.id && product.metadata?.fulfillment_type) {
            try {
              // ✅ Parse the fulfillment_type JSON from metadata
              const fulfillmentTypeData = JSON.parse(product.metadata.fulfillment_type);
              const fulfillmentType = fulfillmentTypeData.type || "standard";
              
              fulfillmentMap.set(product.id, fulfillmentType);
            } catch (parseError) {
              fulfillmentMap.set(product.id, "standard");
            }
          } else {
            // Default to standard if no fulfillment type specified
            fulfillmentMap.set(product.id, "standard");
          }
        });
      }
      
      return fulfillmentMap;
      
    } catch (error) {
      return new Map();
    }
  };
  
  // ✅ FIXED: Updated fetch function with better error handling and debugging
  useEffect(() => {
  const fetchVendorOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("vendorToken");
      
      if (!token) {
        setAuthError(true);
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }
      
      // ✅ NEW: First fetch products to get fulfillment types
      const fulfillmentMap = await fetchVendorProducts(token);
      setProductFulfillmentMap(fulfillmentMap);
      
      // ✅ FIXED: Fetch orders with pagination - hits API on every page change
      const url = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/orders?limit=${limit}&offset=${(page - 1) * limit}`;
  
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        
        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 401) {
            setAuthError(true);
            setError("Your session has expired. Please log in again.");
          } else if (response.status === 500) {
            setError(`Internal Server Error: ${errorText || 'Unknown server error'}`);
          } else if (response.status === 404) {
            setError("Orders endpoint not found. Please check the server configuration.");
          } else {
            setError(`Error fetching orders: ${response.status} ${response.statusText}`);
          }
          setLoading(false);
          return;
        }
        
        // ✅ Parse response
        let data;
        try {
          const responseText = await response.text();

          if (!responseText) {
            throw new Error("Empty response from server");
          }
          
          data = JSON.parse(responseText);
        } catch (parseError) {
          setError("Invalid response format from server");
          setLoading(false);
          return;
        }
        
        if (!data) {
          setError("No data received from server");
          setLoading(false);
          return;
        }
        
        // Handle different response formats
        const ordersArray = data.orders || data.data || (Array.isArray(data) ? data : []);

        if (!Array.isArray(ordersArray)) {
          setError("Invalid orders data format");
          setLoading(false);
          return;
        }
        //console.log("Fetched Orders Data:", ordersArray);
        // ✅ FIXED: Enhanced data transformation with better error handling
        const transformedOrders = ordersArray.map((order: any, index: number) => {
          try {

          let custom_display_id: string | number = "";
            if (order.custom_display_id !== undefined && order.custom_display_id !== null && String(order.custom_display_id).trim() !== "") {
              custom_display_id = order.custom_display_id;
            }

            if (custom_display_id === "") {
              const totalOrdersCount = data.count || data.total || ordersArray.length;
              custom_display_id = totalOrdersCount - ((page - 1) * limit + index);
            }

            // ✅ Safer customer data extraction
            const customer = {
              first_name: order.customer?.first_name || order.billing_address?.first_name || "Guest",
              last_name: order.customer?.last_name || order.billing_address?.last_name || "",
              email: order.customer?.email || order.email || "customer@example.com",
              phone: order.customer?.phone || order.billing_address?.phone || order.shipping_address?.phone || undefined
            };
            
            // ✅ Safer date handling
            let created_at = new Date().toISOString();
            if (order.created_at) {
              created_at = order.created_at;
            } else if (order.vendor_items?.[0]?.created_at) {
              created_at = order.vendor_items[0].created_at;
            } else if (order.vendor_items?.[0]?.detail?.created_at) {
              created_at = order.vendor_items[0].detail.created_at;
            }
            
            // ✅ Safer numeric value extraction
            const safeNumber = (value: any, defaultValue: number = 0): number => {
              if (typeof value === 'number') return value;
              if (typeof value === 'string') return parseFloat(value) || defaultValue;
              if (value?.value !== undefined) return parseFloat(value.value) || defaultValue;
              return defaultValue;
            };
            
            // ✅ Enhanced vendor items transformation
            const vendor_items: VendorOrderItem[] = (order.vendor_items || []).map((item: any, itemIndex: number) => {
              
              const unit_price = safeNumber(item.unit_price || item.raw_unit_price);
              const quantity = Math.max(1, safeNumber(item.quantity, 1));
              const total = unit_price * quantity;
              
              // Extract product cost safely
              let product_cost = 0;
              if (item.product_cost !== undefined) {
                product_cost = safeNumber(item.product_cost);
              } else if (item.merged_metadata?.product_cost !== undefined) {
                product_cost = safeNumber(item.merged_metadata.product_cost);
              }
              
              // ✅ NEW: Get fulfillment type from products map
              const product_id = item.product_id || item.variant?.product_id;
              const fulfillment_type = product_id ? fulfillmentMap.get(product_id) || "standard" : "standard";
              
              
              return {
                id: item.id || `item_${itemIndex}`,
                title: item.title || item.product_title || "Unknown Product",
                subtitle: item.subtitle || item.variant?.title || item.variant_title || "Handcrafted Item",
                quantity: quantity,
                unit_price: unit_price,
                total: total,
                product_cost: product_cost,
                variant_sku: item.variant_sku || item.sku || "",
                product_id: product_id || "",
                product_handle: item.product_handle || "",
                claim_status: item.claim_status || 'active',
                return_status: item.return_status || 'none',
                is_claim_item: item.is_claim_item || false,
                claim_id: item.claim_id,
                return_id: item.return_id,
                return_reason: item.return_reason,
                claim_reason: item.claim_reason,
                tracking_numbers: item.tracking_numbers || [],
                tracking_urls: item.tracking_urls || [],
                shipped_at: item.shipped_at,
                delivered_at: item.delivered_at,
                packed_at: item.packed_at,
                shipping_provider: item.shipping_provider,
                has_tracking: item.has_tracking || false,
                fulfillment_type: fulfillment_type // ✅ Use fulfillment type from products map
              };
            });
            
            const transformedOrder: VendorOrder = {
            id: order.id || `order_${index}`,
            custom_display_id: custom_display_id,
            customer: customer,
            created_at: created_at,
            
            // ✅ Use vendor-specific totals with safe fallbacks
            vendor_total: safeNumber(order.vendor_total || order.vendor_payment_amount),
            vendor_subtotal: safeNumber(order.vendor_subtotal),
            vendor_shipping_total: safeNumber(order.vendor_shipping_total),
            vendor_tax_total: safeNumber(order.vendor_tax_total),
            
            vendor_items: vendor_items,
            status: order.status || "pending",  // ✅ ADD THIS
            canceled_at: order.canceled_at,     // ✅ ADD THIS
            payment_status: order.payment_status || "pending",
            fulfillment_status: order.fulfillment_status || "not_fulfilled",
            currency_code: "INR",
            
            // Vendor information
            vendor_id: order.vendor_id || "",
            vendor_handle: order.vendor_handle || "unknown",
            vendor_payment_amount: safeNumber(order.vendor_payment_amount || order.vendor_total),
            
            // ✅ CRITICAL: Add these lines if they're missing
            payment_collections: order.payment_collections || [],
            vendor_payment_details: order.vendor_payment_details || {},
            
            // Additional fields
            shipping_address: order.shipping_address,
            billing_address: order.billing_address,
            is_vendor_filtered: order.is_vendor_filtered || true,
            
            // Claims and returns
            claims: order.claims || [],
            returns: order.returns || [],
            claim_items: order.claim_items || [],
            return_items: order.return_items || [],
            has_claims: order.has_claims || false,
            has_returns: order.has_returns || false
          };
            
            return transformedOrder;
            
          } catch (transformError) {
    
            // Return a minimal order object to prevent complete failure
           return {
              id: order.id || `order_${index}`,
              custom_display_id: (order.custom_display_id ? parseInt(String(order.custom_display_id)) : 0) ||
                (order.display_id ? parseInt(String(order.display_id)) : 0) ||
                (page - 1) * limit + index + 1,
              customer: { first_name: "Guest", last_name: "", email: "customer@example.com" },
              created_at: new Date().toISOString(),
              vendor_total: 0,
              vendor_subtotal: 0,
              vendor_shipping_total: 0,
              vendor_tax_total: 0,
              vendor_items: [],
              payment_status: "pending",
              fulfillment_status: "not_fulfilled",
              currency_code: "INR",
              vendor_id: "",
              vendor_handle: "unknown",
              vendor_payment_amount: 0,
              is_vendor_filtered: true,
              claims: [],
              returns: [],
              claim_items: [],
              return_items: [],
              has_claims: false,
              has_returns: false
            } as VendorOrder;
          }
        });
        
        
        setOrders(transformedOrders);
        setTotalCount(data.count || data.total || 0); // ✅ Set total count from API
        setCount(data.count || data.total || transformedOrders.length);
        
        // Store vendor info
        if (data.vendor_id || data.vendor_info) {
          setVendorInfo({
            vendor_id: data.vendor_id || data.vendor_info?.vendor_id,
            filtering_applied: data.filtering_applied || true,
            total_linked_orders: data.total_linked_orders || transformedOrders.length
          });
        }
        
      } catch (err: any) {
        setError(err.message || "Failed to load vendor orders. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorOrders();
  }, [page, limit]); // Keep existing dependencies
  
  // ✅ FIXED: Enhanced filter function with better error handling
  // ✅ Updated: Filter first, then paginate
// ✅ UPDATED: Filter orders from server response (already paginated)
const filteredOrders = orders.filter(order => {
  try {
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim().toLowerCase();
      const searchFields = [
        order.id.toLowerCase(),
        String(order.custom_display_id),
        customerName,
        order.customer?.email?.toLowerCase() || ''
      ];
      
      if (!searchFields.some(field => field.includes(lowerSearch))) {
        return false;
      }
    }
    
    // Apply tab filter
    if (currentTab !== "all") {
      const status = order.fulfillment_status?.toLowerCase() || '';
      
      switch (currentTab) {
        case "pending":
          if (!["pending", "not_fulfilled"].includes(status)) return false;
          break;
        case "processing":
          const isPending = ["pending", "not_fulfilled"].includes(status);
          const hasCreatorFulfillmentProducts = order.vendor_items.some(item => 
            item.fulfillment_type === "Creator-fulfilment"
          );
          if (!(isPending && hasCreatorFulfillmentProducts)) return false;
          break;
        case "shipped":
          if (!["shipped", "partially_shipped"].includes(status)) return false;
          break;
        case "completed":
          if (!["fulfilled", "delivered", "completed"].includes(status)) return false;
          break;
        case "cancelled":
          if (!["cancelled", "canceled"].includes(status)) return false;
          break;
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
    if (dateFilter || dateRangeFilter) {
      try {
        const orderDate = new Date(order.created_at);
        
        if (isNaN(orderDate.getTime())) {
          return true;
        }
        
        orderDate.setHours(0, 0, 0, 0);
        
        if (dateFilterMode === 'single' && dateFilter) {
          const filterDate = new Date(dateFilter);
          filterDate.setHours(0, 0, 0, 0);
          
          if (orderDate.getTime() !== filterDate.getTime()) {
            return false;
          }
        } else if (dateFilterMode === 'range' && dateRangeFilter) {
          if (dateRangeFilter.from) {
            const fromDate = new Date(dateRangeFilter.from);
            fromDate.setHours(0, 0, 0, 0);
            
            if (orderDate.getTime() < fromDate.getTime()) {
              return false;
            }
          }
          
          if (dateRangeFilter.to) {
            const toDate = new Date(dateRangeFilter.to);
            toDate.setHours(23, 59, 59, 999);
            
            if (orderDate.getTime() > toDate.getTime()) {
              return false;
            }
          }
        }
      } catch (dateError) {
        return true;
      }
    }
    
    return true;
  } catch (filterError) {
    return true;
  }
}).sort((a, b) => {
  try {
    switch (sortOrder) {
      case "latest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "highest":
        return (b.vendor_total || 0) - (a.vendor_total || 0);
      case "lowest":
        return (a.vendor_total || 0) - (b.vendor_total || 0);
      default:
        return 0;
    }
  } catch (sortError) {
    return 0;
  }
});

// ✅ ADD: Client-side pagination
// const totalFilteredCount = filteredOrders.length;
// const startIndex = (page - 1) * limit;
// const endIndex = startIndex + limit;
// const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

// ✅ UPDATED: Reset page to 1 when filters change AND refetch
useEffect(() => {
  if (page !== 1) {
    setPage(1);
  }
}, [searchTerm, statusFilter, paymentFilter, currentTab, dateFilter, dateRangeFilter, sortOrder]);

  // Get unique values for filter dropdowns
  const fulfillmentStatusOptions = [...new Set(orders.map(order => order.fulfillment_status))];
  const paymentStatusOptions = [...new Set(orders.map(order => order.payment_status))];
  
  // ✅ Calculate status counts for tabs using vendor data
  const pendingCount = orders.filter(order => 
    order.fulfillment_status === "pending" || 
    order.fulfillment_status === "not_fulfilled"
  ).length;
  
  // ✅ UPDATED: Processing count - only pending orders with creator fulfillment products
  const processingCount = orders.filter(order => {
    // Check if order has pending status
    const isPending = order.fulfillment_status === "pending" || 
                     order.fulfillment_status === "not_fulfilled";
    
    // Check if order has products with creator fulfillment type
    const hasCreatorFulfillmentProducts = order.vendor_items.some(item => 
      item.fulfillment_type === "Creator-fulfilment"
    );
    
    
    return isPending && hasCreatorFulfillmentProducts;
  }).length;

  
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
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return "—"
      return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d)
    } catch {
      return "—"
    }
  }
  
  // View order details on external page
  const viewOrderDetails = (orderId: string) => {
    window.open(`/orders/${orderId}`, '_blank');
  };

  const exportOrdersToExcel = () => {
  try {
    // Flatten the orders data for Excel export (each row = one item)
    const exportData = [];
    
    filteredOrders.forEach(order => {
      order.vendor_items.forEach(item => {
        exportData.push({
          // Order Information
          'Order ID': `#${order.custom_display_id}`,
          'Order Date': formatDate(order.created_at),
          'Order Status': order.fulfillment_status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A',
          'Payment Status': (order.payment_status === 'refunded' || order.status === 'canceled' || order.canceled_at)
            ? 'Refunded'
            : (order.payment_status === 'captured' || order.payment_status === 'paid')
              ? (isCODPayment(order.payment_collections) ? 'COD' : 'Paid')
              : order.payment_status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A',
          
          // Customer Information
          'Customer Name': `${order.customer.first_name} ${order.customer.last_name}`.trim() || 'Guest',
          'Customer Email': order.customer.email || 'N/A',
          'Customer Phone': order.customer.phone || 'N/A',
          
          // Product Information
          'Product Title': item.title || 'N/A',
          'Product Subtitle': item.subtitle || 'N/A',
          'Product SKU': item.variant_sku || 'N/A',
          'Product ID': item.product_id || 'N/A',
          'Fulfillment Type': item.fulfillment_type || 'Standard',
          
          // Quantity & Pricing
          'Quantity': item.quantity || 0,
          'Unit Price': `₹${item.unit_price?.toFixed(2) || '0.00'}`,
          'Item Total': `₹${item.total?.toFixed(2) || '0.00'}`,
          'Product Cost': `₹${item.product_cost?.toFixed(2) || '0.00'}`,
          
          // Order Totals (vendor-specific)
          'Your Order Subtotal': `₹${order.vendor_subtotal?.toFixed(2) || '0.00'}`,
          'Your Order Shipping': `₹${order.vendor_shipping_total?.toFixed(2) || '0.00'}`,
          'Your Order Tax': `₹${order.vendor_tax_total?.toFixed(2) || '0.00'}`,
          'Your Order Total': `₹${order.vendor_total?.toFixed(2) || '0.00'}`,
          
          // Address Information
          'Shipping Address': order.shipping_address ? 
            `${order.shipping_address.address_1 || ''} ${order.shipping_address.address_2 || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.province || ''} ${order.shipping_address.postal_code || ''}, ${order.shipping_address.country_code || ''}`.replace(/\s+/g, ' ').trim() : 'N/A',
          
          'Billing Address': order.billing_address ? 
            `${order.billing_address.address_1 || ''} ${order.billing_address.address_2 || ''}, ${order.billing_address.city || ''}, ${order.billing_address.province || ''} ${order.billing_address.postal_code || ''}, ${order.billing_address.country_code || ''}`.replace(/\s+/g, ' ').trim() : 'N/A',
          
          // Claims & Returns
          'Has Claims': order.has_claims ? 'Yes' : 'No',
          'Has Returns': order.has_returns ? 'Yes' : 'No',
          'Item Claim Status': item.claim_status || 'Active',
          'Item Return Status': item.return_status || 'None',
          
          // Tracking Information
          'Tracking Numbers': item.tracking_numbers?.join(', ') || 'N/A',
          'Shipping Provider': item.shipping_provider || 'N/A',
          'Shipped Date': item.shipped_at ? formatDate(item.shipped_at) : 'N/A',
          'Delivered Date': item.delivered_at ? formatDate(item.delivered_at) : 'N/A',
          'Packed Date': item.packed_at ? formatDate(item.packed_at) : 'N/A',
        });
      });
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Order ID
      { wch: 12 }, // Order Date
      { wch: 15 }, // Order Status
      { wch: 15 }, // Payment Status
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Customer Email
      { wch: 15 }, // Customer Phone
      { wch: 30 }, // Product Title
      { wch: 20 }, // Product Subtitle
      { wch: 15 }, // Product SKU
      { wch: 15 }, // Product ID
      { wch: 18 }, // Fulfillment Type
      { wch: 10 }, // Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Item Total
      { wch: 12 }, // Product Cost
      { wch: 15 }, // Your Order Subtotal
      { wch: 15 }, // Your Order Shipping
      { wch: 12 }, // Your Order Tax
      { wch: 15 }, // Your Order Total
      { wch: 40 }, // Shipping Address
      { wch: 40 }, // Billing Address
      { wch: 12 }, // Has Claims
      { wch: 12 }, // Has Returns
      { wch: 15 }, // Item Claim Status
      { wch: 15 }, // Item Return Status
      { wch: 20 }, // Tracking Numbers
      { wch: 15 }, // Shipping Provider
      { wch: 12 }, // Shipped Date
      { wch: 12 }, // Delivered Date
      { wch: 12 }, // Packed Date
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    // Generate filename with current date and filter info
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    let filename = `orders-export-${dateStr}`;
    
    // Add filter info to filename
    if (currentTab !== 'all') {
      filename += `-${currentTab}`;
    }
    if (searchTerm) {
      filename += `-search`;
    }
    if (statusFilter !== 'all') {
      filename += `-${statusFilter}`;
    }
    
    filename += '.xlsx';
    
    // Download the file
    XLSX.writeFile(workbook, filename);
    
    // Show success message (you can add a toast notification here)
    
  } catch (error) {
    alert('Error exporting orders. Please try again.');
  }
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
              <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
              <Separator orientation='vertical' className='h-6 ml-2' />
              {/* <span className="hidden text-gray-500 md:inline">|</span> */}
              {/* <div 
                className="ml-2 mr-2 text-2xl font-bold" 
                style={{ color: BRAND.primary }}
              >
                JUNOONI
              </div> */}
              {/* <span className="hidden text-gray-500 md:inline">|</span> */}
              {/* <h1 className="hidden ml-2 text-base font-semibold md:block" style={{ color: BRAND.secondary }}>
                Seller Order Page
              </h1> */}
            </div>
            <div className="absolute -translate-x-1/2 left-1/2 md:hidden">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src={Junoonilogo} 
                  alt="Junooni Logo" 
                  className="h-8 sm:h-10" 
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
              <a href="/dashboard">Dashboard</a>
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
                <a href="/products">Products</a>
              </Button>
              <Button 
                variant="ghost"
                className="hidden font-medium md:flex"
                style={{ color: BRAND.primary }}
              >
               <a href="/Orders">Orders</a>
              </Button>
              <Button 
                variant="ghost"
                className="hidden md:flex"
              >
                <a href="/help-center">Help</a>
              </Button>
              <ProfileDropdown />
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
      <div className="container px-4 py-4 mx-auto">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-lg font-bold" style={{ color: BRAND.secondary }}>Your Orders</h1>
          <p className="text-sm text-muted-foreground">View and track orders containing your products</p>
        </div>
        
        {/* ✅ ENHANCED: Better error display */}
        {error && !authError && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Orders
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="text-red-800 border-red-300 hover:bg-red-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* ✅ Updated Summary cards using vendor data */}
        {!loading && !error && (
          <SummaryCards 
            data={orders} 
            revenueTimeFilter={revenueTimeFilter}
            setRevenueTimeFilter={setRevenueTimeFilter}
          />
        )}
        
        {/* Status tab filters */}
        {/* Status tab filters - Horizontal Scroll for Mobile */}
        {!loading && (
          <div className="mb-4">
            {/* Mobile View - Horizontal Scroll */}
            <div className="px-4 pb-2 -mx-4 overflow-x-auto sm:hidden">
              <div className="flex gap-2 min-w-max">
                <Button 
                  variant={currentTab === "all" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("all")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "all" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : ""}`}
                >
                  All ({orders.length})
                </Button>
                
                <Button 
                  variant={currentTab === "pending" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("pending")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "pending" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pending ({pendingCount})
                </Button>
                
                <Button 
                  variant={currentTab === "processing" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("processing")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "processing" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}`}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Creator ({processingCount})
                </Button>
                
                <Button 
                  variant={currentTab === "shipped" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("shipped")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "shipped" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}`}
                >
                  <Truck className="w-3 h-3 mr-1" />
                  Shipped ({shippedCount})
                </Button>
                
                <Button 
                  variant={currentTab === "completed" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("completed")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "completed" ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-200" : ""}`}
                >
                  <CircleCheck className="w-3 h-3 mr-1" />
                  Done ({completedCount})
                </Button>
                
                <Button 
                  variant={currentTab === "cancelled" ? "default" : "outline"} 
                  onClick={() => setCurrentTab("cancelled")}
                  className={`text-xs px-3 py-1.5 whitespace-nowrap ${currentTab === "cancelled" ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-200" : ""}`}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Cancelled ({cancelledCount})
                </Button>
              </div>
            </div>

            {/* Desktop View - Original Layout */}
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
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
                className={currentTab === "pending" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending
                <Badge variant="secondary" className="ml-2 bg-orange-50 text-[#e65100]">
                  {pendingCount}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "processing" ? "default" : "outline"} 
                onClick={() => setCurrentTab("processing")}
                className={currentTab === "processing" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Creator Fulfillment
                <Badge variant="secondary" className="ml-2 text-[#e65100] bg-orange-50">
                  {processingCount}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "shipped" ? "default" : "outline"} 
                onClick={() => setCurrentTab("shipped")}
                className={currentTab === "shipped" ? "bg-orange-100 hover:bg-orange-200 text-[#e65100] border-orange-200" : ""}
              >
                <Truck className="w-4 h-4 mr-2" />
                Shipped
                <Badge variant="secondary" className="ml-2 text-[#e65100] bg-orange-50">
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
          </div>
        )}
        
        {/* Search and filters */}
        {!loading && (
          <div className="flex flex-col gap-3 mb-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <DateFilter
                  selectedDate={dateFilterMode === 'single' ? dateFilter : undefined}
                  selectedDateRange={dateFilterMode === 'range' ? dateRangeFilter : undefined}
                  onDateSelect={(date) => {
                    setDateFilter(date);
                    setDateRangeFilter(undefined);
                    setDateFilterMode('single');
                  }}
                  onDateRangeSelect={(range) => {
                    setDateRangeFilter(range);
                    setDateFilter(undefined);
                    setDateFilterMode('range');
                  }}
                  onCustomModeToggle={() => {
                    if (dateFilterMode === 'single') {
                      setDateFilterMode('range');
                      setDateFilter(undefined);
                    }
                  }}
                  mode={dateFilterMode}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (dateFilterMode === 'single') {
                      setDateFilterMode('range');
                      setDateFilter(undefined);
                    } else {
                      setDateFilterMode('single');
                      setDateRangeFilter(undefined);
                    }
                  }}
                  className="px-2"
                  title={dateFilterMode === 'single' ? 'Switch to date range' : 'Switch to single date'}
                >
                  {dateFilterMode === 'single' ? (
                    <CalendarDays className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-32 text-sm">
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
                <SelectTrigger className="w-32 text-sm">
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
                <SelectTrigger className="w-32 text-sm">
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
        )}
        
        {/* Orders card */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold" style={{ color: BRAND.secondary }}>
                    Your Orders
                  </CardTitle>
                  {(loading || filteredOrders.length > 0) && (
                    <CardDescription className="text-sm" style={{ color: BRAND.textSecondary }}>
                      {loading
                        ? "Loading your orders..."
                        : `Showing ${filteredOrders.length} of ${count} orders with your products`}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* <Button 
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  disabled={loading || filteredOrders.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button> */}
                <Button 
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  disabled={loading || filteredOrders.length === 0}
                  onClick={exportOrdersToExcel}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Page ({filteredOrders.length} orders)
                </Button>
              </div>
            </div>
          </CardHeader>
      
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: BRAND.primary }} />
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              </div>
            ) : error && !authError ? (
              <div className="py-8 text-center text-destructive">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h3 className="mb-2 text-lg font-medium text-red-600">Error Loading Orders</h3>
                <p className="mb-4 text-red-500">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
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
                        "No orders containing your products yet"}
                    </p>
                   {(searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateFilter || dateRangeFilter) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPaymentFilter("all");
                        setDateFilter(undefined);
                        setDateRangeFilter(undefined);
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
                        <TableRow className="h-12 group hover:bg-gray-50">
                          <TableHead className="w-[100px]">Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Your Items</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Your Total</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Payment</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer group hover:bg-gray-50"  onClick={() => viewOrderDetails(order.id)}>
                            <TableCell className="text-sm font-medium">
                              <Button 
                                variant="link" 
                                className="h-auto p-0 ml-2 font-medium"
                                style={{ color: BRAND.primary }}
                              >
                                #{order.custom_display_id}
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
                                {order.vendor_items.reduce((acc, item) => acc + item.quantity, 0)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-right">
                              <span style={{
                                color: order.status === "canceled" || order.canceled_at || order.payment_status === "refunded"
                                  ? "#B91C1C"  // Red color
                                  : BRAND.textPrimary
                              }}>
                                {formatPrice(
                                  order.status === "canceled" || order.canceled_at || order.payment_status === "refunded"
                                    ? 0
                                    : order.vendor_total, 
                                  order.currency_code
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                               <StatusBadge 
                                  status={order.fulfillment_status}
                                  orderStatus={order.status}
                                  canceledAt={order.canceled_at}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                               <PaymentBadge 
                                  status={order.payment_status} 
                                  paymentCollections={order.payment_collections}
                                  vendorPaymentDetails={order.vendor_payment_details}
                                  orderStatus={order.status}
                                  canceledAt={order.canceled_at}
                                />
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
                                    View your details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/orders/${order.id}`} className="flex items-center w-full">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Open in same tab
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {/* <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download vendor invoice
                                  </DropdownMenuItem> */}
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
                {/* ✅ Updated Pagination */}
                {/* ✅ UPDATED: Server-side Pagination */}
                {!loading && filteredOrders.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{" "}
                      <span className="font-medium">{totalCount}</span> orders
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1 || loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* ✅ Page numbers */}
                      {Array.from({ length: Math.min(Math.ceil(totalCount / limit), 5) }, (_, index) => {
                        const totalPages = Math.ceil(totalCount / limit);
                        let pageNumber: number;
                        
                        // Show first few pages, or pages around current page
                        if (totalPages <= 5) {
                          pageNumber = index + 1;
                        } else if (page <= 3) {
                          pageNumber = index + 1;
                        } else if (page >= totalPages - 2) {
                          pageNumber = totalPages - 4 + index;
                        } else {
                          pageNumber = page - 2 + index;
                        }
                        
                        // Don't show if page number is invalid
                        if (pageNumber < 1 || pageNumber > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={page === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNumber)}
                            disabled={loading}
                            style={page === pageNumber ? { 
                              backgroundColor: BRAND.primary,
                              color: 'white' 
                            } : {}}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      
                      {/* Show ellipsis if there are more pages */}
                      {Math.ceil(totalCount / limit) > 5 && page < Math.ceil(totalCount / limit) - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      
                      {/* Show last page if not visible */}
                      {Math.ceil(totalCount / limit) > 5 && page < Math.ceil(totalCount / limit) - 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.ceil(totalCount / limit))}
                          disabled={loading}
                        >
                          {Math.ceil(totalCount / limit)}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(totalCount / limit)))}
                        disabled={page >= Math.ceil(totalCount / limit) || loading}
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
        
        {/* ✅ Updated Order Distribution Charts using vendor data */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-7">
            <Card className="shadow-md md:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Your Order Distribution</CardTitle>
                <CardDescription>Distribution of your orders by status</CardDescription>
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
                  
                  {/* Creator Fulfillment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Creator Fulfillment</span>
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
                <CardTitle className="text-base font-semibold">Your Recent Orders</CardTitle>
                <CardDescription>Latest orders with your products</CardDescription>
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
                              #{order.custom_display_id}
                            </span> - {order.customer.first_name} {order.customer.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex gap-1">
                            <StatusBadge 
                              status={order.fulfillment_status}
                              orderStatus={order.status}
                              canceledAt={order.canceled_at}
                            />
                            {order.vendor_items.some(item => 
                              item.fulfillment_type === "Creator-fulfilment"
                            ) && (
                              <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50">
                                CF
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium" style={{
                            color: order.status === "canceled" || order.canceled_at || order.payment_status === "refunded"
                              ? "#B91C1C"
                              : undefined
                          }}>
                            {formatPrice(
                              order.status === "canceled" || order.canceled_at || order.payment_status === "refunded"
                                ? 0
                                : order.vendor_total
                            )}
                          </p>
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
        )}
      </div>
      
      {/* Footer */}
      <div className="py-6 mt-4 border-t border-gray-200">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm" style={{ color: BRAND.textLight }}>
            &copy; {new Date().getFullYear()} Junooni. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
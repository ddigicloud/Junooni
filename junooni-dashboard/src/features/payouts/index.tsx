"use client"

import { useState, useEffect, useRef } from "react"
import * as XLSX from 'xlsx';
import { 
  Download, Search, MoreHorizontal, Filter, 
  Loader2, Calendar, CreditCard, 
  Package, Clock, ExternalLink,
  AlertTriangle, RefreshCw, Truck,
  Eye, ChevronDown, ChevronLeft,
  ChevronRight, CircleCheck, Info,
  DollarSign, TrendingUp, Wallet,
  Plus, FileText, ArrowUpRight,
  ArrowDownRight, Minus, CalendarDays,
  Building2, Receipt, ChartPie, IndianRupee
} from "lucide-react"
import { Link } from '@tanstack/react-router'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Junoonilogo from '../../assets/junooni_logo_brand_color.png' // Adjust path as needed
import { ProductsPrimaryButtons, ProductsPrimaryButtonsHandle } from '../products/components/ProductsPrimaryButtons'
import { Separator } from '@/components/ui/separator'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

// Interfaces for payout data
interface PayoutDetail {
  id: string
  type: 'earning' | 'payout' | 'adjustment' | 'refund'
  amount: number
  reason?: string
  notes?: string
  order_id?: string
  order_item_id?: string
  product_id?: string
  created_at: string
  status?: string
  reference_id?: string
}

interface VendorPayout {
  id: string
  vendor_id: string
  total_earnings: number
  pending_amount: number
  paid_amount: number
  available_for_payout: number
  last_payout_date?: string
  next_payout_date?: string
  created_at: string
  updated_at: string
  status: string
  payout_details: PayoutDetail[]
}

// Utility function to decode JWT token and get vendor info
const getVendorInfoFromToken = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    console.log("🔍 [DEBUG getVendorInfoFromToken] Token exists:", !!token);
    
    if (!token) return { vendorId: null, isAuthenticated: false };

    // Decode JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("🔍 [DEBUG getVendorInfoFromToken] Token payload:", payload);
    
    // Try different possible vendor ID fields
    const vendorId = payload.vendor_id || payload.actor_id || payload.sub || payload.id;
    console.log("🔍 [DEBUG getVendorInfoFromToken] Extracted vendorId:", vendorId);
    
    return { 
      vendorId, 
      isAuthenticated: !!token 
    };
  } catch (error) {
    console.error('❌ [DEBUG getVendorInfoFromToken] Error decoding token:', error);
    return { vendorId: null, isAuthenticated: false };
  }
};

// Status badge component with icons for payout types
const PayoutTypeBadge = ({ type }: { type: string }) => {
  const getTypeProps = (type: string) => {
    switch (type) {
      case "earning":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium text-xs px-2 py-0.5",
          icon: <ArrowUpRight className="w-3 h-3 mr-1" />
        };
      case "payout":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium text-xs px-2 py-0.5",
          icon: <Wallet className="w-3 h-3 mr-1" />
        };
      case "adjustment":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium text-xs px-2 py-0.5",
          icon: <RefreshCw className="w-3 h-3 mr-1" />
        };
      case "refund":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium text-xs px-2 py-0.5",
          icon: <ArrowDownRight className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "text-gray-700 bg-gray-50 border-gray-200 font-medium text-xs px-2 py-0.5",
          icon: null
        };
    }
  };

  const { variant, className, icon } = getTypeProps(type);

  const formatType = (type: string) => {
    switch (type) {
      case "earning":
        return "Earning";
      case "payout":
        return "Payout";
      case "adjustment":
        return "Adjustment";
      case "refund":
        return "Refund";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {formatType(type)}
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

// Summary Cards Component
const PayoutSummaryCards = ({ data }: { data: VendorPayout | null }) => {
  if (!data) return null;

  const totalEarnings = data.total_earnings || 0;
  const availableForPayout = data.available_for_payout || 0;
  const pendingAmount = data.pending_amount || 0;
  const paidAmount = data.paid_amount || 0;
  
  // Calculate today's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEarnings = data.payout_details?.filter(detail => {
    const detailDate = new Date(detail.created_at);
    return detailDate >= today && detail.type === 'earning';
  }).reduce((sum, detail) => sum + detail.amount, 0) || 0;
  
  return (
    <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Available for Payout */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Available for Payout</p>
              <h3 className="text-lg font-bold">{formatPrice(availableForPayout)}</h3>
              <p className="mt-1 text-sm text-gray-500">Ready to withdraw</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND.primary}22` }}>
              <Wallet className="w-6 h-6" style={{ color: BRAND.primary }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Earnings */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Total Earnings</p>
              <h3 className="text-lg font-bold">{formatPrice(totalEarnings)}</h3>
              <p className="mt-1 text-sm text-gray-500">Today: {formatPrice(todayEarnings)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Payouts */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Pending Payouts</p>
              <h3 className="text-lg font-bold">{formatPrice(pendingAmount)}</h3>
              <p className="mt-1 text-sm text-gray-500">Being processed</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Paid Amount */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Total Paid</p>
              <h3 className="text-lg font-bold">{formatPrice(paidAmount)}</h3>
              <p className="mt-1 text-sm text-gray-500">Successfully transferred</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CircleCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Empty State Component
const EmptyPayoutState = () => {
  const popupButtonsRef = useRef<ProductsPrimaryButtonsHandle>(null);
  return (
    <div className="py-16 text-center">
      <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full" style={{ backgroundColor: `${BRAND.primary}11` }}>
        <Building2 className="w-12 h-12" style={{ color: BRAND.primary }} />
      </div>
      <h3 className="mb-2 text-xl font-semibold" style={{ color: BRAND.secondary }}>
        Welcome to Junooni Payouts
      </h3>
      <p className="max-w-md mx-auto mb-6 text-gray-600">
        Your payout account is being set up. Once you start selling products and earning commissions, 
        your transaction history and earnings will appear here.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button  className="bg-[#e65100] text-white hover:bg-[#cc4400] hover:text-white"   variant="outline" onClick={() => popupButtonsRef.current?.openPopup()}>
          <Package className="w-4 h-4 mr-2"  />
          Add Your First Product
        </Button>
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <ProductsPrimaryButtons ref={popupButtonsRef} />
        </div>
        {/* <Button variant="ghost" size="sm">
          <Info className="w-4 h-4 mr-2" />
          Learn About Payouts
        </Button> */}
      </div>
    </div>
  );
};

// Request Payout Dialog Component
const RequestPayoutDialog = ({ 
  availableAmount, 
  onRequestPayout,
  vendorId 
}: { 
  availableAmount: number;
  onRequestPayout: () => void;
  vendorId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPayout = async () => {
    if (!vendorId) {
      setError("Unable to process payout request. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("vendorToken");
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/${vendorId}/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor_id: vendorId
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (response.status === 400) {
          setError("Invalid request. Please check your account details.");
        } else if (response.status === 409) {
          setError("A payout request is already pending. Please wait for it to be processed.");
        } else {
          setError("Unable to process payout request. Please try again later.");
        }
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      console.log("🔍 [DEBUG] Payout request response data:", responseData);
      
      if (responseData.Payout) {
        setOpen(false);
        onRequestPayout();
      } else {
        setError("Unexpected response. Please try again.");
      }
      
    } catch (error: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="text-white"
          style={{ backgroundColor: BRAND.primary }}
          disabled={availableAmount <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Payout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Request a payout for your available earnings. The amount will be transferred to your registered bank account within 2-3 business days.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <div className="py-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Available Amount:</span>
              <span className="text-lg font-bold" style={{ color: BRAND.primary }}>
                {formatPrice(availableAmount)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              This is the total amount available for withdrawal after deducting any pending orders and adjustments.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setOpen(false);
            setError(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequestPayout}
            disabled={loading || availableAmount <= 0}
            className="text-white"
            style={{ backgroundColor: BRAND.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Request {formatPrice(availableAmount)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function PayoutPage() {
  const [payout, setPayout] = useState<VendorPayout | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [hasPayoutAccount, setHasPayoutAccount] = useState(false);

  
  // Transaction details modal state
  const [selectedTransaction, setSelectedTransaction] = useState<PayoutDetail | null>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [dateFilterMode, setDateFilterMode] = useState<'single' | 'range'>('single');
  
  // Current tab (type)
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch payout data
  // Fetch payout data
useEffect(() => {
  const fetchPayoutData = async () => {
    setLoading(true);
    setError(null);
    
    console.log("🔍 [DEBUG] Starting fetchPayoutData...");
    
    try {
      const token = localStorage.getItem("vendorToken");
      
      if (!token) {
        console.log("❌ [DEBUG] No token found");
        setAuthError(true);
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      // Always fetch vendor ID from /vendors/me endpoint
      // Token contains actor_id (vendor admin ID), NOT the vendor ID
      let finalVendorId: string | null = null;
      
      try {
        console.log("🔍 [DEBUG] Fetching vendor ID from /vendors/me...");
        const vendorResponse = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        console.log("🔍 [DEBUG] /vendors/me response status:", vendorResponse.status);
        
        if (vendorResponse.ok) {
          const vendorData = await vendorResponse.json();
          console.log("🔍 [DEBUG] /vendors/me response data:", vendorData);
          
          // Try different possible paths for vendor ID
          finalVendorId = vendorData.vendor?.id || vendorData.id || null;
          console.log("🔍 [DEBUG] Extracted vendor ID:", finalVendorId);
          
          if (finalVendorId) {
            setVendorId(finalVendorId);
          } else {
            console.log("❌ [DEBUG] No vendor ID in /vendors/me response");
            setHasPayoutAccount(false);
            setLoading(false);
            return;
          }
        } else if (vendorResponse.status === 401) {
          console.log("❌ [DEBUG] 401 Unauthorized from /vendors/me");
          setAuthError(true);
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        } else {
          console.log("❌ [DEBUG] /vendors/me failed with status:", vendorResponse.status);
          setHasPayoutAccount(false);
          setLoading(false);
          return;
        }
      } catch (vendorError) {
        console.log("❌ [DEBUG] /vendors/me error:", vendorError);
        setHasPayoutAccount(false);
        setLoading(false);
        return;
      }
      
      if (!finalVendorId) {
        console.log("❌ [DEBUG] No vendor ID available");
        setHasPayoutAccount(false);
        setLoading(false);
        return;
      }
      
      // Now fetch the payout using the correct vendor ID
      const payoutUrl = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/${finalVendorId}/payout`;
      console.log("🔍 [DEBUG] Fetching payout from:", payoutUrl);
      
      const payoutResponse = await fetch(payoutUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("🔍 [DEBUG] Payout response status:", payoutResponse.status);
      
      if (!payoutResponse.ok) {
        if (payoutResponse.status === 401) {
          setAuthError(true);
          setError("Your session has expired. Please log in again.");
        } else if (payoutResponse.status === 404) {
          console.log("❌ [DEBUG] 404 - No payout account found");
          setHasPayoutAccount(false);
        } else {
          console.log("❌ [DEBUG] Payout fetch failed with status:", payoutResponse.status);
          setHasPayoutAccount(false);
        }
        setLoading(false);
        return;
      }

      const payoutData = await payoutResponse.json();
      console.log("🔍 [DEBUG] Payout API response:", payoutData);
      
      const payoutInfo = payoutData.payout;
      console.log("🔍 [DEBUG] Extracted payoutInfo:", payoutInfo);
      
      if (!payoutInfo) {
        console.log("❌ [DEBUG] No payoutInfo in response - showing empty state");
        setHasPayoutAccount(false);
        setLoading(false);
        return;
      }

      console.log("✅ [DEBUG] Has payout account - setting hasPayoutAccount to true");
      setHasPayoutAccount(true);

      // Now fetch payout details if we have a payout ID
      let payoutDetailsData: PayoutDetail[] = [];
      
      if (payoutInfo.id) {
        try {
          const detailsUrl = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/${finalVendorId}/payout/${payoutInfo.id}/payout-details?limit=100&offset=0`;
          console.log("🔍 [DEBUG] Fetching payout details from:", detailsUrl);
          
          const detailsResponse = await fetch(detailsUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          console.log("🔍 [DEBUG] Payout details response status:", detailsResponse.status);
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            console.log("🔍 [DEBUG] Payout details response:", detailsData);
            const transactionsArray = detailsData.payout_details?.transactions || [];
            payoutDetailsData = transactionsArray;
            console.log("🔍 [DEBUG] Extracted transactions:", payoutDetailsData.length);
            // ✅ ADD THIS CONSOLE LOG HERE 👇
            payoutDetailsData.forEach((transaction: any, index: number) => {
              console.log(`💰 [TRANSACTION ${index}]`, {
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                amountType: typeof transaction.amount,
                rawAmount: JSON.stringify(transaction.amount)
              });
            });

          }
        } catch (detailsError) {
          console.warn("⚠️ [DEBUG] Could not fetch payout details:", detailsError);
        }
      }

      // Transform the API response to match our interface
      const transformedPayout: VendorPayout = {
        id: payoutInfo.id || `payout_${Date.now()}`,
        vendor_id: payoutInfo.vendor_id || finalVendorId,
        total_earnings: payoutInfo.total_earned || 0,
        pending_amount: payoutInfo.total_pending_payout || 0,
        paid_amount: payoutInfo.total_paid || 0,
        available_for_payout: payoutInfo.current_balance || 0,
        last_payout_date: payoutInfo.last_payout_at,
        next_payout_date: payoutInfo.next_payout_date,
        created_at: payoutInfo.created_at || new Date().toISOString(),
        updated_at: payoutInfo.updated_at || new Date().toISOString(),
        status: payoutInfo.is_payout_enabled ? "active" : "inactive",
        payout_details: payoutDetailsData.map((transaction: any) => ({
          id: transaction.id || `detail_${Date.now()}_${Math.random()}`,
          type: transaction.type || "earning",
          amount: (transaction.amount || 0) / 100,
          reason: transaction.reason || "No description",
          notes: transaction.notes || undefined,
          order_id: transaction.order_id || undefined,
          order_item_id: transaction.order_item_id || undefined,
          product_id: transaction.product_id || undefined,
          created_at: transaction.created_at || new Date().toISOString(),
          status: transaction.status || "confirmed",
          reference_id: transaction.id
        }))
      };

      console.log("✅ [DEBUG] Transformed payout:", transformedPayout);
      setPayout(transformedPayout);
      setPayoutDetails(transformedPayout.payout_details);
      
    } catch (err: any) {
      console.error("❌ [DEBUG] Error fetching payout data:", err);
      setHasPayoutAccount(false);
    } finally {
      setLoading(false);
    }
  };
  
  fetchPayoutData();
}, []);
  
  // Filter and paginate data
  const filteredDetails = payoutDetails.filter(detail => {
    try {
      // Apply search filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const searchFields = [
          detail.id.toLowerCase(),
          detail.reason?.toLowerCase() || '',
          detail.order_id?.toLowerCase() || '',
          detail.notes?.toLowerCase() || ''
        ];
        
        if (!searchFields.some(field => field.includes(lowerSearch))) {
          return false;
        }
      }
      
      // Apply tab filter
      if (currentTab !== "all" && detail.type !== currentTab) {
        return false;
      }
      
      // Apply type filter
      if (typeFilter !== "all" && detail.type !== typeFilter) {
        return false;
      }
      
      // Apply date filter
      if (dateFilter || dateRangeFilter) {
        try {
          const detailDate = new Date(detail.created_at);
          
          if (isNaN(detailDate.getTime())) {
            return true;
          }
          
          detailDate.setHours(0, 0, 0, 0);
          
          if (dateFilterMode === 'single' && dateFilter) {
            const filterDate = new Date(dateFilter);
            filterDate.setHours(0, 0, 0, 0);
            
            if (detailDate.getTime() !== filterDate.getTime()) {
              return false;
            }
          } else if (dateFilterMode === 'range' && dateRangeFilter) {
            if (dateRangeFilter.from) {
              const fromDate = new Date(dateRangeFilter.from);
              fromDate.setHours(0, 0, 0, 0);
              
              if (detailDate.getTime() < fromDate.getTime()) {
                return false;
              }
            }
            
            if (dateRangeFilter.to) {
              const toDate = new Date(dateRangeFilter.to);
              toDate.setHours(23, 59, 59, 999);
              
              if (detailDate.getTime() > toDate.getTime()) {
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
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "lowest":
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    } catch (sortError) {
      return 0;
    }
  });

  // Client-side pagination
  const totalFilteredCount = filteredDetails.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDetails = filteredDetails.slice(startIndex, endIndex);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, currentTab, dateFilter, dateRangeFilter, sortOrder]);

  // Calculate status counts for tabs
  const earningCount = payoutDetails.filter(detail => detail.type === "earning").length;
  const payoutCount = payoutDetails.filter(detail => detail.type === "payout").length;
  const adjustmentCount = payoutDetails.filter(detail => detail.type === "adjustment").length;
  const refundCount = payoutDetails.filter(detail => detail.type === "refund").length;

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
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "—"
    }
  }

  // State for order and product data
  const [orderDisplayNumbers, setOrderDisplayNumbers] = useState<Map<string, number>>(new Map());
  const [productTitles, setProductTitles] = useState<Map<string, string>>(new Map());

  // Helper function to fetch order display number
  const fetchOrderDisplayNumber = async (orderId: string): Promise<number | null> => {
    if (!orderId) return null;
    
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) return null;

      if (orderDisplayNumbers.has(orderId)) {
        return orderDisplayNumbers.get(orderId)!;
      }

      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/orders/${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const orderData = await response.json();
        const displayNumber = orderData.order?.display_id || orderData.display_id || null;
        
        if (displayNumber) {
          setOrderDisplayNumbers(prev => new Map(prev.set(orderId, displayNumber)));
          return displayNumber;
        }
      }
    } catch (error) {
      // Silently fail for better UX
    }
    return null;
  };

  // Helper function to fetch product title
  const fetchProductTitle = async (productId: string): Promise<string | null> => {
    if (!productId) return null;
    
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) return null;

      if (productTitles.has(productId)) {
        return productTitles.get(productId)!;
      }

      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products/${productId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const productData = await response.json();
        const title = productData.product?.title || productData.title || null;
        
        if (title) {
          setProductTitles(prev => new Map(prev.set(productId, title)));
          return title;
        }
      }
    } catch (error) {
      // Silently fail for better UX
    }
    return null;
  };

  // Load order and product data when payout details are available
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (payoutDetails.length === 0) return;

      const uniqueOrderIds = [...new Set(payoutDetails.map(d => d.order_id).filter(Boolean))];
      const uniqueProductIds = [...new Set(payoutDetails.map(d => d.product_id).filter(Boolean))];

      // Fetch order display numbers
      for (const orderId of uniqueOrderIds) {
        await fetchOrderDisplayNumber(orderId);
      }

      // Fetch product titles  
      for (const productId of uniqueProductIds) {
        await fetchProductTitle(productId);
      }
    };

    loadAdditionalData();
  }, [payoutDetails]);

  // Helper function to truncate long IDs for technical reference
  const truncateId = (id: string, maxLength: number = 20) => {
    if (!id || id.length <= maxLength) return id;
    const start = id.substring(0, 8);
    const end = id.substring(id.length - 8);
    return `${start}...${end}`;
  };

  // Helper function to format order reference more professionally
  const formatOrderReference = (orderId: string): string => {
    if (!orderId) return "";
    
    const displayNumber = orderDisplayNumbers.get(orderId);
    if (displayNumber) {
      return `Order #${displayNumber}`;
    }
    
    const orderPart = orderId.replace('order_', '').substring(0, 8).toUpperCase();
    return `Order #${orderPart}`;
  };

  // Helper function to get product display name
  const getProductDisplayName = (productId: string): string => {
    if (!productId) return "";
    
    const productTitle = productTitles.get(productId);
    if (productTitle) {
      return productTitle.length > 30 ? `${productTitle.substring(0, 27)}...` : productTitle;
    }
    
    return truncateId(productId, 16);
  };

  // Enhanced function to get professional transaction display text
  const getTransactionDisplayText = (detail: PayoutDetail) => {
    const orderRef = detail.order_id ? formatOrderReference(detail.order_id) : '';
    const productName = detail.product_id ? getProductDisplayName(detail.product_id) : '';
    
    switch (detail.type) {
      case 'earning':
        if (orderRef && productName && productTitles.has(detail.product_id!)) {
          return `${orderRef} - ${productName}`;
        } else if (orderRef) {
          return `Commission from ${orderRef}`;
        }
        return 'Product Commission';
        
      case 'payout':
        return 'Payout Transfer';
        
      case 'adjustment':
        if (orderRef) {
          return `Adjustment for ${orderRef}`;
        }
        return 'Account Adjustment';
        
      case 'refund':
        if (orderRef) {
          return `Refund for ${orderRef}`;
        }
        return 'Refund Processing';
        
      default:
        return detail.reason || 'Transaction';
    }
  };

  const viewOrderDetails = (orderId: string) => {
    if (orderId) {
      window.open(`/orders/${orderId}`, '_blank');
    }
  };

  // Handle transaction details view
  const viewTransactionDetails = (transaction: PayoutDetail) => {
    setSelectedTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleRequestPayout = () => {
    // Re-fetch all payout data after successful payout request
    // You can add the refresh logic here similar to the useEffect
    window.location.reload(); // Simple approach for now
  };

  const exportPayoutDetailsToExcel = () => {
    try {
      const exportData = filteredDetails.map(detail => ({
        'Transaction ID': detail.id,
        'Date': formatDate(detail.created_at),
        'Type': detail.type.charAt(0).toUpperCase() + detail.type.slice(1),
        'Amount': `₹${Math.abs(detail.amount).toFixed(2)}`,
        'Amount Type': detail.amount >= 0 ? 'Credit' : 'Debit',
        'Reason': getTransactionDisplayText(detail),
        'Order ID': detail.order_id || 'N/A',
        'Product ID': detail.product_id || 'N/A', 
        'Order Item ID': detail.order_item_id || 'N/A',
        'Status': detail.status || 'N/A',
        'Notes': detail.notes || 'N/A',
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 30 },
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payout Details');
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let filename = `payout-details-export-${dateStr}`;
      
      if (dateRangeFilter?.from && dateRangeFilter?.to) {
        const fromDate = dateRangeFilter.from.toISOString().split('T')[0];
        const toDate = dateRangeFilter.to.toISOString().split('T')[0];
        filename = `payout-details-${fromDate}-to-${toDate}`;
      } else if (dateRangeFilter?.from) {
        const fromDate = dateRangeFilter.from.toISOString().split('T')[0];
        filename = `payout-details-from-${fromDate}`;
      }
      
      if (currentTab !== 'all') {
        filename += `-${currentTab}`;
      }
      if (searchTerm) {
        filename += `-filtered`;
      }
      
      filename += '.xlsx';
      
      XLSX.writeFile(workbook, filename);
      
    } catch (error) {
      alert('Error exporting payout details. Please try again.');
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
              {/* <h1 className="ml-2 text-base font-semibold" style={{ color: BRAND.secondary }}>
                Junooni Creator Dashboard
              </h1> */}
              <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
              {/* <Separator orientation='vertical' className='h-6 ml-2' /> */}
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
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden md:flex">
                  Dashboard
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost" className="hidden md:flex">
                  Products
                </Button>
              </Link>
              <Link to="/payouts">
                <Button variant="ghost" className="hidden md:flex" style={{ color: BRAND.primary }}>
                  Payouts
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="ghost" className="hidden md:flex">
                  Orders
                </Button>
              </Link>
              <ProfileDropdown />
              {/* <Button variant="ghost" className="hidden md:flex">Analytics</Button> */}
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
        <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-lg font-bold" style={{ color: BRAND.secondary }}>Your Payouts</h1>
            <p className="text-sm text-muted-foreground">Track your earnings and request payouts</p>
          </div>
          
          {!loading && payout && hasPayoutAccount && (
            <RequestPayoutDialog
              availableAmount={payout.available_for_payout}
              onRequestPayout={handleRequestPayout}
              vendorId={vendorId}
            />
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: BRAND.primary }} />
              <p className="text-gray-600">Loading payout data...</p>
            </div>
          </div>
        ) : !hasPayoutAccount ? (
          <EmptyPayoutState />
        ) : (
          <>
            <PayoutSummaryCards data={payout} />
            
            {/* Transaction type tab filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button 
                variant={currentTab === "all" ? "default" : "outline"} 
                onClick={() => setCurrentTab("all")}
                className={currentTab === "all" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : ""}
              >
                All Transactions
                <Badge variant="secondary" className="ml-2 text-gray-800 bg-gray-100">
                  {payoutDetails.length}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "earning" ? "default" : "outline"} 
                onClick={() => setCurrentTab("earning")}
                className={currentTab === "earning" ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-200" : ""}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Earnings
                <Badge variant="secondary" className="ml-2 text-green-800 bg-green-50">
                  {earningCount}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "payout" ? "default" : "outline"} 
                onClick={() => setCurrentTab("payout")}
                className={currentTab === "payout" ? "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200" : ""}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Payouts
                <Badge variant="secondary" className="ml-2 text-blue-800 bg-blue-50">
                  {payoutCount}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "adjustment" ? "default" : "outline"} 
                onClick={() => setCurrentTab("adjustment")}
                className={currentTab === "adjustment" ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200" : ""}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Adjustments
                <Badge variant="secondary" className="ml-2 text-amber-800 bg-amber-50">
                  {adjustmentCount}
                </Badge>
              </Button>
              
              <Button 
                variant={currentTab === "refund" ? "default" : "outline"} 
                onClick={() => setCurrentTab("refund")}
                className={currentTab === "refund" ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-200" : ""}
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Refunds
                <Badge variant="secondary" className="ml-2 text-red-800 bg-red-50">
                  {refundCount}
                </Badge>
              </Button>
            </div>
            
            {/* Search and filters */}
            <div className="flex flex-col gap-3 mb-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, reason, or order ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-3 md:flex-nowrap">
                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-48 justify-start text-left font-normal ${
                          dateRangeFilter ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {dateRangeFilter?.from ? (
                          dateRangeFilter.to ? (
                            `${dateRangeFilter.from.toLocaleDateString()} - ${dateRangeFilter.to.toLocaleDateString()}`
                          ) : (
                            dateRangeFilter.from.toLocaleDateString()
                          )
                        ) : (
                          "Select date range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-medium leading-none">Quick Filters</h4>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                setDateRangeFilter({ from: today, to: today });
                                setDateFilter(undefined);
                                setDateFilterMode('range');
                              }}
                            >
                              Today
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const lastWeek = new Date(today);
                                lastWeek.setDate(today.getDate() - 7);
                                setDateRangeFilter({ from: lastWeek, to: today });
                                setDateFilter(undefined);
                                setDateFilterMode('range');
                              }}
                            >
                              Last 7 days
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const lastMonth = new Date(today);
                                lastMonth.setDate(today.getDate() - 30);
                                setDateRangeFilter({ from: lastMonth, to: today });
                                setDateFilter(undefined);
                                setDateFilterMode('range');
                              }}
                            >
                              Last 30 days
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const lastQuarter = new Date(today);
                                lastQuarter.setDate(today.getDate() - 90);
                                setDateRangeFilter({ from: lastQuarter, to: today });
                                setDateFilter(undefined);
                                setDateFilterMode('range');
                              }}
                            >
                              Last 90 days
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h4 className="mb-3 font-medium leading-none">Custom Range</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">From Date</label>
                              <Input
                                type="date"
                                value={dateRangeFilter?.from ? dateRangeFilter.from.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                  setDateRangeFilter(prev => ({ ...prev, from: newDate }));
                                  setDateFilter(undefined);
                                  setDateFilterMode('range');
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">To Date</label>
                              <Input
                                type="date"
                                value={dateRangeFilter?.to ? dateRangeFilter.to.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                  setDateRangeFilter(prev => ({ ...prev, to: newDate }));
                                  setDateFilter(undefined);
                                  setDateFilterMode('range');
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDateRangeFilter(undefined);
                              setDateFilter(undefined);
                            }}
                          >
                            Clear Filter
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Select 
                  value={typeFilter} 
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger className="w-32 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Type</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="earning">Earnings</SelectItem>
                    <SelectItem value="payout">Payouts</SelectItem>
                    <SelectItem value="adjustment">Adjustments</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
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
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Payout details card */}
            <Card className="mb-6 shadow-xl">
              <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                      <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold" style={{ color: BRAND.secondary }}>
                        Transaction History
                      </CardTitle>
                      <CardDescription className="text-sm" style={{ color: BRAND.textSecondary }}>
                        Showing {filteredDetails.length} of {payoutDetails.length} transactions
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="hidden md:flex"
                      disabled={paginatedDetails.length === 0}
                      onClick={exportPayoutDetailsToExcel}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export ({filteredDetails.length} records)
                    </Button>
                  </div>
                </div>
              </CardHeader>
          
              <CardContent className="p-0">
                {filteredDetails.length === 0 ? (
                  <div className="py-12 text-center">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-1 text-lg font-medium text-gray-500">No transactions found</h3>
                    <p className="mb-4 text-gray-400">
                      {searchTerm || typeFilter !== "all" || dateFilter ? 
                        "Try adjusting your filters" : 
                        "No payout transactions yet"}
                    </p>
                   {(searchTerm || typeFilter !== "all" || dateFilter || dateRangeFilter) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setTypeFilter("all");
                        setDateFilter(undefined);
                        setDateRangeFilter(undefined);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedDetails.map((detail) => (
                      <Card key={detail.id} className="p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <PayoutTypeBadge type={detail.type} />
                              <Badge 
                                variant="outline" 
                                className={
                                  detail.status === 'completed' || detail.status === 'confirmed' ? 
                                  'text-green-700 bg-green-50 border-green-200' :
                                  detail.status === 'pending' || detail.status === 'processing' ?
                                  'text-amber-700 bg-amber-50 border-amber-200' :
                                  'text-gray-700 bg-gray-50 border-gray-200'
                                }
                              >
                                {detail.status || 'Unknown'}
                              </Badge>
                            </div>
                            
                            <div className="mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {getTransactionDisplayText(detail)}
                              </h4>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatDate(detail.created_at)}
                                {detail.order_id && (
                                  <span className="ml-2">• 
                                    <Button 
                                      variant="link" 
                                      className="h-auto p-0 ml-1 text-xs font-medium"
                                      style={{ color: BRAND.primary }}
                                      onClick={() => viewOrderDetails(detail.order_id)}
                                      title={`View Order: ${detail.order_id}`}
                                    >
                                      {formatOrderReference(detail.order_id)}
                                    </Button>
                                  </span>
                                )}
                                {detail.product_id && (
                                  <span className="ml-2 text-xs text-gray-600">
                                    • {productTitles.has(detail.product_id) ? getProductDisplayName(detail.product_id) : `Product: ${truncateId(detail.product_id, 16)}`}
                                  </span>
                                )}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500" title={`Full Transaction ID: ${detail.id}`}>
                                ID: {truncateId(detail.id)}
                              </span>
                              <span className={`text-sm font-bold ${
                                detail.amount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {detail.amount >= 0 ? '+' : ''}{formatPrice(detail.amount)}
                              </span>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 ml-4">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewTransactionDetails(detail)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View details
                              </DropdownMenuItem>
                              {detail.order_id && (
                                <DropdownMenuItem onClick={() => viewOrderDetails(detail.order_id)}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View order
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                const receiptText = `
                                  PAYOUT TRANSACTION RECEIPT
                                  ==========================

                                  Transaction ID: ${detail.id}
                                  Date: ${formatDate(detail.created_at)}
                                  Type: ${detail.type.charAt(0).toUpperCase() + detail.type.slice(1)}
                                  Amount: ${formatPrice(detail.amount)}
                                  Status: ${detail.status}
                                  ${detail.order_id ? `Order ID: ${detail.order_id}` : ''}
                                  ${detail.reason ? `Reason: ${detail.reason}` : ''}

                                  Thank you for using Junooni!
                                                                  `;
                                
                                const blob = new Blob([receiptText], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `receipt-${detail.id}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {paginatedDetails.length > 0 && totalFilteredCount > limit && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(endIndex, totalFilteredCount)}</span> of{" "}
                      <span className="font-medium">{totalFilteredCount}</span> transactions
                      {totalFilteredCount !== payoutDetails.length && ` (filtered from ${payoutDetails.length} total)`}
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
                      
                      {Array.from({ length: Math.min(Math.ceil(totalFilteredCount / limit), 5) }, (_, index) => {
                        const pageNumber = index + 1;
                        const totalPages = Math.ceil(totalFilteredCount / limit);
                        
                        let showPage = false;
                        if (totalPages <= 5) {
                          showPage = true;
                        } else if (page <= 3) {
                          showPage = pageNumber <= 5;
                        } else if (page >= totalPages - 2) {
                          showPage = pageNumber > totalPages - 5;
                        } else {
                          showPage = Math.abs(pageNumber - page) <= 2;
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={page === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNumber)}
                            style={page === pageNumber ? { 
                              backgroundColor: BRAND.primary,
                              color: 'white' 
                            } : {}}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(totalFilteredCount / limit)))}
                        disabled={page >= Math.ceil(totalFilteredCount / limit)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Payout Distribution Charts */}
            {payoutDetails.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-7">
                <Card className="shadow-md md:col-span-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Transaction Distribution</CardTitle>
                    <CardDescription>Breakdown by transaction type</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Earnings */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Earnings</span>
                          </div>
                          <span className="text-sm">{earningCount} transactions</span>
                        </div>
                        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(earningCount / Math.max(payoutDetails.length, 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Payouts */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Payouts</span>
                          </div>
                          <span className="text-sm">{payoutCount} transactions</span>
                        </div>
                        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(payoutCount / Math.max(payoutDetails.length, 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Adjustments */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 mr-2 rounded-full bg-amber-500"></div>
                            <span className="text-sm">Adjustments</span>
                          </div>
                          <span className="text-sm">{adjustmentCount} transactions</span>
                        </div>
                        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                          <div 
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${(adjustmentCount / Math.max(payoutDetails.length, 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Refunds */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Refunds</span>
                          </div>
                          <span className="text-sm">{refundCount} transactions</span>
                        </div>
                        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(refundCount / Math.max(payoutDetails.length, 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Transactions */}
                <Card className="shadow-md md:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                    <CardDescription>Latest payout activities</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {filteredDetails.slice(0, 4).map((detail) => (
                        <div key={detail.id} className="flex items-start space-x-3">
                          <div className={`p-1.5 rounded-full ${
                            detail.type === 'earning' ? 'bg-green-100' :
                            detail.type === 'payout' ? 'bg-blue-100' :
                            detail.type === 'adjustment' ? 'bg-amber-100' :
                            'bg-red-100'
                          }`}>
                            {detail.type === 'earning' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                             detail.type === 'payout' ? <Wallet className="w-4 h-4 text-blue-600" /> :
                             detail.type === 'adjustment' ? <RefreshCw className="w-4 h-4 text-amber-600" /> :
                             <ArrowDownRight className="w-4 h-4 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {detail.reason || 'Transaction'}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(detail.created_at)}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <PayoutTypeBadge type={detail.type} />
                              <p className={`text-xs font-medium ${
                                detail.amount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {detail.amount >= 0 ? '+' : ''}{formatPrice(detail.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredDetails.length === 0 && (
                        <div className="py-8 text-center text-gray-500">
                          No recent transactions found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Transaction Details Modal */}
      {/* Transaction Details Modal */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-lg shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` 
                }}
              >
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: BRAND.secondary }}>Transaction Details</h2>
                <p className="text-sm font-normal text-gray-500">Complete transaction information</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-5">
              {/* TDS Information Banner - Only show for earnings */}
              {selectedTransaction.type === 'earning' && (
                <div className="p-4 border-l-4 rounded-lg bg-orange-50" style={{ borderLeftColor: BRAND.primary }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Info className="w-5 h-5" style={{ color: BRAND.primary }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-2 text-sm font-semibold text-gray-900">Tax Deduction at Source (TDS)</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        The amount displayed below is the <span className="font-semibold">net earning after deducting 1% TDS</span> as per Indian Income Tax regulations.
                      </p>
                      {/* <div className="flex items-center gap-2 p-2 mt-2 rounded-md bg-blue-100/50">
                        <Receipt className="w-4 h-4 text-blue-700" />
                        <span className="text-xs text-blue-800">
                          TDS certificates will be provided during tax filing season
                        </span>
                      </div> */}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Header Card */}
              <div className="overflow-hidden border rounded-lg shadow-sm">
                <div className="p-4" style={{ background: `linear-gradient(to right, ${BRAND.background}33, white)` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <PayoutTypeBadge type={selectedTransaction.type} />
                        <Badge 
                          variant="outline" 
                          className={
                            selectedTransaction.status === 'completed' || selectedTransaction.status === 'confirmed' ? 
                            'text-green-700 bg-green-50 border-green-200 font-medium' :
                            selectedTransaction.status === 'pending' || selectedTransaction.status === 'processing' ?
                            'text-amber-700 bg-amber-50 border-amber-200 font-medium' :
                            'text-gray-700 bg-gray-50 border-gray-200 font-medium'
                          }
                        >
                          <CircleCheck className="w-3 h-3 mr-1" />
                          {selectedTransaction.status || 'Unknown'}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {getTransactionDisplayText(selectedTransaction)}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(selectedTransaction.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {selectedTransaction.type === 'earning' ? 'Net Amount' : 'Amount'}
                      </p>
                      <div className={`text-3xl font-bold ${
                        selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.amount >= 0 ? '+' : ''}{formatPrice(selectedTransaction.amount)}
                      </div>
                      {selectedTransaction.type === 'earning' && (
                        <p className="mt-1 text-xs text-gray-500">After 1% TDS</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Information */}
              {/* {(selectedTransaction.order_id || selectedTransaction.product_id || selectedTransaction.order_item_id) && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Related Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedTransaction.order_id && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Order</p>
                            <p className="text-xs text-gray-500">{selectedTransaction.order_id}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewOrderDetails(selectedTransaction.order_id)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Order
                        </Button>
                      </div>
                    )}

                    {selectedTransaction.product_id && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Product</p>
                            <p className="text-xs text-gray-500">{selectedTransaction.product_id}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTransaction.order_item_id && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Order Item</p>
                            <p className="text-xs text-gray-500">{selectedTransaction.order_item_id}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )} */}

              {/* Additional Notes */}
              {selectedTransaction.notes && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-900">Notes</label>
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-900">{selectedTransaction.notes}</p>
                  </div>
                </div>
              )}

              {/* Reason */}
              {/* {selectedTransaction.reason && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-900">Reason</label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-700">{selectedTransaction.reason}</p>
                  </div>
                </div>
              )} */}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {selectedTransaction?.order_id && (
                <Button 
                  variant="outline"
                  onClick={() => viewOrderDetails(selectedTransaction.order_id)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Order
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedTransaction) {
                    const receiptText = `
                      PAYOUT TRANSACTION RECEIPT
                      ==========================

                      Transaction ID: ${selectedTransaction.id}
                      Date: ${formatDate(selectedTransaction.created_at)}
                      Type: ${selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                      Amount: ${formatPrice(selectedTransaction.amount)}
                      Status: ${selectedTransaction.status}
                      ${selectedTransaction.order_id ? `Order ID: ${selectedTransaction.order_id}` : ''}
                      ${selectedTransaction.product_id ? `Product ID: ${selectedTransaction.product_id}` : ''}
                      ${selectedTransaction.order_item_id ? `Order Item ID: ${selectedTransaction.order_item_id}` : ''}
                      ${selectedTransaction.reason ? `Reason: ${selectedTransaction.reason}` : ''}
                      ${selectedTransaction.notes ? `Notes: ${selectedTransaction.notes}` : ''}

                      Thank you for using Junooni!
                      Contact support: support@junooni.com
                    `;
                    
                    const blob = new Blob([receiptText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `receipt-${selectedTransaction.id}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
            <Button onClick={() => setTransactionModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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
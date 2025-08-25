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
  BarChart,
  AlertCircle,
  CheckCircle2,
  User,
  Building,
  Banknote,
  FileText,
  Loader2,
  TrendingUp,
  Eye,
  Truck,
  Info
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
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Enhanced interfaces matching the orders page structure
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
}

interface VendorOrder {
  id: string
  display_id: number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  created_at: string
  
  // Vendor-specific totals
  vendor_total: number
  vendor_subtotal: number
  vendor_shipping_total: number
  vendor_tax_total: number
  
  // Vendor-specific items
  vendor_items: VendorOrderItem[]
  
  payment_status: string
  fulfillment_status: string
  currency_code: string
  
  // Vendor information
  vendor_id: string
  vendor_handle: string
  vendor_payment_amount: number
  
  // Additional fields
  shipping_address?: any
  billing_address?: any
  is_vendor_filtered?: boolean
  
  // Claims and returns from backend
  claims?: any[]
  returns?: any[]
  claim_items?: any[]
  return_items?: any[]
  has_claims?: boolean
  has_returns?: boolean
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
  handle?: string;
  variants?: any[];
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

// Interface for onboarding completion status
interface OnboardingStatus {
  isComplete: boolean;
  completedSteps: string[];
  missingSteps: string[];
  completionPercentage: number;
  stepDetails: {
    [stepName: string]: {
      isComplete: boolean;
      missingFields: string[];
      requiredFields: string[];
    };
  };
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

// Payment badge component with icons
const PaymentBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "captured":
      case "paid":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium text-xs px-2 py-0.5",
          icon: <CreditCard className="w-3 h-3 mr-1" />
        };
      case "awaiting":
      case "pending":
      case "requires_action":
        return { 
          variant: "outline" as const, 
          className: "text-amber-700 bg-amber-50 border-amber-200 font-medium text-xs px-2 py-0.5",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "failed":
      case "canceled":
      case "not_paid":
        return { 
          variant: "outline" as const, 
          className: "text-red-700 bg-red-50 border-red-200 font-medium text-xs px-2 py-0.5",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      case "refunded":
        return { 
          variant: "outline" as const, 
          className: "text-blue-700 bg-blue-50 border-blue-200 font-medium text-xs px-2 py-0.5",
          icon: <RefreshCw className="w-3 h-3 mr-1" />
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

// Format date
const formatDate = (dateString: string) => {
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
};

// Helper function to check if vendor exists based on response structure
const checkVendorExists = (vendorData: any) => {
  console.log("Checking vendor existence with data:", JSON.stringify(vendorData, null, 2));
  
  if (!vendorData) {
    console.log("No vendor data received");
    return false;
  }
  
  if (vendorData.vendor) {
    if (vendorData.vendor.id) {
      console.log("Vendor exists with ID:", vendorData.vendor.id);
      return true;
    }
    console.log("Vendor object exists but no ID");
    return false;
  }
  
  if (vendorData.id) {
    console.log("Vendor exists with direct ID:", vendorData.id);
    return true;
  }
  
  const hasData = Object.keys(vendorData).length > 0 && 
                  !isEmptyResponse(vendorData);
  
  console.log("Vendor existence based on data presence:", hasData);
  return hasData;
};

// Check onboarding completion status with detailed field tracking
const checkOnboardingCompletion = (vendorData: any): OnboardingStatus => {
  console.log("Checking onboarding completion for vendor data:", vendorData);
  
  if (!vendorData || !vendorData.vendor) {
    return {
      isComplete: false,
      completedSteps: [],
      missingSteps: ['basic-info', 'business-details', 'banking-info', 'creator-profile'],
      completionPercentage: 0,
      stepDetails: {
        'basic-info': {
          isComplete: false,
          missingFields: ['Store Name', 'Handle', 'Phone Number', 'First Name', 'Last Name'],
          requiredFields: ['Store Name', 'Handle', 'Phone Number', 'First Name', 'Last Name']
        },
        'business-details': {
          isComplete: false,
          missingFields: ['GSTIN', 'Company Name', 'PAN Number'],
          requiredFields: ['GSTIN', 'Company Name', 'PAN Number']
        },
        'banking-info': {
          isComplete: false,
          missingFields: ['Account Holder Name', 'Account Number', 'IFSC Code'],
          requiredFields: ['Account Holder Name', 'Account Number', 'IFSC Code']
        },
        'creator-profile': {
          isComplete: false,
          missingFields: ['Creator Bio', 'Creator Title', 'Creator Category'],
          requiredFields: ['Creator Bio', 'Creator Title', 'Creator Category']
        }
      }
    };
  }

  const vendor = vendorData.vendor;
  const completedSteps: string[] = [];
  const missingSteps: string[] = [];
  const stepDetails: { [stepName: string]: { isComplete: boolean; missingFields: string[]; requiredFields: string[] } } = {};

  // Check Basic Information (required fields)
  const basicInfoFields = {
    'Store Name': vendor.name,
    'Handle': vendor.handle,
    'Phone Number': vendor.phonenumber,
    'First Name': vendor.admins?.[0]?.first_name || vendor.admin?.[0]?.first_name,
    'Last Name': vendor.admins?.[0]?.last_name || vendor.admin?.[0]?.last_name
  };
  
  const missingBasicFields = Object.entries(basicInfoFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const hasBasicInfo = missingBasicFields.length === 0;
  stepDetails['basic-info'] = {
    isComplete: hasBasicInfo,
    missingFields: missingBasicFields,
    requiredFields: Object.keys(basicInfoFields)
  };
  
  if (hasBasicInfo) {
    completedSteps.push('basic-info');
  } else {
    missingSteps.push('basic-info');
  }

  // Check Business Details (optional but recommended)
  const businessDetailFields = {
    'GSTIN': vendor.GSTIN,
    'Company Name': vendor.companyname,
    'PAN Number': vendor.pan_number
  };
  
  const missingBusinessFields = Object.entries(businessDetailFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const hasBusinessDetails = missingBusinessFields.length < Object.keys(businessDetailFields).length;
  stepDetails['business-details'] = {
    isComplete: hasBusinessDetails,
    missingFields: missingBusinessFields,
    requiredFields: Object.keys(businessDetailFields)
  };
  
  if (hasBusinessDetails) {
    completedSteps.push('business-details');
  } else {
    missingSteps.push('business-details');
  }

  // Check Banking Information (required for payments)
  const bankingFields = {
    'Account Holder Name': vendor.bank_account_holder_name,
    'Account Number': vendor.bank_account_number,
    'IFSC Code': vendor.bank_account_ifsc_code,
    'Bank Name': vendor.bank_name,
    'City': vendor.city,
    'Pincode': vendor.pincode,
    'State': vendor.state,
    'Address': vendor.address,
  };
  
  const missingBankingFields = Object.entries(bankingFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const hasBankingInfo = missingBankingFields.length === 0;
  stepDetails['banking-info'] = {
    isComplete: hasBankingInfo,
    missingFields: missingBankingFields,
    requiredFields: Object.keys(bankingFields)
  };
  
  if (hasBankingInfo) {
    completedSteps.push('banking-info');
  } else {
    missingSteps.push('banking-info');
  }

  // Check Creator Profile (optional but recommended)
  const creatorProfileFields = {
    'Creator Bio': vendor.creator_bio,
    'Creator Title': vendor.creator_title,
    'Creator Category': vendor.creator_category
  };
  
  const missingCreatorFields = Object.entries(creatorProfileFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const hasCreatorProfile = missingCreatorFields.length === 0;
  stepDetails['creator-profile'] = {
    isComplete: hasCreatorProfile,
    missingFields: missingCreatorFields,
    requiredFields: Object.keys(creatorProfileFields)
  };
  
  if (hasCreatorProfile) {
    completedSteps.push('creator-profile');
  } else {
    missingSteps.push('creator-profile');
  }

  // Calculate completion percentage
  const totalSteps = 4; // basic-info, business-details, banking-info, creator-profile
  const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);

  // Consider onboarding complete if basic info and banking info are done (minimum requirements)
  const isComplete = hasBasicInfo && hasBankingInfo;

  console.log("Onboarding status:", {
    isComplete,
    completedSteps,
    missingSteps,
    completionPercentage,
    stepDetails
  });

  return {
    isComplete,
    completedSteps,
    missingSteps,
    completionPercentage,
    stepDetails
  };
};

// Onboarding Progress Banner
const OnboardingProgressBanner = ({ onboardingStatus, vendorName }: { 
  onboardingStatus: OnboardingStatus, 
  vendorName: string 
}) => {
  const navigate = useNavigate();

  if (onboardingStatus.isComplete) {
    return null;
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'basic-info':
        return <User className="w-4 h-4" />;
      case 'business-details':
        return <Building className="w-4 h-4" />;
      case 'banking-info':
        return <Banknote className="w-4 h-4" />;
      case 'creator-profile':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStepName = (step: string) => {
    switch (step) {
      case 'basic-info':
        return 'Basic Information';
      case 'business-details':
        return 'Business Details';
      case 'banking-info':
        return 'Banking Information';
      case 'creator-profile':
        return 'Creator Profile';
      default:
        return step;
    }
  };

  const getStepPriority = (step: string) => {
    return step === 'basic-info' || step === 'banking-info' ? 'Required' : 'Recommended';
  };

  const getStepPriorityColor = (step: string) => {
    return step === 'basic-info' || step === 'banking-info' ? 'text-red-600' : 'text-amber-600';
  };

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertCircle className="w-4 h-4 text-amber-600" />
      <AlertDescription>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">
                Complete Your Onboarding ({onboardingStatus.completionPercentage}% Complete)
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Hi {vendorName.split(' ')[0]}! You're almost ready to start selling. Complete the remaining steps to unlock all features.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-white rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${onboardingStatus.completionPercentage}%`,
                      backgroundColor: BRAND.primary
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-amber-700">
                  {onboardingStatus.completionPercentage}%
                </span>
              </div>
              
              <Button
                size="sm"
                onClick={() => navigate({ to: '/onboarding' })}
                style={{ backgroundColor: BRAND.primary }}
                className="whitespace-nowrap"
              >
                Complete Onboarding
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Detailed missing steps with specific fields */}
          <div className="pt-2 space-y-3 border-t border-amber-200">
            {onboardingStatus.missingSteps.slice(0, 2).map((step) => {
              const stepDetail = onboardingStatus.stepDetails[step];
              if (!stepDetail) return null;
              
              return (
                <div key={step} className="p-3 bg-white border rounded-lg border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step)}
                      <span className="font-medium text-amber-800">{getStepName(step)}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStepPriorityColor(step)} border-current`}
                      >
                        {getStepPriority(step)}
                      </Badge>
                    </div>
                    <span className="text-xs text-amber-600">
                      {stepDetail.missingFields.length} of {stepDetail.requiredFields.length} missing
                    </span>
                  </div>
                  
                  {/* Show missing fields */}
                  <div className="flex flex-wrap gap-1">
                    {stepDetail.missingFields.slice(0, 3).map((field, index) => (
                      <span 
                        key={field}
                        className="inline-flex items-center px-2 py-1 text-xs text-red-700 border border-red-200 rounded-md bg-red-50"
                      >
                        {field}
                      </span>
                    ))}
                    {stepDetail.missingFields.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded-md bg-gray-50">
                        +{stepDetail.missingFields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {onboardingStatus.missingSteps.length > 2 && (
              <div className="p-2 text-center bg-white border rounded-lg border-amber-200">
                <span className="text-sm text-amber-700">
                  +{onboardingStatus.missingSteps.length - 2} more steps to complete
                </span>
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Helper function to detect empty responses
const isEmptyResponse = (data: any) => {
  if (data === null || data === undefined) return true;
  
  if (typeof data === 'object' && Object.keys(data).length === 0) return true;
  
  if (typeof data === 'object') {
    const values = Object.values(data);
    if (values.length === 0) return true;
    if (values.every(val => val === null || val === undefined || val === '')) return true;
  }
  
  return false;
};

// Enhanced Summary Cards Component using vendor-specific data
const SummaryCards = ({ orders, products }: { orders: VendorOrder[], products: Product[] }) => {
  // Calculate summary metrics from vendor-filtered orders
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.vendor_total || 0), 0);
  
  const pendingOrders = orders.filter(order => 
    order.fulfillment_status === "not_fulfilled" || 
    order.fulfillment_status === "pending"
  ).length;
  
  const processingOrders = orders.filter(order => 
    order.fulfillment_status === "processing" || 
    order.fulfillment_status === "partially_fulfilled"
  ).length;
  
  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.vendor_total || 0), 0);
  
  return (
    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Revenue */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Today's Revenue</p>
              <h3 className="text-lg font-bold" style={{ color: BRAND.primary }}>{formatPrice(todayRevenue)}</h3>
              <p className="mt-1 text-sm text-gray-500">{todayOrders.length} orders today</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND.primary}22` }}>
              <TrendingUp className="w-6 h-6" style={{ color: BRAND.primary }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Revenue */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-lg font-bold">{formatPrice(totalRevenue)}</h3>
              <p className="mt-1 text-sm text-gray-500">From {totalOrders} orders</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Orders */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Pending Orders</p>
              <h3 className="text-lg font-bold">{pendingOrders}</h3>
              <p className="mt-1 text-sm text-gray-500">Need attention</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Your Products</p>
              <h3 className="text-lg font-bold">{products.length}</h3>
              <p className="mt-1 text-sm text-gray-500">Listed in store</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greetingTime, setGreetingTime] = useState<string>("");
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();
  const [showGSTVerificationMessage, setShowGSTVerificationMessage] = useState(false);
  const popupButtonsRef = useRef<ProductsPrimaryButtonsHandle>(null);
  
  // Onboarding status
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    isComplete: true,
    completedSteps: [],
    missingSteps: [],
    completionPercentage: 100,
    stepDetails: {}
  });

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime("Morning");
    else if (hour < 17) setGreetingTime("Afternoon");
    else setGreetingTime("Evening");
  }, []);
  
  // Enhanced order transformation with better error handling
  const transformVendorOrders = (orderData: any) => {
    if (!orderData) {
      console.warn("No order data received");
      return [];
    }

    const ordersArray = orderData.orders || orderData.data || (Array.isArray(orderData) ? orderData : []);
    console.log("📋 Orders array:", ordersArray);
    
    if (!Array.isArray(ordersArray)) {
      console.error("❌ Expected orders array, got:", typeof ordersArray);
      return [];
    }

    return ordersArray.map((order: any, index: number) => {
      try {
        console.log(`🔄 Transforming order ${index}:`, order);
        
        // Get display_id with better extraction
        let display_id = 0;
        if (order.display_id !== undefined && order.display_id !== null) {
          display_id = parseInt(String(order.display_id)) || 0;
        } else {
          const numbers = order.id?.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            display_id = parseInt(numbers[numbers.length - 1]) || 0;
          }
        }

        if (display_id === 0) {
          display_id = index + 1;
        }

        // Safer customer data extraction
        const customer = {
          first_name: order.customer?.first_name || order.billing_address?.first_name || "Guest",
          last_name: order.customer?.last_name || order.billing_address?.last_name || "",
          email: order.customer?.email || order.email || "customer@example.com",
          phone: order.customer?.phone || order.billing_address?.phone || order.shipping_address?.phone || undefined
        };
        
        // Safer date handling
        let created_at = new Date().toISOString();
        if (order.created_at) {
          created_at = order.created_at;
        } else if (order.vendor_items?.[0]?.created_at) {
          created_at = order.vendor_items[0].created_at;
        } else if (order.vendor_items?.[0]?.detail?.created_at) {
          created_at = order.vendor_items[0].detail.created_at;
        }
        
        // Safer numeric value extraction
        const safeNumber = (value: any, defaultValue: number = 0): number => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string') return parseFloat(value) || defaultValue;
          if (value?.value !== undefined) return parseFloat(value.value) || defaultValue;
          return defaultValue;
        };
        
        // Enhanced vendor items transformation
        const vendor_items: VendorOrderItem[] = (order.vendor_items || []).map((item: any, itemIndex: number) => {
          console.log(`🔍 Processing item ${itemIndex}:`, item);
          
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
          
          return {
            id: item.id || `item_${itemIndex}`,
            title: item.title || item.product_title || "Unknown Product",
            subtitle: item.subtitle || item.variant?.title || item.variant_title || "Handcrafted Item",
            quantity: quantity,
            unit_price: unit_price,
            total: total,
            product_cost: product_cost,
            variant_sku: item.variant_sku || item.sku || "",
            product_id: item.product_id || "",
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
            has_tracking: item.has_tracking || false
          };
        });
        
        const transformedOrder: VendorOrder = {
          id: order.id || `order_${index}`,
          display_id: display_id,
          customer: customer,
          created_at: created_at,
          
          // Use vendor-specific totals with safe fallbacks
          vendor_total: safeNumber(order.vendor_total || order.vendor_payment_amount),
          vendor_subtotal: safeNumber(order.vendor_subtotal),
          vendor_shipping_total: safeNumber(order.vendor_shipping_total),
          vendor_tax_total: safeNumber(order.vendor_tax_total),
          
          vendor_items: vendor_items,
          
          payment_status: order.payment_status || "pending",
          fulfillment_status: order.fulfillment_status || "not_fulfilled",
          currency_code: "INR",
          
          // Vendor information
          vendor_id: order.vendor_id || "",
          vendor_handle: order.vendor_handle || "unknown",
          vendor_payment_amount: safeNumber(order.vendor_payment_amount || order.vendor_total),
          
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
        
        console.log(`✅ Transformed order ${index}:`, transformedOrder);
        return transformedOrder;
        
      } catch (transformError) {
        console.error(`❌ Error transforming order ${index}:`, transformError);
        // Return a minimal order object to prevent complete failure
        return {
          id: order.id || `order_${index}`,
          display_id: index + 1,
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
  };
  
  // Fetch vendor, order, and product data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("vendorToken");
        
        console.log("token", token);
        if (!token) {
          setError("Authentication required. Please log in.");
          setAuthError(true);
          setLoading(false);
          return;
        }

        // Fetch vendor profile
        const vendorResponse = await fetch("http://localhost:9000/vendors/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Vendor response status:", vendorResponse.status);
        
        if (vendorResponse.status === 404) {
          console.log("Vendor not found (404). Redirecting to onboarding.");
          window.location.href = '/onboarding?step=basic-info';
          setLoading(false);
          return;
        }
        
        if (vendorResponse.status === 401 || vendorResponse.status === 403) {
          console.log("Authentication failed. Redirecting to sign-in.");
          localStorage.removeItem("vendorToken");
          setAuthError(true);
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }
        
        if (!vendorResponse.ok) {
          throw new Error(`Error fetching vendor profile: ${vendorResponse.status} ${vendorResponse.statusText}`);
        }
        
        const vendorData = await vendorResponse.json();
        console.log("Vendor data:", vendorData);
        
        // Check onboarding completion status
        const onboardingCheck = checkOnboardingCompletion(vendorData);
        setOnboardingStatus(onboardingCheck);
        
        // Transform vendor data
        const transformedVendor: Vendor = {
          id: vendorData.vendor?.id || "1",
          name: vendorData.vendor?.name || 
        (vendorData.vendor?.admins?.[0]?.first_name && vendorData.vendor?.admins?.[0]?.last_name ? 
          `${vendorData.vendor.admins[0].first_name} ${vendorData.vendor.admins[0].last_name}` : 
          vendorData.vendor?.admin?.[0]?.first_name && vendorData.vendor?.admin?.[0]?.last_name ?
          `${vendorData.vendor.admin[0].first_name} ${vendorData.vendor.admin[0].last_name}` :
          vendorData.vendor?.first_name && vendorData.vendor?.last_name ?
          `${vendorData.vendor.first_name} ${vendorData.vendor.last_name}` :
          "Creator"),
          email: vendorData.vendor?.email || "creator@junooni.com",
          avatar: vendorData.vendor?.logo || vendorData.vendor?.avatar || undefined,
          store_name: vendorData.vendor?.store_name || vendorData.vendor?.business_name || "My Junooni Store",
          created_at: vendorData.vendor?.created_at || new Date().toISOString(),
          products_count: vendorData.products_count || 0,
          verified: vendorData.vendor?.verified || vendorData.vendor?.verified_seller || false
        };
        
        setVendor(transformedVendor);

        // Fetch recent vendor orders
        try {
          console.log("🔍 Fetching vendor-filtered orders for dashboard...");
          
          const orderResponse = await fetch("http://localhost:9000/vendors/orders?limit=10", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (!orderResponse.ok) {
            console.warn(`Could not fetch orders: ${orderResponse.status} ${orderResponse.statusText}`);
            setOrders([]);
          } else {
            const orderData = await orderResponse.json();
            console.log("Raw order data for dashboard:", orderData);
            
            const transformedOrders = transformVendorOrders(orderData);
            console.log("Transformed orders for dashboard:", transformedOrders);
            
            setOrders(transformedOrders);
          }
        } catch (orderError) {
          console.error("Error fetching orders:", orderError);
          setOrders([]);
        }
        
        // Fetch products
        try {
          const productResponse = await fetch("http://localhost:9000/vendors/products", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (!productResponse.ok) {
            console.warn(`Warning: Could not fetch products: ${productResponse.statusText}`);
            setProducts([]);
          } else {
            const productData = await productResponse.json();
            console.log("Product data:", productData);
            
            // Transform products
            const transformedProducts = (productData.products || []).map((product: any): Product => {
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
                created_at: product.created_at || new Date().toISOString(),
                handle: product.handle || "",
                variants: product.variants || []
              };
            });
            
            setProducts(transformedProducts);
          }
        } catch (productError) {
          console.error("Error fetching products:", productError);
          setProducts([]);
        }
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  // Calculate enhanced stats using vendor data
  const calculateStats = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalOrders: 0,
        todayRevenue: 0,
        todayOrders: 0,
        processingOrders: 0,
        shippedOrders: 0
      };
    }
    
    const validOrders = orders.filter(order => 
      order && 
      typeof order === 'object' && 
      typeof order.vendor_total === 'number' && 
      order.fulfillment_status
    );
    
    console.log("Valid orders for stats:", validOrders.length, "out of", orders.length);
    
    const totalRevenue = validOrders.reduce((sum, order) => {
      return sum + (order.vendor_total || 0);
    }, 0);
    
    const pendingOrders = validOrders.filter(order => 
      order.fulfillment_status === "not_fulfilled" || 
      order.fulfillment_status === "pending"
    ).length;
    
    const completedOrders = validOrders.filter(order => 
      order.fulfillment_status === "fulfilled" || 
      order.fulfillment_status === "delivered" || 
      order.fulfillment_status === "completed"
    ).length;

    const processingOrders = validOrders.filter(order => 
      order.fulfillment_status === "processing" || 
      order.fulfillment_status === "partially_fulfilled"
    ).length;

    const shippedOrders = validOrders.filter(order => 
      order.fulfillment_status === "shipped" || 
      order.fulfillment_status === "partially_shipped"
    ).length;
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = validOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= today;
    });
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.vendor_total || 0), 0);
    
    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalOrders: validOrders.length,
      todayRevenue,
      todayOrders: todayOrders.length,
      processingOrders,
      shippedOrders
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
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: BRAND.primary }} />
          <div className="text-lg font-medium">Loading your dashboard...</div>
          <div className="text-sm text-gray-500">Fetching your latest data</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="mb-2 text-lg font-medium text-red-600">Authentication Required</h3>
          <p className="mb-4 text-red-500">{error || "You must be logged in to view this page."}</p>
          <Button onClick={handleLoginRedirect} style={{ backgroundColor: BRAND.primary }}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (error && !authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="mb-2 text-lg font-medium text-red-600">Error Loading Dashboard</h3>
          <p className="mb-4 text-red-500">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleLoginRedirect} style={{ backgroundColor: BRAND.primary }}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
              <Separator orientation='vertical' className='h-6 ml-2' />
              
              {/* Brand Name - Always visible */}
              <div className="ml-2 md:hidden">
                <Link to="/dashboard" className="flex items-center">
                  <span 
                    className="text-lg font-bold md:text-xl" 
                    style={{ color: BRAND.primary }}
                  >
                    JUNOONI
                  </span>
                </Link>
              </div>
              
              <span className="hidden ml-2 text-gray-500 md:inline md:hidden">|</span>
              <h1 className="hidden ml-2 text-lg font-semibold md:block" style={{ color: BRAND.secondary }}>
                Seller Dashboard
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
              
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 pt-6 mx-auto">
        {/* Onboarding Progress Banner */}
        {vendor && (
          <OnboardingProgressBanner 
            onboardingStatus={onboardingStatus} 
            vendorName={vendor.name} 
          />
        )}

        {/* Welcome Header */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: BRAND.textPrimary }}>
              Good {greetingTime}, {vendor?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground" style={{ color: BRAND.textSecondary }}>
              Welcome to your Junooni dashboard. Here's an overview of your store performance.
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

        {/* Enhanced Summary Cards using vendor data */}
        <SummaryCards orders={orders} products={products} />

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
              <CardDescription>
                Latest orders containing your products
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => {
                    // Additional safety check in render
                    if (!order || typeof order.vendor_total !== 'number') {
                      return null;
                    }
                    
                    return (
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
                            <div className="flex items-center gap-2">
                              <StatusBadge status={order.fulfillment_status} />
                              <PaymentBadge status={order.payment_status} />
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">{formatPrice(order.vendor_total)}</p>
                              <p className="text-xs text-gray-500">
                                {order.vendor_items.reduce((acc, item) => acc + item.quantity, 0)} items
                              </p>
                            </div>
                          </div>
                          {/* Show claim/return indicators if any */}
                          {(order.has_claims || order.has_returns) && (
                            <div className="flex gap-1 mt-1">
                              {order.has_returns && (
                                <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50">
                                  Return
                                </Badge>
                              )}
                              {order.has_claims && (
                                <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50">
                                  Claim
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)} {/* Remove any null renders */}
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
                <CardDescription>
                  Recently added products to your store
                </CardDescription>
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
                      onClick={() => popupButtonsRef.current?.openPopup()}
                      style={{ backgroundColor: BRAND.primary }}
                    >
                      <PlusSquare className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions Card */}
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your store
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-auto py-4"
                    onClick={() => popupButtonsRef.current?.openPopup()}
                  >
                    <PlusSquare className="w-6 h-6 mb-2" style={{ color: BRAND.primary }} />
                    <span>Add Product</span>
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
                    <Link to="/help-center">
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
        </div>
        
        {/* Order Distribution Stats */}
        {orders.length > 0 && (
          <Card className="mt-6 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                Order Status Distribution
              </CardTitle>
              <CardDescription>
                Overview of your orders by fulfillment status
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-amber-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700">Pending</p>
                      <p className="text-2xl font-bold text-amber-800">{stats.pendingOrders}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Processing</p>
                      <p className="text-2xl font-bold text-blue-800">{stats.processingOrders}</p>
                    </div>
                    <RefreshCw className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">Shipped</p>
                      <p className="text-2xl font-bold text-purple-800">{stats.shippedOrders}</p>
                    </div>
                    <Truck className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Completed</p>
                      <p className="text-2xl font-bold text-green-800">{stats.completedOrders}</p>
                    </div>
                    <CircleCheck className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
                <Link to="/help-center">
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
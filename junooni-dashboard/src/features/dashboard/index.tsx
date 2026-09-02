import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ProductsPrimaryButtons, ProductsPrimaryButtonsHandle } from '@/features/products/components/ProductsPrimaryButtons';
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useToast } from "@/hooks/use-toast";
import { ProfileDropdown } from '@/components/profile-dropdown'
import Junoonilogo from '../../assets/junooni_logo_brand_color.png'
import AdminImpersonationBanner from '@/components/AdminImpersonationBanner'
import { ChevronDown, ChevronUp, X } from "lucide-react";
import StoreTypeModal, { StoreModeBadge, type StorePreference } from "@/features/dashboard/components/StoreTypeModal"
import {
  CircleUser,
  Package,
  Globe,
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
import DashboardTour from "./components/DashboardTour";

// ─── Brand ──────────────────────────────────────────────────────────────────
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

// ─── Token validation (unchanged) ───────────────────────────────────────────
const validateToken = (): boolean => {
  const token = localStorage.getItem("vendorToken");
  if (!token) return false;
  if (localStorage.getItem("isAdminImpersonation") === "true") {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }
  const tokenTimestamp = localStorage.getItem("vendorTokenTimestamp");
  if (!tokenTimestamp) return false;
  const tokenAge = Date.now() - parseInt(tokenTimestamp);
  const THREE_HOURS = 3 * 60 * 60 * 1000;
  if (tokenAge > THREE_HOURS) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorTokenTimestamp");
    return false;
  }
  return true;
};

// ─── Types (unchanged) ───────────────────────────────────────────────────────
interface VendorOrderItem {
  id: string; title: string; subtitle?: string; quantity: number;
  unit_price: number; total: number; product_cost?: number;
  variant_sku?: string; product_id?: string; product_handle?: string;
  claim_status?: 'returned' | 'replaced' | 'active'; return_status?: 'requested' | 'received' | 'none';
  is_claim_item?: boolean; claim_id?: string; return_id?: string;
  return_reason?: string; claim_reason?: string; tracking_numbers?: string[];
  tracking_urls?: string[]; shipped_at?: string; delivered_at?: string;
  packed_at?: string; shipping_provider?: string; has_tracking?: boolean;
}
interface VendorOrder {
  id: string; custom_display_id: number;
  customer: { first_name: string; last_name: string; email: string; phone?: string };
  created_at: string; vendor_total: number; vendor_subtotal: number;
  vendor_shipping_total: number; vendor_tax_total: number;
  vendor_items: VendorOrderItem[]; payment_status: string; fulfillment_status: string;
  currency_code: string; vendor_id: string; vendor_handle: string;
  vendor_payment_amount: number; shipping_address?: any; billing_address?: any;
  is_vendor_filtered?: boolean; claims?: any[]; returns?: any[];
  claim_items?: any[]; return_items?: any[]; has_claims?: boolean; has_returns?: boolean;
}
interface Product {
  id: string; title: string; description?: string; price: number;
  image_url?: string; status: string; created_at: string; handle?: string; variants?: any[];
}
interface Vendor {
  id: string; name: string; email: string; avatar?: string;
  store_name?: string; business_name?: string; created_at: string;
  products_count?: number; verified?: boolean;
  gst_verification_status?: "pending" | "verified" | "failed";
}
interface OnboardingStatus {
  isComplete: boolean; completedSteps: string[]; missingSteps: string[];
  completionPercentage: number;
  stepDetails: {
    [stepName: string]: { isComplete: boolean; missingFields: string[]; requiredFields: string[] };
  };
}

// ─── Pure helpers (extracted outside component so they never re-create) ──────
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || defaultValue;
  if (value?.value !== undefined) return parseFloat(value.value) || defaultValue;
  return defaultValue;
};

const formatPrice = (amount: number, currencyCode: string = "INR") =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(d);
  } catch { return "—"; }
};

const checkOnboardingCompletion = (vendorData: any): OnboardingStatus => {
  if (!vendorData?.vendor) {
    return {
      isComplete: false, completedSteps: [],
      missingSteps: ['basic-info', 'creator-profile'], completionPercentage: 0,
      stepDetails: {
        'basic-info': { isComplete: false, missingFields: ['Store Name', 'Handle', 'First Name', 'Last Name'], requiredFields: ['Store Name', 'Handle', 'First Name', 'Last Name'] },
        'creator-profile': { isComplete: false, missingFields: ['Creator Bio', 'Creator Title', 'Creator Category'], requiredFields: ['Creator Bio', 'Creator Title', 'Creator Category'] }
      }
    };
  }
  const vendor = vendorData.vendor;
  const completedSteps: string[] = [];
  const missingSteps: string[] = [];
  const stepDetails: OnboardingStatus['stepDetails'] = {};

  const basicInfoFields = {
    'Store Name': vendor.name, 'Handle': vendor.handle,
    'First Name': vendor.admins?.[0]?.first_name || vendor.admin?.[0]?.first_name,
    'Last Name': vendor.admins?.[0]?.last_name || vendor.admin?.[0]?.last_name
  };
  const missingBasicFields = Object.entries(basicInfoFields).filter(([, v]) => !v).map(([k]) => k);
  const hasBasicInfo = missingBasicFields.length === 0;
  stepDetails['basic-info'] = { isComplete: hasBasicInfo, missingFields: missingBasicFields, requiredFields: Object.keys(basicInfoFields) };
  hasBasicInfo ? completedSteps.push('basic-info') : missingSteps.push('basic-info');

  const creatorProfileFields = { 'Creator Bio': vendor.creator_bio, 'Creator Title': vendor.creator_title, 'Creator Category': vendor.creator_category };
  const missingCreatorFields = Object.entries(creatorProfileFields).filter(([, v]) => !v).map(([k]) => k);
  const hasCreatorProfile = missingCreatorFields.length === 0;
  stepDetails['creator-profile'] = { isComplete: hasCreatorProfile, missingFields: missingCreatorFields, requiredFields: Object.keys(creatorProfileFields) };
  hasCreatorProfile ? completedSteps.push('creator-profile') : missingSteps.push('creator-profile');

  return {
    isComplete: hasBasicInfo, completedSteps, missingSteps,
    completionPercentage: Math.round((completedSteps.length / 2) * 100), stepDetails
  };
};

// ─── Transform a raw order object (pure fn, no closure over state) ───────────
const transformOrder = (order: any, index: number): VendorOrder => {
  try {
    let custom_display_id = parseInt(String(order.custom_display_id ?? 0)) || 0;
    if (custom_display_id === 0) {
      const numbers = order.id?.match(/\d+/g);
      custom_display_id = numbers?.length ? parseInt(numbers[numbers.length - 1]) || index + 1 : index + 1;
    }
    const customer = {
      first_name: order.customer?.first_name || order.billing_address?.first_name || "Guest",
      last_name: order.customer?.last_name || order.billing_address?.last_name || "",
      email: order.customer?.email || order.email || "customer@example.com",
      phone: order.customer?.phone || order.billing_address?.phone || order.shipping_address?.phone
    };
    const vendor_items: VendorOrderItem[] = (order.vendor_items || []).map((item: any, i: number) => {
      const unit_price = safeNumber(item.unit_price || item.raw_unit_price);
      const quantity = Math.max(1, safeNumber(item.quantity, 1));
      const product_cost = item.product_cost !== undefined
        ? safeNumber(item.product_cost)
        : safeNumber(item.merged_metadata?.product_cost);
      return {
        id: item.id || `item_${i}`, title: item.title || item.product_title || "Unknown Product",
        subtitle: item.subtitle || item.variant?.title || item.variant_title || "Handcrafted Item",
        quantity, unit_price, total: unit_price * quantity, product_cost,
        variant_sku: item.variant_sku || item.sku || "",
        product_id: item.product_id || "", product_handle: item.product_handle || "",
        claim_status: item.claim_status || 'active', return_status: item.return_status || 'none',
        is_claim_item: item.is_claim_item || false, claim_id: item.claim_id, return_id: item.return_id,
        return_reason: item.return_reason, claim_reason: item.claim_reason,
        tracking_numbers: item.tracking_numbers || [], tracking_urls: item.tracking_urls || [],
        shipped_at: item.shipped_at, delivered_at: item.delivered_at, packed_at: item.packed_at,
        shipping_provider: item.shipping_provider, has_tracking: item.has_tracking || false
      };
    });
    return {
      id: order.id || `order_${index}`, custom_display_id, customer,
      created_at: order.created_at || order.vendor_items?.[0]?.created_at || new Date().toISOString(),
      vendor_total: safeNumber(order.vendor_total || order.vendor_payment_amount),
      vendor_subtotal: safeNumber(order.vendor_subtotal),
      vendor_shipping_total: safeNumber(order.vendor_shipping_total),
      vendor_tax_total: safeNumber(order.vendor_tax_total),
      vendor_items, payment_status: order.payment_status || "pending",
      fulfillment_status: order.fulfillment_status || "not_fulfilled",
      currency_code: "INR", vendor_id: order.vendor_id || "", vendor_handle: order.vendor_handle || "unknown",
      vendor_payment_amount: safeNumber(order.vendor_payment_amount || order.vendor_total),
      shipping_address: order.shipping_address, billing_address: order.billing_address,
      is_vendor_filtered: order.is_vendor_filtered ?? true,
      claims: order.claims || [], returns: order.returns || [],
      claim_items: order.claim_items || [], return_items: order.return_items || [],
      has_claims: order.has_claims || false, has_returns: order.has_returns || false
    };
  } catch {
    return {
      id: order.id || `order_${index}`, custom_display_id: index + 1,
      customer: { first_name: "Guest", last_name: "", email: "customer@example.com" },
      created_at: new Date().toISOString(), vendor_total: 0, vendor_subtotal: 0,
      vendor_shipping_total: 0, vendor_tax_total: 0, vendor_items: [],
      payment_status: "pending", fulfillment_status: "not_fulfilled", currency_code: "INR",
      vendor_id: "", vendor_handle: "unknown", vendor_payment_amount: 0,
      is_vendor_filtered: true, claims: [], returns: [], claim_items: [], return_items: [],
      has_claims: false, has_returns: false
    };
  }
};

// ─── Skeleton components ──────────────────────────────────────────────────────
const SkeletonCard = () => (
  <Card className="shadow-md">
    <CardContent className="p-4">
      <div className="flex items-start justify-between animate-pulse">
        <div className="space-y-2">
          <div className="w-24 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-5 bg-gray-300 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonOrderRow = () => (
  <div className="p-4 border border-gray-100 rounded-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-5 bg-gray-100 rounded-full" />
          <div className="w-12 h-5 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="w-16 h-5 bg-gray-200 rounded" />
    </div>
  </div>
);

// ─── Status badges (memoized) ─────────────────────────────────────────────────
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  const getStatusProps = (s: string) => {
    switch (s) {
      case "not_fulfilled": case "pending":
        return { className: "text-amber-700 bg-amber-50 border-amber-200", icon: <Clock className="w-3 h-3 mr-1" /> };
      case "partially_fulfilled": case "requires_action": case "processing":
        return { className: "text-blue-700 bg-blue-50 border-blue-200", icon: <RefreshCw className="w-3 h-3 mr-1" /> };
      case "partially_shipped": case "shipped":
        return { className: "text-purple-700 bg-purple-50 border-purple-200", icon: <Truck className="w-3 h-3 mr-1" /> };
      case "fulfilled": case "delivered": case "completed":
        return { className: "text-green-700 bg-green-50 border-green-200", icon: <CircleCheck className="w-3 h-3 mr-1" /> };
      case "cancelled": case "canceled":
        return { className: "text-red-700 bg-red-50 border-red-200", icon: <AlertTriangle className="w-3 h-3 mr-1" /> };
      default:
        return { className: "text-gray-700 bg-gray-50 border-gray-200", icon: null };
    }
  };
  const { className, icon } = getStatusProps(normalizedStatus);
  const formatStatus = (s: string) => {
    switch (s) {
      case "not_fulfilled": return "Pending"; case "partially_fulfilled": return "Processing";
      case "fulfilled": return "Fulfilled"; case "partially_shipped": return "Partially Shipped";
      case "shipped": return "Shipped"; case "requires_action": return "Action Required";
      default: return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };
  return (
    <Badge variant="outline" className={`${className} font-medium text-xs px-2 py-0.5`}>
      {icon}{formatStatus(normalizedStatus)}
    </Badge>
  );
});

const PaymentBadge = React.memo(({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  const getStatusProps = (s: string) => {
    switch (s) {
      case "captured": case "paid":
        return { className: "text-green-700 bg-green-50 border-green-200", icon: <CreditCard className="w-3 h-3 mr-1" /> };
      case "awaiting": case "pending": case "requires_action":
        return { className: "text-amber-700 bg-amber-50 border-amber-200", icon: <Clock className="w-3 h-3 mr-1" /> };
      case "failed": case "canceled": case "not_paid":
        return { className: "text-red-700 bg-red-50 border-red-200", icon: <AlertTriangle className="w-3 h-3 mr-1" /> };
      case "refunded":
        return { className: "text-blue-700 bg-blue-50 border-blue-200", icon: <RefreshCw className="w-3 h-3 mr-1" /> };
      default:
        return { className: "text-gray-700 bg-gray-50 border-gray-200", icon: null };
    }
  };
  const { className, icon } = getStatusProps(normalizedStatus);
  const formatPaymentStatus = (s: string) => {
    switch (s) {
      case "captured": return "Paid"; case "not_paid": return "Unpaid";
      case "requires_action": return "Action Required";
      default: return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };
  return (
    <Badge variant="outline" className={`${className} font-medium text-xs px-2 py-0.5`}>
      {icon}{formatPaymentStatus(normalizedStatus)}
    </Badge>
  );
});

// ─── Summary Cards (memoized, takes precomputed stats) ────────────────────────
const SummaryCards = React.memo(({ stats, productsCount }: {
  stats: { todayRevenue: number; todayOrders: number; totalRevenue: number; totalOrders: number; pendingOrders: number };
  productsCount: number;
}) => (
  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
    <Card id="tour-today-revenue" className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Today's Revenue</p>
            <h3 className="text-lg font-bold" style={{ color: BRAND.primary }}>{formatPrice(stats.todayRevenue)}</h3>
            <p className="mt-1 text-sm text-gray-500">{stats.todayOrders} {stats.todayOrders === 1 ? 'order' : 'orders'} today</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND.primary}22` }}>
            <TrendingUp className="w-6 h-6" style={{ color: BRAND.primary }} />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Revenue (Last 5 Orders)</p>
            <h3 className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</h3>
            <p className="mt-1 text-sm text-gray-500">{stats.totalOrders} recent {stats.totalOrders === 1 ? 'order' : 'orders'}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg"><CreditCard className="w-6 h-6 text-green-600" /></div>
        </div>
      </CardContent>
    </Card>
    <Card id="tour-pending-orders" className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Pending Orders</p>
            <h3 className="text-lg font-bold">{stats.pendingOrders}</h3>
            <p className="mt-1 text-sm text-gray-500">In last {stats.totalOrders} {stats.totalOrders === 1 ? 'order' : 'orders'}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-100"><Clock className="w-6 h-6 text-amber-600" /></div>
        </div>
      </CardContent>
    </Card>
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Your Products</p>
            <h3 className="text-lg font-bold">{productsCount}</h3>
            <p className="mt-1 text-sm text-gray-500">Recently added</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg"><Package className="w-6 h-6 text-blue-600" /></div>
        </div>
      </CardContent>
    </Card>
  </div>
));

// ─── Onboarding Banner (unchanged logic, memoized) ────────────────────────────
const OnboardingProgressBanner = React.memo(({ onboardingStatus, vendorName }: {
  onboardingStatus: OnboardingStatus; vendorName: string;
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem('onboarding_banner_dismissed') === 'true'
  );
  if (onboardingStatus.isComplete) return null;

  const getStepIcon = (step: string) => step === 'basic-info'
    ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  const getStepName = (step: string) => step === 'basic-info' ? 'Basic Information' : 'Creator Profile';
  const getStepPriority = (step: string) => step === 'basic-info' ? 'Required' : 'Recommended';
  const getStepPriorityColor = (step: string) => step === 'basic-info' ? 'text-red-600' : 'text-amber-600';

  if (isDismissed) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 mb-6 transition-colors border rounded-lg cursor-pointer border-amber-200 bg-amber-50 hover:bg-amber-100"
        onClick={() => { setIsDismissed(false); localStorage.removeItem('onboarding_banner_dismissed'); }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-800">Complete your onboarding</span>
          <div className="w-20 h-1.5 bg-white rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${onboardingStatus.completionPercentage}%`, backgroundColor: BRAND.primary }} />
          </div>
          <span className="text-xs text-amber-600">{onboardingStatus.completionPercentage}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="px-3 text-xs h-7" style={{ backgroundColor: BRAND.primary }}
            onClick={(e) => { e.stopPropagation(); navigate({ to: '/onboarding' }); }}>
            Resume
          </Button>
          <ChevronDown className="w-4 h-4 text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden border shadow-sm border-amber-200 rounded-xl">
      <div
        className="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer bg-amber-50 hover:bg-amber-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-amber-800">Complete Your Onboarding</span>
            <span className="ml-2 text-xs text-amber-600">
              {onboardingStatus.completionPercentage}% done · {onboardingStatus.missingSteps.length} step{onboardingStatus.missingSteps.length !== 1 ? 's' : ''} remaining
            </span>
          </div>
          <div className="items-center hidden gap-2 sm:flex">
            <div className="w-24 h-1.5 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full transition-all rounded-full" style={{ width: `${onboardingStatus.completionPercentage}%`, backgroundColor: BRAND.primary }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden px-3 text-xs h-7 sm:flex" style={{ backgroundColor: BRAND.primary }}
            onClick={(e) => { e.stopPropagation(); navigate({ to: '/onboarding' }); }}>
            Continue <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          <button className="p-1 text-orange-400 transition-colors rounded hover:text-amber-700 hover:bg-amber-200" title="Dismiss for now"
            onClick={(e) => { e.stopPropagation(); setIsDismissed(true); localStorage.setItem('onboarding_banner_dismissed', 'true'); }}>
            <X className="w-4 h-4" />
          </button>
          <span className="text-orange-400">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-4 bg-white border-t border-amber-100">
          <p className="mb-4 text-sm text-gray-600">Hi {vendorName.split(' ')[0]}! Complete these steps to unlock all selling features.</p>
          <div className="space-y-3">
            {onboardingStatus.missingSteps.map((step) => {
              const stepDetail = onboardingStatus.stepDetails[step];
              if (!stepDetail) return null;
              return (
                <div key={step} className="p-3 border rounded-lg border-amber-100 bg-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step)}
                      <span className="text-sm font-medium text-amber-800">{getStepName(step)}</span>
                      <Badge variant="outline" className={`text-xs ${getStepPriorityColor(step)} border-current`}>
                        {getStepPriority(step)}
                      </Badge>
                    </div>
                    <button className="text-xs font-medium underline" style={{ color: BRAND.primary }}
                      onClick={() => navigate({ to: `/onboarding?step=${step}` })}>Fix →</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {stepDetail.missingFields.slice(0, 3).map((field) => (
                      <span key={field} className="inline-flex items-center px-2 py-0.5 text-xs text-red-700 border border-red-200 rounded-md bg-red-50">{field}</span>
                    ))}
                    {stepDetail.missingFields.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded-md bg-gray-50">+{stepDetail.missingFields.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Button className="w-full mt-4" style={{ backgroundColor: BRAND.primary }} onClick={() => navigate({ to: '/onboarding' })}>
            Complete Onboarding <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
});

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const popupButtonsRef = useRef<ProductsPrimaryButtonsHandle>(null);

  // ── Consolidated loading state: split into "critical" vs "secondary" ──────
  const [vendorLoading, setVendorLoading] = useState(true);    // blocks header render
  const [dataLoading, setDataLoading] = useState(true);         // blocks orders/products cards
  const [authError, setAuthError] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  // ── Data state ────────────────────────────────────────────────────────────
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorPlan, setVendorPlan] = useState<string>('free');  // ← ADD
  const [productsCount, setProductsCount] = useState<number>(0); // ← ADD (for total count)
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    isComplete: true, completedSteps: [], missingSteps: [], completionPercentage: 100, stepDetails: {}
  });
  const [storePreference, setStorePreference] = useState<StorePreference | null>(null);
  const [showStoreTypeModal, setShowStoreTypeModal] = useState(false);
  const [marketplaceStatus, setMarketplaceStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [marketplaceRejectionReason, setMarketplaceRejectionReason] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // ── Greeting (stable, computed once) ─────────────────────────────────────
  const greetingTime = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  }, []);

  // ── Stats (memoized, recomputes only when orders change) ──────────────────
  const stats = useMemo(() => {
    if (!orders.length) return { totalRevenue: 0, pendingOrders: 0, totalOrders: 0, todayRevenue: 0, todayOrders: 0 };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const todayList = orders.filter(o => { const d = new Date(o.created_at); return d >= today && d < tomorrow; });
    return {
      totalRevenue: orders.reduce((s, o) => s + (o.vendor_total || 0), 0),
      pendingOrders: orders.filter(o => o.fulfillment_status === "not_fulfilled" || o.fulfillment_status === "pending").length,
      totalOrders: orders.length,
      todayRevenue: todayList.reduce((s, o) => s + (o.vendor_total || 0), 0),
      todayOrders: todayList.length,
    };
  }, [orders]);

  // ── Main fetch: vendor first (critical path), then orders+products in parallel ──
  useEffect(() => {
    let cancelled = false;

    const fetchVendor = async (token: string) => {
      const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.status === 404) { window.location.href = '/onboarding?step=basic-info'; return null; }
      if (res.status === 401 || res.status === 403) throw new Error("AUTH_EXPIRED");
      if (!res.ok) throw new Error(`Vendor fetch failed: ${res.status}`);
      return res.json();
    };

    const fetchOrders = async (token: string): Promise<VendorOrder[]> => {
      try {
        const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/orders?limit=5`, {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const arr = data.orders || data.data || (Array.isArray(data) ? data : []);
        return arr.slice(0, 5).map(transformOrder);
      } catch { return []; }
    };

    const fetchProducts = async (token: string): Promise<Product[]> => {
      try {
        // Fetch count with minimal data
        const countRes = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products?limit=1&fields=id`, {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (countRes.ok) {
          const countData = await countRes.json();
          // Medusa returns count/total in the response
          const total = countData.count ?? countData.total ?? countData.products?.length ?? 0;
          setProductsCount(total);
        }

        // Fetch only 3 products for display
        const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products?limit=3`, {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).slice(0, 3).map((p: any): Product => ({
          id: p.id, title: p.title || p.name || "Unnamed Product",
          description: p.description || "",
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price?.value) || 0,
          image_url: p.thumbnail || p.image_url || p.images?.[0] || "",
          status: p.status || "draft", created_at: p.created_at || new Date().toISOString(),
          handle: p.handle || "", variants: p.variants || []
        }));
      } catch { return []; }
    };

    const run = async () => {
      // Guard: auth check before any network
      if (!validateToken()) {
        setAuthError(true);
        setVendorLoading(false);
        navigate({ to: "/sign-in" });
        return;
      }
      const token = localStorage.getItem("vendorToken")!;

      // ── STEP 1: Fetch vendor (critical — needed to render header + onboarding) ──
      let vendorData: any;
      try {
        vendorData = await fetchVendor(token);
        if (!vendorData || cancelled) return;
      } catch (e: any) {
        if (cancelled) return;
        if (e.message === "AUTH_EXPIRED") {
          localStorage.removeItem("vendorToken");
          setAuthError(true);
          setCriticalError("Your session has expired. Please log in again.");
        } else {
          setCriticalError(e.message || "Failed to load dashboard");
        }
        setVendorLoading(false);
        setDataLoading(false);
        return;
      }

      // Process vendor data immediately — render header + greeting ASAP
      const onboarding = checkOnboardingCompletion(vendorData);
      const mpStatus = vendorData.vendor?.marketplace_status || "none";
      const isNewVendor = mpStatus === "none" && !vendorData.vendor?.sell_on_own_store;

      // Auto-save own store for new vendors so backend reflects it
      // even if they close the modal without clicking "Confirm"
      if (isNewVendor) {
        fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sell_on_own_store: true }),
        }).catch(() => { /* non-critical */ });
      }

      const transformedVendor: Vendor = {
        id: vendorData.vendor?.id || "1",
        name: vendorData.vendor?.name ||
          (vendorData.vendor?.admins?.[0]?.first_name
            ? `${vendorData.vendor.admins[0].first_name} ${vendorData.vendor.admins[0].last_name}`
            : vendorData.vendor?.admin?.[0]?.first_name
              ? `${vendorData.vendor.admin[0].first_name} ${vendorData.vendor.admin[0].last_name}`
              : "Creator"),
        email: vendorData.vendor?.email || "creator@junooni.com",
        avatar: vendorData.vendor?.logo || vendorData.vendor?.avatar,
        store_name: vendorData.vendor?.store_name || vendorData.vendor?.business_name || "My Junooni Store",
        created_at: vendorData.vendor?.created_at || new Date().toISOString(),
        products_count: vendorData.products_count || 0,
        verified: vendorData.vendor?.verified || false
      };

      if (!cancelled) {
        setVendor(transformedVendor);
        setVendorPlan(vendorData.vendor?.plan || 'free');  // ← ADD
        setOnboardingStatus(onboarding);
        setMarketplaceStatus(mpStatus);
        setMarketplaceRejectionReason(vendorData.vendor?.marketplace_rejection_reason || null);
        setStorePreference({
          sell_on_marketplace: vendorData.vendor?.sell_on_marketplace ?? false,
          sell_on_own_store: isNewVendor ? true : (vendorData.vendor?.sell_on_own_store ?? false),
        });
        setVendorLoading(false);  // ← unblock header render NOW
      }

      // ── STEP 2: Fetch orders + products IN PARALLEL (non-blocking to header) ──
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        fetchOrders(token),
        fetchProducts(token)
      ]);

      if (!cancelled) {
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
        setDataLoading(false);
      }

      // ── STEP 3: Defer non-critical side-effects ───────────────────────────
      // Tour and modal are low priority — schedule after paint settles
      if (!cancelled) {
        const createdAt = new Date(vendorData.vendor?.created_at);
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        // Use requestIdleCallback / setTimeout to not block interactive paint
        const defer = window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 200));
        defer(() => {
          if (cancelled) return;
          if (daysSinceCreation <= 3) setShowTour(true);
          if (isNewVendor) setShowStoreTypeModal(true);
        });
      }
    };

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApplyToMarketplace = useCallback(async () => {
    const token = localStorage.getItem("vendorToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/marketplace-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMarketplaceStatus("pending");
        toast({ title: "Application submitted!", description: "We'll review and get back to you shortly." });
      } else {
        toast({ title: "Couldn't apply", description: data.message || "Please try again." });
      }
    } catch {
      toast({ title: "Couldn't apply", description: "Network error, please try again." });
    }
  }, [toast]);

  const handleLoginRedirect = useCallback(() => navigate({ to: "/sign-in" }), [navigate]);

  // ─── Error states ──────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="mb-2 text-lg font-medium text-red-600">Authentication Required</h3>
        <p className="mb-4 text-red-500">{criticalError || "You must be logged in."}</p>
        <Button onClick={handleLoginRedirect} style={{ backgroundColor: BRAND.primary }}>Log In</Button>
      </div>
    );
  }

  if (criticalError && !authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="mb-2 text-lg font-medium text-red-600">Error Loading Dashboard</h3>
        <p className="mb-4 text-red-500">{criticalError}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" /> Try Again</Button>
          <Button onClick={handleLoginRedirect} style={{ backgroundColor: BRAND.primary }}>Back to Login</Button>
        </div>
      </div>
    );
  }

  // ── Full spinner only if vendor hasn't resolved yet (should be <300ms) ─────
  if (vendorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 mb-3 animate-spin" style={{ color: BRAND.primary }} />
        <div className="text-base font-medium text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  // ── Main render (header + greeting visible immediately after vendor resolves) ──
  return (
    <div className="min-h-screen pb-12" style={{
      background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                   radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
      backgroundColor: "white"
    }}>
      <AdminImpersonationBanner />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-2.5 mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-shrink-0 gap-4">
              <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
              <Separator orientation='vertical' className='h-5' />
            </div>
            <div className="flex items-center justify-center flex-1 min-w-0 gap-2 md:justify-end">
              <Link to="/dashboard" className="flex items-center flex-shrink-0 md:hidden">
                <img src={Junoonilogo} alt="Junooni Logo" className="h-7" />
              </Link>
              <div className="items-center hidden gap-2 md:flex">
                <Button variant="ghost" className="font-medium" style={{ color: BRAND.primary }}>Dashboard</Button>
                {storePreference && (
                  <div id="tour-both-stores-badge">
                    <StoreModeBadge pref={storePreference} marketplaceStatus={marketplaceStatus} onChangeClick={() => setShowStoreTypeModal(true)} />
                  </div>
                )}
                <Button variant="ghost" asChild><Link to="/products">Products</Link></Button>
                <Button variant="ghost" asChild><Link to="/orders">Orders</Link></Button>
                <Button variant="ghost" asChild><Link to="/help-center">Help</Link></Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ProfileDropdown storePreference={storePreference} onStoreChangeClick={() => setShowStoreTypeModal(true)} />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 pt-6 mx-auto">
        {/* Onboarding Banner */}
        {vendor && <OnboardingProgressBanner onboardingStatus={onboardingStatus} vendorName={vendor.name} />}

        {/* Welcome */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: BRAND.textPrimary }}>
              Good {greetingTime}, {vendor?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground" style={{ color: BRAND.textSecondary }}>
              Welcome to your JUNOONI dashboard. Here's an overview of your store performance.
            </p>
          </div>
          {/* <div className="flex gap-2 mt-4 md:mt-0">
            <Button id="tour-add-product" className="flex items-center gap-1"
              onClick={() => popupButtonsRef.current?.openPopup()} style={{ backgroundColor: BRAND.primary }}>
              <PlusSquare className="w-4 h-4" /><span>Add Product</span>
            </Button>
          </div> */}
          {(() => {
            const PLAN_LIMITS: Record<string, number | null> = { free: 30, starter: 50, growth: null, pro: null, enterprise: null };
            const limit = PLAN_LIMITS[(vendorPlan || 'free').toLowerCase()] ?? null;
            const isAtLimit = limit !== null && productsCount >= limit;
            return (
              <div className="flex flex-col items-start gap-1 mt-4 md:mt-0">
                <Button
                  id="tour-add-product"
                  className="flex items-center gap-1"
                  onClick={() => !isAtLimit && popupButtonsRef.current?.openPopup()}
                  disabled={isAtLimit}
                  style={isAtLimit ? {} : { backgroundColor: BRAND.primary }}
                >
                  <PlusSquare className="w-4 h-4" /><span>Add Product</span>
                </Button>
                {isAtLimit && (
                  <p className="text-xs text-red-500 max-w-[200px]">
                    Limit reached on {vendorPlan} plan. Upgrade to add more.
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <ProductsPrimaryButtons
            ref={popupButtonsRef}
            totalProducts={productsCount}
            vendorPlan={vendorPlan}
          />
        </div>

        {/* Summary Cards — skeleton while data loads */}
        {dataLoading ? (
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <SummaryCards stats={stats} productsCount={products.length} />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card id="tour-recent-orders" className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Package className="w-4 h-4 mr-2 text-gray-500 sm:w-5 sm:h-5" /> Recent Orders
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm" asChild>
                  <Link to="/orders">View All</Link>
                </Button>
              </div>
              <CardDescription className="text-xs sm:text-sm">Latest orders containing your products</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {dataLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonOrderRow key={i} />)}</div>
              ) : orders.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {orders.slice(0, 5).map((order) => {
                    if (!order || typeof order.vendor_total !== 'number') return null;
                    return (
                      <Link key={order.id} to={`/orders/${order.id}`} className="block">
                        <div className="p-3 transition-all border border-gray-100 rounded-lg cursor-pointer sm:p-4 bg-white hover:shadow-md hover:border-[#e65100]">
                          {/* Mobile */}
                          <div className="sm:hidden">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-sm font-semibold" style={{ color: BRAND.primary }}>Order #{order.custom_display_id}</span>
                              <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                            </div>
                            <div className="mb-2.5">
                              <p className="text-sm font-medium text-gray-700">{order.customer.first_name} {order.customer.last_name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {order.vendor_items.reduce((a, i) => a + i.quantity, 0)} item{order.vendor_items.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              <StatusBadge status={order.fulfillment_status} />
                              <PaymentBadge status={order.payment_status} />
                              {order.has_returns && <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50">Return</Badge>}
                              {order.has_claims && <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">Claim</Badge>}
                            </div>
                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                              <span className="text-xs font-medium text-gray-500">Total Amount</span>
                              <span className="text-base font-bold" style={{ color: BRAND.primary }}>{formatPrice(order.vendor_total)}</span>
                            </div>
                          </div>
                          {/* Desktop */}
                          <div className="hidden sm:flex sm:items-start sm:space-x-3">
                            <div className="hidden p-1.5 rounded-full bg-gray-100 md:block">
                              <Package className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 mb-2 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm font-medium">
                                  <span className="font-semibold" style={{ color: BRAND.primary }}>#{order.custom_display_id}</span>
                                  <span className="mx-1">-</span>
                                  <span>{order.customer.first_name} {order.customer.last_name}</span>
                                </p>
                              </div>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <StatusBadge status={order.fulfillment_status} />
                                  <PaymentBadge status={order.payment_status} />
                                  {order.has_returns && <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50">Return</Badge>}
                                  {order.has_claims && <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">Claim</Badge>}
                                </div>
                                <div className="flex items-center gap-3 sm:text-right">
                                  <div>
                                    <p className="text-sm font-semibold">{formatPrice(order.vendor_total)}</p>
                                    <p className="text-xs text-gray-500">
                                      {order.vendor_items.reduce((a, i) => a + i.quantity, 0)} item{order.vendor_items.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-sm font-medium text-gray-600 sm:text-base">No orders yet</h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">Orders will appear here once customers place them</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products + Quick Actions */}
          <div className="space-y-6">
            <Card id="tour-your-products" className="shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <ShoppingBag className="w-4 h-4 mr-2 text-gray-500 sm:w-5 sm:h-5" /> Your Products
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm" asChild>
                    <Link to="/products">View All</Link>
                  </Button>
                </div>
                <CardDescription className="text-xs sm:text-sm">Recently added products to your store</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center p-3 border border-gray-100 rounded-lg animate-pulse">
                        <div className="w-10 h-10 mr-3 bg-gray-200 rounded-md shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-3 bg-gray-200 rounded" />
                          <div className="w-16 h-4 bg-gray-100 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 3).map((product) => (
                      <Link key={product.id} to={`/products/${product.id}`} className="block">
                        <div className="flex items-center justify-between p-3 transition-all border border-gray-100 rounded-lg cursor-pointer bg-gray-50 hover:bg-white hover:shadow-md hover:border-[#e65100]">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-3 overflow-hidden bg-gray-200 rounded-md">
                              {product.image_url
                                ? <img src={product.image_url} alt={product.title} className="object-cover w-full h-full" loading="lazy" />
                                : <ShoppingBag className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{product.title}</div>
                              <StatusBadge status={product.status} />
                            </div>
                          </div>
                          <ArrowRight className="flex-shrink-0 w-4 h-4 ml-2 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-600 sm:text-base">No products yet</h3>
                    <p className="mt-1 mb-4 text-xs text-gray-500 sm:text-sm">Add your first product to get started</p>
                    <Button size="sm" onClick={() => popupButtonsRef.current?.openPopup()} style={{ backgroundColor: BRAND.primary }}>
                      <PlusSquare className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card id="tour-quick-actions" className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your store</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-4 hover:border-[#e65100]"
                    onClick={() => popupButtonsRef.current?.openPopup()}>
                    <PlusSquare className="w-6 h-6 mb-2" style={{ color: BRAND.primary }} />
                    <span>Add Product</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-4 hover:border-[#e65100]" asChild>
                    <Link to="/orders"><Package className="w-6 h-6 mb-2 text-amber-600" /><span>View Orders</span></Link>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-4 hover:border-[#e65100]" asChild>
                    <Link to="/profile"><Settings className="w-6 h-6 mb-2 text-gray-600" /><span>Settings</span></Link>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center justify-center h-auto py-4 hover:border-[#e65100]"
                    onClick={() => setShowStoreTypeModal(true)}>
                    <ShoppingBag className="w-6 h-6 mb-2" style={{ color: "#e65100" }} /><span>Store mode</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 mt-12 border-t border-gray-200">
          <div className="container px-4 mx-auto text-center">
            <p className="text-sm" style={{ color: BRAND.textLight }}>
              &copy; {new Date().getFullYear()} JUNOONI. All rights reserved.
            </p>
          </div>
        </div>

        {/* Tour replay button */}
        {!showTour && (
          <button onClick={() => setShowTour(true)} title="Replay tour"
            style={{
              position: "fixed", bottom: 80, right: 20, zIndex: 9990,
              width: 40, height: 40, borderRadius: "50%", background: BRAND.primary,
              color: "white", border: "none", fontSize: 18, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(230,81,0,0.4)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>✨</button>
        )}
      </div>

      {showTour && (
        <DashboardTour onComplete={() => { setShowTour(false); localStorage.setItem("dashboard_tour_done", "true"); }} />
      )}

      {showStoreTypeModal && vendor && (
        <StoreTypeModal
          vendorId={vendor.id}
          currentPreference={storePreference ?? undefined}
          marketplaceStatus={marketplaceStatus}
          marketplaceRejectionReason={marketplaceRejectionReason}
          onApplyMarketplace={handleApplyToMarketplace}
          onComplete={(pref) => {
            setStorePreference(pref);
            setShowStoreTypeModal(false);
            const both = pref.sell_on_marketplace && pref.sell_on_own_store;
            toast({
              title: both ? "You're on both — marketplace + own store!" : pref.sell_on_marketplace ? "You're on the Junooni marketplace!" : "Own store selected — we'll be in touch!",
              description: pref.sell_on_own_store ? "Our team will help set up your branded storefront and domain." : undefined,
            });
          }}
          onSkip={() => setShowStoreTypeModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
import React, { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Package, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  User, 
  Mail,
  Phone,
  RefreshCw,
  Download,
  Home,
  ExternalLink,
  AlertTriangle,
  Clock,
  CircleCheck,
  Info,
  X,
  Eye,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Check,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link } from "@tanstack/react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

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

// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date for Indian locale
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// ✅ UPDATED: Mark as Shipped Modal Component
const MarkAsShippedModal = ({ 
  isOpen, 
  onClose, 
  item, 
  order, 
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  trackingUrl,
  setTrackingUrl,
  onMarkAsShipped, 
  loading,
  error,
  success
}: {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
  order: VendorOrder;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  carrier: string;
  setCarrier: (value: string) => void;
  trackingUrl: string;
  setTrackingUrl: (value: string) => void;
  onMarkAsShipped: () => void;
  loading: boolean;
  error?: string;
  success?: boolean;
}) => {
  if (!item) return null;

  const carriers = [
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'usps', label: 'USPS' },
    { value: 'bluedart', label: 'Blue Dart' },
    { value: 'dtdc', label: 'DTDC' },
    { value: 'aramex', label: 'Aramex' },
    { value: 'ecom', label: 'Ecom Express' },
    { value: 'delhivery', label: 'Delhivery' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-full max-w-2xl h-auto max-h-[100vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold">
            <Truck className="w-5 h-5 mr-2" style={{ color: BRAND.primary }} />
            Mark as Shipped
          </DialogTitle>
          <DialogDescription>
            Add tracking information and mark this item as shipped
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 pr-2 space-y-3 overflow-y-auto">
          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Item marked as shipped successfully! Tracking information has been updated.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Order Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Order Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{order.display_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fulfillment ID:</span>
                <span className="font-mono text-xs">{item.fulfillment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{order.customer.first_name} {order.customer.last_name}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Product Details</h4>
            <div className="flex items-center space-x-3">
              {item.image_url || item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title}
                  className="object-cover w-10 h-10 border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                {item.subtitle && <div className="text-sm text-gray-500">{item.subtitle}</div>}
                <div className="text-sm text-gray-500">SKU: {item.variant_sku}</div>
                <div className="text-sm font-medium">Quantity: {item.quantity}</div>
              </div>
            </div>
          </div>

          {/* Shipping Information Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="carrier" className="text-sm font-medium text-gray-700">
                Shipping Carrier *
              </Label>
              <select
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a carrier</option>
                {carriers.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose the shipping carrier for this shipment
              </p>
            </div>

            <div>
              <Label htmlFor="tracking-number" className="text-sm font-medium text-gray-700">
                Tracking Number *
              </Label>
              <Input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1"
                placeholder="Enter tracking number"
              />
              <p className="mt-1 text-xs text-gray-500">
                The tracking number provided by the shipping carrier
              </p>
            </div>

            <div>
              <Label htmlFor="tracking-url" className="text-sm font-medium text-gray-700">
                Tracking URL (optional)
              </Label>
              <Input
                id="tracking-url"
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="mt-1"
                placeholder="https://carrier.com/track/123456789"
              />
              <p className="mt-1 text-xs text-gray-500">
                Direct URL to track this shipment (leave empty to auto-generate)
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Shipping Address</h4>
            {order.shipping_address && (
              <div className="space-y-1 text-sm">
                <div className="font-medium">{order.shipping_address.line1}</div>
                {order.shipping_address.line2 && (
                  <div className="text-gray-600">{order.shipping_address.line2}</div>
                )}
                <div className="text-gray-600">
                  {order.shipping_address.city && `${order.shipping_address.city}, `}
                  {order.shipping_address.state && `${order.shipping_address.state} `}
                  {order.shipping_address.postal_code}
                </div>
                <div className="text-gray-600">{order.shipping_address.country}</div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <div className="text-sm text-blue-800">
              <div className="mb-1 font-medium">Shipping Summary:</div>
              <div>• Item: {item.title}</div>
              <div>• Quantity: {item.quantity} items</div>
              <div>• Carrier: {carrier || 'Not selected'}</div>
              <div>• Tracking: {trackingNumber || 'Not provided'}</div>
              <div>• Custom URL: {trackingUrl || 'Will auto-generate'}</div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-sm text-gray-700">
              <div className="mb-1 font-medium">Important Notes:</div>
              <ul className="space-y-1 text-xs">
                <li>• This will mark the item as shipped in the system</li>
                <li>• Customer will receive tracking information via email</li>
                <li>• Ensure tracking number is correct before submitting</li>
                <li>• If no tracking URL is provided, it will be auto-generated</li>
                <li>• This action cannot be easily undone</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={onMarkAsShipped} 
              disabled={loading || !carrier || !trackingNumber.trim()}
              className="min-w-[140px]"
              style={{ backgroundColor: BRAND.primary }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Mark as Shipped
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Updated interfaces for vendor-specific order data with tracking and images
interface OrderItem {
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
  // ✅ NEW: Product image
  image_url?: string
  thumbnail_url?: string
  // ✅ NEW: Tracking information
  tracking_numbers?: string[]
  tracking_urls?: string[]
  shipped_at?: string
  delivered_at?: string
  packed_at?: string
  shipping_provider?: string
  has_tracking?: boolean
  // ✅ NEW: Fulfillment type
  fulfillment_type?: 'creator' | 'junooni'
  item_fulfillment_type?: string
  // ✅ NEW: Fulfillment and shipment data
  fulfillment_id?: string
  fulfillment_status?: 'pending' | 'fulfilled' | 'shipped' | 'delivered'
  shipment_id?: string
  can_ship?: boolean
}

interface ClaimItem {
  id: string
  item_id: string
  claim_order_id: string
  quantity: number
  reason: string
  created_at: string
}

interface ReturnItem {
  id: string
  item_id: string
  return_id: string
  quantity: number
  reason?: string
  received_quantity?: number
  created_at: string
}

interface ShippingMethod {
  id: string
  name: string
  amount: number
}

// ✅ Enhanced PaymentCollection interface
interface PaymentCollection {
  id: string
  status: string
  amount: number
  captured_amount?: number
  refunded_amount?: number
  authorized_amount?: number
  currency_code?: string
  created_at?: string
  completed_at?: string
}

// ✅ Updated Order interface for vendor-filtered data
interface VendorOrder {
  id: string
  display_id: number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  shipping_address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  created_at: string
  
  // ✅ Vendor-specific totals
  vendor_total: number
  vendor_subtotal: number
  vendor_shipping_total: number
  vendor_tax_total: number
  
  status: string
  vendor_items: OrderItem[] // ✅ Only vendor's items
  payment_status: string
  fulfillment_status: string
  currency_code: string
  shipping_methods: ShippingMethod[]
  payment_collections: PaymentCollection[]
  
  // ✅ Vendor information
  vendor_id: string
  vendor_handle: string
  original_order_id: string
  vendor_payment_amount: number
  
  // ✅ Claims and returns from backend
  claims?: any[]
  returns?: any[]
  claim_items?: any[]
  return_items?: any[]
  has_claims?: boolean
  has_returns?: boolean
}

const calculateCustomerTotalPayment = (order: VendorOrder, originalItems: OrderItem[], returnedItems: OrderItem[], replacementItems: OrderItem[]) => {
  
  // Calculate base product totals
  const originalTotal = originalItems.reduce((sum, item) => sum + item.total, 0);
  const returnedTotal = returnedItems.reduce((sum, item) => sum + item.total, 0);
  const replacementTotal = replacementItems.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate net product total
  const netProductTotal = (() => {
    const hasReturns = returnedItems.length > 0;
    const hasReplacements = replacementItems.length > 0;
    const hasOriginals = originalItems.length > 0;
    
    if (hasReplacements && !hasReturns) {
      return originalTotal + replacementTotal; // Original + replacements
    } else if (hasReturns && !hasReplacements) {
      return originalTotal; // Original - returns
    } else if (hasReturns && hasReplacements && !hasOriginals) {
      return replacementTotal; // Only replacements
    } else if (hasReturns && !hasReplacements && hasOriginals) {
      return originalTotal; // Only replacements
    } else if (hasReturns && hasReplacements) {
      return originalTotal - returnedTotal + replacementTotal; // All changes
    }
    return originalTotal; // No changes
  })();
  
  
  // ✅ OPTION 1: Use backend tax/shipping values (recommended)
  const useBackendValues = true;
  if (useBackendValues) {
    // Backend should have already calculated adjusted tax and shipping for the net order
    //const customerTotal = netProductTotal + order.vendor_tax_total + order.vendor_shipping_total;
    const customerTotal = (() => {
      const hasReturns = returnedItems.length > 0;
      const hasReplacements = replacementItems.length > 0;
      const hasOriginals = originalItems.length > 0;
    
    if (hasReplacements && !hasReturns && hasOriginals) {
      return -netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // Original + replacements
    } else if (hasReturns && !hasReplacements && hasOriginals) {
      return netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // Original - returns
    }else if (hasReturns && hasOriginals && hasReplacements) {
      return netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // Original - returns
    } else if (hasReturns && !hasReplacements && hasOriginals) {
      return  netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // Only replacements
    } else if (hasReturns && hasReplacements) {
      return netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // All changes
    }
    return netProductTotal + order.vendor_tax_total;  //order.vendor_shipping_total; // No changes
  })();
    
    
    return customerTotal;
  }
  
  else {
   
    const originalTaxRate = originalTotal > 0 ? order.vendor_tax_total / originalTotal : 0;
    
   
    const finalTax = netProductTotal * originalTaxRate;
    
    const finalShipping = order.vendor_shipping_total;
    
    // ✅ ALWAYS add: net products + tax + shipping
    const customerTotal = -netProductTotal + finalTax; //+ finalShipping;
    
       
    return customerTotal;
  }
};

// Add this helper function at the top of your OrderDetails component, after the imports
const getVendorSpecificClaimsReturns = (vendorItems, claims, returns, claimItems, returnItems) => {
  // Check if any of this vendor's items are involved in claims
  const vendorHasClaims = vendorItems.some(item => 
    item.is_claim_item || 
    item.claim_status === 'returned' || 
    item.claim_status === 'replaced' ||
    claimItems?.some(claimItem => claimItem.item_id === item.id)
  );
  
  // Check if any of this vendor's items are involved in returns
  const vendorHasReturns = vendorItems.some(item => 
    item.return_status === 'requested' ||
    item.claim_status === 'returned' ||
    returnItems?.some(returnItem => returnItem.item_id === item.id)
  );
  
  // Get vendor-specific claims (only claims that affect this vendor's items)
  const vendorClaims = claims?.filter(claim => 
    claim.claim_items?.some(claimItem => 
      vendorItems.some(vendorItem => vendorItem.id === claimItem.item_id)
    ) ||
    claim.additional_items?.some(additionalItem =>
      vendorItems.some(vendorItem => vendorItem.id === additionalItem.item_id)
    )
  ) || [];
  
  // Get vendor-specific returns (only returns that affect this vendor's items)
  const vendorReturns = returns?.filter(returnOrder =>
    returnOrder.items?.some(returnItem =>
      vendorItems.some(vendorItem => vendorItem.id === returnItem.item_id)
    )
  ) || [];
  
  // Count vendor-specific items
  const vendorReturnItemCount = vendorItems.filter(item => 
    item.claim_status === 'returned' || item.return_status === 'requested'
  ).length;
  
  const vendorReplacementItemCount = vendorItems.filter(item => 
    item.is_claim_item === true
  ).length;
  
  return {
    vendorHasClaims,
    vendorHasReturns,
    vendorClaims,
    vendorReturns,
    vendorReturnItemCount,
    vendorReplacementItemCount
  };
};

// ✅ ADD THESE FUNCTIONS HERE:
// Helper functions to categorize items by fulfillment type
// ✅ ADD THESE FUNCTIONS HERE:
// Helper functions to categorize items by fulfillment type
const categorizeItemsByFulfillment = (items: OrderItem[]) => {
  const creatorItems = items.filter(item => item.fulfillment_type === 'creator');
  const junooniFulfillmentItems = items.filter(item => item.fulfillment_type === 'junooni');
  
  return { creatorItems, junooniFulfillmentItems };
};

// ✅ UPDATED: Enhanced Tracking Info Component with shipment details
const TrackingInfo = ({ item }: { item: OrderItem }) => {
  const formatTrackingNumber = (trackingNumber: string) => {
    // If tracking number is a URL, extract just the number part
    if (trackingNumber.includes('http') || trackingNumber.includes('tracking/')) {
      const match = trackingNumber.match(/(\d+)$/);
      return match ? match[1] : trackingNumber;
    }
    return trackingNumber;
  };

  const isTrackingUrl = (trackingNumber: string) => {
    return trackingNumber.includes('http') || trackingNumber.includes('tracking/');
  };

  // ✅ Show tracking info for shipped items with updated metadata
  if (item.fulfillment_status === 'shipped' || item.shipped_at) {
    const trackingInfo = {
      tracking_number: item.tracking_numbers?.[0] || 'N/A',
      tracking_url: item.tracking_urls?.[0] || '#',
      carrier: item.shipping_provider || 'Unknown',
      shipped_date: item.shipped_at
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium text-green-600">
          <Truck className="w-4 h-4 mr-2" />
          Shipped
        </div>
        
        <div className="p-3 border border-green-200 rounded bg-green-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Tracking Number:</span>
              {trackingInfo.tracking_url && trackingInfo.tracking_url !== '#' ? (
                <a
                  href={trackingInfo.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {trackingInfo.tracking_number}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <span className="font-mono text-gray-700">{trackingInfo.tracking_number}</span>
              )}
            </div>
            
            {trackingInfo.carrier && trackingInfo.carrier !== 'Unknown' && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Carrier:</span>
                <span className="capitalize">{trackingInfo.carrier}</span>
              </div>
            )}
            
            {trackingInfo.shipped_date && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Shipped:</span>
                <span>{formatDate(trackingInfo.shipped_date).split(',')[0]}</span>
              </div>
            )}
            
            {item.delivered_at && (
              <div className="flex items-center mt-1 text-xs text-green-600">
                <CircleCheck className="w-3 h-3 mr-1" />
                Delivered on {formatDate(item.delivered_at).split(',')[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // ✅ Show fulfillment info if item is fulfilled but not yet shipped
  if (item.fulfillment_status === 'fulfilled' && !item.shipment_id) {
    return (
      <div className="space-y-1">
        <div className="flex items-center text-sm font-medium text-blue-600">
          <Package className="w-4 h-4 mr-2" />
          Fulfilled - Ready to Ship
        </div>
        <div className="text-xs text-gray-500">
          Item has been prepared and is ready for shipment
        </div>
      </div>
    );
  }
  
  // ✅ Default case - no tracking or basic status
  if (!item.has_tracking || !item.tracking_numbers || item.tracking_numbers.length === 0) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-400">
          {item.fulfillment_status === 'pending' ? 'Awaiting fulfillment' : 'No tracking available'}
        </div>
        
        {/* Show shipping status if available */}
        {item.delivered_at && (
          <div className="flex items-center text-xs text-green-600">
            <CircleCheck className="w-3 h-3 mr-1" />
            Delivered
          </div>
        )}
        {!item.delivered_at && item.shipped_at && (
          <div className="flex items-center text-xs text-blue-600">
            <Truck className="w-3 h-3 mr-1" />
            Shipped
          </div>
        )}
        {!item.shipped_at && item.packed_at && (
          <div className="flex items-center text-xs text-orange-600">
            <Package className="w-3 h-3 mr-1" />
            Packed
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {item.tracking_numbers.map((trackingNumber, index) => {
        const correspondingUrl = item.tracking_urls?.[index];
        const displayNumber = formatTrackingNumber(trackingNumber);
        
        return (
          <div key={index} className="flex items-center text-xs">
            <Truck className="w-3 h-3 mr-1 text-gray-400" />
            {isTrackingUrl(trackingNumber) || correspondingUrl ? (
              <a
                href={isTrackingUrl(trackingNumber) ? trackingNumber : correspondingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {displayNumber}
              </a>
            ) : (
              <span className="text-gray-600">{displayNumber}</span>
            )}
            {correspondingUrl && !isTrackingUrl(trackingNumber) && (
              <a
                href={correspondingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      })}
      
      {/* Show shipping status */}
      {item.delivered_at && (
        <div className="flex items-center text-xs text-green-600">
          <CircleCheck className="w-3 h-3 mr-1" />
          Delivered
        </div>
      )}
      {!item.delivered_at && item.shipped_at && (
        <div className="flex items-center text-xs text-blue-600">
          <Truck className="w-3 h-3 mr-1" />
          Shipped
        </div>
      )}
      {!item.shipped_at && item.packed_at && (
        <div className="flex items-center text-xs text-orange-600">
          <Package className="w-3 h-3 mr-1" />
          Packed
        </div>
      )}
    </div>
  );
};

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
      case "authorized":
      case "captured":
      case "paid":
        return { 
          variant: "outline" as const, 
          className: "text-green-700 bg-green-50 border-green-200 font-medium",
          icon: <CreditCard className="w-3 h-3 mr-1" />
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
      case "authorized":
        return "Authorized";
      case "captured":
        return "Paid";
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

// ✅ Cost Breakdown Modal Component
// ✅ Helper function to categorize items
const categorizeOrderItems = (items: OrderItem[]) => {
  const originalItems = items.filter(item => 
    item.claim_status === 'active' && !item.is_claim_item
  );
  
  const returnedItems = items.filter(item => 
    item.claim_status === 'returned'
  );
  
  const replacementItems = items.filter(item => 
    item.is_claim_item === true
  );
  
  return { originalItems, returnedItems, replacementItems };
};

// ✅ Helper function to calculate category totals
const calculateCategoryTotals = (items: OrderItem[], currencyCode: string) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, count, items };
};

// ✅ Updated Cost Breakdown Modal Component
// ✅ FIXED: Calculate accurate vendor profit based on actual payout amounts
const CostBreakdownModal = ({ order, isOpen, onClose }: { 
  order: VendorOrder, 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  const { originalItems, returnedItems, replacementItems } = categorizeOrderItems(order.vendor_items);
  
  const originalTotals = calculateCategoryTotals(originalItems, order.currency_code);
  const returnedTotals = calculateCategoryTotals(returnedItems, order.currency_code);
  const replacementTotals = calculateCategoryTotals(replacementItems, order.currency_code);
  
  // ✅ NEW: Calculate vendor payout amounts (not just product prices)
  const calculateVendorPayoutTotals = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      const vendorPayoutPerItem = item.product_cost && item.product_cost > 0 
        ? item.unit_price - item.product_cost 
        : item.unit_price * 0.7;
      
      return total + (vendorPayoutPerItem * item.quantity);
    }, 0);
  };

  const originalVendorPayout = calculateVendorPayoutTotals(originalItems);
  const returnedVendorPayout = calculateVendorPayoutTotals(returnedItems);
  const replacementVendorPayout = calculateVendorPayoutTotals(replacementItems);
  
  // ✅ Calculate net vendor profit (actual payout amounts)
  //const netVendorProfit = originalVendorPayout - returnedVendorPayout + replacementVendorPayout;
  const netVendorProfit = (() => {
    const hasReturns = returnedItems.length > 0;
    const hasReplacements = replacementItems.length > 0;
    
    if (hasReplacements && !hasReturns) {
      return originalVendorPayout - replacementVendorPayout; // Original + replacements
    } else if (hasReturns && !hasReplacements) {
      return originalVendorPayout; // Original - returns
    } else if (hasReturns && hasReplacements) {
      return originalVendorPayout - replacementVendorPayout; // All changes
    }
    return originalVendorPayout; // No changes
  })();

  // Calculate net totals for display
  const netSubtotal = (() => {
    const hasReturns = returnedItems.length > 0;
    const hasOriginals = originalItems.length > 0;
    const hasReplacements = replacementItems.length > 0;
    
    if (hasReplacements && !hasReturns) {
      return originalTotals.subtotal + replacementTotals.subtotal; // Original + replacements
    } else if (hasReturns && !hasReplacements) {
      return originalTotals.subtotal - returnedTotals.subtotal; // Original - returns
    }
      else if (hasReturns && hasReplacements && !hasOriginals) {
      return replacementTotals.subtotal; // Original - returns
    } else if (hasReturns && hasReplacements) {
      return originalTotals.subtotal - returnedTotals.subtotal + replacementTotals.subtotal; // All changes
    }
    return originalTotals.subtotal; // No changes
  })();

  const netItemCount = (() => {
    const hasReturns = returnedItems.length > 0;
    const hasReplacements = replacementItems.length > 0;
    
    if (hasReplacements && !hasReturns) {
      return originalTotals.count + replacementTotals.count; // Original + replacements
    } else if (hasReturns && !hasReplacements) {
      return originalTotals.count; // Original - returns
    } else if (hasReturns && hasReplacements) {
      return originalTotals.count + replacementTotals.count; // All changes
    }
    return originalTotals.count; // No changes
  })();

  const renderItemSection = (items: OrderItem[], title: string, isDeduction = false, isAddition = false) => {
    if (items.length === 0) return null;
    
    const sectionColor = isDeduction ? 'red' : isAddition ? 'green' : 'gray';
    const bgColor = isDeduction ? 'bg-red-50' : isAddition ? 'bg-green-50' : 'bg-gray-50';
    const textColor = isDeduction ? 'text-red-800' : isAddition ? 'text-green-800' : 'text-gray-800';
    
    return (
      <div className={`p-3 rounded-lg ${bgColor} border border-${sectionColor}-200`}>
        <h4 className={`font-medium ${textColor} mb-2 flex items-center`}>
          {isDeduction && <span className="mr-1">↩</span>}
          {isAddition && <span className="mr-1">🔄</span>}
          {title}
        </h4>
        <div className="space-y-2">
          {items.map((item, index) => {
            const vendorPayoutPerItem = item.product_cost && item.product_cost > 0 
              ? item.unit_price - item.product_cost 
              : item.unit_price * 0.7;
            
            const totalVendorPayout = vendorPayoutPerItem * item.quantity;
            const displayTotal = isDeduction ? -item.total : item.total;
            const displayPayout = isDeduction ? -totalVendorPayout : totalVendorPayout;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      ({isDeduction ? '-' : ''}{item.quantity} {item.quantity > 1 ? 'items' : 'item'})
                    </span>
                    <span className={`font-medium ${isDeduction ? 'text-red-600' : isAddition ? 'text-green-600' : 'text-gray-900'}`}>
                      {isDeduction ? '-' : ''}{formatPrice(item.total, order.currency_code)}
                    </span>
                  </div>
                </div>
                {item.subtitle && (
                  <div className="ml-0 text-sm text-gray-500">{item.subtitle}</div>
                )}
                {(item.return_reason || item.claim_reason) && (
                  <div className="ml-0 text-xs text-gray-500">
                    Reason: {item.return_reason || item.claim_reason}
                  </div>
                )}
                <div className={`p-2 ml-0 text-xs rounded ${bgColor}`}>
                  {item.product_cost && item.product_cost > 0 ? (
                    <span className="text-gray-600">
                      Product price - Product cost = Your payout<br/>
                      {formatPrice(item.unit_price, order.currency_code)} - {formatPrice(item.product_cost, order.currency_code)} = 
                      <span className={`font-medium ml-1 ${isDeduction ? 'text-red-600' : isAddition ? 'text-green-600' : 'text-gray-600'}`}>
                        {isDeduction ? '-' : ''}{formatPrice(vendorPayoutPerItem, order.currency_code)}
                      </span>
                      {item.quantity > 1 && (
                        <>
                          <br/>Total: {isDeduction ? '-' : ''}{formatPrice(vendorPayoutPerItem, order.currency_code)} × {item.quantity} = 
                          <span className={`font-medium ml-1 ${isDeduction ? 'text-red-600' : isAddition ? 'text-green-600' : 'text-gray-600'}`}>
                            {isDeduction ? '-' : ''}{formatPrice(totalVendorPayout, order.currency_code)}
                          </span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      Product price × 70% = Your payout<br/>
                      {formatPrice(item.unit_price, order.currency_code)} × 70% = 
                      <span className={`font-medium ml-1 ${isDeduction ? 'text-red-600' : isAddition ? 'text-green-600' : 'text-gray-600'}`}>
                        {isDeduction ? '-' : ''}{formatPrice(vendorPayoutPerItem, order.currency_code)}
                      </span>
                      {item.quantity > 1 && (
                        <>
                          <br/>Total: {isDeduction ? '-' : ''}{formatPrice(vendorPayoutPerItem, order.currency_code)} × {item.quantity} = 
                          <span className={`font-medium ml-1 ${isDeduction ? 'text-red-600' : isAddition ? 'text-green-600' : 'text-gray-600'}`}>
                            {isDeduction ? '-' : ''}{formatPrice(totalVendorPayout, order.currency_code)}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold">Costs breakdown</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div>
            <h3 className="mb-3 font-medium text-gray-800">Product costs breakdown</h3>
            <div className="space-y-2">
              {/* Original Items */}
              {renderItemSection(originalItems, `Original Order (${originalTotals.count} ${originalTotals.count === 1 ? "item" : "items"})`)}
              
              {/* Returned Items */}
              {renderItemSection(returnedItems, `Returned Items (${returnedTotals.count} ${returnedTotals.count === 1 ? "item" : "items"})`, true)}
              
              {/* Replacement Items */}
              {renderItemSection(replacementItems, `Replacement Items (${replacementTotals.count} ${replacementTotals.count === 1 ? "item" : "items"})`, false, true)}
            </div>
          </div>

          <Separator />

          {/* ✅ UPDATED: Summary Section with Vendor Payout Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Customer Payment Summary</h4>
            
            {originalItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Original products total</span>
                <span>{formatPrice(originalTotals.subtotal, order.currency_code)}</span>
              </div>
            )}
            
            {returnedItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">Returned products deduction</span>
                <span className="text-red-600">-{formatPrice(returnedTotals.subtotal, order.currency_code)}</span>
              </div>
            )}
            
            {replacementItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Replacement products addition</span>
                <span className="text-green-600">+{formatPrice(replacementTotals.subtotal, order.currency_code)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-center justify-between font-bold">
              <span>Net customer payment ({netItemCount} {netItemCount === 1 ? "item" : "items"})</span>
              <span>{formatPrice(netSubtotal, order.currency_code)}</span>
            </div>
            <div className="text-xs text-gray-500">
              (without any taxes or shipping costs)
            </div>
          </div>

          <Separator />

          {/* ✅ NEW: Vendor Payout Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Your Payout Breakdown</h4>
            
            {originalItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your payout from existing items</span>
                <span className="text-green-600">+{formatPrice(order.payment_status === "refunded" ? 0 : originalVendorPayout, order.currency_code)}</span>
              </div>
            )}
            
            {returnedItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">Payout lost from returns</span>
                <span className="text-red-600">-{formatPrice(returnedVendorPayout, order.currency_code)}</span>
              </div>
            )}
            
            {replacementItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Payout from replacements</span>
                <span className="text-green-600">+{formatPrice(replacementVendorPayout, order.currency_code)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Your total profit</span>
              <span className="text-green-600">
                +{formatPrice(order.payment_status === "refunded" ? 0 : Math.abs(netVendorProfit), order.currency_code)}
              </span>
            </div>
          </div>

          {/* ✅ UPDATED: Info Notice */}
          {(returnedItems.length > 0 || replacementItems.length > 0) && (
            <div className="p-3 text-xs text-blue-800 border border-blue-200 rounded-md bg-blue-50">
              <div className="flex items-center">
                <Info className="w-3 h-3 mr-1" />
                <span>
                  This order includes {returnedItems.length > 0 ? 'returns' : ''} 
                  {returnedItems.length > 0 && replacementItems.length > 0 ? ' and ' : ''}
                  {replacementItems.length > 0 ? 'replacements' : ''}. 
                  Your profit calculation considers actual payout amounts after product costs and commissions.
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ✅ UPDATED: Create Shipment Modal Component with correct API structure
const CreateShipmentModal = ({ 
  isOpen, 
  onClose, 
  item, 
  order, 
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  labelUrl,
  setLabelUrl,
  onCreateShipment, 
  loading,
  error,
  success
}: {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
  order: VendorOrder;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  carrier: string;
  setCarrier: (value: string) => void;
  labelUrl: string;
  setLabelUrl: (value: string) => void;
  onCreateShipment: () => void;
  loading: boolean;
  error?: string;
  success?: boolean;
}) => {
  if (!item) return null;

  const carriers = [
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'usps', label: 'USPS' },
    { value: 'bluedart', label: 'Blue Dart' },
    { value: 'dtdc', label: 'DTDC' },
    { value: 'aramex', label: 'Aramex' },
    { value: 'ecom', label: 'Ecom Express' },
    { value: 'delhivery', label: 'Delhivery' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-full max-w-2xl h-auto max-h-[100vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold">
            <Truck className="w-5 h-5 mr-2" style={{ color: BRAND.primary }} />
            Create Shipment
          </DialogTitle>
          <DialogDescription>
            Create shipment label and add tracking information for this fulfilled item
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 pr-2 space-y-3 overflow-y-auto">
          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Shipment created successfully! Tracking information has been updated.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Order Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Order Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{order.display_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fulfillment ID:</span>
                <span className="font-mono text-xs">{item.fulfillment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{order.customer.first_name} {order.customer.last_name}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Product Details</h4>
            <div className="flex items-center space-x-3">
              {item.image_url || item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title}
                  className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                {item.subtitle && <div className="text-sm text-gray-500">{item.subtitle}</div>}
                <div className="text-sm text-gray-500">SKU: {item.variant_sku}</div>
                <div className="text-sm font-medium">Quantity: {item.quantity}</div>
              </div>
            </div>
          </div>

          {/* Shipping Information Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="carrier" className="text-sm font-medium text-gray-700">
                Shipping Carrier *
              </Label>
              <select
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a carrier</option>
                {carriers.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose the shipping carrier for this shipment
              </p>
            </div>

            <div>
              <Label htmlFor="tracking-number" className="text-sm font-medium text-gray-700">
                Tracking Number *
              </Label>
              <Input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1"
                placeholder="Enter tracking number"
              />
              <p className="mt-1 text-xs text-gray-500">
                The tracking number provided by the shipping carrier
              </p>
            </div>

            <div>
              <Label htmlFor="label-url" className="text-sm font-medium text-gray-700">
                Shipping Label URL (optional)
              </Label>
              <Input
                id="label-url"
                type="url"
                value={labelUrl}
                onChange={(e) => setLabelUrl(e.target.value)}
                className="mt-1"
                placeholder="https://example.com/label.pdf"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL to the shipping label PDF (if available)
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Shipping Address</h4>
            {order.shipping_address && (
              <div className="space-y-1 text-sm">
                <div className="font-medium">{order.shipping_address.line1}</div>
                {order.shipping_address.line2 && (
                  <div className="text-gray-600">{order.shipping_address.line2}</div>
                )}
                <div className="text-gray-600">
                  {order.shipping_address.city && `${order.shipping_address.city}, `}
                  {order.shipping_address.state && `${order.shipping_address.state} `}
                  {order.shipping_address.postal_code}
                </div>
                <div className="text-gray-600">{order.shipping_address.country}</div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <div className="text-sm text-blue-800">
              <div className="mb-1 font-medium">Shipment Summary:</div>
              <div>• Item: {item.title}</div>
              <div>• Quantity: {item.quantity} items</div>
              <div>• Carrier: {carrier || 'Not selected'}</div>
              <div>• Tracking: {trackingNumber || 'Not provided'}</div>
              <div>• Label URL: {labelUrl || 'Not provided'}</div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-sm text-gray-700">
              <div className="mb-1 font-medium">Important Notes:</div>
              <ul className="space-y-1 text-xs">
                <li>• Customer will receive tracking information via email</li>
                <li>• Shipment status will be automatically updated</li>
                <li>• Ensure tracking number is correct before submitting</li>
                <li>• Label URL is optional but helpful for record keeping</li>
                <li>• This action marks the items as shipped</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={onCreateShipment} 
              disabled={loading || !carrier || !trackingNumber.trim()}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Create Shipment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
const ConfirmOrderModal = ({ 
  isOpen, 
  onClose, 
  item, 
  order, 
  confirmQuantity, 
  setConfirmQuantity, 
  cancelQuantity, 
  setCancelQuantity, 
  onConfirm, 
  loading,
  error,
  success
}: {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
  order: VendorOrder;
  confirmQuantity: string;
  setConfirmQuantity: (value: string) => void;
  cancelQuantity: string;
  setCancelQuantity: (value: string) => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string;
  success?: boolean;
}) => {
  if (!item) return null;

  const maxQuantity = item.quantity;
  const confirmQty = parseInt(confirmQuantity) || 0;
  const cancelQty = parseInt(cancelQuantity) || 0;
  const totalQty = confirmQty + cancelQty;

  const isValidQuantity = confirmQty > 0 && totalQty <= maxQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-full max-w-3xl h-auto max-h-[100vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold">
            <Package className="w-5 h-5 mr-2" style={{ color: BRAND.primary }} />
            Confirm Order Fulfillment
          </DialogTitle>
          <DialogDescription>
            Confirm fulfillment details for this item
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 pr-2 space-y-3 overflow-y-auto">
          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Fulfillment request submitted successfully! The order will be processed and tracking information will be updated.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Order Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Order Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{order.display_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{formatDate(order.created_at).split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{order.customer.first_name} {order.customer.last_name}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="mb-2 font-medium text-gray-800">Product Details</h4>
            <div className="flex items-center space-x-3">
              {item.image_url || item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title}
                  className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                {item.subtitle && <div className="text-sm text-gray-500">{item.subtitle}</div>}
                <div className="text-sm text-gray-500">SKU: {item.variant_sku}</div>
                <div className="text-sm font-medium">Available Quantity: {maxQuantity}</div>
              </div>
            </div>
          </div>

          {/* Quantity Input Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="confirm-quantity" className="text-sm font-medium text-gray-700">
                Quantity to fulfill and ship *
              </Label>
              <Input
                id="confirm-quantity"
                type="number"
                min="0"
                max={maxQuantity}
                value={confirmQuantity}
                onChange={(e) => setConfirmQuantity(e.target.value)}
                className={`mt-1 ${!isValidQuantity && confirmQty > 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Enter quantity to fulfill"
              />
              <p className="mt-1 text-xs text-gray-500">
                Items that will be prepared for shipping
              </p>
            </div>

            <div>
              <Label htmlFor="cancel-quantity" className="text-sm font-medium text-gray-700">
                Quantity to cancel (optional)
              </Label>
              <Input
                id="cancel-quantity"
                type="number"
                min="0"
                max={maxQuantity}
                value={cancelQuantity}
                onChange={(e) => setCancelQuantity(e.target.value)}
                className="mt-1"
                placeholder="Enter quantity to cancel (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Items that will be canceled and refunded to customer
              </p>
            </div>
          </div>

          {/* Quantity Validation */}
          {totalQty > maxQuantity && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Total quantity ({totalQty}) cannot exceed available quantity ({maxQuantity})
              </AlertDescription>
            </Alert>
          )}

          {confirmQty <= 0 && confirmQuantity !== "" && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Please enter a valid quantity to fulfill (greater than 0)
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <div className="text-sm text-blue-800">
              <div className="mb-1 font-medium">Fulfillment Summary:</div>
              <div>• Will fulfill and ship: {confirmQty} items</div>
              <div>• Will cancel and refund: {cancelQty} items</div>
              <div>• Remaining unfulfilled: {maxQuantity - totalQty} items</div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-sm text-gray-700">
              <div className="mb-1 font-medium">Important Notes:</div>
              <ul className="space-y-1 text-xs">
                <li>• Fulfilled items will be prepared for shipping</li>
                <li>• You'll receive tracking information once items are shipped</li>
                <li>• Canceled items will be automatically refunded to the customer</li>
                <li>• This action cannot be undone once confirmed</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={loading || !isValidQuantity}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Fulfillment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrderDetails = () => {
const { id } = useParams({ from: '/_authenticated/orders/$id' })
const [order, setOrder] = useState<VendorOrder | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [showCostBreakdown, setShowCostBreakdown] = useState(false)
const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
const [confirmQuantity, setConfirmQuantity] = useState('')
const [cancelQuantity, setCancelQuantity] = useState('')
const [fulfillmentLoading, setFulfillmentLoading] = useState(false)
const [fulfillmentError, setFulfillmentError] = useState<string>('')
const [fulfillmentSuccess, setFulfillmentSuccess] = useState(false)
// Add this with your other state declarations
const [labelUrl, setLabelUrl] = useState('')

// ✅ NEW: Shipment state management
const [showMarkAsShippedModal, setShowMarkAsShippedModal] = useState(false)
const [selectedShipmentItem, setSelectedShipmentItem] = useState<OrderItem | null>(null)
const [trackingNumber, setTrackingNumber] = useState('')
const [carrier, setCarrier] = useState('')
const [trackingUrl, setTrackingUrl] = useState('')
const [shipmentLoading, setShipmentLoading] = useState(false)
const [shipmentError, setShipmentError] = useState<string>('')
const [shipmentSuccess, setShipmentSuccess] = useState(false)
// Add this after your useState declarations and before the return statement
const { creatorItems, junooniFulfillmentItems } = order ? categorizeItemsByFulfillment(order.vendor_items) : { creatorItems: [], junooniFulfillmentItems: [] };
  
  useEffect(() => {
  const fetchVendorOrderDetails = async () => {
    try {
      const token = localStorage.getItem("vendorToken")
      
      if (!token) {
        setError("Authentication required. Please log in.")
        setLoading(false)
        return
      }

     const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Order ${id} not found or doesn't contain your products`)
        }
        throw new Error(`Error fetching order: ${response.statusText}`)
      }
      
      const data = await response.json()
    
      
      if (!data.order) {
        throw new Error(`No order data returned for order ${id}`)
      }
      
      // ✅ Transform the vendor-filtered order data with claims/returns
      const transformedOrder = transformVendorOrderDataWithClaims(data.order)
      setOrder(transformedOrder)
      
    } catch (err: any) {
    
      setError(err.message || "Failed to load order details")
    } finally {
      setLoading(false)
    }
  }
  
  fetchVendorOrderDetails()
}, [id])
  

  const transformVendorOrderDataWithClaims = (orderData: any): VendorOrder => {
    
    // Use vendor-specific totals from filtered data
    const vendorTotal = orderData.vendor_total || 0
    const vendorSubtotal = orderData.vendor_subtotal || 0
    const vendorShipping = orderData.vendor_shipping_total || 0
    const vendorTax = orderData.vendor_tax_total || 0
    
    // ✅ ENHANCED: Transform vendor items with claim/return status from backend + tracking + images
  const vendorItems: OrderItem[] = (orderData.vendor_items || []).map((item: any, index: number) => {
    const unitPrice = 
      (typeof item.unit_price === 'number') ? item.unit_price :
      (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
      (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0
    
    const quantity = item.quantity || 1
      
      // ✅ Extract product_cost (enhanced from backend)
    let productCost = 0;
    if (typeof item.product_cost === 'number') {
      productCost = item.product_cost;
    } else if (typeof item.product_cost === 'string') {
      productCost = parseFloat(item.product_cost) || 0;
    } else if (item.merged_metadata?.product_cost) {
      productCost = typeof item.merged_metadata.product_cost === 'number' 
        ? item.merged_metadata.product_cost 
        : parseFloat(item.merged_metadata.product_cost) || 0;
    }
      
      // Get subtitle from various fields
      let subtitle = "";
      if (item.subtitle) {
        subtitle = item.subtitle;
      } else if (item.variant?.title) {
        subtitle = item.variant.title;
      } else if (item.variant_title) {
        subtitle = item.variant_title;
      } else {
        subtitle = "Handcrafted Item"; // Default for Junooni
      }
      
      // ✅ FIXED: Extract image URLs from various sources including 'thumbnail' field
      let imageUrl = "";
      let thumbnailUrl = "";

      // Try to get image from various backend fields
      if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.product_image) {
        imageUrl = item.product_image;
      } else if (item.thumbnail) {  // ✅ ADD: Check for 'thumbnail' field
        imageUrl = item.thumbnail;
      } else if (item.variant?.image_url) {
        imageUrl = item.variant.image_url;
      } else if (item.product?.image_url) {
        imageUrl = item.product.image_url;
      } else if (item.product?.images && item.product.images.length > 0) {
        imageUrl = item.product.images[0].url || item.product.images[0];
      } else if (item.variant?.product?.images && item.variant.product.images.length > 0) {
        imageUrl = item.variant.product.images[0].url || item.variant.product.images[0];
      }

      // For thumbnail, try specific thumbnail fields first, then fallback to main image
      if (item.thumbnail_url) {
        thumbnailUrl = item.thumbnail_url;
      } else if (item.thumbnail) {  // ✅ ADD: Check for 'thumbnail' field
        thumbnailUrl = item.thumbnail;
      } else if (item.product_thumbnail) {
        thumbnailUrl = item.product_thumbnail;
      } else if (item.variant?.thumbnail_url) {
        thumbnailUrl = item.variant.thumbnail_url;
      } else {
        thumbnailUrl = imageUrl; // Use main image as thumbnail fallback
      }
    
  // ✅ CORRECTED: Extract fulfillment type based on actual API response
let fulfillmentType: 'creator' | 'junooni' = 'creator'; // default to creator

// Check the actual field that contains fulfillment type data
if (item.item_fulfillment_type) {
  const fulfillmentValue = item.item_fulfillment_type.toLowerCase();
  if (fulfillmentValue.includes('junooni')) {
    fulfillmentType = 'junooni';
  } else if (fulfillmentValue.includes('creator')) {
    fulfillmentType = 'creator';
  }
} else if (item.fulfillment_type) {
  const fulfillmentValue = item.fulfillment_type.toLowerCase();
  if (fulfillmentValue.includes('junooni')) {
    fulfillmentType = 'junooni';
  } else if (fulfillmentValue.includes('creator')) {
    fulfillmentType = 'creator';
  }
}

   // ✅ FIXED: Properly detect fulfillment status from fulfillments array
let fulfillmentStatus = 'pending';
let fulfillmentId = null;
let packedAt = null;
let shippedAt = null;

// Check if this item exists in any fulfillment
const itemFulfillment = orderData.fulfillments?.find(fulfillment => 
  fulfillment.items?.some(fulItem => fulItem.line_item_id === item.id)
);

if (itemFulfillment) {
  fulfillmentId = itemFulfillment.id;
  packedAt = itemFulfillment.packed_at;
  shippedAt = itemFulfillment.shipped_at;
  
  if (itemFulfillment.shipped_at) {
    fulfillmentStatus = 'shipped';
  } else if (itemFulfillment.packed_at) {
    fulfillmentStatus = 'fulfilled'; // This is the key - packed means fulfilled and ready to ship
  } else if (itemFulfillment.created_at) {
    fulfillmentStatus = 'fulfilled';
  }
}
      return {
      id: item.id || `item_${index}`,
      title: item.title || item.product_title || "Unknown Product",
      subtitle: subtitle,
      quantity: quantity,
      unit_price: unitPrice,
      total: unitPrice * quantity,
      product_cost: productCost,
      variant_sku: item.variant_sku || item.sku || "",
      product_id: item.product_id || "",
      product_handle: item.product_handle || "",
      // ✅ Use claim/return status from backend
      claim_status: item.claim_status || 'active',
      return_status: item.return_status || 'none',
      is_claim_item: item.is_claim_item || false,
      claim_id: item.claim_id,
      return_id: item.return_id,
      return_reason: item.return_reason,
      claim_reason: item.claim_reason,
      // ✅ NEW: Include image URLs
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      // ✅ NEW: Use tracking information from backend
      tracking_numbers: item.tracking_numbers || [],
      tracking_urls: item.tracking_urls || [],
      //shipped_at: item.shipped_at,
      delivered_at: item.delivered_at,
      fulfillment_type: fulfillmentType,
      //packed_at: item.packed_at,
      shipping_provider: item.shipping_provider,
      has_tracking: item.has_tracking || false,
      // ✅ NEW: Fulfillment and shipment data
      fulfillment_id: fulfillmentId,
      fulfillment_status: fulfillmentStatus,
      packed_at: packedAt,
      shipped_at: shippedAt,
      can_ship: fulfillmentStatus === 'fulfilled' && !shippedAt,
      shipment_id: item.shipment_id,
      //shipped_at: item.shipped_at,
      //can_ship: fulfillmentStatus === 'fulfilled' && !item.shipped_at
    }
  })
  
     // Get shipping address
  const shippingAddress = {
    line1: orderData.shipping_address?.address_1 || orderData.shipping_address?.line1 || '',
    line2: orderData.shipping_address?.address_2 || orderData.shipping_address?.line2 || '',
    city: orderData.shipping_address?.city || '',
    state: orderData.shipping_address?.province || orderData.shipping_address?.state || '',
    postal_code: orderData.shipping_address?.postal_code || orderData.shipping_address?.zip_code || '',
    country: orderData.shipping_address?.country || 'India'
  }
    
    // Get display ID
  let display_id = 0;
  if (orderData.display_id) {
    display_id = orderData.display_id;
  } else {
    const allNumbers = orderData.id.match(/\d+/g);
    if (allNumbers && allNumbers.length > 0) {
      display_id = parseInt(allNumbers[allNumbers.length - 1]);
    }
  }
  
  // Get customer information
  const customer = {
    first_name: orderData.customer?.first_name || orderData.billing_address?.first_name || "Guest",
    last_name: orderData.customer?.last_name || orderData.billing_address?.last_name || "",
    email: orderData.customer?.email || orderData.email || "customer@example.com",
    phone: orderData.customer?.phone || orderData.billing_address?.phone || orderData.shipping_address?.phone || undefined
  }
    
     return {
    id: orderData.id,
    display_id: display_id,
    customer: customer,
    shipping_address: shippingAddress,
    created_at: orderData.created_at || new Date().toISOString(),
    
    vendor_total: vendorTotal,
    vendor_subtotal: vendorSubtotal,
    vendor_shipping_total: vendorShipping,
    vendor_tax_total: vendorTax,
    
    status: orderData.status || "pending",
    vendor_items: vendorItems,
    payment_status: orderData.payment_status || "pending",
    fulfillment_status: orderData.fulfillment_status || "not_fulfilled",
    currency_code: "INR",
    shipping_methods: [],
    payment_collections: [],
    
    vendor_id: orderData.vendor_id || "",
    vendor_handle: orderData.vendor_handle || "unknown",
    original_order_id: orderData.original_order_id || orderData.id,
    vendor_payment_amount: orderData.vendor_payment_amount || vendorTotal,
   
    // ✅ Include claims/returns from backend
    claims: orderData.claims || [],
    returns: orderData.returns || [],
    claim_items: orderData.claim_items || [],
    return_items: orderData.return_items || [],
    has_claims: orderData.has_claims || false,
    has_returns: orderData.has_returns || false
  }
}
  
  // ✅ UPDATED: Enhanced confirm order functionality with proper error handling
const handleConfirmOrder = async () => {
  if (!selectedItem || !order || !confirmQuantity) {
    setFulfillmentError('Please enter quantity to confirm');
    return;
  }
  
  setFulfillmentLoading(true);
  setFulfillmentError('');
  setFulfillmentSuccess(false);
  
  try {
    const token = localStorage.getItem("vendorToken");
    
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    const confirmQty = parseInt(confirmQuantity);
    const cancelQty = parseInt(cancelQuantity) || 0;
    
    // Validation
    if (confirmQty <= 0) {
      throw new Error("Confirm quantity must be greater than 0");
    }
    
    if (confirmQty + cancelQty > selectedItem.quantity) {
      throw new Error("Total quantity cannot exceed item quantity");
    }
    
    // ✅ UPDATED: Create fulfillment payload matching your backend API
    const fulfillmentPayload = {
      items: [
        {
          id: selectedItem.id,
          quantity: confirmQty
        }
      ],
      location_id: "sloc_01JKWDDGKGCQFJANXV0CVJN2QW",
      metadata: {
        vendor_id: order.vendor_id,
        vendor_handle: order.vendor_handle,
        fulfillment_type: selectedItem.fulfillment_type || "creator",
        confirmed_by: "vendor",
        confirmation_timestamp: new Date().toISOString()
      },
      additional_data: {
        item_details: {
          title: selectedItem.title,
          sku: selectedItem.variant_sku,
          product_id: selectedItem.product_id
        },
        vendor_notes: `Confirmed ${confirmQty} of ${selectedItem.quantity} items for fulfillment`
      }
    };
    
    // ✅ Create fulfillment using the exact endpoint from your route.ts
    const fulfillmentResponse = await fetch(`http://localhost:9000/vendors/orders/${order.original_order_id}/fulfillments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(fulfillmentPayload)
    });
    
    if (fulfillmentResponse.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    
    if (fulfillmentResponse.status === 403) {
      throw new Error("You don't have permission to fulfill this order.");
    }
    
    if (!fulfillmentResponse.ok) {
      let errorMessage = "Failed to create fulfillment";
      
      try {
        const errorText = await fulfillmentResponse.text(); 
        // Try to parse as JSON first
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If not JSON, use the text directly
          errorMessage = errorText || `${errorMessage}: ${fulfillmentResponse.statusText}`;
        }
      } catch (responseError) {
        errorMessage = `${errorMessage}: ${fulfillmentResponse.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    let fulfillmentData;
    try {
      const responseText = await fulfillmentResponse.text();
       fulfillmentData = JSON.parse(responseText);
    } catch (parseError) {
       // If we can't parse the response but the request was successful, continue
      fulfillmentData = { success: true };
    }
    
    
    // ✅ Handle cancellation if specified
    if (cancelQty > 0) {
      
      try {
        const cancelPayload = {
          items: [
            {
              item_id: selectedItem.id,
              quantity: cancelQty,
              reason: "vendor_cancellation",
              notes: "Vendor cannot fulfill partial quantity"
            }
          ]
        };
        
        const cancelResponse = await fetch(`http://localhost:9000/vendors/orders/${order.original_order_id}/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(cancelPayload)
        });
        
        if (!cancelResponse.ok) {
        // Don't throw here since the main fulfillment succeeded
        } else {
           }
      } catch (cancelError) {
        // Don't fail the whole operation for cancellation errors
      }
    }
    
    // Success!
    setFulfillmentSuccess(true);
    
    // Wait a moment to show success, then close and refresh
    setTimeout(() => {
      setShowConfirmOrderModal(false);
      setSelectedItem(null);
      setConfirmQuantity('');
      setCancelQuantity('');
      setFulfillmentSuccess(false);
      
      // Refresh the page to show updated order status
      window.location.reload();
    }, 2000);
    
  } catch (error: any) {
      setFulfillmentError(error.message || 'An unexpected error occurred');
  } finally {
    setFulfillmentLoading(false);
  }
};

// ✅ NEW: Handle opening confirm order modal with proper validation
const handleOpenConfirmModal = (item: OrderItem) => {
  // Check if item can be fulfilled
  if (item.fulfillment_type === 'junooni') {
    alert('This item is fulfilled by Junooni and cannot be confirmed by vendors.');
    return;
  }
  
  // Check fulfillment status
  if (order?.fulfillment_status === 'fulfilled' || order?.fulfillment_status === 'shipped') {
    alert('This order has already been fulfilled.');
    return;
  }
  
  setSelectedItem(item);
  setConfirmQuantity(item.quantity.toString());
  setCancelQuantity('0');
  setFulfillmentError('');
  setFulfillmentSuccess(false);
  setShowConfirmOrderModal(true);
};

const handleOpenShipmentModal = (item: OrderItem) => {
  // Check if item can be shipped - use fulfillment_status instead of fulfillment_id
  if (item.fulfillment_status !== 'fulfilled') {
    alert('This item must be fulfilled before it can be shipped.');
    return;
  }
  
  if (item.fulfillment_status === 'shipped' || item.shipped_at) {
    alert('This item has already been shipped.');
    return;
  }
  
  // Continue with the rest of the function...
  setSelectedShipmentItem(item);
  setTrackingNumber('');
  setCarrier('');
  setTrackingUrl('');
  setShipmentError('');
  setShipmentSuccess(false);
  setShowMarkAsShippedModal(true);
};

// ✅ UPDATED: Handle mark as shipped functionality
const handleMarkAsShipped = async () => {
  if (!selectedShipmentItem || !order || !trackingNumber.trim() || !carrier) {
    setShipmentError('Please fill in all required fields');
    return;
  }
  
  setShipmentLoading(true);
  setShipmentError('');
  setShipmentSuccess(false);
  
  try {
    const token = localStorage.getItem("vendorToken");
    
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }
  
    // ✅ FIXED: Create shipment payload matching backend API
// ✅ FIXED: Create shipment payload with proper label_url handling

// ✅ FIXED: Only include label_url if it has a value, don't send undefined
// ✅ SIMPLE FIX: Build the label object conditionally
const updatePayload = {
  labels: [
    {
      tracking_number: trackingNumber.trim(),
      tracking_url: trackingUrl.trim() || '', // Let backend generate if empty
      label_url: labelUrl.trim() || '', // Let backend generate if empty
      carrier: carrier // ✅ NEW: Pass carrier for better tracking URL generation
    }
  ]
};

   
    // ✅ Update fulfillment status to shipped with tracking info
        const updateResponse = await fetch(
      `http://localhost:9000/vendors/orders/${order.original_order_id}/fulfillments/${selectedShipmentItem.fulfillment_id}/shipment`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(updatePayload)
      }
    );
    
     if (updateResponse.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    
    if (updateResponse.status === 403) {
      throw new Error("You don't have permission to update this fulfillment.");
    }
    
    if (!updateResponse.ok) {
      let errorMessage = "Failed to mark as shipped";
      
      try {
        const errorText = await updateResponse.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || `${errorMessage}: ${updateResponse.statusText}`;
        }
      } catch (responseError) {
         errorMessage = `${errorMessage}: ${updateResponse.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    let updateData;
    try {
      const responseText = await updateResponse.text();
        updateData = JSON.parse(responseText);
    } catch (parseError) {
       updateData = { success: true };
    }
    
    
    // Success!
    setShipmentSuccess(true);
    
    // Wait a moment to show success, then close and refresh
    setTimeout(() => {
      setShowMarkAsShippedModal(false);
      setSelectedShipmentItem(null);
      setTrackingNumber('');
      setCarrier('');
      setTrackingUrl('');
      setShipmentSuccess(false);
      
      // Refresh the page to show updated shipping status
      window.location.reload();
    }, 2000);
    
  } catch (error: any) {
      setShipmentError(error.message || 'An unexpected error occurred');
  } finally {
    setShipmentLoading(false);
  }
};

// ✅ UPDATED: Generate tracking URL based on carrier (simplified)
const generateTrackingUrl = (carrier: string, trackingNumber: string): string => {
  // Basic tracking URL generation - vendors can override with custom URLs
  const trackingUrls = {
    'fedex': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'dhl': `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
    'bluedart': `https://www.bluedart.com/web/guest/trackdart?trackFor=0&trackNo=${trackingNumber}`,
    'dtdc': `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strTnumber=${trackingNumber}`,
    'aramex': `https://www.aramex.com/track/results?ShipmentNumber=${trackingNumber}`,
    'ecom': `https://ecomexpress.in/tracking/?awb_field=${trackingNumber}`,
    'delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`
  };
  
  // Return carrier-specific URL or a generic format
  return trackingUrls[carrier] || `https://track.aftership.com/${trackingNumber}`;
};

  // ✅ Updated invoice generation for vendor-specific data
  // ✅ FIXED: Enhanced invoice generation with proper currency formatting
const generateInvoice = () => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Helper function to format currency for PDF (avoiding encoding issues)
    const formatPriceForPDF = (amount: number) => {
      return `Rs. ${amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };
    
    const titleFontSize = 20;
    const headerFontSize = 12;
    const normalFontSize = 10;
    const smallFontSize = 8;
    
    // Add company logo/name
    doc.setFontSize(titleFontSize);
    doc.setTextColor(230, 81, 0); // BRAND.primary
    doc.text("JUNOONI", 20, 20);
    
    // Add vendor-specific invoice heading
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(`VENDOR INVOICE #${order.display_id}`, pageWidth - 20, 20, { align: "right" });
    
    // Add vendor info
    doc.setFontSize(normalFontSize);
    doc.text(`Vendor: ${order.vendor_handle}`, pageWidth - 20, 28, { align: "right" });
    
    const invoiceDate = formatDate(order.created_at).split(',')[0];
    doc.text(`Date: ${invoiceDate}`, pageWidth - 20, 36, { align: "right" });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 42, pageWidth - 20, 42);
    
    // Add vendor-specific note
    doc.setFontSize(normalFontSize);
    doc.setTextColor(230, 81, 0);
    doc.text("YOUR ORDER", 20, 52);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(smallFontSize);
    doc.text("This invoice shows only your products and your portion of the payment.", 20, 58);
    
    // Customer information
    doc.setFontSize(normalFontSize);
    doc.setFont("helvetica", "bold");
    doc.text("Customer:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(smallFontSize);
    doc.text(`${order.customer.first_name} ${order.customer.last_name}`.trim(), 20, 76);
    doc.text(`Email: ${order.customer.email}`, 20, 82);
    
    // Create table for vendor items only
    const tableColumn = ["Your Products", "Description", "Qty", "Unit Price", "Total"];
    const tableRows = [];
    
    // Add rows for vendor items only
    order.vendor_items.forEach(item => {
      const itemData = [
        item.title,
        item.subtitle || "",
        item.quantity.toString(),
        formatPriceForPDF(item.unit_price),
        formatPriceForPDF(item.total)
      ];
      tableRows.push(itemData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: "grid",
      styles: { 
        font: "helvetica", 
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [230, 230, 230], 
        textColor: [50, 50, 50],
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: {
        0: { cellWidth: 55, halign: "left" },
        1: { cellWidth: 45, halign: "left" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Add vendor-specific summary with better alignment
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Calculate summary values
    const { originalItems, returnedItems, replacementItems } = categorizeOrderItems(order.vendor_items);
    
    const calculateVendorPayoutTotals = (items: OrderItem[]) => {
      return items.reduce((total, item) => {
        const vendorPayoutPerItem = item.product_cost && item.product_cost > 0 
          ? item.unit_price - item.product_cost 
          : item.unit_price * 0.7;
        return total + (vendorPayoutPerItem * item.quantity);
      }, 0);
    };

    const originalVendorPayout = calculateVendorPayoutTotals(originalItems);
    const returnedVendorPayout = calculateVendorPayoutTotals(returnedItems);
    const replacementVendorPayout = calculateVendorPayoutTotals(replacementItems);
    
    const netVendorProfit = (() => {
      const hasReturns = returnedItems.length > 0;
      const hasReplacements = replacementItems.length > 0;
      
      if (hasReplacements && !hasReturns) {
        return originalVendorPayout - replacementVendorPayout;
      } else if (hasReturns && !hasReplacements) {
        return originalVendorPayout;
      } else if (hasReturns && hasReplacements) {
        return originalVendorPayout - replacementVendorPayout;
      }
      return originalVendorPayout;
    })();
    
    // Summary table with proper alignment
    const summaryData = [
      ["Subtotal:", formatPriceForPDF(order.vendor_subtotal)],
      ["Shipping:", formatPriceForPDF(order.vendor_shipping_total)],
      ["Tax:", formatPriceForPDF(order.vendor_tax_total)],
      ["", ""], // Separator row
      ["Your Total Earnings:", formatPriceForPDF(order.payment_status === "refunded" ? 0 : Math.abs(netVendorProfit))]
    ];
    
    autoTable(doc, {
      body: summaryData,
      startY: finalY,
      theme: "plain",
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { 
          cellWidth: 80, 
          fontStyle: "bold",
          halign: "right"
        },
        1: { 
          cellWidth: 35, 
          halign: "right",
          fontStyle: "normal"
        }
      },
      didParseCell: function(data) {
        // Make the last row (Your Total Earnings) bold and larger
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 10;
          data.cell.styles.textColor = [230, 81, 0]; // BRAND.primary
        }
        // Hide the separator row
        if (data.row.index === 3) {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.lineWidth = 0;
        }
      },
      margin: { left: pageWidth - 135, right: 20 }
    });
    
    // Add payment status
    const paymentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(smallFontSize);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Status: ", 20, paymentY);
    doc.setFont("helvetica", "normal");
    
    const paymentStatus = order.payment_status === "paid" || order.payment_status === "captured" 
      ? "Paid" 
      : order.payment_status === "refunded"
      ? "Refunded"
      : "Payment Pending";
    
    // Color code the payment status
    if (paymentStatus === "Paid") {
      doc.setTextColor(243, 156, 18); // Green
    } else if (paymentStatus === "Refunded") {
      doc.setTextColor(231, 76, 60); // Red
    } else {
      doc.setTextColor(243, 156, 18); // Orange
    }
    doc.text(paymentStatus, 52, paymentY);
    
    // Add note for claims/returns if applicable
    if (returnedItems.length > 0 || replacementItems.length > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(smallFontSize - 1);
      doc.text("Note: This invoice reflects returns/replacements. Your earnings are calculated accordingly.", 20, paymentY + 6);
    }
    
    // Add footer
    doc.setFontSize(normalFontSize);
    doc.setTextColor(230, 81, 0);
    const footerText = `Vendor Invoice for ${order.vendor_handle} - Junooni Marketplace`;
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: "center" });
    
    // Save the PDF
    doc.save(`Junooni_Vendor_Invoice_${order.display_id}_${order.vendor_handle}.pdf`);
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again.");
  }
};
  
  if (loading) {
    return (
      <div 
        className="min-h-screen py-6"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center p-16 min-h-[60vh]">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" style={{ color: BRAND.primary }} />
            <p className="text-lg text-gray-600">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div 
        className="min-h-screen py-6"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto max-w-7xl">
          <Card className="max-w-3xl mx-auto my-8 border-red-200">
            <CardHeader className="border-b border-red-100 bg-red-50">
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Error Loading Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="mb-4 text-red-600">{error}</p>
              <p className="mb-6 text-gray-600">We're having trouble finding your portion of this order.</p>
              <Button 
                onClick={() => window.history.back()}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div 
        className="min-h-screen py-6"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto max-w-7xl">
          <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
              <CardTitle>Order Not Found</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="mb-4">The order with ID {id} could not be found or doesn't contain your products.</p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  
  return (
    <div 
      className="min-h-screen py-6"
      style={{ 
        background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                     radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
        backgroundColor: "white",
        color: BRAND.textPrimary
      }}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        {/* ✅ Updated header showing vendor-specific information */}
        <Card className="mb-8 overflow-hidden shadow-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: BRAND.secondary }}>
                  Order #{order.display_id}
                </h1>
                {/* <div className="flex items-center mt-1 text-sm text-gray-600">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                    Your Products Only
                  </span>
                </div> */}
                <div className="flex items-center mt-2 text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <span className="mr-2 text-sm text-gray-500">Status:</span>
                  <StatusBadge status={order.fulfillment_status} />
                </div>
                <div>
                  <span className="mr-2 text-sm text-gray-500">Payment:</span>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>
              {/* <div className="text-lg font-bold" style={{ color: BRAND.primary }}>
                {formatPrice(order.payment_status === 'refunded' ? 0 : order.vendor_total, order.currency_code)}
                {formatPrice(order.payment_status === 'refunded' ? 0 : Math.abs(netVendorProfit), order.currency_code)}
              </div> */}
              {/* <div className="text-sm text-gray-500">Your portion</div> */}
            </div>
          </div>
          
          {/* ✅ Vendor-specific info notice */}
          {/* <div className="p-4 border-b border-blue-100 bg-blue-50">
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm text-blue-800">
                This shows only your products and your portion of the payment from order #{order.display_id}
              </span>
            </div>
          </div> */}
          
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 bg-gray-50">
            {/* Customer Info */}
            <div className="space-y-1">
              <div className="flex items-center mb-1 text-sm font-medium text-gray-500">
                <User className="w-4 h-4 mr-1" />
                Customer
              </div>
              <div className="font-medium">
                {`${order.customer.first_name} ${order.customer.last_name}`.trim()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                {order.customer.email}
              </div>
              {order.customer.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  {order.customer.phone}
                </div>
              )}
            </div>
            
            {/* Shipping Info */}
            <div className="space-y-1">
              <div className="flex items-center mb-1 text-sm font-medium text-gray-500">
                <Truck className="w-4 h-4 mr-1" />
                Shipping
              </div>
              {order.shipping_address && (
                <>
                  <div className="font-medium">
                    {order.shipping_address.line1}
                  </div>
                  {order.shipping_address.line2 && (
                    <div className="text-sm text-gray-600">
                      {order.shipping_address.line2}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    {order.shipping_address.city && `${order.shipping_address.city}, `}
                    {order.shipping_address.state && `${order.shipping_address.state} `}
                    {order.shipping_address.postal_code}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.shipping_address.country}
                  </div>
                </>
              )}
            </div>
            
            {/* Vendor Payment Info */}
            <div className="space-y-1">
              <div className="flex items-center mb-1 text-sm font-medium text-gray-500">
                <CreditCard className="w-4 h-4 mr-1" />
                Your Payment
              </div>
              <div className="font-medium">
                {order.payment_status === "refunded"
                  ? "Refunded"
                  : ["paid", "captured"].includes(order.payment_status)
                  ? "Paid"
                  : "Payment Pending"}
              </div>
               <div className="text-sm text-gray-600">
                Method: Online Payment
              </div>
              <div className="text-sm font-medium" style={{ color: BRAND.primary }}>
                Amount: {formatPrice(order.vendor_payment_amount, order.currency_code)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end p-4 space-x-2 bg-white border-t border-gray-200">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <Button size="sm" className="text-xs px-3 py-1.5 bg-[#e65100]" onClick={generateInvoice}>
              <Download className="w-4 h-4 mr-2" />
              Download Vendor Invoice
            </Button>
          </div>
        </Card>
        
        {/* ✅ Updated order details sections */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left column */}
          <div className="col-span-2 space-y-4">
            {/* ✅ Your Items Only - NOW WITH PRODUCT IMAGES */}
            <Card className="mb-4 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="flex items-center text-base">
                  <ShoppingBag className="w-5 h-5 mr-2 text-gray-500" />
                  Your Products in this Order
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {order.vendor_items.length} {order.vendor_items.length === 1 ? 'item' : 'items'}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {order.vendor_items && order.vendor_items.length > 0 ? (
                  <>
                  {/* ✅ NEW: Show Shipped Items with Tracking Info */}
                {creatorItems.some(item => item.shipped_at || item.fulfillment_status === 'shipped') && (
                  <div className="p-4 mb-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex items-center mb-3">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <h4 className="font-medium text-orange-800">Shipped Items</h4>
                        <p className="text-sm text-orange-700">Items that have been shipped with tracking information</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {creatorItems
                        .filter(item => item.shipped_at || item.fulfillment_status === 'shipped')
                        .map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded">
                            <div className="flex items-center">
                              <div className="w-2 h-2 mr-3 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900">{item.title}</div>
                                <div className="text-sm text-gray-600">
                                  Tracking: {item.tracking_numbers?.[0] || 'Added via system'}
                                </div>
                              </div>
                            </div>
                            {item.tracking_urls?.[0] && (
                              <a
                                href={item.tracking_urls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                              >
                                Track Package
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-sm text-gray-500 bg-gray-50">
                        <tr>
                          <th className="w-20 px-4 py-3 text-center">Image</th>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="w-20 px-4 py-3 text-center">Qty</th>
                          <th className="w-20 px-4 py-3 text-center">SKU</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.vendor_items.map(item => (
                          <tr key={item.id} className={`hover:bg-gray-50 ${
                            item.is_claim_item ? 'bg-blue-50' : 
                            item.claim_status === 'returned' ? 'bg-orange-50' : 
                            item.claim_status === 'replaced' ? 'bg-green-50' : ''
                          }`}>
                            {/* ✅ NEW: Product Image Column */}
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                {item.image_url || item.thumbnail_url ? (
                                  <img
                                    src={item.thumbnail_url || item.image_url}
                                    alt={item.title}
                                    className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                                    onError={(e) => {
                                      // Fallback to placeholder if image fails to load
                                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <rect width="48" height="48" fill="#F3F4F6"/>
                                          <path d="M20 18V30M28 18V30M16 14H32C33.1046 14 34 14.8954 34 16V32C34 33.1046 33.1046 34 32 34H16C14.8954 34 14 33.1046 14 32V16C14 14.8954 14.8954 14 16 14Z" 
                                                stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                      `)}`
                                    }}
                                  />
                                ) : (
                                  // Placeholder when no image is available
                                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <div className="flex items-center font-medium">
                                    {item.product_id ? (
                                      <Link 
                                        to={`/products/${item.product_id}`} 
                                        className="transition-colors duration-200 hover:underline"
                                        style={{ color: BRAND.primary }}
                                      >
                                        {item.title}
                                      </Link>
                                    ) : (
                                      <span>{item.title}</span>
                                    )}
                                    
                                    {/* ✅ Enhanced status badges from backend data */}
                                    {item.is_claim_item && (
                                      <Badge variant="outline" className="ml-2 text-xs text-blue-700 border-blue-200 bg-blue-50">
                                        New Item
                                      </Badge>
                                    )}
                                    {item.claim_status === 'returned' && (
                                      <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200 bg-orange-50">
                                        Returned
                                      </Badge>
                                    )}
                                    {item.claim_status === 'replaced' && (
                                      <Badge variant="outline" className="ml-2 text-green-700 border-green-200 bg-green-50">
                                        Replaced
                                      </Badge>
                                    )}
                                  </div>
                                  {item.subtitle && (
                                    <div className="mt-1 text-sm text-gray-500">
                                      {item.subtitle}
                                    </div>
                                  )}
                                  {/* ✅ Show claim/return reason if available */}
                                  {(item.return_reason || item.claim_reason) && (
                                    <div className="mt-1 text-xs text-gray-400">
                                      {item.return_reason && `Return: ${item.return_reason}`}
                                      {item.claim_reason && `Claim: ${item.claim_reason}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">{item.quantity}</td>
                            <td className="px-4 py-4 font-mono text-xs text-center">
                              {item.variant_sku}
                            </td>
                            <td className="px-4 py-4 text-right text-gray-600">
                              {formatPrice(item.unit_price, order.currency_code)}
                            </td>
                            <td className="px-4 py-3 font-medium text-right">
                              {formatPrice(item.total, order.currency_code)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
                ) : (
                  <div className="p-6 text-center text-gray-500">No items found for your vendor</div>
                )}
              </CardContent>
            </Card>

             {/* ✅ REPLACE the old ProductTable components with this: */}
<Card className="mb-4 shadow-md">
  <CardHeader className="px-4 py-3 border-b">
    <CardTitle className="flex items-center text-xl">
      <Truck className="w-6 h-6 mr-3 text-gray-600" />
      Fulfillments
    </CardTitle>
    <CardDescription className="mt-2">
      Your products are categorized by fulfillment method
    </CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    {(() => {
      
      return (
        <div className="space-y-0">
          {/* Creator Fulfillment Section */}
          {creatorItems.length > 0 && (
            <div className="border-b border-gray-200 last:border-b-0">
              <div className="p-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-[#e65100]" />
                    <div>
                      <h3 className="flex items-center text-lg font-semibold">
                        Creator Fulfillment
                        <Badge variant="outline" className="ml-2 text-xs border-orange-200 text-[#e65100] bg-orange-50">
                          Creator Fulfilled
                        </Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">Products fulfilled directly by you</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {creatorItems.length} {creatorItems.length === 1 ? 'item' : 'items'}
                    </span>
                    {/* ✅ NEW: Add tracking button for fulfilled items */}
                    {creatorItems.some(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at) && (
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const fulfilledItem = creatorItems.find(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at);
                          if (fulfilledItem) handleOpenShipmentModal(fulfilledItem);
                        }}
                        className="text-xs"
                        style={{ backgroundColor: BRAND.primary }}
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        Add Tracking Info
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* ✅ NEW: Add Tracking Information Section for Fulfilled Items */}
                {creatorItems.some(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at) && (
                  <div className="p-3 mb-3 border-2 border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 mr-3 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-orange-800">Ready to Ship</h4>
                          <p className="text-sm text-orange-700">
                            Your products are fulfilled and ready for shipping. Add tracking information to complete the order.
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          const fulfilledItem = creatorItems.find(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at);
                          if (fulfilledItem) handleOpenShipmentModal(fulfilledItem);
                        }}
                        className="text-white bg-orange-600 hover:bg-orange-700"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Add Tracking Info
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-sm text-gray-500 bg-gray-50">
                      <tr>
                        <th className="px-1 py-1 text-center w-14">Image</th>
                        <th className="px-1 py-1 text-left">Product</th>
                        <th className="px-1 py-1 text-center w-14">Qty</th>
                        <th className="px-2 py-1 text-center w-14">SKU</th>
                        <th className="px-4 py-1 text-right">Price</th>
                        <th className="px-3 py-1 text-right">Total</th>
                        <th className="px-3 py-1 text-center w-14">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {creatorItems.map(item => (
                        <tr key={item.id} className={`hover:bg-gray-50 ${
                          item.is_claim_item ? 'bg-blue-50' : 
                          item.claim_status === 'returned' ? 'bg-orange-50' : 
                          item.claim_status === 'replaced' ? 'bg-green-50' : ''
                        }`}>
                          <td className="px-2 py-4">
                            <div className="flex items-center justify-center">
                              {item.image_url || item.thumbnail_url ? (
                                <img
                                  src={item.thumbnail_url || item.image_url}
                                  alt={item.title}
                                  className="object-cover w-10 h-10 border border-gray-200 rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="48" height="48" fill="#F3F4F6"/>
                                        <path d="M20 18V30M28 18V30M16 14H32C33.1046 14 34 14.8954 34 16V32C34 33.1046 33.1046 34 32 34H16C14.8954 34 14 33.1046 14 32V16C14 14.8954 14.8954 14 16 14Z" 
                                              stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                      </svg>
                                    `)}`
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="flex items-center font-medium">
                                  {item.product_id ? (
                                    <Link 
                                      to={`/products/${item.product_id}`} 
                                      className="transition-colors duration-200 hover:underline"
                                      style={{ color: BRAND.primary }}
                                    >
                                      {item.title}
                                    </Link>
                                  ) : (
                                    <span>{item.title}</span>
                                  )}
                                  
                                  {/* Status badges */}
                                  {/* {item.is_claim_item && (
                                    <Badge variant="outline" className="ml-2 text-xs text-blue-700 border-blue-200 bg-blue-50">
                                      New Item
                                    </Badge>
                                  )} */}
                                  {/* {item.claim_status === 'returned' && (
                                    <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200 bg-orange-50">
                                      Returned
                                    </Badge>
                                  )} */}
                                  {/* {item.claim_status === 'replaced' && (
                                    <Badge variant="outline" className="ml-2 text-green-700 border-green-200 bg-green-50">
                                      Replaced
                                    </Badge>
                                  )} */}
                                  {/* ✅ UPDATED: Fulfillment status badges
                                  {item.fulfillment_status === 'fulfilled' && !item.shipped_at && (
                                    <Badge variant="outline" className="ml-2 text-green-700 border-green-200 bg-green-50">
                                      Fulfilled
                                    </Badge>
                                  )} */}
                                  {/* {(item.fulfillment_status === 'shipped' || item.shipped_at) && (
                                    <Badge variant="outline" className="ml-2 text-xs text-blue-700 border-blue-200 bg-blue-50">
                                      <Truck className="w-3 h-3 mr-1" />
                                      Shipped
                                    </Badge>
                                  )} */}
                                </div>
                                {item.subtitle && (
                                  <div className="mt-1 text-sm text-gray-500">
                                    {item.subtitle}
                                  </div>
                                )}
                                {/* Show claim/return reason if available */}
                                {(item.return_reason || item.claim_reason) && (
                                  <div className="mt-1 text-xs text-gray-400">
                                    {item.return_reason && `Return: ${item.return_reason}`}
                                    {item.claim_reason && `Claim: ${item.claim_reason}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">{item.quantity}</td>
                          <td className="px-4 py-4 font-mono text-xs text-center">{item.variant_sku}</td>
                          <td className="px-4 py-4 text-right text-gray-600">{formatPrice(item.unit_price, order.currency_code)}</td>
                          <td className="px-4 py-4 font-medium text-right">{formatPrice(item.total, order.currency_code)}</td>
                          <td className="px-4 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-8 h-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* ✅ UPDATED: Show appropriate action based on status */}
                                {(!item.fulfillment_status || item.fulfillment_status === 'pending' || item.fulfillment_status === 'not_fulfilled') && (
                                  <DropdownMenuItem 
                                    onClick={() => handleOpenConfirmModal(item)}
                                    className="cursor-pointer"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm Order
                                  </DropdownMenuItem>
                                )}
                                
                                {(item.fulfillment_status === 'fulfilled' && !item.shipped_at && !item.fulfillment_status?.includes('shipped')) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleOpenShipmentModal(item)}
                                    className="cursor-pointer"
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Mark as Shipped
                                  </DropdownMenuItem>
                                )}
                                
                                {item.fulfillment_status === 'fulfilled' && !item.shipped_at && (
                                  <DropdownMenuItem 
                                    onClick={() => handleOpenShipmentModal(item)}
                                    className="cursor-pointer"
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Add Tracking Info
                                  </DropdownMenuItem>
                                )}
                                
                                {(item.fulfillment_status === 'shipped' || item.shipped_at) && (
                                  <DropdownMenuItem disabled className="text-green-600">
                                    <CircleCheck className="w-4 h-4 mr-2" />
                                    Shipped
                                  </DropdownMenuItem>
                                )}
                                
                                {/* ✅ DEBUG: Show current status for debugging */}
                                <DropdownMenuItem disabled className="text-xs text-gray-500">
                                  Status: {item.fulfillment_status || 'pending'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Junooni Fulfillment Section */}
          {junooniFulfillmentItems.length > 0 && (
            <div className="border-b border-gray-200 last:border-b-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Home className="w-5 h-5 mr-3 text-orange-600" />
                    <div>
                      <h3 className="flex items-center text-lg font-semibold">
                        Junooni Fulfillment
                        <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200 bg-orange-50">
                          Junooni Fulfilled
                        </Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">Products fulfilled by Junooni warehouses</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {junooniFulfillmentItems.length} {junooniFulfillmentItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-sm text-gray-500 bg-gray-50">
                      <tr>
                        <th className="w-16 px-4 py-3 text-center">Image</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="w-16 px-4 py-3 text-center">Qty</th>
                        <th className="w-20 px-4 py-3 text-center">SKU</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {junooniFulfillmentItems.map(item => (
                        <tr key={item.id} className={`hover:bg-gray-50 ${
                          item.is_claim_item ? 'bg-blue-50' : 
                          item.claim_status === 'returned' ? 'bg-orange-50' : 
                          item.claim_status === 'replaced' ? 'bg-green-50' : ''
                        }`}>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              {item.image_url || item.thumbnail_url ? (
                                <img
                                  src={item.thumbnail_url || item.image_url}
                                  alt={item.title}
                                  className="object-cover w-10 h-10 border border-gray-200 rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="48" height="48" fill="#F3F4F6"/>
                                        <path d="M20 18V30M28 18V30M16 14H32C33.1046 14 34 14.8954 34 16V32C34 33.1046 33.1046 34 32 34H16C14.8954 34 14 33.1046 14 32V16C14 14.8954 14.8954 14 16 14Z" 
                                              stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                      </svg>
                                    `)}`
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="flex items-center font-medium">
                                  {item.product_id ? (
                                    <Link 
                                      to={`/products/${item.product_id}`} 
                                      className="transition-colors duration-200 hover:underline"
                                      style={{ color: BRAND.primary }}
                                    >
                                      {item.title}
                                    </Link>
                                  ) : (
                                    <span>{item.title}</span>
                                  )}
                                  
                                  {/* Status badges */}
                                  {item.is_claim_item && (
                                    <Badge variant="outline" className="ml-2 text-xs text-blue-700 border-blue-200 bg-blue-50">
                                      New Item
                                    </Badge>
                                  )}
                                  {item.claim_status === 'returned' && (
                                    <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200 bg-orange-50">
                                      Returned
                                    </Badge>
                                  )}
                                  {item.claim_status === 'replaced' && (
                                    <Badge variant="outline" className="ml-2 text-green-700 border-green-200 bg-green-50">
                                      Replaced
                                    </Badge>
                                  )}
                                </div>
                                {item.subtitle && (
                                  <div className="mt-1 text-sm text-gray-500">
                                    {item.subtitle}
                                  </div>
                                )}
                                {/* Show claim/return reason if available */}
                                {(item.return_reason || item.claim_reason) && (
                                  <div className="mt-1 text-xs text-gray-400">
                                    {item.return_reason && `Return: ${item.return_reason}`}
                                    {item.claim_reason && `Claim: ${item.claim_reason}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">{item.quantity}</td>
                          <td className="px-4 py-4 font-mono text-xs text-center">{item.variant_sku}</td>
                          <td className="px-4 py-4 text-right text-gray-600">{formatPrice(item.unit_price, order.currency_code)}</td>
                          <td className="px-4 py-4 font-medium text-right">{formatPrice(item.total, order.currency_code)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* No items message */}
          {creatorItems.length === 0 && junooniFulfillmentItems.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No fulfillment information available for your products
            </div>
          )}
        </div>
      );
    })()}
  </CardContent>
</Card>
                      
            {/* Tracking Information */}
            <Card className="mb-4 shadow-md">
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-base">
                      <Truck className="w-5 h-5 mr-2 text-gray-500" />
                      Tracking Information
                    </CardTitle>
                    <CardDescription>
                      Current status of your products in this order
                    </CardDescription>
                  </div>
                  
                  {/* ✅ NEW: Quick Action Button for Adding Tracking */}
                  {order.vendor_items.some(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at) && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        const fulfilledItem = order.vendor_items.find(item => item.fulfillment_status === 'fulfilled' && !item.shipped_at);
                        if (fulfilledItem) handleOpenShipmentModal(fulfilledItem);
                      }}
                      style={{ backgroundColor: BRAND.primary }}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Add Tracking Info
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="space-y-3">
                    {(() => {
                      // ✅ Get vendor-specific claims/returns data
                      const {
                        vendorHasClaims,
                        vendorHasReturns,
                        vendorClaims,
                        vendorReturns,
                        vendorReturnItemCount,
                        vendorReplacementItemCount
                      } = getVendorSpecificClaimsReturns(
                        order.vendor_items, 
                        order.claims, 
                        order.returns, 
                        order.claim_items, 
                        order.return_items
                      );
                      
                      return (
                        <>
                          {/* Order Placed */}
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full" 
                                  style={{ backgroundColor: `${BRAND.primary}22`, color: BRAND.primary }}>
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="w-px h-full my-1 bg-gray-200"></div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Order Placed</div>
                              <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                              <div className="mt-1 text-sm">
                                Your products were ordered in order #{order.display_id}
                              </div>
                            </div>
                          </div>
                          
                          {/* ✅ FIXED: Only show returns if THIS vendor has returns */}
                          {vendorHasReturns && vendorReturns.length > 0 && (
                            <div className="flex">
                              <div className="flex flex-col items-center mr-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                  <RefreshCw className="w-4 h-4 text-orange-700" />
                                </div>
                                <div className="w-px h-full my-1 bg-gray-200"></div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Return Requested</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(vendorReturns[0].created_at)}
                                </div>
                                <div className="mt-1 text-sm">
                                  Customer requested return for {vendorReturnItemCount} of your item(s)
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* ✅ FIXED: Only show claims if THIS vendor has claims */}
                          {vendorHasClaims && vendorClaims.length > 0 && (
                            <div className="flex">
                              <div className="flex flex-col items-center mr-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                  <RefreshCw className="w-4 h-4 text-blue-700" />
                                </div>
                                <div className="w-px h-full my-1 bg-gray-200"></div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Claim Processed</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(vendorClaims[0].created_at)}
                                </div>
                                <div className="mt-1 text-sm">
                                  {vendorReplacementItemCount > 0 
                                    ? `${vendorReplacementItemCount} of your items replaced through claim process`
                                    : 'Your items processed through claim'
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Processing */}
                          {order.fulfillment_status !== "pending" && order.fulfillment_status !== "not_fulfilled" && (
                            <div className="flex">
                              <div className="flex flex-col items-center mr-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                  <RefreshCw className="w-4 h-4 text-blue-700" />
                                </div>
                                <div className="w-px h-full my-1 bg-gray-200"></div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Processing</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(new Date(new Date(order.created_at).getTime() + 3600000).toISOString())}
                                </div>
                                <div className="mt-1 text-sm">
                                  Your products are being prepared for shipping
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Delivered */}
                          {order.fulfillment_status === "delivered" && (
                            <div className="flex">
                              <div className="flex flex-col items-center mr-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                  <CircleCheck className="w-4 h-4 text-green-700" />
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Delivered</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(new Date(new Date(order.created_at).getTime() + 7 * 24 * 3600000).toISOString())}
                                </div>
                                <div className="mt-1 text-sm">
                                  Your products have been delivered successfully
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Per-Item Tracking Information - remains the same */}
                  <div className="pt-4 mt-6 border-t border-gray-200">
                    <h4 className="mb-4 text-sm font-medium text-gray-800">Individual Product Tracking</h4>
                    <div className="space-y-3">
                      {order.vendor_items.map((item) => (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{item.title}</span>
                                {item.is_claim_item && (
                                  <Badge variant="outline" className="ml-2 text-xs text-blue-700 border-blue-200 bg-blue-50">
                                    New Item
                                  </Badge>
                                )}
                                {item.claim_status === 'returned' && (
                                  <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200 bg-orange-50">
                                    Returned
                                  </Badge>
                                )}
                              </div>
                              {item.subtitle && (
                                <div className="mt-1 text-sm text-gray-500">{item.subtitle}</div>
                              )}
                              <div className="mt-2">
                                <TrackingInfo item={item} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* ✅ FIXED: Current Status with vendor-specific claim/return info */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${BRAND.primary}11` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 mr-3 rounded-full" style={{ backgroundColor: `${BRAND.primary}22` }}>
                          <Clock className="w-5 h-5" style={{ color: BRAND.primary }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Current Status</div>
                          <div className="font-bold" style={{ color: BRAND.primary }}>
                            {(() => {
                              const {
                                vendorHasClaims,
                                vendorHasReturns
                              } = getVendorSpecificClaimsReturns(
                                order.vendor_items, 
                                order.claims, 
                                order.returns, 
                                order.claim_items, 
                                order.return_items
                              );
                              
                              if (order.fulfillment_status === "delivered") return "Delivered";
                              if (vendorHasClaims) return "Claim Processed";
                              if (vendorHasReturns) return "Return Requested";
                              if (order.fulfillment_status === "pending" || order.fulfillment_status === "not_fulfilled") return "Pending";
                              if (order.fulfillment_status === "processing" || order.fulfillment_status === "partially_fulfilled") return "Processing";
                              if (order.fulfillment_status === "shipped" || order.fulfillment_status === "partially_shipped") return "Shipped";
                              return "Delivered";
                            })()}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={order.fulfillment_status} />
                    </div>
                    
                    {/* ✅ FIXED: Show claim/return summary only if this vendor is affected */}
                    {(() => {
                      const {
                        vendorHasClaims,
                        vendorHasReturns,
                        vendorReturnItemCount,
                        vendorReplacementItemCount
                      } = getVendorSpecificClaimsReturns(
                        order.vendor_items, 
                        order.claims, 
                        order.returns, 
                        order.claim_items, 
                        order.return_items
                      );
                      
                      if (vendorHasClaims || vendorHasReturns) {
                        return (
                          <div className="pt-3 mt-3 border-t border-orange-200">
                            <div className="text-sm text-orange-800">
                              {vendorHasReturns && (
                                <div>↩ {vendorReturnItemCount} of your item(s) returned</div>
                              )}
                              {vendorHasClaims && (
                                <div>🔄 Claim processed - {vendorReplacementItemCount} replacement item(s) added</div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column */}
          <div className="col-span-1">
            {/* ✅ Your Order Summary */}
            {/* Your Order Summary */}
              <Card className="mb-4 shadow-md">
                <CardHeader className="px-4 py-3 border-b">
                  <CardTitle className="flex items-center text-base">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                    Your Order Summary
                    {(order.has_claims || order.has_returns) && (
                      <Badge variant="outline" className="ml-2 text-xs text-orange-700 border-orange-200 bg-orange-50">
                        Updated
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {(() => {
                    const { originalItems, returnedItems, replacementItems } = categorizeOrderItems(order.vendor_items);
                    const originalTotals = calculateCategoryTotals(originalItems, order.currency_code);
                    const returnedTotals = calculateCategoryTotals(returnedItems, order.currency_code);
                    const replacementTotals = calculateCategoryTotals(replacementItems, order.currency_code);
                    
                    // ✅ NEW: Calculate accurate vendor payout amounts (same logic as Cost Breakdown)
                    const calculateVendorPayoutTotals = (items: OrderItem[]) => {
                      return items.reduce((total, item) => {
                        const vendorPayoutPerItem = item.product_cost && item.product_cost > 0 
                          ? item.unit_price - item.product_cost 
                          : item.unit_price * 0.7;
                        
                        return total + (vendorPayoutPerItem * item.quantity);
                      }, 0);
                    };

                    const originalVendorPayout = calculateVendorPayoutTotals(originalItems);
                    const returnedVendorPayout = calculateVendorPayoutTotals(returnedItems);
                    const replacementVendorPayout = calculateVendorPayoutTotals(replacementItems);
                    
                    // ✅ Calculate net vendor profit (actual payout amounts)
                    //const netVendorProfit = originalVendorPayout - returnedVendorPayout + replacementVendorPayout;
                    const netVendorProfit = (() => {
                      const hasReturns = returnedItems.length > 0;
                      const hasReplacements = replacementItems.length > 0;
                      
                      if (hasReplacements && !hasReturns) {
                        return originalVendorPayout - replacementVendorPayout; // Original + replacements
                      } else if (hasReturns && !hasReplacements) {
                        return originalVendorPayout; // Original - returns
                      } else if (hasReturns && hasReplacements) {
                        return originalVendorPayout - replacementVendorPayout; // All changes
                      }
                      return originalVendorPayout; // No changes
                    })();

                    // ✅ NET SUBTOTAL: Corrected calculation
                    const netSubtotal = (() => {
                      const hasReturns = returnedItems.length > 0;
                      const hasReplacements = replacementItems.length > 0;
                      
                      if (hasReplacements && !hasReturns) {
                        return originalTotals.subtotal - replacementTotals.subtotal; // Original + replacements
                      } else if (hasReturns && !hasReplacements) {
                        return originalTotals.subtotal; // Original - returns
                      } else if (hasReturns && hasReplacements) {
                        return originalTotals.subtotal - replacementTotals.subtotal; // All changes
                      }
                      return originalTotals.subtotal; // No changes
                    })();
                    
                     const customerTotalPayment = calculateCustomerTotalPayment(order, originalItems, returnedItems, replacementItems);

                    const hasChanges = returnedItems.length > 0 || replacementItems.length > 0;
                    
                    return (
                      <div className="space-y-2">
                        {/* Original Order Section */}
                        {originalItems.length > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Original product total ({originalTotals.count} items)</span>
                              <span>{formatPrice(originalTotals.subtotal, order.currency_code)}</span>
                            </div>
                            
                            {hasChanges && (
                              <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                                {originalItems.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                      {item.title} × {item.quantity}
                                      {item.subtitle && <span className="text-xs"> ({item.subtitle})</span>}
                                    </span>
                                    <span className="text-gray-500">{formatPrice(item.total, order.currency_code)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Returned Items Section */}
                        {returnedItems.length > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-red-600">↩ Returned products ({returnedTotals.count} items)</span>
                              <span className="text-red-600">-{formatPrice(returnedTotals.subtotal, order.currency_code)}</span>
                            </div>
                            
                            <div className="pl-4 space-y-2 border-l-2 border-red-200">
                              {returnedItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-red-500">
                                    {item.title} × {item.quantity}
                                    {item.subtitle && <span className="text-xs"> ({item.subtitle})</span>}
                                    {item.return_reason && <span className="block text-xs">Reason: {item.return_reason}</span>}
                                  </span>
                                  <span className="text-red-500">-{formatPrice(item.total, order.currency_code)}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {/* Replacement Items Section */}
                        {replacementItems.length > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-green-600">🔄 Replacement products ({replacementTotals.count} items)</span>
                              <span className="text-green-600">+{formatPrice(replacementTotals.subtotal, order.currency_code)}</span>
                            </div>
                            
                            <div className="pl-4 space-y-2 border-l-2 border-green-200">
                              {replacementItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-green-600">
                                    {item.title} × {item.quantity}
                                    {item.subtitle && <span className="text-xs"> ({item.subtitle})</span>}
                                    {item.claim_reason && <span className="block text-xs">Reason: {item.claim_reason}</span>}
                                  </span>
                                  <span className="text-green-600">+{formatPrice(item.total, order.currency_code)}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {/* Net Product Total */}
                        {hasChanges && (
                          <>
                            <Separator className="my-3" />
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-700">Net product total</span>
                              <span>{formatPrice(Math.abs(netSubtotal), order.currency_code)}</span>
                            </div>
                          </>
                        )}
                        
                        {/* Tax (calculated on net amount) */}
                        {/* <div className="flex justify-between">
                          <span className="text-gray-600">Tax amount</span>
                          <span>{formatPrice(order.vendor_tax_total, order.currency_code)}</span>
                        </div> */}
                        
                        <Separator className="my-3" />
                        
                        <div className="flex justify-between font-bold">
                          <span>Customer paid (inc. delivery charges)</span>
                          <span style={{ color: BRAND.primary }}>
                            {formatPrice(netSubtotal, order.currency_code)}
                          </span>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        {/* ✅ UPDATED: Use calculated vendor profit instead of order.vendor_total */}
                        <div className="flex justify-between font-bold">
                          <span>You earned (net)</span>
                          <span style={{ color: BRAND.primary }}>{formatPrice(order.payment_status === 'refunded' ? 0 : Math.abs(netVendorProfit), order.currency_code)}</span>
                        </div>
                        
                        {/* Status Notice */}
                        {hasChanges && (
                          <div className="p-3 mt-4 text-xs text-[#e65100] border border-orange-200 rounded-md bg-orange-50">
                            <div className="flex items-center">
                              <Info className="w-3 h-3 mr-1" />
                              <span>
                                This order has been modified due to {returnedItems.length > 0 ? 'returns' : ''} 
                                {returnedItems.length > 0 && replacementItems.length > 0 ? ' and ' : ''}
                                {replacementItems.length > 0 ? 'replacements' : ''}. 
                                Your earnings reflect the final transaction.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Cost Breakdown Link */}
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowCostBreakdown(true)}
                      className="flex items-center text-sm hover:underline"
                      style={{ color: BRAND.primary }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Click here for detailed cost breakdown
                    </button>
                  </div>
                </CardContent>
              </Card>
            
            {/* ✅ Your Payment Information */}
            <Card className="mb-4 shadow-md">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="flex items-center text-base">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  Your Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span>Online Payment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <StatusBadge status={order.payment_status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Amount</span>
                    <span className="font-medium" style={{ color: BRAND.primary }}>
                      {formatPrice(order.payment_status === 'refunded' ? 0 : order.vendor_payment_amount, order.currency_code)}
                    </span>
                  </div>
                </div>
                
                {order.payment_status === "captured" && (
                  <div className="p-3 mt-4 border border-green-200 rounded-md bg-green-50">
                    <div className="flex items-center">
                      <CircleCheck className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm text-green-800">
                        Payment received for your products
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button className="w-full text-sm bg-[#e65100]" size="sm" onClick={generateInvoice}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Vendor Invoice
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track Your Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* ✅ Cost Breakdown Modal */}
        {order && (
          <CostBreakdownModal 
            order={order}
            isOpen={showCostBreakdown}
            onClose={() => setShowCostBreakdown(false)}
          />
        )}
        
        {/* ✅ UPDATED: Enhanced Confirm Order Modal */}
        {order && (
          <ConfirmOrderModal
            isOpen={showConfirmOrderModal}
            onClose={() => {
              setShowConfirmOrderModal(false);
              setFulfillmentError('');
              setFulfillmentSuccess(false);
            }}
            item={selectedItem}
            order={order}
            confirmQuantity={confirmQuantity}
            setConfirmQuantity={setConfirmQuantity}
            cancelQuantity={cancelQuantity}
            setCancelQuantity={setCancelQuantity}
            onConfirm={handleConfirmOrder}
            loading={fulfillmentLoading}
            error={fulfillmentError}
            success={fulfillmentSuccess}
          />
        )}

        {/* ✅ NEW: Mark as Shipped Modal */}
        {order && (
          <MarkAsShippedModal
            isOpen={showMarkAsShippedModal}
            onClose={() => {
              setShowMarkAsShippedModal(false);
              setShipmentError('');
              setShipmentSuccess(false);
            }}
            item={selectedShipmentItem}
            order={order}
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            carrier={carrier}
            setCarrier={setCarrier}
            trackingUrl={trackingUrl}
            setTrackingUrl={setTrackingUrl}
            onMarkAsShipped={handleMarkAsShipped}
            loading={shipmentLoading}
            error={shipmentError}
            success={shipmentSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default OrderDetails
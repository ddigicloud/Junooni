import React, { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
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
  CircleCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
//import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Link } from "@tanstack/react-router"

// Junooni brand colors (same as in orders page)
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

// Updated OrderItem interface to include subtitle
interface OrderItem {
  id: string
  title: string
  subtitle?: string
  quantity: number
  unit_price: number
  total: number
}

interface ShippingMethod {
  id: string
  name: string
  amount: number
}

interface PaymentCollection {
  id: string
  status: string
  amount: number
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
  shipping_address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  created_at: string
  total: number
  shipping_total: number
  status: string
  items: OrderItem[]
  payment_status: string
  fulfillment_status: string
  currency_code: string
  shipping_methods: ShippingMethod[]
  payment_collections: PaymentCollection[]
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

// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "USD") => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
};

const OrderDetails = () => {
  const { id } = useParams({ from: '/_authenticated/orders/$id' })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("vendorToken")
        
        if (!token) {
          setError("Authentication required. Please log in.")
          setLoading(false)
          return
        }
        
        // Try to fetch all orders and find the one we want
        const response = await fetch(`http://localhost:9000/vendors/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Find the order with the matching ID
        const orderData = data.orders && Array.isArray(data.orders) 
          ? data.orders.find((order: any) => order.id === id)
          : null
          
        if (!orderData) {
          throw new Error(`Order with ID ${id} not found`)
        }
        
        // Transform the order data
        const transformedOrder = transformOrderData(orderData)
        setOrder(transformedOrder)
      } catch (err: any) {
        //console.error("Error fetching order details:", err)
        setError(err.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [id])
  
  // Helper function to transform order data
  const transformOrderData = (orderData: any): Order => {
    // Calculate total amount
    let totalAmount = 0
    if (typeof orderData.total === 'number') {
      totalAmount = orderData.total
    } else if (orderData.total && typeof orderData.total.value === 'string') {
      totalAmount = parseFloat(orderData.total.value)
    } else {
      totalAmount = (orderData.items || []).reduce((sum: number, item: any) => {
        const itemPrice = 
          (typeof item.unit_price === 'number') ? item.unit_price :
          (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
          (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0
        
        const quantity = item.quantity || 1
        
        return sum + (itemPrice * quantity)
      }, 0)
    }
    
    // Calculate shipping total
    const shippingTotal = 
      (typeof orderData.shipping_total === 'number') ? orderData.shipping_total :
      (orderData.shipping_total?.value) ? parseFloat(orderData.shipping_total.value) : 0
    
    // Transform shipping methods
    const shippingMethods: ShippingMethod[] = (orderData.shipping_methods || []).map((method: any) => ({
      id: method.id || `sm_${Math.random().toString(36).substr(2, 9)}`,
      name: method.name || "Standard Shipping",
      amount: typeof method.amount === 'number' ? method.amount : 
        (method.amount?.value ? parseFloat(method.amount.value) : 0)
    }))
    
    // Transform order items with proper subtitles
    const transformedItems: OrderItem[] = (orderData.items || []).map((item: any, index: number) => {
      const unitPrice = 
        (typeof item.unit_price === 'number') ? item.unit_price :
        (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
        (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0
      
      const quantity = item.quantity || 1
      
      // Try to find subtitle from various possible fields
      let subtitle = "";
      if (item.subtitle) {
        subtitle = item.subtitle;
      } else if (item.product_subtitle) {
        subtitle = item.product_subtitle;
      } else if (item.variant && typeof item.variant === 'string') {
        subtitle = item.variant;
      } else if (item.variant && item.variant.title) {
        subtitle = item.variant.title;
      } else if (item.variant_title) {
        subtitle = item.variant_title;
      } else if (item.description) {
        subtitle = item.description;
      } else if (item.metadata && item.metadata.subtitle) {
        subtitle = item.metadata.subtitle;
      }
      
      return {
        id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
        title: item.title || item.product_title || "Unknown Product",
        subtitle: subtitle || "Handcrafted Item", // Default subtitle for Junooni
        quantity: quantity,
        unit_price: unitPrice,
        total: unitPrice * quantity
      }
    })
    
    // Transform payment collections
    const paymentCollections: PaymentCollection[] = (orderData.payment_collections || []).map((pc: any) => ({
      id: pc.id || `pc_${Math.random().toString(36).substr(2, 9)}`,
      status: pc.status || "unknown",
      amount: typeof pc.amount === 'number' ? pc.amount : 
        (pc.amount?.value ? parseFloat(pc.amount.value) : 0)
    }))
    
    // Extract shipping address
    const shippingAddress = {
      line1: orderData.shipping_address?.address_1 || orderData.shipping_address?.line1 || '',
      line2: orderData.shipping_address?.address_2 || orderData.shipping_address?.line2 || '',
      city: orderData.shipping_address?.city || '',
      state: orderData.shipping_address?.province || orderData.shipping_address?.state || '',
      postal_code: orderData.shipping_address?.postal_code || orderData.shipping_address?.zip_code || orderData.shipping_address?.pincode || '',
      country: orderData.shipping_address?.country || 'India'
    }
    
    // Extract display ID
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
      created_at: orderData.created_at || orderData.createdAt || orderData.date_created || 
        (orderData.items?.[0]?.created_at) || new Date().toISOString(),
      total: totalAmount,
      shipping_total: shippingTotal,
      status: orderData.status || "pending",
      items: transformedItems,
      payment_status: orderData.payment_status || "pending",
      fulfillment_status: orderData.fulfillment_status || "not_fulfilled",
      currency_code: "USD", // Using INR for Junooni
      shipping_methods: shippingMethods,
      payment_collections: paymentCollections
    }
  }
  
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
  
  // Function to generate and download invoice PDF
const generateInvoice = () => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Set some basic styles
    const titleFontSize = 20;
    const headerFontSize = 12;
    const normalFontSize = 10;
    const smallFontSize = 8;
    
    // Add company logo/name at the top
    doc.setFontSize(titleFontSize);
    doc.setTextColor(BRAND.primary);
    doc.text("JUNOONI", 20, 20);
    
    // Add invoice heading
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(`INVOICE #${order.display_id}`, pageWidth - 20, 20, { align: "right" });
    
    // Add invoice date
    const invoiceDate = formatDate(order.created_at).split(',')[0];
    doc.setFontSize(normalFontSize);
    doc.text(`Date: ${invoiceDate}`, pageWidth - 20, 30, { align: "right" });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, pageWidth - 20, 35);
    
    // Add company and billing information
    doc.setFontSize(normalFontSize);
    doc.text("From:", 20, 45);
    doc.setFontSize(smallFontSize);
    doc.text("Junooni", 20, 50);
    doc.text("123 Craft Street", 20, 55);
    doc.text("Artisan District", 20, 60);
    doc.text("Saharanpur, India", 20, 65);
    doc.text("support@junooni.com", 20, 70);
    
    // Add customer information
    doc.setFontSize(normalFontSize);
    doc.text("Bill To:", pageWidth - 80, 45);
    doc.setFontSize(smallFontSize);
    doc.text(`${order.customer.first_name} ${order.customer.last_name}`.trim(), pageWidth - 80, 50);
    
    if (order.shipping_address) {
      doc.text(order.shipping_address.line1 || "", pageWidth - 80, 55);
      if (order.shipping_address.line2) {
        doc.text(order.shipping_address.line2, pageWidth - 80, 60);
      }
      const cityStateZip = [
        order.shipping_address.city,
        order.shipping_address.state,
        order.shipping_address.postal_code
      ].filter(Boolean).join(", ");
      doc.text(cityStateZip, pageWidth - 80, order.shipping_address.line2 ? 65 : 60);
      doc.text(order.shipping_address.country || "", pageWidth - 80, order.shipping_address.line2 ? 70 : 65);
    }
    
    doc.text(`Email: ${order.customer.email}`, pageWidth - 80, 75);
    if (order.customer.phone) {
      doc.text(`Phone: ${order.customer.phone}`, pageWidth - 80, 80);
    }
    
    // Add order details
    doc.setFontSize(headerFontSize);
    doc.text("Order Details", 20, 90);
    
    // Create table for order items
    const tableColumn = ["Item", "Description", "Qty", "Unit Price", "Total"];
    const tableRows = [];
    
    // Add rows for each order item
    order.items.forEach(item => {
      const itemData = [
        item.title,
        item.subtitle || "",
        item.quantity.toString(),
        formatPrice(item.unit_price, order.currency_code),
        formatPrice(item.total, order.currency_code)
      ];
      tableRows.push(itemData);
    });
    
    // Add the table to the PDF - using the correct autoTable approach
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 8 },
      headStyles: { 
        fillColor: [230, 230, 230], 
        textColor: [50, 50, 50],
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Add order summary
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Summary table
    const summaryData = [
      ["Subtotal", formatPrice(order.total - order.shipping_total, order.currency_code)],
      ["Shipping", formatPrice(order.shipping_total, order.currency_code)],
      ["Tax", "Included"],
      ["Total", formatPrice(order.total, order.currency_code)]
    ];
    
    autoTable(doc, {
      body: summaryData,
      startY: finalY,
      theme: "plain",
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: "bold" },
        1: { cellWidth: 30, halign: "right" }
      },
      margin: { left: pageWidth - 130, right: 20 }
    });
    
    // Add payment information
    doc.setFontSize(smallFontSize);
    doc.text("Payment Status: " + 
      (order.payment_status === "paid" || order.payment_status === "captured" 
        ? "Paid" 
        : "Payment Pending"), 
      20, doc.lastAutoTable.finalY + 10);
    
    if (order.payment_collections && order.payment_collections.length > 0) {
      doc.text("Transaction ID: " + order.payment_collections[0].id.split('_').pop(), 
        20, doc.lastAutoTable.finalY + 15);
    }
    
    // Add footer
    const footerText = "Thank you for your business with Junooni Handicrafts!";
    doc.setFontSize(normalFontSize);
    doc.setTextColor(BRAND.primary);
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
    
    // Add terms and conditions
    doc.setFontSize(smallFontSize);
    doc.setTextColor(100, 100, 100);
    const termsText = "This is a computer-generated invoice and does not require a signature.";
    doc.text(termsText, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: "center" });
    
    // Save the PDF
    doc.save(`Junooni_Invoice_${order.display_id}.pdf`);
  } catch (error) {
    //console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again.");
  }
};  
  if (loading) {
    return (
      <div 
        className="min-h-screen py-10"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-center p-16 min-h-[60vh]">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" style={{ color: BRAND.primary }} />
            <p className="text-lg text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div 
        className="min-h-screen py-10"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto">
          <Card className="max-w-3xl mx-auto my-8 border-red-200">
            <CardHeader className="border-b border-red-100 bg-red-50">
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Error Loading Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-red-600">{error}</p>
              <p className="mb-6 text-gray-600">We're having trouble finding the order information you requested.</p>
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
        className="min-h-screen py-10"
        style={{ 
          background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                       radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
          backgroundColor: "white",
          color: BRAND.textPrimary
        }}
      >
        <div className="container px-4 mx-auto">
          <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
              <CardTitle>Order Not Found</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4">The order with ID {id} could not be found.</p>
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
      className="min-h-screen py-10"
      style={{ 
        background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                     radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
        backgroundColor: "white",
        color: BRAND.textPrimary
      }}
    >
      <div className="container px-4 mx-auto">
        {/* Breadcrumb navigation */}
        {/*<Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-1" />
                  <span>Dashboard</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">
                Order #{order.display_id}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>*}
        
        {/* Header with order summary */}
        <Card className="mb-8 overflow-hidden shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                  Order #{order.display_id}
                </h1>
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
              <div className="text-xl font-bold" style={{ color: BRAND.primary }}>
                {formatPrice(order.total, order.currency_code)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 bg-gray-50">
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
            
            {/* Payment Info */}
            <div className="space-y-1">
              <div className="flex items-center mb-1 text-sm font-medium text-gray-500">
                <CreditCard className="w-4 h-4 mr-1" />
                Payment
              </div>
              <div className="font-medium">
                {order.payment_status === "paid" || order.payment_status === "captured" 
                  ? "Paid" 
                  : "Payment Pending"}
              </div>
              <div className="text-sm text-gray-600">
                Method: Online Payment
              </div>
              <div className="text-sm text-gray-600">
                Transaction ID: {order.payment_collections && order.payment_collections[0]?.id ? 
                  `${order.payment_collections[0].id.split('_').pop()}` : 
                  'N/A'}
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
            <Button size="sm" onClick={generateInvoice}>
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </Card>
        
        {/* Order details sections */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column */}
          <div className="col-span-2">
            {/* Items */}
            <Card className="mb-6 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
                <CardTitle className="flex items-center text-lg">
                  <ShoppingBag className="w-5 h-5 mr-2 text-gray-500" />
                  Order Items
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-sm text-gray-500 bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">Product</th>
                          <th className="w-20 px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="mt-1 text-sm text-gray-500">
                                  {item.subtitle}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">{item.quantity}</td>
                            <td className="px-4 py-4 text-right text-gray-600">
                              {formatPrice(item.unit_price, order.currency_code)}
                            </td>
                            <td className="px-6 py-4 font-medium text-right">
                              {formatPrice(item.total, order.currency_code)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">No items found</div>
                )}
              </CardContent>
            </Card>
            
            {/* Tracking Information - Simple view for creators */}
            <Card className="mb-6 shadow-md">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="flex items-center text-lg">
                  <Truck className="w-5 h-5 mr-2 text-gray-500" />
                  Tracking Information
                </CardTitle>
                <CardDescription>
                  Current status of your order
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order Timeline - Simplified for creators */}
                  <div className="space-y-6">
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
                          Order #{order.display_id} was placed by {`${order.customer.first_name} ${order.customer.last_name}`.trim()}
                        </div>
                      </div>
                    </div>
                    
                    {order.fulfillment_status !== "pending" && order.fulfillment_status !== "not_fulfilled" && (
                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <RefreshCw className="w-4 h-4 text-blue-700" />
                          </div>
                          <div className="w-px h-full my-1 bg-gray-200"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Order Processing</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(new Date(order.created_at).getTime() + 3600000).toISOString())}
                          </div>
                          <div className="mt-1 text-sm">
                            Order is being prepared for shipping
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(order.fulfillment_status === "shipped" || 
                      order.fulfillment_status === "partially_shipped" || 
                      order.fulfillment_status === "fulfilled" || 
                      order.fulfillment_status === "delivered" || 
                      order.fulfillment_status === "completed") && (
                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                            <Truck className="w-4 h-4 text-purple-700" />
                          </div>
                          <div className="w-px h-full my-1 bg-gray-200"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Order Shipped</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(new Date(order.created_at).getTime() + 86400000).toISOString())}
                          </div>
                          <div className="mt-1 text-sm">
                            Order has been shipped via {order.shipping_methods[0]?.name || "Standard Shipping"}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(order.fulfillment_status === "fulfilled" || 
                      order.fulfillment_status === "delivered" || 
                      order.fulfillment_status === "completed") && (
                      <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <CircleCheck className="w-4 h-4 text-green-700" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Order Delivered</div>
                          <div className="text-xs text-gray-500">
                            Estimated delivery date
                          </div>
                          <div className="mt-1 text-sm">
                            Order has been delivered or is ready for pickup
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Current Status Card */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${BRAND.primary}11` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 mr-3 rounded-full" style={{ backgroundColor: `${BRAND.primary}22` }}>
                          {order.fulfillment_status === "pending" || order.fulfillment_status === "not_fulfilled" ? (
                            <Clock className="w-5 h-5" style={{ color: BRAND.primary }} />
                          ) : order.fulfillment_status === "processing" || order.fulfillment_status === "partially_fulfilled" ? (
                            <RefreshCw className="w-5 h-5" style={{ color: BRAND.primary }} />
                          ) : order.fulfillment_status === "shipped" || order.fulfillment_status === "partially_shipped" ? (
                            <Truck className="w-5 h-5" style={{ color: BRAND.primary }} />
                          ) : (
                            <CircleCheck className="w-5 h-5" style={{ color: BRAND.primary }} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">Current Status</div>
                          <div className="font-bold" style={{ color: BRAND.primary }}>
                            {order.fulfillment_status === "pending" || order.fulfillment_status === "not_fulfilled" 
                              ? "Pending" 
                              : order.fulfillment_status === "processing" || order.fulfillment_status === "partially_fulfilled"
                              ? "Processing"
                              : order.fulfillment_status === "shipped" || order.fulfillment_status === "partially_shipped"
                              ? "Shipped"
                              : "Delivered"}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={order.fulfillment_status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column */}
          <div className="col-span-1">
            {/* Order Summary */}
            <Card className="mb-6 shadow-md">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.total - order.shipping_total, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>Included</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span style={{ color: BRAND.primary }}>{formatPrice(order.total, order.currency_code)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Information */}
            <Card className="mb-6 shadow-md">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span>Online Payment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <StatusBadge status={order.payment_status} />
                  </div>
                  
                  {order.payment_collections && order.payment_collections.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-sm">
                        {order.payment_collections[0].id.split('_').pop()}
                      </span>
                    </div>
                  )}
                </div>
                
                {order.payment_collections && order.payment_collections.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-600">Payment Transactions</div>
                      {order.payment_collections.map(pc => (
                        <div key={pc.id} className="flex items-center justify-between px-4 py-2 rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <StatusBadge status={pc.status} />
                            <span className="ml-3 text-gray-600">{pc.id.split('_').pop()}</span>
                          </div>
                          <span className="font-medium">
                            {formatPrice(pc.amount, order.currency_code)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Shipping Methods */}
            <Card className="mb-6 shadow-md">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="flex items-center text-lg">
                  <Truck className="w-5 h-5 mr-2 text-gray-500" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {order.shipping_methods && order.shipping_methods.length > 0 ? (
                    order.shipping_methods.map(method => (
                      <div key={method.id} className="flex items-center justify-between px-4 py-3 rounded-md bg-gray-50">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <span>
                          {formatPrice(method.amount, order.currency_code)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 rounded-md bg-gray-50">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Standard Shipping</span>
                      </div>
                      <span>
                        {formatPrice(order.shipping_total, order.currency_code)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full" size="sm" onClick={generateInvoice}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
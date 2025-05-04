import React, { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Package, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

// Status Badge component
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "not_fulfilled":
      case "pending":
        return { variant: "outline" as const, className: "text-amber-700 bg-amber-50 border-amber-200" };
      case "partially_fulfilled":
      case "requires_action":
      case "processing":
        return { variant: "outline" as const, className: "text-blue-700 bg-blue-50 border-blue-200" };
      case "partially_shipped":
      case "shipped":
        return { variant: "outline" as const, className: "text-purple-700 bg-purple-50 border-purple-200" };
      case "fulfilled":
      case "delivered":
      case "completed":
        return { variant: "outline" as const, className: "text-green-700 bg-green-50 border-green-200" };
      case "cancelled":
      case "canceled":
        return { variant: "outline" as const, className: "text-red-700 bg-red-50 border-red-200" };
      default:
        return { variant: "outline" as const, className: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const { variant, className } = getStatusProps(normalizedStatus);

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
      default:
        return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {formatStatus(status)}
    </Badge>
  );
};

// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "USD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
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
          ? data.orders.find(order => order.id === id)
          : null
          
        if (!orderData) {
          throw new Error(`Order with ID ${id} not found`)
        }
        
        // Transform the order data
        const transformedOrder = transformOrderData(orderData)
        setOrder(transformedOrder)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError(err.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [id])
  
  // Helper function to transform order data
  const transformOrderData = (orderData: any): Order => {
    // Your existing transformation logic
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
    
    const shippingTotal = 
      (typeof orderData.shipping_total === 'number') ? orderData.shipping_total :
      (orderData.shipping_total?.value) ? parseFloat(orderData.shipping_total.value) : 0
    
    const shippingMethods: ShippingMethod[] = (orderData.shipping_methods || []).map((method: any) => ({
      id: method.id || `sm_${Math.random().toString(36).substr(2, 9)}`,
      name: method.name || "Standard Shipping",
      amount: typeof method.amount === 'number' ? method.amount : 
        (method.amount?.value ? parseFloat(method.amount.value) : 0)
    }))
    
    // In your transformOrderData function, update the item transformation part:

const transformedItems: OrderItem[] = (orderData.items || []).map((item: any, index: number) => {
  const unitPrice = 
    (typeof item.unit_price === 'number') ? item.unit_price :
    (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
    (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0
  
  const quantity = item.quantity || 1
  
  // Log the original item to see its structure
  console.log(`Item ${index} raw data:`, item);
  
  // Try to find subtitle from various possible fields
  let subtitle = "";
  if (item.subtitle) {
    subtitle = item.subtitle;
    console.log(`Found subtitle in item.subtitle: ${subtitle}`);
  } else if (item.product_subtitle) {
    subtitle = item.product_subtitle;
    console.log(`Found subtitle in item.product_subtitle: ${subtitle}`);
  } else if (item.variant && typeof item.variant === 'string') {
    subtitle = item.variant;
    console.log(`Found subtitle in item.variant: ${subtitle}`);
  } else if (item.variant && item.variant.title) {
    subtitle = item.variant.title;
    console.log(`Found subtitle in item.variant.title: ${subtitle}`);
  } else if (item.variant_title) {
    subtitle = item.variant_title;
    console.log(`Found subtitle in item.variant_title: ${subtitle}`);
  } else if (item.description) {
    subtitle = item.description;
    console.log(`Found subtitle in item.description: ${subtitle}`);
  } else if (item.metadata && item.metadata.subtitle) {
    subtitle = item.metadata.subtitle;
    console.log(`Found subtitle in item.metadata.subtitle: ${subtitle}`);
  } else {
    console.log(`No subtitle found for item ${index}`);
  }
  
  return {
    id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
    title: item.title || item.product_title || "Unknown Product",
    subtitle: subtitle,
    quantity: quantity,
    unit_price: unitPrice,
    total: unitPrice * quantity
  }
})
    
    const paymentCollections: PaymentCollection[] = (orderData.payment_collections || []).map((pc: any) => ({
      id: pc.id || `pc_${Math.random().toString(36).substr(2, 9)}`,
      status: pc.status || "unknown",
      amount: typeof pc.amount === 'number' ? pc.amount : 
        (pc.amount?.value ? parseFloat(pc.amount.value) : 0)
    }))
    
    return {
      id: orderData.id,
      display_id: parseInt(orderData.id.split('_')[1] || '0') || 0,
      customer: {
        first_name: "Customer",
        last_name: "",
        email: "customer@example.com"
      },
      created_at: orderData.created_at || new Date().toISOString(),
      total: totalAmount,
      shipping_total: shippingTotal,
      status: orderData.status || "pending",
      items: transformedItems,
      payment_status: orderData.payment_status || "pending",
      fulfillment_status: orderData.fulfillment_status || "not_fulfilled",
      currency_code: "USD",
      shipping_methods: shippingMethods,
      payment_collections: paymentCollections
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[60vh]">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
        <p className="text-lg text-gray-600">Loading order details...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <Card className="max-w-3xl mx-auto my-8 border-red-200">
        <CardHeader className="border-b border-red-100 bg-red-50">
          <CardTitle className="flex items-center text-red-700">
            <RefreshCw className="w-5 h-5 mr-2" />
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
    )
  }
  
  if (!order) {
    return (
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
    )
  }
  
  return (
    <div className="max-w-4xl px-4 mx-auto my-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()} 
        className="mb-6 hover:bg-slate-100"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>
      
      {/* Header with order summary */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Order #{order.display_id}
              </h1>
              <div className="flex items-center mt-2 text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(order.created_at)}</span>
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
              <div className="text-xl font-bold">
                {formatPrice(order.total, order.currency_code)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order details sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left column */}
        <div className="col-span-2">
          {/* Items */}
          <Card className="mb-6">
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
                            <div className="font-medium">{item.subtitle}</div>
                            {item.title && (
                              <div className="mt-1 text-sm text-gray-500">{item.title}</div>
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
          
          {/* Payments */}
          <Card className="mb-6">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {order.payment_collections && order.payment_collections.length > 0 ? (
                <div className="space-y-3">
                  {order.payment_collections.map(pc => (
                    <div key={pc.id} className="flex items-center justify-between px-4 py-2 rounded-md bg-gray-50">
                      <div className="flex items-center">
                        <StatusBadge status={pc.status} />
                        <span className="ml-3 text-gray-600">Payment #{pc.id.split('_').pop()}</span>
                      </div>
                      <span className="font-medium">
                        {formatPrice(pc.amount, order.currency_code)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No payment information available</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column */}
        <div className="col-span-1">
          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-lg">Order Summary</CardTitle>
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
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total, order.currency_code)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Shipping */}
          <Card className="mb-6">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="flex items-center text-lg">
                <Truck className="w-5 h-5 mr-2 text-gray-500" />
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <h4 className="mb-2 font-medium">Shipping Method</h4>
                {order.shipping_methods && order.shipping_methods.length > 0 ? (
                  <div className="space-y-2">
                    {order.shipping_methods.map(sm => (
                      <div key={sm.id} className="flex items-center justify-between px-3 py-2 rounded bg-gray-50">
                        <span>{sm.name}</span>
                        <span className="font-medium">{formatPrice(sm.amount, order.currency_code)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping methods found</p>
                )}
              </div>
              
              <div>
                <h4 className="mb-2 font-medium">Delivery Status</h4>
                <div className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-500" />
                  <StatusBadge status={order.fulfillment_status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
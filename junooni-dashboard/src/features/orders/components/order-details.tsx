// src/features/orders/components/order-details.tsx
"use client"

import { useState } from "react"
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Download, 
  Package, 
  User,
  Truck,
  ShoppingBag
} from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineContent,
} from "@/components/ui/timeline"

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

// Define types
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"
type PaymentStatus = "paid" | "pending" | "failed"

interface OrderItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  total: number
  image: string
}

interface OrderEvent {
  id: string
  date: string
  type: string
  description: string
}

interface CustomerInfo {
  id: string
  name: string
  email: string
  phone: string
}

interface Address {
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface ShippingInfo {
  method: string
  tracking_number?: string
  tracking_url?: string
  estimated_delivery?: string
  address: Address
}

interface PaymentInfo {
  method: string
  card_last4?: string
  card_brand?: string
  transaction_id: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  customer: CustomerInfo
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_info: ShippingInfo
  payment_info: PaymentInfo
  notes: string
  events: OrderEvent[]
}

// Sample order data
const orderData: Order = {
  id: "1",
  orderNumber: "ORD-2025-0001",
  date: "2025-03-15T14:30:00",
  customer: {
    id: "cust-1001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  },
  items: [
    {
      id: "item-1",
      name: "Premium Wireless Headphones",
      sku: "SKU-001",
      quantity: 1,
      price: 79.99,
      total: 79.99,
      image: "/api/placeholder/40/40"
    },
    {
      id: "item-2",
      name: "Smartphone Fast Charger",
      sku: "SKU-002",
      quantity: 2,
      price: 24.99,
      total: 49.98,
      image: "/api/placeholder/40/40"
    },
    {
      id: "item-3",
      name: "Protective Phone Case",
      sku: "SKU-003",
      quantity: 1,
      price: 19.99,
      total: 19.99,
      image: "/api/placeholder/40/40"
    }
  ],
  subtotal: 149.96,
  shipping_cost: 9.99,
  tax: 12.50,
  discount: 10.00,
  total: 162.45,
  status: "delivered",
  payment_status: "paid",
  shipping_info: {
    method: "Standard Shipping",
    tracking_number: "TRK123456789",
    tracking_url: "https://track.example.com/TRK123456789",
    estimated_delivery: "2025-03-18",
    address: {
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "United States"
    }
  },
  payment_info: {
    method: "Credit Card",
    card_last4: "4242",
    card_brand: "Visa",
    transaction_id: "txn_1234567890"
  },
  notes: "Customer requested gift wrapping for item SKU-001",
  events: [
    {
      id: "evt-001",
      date: "2025-03-15T14:30:00",
      type: "order_placed",
      description: "Order placed and confirmed"
    },
    {
      id: "evt-002",
      date: "2025-03-15T14:35:00",
      type: "payment_received",
      description: "Payment received and processed"
    },
    {
      id: "evt-003",
      date: "2025-03-16T09:15:00",
      type: "order_processing",
      description: "Order processing started"
    },
    {
      id: "evt-004",
      date: "2025-03-16T11:30:00",
      type: "order_shipped",
      description: "Order shipped via Standard Shipping"
    },
    {
      id: "evt-005",
      date: "2025-03-17T16:45:00",
      type: "out_for_delivery",
      description: "Order out for delivery"
    },
    {
      id: "evt-006",
      date: "2025-03-17T18:20:00",
      type: "order_delivered",
      description: "Order delivered successfully"
    }
  ]
};

// Status colors
const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

// Payment status colors
const paymentStatusColors: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800"
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order>(orderData);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  
  // In a real app, you would fetch the order data based on the id
  // useEffect(() => {
  //   const fetchOrder = async () => {
  //     const response = await fetch(`/api/orders/${params.id}`)
  //     const data = await response.json()
  //     setOrder(data)
  //   }
  //   fetchOrder()
  // }, [params.id])

  const handleStatusUpdate = () => {
    // In a real app, you would call an API to update the status
    setOrder({
      ...order,
      status: newStatus
    });
    setStatusUpdateDialog(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <Badge variant="outline" className={statusColors[order.status]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Placed on {formatDate(order.date)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Update Status</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription>
                  Change the status of order {order.orderNumber}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStatusUpdateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Send Invoice</Button>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="rounded-md" 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="font-medium text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t">
            <div className="ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping:</span>
                <span>${order.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-semibold">{order.customer.name}</div>
                <div className="text-sm">{order.customer.email}</div>
                <div className="text-sm">{order.customer.phone}</div>
              </div>
              <div className="mt-4 text-sm">
                <Link to={`/customers/${order.customer.id}`} className="text-blue-600 hover:underline">
                  View customer profile
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Information
              </CardTitle>
              <Badge variant="outline" className={statusColors[order.status]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{order.shipping_info.method}</div>
                {order.shipping_info.tracking_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Tracking:</span>
                    <a 
                      href={order.shipping_info.tracking_url || "#"} 
                      className="text-blue-600 hover:underline" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {order.shipping_info.tracking_number}
                    </a>
                  </div>
                )}
                {order.shipping_info.estimated_delivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Estimated Delivery:</span>
                    <span>{new Date(order.shipping_info.estimated_delivery).toLocaleDateString()}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="pt-2">
                  <div className="font-semibold">Shipping Address:</div>
                  <div>{order.shipping_info.address.line1}</div>
                  {order.shipping_info.address.line2 && <div>{order.shipping_info.address.line2}</div>}
                  <div>
                    {order.shipping_info.address.city}, {order.shipping_info.address.state} {order.shipping_info.address.postal_code}
                  </div>
                  <div>{order.shipping_info.address.country}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
              <Badge variant="outline" className={paymentStatusColors[order.payment_status]}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{order.payment_info.method}</div>
                {order.payment_info.card_brand && order.payment_info.card_last4 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Card:</span>
                    <span>{order.payment_info.card_brand} **** {order.payment_info.card_last4}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-xs">{order.payment_info.transaction_id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="p-4">
          <Timeline>
            {order.events.map((event, index) => (
              <TimelineItem key={event.id}>
                {index < order.events.length - 1 && <TimelineConnector />}
                <TimelineHeader>
                  <TimelineIcon>
                    {event.type === "order_placed" && <ShoppingBag className="w-4 h-4" />}
                    {event.type === "payment_received" && <CreditCard className="w-4 h-4" />}
                    {event.type === "order_processing" && <Package className="w-4 h-4" />}
                    {event.type === "order_shipped" && <Truck className="w-4 h-4" />}
                    {event.type === "out_for_delivery" && <Truck className="w-4 h-4" />}
                    {event.type === "order_delivered" && <Package className="w-4 h-4" />}
                  </TimelineIcon>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {event.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                  </div>
                </TimelineHeader>
                <TimelineContent>
                  <p className="text-sm">{event.description}</p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabsContent>
        <TabsContent value="notes" className="p-4">
          <Card>
            <CardContent className="p-6">
              {order.notes ? (
                <p className="text-sm">{order.notes}</p>
              ) : (
                <p className="text-sm text-gray-500">No notes available for this order.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activities" className="p-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">No activities recorded for this order yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
// src/types/order.ts

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = "paid" | "pending" | "failed"

export interface OrderItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  total: number
  image: string
  variant?: string
  options?: Record<string, string>
}

export interface CustomerInfo {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface ShippingInfo {
  method: string
  tracking_number?: string
  tracking_url?: string
  estimated_delivery?: string
  address: Address
  carrier?: string
  shipping_zone?: string
}

export interface PaymentInfo {
  method: string
  card_last4?: string
  card_brand?: string
  transaction_id: string
  amount: number
  currency: string
  refunded_amount?: number
}

export interface OrderEvent {
  id: string
  date: string
  type: string
  description: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface OrderNote {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  is_internal: boolean
}

export interface Order {
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
  fulfillment_status?: "unfulfilled" | "partially_fulfilled" | "fulfilled"
  shipping_info: ShippingInfo
  payment_info: PaymentInfo
  billing_address?: Address
  notes?: string
  notes_list?: OrderNote[]
  events: OrderEvent[]
  tags?: string[]
  metadata?: Record<string, any>
  currency: string
  created_by?: string
  source?: "website" | "admin" | "pos" | "mobile_app" | "marketplace"
}

// Helper functions

export const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  }
  return statusColors[status]
}

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const paymentStatusColors: Record<PaymentStatus, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800"
  }
  return paymentStatusColors[status]
}

export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}




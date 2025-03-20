// src/services/orderService.ts
import { Order, OrderStatus } from "./types"

// Base API URL based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'An error occurred')
  }
  return response.json()
}

// For Medusa JS integration
export const mapMedusaOrderToOrder = (medusaOrder: any): Order => {
  // This function maps a Medusa order to our internal Order type
  // Customize this based on the actual structure of Medusa's orders
  return {
    id: medusaOrder.id,
    orderNumber: medusaOrder.display_id || medusaOrder.id,
    date: medusaOrder.created_at,
    customer: {
      id: medusaOrder.customer?.id || '',
      name: `${medusaOrder.customer?.first_name || ''} ${medusaOrder.customer?.last_name || ''}`.trim(),
      email: medusaOrder.email,
      phone: medusaOrder.customer?.phone || ''
    },
    items: medusaOrder.items?.map((item: any) => ({
      id: item.id,
      name: item.title,
      sku: item.variant?.sku || '',
      quantity: item.quantity,
      price: item.unit_price / 100, // Medusa stores amounts in cents
      total: (item.unit_price * item.quantity) / 100,
      image: item.thumbnail || '/api/placeholder/40/40',
      variant: item.variant?.title || '',
      options: item.variant?.options?.reduce((acc: Record<string, string>, option: any) => {
        acc[option.option_id] = option.value
        return acc
      }, {})
    })) || [],
    subtotal: medusaOrder.subtotal / 100,
    shipping_cost: medusaOrder.shipping_total / 100,
    tax: medusaOrder.tax_total / 100,
    discount: medusaOrder.discount_total / 100,
    total: medusaOrder.total / 100,
    status: mapMedusaFulfillmentStatusToOrderStatus(medusaOrder.fulfillment_status),
    payment_status: mapMedusaPaymentStatusToPaymentStatus(medusaOrder.payment_status),
    fulfillment_status: medusaOrder.fulfillment_status,
    shipping_info: {
      method: medusaOrder.shipping_methods?.[0]?.shipping_option?.name || 'Standard Shipping',
      tracking_number: medusaOrder.fulfillments?.[0]?.tracking_numbers?.[0] || undefined,
      tracking_url: medusaOrder.fulfillments?.[0]?.tracking_links?.[0] || undefined,
      carrier: medusaOrder.shipping_methods?.[0]?.shipping_option?.provider_id || undefined,
      address: medusaOrder.shipping_address ? {
        line1: medusaOrder.shipping_address.address_1,
        line2: medusaOrder.shipping_address.address_2,
        city: medusaOrder.shipping_address.city,
        state: medusaOrder.shipping_address.province,
        postal_code: medusaOrder.shipping_address.postal_code,
        country: medusaOrder.shipping_address.country_code
      } : {} as any
    },
    payment_info: {
      method: 'Credit Card', // Medusa doesn't provide detailed payment info
      transaction_id: medusaOrder.payments?.[0]?.id || '',
      amount: (medusaOrder.payments?.[0]?.amount || 0) / 100,
      currency: medusaOrder.currency_code
    },
    billing_address: medusaOrder.billing_address ? {
      line1: medusaOrder.billing_address.address_1,
      line2: medusaOrder.billing_address.address_2,
      city: medusaOrder.billing_address.city,
      state: medusaOrder.billing_address.province,
      postal_code: medusaOrder.billing_address.postal_code,
      country: medusaOrder.billing_address.country_code
    } : undefined,
    currency: medusaOrder.currency_code,
    events: [],
    source: 'website' // Default value
  }
}

// Map Medusa fulfillment status to our OrderStatus
const mapMedusaFulfillmentStatusToOrderStatus = (
  fulfillmentStatus: string | null | undefined
): OrderStatus => {
  switch (fulfillmentStatus) {
    case 'not_fulfilled':
      return 'pending'
    case 'fulfilled':
      return 'shipped'
    case 'shipped':
      return 'shipped'
    case 'partially_fulfilled':
      return 'processing'
    case 'canceled':
      return 'cancelled'
    case 'requires_action':
      return 'processing'
    default:
      return 'pending'
  }
}

// Map Medusa payment status to our PaymentStatus
const mapMedusaPaymentStatusToPaymentStatus = (
  paymentStatus: string | null | undefined
): 'paid' | 'pending' | 'failed' => {
  switch (paymentStatus) {
    case 'captured':
      return 'paid'
    case 'awaiting':
      return 'pending'
    case 'not_paid':
      return 'pending'
    case 'canceled':
      return 'failed'
    case 'requires_action':
      return 'pending'
    default:
      return 'pending'
  }
}

// Order service functions
export const orderService = {
  // Get all orders with optional filters
  async getOrders(params: {
    limit?: number;
    offset?: number;
    status?: OrderStatus;
    query?: string;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
  } = {}): Promise<{ orders: Order[]; count: number }> {
    const queryParams = new URLSearchParams()
    
    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    const response = await fetch(
      `${API_BASE_URL}/api/orders?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the orders to our format
    const orders = data.orders.map(mapMedusaOrderToOrder)
    
    return {
      orders,
      count: data.count
    }
  },
  
  // Get a single order by ID
  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Update order status
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Capture payment for an order
  async capturePayment(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Refund payment for an order
  async refundPayment(id: string, amount: number, reason?: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, reason })
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Cancel an order
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Add a note to an order
  async addNote(id: string, note: string, isInternal: boolean = true): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note, isInternal })
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  },
  
  // Create shipment for an order
  async createShipment(
    id: string, 
    fulfillmentItems: { item_id: string; quantity: number }[],
    trackingNumber?: string,
    trackingUrl?: string
  ): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fulfillmentItems,
        trackingNumber,
        trackingUrl
      })
    })
    
    const data = await handleResponse(response)
    
    // If using Medusa, map the order to our format
    return mapMedusaOrderToOrder(data.order)
  }
}

export default orderService
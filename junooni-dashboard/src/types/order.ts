// // types/order.ts
// export interface Order {
//     id: string;
//     metadata: Record<string, unknown> | null;
//     total: number;
//     subtotal: number;
//     shipping_total: number;
//     tax_total: number;
//     status: string;
//     version: number;
//     created_at: string;
//     items: Array<{
//       id: string;
//       title: string;
//       subtitle?: string | null;
//       thumbnail?: string | null;
//       variant_id: string;
//       product_id: string;
//       quantity: number;
//       unit_price: number;
//       total: number;
//       // include any other nested fields you're using
//     }>;
//     shipping_methods: Array<{
//       id: string;
//       name: string;
//       description?: string | null;
//       amount: number;
//       // other fields if needed
//     }>;
//     payment_collections: Array<{
//       id: string;
//       status: string;
//       amount: number;
//       captured_amount?: number;
//       refunded_amount?: number;
//     }>;
//     fulfillments: Array<any>;
//     payment_status: string;
//     fulfillment_status: string;
//   }
//   // types/order.ts
// export interface Order {
//     id: string;
//     metadata: Record<string, unknown> | null;
//     total: number;
//     subtotal: number;
//     shipping_total: number;
//     tax_total: number;
//     status: string;
//     version: number;
//     created_at: string;
//     items: Array<{
//       id: string;
//       title: string;
//       subtitle?: string | null;
//       thumbnail?: string | null;
//       variant_id: string;
//       product_id: string;
//       quantity: number;
//       unit_price: number;
//       total: number;
  
//       // Additional fields from API response
//       product_title?: string;
//       product_description?: string;
//       product_handle?: string;
//       discount_total?: number;
//       tax_total?: number;
//       fulfilled_total?: number;
//       refundable_total?: number;
//       is_discountable?: boolean;
//       is_giftcard?: boolean;
//       raw_unit_price?: { value: string; precision: number };
//       raw_total?: { value: string; precision: number };
//       raw_subtotal?: { value: string; precision: number };
//       raw_tax_total?: { value: string; precision: number };
//       variant_title?: string;
//       variant_sku?: string | null;
//       variant_option_values?: unknown;
//       variant?: {
//         id: string;
//         product: unknown;
//       };
//     }>;
//     shipping_methods: Array<{
//       id: string;
//       name: string;
//       description?: string | null;
//       amount: number;
//     }>;
//     payment_collections: Array<{
//       id: string;
//       status: string;
//       amount: number;
//       captured_amount?: number;
//       refunded_amount?: number;
//     }>;
//     fulfillments: Array<any>;
//     payment_status: string;
//     fulfillment_status: string;
//   }
  
export interface OrderItem {
    id: string
    name: string     // OrdersPage expects name, but transformation creates title
    title?: string   // Add this for OrderDetails component
    quantity: number
    price: number
    unit_price?: number // Add this for OrderDetails component
    total?: number    // Add this for OrderDetails component
}

export interface ShippingMethod {
    id: string
    name: string
    amount: number
}

export interface PaymentCollection {
    id: string
    status: string
    amount: number
}

export interface Order {
    id: string
    display_id: number
    customer: {
      first_name: string
      last_name: string
      email: string
    }
    created_at: string
    total: number
    items: OrderItem[]
    payment_status: string
    fulfillment_status: string
    currency_code: string
    status?: string               // Add this for OrderDetails
    shipping_total?: number       // Add this for OrderDetails
    shipping_methods?: ShippingMethod[] // Add this for OrderDetails
    payment_collections?: PaymentCollection[] // Add this for OrderDetails
}
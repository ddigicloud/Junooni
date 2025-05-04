// import { Order } from './schema';

// export const orders: Order[] = [
//   {
//     id: "1", 
//     customerName: "John Doe",
//     totalAmount: 120.5,
//     items: [
//       { name: "Product A", quantity: 2, price: 30.5 },
//       { name: "Product B", quantity: 1, price: 59.5 },
//     ], 
//     paymentStatus: "Paid",
//     deliveryStatus: "Delivered",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     customerName: "Jane Smith",
//     totalAmount: 85.0,
//     items: [
//       { name: "Product C", quantity: 1, price: 85.0 },
//     ], 
//     paymentStatus: "Pending",
//     deliveryStatus: "Shipped",
//     createdAt: new Date().toISOString(),
//   },
  
//   {
//     id: "3",
//     customerName: "Alice Johnson",
//     totalAmount: 200.0,
//     items: [
//       { name: "Product D", quantity: 3, price: 50.0 },
//       { name: "Product E", quantity: 2, price: 25.0 },
//     ],
//     paymentStatus: "Paid",
//     deliveryStatus: "Delivered",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "4",
//     customerName: "Bob Brown",
//     totalAmount: 150.75,
//     items: [
//       { name: "Product F", quantity: 1, price: 75.75 },
//       { name: "Product G", quantity: 2, price: 37.5 },
//     ],
//     paymentStatus: "Paid",
//     deliveryStatus: "Processing",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "5",
//     customerName: "Charlie Green",
//     totalAmount: 99.99,
//     items: [
//       { name: "Product H", quantity: 1, price: 99.99 },
//     ],
//     paymentStatus: "Refunded",
//     deliveryStatus: "Cancelled",
//     createdAt: new Date().toISOString(),
//   },
// ];

// types/order.ts
export interface Order {
  id: string;
  created_at: string;
  total: number;
  shipping_total: number;
  payment_status: string;
  fulfillment_status: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  shipping_methods: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  payment_collections: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
}


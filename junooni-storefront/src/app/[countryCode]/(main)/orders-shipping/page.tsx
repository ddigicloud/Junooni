import { Metadata } from "next"
import OrdersShippingPage from "./OrdersShippingPage"

export const metadata: Metadata = {
  title: "Orders & Shipping Information | Junooni Store",
  description:
    "Track your order, check delivery times, and learn about shipping options at Junooni. Free shipping on orders above ₹499. Standard, express, and same-day delivery available. International shipping to 12+ countries. Complete guide to order tracking, modifications, cancellations, and delivery issues.",
  openGraph: {
    title: "Orders & Shipping | Junooni Store",
    description: "Track orders, check delivery times, shipping costs, and manage your orders. Free shipping on orders ₹499+",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orders & Shipping | Junooni Store",
    description: "Complete shipping guide - tracking, delivery times, costs, and order management",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "order tracking",
    "shipping information",
    "delivery time India",
    "free shipping",
    "track order Junooni",
    "cancel order",
    "modify order",
    "shipping costs India",
    "express delivery",
    "same day delivery",
    "international shipping",
    "delivery issues",
    "order status",
    "COD cash on delivery",
    "standard shipping",
    "fast delivery India",
  ],
}

export default function OrdersShippingPageWrapper() {
  return <OrdersShippingPage />
}
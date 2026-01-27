import { Metadata } from "next"
import HelpdeskPage from "./HelpdeskPage"

export const metadata: Metadata = {
  title: "Help Center & Customer Support | Junooni Store",
  description:
    "Get help with orders, shipping, returns, payments, and account issues at Junooni. Browse FAQs, search help articles, or contact our support team via live chat, email, or phone. Available Monday-Friday 9 AM - 6 PM IST. Fast, friendly customer service for all your creator merchandise needs.",
  openGraph: {
    title: "Help Center | Junooni Store",
    description: "Get instant help with orders, returns, payments & more. Live chat, email & phone support available.",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center | Junooni Store",
    description: "Customer support for orders, shipping, returns & account help",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "customer support",
    "help center",
    "contact support",
    "order help",
    "shipping help",
    "return help",
    "payment issues",
    "account help",
    "FAQ Junooni",
    "live chat support",
    "customer service",
    "support email",
    "support phone number",
    "track order help",
    "refund help",
    "cancel order help",
  ],
}

export default function HelpdeskPageWrapper() {
  return <HelpdeskPage />
}
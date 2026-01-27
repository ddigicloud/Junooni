import { Metadata } from "next"
import PaymentMethodsPage from "./PaymentMethodsPage"

export const metadata: Metadata = {
  title: "Payment Methods | Junooni Store",
  description:
    "Secure payment options at Junooni Store. Pay with credit/debit cards, UPI (Google Pay, PhonePe, Paytm), net banking, digital wallets, COD, and EMI. 100% secure SSL encrypted transactions with PCI-DSS compliance.",
  openGraph: {
    title: "Payment Methods | Junooni Store",
    description: "Multiple secure payment options - Cards, UPI, Net Banking, Wallets, COD & EMI. Zero payment gateway charges!",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Methods | Junooni Store",
    description: "Flexible and secure payment options for your shopping convenience",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "payment methods India",
    "secure online payments",
    "UPI payment",
    "credit card payment",
    "debit card payment",
    "net banking payment",
    "cash on delivery",
    "COD payment",
    "EMI options",
    "Google Pay",
    "PhonePe",
    "Paytm payment",
    "digital wallet payment",
    "safe online shopping",
    "PCI compliant payments",
    "SSL encrypted payment",
  ],
}

export default function PaymentMethodsPageWrapper() {
  return <PaymentMethodsPage />
}
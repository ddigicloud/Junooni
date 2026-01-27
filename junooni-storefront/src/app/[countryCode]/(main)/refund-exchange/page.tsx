// app/refunds-returns/page.tsx
import { Metadata } from "next"
import RefundsReturnsPage from "./RefundsReturnsPage"

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Junooni Store",
  description:
    "Learn about Junooni's return and refund policy for print-on-demand products. 7-day claim window, free replacements for defective items, and detailed information on exchanges, RTO orders, and customer support.",
  openGraph: {
    title: "Returns & Refunds Policy | Junooni Store",
    description: "Comprehensive return and refund policy for custom print-on-demand creator merchandise",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Returns & Refunds Policy | Junooni Store",
    description: "Return policy for defective items, refund process, and quality assurance",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "returns policy",
    "refunds policy",
    "print on demand returns",
    "defective product returns",
    "Junooni refund process",
    "exchange policy",
    "damaged items refund",
    "RTO orders",
    "unboxing video requirement",
  ],
}

export default function RefundsReturnsPageWrapper() {
  return <RefundsReturnsPage />
}
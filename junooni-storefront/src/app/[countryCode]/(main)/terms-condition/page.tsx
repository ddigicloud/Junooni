import { Metadata } from "next"
import TermsConditionsPage from "./TermsConditionsPage" // adjust path based on your file structure

export const metadata: Metadata = {
  title: "Terms & Conditions | Junooni Store",
  description:
    "Read Junooni's Terms and Conditions. Learn about user agreements, account policies, intellectual property rights, payment terms, shipping, returns, and legal policies for using our creator merchandise marketplace.",
  openGraph: {
    title: "Terms & Conditions | Junooni Store",
    description: "Terms and Conditions for using Junooni Store - India's creator merchandise marketplace",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Junooni Store",
    description: "Legal terms and conditions for Junooni Store users",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "terms and conditions",
    "user agreement",
    "terms of service",
    "legal policies",
    "Junooni terms",
    "creator marketplace terms",
  ],
}

export default function TermsPage() {
  return <TermsConditionsPage />
}
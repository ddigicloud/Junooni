import { Metadata } from "next"
import StillNeedHelpPage from "./StillNeedHelpPage"

export const metadata: Metadata = {
  title: "Contact Us - Customer Support | Junooni Store",
  description:
    "Contact Junooni customer support team. Get help via phone (+91 8694062222), email (support@junooni.com), WhatsApp, or live chat. Available Mon-Sat 9 AM - 7 PM IST. Submit support requests, track issues, and get instant assistance. Multiple support channels, fast response times, friendly service.",
  openGraph: {
    title: "Contact Us | Junooni Store",
    description: "Reach our support team via phone, email, WhatsApp, or live chat. Fast, friendly assistance for all your needs.",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Junooni Support",
    description: "Multiple ways to reach us - phone, email, chat, WhatsApp. We're here to help!",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "contact Junooni",
    "customer support",
    "contact customer service",
    "Junooni phone number",
    "Junooni email",
    "live chat support",
    "WhatsApp support",
    "submit support request",
    "contact form",
    "customer service India",
    "help contact",
    "support hours",
    "email support",
    "phone support",
    "chat with support",
    "contact page",
  ],
}

export default function StillNeedHelpPageWrapper() {
  return <StillNeedHelpPage />
}
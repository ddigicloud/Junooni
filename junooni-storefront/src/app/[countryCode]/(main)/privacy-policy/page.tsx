import { Metadata } from "next"
import PrivacyPolicyPage from "./PrivacyPolicyPage"

export const metadata: Metadata = {
  title: "Privacy Policy | Junooni Store - DPDPA 2023 Compliant",
  description:
    "Junooni's comprehensive privacy policy compliant with India's Digital Personal Data Protection Act (DPDPA) 2023. Learn how we collect, use, protect, and manage your personal data. Your rights, data security, cookie policy, and grievance redressal mechanism.",
  openGraph: {
    title: "Privacy Policy | Junooni Store",
    description: "DPDPA 2023 compliant privacy policy. Learn about data collection, security, your rights, and how we protect your personal information.",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Junooni Store",
    description: "Comprehensive privacy policy compliant with Indian data protection laws",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "privacy policy",
    "data protection",
    "DPDPA 2023",
    "Digital Personal Data Protection Act",
    "personal data privacy",
    "data security",
    "user rights",
    "cookie policy",
    "data retention",
    "grievance redressal",
    "data breach notification",
    "consent management",
    "children's privacy",
    "Indian privacy law",
    "data fiduciary",
  ],
}

export default function PrivacyPolicyPageWrapper() {
  return <PrivacyPolicyPage />
}
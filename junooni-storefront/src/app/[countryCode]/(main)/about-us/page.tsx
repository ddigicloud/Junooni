import { Metadata } from "next"
import AboutUsPage from "./AboutUsPage" // adjust path based on your file structure

export const metadata: Metadata = {
  title: "About Us | Junooni — India's Creator Merchandise Marketplace",
  description:
    "Junooni is India's official creator merchandise marketplace. We connect fans with authentic, limited-edition merch from their favourite Indian creators — musicians, YouTubers, artists, and more. Shop official drops, support creators directly.",
  openGraph: {
    title: "About Junooni — Made by Creators, Loved by Fans",
    description:
      "India's first dedicated creator merch platform. Discover official merchandise from Bollywood producers, YouTubers, and independent artists. Every purchase supports the creator directly.",
    type: "website",
    siteName: "Junooni",
    url: "https://junooni.com/in/about-us",
    images: [
      {
        url: "https://junooni.com/og-about.jpg", // replace with actual OG image
        width: 1200,
        height: 630,
        alt: "Junooni — India's Creator Merchandise Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Junooni — India's Creator Merch Marketplace",
    description:
      "Shop official creator merchandise from your favourite Indian musicians, YouTubers, and artists. Limited drops, authentic products, pan-India shipping.",
    images: ["https://junooni.com/og-about.jpg"], // replace with actual image
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "about junooni",
    "junooni creator marketplace",
    "official creator merch India",
    "Indian creator merchandise",
    "buy creator merch India",
    "Bollywood merch",
    "YouTuber merch India",
    "official fan merchandise India",
    "creator economy India",
    "limited edition merch India",
  ],
  alternates: {
    canonical: "https://junooni.com/in/about-us",
  },
}

export default function AboutPage() {
  return <AboutUsPage />
}
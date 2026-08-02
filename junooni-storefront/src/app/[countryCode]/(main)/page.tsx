import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { retriveVendors } from "@lib/data/vendors"
import { Suspense } from "react"
import JsonLd from "./components/JsonLd"
// Fast components - load immediately
import Hero from "@modules/home/components/hero"
import Features from "@modules/home/components/Features"
import VendorList from "@modules/home/components/VendorList"
import CreatorInstagram from "@modules/home/components/CreatorInstagram"
import HomeCategories from "@modules/home/components/HomeCategories"
import CollectionBanner from "@modules/home/components/CollectionBanner"

// Heavy components - product sections with API calls
import Bestsellers from "@modules/home/components/BestSellers"
import FeaturedProducts from "@modules/home/components/featured-products"

export const metadata: Metadata = {
  title: "Junooni | India's #1 Creator Merchandise Marketplace",
  description:
    "Shop exclusive merchandise from your favourite Indian creators, influencers & personalities. Discover unique apparel, accessories, prints & keepsakes. Authentic. Limited edition. Delivered across India.",
  alternates: {
    // ✅ FIX 1: Canonical URL prevents duplicate indexing between / and /in
    canonical: "https://junooni.com/in",
  },
  openGraph: {
    title: "Junooni | India's #1 Creator Merchandise Marketplace",
    description:
      "Shop exclusive merchandise from India's top creators & influencers. Authentic designs, quality products, direct creator support.",
    type: "website",
    siteName: "Junooni",
    url: "https://junooni.com/in",
    // ✅ FIX 2: OG image added — WhatsApp/Twitter previews now show a proper card
    images: [
      {
        url: "https://junooni.com/_next/static/media/header-banner.fee7e3c0.webp",
        width: 1200,
        height: 630,
        alt: "Junooni — India's #1 Creator Merchandise Marketplace",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Junooni | India's #1 Creator Merchandise Marketplace",
    description:
      "Shop exclusive merchandise from India's top creators & influencers.",
    // ✅ FIX 3: Twitter image added
    images: ["https://junooni.com/_next/static/media/header-banner.fee7e3c0.webp"],
  },
  keywords: [
    "creator merchandise India",
    "Indian creator merch",
    "influencer merchandise India",
    "buy creator merch online India",
    "official creator merchandise marketplace",
    "support Indian creators",
    "limited edition creator drops India",
    "celebrity merch India",
  ],
  robots: {
    index: true,
    follow: true,
  },
}

// ── Organization Schema ────────────────────────────────────────────────────────
// ✅ FIX 4: Added Organization schema — the most important AEO signal.
// AI engines (ChatGPT, Perplexity, Google AI Overview) use this to understand
// what Junooni is and cite it when answering questions about creator merch in India.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Junooni",
  "url": "https://junooni.com",
  "logo": "https://junooni.com/_next/static/media/JUNOONI_logo.703fd026.ico",
  "description":
    "Junooni is India's #1 creator merchandise marketplace where fans can buy exclusive official merchandise from their favourite Indian creators, influencers, and personalities.",
  "foundingLocation": {
    "@type": "Place",
    "addressCountry": "IN",
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "bejunooni@gmail.com",
    "availableLanguage": ["English", "Hindi"],
  },
  "sameAs": [
    "https://studio.junooni.com",
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
  },
}

// ── FAQ Schema ─────────────────────────────────────────────────────────────────
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Junooni is India's #1 creator merchandise marketplace where fans can buy exclusive official merchandise from their favourite Indian creators, influencers, and personalities across platforms like Instagram, YouTube, and more.",
      },
    },
    {
      "@type": "Question",
      "name": "How does creator merchandise work on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Creators list their official merchandise on Junooni. When a fan purchases, the creator earns commission. Junooni handles payments, production, and shipping through its fulfillment service.",
      },
    },
    {
      "@type": "Question",
      "name": "What products can I buy on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Junooni offers a wide range of official creator merchandise including t-shirts, hoodies, sweatshirts, mugs, phone cases, sticker sheets, prints, and accessories — all designed exclusively by Indian creators and influencers.",
      },
    },
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        // ✅ FIX 5: Consistent delivery time — matches product page (5–7 days)
        "text":
          "Delivery typically takes 5–7 business days depending on your location across India.",
      },
    },
    {
      "@type": "Question",
      "name": "Is Junooni available across India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Yes, Junooni ships across India with free shipping on orders above ₹200. We support all major pin codes through our fulfillment partners.",
      },
    },
    {
      "@type": "Question",
      "name": "How can I become a creator on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        // ✅ FIX 6: Now mentions studio.junooni.com specifically
        "text":
          "Any Indian creator, influencer, or public personality can apply to sell official merchandise on Junooni. Visit studio.junooni.com to sign up and start designing your own merch for fans.",
      },
    },
    {
      "@type": "Question",
      "name": "What payment methods does Junooni accept?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Junooni accepts all major payment methods including UPI, credit/debit cards, and net banking through our secure Razorpay payment gateway.",
      },
    },
  ],
}

// ── WebPage Schema ─────────────────────────────────────────────────────────────
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Junooni | India's #1 Creator Merchandise Marketplace",
  "description":
    "Shop exclusive merchandise from your favourite Indian creators, influencers & personalities.",
  "url": "https://junooni.com/in",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Junooni",
    // ✅ FIX 7: Was pointing to /in — WebSite should always be root domain
    "url": "https://junooni.com",
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const [region, { collections }, vendorsList] = await Promise.all([
    getRegion(countryCode),
    listCollections({
      fields: "id, handle, title, metadata",
    }),
    retriveVendors(),
  ])

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* ✅ Organization schema — tells AI engines what Junooni is */}
      <JsonLd data={organizationSchema} />

      {/* ✅ FAQ schema — gets Junooni cited in AI-generated answers */}
      <JsonLd data={faqSchema} />

      {/* ✅ WebPage schema — reinforces page identity for search engines */}
      <JsonLd data={webPageSchema} />

      {/* TIER 1: Critical above-the-fold content */}
      <Hero />

      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow">
          {/* 1. VendorList - Fast component, loads immediately */}
          {/* <VendorList /> */}
          <VendorList vendorsList={vendorsList ?? []} />

          {/* 2. FeaturedProducts - Heavy component (API calls), wrapped in Suspense */}
          <Suspense fallback={<ProductsSkeleton title="Featured Products" />}>
            <div className="pt-12">
              <ul className="flex flex-col gap-x-6">
                <FeaturedProducts collections={collections} region={region} />
              </ul>
            </div>
          </Suspense>

          {/* 3. HomeCategories - Fast component, loads immediately */}
          <HomeCategories />

          {/* 4. CollectionBanner - Fast component, loads immediately */}
          <CollectionBanner />

          {/* 5. Bestsellers - Heavy component (API calls) */}
          <Bestsellers collections={collections} region={region} />

          {/* 6. Features - Fast component, loads immediately */}
          <Features />

          {/* 7. CreatorInstagram - Fast component, loads immediately */}
          <CreatorInstagram vendorsList={vendorsList} />
        </main>
      </div>
    </>
  )
}

// Reusable skeleton for heavy components wrapped in Suspense
function ProductsSkeleton({ title }: { title: string }) {
  return (
    <div className="pt-12">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="w-48 h-8 mb-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 mb-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-center text-gray-500">
          Loading {title}...
        </div>
      </div>
    </div>
  )
}
import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { retriveVendors } from "@lib/data/vendors"
import { Suspense } from "react"
import JsonLd from "./components/JsonLd"

// Fast components - load immediately  
import Hero from "@modules/home/components/hero"
import Features from "@modules/home/components/Features"
import FanContent from "@modules/home/components/FanContent"
import NewsLetter from "@modules/home/components/NewsLetter"
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
    "Shop exclusive creator merchandise from your favorite Indian content creators. Discover unique apparel, prints, tech accessories & keepsakes. Support creators, wear your passion.",
  openGraph: {
    title: "Junooni | India's #1 Creator Merchandise Marketplace",
    description:
      "Shop exclusive merchandise from India's top content creators. Unique designs, quality products, direct creator support.",
    type: "website",
    siteName: "Junooni",
  },
  twitter: {
    card: "summary_large_image",
    title: "Junooni | India's #1 Creator Merchandise Marketplace",
    description:
      "Shop exclusive merchandise from India's top content creators.",
  },
  keywords: [
    "creator merchandise India",
    "Indian creator merch",
    "content creator products",
    "custom apparel India",
    "creator merchandise marketplace",
    "support Indian creators",
    "unique creator designs",
  ],
  robots: {
    index: true,
    follow: true,
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
        "text": "Junooni is India's #1 creator merchandise marketplace where fans can buy exclusive custom merchandise designed by their favourite Indian content creators.",
      },
    },
    {
      "@type": "Question",
      "name": "How does creator merchandise work on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Creators design and list their merchandise on Junooni. When a fan purchases, the creator earns up to 90% commission. Junooni handles payments, and optionally, production and shipping through Junooni Fulfillment.",
      },
    },
    {
      "@type": "Question",
      "name": "What products can I buy on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Junooni offers a wide range of custom merchandise including t-shirts, hoodies, mugs, phone cases, prints, and more — all designed exclusively by Indian creators.",
      },
    },
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Delivery typically takes 5–10 business days depending on your location and the fulfillment method chosen by the creator.",
      },
    },
    {
      "@type": "Question",
      "name": "Is Junooni available across India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Junooni ships across India. We support all major pin codes through our fulfillment partners.",
      },
    },
    {
      "@type": "Question",
      "name": "How can I become a creator on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can apply to become a creator on Junooni by signing up on our platform. Once approved, you can start designing and selling your own custom merchandise to your fans.",
      },
    },
    {
      "@type": "Question",
      "name": "What payment methods does Junooni accept?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Junooni accepts all major payment methods including UPI, credit/debit cards, and net banking through our secure Razorpay payment gateway.",
      },
    },
  ],
}

// ── WebPage schema ─────────────────────────────────────────────────────────────
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Junooni | India's #1 Creator Merchandise Marketplace",
  "description":
    "Shop exclusive creator merchandise from your favorite Indian content creators.",
  "url": "https://junooni.com/in",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Junooni",
    "url": "https://junooni.com/in",
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
      fields: "id, handle, title, *metadata",
    }),
    retriveVendors(),
  ])

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />

      {/* TIER 1: Critical above-the-fold content */}
      <Hero />

      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow">
          {/* 1. VendorList - Fast component, loads immediately */}
          <VendorList />

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

          <Bestsellers collections={collections} region={region} />

          {/* 5. Bestsellers - Heavy component (API calls), wrapped in Suspense */}
          {/* <Suspense fallback={<ProductsSkeleton title="Bestsellers" />}>
            <div className="pt-12">
              <ul className="flex flex-col gap-x-6">
                <Bestsellers collections={collections} region={region} />
              </ul>
            </div>
          </Suspense> */}

          {/* 6-9. Fast components - All load immediately after heavy sections */}

          {/* 6. Features - Fast component, loads immediately */}
          <Features />

          {/* 7. CreatorInstagram - Fast component, loads immediately */}
          <CreatorInstagram vendorsList={vendorsList} />

          {/* 8. FanContent - Fast component, loads immediately */}
          {/* <FanContent /> */}

          {/* 9. NewsLetter - Fast component, loads immediately */}
          {/* <NewsLetter /> */}
        </main>
      </div>
    </>
  )
}

// Reusable skeleton components (Only for heavy components)
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
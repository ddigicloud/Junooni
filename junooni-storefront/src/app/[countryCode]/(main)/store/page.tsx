import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import JsonLd from "../components/JsonLd"

// ✅ SEO: Keyword-rich title and meta description (platform-neutral)
export const metadata: Metadata = {
  title: "Shop Official Creator Merch Online India | Junooni",
  description:
    "Buy official merchandise from your favourite Indian creators, influencers & personalities. T-shirts, hoodies, sweatshirts, accessories & more. Authentic. Limited edition. Free shipping above ₹200. Delivered across India.",
  keywords: [
    "creator merch India",
    "buy creator merchandise India",
    "official creator merchandise",
    "Indian influencer merch",
    "celebrity merchandise India",
    "Junooni store",
    "fan merchandise India",
    "limited edition creator drops",
    "official influencer clothing India",
  ],
  alternates: {
    canonical: "https://junooni.com/in/store",
  },
  openGraph: {
    title: "Shop Official Creator Merch Online India | Junooni",
    description:
      "Buy official merchandise from your favourite Indian creators & influencers. Authentic. Limited edition. Delivered across India.",
    url: "https://junooni.com/in/store",
    siteName: "Junooni",
    images: [
      {
        url: "https://junooni.com/_next/static/media/header-banner.fee7e3c0.webp",
        width: 1200,
        height: 630,
        alt: "Junooni — Official Creator Merch Store India",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Official Creator Merch Online India | Junooni",
    description:
      "Official merch from your favourite Indian creators & influencers. Shop now on Junooni.",
    images: ["https://junooni.com/_next/static/media/header-banner.fee7e3c0.webp"],
  },
}

// ✅ CRITICAL: Force dynamic rendering for searchParams to work
export const dynamic = "force-dynamic"

// ✅ SEO: Rich CollectionPage schema — platform-neutral language
const storeSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Shop Official Creator Merch Online India",
  "description":
    "Buy official merchandise from your favourite Indian creators, influencers, and personalities on Junooni — India's #1 creator merch marketplace. Authentic, limited edition drops delivered across India.",
  "url": "https://junooni.com/in/store",
  "inLanguage": "en-IN",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Junooni",
    "url": "https://junooni.com",
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://junooni.com/in",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Store",
        "item": "https://junooni.com/in/store",
      },
    ],
  },
  "about": {
    "@type": "Organization",
    "name": "Junooni",
    "url": "https://junooni.com",
    "description":
      "India's #1 creator merchandise marketplace. Authentic merch from top Indian creators, influencers, and personalities.",
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "lowPrice": "125",
    "highPrice": "999",
    "offerCount": "18",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Junooni",
      "url": "https://junooni.com",
    },
  },
}

// ✅ AEO: FAQ schema — helps AI engines (ChatGPT, Perplexity, Google AI Overview) cite Junooni
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What creator merch is available on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Junooni carries official merchandise from top Indian creators and influencers including Gajuraa, Tanishk Bagchi, V Clothing, Travel Pods, Toofanitoons, and more. Products include oversized t-shirts, sweatshirts, crop tops, sticker sheets, mugs, and accessories.",
      },
    },
    {
      "@type": "Question",
      "name": "Is the merch on Junooni authentic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Yes. All products on Junooni are official merchandise created directly by creators and verified by the Junooni team before listing. Every product is authentic and ships directly to fans.",
      },
    },
    {
      "@type": "Question",
      "name": "Does Junooni deliver across India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Yes, Junooni delivers across India with free shipping on orders above ₹200. Delivery takes 5–7 business days.",
      },
    },
    {
      "@type": "Question",
      "name": "How much does creator merch cost on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Creator merch on Junooni starts from ₹125 for accessories like sticker sheets and goes up to ₹999 for premium sweatshirts. T-shirts range from ₹499 to ₹799.",
      },
    },
    {
      "@type": "Question",
      "name": "Who can sell merch on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Any Indian creator, influencer, or public personality — whether from Instagram, YouTube, or any other platform — can apply to sell official merchandise on Junooni at studio.junooni.com.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I become a creator on Junooni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Yes. If you are a content creator or influencer looking to launch official merchandise, you can apply to join Junooni at studio.junooni.com. Junooni supports creators from all platforms.",
      },
    },
  ],
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
    categories?: string
    vendors?: string
    colors?: string
    price?: string
    collections?: string
    collection_id?: string
    category_id?: string
    id?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams

  // ✅ Parse price string into minPrice/maxPrice numbers
  let minPrice: number | undefined
  let maxPrice: number | undefined

  if (searchParams.price) {
    const priceRange = searchParams.price.split("-")
    if (priceRange.length === 2) {
      const min = parseInt(priceRange[0], 10)
      const max = parseInt(priceRange[1], 10)
      if (!isNaN(min) && !isNaN(max)) {
        minPrice = min
        maxPrice = max
      }
    }
  }

  // ✅ Parse comma-separated strings into arrays
  const vendorsArray = searchParams.vendors
    ? searchParams.vendors.split(",").filter(Boolean)
    : undefined

  const colorsArray = searchParams.colors
    ? searchParams.colors.split(",").filter(Boolean)
    : undefined

  const collectionsArray = searchParams.collections
    ? searchParams.collections.split(",").filter(Boolean)
    : undefined

  const categoriesArray = searchParams.categories
    ? searchParams.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : undefined

  const pageNumber = searchParams.page
    ? parseInt(searchParams.page, 10)
    : undefined

  const productsIds = searchParams.id?.split(",")

  return (
    <>
      {/* ✅ CollectionPage schema — helps Google show rich results */}
      <JsonLd data={storeSchema} />

      {/* ✅ FAQ schema — helps AI engines (ChatGPT, Perplexity, Google AI Overview) cite Junooni */}
      <JsonLd data={faqSchema} />

      <StoreTemplate
        sortBy={searchParams.sortBy}
        page={pageNumber}
        countryCode={params.countryCode}
        categoryId={searchParams.category_id}
        collectionId={searchParams.collection_id}
        productsIds={productsIds}
        vendors={vendorsArray}
        colors={colorsArray}
        collections={collectionsArray}
        categories={categoriesArray}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </>
  )
}
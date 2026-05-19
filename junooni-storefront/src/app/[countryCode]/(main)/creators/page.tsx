// import type { Metadata } from "next"
// import VendorsDiscoveryPage from "./vendors-discovery"

// // ─── Static Metadata ──────────────────────────────────────────────────────────
// export const metadata: Metadata = {
//   title: "Discover Creators | Junooni",
//   description:
//     "Browse and follow verified creators across fashion, cinema, art, comedy, and more. Find your favourite creators and explore their products.",
//   keywords: [
//     "creators",
//     "vendors",
//     "discover creators",
//     "follow creators",
//     "fashion creators",
//     "art creators",
//     "comedy creators",
//     "influencers",
//   ],
//   openGraph: {
//     title: "Discover Creators | Junooni",
//     description:
//       "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
//     url: "https://junooni.com/creators",
//     siteName: "Junooni",
//     images: [
//       {
//         url: "https://Junooni.com/og-creators.jpg", // replace with actual OG image
//         width: 1200,
//         height: 630,
//         alt: "Discover Creators on Your Platform",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Discover Creators | Your Platform Name",
//     description:
//       "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
//     images: ["https://junooni.com/og-creators.jpg"], // replace with actual image
//   },
//   alternates: {
//     canonical: "https://junooni.com/creators",
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-snippet": -1,
//       "max-image-preview": "large",
//       "max-video-preview": -1,
//     },
//   },
// }

// // ─── JSON-LD Schema ───────────────────────────────────────────────────────────
// const jsonLd = {
//   "@context": "https://schema.org",
//   "@graph": [
//     // CollectionPage schema for the directory itself
//     {
//       "@type": "CollectionPage",
//       "@id": "https://junooni.com/creators#webpage",
//       "url": "https://junooni.com/creators",
//       "name": "Discover Creators",
//       "description":
//         "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
//       "isPartOf": {
//         "@id": "https://junooni.com/#website",
//       },
//       "breadcrumb": {
//         "@id": "https://junooni.com/creators#breadcrumb",
//       },
//       "inLanguage": "en-US",
//     },

//     // BreadcrumbList schema
//     {
//       "@type": "BreadcrumbList",
//       "@id": "https://junooni.com/creators#breadcrumb",
//       "itemListElement": [
//         {
//           "@type": "ListItem",
//           "position": 1,
//           "name": "Home",
//           "item": "https://junooni.com",
//         },
//         {
//           "@type": "ListItem",
//           "position": 2,
//           "name": "Creators",
//           "item": "https://junooni.com/creators",
//         },
//       ],
//     },

//     // WebSite schema with SearchAction (enables Google Sitelinks search box)
//     {
//       "@type": "WebSite",
//       "@id": "https://junooni.com/#website",
//       "url": "https://junooni.com",
//       "name": "Junooni",
//       "description": "Discover and shop from verified creators.",
//       "potentialAction": [
//         {
//           "@type": "SearchAction",
//           "target": {
//             "@type": "EntryPoint",
//             "urlTemplate":
//               "https://junooni.com/creators?search={search_term_string}",
//           },
//           "query-input": "required name=search_term_string",
//         },
//       ],
//       "inLanguage": "en-US",
//     },

//     // Organization schema
//     {
//       "@type": "Organization",
//       "@id": "https://junooni.com/#organization",
//       "name": "Junooni",
//       "url": "https://junooni.com",
//       "logo": {
//         "@type": "ImageObject",
//         "url": "https://studio.junooni.com/assets/junooni_logo_brand_color-FiOJAWKM.png", // replace with actual logo URL
//         "width": 200,
//         "height": 60,
//       },
//       "sameAs": [
//         // Add your social media profile URLs here
//          "https://www.facebook.com/p/Junooni-61577994639087/",
//          "https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0",
//       ],
//     },

//     // ItemList schema — represents the creator directory listing
//     {
//       "@type": "ItemList",
//       "name": "Verified Creators Directory",
//       "description":
//         "A curated list of verified creators available on Junooni.",
//       "url": "https://Junooni.com/creators",
//       "numberOfItems": "12+", // update dynamically if needed
//       "itemListOrder": "https://schema.org/ItemListUnordered",
//       // Individual ListItem entries are intentionally omitted here since
//       // the full list is dynamic and paginated. Each individual creator
//       // page (e.g. /creator/[handle]) should carry its own Person/Brand schema.
//     },
//   ],
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────
// export default function CreatorsPage() {
//   return (
//     <>
//       {/* Inject JSON-LD into <head> */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       {/* Client component with all the interactive UI */}
//       <VendorsDiscoveryPage />
//     </>
//   )
// }

// src/app/[countryCode]/(main)/creators/page.tsx
import type { Metadata } from "next"
import { retriveVendors } from "@lib/data/vendors"
import VendorsDiscoveryPage from "./vendors-discovery"

export const metadata: Metadata = {
  title: "Discover Creators | Junooni",
  description: "Browse and follow verified creators across fashion, cinema, art, comedy, and more. Find your favourite creators and explore their products.",
  keywords: ["creators", "vendors", "discover creators", "follow creators", "fashion creators", "art creators", "comedy creators", "influencers"],
  openGraph: {
    title: "Discover Creators | Junooni",
    description: "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
    url: "https://junooni.com/creators",
    siteName: "Junooni",
    images: [{ url: "https://Junooni.com/og-creators.jpg", width: 1200, height: 630, alt: "Discover Creators on Junooni" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Creators | Junooni",
    description: "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
    images: ["https://junooni.com/og-creators.jpg"],
  },
  alternates: { canonical: "https://junooni.com/creators" },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://junooni.com/creators#webpage",
      "url": "https://junooni.com/creators",
      "name": "Discover Creators",
      "description": "Browse and follow verified creators across fashion, cinema, art, comedy, and more.",
      "isPartOf": { "@id": "https://junooni.com/#website" },
      "breadcrumb": { "@id": "https://junooni.com/creators#breadcrumb" },
      "inLanguage": "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://junooni.com/creators#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://junooni.com" },
        { "@type": "ListItem", "position": 2, "name": "Creators", "item": "https://junooni.com/creators" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://junooni.com/#website",
      "url": "https://junooni.com",
      "name": "Junooni",
      "description": "Discover and shop from verified creators.",
      "potentialAction": [{
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://junooni.com/creators?search={search_term_string}" },
        "query-input": "required name=search_term_string",
      }],
      "inLanguage": "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://junooni.com/#organization",
      "name": "Junooni",
      "url": "https://junooni.com",
      "logo": { "@type": "ImageObject", "url": "https://studio.junooni.com/assets/junooni_logo_brand_color-FiOJAWKM.png", "width": 200, "height": 60 },
      "sameAs": ["https://www.facebook.com/p/Junooni-61577994639087/", "https://www.instagram.com/bejunooni"],
    },
  ],
}

// ── Fetch vendors SERVER-SIDE so the page renders instantly ───────────────────
// Previously VendorsDiscoveryPage called retriveVendors() in a useEffect,
// causing 8-9 second blank screen. Now fetched here and passed as props.
export default async function CreatorsPage() {
  let allVendors: any[] = []

  try {
    const vendors = await retriveVendors()
    if (vendors && Array.isArray(vendors)) {
      allVendors = vendors.filter((v: any) => v.verified === "Yes")
    }
  } catch (error) {
    console.error("[CreatorsPage] Failed to fetch vendors:", error)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Vendors already fetched — component renders immediately with data */}
      <VendorsDiscoveryPage initialVendors={allVendors} />
    </>
  )
}
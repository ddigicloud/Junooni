// // src/app/[countryCode]/(main)/creator/[handle]/page.tsx
// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { retriveVendors, getVendorByHandle } from "@lib/data/vendors"
// import VendorTemplate from "@modules/vendorCreator/templates"
// import { getRegion } from "@lib/data/regions"
// import JsonLd from "../../components/JsonLd"

// type Props = {
//   params: Promise<{ handle: string; countryCode: string }>
// }

// // Generate static paths for all vendors
// export async function generateStaticParams() {
//   try {
//     const vendors = await retriveVendors()

//     return vendors.map((vendor) => ({
//       handle: vendor.handle,
//     }))
//   } catch (error) {
//     console.error(
//       `Failed to generate static paths for vendor pages: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }.`
//     )
//     return []
//   }
// }

// // Generate metadata for each vendor page
// export async function generateMetadata(props: Props): Promise<Metadata> {
//   const params = await props.params
//   const { handle } = params

//   const vendor = await getVendorByHandle(handle)

//   if (!vendor) {
//     notFound()
//   }

//   return {
//     title: `${vendor.name} | Junooni`,
//     description:
//       vendor.creator_bio ||
//       `Shop exclusive merchandise by ${vendor.name} on Junooni — India's #1 creator merch marketplace.`,
//     openGraph: {
//       title: `${vendor.name} | Junooni`,
//       description:
//         vendor.creator_bio ||
//         `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
//       images: vendor.logo ? [vendor.logo] : [],
//     },
//   }
// }

// // Vendor page component
// export default async function VendorPage(props: Props) {
//   const params = await props.params

//   const vendor = await getVendorByHandle(params.handle)

//   if (!vendor) {
//     notFound()
//   }

//   const { countryCode } = params
//   const region = await getRegion(countryCode)

//   // ── Person / ProfilePage schema (creator is a person with a store) ─────────
//   const creatorSchema: Record<string, any> = {
//     "@context": "https://schema.org",
//     "@type": "ProfilePage",
//     "name": `${vendor.name} on Junooni`,
//     "description":
//       vendor.creator_bio ||
//       `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
//     "url": `https://junooni.com/in/creator/${params.handle}`,
//     "mainEntity": {
//       "@type": "Person",
//       "name": vendor.name,
//       ...(vendor.logo ? { "image": vendor.logo } : {}),
//       ...(vendor.creator_bio ? { "description": vendor.creator_bio } : {}),
//       ...(vendor.instagram || vendor.youtube || vendor.xtwitter
//         ? {
//             "sameAs": [
//               vendor.instagram,
//               vendor.youtube,
//               vendor.xtwitter,
//             ].filter(Boolean),
//           }
//         : {}),
//     },
//   }

//   // ── Breadcrumb schema ──────────────────────────────────────────────────────
//   const breadcrumbSchema = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     "itemListElement": [
//       {
//         "@type": "ListItem",
//         "position": 1,
//         "name": "Home",
//         "item": "https://junooni.com/in",
//       },
//       {
//         "@type": "ListItem",
//         "position": 2,
//         "name": "Creators",
//         "item": "https://junooni.com/in/creators",
//       },
//       {
//         "@type": "ListItem",
//         "position": 3,
//         "name": vendor.name,
//         "item": `https://junooni.com/in/creator/${params.handle}`,
//       },
//     ],
//   }

//   return (
//     <>
//       <JsonLd data={creatorSchema} />
//       <JsonLd data={breadcrumbSchema} />
//       <VendorTemplate vendor={vendor} region={region} />
//     </>
//   )
// }

// src/app/[countryCode]/(main)/creator/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retriveVendors, getVendorByHandle } from "@lib/data/vendors"
import VendorTemplate from "@modules/vendorCreator/templates"
import { getRegion } from "@lib/data/regions"
import { listProducts, getProductReviews } from "@lib/data/products"
import JsonLd from "../../components/JsonLd"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateStaticParams() {
  try {
    const vendors = await retriveVendors()
    return vendors.map((vendor) => ({ handle: vendor.handle }))
  } catch (error) {
    console.error(`Failed to generate static paths: ${error instanceof Error ? error.message : "Unknown error"}`)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const vendor = await getVendorByHandle(params.handle)
  if (!vendor) notFound()
  return {
    title: `${vendor.name} | Junooni`,
    description: vendor.creator_bio || `Shop exclusive merchandise by ${vendor.name} on Junooni — India's #1 creator merch marketplace.`,
    openGraph: {
      title: `${vendor.name} | Junooni`,
      description: vendor.creator_bio || `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
      images: vendor.logo ? [vendor.logo] : [],
    },
  }
}

export default async function VendorPage(props: Props) {
  const params = await props.params
  const { handle, countryCode } = params

  // ── Step 1: vendor + region in parallel ───────────────────────────────────
  const [vendor, region] = await Promise.all([
    getVendorByHandle(handle),
    getRegion(countryCode),
  ])

  if (!vendor) notFound()
  if (!region) notFound()

  // ── Step 2: fetch vendor products server-side ─────────────────────────────
  let vendorProducts: any[] = []
  try {
    const { response: { products } } = await listProducts({
      regionId: region.id,
      queryParams: {
        fields: "*vendor,*tags,*metadata,*variants,*variants.prices,*variants.calculated_price,*images",
        limit: 200,
      },
    })

    vendorProducts = (products ?? []).filter((p: any) =>
      p.vendor?.id === vendor.id ||
      p.vendor_id === vendor.id ||
      p.metadata?.vendor_id === vendor.id
    )
  } catch (err) {
    console.error(`[VendorPage] Failed to fetch products for ${handle}:`, err)
    vendorProducts = []
  }

  // ── Step 3: fetch ALL reviews in parallel ─────────────────────────────────
  // One Promise per product, all fired simultaneously — total time = slowest
  // single review fetch (~300ms), NOT sum of all fetches (~3-4s sequential).
  // Result is a map: { [productId]: { averageRating, reviewCount } }
  const reviewsMap: Record<string, { averageRating: number; reviewCount: number }> = {}

  if (vendorProducts.length > 0) {
    const reviewResults = await Promise.allSettled(
      vendorProducts.map((product) =>
        getProductReviews({ productId: product.id, limit: 100, offset: 0 })
      )
    )

    reviewResults.forEach((result, index) => {
      const productId = vendorProducts[index]?.id
      if (!productId) return

      if (result.status === "fulfilled") {
        const { average_rating, reviews } = result.value
        reviewsMap[productId] = {
          averageRating: average_rating ?? 0,
          reviewCount: reviews?.length ?? 0,
        }
      } else {
        // Review fetch failed for this product — default to zero
        reviewsMap[productId] = { averageRating: 0, reviewCount: 0 }
      }
    })
  }

  // ── Schemas ────────────────────────────────────────────────────────────────
  const creatorSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": `${vendor.name} on Junooni`,
    "description": vendor.creator_bio || `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
    "url": `https://junooni.com/in/creator/${handle}`,
    "mainEntity": {
      "@type": "Person",
      "name": vendor.name,
      ...(vendor.logo ? { "image": vendor.logo } : {}),
      ...(vendor.creator_bio ? { "description": vendor.creator_bio } : {}),
      ...(vendor.instagram || vendor.youtube || vendor.xtwitter ? {
        "sameAs": [vendor.instagram, vendor.youtube, vendor.xtwitter].filter(Boolean),
      } : {}),
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://junooni.com/in" },
      { "@type": "ListItem", "position": 2, "name": "Creators", "item": "https://junooni.com/in/creators" },
      { "@type": "ListItem", "position": 3, "name": vendor.name, "item": `https://junooni.com/in/creator/${handle}` },
    ],
  }

  return (
    <>
      <JsonLd data={creatorSchema} />
      <JsonLd data={breadcrumbSchema} />
      <VendorTemplate
        vendor={vendor}
        region={region}
        vendorProducts={vendorProducts}
        reviewsMap={reviewsMap}
      />
    </>
  )
}
// page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import {
  retriveVendors,
  getVendorByHandle,
  retriveVendorsProducts,
} from "@lib/data/vendors"
import VendorTemplate from "@modules/vendorCreator/templates"
import { getRegion } from "@lib/data/regions"
import JsonLd from "../../components/JsonLd"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

const getVendorCached = cache(async (handle: string) => {
  return getVendorByHandle(handle)
})

export async function generateStaticParams() {
  try {
    const vendors = await retriveVendors()
    return vendors.map((vendor) => ({ handle: vendor.handle }))
  } catch (error) {
    console.error(
      `Failed to generate static paths: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const vendor = await getVendorCached(params.handle)
  if (!vendor) notFound()
  return {
    title: `${vendor.name} | Junooni`,
    description:
      vendor.creator_bio ||
      `Shop exclusive merchandise by ${vendor.name} on Junooni — India's end-to-end creator commerce platform.`,
    openGraph: {
      title: `${vendor.name} | Junooni`,
      description:
        vendor.creator_bio ||
        `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
      images: vendor.logo ? [vendor.logo] : [],
    },
  }
}

export default async function VendorPage(props: Props) {
  const params = await props.params
  const { handle, countryCode } = params

  const [vendor, region] = await Promise.all([
    getVendorCached(handle),
    getRegion(countryCode),
  ])

  if (!vendor) notFound()
  if (!region) notFound()

  // Fetch products server-side
  const productsResponse = await retriveVendorsProducts(vendor.id, region.id)
  const vendorProducts = productsResponse?.products ?? []

  // ✅ Fetch review summaries for all products in ONE query — server side
  let reviewsMap: Record<
    string,
    { averageRating: number; reviewCount: number }
  > = {}

  if (vendorProducts.length > 0) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const productIds = vendorProducts.map((p: any) => p.id).join(",")

      const res = await fetch(
        `${backendUrl}/store/reviews/summary?product_ids=${productIds}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": apiKey!,
          },
          next: { revalidate: 300 }, // cache 5 minutes
        }
      )

      if (res.ok) {
        const data = await res.json()
        const summaries = data.summaries || {}

        // Map to shape DynamicProductCard expects
        for (const [productId, summary] of Object.entries(summaries)) {
          const s = summary as { average_rating: number; review_count: number }
          reviewsMap[productId] = {
            averageRating: s.average_rating,
            reviewCount: s.review_count,
          }
        }
      }
    } catch (e) {
      // Silent — reviews failing should not break the page
      console.error("[VendorPage] review summary fetch failed:", e)
    }
  }

  const creatorSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${vendor.name} on Junooni`,
    description:
      vendor.creator_bio ||
      `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
    url: `https://junooni.com/in/creator/${handle}`,
    mainEntity: {
      "@type": "Person",
      name: vendor.name,
      ...(vendor.logo ? { image: vendor.logo } : {}),
      ...(vendor.creator_bio ? { description: vendor.creator_bio } : {}),
      ...(vendor.instagram || vendor.youtube || vendor.xtwitter
        ? {
            sameAs: [
              vendor.instagram,
              vendor.youtube,
              vendor.xtwitter,
            ].filter(Boolean),
          }
        : {}),
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://junooni.com/in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Creators",
        item: "https://junooni.com/in/creators",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vendor.name,
        item: `https://junooni.com/in/creator/${handle}`,
      },
    ],
  }

  return (
    <>
      <JsonLd data={creatorSchema} />
      <JsonLd data={breadcrumbSchema} />
      <VendorTemplate
        vendor={vendor}
        region={region}
        vendorProducts={vendorProducts}  // ✅ real products from server
        reviewsMap={reviewsMap}           // ✅ real reviews from server
      />
    </>
  )
}
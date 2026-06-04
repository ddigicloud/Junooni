// src/app/[countryCode]/(main)/creator/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retriveVendors, getVendorByHandle, retriveVendorsProducts } from "@lib/data/vendors"
import VendorTemplate from "@modules/vendorCreator/templates"
import { getRegion } from "@lib/data/regions"
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
    description: vendor.creator_bio || `Shop exclusive merchandise by ${vendor.name} on Junooni — India's end-to-end creator commerce platform.`,
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

  const [vendor, region] = await Promise.all([
    getVendorByHandle(handle),
    getRegion(countryCode),
  ])

  if (!vendor) notFound()
  if (!region) notFound()

  // No products fetch here — client handles it after paint
  const reviewsMap: Record<string, { averageRating: number; reviewCount: number }> = {}

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
        vendorProducts={[]}   
        reviewsMap={reviewsMap}
      />
    </>
  )
}
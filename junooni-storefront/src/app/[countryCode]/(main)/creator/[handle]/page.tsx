// // src/app/[countryCode]/(main)/creator/[handle]/page.tsx
// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { retriveVendors, getVendorByHandle } from "@lib/data/vendors"
// import VendorTemplate from "@modules/vendorCreator/templates"
// import { getRegion } from "@lib/data/regions"

// type Props = {
//   params: Promise<{ handle: string, countryCode: string }>
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
  
//   // Using the helper function to get vendor by handle
//   const vendor = await getVendorByHandle(handle)
  
//   if (!vendor) {
//     notFound()
//   }
  
//   return {
//     title: `${vendor.name} | Vendor Store`,
//     description: vendor.creator_bio || vendor.name,
//     openGraph: {
//       title: `${vendor.name} | Vendor Store`,
//       description: vendor.creator_bio || vendor.name,
//       images: vendor.logo ? [vendor.logo] : [],
//     },
//   }
// }

// // Vendor page component
// export default async function VendorPage(props: Props) {
//   const params = await props.params
  
//   // Using the helper function to get vendor by handle
//   const vendor = await getVendorByHandle(params.handle)
  
//   if (!vendor) {
//     notFound()
//   }

//    const { countryCode } = params
//    const region = await getRegion(countryCode)
   
//   return (
//     <VendorTemplate
//       vendor={vendor}
//       region={region}
//     />
//   )
// }

// src/app/[countryCode]/(main)/creator/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retriveVendors, getVendorByHandle } from "@lib/data/vendors"
import VendorTemplate from "@modules/vendorCreator/templates"
import { getRegion } from "@lib/data/regions"
import JsonLd from "../../components/JsonLd"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

// Generate static paths for all vendors
export async function generateStaticParams() {
  try {
    const vendors = await retriveVendors()

    return vendors.map((vendor) => ({
      handle: vendor.handle,
    }))
  } catch (error) {
    console.error(
      `Failed to generate static paths for vendor pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

// Generate metadata for each vendor page
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params

  const vendor = await getVendorByHandle(handle)

  if (!vendor) {
    notFound()
  }

  return {
    title: `${vendor.name} | Junooni`,
    description:
      vendor.creator_bio ||
      `Shop exclusive merchandise by ${vendor.name} on Junooni — India's #1 creator merch marketplace.`,
    openGraph: {
      title: `${vendor.name} | Junooni`,
      description:
        vendor.creator_bio ||
        `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
      images: vendor.logo ? [vendor.logo] : [],
    },
  }
}

// Vendor page component
export default async function VendorPage(props: Props) {
  const params = await props.params

  const vendor = await getVendorByHandle(params.handle)

  if (!vendor) {
    notFound()
  }

  const { countryCode } = params
  const region = await getRegion(countryCode)

  // ── Person / ProfilePage schema (creator is a person with a store) ─────────
  const creatorSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": `${vendor.name} on Junooni`,
    "description":
      vendor.creator_bio ||
      `Shop exclusive merchandise by ${vendor.name} on Junooni.`,
    "url": `https://junooni.com/in/creator/${params.handle}`,
    "mainEntity": {
      "@type": "Person",
      "name": vendor.name,
      ...(vendor.logo ? { "image": vendor.logo } : {}),
      ...(vendor.creator_bio ? { "description": vendor.creator_bio } : {}),
      ...(vendor.instagram || vendor.youtube || vendor.xtwitter
        ? {
            "sameAs": [
              vendor.instagram,
              vendor.youtube,
              vendor.xtwitter,
            ].filter(Boolean),
          }
        : {}),
    },
  }

  // ── Breadcrumb schema ──────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
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
        "name": "Creators",
        "item": "https://junooni.com/in/creators",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": vendor.name,
        "item": `https://junooni.com/in/creator/${params.handle}`,
      },
    ],
  }

  return (
    <>
      <JsonLd data={creatorSchema} />
      <JsonLd data={breadcrumbSchema} />
      <VendorTemplate vendor={vendor} region={region} />
    </>
  )
}
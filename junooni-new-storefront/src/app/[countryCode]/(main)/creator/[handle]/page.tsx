// src/app/[countryCode]/(main)/creator/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retriveVendors, getVendorByHandle } from "@lib/data/vendors"
import VendorTemplate from "@modules/vendorCreator/templates"
import { getRegion } from "@lib/data/regions"

type Props = {
  params: Promise<{ handle: string, countryCode: string }>
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
  
  // Using the helper function to get vendor by handle
  const vendor = await getVendorByHandle(handle)
  
  if (!vendor) {
    notFound()
  }
  
  return {
    title: `${vendor.name} | Vendor Store`,
    description: vendor.creator_bio || vendor.name,
    openGraph: {
      title: `${vendor.name} | Vendor Store`,
      description: vendor.creator_bio || vendor.name,
      images: vendor.logo ? [vendor.logo] : [],
    },
  }
}

// Vendor page component
export default async function VendorPage(props: Props) {
  const params = await props.params
  
  // Using the helper function to get vendor by handle
  const vendor = await getVendorByHandle(params.handle)
  
  if (!vendor) {
    notFound()
  }

   const { countryCode } = params
   const region = await getRegion(countryCode)
   
  return (
    <VendorTemplate
      vendor={vendor}
      region={region}
    />
  )
}
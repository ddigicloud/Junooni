'use server'

import { sdk } from "@lib/config"
import { getCacheOptions, getAuthHeaders } from "./cookies"
import { Vendor } from "types/vendor"

interface VendorResponse {
  vendors: []
}

export const retriveVendors = async () => {
  console.log(`[retriveVendors] START`)
  const start = Date.now()

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("vendors")) }

  const result = await sdk.client
    .fetch<VendorResponse>(`/vendors`, {
      method: "GET",
      query: {
        fields: "*,*products,*products.variants,*products.variants.prices,*products.images",
      },
      headers,
      next,
    })
    .then(({ vendors }) => {
      console.log(`[retriveVendors] DONE in ${Date.now() - start}ms | count=${vendors?.length}`)
      return vendors
    })
    .catch((err) => {
      console.error(`[retriveVendors] ERROR in ${Date.now() - start}ms:`, err)
      return null
    })

  return result
}

// ── retriveVendorsProducts ─────────────────────────────────────────────────
// Hits /vendors/${vendor_id}/products — server-side filtered, vendor-scoped.
// region_id passed so calculated_price is computed for the correct region.
// Lean fields — no size_chart, no tags, no variants.prices.
// export const retriveVendorsProducts = async (
//   vendor_id: string,
//   region_id?: string
// ) => {
//   console.log(`[retriveVendorsProducts] START vendor_id=${vendor_id} region_id=${region_id}`)
//   const start = Date.now()

//   const headers = { ...(await getAuthHeaders()) }
//   const next = { ...(await getCacheOptions(`vendor-products-${vendor_id}`)) }

//   const result = await sdk.client
//     .fetch<any>(`/vendors/${vendor_id}/products`, {
//       method: "GET",
//       query: {
//         fields: "*variants.calculated_price,+metadata,*images,*categories,*collection,*vendor",
//         ...(region_id && { region_id }),
//       },
//       headers,
//       next,
//     })
//     .then((response) => {
//       console.log(`[retriveVendorsProducts] DONE in ${Date.now() - start}ms`)
//       console.log(`[retriveVendorsProducts] response keys=${response ? Object.keys(response).join(",") : "null"}`)
//       console.log(`[retriveVendorsProducts] preview=${JSON.stringify(response)?.slice(0, 300)}`)
//       return response
//     })
//     .catch((err) => {
//       console.error(`[retriveVendorsProducts] ERROR in ${Date.now() - start}ms:`, JSON.stringify(err))
//       return null
//     })

//   return result
// }

export const retriveVendorsProducts = async (
  vendor_id: string,
  region_id?: string
) => {
  console.log(`[retriveVendorsProducts] START vendor_id=${vendor_id} region_id=${region_id}`)
  const start = Date.now()

  const headers = { ...(await getAuthHeaders()) }

  const result = await sdk.client
    .fetch<any>(`/vendors/${vendor_id}/products`, {
      method: "GET",
      query: {
        // ← NO calculated_price — that was the 9s killer
        fields: "id,title,handle,thumbnail,status,created_at,+metadata,images.id,images.url,variants.id,variants.title,variants.prices.amount,variants.prices.currency_code,vendor.id,vendor.name,vendor.handle,vendor.verified",
        ...(region_id && { region_id }),
      },
      headers,
      next: { revalidate: 300 },
    })
    .then((response) => {
      const all = response?.products ?? []
      const published = all.filter((p: any) => p.status === "published")
      console.log(`[retriveVendorsProducts] DONE in ${Date.now() - start}ms | all=${all.length} published=${published.length}`)
      return { products: published }
    })
    .catch((err) => {
      console.error(`[retriveVendorsProducts] ERROR in ${Date.now() - start}ms:`, JSON.stringify(err))
      return null
    })

  return result
}
/**
 * Retrieves a specific vendor by handle.
 * Sanitizes empty string fields to null so img src never gets "".
 */
export async function getVendorByHandle(
  handle: string
): Promise<Vendor | undefined> {
  console.log(`[getVendorByHandle] START handle=${handle}`)
  const start = Date.now()

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions(`vendor-${handle}`)) }

  try {
    const response = await sdk.client.fetch<{ vendors: Vendor[] }>(`/vendors`, {
      method: "GET",
      query: {
        fields: "*",
        handle,
      },
      headers,
      next,
    })

    // The /vendors?handle= filter may not work — always find by handle explicitly
    const vendors = response?.vendors ?? []
    console.log(`[getVendorByHandle] got ${vendors.length} vendors, finding handle=${handle}`)

    // Explicitly filter by handle — don't trust API filtering
    const vendor = vendors.find((v: Vendor) => v.handle === handle)
      ?? vendors[0] // fallback only if exactly 1 returned

    console.log(`[getVendorByHandle] DONE in ${Date.now() - start}ms | found=${vendor?.name} id=${vendor?.id}`)

    if (!vendor || vendor.handle !== handle) {
      console.error(`[getVendorByHandle] WRONG VENDOR — got handle=${vendor?.handle} wanted=${handle}`)
      // Fallback: fetch all and find correctly
      const allVendors = await retriveVendors()
      const correct = allVendors?.find((v: Vendor) => v.handle === handle)
      return correct ? { ...correct, logo: correct.logo || null, coverphoto: (correct as any).coverphoto || null } : undefined
    }

    return {
      ...vendor,
      logo: vendor.logo || null,
      coverphoto: (vendor as any).coverphoto || null,
    }
  } catch (err) {
    console.error(`[getVendorByHandle] ERROR:`, err)
    const vendors = await retriveVendors()
    const vendor = vendors?.find((v: Vendor) => v.handle === handle)
    if (!vendor) return undefined
    return {
      ...vendor,
      logo: vendor.logo || null,
      coverphoto: (vendor as any).coverphoto || null,
    }
  }
}


interface FollowersResponse {
  count: number
  follow: Array<{
    id: string
    vendor_id: string
    follow: {
      customer: {
        id: string
        first_name: string
        last_name: string
        email: string
      }
    }
  }>
}

export const retriveVendorsFollowers = async (vendor_id: string) => {
  console.log(`[retriveVendorsFollowers] START vendor_id=${vendor_id}`)
  const start = Date.now()

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("vendors")) }

  try {
    const response = await sdk.client.fetch<FollowersResponse>(
      `/vendors/${vendor_id}/followers`,
      {
        method: "GET",
        query: { fields: "*" },
        headers,
        next,
      }
    )
    console.log(`[retriveVendorsFollowers] DONE in ${Date.now() - start}ms | count=${response?.count}`)
    return response
  } catch (error: any) {
    console.error(`[retriveVendorsFollowers] ERROR in ${Date.now() - start}ms:`, error)
    if (error?.status === 404) return { count: 0, follow: [] }
    return { count: 0, follow: [] }
  }
}
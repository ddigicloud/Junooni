export const fetchVendorProductsClient = async (
  vendor_id: string,
  region_id: string
): Promise<any[]> => {
  try {
    console.log(`[fetchVendorProductsClient] calling vendor endpoint vendor_id=${vendor_id}`)
    
    const res = await fetch(
      `/api/vendor-products?vendor_id=${vendor_id}&region_id=${region_id}`
    )
    console.log(`[fetchVendorProductsClient] status=${res.status}`)
    if (!res.ok) return []
    const data = await res.json()
    console.log(`[vendor-products API] full response:`, JSON.stringify(data)?.slice(0, 500))
    console.log(`[vendor-products API] products=${data?.products?.length ?? 0}`)

    // ← ADDED: safety net filter in case the API ever returns non-published products
    const products = (data?.products ?? []).filter(
      (p: any) => p.status === "published"
    )
    console.log(`[fetchVendorProductsClient] published products=${products.length}`)
    return products
  } catch (err) {
    console.error(`[fetchVendorProductsClient] ERROR:`, err)
    return []
  }
}

export const fetchVendorFollowersClient = async (vendor_id: string): Promise<any> => {
  try {
    console.log(`[fetchVendorFollowersClient] vendor_id=${vendor_id}`)
    const res = await fetch(`/api/vendor-followers?vendor_id=${vendor_id}`)
    console.log(`[fetchVendorFollowersClient] status=${res.status}`)
    if (!res.ok) return { count: 0, follow: [] }
    const data = await res.json()
    console.log(`[fetchVendorFollowersClient] count=${data?.count ?? 0}`)
    return data
  } catch (err) {
    console.error(`[fetchVendorFollowersClient] ERROR:`, err)
    return { count: 0, follow: [] }
  }
}
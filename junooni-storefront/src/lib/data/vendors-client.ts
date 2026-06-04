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
    console.log(`[fetchVendorProductsClient] products=${data?.products?.length}`)
    return data?.products ?? []
  } catch (err) {
    console.error(`[fetchVendorProductsClient] ERROR:`, err)
    return []
  }
}
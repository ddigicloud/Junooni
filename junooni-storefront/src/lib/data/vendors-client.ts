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
    console.log(`[fetchVendorFollowersClient] RAW RESPONSE:`, JSON.stringify(data, null, 2))
    console.log(`[fetchVendorFollowersClient] count=${data?.count ?? 0}`)
    return data
  } catch (err) {
    console.error(`[fetchVendorFollowersClient] ERROR:`, err)
    return { count: 0, follow: [] }
  }
}

export const addFollowerClient = async (vendor_id: string): Promise<any> => {
  try {
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor_id }),
    })
    const data = await res.json()
    console.log("[addFollowerClient] status:", res.status, "data:", data)
    return data
  } catch (error) {
    console.error("[addFollowerClient] ERROR:", error)
    return null
  }
}

export const deleteFollowerClient = async (vendor_id: string): Promise<any> => {
  try {
    // Step 1: get follow list to find the entry id
    const listRes = await fetch("/api/follow", { method: "GET" })
    const listData = await listRes.json()
    console.log("[deleteFollowerClient] follow list:", listData)

    const creatorToDelete = listData?.follow?.creators?.find(
      (creator: any) => creator.vendor_id === vendor_id
    )

    if (!creatorToDelete) {
      console.error("[deleteFollowerClient] No matching entry for vendor:", vendor_id)
      return null
    }

    // Step 2: delete it
    const res = await fetch("/api/follow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ follow_list_id: creatorToDelete.id }),
    })
    const data = await res.json().catch(() => ({ success: true }))
    console.log("[deleteFollowerClient] delete result:", data)
    return data
  } catch (error) {
    console.error("[deleteFollowerClient] ERROR:", error)
    return null
  }
}
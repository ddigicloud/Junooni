// No "use server" here — this runs in the browser

export const wishlistItems = async (): Promise<any> => {
  try {
    const res = await fetch("/api/wishlist", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export const wishlistAddItem = async (variant_id: string): Promise<any> => {
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id }),
    })
    return await res.json()
  } catch {
    return null
  }
}

export const ItemDelete = async (itemId: string): Promise<any> => {
  try {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId }),
    })
    return await res.json().catch(() => ({ success: true }))
  } catch {
    return null
  }
}
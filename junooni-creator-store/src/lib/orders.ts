// lib/orders.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.message ?? "Failed to cancel order" }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}
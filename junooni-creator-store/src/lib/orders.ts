const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

export async function cancelOrder(orderId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/store/orders/${orderId}/cancel`, {
      method: "POST", headers,
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

export async function requestCancelOtp(orderId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/store/orders/${orderId}/request-cancel-otp`, {
      method: "POST", headers,
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message ?? "Failed to send OTP" }
    return { success: true }
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function cancelOrderWithOtp(orderId: string, otp: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/store/orders/${orderId}/cancel-with-otp`, {
      method: "POST",
      headers,
      body: JSON.stringify({ otp }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message ?? "Failed to cancel order" }
    return { success: true }
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}
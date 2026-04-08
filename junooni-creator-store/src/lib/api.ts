import type { StorefrontData } from "./types"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export async function getStorefrontData(handle: string): Promise<StorefrontData | null> {
  try {
    const res = await fetch(`${BACKEND}/store-front/${handle}`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    })
    if (res.status === 404) return null
    if (!res.ok) { console.error(`[api] store-front fetch failed: ${res.status}`); return null }
    return res.json()
  } catch (err) {
    console.error("[api] store-front fetch error:", err)
    return null
  }
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(amount)
}

export function resolveHandle(hostname: string): string | null {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "junooni.com"
  const host = hostname.replace(/^www\./, "")
  if (host.endsWith(`.${baseDomain}`)) return host.replace(`.${baseDomain}`, "")
  return null
}

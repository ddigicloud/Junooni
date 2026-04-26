// lib/api.ts — data fetching only

import type { StorefrontData } from "./types"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const FETCH_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 10000 : 120000

interface FetchOptions {
  noCache?: boolean
  accessToken?: string  // sent as x-store-access header to unlock products
}

export async function getStorefrontData(
  handle: string,
  options: FetchOptions = {}
): Promise<StorefrontData | null> {

  if (
    !handle ||
    handle === "favicon.ico" ||
    handle === "robots.txt"  ||
    handle === "sitemap.xml" ||
    handle.startsWith("_next") ||
    handle.includes(".")
  ) {
    return null
  }

  const callId = Math.random().toString(36).slice(2, 6)
  const url = `${BACKEND}/store-front/${handle}`

  console.log(`[api:${callId}] START handle=${handle}`)
  console.log(`[api:${callId}] URL = ${url}`)
  console.log(`[api:${callId}] BACKEND env = "${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}"`)

  const t0 = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    console.error(`[api:${callId}] TIMEOUT ${FETCH_TIMEOUT_MS}ms`)
    controller.abort()
  }, FETCH_TIMEOUT_MS)

  try {
    const fetchHeaders: Record<string, string> = { "Content-Type": "application/json" }
    if (options.accessToken) {
      fetchHeaders["x-store-access"] = options.accessToken
    }

    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: fetchHeaders,
    })

    clearTimeout(timeout)
    console.log(`[api:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)

    if (res.status === 404) return null
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error(`[api:${callId}] Error body: ${body.slice(0, 300)}`)
      return null
    }

    const data = await res.json()
    console.log(`[api:${callId}] SUCCESS status=${data.store?.status} password_enabled=${data.store?.password_enabled}`)
    console.log(`[api:${callId}] store keys: ${data.store ? Object.keys(data.store).join(", ") : "null"}`)
    return data

  } catch (err: any) {
    clearTimeout(timeout)
    console.error(`[api:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
    console.error(`[api:${callId}] cause: ${JSON.stringify(err?.cause)}`)
    return null
  }
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
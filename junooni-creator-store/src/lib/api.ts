// // lib/api.ts — data fetching only

// import type { StorefrontData } from "./types"

// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
// const FETCH_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 10000 : 120000

// interface FetchOptions {
//   noCache?: boolean
//   accessToken?: string  // sent as x-store-access header to unlock products
// }

// export async function getStorefrontData(
//   handle: string,
//   options: FetchOptions = {}
// ): Promise<StorefrontData | null> {

//   if (
//     !handle ||
//     handle === "favicon.ico" ||
//     handle === "robots.txt"  ||
//     handle === "sitemap.xml" ||
//     handle.startsWith("_next") ||
//     handle.includes(".")
//   ) {
//     return null
//   }

//   const callId = Math.random().toString(36).slice(2, 6)
//   const url = `${BACKEND}/store-front/${handle}`

//   console.log(`[api:${callId}] START handle=${handle}`)
//   console.log(`[api:${callId}] URL = ${url}`)
//   console.log(`[api:${callId}] BACKEND env = "${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}"`)

//   const t0 = Date.now()
//   const controller = new AbortController()
//   const timeout = setTimeout(() => {
//     console.error(`[api:${callId}] TIMEOUT ${FETCH_TIMEOUT_MS}ms`)
//     controller.abort()
//   }, FETCH_TIMEOUT_MS)

//   try {
//     const fetchHeaders: Record<string, string> = { "Content-Type": "application/json" }
//     if (options.accessToken) {
//       fetchHeaders["x-store-access"] = options.accessToken
//     }

//     const res = await fetch(url, {
//       signal: controller.signal,
//       cache: "no-store",
//       headers: fetchHeaders,
//     })

//     clearTimeout(timeout)
//     console.log(`[api:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)

//     if (res.status === 404) return null
//     if (!res.ok) {
//       const body = await res.text().catch(() => "")
//       console.error(`[api:${callId}] Error body: ${body.slice(0, 300)}`)
//       return null
//     }

//     const data = await res.json()
//     console.log(`[api:${callId}] SUCCESS status=${data.store?.status} password_enabled=${data.store?.password_enabled}`)
//     console.log(`[api:${callId}] store keys: ${data.store ? Object.keys(data.store).join(", ") : "null"}`)
//     return data

//   } catch (err: any) {
//     clearTimeout(timeout)
//     console.error(`[api:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
//     console.error(`[api:${callId}] cause: ${JSON.stringify(err?.cause)}`)
//     return null
//   }
// }

// export function formatPrice(amount: number, currency = "INR"): string {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format(amount)
// }
// lib/api.ts — data fetching only
import { cache } from "react"
import type { StorefrontData } from "./types"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const FETCH_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 10000 : 120000

// ─── internal fetch helper (not exported) ──────────────────────────────────
async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...fetchInit } = init
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...fetchInit, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// ─── skip system paths ──────────────────────────────────────────────────────
function isSystemHandle(handle: string): boolean {
  return (
    !handle ||
    handle === "favicon.ico" ||
    handle === "robots.txt" ||
    handle === "sitemap.xml" ||
    handle.startsWith("_next") ||
    handle.includes(".")
  )
}

// ─── MAIN: store + vendor + products (full page data) ──────────────────────
// React.cache() deduplicates within a single render — generateMetadata and
// the page component both call this but only ONE network request fires.
export const getStorefrontData = cache(
  async (
    handle: string,
    options: { noCache?: boolean; accessToken?: string } = {}
  ): Promise<StorefrontData | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}`

    console.log(`[api:${callId}] START handle=${handle}`)
    console.log(`[api:${callId}] URL = ${url}`)

    const t0 = Date.now()

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (options.accessToken) {
        headers["x-store-access"] = options.accessToken
      }

      // In editor/preview mode: no-store so every refresh is live.
      // In normal mode: revalidate every 30s — served from cache instantly,
      // Next.js revalidates in the background (stale-while-revalidate).
      const cacheStrategy: RequestInit = options.noCache
        ? { cache: "no-store" }
        : { next: { revalidate: 30, tags: [`store-${handle}`] } }

      const res = await fetchWithTimeout(url, {
        headers,
        ...cacheStrategy,
      })

      console.log(`[api:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)

      if (res.status === 404) return null
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.error(`[api:${callId}] Error body: ${body.slice(0, 300)}`)
        return null
      }

      const data = await res.json()
      console.log(
        `[api:${callId}] SUCCESS status=${data.store?.status} ` +
        `password_enabled=${data.store?.password_enabled}`
      )
      console.log(
        `[api:${callId}] store keys: ${
          data.store ? Object.keys(data.store).join(", ") : "null"
        }`
      )
      return data
    } catch (err: any) {
      console.error(
        `[api:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`
      )
      return null
    }
  }
)

// ─── PRODUCTS ONLY: used by /[handle]/products page ────────────────────────
// Hits the lightweight /store-front/:handle/products endpoint — no vendor_store
// graph join, just the product index query. Much faster than getStorefrontData.
export const getStoreProducts = cache(
  async (
    handle: string,
    page = 1
  ): Promise<{
    products: any[]
    categories: any[]
    pagination: { page: number; total: number; totalPages: number; hasMore: boolean }
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}/product?page=${page}`

    console.log(`[api:products:${callId}] START handle=${handle} page=${page}`)

    const t0 = Date.now()

    try {
      const res = await fetchWithTimeout(url, {
        next: { revalidate: 30, tags: [`store-products-${handle}`] },
        headers: { "Content-Type": "application/json" },
      })

      console.log(
        `[api:products:${callId}] Response ${res.status} in ${Date.now() - t0}ms`
      )

      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(
        `[api:products:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`
      )
      return null
    }
  }
)

// lib/api.ts — add this after getStoreProducts

export const getStoreCategories = cache(
  async (handle: string): Promise<{
    categories: any[]
    collections: any[]
    products: any[]  // lightweight — id, title, handle, thumbnail, categories only
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}/categories`

    console.log(`[api:categories:${callId}] START handle=${handle}`)
    const t0 = Date.now()

    try {
      const res = await fetchWithTimeout(url, {
        next: { revalidate: 30, tags: [`store-categories-${handle}`] },
        headers: { "Content-Type": "application/json" },
      })

      console.log(`[api:categories:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)
      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(`[api:categories:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
      return null
    }
  }
)

export const getStoreCollections = cache(
  async (handle: string): Promise<{
    collections: any[]
    categories: any[]
    products: any[]
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}/collections`

    console.log(`[api:collections:${callId}] START handle=${handle}`)
    const t0 = Date.now()

    try {
      const res = await fetchWithTimeout(url, {
        next: { revalidate: 30, tags: [`store-collections-${handle}`] },
        headers: { "Content-Type": "application/json" },
      })
      console.log(`[api:collections:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)
      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(`[api:collections:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
      return null
    }
  }
)

export const getStoreCategoryDetail = cache(
  async (handle: string, categoryHandle: string): Promise<{
    category: any
    products: any[]
    categories: any[]
    collections: any[]
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}/categories/${categoryHandle}`

    console.log(`[api:category:${callId}] START handle=${handle} category=${categoryHandle}`)
    const t0 = Date.now()

    try {
      const res = await fetchWithTimeout(url, {
        next: { revalidate: 30, tags: [`store-category-${handle}-${categoryHandle}`] },
        headers: { "Content-Type": "application/json" },
      })
      console.log(`[api:category:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)
      if (res.status === 404) return null
      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(`[api:category:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
      return null
    }
  }
)

export const getStoreCollectionDetail = cache(
  async (handle: string, collectionHandle: string): Promise<{
    collection: any
    products: any[]
    categories: any[]
    collections: any[]
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    const url = `${BACKEND}/store-front/${handle}/collections/${collectionHandle}`

    console.log(`[api:collection:${callId}] START handle=${handle} collection=${collectionHandle}`)
    const t0 = Date.now()

    try {
      const res = await fetchWithTimeout(url, {
        next: { revalidate: 30, tags: [`store-collection-${handle}-${collectionHandle}`] },
        headers: { "Content-Type": "application/json" },
      })
      console.log(`[api:collection:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)
      if (res.status === 404) return null
      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(`[api:collection:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
      return null
    }
  }
)

export const getStoreShell = cache(
  async (
    handle: string,
    options: { accessToken?: string } = {}
  ): Promise<{
    vendor: any
    store: any
    categories: any[]
    collections: any[]
  } | null> => {
    if (isSystemHandle(handle)) return null

    const callId = Math.random().toString(36).slice(2, 6)
    // ↓ same existing route, just add ?shell=true
    const url = `${BACKEND}/store-front/${handle}?shell=true`

    console.log(`[api:shell:${callId}] START handle=${handle}`)
    const t0 = Date.now()

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (options.accessToken) headers["x-store-access"] = options.accessToken

      const res = await fetchWithTimeout(url, {
        headers,
        next: { revalidate: 60, tags: [`store-shell-${handle}`] },
      })

      console.log(`[api:shell:${callId}] Response ${res.status} in ${Date.now() - t0}ms`)
      if (!res.ok) return null
      return res.json()
    } catch (err: any) {
      console.error(`[api:shell:${callId}] FAILED after ${Date.now() - t0}ms: ${err?.name} — ${err?.message}`)
      return null
    }
  }
)

// ─── UTILITIES ──────────────────────────────────────────────────────────────
export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
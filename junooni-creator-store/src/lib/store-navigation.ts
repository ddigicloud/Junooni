// lib/store-navigation.ts
// Build URLs that work correctly on both:
//   - Subdomain: meenal.junooni.com → paths are /products/mug (NO handle prefix)
//   - Dev path:  localhost:3001/meenal → paths are /meenal/products/mug

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "junooni.com"

/**
 * Returns true if the current request is on a subdomain or custom domain.
 * In this case, URLs should NOT include the handle prefix.
 */
export function isSubdomainContext(): boolean {
  if (typeof window === "undefined") return false
  const hostname = window.location.hostname
  return (
    (hostname.endsWith(`.${ROOT_DOMAIN}`) && hostname !== ROOT_DOMAIN) ||
    hostname.endsWith(".localhost") ||
    (!hostname.includes("localhost") && hostname !== ROOT_DOMAIN && hostname !== "localhost")
  )
}

/**
 * Build a store-internal URL.
 * On subdomain (meenal.junooni.com): /products/mug
 * On dev path (localhost:3001/meenal): /meenal/products/mug
 */
export function storeUrl(handle: string, path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  if (isSubdomainContext()) {
    // Subdomain — path only, no handle prefix
    return cleanPath === "/" ? "/" : cleanPath
  }
  // Dev path-based routing — include handle
  return `/${handle}${cleanPath === "/" ? "" : cleanPath}`
}

/**
 * Build a product URL
 */
export function productUrl(handle: string, productHandle: string): string {
  return storeUrl(handle, `/products/${productHandle}`)
}
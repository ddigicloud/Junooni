// junooni-dashboard/src/lib/store-urls.ts
//
// Single source of truth for all creator store URLs used across the dashboard.
// Imported by store-index.tsx, store-editor.tsx, and any future studio pages.
//
// Dev:  http://localhost:3001/tanishk
// Prod: https://tanishk.junooni.com

const ROOT_DOMAIN = import.meta.env.VITE_STORE_DOMAIN ?? "junooni.com"
const STORE_PORT  = import.meta.env.VITE_STORE_PORT  ?? "3001"

/** Public storefront URL for a creator */
export function getStoreUrl(handle: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`
  if (import.meta.env.PROD) return `https://${handle}.${ROOT_DOMAIN}`
  return `http://localhost:${STORE_PORT}/${handle}`
}

/** Iframe preview URL — includes __editor=1 flag for postMessage handshake */
export function getPreviewUrl(handle: string): string {
  if (import.meta.env.PROD) return `https://${handle}.${ROOT_DOMAIN}?__editor=1`
  return `http://localhost:${STORE_PORT}/${handle}?__editor=1`
}

/** URL for a specific custom page on a creator's store */
export function getPageUrl(handle: string, slug: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/p/${slug}`
}

/** URL for a specific product on a creator's store */
export function getProductUrl(handle: string, productHandle: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/products/${productHandle}`
}
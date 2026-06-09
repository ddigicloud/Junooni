// // junooni-dashboard/src/lib/store-urls.ts
// //
// // Single source of truth for all creator store URLs used across the dashboard.
// // Imported by store-index.tsx, store-editor.tsx, and any future studio pages.
// //
// // Dev:  http://localhost:3001/tanishk
// // Prod: https://tanishk.junooni.com

// const ROOT_DOMAIN = import.meta.env.VITE_STORE_DOMAIN ?? "junooni.com"
// const STORE_PORT  = import.meta.env.VITE_STORE_PORT  ?? "3001"

// /** Public storefront URL for a creator */
// export function getStoreUrl(handle: string, customDomain?: string | null): string {
//   if (customDomain) return `https://${customDomain}`
//   if (import.meta.env.PROD) return `https://${handle}.${ROOT_DOMAIN}`
//   return `http://localhost:${STORE_PORT}/${handle}`
// }

// /** Iframe preview URL — includes __editor=1 + __preview=1 flags
//  *  __editor=1 = postMessage handshake for live editing
//  *  __preview=1 = bypasses password gate so creator sees their own store
//  */
// export function getPreviewUrl(handle: string): string {
//   if (import.meta.env.PROD) return `https://${handle}.${ROOT_DOMAIN}?__editor=1&__preview=1`
//   return `http://localhost:${STORE_PORT}/${handle}?__editor=1&__preview=1`
// }

// /** Store URL for creator to visit their own store (bypasses password gate) */
// export function getCreatorStoreUrl(handle: string, customDomain?: string | null): string {
//   const base = customDomain ? `https://${customDomain}` :
//     import.meta.env.PROD ? `https://${handle}.${ROOT_DOMAIN}` :
//     `http://localhost:${STORE_PORT}/${handle}`
//   return `${base}?__preview=1`
// }

// /** URL for a specific custom page on a creator's store */
// export function getPageUrl(handle: string, slug: string, customDomain?: string | null): string {
//   return `${getStoreUrl(handle, customDomain)}/p/${slug}`
// }

// /** URL for a specific product on a creator's store */
// export function getProductUrl(handle: string, productHandle: string, customDomain?: string | null): string {
//   return `${getStoreUrl(handle, customDomain)}/products/${productHandle}`
// }



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

/** Iframe preview URL — includes __editor=1 + __preview=1 flags
 *  __editor=1 = postMessage handshake for live editing
 *  __preview=1 = bypasses password gate so creator sees their own store
 *  NOTE: returns base URL only (no page path) — page path is appended
 *  in StoreEditorPage via the previewUrl computed block.
 */
export function getPreviewUrl(handle: string): string {
  if (import.meta.env.PROD) return `https://${handle}.${ROOT_DOMAIN}?__editor=1&__preview=1`
  return `http://localhost:${STORE_PORT}/${handle}?__editor=1&__preview=1`
}

/** Store URL for creator to visit their own store (bypasses password gate) */
export function getCreatorStoreUrl(handle: string, customDomain?: string | null): string {
  const base = customDomain ? `https://${customDomain}` :
    import.meta.env.PROD ? `https://${handle}.${ROOT_DOMAIN}` :
    `http://localhost:${STORE_PORT}/${handle}`
  return `${base}?__preview=1`
}

/** URL for a specific custom page on a creator's store */
export function getPageUrl(handle: string, slug: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/pages/${slug}`
}

/** URL for a specific product on a creator's store */
export function getProductUrl(handle: string, productHandle: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/products/${productHandle}`
}

/** URL for a specific collection on a creator's store */
export function getCollectionUrl(handle: string, collectionHandle: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/collections/${collectionHandle}`
}

/** URL for a specific category on a creator's store */
export function getCategoryUrl(handle: string, categoryHandle: string, customDomain?: string | null): string {
  return `${getStoreUrl(handle, customDomain)}/categories/${categoryHandle}`
}
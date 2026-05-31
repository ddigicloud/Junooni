// src/app/[handle]/page.tsx

// src/app/[handle]/page.tsx
// Password gate is handled by layout.tsx
// This page only renders when layout has confirmed access

// src/app/[handle]/page.tsx
// Password gate is handled by layout.tsx
// This page only renders when layout has confirmed access

import { headers, cookies } from "next/headers"
import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import StoreRenderer from "./StoreRenderer"
import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
import BoldTemplate from "@/components/templates/bold/BoldTemplate"
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate"

interface Props {
  params: { handle: string }
}

function resolveHandle(paramHandle: string): string {
  const xHandle = headers().get("x-handle")
  return xHandle ?? paramHandle
}

function getAccessToken(handle: string): string {
  return cookies().get(`store_access_${handle}`)?.value ?? ""
}

// Single fetch shared between generateMetadata + page component
const fetchStore = cache(async (handle: string, token: string) => {
  return getStorefrontData(handle, {
    noCache: true,
    accessToken: token || undefined,
  })
})

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const handle = resolveHandle(params.handle)
//   const token = getAccessToken(handle)
//   const data = await fetchStore(handle, token)
//   if (!data) return { title: "Store not found" }
//   const { vendor, store } = data
//   return {
//     title: store?.seo_title ?? `${vendor.name} — Official Merch`,
//     description: store?.seo_description ?? vendor.creator_bio
//       ?? `Official merchandise store for ${vendor.name}`,
//     openGraph: {
//       title: store?.seo_title ?? `${vendor.name} — Official Merch`,
//       images: store?.og_image ? [{ url: store.og_image }]
//         : vendor.logo ? [{ url: vendor.logo }] : [],
//     },
//     robots: store?.status === "live" ? "index,follow" : "noindex",
//      icons: store?.store_favicon ? {
//       icon: store.store_favicon,
//       shortcut: store.store_favicon,
//       apple: store.store_favicon,
//     } : undefined,
//   }
// }

const STATIC_HANDLES = new Set([
  "favicon.ico", "robots.txt", "sitemap.xml", "apple-touch-icon.png",
  "manifest.json",
])

export default async function CreatorStorePage({ params }: Props) {
  const handle = resolveHandle(params.handle)

  // Skip static file requests that leak into [handle] route in dev
  if (STATIC_HANDLES.has(handle) || handle.includes(".")) {
    notFound()
  }

  const token = getAccessToken(handle)
  const data = await fetchStore(handle, token)

  console.log(`[page] handle=${handle} products=${data?.products?.length ?? 0} status=${data?.store?.status}`)

  if (!data || !data.vendor) notFound()

  const { vendor, store, products, categories, collections } = data
  const isDraft = store?.status !== "live"

  // Draft → coming soon page
  if (isDraft) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#fafafa",
        fontFamily: "Inter, sans-serif", padding: "1rem",
      }}>
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          {store?.store_logo
            ? <img src={store.store_logo} alt={vendor.name}
                style={{ height: "52px", objectFit: "contain", marginBottom: "1.5rem", display: "inline-block" }} />
            : (
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: `linear-gradient(135deg, ${store?.primary_color ?? "#e65100"}, ${store?.secondary_color ?? "#ac1900"})`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem", fontSize: "1.5rem",
              }}>🛍️</div>
            )}
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>
            {vendor.name}
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Something exciting is coming soon. Check back later!
          </p>
          <div style={{
            display: "inline-block", padding: "0.5rem 1.25rem",
            borderRadius: "8px", border: "1px solid #e5e5e5",
            fontSize: "0.8rem", color: "#aaa",
          }}>
            Powered by <span style={{ color: store?.primary_color ?? "#e65100", fontWeight: 600 }}>JUNOONI</span>
          </div>
        </div>
      </div>
    )
  }

  const brandStyles = {
    "--brand-primary":   store?.primary_color   ?? "#e65100",
    "--brand-secondary": store?.secondary_color ?? "#ac1900",
  } as React.CSSProperties

  
  return (
  <StoreRenderer
    vendor={vendor}
    store={store}
    products={products ?? []}
    categories={categories ?? []}
    collections={collections ?? []}
  />
)
}
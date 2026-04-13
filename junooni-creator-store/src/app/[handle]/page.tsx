// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
// import BoldTemplate from "@/components/templates/bold/BoldTemplate"
// import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate"

// interface Props {
//   params: { handle: string }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle)
//   if (!data) return { title: "Store not found" }
//   const { vendor, store } = data
//   const favicon = (store as any)?.store_favicon ?? vendor.logo ?? null
//   return {
//     title: store?.seo_title ?? `${vendor.name} — Official Merch`,
//     description: store?.seo_description ?? vendor.creator_bio ?? `Official merchandise store for ${vendor.name}`,
//     openGraph: {
//       title: store?.seo_title ?? `${vendor.name} — Official Merch`,
//       images: vendor.logo ? [{ url: vendor.logo }] : [],
//     },
//     icons: favicon ? {
//       icon: favicon,
//       apple: favicon,
//       shortcut: favicon,
//     } : undefined,
//   }
// }

// export default async function CreatorStorePage({ params }: Props) {
//   const data = await getStorefrontData(params.handle)
//   if (!data || !data.vendor) notFound()

//   const { vendor, store, products, categories, collections } = data

//   const brandStyles = {
//     "--brand-primary":   store?.primary_color   ?? "#e65100",
//     "--brand-secondary": store?.secondary_color ?? "#000000",
//   } as React.CSSProperties

//   const template = store?.template ?? "minimal"
//   const commonProps = { vendor, store, products, categories, collections }

//   return (
//     <div style={brandStyles}>
//       {template === "minimal"   && <MinimalTemplate   {...commonProps} />}
//       {template === "bold"      && <BoldTemplate      {...commonProps} />}
//       {template === "editorial" && <EditorialTemplate {...commonProps} />}
//     </div>
//   )
// }
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
import BoldTemplate from "@/components/templates/bold/BoldTemplate"
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate"

interface Props {
  params: { handle: string }
}

// In production, the middleware rewrites:
//   tanishk.junooni.com/  →  /tanishk  (internally)
// and sets x-handle header.
// In dev, handle comes directly from [handle] URL segment.
function resolveHandle(paramHandle: string): string {
  // x-handle is set by middleware.ts for subdomain requests
  const xHandle = headers().get("x-handle")
  return xHandle ?? paramHandle
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = resolveHandle(params.handle)
  const data = await getStorefrontData(handle)
  if (!data) return { title: "Store not found" }

  const { vendor, store } = data
  return {
    title: store?.seo_title ?? `${vendor.name} — Official Merch`,
    description: store?.seo_description ?? vendor.creator_bio ?? `Official merchandise store for ${vendor.name}`,
    openGraph: {
      title: store?.seo_title ?? `${vendor.name} — Official Merch`,
      images: store?.og_image
        ? [{ url: store.og_image }]
        : vendor.logo
          ? [{ url: vendor.logo }]
          : [],
    },
    // Let custom domain pages be indexed; block staging subdomains
    robots: store?.status === "live" ? "index,follow" : "noindex",
  }
}

export default async function CreatorStorePage({ params }: Props) {
  const handle = resolveHandle(params.handle)
  const data = await getStorefrontData(handle)

  if (!data || !data.vendor) notFound()

  const { vendor, store, products, categories, collections } = data

  const brandStyles = {
    "--brand-primary":   store?.primary_color   ?? "#e65100",
    "--brand-secondary": store?.secondary_color ?? "#ac1900",
  } as React.CSSProperties

  const template = store?.template ?? "minimal"

  return (
    <div style={brandStyles}>
      {template === "minimal" && (
        <MinimalTemplate
          vendor={vendor} store={store} products={products ?? []}
          categories={categories ?? []} collections={collections ?? []}
        />
      )}
      {template === "bold" && (
        <BoldTemplate
          vendor={vendor} store={store} products={products ?? []}
          categories={categories ?? []} collections={collections ?? []}
        />
      )}
      {template === "editorial" && (
        <EditorialTemplate
          vendor={vendor} store={store} products={products ?? []}
          categories={categories ?? []} collections={collections ?? []}
        />
      )}
    </div>
  )
}
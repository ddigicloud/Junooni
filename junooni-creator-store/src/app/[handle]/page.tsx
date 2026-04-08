import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
import BoldTemplate from "@/components/templates/bold/BoldTemplate"
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate"

interface Props {
  params: { handle: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Store not found" }
  const { vendor, store } = data
  const favicon = (store as any)?.store_favicon ?? vendor.logo ?? null
  return {
    title: store?.seo_title ?? `${vendor.name} — Official Merch`,
    description: store?.seo_description ?? vendor.creator_bio ?? `Official merchandise store for ${vendor.name}`,
    openGraph: {
      title: store?.seo_title ?? `${vendor.name} — Official Merch`,
      images: vendor.logo ? [{ url: vendor.logo }] : [],
    },
    icons: favicon ? {
      icon: favicon,
      apple: favicon,
      shortcut: favicon,
    } : undefined,
  }
}

export default async function CreatorStorePage({ params }: Props) {
  const data = await getStorefrontData(params.handle)
  if (!data || !data.vendor) notFound()

  const { vendor, store, products, categories, collections } = data

  const brandStyles = {
    "--brand-primary":   store?.primary_color   ?? "#e65100",
    "--brand-secondary": store?.secondary_color ?? "#000000",
  } as React.CSSProperties

  const template = store?.template ?? "minimal"
  const commonProps = { vendor, store, products, categories, collections }

  return (
    <div style={brandStyles}>
      {template === "minimal"   && <MinimalTemplate   {...commonProps} />}
      {template === "bold"      && <BoldTemplate      {...commonProps} />}
      {template === "editorial" && <EditorialTemplate {...commonProps} />}
    </div>
  )
}
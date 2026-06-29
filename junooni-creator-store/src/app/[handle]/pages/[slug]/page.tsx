import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreProducts } from "@/lib/api"
import CustomPageClient from "./Custompageclient"

interface Props { params: { handle: string; slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Page" }
  const pages = (data.store as any)?.pages?.pages ?? []
  const page = pages.find((p: any) => p.slug === params.slug)
  return { title: `${page?.title ?? "Page"} — ${data.vendor.name}` }
}

export default async function CustomPage({ params }: Props) {
  const data = await getStorefrontData(params.handle)
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data  // ← add products here

  const pages = (store as any)?.pages?.pages ?? []
  const page = pages.find((p: any) => p.slug === params.slug)
  if (!page) notFound()

  const brandPrimary = (store as any)?.primary_color ?? "#e65100"
  const isDark = (store as any)?.template === "bold"
  const brandStyles = {
    "--brand-primary": brandPrimary,
    "--brand-secondary": (store as any)?.secondary_color ?? "#000",
  } as React.CSSProperties

  return (
    <div
      style={brandStyles}
      className={`min-h-screen flex flex-col ${isDark ? "bg-black text-white" : "bg-gray-50"}`}
    >
      <main className="flex flex-col flex-1">
        <CustomPageClient
          page={page}
          brandPrimary={brandPrimary}
          isDark={isDark}
          vendor={vendor}
          initialStore={store}
          categories={categories ?? []}
          collections={collections ?? []}
          products={products ?? []}
        />
      </main>
    </div>
  )
}
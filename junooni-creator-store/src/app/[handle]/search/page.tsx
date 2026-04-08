import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import SearchClient from "./SearchClient"

interface Props { params: { handle: string }; searchParams: { q?: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Search" }
  return { title: `Search — ${data.vendor.name}` }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const data = await getStorefrontData(params.handle)
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data
  const brandStyles = { "--brand-primary": store?.primary_color ?? "#e65100", "--brand-secondary": store?.secondary_color ?? "#000" } as React.CSSProperties
  const isDark = store?.template === "bold"

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
      <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <SearchClient products={products} handle={params.handle} brandPrimary={store?.primary_color ?? "#e65100"} isDark={isDark} initialQuery={searchParams.q ?? ""} />
      </div>
      <StoreFooter vendor={vendor} store={store} categories={categories} collections={collections} />
    </div>
  )
}

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import SearchPageClient from "./SearchPageClient"

interface Props { params: { handle: string }; searchParams: { q?: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Search" }
  return { title: `Search — ${data.vendor.name}` }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <SearchPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
      initialQuery={searchParams.q ?? ""}
    />
  )
}
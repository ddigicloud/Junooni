import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreCategories } from "@/lib/api"
import CategoriesPageClient from "./CategoriesPageClient"

interface Props { params: { handle: string } }

// Drop force-dynamic + revalidate:0 — public cacheable page
export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // React.cache() deduplicates — no second network call from page below
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Categories" }
  return {
    title: `Categories — ${data.vendor.name}`,
    description: `Browse all categories from ${data.vendor.name} on JUNOONI.`,
  }
}

export default async function CategoriesIndexPage({ params }: Props) {
  // Parallel: store (cache hit from generateMetadata) + categories (new lightweight endpoint)
  const [storeData, categoriesData] = await Promise.all([
    getStorefrontData(params.handle),      // instant — React.cache hit
    getStoreCategories(params.handle),     // new fast endpoint
  ])

  if (!storeData) notFound()

  const { vendor, store, collections } = storeData

  return (
    <CategoriesPageClient
      vendor={vendor}
      initialStore={store}
      products={categoriesData?.products ?? []}
      categories={categoriesData?.categories ?? []}
      collections={categoriesData?.collections ?? collections ?? []}
      handle={params.handle}
    />
  )
}
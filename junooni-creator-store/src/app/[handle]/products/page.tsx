import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreProducts } from "@/lib/api"
import ProductsPageClient from "@/components/store/ProductsPageClient"

interface Props {
  params: { handle: string }
  searchParams: { [key: string]: string | undefined }
}

// 30s ISR — same as the fetch revalidate window.
// Remove force-dynamic: products page doesn't need to be dynamic;
// it's public and cacheable. Editor/preview passes noCache via the fetch.
export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // React.cache() inside getStorefrontData means this does NOT fire a
  // second network request — the page component's call below reuses the result.
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Products" }
  return {
    title: `All Products — ${data.vendor.name}`,
    description: `Browse all products from ${data.vendor.name} on JUNOONI.`,
  }
}

export default async function AllProductsPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"))

  // Run both fetches in parallel:
  // - getStorefrontData: store settings + vendor (already cached from generateMetadata)
  // - getStoreProducts: hits the new lightweight /products endpoint
  const [storeData, productsData] = await Promise.all([
    getStorefrontData(params.handle),   // cache hit — returns instantly
    getStoreProducts(params.handle, page),
  ])

  if (!storeData) notFound()

  const { vendor, store, collections } = storeData

  return (
    <ProductsPageClient
      vendor={vendor}
      initialStore={store}
      products={productsData?.products ?? []}
      categories={productsData?.categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
    />
  )
}
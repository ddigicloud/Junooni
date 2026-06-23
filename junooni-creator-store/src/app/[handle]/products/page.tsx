
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStoreShell, getStoreProducts } from "@/lib/api"
import ProductsPageClient from "@/components/store/ProductsPageClient"

interface Props {
  params: { handle: string }
  searchParams: { [key: string]: string | undefined }
}

export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStoreShell(params.handle)
  if (!data) return { title: "Products" }
  return {
    title: `All Products — ${data.vendor.name}`,
    description: `Browse all products from ${data.vendor.name} on JUNOONI.`,
  }
}

export default async function AllProductsPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"))

  const [storeData, productsData] = await Promise.all([
    getStoreShell(params.handle),
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
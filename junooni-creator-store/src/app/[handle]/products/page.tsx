import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import ProductsPageClient from "@/components/store/ProductsPageClient"

interface Props { params: { handle: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Products" }
  return { title: `All Products — ${data.vendor.name}` }
}

export default async function AllProductsPage({ params }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <ProductsPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
    />
  )
}
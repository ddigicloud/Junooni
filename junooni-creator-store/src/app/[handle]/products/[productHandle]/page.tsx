import { cache } from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import { getStorefrontData, formatPrice } from "@/lib/api"
import ProductPageClient from "./ProductPageClient"

interface Props {
  params: { handle: string; productHandle: string }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const fetchStore = async (handle: string, token?: string) => {
  return getStorefrontData(handle, { noCache: true, accessToken: token || undefined })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = cookies().get(`store_access_${params.handle}`)?.value
  const data = await fetchStore(params.handle, token)
  if (!data) return { title: "Product not found" }
  const product = data.products.find((p: any) => p.handle === params.productHandle)
  if (!product) return { title: "Product not found" }
  return {
    title: `${product.title} — ${data.vendor.name}`,
    description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
    openGraph: { images: product.thumbnail ? [{ url: product.thumbnail }] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  const token = cookies().get(`store_access_${params.handle}`)?.value
  const data = await fetchStore(params.handle, token)
  if (!data) notFound()

  const product = data.products.find((p: any) => p.handle === params.productHandle)
  if (!product) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <ProductPageClient
      vendor={vendor}
      initialStore={store}
      product={product}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
    />
  )
}
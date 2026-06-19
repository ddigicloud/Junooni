import { cache } from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import { getStoreShell, getStoreCollections } from "@/lib/api"
import ProductPageClient from "./ProductPageClient"

interface Props {
  params: { handle: string; productHandle: string }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// ── Fetch single product ───────────────────────────────────────────────────
const fetchProduct = cache(async (handle: string, productHandle: string): Promise<any | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const pubKey  = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""
  const url = `${baseUrl}/storefront/${handle}/product/${productHandle}`

  console.log(`[page:fetchProduct] START url=${url}`)
  const t = Date.now()

  try {
    const res = await fetch(url, {
      headers: { "x-publishable-api-key": pubKey },
      cache: "no-store",
    })
    console.log(`[page:fetchProduct] response status=${res.status} in ${Date.now()-t}ms`)
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error(`[page:fetchProduct] FAILED ${res.status} — body=${body.slice(0,200)}`)
      return null
    }
    const data = await res.json()
    console.log(`[page:fetchProduct] OK — product.id=${data.product?.id} handle=${data.product?.handle}`)
    return data.product ?? null
  } catch (err) {
    console.error(`[page:fetchProduct] EXCEPTION:`, err)
    return null
  }
})

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = cookies().get(`store_access_${params.handle}`)?.value

  const [shell, product] = await Promise.all([
    getStoreShell(params.handle, { accessToken: token }),
    fetchProduct(params.handle, params.productHandle),
  ])

  if (!shell || !product) return { title: "Product not found" }

  return {
    title: `${product.title} — ${shell.vendor.name}`,
    description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
    openGraph: {
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function ProductPage({ params }: Props) {
  console.log(`[page:ProductPage] handle=${params.handle} productHandle=${params.productHandle}`)
  const token = cookies().get(`store_access_${params.handle}`)?.value

  const [shell, product, collectionsData] = await Promise.all([
    getStoreShell(params.handle, { accessToken: token }),
    fetchProduct(params.handle, params.productHandle),
    getStoreCollections(params.handle),
  ])

  console.log(`[page:ProductPage] shell=${!!shell} product=${!!product} collectionsData=${!!collectionsData}`)

  if (!shell) {
    console.error(`[page:ProductPage] shell is null — notFound()`)
    notFound()
  }

  if (!product) {
    console.error(`[page:ProductPage] product is null — notFound()`)
    notFound()
  }

  const { vendor, store } = shell

  // Prefer rich collectionsData (has product_ids + product_count),
  // fall back to shell data (lightweight, no counts)
  const categories  = collectionsData?.categories  ?? shell.categories  ?? []
  const collections = collectionsData?.collections ?? shell.collections ?? []

  return (
    <ProductPageClient
      vendor={vendor}
      initialStore={store}
      product={product}
      products={[]}
      categories={categories}
      collections={collections}
    />
  )
}
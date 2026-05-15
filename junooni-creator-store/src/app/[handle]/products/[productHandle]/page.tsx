// import { cache } from "react"
// import { notFound } from "next/navigation"
// import { cookies } from "next/headers"
// import type { Metadata } from "next"
// import { getStorefrontData, formatPrice } from "@/lib/api"
// import ProductPageClient from "./ProductPageClient"

// interface Props {
//   params: { handle: string; productHandle: string }
// }

// export const dynamic = "force-dynamic"
// export const revalidate = 0

// const fetchStore = async (handle: string, token?: string) => {
//   return getStorefrontData(handle, { noCache: true, accessToken: token || undefined })
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const token = cookies().get(`store_access_${params.handle}`)?.value
//   const data = await fetchStore(params.handle, token)
//   if (!data) return { title: "Product not found" }
//   const product = data.products.find((p: any) => p.handle === params.productHandle)
//   if (!product) return { title: "Product not found" }
//   return {
//     title: `${product.title} — ${data.vendor.name}`,
//     description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
//     openGraph: { images: product.thumbnail ? [{ url: product.thumbnail }] : [] },
//   }
// }

// export default async function ProductPage({ params }: Props) {
//   const token = cookies().get(`store_access_${params.handle}`)?.value
//   const data = await fetchStore(params.handle, token)
//   if (!data) notFound()

//   const product = data.products.find((p: any) => p.handle === params.productHandle)
//   if (!product) notFound()

//   const { vendor, store, products, categories, collections } = data

//   return (
//     <ProductPageClient
//       vendor={vendor}
//       initialStore={store}
//       product={product}
//       products={products ?? []}
//       categories={categories ?? []}
//       collections={collections ?? []}
//     />
//   )


import { cache } from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import ProductPageClient from "./ProductPageClient"

interface Props {
  params: { handle: string; productHandle: string }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const fetchStore = cache(async (handle: string, token?: string) => {
  console.log(`[page:fetchStore] START handle=${handle}`)
  const t = Date.now()
  const result = await getStorefrontData(handle, { noCache: true, accessToken: token || undefined })
  console.log(`[page:fetchStore] DONE ${Date.now()-t}ms — products=${result?.products?.length} vendor=${result?.vendor?.handle}`)
  return result
})

const fetchProduct = cache(async (handle: string, productHandle: string): Promise<any | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const pubKey  = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""
  const url = `${baseUrl}/store/store-front/${handle}/product/${productHandle}`

  console.log(`[page:fetchProduct] START url=${url} pubKey=${pubKey ? pubKey.slice(0,12)+"..." : "MISSING"}`)
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  console.log(`[page:generateMetadata] handle=${params.handle} productHandle=${params.productHandle}`)
  const token = cookies().get(`store_access_${params.handle}`)?.value

  const [data, product] = await Promise.all([
    fetchStore(params.handle, token),
    fetchProduct(params.handle, params.productHandle),
  ])

  console.log(`[page:generateMetadata] resolved data=${!!data} product=${!!product}`)
  if (!data || !product) return { title: "Product not found" }

  return {
    title: `${product.title} — ${data.vendor.name}`,
    description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
    openGraph: { images: product.thumbnail ? [{ url: product.thumbnail }] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  console.log(`[page:ProductPage] handle=${params.handle} productHandle=${params.productHandle}`)
  const token = cookies().get(`store_access_${params.handle}`)?.value

  const [data, product] = await Promise.all([
    fetchStore(params.handle, token),
    fetchProduct(params.handle, params.productHandle),
  ])

  console.log(`[page:ProductPage] resolved data=${!!data} product=${!!product}`)

  if (!data) {
    console.error(`[page:ProductPage] data is null — notFound()`)
    notFound()
  }
  if (!product) {
    console.error(`[page:ProductPage] product is null — notFound()`)
    // Temporary fallback: find product from store data while dedicated route is being fixed
    const fallback = data!.products?.find((p: any) => p.handle === params.productHandle)
    console.log(`[page:ProductPage] fallback product=${!!fallback} handle=${fallback?.handle}`)
    if (!fallback) notFound()

    const { vendor, store, products, categories, collections } = data!
    return (
      <ProductPageClient
        vendor={vendor}
        initialStore={store}
        product={fallback}
        products={products ?? []}
        categories={categories ?? []}
        collections={collections ?? []}
      />
    )
  }

  const { vendor, store, products, categories, collections } = data!
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
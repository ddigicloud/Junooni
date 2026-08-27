import { cache } from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import { getStoreShell, getStoreCollections } from "@/lib/api"
import ProductPageClient from "./ProductPageClient"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

interface Props {
  params: { handle: string; productHandle: string }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// ── Fetch single product ───────────────────────────────────────────────────
const fetchProduct = cache(async (handle: string, productHandle: string): Promise<any | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const pubKey  = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""
    const fields = [
    'id','title','subtitle','handle','description','status',
    'thumbnail','discountable','weight','length','width','height',
    'material','origin_country','metadata',
    'options.id','options.title','options.is_exclusive',
    '+options.values.id','+options.values.value',
    'variants.id','variants.title','variants.sku',
    'variants.allow_backorder','variants.manage_inventory',
    '+variants.inventory_quantity',
    'variants.prices.amount','variants.prices.currency_code',
    'variants.options.id','variants.options.value',
    '+variants.options.option.id','+variants.options.option.title',
    'variants.inventory_items.inventory_item_id',
    'variants.metadata',
    '+variants.images.id','+variants.images.url',
    'images.id','images.url','images.rank','images.metadata',
    'categories.id','categories.name',
    '+sales_channels.id','+sales_channels.name',
  ].join(',')

  const url = `${baseUrl}/storefront/${handle}/product/${productHandle}?fields=${fields}`

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[fetchProduct] ▶ START`)
  console.log(`[fetchProduct] handle="${handle}"`)
  console.log(`[fetchProduct] productHandle="${productHandle}"`)
  console.log(`[fetchProduct] baseUrl="${baseUrl}"`)
  console.log(`[fetchProduct] pubKey="${pubKey ? pubKey.slice(0, 12) + "…" : "⚠️ MISSING — check NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY env var"}"`)
  console.log(`[fetchProduct] pubKey length=${pubKey.length}`)
  console.log(`[fetchProduct] fullUrl="${url}"`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const t = Date.now()

  try {
    const res = await fetch(url, {
      headers: { "x-publishable-api-key": pubKey },
      cache: "no-store",
    })

    const elapsed = Date.now() - t
    console.log(`[fetchProduct] response status=${res.status} statusText="${res.statusText}" in ${elapsed}ms`)
    console.log(`[fetchProduct] response headers:`, Object.fromEntries(res.headers.entries()))

    if (!res.ok) {
      const body = await res.text().catch(() => "(could not read body)")
      console.error(`[fetchProduct] ❌ FAILED status=${res.status} statusText="${res.statusText}"`)
      console.error(`[fetchProduct] ❌ response body (first 500 chars): "${body.slice(0, 500)}"`)
      console.error(`[fetchProduct] ❌ returning null — this will render "Product not found"`)
      return null
    }

    const data = await res.json()
    console.log(`[fetchProduct] ✅ JSON parsed — top-level keys:`, Object.keys(data))

    if (!data.product) {
      console.error(`[fetchProduct] ⚠️ data.product is null/undefined!`)
      console.error(`[fetchProduct] ⚠️ full response (first 500 chars):`, JSON.stringify(data).slice(0, 500))
      return null
    }

    console.log(`[fetchProduct] ✅ product.id="${data.product?.id}"`)
    console.log(`[fetchProduct] ✅ product.handle="${data.product?.handle}"`)
    console.log(`[fetchProduct] ✅ product.title="${data.product?.title}"`)
    console.log(`[fetchProduct] ✅ product.status="${data.product?.status}"`)

    return data.product
  } catch (err) {
    const elapsed = Date.now() - t
    console.error(`[fetchProduct] 💥 EXCEPTION after ${elapsed}ms`)
    console.error(`[fetchProduct] 💥 error name:`, (err as any)?.name)
    console.error(`[fetchProduct] 💥 error message:`, (err as any)?.message)
    console.error(`[fetchProduct] 💥 full error:`, err)
    return null
  }
})

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  console.log(`[generateMetadata] params.handle="${params.handle}" params.productHandle="${params.productHandle}"`)

  const token = cookies().get(`store_access_${params.handle}`)?.value

  const [shell, product] = await Promise.all([
    getStoreShell(params.handle, { accessToken: token }),
    fetchProduct(params.handle, params.productHandle),
  ])

  console.log(`[generateMetadata] shell=${!!shell} product=${!!product}`)

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
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[ProductPage] ▶ START`)
  console.log(`[ProductPage] params =`, JSON.stringify(params))
  console.log(`[ProductPage] params.handle="${params.handle}" (type: ${typeof params.handle})`)
  console.log(`[ProductPage] params.productHandle="${params.productHandle}" (type: ${typeof params.productHandle})`)

  // Log all relevant env vars (values truncated for safety)
  console.log(`[ProductPage] ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL="${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "⚠️ NOT SET"}"`)
  console.log(`[ProductPage] ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.slice(0,12)+"…" : "⚠️ NOT SET"}"`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const token = cookies().get(`store_access_${params.handle}`)?.value
  console.log(`[ProductPage] cookie store_access_${params.handle}="${token ?? "(not set)"}"`)

  console.log(`[ProductPage] calling Promise.all([getStoreShell, fetchProduct, getStoreCollections])...`)
  const [shell, product, collectionsData] = await Promise.all([
    getStoreShell(params.handle, { accessToken: token }),
    fetchProduct(params.handle, params.productHandle),
    getStoreCollections(params.handle),
  ])

  console.log(`[ProductPage] results:`)
  console.log(`[ProductPage]   shell=${!!shell}`)
  console.log(`[ProductPage]   product=${!!product} ${product ? `(id="${product.id}" handle="${product.handle}")` : "← ⚠️ NULL — will render 404"}`)
  console.log(`[ProductPage]   collectionsData=${!!collectionsData}`)

  if (!shell) {
    console.error(`[ProductPage] ❌ shell is null — calling notFound()`)
    notFound()
  }

  const { vendor, store } = shell

  console.log(`[ProductPage] vendor.handle="${vendor?.handle}" vendor.name="${vendor?.name}"`)
  console.log(`[ProductPage] store.id="${store?.id}"`)

  const categories  = collectionsData?.categories  ?? shell.categories  ?? []
  const collections = collectionsData?.collections ?? shell.collections ?? []

  const brandPrimary   = store?.primary_color   ?? "#e65100"
  const brandSecondary = store?.secondary_color ?? "#000"
  const isDark         = store?.template === "bold"

  const fontClass =
    store?.font === "poppins"       ? "font-poppins" :
    store?.font === "playfair"      ? "font-playfair" :
    store?.font === "dm-sans"       ? "font-dm-sans" :
    store?.font === "space-grotesk" ? "font-space-grotesk" :
    store?.font === "nunito"        ? "font-nunito" :
    store?.font === "raleway"       ? "font-raleway" :
    store?.font === "montserrat"    ? "font-montserrat" :
    "font-inter"

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  // ── Product not found — show proper 404 with store header/footer ──────
  if (!product) {
    console.error(`[ProductPage] ❌ product is null — rendering "Product not found" UI`)
    console.error(`[ProductPage] ❌ handle="${params.handle}" productHandle="${params.productHandle}"`)
    console.error(`[ProductPage] ❌ Check: does this product handle exist for this vendor in the DB?`)
    console.error(`[ProductPage] ❌ Check: is NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY scoped to this vendor's sales channel?`)
    return (
      <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white"} ${fontClass}`}>
        <StoreHeader
          vendor={vendor} store={store}
          categories={categories} collections={collections} products={collectionsData?.products ?? []}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full"
            style={{ background: `${brandPrimary}15` }}>
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Product not found
          </h1>
          <p className={`text-base mb-8 max-w-md ${isDark ? "text-white/60" : "text-gray-500"}`}>
            This product doesn't exist or may have been removed from this store.
          </p>
          <a href={`/${vendor.handle}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity rounded-full hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
            Browse all products
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <StoreFooter
          vendor={vendor} store={store}
          categories={categories} collections={collections}
        />
      </div>
    )
  }

  console.log(`[ProductPage] ✅ rendering ProductPageClient for product="${product.handle}"`)

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
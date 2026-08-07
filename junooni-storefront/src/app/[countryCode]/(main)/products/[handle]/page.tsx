import { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import JsonLd from "../../components/JsonLd"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// ── Backend URL for the custom size_chart route ────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// ── PDP fields via listProducts (store API) ────────────────────────────────
// listProducts handles region_id → calculated_price works correctly.
// size_chart is NOT available via store API (custom module) — fetched separately.
const PDP_FIELDS = [
  // ── Base product fields (explicitly required) ──
  "+title",           // <-- THIS was missing
  "+description",
  "+handle",
  "+thumbnail",
  "+status",
  "+subtitle",
  "+material",
  "+weight",
  "+length",
  "+height",
  "+width",
  "+origin_country",
  "+discountable",
  // ── Images ────────────────────────────────────
  "+images.url",
  // ── Variants ──────────────────────────────────
  "*variants.calculated_price",
  "+variants.inventory_quantity",
  "+variants.manage_inventory",
  "+variants.allow_backorder",
  "+variants.inventory_items.inventory.location_levels.stocked_quantity",
  "+variants.inventory_items.inventory.location_levels.reserved_quantity",
  "+variants.sku",
  "+variants.options.value",
  "+variants.options.option.title",
  "+variants.images",
  "+variants.metadata",
  // ── Options ───────────────────────────────────
  "+options.title",
  "+options.values.value",
  // ── Relations ─────────────────────────────────
  "vendor.id",
  "vendor.name",
  "vendor.handle",
  "vendor.logo",
  "vendor.verified",
  "categories.name",
  "categories.handle",
  "collection.title",
  "collection.handle",
  "+metadata",
  "+tags.id",
].join(",")

// ── React.cache — one fetch shared by generateMetadata + ProductPage ───────
const getProduct = cache(async (handle: string, countryCode: string) => {
  console.log(`[PDP] getProduct START | handle=${handle} | countryCode=${countryCode}`)
  const t0 = Date.now()

  const product = await listProducts({
    countryCode,
    queryParams: { handle, fields: PDP_FIELDS },
  }).then(({ response }) => response.products[0])

  console.log(
    `[PDP] getProduct DONE | handle=${handle} | ${Date.now() - t0}ms | found=${!!product}`
  )
  return product
})

// ── Fetch size_chart separately via the fixed custom route ─────────────────
// size_chart is a custom Medusa module — not accessible via store API.
// The custom /store/products/:id route now uses explicit fields + QueryContext
// so it's fast (no wildcards). We only call it if we need size_chart.
// React.cache ensures this also deduplicates within the same request.
const getSizeChart = cache(async (productId: string, regionId: string) => {
  try {
    const url = `${BACKEND_URL}/store/products/${productId}?region_id=${regionId}`
    console.log("[getSizeChart] fetching:", url)
    console.log("[getSizeChart] PUBLISHABLE_KEY exists:", !!PUBLISHABLE_KEY)

    const res = await fetch(url, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 120 },
    })

    console.log("[getSizeChart] response status:", res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.log("[getSizeChart] error body:", errorText)
      return null
    }

    const json = await res.json()
    console.log("[getSizeChart] product keys:", Object.keys(json.product || {}))
    console.log("[getSizeChart] size_chart value:", JSON.stringify(json.product?.size_chart))
    
    return json.product?.size_chart ?? null
  } catch (e) {
    console.log("[getSizeChart] CAUGHT ERROR:", e)
    return null
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────

const stripHtml = (html: string | null | undefined, fallback: string) =>
  html ? html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || fallback : fallback

const toMajorUnit = (amount: number | null | undefined) =>
  amount != null ? amount / 100 : undefined

const priceValidUntil = () =>
  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split("T")[0]

const isVariantInStock = (v: any): boolean => {
  if (v.manage_inventory === false) return true
  if (v.allow_backorder) return true
  const levels = v.inventory_items?.flatMap(
    (ii: any) => ii.inventory?.location_levels ?? []
  )
  if (!levels || levels.length === 0) {
    return v.inventory_quantity == null || v.inventory_quantity > 0
  }
  return (
    levels.reduce(
      (sum: number, ll: any) =>
        sum + ((ll.stocked_quantity ?? 0) - (ll.reserved_quantity ?? 0)),
      0
    ) > 0
  )
}

// ── generateStaticParams DISABLED ─────────────────────────────────────────
// Fetching all product handles at startup fires 20+ concurrent Medusa
// requests → DB pool exhaustion → crash loop.
// force-dynamic + dynamicParams=true handles all PDPs on-demand instead.
export async function generateStaticParams() {
  return []
}

export const dynamicParams = true

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params

  console.log(`[PDP] generateMetadata START | handle=${handle}`)
  const t0 = Date.now()

  const region = await getRegion(countryCode)
  if (!region) notFound()

  const product = await getProduct(handle, countryCode)
  if (!product) notFound()

  console.log(`[PDP] generateMetadata DONE | handle=${handle} | ${Date.now() - t0}ms`)

  const description = stripHtml(
    product.description,
    `Buy ${product.title} — exclusive creator merchandise on Junooni. Official merch, pan-India shipping.`
  )
  const creatorName = (product as any).vendor?.name ?? (product as any).brand ?? null
  const firstVariant = product.variants?.[0]
  const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)
  const canonicalUrl = `https://junooni.com/${countryCode}/products/${handle}`

  return {
    title: `${product.title} | Junooni`,
    description,
    keywords: [
      product.title,
      ...(creatorName ? [`${creatorName} merch`, `${creatorName} merchandise`] : []),
      "official creator merch India",
      "creator merchandise",
      "Junooni",
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${product.title} | Junooni`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
      url: canonicalUrl,
      siteName: "Junooni",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Junooni`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    other: {
      ...(price != null && {
        "product:price:amount": price.toString(),
        "product:price:currency": "INR",
      }),
      "twitter:label1": "Price",
      "twitter:data1": price ? `₹${price}` : "Check price on Junooni",
      "twitter:label2": "Ships to",
      "twitter:data2": "Pan India",
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ProductPage(props: Props) {
  const params = await props.params

  console.log(`[PDP] ProductPage START | handle=${params.handle}`)
  const t0 = Date.now()

  const region = await getRegion(params.countryCode)
  if (!region) notFound()

  // React.cache — same result as generateMetadata, zero extra fetch
  const pricedProduct = await getProduct(params.handle, params.countryCode)
  if (!pricedProduct) notFound()

  // Fetch size_chart separately — runs in parallel with nothing, fast
  // because the custom route now uses explicit fields (no wildcards)
  const sizeChart = await getSizeChart(pricedProduct.id, region.id)

  // Merge size_chart into product object so ProductActions can render the modal
  const productWithSizeChart = sizeChart
    ? { ...pricedProduct, size_chart: sizeChart }
    : pricedProduct

  console.log(
    `[PDP] ProductPage RENDER | handle=${params.handle} | ${Date.now() - t0}ms` +
    ` | variants=${pricedProduct.variants?.length} | images=${pricedProduct.images?.length}` +
    ` | size_chart=${!!sizeChart}`
  )

  console.log("[PDP] sizeChart raw result:", JSON.stringify(sizeChart, null, 2))
  console.log("[PDP] productWithSizeChart.size_chart:", !!(productWithSizeChart as any).size_chart)
  // ── Images ────────────────────────────────────────────────────────────────
  const images: string[] = []
  if (pricedProduct.thumbnail) images.push(pricedProduct.thumbnail)
  pricedProduct.images?.forEach((img: any) => {
    if (img.url && !images.includes(img.url)) images.push(img.url)
  })

  // ── Price ─────────────────────────────────────────────────────────────────
  const firstVariant = pricedProduct.variants?.[0]
  const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)
  const currencyCode =
    firstVariant?.calculated_price?.currency_code?.toUpperCase() ?? "INR"

  // ── Availability ──────────────────────────────────────────────────────────
  const inStock = pricedProduct.variants?.some((v: any) => isVariantInStock(v)) ?? true

  // ── Creator ───────────────────────────────────────────────────────────────
  const creatorName =
    (pricedProduct as any).vendor?.name ?? (pricedProduct as any).brand ?? "Junooni"
  const countryCode = params.countryCode
  const productUrl = `https://junooni.com/${countryCode}/products/${pricedProduct.handle}`
  const category = (pricedProduct as any).categories?.[0]

  // ── JSON-LD schemas ───────────────────────────────────────────────────────
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: stripHtml(
      pricedProduct.description,
      `Buy ${pricedProduct.title} — exclusive creator merchandise on Junooni.`
    ),
    image: images.length > 0 ? images : undefined,
    sku: firstVariant?.sku ?? pricedProduct.id,
    brand: { "@type": "Brand", name: creatorName },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: currencyCode,
      ...(price != null ? { price } : {}),
      priceValidUntil: priceValidUntil(),
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Junooni", url: "https://junooni.com" },
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://junooni.com/${countryCode}` },
      category
        ? { "@type": "ListItem", position: 2, name: category.name, item: `https://junooni.com/${countryCode}/categories/${category.handle}` }
        : { "@type": "ListItem", position: 2, name: "Store", item: `https://junooni.com/${countryCode}/store` },
      { "@type": "ListItem", position: 3, name: pricedProduct.title, item: productUrl },
    ],
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductTemplate
        product={productWithSizeChart}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
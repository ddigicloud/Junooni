// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { listProducts } from "@lib/data/products"
// import { getRegion, listRegions } from "@lib/data/regions"
// import ProductTemplate from "@modules/products/templates"
// import JsonLd from "../../components/JsonLd"

// type Props = {
//   params: Promise<{ countryCode: string; handle: string }>
// }

// export async function generateStaticParams() {
//   try {
//     const countryCodes = await listRegions().then((regions) =>
//       regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
//     )

//     if (!countryCodes) return []

//     const products = await listProducts({
//       countryCode: "US",
//       queryParams: { fields: "handle" },
//     }).then(({ response }) => response.products)

//     return countryCodes
//       .map((countryCode) =>
//         products.map((product) => ({ countryCode, handle: product.handle }))
//       )
//       .flat()
//       .filter((param) => param.handle)
//   } catch (error) {
//     console.error(
//       `Failed to generate static paths for product pages: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }.`
//     )
//     return []
//   }
// }

// // ── Helpers ────────────────────────────────────────────────────────────────

// const stripHtml = (html: string | null | undefined, fallback: string) =>
//   html ? html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || fallback : fallback

// // Medusa v2 returns prices in smallest unit (paisa for INR) — divide by 100
// const toMajorUnit = (amount: number | null | undefined) =>
//   amount != null ? amount / 100 : undefined

// // One year from today for priceValidUntil
// const priceValidUntil = () =>
//   new Date(new Date().setFullYear(new Date().getFullYear() + 1))
//     .toISOString()
//     .split("T")[0]

// // FIX: robust stock check — mirrors the storefront's own logic.
// // The flat `variant.inventory_quantity` field is not reliable on its own:
// // it ignores manage_inventory / allow_backorder, and doesn't reflect the
// // same location-level stock the storefront's buy button actually checks.
// // NOTE: requires `fields` to expand
// // `+variants.manage_inventory,+variants.allow_backorder,
// //  +variants.inventory_items.inventory.location_levels.stocked_quantity,
// //  +variants.inventory_items.inventory.location_levels.reserved_quantity`
// // If your `listProducts` fields string doesn't include these yet, add them —
// // otherwise this falls back to treating everything as in stock.
// const isVariantInStock = (v: any): boolean => {
//   if (v.manage_inventory === false) return true
//   if (v.allow_backorder) return true

//   const levels = v.inventory_items?.flatMap(
//     (ii: any) => ii.inventory?.location_levels ?? []
//   )

//   if (!levels || levels.length === 0) {
//     // No location-level data available — fall back to inventory_quantity if present,
//     // otherwise assume in stock rather than wrongly flagging OutOfStock.
//     return v.inventory_quantity == null || v.inventory_quantity > 0
//   }

//   const available = levels.reduce(
//     (sum: number, ll: any) =>
//       sum + ((ll.stocked_quantity ?? 0) - (ll.reserved_quantity ?? 0)),
//     0
//   )

//   return available > 0
// }

// // ── generateMetadata ───────────────────────────────────────────────────────

// export async function generateMetadata(props: Props): Promise<Metadata> {
//   const params = await props.params
//   const { handle, countryCode } = params
//   const region = await getRegion(countryCode)

//   if (!region) notFound()

//   const product = await listProducts({
//     countryCode,
//     queryParams: { handle },
//   }).then(({ response }) => response.products[0])

//   if (!product) notFound()

//   const description = stripHtml(
//     product.description,
//     `Buy ${product.title} — exclusive creator merchandise on Junooni. Official merch, pan-India shipping.`
//   )

//   const creatorName =
//     (product as any).vendor?.name ??
//     (product as any).brand ??
//     null

//   const firstVariant = product.variants?.[0]
//   const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)

//   // FIX: use the actual countryCode instead of hardcoding "in"
//   const canonicalUrl = `https://junooni.com/${countryCode}/products/${handle}`

//   return {
//     title: `${product.title} | Junooni`,
//     description,
//     keywords: [
//       product.title,
//       ...(creatorName ? [`${creatorName} merch`, `${creatorName} merchandise`] : []),
//       "official creator merch India",
//       "creator merchandise",
//       "Junooni",
//     ],
//     alternates: {
//       canonical: canonicalUrl,
//     },
//     openGraph: {
//       // NOTE: Open Graph's spec supports type: "product", but Next.js's
//       // metadata resolver validates this against its own internal enum
//       // (website/article/book/profile/etc) and throws at runtime for
//       // anything outside it — "as any" only fools TypeScript, not Next's
//       // resolver. There's no supported way to emit og:type=product through
//       // the Metadata API, so we leave it as the default ("website").
//       // Facebook/WhatsApp scrapers generally still read product:price:*
//       // from `other` below even without a strict og:type=product.
//       title: `${product.title} | Junooni`,
//       description,
//       images: product.thumbnail ? [product.thumbnail] : [],
//       url: canonicalUrl,
//       siteName: "Junooni",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${product.title} | Junooni`,
//       description,
//       images: product.thumbnail ? [product.thumbnail] : [],
//     },
//     // FIX: label1/data1/label2/data2 aren't part of Next's twitter metadata
//     // schema and get silently dropped even with `as any` — Next's serializer
//     // only emits recognized fields. Custom twitter:label/data tags and the
//     // Facebook/WhatsApp product:price:* tags both belong here in `other`,
//     // which Next passes through verbatim as raw <meta> tags.
//     other: {
//       ...(price != null && {
//         "product:price:amount": price.toString(),
//         "product:price:currency": "INR",
//       }),
//       "twitter:label1": "Price",
//       "twitter:data1": price ? `₹${price}` : "Check price on Junooni",
//       "twitter:label2": "Ships to",
//       "twitter:data2": "Pan India",
//     },
//   }
// }

// // ── Page ───────────────────────────────────────────────────────────────────

// export default async function ProductPage(props: Props) {
//   const params = await props.params
//   const region = await getRegion(params.countryCode)

//   if (!region) notFound()

//   const pricedProduct = await listProducts({
//     countryCode: params.countryCode,
//     queryParams: { handle: params.handle },
//   }).then(({ response }) => response.products[0])

//   if (!pricedProduct) notFound()

//   // ── Images ────────────────────────────────────────────────────────────────
//   const images: string[] = []
//   if (pricedProduct.thumbnail) images.push(pricedProduct.thumbnail)
//   pricedProduct.images?.forEach((img: any) => {
//     if (img.url && !images.includes(img.url)) images.push(img.url)
//   })

//   // ── Price — divide by 100 (Medusa stores in paisa) ────────────────────────
//   const firstVariant = pricedProduct.variants?.[0]
//   const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)
//   const currencyCode =
//     firstVariant?.calculated_price?.currency_code?.toUpperCase() ?? "INR"

//   // ── Availability ──────────────────────────────────────────────────────────
//   // FIX: was `v.inventory_quantity == null || v.inventory_quantity > 0`,
//   // which ignored manage_inventory/allow_backorder and could disagree with
//   // what the storefront buy button actually shows. See isVariantInStock().
//   const inStock =
//     pricedProduct.variants?.some((v: any) => isVariantInStock(v)) ?? true

//   // ── Creator / brand name from vendor ─────────────────────────────────────
//   const creatorName =
//     (pricedProduct as any).vendor?.name ??
//     (pricedProduct as any).brand ??
//     "Junooni"

//   // FIX: use the actual countryCode instead of hardcoding "in" everywhere below
//   const countryCode = params.countryCode
//   const productUrl = `https://junooni.com/${countryCode}/products/${pricedProduct.handle}`

//   // ── Product schema ────────────────────────────────────────────────────────
//   const productSchema: Record<string, any> = {
//     "@context": "https://schema.org",
//     "@type": "Product",
//     name: pricedProduct.title,
//     description: stripHtml(
//       pricedProduct.description,
//       `Buy ${pricedProduct.title} — exclusive creator merchandise on Junooni.`
//     ),
//     image: images.length > 0 ? images : undefined,
//     // FIX: use variant SKU, not product UUID
//     sku: firstVariant?.sku ?? pricedProduct.id,
//     // FIX: brand = creator name, not Junooni
//     brand: {
//       "@type": "Brand",
//       name: creatorName,
//     },
//     offers: {
//       "@type": "Offer",
//       url: productUrl,
//       priceCurrency: currencyCode,
//       // FIX: price in major unit (rupees), not paisa
//       ...(price != null ? { price } : {}),
//       // ADDED: required for rich result eligibility
//       priceValidUntil: priceValidUntil(),
//       // ADDED: explicit new condition
//       itemCondition: "https://schema.org/NewCondition",
//       availability: inStock
//         ? "https://schema.org/InStock"
//         : "https://schema.org/OutOfStock",
//       seller: {
//         "@type": "Organization",
//         name: "Junooni",
//         url: "https://junooni.com",
//       },
//     },
//   }

//   // ── Breadcrumb schema — Home → Category → Product ─────────────────────────
//   const category = (pricedProduct as any).categories?.[0]

//   const breadcrumbItems = [
//     {
//       "@type": "ListItem",
//       position: 1,
//       name: "Home",
//       item: `https://junooni.com/${countryCode}`,
//     },
//     category
//       ? {
//           "@type": "ListItem",
//           position: 2,
//           name: category.name,
//           item: `https://junooni.com/${countryCode}/categories/${category.handle}`,
//         }
//       : {
//           "@type": "ListItem",
//           position: 2,
//           name: "Store",
//           item: `https://junooni.com/${countryCode}/store`,
//         },
//     {
//       "@type": "ListItem",
//       position: 3,
//       name: pricedProduct.title,
//       item: productUrl,
//     },
//   ]

//   const breadcrumbSchema = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: breadcrumbItems,
//   }

//   return (
//     <>
//       <JsonLd data={productSchema} />
//       <JsonLd data={breadcrumbSchema} />
//       <ProductTemplate
//         product={pricedProduct}
//         region={region}
//         countryCode={params.countryCode}
//       />
//     </>
//   )
// }





import { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import JsonLd from "../../components/JsonLd"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// ── PDP fields — surgically minimal, every field justified ─────────────────
// NO *size_chart — not rendered anywhere in ProductTemplate
// NO wildcards — all explicit dot-notation
const PDP_FIELDS = [
  "+images.url",
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
  "+options.title",
  "+options.values.value",
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

// ── React.cache — one network request shared by generateMetadata + ProductPage
const getProduct = cache(async (handle: string, countryCode: string) => {
  console.log(`[PDP] getProduct START | handle=${handle} | countryCode=${countryCode}`)
  const t0 = Date.now()

  const product = await listProducts({
    countryCode,
    queryParams: { handle, fields: PDP_FIELDS },
  }).then(({ response }) => response.products[0])

  const ms = Date.now() - t0
  if (product) {
    console.log(`[PDP] getProduct DONE | handle=${handle} | ${ms}ms | found=true`)
  } else {
    console.warn(`[PDP] getProduct DONE | handle=${handle} | ${ms}ms | found=false`)
  }

  return product
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

  const available = levels.reduce(
    (sum: number, ll: any) =>
      sum + ((ll.stocked_quantity ?? 0) - (ll.reserved_quantity ?? 0)),
    0
  )
  return available > 0
}

// ── generateStaticParams ───────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )
    if (!countryCodes) return []

    const products = await listProducts({
      countryCode: "US",
      queryParams: { fields: "handle" },
    }).then(({ response }) => response.products)

    return countryCodes
      .map((countryCode) =>
        products.map((product) => ({ countryCode, handle: product.handle }))
      )
      .flat()
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `[PDP] generateStaticParams FAILED: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    return []
  }
}

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params

  console.log(`[PDP] generateMetadata START | handle=${handle}`)
  const t0 = Date.now()

  const region = await getRegion(countryCode)
  if (!region) notFound()

  // React.cache — no extra fetch if ProductPage already called this
  const product = await getProduct(handle, countryCode)
  if (!product) notFound()

  console.log(`[PDP] generateMetadata DONE | handle=${handle} | ${Date.now() - t0}ms`)

  const description = stripHtml(
    product.description,
    `Buy ${product.title} — exclusive creator merchandise on Junooni. Official merch, pan-India shipping.`
  )

  const creatorName =
    (product as any).vendor?.name ?? (product as any).brand ?? null

  const firstVariant = product.variants?.[0]
  const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)
  const canonicalUrl = `https://junooni.com/${countryCode}/products/${handle}`

  return {
    title: `${product.title} | Junooni`,
    description,
    keywords: [
      product.title,
      ...(creatorName
        ? [`${creatorName} merch`, `${creatorName} merchandise`]
        : []),
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

  // React.cache — returns same result as generateMetadata, zero extra fetch
  const pricedProduct = await getProduct(params.handle, params.countryCode)
  if (!pricedProduct) notFound()

  console.log(`[PDP] ProductPage RENDER | handle=${params.handle} | ${Date.now() - t0}ms | variants=${pricedProduct.variants?.length} | images=${pricedProduct.images?.length}`)

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
  const inStock =
    pricedProduct.variants?.some((v: any) => isVariantInStock(v)) ?? true

  // ── Creator ───────────────────────────────────────────────────────────────
  const creatorName =
    (pricedProduct as any).vendor?.name ??
    (pricedProduct as any).brand ??
    "Junooni"

  const countryCode = params.countryCode
  const productUrl = `https://junooni.com/${countryCode}/products/${pricedProduct.handle}`

  // ── Product JSON-LD ───────────────────────────────────────────────────────
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
      seller: {
        "@type": "Organization",
        name: "Junooni",
        url: "https://junooni.com",
      },
    },
  }

  // ── Breadcrumb JSON-LD ────────────────────────────────────────────────────
  const category = (pricedProduct as any).categories?.[0]
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://junooni.com/${countryCode}`,
      },
      category
        ? {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: `https://junooni.com/${countryCode}/categories/${category.handle}`,
          }
        : {
            "@type": "ListItem",
            position: 2,
            name: "Store",
            item: `https://junooni.com/${countryCode}/store`,
          },
      {
        "@type": "ListItem",
        position: 3,
        name: pricedProduct.title,
        item: productUrl,
      },
    ],
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
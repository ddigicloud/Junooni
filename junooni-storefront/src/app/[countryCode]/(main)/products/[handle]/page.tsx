import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import JsonLd from "../../components/JsonLd"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

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
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const stripHtml = (html: string | null | undefined, fallback: string) =>
  html ? html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || fallback : fallback

// Medusa v2 returns prices in smallest unit (paisa for INR) — divide by 100
const toMajorUnit = (amount: number | null | undefined) =>
  amount != null ? amount / 100 : undefined

// One year from today for priceValidUntil
const priceValidUntil = () =>
  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split("T")[0]

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) notFound()

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) notFound()

  const description = stripHtml(
    product.description,
    `Buy ${product.title} — exclusive creator merchandise on Junooni. Official merch, pan-India shipping.`
  )

  const creatorName =
    (product as any).vendor?.name ??
    (product as any).brand ??
    null

  const firstVariant = product.variants?.[0]
  const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)

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
    alternates: {
      canonical: `https://junooni.com/in/products/${handle}`,
    },
    openGraph: {
      title: `${product.title} | Junooni`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
      url: `https://junooni.com/in/products/${handle}`,
      siteName: "Junooni",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Junooni`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
      // Show price + shipping info on Twitter/X cards
      label1: "Price",
      data1: price ? `₹${price}` : "Check price on Junooni",
      label2: "Ships to",
      data2: "Pan India",
    } as any, // Next.js types don't expose label/data yet but they render correctly
    // Facebook / WhatsApp product meta tags
    other: {
      ...(price != null && {
        "product:price:amount": price.toString(),
        "product:price:currency": "INR",
      }),
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) notFound()

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) notFound()

  // ── Images ────────────────────────────────────────────────────────────────
  const images: string[] = []
  if (pricedProduct.thumbnail) images.push(pricedProduct.thumbnail)
  pricedProduct.images?.forEach((img: any) => {
    if (img.url && !images.includes(img.url)) images.push(img.url)
  })

  // ── Price — divide by 100 (Medusa stores in paisa) ────────────────────────
  const firstVariant = pricedProduct.variants?.[0]
  const price = toMajorUnit(firstVariant?.calculated_price?.calculated_amount)
  const currencyCode =
    firstVariant?.calculated_price?.currency_code?.toUpperCase() ?? "INR"

  // ── Availability ──────────────────────────────────────────────────────────
  const inStock =
    pricedProduct.variants?.some(
      (v: any) => v.inventory_quantity == null || v.inventory_quantity > 0
    ) ?? true

  // ── Creator / brand name from vendor ─────────────────────────────────────
  const creatorName =
    (pricedProduct as any).vendor?.name ??
    (pricedProduct as any).brand ??
    "Junooni"

  // ── Product schema ────────────────────────────────────────────────────────
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: stripHtml(
      pricedProduct.description,
      `Buy ${pricedProduct.title} — exclusive creator merchandise on Junooni.`
    ),
    image: images.length > 0 ? images : undefined,
    // FIX: use variant SKU, not product UUID
    sku: firstVariant?.sku ?? pricedProduct.id,
    // FIX: brand = creator name, not Junooni
    brand: {
      "@type": "Brand",
      name: creatorName,
    },
    offers: {
      "@type": "Offer",
      url: `https://junooni.com/in/products/${pricedProduct.handle}`,
      priceCurrency: currencyCode,
      // FIX: price in major unit (rupees), not paisa
      ...(price != null ? { price } : {}),
      // ADDED: required for rich result eligibility
      priceValidUntil: priceValidUntil(),
      // ADDED: explicit new condition
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

  // ── Breadcrumb schema — Home → Category → Product ─────────────────────────
  // FIX: use actual product category instead of generic /store
  const category = (pricedProduct as any).categories?.[0]

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://junooni.com/in",
    },
    category
      ? {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `https://junooni.com/in/categories/${category.handle}`,
        }
      : {
          "@type": "ListItem",
          position: 2,
          name: "Store",
          item: "https://junooni.com/in/store",
        },
    {
      "@type": "ListItem",
      position: 3,
      name: pricedProduct.title,
      item: `https://junooni.com/in/products/${pricedProduct.handle}`,
    },
  ]

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
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
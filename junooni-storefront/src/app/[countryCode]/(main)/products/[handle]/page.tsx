// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { listProducts } from "@lib/data/products"
// import { getRegion, listRegions } from "@lib/data/regions"
// import ProductTemplate from "@modules/products/templates"


// type Props = {
//   params: Promise<{ countryCode: string; handle: string }>
// }

// export async function generateStaticParams() {
//   try {
//     const countryCodes = await listRegions().then((regions) =>
//       regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
//     )

//     if (!countryCodes) {
//       return []
//     }

//     const products = await listProducts({
//       countryCode: "US",
//       queryParams: { fields: "handle" },
//     }).then(({ response }) => response.products)

//     return countryCodes
//       .map((countryCode) =>
//         products.map((product) => ({
//           countryCode,
//           handle: product.handle,
//         }))
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

// export async function generateMetadata(props: Props): Promise<Metadata> {
//   const params = await props.params
//   const { handle } = params
//   const region = await getRegion(params.countryCode)

//   if (!region) {
//     notFound()
//   }

//   const product = await listProducts({
//     countryCode: params.countryCode,
//     queryParams: { handle },
//   }).then(({ response }) => response.products[0])

//   if (!product) {
//     notFound()
//   }

//   return {
//     title: `${product.title} | Medusa Store`,
//     description: `${product.title}`,
//     openGraph: {
//       title: `${product.title} | Medusa Store`,
//       description: `${product.title}`,
//       images: product.thumbnail ? [product.thumbnail] : [],
//     },
//   }
// }

// export default async function ProductPage(props: Props) {
//   const params = await props.params
//   const region = await getRegion(params.countryCode)

//   if (!region) {
//     notFound()
//   }

//   const pricedProduct = await listProducts({
//     countryCode: params.countryCode,
//     queryParams: { handle: params.handle },
//   }).then(({ response }) => response.products[0])

//   if (!pricedProduct) {
//     notFound()
//   }



//   return (
//     <ProductTemplate
//       product={pricedProduct}
//       region={region}
//       countryCode={params.countryCode}
   
//     />
//   )
// }


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

    if (!countryCodes) {
      return []
    }

    const products = await listProducts({
      countryCode: "US",
      queryParams: { fields: "handle" },
    }).then(({ response }) => response.products)

    return countryCodes
      .map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
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

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Junooni`,
    description:
      product.description ||
      `Buy ${product.title} — exclusive creator merchandise on Junooni.`,
    openGraph: {
      title: `${product.title} | Junooni`,
      description:
        product.description ||
        `Buy ${product.title} — exclusive creator merchandise on Junooni.`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // ── Gather all product images ──────────────────────────────────────────────
  const images: string[] = []
  if (pricedProduct.thumbnail) images.push(pricedProduct.thumbnail)
  if (pricedProduct.images?.length) {
    pricedProduct.images.forEach((img: any) => {
      if (img.url && !images.includes(img.url)) images.push(img.url)
    })
  }

  // ── Resolve price from first variant ──────────────────────────────────────
  const firstVariant = pricedProduct.variants?.[0]
  const firstPrice = firstVariant?.calculated_price?.calculated_amount
  const currencyCode =
    firstVariant?.calculated_price?.currency_code?.toUpperCase() ?? "INR"

  // ── Availability ──────────────────────────────────────────────────────────
  const inStock =
    pricedProduct.variants?.some(
      (v: any) =>
        v.inventory_quantity == null || v.inventory_quantity > 0
    ) ?? true

  // ── Build Product schema ───────────────────────────────────────────────────
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pricedProduct.title,
    "description":
      pricedProduct.description ||
      `Buy ${pricedProduct.title} — exclusive creator merchandise on Junooni.`,
    "image": images.length > 0 ? images : undefined,
    "sku": pricedProduct.id,
    "brand": {
      "@type": "Brand",
      "name": "Junooni",
    },
    "offers": {
      "@type": "Offer",
      "url": `https://junooni.com/in/products/${pricedProduct.handle}`,
      "priceCurrency": currencyCode,
      ...(firstPrice != null ? { "price": firstPrice } : {}),
      "availability": inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Junooni",
      },
    },
  }

  // ── Breadcrumb schema ──────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://junooni.com/in",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Store",
        "item": "https://junooni.com/in/store",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pricedProduct.title,
        "item": `https://junooni.com/in/products/${pricedProduct.handle}`,
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
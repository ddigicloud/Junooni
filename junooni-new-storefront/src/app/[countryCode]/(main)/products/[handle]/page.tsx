import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { listProducts } from "@lib/data/products"
import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// Create a new function to directly retrieve a product by handle
const retrieveProductByHandle = async ({
  handle,
  countryCode,
}: {
  handle: string
  countryCode: string
}): Promise<HttpTypes.StoreProduct | null> => {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return null
  }
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(`product-handle-${handle}`)),
  }

  try {
    // Use your custom endpoint that filters by handle
    const { product } = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(
      `/store/products/${handle}`, // This hits your custom route
      {
        method: "GET",
        headers,
        next,
        cache: "force-cache"
      }
    )
    
    return product
  } catch (error) {
    console.error(`Failed to retrieve product with handle ${handle}:`, error)
    return null
  }
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

  // Use the direct handle retrieval
  const product = await retrieveProductByHandle({
    handle,
    countryCode: params.countryCode,
  })

  if (!product) {
    notFound()
  }
  
  console.log("Product:", product)
  return {
    title: `${product.title} | Junooni`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
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

  // Use the direct handle retrieval
  const product = await retrieveProductByHandle({
    handle: params.handle,
    countryCode: params.countryCode,
  })
  console.log("Loaded Product:", product)

  if (!product) {
    notFound()
  }

  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={params.countryCode}
    />
  )

}
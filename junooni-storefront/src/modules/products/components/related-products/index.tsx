// import { listProducts } from "@lib/data/products"
// import { getRegion } from "@lib/data/regions"
// import { HttpTypes } from "@medusajs/types"
// import Product from "../product-preview"

// type RelatedProductsProps = {
//   product: HttpTypes.StoreProduct
//   countryCode: string
// }

// export default async function RelatedProducts({
//   product,
//   countryCode,
// }: RelatedProductsProps) {
//   const region = await getRegion(countryCode)

//   if (!region) {
//     return null
//   }

//   // edit this function to define your related products logic
//   const queryParams: HttpTypes.StoreProductParams = {}
//   if (region?.id) {
//     queryParams.region_id = region.id
//   }
//   if (product.collection_id) {
//     queryParams.collection_id = [product.collection_id]
//   }
//   if (product.tags) {
//     queryParams.tag_id = product.tags
//       .map((t) => t.id)
//       .filter(Boolean) as string[]
//   }
//   queryParams.is_giftcard = false

//   const products = await listProducts({
//     queryParams,
//     countryCode,
//   }).then(({ response }) => {
//     return response.products.filter(
//       (responseProduct) => responseProduct.id !== product.id
//     )
//   })

//   if (!products.length) {
//     return null
//   }

//   return (
//     <div className="product-page-constraint">
//       <div className="flex flex-col items-center mb-16 text-center">
//         <span className="mb-6 text-gray-600 text-base-regular">
//           Related products
//         </span>
//         <p className="max-w-lg text-2xl-regular text-ui-fg-base">
//           You might also want to check out these products.
//         </p>
//       </div>

//       <ul className="grid grid-cols-2 px-2 small:px-6 small:grid-cols-3 medium:grid-cols-4 gap-x-2 gap-y-4 small:gap-x-6 small:gap-y-8">
//         {products.map((product) => (
//           <li key={product.id}>
//             <Product region={region} 
//             product={product} reviewData={{ averageRating: 0, reviewCount: 0, isLoading: false }}/>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }




import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

// Lean fields — no size_chart, no wildcard expands, just enough for a card
const RELATED_PRODUCTS_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "*variants.calculated_price",
  "+variants.id",
  "+variants.options.value",
  "+variants.options.option.title",
  "vendor.id",
  "vendor.name",
  "vendor.handle",
  "vendor.verified",
  "categories.id",
  "categories.name",
  "categories.handle",
  "+metadata.color_hex_values",
].join(",")

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  console.log(
    `[RelatedProducts] START | product_id=${product.id} | collection_id=${product.collection_id} | tags=${product.tags?.length ?? 0}`
  )
  const t0 = Date.now()

  const region = await getRegion(countryCode)
  if (!region) {
    console.warn(`[RelatedProducts] No region for countryCode=${countryCode}`)
    return null
  }

  // Use Record<string, any> — Medusa's StoreProductParams TS types are
  // incomplete and don't declare is_giftcard / collection_id / tag_id,
  // but they all work correctly at runtime via the query string.
  const queryParams: Record<string, any> = {
    is_giftcard: false,
    limit: 4,
    fields: RELATED_PRODUCTS_FIELDS,
    region_id: region.id,
  }

  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }

  if (product.tags?.length) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean)
  }

  console.log(
    `[RelatedProducts] QUERY | collection=${queryParams.collection_id} | tags=${queryParams.tag_id?.length ?? 0} | limit=${queryParams.limit}`
  )

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    const filtered = response.products.filter((p) => p.id !== product.id)
    console.log(
      `[RelatedProducts] DONE | ${Date.now() - t0}ms | raw=${response.products.length} | after_filter=${filtered.length}`
    )
    return filtered
  })

  if (!products.length) {
    console.log(`[RelatedProducts] EMPTY — rendering null`)
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="mb-6 text-gray-600 text-base-regular">
          Related products
        </span>
        <p className="max-w-lg text-2xl-regular text-ui-fg-base">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 px-2 small:px-6 small:grid-cols-3 medium:grid-cols-4 gap-x-2 gap-y-4 small:gap-x-6 small:gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <Product
              region={region}
              product={product}
              reviewData={{ averageRating: 0, reviewCount: 0, isLoading: false }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
// // import { listProducts } from "@lib/data/products"
// // import { HttpTypes } from "@medusajs/types"
// // import ProductActions from "@modules/products/components/product-actions"

// // /**
// //  * Fetches real time pricing for a product and renders the product actions component.
// //  */
// // export default async function ProductActionsWrapper({
// //   id,
// //   region,
// // }: {
// //   id: string
// //   region: HttpTypes.StoreRegion
// // }) {
// //   const product = await listProducts({
// //     queryParams: { id: [id] },
// //     regionId: region.id,
// //   }).then(({ response }) => response.products[0])

// //   if (!product) {
// //     return null
// //   }

// //   return <ProductActions product={product} region={region} />
// // }


// import { listProducts } from "@lib/data/products"
// import { HttpTypes } from "@medusajs/types"
// import ProductActions from "@modules/products/components/product-actions"

// /**
//  * Fetches real time pricing for a product and renders the product actions component.
//  */
// export default async function ProductActionsWrapper({
//   id,
//   region,
//   onOptionUpdate,
//   selectedOptions,
// }: {
//   id: string
//   region: HttpTypes.StoreRegion
//   onOptionUpdate?: (optionId: string, value: string, metadata?: Record<string, any>) => void
//   selectedOptions?: Record<string, string>
// }) {
//   const product = await listProducts({
//     queryParams: { id: [id] },
//     regionId: region.id,
//   }).then(({ response }) => response.products[0])

//   if (!product) {
//     return null
//   }

//   return (
//     <ProductActions 
//       product={product} 
//       region={region} 
//       onOptionUpdate={onOptionUpdate}
//       selectedOptions={selectedOptions}
//     />
//   )
// }






"use server"

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

// Only what ProductActions needs — no size_chart, no vendor, no categories
const PRODUCT_ACTIONS_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "*variants.calculated_price",
  "+variants.id",
  "+variants.title",
  "+variants.sku",
  "+variants.inventory_quantity",
  "+variants.manage_inventory",
  "+variants.allow_backorder",
  "+variants.options.id",
  "+variants.options.value",
  "+variants.options.option_id",
  "+variants.options.option.id",
  "+variants.options.option.title",
  "+variants.inventory_items.inventory.location_levels.stocked_quantity",
  "+variants.inventory_items.inventory.location_levels.reserved_quantity",
  "+options.id",
  "+options.title",
  "+options.values.id",
  "+options.values.value",
  "+metadata",
].join(",")

export default async function ProductActionsWrapper({
  id,
  region,
  onOptionUpdate,
  selectedOptions,
}: {
  id: string
  region: HttpTypes.StoreRegion
  onOptionUpdate?: (optionId: string, value: string, metadata?: Record<string, any>) => void
  selectedOptions?: Record<string, string>
}) {
  console.log(`[ProductActionsWrapper] START | product_id=${id}`)
  const t0 = Date.now()

  const product = await listProducts({
    queryParams: {
      id: [id],
      fields: PRODUCT_ACTIONS_FIELDS,
    },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  console.log(
    `[ProductActionsWrapper] DONE | product_id=${id} | ${Date.now() - t0}ms | found=${!!product} | variants=${product?.variants?.length ?? 0}`
  )

  if (!product) return null

  return (
    <ProductActions
      product={product}
      region={region}
      onOptionUpdate={onOptionUpdate}
      selectedOptions={selectedOptions}
    />
  )
}
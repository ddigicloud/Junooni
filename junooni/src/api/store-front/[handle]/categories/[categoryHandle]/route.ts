// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// const CREATOR_STORE_SC =
//   process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { handle, categoryHandle } = req.params
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

//   // ── 1. Minimal vendor lookup ────────────────────────────────────────────
//   let vendor: any = null
//   let vendorStore: any = null

//   try {
//     const { data } = await query.graph({
//       entity: "vendor",
//       fields: [
//         "id",
//         "sell_on_own_store",
//         "vendor_store.collections",
//         "vendor_store.settings",
//       ],
//       filters: { handle },
//     })
//     vendor = data?.[0] ?? null
//     vendorStore = vendor?.vendor_store ?? null
//     if (vendorStore?.settings) {
//       vendorStore = { ...vendorStore, ...vendorStore.settings }
//     }
//   } catch (err) {
//     console.error(`[category-detail-route] vendor lookup failed:`, err)
//   }

//   if (!vendor) {
//     throw new MedusaError(
//       MedusaError.Types.NOT_FOUND,
//       `No creator found with handle "${handle}"`
//     )
//   }

//   if (!vendor.sell_on_own_store) {
//     throw new MedusaError(
//       MedusaError.Types.NOT_ALLOWED,
//       "This creator does not have an own store enabled"
//     )
//   }

//   // ── 2. Fetch products filtered by this category handle ──────────────────
//   // Two parallel queries:
//   // a) products IN this category — full fields for the grid
//   // b) all categories for sidebar — minimal fields
//   let catProducts: any[] = []
//   let allProducts: any[] = []
//   const t1 = Date.now()

//   try {
//     // Products in this specific category — full card fields
//     const { data: indexed } = await query.index({
//       entity: "product",
//       fields: [
//         "id",
//         "title",
//         "handle",
//         "thumbnail",
//         "status",
//         "description",
//         "variants.id",
//         "variants.title",
//         "variants.prices.id",
//         "variants.prices.amount",
//         "variants.prices.currency_code",
//         "images.id",
//         "images.url",
//         "options.id",
//         "options.title",
//         "options.values.id",
//         "options.values.value",
//         "categories.id",
//         "categories.name",
//         "categories.handle",
//       ],
//       filters: {
//         status: "published",
//         sales_channels: { id: [CREATOR_STORE_SC] },
//         vendor: { id: [vendor.id] },
//         categories: { handle: categoryHandle },  // ← filter at DB level, not in JS
//       },
//       pagination: {
//         take: 200,
//         skip: 0,
//         order: { created_at: "DESC" },
//       },
//     })

//     catProducts = (indexed ?? []).map((p: any) => ({
//       ...p,
//       variants: (p.variants ?? []).map((v: any) => ({
//         ...v,
//         inventory_quantity: 10,
//       })),
//     }))

//     // All products minimal — needed for sidebar category counts
//     const { data: allIndexed } = await query.index({
//       entity: "product",
//       fields: [
//         "id",
//         "categories.id",
//         "categories.name",
//         "categories.handle",
//       ],
//       filters: {
//         status: "published",
//         sales_channels: { id: [CREATOR_STORE_SC] },
//         vendor: { id: [vendor.id] },
//       },
//       pagination: { take: 200, skip: 0, order: { created_at: "DESC" } },
//     })

//     allProducts = allIndexed ?? []

//     console.log(
//       `[category-detail-route] handle=${handle} category=${categoryHandle} ` +
//       `catProducts=${catProducts.length} allProducts=${allProducts.length} in ${Date.now() - t1}ms`
//     )
//   } catch (err) {
//     console.error(`[category-detail-route] query.index failed:`, err)
//   }

//   // ── 3. Find the category object from catProducts ─────────────────────────
//   // It will be in every product's categories array
//   let category: any = null
//   for (const p of catProducts) {
//     const found = (p.categories ?? []).find((c: any) => c.handle === categoryHandle)
//     if (found) { category = found; break }
//   }

//   if (!category) {
//     // Category exists in Medusa but vendor has no products in it
//     // Return empty rather than 404 so the page can show "no products"
//     category = { handle: categoryHandle, name: categoryHandle, id: "" }
//   }

//   // ── 4. All categories with counts — from allProducts ─────────────────────
//   const categoriesMap = new Map<string, any>()
//   for (const product of allProducts) {
//     for (const cat of product.categories ?? []) {
//       if (!categoriesMap.has(cat.id)) {
//         categoriesMap.set(cat.id, { ...cat, product_count: 0 })
//       }
//       categoriesMap.get(cat.id).product_count++
//     }
//   }

//   // ── 5. Collections from vendor_store ─────────────────────────────────────
//   const productMap = new Map(allProducts.map((p: any) => [p.id, p]))
//   const rawCollections: any[] = vendorStore?.collections?.collections ?? []
//   const collections = rawCollections
//     .filter((c: any) => c.is_visible !== false)
//     .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
//     .map((c: any) => ({
//       ...c,
//       product_count: (c.product_ids ?? []).filter((id: string) =>
//         productMap.has(id)
//       ).length,
//     }))

//   return res.json({
//     category,
//     products: catProducts,      // only products in this category — for the grid
//     categories: Array.from(categoriesMap.values()),  // all — for sidebar
//     collections,
//   })
// }

// src/api/store-front/[handle]/categories/[categoryHandle]/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC =
  process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle, categoryHandle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Minimal vendor lookup ────────────────────────────────────────────
  let vendor: any = null
  let vendorStore: any = null

  try {
    const { data } = await query.graph({
      entity: "vendor",
      fields: [
        "id",
        "sell_on_own_store",
        "vendor_store.collections",
        "vendor_store.settings",
      ],
      filters: { handle },
    })
    vendor = data?.[0] ?? null
    vendorStore = vendor?.vendor_store ?? null
    if (vendorStore?.settings) {
      vendorStore = { ...vendorStore, ...vendorStore.settings }
    }
  } catch (err) {
    console.error(`[category-detail-route] vendor lookup failed:`, err)
  }

  if (!vendor) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }
  if (!vendor.sell_on_own_store) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
  }

  // ── 2. Fetch ALL vendor products — filter by category in JS ────────────
  // query.index does NOT support filtering on nested relations like
  // categories.handle — "product.categories is not indexed" error.
  // Fetch all products for this vendor, then JS-filter.
  let allProducts: any[] = []
  const t1 = Date.now()

  try {
    const { data: indexed } = await query.index({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "description",
        "variants.id",
        "variants.title",
        "variants.prices.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "images.id",
        "images.url",
        "options.id",
        "options.title",
        "options.values.id",
        "options.values.value",
        "categories.id",
        "categories.name",
        "categories.handle",
      ],
      filters: {
        status: "published",
        sales_channels: { id: [CREATOR_STORE_SC] },
        vendor: { id: [vendor.id] },
        // ← NO categories filter here — not supported by query.index
      },
      pagination: {
        take: 200,
        skip: 0,
        order: { created_at: "DESC" },
      },
    })

    allProducts = (indexed ?? []).map((p: any) => ({
      ...p,
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        inventory_quantity: 10,
      })),
    }))

    console.log(
      `[category-detail-route] handle=${handle} allProducts=${allProducts.length} in ${Date.now() - t1}ms`
    )
  } catch (err) {
    console.error(`[category-detail-route] query.index failed:`, err)
  }

  // ── 3. JS filter — products in this category ────────────────────────────
  const catProducts = allProducts.filter((p: any) =>
    (p.categories ?? []).some((c: any) => c.handle === categoryHandle)
  )

  // ── 4. Find the category object ─────────────────────────────────────────
  let category: any = null
  for (const p of catProducts) {
    const found = (p.categories ?? []).find((c: any) => c.handle === categoryHandle)
    if (found) { category = found; break }
  }

  if (!category) {
    // categoryHandle doesn't match any product — real 404
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No category found with handle "${categoryHandle}"`
    )
  }

  // ── 5. All categories with counts — from allProducts ────────────────────
  const categoriesMap = new Map<string, any>()
  for (const product of allProducts) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, product_count: 0 })
      }
      categoriesMap.get(cat.id).product_count++
    }
  }

  // ── 6. Collections ───────────────────────────────────────────────────────
  const productMap = new Map(allProducts.map((p: any) => [p.id, p]))
  const rawCollections: any[] = vendorStore?.collections?.collections ?? []
  const collections = rawCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => ({
      ...c,
      product_count: (c.product_ids ?? []).filter((id: string) =>
        productMap.has(id)
      ).length,
    }))

  console.log(
    `[category-detail-route] category="${categoryHandle}" catProducts=${catProducts.length} DONE in ${Date.now() - t1}ms`
  )

  return res.json({
    category,
    products: catProducts,
    categories: Array.from(categoriesMap.values()),
    collections,
  })
}
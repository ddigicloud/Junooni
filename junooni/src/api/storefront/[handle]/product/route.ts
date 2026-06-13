// // src/api/store-front/[handle]/products/route.ts

// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// const CREATOR_STORE_SC =
//   process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

// const PAGE_SIZE = 48

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { handle } = req.params
//   const page = Math.max(1, parseInt((req.query.page as string) ?? "1"))
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

//   // ── 1. Minimal vendor lookup — only what we need for filtering ──────────
//   let vendor: any = null

//   try {
//     const { data } = await query.graph({
//       entity: "vendor",
//       fields: ["id", "sell_on_own_store"],
//       filters: { handle },
//     })
//     vendor = data?.[0] ?? null
//   } catch (err) {
//     console.error(`[products-route] vendor lookup failed for handle="${handle}":`, err)
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

//   // ── 2. Products-only query — no vendor_store graph join ─────────────────
//   let products: any[] = []
//   let total = 0
//   const t1 = Date.now()

//   try {
//     const offset = (page - 1) * PAGE_SIZE

//     const { data: indexed, metadata } = await query.index({
//       entity: "product",
//       fields: [
//         "id",
//         "title",
//         "handle",
//         "thumbnail",
//         "status",
//         "metadata",
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
//       },
//       pagination: {
//         take: PAGE_SIZE,
//         skip: offset,
//         order: { created_at: "DESC" },
//       },
//     })

//     total = metadata?.count ?? 0

//     // Fake inventory so storefront doesn't show everything as sold-out
//     products = (indexed ?? []).map((p: any) => ({
//       ...p,
//       variants: (p.variants ?? []).map((v: any) => ({
//         ...v,
//         inventory_quantity: 10,
//       })),
//     }))

//     console.log(
//       `[products-route] handle=${handle} page=${page} got=${products.length}/${total} in ${Date.now() - t1}ms`
//     )
//   } catch (err) {
//     console.error(`[products-route] query.index failed for handle="${handle}":`, err)
//     // Return empty rather than crashing — storefront can show empty state
//     return res.json({
//       products: [],
//       categories: [],
//       pagination: { page, total: 0, totalPages: 0, hasMore: false },
//     })
//   }

//   // ── 3. Derive categories from returned products (no extra DB call) ───────
//   const categoriesMap = new Map<string, any>()
//   for (const product of products) {
//     for (const cat of product.categories ?? []) {
//       if (!categoriesMap.has(cat.id)) {
//         categoriesMap.set(cat.id, { ...cat, product_count: 0 })
//       }
//       categoriesMap.get(cat.id).product_count++
//     }
//   }

//   return res.json({
//     products,
//     categories: Array.from(categoriesMap.values()),
//     pagination: {
//       page,
//       total,
//       totalPages: Math.ceil(total / PAGE_SIZE),
//       hasMore: page < Math.ceil(total / PAGE_SIZE),
//     },
//   })
// }

// src/api/store-front/[handle]/products/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC =
  process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

const PAGE_SIZE = 48

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1"))
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const t0 = Date.now()
  console.log(`[products-route] START handle=${handle} page=${page}`)

  // ── 1. Minimal vendor lookup ──────────────────────────────────────────
  let vendor: any = null

  try {
    console.log(`[products-route] vendor lookup START at +${Date.now() - t0}ms`)
    const { data } = await query.graph({
      entity: "vendor",
      fields: ["id", "sell_on_own_store"],
      filters: { handle },
    })
    vendor = data?.[0] ?? null
    console.log(`[products-route] vendor lookup DONE at +${Date.now() - t0}ms, vendor.id=${vendor?.id}`)
  } catch (err) {
    console.error(`[products-route] vendor lookup FAILED at +${Date.now() - t0}ms:`, err)
  }

  if (!vendor) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No creator found with handle "${handle}"`
    )
  }

  if (!vendor.sell_on_own_store) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This creator does not have an own store enabled"
    )
  }

  // ── 2. Products-only query ───────────────────────────────────────────
  let products: any[] = []
  let total = 0

  try {
    const offset = (page - 1) * PAGE_SIZE

    console.log(`[products-route] query.index START at +${Date.now() - t0}ms (vendor.id=${vendor.id}, sc=${CREATOR_STORE_SC})`)

    const { data: indexed, metadata } = await query.index({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "metadata",
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
      },
      pagination: {
        take: PAGE_SIZE,
        skip: offset,
        order: { created_at: "DESC" },
      },
    })

    console.log(`[products-route] query.index DONE at +${Date.now() - t0}ms, rows=${indexed?.length ?? 0}, metadata.count=${metadata?.count}`)

    total = metadata?.count ?? 0

    console.log(`[products-route] mapping/inventory-fake START at +${Date.now() - t0}ms`)
    products = (indexed ?? []).map((p: any) => ({
      ...p,
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        inventory_quantity: 10,
      })),
    }))
    console.log(`[products-route] mapping/inventory-fake DONE at +${Date.now() - t0}ms`)

  } catch (err) {
    console.error(`[products-route] query.index FAILED at +${Date.now() - t0}ms:`, err)
    return res.json({
      products: [],
      categories: [],
      pagination: { page, total: 0, totalPages: 0, hasMore: false },
    })
  }

  // ── 3. Derive categories ─────────────────────────────────────────────
  console.log(`[products-route] categoriesMap START at +${Date.now() - t0}ms`)
  const categoriesMap = new Map<string, any>()
  for (const product of products) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, product_count: 0 })
      }
      categoriesMap.get(cat.id).product_count++
    }
  }
  console.log(`[products-route] categoriesMap DONE at +${Date.now() - t0}ms`)

  const response = {
    products,
    categories: Array.from(categoriesMap.values()),
    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
      hasMore: page < Math.ceil(total / PAGE_SIZE),
    },
  }

  console.log(`[products-route] SENDING RESPONSE at +${Date.now() - t0}ms`)
  return res.json(response)
}
// "use server"

// import { sdk } from "@lib/config"
// import { sortProducts } from "@lib/util/sort-products"
// import { HttpTypes } from "@medusajs/types"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import { getAuthHeaders, getCacheOptions } from "./cookies"
// import { getRegion, retrieveRegion } from "./regions"
// import { StoreProductReview } from "types/global"

// export const listProducts = async ({
//   pageParam = 1,
//   queryParams,
//   countryCode,
//   regionId,
// }: {
//   pageParam?: number
//   queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
//   countryCode?: string
//   regionId?: string
// }): Promise<{
//   response: { products: HttpTypes.StoreProduct[]; count: number }
//   nextPage: number | null
//   queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
// }> => {
//   if (!countryCode && !regionId) {
//     throw new Error("Country code or region ID is required")
//   }

//   const limit = queryParams?.limit || 12
//   const _pageParam = Math.max(pageParam, 1)
//   const offset = (_pageParam - 1) * limit

//   let region: HttpTypes.StoreRegion | undefined | null

//   if (countryCode) {
//     region = await getRegion(countryCode)
//   } else {
//     region = await retrieveRegion(regionId!)
//   }

//   if (!region) {
//     return {
//       response: { products: [], count: 0 },
//       nextPage: null,
//     }
//   }

//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   const next = {
//     ...(await getCacheOptions("products")),
//   }

//   return sdk.client
//     .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
//       `/store/products`,
//       {
//         method: "GET",
//         query: {
//           limit,
//           offset,
//           region_id: region?.id,
//           fields:
//             "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*vendor,*categories,*collection,*size_chart",
//           ...queryParams,
//         },
//         headers,
//         next
//         // cache: "force-cache"
//       }
//     )
//     .then(({ products, count }) => {
//       const nextPage = count > offset + limit ? pageParam + 1 : null

//       return {
//         response: {
//           products,
//           count,
//         },
//         nextPage: nextPage,
//         queryParams,
//       }
//     })
// }

// // Lean fields for store listing only — no size_chart, no tags
// // const STORE_LIST_FIELDS =
// //   "*variants.calculated_price,+metadata,*vendor,*categories,*collection"

// const STORE_LIST_FIELDS = [
//   "id",
//   "title", 
//   "handle",
//   "thumbnail",
//   "created_at",
//   "+metadata.color_hex_values",
//   "+tags.id",
//   "+tags.value",
//   "vendor.id",
//   "vendor.name",
//   "vendor.handle",
//   "vendor.verified",
//   "categories.id",
//   "categories.name",
//   "categories.handle",
//   "collection.id",
//   "collection.title",
//   "collection.handle",
//   "+variants.id",
//   "+variants.thumbnail",
//   "+variants.options.value",
//   "+variants.options.option.title",
//   // "*variants.calculated_price",
// ].join(",")

// export const listProductsForStore = async ({
//   offset = 0,
//   limit = 50,
//   countryCode,
// }: {
//   offset?: number
//   limit?: number
//   countryCode: string
// }): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
//   const region = await getRegion(countryCode)
//   if (!region) return { products: [], count: 0 }

//   const headers = { ...(await getAuthHeaders()) }
//   const next = { ...(await getCacheOptions("products", 60)) }

//   const { products, count } = await sdk.client.fetch<{
//     products: HttpTypes.StoreProduct[]
//     count: number
//   }>(`/store/products`, {
//     method: "GET",
//     query: {
//       limit,
//       offset,
//       region_id: region.id,
//       fields: STORE_LIST_FIELDS,
//     },
//     headers,
//     next,
//   })

//   return { products, count }
// }

// /**
//  * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
//  * It will then return the paginated products based on the page and limit parameters.
//  */
// export const listProductsWithSort = async ({
//   page = 0,
//   queryParams,
//   sortBy = "created_at",
//   countryCode,
// }: {
//   page?: number
//   queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
//   sortBy?: SortOptions
//   countryCode: string
// }): Promise<{
//   response: { products: HttpTypes.StoreProduct[]; count: number }
//   nextPage: number | null
//   queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
// }> => {
//   const limit = queryParams?.limit || 12

//   const {
//     response: { products, count },
//   } = await listProducts({
//     pageParam: 0,
//     queryParams: {
//       ...queryParams,
//       limit: 100,
//     },
//     countryCode,
//   })

//   const sortedProducts = sortProducts(products, sortBy)

//   const pageParam = (page - 1) * limit

//   const nextPage = count > pageParam + limit ? pageParam + limit : null

//   const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

//   return {
//     response: {
//       products: paginatedProducts,
//       count,
//     },
//     nextPage,
//     queryParams,
//   }
// }


// // reviews

// export const getProductReviews = async ({
//   productId,
//   limit = 10,
//   offset = 0,
// }: {
//   productId: string
//   limit?: number
//   offset?: number 
// }) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   const next = {
//     ...(await getCacheOptions(`product-reviews-${productId}`)),
//   }

//   return sdk.client.fetch<{
//     reviews: StoreProductReview[]
//     average_rating: number
//     limit: number
//     offset: number
//     count: number
//   }>(`/store/products/${productId}/reviews`, {
//     headers,
//     query: {
//       limit,
//       offset,
//       order: "-created_at",
//     },
//     next,
  
//   })
// }

// export const addProductReview = async (input: {
//   title?: string
//   content: string
//   first_name: string
//   last_name: string
//   rating: number,
//   product_id: string
// }) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   return sdk.client.fetch(`/store/reviews`, {
//     method: "POST",
//     headers,
//     body: input,
//     next: {
//       ...(await getCacheOptions(`product-reviews-${input.product_id}`)),
//     }
//   })
// }









"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { StoreProductReview } from "types/global"

// ─── Debug helper ──────────────────────────────────────────────────────────
// Logs: caller label | fields used | response size in KB | time in ms
// Remove or set DEBUG_PRODUCTS=false in env to silence in production.
const DEBUG = process.env.DEBUG_PRODUCTS !== "false"

function logFetch(
  label: string,
  fields: string,
  startMs: number,
  responseBytes: number
) {
  if (!DEBUG) return
  const ms = (Date.now() - startMs).toFixed(0)
  const kb = (responseBytes / 1024).toFixed(1)
  const fieldPreview = fields.length > 120 ? fields.slice(0, 120) + "…" : fields
  console.log(
    `[products] ${label} | ${ms}ms | ${kb}KB | fields: ${fieldPreview}`
  )
}

// ── Default fields for listProducts ───────────────────────────────────────
// Explicit dot-notation only — zero wildcards.
// size_chart intentionally excluded — only PDP adds it via queryParams.fields.
const DEFAULT_PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "description",
  "*variants.calculated_price",
  "+variants.inventory_quantity",
  "+variants.manage_inventory",
  "+variants.allow_backorder",
  "+variants.sku",
  "+variants.options.value",
  "+variants.options.option.title",
  "+variants.inventory_items.inventory.location_levels.stocked_quantity",
  "+variants.inventory_items.inventory.location_levels.reserved_quantity",
  "+options.title",
  "+options.values.value",
  "+metadata",
  "+tags.id",
  "vendor.id",
  "vendor.name",
  "vendor.handle",
  "vendor.logo",
  "vendor.verified",
  "categories.name",
  "categories.handle",
  "collection.title",
  "collection.handle",
  "+images.url",
].join(",")

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams & { fields?: string }
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return { response: { products: [], count: 0 }, nextPage: null }
  }

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }

  const fields = queryParams?.fields ?? DEFAULT_PRODUCT_FIELDS

  // ── Log the outgoing request ───────────────────────────────────────────
  const caller = queryParams?.handle
    ? `handle=${queryParams.handle}`
    : queryParams?.id
    ? `id=${JSON.stringify(queryParams.id)}`
    : queryParams?.collection_id
    ? `collection=${JSON.stringify(queryParams.collection_id)}`
    : queryParams?.tag_id
    ? `tags=${JSON.stringify(queryParams.tag_id)}`
    : `limit=${limit}/offset=${offset}`

  console.log(`[products] → FETCH START | ${caller} | limit=${limit}`)
  const t0 = Date.now()

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields,
          ...queryParams,
        },
        headers,
        next,
      }
    )
    .then(({ products, count }) => {
      // ── Log response ────────────────────────────────────────────────────
      const json = JSON.stringify({ products, count })
      logFetch(caller, fields, t0, json.length)

      // ── Warn on suspiciously large responses ────────────────────────────
      if (json.length > 100_000) {
        console.warn(
          `[products] ⚠️  LARGE RESPONSE ${(json.length / 1024).toFixed(0)}KB | ${caller}` +
          ` | ${products.length} products` +
          ` | fields include size_chart=${fields.includes("size_chart")}` +
          ` | wildcards=${(fields.match(/\*/g) || []).length}`
        )
      }

      const nextPage = count > offset + limit ? pageParam + 1 : null
      return { response: { products, count }, nextPage, queryParams }
    })
}

// ── Lean fields for store listing ─────────────────────────────────────────
const STORE_LIST_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "created_at",
  "+metadata.color_hex_values",
  "+tags.id",
  "+tags.value",
  "vendor.id",
  "vendor.name",
  "vendor.handle",
  "vendor.verified",
  "categories.id",
  "categories.name",
  "categories.handle",
  "collection.id",
  "collection.title",
  "collection.handle",
  "+variants.id",
  "+variants.thumbnail",
  "+variants.options.value",
  "+variants.options.option.title",
].join(",")

export const listProductsForStore = async ({
  offset = 0,
  limit = 50,
  countryCode,
}: {
  offset?: number
  limit?: number
  countryCode: string
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
  const region = await getRegion(countryCode)
  if (!region) return { products: [], count: 0 }

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products", 60)) }

  console.log(`[products] → listProductsForStore START | limit=${limit} offset=${offset}`)
  const t0 = Date.now()

  const { products, count } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>(`/store/products`, {
    method: "GET",
    query: { limit, offset, region_id: region.id, fields: STORE_LIST_FIELDS },
    headers,
    next,
  })

  logFetch(`listProductsForStore`, STORE_LIST_FIELDS, t0, JSON.stringify({ products, count }).length)
  return { products, count }
}

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  console.log(`[products] → listProductsWithSort START | sort=${sortBy} page=${page}`)

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: { ...queryParams, limit: 100 },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return { response: { products: paginatedProducts, count }, nextPage, queryParams }
}

// ── Reviews ────────────────────────────────────────────────────────────────

export const getProductReviews = async ({
  productId,
  limit = 10,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number
}) => {
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions(`product-reviews-${productId}`)) }

  return sdk.client.fetch<{
    reviews: StoreProductReview[]
    average_rating: number
    limit: number
    offset: number
    count: number
  }>(`/store/products/${productId}/reviews`, {
    headers,
    query: { limit, offset, order: "-created_at" },
    next,
  })
}

export const addProductReview = async (input: {
  title?: string
  content: string
  first_name: string
  last_name: string
  rating: number
  product_id: string
}) => {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.client.fetch(`/store/reviews`, {
    method: "POST",
    headers,
    body: input,
    next: { ...(await getCacheOptions(`product-reviews-${input.product_id}`)) },
  })
}
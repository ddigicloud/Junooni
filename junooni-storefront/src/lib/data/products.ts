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

// ── Default fields for listProducts ───────────────────────────────────────
//
// Previously: "*variants.calculated_price,+variants.inventory_quantity,
//              +metadata,+tags,*vendor,*categories,*collection,*size_chart"
//
// Problems with the old string:
//   • *vendor      — wildcard expand, pulls the full vendor object tree
//   • *categories  — wildcard expand, pulls full category tree
//   • *collection  — wildcard expand
//   • *size_chart  — wildcard expand, largest offender on products with
//                    many sizes — causes heap OOM when fetched for 12+
//                    products simultaneously (e.g. related products)
//
// Fix: explicit dot-notation fields only. size_chart is intentionally
// excluded from the default — it's only needed on the PDP, where page.tsx
// adds it explicitly to its own getProduct() call.
//
const DEFAULT_PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "description",
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
  "+tags.id",
  "+tags.value",
  "vendor.id",
  "vendor.name",
  "vendor.handle",
  "vendor.logo",
  "vendor.verified",
  "categories.id",
  "categories.name",
  "categories.handle",
  "collection.id",
  "collection.title",
  "collection.handle",
  "+images.id",
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
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          // Callers can override fields by passing queryParams.fields.
          // The default is lean — no wildcard expands, no size_chart.
          fields: DEFAULT_PRODUCT_FIELDS,
          ...queryParams,
        },
        headers,
        next,
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

// ── Lean fields for store listing only ────────────────────────────────────
// No size_chart, no tags, minimal variant data — just enough for a grid card.
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

  const { products, count } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>(`/store/products`, {
    method: "GET",
    query: {
      limit,
      offset,
      region_id: region.id,
      fields: STORE_LIST_FIELDS,
    },
    headers,
    next,
  })

  return { products, count }
}

/**
 * Fetches up to 100 products, sorts them client-side, then returns a paginated slice.
 * Uses the default lean fields — no size_chart.
 */
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

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
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
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(`product-reviews-${productId}`)),
  }

  return sdk.client.fetch<{
    reviews: StoreProductReview[]
    average_rating: number
    limit: number
    offset: number
    count: number
  }>(`/store/products/${productId}/reviews`, {
    headers,
    query: {
      limit,
      offset,
      order: "-created_at",
    },
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
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch(`/store/reviews`, {
    method: "POST",
    headers,
    body: input,
    next: {
      ...(await getCacheOptions(`product-reviews-${input.product_id}`)),
    },
  })
}
// import { sdk } from "@lib/config"
// import { HttpTypes } from "@medusajs/types"
// import { getCacheOptions } from "./cookies"

// export const listCategories = async (query?: Record<string, any>) => {
//   const next = {
//     ...(await getCacheOptions("categories")),
//   }

//   const limit = query?.limit || 100

//   return sdk.client
//     .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
//       "/store/product-categories",
//       {
//         query: {
//           fields:
//             "*category_children, *products,*products.vendor,*products.collection.*,*products.categories,*parent_category, *parent_category.parent_category",
            
//           limit,
//           ...query,
//         },
//         next
//         // cache: "force-cache",
//       }
//     )
//     .then(({ product_categories }) => product_categories)
// }

// export const getCategoryByHandle = async (categoryHandle: string[]) => {
//   const handle = `${categoryHandle.join("/")}`

//   const next = {
//     ...(await getCacheOptions("categories")),
//   }

//   return sdk.client
//     .fetch<HttpTypes.StoreProductCategoryListResponse>(
//       `/store/product-categories`,
//       {
//         query: {
//           fields: "*category_children, *products,*products.collection.*,*products.vendor,*products.categories",
//           handle,
//         },
//         next
//         // cache: "force-cache",
//       }
//     )
//     .then(({ product_categories }) => product_categories[0])
// }









import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// ── Field audit ────────────────────────────────────────────────────────────
//
// REMOVED — were causing heap OOM crashes:
//   *products              → wildcard expand of ALL products in category
//   *products.vendor       → wildcard vendor for every product
//   *products.collection.* → double wildcard collection for every product
//   *products.categories   → wildcard categories for every product
//
// Products are NEVER rendered from category data — every caller fetches
// products separately via listProducts({ queryParams: { category_id } }).
// Expanding products on the category endpoint is pure waste.
//
// IMPACT from logs before fix:
//   mens-clothing    → 291,590 bytes, 14-15s response time
//   womens-clothing  → 294,714 bytes, 15-16s response time
//   oversized-t-shirt → 128,288 bytes, 13-15s response time
//   20+ simultaneous calls → heap exhaustion → SIGABRT
//
// After fix: ~500 bytes per category, <100ms response time.
//
// KEPT — what callers actually use:
//   id, name, handle, description        → display + routing
//   category_children.*                  → nav tree (2 levels)
//   parent_category.*                    → breadcrumbs (2 levels)
//
// ──────────────────────────────────────────────────────────────────────────

// Fields for listCategories — navbar + sidebar tree rendering
const LIST_CATEGORIES_FIELDS = [
  "id",
  "name",
  "handle",
  "description",
  "rank",
  // Child categories for nav tree (2 levels deep)
  "category_children.id",
  "category_children.name",
  "category_children.handle",
  "category_children.rank",
  "category_children.category_children.id",
  "category_children.category_children.name",
  "category_children.category_children.handle",
  // Parent for breadcrumbs (2 levels up)
  "parent_category.id",
  "parent_category.name",
  "parent_category.handle",
  "parent_category.parent_category.id",
  "parent_category.parent_category.name",
  "parent_category.parent_category.handle",
].join(",")

// Fields for getCategoryByHandle — category page title + breadcrumb + children nav
const GET_CATEGORY_FIELDS = [
  "id",
  "name",
  "handle",
  "description",
  // Child categories for sub-category nav on category page
  "category_children.id",
  "category_children.name",
  "category_children.handle",
  "category_children.rank",
  // Parent chain for breadcrumbs (2 levels up)
  "parent_category.id",
  "parent_category.name",
  "parent_category.handle",
  "parent_category.parent_category.id",
  "parent_category.parent_category.name",
  "parent_category.parent_category.handle",
].join(",")

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: LIST_CATEGORIES_FIELDS,
          limit,
          ...query,
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: GET_CATEGORY_FIELDS,
          handle,
        },
        next,
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
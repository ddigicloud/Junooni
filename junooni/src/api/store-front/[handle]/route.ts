// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
// import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

// const CREATOR_STORE_SC = process.env.CREATOR_STORE_SALES_CHANNEL_ID
//   ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

// const PAGE_SIZE = 24

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { handle } = req.params
//   const page = Math.max(1, parseInt((req.query.page as string) ?? "1"))
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

//   // ── 1. Fetch vendor + store ────────────────────────────────────────────
//   let vendor: any = null
//   let vendorStore: any = null

//   try {
//     const { data: [vendorData] } = await query.graph({
//       entity: "vendor",
//       fields: [
//         "id", "handle", "name", "logo", "coverphoto",
//         "creator_bio", "creator_title", "creator_category",
//         "instagram", "youtube", "xtwitter", "facebook", "othersocial",
//         "sell_on_own_store",
//         "vendor_store.id",
//         "vendor_store.subdomain",
//         "vendor_store.custom_domain",
//         "vendor_store.domain_verified",
//         "vendor_store.template",
//         "vendor_store.status",
//         "vendor_store.password_enabled",
//         "vendor_store.primary_color",
//         "vendor_store.secondary_color",
//         "vendor_store.font",
//         "vendor_store.hero_image",
//         "vendor_store.tagline",
//         "vendor_store.announcement_text",
//         "vendor_store.store_logo",
//         "vendor_store.store_favicon",
//         "vendor_store.sections",
//         "vendor_store.pages",
//         "vendor_store.collections",
//         "vendor_store.seo_title",
//         "vendor_store.seo_description",
//         "vendor_store.sticky_header",
//         "vendor_store.sticky_announcement",
//         "vendor_store.og_image",
//         "vendor_store.instagram_url",
//         "vendor_store.youtube_url",
//         "vendor_store.twitter_url",
//         "vendor_store.facebook_url",
//         "vendor_store.custom_css",
//         "vendor_store.product_detail",  // ← ADD THIS
//         "vendor_store.border_radius",   // these are also missing
//         "vendor_store.button_style",
//         "vendor_store.product_card",
//         "vendor_store.accent_color",
//         "vendor_store.tiktok_url",
//         "vendor_store.discord_url",
//       ],
//       filters: { handle },
//     })

//     vendor = vendorData
//     vendorStore = vendor?.vendor_store ?? null
//     console.log(`[store-front] product_detail:`, JSON.stringify(vendorStore?.product_detail))

//   } catch (err) {
//     console.error("[store-front] vendor lookup failed:", err)
//     throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
//   }

//   if (!vendor) {
//     throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
//   }

//   if (!vendor.sell_on_own_store) {
//     throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
//   }

//   console.log(`[store-front] handle=${handle} status=${vendorStore?.status} password_enabled=${vendorStore?.password_enabled}`)

//   // ── 2. Public vendor shape ─────────────────────────────────────────────
//   const publicVendor = {
//     id:               vendor.id,
//     handle:           vendor.handle,
//     name:             vendor.name,
//     logo:             vendor.logo,
//     coverphoto:       vendor.coverphoto,
//     creator_bio:      vendor.creator_bio,
//     creator_title:    vendor.creator_title,
//     creator_category: vendor.creator_category,
//     instagram:        vendor.instagram,
//     youtube:          vendor.youtube,
//     xtwitter:         vendor.xtwitter,
//     facebook:         vendor.facebook,
//     othersocial:      vendor.othersocial,
//   }

//   // ── 3. Password gate ───────────────────────────────────────────────────
//   if (vendorStore?.password_enabled === true) {
//     const accessToken = (req.headers["x-store-access"] as string) ?? ""
//     const hasAccess = accessToken.length > 10

//     console.log(`[store-front] password_enabled=true hasAccess=${hasAccess}`)

//     if (!hasAccess) {
//       return res.json({
//         vendor: publicVendor,
//         store: {
//           ...vendorStore,
//           pages: vendorStore.pages ?? { pages: [] },
//           password_enabled: true,
//           store_password: undefined,
//         },
//         products: [],
//         categories: [],
//         collections: [],
//         pagination: { page: 1, total: 0, totalPages: 0, hasMore: false },
//       })
//     }

//     console.log(`[store-front] access granted — loading products`)
//   }

//   // ── 4. Fetch products via query.index (cross-module filtering) ─────────
//   let products: any[] = []
//   let totalProducts = 0
//   const t1 = Date.now()

//   try {
//     const offset = (page - 1) * PAGE_SIZE

//     const { data: indexedProducts, metadata } = await query.index({
//       entity: "product",
//       fields: [
//         "id", "title", "handle", "thumbnail", "status", "description",
//         "variants.id", "variants.title",
//         "variants.prices.id", "variants.prices.amount", "variants.prices.currency_code",
//         "images.id", "images.url",
//         "options.id", "options.title",
//         "options.values.id", "options.values.value",
//         "categories.id", "categories.name", "categories.handle",
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

//     totalProducts = metadata?.count ?? 0

//     products = (indexedProducts ?? []).map((p: any) => ({
//       ...p,
//       variants: (p.variants ?? []).map((v: any) => ({
//         ...v,
//         inventory_quantity: 10, // checked at cart time
//       })),
//     }))

//     console.log(`[store-front] query.index: ${products.length}/${totalProducts} products in ${Date.now() - t1}ms`)

//   } catch (err) {
//     console.error("[store-front] query.index failed:", err)
//     // Don't crash — return store with empty products
//   }

//   // ── 5. Categories + collections ────────────────────────────────────────
//   const categoriesMap = new Map<string, any>()
//   for (const product of products) {
//     for (const cat of product.categories ?? []) {
//       if (!categoriesMap.has(cat.id)) {
//         categoriesMap.set(cat.id, { ...cat, product_count: 0 })
//       }
//       categoriesMap.get(cat.id).product_count++
//     }
//   }

//   const rawVendorCollections: any[] = vendorStore?.collections?.collections ?? []
//   const vendorCollections = rawVendorCollections
//     .filter((c: any) => c.is_visible !== false)
//     .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
//     .map((c: any) => ({
//       ...c,
//       product_count: (c.product_ids ?? []).filter((id: string) =>
//         products.some((p: any) => p.id === id)
//       ).length,
//     }))

//   // ── 6. Build response ──────────────────────────────────────────────────
//   const storeResponse = vendorStore ? {
//     ...vendorStore,
//     pages:            vendorStore.pages ?? { pages: [] },
//     password_enabled: vendorStore.password_enabled ?? false,
//     store_password:   undefined,
//   } : null

//   const totalPages = Math.ceil(totalProducts / PAGE_SIZE)

//   const response = {
//     vendor:      publicVendor,
//     store:       storeResponse,
//     products,
//     categories:  Array.from(categoriesMap.values()),
//     collections: vendorCollections,
//     pagination: {
//       page,
//       total:      totalProducts,
//       totalPages,
//       hasMore:    page < totalPages,
//     },
//   }

//   console.log(`[store-front] DONE — ${products.length} products, page ${page}/${totalPages}, ${Date.now() - t1}ms`)

//   return res.json(response)
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

const CREATOR_STORE_SC = process.env.CREATOR_STORE_SALES_CHANNEL_ID
  ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

const PAGE_SIZE = 24

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1"))
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Fetch vendor + store ────────────────────────────────────────────
  let vendor: any = null
  let vendorStore: any = null

  try {
    const { data: [vendorData] } = await query.graph({
      entity: "vendor",
      fields: [
        "id", "handle", "name", "logo", "coverphoto",
        "creator_bio", "creator_title", "creator_category",
        "instagram", "youtube", "xtwitter", "facebook", "othersocial",
        "sell_on_own_store",
        "vendor_store.id",
        "vendor_store.subdomain",
        "vendor_store.custom_domain",
        "vendor_store.domain_verified",
        "vendor_store.template",
        "vendor_store.status",
        "vendor_store.password_enabled",
        "vendor_store.primary_color",
        "vendor_store.secondary_color",
        "vendor_store.font",
        "vendor_store.store_logo",
        "vendor_store.store_favicon",
        "vendor_store.sections",
        "vendor_store.pages",
        "vendor_store.collections",
        "vendor_store.seo_title",
        "vendor_store.seo_description",
        // ← settings JSON column holds everything else:
        "vendor_store.settings",
      ],
      filters: { handle },
    })

    vendor = vendorData
    vendorStore = vendor?.vendor_store ?? null

    // Flatten settings into vendorStore so the rest of the code
    // can access fields like product_detail, border_radius etc. at top level
    if (vendorStore && vendorStore.settings) {
      vendorStore = { ...vendorStore, ...vendorStore.settings }
    }

    console.log(`[store-front] product_detail:`, JSON.stringify(vendorStore?.product_detail))

  } catch (err) {
    console.error("[store-front] vendor lookup failed:", err)
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }

  if (!vendor) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }

  if (!vendor.sell_on_own_store) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
  }

  console.log(`[store-front] handle=${handle} status=${vendorStore?.status} password_enabled=${vendorStore?.password_enabled}`)

  // ── 2. Public vendor shape ─────────────────────────────────────────────
  const publicVendor = {
    id:               vendor.id,
    handle:           vendor.handle,
    name:             vendor.name,
    logo:             vendor.logo,
    coverphoto:       vendor.coverphoto,
    creator_bio:      vendor.creator_bio,
    creator_title:    vendor.creator_title,
    creator_category: vendor.creator_category,
    instagram:        vendor.instagram,
    youtube:          vendor.youtube,
    xtwitter:         vendor.xtwitter,
    facebook:         vendor.facebook,
    othersocial:      vendor.othersocial,
  }

  // ── 3. Password gate ───────────────────────────────────────────────────
  if (vendorStore?.password_enabled === true) {
    const accessToken = (req.headers["x-store-access"] as string) ?? ""
    const hasAccess = accessToken.length > 10

    console.log(`[store-front] password_enabled=true hasAccess=${hasAccess}`)

    if (!hasAccess) {
      return res.json({
        vendor: publicVendor,
        store: {
          ...vendorStore,
          pages: vendorStore.pages ?? { pages: [] },
          password_enabled: true,
          store_password: undefined,
          settings: undefined,
        },
        products: [],
        categories: [],
        collections: [],
        pagination: { page: 1, total: 0, totalPages: 0, hasMore: false },
      })
    }

    console.log(`[store-front] access granted — loading products`)
  }

  // ── 4. Fetch products via query.index (cross-module filtering) ─────────
  let products: any[] = []
  let totalProducts = 0
  const t1 = Date.now()

  try {
    const offset = (page - 1) * PAGE_SIZE

    const { data: indexedProducts, metadata } = await query.index({
      entity: "product",
      fields: [
        "id", "title", "handle", "thumbnail", "status", "description",
        "variants.id", "variants.title",
        "variants.prices.id", "variants.prices.amount", "variants.prices.currency_code",
        "images.id", "images.url",
        "options.id", "options.title",
        "options.values.id", "options.values.value",
        "categories.id", "categories.name", "categories.handle",
        // "metadata",                    // ← add this if not present
        // "size_chart.id",
        // "size_chart.name", 
        // "size_chart.chart",
        // "size_chart.sku",
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

    totalProducts = metadata?.count ?? 0

    products = (indexedProducts ?? []).map((p: any) => ({
      ...p,
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        inventory_quantity: 10,
      })),
    }))

    console.log(`[store-front] query.index: ${products.length}/${totalProducts} products in ${Date.now() - t1}ms`)

  } catch (err) {
    console.error("[store-front] query.index failed:", err)
  }

  // ── 5. Categories + collections ────────────────────────────────────────
  const categoriesMap = new Map<string, any>()
  for (const product of products) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, product_count: 0 })
      }
      categoriesMap.get(cat.id).product_count++
    }
  }

  const rawVendorCollections: any[] = vendorStore?.collections?.collections ?? []
  const vendorCollections = rawVendorCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => ({
      ...c,
      product_count: (c.product_ids ?? []).filter((id: string) =>
        products.some((p: any) => p.id === id)
      ).length,
    }))

  // ── 6. Build response ──────────────────────────────────────────────────
  const storeResponse = vendorStore ? {
    ...vendorStore,
    pages:            vendorStore.pages ?? { pages: [] },
    password_enabled: vendorStore.password_enabled ?? false,
    store_password:   undefined,
    settings:         undefined, // don't expose raw settings — already flattened
  } : null

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE)

  const response = {
    vendor:      publicVendor,
    store:       storeResponse,
    products,
    categories:  Array.from(categoriesMap.values()),
    collections: vendorCollections,
    pagination: {
      page,
      total:      totalProducts,
      totalPages,
      hasMore:    page < totalPages,
    },
  }

  console.log(`[store-front] DONE — ${products.length} products, page ${page}/${totalPages}, ${Date.now() - t1}ms`)

  return res.json(response)
}
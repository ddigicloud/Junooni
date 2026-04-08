// src/api/store-front/[handle]/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  // ── 1. Find vendor by handle ───────────────────────────────────────────────
  const vendors = await marketplaceModuleService.listVendors(
    { handle },
    { relations: ["vendor_store", "admins"] }
  )

  if (!vendors?.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }

  const vendor = vendors[0]

  if (!vendor.sell_on_own_store) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
  }

  const vendorStore = vendor.vendor_store ?? null
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev && vendorStore && vendorStore.status !== "live") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This store is not currently live")
  }

  // ── Fetch full vendor_store including pages column via query.graph ─────────
  let fullVendorStore = vendorStore
  if (vendorStore?.id) {
    try {
      const { data: storeData } = await query.graph({
        entity: "vendor_store",
        fields: ["*"],
        filters: { id: vendorStore.id },
      })
      if (storeData?.[0]) {
        fullVendorStore = storeData[0]
      }
    } catch (storeErr) {
      console.warn("[store-front] Could not fetch full vendor_store:", storeErr)
    }
  }

  // ── 2. Fetch products via vendor_admin ────────────────────────────────────
  let products: any[] = []

  try {
    const adminId = vendor.admins?.[0]?.id
    if (adminId) {
      const { data: [vendorAdmin] } = await query.graph({
        entity: "vendor_admin",
        fields: [
          "vendor.products.id",
          "vendor.products.title",
          "vendor.products.handle",
          "vendor.products.description",
          "vendor.products.thumbnail",
          "vendor.products.status",
          "vendor.products.created_at",
          // variants
          "vendor.products.variants.id",
          "vendor.products.variants.title",
          "vendor.products.variants.thumbnail",
          "vendor.products.variants.metadata",
          "vendor.products.variants.prices.*",
          "vendor.products.variants.options.*",
          "vendor.products.variants.images.id",
          "vendor.products.variants.images.url",
          // product images
          "vendor.products.images.id",
          "vendor.products.images.url",
          // options
          "vendor.products.options.id",
          "vendor.products.options.title",
          "vendor.products.options.values.id",
          "vendor.products.options.values.value",
          // categories
          "vendor.products.categories.id",
          "vendor.products.categories.name",
          "vendor.products.categories.handle",
          // collection
          "vendor.products.collection.id",
          "vendor.products.collection.title",
          "vendor.products.collection.handle",
        ],
        filters: { id: [adminId] },
        pagination: { take: 100 },
      })

      const all = vendorAdmin?.vendor?.products ?? []
      products = all.filter((p: any) => p.status === "published")

      // ── Fetch inventory via product_variant → inventory_items ──────────────
      const variantIds = products.flatMap((p: any) =>
        (p.variants ?? []).map((v: any) => v.id)
      ).filter(Boolean)

      if (variantIds.length) {
        try {
          const stockMap: Record<string, number> = {}

          const { data: variantData } = await query.graph({
            entity: "product_variant",
            fields: [
              "id",
              "inventory_items.inventory.id",
              "inventory_items.inventory.location_levels.stocked_quantity",
              "inventory_items.inventory.location_levels.reserved_quantity",
            ],
            filters: { id: variantIds },
          })

          for (const vd of variantData ?? []) {
            const links = vd.inventory_items ?? []
            if (!links.length) {
              stockMap[vd.id] = -1
              continue
            }
            let total = 0
            for (const link of links) {
              for (const lvl of link.inventory?.location_levels ?? []) {
                total += (lvl.stocked_quantity ?? 0) - (lvl.reserved_quantity ?? 0)
              }
            }
            stockMap[vd.id] = total
          }

          console.log("[store-front] stockMap:", JSON.stringify(stockMap))

          products = products.map((p: any) => ({
            ...p,
            variants: (p.variants ?? []).map((v: any) => ({
              ...v,
              inventory_quantity: v.id in stockMap ? stockMap[v.id] : -1,
            })),
          }))
        } catch (invErr) {
          console.warn("[store-front] Inventory fetch failed:", invErr)
        }
      }
    }
  } catch (err) {
    console.error("[store-front] Failed to fetch products:", err)
    products = []
  }

  // ── 3. Derive categories from products + vendor collections from store ───────
  const categoriesMap = new Map<string, any>()

  for (const product of products) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, product_count: 0 })
      }
      categoriesMap.get(cat.id).product_count++
    }
  }

  // Vendor collections come from the store config, not product.collection
  // Each vendor collection has product_ids — resolve actual product count
  const rawVendorCollections: any[] = fullVendorStore?.collections?.collections ?? []
  const vendorCollections = rawVendorCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => ({
      ...c,
      product_count: (c.product_ids ?? []).filter((id: string) =>
        products.some((p: any) => p.id === id)
      ).length,
    }))

  // ── 4. Public-safe vendor fields ──────────────────────────────────────────
  const publicVendor = {
    id: vendor.id,
    handle: vendor.handle,
    name: vendor.name,
    logo: vendor.logo,
    coverphoto: vendor.coverphoto,
    creator_bio: vendor.creator_bio,
    creator_title: vendor.creator_title,
    creator_category: vendor.creator_category,
    instagram: vendor.instagram,
    youtube: vendor.youtube,
    xtwitter: vendor.xtwitter,
    facebook: vendor.facebook,
    othersocial: vendor.othersocial,
  }

  // Ensure pages field is always present in store response
  console.log("[store-front] fullVendorStore.pages raw:", JSON.stringify(fullVendorStore?.pages))
  const storeWithPages = fullVendorStore ? {
    ...fullVendorStore,
    pages: fullVendorStore.pages ?? { pages: [] },
  } : null

  return res.json({
    vendor: publicVendor,
    store: storeWithPages,
    products,
    categories: Array.from(categoriesMap.values()),
    collections: vendorCollections,
  })
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC =
  process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle, collectionHandle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Vendor lookup — need vendor_store for collections data ───────────
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
    console.error(`[collection-detail-route] vendor lookup failed:`, err)
  }

  if (!vendor) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }
  if (!vendor.sell_on_own_store) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
  }

  // ── 2. Find the collection in vendor_store — get its product_ids ────────
  const rawCollections: any[] = vendorStore?.collections?.collections ?? []
  const allCollections = rawCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const thisCollection = allCollections.find(
    (c: any) => c.handle === collectionHandle
  )

  if (!thisCollection) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No collection found with handle "${collectionHandle}"`
    )
  }

  const collectionProductIds: string[] = thisCollection.product_ids ?? []

  // ── 3. Fetch all vendor products — filter by collection product_ids in JS
  // Same reason as category route: query.index doesn't support nested
  // relation filters. Collections are stored in vendor_store JSON,
  // not as a Medusa relation — so we must JS-filter by product_ids.
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
      `[collection-detail-route] handle=${handle} allProducts=${allProducts.length} in ${Date.now() - t1}ms`
    )
  } catch (err) {
    console.error(`[collection-detail-route] query.index failed:`, err)
  }

  // ── 4. JS filter — products in this collection ──────────────────────────
  const productMap = new Map(allProducts.map((p: any) => [p.id, p]))

  // If collection has specific product_ids, use them (preserves sort order)
  // otherwise fall back to all products
  const collectionProducts = collectionProductIds.length > 0
    ? collectionProductIds.map((id) => productMap.get(id)).filter(Boolean)
    : allProducts

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

  // ── 6. All collections with counts ──────────────────────────────────────
  const collections = allCollections.map((c: any) => ({
    ...c,
    product_count: (c.product_ids ?? []).filter((id: string) =>
      productMap.has(id)
    ).length,
  }))

  // Attach products to thisCollection for the client
  const collection = {
    ...thisCollection,
    product_count: collectionProducts.length,
    products: collectionProducts,
  }

  console.log(
    `[collection-detail-route] collection="${collectionHandle}" ` +
    `collectionProducts=${collectionProducts.length} DONE in ${Date.now() - t1}ms`
  )

  return res.json({
    collection,
    products: collectionProducts,   // grid products
    categories: Array.from(categoriesMap.values()),
    collections,                    // all — for sidebar/nav
  })
}
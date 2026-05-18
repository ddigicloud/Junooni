import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC =
  process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
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
        "vendor_store.collections",  // need collections for sidebar
      ],
      filters: { handle },
    })
    vendor = data?.[0] ?? null
    vendorStore = vendor?.vendor_store ?? null
  } catch (err) {
    console.error(`[categories-route] vendor lookup failed:`, err)
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

  // ── 2. Fetch products — minimal fields, no pagination (categories need all) ──
  let products: any[] = []
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
        // variants minimal — just need lowest price for card
        "variants.prices.amount",
        "variants.prices.currency_code",
        // categories — this IS the point of the page
        "categories.id",
        "categories.name",
        "categories.handle",
        "categories.description",
      ],
      filters: {
        status: "published",
        sales_channels: { id: [CREATOR_STORE_SC] },
        vendor: { id: [vendor.id] },
      },
      pagination: {
        take: 200,  // fetch all for category grouping — no pagination needed
        skip: 0,
        order: { created_at: "DESC" },
      },
    })

    products = (indexed ?? []).map((p: any) => ({
      ...p,
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        inventory_quantity: 10,
      })),
    }))

    console.log(`[categories-route] handle=${handle} got=${products.length} products in ${Date.now() - t1}ms`)
  } catch (err) {
    console.error(`[categories-route] query.index failed:`, err)
  }

  // ── 3. Build categories map with product counts + product lists ──────────
  const categoriesMap = new Map<string, any>()
  for (const product of products) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, {
          ...cat,
          product_count: 0,
          products: [],
        })
      }
      const entry = categoriesMap.get(cat.id)
      entry.product_count++
      entry.products.push(product)
    }
  }

  // ── 4. Collections from vendor_store (already fetched, no extra call) ────
  const rawCollections: any[] = vendorStore?.collections?.collections ?? []
  const collections = rawCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => ({
      ...c,
      product_count: (c.product_ids ?? []).filter((id: string) =>
        products.some((p: any) => p.id === id)
      ).length,
    }))

  return res.json({
    categories: Array.from(categoriesMap.values()),
    collections,
    products,  // client needs this for filtering within a category
  })
}
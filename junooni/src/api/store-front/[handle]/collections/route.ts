import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC =
  process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Minimal vendor lookup — only id + sell flag + store collections ──
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

    // Flatten settings so collections stored inside settings also work
    if (vendorStore?.settings) {
      vendorStore = { ...vendorStore, ...vendorStore.settings }
    }
  } catch (err) {
    console.error(`[collections-route] vendor lookup failed:`, err)
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

  // ── 2. Fetch products — minimal fields only ─────────────────────────────
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
        "variants.prices.amount",
        "variants.prices.currency_code",
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

    products = (indexed ?? []).map((p: any) => ({
      ...p,
      variants: (p.variants ?? []).map((v: any) => ({
        ...v,
        inventory_quantity: 10,
      })),
    }))

    console.log(`[collections-route] handle=${handle} got=${products.length} products in ${Date.now() - t1}ms`)
  } catch (err) {
    console.error(`[collections-route] query.index failed:`, err)
  }

  // ── 3. Build collections — attach matching products to each ─────────────
  const productMap = new Map(products.map((p: any) => [p.id, p]))

  const rawCollections: any[] = vendorStore?.collections?.collections ?? []
  const collections = rawCollections
    .filter((c: any) => c.is_visible !== false)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => {
      const collectionProducts = (c.product_ids ?? [])
        .map((id: string) => productMap.get(id))
        .filter(Boolean)
      return {
        ...c,
        product_count: collectionProducts.length,
        products: collectionProducts,
      }
    })

  // ── 4. Categories derived from products — no extra DB call ──────────────
  const categoriesMap = new Map<string, any>()
  for (const product of products) {
    for (const cat of product.categories ?? []) {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, product_count: 0 })
      }
      categoriesMap.get(cat.id).product_count++
    }
  }

  return res.json({
    collections,
    categories: Array.from(categoriesMap.values()),
    products,
  })
}
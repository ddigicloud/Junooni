import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const CREATOR_STORE_SC = process.env.CREATOR_STORE_SALES_CHANNEL_ID
  ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle, productHandle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Verify vendor exists and has own store ──────────────────────────
  let vendor: any = null

  try {
    const { data: [vendorData] } = await query.graph({
      entity: "vendor",
      fields: ["id", "handle", "sell_on_own_store"],
      filters: { handle },
    })
    vendor = vendorData
  } catch (err) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }

  if (!vendor) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No creator found with handle "${handle}"`)
  }

  if (!vendor.sell_on_own_store) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This creator does not have an own store enabled")
  }

  // ── 2a. Verify product belongs to this vendor via query.index ──────────
  try {
    const { data: indexed } = await query.index({
      entity: "product",
      fields: ["id", "handle"],
      filters: {
        handle: productHandle,
        status: "published",
        sales_channels: { id: [CREATOR_STORE_SC] },
        vendor: { id: [vendor.id] },
      },
    })

    if (!indexed?.length) {
      console.warn(`[security] Product "${productHandle}" not found for vendor "${handle}" — blocking`)
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product not found: "${productHandle}"`
      )
    }
  } catch (err: any) {
    if (err instanceof MedusaError) throw err
    console.error("[product-detail] ownership check failed:", err)
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product not found: "${productHandle}"`)
  }

  // ── 2b. Fetch full product details via query.graph ─────────────────────
  const t1 = Date.now()
  let product: any = null

  try {
    const { data: [productData] } = await query.graph({
      entity: "product",
            fields: [
        "id", "title", "handle", "thumbnail", "status", "description",
        "subtitle", "weight", "length", "width", "height",
        "material", "origin_country", "discountable",
        "variants.id", "variants.title", "variants.sku",
        "variants.manage_inventory",
        "variants.allow_backorder",
        "variants.metadata",
        "variants.inventory_items.inventory_item_id",
        "variants.inventory_items.inventory.location_levels.stocked_quantity",
        "variants.inventory_items.inventory.location_levels.reserved_quantity",
        "variants.prices.id", "variants.prices.amount", "variants.prices.currency_code",
        "variants.options.id", "variants.options.value",
        "variants.options.option.id", "variants.options.option.title",
        "variants.images.id", "variants.images.url",
        "images.id", "images.url", "images.rank",
        "options.id", "options.title", "options.is_exclusive",
        "options.values.id", "options.values.value",
        "categories.id", "categories.name", "categories.handle",
        "metadata",
        "size_chart.id",
        "size_chart.name",
        "size_chart.chart",
        "size_chart.sku",
      ],
      filters: {
        handle: productHandle,
        status: "published",
      },
    })
    product = productData
  } catch (err) {
    console.error("[product-detail] product lookup failed:", err)
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product not found: "${productHandle}"`)
  }

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product not found: "${productHandle}"`)
  }

  console.log(`[product-detail] fetched "${productHandle}" in ${Date.now() - t1}ms`)

  return res.json({ product })
}
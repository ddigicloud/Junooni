import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const region_id = req.query.region_id as string | undefined

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── Resolve currency_code from region ──────────────────────────────────
  // Don't accept currency_code as a query param (Medusa rejects unrecognized fields).
  // Resolve it from region_id so QueryContext gets the correct currency.
  let currency_code: string | undefined

  if (region_id) {
    try {
      const { data: [region] } = await query.graph({
        entity: "region",
        fields: ["id", "currency_code"],
        filters: { id: region_id },
      })
      currency_code = region?.currency_code
    } catch {
      // Fallback — pricing context will be incomplete but won't crash
    }
  }

  // ── Build QueryContext for calculated_price ────────────────────────────
  // QueryContext is required for variants.calculated_price.* — without it
  // Medusa throws 400: "calculatePrices requires currency_code in the context"
  const hasPricingContext = !!(region_id && currency_code)
  const graphContext: Record<string, any> = {}

  if (hasPricingContext) {
    graphContext.variants = {
      calculated_price: QueryContext({
        region_id,
        currency_code,
      }),
    }
  }

  const { data: [product] } = await query.graph(
    {
      entity: "product",
      fields: [
        // ── Product root ──────────────────────────────────────────────
        "id",
        "title",
        "handle",
        "description",
        "subtitle",
        "thumbnail",
        "status",
        "collection_id",
        "metadata",

        // ── Images ────────────────────────────────────────────────────
        "images.id",
        "images.url",

        // ── Options ───────────────────────────────────────────────────
        "options.id",
        "options.title",
        "options.values.id",
        "options.values.value",

        // ── Variants ──────────────────────────────────────────────────
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.allow_backorder",
        "variants.inventory_quantity",
        "variants.options.id",
        "variants.options.value",
        "variants.options.option_id",
        "variants.options.option.id",
        "variants.options.option.title",

        // FIX: only request calculated_price when QueryContext is set.
        // Without region_id + currency_code, Medusa throws 400.
        // Raw prices are always included as a fallback for guests / no-region calls.
        ...(hasPricingContext ? ["variants.calculated_price.*"] : []),
        "variants.prices.amount",
        "variants.prices.currency_code",

        "variants.images.id",
        "variants.images.url",
        "variants.metadata",

        // ── Vendor — display fields only ──────────────────────────────
        "vendor.id",
        "vendor.name",
        "vendor.handle",
        "vendor.logo",
        "vendor.verified",

        // ── Categories — breadcrumb ───────────────────────────────────
        "categories.id",
        "categories.name",
        "categories.handle",

        // ── Collection ────────────────────────────────────────────────
        "collection.id",
        "collection.title",
        "collection.handle",

        // ── Brand ─────────────────────────────────────────────────────
        "brand.id",
        "brand.name",

        // ── Tags ──────────────────────────────────────────────────────
        "tags.id",
        "tags.value",

        // ── Size chart — only fields actually rendered ─────────────────
        // ProductActions: product.size_chart && product.size_chart.chart
        // Modal: dangerouslySetInnerHTML={{ __html: size_chart.chart }}
        // This is the ONLY reason this custom route exists —
        // size_chart is a custom module not accessible via /store/products
        "size_chart.id",
        "size_chart.chart",
      ],
      filters: { id },

      // Pass pricing context when available
      ...(hasPricingContext && { context: graphContext }),
    },
    {
      throwIfKeyNotFound: true,

      // ── Cache the product for 2 minutes ───────────────────────────────
      // Product data (title, images, size_chart, vendor) changes infrequently.
      // Pricing context is included in the cache key automatically so
      // different region requests get separate cache entries.
      // Requires Redis-backed Caching Module — safe to enable since
      // you already have Redis in your stack.
      cache: {
        enable: true,
        ttl: 300, // 2 minutes
      },
    }
  )

  res.json({ product })
}
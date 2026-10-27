/**
 * Shared vendor context builder.
 *
 * Extracted from src/api/vendors/ai-assistant/route.ts so both
 * JUNI (ai-assistant) and the MCP server can reuse it.
 *
 * Usage in ai-assistant/route.ts — replace the local function with:
 *   import { getVendorContext } from "../../../lib/ai/vendorContext"
 *
 * Usage in mcp/route.ts — same import path (adjust depth).
 */

import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrdersListWorkflow }      from "@medusajs/medusa/core-flows"

import MarketplaceModuleService from "../../modules/marketplace/service"
import { MARKETPLACE_MODULE }   from "../../modules/marketplace"

const MARKETPLACE_SC_ID = process.env.DEFAULT_STORE_SALES_CHANNEL_ID ?? ""
const OWN_STORE_SC_ID   = process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? ""

// ─── Payout helpers ───────────────────────────────────────────────────────────

export function deriveDisplayStatus(
  orderStatus:       string,
  fulfillmentStatus: string,
): string {
  if (orderStatus === "canceled")                  return "canceled"
  if (fulfillmentStatus === "delivered")           return "delivered"
  if (fulfillmentStatus === "partially_delivered") return "partially_delivered"
  if (fulfillmentStatus === "shipped")             return "shipped"
  if (fulfillmentStatus === "partially_shipped")   return "partially_shipped"
  if (fulfillmentStatus === "fulfilled")           return "shipped"
  if (fulfillmentStatus === "partially_fulfilled") return "partially_shipped"
  return "pending_fulfillment"
}

export function calcVendorFulfillmentStatus(
  vendorItemIds: Set<string>,
  fulfillments:  any[],
): string {
  if (!fulfillments?.length || !vendorItemIds.size) return "not_fulfilled"
  let totalQty = 0, deliveredQty = 0, shippedQty = 0, fulfilledQty = 0
  for (const ful of fulfillments) {
    if (ful.canceled_at) continue
    const vendorFulItems = (ful.items ?? []).filter(
      (fi: any) => vendorItemIds.has(fi.line_item_id) || vendorItemIds.has(fi.item_id)
    )
    if (!vendorFulItems.length) continue
    for (const fi of vendorFulItems) {
      const qty = fi.quantity ?? 1
      totalQty += qty
      if (ful.delivered_at)     { deliveredQty += qty; shippedQty += qty; fulfilledQty += qty }
      else if (ful.shipped_at)  { shippedQty += qty; fulfilledQty += qty }
      else if (ful.packed_at)   { fulfilledQty += qty }
    }
  }
  if (totalQty === 0)             return "not_fulfilled"
  if (deliveredQty === totalQty)  return "delivered"
  if (deliveredQty > 0)           return "partially_delivered"
  if (shippedQty === totalQty)    return "shipped"
  if (shippedQty > 0)             return "partially_shipped"
  if (fulfilledQty === totalQty)  return "fulfilled"
  if (fulfilledQty > 0)           return "partially_fulfilled"
  return "not_fulfilled"
}

export function getVendorItemIds(order: any, vendorId: string): Set<string> {
  const vendorOrder     = (order.metadata?.vendor_orders ?? []).find((vo: any) => vo.vendor_id === vendorId)
  const vendorMetaItems = vendorOrder?.vendor_items ?? []
  const vendorItemIds   = new Set<string>()
  for (const metaItem of vendorMetaItems) {
    const matched = (order.items ?? []).find(
      (i: any) => i.title?.toLowerCase().trim() === metaItem.title?.toLowerCase().trim()
    )
    if (matched) vendorItemIds.add(matched.id)
  }
  return vendorItemIds
}

export function detectPaymentMethodFromOrder(order: any): string {
  if (order.payment_collections?.length) {
    for (const collection of order.payment_collections) {
      if (collection.payments?.some((p: any) => p.provider_id?.toLowerCase().includes("razorpay")))
        return "razorpay"
    }
  }
  return "cod"
}

export function calcPaymentProcessingFee(vendorSubtotal: number, paymentMethod: string): number {
  if (paymentMethod === "cod") return 0
  const gatewayFee = vendorSubtotal * 0.02
  return gatewayFee + gatewayFee * 0.18
}

export function calcItemPayout(item: any, vendorId: string, order: any): number {
  const itemTotal    = item.unit_price * item.quantity
  const itemTaxTotal = item.tax_total ?? 0
  const vendorOrder  = (order.metadata?.vendor_orders ?? []).find((vo: any) => vo.vendor_id === vendorId)
  const metaItem     = (vendorOrder?.vendor_items ?? []).find(
    (vi: any) => vi.title === item.title && vi.unit_price === item.unit_price
  )
  let productCost = 0, fulfillmentType = "unknown"
  if (metaItem) {
    productCost = Number(metaItem.cost_price) || 0
    if (metaItem.fulfillment_type) {
      try {
        const ft = typeof metaItem.fulfillment_type === "string"
          ? JSON.parse(metaItem.fulfillment_type) : metaItem.fulfillment_type
        fulfillmentType = ft?.type ?? "unknown"
      } catch {
        const match = String(metaItem.fulfillment_type).match(/"type":"([^"]+)"/)
        if (match) fulfillmentType = match[1]
      }
    }
  }
  switch (fulfillmentType) {
    case "JUNOONI-fulfillment":  return Math.max(0, (itemTotal - itemTaxTotal) - productCost * item.quantity)
    case "Creator-fulfillment":
    case "Creator-fulfilment":   return itemTotal * 0.90
    default:                     return itemTotal * 0.90
  }
}

export function calcOrderPayout(order: any, vendorId: string) {
  const vendorOrder     = (order.metadata?.vendor_orders ?? []).find((vo: any) => vo.vendor_id === vendorId)
  const vendorMetaItems = vendorOrder?.vendor_items ?? []
  const vendorItems     = (order.items ?? []).filter((item: any) =>
    vendorMetaItems.some((vi: any) => vi.title === item.title && vi.unit_price === item.unit_price)
  )
  const vendorRevenue  = vendorItems.reduce((sum: number, item: any) => sum + calcItemPayout(item, vendorId, order), 0)
  const vendorSubtotal = vendorItems.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const paymentMethod  = detectPaymentMethodFromOrder(order)
  const processingFee  = calcPaymentProcessingFee(vendorSubtotal, paymentMethod)
  return {
    vendorRevenue,
    processingFee,
    finalPayout: Math.max(0, vendorRevenue - processingFee),
    paymentMethod,
  }
}

// ─── Main context builder ─────────────────────────────────────────────────────

/**
 * Build the full vendor context object.
 *
 * @param scope  — `req.scope` from any MedusaRequest (ai-assistant, MCP, etc.)
 * @param vendorId — the vendor's ID string
 */
export async function getVendorContext(scope: any, vendorId: string) {
  const query    = scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketplaceModuleService: MarketplaceModuleService = scope.resolve(MARKETPLACE_MODULE)

  let vendor: any = null
  try {
    vendor = await marketplaceModuleService.retrieveVendor(vendorId, { relations: ["admins"] })
    const result = await pgClient.raw(
      `SELECT COALESCE(plan,'free') AS plan, plan_billing_cycle, plan_activated_at FROM "vendor" WHERE id = ?`,
      [vendorId],
    )
    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan               = row.plan ?? "free"
      vendor.plan_billing_cycle = row.plan_billing_cycle ?? null
      vendor.plan_activated_at  = row.plan_activated_at ?? null
    }
  } catch (e) { console.error("[vendorContext] vendor fetch error:", e) }

  let vendorStore: any = null
  try {
    const { data: storeData } = await query.graph({
      entity: "vendor",
      fields: [
        "vendor_store.id", "vendor_store.subdomain", "vendor_store.custom_domain",
        "vendor_store.domain_verified", "vendor_store.template", "vendor_store.status",
        "vendor_store.password_enabled", "vendor_store.primary_color", "vendor_store.secondary_color",
        "vendor_store.font", "vendor_store.seo_title", "vendor_store.seo_description",
        "vendor_store.sections", "vendor_store.pages", "vendor_store.collections", "vendor_store.settings",
      ],
      filters: { id: vendorId },
    })
    const raw = storeData?.[0]?.vendor_store ?? null
    if (raw) {
      const settings = raw.settings ?? {}
      vendorStore = {
        id: raw.id, subdomain: raw.subdomain ?? null, customDomain: raw.custom_domain ?? null,
        domainVerified: raw.domain_verified ?? false, template: raw.template ?? "minimal",
        status: raw.status ?? "draft", passwordEnabled: raw.password_enabled ?? false,
        primaryColor: raw.primary_color ?? null, secondaryColor: raw.secondary_color ?? null,
        font: raw.font ?? null, seoTitle: raw.seo_title ?? null, seoDescription: raw.seo_description ?? null,
        tagline: settings.tagline ?? null, announcementText: settings.announcement_text ?? null,
        sectionsCount: Array.isArray(raw.sections?.sections)   ? raw.sections.sections.length   : 0,
        pagesCount:    Array.isArray(raw.pages?.pages)          ? raw.pages.pages.length          : 0,
        collectionsCount: Array.isArray(raw.collections?.collections) ? raw.collections.collections.length : 0,
        storeUrl: raw.custom_domain && raw.domain_verified
          ? `https://${raw.custom_domain}`
          : raw.subdomain ? `https://${raw.subdomain}.junooni.com`
          : `https://${vendor?.handle ?? vendorId}.junooni.com`,
      }
    }
  } catch (e) { console.error("[vendorContext] vendor store fetch error:", e) }

  let productCount = 0, marketplaceCount = 0, ownStoreCount = 0, bothChannelsCount = 0
  try {
    const { data: vendorProducts } = await query.graph({
      entity: "vendor",
      fields: ["products.id", "products.status", "products.sales_channels.id"],
      filters: { id: vendorId },
    })
    const allProducts = (vendorProducts?.[0]?.products ?? []).filter((p: any) => p.status === "published")
    productCount = allProducts.length
    for (const product of allProducts) {
      const channelIds: string[] = (product.sales_channels ?? []).map((sc: any) => sc.id)
      const onMarketplace = MARKETPLACE_SC_ID ? channelIds.includes(MARKETPLACE_SC_ID) : false
      const onOwnStore    = OWN_STORE_SC_ID   ? channelIds.includes(OWN_STORE_SC_ID)   : false
      if (onMarketplace && onOwnStore)   { bothChannelsCount++; marketplaceCount++; ownStoreCount++ }
      else if (onMarketplace)            marketplaceCount++
      else if (onOwnStore)               ownStoreCount++
    }
  } catch (e) { console.error("[vendorContext] product count error:", e) }

  let pendingOrders: any[] = [], recentOrders: any[] = [], allOrdersMapped: any[] = []
  try {
    const { data: vendorData } = await query.graph({
      entity: "vendor", fields: ["orders.id"], filters: { id: vendorId },
    })
    const orderIds: string[] = (vendorData?.[0]?.orders ?? []).map((o: any) => o.id).filter(Boolean)

    if (orderIds.length > 0) {
      const { result: orders } = await getOrdersListWorkflow(scope).run({
        input: {
          fields: [
            "id", "display_id", "status", "payment_status", "fulfillment_status",
            "created_at", "total", "metadata",
            "items.id", "items.title", "items.unit_price", "items.quantity", "items.tax_total",
            "customer.first_name", "customer.last_name", "customer.email",
            "fulfillments.id", "fulfillments.packed_at", "fulfillments.shipped_at",
            "fulfillments.delivered_at", "fulfillments.canceled_at",
            "fulfillments.items.line_item_id", "fulfillments.items.item_id", "fulfillments.items.quantity",
            "payment_collections.payments.provider_id",
          ],
          variables: { filters: { id: orderIds } },
        },
      })

      const sorted = [...(orders ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      const mapOrder = (o: any) => {
        const vendorItemIds           = getVendorItemIds(o, vendorId)
        const vendorFulfillmentStatus = calcVendorFulfillmentStatus(vendorItemIds, o.fulfillments ?? [])
        const { finalPayout, processingFee, paymentMethod } = calcOrderPayout(o, vendorId)
        return {
          id: "#" + (o.display_id ?? o.id?.slice(-6)),
          customerName: ((o.customer?.first_name ?? "") + " " + (o.customer?.last_name ?? "")).trim()
            || o.customer?.email?.split("@")[0] || "Customer",
          total: Number(o.total) ?? 0,
          payout: finalPayout, processingFee, paymentMethod,
          displayStatus: deriveDisplayStatus(o.status ?? "", vendorFulfillmentStatus),
          paymentStatus: o.payment_status ?? "unknown",
          createdAt:     o.created_at ?? null,
        }
      }

      pendingOrders = sorted.filter((o) => {
        if (o.status === "canceled") return false
        const ids = getVendorItemIds(o, vendorId)
        const fs  = calcVendorFulfillmentStatus(ids, o.fulfillments ?? [])
        return ["not_fulfilled","partially_fulfilled","partially_shipped","partially_delivered"].includes(fs)
      })

      allOrdersMapped = sorted.map(mapOrder)
      recentOrders    = sorted.slice(0, 5).map(mapOrder)
    }
  } catch (e) { console.error("[vendorContext] orders fetch error:", e) }

  let walletBalance = 0, totalEarned = 0
  try {
    const payoutResult = await pgClient.raw(
      `SELECT COALESCE(wallet_balance,0) AS wallet_balance, COALESCE(total_earned,0) AS total_earned
         FROM "vendor_payout" WHERE vendor_id = ? LIMIT 1`,
      [vendorId],
    )
    const row = payoutResult.rows?.[0] ?? payoutResult[0]?.[0]
    if (row) { walletBalance = Number(row.wallet_balance); totalEarned = Number(row.total_earned) }
  } catch { /* silently skip */ }

  const revenueLastFive = recentOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)

  return {
    storeName:        vendor?.name ?? "Your Store",
    handle:           vendor?.handle ?? vendorId,
    membershipPlan:   (vendor?.plan ?? "free") as "free" | "creator" | "studio",
    planBillingCycle: vendor?.plan_billing_cycle ?? null,
    planActivatedAt:  vendor?.plan_activated_at ?? null,
    productCount, marketplaceCount, ownStoreCount, bothChannelsCount,
    pendingOrders:    pendingOrders.length,
    walletBalance, totalEarned, revenueLastFive,
    recentOrders, allOrders: allOrdersMapped, vendorStore,
  }
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "../../../lib/ai/buildSystemPrompt"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── POST /vendor/ai-assistant ────────────────────────────────────────────────

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { messages, vendorId } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
      vendorId: string
    }

    if (!messages || !vendorId) {
      return res.status(400).json({ error: "messages and vendorId are required" })
    }

    // Fetch live vendor context from Medusa
    const vendor = await getVendorContext(req, vendorId)

    const systemPrompt = buildSystemPrompt(vendor)

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const reply =
      response.content[0].type === "text" ? response.content[0].text : ""

    return res.json({ reply })
  } catch (err) {
    console.error("[AI assistant] Error:", err)
    return res.status(500).json({ error: "AI assistant failed. Please try again." })
  }
}

// ─── getVendorContext ─────────────────────────────────────────────────────────

async function getVendorContext(req: MedusaRequest, vendorId: string) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  // ── 1. Vendor core data + plan via raw SQL (matches your attachPlanFields pattern) ──
  let vendor: any = null
  try {
    vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
      relations: ["admins"],
    })

    // Same raw SQL pattern used in your existing attachPlanFields()
    const result = await pgClient.raw(
      `SELECT
        COALESCE(plan, 'free')  AS plan,
        plan_billing_cycle,
        plan_activated_at,
        razorpay_subscription_id
       FROM "vendor"
       WHERE id = ?`,
      [vendorId]
    )
    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan                = row.plan ?? "free"
      vendor.plan_billing_cycle  = row.plan_billing_cycle ?? null
      vendor.plan_activated_at   = row.plan_activated_at ?? null
    }
  } catch (e) {
    console.error("[AI assistant] vendor fetch error:", e)
  }

  // ── 2. Product count — try query.index first (fast), fall back to query.graph ──
  let productCount = 0
  try {
    const { data: products } = await query.index({
      entity: "product",
      fields: ["id"],
      filters: {
        status: "published",
        vendor: { id: vendorId },
      },
    })
    productCount = products?.length ?? 0
  } catch {
    try {
      const { data: vendorData } = await query.graph({
        entity: "vendor",
        fields: ["products.id"],
        filters: { id: vendorId },
      })
      productCount = vendorData?.[0]?.products?.length ?? 0
    } catch (e) {
      console.error("[AI assistant] product count fallback error:", e)
    }
  }

  // ── 3. Orders — pending count + recent 5 ─────────────────────────────────────
  let pendingOrders: any[] = []
  let recentOrders: any[] = []
  try {
    const { data: vendorData } = await query.graph({
      entity: "vendor",
      fields: [
        "orders.id",
        "orders.display_id",
        "orders.total",
        "orders.status",
        "orders.payment_status",
        "orders.fulfillment_status",
        "orders.created_at",
        "orders.customer.first_name",
        "orders.customer.last_name",
        "orders.customer.email",
      ],
      filters: { id: vendorId },
    })

    const allOrders: any[] = vendorData?.[0]?.orders ?? []

    // Sort newest first
    const sorted = [...allOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    pendingOrders = sorted.filter(
      (o) =>
        o.status === "pending" ||
        o.fulfillment_status === "not_fulfilled" ||
        o.fulfillment_status === "partially_fulfilled"
    )

    recentOrders = sorted.slice(0, 5)
  } catch (e) {
    console.error("[AI assistant] orders fetch error:", e)
  }

  // ── 4. Wallet balance + total earned from payout table ───────────────────────
  let walletBalance = 0
  let totalEarned = 0
  try {
    const payoutResult = await pgClient.raw(
      `SELECT
        COALESCE(wallet_balance, 0) AS wallet_balance,
        COALESCE(total_earned, 0)   AS total_earned
       FROM "vendor_payout"
       WHERE vendor_id = ?
       LIMIT 1`,
      [vendorId]
    )
    const row = payoutResult.rows?.[0] ?? payoutResult[0]?.[0]
    if (row) {
      walletBalance = Number(row.wallet_balance) ?? 0
      totalEarned   = Number(row.total_earned) ?? 0
    }
  } catch {
    // Payout table may not exist yet or table name differs — silently skip
  }

  // ── 5. Revenue from last 5 orders ────────────────────────────────────────────
  const revenueLastFive = recentOrders.reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  )

  return {
    storeName:        vendor?.name ?? "Your Store",
    handle:           vendor?.handle ?? vendorId,
    membershipPlan:   (vendor?.plan ?? "free") as "free" | "creator" | "studio",
    planBillingCycle: vendor?.plan_billing_cycle ?? null,
    planActivatedAt:  vendor?.plan_activated_at ?? null,
    productCount,
    pendingOrders:    pendingOrders.length,
    walletBalance,
    totalEarned,
    revenueLastFive,
    recentOrders: recentOrders.map((o) => ({
      id:                `#${o.display_id ?? o.id.slice(-6)}`,
      customerName:
        `${o.customer?.first_name ?? ""} ${o.customer?.last_name ?? ""}`.trim() ||
        o.customer?.email?.split("@")[0] ||
        "Customer",
      total:             o.total ?? 0,
      status:            o.status ?? "unknown",
      paymentStatus:     o.payment_status ?? "unknown",
      fulfillmentStatus: o.fulfillment_status ?? "unknown",
    })),
  }
}
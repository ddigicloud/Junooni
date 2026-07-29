import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Resend } from "resend"
import { buildSystemPrompt } from "../../../lib/ai/buildSystemPrompt"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

const MARKETPLACE_SC_ID = process.env.DEFAULT_STORE_SALES_CHANNEL_ID ?? ""
const OWN_STORE_SC_ID   = process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? ""

// ─── Support trigger detection ────────────────────────────────────────────────

const SUPPORT_TRIGGERS = [
  "talk to support", "contact support", "human support",
  "speak to someone", "talk to a person", "talk to human", "real person",
  "connect me to", "raise a ticket", "support ticket", "email support",
  "need help from", "contact a person", "i want to contact",
  "talk to someone", "speak with a human", "speak with support",
  "support@junooni.com",
  "not received my payment", "not received my payout", "payout not received",
  "payment not received", "where is my payout", "where is my payment",
  "when will i get my payout", "when will i get my payment",
  "my payout is pending", "payout pending", "payment pending",
  "last month payout", "last month payment", "payout of my last month",
  "not credited", "money not received",
  "baat karni hai", "support chahiye", "insaan se baat", "human se baat",
  "paise nahi aaye", "payment nahi aaya", "payout nahi aaya",
  "mujhe baat karni", "kisi se baat",
]

function isSupportRequest(message: string): boolean {
  const lower = message.toLowerCase()
  return SUPPORT_TRIGGERS.some((trigger) => lower.includes(trigger))
}

// ─── Derive single clean display status ──────────────────────────────────────

function deriveDisplayStatus(orderStatus: string, fulfillmentStatus: string): string {
  if (orderStatus === "canceled") return "canceled"
  if (fulfillmentStatus === "delivered") return "delivered"
  if (fulfillmentStatus === "partially_delivered") return "partially_delivered"
  if (fulfillmentStatus === "shipped") return "shipped"
  if (fulfillmentStatus === "partially_shipped") return "partially_shipped"
  if (fulfillmentStatus === "fulfilled") return "shipped"
  if (fulfillmentStatus === "partially_fulfilled") return "partially_shipped"
  return "pending_fulfillment"
}

// ─── Vendor-specific fulfillment status ──────────────────────────────────────

function calcVendorFulfillmentStatus(
  vendorItemIds: Set<string>,
  fulfillments: any[]
): string {
  if (!fulfillments?.length || !vendorItemIds.size) return "not_fulfilled"

  let totalQty     = 0
  let deliveredQty = 0
  let shippedQty   = 0
  let fulfilledQty = 0

  for (const ful of fulfillments) {
    if (ful.canceled_at) continue

    const vendorFulItems = (ful.items ?? []).filter(
      (fi: any) =>
        vendorItemIds.has(fi.line_item_id) ||
        vendorItemIds.has(fi.item_id)
    )
    if (!vendorFulItems.length) continue

    for (const fi of vendorFulItems) {
      const qty = fi.quantity ?? 1
      totalQty += qty

      if (ful.delivered_at) {
        deliveredQty += qty
        shippedQty   += qty
        fulfilledQty += qty
      } else if (ful.shipped_at) {
        shippedQty   += qty
        fulfilledQty += qty
      } else if (ful.packed_at) {
        fulfilledQty += qty
      }
    }
  }

  if (totalQty === 0)            return "not_fulfilled"
  if (deliveredQty === totalQty) return "delivered"
  if (deliveredQty > 0)          return "partially_delivered"
  if (shippedQty === totalQty)   return "shipped"
  if (shippedQty > 0)            return "partially_shipped"
  if (fulfilledQty === totalQty) return "fulfilled"
  if (fulfilledQty > 0)          return "partially_fulfilled"
  return "not_fulfilled"
}

// ─── Get vendor item IDs from order metadata ──────────────────────────────────

function getVendorItemIds(order: any, vendorId: string): Set<string> {
  const vendorOrder = (order.metadata?.vendor_orders ?? []).find(
    (vo: any) => vo.vendor_id === vendorId
  )
  const vendorMetaItems: any[] = vendorOrder?.vendor_items ?? []
  const vendorItemIds = new Set<string>()

  for (const metaItem of vendorMetaItems) {
    const matched = (order.items ?? []).find(
      (i: any) =>
        i.title?.toLowerCase().trim() === metaItem.title?.toLowerCase().trim()
    )
    if (matched) vendorItemIds.add(matched.id)
  }

  return vendorItemIds
}

// ─── Payout calculation (mirrors orders/[id]/route.ts logic) ─────────────────

function detectPaymentMethodFromOrder(order: any): string {
  if (order.payment_collections?.length) {
    for (const collection of order.payment_collections) {
      if (collection.payments?.some(
        (p: any) => p.provider_id?.toLowerCase().includes("razorpay")
      )) return "razorpay"
    }
  }
  return "cod"
}

function calcPaymentProcessingFee(
  vendorSubtotal: number,
  paymentMethod: string
): number {
  if (paymentMethod === "cod") return 0
  // Razorpay: 2% gateway fee + 18% GST on that fee
  const gatewayFee = vendorSubtotal * 0.02
  const gstOnFee   = gatewayFee * 0.18
  return gatewayFee + gstOnFee
}

function calcItemPayout(item: any, vendorId: string, order: any): number {
  const itemTotal    = item.unit_price * item.quantity
  const itemTaxTotal = item.tax_total ?? 0

  // Get cost_price and fulfillment_type from order metadata vendor_items
  const vendorOrder = (order.metadata?.vendor_orders ?? []).find(
    (vo: any) => vo.vendor_id === vendorId
  )
  const metaItem = (vendorOrder?.vendor_items ?? []).find(
    (vi: any) =>
      vi.title === item.title && vi.unit_price === item.unit_price
  )

  let productCost     = 0
  let fulfillmentType = "unknown"

  if (metaItem) {
    productCost = Number(metaItem.cost_price) || 0

    if (metaItem.fulfillment_type) {
      try {
        const ft = typeof metaItem.fulfillment_type === "string"
          ? JSON.parse(metaItem.fulfillment_type)
          : metaItem.fulfillment_type
        fulfillmentType = ft?.type ?? "unknown"
      } catch {
        const match = String(metaItem.fulfillment_type).match(/"type":"([^"]+)"/)
        if (match) fulfillmentType = match[1]
      }
    }
  }

  switch (fulfillmentType) {
    case "JUNOONI-fulfillment": {
      // (item price - GST) - (cost price × qty)
      const itemWithoutTax   = itemTotal - itemTaxTotal
      const totalProductCost = productCost * item.quantity
      return Math.max(0, itemWithoutTax - totalProductCost)
    }
    case "Creator-fulfillment":
    case "Creator-fulfilment":
      return itemTotal * 0.90
    default:
      return itemTotal * 0.90
  }
}

function calcOrderPayout(order: any, vendorId: string): {
  vendorRevenue: number
  processingFee: number
  finalPayout:   number
  paymentMethod: string
} {
  const vendorOrder     = (order.metadata?.vendor_orders ?? []).find(
    (vo: any) => vo.vendor_id === vendorId
  )
  const vendorMetaItems: any[] = vendorOrder?.vendor_items ?? []

  // Match actual order items to this vendor's metadata items
  const vendorItems = (order.items ?? []).filter((item: any) =>
    vendorMetaItems.some(
      (vi: any) =>
        vi.title === item.title && vi.unit_price === item.unit_price
    )
  )

  const vendorRevenue = vendorItems.reduce(
    (sum: number, item: any) => sum + calcItemPayout(item, vendorId, order),
    0
  )
  const vendorSubtotal = vendorItems.reduce(
    (sum: number, item: any) => sum + item.unit_price * item.quantity,
    0
  )

  const paymentMethod = detectPaymentMethodFromOrder(order)
  const processingFee = calcPaymentProcessingFee(vendorSubtotal, paymentMethod)
  const finalPayout   = Math.max(0, vendorRevenue - processingFee)

  return { vendorRevenue, processingFee, finalPayout, paymentMethod }
}

// ─── POST /vendors/ai-assistant ───────────────────────────────────────────────

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { messages, vendorId, action, supportMessage, currentPage } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
      vendorId: string
      action?: string
      supportMessage?: string
      currentPage?: string
    }

    if (!messages || !vendorId) {
      return res.status(400).json({ error: "messages and vendorId are required" })
    }

    const vendor = await getVendorContext(req, vendorId)
    const lastMessage = messages[messages.length - 1]

    // ── Ticket flow: send support email ───────────────────────────────────────
    if (action === "send_support_email" && supportMessage) {
      const conversationText = messages
        .map((m) => (m.role === "user" ? "Creator" : "JUNI") + ": " + m.content)
        .join("\n\n")

      const emailHtml = [
        '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">',
        '<div style="background: #e65100; padding: 20px 24px; border-radius: 8px 8px 0 0;">',
        '<h2 style="color: white; margin: 0; font-size: 20px;">Support Ticket via JUNI</h2>',
        '<p style="color: #ffe0cc; margin: 4px 0 0; font-size: 13px;">Creator raised a support ticket through JUNI AI assistant</p>',
        '</div>',
        '<div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none;">',
        '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: white; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">',
        '<tr style="background: #fff8f5;"><td style="padding: 10px 14px; font-weight: 600; color: #666; width: 130px; font-size: 13px;">Store Name</td><td style="padding: 10px 14px; font-size: 14px;">' + vendor.storeName + '</td></tr>',
        '<tr><td style="padding: 10px 14px; font-weight: 600; color: #666; font-size: 13px;">Handle</td><td style="padding: 10px 14px; font-size: 14px; color: #e65100;">@' + vendor.handle + '</td></tr>',
        '<tr style="background: #fff8f5;"><td style="padding: 10px 14px; font-weight: 600; color: #666; font-size: 13px;">Plan</td><td style="padding: 10px 14px; font-size: 14px;">' + vendor.membershipPlan.toUpperCase() + '</td></tr>',
        '<tr><td style="padding: 10px 14px; font-weight: 600; color: #666; font-size: 13px;">Products</td><td style="padding: 10px 14px; font-size: 14px;">' + vendor.productCount + '</td></tr>',
        '<tr style="background: #fff8f5;"><td style="padding: 10px 14px; font-weight: 600; color: #666; font-size: 13px;">Vendor ID</td><td style="padding: 10px 14px; font-size: 12px; color: #999;">' + vendorId + '</td></tr>',
        '</table>',
        '<h3 style="color: #e65100; margin: 0 0 10px; font-size: 15px;">Creator\'s Support Message</h3>',
        '<div style="background: #fff3e0; border-left: 4px solid #e65100; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">',
        '<p style="margin: 0; font-size: 15px; line-height: 1.6;">' + supportMessage + '</p>',
        '</div>',
        '<h3 style="color: #555; margin: 0 0 10px; font-size: 15px;">Full Conversation</h3>',
        '<div style="background: white; border: 1px solid #eee; border-radius: 6px; padding: 16px; white-space: pre-wrap; font-size: 13px; color: #444; line-height: 1.8;">' + conversationText + '</div>',
        '</div>',
        '<div style="background: #333; padding: 12px 20px; border-radius: 0 0 8px 8px; text-align: center;">',
        '<p style="color: #999; font-size: 12px; margin: 0;">Sent by JUNI — JUNOONI Creator Studio AI Assistant</p>',
        '</div>',
        '</div>',
      ].join("")

      try {
        await resend.emails.send({
          from: "JUNI Assistant <noreply@junooni.com>",
          to: ["support@junooni.com"],
          subject: "Support Ticket from @" + vendor.handle + " - " + vendor.storeName,
          html: emailHtml,
        })
        console.log("[AI assistant] Support ticket sent for @" + vendor.handle)
      } catch (emailErr) {
        console.error("[AI assistant] Support email failed:", emailErr)
        return res.status(500).json({ error: "Failed to send support email." })
      }

      return res.json({ reply: "email_sent" })
    }

    // ── Normal Gemini chat ────────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(vendor, currentPage)

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    })

    const geminiHistory = messages
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))

    while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
      geminiHistory.shift()
    }

    const chat = model.startChat({ history: geminiHistory })
    const result = await chat.sendMessage(lastMessage.content)
    const reply = result.response.text()

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

  // ── 1. Vendor core data + plan ────────────────────────────────────────────
  let vendor: any = null
  try {
    vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
      relations: ["admins"],
    })

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
      vendor.plan               = row.plan ?? "free"
      vendor.plan_billing_cycle = row.plan_billing_cycle ?? null
      vendor.plan_activated_at  = row.plan_activated_at ?? null
    }
  } catch (e) {
    console.error("[AI assistant] vendor fetch error:", e)
  }

  // ── 1.5. Own store data ───────────────────────────────────────────────────
  let vendorStore: any = null
  try {
    const { data: storeData } = await query.graph({
      entity: "vendor",
      fields: [
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
        "vendor_store.seo_title",
        "vendor_store.seo_description",
        "vendor_store.sections",
        "vendor_store.pages",
        "vendor_store.collections",
        "vendor_store.settings",
      ],
      filters: { id: vendorId },
    })

    const raw = storeData?.[0]?.vendor_store ?? null
    if (raw) {
      const settings = raw.settings ?? {}
      vendorStore = {
        id:               raw.id,
        subdomain:        raw.subdomain ?? null,
        customDomain:     raw.custom_domain ?? null,
        domainVerified:   raw.domain_verified ?? false,
        template:         raw.template ?? "minimal",
        status:           raw.status ?? "draft",
        passwordEnabled:  raw.password_enabled ?? false,
        primaryColor:     raw.primary_color ?? null,
        secondaryColor:   raw.secondary_color ?? null,
        font:             raw.font ?? null,
        seoTitle:         raw.seo_title ?? null,
        seoDescription:   raw.seo_description ?? null,
        tagline:          settings.tagline ?? null,
        announcementText: settings.announcement_text ?? null,
        sectionsCount:    Array.isArray(raw.sections?.sections)
                            ? raw.sections.sections.length
                            : 0,
        pagesCount:       Array.isArray(raw.pages?.pages)
                            ? raw.pages.pages.length
                            : 0,
        collectionsCount: Array.isArray(raw.collections?.collections)
                            ? raw.collections.collections.length
                            : 0,
        storeUrl: raw.custom_domain && raw.domain_verified
          ? `https://${raw.custom_domain}`
          : raw.subdomain
            ? `https://${raw.subdomain}.junooni.com`
            : `https://${vendor?.handle ?? vendorId}.junooni.com`,
      }
    }
  } catch (e) {
    console.error("[AI assistant] vendor store fetch error:", e)
  }

  // ── 2. Products with sales channel breakdown ──────────────────────────────
  let productCount      = 0
  let marketplaceCount  = 0
  let ownStoreCount     = 0
  let bothChannelsCount = 0

  try {
    const { data: vendorProducts } = await query.graph({
      entity: "vendor",
      fields: [
        "products.id",
        "products.status",
        "products.sales_channels.id",
      ],
      filters: { id: vendorId },
    })

    const allProducts = (vendorProducts?.[0]?.products ?? []).filter(
      (p: any) => p.status === "published"
    )

    productCount = allProducts.length

    for (const product of allProducts) {
      const channelIds: string[] = (product.sales_channels ?? []).map(
        (sc: any) => sc.id
      )

      const onMarketplace = MARKETPLACE_SC_ID
        ? channelIds.includes(MARKETPLACE_SC_ID)
        : false
      const onOwnStore = OWN_STORE_SC_ID
        ? channelIds.includes(OWN_STORE_SC_ID)
        : false

      if (onMarketplace && onOwnStore) {
        bothChannelsCount++
        marketplaceCount++
        ownStoreCount++
      } else if (onMarketplace) {
        marketplaceCount++
      } else if (onOwnStore) {
        ownStoreCount++
      }
    }
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

  // ── 3. Orders via getOrdersListWorkflow ───────────────────────────────────

  let pendingOrders:   any[] = []
  let recentOrders:    any[] = []
  let allOrdersMapped: any[] = []

  try {
    const { data: vendorData } = await query.graph({
      entity: "vendor",
      fields: ["orders.id"],
      filters: { id: vendorId },
    })

    const orderIds: string[] = (vendorData?.[0]?.orders ?? [])
      .map((o: any) => o.id)
      .filter(Boolean)

    if (orderIds.length > 0) {
      const { result: orders } = await getOrdersListWorkflow(req.scope).run({
        input: {
          fields: [
            "id",
            "display_id",
            "status",
            "payment_status",
            "fulfillment_status",
            "created_at",
            "total",
            "metadata",
            "items.id",
            "items.title",
            "items.unit_price",
            "items.quantity",
            "items.tax_total",
            "customer.first_name",
            "customer.last_name",
            "customer.email",
            "fulfillments.id",
            "fulfillments.packed_at",
            "fulfillments.shipped_at",
            "fulfillments.delivered_at",
            "fulfillments.canceled_at",
            "fulfillments.items.line_item_id",
            "fulfillments.items.item_id",
            "fulfillments.items.quantity",
            "payment_collections.payments.provider_id",
          ],
          variables: {
            filters: { id: orderIds },
          },
        },
      })

      const sorted = [...(orders ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      const mapOrder = (o: any) => {
        const vendorItemIds = getVendorItemIds(o, vendorId)
        const vendorFulfillmentStatus = calcVendorFulfillmentStatus(
          vendorItemIds,
          o.fulfillments ?? []
        )
        const { finalPayout, processingFee, paymentMethod } = calcOrderPayout(o, vendorId)

        return {
          id: "#" + (o.display_id ?? o.id?.slice(-6)),
          customerName:
            ((o.customer?.first_name ?? "") + " " + (o.customer?.last_name ?? "")).trim() ||
            o.customer?.email?.split("@")[0] ||
            "Customer",
          total:         Number(o.total) ?? 0,  // customer-facing total in rupees
          payout:        finalPayout,             // vendor actual earnings after fees
          processingFee,
          paymentMethod,
          displayStatus: deriveDisplayStatus(o.status ?? "", vendorFulfillmentStatus),
          paymentStatus: o.payment_status ?? "unknown",
          createdAt:     o.created_at ?? null,
        }
      }

      pendingOrders = sorted.filter((o) => {
        if (o.status === "canceled") return false
        const vendorItemIds = getVendorItemIds(o, vendorId)
        const vendorFulfillmentStatus = calcVendorFulfillmentStatus(
          vendorItemIds,
          o.fulfillments ?? []
        )
        return (
          vendorFulfillmentStatus === "not_fulfilled"       ||
          vendorFulfillmentStatus === "partially_fulfilled" ||
          vendorFulfillmentStatus === "partially_shipped"   ||
          vendorFulfillmentStatus === "partially_delivered"
        )
      })

      allOrdersMapped = sorted.map(mapOrder)
      recentOrders    = sorted.slice(0, 5).map(mapOrder)
    }
  } catch (e) {
    console.error("[AI assistant] orders fetch error:", e)
  }

  // ── 4. Wallet ─────────────────────────────────────────────────────────────
  let walletBalance = 0
  let totalEarned   = 0
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
    // silently skip
  }

  // ── 5. Revenue from last 5 orders (already rupees from workflow) ──────────
  const revenueLastFive = recentOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)

  return {
    storeName:        vendor?.name ?? "Your Store",
    handle:           vendor?.handle ?? vendorId,
    membershipPlan:   (vendor?.plan ?? "free") as "free" | "creator" | "studio",
    planBillingCycle: vendor?.plan_billing_cycle ?? null,
    planActivatedAt:  vendor?.plan_activated_at ?? null,
    productCount,
    marketplaceCount,
    ownStoreCount,
    bothChannelsCount,
    pendingOrders:    pendingOrders.length,
    walletBalance,    // paise
    totalEarned,      // paise
    revenueLastFive,  // rupees
    recentOrders,
    allOrders:        allOrdersMapped,
    vendorStore,
  }
}
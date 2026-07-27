import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Resend } from "resend"
import { buildSystemPrompt } from "../../../lib/ai/buildSystemPrompt"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

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

// ─── POST /vendors/ai-assistant ───────────────────────────────────────────────

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { messages, vendorId, action, supportMessage } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
      vendorId: string
      action?: string
      supportMessage?: string
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
    const systemPrompt = buildSystemPrompt(vendor)

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

  // ── 2. Product count ──────────────────────────────────────────────────────
  let productCount = 0
  try {
    const { data: products } = await query.index({
      entity: "product",
      fields: ["id"],
      filters: { status: "published", vendor: { id: vendorId } },
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

  // ── 3. Orders ─────────────────────────────────────────────────────────────
  let pendingOrders: any[] = []
  let recentOrders: any[] = []
  try {
    const { data: vendorData } = await query.graph({
      entity: "vendor",
      fields: [
        "orders.id", "orders.display_id", "orders.total", "orders.status",
        "orders.payment_status", "orders.fulfillment_status", "orders.created_at",
        "orders.customer.first_name", "orders.customer.last_name", "orders.customer.email",
      ],
      filters: { id: vendorId },
    })

    const allOrders: any[] = vendorData?.[0]?.orders ?? []
    const sorted = [...allOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  // ── 4. Wallet ─────────────────────────────────────────────────────────────
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
    // silently skip
  }

  // ── 5. Revenue from last 5 orders ─────────────────────────────────────────
  const revenueLastFive = recentOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)

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
      id:                "#" + (o.display_id ?? o.id.slice(-6)),
      customerName:
        (o.customer?.first_name ?? "" + " " + o.customer?.last_name ?? "").trim() ||
        o.customer?.email?.split("@")[0] ||
        "Customer",
      total:             o.total ?? 0,
      status:            o.status ?? "unknown",
      paymentStatus:     o.payment_status ?? "unknown",
      fulfillmentStatus: o.fulfillment_status ?? "unknown",
    })),
  }
}

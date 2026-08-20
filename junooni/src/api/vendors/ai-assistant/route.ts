import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import { Resend } from "resend"

import { buildSystemPrompt } from "../../../lib/ai/buildSystemPrompt"
import { JUNI_TOOLS }  from "../../../lib/ai/toolDefinitions"
import { handleTool }  from "../../../lib/ai/toolHandlers"
import { INLINE_PRODUCT_TOOLS, INLINE_PRODUCT_EXTRA_TOOLS } from "../../../lib/ai/inline-product-tools"
import { INLINE_PRODUCT_PROMPT, PRICING_AND_ARTWORK_PROMPT_ADDITION } from "../../../lib/ai/inline-product-prompt"
import {
  handleDetectProductIntent,
  handleSearchBlanks,
  handleGetBlankDetails,
  handleSuggestPrice,
  handleGenerateInlineMockup,
  handleCreateProductFromChat,
  handleCalculateRealPrice,
  handleRemoveBackground,
  storeDesignFile,
  storeMockupPreview,
  getMockupPreview,
  // FIX: registry persists all color mockup sessions across POST requests
  getVendorMockupSessions,
  clearVendorMockupSessions,
  getMockupArea,
  getMockupColorName,
} from "../../../lib/ai/inline-product-handlers"

import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE }   from "../../../modules/marketplace"

let _genAI: any = null
async function getGenAI() {
  if (!_genAI) {
    const { GoogleGenAI } = await import("@google/genai")
    _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  }
  return _genAI
}

const resend = new Resend(process.env.RESEND_API_KEY)

const MARKETPLACE_SC_ID = process.env.DEFAULT_STORE_SALES_CHANNEL_ID ?? ""
const OWN_STORE_SC_ID   = process.env.CREATOR_STORE_SALES_CHANNEL_ID ?? ""
const MAX_TOOL_ITERATIONS = 8

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

// ─── Order/payout helpers ─────────────────────────────────────────────────────

function deriveDisplayStatus(orderStatus: string, fulfillmentStatus: string): string {
  if (orderStatus === "canceled")                  return "canceled"
  if (fulfillmentStatus === "delivered")           return "delivered"
  if (fulfillmentStatus === "partially_delivered") return "partially_delivered"
  if (fulfillmentStatus === "shipped")             return "shipped"
  if (fulfillmentStatus === "partially_shipped")   return "partially_shipped"
  if (fulfillmentStatus === "fulfilled")           return "shipped"
  if (fulfillmentStatus === "partially_fulfilled") return "partially_shipped"
  return "pending_fulfillment"
}

function calcVendorFulfillmentStatus(vendorItemIds: Set<string>, fulfillments: any[]): string {
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
      if (ful.delivered_at) { deliveredQty += qty; shippedQty += qty; fulfilledQty += qty }
      else if (ful.shipped_at) { shippedQty += qty; fulfilledQty += qty }
      else if (ful.packed_at)  { fulfilledQty += qty }
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

function getVendorItemIds(order: any, vendorId: string): Set<string> {
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

function detectPaymentMethodFromOrder(order: any): string {
  if (order.payment_collections?.length) {
    for (const collection of order.payment_collections) {
      if (collection.payments?.some((p: any) => p.provider_id?.toLowerCase().includes("razorpay")))
        return "razorpay"
    }
  }
  return "cod"
}

function calcPaymentProcessingFee(vendorSubtotal: number, paymentMethod: string): number {
  if (paymentMethod === "cod") return 0
  const gatewayFee = vendorSubtotal * 0.02
  return gatewayFee + gatewayFee * 0.18
}

function calcItemPayout(item: any, vendorId: string, order: any): number {
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
    case "JUNOONI-fulfillment":   return Math.max(0, (itemTotal - itemTaxTotal) - productCost * item.quantity)
    case "Creator-fulfillment":
    case "Creator-fulfilment":    return itemTotal * 0.90
    default:                      return itemTotal * 0.90
  }
}

function calcOrderPayout(order: any, vendorId: string) {
  const vendorOrder     = (order.metadata?.vendor_orders ?? []).find((vo: any) => vo.vendor_id === vendorId)
  const vendorMetaItems = vendorOrder?.vendor_items ?? []
  const vendorItems     = (order.items ?? []).filter((item: any) =>
    vendorMetaItems.some((vi: any) => vi.title === item.title && vi.unit_price === item.unit_price)
  )
  const vendorRevenue  = vendorItems.reduce((sum: number, item: any) => sum + calcItemPayout(item, vendorId, order), 0)
  const vendorSubtotal = vendorItems.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const paymentMethod  = detectPaymentMethodFromOrder(order)
  const processingFee  = calcPaymentProcessingFee(vendorSubtotal, paymentMethod)
  return { vendorRevenue, processingFee, finalPayout: Math.max(0, vendorRevenue - processingFee), paymentMethod }
}

// ─── Tool dispatcher ──────────────────────────────────────────────────────────

async function dispatchTool(
  name: string,
  args: Record<string, any>,
  vendor: any,
  req: MedusaRequest,
  vendorId: string,
  approvedMockupSessionId?: string,
  productSession?: {
    selectedColors: Array<{ name: string; hex: string }>
    selectedSizes:  string[]
    designSessionId?: string
    blankId?:         string
    technologyId?:    string
    calculatedPrice?: number  // exact price from JuniMockupBridge.calculateJuniPricing
    priceBreakdown?:  any
    canvasLayoutBase64?: string  // manufacturer canvas layout PNG for artwork
    designsByArea?: Record<string, { sessionId: string; base64: string; filename: string }>  // multi-area
  },
  // FIX E2: All mockup session IDs so handler can upload every color image
  allMockupSessionsForProduct?: string[]
): Promise<any> {
  const storeTool = [
    "get_store_overview", "get_orders", "get_earnings",
    "get_products", "get_order_detail", "get_own_store", "get_pending_actions",
  ]
  if (storeTool.includes(name)) return handleTool(name as any, args, vendor)

  switch (name) {
    case "detect_product_intent":  return handleDetectProductIntent(args as { raw_request: string })
    case "search_blanks":          return await handleSearchBlanks(args as { query: string; limit?: number })
    case "get_blank_details":      return await handleGetBlankDetails(args as { blank_id: string })
    case "suggest_price":          return handleSuggestPrice(args as { base_cost: number; product_type: string; fulfillment_type?: string })
    case "calculate_real_price":   return await handleCalculateRealPrice(args as { blank_id: string; technology_id: string; areas?: string[] })
    case "remove_background":      return await handleRemoveBackground(args as { design_session_id: string; threshold?: number })
    case "generate_inline_mockup": return await handleGenerateInlineMockup(args as any)

    case "create_product_from_chat": {
      const createArgs = { ...args } as any

      // FIX E1+E3: Retrieve approved mockup from server-side store using session ID.
      // base64 NEVER travels in POST body — only session ID does.
      if (!createArgs.mockup_preview_base64 && approvedMockupSessionId) {
        const storedMockup = getMockupPreview(approvedMockupSessionId)
        if (storedMockup && storedMockup.length > 100) {
          createArgs.mockup_preview_base64 = storedMockup
          console.log(`[create_product_from_chat] ✅ Loaded approved mockup from store (${storedMockup.length} chars)`)
        } else {
          console.warn(`[create_product_from_chat] ⚠️ No mockup found for session=${approvedMockupSessionId}`)
        }
      }

      // FIX E2: Pass ALL color mockup session IDs so the handler can upload
      // every color variant's image to the product (not just the approved one).
      // allMockupSessionIds is built from the renderData assembly below — we
      // pass it via a shared variable set before dispatchTool is called.
      if (allMockupSessionsForProduct && allMockupSessionsForProduct.length > 0) {
        // Sessions from current request (parallel mockups just generated)
        createArgs.additional_mockup_sessions = allMockupSessionsForProduct
          .filter((sid: string) => sid !== approvedMockupSessionId)
        console.log(`[create_product_from_chat] Additional sessions from current request: ${createArgs.additional_mockup_sessions.length}`)
      } else {
        // create_product_from_chat runs in a LATER POST request than when mockups were generated.
        // allMockupSessionsForProduct is empty for this new request.
        // Use the vendor registry which persists across requests.
        const allRegistrySessions = getVendorMockupSessions(vendorId)
        createArgs.additional_mockup_sessions = allRegistrySessions
          .filter((sid: string) => sid !== approvedMockupSessionId)
        console.log(`[create_product_from_chat] Additional sessions from vendor registry: ${createArgs.additional_mockup_sessions.length} (total in registry: ${allRegistrySessions.length})`)
      }

      // FIX E5: Override colors/sizes from productSession if Gemini got them wrong
      if (productSession?.selectedColors?.length > 0) {
        const geminiColors = (createArgs.selected_colors ?? []) as Array<{ name: string; hex: string }>
        const sessionColors = productSession.selectedColors
        const geminiNames  = geminiColors.map((c: any) => c.name.toLowerCase()).sort().join(",")
        const sessionNames = sessionColors.map(c => c.name.toLowerCase()).sort().join(",")
        if (geminiNames !== sessionNames) {
          console.warn(`[create_product_from_chat] ⚠️ Colors mismatch — Gemini: [${geminiNames}] Session: [${sessionNames}] — using session`)
          createArgs.selected_colors = sessionColors
        }
      }
      if (productSession?.selectedSizes?.length > 0) {
        const geminiSizes  = (createArgs.selected_sizes ?? []) as string[]
        const sessionSizes = productSession.selectedSizes
        if ([...geminiSizes].sort().join(",") !== [...sessionSizes].sort().join(",")) {
          console.warn(`[create_product_from_chat] ⚠️ Sizes mismatch — Gemini: [${geminiSizes}] Session: [${sessionSizes}] — using session`)
          createArgs.selected_sizes = sessionSizes
        }
      }

      console.log(`[create_product_from_chat] Final colors: ${JSON.stringify(createArgs.selected_colors)}`)
      console.log(`[create_product_from_chat] Final sizes: ${JSON.stringify(createArgs.selected_sizes)}`)

      // Use exact price from JuniMockupBridge if Gemini didn't get a valid price from creator
      // IMPORTANT: creator's explicitly chosen price takes priority — only use calculated as fallback
      if (productSession?.calculatedPrice && productSession.calculatedPrice > 0) {
        const geminiPrice = createArgs.selling_price ?? 0
        const calculatedCost = productSession?.priceBreakdown?.finalPrice ?? 0
        // Only override if Gemini's price is missing, zero, or below cost (invalid)
        if (!geminiPrice || geminiPrice <= 0 || geminiPrice < calculatedCost) {
          console.log(`[create_product_from_chat] Gemini price ₹${geminiPrice} invalid/missing → using calculated ₹${productSession.calculatedPrice}`)
          createArgs.selling_price = productSession.calculatedPrice
        } else {
          console.log(`[create_product_from_chat] Using creator's price: ₹${geminiPrice} (calculated was ₹${productSession.calculatedPrice})`)
        }
      }

      // Pass canvas layout PNG for artwork file 2 (manufacturer reference)
      if (productSession?.canvasLayoutBase64) {
        createArgs.canvas_layout_base64 = productSession.canvasLayoutBase64
      }
      // Pass all canvas layouts for multi-area products
      if (productSession?.allCanvasLayouts && productSession.allCanvasLayouts.length > 1) {
        createArgs.all_canvas_layouts = productSession.allCanvasLayouts
      }

      // Pass per-area designs for multi-area artwork files
      if (productSession?.designsByArea && Object.keys(productSession.designsByArea).length > 1) {
        createArgs.designs_by_area = productSession.designsByArea
      }

      // Override design_session_id from server-side session (prevents Gemini using wrong/placeholder ID)
      if (productSession?.designSessionId) {
        createArgs.design_session_id = productSession.designSessionId
        console.log(`[create_product_from_chat] Using session design_session_id: ${productSession.designSessionId}`)
      }
      const result = await handleCreateProductFromChat(createArgs, req, vendorId)
      // Clear registry so next product creation starts fresh
      if (result?.ok) {
        clearVendorMockupSessions(vendorId)
        console.log(`[create_product_from_chat] ✅ Registry cleared for vendor ${vendorId}`)
      }
      return result
    }

    default: return { ok: false, error: `Unknown tool: ${name}` }
  }
}

// ─── POST /vendors/ai-assistant ───────────────────────────────────────────────

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      messages, vendorId, action, supportMessage, currentPage,
      base64, filename, mimeType,
      // FIX E3: Only session ID, never the base64 blob itself
      approvedMockupSessionId,
      productSession,
    } = req.body as {
      messages:                Array<{ role: "user" | "assistant"; content: string }>
      vendorId:                string
      action?:                 string
      supportMessage?:         string
      currentPage?:            string
      base64?:                 string
      filename?:               string
      mimeType?:               string
      approvedMockupSessionId?: string
      productSession?:         {
        selectedColors:  Array<{ name: string; hex: string }>
        selectedSizes:   string[]
        designSessionId?: string
        blankId?:         string
        technologyId?:    string
        calculatedPrice?: number  // exact price from JuniMockupBridge.calculateJuniPricing
        priceBreakdown?:  any
        canvasLayoutBase64?: string
        designsByArea?: Record<string, { sessionId: string; base64: string; filename: string }>
        allCanvasLayouts?: string[]   // one per area for multi-area
      }
    }

    if (!vendorId) return res.status(400).json({ error: "vendorId is required" })

    // ── Design file upload ────────────────────────────────────────────────────
    if (action === "upload_design") {
      if (!base64 || !filename) return res.status(400).json({ error: "base64 and filename are required" })
      const sessionId = storeDesignFile(vendorId, base64, filename, mimeType ?? "image/png")
      // Clear old mockup sessions when a new design is uploaded — new product creation starting
      clearVendorMockupSessions(vendorId)
      console.log(`[AI assistant] Design uploaded for vendor ${vendorId}: ${filename}, registry cleared`)
      return res.json({ sessionId })
    }

    // FIX E1+E3: Store approved mockup server-side, return session ID to frontend
    if (action === "store_mockup") {
      if (!base64) return res.status(400).json({ error: "base64 is required" })
      // area is passed for multi-area mockups so catalog generation knows which area to skip
      const area      = (req.body as any).area      as string | undefined
      const colorName  = (req.body as any).colorName  as string | undefined
      const mockupSessionId = storeMockupPreview(vendorId, base64, area, colorName)
      console.log(`[AI assistant] Mockup stored: vendor=${vendorId}, session=${mockupSessionId}, area=${area ?? "none"}`)
      return res.json({ mockupSessionId })
    }

    if (!messages) return res.status(400).json({ error: "messages is required" })

    const vendor      = await getVendorContext(req, vendorId)
    const lastMessage = messages[messages.length - 1]

    // ── Support email ─────────────────────────────────────────────────────────
    if (action === "send_support_email" && supportMessage) {
      const conversationText = messages
        .map((m) => (m.role === "user" ? "Creator" : "JUNI") + ": " + m.content)
        .join("\n\n")

      const emailHtml = [
        '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">',
        '<div style="background: #e65100; padding: 20px 24px; border-radius: 8px 8px 0 0;">',
        '<h2 style="color: white; margin: 0; font-size: 20px;">Support Ticket via JUNI</h2>',
        '</div>',
        '<div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none;">',
        '<table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:white;border-radius:6px;border:1px solid #eee;">',
        '<tr style="background:#fff8f5;"><td style="padding:10px 14px;font-weight:600;color:#666;width:130px;font-size:13px;">Store Name</td><td style="padding:10px 14px;font-size:14px;">' + vendor.storeName + '</td></tr>',
        '<tr><td style="padding:10px 14px;font-weight:600;color:#666;font-size:13px;">Handle</td><td style="padding:10px 14px;font-size:14px;color:#e65100;">@' + vendor.handle + '</td></tr>',
        '<tr style="background:#fff8f5;"><td style="padding:10px 14px;font-weight:600;color:#666;font-size:13px;">Plan</td><td style="padding:10px 14px;font-size:14px;">' + vendor.membershipPlan.toUpperCase() + '</td></tr>',
        '</table>',
        '<h3 style="color:#e65100;margin:0 0 10px;font-size:15px;">Creator\'s Message</h3>',
        '<div style="background:#fff3e0;border-left:4px solid #e65100;padding:14px 16px;border-radius:4px;margin-bottom:24px;"><p style="margin:0;font-size:15px;line-height:1.6;">' + supportMessage + '</p></div>',
        '<h3 style="color:#555;margin:0 0 10px;font-size:15px;">Full Conversation</h3>',
        '<div style="background:white;border:1px solid #eee;border-radius:6px;padding:16px;white-space:pre-wrap;font-size:13px;color:#444;line-height:1.8;">' + conversationText + '</div>',
        '</div>',
        '<div style="background:#333;padding:12px 20px;border-radius:0 0 8px 8px;text-align:center;"><p style="color:#999;font-size:12px;margin:0;">Sent by JUNI — JUNOONI Creator Studio</p></div></div>',
      ].join("")

      try {
        await resend.emails.send({
          from:    "JUNI Assistant <noreply@junooni.com>",
          to:      ["support@junooni.com"],
          subject: "Support Ticket from @" + vendor.handle + " — " + vendor.storeName,
          html:    emailHtml,
        })
      } catch (emailErr) {
        console.error("[AI assistant] Support email failed:", emailErr)
        return res.status(500).json({ error: "Failed to send support email." })
      }
      return res.json({ reply: "email_sent" })
    }

    // ── Gemini chat ───────────────────────────────────────────────────────────

    const systemPrompt =
      buildSystemPrompt(vendor, currentPage) +
      INLINE_PRODUCT_PROMPT +
      PRICING_AND_ARTWORK_PROMPT_ADDITION

    const functionDeclarations = [
      ...JUNI_TOOLS,
      ...INLINE_PRODUCT_TOOLS,
      ...INLINE_PRODUCT_EXTRA_TOOLS,
    ].map((tool: any) => ({
      name:        tool.name,
      description: tool.description,
      parameters:  tool.parameters,
    }))
    const allTools = [{ functionDeclarations }]

    const MAX_HISTORY = 10
    const rawHistory = messages.slice(0, -1).slice(-MAX_HISTORY)
    const geminiHistory = rawHistory.map((m) => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
    while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
      geminiHistory.shift()
    }

    const genAI = await getGenAI()
    const chat = genAI.chats.create({
      model: "gemini-3.5-flash",
      history: geminiHistory,
      config: {
        systemInstruction: systemPrompt,
        tools: allTools,
        toolConfig: { functionCallingConfig: { mode: "AUTO" } },
      },
    })

    let result = await chat.sendMessage({ message: lastMessage.content })

    let iterations    = 0
    let lastToolName: string | undefined
    const allToolResults: any[] = []
    // FIX E2: Track all mockup session IDs generated for this product
    // so create_product_from_chat can upload all color images
    const allMockupSessionsForProduct: string[] = []

    while (iterations < MAX_TOOL_ITERATIONS) {
      const functionCalls: any[] = (result as any).functionCalls ?? []
      console.log(`[JUNI loop] iteration=${iterations} functionCalls=${functionCalls.length}`)
      if (functionCalls.length > 0) {
        console.log(`[JUNI loop] calls:`, functionCalls.map((fc:any) => fc.name).join(", "))
      }
      if (functionCalls.length === 0) break

      const toolResultParts: any[] = []

      for (const call of functionCalls) {
        lastToolName = call.name
        console.log(`[JUNI MCP] Tool: ${call.name}`, JSON.stringify(call.args ?? {}).slice(0, 200))

        let toolResult: any
        try {
          toolResult = await dispatchTool(
            call.name, call.args ?? {}, vendor, req, vendorId,
            approvedMockupSessionId,
            productSession,
            allMockupSessionsForProduct  // FIX E2
          )
        } catch (err: any) {
          toolResult = { ok: false, error: err?.message ?? "Tool execution error" }
        }

        allToolResults.push(toolResult)
        console.log(`[JUNI tool result] ${call.name}:`, {
          ok:          toolResult?.ok,
          render_type: toolResult?.data?.render_type ?? "none",
          data_keys:   toolResult?.data ? Object.keys(toolResult.data).slice(0,8).join(",") : "none",
        })

        // FIX E2: Store mockup previews server-side IMMEDIATELY after each tool result.
        // This must happen INSIDE the tool loop (not during renderData assembly)
        // so allMockupSessionsForProduct is populated BEFORE create_product_from_chat runs.
        if (toolResult?.ok && toolResult?.data?.render_type === "MOCKUP_PREVIEW" && toolResult?.data?.preview_base64) {
          const sid = storeMockupPreview(vendorId, toolResult.data.preview_base64, toolResult.data.area, toolResult.data.color_name)
          toolResult.data._mockup_session_id = sid
          allMockupSessionsForProduct.push(sid)
          console.log(`[JUNI loop] Mockup stored immediately: session=${sid}, color=${toolResult.data?.color_name}`)
        }

        // FIX E3: Strip preview_base64 from tool result before sending back to Gemini
        // Gemini doesn't need the actual image bytes — just needs to know it succeeded
        const responseForGemini = toolResult?.ok
          ? (() => {
              const d = { ...(toolResult.data ?? toolResult) }
              delete d.preview_base64  // strip the large field
              return d
            })()
          : { error: toolResult?.error ?? "Tool failed" }

        toolResultParts.push({
          functionResponse: {
            id:       call.id ?? call.name,
            name:     call.name,
            response: responseForGemini,
          },
        })
      }

      result = await chat.sendMessage({ message: toolResultParts })
      iterations++
    }

    // ── Generate parallel color mockups ───────────────────────────────────────
    const firstMockupResult = allToolResults.find(
      (r: any) => r?.ok && r?.data?.render_type === "MOCKUP_PREVIEW"
    )

    if (firstMockupResult) {
      const firstData = firstMockupResult.data

      const hexPart = messages
        .map((m: any) => m.content)
        .reverse()
        .find((c: string) => c.includes("HEX:"))

      if (hexPart && firstData?.blank_id && firstData?.design_session_id) {
        const hexMatch = hexPart.match(/HEX:\s*([^|]+)/i)
        if (hexMatch) {
          const colorPairs = hexMatch[1].trim().split(",").map((s: string) => s.trim())
          const allColors  = colorPairs.map((pair: string) => {
            const colonIdx = pair.lastIndexOf(":")
            if (colonIdx === -1) return null
            return { name: pair.slice(0, colonIdx).trim(), hex: pair.slice(colonIdx + 1).trim() }
          }).filter((c: any) => c && c.hex?.startsWith("#"))

          const remainingColors = allColors.filter(
            (c: any) => c.hex.toLowerCase() !== (firstData.color_hex ?? "").toLowerCase()
          )

          if (remainingColors.length > 0) {
            console.log(`[JUNI parallel mockups] Generating ${remainingColors.length} more: ${remainingColors.map((c:any)=>c.name).join(", ")}`)
            const extraMockups = await Promise.allSettled(
              remainingColors.slice(0, 5).map((color: any) =>
                handleGenerateInlineMockup({
                  blank_id:           firstData.blank_id,
                  technology_id:      firstData.technology_id,
                  selected_color_hex: color.hex,
                  color_name:         color.name,
                  design_session_id:  firstData.design_session_id,
                  area:               firstData.area ?? "front",
                  position:           firstData.position ?? "center",
                })
              )
            )
            for (const settled of extraMockups) {
              if (settled.status === "fulfilled" && settled.value?.ok) {
                const mv = settled.value
                // Store server-side immediately so allMockupSessionsForProduct is complete
                if (mv.data?.preview_base64) {
                  const sid = storeMockupPreview(vendorId, mv.data.preview_base64, mv.data.area, mv.data.color_name)
                  mv.data._mockup_session_id = sid
                  allMockupSessionsForProduct.push(sid)
                  console.log(`[JUNI parallel mockups] ✅ ${mv.data?.color_name} stored: session=${sid}`)
                }
                allToolResults.push(mv)
              }
            }
          }
        }
      }
    }

    // ── Assemble render data ──────────────────────────────────────────────────
    const reply = result.text ?? ""

    // ── Assemble render data ──────────────────────────────────────────────────
    // Mockups were already stored server-side inside the tool loop above.
    // renderData assembly just reads the pre-stored session ID (_mockup_session_id)
    // and strips preview_base64 from the response body to prevent 413 errors.
    const renderData = allToolResults
      .filter(r => r?.ok && r?.data?.render_type)
      .map(r => {
        const d = { ...r.data }
        if (d.render_type === "MOCKUP_PREVIEW") {
          // Use the session ID already stored during tool loop
          d.mockup_session_id = d._mockup_session_id ?? ""
          delete d.preview_base64       // never send base64 in response
          delete d._mockup_session_id   // clean up internal field
          console.log(`[AI assistant] renderData mockup: session=${d.mockup_session_id}, color=${d.color_name}`)
        }
        return d
      })

    console.log(`[AI assistant] renderData: ${renderData.length}:`, renderData.map((r:any)=>r?.render_type).join(", "))

    return res.json({ reply, toolCalled: lastToolName, renderData })

  } catch (err) {
    console.error("[AI assistant] Error:", err)
    return res.status(500).json({ error: "AI assistant failed. Please try again." })
  }
}

// ─── getVendorContext ─────────────────────────────────────────────────────────

async function getVendorContext(req: MedusaRequest, vendorId: string) {
  const query    = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  let vendor: any = null
  try {
    vendor = await marketplaceModuleService.retrieveVendor(vendorId, { relations: ["admins"] })
    const result = await pgClient.raw(
      `SELECT COALESCE(plan,'free') AS plan, plan_billing_cycle, plan_activated_at FROM "vendor" WHERE id = ?`,
      [vendorId]
    )
    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan               = row.plan ?? "free"
      vendor.plan_billing_cycle = row.plan_billing_cycle ?? null
      vendor.plan_activated_at  = row.plan_activated_at ?? null
    }
  } catch (e) { console.error("[AI assistant] vendor fetch error:", e) }

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
        sectionsCount: Array.isArray(raw.sections?.sections) ? raw.sections.sections.length : 0,
        pagesCount: Array.isArray(raw.pages?.pages) ? raw.pages.pages.length : 0,
        collectionsCount: Array.isArray(raw.collections?.collections) ? raw.collections.collections.length : 0,
        storeUrl: raw.custom_domain && raw.domain_verified
          ? `https://${raw.custom_domain}`
          : raw.subdomain ? `https://${raw.subdomain}.junooni.com`
          : `https://${vendor?.handle ?? vendorId}.junooni.com`,
      }
    }
  } catch (e) { console.error("[AI assistant] vendor store fetch error:", e) }

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
      if (onMarketplace && onOwnStore) { bothChannelsCount++; marketplaceCount++; ownStoreCount++ }
      else if (onMarketplace) marketplaceCount++
      else if (onOwnStore)    ownStoreCount++
    }
  } catch (e) { console.error("[AI assistant] product count error:", e) }

  let pendingOrders: any[] = [], recentOrders: any[] = [], allOrdersMapped: any[] = []
  try {
    const { data: vendorData } = await query.graph({
      entity: "vendor", fields: ["orders.id"], filters: { id: vendorId },
    })
    const orderIds: string[] = (vendorData?.[0]?.orders ?? []).map((o: any) => o.id).filter(Boolean)

    if (orderIds.length > 0) {
      const { result: orders } = await getOrdersListWorkflow(req.scope).run({
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
        return ["not_fulfilled", "partially_fulfilled", "partially_shipped", "partially_delivered"].includes(fs)
      })

      allOrdersMapped = sorted.map(mapOrder)
      recentOrders    = sorted.slice(0, 5).map(mapOrder)
    }
  } catch (e) { console.error("[AI assistant] orders fetch error:", e) }

  let walletBalance = 0, totalEarned = 0
  try {
    const payoutResult = await pgClient.raw(
      `SELECT COALESCE(wallet_balance,0) AS wallet_balance, COALESCE(total_earned,0) AS total_earned FROM "vendor_payout" WHERE vendor_id = ? LIMIT 1`,
      [vendorId]
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

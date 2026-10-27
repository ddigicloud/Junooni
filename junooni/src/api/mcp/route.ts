/**
 * JUNOONI MCP Server  —  /mcp
 *
 * Implements the Model Context Protocol (MCP) HTTP transport so creators
 * can connect their JUNOONI store as a custom connector in Claude / ChatGPT.
 *
 * GET  /mcp  →  tool discovery (MCP tool list)
 * POST /mcp  →  tool execution (JSON-RPC 2.0 or simplified)
 *
 * Auth: Bearer token in Authorization header (issued by /mcp/auth/token)
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys }      from "@medusajs/framework/utils"

import { validateAccessToken }     from "../../lib/mcp/tokenStore"
import { getVendorContext }        from "../../lib/ai/vendorContext"
import { handleTool }              from "../../lib/ai/toolHandlers"
import {
  handleSearchBlanks,
  handleGetBlankDetails,
  handleSuggestPrice,
} from "../../lib/ai/inline-product-handlers"

// ─── CORS headers ─────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

// ─── Tool schemas (MCP inputSchema format) ────────────────────────────────────

const MCP_TOOLS = [
  {
    name: "get_store_overview",
    description: "Get a complete overview of your JUNOONI creator store — plan, product counts, pending orders, wallet balance and recent revenue.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_orders",
    description: "List your store orders with payout details. Returns status, customer city, order total and your payout for each order.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum orders to return (default 20, max 50)",
        },
        status: {
          type: "string",
          enum: ["all", "pending", "shipped", "delivered", "canceled"],
          description: "Filter by fulfilment status (default: all)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_earnings",
    description: "Get your earnings summary — wallet balance, total earned, payout breakdown and revenue from recent orders.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_products",
    description: "List all your published products with their sales channels (marketplace / own store).",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: ["all", "marketplace", "own_store"],
          description: "Filter by sales channel (default: all)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_order_detail",
    description: "Get full details for a specific order by its display ID (e.g. #1234).",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Order display ID, e.g. '#1234' or '1234'",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_own_store",
    description: "Get your storefront details — URL, template, sections, custom domain status and SEO settings.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_pending_actions",
    description: "Check what needs your attention — unfulfilled orders, store setup tasks, low stock alerts.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_blanks",
    description: "Search the JUNOONI product catalogue for blank garments and items you can print on. Returns product type, base cost, available colors and sizes.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query, e.g. 'oversized t-shirt', 'hoodie', 'tote bag'",
        },
        limit: {
          type: "number",
          description: "Max results (default 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_blank_details",
    description: "Get full details for a specific blank product — all colors, sizes, print areas, base cost and technology options.",
    inputSchema: {
      type: "object",
      properties: {
        blank_id: {
          type: "string",
          description: "The blank product ID from search_blanks results",
        },
      },
      required: ["blank_id"],
    },
  },
  {
    name: "suggest_price",
    description: "Get pricing recommendations for a product — minimum, recommended and premium selling prices, with estimated payout for each.",
    inputSchema: {
      type: "object",
      properties: {
        base_cost: {
          type: "number",
          description: "Base/manufacturing cost in INR",
        },
        product_type: {
          type: "string",
          description: "Product type name, e.g. 'Oversized T-shirt'",
        },
        fulfillment_type: {
          type: "string",
          enum: ["JUNOONI-fulfillment", "Creator-fulfillment"],
          description: "Fulfillment type (default: JUNOONI-fulfillment)",
        },
      },
      required: ["base_cost", "product_type"],
    },
  },
]

// ─── Response formatter ───────────────────────────────────────────────────────

function fmt(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN")
}

function statusEmoji(s: string): string {
  const m: Record<string, string> = {
    delivered: "✅", shipped: "🚚", partially_shipped: "🚚",
    fulfilled: "📦", partially_fulfilled: "📦",
    pending_fulfillment: "⏳", not_fulfilled: "⏳",
    canceled: "❌",
  }
  return m[s] ?? "📋"
}

/**
 * Format a tool result (from handleTool / inline handlers) into a
 * readable text string for MCP responses.
 */
function formatToolResult(name: string, result: any): string {
  if (!result?.ok) return `Error: ${result?.error ?? "Tool execution failed"}`

  const d = result.data ?? result

  switch (name) {
    // ── Store overview ────────────────────────────────────────────────────────
    case "get_store_overview": {
      const lines = [
        `🏪 **${d.storeName}** (@${d.handle})`,
        `📋 Plan: ${(d.membershipPlan ?? "free").toUpperCase()}`,
        ``,
        `📦 Products: ${d.productCount} published`,
        `  • ${d.marketplaceCount} on JUNOONI marketplace`,
        `  • ${d.ownStoreCount} on your own store`,
        `  • ${d.bothChannelsCount} on both`,
        ``,
        `🛒 Pending orders: ${d.pendingOrdersCount ?? d.pendingOrders ?? 0}`,
        `💰 Wallet balance: ${fmt(d.walletBalance ?? 0)}`,
        `💸 Total earned: ${fmt(d.totalEarned ?? 0)}`,
      ]
      return lines.join("\n")
    }

    // ── Orders ────────────────────────────────────────────────────────────────
    case "get_orders": {
      const orders: any[] = d.orders ?? []
      if (orders.length === 0) return "No orders found."
      const lines = [`📦 ${orders.length} order(s):\n`]
      for (const o of orders) {
        lines.push(
          `${statusEmoji(o.displayStatus)} **${o.id}** — ${o.customerName}`,
          `   Total: ${fmt(o.total)}  •  Your payout: ${fmt(o.payout)}  •  ${o.displayStatus.replace(/_/g, " ")}`,
          `   ${o.paymentMethod === "razorpay" ? "💳 Online" : "💵 COD"}  •  ${new Date(o.createdAt).toLocaleDateString("en-IN")}`,
          ``,
        )
      }
      return lines.join("\n").trim()
    }

    // ── Earnings ──────────────────────────────────────────────────────────────
    case "get_earnings": {
      const lines = [
        `💰 **Earnings Summary**`,
        ``,
        `Wallet balance:    ${fmt(d.walletBalance ?? 0)}`,
        `Total earned:      ${fmt(d.totalEarned ?? 0)}`,
        `Last 5 orders rev: ${fmt(d.revenueLastFive ?? 0)}`,
      ]
      if (d.recentPayouts?.length) {
        lines.push(`\n📋 Recent payouts:`)
        for (const p of d.recentPayouts.slice(0, 5)) {
          lines.push(`  ${p.id}  ${fmt(p.payout)}  (${p.paymentMethod})`)
        }
      }
      return lines.join("\n")
    }

    // ── Products ──────────────────────────────────────────────────────────────
    case "get_products": {
      const products: any[] = d.products ?? []
      if (products.length === 0) return "No published products found."
      const lines = [`🎨 **${products.length} product(s):**\n`]
      for (const p of products) {
        const channels = []
        if (p.onMarketplace) channels.push("marketplace")
        if (p.onOwnStore)    channels.push("own store")
        lines.push(`• **${p.title}** — ${channels.join(" + ") || "no channel"}  ${p.variantCount ? `(${p.variantCount} variants)` : ""}`)
      }
      return lines.join("\n")
    }

    // ── Order detail ──────────────────────────────────────────────────────────
    case "get_order_detail": {
      if (!d.order) return "Order not found."
      const o = d.order
      const lines = [
        `📋 **Order ${o.id}**`,
        `Status: ${statusEmoji(o.displayStatus)} ${o.displayStatus.replace(/_/g, " ")}`,
        `Payment: ${o.paymentStatus} (${o.paymentMethod === "razorpay" ? "Online" : "COD"})`,
        `Customer: ${o.customerName}`,
        `Total: ${fmt(o.total)}`,
        `Your payout: ${fmt(o.payout)}`,
        `Date: ${new Date(o.createdAt).toLocaleDateString("en-IN")}`,
        ``,
        `Items:`,
      ]
      for (const item of (o.items ?? [])) {
        lines.push(`  • ${item.title} × ${item.quantity}  (${fmt(item.unit_price)} each)`)
      }
      return lines.join("\n")
    }

    // ── Own store ─────────────────────────────────────────────────────────────
    case "get_own_store": {
      const vs = d.vendorStore ?? d
      if (!vs?.storeUrl) return "Store not set up yet. Visit studio.junooni.com to configure it."
      const lines = [
        `🌐 **Your Storefront**`,
        `URL: ${vs.storeUrl}`,
        `Status: ${vs.status === "published" ? "🟢 Live" : "🔴 Draft"}`,
        `Template: ${vs.template ?? "minimal"}`,
        ``,
        `Sections: ${vs.sectionsCount ?? 0}`,
        `Pages: ${vs.pagesCount ?? 0}`,
        `Collections: ${vs.collectionsCount ?? 0}`,
      ]
      if (vs.customDomain) {
        lines.push(`Custom domain: ${vs.customDomain} (${vs.domainVerified ? "✅ verified" : "⚠️ not verified"})`)
      }
      return lines.join("\n")
    }

    // ── Pending actions ───────────────────────────────────────────────────────
    case "get_pending_actions": {
      const actions: string[] = d.actions ?? []
      if (actions.length === 0) return "✅ Everything looks good! No pending actions."
      return `⚠️ **${actions.length} action(s) needed:**\n\n` + actions.map(a => `• ${a}`).join("\n")
    }

    // ── Search blanks ─────────────────────────────────────────────────────────
    case "search_blanks": {
      const blanks: any[] = d.blanks ?? d.results ?? []
      if (blanks.length === 0) return "No matching products found in the catalogue."
      const lines = [`🔍 **${blanks.length} product(s) found:**\n`]
      for (const b of blanks) {
        lines.push(
          `**${b.name}** (ID: ${b.id})`,
          `  Type: ${b.product_type ?? "—"}  •  Base cost: ${fmt(b.base_cost)}`,
          `  Colors: ${b.color_count ?? (b.colors?.length ?? 0)}  •  Sizes: ${(b.sizes ?? []).join(", ")}`,
          ``,
        )
      }
      return lines.join("\n").trim()
    }

    // ── Blank details ─────────────────────────────────────────────────────────
    case "get_blank_details": {
      const b = d.blank ?? d
      const lines = [
        `📋 **${b.name}** (${b.id})`,
        `Type: ${b.product_type}`,
        `Base cost: ${fmt(b.base_cost)}`,
        ``,
        `Colors: ${(b.colors ?? []).map((c: any) => c.name).join(", ")}`,
        `Sizes: ${(b.sizes ?? []).join(", ")}`,
        `Print areas: ${(b.print_areas ?? []).join(", ")}`,
      ]
      if (b.technology_id) lines.push(`Technology: ${b.technology_name ?? b.technology_id}`)
      return lines.join("\n")
    }

    // ── Suggest price ─────────────────────────────────────────────────────────
    case "suggest_price": {
      const lines = [
        `💲 **Pricing Guide for ${d.product_type ?? "product"}**`,
        `Base cost: ${fmt(d.base_cost)}`,
        ``,
        `Minimum price:     ${fmt(d.minimum_price)}  →  Payout: ${fmt(d.minimum_payout)}`,
        `Recommended price: ${fmt(d.recommended_price)}  →  Payout: ${fmt(d.recommended_payout)}`,
        `Premium price:     ${fmt(d.premium_price)}  →  Payout: ${fmt(d.premium_payout)}`,
      ]
      return lines.join("\n")
    }

    default:
      return JSON.stringify(d, null, 2)
  }
}

// ─── Extract Bearer token ─────────────────────────────────────────────────────

function extractBearer(req: MedusaRequest): string | null {
  const auth = req.headers?.authorization ?? ""
  if (!auth.startsWith("Bearer ")) return null
  return auth.slice(7).trim() || null
}

// ─── GET /mcp  —  tool discovery ─────────────────────────────────────────────

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.json({
    name:        "JUNOONI Creator Store",
    description: "Manage your JUNOONI print-on-demand store — check orders, earnings, products and search the product catalogue.",
    version:     "1.0.0",
    tools:       MCP_TOOLS,
  })
}

// ─── OPTIONS /mcp  —  preflight ───────────────────────────────────────────────

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

// ─── POST /mcp  —  tool execution ─────────────────────────────────────────────

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  // ── 1. Validate Bearer token ────────────────────────────────────────────────
  const token = extractBearer(req)
  if (!token) {
    return res.status(401).json({
      jsonrpc: "2.0", id: null,
      error: { code: -32001, message: "Missing or invalid Authorization header" },
    })
  }

  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const authInfo = await validateAccessToken(pgClient, token)
  if (!authInfo) {
    return res.status(401).json({
      jsonrpc: "2.0", id: null,
      error: { code: -32001, message: "Invalid or expired access token" },
    })
  }
  const { vendorId, scope: tokenScope } = authInfo

  // ── 2. Parse JSON-RPC 2.0 or simplified body ────────────────────────────────
  const body = req.body as any
  const rpcId  = body?.id ?? null

  // Support both JSON-RPC 2.0 and simplified { name, arguments } formats
  let method: string
  let toolName: string
  let toolArgs: Record<string, any>

  if (body?.method) {
    // JSON-RPC 2.0
    method   = body.method
    toolName = body?.params?.name ?? ""
    toolArgs = body?.params?.arguments ?? body?.params?.input ?? {}
  } else if (body?.name) {
    // Simplified format (some MCP clients use this)
    method   = "tools/call"
    toolName = body.name
    toolArgs = body.arguments ?? body.input ?? {}
  } else {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32600, message: "Invalid request: missing method or name" },
    })
  }

  // ── 3. Handle meta-methods ──────────────────────────────────────────────────
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: {
        protocolVersion: "2024-11-05",
        capabilities:    { tools: {} },
        serverInfo:      { name: "JUNOONI Creator Store", version: "1.0.0" },
      },
    })
  }

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: { tools: MCP_TOOLS },
    })
  }

  if (method !== "tools/call") {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32601, message: `Method not found: ${method}` },
    })
  }

  // ── 4. Validate tool name ───────────────────────────────────────────────────
  const knownTools = MCP_TOOLS.map(t => t.name)
  if (!knownTools.includes(toolName)) {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32602, message: `Unknown tool: ${toolName}` },
    })
  }

  // ── 5. Check scope permissions ──────────────────────────────────────────────
  const writeTools = [] // no write tools in MVP; all are read/search
  if (writeTools.includes(toolName) && tokenScope === "read") {
    return res.status(403).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32003, message: "This token only has read access. Please reconnect with read+write permissions." },
    })
  }

  // ── 6. Execute the tool ─────────────────────────────────────────────────────
  try {
    let rawResult: any

    const storeTools = [
      "get_store_overview","get_orders","get_earnings",
      "get_products","get_order_detail","get_own_store","get_pending_actions",
    ]

    if (storeTools.includes(toolName)) {
      // Build vendor context (same as JUNI ai-assistant)
      const vendor = await getVendorContext(req.scope, vendorId)
      rawResult    = await handleTool(toolName as any, toolArgs, vendor)
    } else if (toolName === "search_blanks") {
      rawResult = await handleSearchBlanks({
        query: toolArgs.query,
        limit: toolArgs.limit ?? 5,
      })
    } else if (toolName === "get_blank_details") {
      rawResult = await handleGetBlankDetails({ blank_id: toolArgs.blank_id })
    } else if (toolName === "suggest_price") {
      rawResult = handleSuggestPrice({
        base_cost:        toolArgs.base_cost,
        product_type:     toolArgs.product_type,
        fulfillment_type: toolArgs.fulfillment_type,
      })
    } else {
      rawResult = { ok: false, error: `Tool not implemented: ${toolName}` }
    }

    // ── 7. Format and return ──────────────────────────────────────────────────
    const text    = formatToolResult(toolName, rawResult)
    const isError = !rawResult?.ok

    console.log(`[MCP] vendor=${vendorId} tool=${toolName} ok=${rawResult?.ok}`)

    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: {
        content: [{ type: "text", text }],
        isError,
      },
    })
  } catch (err: any) {
    console.error("[MCP] tool execution error:", err)
    return res.status(500).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32603, message: err?.message ?? "Internal error" },
    })
  }
}
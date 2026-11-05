/**
 * JUNOONI MCP Server  —  /mcp
 *
 * Implements the Model Context Protocol (MCP) HTTP transport so creators
 * can connect their JUNOONI store as a custom connector in Claude / ChatGPT.
 *
 * GET  /mcp  →  tool discovery (MCP tool list)
 * POST /mcp  →  tool execution (JSON-RPC 2.0 or simplified)
 *
 * Auth: Bearer token in Authorization header
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { validateAccessToken }     from "../../lib/mcp/tokenStore"
import { getVendorContext }        from "../../lib/ai/vendorContext"
import { handleTool }              from "../../lib/ai/toolHandlers"
import { handleCreateProduct,
   handleUploadArtworkFromUrl,
   storeMockupPreview,
   getMockupColorHex,
  }  from "../../lib/ai/inline-product-handlers"
import {
  handleSearchBlanks,
  handleGetBlankDetails,
  handleSuggestPrice,
  handleGenerateInlineMockup,
} from "../../lib/ai/inline-product-handlers"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

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
    description:
      "Get a complete overview of your JUNOONI creator store — plan, product counts, " +
      "pending orders, wallet balance and total revenue earned.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_orders",
    description:
      "List your store orders with full payout details. Returns status, customer city, " +
      "order total and your payout for each order.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type:        "number",
          description: "Maximum orders to return (default 20, max 50)",
        },
        status: {
          type:        "string",
          enum:        ["all", "pending", "shipped", "delivered", "canceled"],
          description: "Filter by fulfilment status (default: all)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_earnings",
    description:
      "Get your earnings summary — wallet balance, total earned lifetime, payout " +
      "breakdown and revenue from recent orders. Pass include_order_breakdown=true for per-order payouts.",
    inputSchema: {
      type: "object",
      properties: {
        include_order_breakdown: {
          type:        "boolean",
          description: "Include per-order payout breakdown (last 20 orders)",
        },
      },
      required: [],
    },
  },
  {
    name: "upload_artwork",
    description:
      "PRODUCT CREATION — STEP 4. Ask the creator to share a public URL of their design artwork " +
      "(Google Drive public link, Dropbox, Imgur, etc). Call this with that URL. " +
      "Returns a design_session_id needed for generate_mockup.",
    inputSchema: {
      type: "object",
      properties: {
        artwork_url: { type: "string", description: "Public URL of the artwork image (PNG or JPG)" },
        filename:    { type: "string", description: "Optional filename (e.g. my-logo.png)" },
      },
      required: ["artwork_url"],
    },
  },
  {
    name: "generate_mockup",
    description:
      "PRODUCT CREATION — STEP 5. Generate a preview of the design on the chosen garment color and print area. " +
      "RULES — follow these exactly:\n" +
      "• Call this ONCE PER COLOR for each selected print area.\n" +
      "• If the creator selected MULTIPLE PRINT AREAS (e.g. front + back): " +
      "STOP — before calling this tool, you MUST ask the creator: " +
      "'Do you want the same design on all areas, or a different design for each area?' " +
      "Do NOT call generate_mockup until you have their answer.\n" +
      "• Same design on all areas → call generate_mockup once per color using the primary area; " +
      "the same design_session_id is reused for all areas.\n" +
      "• Different design per area → call upload_artwork + generate_mockup once per area per color.\n" +
      "• Always render the returned image inline and ask for approval BEFORE calling create_product.",
    inputSchema: {
      type: "object",
      properties: {
        blank_id:          { type: "string",  description: "Blank product ID from search_blanks" },
        technology_id:     { type: "string",  description: "Print technology ID from get_blank_details" },
        design_session_id: { type: "string",  description: "Session ID from upload_artwork" },
        color_hex:         { type: "string",  description: "Garment color hex e.g. #000000" },
        color_name:        { type: "string",  description: "Human name of the color e.g. Black" },
        area:              { type: "string",  description: "Print area: front | back | left_sleeves | right_sleeves (default: front)" },
        position:          { type: "string",  description: "Design position: center | top | bottom (default: center)" },
      },
      required: ["blank_id", "technology_id", "design_session_id", "color_hex"],
    },
  },
  {
    name: "get_products",
    description:
      "List all your published products with title, handle, variants (sizes), collection, tags " +
      "and which sales channels they're live on (marketplace / own store).",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type:        "string",
          enum:        ["all", "marketplace", "own_store", "both"],
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
          type:        "string",
          description: "Order display ID, e.g. '#1234' or '1234'",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_own_store",
    description:
      "Get your storefront details — URL, template, sections, custom domain status, " +
      "SEO settings, colors and font.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_pending_actions",
    description:
      "Check what needs your attention — unfulfilled orders, store setup tasks, " +
      "low stock alerts and wallet withdrawal reminders.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "search_blanks",
    description:
      "PRODUCT CREATION — STEP 1. When a creator asks to create a product, start here. " +
      "First ask what type of product they want (e.g. oversized t-shirt, hoodie, tote bag), then call this. " +
      "Show results as simple product cards so they can pick one. After they pick, call get_blank_details.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type:        "string",
          description: "Search query, e.g. 'oversized t-shirt', 'hoodie', 'tote bag'",
        },
        limit: {
          type:        "number",
          description: "Max results (default 50)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_blank_details",
    description:
      "PRODUCT CREATION — STEP 2. Call after creator selects a blank from search_blanks. " +
      "Gets all colors, sizes, print areas and print technologies. " +
      "After showing the result, ask the creator EACH of these in order — do NOT skip any:\n" +
      "1. Which COLORS do they want? (show swatches)\n" +
      "2. Which SIZES do they want? (show exact size buttons)\n" +
      "3. Which PRINT AREA(S)? — show all available areas; if more than one, ask which ones they want; " +
      "if they pick multiple, ask: same design on all areas, or a different design per area?\n" +
      "4. Which PRINT TECHNOLOGY? — only ask if more than one technology is available; otherwise use the only one.\n" +
      "5. Which SALES CHANNEL? — always ask: Marketplace, Own Store, or Both.\n" +
      "IMPORTANT: Render size buttons using EXACT size strings from the result — never normalize, expand or rename them. 'X' stays 'X', 'XXL' stays 'XXL'.",
    inputSchema: {
      type: "object",
      properties: {
        blank_id: {
          type:        "string",
          description: "The blank product ID from search_blanks results",
        },
      },
      required: ["blank_id"],
    },
  },
  {
    name: "suggest_price",
    description:
      "PRODUCT CREATION — STEP 3. Call after colors and sizes are chosen. " +
      "Shows minimum, recommended and premium pricing tiers. Ask creator what selling price they want.",
    inputSchema: {
      type: "object",
      properties: {
        base_cost: {
          type:        "number",
          description: "Base/manufacturing cost in INR",
        },
        product_type: {
          type:        "string",
          description: "Product type name, e.g. 'Oversized T-shirt'",
        },
        fulfillment_type: {
          type:        "string",
          enum:        ["JUNOONI-fulfillment", "Creator-fulfillment"],
          description: "Fulfillment type (default: JUNOONI-fulfillment)",
        },
      },
      required: ["base_cost", "product_type"],
    },
  },
  {
    name: "create_product",
    description:
      "PRODUCT CREATION — FINAL STEP. Only call after the creator has approved ALL mockups. " +
      "Supports MULTIPLE COLORS — pass color_names as an array e.g. ['Lavender','Orange']. " +
      "Also pass mockup_session_ids as an array in the SAME ORDER as color_names " +
      "(Lavender session first, Orange session second, etc.). " +
      "ALWAYS pass sales_channel — use whatever the creator chose: 'marketplace', 'own_store', or 'both'. " +
      "IMPORTANT: The title must NOT include color names — colors go in color_names only. " +
      "Creates the product as a Draft with one Color+Size variant per combination.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type:        "string",
          description: "Product title WITHOUT color — e.g. 'Junooni Logo Hoodie', never 'Junooni Logo Hoodie - Mint'",
        },
        blank_id: {
          type:        "string",
          description: "Blank product ID from search_blanks (the garment/item to print on)",
        },
        selling_price: {
          type:        "number",
          description: "Selling price in INR (e.g. 699). Use suggest_price for recommendations.",
        },
        description: {
          type:        "string",
          description: "Product description (optional)",
        },
        sizes: {
          type:        "array",
          items:       { type: "string" },
          description: "Sizes to create, e.g. ['S','M','L','XL']. Defaults to S/M/L/XL/XXL.",
        },
        sales_channel: {
          type:        "string",
          enum:        ["marketplace", "own_store", "both"],
          description: "Where to sell (default: marketplace)",
        },
        color_names: {
          type:        "array",
          items:       { type: "string" },
          description: "ALL selected garment colors — e.g. ['Lavender','Orange']. Creates one Color variant per color. Prefer this over color_name.",
        },
        color_name: {
          type:        "string",
          description: "Single garment color (legacy fallback — prefer color_names array for multi-color support).",
        },
        design_session_id: {
          type:        "string",
          description: "Design session ID from upload_artwork",
        },
        mockup_session_ids: {
          type:        "array",
          items:       { type: "string" },
          description: "Mockup session IDs in the SAME ORDER as color_names. Each is the front-design mockup for that color.",
        },
        mockup_session_id: {
          type:        "string",
          description: "Single mockup session ID (legacy fallback — prefer mockup_session_ids array).",
        },
      },
      required: ["title", "blank_id", "selling_price"],
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

function formatToolResult(name: string, result: any): string {
  if (!result?.ok) return `Error: ${result?.error ?? "Tool execution failed"}`

  const d = result.data ?? result

  switch (name) {

    // ── Store overview ──────────────────────────────────────────────────────
    case "get_store_overview": {
      const lines = [
        `🏪 **${d.store_name}** (${d.handle})`,
        `🔗 ${d.marketplace_url}`,
        `📋 Plan: ${(d.membership_plan ?? "free").toUpperCase()}${d.plan_billing_cycle && d.plan_billing_cycle !== "N/A" ? ` (${d.plan_billing_cycle})` : ""}`,
        ``,
        `📦 Products: ${d.products_published ?? 0} published`,
        `  • ${d.on_marketplace ?? 0} on JUNOONI marketplace`,
        `  • ${d.on_own_store ?? 0} on your own store`,
        `  • ${d.on_both_channels ?? 0} on both`,
        ``,
        `🛒 Pending orders: ${d.pending_orders ?? 0}`,
        `💰 Wallet balance: ₹${d.wallet_balance_inr ?? "0.00"}`,
        `💸 Total earned:   ₹${d.total_earned_inr ?? "0.00"}`,
        ``,
        `🏪 Own store: ${d.own_store_status === "live" ? "🟢 Live" : d.own_store_status === "draft" ? "🔴 Draft" : "Not set up"}`,
        d.own_store_url ? `   ${d.own_store_url}` : "",
      ].filter(l => l !== "")
      return lines.join("\n")
    }

    // ── Orders ──────────────────────────────────────────────────────────────
    case "get_orders": {
      const orders: any[] = d.orders ?? []
      if (orders.length === 0) return "No orders found."
      const lines = [`📦 ${orders.length} order(s):\n`]
      for (const o of orders) {
        const location = [o.customer_city, o.customer_state].filter(Boolean).join(", ")
        lines.push(
          `${statusEmoji(o.status)} **${o.id}** — ${o.customer}${location ? ` (${location})` : ""}`,
          `   Total: ${o.order_total}  •  Your payout: ${o.your_payout}  •  ${(o.status ?? "").replace(/_/g, " ")}`,
          `   ${o.payment_method === "razorpay" ? "💳 Online" : "💵 COD"}  •  ${o.date}`,
          ``,
        )
      }
      return lines.join("\n").trim()
    }

    // ── Earnings ────────────────────────────────────────────────────────────
    case "get_earnings": {
      const lines = [
        `💰 **Earnings Summary**`,
        ``,
        `Wallet balance:       ₹${d.wallet_balance_inr ?? "0.00"}`,
        `Total earned (life):  ₹${d.total_earned_lifetime_inr ?? "0.00"}`,
        `Last 5 orders rev:    ₹${d.revenue_last_5_orders_inr ?? "0.00"}`,
        `Total payout (all):   ₹${d.total_payout_all_orders_inr ?? "0.00"}`,
        `Total orders:         ${d.total_orders ?? 0}`,
        ``,
        `ℹ️  ${d.note ?? ""}`,
      ]
      if (d.order_payouts?.length) {
        lines.push(``, `📋 Recent payouts:`)
        for (const p of d.order_payouts.slice(0, 10)) {
          lines.push(`  ${statusEmoji(p.status)} ${p.id}  →  ${p.payout}  fee: ${p.fee}  (${p.payment})`)
        }
      }
      return lines.join("\n")
    }

    // ── Products ────────────────────────────────────────────────────────────
    case "get_products": {
      const c        = d.counts ?? {}
      const products = d.products ?? []
      if ((c.total_published ?? 0) === 0) return "No published products found."

      const lines = [
        `🎨 **Products** — ${c.total_published ?? 0} published`,
        ``,
        `📊 Channel breakdown:`,
        `  • Marketplace:   ${c.on_marketplace ?? 0}`,
        `  • Own store:     ${c.on_own_store ?? 0}`,
        `  • Both channels: ${c.on_both ?? 0}`,
      ]

      if (products.length > 0) {
        lines.push(``, `📦 Product list:`)
        for (const p of products) {
          const channels = [
            p.on_marketplace ? "🛒 Marketplace" : "",
            p.on_own_store   ? "🏪 Own Store"   : "",
          ].filter(Boolean).join(", ")
          const sizes = (p.variants ?? []).map((v: any) => v.title).join(", ")

          lines.push(``)
          lines.push(`**${p.title}**`)
          lines.push(`  Handle: \`${p.handle}\``)
          if (p.collection) lines.push(`  Collection: ${p.collection}`)
          if (p.tags?.length) lines.push(`  Tags: ${p.tags.join(", ")}`)
          lines.push(`  Sizes: ${sizes || "—"}  (${p.variant_count} variant${p.variant_count !== 1 ? "s" : ""})`)
          lines.push(`  Channels: ${channels || "—"}`)
          if (p.marketplace_url) lines.push(`  URL: ${p.marketplace_url}`)
        }
      }

      return lines.join("\n")
    }

    // ── Order detail ────────────────────────────────────────────────────────
    case "get_order_detail": {
      if (!d.id) return "Order not found."
      const location = [d.customer_city, d.customer_state].filter(Boolean).join(", ")
      const lines = [
        `📋 **Order ${d.id}**`,
        `Status: ${statusEmoji(d.status ?? "")} ${(d.status ?? "").replace(/_/g, " ")}`,
        `Payment: ${d.payment_status} (${d.payment_method === "razorpay" ? "💳 Online" : "💵 COD"})`,
        `Customer: ${d.customer}${location ? ` — ${location}` : ""}`,
        `Total: ${d.order_total}`,
        `Your payout: ${d.your_payout}`,
        `Processing fee: ${d.processing_fee}`,
        `Date: ${d.date}`,
      ]
      return lines.join("\n")
    }

    // ── Own store ───────────────────────────────────────────────────────────
    case "get_own_store": {
      if (!d.set_up) return d.message ?? "Store not set up yet. Visit studio.junooni.com to configure it."
      const lines = [
        `🌐 **Your Storefront**`,
        `URL: ${d.store_url}`,
        `Status: ${d.status === "live" ? "🟢 Live" : "🔴 Draft"}`,
        `Template: ${d.template ?? "minimal"}`,
        `Password locked: ${d.password_locked ? "Yes" : "No"}`,
        ``,
        `Sections: ${d.sections_count ?? 0}`,
        `Pages: ${d.pages_count ?? 0}`,
        `Collections: ${d.collections_count ?? 0}`,
        ``,
        `Branding: ${d.primary_color} / ${d.secondary_color}  •  Font: ${d.font}`,
        `SEO title: ${d.seo_title}`,
        `SEO description: ${d.seo_description}`,
        `Tagline: ${d.tagline}`,
        `Announcement: ${d.announcement}`,
      ]
      if (d.custom_domain) {
        lines.push(`Custom domain: ${d.custom_domain} (${d.domain_verified ? "✅ verified" : "⚠️ not verified"})`)
      }
      return lines.join("\n")
    }

    // ── Pending actions ─────────────────────────────────────────────────────
    case "get_pending_actions": {
      const actions: string[] = d.actions ?? []
      if ((d.pending_actions_count ?? 0) === 0) {
        return actions[0] ?? "✅ Everything looks good! No pending actions."
      }
      return `⚠️ **${d.pending_actions_count} action(s) needed:**\n\n` +
        actions.map((a: string) => `• ${a}`).join("\n")
    }

    // ── Search blanks ───────────────────────────────────────────────────────
    case "search_blanks": {
      const blanks: any[] = d.blanks ?? d.results ?? d.products ?? []
      if (blanks.length === 0) return "No matching products found in the catalogue."
      const lines = [`🔍 **${blanks.length} product(s) found:**\n`]
      for (const b of blanks) {
        const swatches = (b.colors ?? []).map((c: any) => `${c.name}:${c.hex}`).join(", ")
        lines.push(
          `**${b.name}** (ID: \`${b.id}\`)`,
          `  Type: ${b.product_type ?? "—"}  •  Base cost: ${fmt(b.base_cost)}`,
          `  Colors: ${b.color_count ?? 0}  •  Sizes: ${(b.sizes ?? []).join(" · ")}`,
          `  Print method: ${b.technology_name ?? "—"}`,
          `  Color swatches: ${swatches || "—"}`,
          b.first_mockup_url ? `  image_url: ${b.first_mockup_url}` : "",
          ``,
        )
      }
      return lines.join("\n").trim() + `\n\n---\nRENDER_AS_CARDS: true\nShow each product above as a visual card with its name, base cost, colors, sizes, print method, and image_url as the card thumbnail. For a single result, show it as a single featured card.`
    }

    // ── Blank details ───────────────────────────────────────────────────────
        case "get_blank_details": {
      const b = d.blank ?? d
      const imageUrl = b.image_url ?? b.thumbnail_url ?? b.image?.url ?? b.thumbnail?.url ?? null
      const colors     = (b.colors     ?? [])
      const sizes      = (b.sizes      ?? [])
      const printAreas = (b.print_areas ?? [])
      const techs: any[] = b.technologies ?? (b.technology_id ? [{ id: b.technology_id, name: b.technology_name ?? b.technology_id }] : [])

      const lines = [
        // ── data lines (Claude references these when calling next tools) ──
        `📋 **${b.name}** (\`${b.id}\`)`,
        imageUrl ? `image_url: ${imageUrl}` : `image_url: none`,
        `Type: ${b.product_type}`,
        `Base cost: ${fmt(b.base_cost)}`,
        ``,
        `Colors: ${colors.map((c: any) => `${c.name}:${c.hex}`).join(", ")}`,
        `Sizes: ${sizes.map((s: any) => s.name ?? s).join(", ")}`,
        `Print areas: ${printAreas.join(", ")}`,
        `Print area count: ${printAreas.length}`,
      ]

      if (techs.length === 1) {
        lines.push(`technology_id: ${techs[0].id}`)
        lines.push(`Print technology: ${techs[0].name}`)
      } else if (techs.length > 1) {
        lines.push(`Technologies: ${techs.map((t: any) => `${t.name}(id:${t.id})`).join(", ")}`)
      }

      // ── render instructions ──────────────────────────────────────────────
      lines.push(``)
      lines.push(`---`)
      lines.push(`RENDER INSTRUCTIONS — follow exactly when composing your reply:`)
      lines.push(``)
      lines.push(`Step 1: Show the product as a visual card — image_url as the thumbnail, name, type, base cost.`)
      lines.push(``)
      lines.push(`Step 2: Below the card, show a styled selection form. Ask ALL questions in ONE message. Format each group as shown:`)
      lines.push(``)
      lines.push(`**🎨 Pick your colors** (you can pick more than one)`)
      lines.push(colors.map((c: any) => `● ${c.name} \`${c.hex}\``).join("   "))
      lines.push(`Use a colored circle emoji that best matches each hex value above.`)
      lines.push(``)
      lines.push(`**📐 Pick your sizes** (you can pick more than one)`)
      lines.push(sizes.map((s: any) => `\`${s.name ?? s}\``).join("  "))
      lines.push(`IMPORTANT: render these EXACTLY — never rename, expand or normalize them.`)
      lines.push(``)

      if (printAreas.length > 0) {
        lines.push(`**🖨️ Pick your print area(s)**`)
        lines.push(printAreas.map((a: string) => `\`${a}\``).join("  "))
        if (printAreas.length > 1) {
          lines.push(`→ If they select more than one area, immediately ask: "Same design on all areas, or a different design for each area?"`)
        }
        lines.push(``)
      }

      if (techs.length > 1) {
        lines.push(`**⚙️ Pick your print technology**`)
        lines.push(techs.map((t: any) => `\`${t.name}\``).join("  "))
        lines.push(``)
      }

      lines.push(`**🛒 Pick your sales channel**`)
      lines.push(`\`Marketplace\`  \`Own Store\`  \`Both\``)

      return lines.join("\n")
    }

    // ── Suggest price ───────────────────────────────────────────────────────
    case "suggest_price": {
      const tiers       = d.tiers ?? []
      const minimum     = tiers.find((t: any) => t.label === "minimum")     ?? tiers[0]
      const recommended = tiers.find((t: any) => t.label === "recommended") ?? tiers[1]
      const premium     = tiers.find((t: any) => t.label === "premium")     ?? tiers[2]
      const lines = [
        `💲 **Pricing Guide for ${d.product_type ?? "product"}**`,
        `Base cost: ${fmt(d.base_cost)}`,
        ``,
        `Minimum price:     ${fmt(minimum?.price)}  →  Payout: ${fmt(minimum?.profit)}`,
        `Recommended price: ${fmt(recommended?.price)}  →  Payout: ${fmt(recommended?.profit)}`,
        `Premium price:     ${fmt(premium?.price)}  →  Payout: ${fmt(premium?.profit)}`,
      ]
      return lines.join("\n")
    }

    // ── Upload artwork ──────────────────────────────────────────────────────
    case "upload_artwork": {
      return [
        `✅ **Artwork uploaded successfully!**`,
        ``,
        `File: ${d.filename}`,
        `Size: ${d.width}×${d.height}px  (${Math.round((d.size_bytes ?? 0) / 1024)}KB)`,
        `Session ID: \`${d.design_session_id}\``,
        ``,
        `Next: call **generate_mockup** with this design_session_id to preview on the garment.`,
      ].join("\n")
    }

    // ── Generate mockup ─────────────────────────────────────────────────────
    case "generate_mockup": {
      const imgLine = d.preview_url ? `\n![Mockup Preview](${d.preview_url})\n` : ""
      return [
        `🎨 **Mockup generated!**`,
        imgLine,
        `Color: ${d.color_name ?? ""}`,
        `Area: ${d.area ?? "front"}`,
        `Mockup session ID: \`${d.mockup_session_id ?? ""}\``,
        ``,
        `Does this look good? Say **yes** to create the product, or let me know if you'd like to change anything.`,
      ].join("\n")
    }

    // ── Create product ──────────────────────────────────────────────────────
    case "create_product": {
      const colorLine = Array.isArray(d.colors) && d.colors.length > 0
        ? `Colors:   ${(d.colors as string[]).join(", ")} (${d.color_count} color${d.color_count === 1 ? "" : "s"})`
        : ""
      const lines = [
        `✅ **Product created!**`,
        ``,
        `Title:    ${d.title}`,
        `ID:       \`${d.id}\``,
        `Handle:   \`${d.handle}\``,
        `Status:   Draft (not published yet)`,
        `Blank:    \`${d.blank_id}\``,
        ``,
        ...(colorLine ? [colorLine] : []),
        `Sizes:    ${(d.sizes ?? []).join(", ")}`,
        `Variants: ${d.variant_count}`,
        `Images:   ${d.image_count} uploaded`,
        `Price:    ${d.selling_price_inr}`,
        ``,
        `Channels:`,
        `  ${d.on_marketplace ? "✅" : "❌"} JUNOONI Marketplace`,
        `  ${d.on_own_store   ? "✅" : "❌"} Own Store`,
        ``,
        `🎨 **Next step:** ${d.next_step}`,
        `👉 ${d.studio_url}`,
      ].filter(Boolean)
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const acceptsSSE = (req.headers?.accept ?? "").includes("text/event-stream")

  if (acceptsSSE) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.write(`event: endpoint\ndata: ${JSON.stringify({ uri: "/mcp" })}\n\n`)
    const keepAlive = setInterval(() => res.write(": keepalive\n\n"), 15000)
    req.on("close", () => clearInterval(keepAlive))
    return
  }

  return res.json({
    name:        "JUNOONI Creator Store",
    description: "Manage your JUNOONI print-on-demand store — check orders, earnings, products, search the catalogue and create new products.",
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

  // ── 1. Parse JSON-RPC 2.0 or simplified body ────────────────────────────────
  const body  = req.body as any
  const rpcId = body?.id ?? null

  let method: string
  let toolName: string
  let toolArgs: Record<string, any>

  if (body?.method) {
    method   = body.method
    toolName = body?.params?.name ?? ""
    toolArgs = body?.params?.arguments ?? body?.params?.input ?? {}
  } else if (body?.name) {
    method   = "tools/call"
    toolName = body.name
    toolArgs = body.arguments ?? body.input ?? {}
  } else {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32600, message: "Invalid request: missing method or name" },
    })
  }

  // ── 2. Handle meta-methods BEFORE auth ──────────────────────────────────────
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: {
        protocolVersion: "2025-03-26",
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

  if (method.startsWith("notifications/")) {
    return res.status(200).json({ jsonrpc: "2.0", id: rpcId, result: {} })
  }

  if (method !== "tools/call") {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32601, message: `Method not found: ${method}` },
    })
  }

  // ── 3. Auth required for tools/call ─────────────────────────────────────────
  const token = extractBearer(req)
  const isDevMode = process.env.DEV_MCP_MODE === "true" && !!process.env.DEV_MCP_VENDOR_ID

  if (!token && !isDevMode) {
    return res.status(401).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32001, message: "Missing or invalid Authorization header" },
    })
  }

  // ── Dev bypass: skip auth entirely when DEV_MODE=true ───────────────────────
  const DEV_MODE      = process.env.DEV_MCP_MODE === "true"
  const DEV_VENDOR_ID = process.env.DEV_MCP_VENDOR_ID ?? ""
  let vendorId: string
  let tokenScope: string[]

  if (DEV_MODE && DEV_VENDOR_ID) {
    // Local dev — no token needed, uses DEV_MCP_VENDOR_ID from .env
    vendorId   = DEV_VENDOR_ID
    tokenScope = ["read", "write"]
    console.log(`[MCP] ⚠️  DEV MODE — skipping auth, vendor=${vendorId}`)
  } else {
    const mcpService = req.scope.resolve("mcpModule")
    const authInfo   = await validateAccessToken(mcpService, token ?? "")
    if (!authInfo) {
      return res.status(401).json({
        jsonrpc: "2.0", id: rpcId,
        error: { code: -32001, message: "Invalid or expired access token" },
      })
    }
    vendorId   = authInfo.vendorId
    tokenScope = authInfo.scope
  }

  // ── 4. Validate tool name ────────────────────────────────────────────────────
  const knownTools = MCP_TOOLS.map(t => t.name)
  if (!knownTools.includes(toolName)) {
    return res.status(400).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32602, message: `Unknown tool: ${toolName}` },
    })
  }

  // ── 5. Check scope permissions ───────────────────────────────────────────────
  const writeTools = ["create_product", "upload_artwork", "generate_mockup"]
  if (writeTools.includes(toolName) && tokenScope === "read") {
    return res.status(403).json({
      jsonrpc: "2.0", id: rpcId,
      error: {
        code:    -32003,
        message: "This token only has read access. Please reconnect with read+write permissions.",
      },
    })
  }

  // ── 6. Execute the tool ──────────────────────────────────────────────────────
  try {
    let rawResult: any

    const storeTools = [
      "get_store_overview", "get_orders", "get_earnings",
      "get_products", "get_order_detail", "get_own_store", "get_pending_actions",
    ]

    if (storeTools.includes(toolName)) {
      const vendor = await getVendorContext(req.scope, vendorId)
      rawResult    = await handleTool(toolName as any, toolArgs, vendor)
    } else if (toolName === "search_blanks") {
      rawResult = await handleSearchBlanks({
        query:         toolArgs.query,
        limit:         toolArgs.limit ?? 50,
        inline_images: true,
      })
    } else if (toolName === "get_blank_details") {
      rawResult = await handleGetBlankDetails({ blank_id: toolArgs.blank_id })
    } else if (toolName === "suggest_price") {
      rawResult = handleSuggestPrice({
        base_cost:        toolArgs.base_cost,
        product_type:     toolArgs.product_type,
        fulfillment_type: toolArgs.fulfillment_type,
      })
    } else if (toolName === "upload_artwork") {
      rawResult = await handleUploadArtworkFromUrl(
        { artwork_url: toolArgs.artwork_url, filename: toolArgs.filename },
        vendorId
      )
    } else if (toolName === "generate_mockup") {
      rawResult = await handleGenerateInlineMockup({
        blank_id:           toolArgs.blank_id,
        technology_id:      toolArgs.technology_id,
        selected_color_hex: toolArgs.color_hex,
        design_session_id:  toolArgs.design_session_id,
        color_name:         toolArgs.color_name,
        area:               toolArgs.area ?? "front",
        position:           toolArgs.position ?? "center",
      })
      // Store result so create_product can reference it, and upload for public URL
      if (rawResult.ok && rawResult.data?.preview_base64) {
        const b64url   = rawResult.data.preview_base64 as string
        const sid      = storeMockupPreview(vendorId, b64url, toolArgs.area, toolArgs.color_name, toolArgs.color_hex)
        rawResult.data.mockup_session_id = sid

        // Upload to file storage → public URL so Claude can render it inline
        if (b64url.startsWith("data:")) {
          try {
            const [header, b64] = b64url.split(",")
            const mimeType = header.replace("data:", "").replace(";base64", "")
            const ext      = mimeType.split("/")[1]?.split("+")[0] ?? "webp"

            const { result: uploaded } = await uploadFilesWorkflow(req.scope).run({
              input: {
                files: [{
                  filename: `mockup-preview-${sid}.${ext}`,
                  mimeType,
                  content:  b64,
                  access:   "public",
                }]
              }
            })
            const previewUrl = (uploaded as any)?.[0]?.url
            if (previewUrl) {
              rawResult.data.preview_url = previewUrl
              console.log(`[MCP] mockup uploaded for preview → ${previewUrl}`)
            }
          } catch (uploadErr: any) {
            console.warn("[MCP] mockup preview upload failed (non-fatal):", uploadErr.message)
          }
        }
      }
    } else if (toolName === "create_product") {
      rawResult = await handleCreateProduct(toolArgs, vendorId, req.scope, token)
    } else {
      rawResult = { ok: false, error: `Tool not implemented: ${toolName}` }
    }

    // ── 7. Format and return ───────────────────────────────────────────────────
    let text    = formatToolResult(toolName, rawResult)
    const isError = !rawResult?.ok

    // For generate_mockup: if we have a public preview_url, append it as markdown
    // so Claude surfaces it inline in the chat response, not just in the tool block
    if (toolName === "generate_mockup" && rawResult?.ok && rawResult?.data?.preview_url) {
      text += `\n\n![Mockup Preview](${rawResult.data.preview_url})`
    }

    console.log(`[MCP] vendor=${vendorId} tool=${toolName} ok=${rawResult?.ok}`)

    const content: { type: string; text?: string; data?: string; mimeType?: string }[] = [
      { type: "text", text },
    ]

    // For generate_mockup: add preview URL as a second text block
    // Claude will render this as an inline image in the chat response
    if (toolName === "generate_mockup" && rawResult?.ok && rawResult?.data?.preview_url) {
      content.push({
        type: "text",
        text: `\n![Mockup Preview](${rawResult.data.preview_url})\n`,
      })
    }

    // Attach inline images for search_blanks
    // if (toolName === "search_blanks" && rawResult?.ok && Array.isArray(rawResult?.data?.products)) {
    //   for (const product of rawResult.data.products) {
    //     const url = product.first_mockup_url
    //     if (url?.startsWith("data:")) {
    //       const [header, b64] = url.split(",")
    //       const mimeType = header.replace("data:", "").replace(";base64", "")
    //       content.push({ type: "image", data: b64, mimeType })
    //     }
    //   }
    // }

    // Attach inline image for generate_mockup
    if (toolName === "generate_mockup" && rawResult?.ok && rawResult?.data?.preview_base64) {
      const url = rawResult.data.preview_base64
      if (url?.startsWith("data:")) {
        const [header, b64] = url.split(",")
        const mimeType = header.replace("data:", "").replace(";base64", "")
        content.push({ type: "image", data: b64, mimeType })
      }
    }

    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: { content, isError },
    })
  } catch (err: any) {
    console.error("[MCP] tool execution error:", err)
    return res.status(500).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32603, message: err?.message ?? "Internal error" },
    })
  }
}
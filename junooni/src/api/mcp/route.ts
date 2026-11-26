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
   getMockupPreview,
   getMockupArea,
   getMockupColorName,
  }  from "../../lib/ai/inline-product-handlers"
import {
  handleSearchBlanks,
  handleGetBlankDetails,
  handleSuggestPrice,
  handleGenerateInlineMockup,
} from "../../lib/ai/inline-product-handlers"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { storeDesignFile } from "../../lib/ai/inline-product-handlers"
import { generateUploadToken, uploadTempTokens, uploadResults } from "../../lib/mcp/uploadTokenStore"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GALLERY_WIDGET_HTML } from "../../lib/mcp/galleryWidget"
import { BLANK_OPTIONS_WIDGET_HTML } from "../../lib/mcp/blankOptionsWidget"
import { MOCKUP_REVIEW_WIDGET_HTML } from "../../lib/mcp/mockupReviewWidget"
import { FINALIZE_PRODUCT_WIDGET_HTML } from "../../lib/mcp/finalizeProductWidget"
import sharp from "sharp"
//import { UPLOAD_WIDGET_TEMPLATE } from "../../lib/mcp/uploadWidgetTemplate"

// ─── CORS headers ─────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "ngrok-skip-browser-warning":    "true",
}

// ─── Tool schemas (MCP inputSchema format) ────────────────────────────────────

// ── Create-product flow state (per vendor, in-memory, 2h TTL) ────────────────
// Lets the server enforce step order: get_blank_details → browse_gallery → …
type FlowState = {
  blank_id:    string
  colors:      string[]
  sizes:       string[]
  print_areas: string[]
  blank_name?:   string
  base_cost?:    number
  product_type?: string
  choices?:    { color_names: string[]; sizes: string[]; print_areas: string[]; sales_channel: string }
  design_mode?:  "same" | "different"
  designs?:      Record<string, { design_session_id: string; filename?: string }>  // keyed by print area as chosen ("Front", "Back"…)
  pending_area?: string                                                            // area the gallery is currently open for
  at:          number
}
const FLOW_TTL_MS = 2 * 60 * 60 * 1000
const productFlows = new Map<string, FlowState>()
function getFlow(vendorId: string): FlowState | null {
  const f = productFlows.get(vendorId)
  if (!f) return null
  if (Date.now() - f.at > FLOW_TTL_MS) { productFlows.delete(vendorId); return null }
  return f
}
const norm = (x: string) => String(x).trim().toLowerCase()

const areaKey = (a: any) => String(a ?? "").toLowerCase().replace(/[_\-\s]/g, "")

// Areas that still need a design (different-design mode → every area; same mode → just one)
function areasNeedingDesign(flow: FlowState): string[] {
  const areas = flow.choices?.print_areas ?? []
  const have  = new Set(Object.keys(flow.designs ?? {}).map(areaKey))
  if (flow.design_mode === "different") return areas.filter((a) => !have.has(areaKey(a)))
  return have.size ? [] : areas.slice(0, 1)
}

// area → design_session_id for create_product (same mode: one design on every chosen area)
function designsByArea(flow: FlowState): Record<string, string> {
  const out: Record<string, string> = {}
  const designs = flow.designs ?? {}
  const first = Object.values(designs)[0]?.design_session_id
  for (const area of flow.choices?.print_areas ?? []) {
    const hit = Object.entries(designs).find(([k]) => areaKey(k) === areaKey(area))?.[1]?.design_session_id
    const sid = hit ?? (flow.design_mode !== "different" ? first : undefined)
    if (sid) out[areaKey(area)] = sid
  }
  return out
}

function validateGalleryArgs(vendorId: string, a: any): string | null {
  const flow = getFlow(vendorId)
  if (!flow) {
    return "The gallery only opens during product creation. Start with search_blanks, let the creator pick a blank, " +
           "then call get_blank_details and ask the creator for colors, sizes, print area(s) and sales channel."
  }
  if (flow.choices) {
    a.blank_id      = a.blank_id      ?? flow.blank_id
    a.color_names   = a.color_names   ?? flow.choices.color_names
    a.sizes         = a.sizes         ?? flow.choices.sizes
    a.print_areas   = a.print_areas   ?? flow.choices.print_areas
    a.sales_channel = a.sales_channel ?? flow.choices.sales_channel
  }
  if (Array.isArray(a.print_areas) && a.print_areas.length > 1 && !["same", "different"].includes(a.design_mode ?? flow.design_mode)) {
    return "Multiple print areas chosen — pass design_mode: 'same' (one design on all areas) or 'different' (a design per area), from the creator's options message."
  }
  if (String(a.blank_id) !== flow.blank_id) {
    return `blank_id doesn't match the blank being set up (${flow.blank_id}). Call get_blank_details for the blank the creator chose first.`
  }
  const missing: string[] = []
  if (!Array.isArray(a.color_names) || !a.color_names.length) missing.push("colors")
  if (!Array.isArray(a.sizes)       || !a.sizes.length)       missing.push("sizes")
  if (!Array.isArray(a.print_areas) || !a.print_areas.length) missing.push("print area(s)")
  if (!["marketplace", "own_store", "both"].includes(a.sales_channel)) missing.push("sales channel (Marketplace / Own Store / Both)")
  if (missing.length) return `Not ready for artwork yet. Ask the creator for: ${missing.join(", ")}. Then call browse_gallery again.`

  const bad = (picked: string[], allowed: string[], label: string) => {
    if (!allowed.length) return null
    const set = new Set(allowed.map(norm))
    const wrong = picked.filter((p) => !set.has(norm(p)))
    return wrong.length ? `${label} not available on this blank: ${wrong.join(", ")} (available: ${allowed.join(", ")})` : null
  }
  const errs = [
    bad(a.color_names, flow.colors, "Colors"),
    bad(a.sizes, flow.sizes, "Sizes"),
    bad(a.print_areas, flow.print_areas, "Print areas"),
  ].filter(Boolean)
  return errs.length ? errs.join("\n") + "\nAsk the creator to pick from the available options." : null
}

// ── Options-picker payload for get_blank_details ─────────────────────────────

async function blankThumbDataUri(doc: any): Promise<string | null> {
  const img = typeof doc?.displayImages?.[0]?.image === "object" ? doc.displayImages[0].image : null
  const candidates: string[] = [
    img?.sizes?.square?.url, img?.sizes?.small?.url, img?.sizes?.thumbnail?.url, img?.url,
    ...((doc?.printT?.[0]?.mockupPhotos ?? []).map((m: any) => m?.photo?.url)),
  ].filter((u: any) => typeof u === "string" && u.length > 0)

  // Internal CMS address first, then public one (paths are often relative, e.g. /api/media/file/x.webp)
  const bases = [process.env.PAYLOAD_BASE_URL, process.env.PAYLOAD_PUBLIC_URL, "http://blankscms:3000", "https://cms.junooni.com"]
    .filter(Boolean).map((b) => String(b).replace(/\/$/, ""))

  const tried: string[] = []
  for (const path of candidates.slice(0, 4)) {
    const urls = /^https?:\/\//i.test(path) ? [path] : bases.map((b) => b + (path.startsWith("/") ? path : "/" + path))
    for (const raw of urls) {
      const url = encodeURI(decodeURI(raw))   // handles spaces in filenames
      tried.push(url)
      try {
        const ctrl = new AbortController()
        const t    = setTimeout(() => ctrl.abort(), 4000)
        const resp = await fetch(url, { signal: ctrl.signal })
        clearTimeout(t)
        if (!resp.ok) continue
        const input = Buffer.from(await resp.arrayBuffer())
        if (input.length < 100) continue
        // Small square thumbnail on white → tiny payload, works for transparent garment photos too
        const thumb = await sharp(input, { failOn: "none" })
          .resize(240, 240, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .flatten({ background: "#ffffff" })
          .webp({ quality: 80 })
          .toBuffer()
        console.log(`[MCP] blank thumbnail ok ← ${url} (${thumb.length} bytes)`)
        return `data:image/webp;base64,${thumb.toString("base64")}`
      } catch { /* try next */ }
    }
  }
  console.warn(`[MCP] blank thumbnail: none found for blank=${doc?.id}. candidates=${candidates.length} tried=${JSON.stringify(tried)}`)
  return null
}

async function buildBlankOptionsPayload(d: any) {
  const b = d?.blank ?? d ?? {}
  const techs = (b.technologies?.length
    ? b.technologies
    : b.technology_id ? [{ id: b.technology_id, name: b.technology_name, print_areas: b.print_areas ?? [] }] : []
  ).map((t: any) => ({ id: t.id, name: t.name ?? "DTG", print_areas: t.print_areas ?? [] }))
  return {
    blank: {
      id:           String(b.id),
      name:         b.name,
      product_type: b.product_type,
      base_cost:    b.base_cost,
      image:        await blankThumbDataUri(b.blankData),
      colors:       (b.colors ?? []).map((c: any) => ({ name: c.name, hex: c.hex })),
      sizes:        (b.sizes ?? []).map((x: any) => x?.name ?? x),
      technologies: techs,
    },
  }
}

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
    "PRODUCT CREATION — STEP 4. Register the chosen artwork and get a design_session_id.\n\n" +
    "Call with the artwork_url from the gallery widget message ('Use this design: ... — artwork_url: https://...'), " +
    "or a public image URL the creator pasted. Then call generate_mockup. " +
    "Never ask the creator to attach a file in chat — send them to the gallery widget (browse_gallery) instead.",
    inputSchema: {
      type: "object",
      properties: {
        artwork_url: { type: "string", description: "artwork_url from the gallery widget message (or a public URL the creator pasted)" },
        filename:    { type: "string", description: "Optional filename hint" },
        area:        { type: "string", description: "Print area this design is for (from the gallery message, e.g. 'Back'). Needed when designs differ per area." },
      },
      required: [],
    },
  },
  {
  name: "browse_gallery",
  description:
    "PRODUCT CREATION — STEP 3 (artwork). Opens the creator's design gallery + upload widget inline. " +
    "ONLY used inside the create-product flow — never for 'show my designs' or anything else.\n\n" +
    "Call it IMMEDIATELY (without asking) when the 'Product options for …' message from the options picker arrives, " +
    "or once the creator has otherwise answered every get_blank_details question: " +
    "colors, sizes, print area(s), and sales channel. All of these are REQUIRED inputs — the server rejects the call " +
    "if any are missing or don't match the blank, and tells you what to ask.\n\n" +
    "MULTIPLE AREAS with different designs: call this once PER AREA, passing area (e.g. 'Front', then 'Back'). " +
    "After the first call you only need blank_id + area — the other choices are remembered. " +
    "The upload_artwork result tells you which area is next; never ask the creator to pick the next design in text — reopen the gallery.\n\n" +
    "After calling: say one short line like 'Pick a design or upload a new one 👇' and stop. Do NOT create an artifact " +
    "or list designs. When a message arrives like 'Use this design: \"x.png\" — artwork_url: https://...', " +
    "call upload_artwork with that artwork_url (and its area, if the message names one); the upload_artwork result says what's next.",
  inputSchema: {
    type: "object",
    properties: {
      blank_id:      { type: "string", description: "Blank ID the creator chose (same one passed to get_blank_details)" },
      color_names:   { type: "array", items: { type: "string" }, minItems: 1, description: "Colors the creator picked, exact names from get_blank_details" },
      sizes:         { type: "array", items: { type: "string" }, minItems: 1, description: "Sizes the creator picked, exact strings from get_blank_details" },
      print_areas:   { type: "array", items: { type: "string" }, minItems: 1, description: "Print area(s) the creator picked" },
      sales_channel: { type: "string", enum: ["marketplace", "own_store", "both"], description: "Where to sell" },
      design_mode:   { type: "string", enum: ["same", "different"], description: "Required when more than one print area: same design on all areas, or a different design per area" },
      area:          { type: "string", description: "Which print area this gallery is for (e.g. 'Front', 'Back'). Required in 'different' mode." },
    },
    required: ["blank_id"],
  },
  _meta: { ui: { resourceUri: "ui://junooni/gallery" } },
},
  {
    name: "create_upload_session",
    description:
      "FALLBACK ONLY. The gallery widget (browse_gallery) already has an upload tile — use that. " +
      "Only call this if the creator says they cannot see or use the gallery widget. " +
      "Returns a browser upload link; afterwards call check_upload.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "check_upload",
    description:
      "PRODUCT CREATION — ARTWORK UPLOAD. Call after the creator confirms they uploaded " +
      "via the widget. Returns design_session_id to use in generate_mockup.",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type:        "string",
          description: "Upload token returned by create_upload_session",
        },
      },
      required: ["token"],
    },
  },
  {
    name: "generate_mockup",
    description:
      "PRODUCT CREATION — STEP 5. Generate a preview of the design on the chosen garment color and print area. " +
      "RULES — follow these exactly:\n" +
      "• Call this ONCE PER COLOR for each selected print area.\n" +
      "• If the creator selected MULTIPLE PRINT AREAS, use their same/different-design choice from the options picker message " +
      "(only ask if it's missing).\n" +
      "• Same design on all areas → call generate_mockup once per color using the primary area; " +
      "the same design_session_id is reused for all areas.\n" +
      "• Different design per area → call upload_artwork + generate_mockup once per area per color.\n" +
      "• Generate ALL mockups first (every colour × area) without commenting on each one, then call review_mockups ONCE " +
      "with all mockup_session_ids — the creator reviews them in a widget. Do NOT show images, tables or session IDs yourself.",
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
    name: "review_mockups",
    description:
      "PRODUCT CREATION — STEP 5b. Call ONCE after all generate_mockup calls are done, with every mockup_session_id " +
      "(all colours and areas). Opens an inline review widget showing all mockups to the creator. " +
      "After calling, say one short line like 'Here are your mockups — approve or ask for changes 👇' and stop.\n\n" +
      "If a 'Mockups approved…' message arrives: call finalize_product (with 3 title suggestions) — keep the color_names and " +
      "mockup_session_ids from that message (same order) for create_product. " +
      "If a 'Mockup changes requested…' message arrives: make the change (regenerate with generate_mockup) and call review_mockups again.",
    inputSchema: {
      type: "object",
      properties: {
        mockup_session_ids: { type: "array", items: { type: "string" }, minItems: 1, description: "All mockup session IDs from generate_mockup, in colour order" },
        product_name:       { type: "string", description: "Blank or product name shown as the widget title, e.g. 'Unisex Hoodie'" },
      },
      required: ["mockup_session_ids"],
    },
    _meta: { ui: { resourceUri: "ui://junooni/mockup-review" } },
  },
  {
    name: "finalize_product",
    description:
      "PRODUCT CREATION — STEP 6. Call right after the 'Mockups approved…' message. Opens an inline widget where the creator " +
      "picks a product TITLE and a SELLING PRICE (price tiers + custom, with live earnings).\n\n" +
      "You must pass 3 suggested_titles based on the design/artwork and product type: short (2–6 words, max 60 chars), catchy, " +
      "NO colour names, no sizes, no emojis. Best one first. Do NOT decide the title yourself — the creator chooses or writes their own.\n\n" +
      "After calling, say one short line like 'Pick a title and price 👇' and stop.\n" +
      "• 'Final product details…' message → call create_product with EXACTLY that title and selling_price, plus the colours, sizes, " +
      "channel, design_session_id and mockup_session_ids you already have.\n" +
      "• 'Suggest 3 different product titles…' message → call finalize_product again with 3 NEW titles (not the ones listed).",
    inputSchema: {
      type: "object",
      properties: {
        suggested_titles:  { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4, description: "3 title ideas from the design, best first, no colour names" },
        mockup_session_id: { type: "string", description: "One approved mockup (front, first colour) to show as the thumbnail" },
      },
      required: ["suggested_titles"],
    },
    _meta: { ui: { resourceUri: "ui://junooni/finalize" } },
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
      "CREATE-PRODUCT FLOW (strict order): 1 search_blanks → 2 get_blank_details → 3 browse_gallery (artwork widget) → " +
      "4 upload_artwork → 5 generate_mockup → 5b review_mockups → 6 finalize_product (creator picks title + price) → 7 create_product. " +
      "If they haven't said the product type, ask (e.g. oversized t-shirt, hoodie, tote bag), then call this. " +
      "Show results as product cards. If exactly ONE result matches, call get_blank_details for it immediately. " +
      "Otherwise, after they pick, call get_blank_details. " +
      "Do NOT ask about colors, sizes, print area or channel here — those questions come from get_blank_details. " +
      "Do NOT ask about artwork and NEVER ask the creator to attach/upload a file in chat — artwork is always " +
      "picked or uploaded in the gallery widget (browse_gallery).",
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
      "PRODUCT CREATION — STEP 2. Call after creator selects a blank from search_blanks (or immediately if only one matched). " +
      "ALWAYS call this before asking any product questions — even if the creator already volunteered colors/sizes.\n\n" +
      "The creator sees an interactive OPTIONS PICKER widget inline (colour swatches, sizes, print technology, print areas, " +
      "same/different design, sales channel). Do NOT list the options in text and do NOT ask the questions yourself — " +
      "just say one short line like 'Pick your options below 👇' and stop.\n\n" +
      "When a message arrives starting 'Product options for …' it contains every choice. Then IMMEDIATELY call browse_gallery " +
      "with that blank_id, color_names, sizes, print_areas and sales_channel — no confirmation question. " +
      "Keep the technology_id for generate_mockup, and the same/different-design choice for multi-area mockups.\n\n" +
      "Only if the creator says they can't see the picker: ask colors, sizes, print area(s), technology (if >1) and channel in one message, " +
      "using EXACT option strings from the result (never rename sizes — 'X' stays 'X'). " +
      "Never ask the creator to attach artwork in chat — that happens in browse_gallery.",
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
    _meta: { ui: { resourceUri: "ui://junooni/blank-options" } },
  },
  {
    name: "suggest_price",
    description:
      "FALLBACK ONLY — pricing normally happens inside the finalize_product widget. " +
      "Use this only if the creator can't see that widget or asks for a price breakdown in chat. " +
      "Never pick the price yourself.",
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
      "PRODUCT CREATION — STEP 7 (final). Only call after a 'Final product details' message from the finalize_product widget " +
      "(or the creator explicitly confirming a title AND price in chat). Use EXACTLY that title and selling_price — " +
      "never invent or change the title yourself. If you don't have both, call finalize_product first. " +
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
          description: "The title the CREATOR chose in finalize_product (exactly as given) — never one you made up",
        },
        blank_id: {
          type:        "string",
          description: "Blank product ID from search_blanks (the garment/item to print on)",
        },
        selling_price: {
          type:        "number",
          description: "Selling price in INR the CREATOR chose in finalize_product — never invent it.",
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
      return lines.join("\n").trim() + `\n\n---\nRENDER_AS_CARDS: true\nShow each product above as a visual card with its name, base cost, colors, sizes, print method, and image_url as the card thumbnail. For a single result, show it as a single featured card.\n\nNEXT STEP: ${blanks.length === 1 ? `call get_blank_details with blank_id=${blanks[0].id} NOW, in this same turn — do not ask any questions first.` : `ask which one they want, then call get_blank_details.`} Do NOT ask about colors/sizes/print area/channel/artwork yet, and never ask the creator to attach a file in chat.`
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

      lines.push(``)
      lines.push(`---`)
      lines.push(`The creator is now seeing an OPTIONS PICKER widget with all of the above (colours, sizes, print areas${techs.length > 1 ? ", technology" : ""}, sales channel).`)
      lines.push(`Do NOT list these options or ask the questions in text — reply with one short line like "Pick your options below 👇" and stop.`)
      lines.push(``)
      lines.push(`NEXT STEP (do not skip, do not ask permission): when a message starting "Product options for ${b.name}" arrives, ` +
                 `immediately call browse_gallery with blank_id=${b.id} and the chosen color_names, sizes, print_areas and sales_channel.`)
      lines.push(`Only if the creator says they can't see the picker: ask for colours, sizes, print area(s)${techs.length > 1 ? ", technology" : ""} and sales channel in ONE message using the exact strings above.`)

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
      return [
        `Mockup generated — color: ${d.color_name ?? ""}, area: ${d.area ?? "front"}, mockup_session_id: ${d.mockup_session_id ?? ""}`,
        `If more colours/areas are still pending, generate them now. When ALL are done, call review_mockups once with every mockup_session_id. ` +
        `Do not show this image, a table or the session IDs to the creator.`,
      ].join("\n")
    }

    case "finalize_product": {
      return [
        `The creator now sees the finalize widget with these title ideas: ${(d.titles ?? []).map((t: string) => `"${t}"`).join(", ")}` +
          ` (they can also write their own) and price tiers ${(d.pricing?.tiers ?? []).map((t: any) => `${t.label} ₹${t.price}`).join(", ")} (or custom).`,
        `Say one short line like "Pick a title and price 👇" and stop. Don't repeat the options.`,
        `On 'Final product details…' → create_product with EXACTLY that title and selling_price.`,
        `On 'Suggest 3 different product titles…' → call finalize_product again with 3 new titles.`,
      ].join("\n")
    }

    case "review_mockups": {
      const ms: any[] = d.mockups ?? []
      return [
        `The creator is now reviewing ${ms.length} mockup${ms.length !== 1 ? "s" : ""} in an inline widget: ` +
          ms.map((m: any) => `${m.color} (${m.area})`).join(", ") + ".",
        `Say one short line like "Here are your mockups — approve or ask for changes 👇" and stop. Do not list them.`,
        `On 'Mockups approved…' → call finalize_product with 3 title suggestions; keep that message's color_names and mockup_session_ids for create_product.`,
        `On 'Mockup changes requested…' → regenerate with generate_mockup and call review_mockups again.`,
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

    case "create_upload_session": {
      return [
        `🖼️ **Upload Your Design**`,
        ``,
        `👉 **Open this link to upload:** ${d.upload_url}`,
        ``,
        `Tell the creator:`,
        `1. Open the link above in your browser`,
        `2. Tap **Choose Image** and pick your design`,
        `3. Tap **Upload Design**`,
        `4. Once you see ✅, come back here and say **done**`,
        ``,
        `Token: \`${d.token}\``,
      ].join("\n")
    }
 
    case "check_upload": {
      return [
        `✅ **Artwork uploaded!**`,
        ``,
        `File: ${d.filename}`,
        `Design session ID: \`${d.design_session_id}\``,
        ``,
        `Next: call **generate_mockup** with this design_session_id to preview on the garment.`,
      ].join("\n")
    }

    case "browse_gallery": {
  const images: any[] = d.images ?? []
  if (images.length) {
    return [
      `Gallery widget is now showing ${images.length} design${images.length !== 1 ? "s" : ""} to the creator inline, plus an upload tile.`,
      `Designs: ${images.map((i: any) => i.filename).join(", ")}`,
      `Do not list these again. Wait for the creator's pick (a 'Use this design ... artwork_url' message), then call upload_artwork.`,
      `If the creator says they can't see the widget, share these instead:`,
      ...images.map((i: any) => `- ${i.filename}: ${i.url}`),
    ].join("\n")
  }
  // Fallback: no widget HTML — show inline images as before
  if (images.length === 0) {
    return [
      `Gallery widget is showing an empty gallery with an upload tile. Tell the creator to upload their design in the widget. Wait for the 'Use this design ... artwork_url' message, then call upload_artwork.`,
    ].join("\n")
  }
  const lines: string[] = [
    `🖼️ **Your Design Gallery** — ${images.length} design${images.length !== 1 ? "s" : ""}`,
    ``,
  ]
  images.forEach((img: any, i: number) => {
    const sizeKB  = img.size ? Math.round(img.size / 1024) : null
    const sizeStr = sizeKB
      ? sizeKB < 1024 ? `${sizeKB} KB` : `${(sizeKB / 1024).toFixed(1)} MB`
      : ""
    lines.push(`**${i + 1}. ${img.filename}**${sizeStr ? ` — ${sizeStr}` : ""}`)
    lines.push(`![${img.filename}](${img.url})`)
    lines.push(`\`artwork_url: ${img.url}\``)
    lines.push(``)
  })
  lines.push(`---`)
  lines.push(`📤 **Upload new design** — say "upload new design" to get a fresh upload link`)
  lines.push(``)
  lines.push(`Say the **number** or **name** of the design to use it.`)
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

  // ── DEBUG: log every incoming tool call ──────────────────────────────────────
  console.log(`[MCP] ▶ POST method=${method} tool=${toolName}`)

  // ── 2. Handle meta-methods BEFORE auth ──────────────────────────────────────
  if (method === "initialize") {
  return res.json({
    jsonrpc: "2.0", id: rpcId,
    result: {
      protocolVersion: "2025-03-26",
      capabilities: {
        tools: {},
        resources: {},
      },
      serverInfo: { name: "JUNOONI Creator Store", version: "1.0.0" },
    },
  })
}

// ── MCP Resources — served without auth so Claude.ai host can fetch them ──
  if (method === "resources/list") {
    console.log(`[MCP] 🔍 resources/list called`) 
    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: {
        resources: [
          {
    uri:         "ui://junooni/gallery",
    name:        "JUNOONI Gallery Widget",
    description: "Inline gallery + upload UI for the creator's design library",
    mimeType:    "text/html;profile=mcp-app",
          },
          {
    uri:         "ui://junooni/blank-options",
    name:        "JUNOONI Product Options",
    description: "Inline picker for colours, sizes, print areas and sales channel of a blank product",
    mimeType:    "text/html;profile=mcp-app",
          },
          {
    uri:         "ui://junooni/finalize",
    name:        "JUNOONI Finalize Product",
    description: "Inline picker for product title and selling price",
    mimeType:    "text/html;profile=mcp-app",
          },
          {
    uri:         "ui://junooni/mockup-review",
    name:        "JUNOONI Mockup Review",
    description: "Inline grid of generated mockups with approve / request changes",
    mimeType:    "text/html;profile=mcp-app",
          },
        ],
      },
    })
  }

  if (method === "resources/read") {
    const uri = body?.params?.uri ?? ""
    console.log(`[MCP] 🔍 resources/read called uri=${uri}`)
    if (uri === "ui://junooni/gallery") {
      return res.json({
        jsonrpc: "2.0", id: rpcId,
        result: {
          contents: [
            {
              uri,
              mimeType: "text/html;profile=mcp-app",
              text: GALLERY_WIDGET_HTML,
              _meta: {
                ui: {
                  csp: {
                    connectDomains:  ["https://api.junooni.com"],   // upload POST
                    resourceDomains: ["https://files.junooni.com"], // design thumbnails
                  },
                  prefersBorder: true,
                },
              },
            },
          ],
        },
      })
    }
    if (uri === "ui://junooni/finalize") {
      return res.json({
        jsonrpc: "2.0", id: rpcId,
        result: { contents: [{ uri, mimeType: "text/html;profile=mcp-app", text: FINALIZE_PRODUCT_WIDGET_HTML, _meta: { ui: { prefersBorder: true } } }] },
      })
    }
    if (uri === "ui://junooni/mockup-review") {
      return res.json({
        jsonrpc: "2.0", id: rpcId,
        result: { contents: [{ uri, mimeType: "text/html;profile=mcp-app", text: MOCKUP_REVIEW_WIDGET_HTML, _meta: { ui: { prefersBorder: true } } }] },
      })
    }
    if (uri === "ui://junooni/blank-options") {
      return res.json({
        jsonrpc: "2.0", id: rpcId,
        result: {
          contents: [
            {
              uri,
              mimeType: "text/html;profile=mcp-app",
              text: BLANK_OPTIONS_WIDGET_HTML,
              // Thumbnail is embedded as a data: URI server-side → no extra domains needed
              _meta: { ui: { prefersBorder: true } },
            },
          ],
        },
      })
    }
    return res.json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32002, message: "Resource not found: " + uri },
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
  let tokenScope: string

  if (DEV_MODE && DEV_VENDOR_ID) {
    // Local dev — no token needed, uses DEV_MCP_VENDOR_ID from .env
    vendorId   = DEV_VENDOR_ID
    tokenScope = "read write"
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
  const writeTools = ["create_product", "upload_artwork", "generate_mockup", "create_upload_session"]
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
      const baseUrl   = process.env.UPLOAD_WIDGET_BASE_URL
        ?? process.env.MEDUSA_BACKEND_URL
        ?? process.env.NEXT_PUBLIC_BACKEND_URL
        ?? "http://localhost:9000"

    const storeTools = [
      "get_store_overview", "get_orders", "get_earnings",
      "get_products", "get_order_detail", "get_own_store", "get_pending_actions",
    ]

    if (storeTools.includes(toolName)) {
      console.log(`[MCP] store tool: ${toolName}`)
      const vendor = await getVendorContext(req.scope, vendorId)
      rawResult    = await handleTool(toolName as any, toolArgs, vendor)
      console.log(`[MCP] store tool done: ${toolName} ok=${rawResult?.ok}`)

    } else if (toolName === "search_blanks") {
      console.log(`[MCP] search_blanks query="${toolArgs.query}"`)
      rawResult = await handleSearchBlanks({
        query:         toolArgs.query,
        limit:         toolArgs.limit ?? 50,
        inline_images: true,
      })
      console.log(`[MCP] search_blanks done ok=${rawResult?.ok}`)

    } else if (toolName === "get_blank_details") {
      console.log(`[MCP] get_blank_details blank_id=${toolArgs.blank_id}`)
      rawResult = await handleGetBlankDetails({ blank_id: toolArgs.blank_id })
      console.log(`[MCP] get_blank_details done ok=${rawResult?.ok}`)
      if (rawResult?.ok) {
        const b = rawResult.data?.blank ?? rawResult.data ?? {}
        productFlows.set(vendorId, {
          blank_id:    String(toolArgs.blank_id),
          colors:      (b.colors ?? []).map((c: any) => c?.name ?? c).filter(Boolean),
          sizes:       (b.sizes ?? []).map((x: any) => x?.name ?? x).filter(Boolean),
          print_areas: (b.print_areas ?? []).map((x: any) => x?.name ?? x).filter(Boolean),
          blank_name:   b.name,
          base_cost:    Number(b.base_cost ?? 0),
          product_type: String(b.product_type ?? ""),
          at:          Date.now(),
        })
      }

    } else if (toolName === "suggest_price") {
      console.log(`[MCP] suggest_price base_cost=${toolArgs.base_cost}`)
      rawResult = handleSuggestPrice({
        base_cost:        toolArgs.base_cost,
        product_type:     toolArgs.product_type,
        fulfillment_type: toolArgs.fulfillment_type,
      })
      console.log(`[MCP] suggest_price done`)

    } else if (toolName === "upload_artwork") {
      console.log(`[MCP] upload_artwork — URL path, url=${toolArgs.artwork_url}`)
      rawResult = await handleUploadArtworkFromUrl(
        { artwork_url: toolArgs.artwork_url, filename: toolArgs.filename },
        vendorId
      )
      console.log(`[MCP] upload_artwork — URL path done ok=${rawResult?.ok}`)
      const flow = getFlow(vendorId)
      if (rawResult?.ok && flow?.choices && rawResult.data?.design_session_id) {
        const areas = flow.choices.print_areas
        const area  = (toolArgs.area && areas.find((a) => areaKey(a) === areaKey(toolArgs.area))) ?? flow.pending_area ?? areas[0]
        flow.designs = { ...(flow.designs ?? {}), [area]: { design_session_id: rawResult.data.design_session_id, filename: rawResult.data.filename } }
        const need = areasNeedingDesign(flow)
        flow.pending_area = need[0]
        flow.at = Date.now()
        rawResult.data._flow_area = area
        rawResult.data._flow_next = need.length
          ? { kind: "gallery", area: need[0] }
          : { kind: "mockups", plan: designsByArea(flow), colors: flow.choices.color_names, areas }
        console.log(`[MCP] upload_artwork recorded area=${area} designs=${JSON.stringify(flow.designs)} next=${JSON.stringify(rawResult.data._flow_next)}`)
      }

    } else if (toolName === "generate_mockup") {
      console.log(`[MCP] generate_mockup blank_id=${toolArgs.blank_id} color=${toolArgs.color_hex} area=${toolArgs.area} session=${toolArgs.design_session_id}`)
      rawResult = await handleGenerateInlineMockup({
        blank_id:           toolArgs.blank_id,
        technology_id:      toolArgs.technology_id,
        selected_color_hex: toolArgs.color_hex,
        design_session_id:  toolArgs.design_session_id,
        color_name:         toolArgs.color_name,
        area:               toolArgs.area ?? "front",
        position:           toolArgs.position ?? "center",
      })
      console.log(`[MCP] generate_mockup done ok=${rawResult?.ok} hasBase64=${!!rawResult?.data?.preview_base64}`)

      // Store result so create_product can reference it, and upload for public URL
      if (rawResult.ok && rawResult.data?.preview_base64) {
        const b64url   = rawResult.data.preview_base64 as string
        const sid      = storeMockupPreview(vendorId, b64url, toolArgs.area, toolArgs.color_name, toolArgs.color_hex)
        rawResult.data.mockup_session_id = sid
        console.log(`[MCP] generate_mockup — mockup stored sid=${sid}`)

        // Upload to file storage → public URL so Claude can render it inline
        if (b64url.startsWith("data:")) {
          try {
            const [header, b64] = b64url.split(",")
            const mimeType = header.replace("data:", "").replace(";base64", "")
            const ext      = mimeType.split("/")[1]?.split("+")[0] ?? "webp"

            console.log(`[MCP] generate_mockup — uploading preview to file storage, mimeType=${mimeType} b64len=${b64.length}`)
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
              console.log(`[MCP] generate_mockup — preview uploaded → ${previewUrl}`)
            } else {
              console.warn(`[MCP] generate_mockup — uploadFilesWorkflow returned no URL`)
            }
          } catch (uploadErr: any) {
            console.warn("[MCP] mockup preview upload failed (non-fatal):", uploadErr.message)
          }
        }
      }

    } else if (toolName === "create_product") {
      console.log(`[MCP] create_product title="${toolArgs.title}" blank_id=${toolArgs.blank_id} colors=${JSON.stringify(toolArgs.color_names ?? toolArgs.color_name)}`)
      const flowForCreate = getFlow(vendorId)
      if (flowForCreate?.choices) {
        const missing = areasNeedingDesign(flowForCreate)
        if (missing.length) {
          rawResult = { ok: false, error: `No design chosen yet for: ${missing.join(", ")}. Call browse_gallery with area='${missing[0]}' first.` }
        } else {
          toolArgs.designs_by_area = designsByArea(flowForCreate)
          console.log(`[MCP] create_product designs_by_area=${JSON.stringify(toolArgs.designs_by_area)}`)
        }
      }
      if (!rawResult) rawResult = await handleCreateProduct(toolArgs, vendorId, req.scope, token ?? undefined)
      console.log(`[MCP] create_product done ok=${rawResult?.ok} productId=${rawResult?.data?.id}`)
      if (rawResult?.ok) productFlows.delete(vendorId)

     } else if (toolName === "finalize_product") {
      const flow = getFlow(vendorId)
      const titles = (Array.isArray(toolArgs.suggested_titles) ? toolArgs.suggested_titles : [])
        .map((t: any) => String(t ?? "").trim().replace(/\s+/g, " ").slice(0, 80))
        .filter((t: string) => t.length >= 3)
        .slice(0, 4)
      if (!flow || !flow.base_cost) {
        rawResult = { ok: false, error: "No product in progress — start again with search_blanks / get_blank_details." }
      } else if (!titles.length) {
        rawResult = { ok: false, error: "Pass 3 suggested_titles based on the design (no colour names)." }
      } else {
        const priced = handleSuggestPrice({ base_cost: flow.base_cost, product_type: flow.product_type ?? "" }) as any
        let thumb: string | null = null
        const sid = String(toolArgs.mockup_session_id ?? "")
        if (sid.startsWith(`mockup_${vendorId}_`)) {
          const full = getMockupPreview(sid)
          if (full) {
            try {
              const b64 = full.includes(",") ? full.split(",")[1] : full
              const small = await sharp(Buffer.from(b64, "base64"), { failOn: "none" }).resize(160, 160, { fit: "cover" }).webp({ quality: 80 }).toBuffer()
              thumb = `data:image/webp;base64,${small.toString("base64")}`
            } catch { /* no thumb */ }
          }
        }
        rawResult = {
          ok: true,
          data: {
            product: {
              blank_name:    flow.blank_name ?? null,
              thumb,
              colors:        flow.choices?.color_names ?? [],
              sizes:         flow.choices?.sizes ?? [],
              sales_channel: flow.choices?.sales_channel ?? null,
            },
            titles,
            // fee_rate/commission must match handleSuggestPrice's payout formula
            pricing: { base_cost: flow.base_cost, fee_rate: 0.05, commission: 0, tiers: priced?.data?.tiers ?? [] },
          },
        }
        console.log(`[MCP] finalize_product vendor=${vendorId} titles=${JSON.stringify(titles)} tiers=${JSON.stringify(priced?.data?.tiers)}`)
      }

     } else if (toolName === "review_mockups") {
      const ids: string[] = Array.isArray(toolArgs.mockup_session_ids) ? toolArgs.mockup_session_ids : []
      const mine = ids.filter((id) => typeof id === "string" && id.startsWith(`mockup_${vendorId}_`))
      const mockups = await Promise.all(mine.map(async (id) => {
        const full = getMockupPreview(id)
        let image: string | null = null
        if (full) {
          try {
            const b64 = full.includes(",") ? full.split(",")[1] : full
            const small = await sharp(Buffer.from(b64, "base64"), { failOn: "none" })
              .resize(560, 560, { fit: "inside" }).webp({ quality: 80 }).toBuffer()
            image = `data:image/webp;base64,${small.toString("base64")}`
          } catch { image = full.startsWith("data:") ? full : null }
        }
        return {
          id,
          color: getMockupColorName(id) ?? "Colour",
          hex:   getMockupColorHex(id) ?? null,
          area:  getMockupArea(id) ?? "front",
          image,
        }
      }))
      const missing = mockups.filter((m) => !m.image).length
      console.log(`[MCP] review_mockups vendor=${vendorId} requested=${ids.length} mine=${mine.length} missing=${missing}`)
      rawResult = mockups.length
        ? { ok: true, data: { product: toolArgs.product_name ?? null, mockups } }
        : { ok: false, error: "No mockups found for these IDs (they expire after 2 hours). Generate them again with generate_mockup." }

     } else if (toolName === "browse_gallery") {
  const flowError = validateGalleryArgs(vendorId, toolArgs)
  if (flowError) {
    console.log(`[MCP] browse_gallery rejected vendor=${vendorId}: ${flowError}`)
    rawResult = { ok: false, error: flowError }
  } else try {
    const flow = getFlow(vendorId)!
    const sameChoices = flow.choices &&
      JSON.stringify(flow.choices.print_areas) === JSON.stringify(toolArgs.print_areas) &&
      JSON.stringify(flow.choices.color_names) === JSON.stringify(toolArgs.color_names)
    if (!sameChoices) flow.designs = {}          // options changed → start designs over
    flow.choices = {
      color_names:   toolArgs.color_names,
      sizes:         toolArgs.sizes,
      print_areas:   toolArgs.print_areas,
      sales_channel: toolArgs.sales_channel,
    }
    if (toolArgs.design_mode) flow.design_mode = toolArgs.design_mode
    if (toolArgs.print_areas.length <= 1) flow.design_mode = "same"
    const need = areasNeedingDesign(flow)
    flow.pending_area =
      (toolArgs.area && toolArgs.print_areas.find((a: string) => areaKey(a) === areaKey(toolArgs.area))) ??
      need[0] ?? toolArgs.print_areas[0]
    flow.at = Date.now()
    const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const result   = await pgClient.raw(
      `SELECT id, url, filename, size, mime_type, created_at
       FROM vendor_gallery_image
       WHERE vendor_id = ?
         AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 20`,
      [vendorId]
    )
     
    const rows = result.rows ?? result[0] ?? []
    console.log(`[MCP] browse_gallery vendor=${vendorId} count=${rows.length}`)
    const uploadToken = generateUploadToken()
    uploadTempTokens.set(uploadToken, { vendorId, createdAt: Date.now() })
    const uploadUrl = `${baseUrl}/mcp/widget-upload?token=${uploadToken}`
    const images = rows.slice(0, 12).map((img: any) => ({
      url:      img.url,
      filename: img.filename,
      size:     img.size,
    }))
    rawResult = { ok: true, data: { images, upload_url: uploadUrl } }
  } catch (e: any) {
    rawResult = { ok: false, error: e.message }
  }

    } else if (toolName === "create_upload_session") {
      const token     = generateUploadToken()
      uploadTempTokens.set(token, { vendorId, createdAt: Date.now() })
     
      const uploadUrl = `${baseUrl}/mcp/upload-artwork-file?token=${token}`
      rawResult = {
        ok: true,
        data: { token, upload_url: uploadUrl },
      }
      console.log(`[MCP] create_upload_session token=${token}`)
 
    } else if (toolName === "check_upload") {
      const token  = toolArgs.token as string
      const result = uploadResults.get(token)
      if (!result) {
        rawResult = {
          ok:    false,
          error: "No upload found for this token yet. Ask the creator to upload first, then try again.",
        }
      } else {
        uploadResults.delete(token) // consume — one read only
        rawResult = { ok: true, data: result }
      }
      console.log(`[MCP] check_upload token=${token} found=${!!result}`)
    }
    else {
      rawResult = { ok: false, error: `Tool not implemented: ${toolName}` }
    }

    // ── 7. Format and return ───────────────────────────────────────────────────
    let text    = formatToolResult(toolName, rawResult)

    // Multi-area flow: tell Claude exactly what comes next after each artwork pick
    const nx = toolName === "upload_artwork" && rawResult?.ok ? rawResult.data?._flow_next : null
    if (nx?.kind === "gallery") {
      text += `\n\nDesign saved for ${rawResult.data._flow_area}. NEXT STEP (do it now, in this turn): call browse_gallery with ` +
              `blank_id and area='${nx.area}' so the creator can pick the ${nx.area} design. Do NOT ask them in text and do NOT generate mockups yet.`
    } else if (nx?.kind === "mockups") {
      const plan = Object.entries(nx.plan as Record<string, string>).map(([a, sid]) => `${a} → design_session_id ${sid}`).join("; ")
      text += `\n\nAll designs are ready (${plan}). NEXT STEP: call generate_mockup for EVERY colour (${nx.colors.join(", ")}) × ` +
              `EVERY area (${nx.areas.join(", ")}), using that area's design_session_id and passing area. ` +
              `Then call review_mockups once with all mockup_session_ids.`
    }
    const isError = !rawResult?.ok


    console.log(`[MCP] ✅ vendor=${vendorId} tool=${toolName} ok=${rawResult?.ok}`)

    const content: { type: string; text?: string; data?: string; mimeType?: string }[] = [
      { type: "text", text },
    ]


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


    return res.json({
      jsonrpc: "2.0", id: rpcId,
      result: {
        content,
        isError,
        ...(toolName === "finalize_product" ? {
          structuredContent: rawResult?.ok ? rawResult.data : { error: rawResult?.error ?? "Could not load" },
        } : {}),
        ...(toolName === "review_mockups" ? {
          structuredContent: rawResult?.ok
            ? { product: rawResult.data.product, mockups: rawResult.data.mockups }
            : { error: rawResult?.error ?? "Could not load mockups" },
        } : {}),
        ...(toolName === "get_blank_details" ? {
          structuredContent: rawResult?.ok
            ? await buildBlankOptionsPayload(rawResult.data)
            : { error: rawResult?.error ?? "Could not load product options" },
        } : {}),
        ...(toolName === "browse_gallery" ? {
          structuredContent: rawResult?.ok
            ? { images: rawResult.data.images, upload_url: rawResult.data.upload_url,
                area: (getFlow(vendorId)?.design_mode === "different" && (getFlow(vendorId)?.choices?.print_areas?.length ?? 0) > 1) ? getFlow(vendorId)?.pending_area ?? null : null }
            : { error: rawResult?.error ?? "Gallery unavailable" },
        } : {}),
      },
    })
  } catch (err: any) {
    console.error(`[MCP] ❌ tool execution error — tool=${toolName} vendor=${vendorId ?? "?"}:`, err)
    return res.status(500).json({
      jsonrpc: "2.0", id: rpcId,
      error: { code: -32603, message: err?.message ?? "Internal error" },
    })
  }
}
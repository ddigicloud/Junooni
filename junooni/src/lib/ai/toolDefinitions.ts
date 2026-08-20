// ─── toolDefinitions.ts ───────────────────────────────────────────────────────
// Gemini function declarations for MCP tool calling.
// Uses @google/genai SDK types (NOT the old @google/generative-ai).
// SchemaType is replaced with plain string literals for the new SDK.

export const JUNI_TOOLS = [
  {
    name: "get_store_overview",
    description:
      "Get the creator's store overview: product counts, pending orders, wallet balance, membership plan, and own store status. Call this when asked about store stats, overview, or summary.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_orders",
    description:
      "Get the creator's orders. Can filter by status or date range. Use this when asked about specific orders, order counts, or order history. Returns order ID, customer name, total, payout, and status.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description:
            "Optional status filter: 'pending_fulfillment', 'shipped', 'delivered', 'canceled', 'all'. Default: 'all'.",
          enum: ["all", "pending_fulfillment", "shipped", "delivered", "canceled"],
        },
        limit: {
          type: "number",
          description: "Max number of orders to return. Default: 10, max: 50.",
        },
      },
    },
  },
  {
    name: "get_earnings",
    description:
      "Get detailed earnings breakdown: wallet balance, total earned, revenue from recent orders, and per-order payout details. Call this when asked about earnings, income, money, payouts, or wallet.",
    parameters: {
      type: "object",
      properties: {
        include_order_breakdown: {
          type: "boolean",
          description: "If true, include per-order payout details. Default: false.",
        },
      },
    },
  },
  {
    name: "get_products",
    description:
      "Get the creator's published products with sales channel breakdown. Call when asked about products, catalog, or what's listed on marketplace vs own store.",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Filter by channel: 'all', 'marketplace', 'own_store', 'both'. Default: 'all'.",
          enum: ["all", "marketplace", "own_store", "both"],
        },
      },
    },
  },
  {
    name: "get_order_detail",
    description:
      "Look up a specific order by its ID (e.g. #1234). Returns full detail including customer info, payout, and status. Use when a creator asks about a specific order number.",
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Order ID to look up, e.g. '#123' or '123'.",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_own_store",
    description:
      "Get full details about the creator's own storefront: URL, template, SEO settings, sections, custom domain, and live/draft status. Call when asked about own store, custom store, or storefront.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_pending_actions",
    description:
      "Get a list of things the creator should do next: pending orders to fulfill, store setup gaps, or missing information. Good for 'what should I do?' type questions.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
]

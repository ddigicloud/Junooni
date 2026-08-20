// ─── inline-product-tools.ts ──────────────────────────────────────────────────
// Uses @google/genai SDK — plain string types, NOT SchemaType enum from old SDK.

export const INLINE_PRODUCT_TOOLS = [
  {
    name: "detect_product_intent",
    description:
      "Called when the creator wants to make/create/add/sell any product. " +
      "Extracts product type, colors mentioned, and whether they have a design ready.",
    parameters: {
      type: "object",
      properties: {
        raw_request: {
          type: "string",
          description: "Creator's exact message.",
        },
      },
      required: ["raw_request"],
    },
  },
  {
    name: "search_blanks",
    description:
      "Search the PayloadCMS product catalog. Call this ONLY ONCE per product request — " +
      "it automatically returns the full catalog if no exact match is found, so retrying " +
      "with different keywords is unnecessary. Returns product list with IDs, names, " +
      "base costs, color count, sizes, and a mockup image URL for each result. " +
      "The frontend renders these as clickable cards in the chat panel.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "e.g. 'hoodie', 'mug', 'tshirt'",
        },
        limit: {
          type: "number",
          description: "Max 4 results",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_blank_details",
    description:
      "Get full details for a specific blank including ALL color options with hex codes, " +
      "all sizes, print areas, base cost, and first mockup image URL. " +
      "Call when creator picks a product from search results.",
    parameters: {
      type: "object",
      properties: {
        blank_id: {
          type: "string",
          description: "PayloadCMS product ID from search_blanks results.",
        },
      },
      required: ["blank_id"],
    },
  },
  {
    name: "generate_inline_mockup",
    description:
      "Composites the design onto the blank product mockup photo and returns a preview image. " +
      "CRITICAL: blank_id is a SHORT NUMBER like 4 or 12 from search_blanks results. " +
      "It is NOT the technology_id (long hex string). Do not confuse them. " +
      "Call only after design upload, area, and position are all confirmed. " +
      "Pass color_name as the display name of the FIRST selected color (e.g. 'Black'). " +
      "The system automatically generates previews for all other selected colors.",
    parameters: {
      type: "object",
      properties: {
        blank_id: {
          type: "string",
          description: "SHORT numeric ID from search_blanks e.g. \"4\" or \"12\". NOT the long hex technology_id.",
        },
        technology_id: {
          type: "string",
          description: "Long hex technology ID from get_blank_details e.g. 6774e1d1...",
        },
        selected_color_hex: {
          type: "string",
          description: "Hex code of the FIRST selected color e.g. '#000000'.",
        },
        // FIX E5: color_name now declared so Gemini can pass it
        color_name: {
          type: "string",
          description: "Display name of the FIRST selected color e.g. 'Black'. Used as the label in the preview slider.",
        },
        design_session_id: {
          type: "string",
          description: "Session ID returned when creator uploaded their design file.",
        },
        area: {
          type: "string",
          description: "Print area name e.g. 'front', 'back'. Default: 'front'.",
        },
        position: {
          type: "string",
          description: "Position within the print area: 'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'. Default: 'center'.",
        },
      },
      required: ["blank_id", "technology_id", "design_session_id"],
    },
  },
  {
    name: "suggest_price",
    description: "Suggest selling price given base cost and product type. Only use when calculate_real_price is not available.",
    parameters: {
      type: "object",
      properties: {
        base_cost: {
          type: "number",
          description: "Base cost in INR.",
        },
        product_type: {
          type: "string",
          description: "e.g. 'hoodie'",
        },
        fulfillment_type: {
          type: "string",
          enum: ["junooni", "creator"],
        },
      },
      required: ["base_cost", "product_type"],
    },
  },
  {
    name: "create_product_from_chat",
    description:
      "Creates the product directly in Medusa. " +
      "Call ONLY after creator has confirmed title, price, colors, sizes, and approved the mockup. " +
      "IMPORTANT: selected_colors MUST contain EXACTLY the colors the creator confirmed — " +
      "read them from the message that contained 'Colors: X | Sizes: Y | HEX: Z'. " +
      "selected_sizes MUST contain EXACTLY the sizes the creator selected, NOT defaults. " +
      "Returns the new product ID and a URL to view it in the dashboard.",
    parameters: {
      type: "object",
      properties: {
        blank_id:         { type: "string", description: "PayloadCMS blank ID — SHORT NUMBER from search_blanks." },
        blank_name:       { type: "string", description: "Human-readable product name from get_blank_details." },
        technology_id:    { type: "string", description: "Long hex print technology ID from get_blank_details." },
        title:            { type: "string", description: "Product title chosen by the creator." },
        description:      { type: "string", description: "Product description." },
        selling_price:    { type: "number", description: "Selling price in INR chosen by the creator." },
        selected_colors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Color display name e.g. 'Black'" },
              hex:  { type: "string", description: "Color hex e.g. '#000000'" },
            },
          },
          description: "EXACT colors the creator selected — read from their 'HEX: Name:#hex,...' confirmation message. Do NOT use defaults.",
        },
        selected_sizes: {
          type: "array",
          items: { type: "string" },
          description: "EXACT sizes the creator selected — read from their 'Sizes: X, L...' confirmation. Do NOT use defaults like S,M,L,XL.",
        },
        fulfillment_type: {
          type: "string",
          enum: ["junooni", "creator"],
          description: "Always 'junooni' unless creator explicitly chose to fulfill themselves.",
        },
        design_session_id: {
          type: "string",
          description: "Session ID from the design upload message.",
        },
        sales_channels: {
          type: "array",
          items: { type: "string" },
          description: "Which channels: 'marketplace', 'own_store', or both.",
        },
        mockup_preview_base64: {
          type: "string",
          description: "Leave empty — the approved mockup is injected server-side.",
        },
        design_area: {
          type: "string",
          description: "The area the creator placed the design on (e.g. 'front', 'back', 'left-sleeve'). Read from the area picker selection. Used to know which area has the design image vs which areas get plain catalog images.",
        },
      },
      required: ["blank_id", "blank_name", "technology_id", "title", "selling_price", "selected_colors", "selected_sizes", "fulfillment_type", "design_session_id"],
    },
  },
]

export const INLINE_PRODUCT_EXTRA_TOOLS = [
  {
    name: "calculate_real_price",
    description:
      "Calculate the EXACT cost price for a product using the same formula as " +
      "the Canvas designer — reads Minimum printing price, Per sq inch printing price, " +
      "setup fees, GST, and shipping from PayloadCMS. " +
      "Call this INSTEAD of suggest_price when you have blank_id and technology_id. " +
      "Returns your true cost per unit plus recommended selling prices with real margins.",
    parameters: {
      type: "object",
      properties: {
        blank_id: {
          type: "string",
          description: "SHORT numeric ID from search_blanks e.g. \"4\" or \"12\". NOT the long hex technology_id.",
        },
        technology_id: {
          type: "string",
          description: "Long hex technology ID from get_blank_details e.g. 6774e1d1...",
        },
        areas: {
          type: "array",
          items: { type: "string" },
          description: "Print areas to cost e.g. ['front'] or ['front','back']. Default: ['front'].",
        },
      },
      required: ["blank_id", "technology_id"],
    },
  },
  {
    name: "remove_background",
    description:
      "Removes white or near-white background from the creator's uploaded design " +
      "so it composites cleanly onto the product. " +
      "Call this automatically after design upload before generating the mockup.",
    parameters: {
      type: "object",
      properties: {
        design_session_id: {
          type: "string",
          description: "The session ID returned after the creator uploaded their design.",
        },
        threshold: {
          type: "number",
          description: "How aggressively to remove background (0-255). Default 30. Use 20 for designs with fine edges.",
        },
      },
      required: ["design_session_id"],
    },
  },
]

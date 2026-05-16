// src/api/vendors/me/store/route.ts

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import bcrypt from "bcryptjs"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const StoreSectionSchema = z.object({
  type: z.enum([
    "hero", "featured", "collection", "featured_collections",
    "about", "social", "announcement", "divider",
    "image", "text", "html", "video", "links", "header", "footer",
    "ticker", "image_text", "video_text", "featured_product", "category_grid",
    "category_products", "collections_grid", "collection_products",
  ]),
}).passthrough()

const VendorCollectionSchema = z.object({
  id: z.string(), title: z.string(), handle: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().nullable().optional(),
  product_ids: z.array(z.string()),
  sort_order: z.number().optional(),
  is_visible: z.boolean().optional(),
  created_at: z.string(),
}).passthrough()

const StorePageSchema = z.object({
  id: z.string(), title: z.string(), slug: z.string(),
  template: z.enum([
    "blank", "about", "faq", "contact", "links",
    "terms", "privacy", "returns",
  ]),
  content: z.string(), in_nav: z.boolean(), in_footer: z.boolean(), created_at: z.string(),
}).passthrough()

export const VendorStoreSchema = z.object({
  // Identity
  subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens").optional(),
  custom_domain: z.string().nullable().optional(),
  //domain_verified: z.boolean().optional(),

  // Template & status
  template: z.enum(["minimal", "bold", "editorial"]).optional(),
  status: z.enum(["draft", "live", "paused"]).optional(),

  // Password protection
  password_enabled: z.boolean().optional(),
  store_password: z.string().min(4).max(100).nullable().optional(),

  // Branding
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  font: z.enum(["inter", "poppins", "playfair", "dm-sans", "space-grotesk"]).nullable().optional(),
  hero_image: z.string().nullable().optional(),
  tagline: z.string().max(120).nullable().optional(),
  announcement_text: z.string().max(200).nullable().optional(),

  // Sections & pages
  sections: z.object({
    sections: z.array(StoreSectionSchema),
    page_layouts: z.record(z.object({
      sections: z.array(StoreSectionSchema.passthrough()),
    }).passthrough()).optional(),
  }).passthrough().nullable().optional(),
  pages: z.object({ pages: z.array(StorePageSchema) }).nullable().optional(),
  collections: z.object({ collections: z.array(VendorCollectionSchema) }).nullable().optional(),

  // Assets
  store_logo: z.string().nullable().optional(),
  store_favicon: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),

  // SEO
  seo_title: z.string().max(60).nullable().optional(),
  seo_description: z.string().max(160).nullable().optional(),

  // Header
  sticky_header: z.boolean().optional(),
  sticky_announcement: z.boolean().optional(),

  // Social
  instagram_url: z.string().nullable().optional(),
  youtube_url: z.string().nullable().optional(),
  twitter_url: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  tiktok_url: z.string().nullable().optional(),
  discord_url: z.string().nullable().optional(),

  // Style
  border_radius: z.enum(["none", "sm", "md", "lg", "full"]).nullable().optional(),
  button_style: z.enum(["filled", "outline", "ghost"]).nullable().optional(),
  product_card: z.object({
    aspect_ratio: z.enum(["square", "portrait", "landscape"]).optional(),
    show_price: z.boolean().optional(),
    show_hover: z.boolean().optional(),
    alignment: z.enum(["left", "center"]).optional(),
    show_sold_out_badge: z.boolean().optional(),
    columns_desktop: z.number().optional(),
  }).nullable().optional(),
  product_detail: z.object({
    element_order: z.array(z.string()).optional(),
    title_size: z.enum(["sm", "md", "lg", "xl"]).optional(),
    title_weight: z.enum(["normal", "semibold", "bold", "extrabold"]).optional(),
    title_color: z.string().nullable().optional(),
    price_color: z.string().nullable().optional(),
    price_size: z.enum(["sm", "md", "lg", "xl"]).optional(),
    colors_label: z.string().optional(),
    show_color_label: z.boolean().optional(),
    color_swatch_size: z.enum(["sm", "md", "lg"]).optional(),
    sizes_label: z.string().optional(),
    show_size_label: z.boolean().optional(),
    size_style: z.enum(["pill", "box", "underline"]).optional(),
    atc_label: z.string().optional(),
    atc_style: z.enum(["filled", "outline", "pill"]).optional(),
    atc_full_width: z.boolean().optional(),
    show_quantity: z.boolean().optional(),
    show_description: z.boolean().optional(),
    description_collapsed: z.boolean().optional(),
    show_secure_badge: z.boolean().optional(),
    secure_badge_text: z.string().optional(),
  }).nullable().optional(),
  custom_css: z.string().nullable().optional(),
})

type StoreBody = z.infer<typeof VendorStoreSchema>

// ─── Settings keys — these go into the JSON settings column ──────────────────
// Everything NOT in this list is saved as a direct column
const SETTINGS_KEYS = [
  "accent_color", "border_radius", "button_style", "product_card",
  "product_detail", "custom_css", "og_image", "hero_image", "tagline",
  "announcement_text", "sticky_header", "sticky_announcement",
  "instagram_url", "youtube_url", "twitter_url", "facebook_url",
  "tiktok_url", "discord_url",
] as const

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getVendorId(req: AuthenticatedMedusaRequest): Promise<string | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  if (req.auth_context?.actor_type === "vendor") {
    const { data: [vendorAdmin] } = await query.graph({
      entity: "vendor_admin",
      fields: ["vendor.id"],
      filters: { id: [req.auth_context.actor_id] },
    })
    return vendorAdmin?.vendor?.id ?? null
  }
  if (req.auth_context?.actor_type === "user") {
    return (req.query.vendor_id as string) ?? null
  }
  return null
}

// Strip store_password hash from response — never send it to client
function sanitizeStore(store: any) {
  if (!store) return store
  const { store_password, ...safe } = store
  return safe
}

// Flatten settings JSON into top-level for client response
function flattenStore(store: any) {
  if (!store) return store
  const { settings, ...rest } = sanitizeStore(store)
  return { ...rest, ...(settings ?? {}) }
}

// ─── GET /vendors/me/store ────────────────────────────────────────────────────

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await svc.retrieveVendor(vendorId, { relations: ["vendor_store"] })
  if (!vendor) return res.status(404).json({ message: "Vendor not found" })

  let store = vendor.vendor_store ?? null
  if (store?.id) {
    try {
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const { data: [fullStore] } = await query.graph({
        entity: "vendor_store", fields: ["*"], filters: { id: store.id },
      })
      if (fullStore) store = fullStore
    } catch {}
  }

  // Flatten settings into top-level so client gets all fields at top level
  return res.json({ store: flattenStore(store) })
}

// ─── POST /vendors/me/store ───────────────────────────────────────────────────

export const POST = async (req: AuthenticatedMedusaRequest<StoreBody>, res: MedusaResponse) => {
  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await svc.retrieveVendor(vendorId, { relations: ["vendor_store"] })
  if (vendor.vendor_store) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Store already exists. Use PUT to update.")
  }

  const body = req.validatedBody || req.body

  // Hash password if provided
  let hashedPassword: string | null = null
  if (body.store_password) {
    hashedPassword = await bcrypt.hash(body.store_password, 12)
  }

  // Pack settings fields into JSON
  const initialSettings: Record<string, any> = {}
  for (const key of SETTINGS_KEYS) {
    if ((body as any)[key] !== undefined) {
      initialSettings[key] = (body as any)[key]
    }
  }

   const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  })

  const defaultPages = [
    {
      id: `page_${Date.now()}_terms`,
      title: "Terms of Service",
      slug: "terms-of-service",
      template: "terms",
      in_nav: false,
      in_footer: true,
      created_at: new Date().toISOString(),
      content: `## Terms of Service

*Last updated: ${today}*

Welcome to **[Your Store Name]**. By accessing or purchasing from our store, you agree to the following terms.

### 1. General
These Terms of Service apply to all visitors, users, and customers of [Your Store Name] ("we", "us", or "our").

### 2. Products
All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.

### 3. Orders & Payment
By placing an order, you confirm that the information you provide is accurate. We accept payment via the methods listed at checkout. Orders are processed only after payment is confirmed.

### 4. Shipping
We ship pan-India. Estimated delivery is 5–10 business days. We are not responsible for delays caused by shipping carriers or customs.

### 5. Returns & Refunds
Please refer to our [Returns & Refunds Policy](/p/returns-refunds) for details.

### 6. Intellectual Property
All content on this store — including logos, designs, and product images — is the property of [Your Store Name] and may not be reproduced without written permission.

### 7. Limitation of Liability
We shall not be liable for any indirect, incidental, or consequential damages arising from your use of our store or products.

### 8. Contact
For any questions, reach us at **[your@email.com]**`,
    },
    {
      id: `page_${Date.now() + 1}_privacy`,
      title: "Privacy Policy",
      slug: "privacy-policy",
      template: "privacy",
      in_nav: false,
      in_footer: true,
      created_at: new Date().toISOString(),
      content: `## Privacy Policy

*Last updated: ${today}*

At **[Your Store Name]**, your privacy is important to us. This policy explains what data we collect and how we use it.

### 1. Information We Collect
- **Personal information:** Name, email address, shipping address, and phone number when you place an order.
- **Payment information:** We do not store card details. Payments are processed securely by our payment partner.
- **Usage data:** Pages visited, browser type, and device information for improving our store experience.

### 2. How We Use Your Information
- To process and fulfil your orders
- To send order confirmations and shipping updates
- To respond to customer service queries
- To improve our products and store experience

### 3. Data Sharing
We do not sell your personal information. We share data only with:
- **Shipping partners** to deliver your orders
- **Payment processors** to handle transactions securely
- **Analytics tools** to understand store performance (data is anonymised)

### 4. Cookies
Our store uses cookies to keep your cart, remember preferences, and analyse traffic. You can disable cookies in your browser settings, though this may affect store functionality.

### 5. Data Retention
We retain your order data for up to 3 years for accounting and legal compliance purposes.

### 6. Your Rights
You have the right to access, correct, or delete your personal data. To make a request, email us at **[your@email.com]**.

### 7. Contact
Questions about this policy? Write to us at **[your@email.com]**`,
    },
    {
      id: `page_${Date.now() + 2}_returns`,
      title: "Returns & Refunds",
      slug: "returns-refunds",
      template: "returns",
      in_nav: false,
      in_footer: true,
      created_at: new Date().toISOString(),
      content: `## Returns & Refunds Policy

We want you to love what you ordered. If something isn't right, here's how we handle it.

### Eligibility for Returns
- Items must be returned within **7 days** of delivery.
- Products must be unused, unwashed, and in original packaging with tags intact.
- The following are **not eligible** for return: sale items, digital products, and personalised/custom items.

### How to Initiate a Return
1. Email us at **[your@email.com]** with your order number and reason for return.
2. Our team will respond within 48 hours with return instructions.
3. Ship the item back to the address we provide. Return shipping costs are borne by the customer unless the item is defective.

### Refunds
- Once we receive and inspect the returned item, we will notify you of approval or rejection.
- Approved refunds are processed within **5–7 business days** to your original payment method.
- Shipping charges are non-refundable.

### Exchanges
We currently offer exchanges for size or colour issues, subject to availability. Please mention your preferred replacement when initiating a return.

### Damaged or Wrong Items
If you received a damaged, defective, or incorrect item, please email us at **[your@email.com]** within **48 hours of delivery** with photos. We will arrange a free replacement or full refund.

### Contact
For any return or refund queries, reach us at **[your@email.com]**`,
    },
  ]

  const store = await svc.createVendorStores({
    vendor_id: vendorId,
    subdomain: body.subdomain ?? vendor.handle,
    template: body.template ?? "minimal",
    status: body.status ?? "draft",
    primary_color: body.primary_color ?? "#e65100",
    secondary_color: body.secondary_color ?? "#ac1900",
    font: body.font ?? "inter",
    sections: body.sections ?? null,
    pages: body.pages ?? { pages: defaultPages },
    collections: body.collections ?? null,
    store_logo: body.store_logo ?? null,
    store_favicon: body.store_favicon ?? null,
    seo_title: body.seo_title ?? null,
    seo_description: body.seo_description ?? null,
    custom_domain: body.custom_domain ?? null,
    domain_verified: false,
    password_enabled: body.password_enabled ?? false,
    store_password: hashedPassword,
    settings: Object.keys(initialSettings).length > 0 ? initialSettings : null,
  } as any)

  await svc.updateVendors({ id: vendorId, sell_on_own_store: true })
  return res.status(201).json({ store: flattenStore(store) })
}

// ─── PUT /vendors/me/store ────────────────────────────────────────────────────

export const PUT = async (req: AuthenticatedMedusaRequest<StoreBody>, res: MedusaResponse) => {
  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await svc.retrieveVendor(vendorId, { relations: ["vendor_store"] })
  if (!vendor.vendor_store) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No store found. Use POST to create one first.")
  }

  const body = req.validatedBody || req.body

  // ── Separate column fields from settings fields ───────────────────────────
  const columnPayload: Record<string, any> = {}
  const incomingSettings: Record<string, any> = {}

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue
    if ((SETTINGS_KEYS as readonly string[]).includes(key)) {
      incomingSettings[key] = value
    } else {
      columnPayload[key] = value
    }
  }

  // Merge incoming settings with existing — never wipe fields not sent
  const existingSettings: Record<string, any> = (vendor.vendor_store as any).settings ?? {}
  const mergedSettings = { ...existingSettings, ...incomingSettings }

  // ── Domain verified reset ─────────────────────────────────────────────────
  // if ("custom_domain" in columnPayload &&
  //     columnPayload.custom_domain !== vendor.vendor_store.custom_domain) {
  //   columnPayload.domain_verified = false
  // }

  delete columnPayload.domain_verified

  if ("custom_domain" in columnPayload &&
      columnPayload.custom_domain !== vendor.vendor_store.custom_domain) {
    columnPayload.domain_verified = false
  }
  
  // ── Password handling ─────────────────────────────────────────────────────
  if (columnPayload.store_password) {
    columnPayload.store_password = await bcrypt.hash(columnPayload.store_password, 12)
  } else if (columnPayload.store_password === null) {
    columnPayload.store_password = null
    columnPayload.password_enabled = false
  } else {
    delete columnPayload.store_password
  }

 // REPLACE WITH:
  // ── Backfill default pages for stores that have none ─────────────────────
  if (!columnPayload.pages && !(vendor.vendor_store as any).pages) {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    })
    columnPayload.pages = { pages: [
      {
        id: `page_${Date.now()}_terms`,
        title: "Terms of Service",
        slug: "terms-of-service",
        template: "terms",
        in_nav: false,
        in_footer: true,
        created_at: new Date().toISOString(),
        content: `## Terms of Service\n\n*Last updated: ${today}*\n\nWelcome to **[Your Store Name]**. By accessing or purchasing from our store, you agree to the following terms.\n\n### 1. General\nThese Terms of Service apply to all visitors, users, and customers of [Your Store Name] ("we", "us", or "our").\n\n### 2. Products\nAll products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.\n\n### 3. Orders & Payment\nBy placing an order, you confirm that the information you provide is accurate. We accept payment via the methods listed at checkout. Orders are processed only after payment is confirmed.\n\n### 4. Shipping\nWe ship pan-India. Estimated delivery is 5–10 business days. We are not responsible for delays caused by shipping carriers or customs.\n\n### 5. Returns & Refunds\nPlease refer to our [Returns & Refunds Policy](/p/returns-refunds) for details.\n\n### 6. Intellectual Property\nAll content on this store — including logos, designs, and product images — is the property of [Your Store Name] and may not be reproduced without written permission.\n\n### 7. Limitation of Liability\nWe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our store or products.\n\n### 8. Contact\nFor any questions, reach us at **[your@email.com]**`,
      },
      {
        id: `page_${Date.now() + 1}_privacy`,
        title: "Privacy Policy",
        slug: "privacy-policy",
        template: "privacy",
        in_nav: false,
        in_footer: true,
        created_at: new Date().toISOString(),
        content: `## Privacy Policy\n\n*Last updated: ${today}*\n\nAt **[Your Store Name]**, your privacy is important to us. This policy explains what data we collect and how we use it.\n\n### 1. Information We Collect\n- **Personal information:** Name, email address, shipping address, and phone number when you place an order.\n- **Payment information:** We do not store card details. Payments are processed securely by our payment partner.\n- **Usage data:** Pages visited, browser type, and device information for improving our store experience.\n\n### 2. How We Use Your Information\n- To process and fulfil your orders\n- To send order confirmations and shipping updates\n- To respond to customer service queries\n- To improve our products and store experience\n\n### 3. Data Sharing\nWe do not sell your personal information. We share data only with:\n- **Shipping partners** to deliver your orders\n- **Payment processors** to handle transactions securely\n- **Analytics tools** to understand store performance (data is anonymised)\n\n### 4. Cookies\nOur store uses cookies to keep your cart, remember preferences, and analyse traffic. You can disable cookies in your browser settings, though this may affect store functionality.\n\n### 5. Data Retention\nWe retain your order data for up to 3 years for accounting and legal compliance purposes.\n\n### 6. Your Rights\nYou have the right to access, correct, or delete your personal data. To make a request, email us at **[your@email.com]**.\n\n### 7. Contact\nQuestions about this policy? Write to us at **[your@email.com]**`,
      },
      {
        id: `page_${Date.now() + 2}_returns`,
        title: "Returns & Refunds",
        slug: "returns-refunds",
        template: "returns",
        in_nav: false,
        in_footer: true,
        created_at: new Date().toISOString(),
        content: `## Returns & Refunds Policy\n\nWe want you to love what you ordered. If something isn't right, here's how we handle it.\n\n### Eligibility for Returns\n- Items must be returned within **7 days** of delivery.\n- Products must be unused, unwashed, and in original packaging with tags intact.\n- The following are **not eligible** for return: sale items, digital products, and personalised/custom items.\n\n### How to Initiate a Return\n1. Email us at **[your@email.com]** with your order number and reason for return.\n2. Our team will respond within 48 hours with return instructions.\n3. Ship the item back to the address we provide. Return shipping costs are borne by the customer unless the item is defective.\n\n### Refunds\n- Once we receive and inspect the returned item, we will notify you of approval or rejection.\n- Approved refunds are processed within **5–7 business days** to your original payment method.\n- Shipping charges are non-refundable.\n\n### Exchanges\nWe currently offer exchanges for size or colour issues, subject to availability. Please mention your preferred replacement when initiating a return.\n\n### Damaged or Wrong Items\nIf you received a damaged, defective, or incorrect item, please email us at **[your@email.com]** within **48 hours of delivery** with photos. We will arrange a free replacement or full refund.\n\n### Contact\nFor any return or refund queries, reach us at **[your@email.com]**`,
      },
    ]}
  }

  const store = await svc.updateVendorStores({
    id: vendor.vendor_store.id,
    ...columnPayload,
    settings: mergedSettings,
  })

  // Flatten settings into top-level for client
  return res.json({ store: flattenStore(store) })
}
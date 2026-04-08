// src/api/vendors/me/store/route.ts

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

// ─── Validation schemas ───────────────────────────────────────────────────────

const StoreSectionSchema = z.object({
  type: z.enum(["hero", "featured", "collection", "about", "social", "announcement", "divider"]),
}).passthrough()

const VendorCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().nullable().optional(),
  product_ids: z.array(z.string()),
  sort_order: z.number().optional(),
  is_visible: z.boolean().optional(),
  created_at: z.string(),
}).passthrough()

const StorePageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  template: z.enum(["blank", "about", "faq", "contact"]),
  content: z.string(),
  in_nav: z.boolean(),
  in_footer: z.boolean(),
  created_at: z.string(),
}).passthrough()

export const VendorStoreSchema = z.object({
  // Identity
  subdomain: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens").optional(),
  custom_domain: z.string().nullable().optional(),
  domain_verified: z.boolean().optional(),

  // Template & status
  template: z.enum(["minimal", "bold", "editorial"]).optional(),
  status: z.enum(["draft", "live", "paused"]).optional(),

  // Branding
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").nullable().optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").nullable().optional(),
  font: z.enum(["inter", "poppins", "playfair"]).nullable().optional(),
  hero_image: z.string().nullable().optional(),
  tagline: z.string().max(120).nullable().optional(),
  announcement_text: z.string().max(200).nullable().optional(),

  // Sections
  sections: z.object({
    sections: z.array(StoreSectionSchema)
  }).nullable().optional(),

  // Pages
  pages: z.object({
    pages: z.array(StorePageSchema)
  }).nullable().optional(),

  // Creator collections
  collections: z.object({
    collections: z.array(VendorCollectionSchema)
  }).nullable().optional(),

  // Store logo & favicon
  store_logo: z.string().nullable().optional(),
  store_favicon: z.string().nullable().optional(),

  // SEO
  seo_title: z.string().max(60).nullable().optional(),
  seo_description: z.string().max(160).nullable().optional(),

  // Header behaviour
  sticky_header: z.boolean().optional(),
  sticky_announcement: z.boolean().optional(),
})

type StoreBody = z.infer<typeof VendorStoreSchema>

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
    const vendorId = req.query.vendor_id as string | undefined
    return vendorId ?? null
  }

  return null
}

// ─── GET /vendors/me/store ────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
    relations: ["vendor_store"],
  })

  if (!vendor) return res.status(404).json({ message: "Vendor not found" })

  // Fetch full store via query.graph to include all JSON columns (pages, sections)
  let store = vendor.vendor_store ?? null
  if (store?.id) {
    try {
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const { data: [fullStore] } = await query.graph({
        entity: "vendor_store",
        fields: ["*"],
        filters: { id: store.id },
      })
      if (fullStore) store = fullStore
    } catch {}
  }

  return res.json({ store })
}

// ─── POST /vendors/me/store ───────────────────────────────────────────────────

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreBody>,
  res: MedusaResponse
) => {
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
    relations: ["vendor_store"],
  })

  if (vendor.vendor_store) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Store already exists. Use PUT to update."
    )
  }

  const body = req.validatedBody || req.body
  const subdomain = body.subdomain ?? vendor.handle

  const store = await marketplaceModuleService.createVendorStores({
    vendor_id: vendorId,
    subdomain,
    template: body.template ?? "minimal",
    status: body.status ?? "draft",
    primary_color: body.primary_color ?? "#000000",
    secondary_color: body.secondary_color ?? "#ffffff",
    font: body.font ?? "inter",
    hero_image: body.hero_image ?? null,
    tagline: body.tagline ?? null,
    announcement_text: body.announcement_text ?? null,
    sections: body.sections ?? null,
    pages: body.pages ?? null,
    collections: body.collections ?? null,
    store_logo: body.store_logo ?? null,
    store_favicon: body.store_favicon ?? null,
    seo_title: body.seo_title ?? null,
    seo_description: body.seo_description ?? null,
    custom_domain: body.custom_domain ?? null,
    domain_verified: false,
  })

  await marketplaceModuleService.updateVendors({
    id: vendorId,
    sell_on_own_store: true,
  })

  return res.status(201).json({ store })
}

// ─── PUT /vendors/me/store ────────────────────────────────────────────────────

export const PUT = async (
  req: AuthenticatedMedusaRequest<StoreBody>,
  res: MedusaResponse
) => {
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
    relations: ["vendor_store"],
  })

  if (!vendor.vendor_store) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No store found. Use POST to create one first."
    )
  }

  const body = req.validatedBody || req.body

  const updatePayload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  )

  const store = await marketplaceModuleService.updateVendorStores({
    id: vendor.vendor_store.id,
    ...updatePayload,
  })

  return res.json({ store })
}
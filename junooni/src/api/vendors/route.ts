import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import createVendorWorkflow, {
  CreateVendorWorkflowInput
} from "../../workflows/marketplace/create-vendor"
import MarketplaceModuleService from "../../modules/marketplace/service"
import { CreatorCategoryEnum } from "../../modules/marketplace/types"

const VendorFieldsSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  xtwitter: z.string().optional(),
  othersocial: z.string().optional(),
  facebook: z.string().optional(),
  phonenumber: z.string().optional(),
  GSTIN: z.string().optional(),
  companyname: z.string().optional(),
  pan_number: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  tan_number: z.string().optional(),
  bank_account_holder_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_ifsc_code: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_type: z.enum(["Saving", "Current"]).nullable().optional(),
  cancelled_checkque: z.string().optional(),
  creator_bio: z.string().optional(),
  creator_title: z.string().optional(),
  creator_category: z.enum([...CreatorCategoryEnum]).nullable().optional(),
  verified: z.enum(["Yes", "No"]).default("No"),
  sell_on_marketplace: z.boolean().optional().default(true),
  sell_on_own_store: z.boolean().optional().default(false),
})

export const PostVendorCreateSchema = VendorFieldsSchema.extend({
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()

type RequestBody = z.infer<typeof PostVendorCreateSchema>

// ─── Helper: fetch plan fields via raw SQL ────────────────────────────────────
// Needed because plan columns were added via ALTER TABLE, not via model.define()
// Once you add plan fields to the vendor model and regenerate, remove this helper.

async function attachPlanFields(pgClient: any, vendor: any): Promise<void> {
  try {
    const result = await pgClient.raw(`
      SELECT
        COALESCE(plan, 'free')            AS plan,
        plan_billing_cycle,
        plan_activated_at,
        razorpay_subscription_id,
        razorpay_payment_id
      FROM "vendor"
      WHERE id = ?
    `, [vendor.id])

    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan                     = row.plan ?? "free"
      vendor.plan_billing_cycle       = row.plan_billing_cycle ?? null
      vendor.plan_activated_at        = row.plan_activated_at ?? null
      vendor.razorpay_subscription_id = row.razorpay_subscription_id ?? null
      vendor.razorpay_payment_id      = row.razorpay_payment_id ?? null
    }
  } catch (e) {
    // Columns may not exist yet — default to free silently
    vendor.plan = vendor.plan ?? "free"
  }
}

// ─── POST /vendors ────────────────────────────────────────────────────────────

export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }

  const vendorData = req.validatedBody

  const { result } = await createVendorWorkflow(req.scope)
    .run({
      input: {
        ...vendorData,
        authIdentityId: req.auth_context.auth_identity_id,
      } as CreateVendorWorkflowInput
    })

  res.json({ vendor: result.vendor })
}

// ─── GET /vendors ─────────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const vendorId = req.query.vendor_id as string | undefined
  const handle = req.query.handle as string | undefined
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve("marketplaceModuleService")
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  console.log(`[GET /vendors] START vendorId=${vendorId} handle=${handle}`)
  const total = Date.now()

  try {
    if (vendorId) {
      // ── SINGLE VENDOR BY ID ───────────────────────────────────────────
      const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
        relations: ["admins"]
      })
      if (!vendor) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
      }
      await attachPlanFields(pgClient, vendor)
      console.log(`[GET /vendors] single vendor DONE in ${Date.now() - total}ms`)
      return res.json({ vendor })

    } else if (handle) {
      // ── SINGLE VENDOR BY HANDLE (storefront) ──────────────────────────
      // Fetch only 1 vendor from DB instead of all 92
      const listStart = Date.now()
      const vendors = await marketplaceModuleService.listVendors?.(
        { handle },  // ← DB-level filter
        {}           // ← no relations needed for storefront
      )
      console.log(`[GET /vendors] listVendors by handle DONE in ${Date.now() - listStart}ms | count=${vendors?.length}`)

      if (vendors?.length) {
        const planStart = Date.now()
        await Promise.all(vendors.map(v => attachPlanFields(pgClient, v)))
        console.log(`[GET /vendors] attachPlanFields DONE in ${Date.now() - planStart}ms`)
      }

      console.log(`[GET /vendors] TOTAL ${Date.now() - total}ms | returning ${vendors?.length} vendors`)
      return res.json({ vendors })

    } else {
      // ── LIST ALL VENDORS (admin) ──────────────────────────────────────
      const listStart = Date.now()
      const vendors = await marketplaceModuleService.listVendors?.(
        {},
        { relations: ["admins"] }
      )
      console.log(`[GET /vendors] listVendors ALL DONE in ${Date.now() - listStart}ms | count=${vendors?.length}`)

      if (vendors?.length) {
        const planStart = Date.now()
        await Promise.all(vendors.map(v => attachPlanFields(pgClient, v)))
        console.log(`[GET /vendors] attachPlanFields ALL DONE in ${Date.now() - planStart}ms`)
      }

      console.log(`[GET /vendors] TOTAL ${Date.now() - total}ms | returning ${vendors?.length} vendors`)
      return res.json({ vendors })
    }

  } catch (error) {
    if (error instanceof MedusaError) throw error
    console.error("Error in vendors endpoint:", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "An error occurred while retrieving vendors"
    )
  }
}

// ─── DELETE /vendors?vendor_id=xxx ───────────────────────────────────────────

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const vendorId = req.query.vendor_id as string | undefined

  if (!vendorId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "vendor_id query parameter is required"
    )
  }

  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve("marketplaceModuleService")

  try {
    const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
      relations: ["admins"]
    })
    if (!vendor) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
    }
    await marketplaceModuleService.deleteVendors(vendorId)
    return res.json({ message: "Vendor deleted successfully", id: vendorId })
  } catch (error) {
    if (error instanceof MedusaError) throw error
    console.error("Error deleting vendor:", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "An error occurred while deleting the vendor"
    )
  }
}
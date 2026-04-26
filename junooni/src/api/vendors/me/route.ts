import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { z } from "zod"
import { MARKETPLACE_MODULE } from "src/modules/marketplace";

// ── Attach plan fields from raw SQL ──────────────────────────────────────────

async function attachPlanFields(pgClient: any, vendor: any): Promise<void> {
  try {
    const result = await pgClient.raw(`
      SELECT
        COALESCE(plan, 'free')      AS plan,
        plan_billing_cycle,
        plan_activated_at,
        razorpay_subscription_id,
        razorpay_payment_id
      FROM "vendor"
      WHERE id = ?
    `, [vendor.id])

    const row = result.rows?.[0]
    if (row) {
      vendor.plan                     = row.plan ?? "free"
      vendor.plan_billing_cycle       = row.plan_billing_cycle ?? null
      vendor.plan_activated_at        = row.plan_activated_at ?? null
      vendor.razorpay_subscription_id = row.razorpay_subscription_id ?? null
      vendor.razorpay_payment_id      = row.razorpay_payment_id ?? null
    }
  } catch(e) {
    console.error("attachPlanFields error:", e)
    vendor.plan = vendor.plan ?? "free"
  }
}

// ── GET /vendors/me ───────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  if (!vendorAdmin?.vendor?.id) {
    return res.status(404).json({ message: "Vendor not found" })
  }

  const { data: adminData } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "first_name", "last_name"],
    filters: {
      vendor_id: [vendorAdmin.vendor.id],
    },
  })

  const vendorWithAdmins = {
    ...vendorAdmin.vendor,
    admins: adminData || []
  }

  await attachPlanFields(pgClient, vendorWithAdmins)

  return res.json({ vendor: vendorWithAdmins })
}

// ── Schema ────────────────────────────────────────────────────────────────────

export const UpdateVendorSchema = z.object({
  name: z.string().optional(),
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
  // ── admins: now correctly typed as an object (one admin per request) ──
  admins: z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).strict().optional(),
}).strict()

type RequestBody = z.infer<typeof UpdateVendorSchema>

// ── Shared update logic ───────────────────────────────────────────────────────

async function updateVendorForMe(
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  // Look up the vendor this admin belongs to
  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.id"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  if (!vendorAdmin?.vendor?.id) {
    return res.status(404).json({ message: "Vendor not found" })
  }

  const body = req.validatedBody || req.body

  // ── Split admins out — it's a relation, not a vendor column ──
  const { admins, ...vendorFields } = body

  // 1. Update vendor scalar fields
  const updatedVendor = await marketplaceModuleService.updateVendors({
    id: vendorAdmin.vendor.id,
    ...vendorFields,
  })

  // 2. Update the calling admin's name if provided
  if (admins?.first_name !== undefined || admins?.last_name !== undefined) {
    await marketplaceModuleService.updateVendorAdmins({
      id: req.auth_context.actor_id,
      ...(admins.first_name !== undefined && { first_name: admins.first_name }),
      ...(admins.last_name  !== undefined && { last_name:  admins.last_name  }),
    })
  }

  // 3. Re-fetch admins so the response is consistent with GET /vendors/me
  const { data: adminData } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "first_name", "last_name"],
    filters: {
      vendor_id: [vendorAdmin.vendor.id],
    },
  })

  return res.json({
    vendor: {
      ...updatedVendor,
      admins: adminData || [],
    },
    message: "Vendor updated successfully",
  })
}

// ── POST /vendors/me ──────────────────────────────────────────────────────────

export const POST = updateVendorForMe

// ── PUT /vendors/me ───────────────────────────────────────────────────────────

export const PUT = updateVendorForMe
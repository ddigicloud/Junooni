import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { z } from "zod"
import { MARKETPLACE_MODULE } from "src/modules/marketplace"

// ── Resolve vendor_id from actor_id ──────────────────────────────────────────
// actor_id is always vendor_admin.id — we need vendor.id
// Use explicit fields (no wildcard) to avoid query.graph join key bug

async function resolveVendorId(
  query: any,
  actorId: string
): Promise<string | null> {
  const { data: [va] } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id"],
    filters: { id: actorId },
  })
  return va?.vendor?.id ?? null
}

// ── GET /vendors/me ───────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const actorId = req.auth_context?.actor_id
  if (!actorId) return res.status(401).json({ message: "Unauthorized" })

  const vendorId = await resolveVendorId(query, actorId)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  // Fetch full vendor — plan fields are columns on the vendor entity
  const { data: [vendor] } = await query.graph({
    entity: "vendor",
    fields: [
      "*",
      "plan", "plan_billing_cycle", "plan_activated_at",
      "razorpay_subscription_id", "razorpay_payment_id",
    ],
    filters: { id: vendorId },
  })

  if (!vendor) return res.status(404).json({ message: "Vendor not found" })

  const { data: admins } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { vendor_id: [vendorId] },
  })

  return res.json({
    vendor: {
      ...vendor,
      plan: vendor.plan ?? "free",
      admins: admins ?? [],
    }
  })
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

  const actorId = req.auth_context?.actor_id
  const vendorId = await resolveVendorId(query, actorId)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const body = req.validatedBody || req.body
  const { admins, ...vendorFields } = body

  const updatedVendor = await marketplaceModuleService.updateVendors({
    id: vendorId,
    ...vendorFields,
  })

  if (admins?.first_name !== undefined || admins?.last_name !== undefined) {
    await marketplaceModuleService.updateVendorAdmins({
      id: actorId,
      ...(admins.first_name !== undefined && { first_name: admins.first_name }),
      ...(admins.last_name  !== undefined && { last_name:  admins.last_name  }),
    })
  }

  const { data: adminData } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { vendor_id: [vendorId] },
  })

  return res.json({
    vendor: {
      ...updatedVendor,
      admins: adminData ?? [],
    },
    message: "Vendor updated successfully",
  })
}

export const POST = updateVendorForMe
export const PUT  = updateVendorForMe
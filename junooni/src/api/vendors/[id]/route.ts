import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { deleteVendorProductWorkflow } from "../../../workflows//marketplace/delete-vendor-product"
import { z } from "zod"

// ─── Helper: attach plan fields from raw SQL ──────────────────────────────────

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
  } catch {
    vendor.plan = vendor.plan ?? "free"
  }
}

// ─── Update schema ────────────────────────────────────────────────────────────

export const VendorUpdateSchema = z.object({
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
  sell_on_marketplace: z.boolean().optional(),
  sell_on_own_store: z.boolean().optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
}).strict()

type RequestBody = z.infer<typeof VendorUpdateSchema>

// ─── PUT /vendors/:id ─────────────────────────────────────────────────────────

export const PUT = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const updateData = req.validatedBody || req.body
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    if (!id?.trim()) {
      return res.status(400).json({ message: "Invalid vendor ID" })
    }

    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const existingVendor = await marketplaceModuleService.retrieveVendor(id)
    if (!existingVendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    const { plan, ...modelFields } = updateData as any

    if (Object.keys(modelFields).length > 0) {
      await marketplaceModuleService.updateVendors({ id, ...modelFields })
    }

    if (plan !== undefined) {
      await pgClient.raw(
        `UPDATE "vendor" SET plan = ? WHERE id = ?`,
        [plan, id]
      )
    }

    const vendorWithAdmins = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    await attachPlanFields(pgClient, vendorWithAdmins)

    return res.json({ vendor: vendorWithAdmins, message: "Vendor updated successfully" })

  } catch (error) {
    console.error("Error updating vendor:", error)
    if (error instanceof MedusaError) throw error
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to update vendor: ${error.message}`
    )
  }
}

// ─── GET /vendors/:id ─────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    if (!vendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    await attachPlanFields(pgClient, vendor)
    return res.json({ vendor })

  } catch (error) {
    console.error("Error fetching vendor:", error)
    throw new MedusaError(
      MedusaError.Types.DB_ERROR,
      "Unable to retrieve vendor details."
    )
  }
}

// ─── DELETE /vendors/:id ──────────────────────────────────────────────────────
// Cascade order:
//   1. Get all product IDs linked to this vendor
//   2. For each product → deleteVendorProductWorkflow (images + artworks + product record)
//   3. Delete vendor_store rows
//   4. Delete vendor_admin rows
//   5. Delete the vendor record

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  try {
    if (!id) {
      return res.status(400).json({ message: "Vendor ID is required" })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const log = (msg: string) =>
      console.log(`[DELETE /vendors/${id}] ${msg}`)

    const errors: string[] = []

    // ── 1. Verify vendor exists ────────────────────────────────────────
    const existingVendor = await marketplaceModuleService.retrieveVendor(id)
    if (!existingVendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    // ── 2. Get all products linked to this vendor ──────────────────────
    log("Fetching vendor products…")
    const { data: vendorData } = await query.graph({
      entity: "vendor",
      fields: ["id", "products.id", "products.title"],
      filters: { id },
    })

    const products = vendorData[0]?.products || []
    const productIds: string[] = products
      .map((p: any) => p.id)
      .filter(Boolean)

    log(`Found ${productIds.length} product(s) to delete.`)

    // ── 3. Delete each product and its files via workflow ──────────────
    for (const productId of productIds) {
      try {
        await deleteVendorProductWorkflow(req.scope).run({
          input: { productId },
        })
        log(`✅ Deleted product ${productId}`)
      } catch (err: any) {
        errors.push(`Failed to delete product ${productId}: ${err.message}`)
        log(`❌ Failed to delete product ${productId}: ${err.message}`)
      }
    }

    // ── 4. Delete vendor_store ─────────────────────────────────────────
    log("Deleting vendor_store…")
    try {
      const { data: stores } = await query.graph({
        entity: "vendor_store",
        fields: ["id"],
        filters: { vendor_id: id },
      })
      const storeIds = (stores || []).map((s: any) => s.id).filter(Boolean)
      if (storeIds.length > 0) {
        await marketplaceModuleService.deleteVendorStores(storeIds)
        log(`✅ Deleted ${storeIds.length} vendor_store row(s).`)
      } else {
        log("No vendor_store found — skipping.")
      }
    } catch (err: any) {
      errors.push(`Failed to delete vendor_store: ${err.message}`)
      log(`❌ Failed to delete vendor_store: ${err.message}`)
    }

    // ── 5. Delete vendor_admin rows ────────────────────────────────────
    log("Deleting vendor_admin rows…")
    try {
      const { data: admins } = await query.graph({
        entity: "vendor_admin",
        fields: ["id"],
        filters: { vendor_id: id },
      })
      const adminIds = (admins || []).map((a: any) => a.id).filter(Boolean)
      if (adminIds.length > 0) {
        await marketplaceModuleService.deleteVendorAdmins(adminIds)
        log(`✅ Deleted ${adminIds.length} vendor_admin row(s).`)
      } else {
        log("No vendor_admin rows found — skipping.")
      }
    } catch (err: any) {
      errors.push(`Failed to delete vendor_admin rows: ${err.message}`)
      log(`❌ Failed to delete vendor_admin rows: ${err.message}`)
    }

    // ── 6. Delete the vendor record ────────────────────────────────────
    log("Deleting vendor record…")
    try {
      await marketplaceModuleService.deleteVendors([id])
      log("✅ Vendor deleted.")
    } catch (err: any) {
      errors.push(`Failed to delete vendor record: ${err.message}`)
      return res.status(500).json({
        message: "Vendor record could not be deleted. Partial cleanup may have occurred.",
        errors,
      })
    }

    if (errors.length > 0) {
      return res.status(207).json({
        message: "Vendor deleted but some associated data could not be fully cleaned up.",
        deleted: true,
        errors,
      })
    }

    return res.status(200).json({
      message: "Vendor and all associated data permanently deleted.",
      deleted: true,
      id,
    })

  } catch (error: any) {
    console.error("[vendor DELETE] Unexpected error:", error)
    return res.status(500).json({
      message: "Failed to delete vendor",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
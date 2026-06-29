import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
}).refine(
  (data) => data.action === "approve" || (data.action === "reject" && !!data.reason),
  { message: "A rejection reason is required when rejecting." }
)

type RequestBody = {
  action: "approve" | "reject"
  reason?: string
}

// POST /admin/vendors/:id/marketplace-application
export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { action, reason } = schema.parse(req.body)

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    "marketplaceModuleService"
  )

  // Verify vendor exists
  let vendor: any
  try {
    vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"],
    })
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor with id ${id} not found.`
    )
  }

  // Guard: only act on pending applications
  if (vendor.marketplace_status !== "pending") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Vendor marketplace status is '${vendor.marketplace_status}'. Only 'pending' applications can be approved or rejected.`
    )
  }

  if (action === "approve") {
    await marketplaceModuleService.updateVendors({
      id,
      marketplace_status: "approved",
      sell_on_marketplace: true,
      marketplace_approved_at: new Date(),
      marketplace_rejection_reason: null,
    })

    return res.status(200).json({
      message: `Vendor ${vendor.name} approved for marketplace.`,
      marketplace_status: "approved",
      vendor_id: id,
    })
  }

  if (action === "reject") {
    await marketplaceModuleService.updateVendors({
      id,
      marketplace_status: "rejected",
      sell_on_marketplace: false,
      marketplace_rejection_reason: reason,
      marketplace_approved_at: null,
    })

    return res.status(200).json({
      message: `Vendor ${vendor.name} application rejected.`,
      marketplace_status: "rejected",
      vendor_id: id,
      reason,
    })
  }
}

// GET /admin/vendors/:id/marketplace-application — check a vendor's status
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    "marketplaceModuleService"
  )

  let vendor: any
  try {
    vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"],
    })
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor with id ${id} not found.`
    )
  }

  return res.status(200).json({
    vendor_id: id,
    vendor_name: vendor.name,
    marketplace_status: vendor.marketplace_status,
    marketplace_rejection_reason: vendor.marketplace_rejection_reason ?? null,
    marketplace_applied_at: vendor.marketplace_applied_at ?? null,
    marketplace_approved_at: vendor.marketplace_approved_at ?? null,
    sell_on_marketplace: vendor.sell_on_marketplace,
  })
}
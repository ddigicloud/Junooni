import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"

// POST /vendors/marketplace-application — creator applies
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const vendorId = (req as any).vendor?.id || (req as any).auth_context?.actor_id

  if (!vendorId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  }

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    "marketplaceModuleService"
  )

  const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

  if (vendor.marketplace_status === "pending") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Your application is already under review."
    )
  }

  if (vendor.marketplace_status === "approved") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "You are already approved to sell on the marketplace."
    )
  }

  await marketplaceModuleService.updateVendors({
    id: vendorId,
    marketplace_status: "pending",
    marketplace_applied_at: new Date(),
    sell_on_marketplace: false,
  })

  return res.status(200).json({
    message: "Application submitted. We'll review and get back to you shortly.",
    marketplace_status: "pending",
  })
}

// GET /vendors/marketplace-application — creator checks their status
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const vendorId = (req as any).vendor?.id || (req as any).auth_context?.actor_id

  if (!vendorId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  }

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    "marketplaceModuleService"
  )

  const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

  return res.status(200).json({
    marketplace_status: vendor.marketplace_status,
    marketplace_rejection_reason: vendor.marketplace_rejection_reason ?? null,
    marketplace_applied_at: vendor.marketplace_applied_at ?? null,
    marketplace_approved_at: vendor.marketplace_approved_at ?? null,
    sell_on_marketplace: vendor.sell_on_marketplace,
  })
}
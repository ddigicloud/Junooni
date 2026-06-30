// import {
//   AuthenticatedMedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework"
// import { MedusaError } from "@medusajs/framework/utils"
// import MarketplaceModuleService from "../../../modules/marketplace/service"

// // POST /vendors/marketplace-application — creator applies
// export const POST = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const vendorId = (req as any).vendor?.id || (req as any).auth_context?.actor_id

//   if (!vendorId) {
//     throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
//   }

//   const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
//     "marketplaceModuleService"
//   )

//   const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

//   if (vendor.marketplace_status === "pending") {
//     throw new MedusaError(
//       MedusaError.Types.INVALID_DATA,
//       "Your application is already under review."
//     )
//   }

//   if (vendor.marketplace_status === "approved") {
//     throw new MedusaError(
//       MedusaError.Types.INVALID_DATA,
//       "You are already approved to sell on the marketplace."
//     )
//   }

//   await marketplaceModuleService.updateVendors({
//     id: vendorId,
//     marketplace_status: "pending",
//     marketplace_applied_at: new Date(),
//     sell_on_marketplace: false,
//   })

//   return res.status(200).json({
//     message: "Application submitted. We'll review and get back to you shortly.",
//     marketplace_status: "pending",
//   })
// }

// // GET /vendors/marketplace-application — creator checks their status
// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const vendorId = (req as any).vendor?.id || (req as any).auth_context?.actor_id

//   if (!vendorId) {
//     throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
//   }

//   const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
//     "marketplaceModuleService"
//   )

//   const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

//   return res.status(200).json({
//     marketplace_status: vendor.marketplace_status,
//     marketplace_rejection_reason: vendor.marketplace_rejection_reason ?? null,
//     marketplace_applied_at: vendor.marketplace_applied_at ?? null,
//     marketplace_approved_at: vendor.marketplace_approved_at ?? null,
//     sell_on_marketplace: vendor.sell_on_marketplace,
//   })
// }



import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "src/modules/marketplace"

// Same resolver used in /vendors/me — actor_id is vendor_admin.id, not vendor.id
async function resolveVendorId(query: any, actorId: string): Promise<string | null> {
  const { data: [va] } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor_id"],
    filters: { id: actorId },
  })
  return va?.vendor_id ?? null
}

// POST /vendors/marketplace-application — creator applies
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const actorId = req.auth_context?.actor_id

  if (!actorId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  }

  const vendorId = await resolveVendorId(query, actorId)
  if (!vendorId) {
    return res.status(404).json({ message: "Vendor not found" })
  }

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

  if (vendor.marketplace_status === "pending") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Your application is already under review.")
  }
  if (vendor.marketplace_status === "approved") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "You are already approved to sell on the marketplace.")
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
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const actorId = req.auth_context?.actor_id

  if (!actorId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  }

  const vendorId = await resolveVendorId(query, actorId)
  if (!vendorId) {
    return res.status(404).json({ message: "Vendor not found" })
  }

  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendor = await marketplaceModuleService.retrieveVendor(vendorId)

  return res.status(200).json({
    marketplace_status: vendor.marketplace_status,
    marketplace_rejection_reason: vendor.marketplace_rejection_reason ?? null,
    marketplace_applied_at: vendor.marketplace_applied_at ?? null,
    marketplace_approved_at: vendor.marketplace_approved_at ?? null,
    sell_on_marketplace: vendor.sell_on_marketplace,
  })
}
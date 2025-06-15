import {
    AuthenticatedMedusaRequest,
  
  } from "@medusajs/framework/http";
  import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../../modules/marketplace/service";
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
  import FollowModuleService from "../../../../modules/follow/service";
  import { FOLLOW_MODULE } from "../../../../modules/follow";
  
  /*export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
      const { id: vendorId } = req.params
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);
  
    /*const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      vendorId,
      {
        relations: ["vendor"],
      }
    )
  
    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      fields: ["follow.*"],
      filters: {
        id: vendorId,
      },
    })
  
    res.json({
      follows: vendor.follow,
    })
  }
  */
  
  
  import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
  import { MedusaError } from "@medusajs/framework/utils";
  
  
 export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  console.log("🔥 Followers route HIT!")
  console.log("📋 Request params:", req.params)
  console.log("📋 Vendor ID:", req.params.id)
  
  const { id } = req.params
  
  if (!id) {
    console.log("❌ No vendor ID provided")
    return res.status(400).json({ error: "Vendor ID is required" })
  }
  
  console.log("🔍 Resolving query service...")
  const query = req.scope.resolve("query")
  
  try {
    console.log("🔍 Querying follow_list entity...")
    console.log("🔍 Filter: vendor_id =", id)
    
    const { data } = await query.graph({
      entity: "follow_list",
      fields: ["*", "follow.customer.*"],
      filters: {
        vendor_id: id
      }
    })
    
    console.log("📊 Query result:", data)
    console.log("📊 Data length:", data?.length)
    
    if (!data.length) {
      console.log("📭 No followers found for vendor:", id)
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "This creator do not have any followers yet!"
      )
    }
    
    const response = {
      count: data.length,
      follow: data
    }
    
    console.log("✅ Returning followers:", response)
    return res.json(response)
    
  } catch (error) {
    console.error("❌ Error in followers route:", error)
    
    if (error instanceof MedusaError) {
      throw error
    } else {
      console.error("❌ Unexpected error:", error.message)
      throw new MedusaError(
        MedusaError.Types.DB_ERROR,
        "Failed to fetch followers"
      )
    }
  }
}
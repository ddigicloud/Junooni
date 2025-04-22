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
    const { id } = req.params
  
   
    const query = req.scope.resolve("query")
    
      const { data } = await query.graph({
        entity: "follow_list",
        fields: ["*", "follow.customer.*"],
        filters: {
          vendor_id: id
        }
      })
    
      if (!data.length) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "This creator do not have any followers yet!"
        )
      }
    
      return res.json({
        follow: data
      })
    }
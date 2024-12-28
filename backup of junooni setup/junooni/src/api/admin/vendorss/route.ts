import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
  import MarketplaceModuleService from "../../../modules/marketplace/service"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
        MARKETPLACE_MODULE
    )
  
    const limit = req.query.limit || 15
    const offset = req.query.offset || 0
  
    const [vendor, count] = await marketplaceModuleService.listAndCountVendors({}, {
      skip: offset as number,
      take: limit as number,
    })
  
    res.json({
      vendor,
      count,
      limit,
      offset,
    })
  }
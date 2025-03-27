import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http";
  import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../../modules/marketplace/service";
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
  
  import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
  import {
    CreateProductWorkflowInputDTO,
    IProductModuleService,
    ISalesChannelModuleService,
  } from "@medusajs/framework/types";
  import { Modules } from "@medusajs/framework/utils";
  
  export const GET = async (
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
    )*/
  
    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      fields: ["products.*", "products.variants.*","products.options.*","products.variants.options.*","products.variants.prices.*", "products.tags.*"],
      filters: {
        id: vendorId,
      },
    })
  
    res.json({
      products: vendor.products,
    })
  }
  
import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http";
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../../modules/marketplace/service";
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
  
  import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
  import {
      CreateProductDTO,
    CreateProductWorkflowInputDTO,
    IProductModuleService,
    ISalesChannelModuleService,
    UpdateProductDTO,
    ProductOptionDTO,
    ProductDTO,
    UpsertProductOptionDTO
  } from "@medusajs/framework/types";
  import { Modules } from "@medusajs/framework/utils";
  
  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const { id } = req.params;  // Extract product ID from the URL parameters
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);
  
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      {
        relations: ["vendor"],
      }
    );
  
    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      fields: ["products.*"],
      filters: {
        id: vendorAdmin.vendor.id,
      },
    });
  
    // Find the product by ID within the vendor's products
    const product = vendor.products.find((p) => p.id === id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
  
    res.json({
      product,
    });
  };
  
   
  
  
  
  import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

  export const PUT = async (
    req: AuthenticatedMedusaRequest<UpdateProductDTO>,
    res: MedusaResponse
  ) => {
    try {
      const { id } = req.params; // Product ID
      if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
      }
  
      // Prepare the update data from the request body
      const updateData: Omit<UpdateProductDTO, "variants"> & object = {
        ...req.body,
      };
  
      // Exclude unsupported fields
     
  
      // Run the update workflow
      const { result: updatedProducts } = await updateProductsWorkflow(req.scope).run({
        input: {
          selector: { id }, // Filter by product ID
          update: updateData, // Update data
          additional_data: {}, // Optional
        },
      });
  
      // Retrieve the updated product (first in the array)
      const updatedProduct = updatedProducts[0];
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found after update" });
      }
  
      res.json({ product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
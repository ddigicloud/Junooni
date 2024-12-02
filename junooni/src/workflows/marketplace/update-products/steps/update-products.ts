import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { Modules } from "@medusajs/framework/utils";
import { UpdateProductDTO } from "@medusajs/framework/types";

type UpdateVendorProductStepInput = {
  productId: string; // Product to be updated
  data: UpdateProductDTO; // Updated product data
};

export const updateVendorProductStep = createStep(
  "update-vendor-product-step",
  async ({ productId, data }: UpdateVendorProductStepInput, { container }) => {
    // Resolve services
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    const productService = container.resolve(Modules.PRODUCT);

    // Validate if the product belongs to the vendor
    const vendorProduct = await marketplaceModuleService.retrieveVendor(
      productId
    );

    if (!vendorProduct) {
      throw new Error("Product not found or does not belong to the vendor.");
    }

    // Update the product
    const updatedProduct = await productService.updateProducts(productId, data);

    return new StepResponse(updatedProduct, { previousProduct: vendorProduct });
  },
  // Rollback logic in case the workflow fails
  async ({ previousProduct }, { container }) => {
    const productService = container.resolve(Modules.PRODUCT);

    // Revert the product to its previous state
    await productService.updateProducts(previousProduct.id, previousProduct);
  }
);

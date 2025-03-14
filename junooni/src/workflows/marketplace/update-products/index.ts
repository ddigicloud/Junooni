import {
    createWorkflow,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk";
  import { updateVendorProductStep } from "./steps/update-products";
  
  export type UpdateVendorProductWorkflowInput = {
    productId: string; // Product ID to update
    data: Record<string, any>; // Updated product data
  };
  
  export const updateVendorProductWorkflow = createWorkflow(
    "update-vendor-product-workflow",
    function (
      input: UpdateVendorProductWorkflowInput
    ): WorkflowResponse<any> {
      // Step to update the vendor product
      const updatedProduct = updateVendorProductStep({
        productId: input.productId,
        data: input.data,
      });
  
      // Return the updated product
      return new WorkflowResponse(updatedProduct);
    }
  );
  
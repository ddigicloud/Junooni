import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { deleteProductImagesStep } from "./steps/delete-product-images"
import { deleteProductArtworksStep } from "./steps/delete-product-artworks"
import { deleteVendorProductLinksStep } from "./steps/delete-vendor-product-links"

type DeleteVendorProductInput = {
  productId: string
}

export const deleteVendorProductWorkflow = createWorkflow(
  "delete-vendor-product",
  (input: DeleteVendorProductInput) => {
    // Step 1: Delete image files from storage
    deleteProductImagesStep({ productId: input.productId })

    // Step 2: Delete artwork files and records
    deleteProductArtworksStep({ productId: input.productId })

    // Step 3: Remove vendor-product link rows
    // (has compensation — will restore links if step 4 fails)
    deleteVendorProductLinksStep({ productId: input.productId })

    // Step 4: Delete the product record (cascades variants, options, prices)
    deleteProductsWorkflow.runAsStep({
      input: { ids: [input.productId] }
    })

    return new WorkflowResponse({ deleted: true, id: input.productId })
  }
)
// workflows/marketplace/update-vendor/steps/update-vendor.ts
import { 
    createStep,
    StepResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { MedusaError } from "@medusajs/framework/utils"
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
  import MarketplaceModuleService from "../../../../modules/marketplace/service"
  
  type UpdateVendorStepInput = {
    vendorId: string
    name?: string
    handle?: string
    logo?: string
  }
  
  // Define the shape of the update data object
  type VendorUpdateData = {
    name?: string
    handle?: string
    logo?: string
  }
  
  const updateVendorStep = createStep(
    "update-vendor-step",
    async (input: UpdateVendorStepInput, { container }) => {
      try {
        const marketplaceModuleService: MarketplaceModuleService = 
          container.resolve(MARKETPLACE_MODULE)
        
        // Check if vendor exists
        const vendor = await marketplaceModuleService.retrieveVendor(input.vendorId)
        
        if (!vendor) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `Vendor with ID ${input.vendorId} not found`
          )
        }
        
        // Prepare update data with correct typing
        const updateData: VendorUpdateData = {}
        
        // Only include properties that are provided in the input
        if (input.name !== undefined) updateData.name = input.name
        if (input.handle !== undefined) updateData.handle = input.handle
        if (input.logo !== undefined) updateData.logo = input.logo
        
        // Update the vendor
        const [updatedVendor] = await marketplaceModuleService.updateVendors([
          { id: input.vendorId, ...updateData }
        ])
        
        return new StepResponse(updatedVendor, updatedVendor.id)
      } catch (error) {
        // Rethrow with appropriate error type
        if (error instanceof MedusaError) {
          throw error
        }
        
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Error updating vendor: ${error.message}`
        )
      }
    },
    // Compensation function (for rollback)
    async (vendorId, { container }) => {
      // Nothing to do for updates as we don't need to roll back
      // But we should include this function to match the createStep pattern
      if (!vendorId) {
        return
      }
      
      // If needed, you could restore the original state here
    }
  )
  
  export default updateVendorStep
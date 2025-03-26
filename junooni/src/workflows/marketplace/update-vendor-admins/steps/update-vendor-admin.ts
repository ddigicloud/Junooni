// src/workflows/marketplace/update-vendor-admin/steps/update-vendor-admin.ts
import { 
    createStep,
    StepResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { MedusaError } from "@medusajs/framework/utils"
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
  import MarketplaceModuleService from "../../../../modules/marketplace/service"
  import { UpdateVendorAdminWorkflowInput } from ".."
  
  const updateVendorAdminStep = createStep(
    "update-vendor-admin-step",
    async (input: UpdateVendorAdminWorkflowInput, { container }) => {
      const marketplaceModuleService: MarketplaceModuleService = 
        container.resolve(MARKETPLACE_MODULE)
  
      // Verify the admin exists before updating
      const existingAdmin = await marketplaceModuleService.retrieveVendorAdmin(input.id)
  
      if (!existingAdmin) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Vendor admin with id ${input.id} not found`
        )
      }
  
      // Create update data object with only the fields that are provided
      const updateData: Record<string, any> = { id: input.id }
      
      if (input.email !== undefined) updateData.email = input.email
      if (input.first_name !== undefined) updateData.first_name = input.first_name
      if (input.last_name !== undefined) updateData.last_name = input.last_name
  
      // Update the vendor admin
      const updatedAdmin = await marketplaceModuleService.updateVendorAdmins(updateData)
  
      return new StepResponse(
        updatedAdmin,
        updatedAdmin
      )
    },
    async (vendorAdmin, { container }) => {
      // No compensation action needed for updates
      // If needed, we could restore the original state here
    }
  )
  
  export default updateVendorAdminStep
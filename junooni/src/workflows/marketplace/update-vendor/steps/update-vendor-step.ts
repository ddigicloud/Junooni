import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { MedusaError } from "@medusajs/framework/utils"

interface UpdateVendorStepInput {
  id: string;
  update: {
    name?: string;
    handle?: string;
    logo?: string;
  };
  authIdentityId: string;
}

/**
 * Step for updating basic vendor information.
 * Following the same pattern as createVendorAdminStep.
 */
const updateVendorStep = createStep(
  "update-vendor-step",
  async (
    { id, update, authIdentityId }: UpdateVendorStepInput,
    { container }
  ) => {
    // Resolve the marketplace module service
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    try {
      // First, verify that the vendor exists
      const existingVendor = await marketplaceModuleService.retrieveVendor(id);
      
      if (!existingVendor) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Vendor with ID ${id} not found.`
        );
      }

      // Check authorization - verify this auth identity can update this vendor
      // You might need to implement this method in your MarketplaceModuleService
      // const isAuthorized = await marketplaceModuleService.canManageVendor(
      //   authIdentityId,
      //   id
      // );
      
      // if (!isAuthorized) {
      //   throw new MedusaError(
      //     MedusaError.Types.UNAUTHORIZED,
      //     `Not authorized to update vendor with ID ${id}`
      //   );
      // }

      // Prepare the update data (only include provided fields)
      const updateData: Record<string, any> = {};
      
      if (update.name !== undefined) updateData.name = update.name;
      if (update.handle !== undefined) updateData.handle = update.handle;
      if (update.logo !== undefined) updateData.logo = update.logo;
      
      // Only perform update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        // Update the vendor using the service method
        await marketplaceModuleService.updateVendors([{ id, ...updateData }]);
      }
      
      // Retrieve the updated vendor with fresh data
      const updatedVendor = await marketplaceModuleService.retrieveVendor(id, {
        relations: ["admins"],
      });
      
      return new StepResponse(updatedVendor, updatedVendor);
    } catch (error) {
      // If we encounter an error during the update, pass it through
      if (error instanceof MedusaError) {
        throw error;
      }
      
      // Otherwise, wrap it in a standard format
      throw new MedusaError(
        MedusaError.Types.DB_ERROR,
        `Error updating vendor: ${error.message}`
      );
    }
  },
  // Compensation function to undo changes if a later step fails
  async (updatedVendor: any, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    
    // This is a simplified compensation. In a real implementation,
    // you might want to restore the previous state of the vendor
    console.log(`Compensation triggered for vendor update: ${updatedVendor.id}`);
  }
);

export default updateVendorStep;
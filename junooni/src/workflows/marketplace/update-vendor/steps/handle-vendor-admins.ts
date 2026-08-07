import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { MedusaError } from "@medusajs/framework/utils"

interface HandleVendorAdminsStepInput {
  vendorId: string;
  admins: Array<{
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }>;
  updatedVendor: any; // The vendor object from the previous step
}

// To track admin changes for compensation
interface AdminChanges {
  added: Array<{ id: string }>;
  removed: Array<{ id: string }>;
  updated: Array<{ 
    id: string, 
    previousValues: { 
      first_name?: string, 
      last_name?: string 
    } 
  }>;
}

/**
 * Step for handling vendor admin updates.
 * Following the same pattern as createVendorAdminStep.
 */
const handleVendorAdminsStep = createStep(
  "handle-vendor-admins-step",
  async (
    { vendorId, admins, updatedVendor }: HandleVendorAdminsStepInput,
    { container }
  ) => {
    // Resolve the marketplace module service
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    // Track changes for potential compensation
    const changes: AdminChanges = {
      added: [],
      removed: [],
      updated: []
    };

    try {
      // Get the current list of admins from the updated vendor
      const existingAdmins = updatedVendor.admins || [];
      const existingAdminIds = existingAdmins.map(admin => admin.id);
      
      // Extract IDs from the provided admin list (filtering out undefined IDs)
      const updatedAdminIds = admins
        .filter(admin => admin.id)
        .map(admin => admin.id);
      
      // Find admins to remove (those in existing list but not in the update)
      const adminsToRemove = existingAdminIds.filter(
        id => !updatedAdminIds.includes(id)
      );
      
      // Process removals first
      for (const adminId of adminsToRemove) {
        // Store the admin for compensation
        const adminToRemove = existingAdmins.find(admin => admin.id === adminId);
        changes.removed.push({ id: adminId });
        
        await marketplaceModuleService.deleteVendorAdmins(vendorId, adminId);
      }
      
      // Now process each admin in the update list
      for (const admin of admins) {
        if (admin.id) {
          // This is an existing admin - update their information
          // Store previous values for compensation
          const existingAdmin = existingAdmins.find(a => a.id === admin.id);
          if (existingAdmin) {
            changes.updated.push({
              id: admin.id,
              previousValues: {
                first_name: existingAdmin.first_name,
                last_name: existingAdmin.last_name
              }
            });
          }
          
          await marketplaceModuleService.updateVendorAdmins([{
            id: admin.id,
            first_name: admin.first_name,
            last_name: admin.last_name,
          }]);
        } else if (admin.email) {
          // This is a new admin - create them
          const newAdmin = await marketplaceModuleService.createVendorAdmins({
            email: admin.email,
            first_name: admin.first_name || "",
            last_name: admin.last_name || "",
            vendor_id: vendorId,
          });
          
          // Store the new admin for compensation
          changes.added.push({ id: newAdmin.id });
        }
      }
      
      // Fetch the vendor again with the updated admin list
      const refreshedVendor = await marketplaceModuleService.retrieveVendor(vendorId, {
        relations: ["admins"],
      });
      
      return new StepResponse(refreshedVendor, { vendor: refreshedVendor, changes });
    } catch (error) {
      // Handle errors specifically for this step
      if (error instanceof MedusaError) {
        throw error;
      }
      
      throw new MedusaError(
        MedusaError.Types.DB_ERROR,
        `Error updating vendor admins: ${(error as any).message}`
      );
    }
  },
  // Compensation function to undo admin changes if needed
  async (stepOutput, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
      
    const { vendor, changes } = stepOutput as any;
    
    // Undo all changes in reverse order
    try {
      // 1. Delete admins that were added
      for (const admin of changes.added) {
        await marketplaceModuleService.deleteVendorAdmins(admin.id);
      }
      
      // 2. Restore admins that were removed
      for (const admin of changes.removed) {
        // Note: This assumes you have a way to restore deleted admins
        // If not, you might need to log this as an irreversible change
        console.log(`Cannot restore deleted admin ${admin.id} - manual intervention required`);
      }
      
      // 3. Revert updates to existing admins
      for (const admin of changes.updated) {
        await marketplaceModuleService.updateVendorAdmins([{
          id: admin.id,
          ...admin.previousValues,
        }]);
      }
      
      console.log(`Compensation completed for vendor admin updates on vendor ${vendor.id}`);
    } catch (error) {
      console.error(`Error during compensation for vendor admin updates: ${(error as any).message}`);
    }
  }
);

export default handleVendorAdminsStep;
import { 
    createWorkflow,
    WorkflowResponse
  } from "@medusajs/framework/workflows-sdk"
  import { 
    setAuthAppMetadataStep,
  } from "@medusajs/medusa/core-flows"
  import updateVendorStep from "./steps/update-vendor-step"
  import handleVendorAdminsStep from "./steps/handle-vendor-admins"
  
  export interface UpdateVendorDTO {
    name?: string;
    handle?: string;
    logo?: string;
    admins?: Array<{
      id?: string;
      email: string;
      first_name?: string;
      last_name?: string;
    }>;
  }
  
  export interface UpdateVendorWorkflowInput {
    id: string;
    update: UpdateVendorDTO;
    authIdentityId: string;
  }
  
  /**
   * Workflow for updating a vendor and its associated admins.
   * Following the same pattern as createVendorAdminWorkflow.
   */
  const updateVendorWorkflow = createWorkflow(
    "update-vendor",
    function (input: UpdateVendorWorkflowInput) {
      // Step 1: Update the basic vendor information
      const updatedVendor = updateVendorStep({
        id: input.id,
        update: {
          name: input.update.name,
          handle: input.update.handle,
          logo: input.update.logo,
        },
        authIdentityId: input.authIdentityId
      })
      
      // Step 2: Handle admin updates if admins are provided
      let finalVendor = updatedVendor
      
      if (input.update.admins && Array.isArray(input.update.admins) && input.update.admins.length > 0) {
        finalVendor = handleVendorAdminsStep({
          vendorId: input.id,
          admins: input.update.admins,
          updatedVendor: updatedVendor,
          authIdentityId: input.authIdentityId
        })
      }
      
      // Make sure the auth identity is associated with this vendor
      // This ensures that the user performing the update is properly associated with the vendor
      setAuthAppMetadataStep({
        authIdentityId: input.authIdentityId,
        actorType: "vendor",
        value: input.id,
      })
      
      // Return the final response
      return new WorkflowResponse({
        vendor: finalVendor,
      })
    }
  )
  
  export default updateVendorWorkflow
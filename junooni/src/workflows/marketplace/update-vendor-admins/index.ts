// src/workflows/marketplace/update-vendor-admin/index.ts
import { 
    createWorkflow,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk"
  import updateVendorAdminStep from "./steps/update-vendor-admin"
  
  export type UpdateVendorAdminWorkflowInput = {
    id: string
    email?: string
    first_name?: string
    last_name?: string
  }
  
  const updateVendorAdminWorkflow = createWorkflow(
    "update-vendor-admin",
    function (input: UpdateVendorAdminWorkflowInput) {
      const updatedAdmin = updateVendorAdminStep(input)
      
      return new WorkflowResponse(updatedAdmin)
    }
  )
  
  export default updateVendorAdminWorkflow
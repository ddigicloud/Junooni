import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { deleteVendorAdminWorkflow } from "../../../../workflows/marketplace/delete-vendor-admin"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await deleteVendorAdminWorkflow(req.scope).run({
    input: {
      id: req.params.id
    }
  })

  res.json({ message: "success" })
}

// In src/api/vendors/[id]/admins/route.ts

import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import updateVendorAdminWorkflow from "../../../../workflows/marketplace/update-vendor-admins"

// Define the schema for admin updates
const AdminUpdateSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional()
}).strict()

type RequestBody = z.infer<typeof AdminUpdateSchema>

// Add the PUT method for updating admins
export const PUT = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const updateData = req.validatedBody || req.body
  
  try {
    console.log(`Updating vendor admin ${id}:`, updateData)
    
    const { result } = await updateVendorAdminWorkflow(req.scope).run({
      input: {
        id,
        ...updateData
      }
    })
    
    res.json({ 
      admin: result,
      message: "Admin updated successfully" 
    })
  } catch (error) {
    console.error("Error updating vendor admin:", error)
    
    if (error instanceof MedusaError) {
      throw error
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to update vendor admin: ${error.message}`
    )
  }
}
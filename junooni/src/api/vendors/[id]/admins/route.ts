import {
    AuthenticatedMedusaRequest,
    MedusaResponse
  } from "@medusajs/framework/http"
  import { deleteVendorAdminWorkflow } from "../../../../workflows/marketplace/delete-vendor-admin"
  import createVendorAdminWorkflow from "../../../../workflows/marketplace/create-vendor-admin"
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
  
  const AdminCreateSchema = z.object({
      admin: z.object({
        email: z.string().email(),
        first_name: z.string().optional(),
        last_name: z.string().optional()
      }).strict()
    }).strict()
    
    type RequestPostBody = z.infer<typeof AdminCreateSchema>
    
    // POST - Create a new admin for the vendor
    export const POST = async (
      req: AuthenticatedMedusaRequest<RequestPostBody>,
      res: MedusaResponse
    ) => {
      const { id: vendorId } = req.params
      const { admin } = req.validatedBody || req.body
      
      try {
        console.log(`Creating new admin for vendor ${vendorId}:`, admin)
        
        // Get marketplace service to create admin directly
        const marketplaceModuleService = req.scope.resolve("marketplaceModuleService")
        
        // Create the admin directly without setting auth metadata
        const adminData = {
          ...admin,
          vendor_id: vendorId
        }
        
        const createdAdmin = await marketplaceModuleService.createVendorAdmins(adminData)
        
        // Return success response
        res.json({ 
          admin: createdAdmin,
          message: "Admin added successfully" 
        })
      } catch (error) {
        console.error("Error creating vendor admin:", error)
        
        if (error instanceof MedusaError) {
          throw error
        }
        
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Unable to create vendor admin: ${error.message}`
        )
      }
    }
  
    // GET - List all admins for a vendor
  export const GET = async (
      req: AuthenticatedMedusaRequest,
      res: MedusaResponse
    ) => {
      const { id: vendorId } = req.params
      
      try {
        // Get the marketplace service
        const marketplaceModuleService = req.scope.resolve("marketplaceModuleService")
        
        // Retrieve the vendor with its admins relation
        const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
          relations: ["admins"]
        })
        
        // Check if vendor exists
        if (!vendor) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `Vendor with ID ${vendorId} not found`
          )
        }
        
        // Return the admins from the vendor
        res.json({
          admins: vendor.admins || [],
          count: vendor.admins?.length || 0
        })
      } catch (error) {
        console.error("Error retrieving vendor admins:", error)
        
        if (error instanceof MedusaError) {
          throw error // Let Medusa handle its own error types
        }
        
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Unable to retrieve vendor admins: ${error.message}`
        )
      }
    }
// import {
//   AuthenticatedMedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework";
// import { MedusaError } from "@medusajs/framework/utils";
// import MarketplaceModuleService from "../../../modules/marketplace/service";
// import updateVendorWorkflow, { 
//   UpdateVendorWorkflowInput
// } from "../../../workflows/marketplace/update-vendor"
// import { z } from "zod"
// /* 
// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
//     "marketplaceModuleService"
//   );

//   const { id } = req.params; // Retrieve the vendor ID from the route parameters

//   try {
//     // Fetch vendor details along with its associated admins
//     const vendor = await marketplaceModuleService.retrieveVendor(id, {
//       relations: ["admins"], // Include relations for more detailed data
//     });

//     if (!vendor) {
//       return res
//         .status(404)
//         .json({ message: `Vendor with ID ${id} not found.` });
//     }

//     // Format the response
//     const response = {
//       vendor_id: vendor.id,
//       vendor_name: vendor.name,
//       vendor_handle: vendor.handle,
//       vendor_logo: vendor.logo,
//       admins: vendor.admins.map((admin) => ({
//         email: admin.email,
//         first_name: admin.first_name,
//         last_name: admin.last_name,
//       })),
//     };

//     res.json({ vendor: response });
//   } catch (error) {
//     console.error("Error fetching vendor details:", error);
//     throw new MedusaError(
//       MedusaError.Types.DB_ERROR,
//       "Unable to retrieve vendor details."
//     );
//   }
// }

// */


// export const VendorUpdateSchema = z.object({
//   name: z.string().optional(),
//   handle: z.string().optional(),
//   logo: z.string().optional(),
//   coverphoto :  z.string().optional(),
//     youtube:  z.string().optional(),
//     instagram:  z.string().optional(),
//     xtwitter:  z.string().optional(),
//     othersocial:  z.string().optional(),
//     facebook:  z.string().optional(),
//     phonenumber:  z.string().optional(),
//     GSTIN:  z.string().optional(),
//     companyname:  z.string().optional(),
//     pan_number:  z.string().optional(),
//     city:  z.string().optional(),
//     pincode:  z.string().optional(),
//     state:  z.string().optional(),
//     address:  z.string().optional(),
//     tan_number:  z.string().optional(),
//     bank_account_holder_name : z.string().optional(),
//     bank_account_number :  z.string().optional(),
//     bank_account_ifsc_code:  z.string().optional(),
//     bank_name:  z.string().optional(),
//     bank_account_type: z.enum(["Saving", "Current"]).nullable().optional(),
//     cancelled_checkque:  z.string().optional(),
//     creator_bio:  z.string().optional(),
//     creator_title : z.string().optional(),

// }).strict()

// type RequestBody = z.infer<typeof VendorUpdateSchema>

// export const PUT = async (
//   req: AuthenticatedMedusaRequest<RequestBody>,
//   res: MedusaResponse
// ) => {
//   const { id } = req.params // Get vendor ID from route params
  
//   // Get validated update data or fall back to raw body if validation isn't happening
//   const updateData = req.validatedBody || req.body
  
//   try {
//     // Log the vendor ID and update data for debugging
//     console.log("Updating vendor with ID:", id);
//     console.log("Update data:", updateData);
    
//     // Verify that we have a valid ID before proceeding
//     if (!id || id.trim() === "") {
//       return res.status(400).json({
//         message: "Invalid vendor ID provided"
//       });
//     }
    
//     // Resolve the marketplace service from the container
//     const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
//       "marketplaceModuleService"
//     );
    
//     // First check if the vendor exists
//     const existingVendor = await marketplaceModuleService.retrieveVendor(id);
    
//     if (!existingVendor) {
//       return res.status(404).json({ 
//         message: `Vendor with ID ${id} not found.` 
//       });
//     }
    
//     // Create an update object with the ID included
//     const vendorUpdateData = {
//       id: id, // Include the ID in the update data
//       ...updateData
//     };
    
//     console.log("Calling updateVendors with:", vendorUpdateData);
    
//     // Update the vendor with the correct parameter structure
//     const updatedVendor = await marketplaceModuleService.updateVendors(vendorUpdateData);
    
//     // Retrieve the complete vendor with related admins for the response
//     const vendorWithAdmins = await marketplaceModuleService.retrieveVendor(id, {
//       relations: ["admins"]
//     });
    
//     // Return success response with updated vendor
//     return res.json({
//       vendor: vendorWithAdmins,
//       message: "Vendor updated successfully"
//     });
//   } catch (error) {
//     // Enhanced error logging for debugging
//     console.error("Error updating vendor:", {
//       message: error.message,
//       stack: error.stack,
//       vendorId: id,
//       updateData: JSON.stringify(updateData)
//     });
    
//     if (error instanceof MedusaError) {
//       throw error; // Re-throw Medusa errors directly
//     } else {
//       // Include the original error message
//       throw new MedusaError(
//         MedusaError.Types.UNEXPECTED_STATE,
//         `Unable to update vendor details: ${error.message}`
//       );
//     }
//   }
// }

// // Also include GET method to retrieve vendor details
// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const { id } = req.params
  
//   try {
//     const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
//       "marketplaceModuleService"
//     )
    
//     const vendor = await marketplaceModuleService.retrieveVendor(id, {
//       relations: ["admins"]
//     })
    
//     if (!vendor) {
//       return res.status(404).json({ 
//         message: `Vendor with ID ${id} not found.` 
//       })
//     }
    
//     return res.json({ vendor })
//   } catch (error) {
//     console.error("Error fetching vendor details:", error)
//     throw new MedusaError(
//       MedusaError.Types.DB_ERROR,
//       "Unable to retrieve vendor details."
//     )
//   }
// }

// src/api/vendors/[id]/route.ts

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { z } from "zod"

// ─── Helper: attach plan fields from raw SQL ──────────────────────────────────

async function attachPlanFields(pgClient: any, vendor: any): Promise<void> {
  try {
    const result = await pgClient.raw(`
      SELECT
        COALESCE(plan, 'free')            AS plan,
        plan_billing_cycle,
        plan_activated_at,
        razorpay_subscription_id,
        razorpay_payment_id
      FROM "vendor"
      WHERE id = ?
    `, [vendor.id])

    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan                     = row.plan ?? "free"
      vendor.plan_billing_cycle       = row.plan_billing_cycle ?? null
      vendor.plan_activated_at        = row.plan_activated_at ?? null
      vendor.razorpay_subscription_id = row.razorpay_subscription_id ?? null
      vendor.razorpay_payment_id      = row.razorpay_payment_id ?? null
    }
  } catch {
    vendor.plan = vendor.plan ?? "free"
  }
}

// ─── Update schema ────────────────────────────────────────────────────────────

export const VendorUpdateSchema = z.object({
  name: z.string().optional(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  xtwitter: z.string().optional(),
  othersocial: z.string().optional(),
  facebook: z.string().optional(),
  phonenumber: z.string().optional(),
  GSTIN: z.string().optional(),
  companyname: z.string().optional(),
  pan_number: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  tan_number: z.string().optional(),
  bank_account_holder_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_ifsc_code: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_type: z.enum(["Saving", "Current"]).nullable().optional(),
  cancelled_checkque: z.string().optional(),
  creator_bio: z.string().optional(),
  creator_title: z.string().optional(),
  sell_on_marketplace: z.boolean().optional(),
  sell_on_own_store: z.boolean().optional(),
  // ── Plan fields — admin override ─────────────────────────────────────────
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
}).strict()

type RequestBody = z.infer<typeof VendorUpdateSchema>

// ─── PUT /vendors/:id ─────────────────────────────────────────────────────────

export const PUT = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const updateData = req.validatedBody || req.body
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    if (!id?.trim()) {
      return res.status(400).json({ message: "Invalid vendor ID" })
    }

    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const existingVendor = await marketplaceModuleService.retrieveVendor(id)
    if (!existingVendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    // Separate plan fields (raw SQL) from model fields (Medusa service)
    const { plan, ...modelFields } = updateData as any

    // Update model fields via Medusa service
    if (Object.keys(modelFields).length > 0) {
      await marketplaceModuleService.updateVendors({ id, ...modelFields })
    }

    // Update plan via raw SQL (since it's not in the model yet)
    if (plan !== undefined) {
      await pgClient.raw(
        `UPDATE "vendor" SET plan = ? WHERE id = ?`,
        [plan, id]
      )
    }

    // Return full vendor with plan fields attached
    const vendorWithAdmins = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    await attachPlanFields(pgClient, vendorWithAdmins)

    return res.json({ vendor: vendorWithAdmins, message: "Vendor updated successfully" })

  } catch (error) {
    console.error("Error updating vendor:", error)
    if (error instanceof MedusaError) throw error
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to update vendor: ${error.message}`
    )
  }
}

// ─── GET /vendors/:id ─────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    if (!vendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    await attachPlanFields(pgClient, vendor)
    return res.json({ vendor })

  } catch (error) {
    console.error("Error fetching vendor:", error)
    throw new MedusaError(
      MedusaError.Types.DB_ERROR,
      "Unable to retrieve vendor details."
    )
  }
}
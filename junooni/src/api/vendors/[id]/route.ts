import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import MarketplaceModuleService from "../../../modules/marketplace/service";
import updateVendorWorkflow, { 
  UpdateVendorWorkflowInput
} from "../../../workflows/marketplace/update-vendor"
import { z } from "zod"
/* 
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    "marketplaceModuleService"
  );

  const { id } = req.params; // Retrieve the vendor ID from the route parameters

  try {
    // Fetch vendor details along with its associated admins
    const vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"], // Include relations for more detailed data
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ message: `Vendor with ID ${id} not found.` });
    }

    // Format the response
    const response = {
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      vendor_handle: vendor.handle,
      vendor_logo: vendor.logo,
      admins: vendor.admins.map((admin) => ({
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
      })),
    };

    res.json({ vendor: response });
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    throw new MedusaError(
      MedusaError.Types.DB_ERROR,
      "Unable to retrieve vendor details."
    );
  }
}

*/


export const VendorUpdateSchema = z.object({
  name: z.string().optional(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto :  z.string().optional(),
    youtube:  z.string().optional(),
    instagram:  z.string().optional(),
    xtwitter:  z.string().optional(),
    othersocial:  z.string().optional(),
    phonenumber:  z.string().optional(),
    GSTIN:  z.string().optional(),
    companyname:  z.string().optional(),
    pan_number:  z.string().optional(),
    city:  z.string().optional(),
    pincode:  z.string().optional(),
    state:  z.string().optional(),
    address:  z.string().optional(),
    tan_number:  z.string().optional(),
    bank_account_holder_name : z.string().optional(),
    bank_account_number :  z.string().optional(),
    bank_account_ifsc_code:  z.string().optional(),
    bank_name:  z.string().optional(),
    bank_account_type: z.enum(["Saving", "Current"]).nullable().optional(),
    cancelled_checkque:  z.string().optional(),
    creator_bio:  z.string().optional(),
    creator_title : z.string().optional(),

}).strict()

type RequestBody = z.infer<typeof VendorUpdateSchema>

export const PUT = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params // Get vendor ID from route params
  
  // Get validated update data or fall back to raw body if validation isn't happening
  const updateData = req.validatedBody || req.body
  
  try {
    // Log the vendor ID and update data for debugging
    console.log("Updating vendor with ID:", id);
    console.log("Update data:", updateData);
    
    // Verify that we have a valid ID before proceeding
    if (!id || id.trim() === "") {
      return res.status(400).json({
        message: "Invalid vendor ID provided"
      });
    }
    
    // Resolve the marketplace service from the container
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
      "marketplaceModuleService"
    );
    
    // First check if the vendor exists
    const existingVendor = await marketplaceModuleService.retrieveVendor(id);
    
    if (!existingVendor) {
      return res.status(404).json({ 
        message: `Vendor with ID ${id} not found.` 
      });
    }
    
    // Create an update object with the ID included
    const vendorUpdateData = {
      id: id, // Include the ID in the update data
      ...updateData
    };
    
    console.log("Calling updateVendors with:", vendorUpdateData);
    
    // Update the vendor with the correct parameter structure
    const updatedVendor = await marketplaceModuleService.updateVendors(vendorUpdateData);
    
    // Retrieve the complete vendor with related admins for the response
    const vendorWithAdmins = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    });
    
    // Return success response with updated vendor
    return res.json({
      vendor: vendorWithAdmins,
      message: "Vendor updated successfully"
    });
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("Error updating vendor:", {
      message: error.message,
      stack: error.stack,
      vendorId: id,
      updateData: JSON.stringify(updateData)
    });
    
    if (error instanceof MedusaError) {
      throw error; // Re-throw Medusa errors directly
    } else {
      // Include the original error message
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Unable to update vendor details: ${error.message}`
      );
    }
  }
}

// Also include GET method to retrieve vendor details
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  
  try {
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
      "marketplaceModuleService"
    )
    
    const vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    
    if (!vendor) {
      return res.status(404).json({ 
        message: `Vendor with ID ${id} not found.` 
      })
    }
    
    return res.json({ vendor })
  } catch (error) {
    console.error("Error fetching vendor details:", error)
    throw new MedusaError(
      MedusaError.Types.DB_ERROR,
      "Unable to retrieve vendor details."
    )
  }
}
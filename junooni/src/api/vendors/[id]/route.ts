import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework";
  import { MedusaError } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../modules/marketplace/service";
  import updateVendorWorkflow from "../../../workflows/marketplace/update-vendor";
import { UpdateVendorDTO } from "../../../workflows/marketplace/update-vendor";
import {z} from "zod";

  
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
  };
 
  
  // Define the expected request body type for better type safety
  interface UpdateVendorRequest {
    name?: string;
    handle?: string;
    logo?: string;
    admins?: Array<{
      email: string;
      first_name?: string;
      last_name?: string;
    }>;
  }
  const updateSchema = z.object({
    name: z.string().optional(),
    handle: z.string().optional(),
    logo: z.string().optional(),
    admins: z.array(
      z.object({
        id: z.string().optional(),
        email: z.string(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      })
    ).optional(),
  }).strict();
  
  // PUT handler for updating vendor details
  export const PUT = async (
    req: AuthenticatedMedusaRequest<UpdateVendorDTO>,
    res: MedusaResponse
  ) => {
    try {
      const { id } = req.params;
      
      // Validate that ID exists
      if (!id) {
        return res.status(400).json({ message: "Vendor ID is required" });
      }
  
      // Validate request body against schema
      const updateData = updateSchema.parse(req.body);
  
      // Run the update workflow
      const result = await updateVendorWorkflow(req.scope).run({
        input: {
          id,
          update: updateData
        },
      });
  
      // Extract the updated vendor from the workflow result
      const updatedVendor = result.vendor;
      
      // Format the response to match the frontend's expected structure
      const response = {
        vendor_id: updatedVendor.id,
        vendor_name: updatedVendor.name,
        vendor_handle: updatedVendor.handle,
        vendor_logo: updatedVendor.logo,
        admins: updatedVendor.admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
        })),
      };
  
      // Return the response
      res.status(200).json({ 
        vendor: response,
        message: "Vendor updated successfully" 
      });
    } catch (error) {
      console.error("Error updating vendor:", error);
      
      // If it's a Zod validation error
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid update data",
          errors: error.errors,
        });
      }
      
      // If it's a Medusa error, return its specific message and code
      if (error instanceof MedusaError) {
        return res.status(error.type === MedusaError.Types.NOT_FOUND ? 404 : 400).json({
          message: error.message,
          code: error.type
        });
      }
      
      // For other errors, provide a generic response
      res.status(500).json({
        message: "Failed to update vendor",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
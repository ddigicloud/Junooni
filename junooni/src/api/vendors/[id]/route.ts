import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework";
  import { MedusaError } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../modules/marketplace/service";
  
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
  
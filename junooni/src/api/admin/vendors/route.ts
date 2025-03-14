import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework";
  import { MedusaError } from "@medusajs/framework/utils";
  import { z } from "zod";
  import MarketplaceModuleService from "../../../modules/marketplace/service";
  import createVendorAdminWorkflow from "../../../workflows/marketplace/create-vendor-admin";
  
  // Schema for validating incoming POST request
  const schema = z.object({
    name: z.string(),
    handle: z.string().optional(),
    logo: z.string().optional(),
    admin: z.object({
      email: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
    }).strict(),
  }).strict();
  
  type RequestBody = {
    name: string;
    handle?: string;
    logo?: string;
    admin: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
  
  // POST: Create a new vendor
  export const POST = async (
    req: AuthenticatedMedusaRequest<RequestBody>,
    res: MedusaResponse
  ) => {
    if (req.auth_context?.actor_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Request already authenticated as a vendor."
      );
    }
  
    const { admin, ...vendorData } = schema.parse(req.body) as RequestBody;
  
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
      "marketplaceModuleService"
    );
  
    // Create vendor
    //let vendor = await marketplaceModuleService.createVendors([vendorData]);
    let vendor = await marketplaceModuleService.createVendors(vendorData)
  
    // Create vendor admin
    await createVendorAdminWorkflow(req.scope).run({
      input: {
        admin: {
          ...admin,
          vendor_id: vendor[0].id,
        },
        authIdentityId: req.auth_context.auth_identity_id,
      },
    });
  
    // Retrieve vendor again with admin details
    vendor = await marketplaceModuleService.retrieveVendor(vendor[0].id, {
      relations: ["admins"],
    });
  
    res.json({
      vendor,
    });
  };
  
  // GET: Retrieve all vendors
  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
      "marketplaceModuleService"
    );
  
    try {
      // Fetch all vendors with their associated admins
      const vendors = await marketplaceModuleService.listVendors({}, {
        relations: ["admins"],
      });
  
      // Format response to include vendor and admin details
      const response = vendors.map((vendor) => ({
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        admins: vendor.admins.map((admin) => ({
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
        })),
      }));
  
      res.json({ vendors: response });
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.DB_ERROR, // Corrected the error type
        "Unable to retrieve vendors."
      );
    }
  };
  
  
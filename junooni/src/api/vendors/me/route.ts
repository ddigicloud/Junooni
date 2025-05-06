import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

  import MarketplaceModuleService from "../../../modules/marketplace/service";
  import updateVendorWorkflow, { 
    UpdateVendorWorkflowInput
  } from "../../../workflows/marketplace/update-vendor"
  import { z } from "zod"
import { MARKETPLACE_MODULE } from "src/modules/marketplace";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.*"], // You can specify which vendor fields you want
    filters: {
      id: [
        // ID of the authenticated vendor admin
        req.auth_context.actor_id,
      ],
    },
  })

  res.json({
    vendor: vendorAdmin.vendor,
  })
}


export const UpdateVendorSchema = z.object({
  name: z.string().optional(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  xtwitter: z.string().optional(),
  othersocial: z.string().optional(),
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
}).strict()

type RequestBody = z.infer<typeof UpdateVendorSchema>

// Shared update logic used by both POST and PUT
async function updateVendorForMe(
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.id"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  if (!vendorAdmin?.vendor?.id) {
    return res.status(404).json({ message: "Vendor not found" })
  }

  const updateData = req.validatedBody || req.body

  const updatedVendor = await marketplaceModuleService.updateVendors({
    id: vendorAdmin.vendor.id,
    ...updateData,
  })

  return res.json({
    vendor: updatedVendor,
    message: "Vendor updated successfully",
  })
}

// POST /vendors/me
export const POST = updateVendorForMe

// PUT /vendors/me
export const PUT = updateVendorForMe

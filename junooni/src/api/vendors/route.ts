/*import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import MarketplaceModuleService from "../../modules/marketplace/service"
import createVendorAdminWorkflow from "../../workflows/marketplace/create-vendor-admin"


const schema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()


type RequestBody = {
  name: string,
  handle?: string,
  logo?: string,
  admin: {
    email: string,
    first_name?: string,
    last_name?: string
  }
}


// POST route to create a vendor and vendor admin
export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  // If already authenticated as a vendor, throw an error
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }


  // Validate and parse the request body
  const { admin, ...vendorData } = schema.parse(req.body) as RequestBody


  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve("marketplaceModuleService")


  // Create vendor and ensure valid data is returned
  let vendor = await marketplaceModuleService.createVendors(vendorData)
  let vendorId: string


  if (Array.isArray(vendor)) {
    if (vendor.length === 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vendor creation returned an empty array.")
    }
    vendorId = vendor[0].id
  } else if (vendor && typeof vendor === "object" && vendor.id) {
    vendorId = vendor.id
  } else {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vendor creation failed.")
  }


  // Create vendor admin using the workflow
  await createVendorAdminWorkflow(req.scope).run({
    input: {
      admin: {
        ...admin,
        vendor_id: vendorId
      },
      authIdentityId: req.auth_context.auth_identity_id,
    }
  })


  // Retrieve the vendor with the admins relation for the response
  vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
    relations: ["admins"]
  })


  res.json({ vendor })
}


// GET route to retrieve vendor information
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  // Expect vendor_id as a query parameter, e.g., /vendors?vendor_id=abc123
  const vendorId = req.query.vendor_id as string | undefined
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve("marketplaceModuleService")


  if (vendorId) {
    // Retrieve a single vendor by ID including its related admins
    const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
      relations: ["admins"]
    })
    if (!vendor) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
    }
    return res.json({ vendor })
  } else {
    // If no vendor_id is provided, list all vendors (assuming the method exists)
    const vendors = await marketplaceModuleService.listVendors?.() // Optional: implement listVendors in your service
    return res.json({ vendors })
  }
}
*/


import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import createVendorWorkflow, {
  CreateVendorWorkflowInput
} from "../../workflows/marketplace/create-vendor";
import MarketplaceModuleService from "../../modules/marketplace/service"
import {CreatorCategoryEnum} from "../../modules/marketplace/types"




export const PostVendorCreateSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto :  z.string().optional(),
        youtube:  z.string().optional(),
        instagram:  z.string().optional(),
        xtwitter:  z.string().optional(),
        othersocial:  z.string().optional(),
        facebook:  z.string().optional(),
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
        creator_category: z.enum([...CreatorCategoryEnum]).nullable().optional(),
        verified: z.enum(["Yes", "No"]).default("No"),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()


type RequestBody = z.infer<typeof PostVendorCreateSchema>


export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  // If `actor_id` is present, the request carries
  // authentication for an existing vendor admin
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }


  const vendorData = req.validatedBody


  // create vendor admin
  const { result } = await createVendorWorkflow(req.scope)
    .run({
      input: {
        ...vendorData,
        authIdentityId: req.auth_context.auth_identity_id,
      } as CreateVendorWorkflowInput
    })


  res.json({
    vendor: result.vendor,
  })
}


export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  // Expect vendor_id as a query parameter, e.g., /vendors?vendor_id=abc123
  const vendorId = req.query.vendor_id as string | undefined
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve("marketplaceModuleService")


  try {
    if (vendorId) {
      // Retrieve a single vendor by ID including its related admins
      const vendor = await marketplaceModuleService.retrieveVendor(vendorId, {
        relations: ["admins"]
      })
      if (!vendor) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
      }
      return res.json({ vendor })
    } else {
      // List all vendors WITH the admins relation
      const vendors = await marketplaceModuleService.listVendors?.(
        {}, // empty filter object
        {
          relations: ["admins"] // Include admins relation
        }
      )
     
      return res.json({ vendors })
    }
  } catch (error) {
    console.error("Error in vendors endpoint:", error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "An error occurred while retrieving vendors"
    )
  }
}




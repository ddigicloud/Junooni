import { 
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  setAuthAppMetadataStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import createVendorAdminStep from "./steps/create-vendor-admin"
import createVendorStep from "./steps/create-vendor"
enum BankAccountType {
  Saving = "Saving",
  Current = "Current"
}

export type CreateVendorWorkflowInput = {
  name: string
  handle?: string
  logo?: string
  coverphoto?: string
  youtube?: string
  instagram?: string
  xtwitter?: string
  othersocial?: string
  phonenumber?: string
  GSTIN?: string
  companyname?: string
  pan_number?: string
  city?: string
  pincode?: string
  state?: string
  address?: string
  tan_number?: string
  bank_account_holder_name?: string
  bank_account_number?: string
  bank_account_ifsc_code?: string
  bank_name?: string
  bank_account_type?: BankAccountType
  cancelled_checkque?: string
  creator_bio?: string
  creator_title?: string
  admin: {
    email: string
    first_name?: string
    last_name?: string
  }
  authIdentityId: string
}

const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const vendor = createVendorStep({
      name: input.name,
      handle: input.handle,
      logo: input.logo,
    })

    const vendorAdminData = transform({
      input,
      vendor
    }, (data) => {
      return {
        ...data.input.admin,
        vendor_id: data.vendor.id,
      }
    })

    const vendorAdmin = createVendorAdminStep(vendorAdminData)

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorAdmin.id,
    })

    const { data: vendorWithAdmin } = useQueryGraphStep({
      entity: "vendor",
      fields: ["id", "name", "handle", "logo", "admins.*"],
      filters: {
        id: vendor.id,
      },
    })

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0],
    })
  }
)

export default createVendorWorkflow
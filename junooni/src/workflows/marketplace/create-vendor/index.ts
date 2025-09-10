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
import { CreatorCategoryEnum } from "src/modules/marketplace/types"
export enum BankAccountType {
  Saving = "Saving",
  Current = "Current",
}


export enum VerifiedEnum {
  Yes = "Yes",
  No = "No"
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
  facebook?: string
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
  bank_account_type?: BankAccountType | null
  cancelled_checkque?: string
  creator_bio?: string
  creator_title?: string
  creator_category?: typeof CreatorCategoryEnum[number] | null
  verified?: VerifiedEnum
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
      coverphoto: input.coverphoto,
      youtube: input.youtube,
      instagram: input.instagram,
      xtwitter: input.xtwitter,
      facebook: input.facebook,
      othersocial: input.othersocial,
      phonenumber: input.phonenumber,
      GSTIN: input.GSTIN,
      companyname: input.companyname,
      pan_number: input.pan_number,
      city: input.city,
      pincode: input.pincode,
      state: input.state,
      address: input.address,
      tan_number: input.tan_number,
      bank_account_holder_name: input.bank_account_holder_name,
      bank_account_number: input.bank_account_number,
      bank_account_ifsc_code: input.bank_account_ifsc_code,
      bank_name: input.bank_name,
      bank_account_type: input.bank_account_type ?? undefined,
      cancelled_checkque: input.cancelled_checkque,
      creator_bio: input.creator_bio,
      creator_title: input.creator_title,
      creator_category: input.creator_category,
      verified: input.verified ?? VerifiedEnum.No,
    })


    const vendorAdminData = transform({ input, vendor }, (data) => {
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
      fields: [
        "id",
        "name",
        "handle",
        "logo",
        "coverphoto",
        "creator_title",
       
        "verified",
        "admins.*"
      ],
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




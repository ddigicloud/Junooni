import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"


import { CreatorCategoryEnum } from "../../../../modules/marketplace/types"


enum BankAccountType {
  Saving = "Saving",
  Current = "Current"
}


type CreateVendorStepInput = {
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
  creator_category?: typeof CreatorCategoryEnum[number] | null
  verified?: "Yes" | "No"
}




const createVendorStep = createStep(
  "create-vendor",
  async (vendorData: CreateVendorStepInput, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)


    const vendor = await marketplaceModuleService.createVendors(vendorData)


    return new StepResponse(vendor, vendor.id)
  },
  async (vendorId, { container }) => {
    if (!vendorId) {
      return
    }


    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)


      marketplaceModuleService.deleteVendors(vendorId)
  }
)


export default createVendorStep



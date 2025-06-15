/*import { model } from "@medusajs/framework/utils"
import VendorAdmin from "./vendor-admin"


const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),
  coverphoto : model.text().nullable(),
  youtube: model.text().nullable(),
  instagram: model.text().nullable(),
  xtwitter: model.text().nullable(),
  othersocial: model.text().nullable(),
  phonenumber: model.text().nullable(),
  GSTIN: model.text().nullable(),
  companyname: model.text().nullable(),
  pan_number: model.text().nullable(),
  city: model.text().nullable(),
  pincode:model.text().nullable(),
  state:model.text().nullable(),
  address: model.text().nullable(),
  tan_number :model.text().nullable(),
  bank_account_holder_name : model.text().nullable(),
  bank_account_number : model.text().nullable(),
  bank_account_ifsc_code: model.text().nullable(),
  bank_name: model.text().nullable(),
  bank_account_type: model.enum(["Saving", "Current"]).default("Saving").nullable(),
  cancelled_checkque: model.text().nullable(),
  creator_bio: model.text().nullable(),
  creator_title :model.text().nullable(),
  admins: model.hasMany(() => VendorAdmin),
})


export default Vendor*/


import { model } from "@medusajs/framework/utils"
import VendorAdmin from "./vendor-admin"
import { CreatorCategoryEnum } from "../types"


const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),
  coverphoto: model.text().nullable(),
  youtube: model.text().nullable(),
  instagram: model.text().nullable(),
  xtwitter: model.text().nullable(),
  othersocial: model.text().nullable(),
  phonenumber: model.text().nullable(),
  GSTIN: model.text().nullable(),
  gst_verification_status: model.enum(["pending", "verified", "failed"]).default("pending"),
  companyname: model.text().nullable(),
  pan_number: model.text().nullable(),
  city: model.text().nullable(),
  pincode: model.text().nullable(),
  state: model.text().nullable(),
  address: model.text().nullable(),
  tan_number: model.text().nullable(),
  bank_account_holder_name: model.text().nullable(),
  bank_account_number: model.text().nullable(),
  bank_account_ifsc_code: model.text().nullable(),
  bank_name: model.text().nullable(),
  bank_account_type: model.enum(["Saving", "Current"]).default("Saving").nullable(),
  cancelled_checkque: model.text().nullable(),
  creator_bio: model.text().nullable(),
  creator_title: model.text().nullable(),
  creator_category: model.enum([...CreatorCategoryEnum]).nullable(),
  verified: model.enum(["Yes", "No"]).default("No"),
  metadata: model.json().nullable(),
  admins: model.hasMany(() => VendorAdmin),
})


export default Vendor
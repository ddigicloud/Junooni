import { model } from "@medusajs/framework/utils"

const VendorOtp = model.define("vendor_otp", {
  id:         model.id().primaryKey(),
  email:      model.text(),
  otp:        model.text(),
  expires_at: model.dateTime(),
  used:       model.boolean().default(false),
})

export default VendorOtp
import { Module } from "@medusajs/framework/utils"
import VendorOtpModuleService from "./service"

export const VENDOR_OTP_MODULE = "vendorOtp"

export default Module(VENDOR_OTP_MODULE, {
  service: VendorOtpModuleService,
})
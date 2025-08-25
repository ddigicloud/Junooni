import VendorArtworkModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VENDOR_ARTWORK_MODULE = "artwork"

export default Module(VENDOR_ARTWORK_MODULE, {
  service: VendorArtworkModuleService,
})
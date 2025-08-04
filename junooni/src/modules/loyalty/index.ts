// import { Module } from "@medusajs/framework/utils"
// import LoyaltyModuleService from "./service"

// export const LOYALTY_MODULE = "loyalty"

// export default Module(LOYALTY_MODULE, {
//   service: LoyaltyModuleService,
// })

// modules/loyalty/index.ts
import LoyaltyModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const LOYALTY_MODULE = "loyaltyModuleService"

export default Module(LOYALTY_MODULE, {
  service: LoyaltyModuleService,
})
// // src/modules/payment-razorpay/index.ts
// import { ModuleProvider, Modules } from "@medusajs/framework/utils"
// import RazorpayProviderService from "./service"

// export default ModuleProvider(Modules.PAYMENT, {
//   services: [RazorpayProviderService],
// })

// src/modules/payment-razorpay/index.ts
// src/modules/payment-razorpay/index.ts - Updated for Medusa v2

import RazorpayProviderService from "./service"
import { ModuleProviderExports } from "@medusajs/types"

const services = [RazorpayProviderService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
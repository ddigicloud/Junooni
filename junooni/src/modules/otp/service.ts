import { MedusaService } from "@medusajs/framework/utils"
import VendorOtp from "./models/vendor-otp"

class VendorOtpModuleService extends MedusaService({ VendorOtp }) {}

export default VendorOtpModuleService
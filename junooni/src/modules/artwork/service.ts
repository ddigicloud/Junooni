import { MedusaService } from "@medusajs/framework/utils"
import VendorArtwork from "./models/vendor-artwork"
import VendorArtworkMedia from "./models/vendor-artwork-media"

class VendorArtworkModuleService extends MedusaService({
  VendorArtwork,
  VendorArtworkMedia,
}) {
  // You can add custom methods here as needed
}

export default VendorArtworkModuleService
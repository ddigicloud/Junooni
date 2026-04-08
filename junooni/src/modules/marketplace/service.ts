import { MedusaService } from "@medusajs/framework/utils";
import Vendor from "./models/vendor";
import VendorAdmin from "./models/vendor-admin";
import VendorStore from "./models/store";

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
  VendorStore,
}) {}

export default MarketplaceModuleService;
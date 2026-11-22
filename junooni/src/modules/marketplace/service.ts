// import { MedusaService } from "@medusajs/framework/utils";
// import Vendor from "./models/vendor";
// import VendorAdmin from "./models/vendor-admin";
// import VendorStore from "./models/store";

// class MarketplaceModuleService extends MedusaService({
//   Vendor,
//   VendorAdmin,
//   VendorStore,
// }) {}

// export default MarketplaceModuleService;

import { MedusaService } from "@medusajs/framework/utils";
import Vendor from "./models/vendor";
import VendorAdmin from "./models/vendor-admin";
import VendorStore from "./models/store";
import VendorGalleryImage from "./models/vendor-gallery-image";  // ← ADD

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
  VendorStore,
  VendorGalleryImage,  // ← ADD
}) {
  // Replaces metadata entirely instead of merging
  async replaceVendorMetadata(
    id: string,
    metadata: Record<string, any> | null
  ): Promise<void> {
    const repo = this.__container__.manager.getRepository(Vendor)
    await repo.nativeUpdate({ id }, { metadata: metadata ?? null })
  }
}

export default MarketplaceModuleService;
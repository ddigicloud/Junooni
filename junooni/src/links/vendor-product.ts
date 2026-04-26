// import { defineLink } from "@medusajs/framework/utils";
// import MarketplaceModule from "../modules/marketplace";
// import ProductModule from "@medusajs/medusa/product";

// export default defineLink(MarketplaceModule.linkable.vendor, {
//   linkable: ProductModule.linkable.product,
//   isList: true,
// });

import { defineLink } from "@medusajs/framework/utils";
import MarketplaceModule from "../modules/marketplace";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  {
    linkable: MarketplaceModule.linkable.vendor,
    filterable: ["id", "handle", "name"],
  },
  {
    linkable: ProductModule.linkable.product,
    isList: true,
    filterable: ["id", "status"],
  }
)
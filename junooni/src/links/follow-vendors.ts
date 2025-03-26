import { defineLink } from "@medusajs/framework/utils";
import MarketplaceModule from "../modules/marketplace";
import FollowModule from "../modules/follow";

export default defineLink(
  {
    ...FollowModule.linkable.followList.id,
    field: "vendor_id",
  
  },
  MarketplaceModule.linkable.vendor,
  {
    readOnly: true
  }
)

  
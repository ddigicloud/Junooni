import VendorArtworkModule from "../modules/artwork"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"


export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
 VendorArtworkModule.linkable.vendorArtwork
)
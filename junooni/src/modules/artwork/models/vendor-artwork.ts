import { model } from "@medusajs/framework/utils"
import VendorArtworkMedia from "./vendor-artwork-media"

const VendorArtwork = model.define("vendor_artwork", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text(),
  medias: model.hasMany(() => VendorArtworkMedia, {
    mappedBy: "vendorArtwork",
  }),
})
.cascades({
  delete: ["medias"],
})

export default VendorArtwork
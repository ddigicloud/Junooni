import { model } from "@medusajs/framework/utils"
import VendorArtwork from "./vendor-artwork"

const VendorArtworkMedia = model.define("vendor_artwork_media", {
  id: model.id().primaryKey(),
  fileId: model.text(),
  mimeType: model.text(),
  filename: model.text(),
  file_type: model.text(),
  file_description: model.text(),
  vendorArtwork: model.belongsTo(() => VendorArtwork, {
    mappedBy: "medias",
  }),
})

export default VendorArtworkMedia
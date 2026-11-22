import { model } from "@medusajs/framework/utils"
import Vendor from "./vendor"

const VendorGalleryImage = model.define("vendor_gallery_image", {
  id:        model.id().primaryKey(),
  url:       model.text(),
  file_id:   model.text(),           // Medusa storage file ID — required for deletion
  filename:  model.text(),
  size:      model.number().nullable(),
  mime_type: model.text().nullable(),
  vendor:    model.belongsTo(() => Vendor, { mappedBy: "gallery_images" }),
})

export default VendorGalleryImage
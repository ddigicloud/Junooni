// import { 
//   createStep,
//   StepResponse,
// } from "@medusajs/framework/workflows-sdk"
// import VendorArtworkModuleService from "../../../../modules/artwork/service"
// import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"

// export type DeleteArtworkMediaInput = {
//   id: string
// }

// const deleteArtworkMediaStep = createStep(
//   "delete-vendor-artwork-media-step",
//   async ({ id }: DeleteArtworkMediaInput, { container }) => {
//     const vendorArtworkModuleService: VendorArtworkModuleService = 
//       container.resolve(VENDOR_ARTWORK_MODULE)

//     const artworkMedia = await vendorArtworkModuleService.retrieveVendorArtworkMedia(id)
//     console.log('Deleting artwork media:', artworkMedia)

//     await vendorArtworkModuleService.deleteVendorArtworkMedias(id)

//     return new StepResponse(
//       undefined,
//       artworkMedia
//     )
//   },
//   async (artworkMedia, { container }) => {
//     const vendorArtworkModuleService: VendorArtworkModuleService = 
//       container.resolve(VENDOR_ARTWORK_MODULE)

//     if (!artworkMedia) {
//       return
//     }

//     const normalize = (m: any) => ({
//       id: m.id,
//       vendorArtwork: m.vendorArtwork?.id ?? m.vendorArtwork_id,
//       fileId: m.fileId,
//       mimeType: m.mimeType,
//       filename: m.filename,
//       file_type: m.file_type,
//       file_description: m.file_description,
//     })

//     const payload = Array.isArray(artworkMedia)
//       ? artworkMedia.map(normalize)
//       : normalize(artworkMedia)

//     await vendorArtworkModuleService.createVendorArtworkMedias(payload as any)
//   }
// )

// export default deleteArtworkMediaStep

import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import VendorArtworkModuleService from "../../../../modules/artwork/service"
import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"
import fs from "fs"
import path from "path"

export type DeleteArtworkMediaInput = {
  id: string
}

const deleteArtworkMediaStep = createStep(
  "delete-vendor-artwork-media-step",
  async ({ id }: DeleteArtworkMediaInput, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    // Retrieve media info before deleting
    const artworkMedia = await vendorArtworkModuleService.retrieveVendorArtworkMedia(id)

    // Delete from database
    await vendorArtworkModuleService.deleteVendorArtworkMedias([id])

    // Delete physical file from server
    try {
      const filePath = path.join(process.cwd(), 'static', artworkMedia.fileId)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`✅ Deleted file: ${filePath}`)
      } else {
        console.log(`⚠️  File not found: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ Failed to delete file:`, error)
      // Don't throw error - continue even if file deletion fails
    }

    return new StepResponse(
      undefined,
      { artworkMedia, fileDeleted: true }
    )
  },
  async ({ artworkMedia, fileDeleted }, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    // Recreate database record
    await vendorArtworkModuleService.createVendorArtworkMedias([artworkMedia])

    // Note: We cannot restore the deleted file in compensation
    // This is a limitation of file deletion - once deleted, it's gone
    if (fileDeleted) {
      console.log("⚠️  Warning: File was permanently deleted and cannot be restored")
    }
  }
)

export default deleteArtworkMediaStep
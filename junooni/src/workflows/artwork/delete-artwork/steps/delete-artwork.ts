import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import VendorArtworkModuleService from "../../../../modules/artwork/service"
import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"
import fs from "fs"
import path from "path"

export type DeleteArtworkInput = {
  id: string
}

const deleteArtworkStep = createStep(
  "delete-vendor-artwork-step",
  async ({ id }: DeleteArtworkInput, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    // Retrieve artwork with its media
    const artwork = await vendorArtworkModuleService.retrieveVendorArtwork(id, {
      relations: ["medias"]
    })

    // Delete physical files for all media
    if (artwork.medias && artwork.medias.length > 0) {
      for (const media of artwork.medias) {
        try {
          const filePath = path.join(process.cwd(), 'static', media.fileId)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`✅ Deleted file: ${filePath}`)
          }
        } catch (error) {
          console.error(`❌ Failed to delete file ${media.fileId}:`, error)
        }
      }

      // Delete media records from database
      await vendorArtworkModuleService.deleteVendorArtworkMedias(
        artwork.medias.map(m => m.id)
      )
    }

    // Delete the artwork record
    await vendorArtworkModuleService.deleteVendorArtworks(id)

    return new StepResponse(
      undefined,
      artwork
    )
  },
  async (artwork, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    // Recreate the artwork
    const { medias, ...artworkData } = artwork
    const recreatedArtwork = await vendorArtworkModuleService.createVendorArtworks(artworkData)

    // Recreate media records (but files are gone permanently)
    if (medias && medias.length > 0) {
      await vendorArtworkModuleService.createVendorArtworkMedias(
        medias.map(media => ({
          ...media,
          vendor_artwork_id: recreatedArtwork.id
        }))
      )
      console.log("⚠️  Warning: Media records restored but files were permanently deleted")
    }
  }
)

export default deleteArtworkStep
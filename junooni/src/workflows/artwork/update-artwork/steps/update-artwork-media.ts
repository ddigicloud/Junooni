import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import VendorArtworkModuleService from "../../../../modules/artwork/service"
import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"

export type UpdateArtworkMediaInput = {
  id: string
  fileId?: string
  mimeType?: string
  filename?: string
  file_type?: string
  file_description?: string
}

const updateArtworkMediaStep = createStep(
  "update-vendor-artwork-media-step",
  async (input: UpdateArtworkMediaInput, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    const { id, ...updateData } = input

    const oldArtworkMedia = await vendorArtworkModuleService.retrieveVendorArtworkMedia(id)

    const updatedArtworkMedia = await vendorArtworkModuleService.updateVendorArtworkMedias(
      id, 
      updateData
    )

    return new StepResponse(
      updatedArtworkMedia,
      oldArtworkMedia
    )
  },
  async (oldArtworkMedia, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    const { id, ...oldData } = oldArtworkMedia

    await vendorArtworkModuleService.updateVendorArtworkMedias(id, oldData)
  }
)

export default updateArtworkMediaStep
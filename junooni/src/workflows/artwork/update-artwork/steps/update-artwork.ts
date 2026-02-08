import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import VendorArtworkModuleService from "../../../../modules/artwork/service"
import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"

export type UpdateArtworkInput = {
  id: string
  name?: string
  description?: string
}

const updateArtworkStep = createStep(
  "update-vendor-artwork-step",
  async (input: UpdateArtworkInput, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    const { id, ...updateData } = input   

    const oldArtwork = await vendorArtworkModuleService.retrieveVendorArtwork(id)
   

    // Try passing as object with id
    const updatedArtwork = await vendorArtworkModuleService.updateVendorArtworks({
      id,
      ...updateData
    })


    return new StepResponse(
      updatedArtwork,
      oldArtwork
    )
  },
  async (oldArtwork, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    const { id, ...oldData } = oldArtwork

    await vendorArtworkModuleService.updateVendorArtworks({
      id,
      ...oldData
    })
  }
)

export default updateArtworkStep
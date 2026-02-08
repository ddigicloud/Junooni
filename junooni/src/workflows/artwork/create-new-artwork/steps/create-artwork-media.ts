import {
    createStep,
    StepResponse,
  } from "@medusajs/framework/workflows-sdk"
  import VendorArtworkModuleService from "../../../../modules/artwork/service"
  import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"
  
  export type CreateArtworkMediasInput = {
  fileId: string
  mimeType: string
  filename: string
  vendor_artwork_id: string
  file_type: string
  file_description: string
}

type CreateArtworkMediasStepInput = {
  medias: CreateArtworkMediasInput[]
}

const createArtworkMediasStep = createStep(
  "create-vendor-artwork-medias",
  async ({ 
    medias,
  }: CreateArtworkMediasStepInput, { container }) => {
    console.log('Creating medias:', medias.length, 'items')
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)

    const artworkMedias = await vendorArtworkModuleService.createVendorArtworkMedias(medias)
    console.log('Created medias:', artworkMedias.length, 'items')
    console.log('Created medias details:', artworkMedias)

    return new StepResponse({
      vendor_artwork_media: artworkMedias,
    }, {
      vendor_artwork_media: artworkMedias,
    })
  },
  async ({ vendor_artwork_media }, { container }) => {
    const vendorArtworkModuleService: VendorArtworkModuleService = 
      container.resolve(VENDOR_ARTWORK_MODULE)
    
    // Fixed: Use deleteVendorArtworkMedias instead of deleteVendorArtworks
    await vendorArtworkModuleService.deleteVendorArtworkMedias(
      vendor_artwork_media.map((media) => media.id)
    )
  }
)

export default createArtworkMediasStep
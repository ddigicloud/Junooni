import {
    createStep,
    StepResponse,
  } from "@medusajs/framework/workflows-sdk"
  import VendorArtworkModuleService from "../../../../modules/artwork/service"
  import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"
  
  export type CreateArtworkStepInput = {
    name: string
    description: string
  }
  
  const createArtworkStep = createStep(
    "create-vendor-artwork-step",
    async (data: CreateArtworkStepInput, { container }) => {
      const vendorArtworkModuleService: VendorArtworkModuleService = 
        container.resolve(VENDOR_ARTWORK_MODULE)
  
      const artwork = await vendorArtworkModuleService
        .createVendorArtworks(data)
        console.log('Created artwork:', artwork)
      
      return new StepResponse({
        vendor_artwork: artwork,
      }, {
        vendor_artwork: artwork,
      })
    },
    
   async (data, {container}) => {
  
    if (!data){
      return
  }
      const vendorArtworkModuleService: VendorArtworkModuleService = 
        container.resolve(VENDOR_ARTWORK_MODULE)
      
      await vendorArtworkModuleService.deleteVendorArtworks(
        data.vendor_artwork.id
      )
    }
  )
  
  export default createArtworkStep
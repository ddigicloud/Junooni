import { 
    createWorkflow,
    transform,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk"
  import {
    CreateProductWorkflowInputDTO,
  } from "@medusajs/framework/types"
  import { 
    createProductsWorkflow,
    createRemoteLinkStep,
  } from "@medusajs/medusa/core-flows"
  import { 
    Modules,
  } from "@medusajs/framework/utils"
  import createArtworkStep, { 
    CreateArtworkStepInput,
  } from "./steps/create-artwork"
  import createArtworkMediasStep, { 
    CreateArtworkMediasInput,
  } from "./steps/create-artwork-media"
  import VendorArtworkModuleService from "../../../modules/artwork/service"
  import { VENDOR_ARTWORK_MODULE } from "../../../modules/artwork"
  
  type CreateArtworkWorkflowInput = {
    vendor_artwork: CreateArtworkStepInput & {
      medias: CreateArtworkMediasInput
    }

  }
  
  const CreateArtworkWorkflow = createWorkflow(
    "create-artwork",
    (input: CreateArtworkWorkflowInput) => {
        
      const { medias, ...artworkData } = input.vendor_artwork
      const { vendor_artwork } = createArtworkStep(
        artworkData
      )
  
      // const { vendor_artwork_media } = createArtworkMediasStep(
      //   transform({
      //       vendor_artwork,
      //     medias,
      //   },
      //   (data) => ({
      //     medias: data.medias.map((media) => ({
      //       ...media,
      //       vendor_artwork_id: data.vendor_artwork.id,
      //     })),
      //   })
      //   )
      // )
  
     
      return new WorkflowResponse({
        vendor_artwork: {
          ...vendor_artwork
        },
      })
    }
  )
  
  export default CreateArtworkWorkflow
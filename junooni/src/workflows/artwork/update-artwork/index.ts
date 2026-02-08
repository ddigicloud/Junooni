// import { 
//     createWorkflow,
//     transform,
//     WorkflowResponse,
//   } from "@medusajs/framework/workflows-sdk"
//   import { 
//     Modules,
//   } from "@medusajs/framework/utils"
//   import createArtworkStep, { 
//     CreateArtworkStepInput,
//   } from "../create-new-artwork/steps/create-artwork"
//   import createArtworkMediasStep, { 
//     CreateArtworkMediasInput,
//   } from "../create-new-artwork/steps/create-artwork-media"
//   import { VENDOR_ARTWORK_MODULE } from "../../../modules/artwork"
//   import { 
//     createRemoteLinkStep,
//   } from "@medusajs/medusa/core-flows"
  
//   type ArtworkWithPosition = CreateArtworkStepInput & {
//     medias: Omit<CreateArtworkMediasInput, "vendor_artwork_id">[]
//     position: string
//   }
  
//   type AddArtworkWorkflowInput = {
//     vendor_artworks: ArtworkWithPosition[]
//     product_variant_id: string // Existing product variant ID
//   }
  
//   const AddArtworkToProductWorkflow = createWorkflow(
//     "add-artwork-to-product",
//     (input: AddArtworkWorkflowInput) => {
//       // Create all artworks and their media
//       const artworksWithMedia = input.vendor_artworks.map(artworkWithPosition => {
//         const { medias, ...artworkData } = artworkWithPosition
  
//         // Create the artwork
//         const { vendor_artwork } = createArtworkStep(
//           artworkData // This includes the position
//         )
  
//         // Create the media for this artwork
//         const { vendor_artwork_media } = createArtworkMediasStep(
//           transform({
//             vendor_artwork,
//             medias,
//           },
//           (data) => ({
//             medias: data.medias.map((media) => ({
//               ...media,
//               vendor_artwork_id: data.vendor_artwork.id,
//             })),
//           })
//         )
  
//         // Create remote link for this artwork to the product
//         createRemoteLinkStep([{
//           [VENDOR_ARTWORK_MODULE]: {
//             vendor_artwork_id: vendor_artwork.id,
//           },
//           [Modules.PRODUCT]: {
//             product_variant_id: input.product_variant_id,
//           },
//         }])
  
//         // Return both the artwork and its media
//         return {
//           vendor_artwork,
//           vendor_artwork_media
//         }
//       })
  
//       // Return all created artworks with their media
//       return new WorkflowResponse({
//         vendor_artworks: artworksWithMedia.map(({ vendor_artwork, vendor_artwork_media }) => ({
//           ...vendor_artwork,
//           medias: vendor_artwork_media,
//         }))
//       })
//     }
//   )
  
//   export default AddArtworkToProductWorkflow

import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import updateArtworkStep from "./steps/update-artwork"

export type UpdateArtworkWorkflowInput = {
  id: string
  name?: string
  description?: string
}

export const updateArtworkWorkflow = createWorkflow(
  "update-vendor-artwork",
  (input: UpdateArtworkWorkflowInput) => {
    const artwork = updateArtworkStep(input)
    return new WorkflowResponse(artwork)
  }
)
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteArtworkMediaWorkflow } from "../../../../../../workflows/artwork/delete-artwork/delete-media-artwork"
import { updateArtworkMediaWorkflow } from "../../../../../../workflows/artwork/update-artwork/update-artwork-media"
import { z } from "zod"
import { ArtworkMediaType } from "../../../validators"

type ArtworkMediaTypeInferred = z.infer<typeof ArtworkMediaType>
// PUT /admin/artwork/[id]/artfiles/[artfieldId]
export const PUT = async (
  req: MedusaRequest<ArtworkMediaTypeInferred>,
  res: MedusaResponse
) => {
  const { artfileId } = req.params

  const { result: updatedMedia } = await updateArtworkMediaWorkflow(req.scope).run({
    input: {
      id: artfileId,
      ...req.validatedBody
    }
  })

  res.json(updatedMedia)
}

// DELETE /admin/artwork/[id]/artfiles/[artfieldId]
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {

  const { artfileId } = req.params
  console.log("Deleting artfile with ID:", artfileId)


  await deleteArtworkMediaWorkflow(req.scope).run({
    input: {
      id: artfileId
    }
  })

  res.status(200).json({
    id: artfileId,
    object: "vendor_artwork_media",
    deleted: true
  })
}


// GET /admin/artwork/[id]/artfiles/[artfileId] - Get specific artfile for artwork
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id: artworkId, artfileId } = req.params
  
  // First, verify the artwork exists and get its medias
  const { data: artwork } = await query.graph({
    entity: "vendor_artwork",
    fields: ["id", "medias.*"],
    filters: {
      id: artworkId
    }
  })

  if (!artwork || artwork.length === 0) {
    return res.status(404).json({ 
      message: "Artwork not found" 
    })
  }

  // Find the specific artfile (media) within the artwork
  const artfile = artwork[0].medias?.find((media: any) => media.id === artfileId)

  if (!artfile) {
    return res.status(404).json({ 
      message: "Artfile not found in this artwork" 
    })
  }

  res.json(artfile)
}


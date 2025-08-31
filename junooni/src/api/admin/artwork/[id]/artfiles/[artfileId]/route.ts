import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

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
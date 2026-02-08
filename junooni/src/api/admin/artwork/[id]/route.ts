import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import { deleteArtworkWorkflow } from "../../../../workflows/artwork/delete-artwork"
import { updateArtworkWorkflow } from "../../../../workflows/artwork/update-artwork"
import { PutAdminUpdateArtworkType } from "../validators"

type PutAdminUpdateArtworkTypeInferred = z.infer<typeof PutAdminUpdateArtworkType>


export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params
  
  const { data: artwork } = await query.graph({
    entity: "vendor_artwork",
    fields: ["*", "medias.*", "products.*"],
    filters: {
      id: id
    }
  })

  if (!artwork || artwork.length === 0) {
    return res.status(404).json({ 
      message: "Artwork not found" 
    })
  }

  res.json(artwork[0])
}

// PUT /admin/artwork/[id] - Update an artwork
export const PUT = async (
  req: MedusaRequest<PutAdminUpdateArtworkTypeInferred>,
  res: MedusaResponse
) => {
  const { id } = req.params
  
  const { result: updatedArtwork } = await updateArtworkWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody
    }
  })

  res.json(updatedArtwork)
}

// DELETE /admin/artwork/[id] - Delete an artwork
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  await deleteArtworkWorkflow(req.scope).run({
    input: {
      id
    }
  })

  res.status(200).json({
    id,
    object: "vendor_artwork",
    deleted: true
  })
}
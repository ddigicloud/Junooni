import { 
    AuthenticatedMedusaRequest, 
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  import { VENDOR_ARTWORK_MODULE } from "../../../modules/artwork"
  
  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const { 
      fields, 
      limit = 20, 
      offset = 0,
    } = req.validatedQuery || {}
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
    const { 
      data: vendorArtworks,
      metadata: { count, take, skip } = {},
    } = await query.graph({
      entity: "vendor_artwork",
      fields: [
        "*",
        "medias.*",
        "product_variant.*",
        ...(fields || []),
      ],
      pagination: {
        skip: offset,
        take: limit,
      },
    })
  
    res.json({
      vendor_artworks: vendorArtworks,
      count,
      limit: take,
      offset: skip,
    })
  }

  // other imports...
import { z } from "zod"
import CreateArtworkWorkflow from "src/workflows/artwork/create-new-artwork"
import { CreateArtworkMediasInput } from "src/workflows/artwork/create-new-artwork/steps/create-artwork-media"
import { createVendorArtworkSchema } from "../../validation-schemas"

// ...

type CreateRequestBody = z.infer<
  typeof createVendorArtworkSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateRequestBody>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  

  const { result } = await CreateArtworkWorkflow(
    req.scope
  ).run({
    input: {
      vendor_artwork: {
        name: req.validatedBody.name,
       description: req.validatedBody.description,
        medias: req.validatedBody.medias.map((media) => ({
          fileId: media.file_id,
          mimeType: media.mime_type,
          ...media,
        })) as Omit<CreateArtworkMediasInput, "vendor_artwork_id">[],
      },
      product: {
        ...req.validatedBody.product,
             },
    },
  })

  res.json({
    vendor_artwork: result.vendor_artwork,
  })
}
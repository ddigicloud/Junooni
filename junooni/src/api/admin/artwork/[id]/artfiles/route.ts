import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { createArtworkMediasWorkflow } from "../../../../../workflows/artwork/create-new-artwork/create-add-artfiles"
import VendorArtworkModuleService from "../../../../../modules/artwork/service"
import { VENDOR_ARTWORK_MODULE } from "../../../../../modules/artwork"

import { z } from "zod"


const LinkMediaSchema = z.object({
  medias: z.array(z.object({
    file_id: z.string(),
    mime_type: z.string(),
    filename: z.string(),
    file_type: z.string(),
    file_description: z.string().optional()
  }))
}).strict()

type RequestBody = z.infer<typeof LinkMediaSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  
  // Verify artwork exists
  const vendorArtworkModuleService: VendorArtworkModuleService = 
    req.scope.resolve(VENDOR_ARTWORK_MODULE)
  
  try {
    await vendorArtworkModuleService.retrieveVendorArtwork(id)
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Artwork with id ${id} not found`
    )
  }

  // Get files from multer
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files provided"
    )
  }

  try {
    // Run the workflow
    const { result } = await createArtworkMediasWorkflow(req.scope).run({
      input: {
        vendor_artwork_id: id,
        files: files.map((f) => ({
          filename: f.originalname,
          mimeType: f.mimetype,
          content: f.buffer.toString("binary"),
          access: "public",
        })),
      },
    })

    res.status(201).json({
      vendor_artwork_media: result.vendor_artwork_media,
      message: "Files uploaded and linked successfully"
    })
  } catch (error) {
    console.error('Upload and link error:', error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to upload and link files: ${error.message}`
    )
  }
}
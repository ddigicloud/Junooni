import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { VENDOR_ARTWORK_MODULE } from "../../../../modules/artwork"
import multer from "multer"
import { z } from "zod"
import { createVendorArtworkSchema } from "../../../validation-schemas"

const upload = multer({ storage: multer.memoryStorage() })



export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const input = req.files as Express.Multer.File[]

  if (!input?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input?.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString("base64"),
        access: "public", // or "private" depending on your needs
      })),
    },
  })

  res.status(200).json({ files: result })
}
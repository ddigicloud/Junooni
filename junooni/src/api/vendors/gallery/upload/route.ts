import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

const MARKETPLACE_MODULE = "marketplaceModuleService"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const actor_id = req.auth_context?.actor_id
  if (!actor_id) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")

  const files = req.files as Express.Multer.File[]
  if (!files?.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "No files uploaded")

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: vendorAdmins } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id"],
    filters: { id: actor_id },
  })
  const vendorId = vendorAdmins?.[0]?.vendor?.id
  if (!vendorId) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")

  const { result: uploadResult } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content:  f.buffer.toString("base64"),
        access:   "public",
      })),
    },
  })

  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE) as any
  const created = await Promise.all(
    uploadResult.map((file: { id: string; url: string }, i: number) =>
      marketplaceService.createVendorGalleryImages({
        url:       file.url,
        file_id:   file.id,
        filename:  files[i]?.originalname ?? file.id,
        size:      files[i]?.size ?? null,
        mime_type: files[i]?.mimetype ?? null,
        vendor_id: vendorId,
      })
    )
  )
  res.status(200).json({ images: created })
}
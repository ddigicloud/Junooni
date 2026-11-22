import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { deleteFilesWorkflow } from "@medusajs/medusa/core-flows"

const MARKETPLACE_MODULE = "marketplaceModuleService"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const actor_id = req.auth_context?.actor_id
  if (!actor_id) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: vendorAdmins } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id"],
    filters: { id: actor_id },
  })
  const vendorId = vendorAdmins?.[0]?.vendor?.id
  if (!vendorId) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")

  const { data: images } = await query.graph({
    entity: "vendor_gallery_image",
    fields: ["id", "url", "file_id", "filename", "size", "mime_type", "created_at"],
    filters: { vendor_id: vendorId },
  })
  res.status(200).json({ images })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const actor_id = req.auth_context?.actor_id
  if (!actor_id) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")

  const { imageId } = req.body as { imageId: string }
  if (!imageId) throw new MedusaError(MedusaError.Types.INVALID_DATA, "imageId is required")

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: vendorAdmins } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id"],
    filters: { id: actor_id },
  })
  const vendorId = vendorAdmins?.[0]?.vendor?.id
  if (!vendorId) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")

  const { data: images } = await query.graph({
    entity: "vendor_gallery_image",
    fields: ["id", "file_id", "vendor_id"],
    filters: { id: imageId },
  })
  const image = images?.[0]
  if (!image) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Image not found")
  if (image.vendor_id !== vendorId) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "You do not own this image")

  try {
    await deleteFilesWorkflow(req.scope).run({ input: { ids: [image.file_id] } })
  } catch (err: any) {
    console.warn("[gallery] Storage deletion failed:", err?.message)
  }

  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE) as any
  await marketplaceService.deleteVendorGalleryImages([imageId])
  res.status(200).json({ success: true, deleted: imageId })
}
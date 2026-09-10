import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow, deleteFilesWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// ✅ POST - Handle file uploads
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
        access: "public",
      })),
    },
  })

  res.status(200).json({ files: result })
}

// ✅ DELETE - Handle file deletion with thumbnail protection
export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { fileId, fileIds, productId } = req.body

  // Support both single fileId and batch fileIds array
  const idsToDelete: string[] = fileIds 
    ? (Array.isArray(fileIds) ? fileIds : [fileIds])
    : fileId ? [fileId] : []

  console.log("=== DELETE REQUEST RECEIVED ===")
  console.log("File IDs to delete:", idsToDelete)
  console.log("Product ID:", productId)
  console.log("================================")

  if (idsToDelete.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "File ID(s) are required"
    )
  }

  try {
    // ✅ STEP 1: Delete ALL files from storage first in one go
    // Single sequential operation — no parallel calls, no deadlock
    console.log(`🗑️ Deleting ${idsToDelete.length} files from storage...`)
    try {
      await deleteFilesWorkflow(req.scope).run({
        input: { ids: idsToDelete }
      })
      console.log(`✅ All files deleted from storage`)
    } catch (fileDeleteError) {
      console.warn(`⚠️ Storage deletion failed (continuing):`, fileDeleteError.message)
    }

    // ✅ STEP 2: Update product once with all images removed
    if (productId) {
      console.log(`📦 Updating product ${productId} to remove ${idsToDelete.length} images`)

      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "thumbnail", "images.*"],
        filters: { id: productId }
      })

      if (!products || products.length === 0) {
        console.warn(`⚠️ Product ${productId} not found — files already deleted from storage`)
        return res.status(200).json({
          success: true,
          deleted: true,
          ids: idsToDelete,
          warning: "Product not found but files deleted from storage"
        })
      }

      const product = products[0]

      console.log("📸 Current product images:", product.images.length)

      // Remove ALL deleted images in one filter pass
      const deletedSet = new Set(idsToDelete)
      const updatedImages = product.images
        .filter((img: any) => !deletedSet.has(img.id))
        .map((img: any) => ({ id: img.id, url: img.url }))

      console.log(`📝 Images: ${product.images.length} → ${updatedImages.length}`)

      // Check if thumbnail was deleted
      const deletedImage = product.images.find((img: any) => deletedSet.has(img.id))
      const isThumbnailDeleted = product.thumbnail && (
        idsToDelete.some(id => product.thumbnail.includes(id)) ||
        (deletedImage && deletedImage.url === product.thumbnail)
      )

      const newThumbnail = isThumbnailDeleted
        ? (updatedImages.length > 0 ? updatedImages[0].url : null)
        : product.thumbnail

      console.log(`🖼 Thumbnail: ${isThumbnailDeleted ? `cleared → ${newThumbnail}` : 'unchanged'}`)

      // ✅ Single product update call — no concurrent transactions
      const { updateProductsWorkflow } = await import("@medusajs/medusa/core-flows")

      await updateProductsWorkflow(req.scope).run({
        input: {
          products: [{
            id: productId,
            thumbnail: newThumbnail,
            images: updatedImages
          }]
        }
      })

      console.log(`✅ Product updated successfully`)
    }

    res.status(200).json({
      success: true,
      deleted: true,
      ids: idsToDelete
    })

  } catch (error: any) {
    console.error(`❌ Error deleting files:`, error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to delete files: ${error.message}`
    )
  }
}
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
        access: "public", // or "private" depending on your needs
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
  const { fileId, productId } = req.body

  console.log("=== DELETE REQUEST RECEIVED ===")
  console.log("File ID:", fileId)
  console.log("Product ID:", productId)
  console.log("================================")

  if (!fileId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "File ID is required"
    )
  }

  try {
    console.log(`🗑️ Attempting to delete file: ${fileId}`)

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // ✅ If productId is provided, handle product-specific deletion
    if (productId) {
      console.log(`📦 Deleting image ${fileId} from product ${productId}`)

      // Get the current product
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "thumbnail", "images.*"],
        filters: { id: productId }
      })

      if (!products || products.length === 0) {
        console.error(`❌ Product ${productId} not found`)
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product not found`
        )
      }

      const product = products[0]
      
      console.log("📸 Current product state:")
      console.log("  - Thumbnail:", product.thumbnail)
      console.log("  - Total images:", product.images.length)
      console.log("  - Image IDs:", product.images.map(img => img.id))
      
      // Check if this image is the thumbnail
      const isThumbnail = product.thumbnail && (
        product.thumbnail.includes(fileId) || 
        product.thumbnail === fileId ||
        product.images.find(img => img.id === fileId && img.url === product.thumbnail)
      )
      
      console.log(`🎯 Is this image the thumbnail? ${isThumbnail}`)
      
      // Remove image from product's images array
      const updatedImages = product.images
        .filter(img => {
          const shouldKeep = img.id !== fileId
          console.log(`  - Image ${img.id}: ${shouldKeep ? 'KEEP' : 'REMOVE'}`)
          return shouldKeep
        })
        .map(img => ({ id: img.id, url: img.url }))

      console.log(`📝 Images after filtering: ${product.images.length} -> ${updatedImages.length}`)

      // If this was the thumbnail, set a new one
      let newThumbnail = product.thumbnail
      if (isThumbnail) {
        newThumbnail = updatedImages.length > 0 ? updatedImages[0].url : null
        console.log(`⚠️ Image was thumbnail, setting new thumbnail: ${newThumbnail}`)
      } else {
        console.log(`✅ Image was not thumbnail, keeping current: ${product.thumbnail}`)
      }

      // Update the product
      console.log("🔄 Updating product with new image list and thumbnail...")
      const { updateProductsWorkflow } = await import("@medusajs/medusa/core-flows")
      
      const updatePayload = {
        products: [{
          id: productId,
          thumbnail: newThumbnail,
          images: updatedImages
        }]
      }
      
      console.log("📤 Update payload:", JSON.stringify(updatePayload, null, 2))
      
      await updateProductsWorkflow(req.scope).run({
        input: updatePayload
      })

      console.log(`✅ Product updated successfully`)
    }

    // ✅ Now delete the actual file
    console.log(`🗑️ Now deleting the actual file: ${fileId}`)
    
    try {
      await deleteFilesWorkflow(req.scope).run({
        input: {
          ids: [fileId]
        }
      })
      console.log(`✅ File deleted successfully from storage`)
    } catch (fileDeleteError) {
      console.error(`❌ Error deleting file from storage:`, fileDeleteError)
      // Log but continue - the file might already be deleted
      console.warn("⚠️ Continuing despite file deletion error...")
    }

    console.log(`✅ Successfully completed deletion process for: ${fileId}`)

    res.status(200).json({ 
      success: true,
      deleted: true,
      id: fileId
    })
  } catch (error: any) {
    console.error(`❌ Error deleting file ${fileId}:`, error)
    console.error("Error stack:", error.stack)
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to delete file: ${error.message}`
    )
  }
}
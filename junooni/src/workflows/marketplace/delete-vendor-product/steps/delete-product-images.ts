import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

type DeleteProductImagesInput = {
  productId: string
}

const extractFileKey = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname
    if (pathname.startsWith("/static/")) {
      return pathname.replace("/static/", "")
    }
    return pathname.startsWith("/") ? pathname.slice(1) : pathname
  } catch {
    return url.split("/").pop() || null
  }
}

export const deleteProductImagesStep = createStep(
  "delete-product-images-step",
  async ({ productId }: DeleteProductImagesInput, { container }) => {
    const query      = container.resolve(ContainerRegistrationKeys.QUERY)
    const fileModule = container.resolve(Modules.FILE)

    // ✅ Use query.graph() instead of raw SQL
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["images.id", "images.url"],
      filters: { id: productId },
    })

    const images: { id: string; url: string }[] = product?.images || []

    console.log(
      `[delete-product-images-step] Found ${images.length} image(s) for product ${productId}`
    )

    const deletedFiles: string[] = []
    const failedFiles: string[] = []

    for (const img of images) {
      if (!img.url) continue

      const fileKey = extractFileKey(img.url)
      if (!fileKey) {
        console.warn(
          `[delete-product-images-step] Could not extract file key from URL: ${img.url}`
        )
        failedFiles.push(img.url)
        continue
      }

      console.log(`[delete-product-images-step] Attempting to delete: ${fileKey}`)

      // Strategy 1: File module (S3, R2, MinIO, local provider)
      let deleted = false
      try {
        await fileModule.deleteFiles([{ fileKey }])
        deletedFiles.push(fileKey)
        deleted = true
        console.log(`[delete-product-images-step] ✅ Deleted via file module: ${fileKey}`)
      } catch (moduleErr: any) {
        console.warn(
          `[delete-product-images-step] File module failed for ${fileKey}: ${moduleErr.message}`
        )
      }

      // Strategy 2: Local filesystem fallback (dev only)
      if (!deleted) {
        try {
          const filename = fileKey.split("/").pop()!
          const localPath = path.join(process.cwd(), "static", filename)
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath)
            deletedFiles.push(fileKey)
            deleted = true
            console.log(`[delete-product-images-step] ✅ Deleted local file: ${filename}`)
          }
        } catch (fsErr: any) {
          console.warn(
            `[delete-product-images-step] Filesystem fallback failed for ${fileKey}: ${fsErr.message}`
          )
        }
      }

      if (!deleted) {
        failedFiles.push(fileKey)
        console.error(`[delete-product-images-step] ❌ Could not delete: ${fileKey}`)
      }
    }

    console.log(
      `[delete-product-images-step] Complete — deleted: ${deletedFiles.length}, failed: ${failedFiles.length}`
    )

    return new StepResponse({ deletedFiles, failedFiles, productId })
  },
  async ({ deletedFiles, productId }: { deletedFiles: string[]; failedFiles: string[]; productId: string }) => {
    console.warn(
      `[delete-product-images-step] Compensation triggered for product ${productId} — ` +
      `${deletedFiles.length} file(s) already permanently deleted from storage, cannot restore`
    )
  }
)
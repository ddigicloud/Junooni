// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
// import fs from "fs"
// import path from "path"

// type DeleteProductImagesInput = {
//   productId: string
// }

// const extractFileKey = (url: string): string | null => {
//   try {
//     const parsed = new URL(url)
//     const pathname = parsed.pathname
//     if (pathname.startsWith("/static/")) {
//       return pathname.replace("/static/", "")
//     }
//     return pathname.startsWith("/") ? pathname.slice(1) : pathname
//   } catch {
//     return url.split("/").pop() || null
//   }
// }

// export const deleteProductImagesStep = createStep(
//   "delete-product-images-step",
//   async ({ productId }: DeleteProductImagesInput, { container }) => {
//     const query      = container.resolve(ContainerRegistrationKeys.QUERY)
//     const fileModule = container.resolve(Modules.FILE)

//     // ✅ Use query.graph() instead of raw SQL
//     const { data: [product] } = await query.graph({
//       entity: "product",
//       fields: ["images.id", "images.url"],
//       filters: { id: productId },
//     })

//     const images: { id: string; url: string }[] = product?.images || []

//     console.log(
//       `[delete-product-images-step] Found ${images.length} image(s) for product ${productId}`
//     )

//     const deletedFiles: string[] = []
//     const failedFiles: string[] = []

//     for (const img of images) {
//       if (!img.url) continue

//       const fileKey = extractFileKey(img.url)
//       if (!fileKey) {
//         console.warn(
//           `[delete-product-images-step] Could not extract file key from URL: ${img.url}`
//         )
//         failedFiles.push(img.url)
//         continue
//       }

//       console.log(`[delete-product-images-step] Attempting to delete: ${fileKey}`)

//       // Strategy 1: File module (S3, R2, MinIO, local provider)
//       let deleted = false
//       try {
//         await fileModule.deleteFiles([{ fileKey }])
//         deletedFiles.push(fileKey)
//         deleted = true
//         console.log(`[delete-product-images-step] ✅ Deleted via file module: ${fileKey}`)
//       } catch (moduleErr: any) {
//         console.warn(
//           `[delete-product-images-step] File module failed for ${fileKey}: ${moduleErr.message}`
//         )
//       }

//       // Strategy 2: Local filesystem fallback (dev only)
//       if (!deleted) {
//         try {
//           const filename = fileKey.split("/").pop()!
//           const localPath = path.join(process.cwd(), "static", filename)
//           if (fs.existsSync(localPath)) {
//             fs.unlinkSync(localPath)
//             deletedFiles.push(fileKey)
//             deleted = true
//             console.log(`[delete-product-images-step] ✅ Deleted local file: ${filename}`)
//           }
//         } catch (fsErr: any) {
//           console.warn(
//             `[delete-product-images-step] Filesystem fallback failed for ${fileKey}: ${fsErr.message}`
//           )
//         }
//       }

//       if (!deleted) {
//         failedFiles.push(fileKey)
//         console.error(`[delete-product-images-step] ❌ Could not delete: ${fileKey}`)
//       }
//     }

//     console.log(
//       `[delete-product-images-step] Complete — deleted: ${deletedFiles.length}, failed: ${failedFiles.length}`
//     )

//     return new StepResponse({ deletedFiles, failedFiles, productId })
//   },
//   async ({ deletedFiles, productId }: { deletedFiles: string[]; failedFiles: string[]; productId: string }) => {
//     console.warn(
//       `[delete-product-images-step] Compensation triggered for product ${productId} — ` +
//       `${deletedFiles.length} file(s) already permanently deleted from storage, cannot restore`
//     )
//   }
// )



import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"

type DeleteProductImagesInput = {
  productId: string
}

type StepOutput = {
  deletedFiles: string[]
  failedFiles: string[]
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

const stripBucketPrefix = (fileKey: string, bucket: string): string => {
  const prefix = bucket + "/"
  return fileKey.startsWith(prefix) ? fileKey.slice(prefix.length) : fileKey
}

export const deleteProductImagesStep = createStep(
  "delete-product-images-step",
  async ({ productId }: DeleteProductImagesInput, { container }): Promise<StepResponse<StepOutput>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["images.id", "images.url"],
      filters: { id: productId },
    })

    const images: { id: string; url: string }[] = product?.images || []

    console.log(`[delete-product-images-step] Found ${images.length} image(s) for product ${productId}`)

    if (images.length === 0) {
      return new StepResponse({ deletedFiles: [], failedFiles: [], productId })
    }

    const bucket = process.env.S3_BUCKET
    const endpoint = process.env.S3_ENDPOINT
    const useS3 = !!(bucket && endpoint)

    // Build S3 client once — not per image
    const s3 = useS3
      ? new S3Client({
          endpoint,
          region: process.env.S3_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
          forcePathStyle: true,
        })
      : null

    // Delete all images concurrently
    const results = await Promise.allSettled(
      images.map(async (img) => {
        if (!img.url) throw new Error(`Image ${img.id} has no URL`)

        const fileKey = extractFileKey(img.url)
        if (!fileKey) throw new Error(`Could not extract key from URL: ${img.url}`)

        const s3Key = bucket ? stripBucketPrefix(fileKey, bucket) : fileKey

        if (useS3 && s3) {
          // Direct DeleteObjectCommand — no XML body, bypasses serializer bug
          // S3/MinIO: returns 204 whether key existed or not — does not throw on missing key
          await s3.send(new DeleteObjectCommand({
            Bucket: bucket!,
            Key: s3Key,
          }))
          console.log(`[delete-product-images-step] ✅ Deleted from S3: ${s3Key}`)
          return s3Key
        }

        // Localhost filesystem fallback
        const filename = s3Key.split("/").pop()!
        const localPath = path.join(process.cwd(), "static", filename)
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
          console.log(`[delete-product-images-step] ✅ Deleted local file: ${filename}`)
          return s3Key
        }

        throw new Error(`File not found locally: ${localPath}`)
      })
    )

    const deletedFiles: string[] = []
    const failedFiles: string[] = []

    for (const result of results) {
      if (result.status === "fulfilled") {
        deletedFiles.push(result.value)
      } else {
        console.error(`[delete-product-images-step] ❌ ${result.reason?.message ?? result.reason}`)
        failedFiles.push(result.reason?.message ?? "unknown")
      }
    }

    console.log(
      `[delete-product-images-step] Complete — deleted: ${deletedFiles.length}, failed: ${failedFiles.length}`
    )

    if (failedFiles.length > 0) {
      console.error(`[delete-product-images-step] Failed: ${failedFiles.join(", ")}`)
    }

    return new StepResponse(
      { deletedFiles, failedFiles, productId },
    )
  },

  async ({ deletedFiles, productId }: StepOutput) => {
    console.warn(
      `[delete-product-images-step] Compensation triggered for product ${productId} — ` +
      `${deletedFiles.length} file(s) permanently deleted from S3, cannot restore`
    )
  }
)
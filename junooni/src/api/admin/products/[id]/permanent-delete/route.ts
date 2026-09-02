import fs from "fs"
import path from "path"
// src/api/admin/products/[id]/permanent-delete/route.ts
//
// DELETE /admin/products/:id/permanent-delete
//
// Cascade order:
//   1. Fetch all image URLs from `image` table → delete files from S3
//   2. Delete artwork link rows (product_product_vendorartworkmodule_vendor_artwork)
//   3. Delete vendor-product link rows (marketplacemodule_vendor_product_product)
//   4. Delete the product via productModuleService (cascades variants, options, tags, etc.)

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteArtworkWorkflow } from "../../../../../workflows/artwork/delete-artwork"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const pgClient          = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const fileModuleService = req.scope.resolve(Modules.FILE)

  const log = (msg: string) => console.log(`[DELETE /admin/products/${id}/permanent-delete] ${msg}`)
  const errors: string[] = []

  const PRODUCT_ARTWORK_TABLE  = "product_product_vendorartworkmodule_vendor_artwork"
  const VENDOR_PRODUCT_TABLE   = "marketplacemodule_vendor_product_product"

  try {
    // ── 0. Guard: product must exist ─────────────────────────────────────────
    const productModuleService = req.scope.resolve(Modules.PRODUCT)

    let product: any
    try {
      product = await productModuleService.retrieveProduct(id)
    } catch {
      return res.status(404).json({ message: `Product ${id} not found.` })
    }
    if (!product) {
      return res.status(404).json({ message: `Product ${id} not found.` })
    }

    log(`Deleting product "${product.title}" (${id})…`)

    // ── 1. Delete image files from S3 ────────────────────────────────────────
    log("Fetching image records…")
    try {
      const imageRows = await pgClient.raw(
        `SELECT id, url FROM "image" WHERE product_id = ? AND deleted_at IS NULL`,
        [id]
      )
      const images: { id: string; url: string }[] =
        imageRows.rows ?? imageRows[0] ?? []

      log(`Found ${images.length} image file(s).`)

      for (const img of images) {
        if (!img.url) continue
        try {
          // S3 key = last path segment of URL, works for both:
          //   localhost:  http://localhost:9000/static/1787395054960-mockup-front.png
          //   production: https://files.junooni.com/junooni-files/bold-hoodi-01M1DR….jpeg
          const fileKey = img.url.split("/").pop()
          if (fileKey) {
            try {
              // Try file module first (production S3/R2)
              await fileModuleService.deleteFiles([{ fileKey }])
              log(`Deleted from storage: ${fileKey}`)
            } catch {
              // Fallback: local filesystem (localhost dev, static/)
              const localPath = path.join(process.cwd(), "static", fileKey)
              if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath)
                log(`Deleted local file: ${fileKey}`)
              }
            }
          }
        } catch (err: any) {
          // Non-fatal — log but continue so DB records are still cleaned up
          errors.push(`Failed to delete image ${img.id} from S3: ${err.message}`)
        }
      }
    } catch (err: any) {
      const msg = `Failed to fetch images: ${err.message}`
      log(msg)
      errors.push(msg)
    }

    // ── 2. Delete linked artworks (files + DB rows) then remove link rows ──────
    log("Fetching linked artworks…")
    try {
      const artworkRows = await pgClient.raw(
        `SELECT vendor_artwork_id FROM "${PRODUCT_ARTWORK_TABLE}"
         WHERE product_id = ? AND deleted_at IS NULL`,
        [id]
      )
      const artworkIds: string[] = (artworkRows.rows ?? artworkRows[0] ?? [])
        .map((r: any) => r.vendor_artwork_id)
        .filter(Boolean)

      log(`Found ${artworkIds.length} linked artwork(s).`)

      for (const artworkId of artworkIds) {
        try {
          await deleteArtworkWorkflow(req.scope).run({ input: { id: artworkId } })
          log(`Deleted artwork ${artworkId} and its files.`)
        } catch (err: any) {
          // Workflow failed — manual fallback
          log(`Artwork workflow failed for ${artworkId}: ${err.message} — manual cleanup…`)
          try {
            const mediaRows = await pgClient.raw(
              `SELECT "fileId" FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`,
              [artworkId]
            )
            const medias = mediaRows.rows ?? mediaRows[0] ?? []
            for (const media of medias) {
              if (media.fileId) {
                try {
                  await fileModuleService.deleteFiles([{ fileKey: media.fileId }])
                } catch {
                  const localPath = path.join(process.cwd(), "static", media.fileId)
                  if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
                }
              }
            }
            await pgClient.raw(`DELETE FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`, [artworkId])
            await pgClient.raw(`DELETE FROM "vendor_artwork" WHERE id = ?`, [artworkId])
            log(`Manually cleaned up artwork ${artworkId}.`)
          } catch (manualErr: any) {
            errors.push(`Failed to delete artwork ${artworkId}: ${manualErr.message}`)
          }
        }
      }

      // Remove the product↔artwork link rows
      await pgClient.raw(
        `DELETE FROM "${PRODUCT_ARTWORK_TABLE}" WHERE product_id = ?`,
        [id]
      )
      log("Artwork link rows removed.")
    } catch (err: any) {
      errors.push(`Failed during artwork deletion: ${err.message}`)
    }

    // ── 3. Delete vendor-product link rows ───────────────────────────────────
    log("Removing vendor-product links…")
    try {
      await pgClient.raw(
        `DELETE FROM "${VENDOR_PRODUCT_TABLE}" WHERE product_id = ?`,
        [id]
      )
      log("Vendor-product links removed.")
    } catch (err: any) {
      errors.push(`Failed to remove vendor-product links: ${err.message}`)
    }

    // ── 4. Delete the product (cascades variants, options, tags, etc.) ───────
    log("Deleting product record…")
    try {
      await productModuleService.deleteProducts([id])
      log("Product deleted.")
    } catch (err: any) {
      const msg = `Failed to delete product record: ${err.message}`
      log(msg)
      errors.push(msg)
      return res.status(500).json({
        message: "Product record could not be deleted. Partial cleanup may have occurred.",
        errors,
      })
    }

    // ── 5. Respond ────────────────────────────────────────────────────────────
    if (errors.length > 0) {
      return res.status(207).json({
        message: "Product deleted but some files could not be fully cleaned up.",
        deleted: true,
        errors,
      })
    }

    return res.status(200).json({
      message: "Product and all associated files permanently deleted.",
      deleted: true,
    })

  } catch (error: any) {
    console.error(`[permanent-delete] Unexpected error:`, error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to delete product: ${error.message}`
    )
  }
}
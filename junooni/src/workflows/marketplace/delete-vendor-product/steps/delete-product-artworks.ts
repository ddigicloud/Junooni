import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteArtworkWorkflow } from "../../../artwork/delete-artwork"
import fs from "fs"
import path from "path"

type DeleteProductArtworksInput = {
  productId: string
}

// Link entity name registered in your module link definition
// Check your link definition file — it should match the entity name used there
const ARTWORK_LINK_ENTITY = "product_vendor_artwork" // adjust if different

export const deleteProductArtworksStep = createStep(
  "delete-product-artworks-step",
  async ({ productId }: DeleteProductArtworksInput, { container }) => {
    const query      = container.resolve(ContainerRegistrationKeys.QUERY)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
    const fileModule = container.resolve(Modules.FILE)
    const pgClient   = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // ← ADD THESE DEBUG LINES HERE:
    const testResult = await query.graph({
      entity: "product_vendor_artwork",
      fields: ["product_id", "vendor_artwork_id"],
      filters: { product_id: productId },
    }).catch((e: any) => ({ error: e.message }))
    console.log("🔍 DEBUG product_vendor_artwork result:", JSON.stringify(testResult))

    // ✅ Use query.graph() to fetch linked artworks instead of raw SQL
    const { data: artworkLinks } = await query.graph({
      entity: ARTWORK_LINK_ENTITY,
      fields: ["vendor_artwork_id", "product_id"],
      filters: { product_id: productId },
    })

    const artworkIds: string[] = (artworkLinks || [])
      .map((r: any) => r.vendor_artwork_id)
      .filter(Boolean)

    console.log(
      `[delete-product-artworks-step] Found ${artworkIds.length} artwork(s) for product ${productId}`
    )

    const deletedArtworkIds: string[] = []

    for (const artworkId of artworkIds) {
      try {
        await deleteArtworkWorkflow(container).run({ input: { id: artworkId } })
        deletedArtworkIds.push(artworkId)
        console.log(`[delete-product-artworks-step] ✅ Deleted artwork ${artworkId}`)
      } catch (err: any) {
        // Workflow failed — manual fallback using raw SQL as last resort
        console.warn(
          `[delete-product-artworks-step] Workflow failed for ${artworkId}: ${err.message} — manual cleanup…`
        )
        try {
          const mediaRows = await pgClient.raw(
            `SELECT "fileId" FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`,
            [artworkId]
          )
          const medias = mediaRows.rows ?? mediaRows[0] ?? []

          for (const media of medias) {
            if (!media.fileId) continue
            try {
              await fileModule.deleteFiles([{ fileKey: media.fileId }])
            } catch {
              const localPath = path.join(process.cwd(), "static", media.fileId)
              if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
            }
          }

          await pgClient.raw(
            `DELETE FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`,
            [artworkId]
          )
          await pgClient.raw(
            `DELETE FROM "vendor_artwork" WHERE id = ?`,
            [artworkId]
          )
          deletedArtworkIds.push(artworkId)
          console.log(
            `[delete-product-artworks-step] ✅ Manually cleaned up artwork ${artworkId}`
          )
        } catch (manualErr: any) {
          console.error(
            `[delete-product-artworks-step] ❌ Manual cleanup failed for ${artworkId}: ${manualErr.message}`
          )
        }
      }
    }

    // ✅ Use remoteLink.dismiss() instead of raw SQL DELETE on link table
    if (artworkIds.length > 0) {
      try {
        await remoteLink.dismiss(
        artworkIds.map((artworkId) => ({
            product: { id: productId },
            vendorArtwork: { id: artworkId },
        }))
        )
        console.log(
          `[delete-product-artworks-step] ✅ Artwork link rows dismissed via remoteLink for product ${productId}`
        )
      } catch (linkErr: any) {
        // Fallback to raw SQL if remoteLink.dismiss fails
        console.warn(
          `[delete-product-artworks-step] remoteLink.dismiss failed: ${linkErr.message} — falling back to raw SQL`
        )
        await pgClient.raw(
          `DELETE FROM "product_product_vendorartworkmodule_vendor_artwork" WHERE product_id = ?`,
          [productId]
        )
      }
    }

    return new StepResponse({ deletedArtworkIds, productId })
  },
  async ({ deletedArtworkIds, productId }: { deletedArtworkIds: string[]; productId: string }) => {
    console.warn(
      `[delete-product-artworks-step] Compensation triggered for product ${productId} — ` +
      `${deletedArtworkIds.length} artwork(s) already deleted, cannot restore`
    )
  }
)
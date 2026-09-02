import fs from "fs"
import path from "path"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { MedusaError, ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import { deleteArtworkWorkflow } from "../../../workflows/artwork/delete-artwork"
import { z } from "zod"

// ─── Helper: attach plan fields from raw SQL ──────────────────────────────────

async function attachPlanFields(pgClient: any, vendor: any): Promise<void> {
  try {
    const result = await pgClient.raw(`
      SELECT
        COALESCE(plan, 'free')            AS plan,
        plan_billing_cycle,
        plan_activated_at,
        razorpay_subscription_id,
        razorpay_payment_id
      FROM "vendor"
      WHERE id = ?
    `, [vendor.id])

    const row = result.rows?.[0] ?? result[0]?.[0]
    if (row) {
      vendor.plan                     = row.plan ?? "free"
      vendor.plan_billing_cycle       = row.plan_billing_cycle ?? null
      vendor.plan_activated_at        = row.plan_activated_at ?? null
      vendor.razorpay_subscription_id = row.razorpay_subscription_id ?? null
      vendor.razorpay_payment_id      = row.razorpay_payment_id ?? null
    }
  } catch {
    vendor.plan = vendor.plan ?? "free"
  }
}

// ─── Update schema ────────────────────────────────────────────────────────────

export const VendorUpdateSchema = z.object({
  name: z.string().optional(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  coverphoto: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  xtwitter: z.string().optional(),
  othersocial: z.string().optional(),
  facebook: z.string().optional(),
  phonenumber: z.string().optional(),
  GSTIN: z.string().optional(),
  companyname: z.string().optional(),
  pan_number: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  tan_number: z.string().optional(),
  bank_account_holder_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_ifsc_code: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_type: z.enum(["Saving", "Current"]).nullable().optional(),
  cancelled_checkque: z.string().optional(),
  creator_bio: z.string().optional(),
  creator_title: z.string().optional(),
  sell_on_marketplace: z.boolean().optional(),
  sell_on_own_store: z.boolean().optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
}).strict()

type RequestBody = z.infer<typeof VendorUpdateSchema>

// ─── PUT /vendors/:id ─────────────────────────────────────────────────────────

export const PUT = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const updateData = req.validatedBody || req.body
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    if (!id?.trim()) {
      return res.status(400).json({ message: "Invalid vendor ID" })
    }

    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const existingVendor = await marketplaceModuleService.retrieveVendor(id)
    if (!existingVendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    const { plan, ...modelFields } = updateData as any

    if (Object.keys(modelFields).length > 0) {
      await marketplaceModuleService.updateVendors({ id, ...modelFields })
    }

    if (plan !== undefined) {
      await pgClient.raw(
        `UPDATE "vendor" SET plan = ? WHERE id = ?`,
        [plan, id]
      )
    }

    const vendorWithAdmins = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    await attachPlanFields(pgClient, vendorWithAdmins)

    return res.json({ vendor: vendorWithAdmins, message: "Vendor updated successfully" })

  } catch (error) {
    console.error("Error updating vendor:", error)
    if (error instanceof MedusaError) throw error
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to update vendor: ${error.message}`
    )
  }
}

// ─── GET /vendors/:id ─────────────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    const vendor = await marketplaceModuleService.retrieveVendor(id, {
      relations: ["admins"]
    })
    if (!vendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    await attachPlanFields(pgClient, vendor)
    return res.json({ vendor })

  } catch (error) {
    console.error("Error fetching vendor:", error)
    throw new MedusaError(
      MedusaError.Types.DB_ERROR,
      "Unable to retrieve vendor details."
    )
  }
}

// ─── DELETE /vendors/:id ──────────────────────────────────────────────────────
// Confirmed table names from DB introspection:
//
//   vendor_artwork          — no vendor_id column; linked via products
//   marketplacemodule_vendor_product_product
//                           — vendor_id, product_id, id columns
//   product_product_vendorartworkmodule_vendor_artwork
//                           — product_id, vendor_artwork_id, id columns
//   vendor_store            — vendor_id FK → must delete before vendor
//   vendor_admin            — vendor_id FK → must delete before vendor
//
// Cascade order:
//   1. Get product IDs for this vendor from marketplacemodule_vendor_product_product
//   2. For each product → get linked artwork IDs from product_product_vendorartworkmodule_vendor_artwork
//      → run deleteArtworkWorkflow for each (handles S3 file deletion + DB cleanup)
//   3. Delete the products via productModuleService
//   4. Delete vendor_store row (FK constraint)
//   5. Delete vendor_admin rows (FK constraint)
//   6. Delete the vendor record

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const pgClient          = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const fileModuleService = req.scope.resolve(Modules.FILE)

  const log = (msg: string) => console.log(`[DELETE /vendors/${id}] ${msg}`)
  const errors: string[] = []

  // Real table names confirmed by DB introspection
  const VENDOR_PRODUCT_TABLE   = "marketplacemodule_vendor_product_product"
  const PRODUCT_ARTWORK_TABLE  = "product_product_vendorartworkmodule_vendor_artwork"

  try {
    // ── 0. Guard: vendor must exist ──────────────────────────────────────────
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve("marketplaceModuleService")

    let vendor: any
    try {
      vendor = await marketplaceModuleService.retrieveVendor(id)
    } catch {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }
    if (!vendor) {
      return res.status(404).json({ message: `Vendor ${id} not found.` })
    }

    // ── 1. Get product IDs for this vendor ───────────────────────────────────
    log("Fetching products for vendor…")
    let productIds: string[] = []
    try {
      const productRows = await pgClient.raw(
        `SELECT product_id FROM "${VENDOR_PRODUCT_TABLE}" WHERE vendor_id = ? AND deleted_at IS NULL`,
        [id]
      )
      productIds = (productRows.rows ?? productRows[0] ?? [])
        .map((r: any) => r.product_id)
        .filter(Boolean)
      log(`Found ${productIds.length} product(s): ${productIds.join(", ") || "none"}`)
    } catch (err: any) {
      const msg = `Failed to fetch products: ${err.message}`
      log(msg)
      errors.push(msg)
    }

    // ── 2. For each product, find and delete linked artworks ─────────────────
    if (productIds.length > 0) {
      log("Fetching artworks linked to vendor products…")
      const artworkIds = new Set<string>()

      for (const productId of productIds) {
        try {
          const artworkRows = await pgClient.raw(
            `SELECT vendor_artwork_id FROM "${PRODUCT_ARTWORK_TABLE}"
             WHERE product_id = ? AND deleted_at IS NULL`,
            [productId]
          )
          const ids = (artworkRows.rows ?? artworkRows[0] ?? [])
            .map((r: any) => r.vendor_artwork_id)
            .filter(Boolean)
          ids.forEach((aid: string) => artworkIds.add(aid))
        } catch (err: any) {
          errors.push(`Failed to fetch artworks for product ${productId}: ${err.message}`)
        }
      }

      log(`Found ${artworkIds.size} unique artwork(s) to delete.`)

      for (const artworkId of artworkIds) {
        try {
          await deleteArtworkWorkflow(req.scope).run({ input: { id: artworkId } })
          log(`Deleted artwork ${artworkId} and its files.`)
        } catch (err: any) {
          // Workflow failed — manual fallback using fs + raw SQL
          const msg = `Workflow failed for artwork ${artworkId}: ${err.message} — attempting manual cleanup`
          log(msg)
          errors.push(msg)

          // Get media records and delete from S3 manually
          try {
            const mediaRows = await pgClient.raw(
              `SELECT "fileId" FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`,
              [artworkId]
            )
            const medias = mediaRows.rows ?? mediaRows[0] ?? []
            for (const media of medias) {
              if (media.fileId) {
                try {
                  try {
                    await fileModuleService.deleteFiles([{ fileKey: media.fileId }])
                    log(`Deleted artwork from storage: ${media.fileId}`)
                  } catch {
                    const localPath = path.join(process.cwd(), "static", media.fileId)
                    if (fs.existsSync(localPath)) {
                      fs.unlinkSync(localPath)
                      log(`Deleted artwork local file: ${media.fileId}`)
                    }
                  }
                } catch (fsErr: any) {
                  errors.push(`Failed to delete artwork file ${media.fileId}: ${fsErr.message}`)
                }
              }
            }
            // Delete media rows then artwork row
            await pgClient.raw(`DELETE FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`, [artworkId])
            await pgClient.raw(`DELETE FROM "vendor_artwork" WHERE id = ?`, [artworkId])
            log(`Manually cleaned up artwork ${artworkId}`)
          } catch (cleanupErr: any) {
            errors.push(`Manual cleanup failed for artwork ${artworkId}: ${cleanupErr.message}`)
          }
        }
      }
    }

    // ── 3. Delete product image files, then the products ─────────────────────
    // Images live in the `image` table with url = "http://…/static/<filename>"
    // Extract filename from URL and delete from filesystem before removing DB rows.
    // deleteProducts() cascades variants, options, tags, category links, etc.
    if (productIds.length > 0) {
      log(`Deleting image files for ${productIds.length} product(s)…`)

      try {
        const placeholders = productIds.map(() => "?").join(", ")
        const imageRows = await pgClient.raw(
          `SELECT id, url, product_id FROM "image"
           WHERE product_id IN (${placeholders}) AND deleted_at IS NULL`,
          productIds
        )
        const images: { id: string; url: string; product_id: string }[] =
          imageRows.rows ?? imageRows[0] ?? []

        log(`Found ${images.length} image file(s) to delete from S3.`)

        for (const img of images) {
          if (img.url) {
            try {
              // S3 key is always the last path segment of the URL.
              // localhost:  http://localhost:9000/static/1787395054960-mockup-front.png
              // production: https://files.junooni.com/junooni-files/bold-hoodi-01M1DR….jpeg
              // In both cases, split on "/" and take the last segment.
              const fileKey = img.url.split("/").pop()
              if (fileKey) {
                try {
                  await fileModuleService.deleteFiles([{ fileKey }])
                  log(`Deleted from storage: ${fileKey}`)
                } catch {
                  const localPath = path.join(process.cwd(), "static", fileKey)
                  if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath)
                    log(`Deleted local file: ${fileKey}`)
                  }
                }
              }
            } catch (fsErr: any) {
              // Non-fatal — log and continue so we don't block product deletion
              errors.push(`Failed to delete image ${img.id} from S3: ${fsErr.message}`)
            }
          }
        }
      } catch (err: any) {
        const msg = `Failed to fetch/delete product images: ${err.message}`
        log(msg)
        errors.push(msg)
        // Non-fatal — still attempt product record deletion
      }

      // Delete product records — Medusa cascades variants, options,
      // tags, category links, shipping profiles, and image table rows
      log(`Deleting ${productIds.length} product record(s)…`)
      try {
        const productModuleService = req.scope.resolve(Modules.PRODUCT)
        await productModuleService.deleteProducts(productIds)
        log(`Deleted ${productIds.length} product(s) and all DB records.`)
      } catch (svcErr: any) {
        // Fallback: manual cascade if service fails
        log(`productModuleService.deleteProducts failed: ${svcErr.message} — manual cascade…`)
        try {
          const ph = productIds.map(() => "?").join(", ")
          await pgClient.raw(`DELETE FROM "image" WHERE product_id IN (${ph})`, productIds)
          await pgClient.raw(
            `DELETE FROM "product_product_vendorartworkmodule_vendor_artwork" WHERE product_id IN (${ph})`,
            productIds
          )
          await pgClient.raw(
            `UPDATE "marketplacemodule_vendor_product_product" SET deleted_at = NOW() WHERE vendor_id = ?`,
            [id]
          )
          await pgClient.raw(`DELETE FROM "product" WHERE id IN (${ph})`, productIds)
          log(`Manual cascade delete of ${productIds.length} product(s) succeeded.`)
        } catch (manualErr: any) {
          const msg = `Manual product delete failed: ${manualErr.message}`
          log(msg)
          errors.push(msg)
        }
      }
    }

    // ── 4. Delete vendor_store (FK constraint on vendor) ─────────────────────
    log("Deleting vendor_store…")
    try {
      await pgClient.raw(`DELETE FROM "vendor_store" WHERE vendor_id = ?`, [id])
      log("vendor_store deleted.")
    } catch (err: any) {
      const msg = `Failed to delete vendor_store: ${err.message}`
      log(msg)
      errors.push(msg)
    }

    // ── 5. Delete vendor_admin (FK constraint on vendor) ─────────────────────
    log("Deleting vendor_admin rows…")
    try {
      await pgClient.raw(`DELETE FROM "vendor_admin" WHERE vendor_id = ?`, [id])
      log("vendor_admin rows deleted.")
    } catch (err: any) {
      const msg = `Failed to delete vendor_admin: ${err.message}`
      log(msg)
      errors.push(msg)
    }

    // ── 6. Delete the vendor record ──────────────────────────────────────────
    log("Deleting vendor record…")
    try {
      await marketplaceModuleService.deleteVendors(id)
      log("Vendor record deleted via service.")
    } catch (err: any) {
      // Service method may not exist — fallback to raw SQL
      try {
        await pgClient.raw(`DELETE FROM "vendor" WHERE id = ?`, [id])
        log("Vendor record deleted via raw SQL.")
      } catch (sqlErr: any) {
        const msg = `Failed to delete vendor record: ${sqlErr.message}`
        log(msg)
        errors.push(msg)
        return res.status(500).json({
          message: "Vendor record could not be deleted. Partial cleanup may have occurred.",
          errors,
        })
      }
    }

    // ── 7. Respond ────────────────────────────────────────────────────────────
    if (errors.length > 0) {
      return res.status(207).json({
        message: "Vendor deleted but some associated data could not be fully cleaned up.",
        deleted: true,
        errors,
      })
    }

    return res.status(200).json({
      message: "Vendor and all associated data permanently deleted.",
      deleted: true,
    })

  } catch (error: any) {
    console.error(`[DELETE /vendors/${id}] Unexpected error:`, error)
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Unable to delete vendor: ${error.message}`
    )
  }
}
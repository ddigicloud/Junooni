import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type DeleteVendorProductLinksInput = {
  productId: string
}

// Link entity name — check your marketplace module link definition
const VENDOR_PRODUCT_LINK_ENTITY = "vendor_product" // adjust if different

export const deleteVendorProductLinksStep = createStep(
  "delete-vendor-product-links-step",
  async ({ productId }: DeleteVendorProductLinksInput, { container }) => {
    const query      = container.resolve(ContainerRegistrationKeys.QUERY)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
    const pgClient   = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // ← ADD THESE DEBUG LINES HERE:
    const testResult = await query.graph({
      entity: "vendor_product",
      fields: ["vendor_id", "product_id"],
      filters: { product_id: productId },
    }).catch((e: any) => ({ error: e.message }))
    console.log("🔍 DEBUG vendor_product result:", JSON.stringify(testResult))

    // ✅ Use query.graph() to fetch existing links before deleting
    // so compensate can restore them if needed
    let existingLinks: any[] = []
    try {
      const { data } = await query.graph({
        entity: VENDOR_PRODUCT_LINK_ENTITY,
        fields: ["vendor_id", "product_id"],
        filters: { product_id: productId },
      })
      existingLinks = data || []
    } catch (queryErr: any) {
      console.warn(
        `[delete-vendor-product-links-step] query.graph failed: ${queryErr.message} — falling back to raw SQL for lookup`
      )
      const rows = await pgClient.raw(
        `SELECT * FROM "marketplacemodule_vendor_product_product" WHERE product_id = ?`,
        [productId]
      )
      existingLinks = rows.rows ?? rows[0] ?? []
    }

    console.log(
      `[delete-vendor-product-links-step] Found ${existingLinks.length} vendor-product link(s) for product ${productId}`
    )

    // ✅ Use remoteLink.dismiss() instead of raw SQL DELETE
    try {
       await remoteLink.dismiss(
        existingLinks.map((link: any) => ({
            vendor: { id: link.vendor_id },
            product: { id: productId },
        }))
        )
      console.log(
        `[delete-vendor-product-links-step] ✅ Vendor-product links dismissed via remoteLink for product ${productId}`
      )
    } catch (linkErr: any) {
      // Fallback to raw SQL if remoteLink.dismiss fails
      console.warn(
        `[delete-vendor-product-links-step] remoteLink.dismiss failed: ${linkErr.message} — falling back to raw SQL`
      )
      await pgClient.raw(
        `DELETE FROM "marketplacemodule_vendor_product_product" WHERE product_id = ?`,
        [productId]
      )
    }

    return new StepResponse({ existingLinks, productId })
  },
  // Compensate: restore links if a later step fails
  async ({ existingLinks, productId }: { existingLinks: any[]; productId: string }, { container }) => {
    if (!existingLinks?.length) return

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
    const pgClient   = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    console.log(
      `[delete-vendor-product-links-step] Compensation: restoring ${existingLinks.length} link(s) for product ${productId}`
    )

    // ✅ Use remoteLink to restore dismissed links
    try {
      await remoteLink.create(
        existingLinks.map((link: any) => ({
            vendor: { id: link.vendor_id },
            product: { id: productId },
        }))
        )
      console.log(
        `[delete-vendor-product-links-step] ✅ Compensation: restored links via remoteLink`
      )
    } catch (restoreErr: any) {
      // Last resort fallback
      console.warn(
        `[delete-vendor-product-links-step] remoteLink.create failed during compensation: ${restoreErr.message} — raw SQL fallback`
      )
      for (const link of existingLinks) {
        try {
          const columns = Object.keys(link).join(", ")
          const placeholders = Object.keys(link).map(() => "?").join(", ")
          const values = Object.values(link)
          await pgClient.raw(
            `INSERT INTO "marketplacemodule_vendor_product_product" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          )
        } catch (sqlErr: any) {
          console.error(
            `[delete-vendor-product-links-step] ❌ Compensation raw SQL fallback failed: ${sqlErr.message}`
          )
        }
      }
    }
  }
)
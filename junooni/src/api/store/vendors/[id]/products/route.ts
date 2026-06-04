import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
import pg from "pg"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string }
  const { region_id } = req.query as Record<string, string>
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    let currency_code = "inr"
    if (region_id) {
      try {
        const { data: regions } = await query.graph({
          entity: "region",
          fields: ["currency_code"],
          filters: { id: region_id },
        })
        currency_code = regions?.[0]?.currency_code || "inr"
      } catch {}
    }

    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    })
    await client.connect()

    let productIds: string[] = []

    try {
      // ── Debug: total rows in link table ───────────────────────────────────
      const totalResult = await client.query(
        `SELECT COUNT(*) as total FROM marketplacemodule_vendor_product_product`
      )
      console.log(`[vendors/${id}/products] total rows (incl deleted):`, totalResult.rows[0].total)

      const totalActive = await client.query(
        `SELECT COUNT(*) as total FROM marketplacemodule_vendor_product_product WHERE deleted_at IS NULL`
      )
      console.log(`[vendors/${id}/products] total active rows:`, totalActive.rows[0].total)

      // ── Debug: what vendor IDs exist in the table ─────────────────────────
      const vendorIdsResult = await client.query(
        `SELECT DISTINCT vendor_id, COUNT(*) as product_count 
         FROM marketplacemodule_vendor_product_product
         WHERE deleted_at IS NULL
         GROUP BY vendor_id
         ORDER BY product_count DESC
         LIMIT 10`
      )
      console.log(`[vendors/${id}/products] vendor IDs in link table:`)
      vendorIdsResult.rows.forEach((r: any) =>
        console.log(`  vendor_id=${r.vendor_id} products=${r.product_count}`)
      )

      // ── Debug: check our specific vendor ID (including deleted) ───────────
      const exactCheck = await client.query(
        `SELECT COUNT(*) as total FROM marketplacemodule_vendor_product_product WHERE vendor_id = $1`,
        [id]
      )
      console.log(`[vendors/${id}/products] rows for vendor_id=${id} (incl deleted):`, exactCheck.rows[0].total)

      // ── Debug: sample raw rows from the table ─────────────────────────────
      const sampleResult = await client.query(
        `SELECT * FROM marketplacemodule_vendor_product_product LIMIT 3`
      )
      console.log(`[vendors/${id}/products] sample rows:`, JSON.stringify(sampleResult.rows, null, 2))

      // ── Actual query ───────────────────────────────────────────────────────
      const result = await client.query(
        `SELECT product_id FROM marketplacemodule_vendor_product_product 
         WHERE vendor_id = $1 AND deleted_at IS NULL`,
        [id]
      )
      productIds = result.rows.map((r: any) => r.product_id)
      console.log(`[vendors/${id}/products] productIds found:`, productIds.length)
    } finally {
      await client.end()
    }

    if (productIds.length === 0) {
      return res.json({ products: [], count: 0 })
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "handle", "thumbnail", "status",
        "created_at", "metadata", "description",
        "variants.id", "variants.title",
        "variants.calculated_price.*",
        "images.*", "categories.*", "collection.*",
      ],
      filters: { id: productIds },
      context: {
        variants: {
          calculated_price: QueryContext({ region_id, currency_code }),
        },
      },
    })

    console.log(`[vendors/${id}/products] returning ${products?.length} products`)
    return res.json({ products: products ?? [], count: products?.length ?? 0 })

  } catch (err) {
    console.error(`[vendors/${id}/products] ERROR:`, String(err))
    return res.status(500).json({ products: [], message: String(err) })
  }
}
// import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
// import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
// import pg from "pg"

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { id } = req.params as { id: string }
//   const { region_id } = req.query as Record<string, string>
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

//   try {
//     // Get currency for region
//     let currency_code = "inr"
//     if (region_id) {
//       try {
//         const { data: regions } = await query.graph({
//           entity: "region",
//           fields: ["currency_code"],
//           filters: { id: region_id },
//         })
//         currency_code = regions?.[0]?.currency_code || "inr"
//       } catch {}
//     }

//     // Get ONLY published product IDs for this vendor in one query
//     const client = new pg.Client({
//       connectionString: process.env.DATABASE_URL,
//     })
//     await client.connect()

//     let productIds: string[] = []
//     try {
//       const result = await client.query(
//         `SELECT vp.product_id 
//          FROM marketplacemodule_vendor_product_product vp
//          INNER JOIN product p ON p.id = vp.product_id
//          WHERE vp.vendor_id = $1 
//            AND vp.deleted_at IS NULL
//            AND p.deleted_at IS NULL
//            AND p.status = 'published'`,
//         [id]
//       )
//       productIds = result.rows.map((r: any) => r.product_id)
//       console.log(`[vendors/${id}/products] published productIds:`, productIds.length)
//     } finally {
//       await client.end()
//     }

//     if (productIds.length === 0) {
//       return res.json({ products: [], count: 0 })
//     }

//     // Fetch only fields needed for listing page — NO calculated_price
//     const { data: products } = await query.graph({
//       entity: "product",
//       fields: [
//         "id",
//         "title",
//         "handle",
//         "thumbnail",
//         "status",
//         "created_at",
//         "metadata",
//         "images.id",
//         "images.url",
//         "variants.id",
//         "variants.title",
//         "variants.prices.amount",
//         "variants.prices.currency_code",
//         "vendor.id",
//         "vendor.name",
//         "vendor.handle",
//         "vendor.verified",
//       ],
//       filters: { id: productIds },
//       // No context/calculated_price — use variants.prices instead
//     })

//     console.log(`[vendors/${id}/products] returning ${products?.length} products`)
//     return res.json({ products: products ?? [], count: products?.length ?? 0 })

//   } catch (err) {
//     console.error(`[vendors/${id}/products] ERROR:`, String(err))
//     return res.status(500).json({ products: [], message: String(err) })
//   }
// }




import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import pg from "pg"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string }
  const { region_id } = req.query as Record<string, string>
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  console.log(`\n========================================`)
  console.log(`[ROUTE HIT] /store/vendors/${id}/products`)
  console.log(`[ROUTE HIT] region_id=${region_id}`)
  console.log(`[ROUTE HIT] timestamp=${new Date().toISOString()}`)
  console.log(`========================================\n`)

  try {
    // ── STEP 1: Raw SQL to get published product IDs ──────────────────────
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    console.log(`[ROUTE] DB connected`)

    let productIds: string[] = []
    let allProductIds: string[] = []

    try {
      // Check ALL rows for this vendor (no status filter)
      const allResult = await client.query(
        `SELECT vp.product_id, p.status, p.deleted_at as p_deleted, vp.deleted_at as vp_deleted
         FROM marketplacemodule_vendor_product_product vp
         LEFT JOIN product p ON p.id = vp.product_id
         WHERE vp.vendor_id = $1`,
        [id]
      )
      allProductIds = allResult.rows.map((r: any) => r.product_id)
      console.log(`[ROUTE] ALL rows for vendor (no filter): ${allResult.rows.length}`)
      allResult.rows.forEach((r: any) => {
        console.log(`  product_id=${r.product_id} status=${r.status} p_deleted=${r.p_deleted} vp_deleted=${r.vp_deleted}`)
      })

      // Now filter to only published
      const publishedResult = await client.query(
        `SELECT vp.product_id 
         FROM marketplacemodule_vendor_product_product vp
         INNER JOIN product p ON p.id = vp.product_id
         WHERE vp.vendor_id = $1 
           AND vp.deleted_at IS NULL
           AND p.deleted_at IS NULL
           AND p.status = 'published'`,
        [id]
      )
      productIds = publishedResult.rows.map((r: any) => r.product_id)
      console.log(`[ROUTE] PUBLISHED product IDs: ${productIds.length}`)
      console.log(`[ROUTE] Published IDs:`, productIds)

    } finally {
      await client.end()
      console.log(`[ROUTE] DB disconnected`)
    }

    if (productIds.length === 0) {
      console.log(`[ROUTE] No published products — returning empty`)
      return res.json({ products: [], count: 0 })
    }

    // ── STEP 2: query.graph with minimal fields ───────────────────────────
    console.log(`[ROUTE] Calling query.graph for ${productIds.length} product IDs`)
    const graphStart = Date.now()

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "created_at",
        "metadata",
        "images.id",
        "images.url",
        "variants.id",
        "variants.title",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "vendor.id",
        "vendor.name",
        "vendor.handle",
        "vendor.verified",
      ],
      filters: { id: productIds },
    })

    console.log(`[ROUTE] query.graph DONE in ${Date.now() - graphStart}ms`)
    console.log(`[ROUTE] Products returned by query.graph: ${products?.length}`)
    products?.forEach((p: any) => {
      console.log(`  → id=${p.id} title=${p.title} status=${p.status}`)
    })

    console.log(`[ROUTE] Sending response with ${products?.length} products`)
    return res.json({ products: products ?? [], count: products?.length ?? 0 })

  } catch (err) {
    console.error(`[ROUTE] ERROR:`, String(err))
    console.error(`[ROUTE] Stack:`, err instanceof Error ? err.stack : "no stack")
    return res.status(500).json({ products: [], message: String(err) })
  }
}
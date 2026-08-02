import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/reviews/summary?product_ids=id1,id2,id3
 *
 * Returns average_rating + review_count for multiple products in ONE query.
 * Replaces 45 individual /store/products/{id}/reviews calls on the homepage.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const productIdsRaw = req.query.product_ids as string

  if (!productIdsRaw?.trim()) {
    return res.json({ summaries: {} })
  }

  const productIds = productIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100) // never allow more than 100 — safety cap

  if (productIds.length === 0) {
    return res.json({ summaries: {} })
  }

  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // ONE query for ALL products at once
  // Parameterized — safe from SQL injection
  const result = await pgClient.raw(
    `SELECT
       product_id,
       ROUND(AVG(rating)::numeric, 2) AS average_rating,
       COUNT(*)::int                  AS review_count
     FROM review
     WHERE product_id = ANY(?)
       AND status = 'approved'
     GROUP BY product_id`,
    [productIds]
  )

  const summaries: Record<string,{ average_rating: number; review_count: number }> = {}

  // Fill results from DB
  for (const row of result.rows) {
    summaries[row.product_id] = {
      average_rating: parseFloat(row.average_rating) || 0,
      review_count: row.review_count || 0,
    }
  }

  // Fill zeros for products with no approved reviews
  // so frontend never gets undefined
  for (const id of productIds) {
    if (!summaries[id]) {
      summaries[id] = { average_rating: 0, review_count: 0 }
    }
  }

  return res.json({ summaries })
}
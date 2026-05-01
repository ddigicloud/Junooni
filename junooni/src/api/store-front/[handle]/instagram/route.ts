// src/api/store-front/[handle]/instagram/route.ts
// GET /store-front/{handle}/instagram
// Public endpoint — returns Instagram posts for a creator store
// Used by the storefront instagram_feed section

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchInstagramFeed } from "../../../vendors/me/instagram/feed/route"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const query    = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // Get vendor by handle
  const { data: [vendor] } = await query.graph({
    entity: "vendor",
    fields: ["id"],
    filters: { handle },
  })

  if (!vendor) return res.status(404).json({ posts: [] })

  const result = await pgClient.raw(
    `SELECT instagram_access_token, instagram_user_id, instagram_token_expires_at
     FROM vendor WHERE id = ?`,
    [vendor.id]
  )

  const row = result.rows?.[0]
  if (!row?.instagram_access_token || !row?.instagram_user_id) {
    return res.json({ posts: [] })
  }

  if (row.instagram_token_expires_at && new Date(row.instagram_token_expires_at) < new Date()) {
    return res.json({ posts: [], reason: "token_expired" })
  }

  try {
    const posts = await fetchInstagramFeed(row.instagram_access_token, row.instagram_user_id)
    return res.json({ posts })
  } catch (err: any) {
    return res.json({ posts: [], error: err.message })
  }
}
// src/api/vendors/me/instagram/feed/route.ts
// GET /vendors/me/instagram/feed
// Returns vendor's Instagram posts (cached 1 hour)
// Also used by storefront via /store-front/{handle}/instagram

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Simple in-memory cache — good enough for feed display
const feedCache = new Map<string, { data: any[]; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function fetchInstagramFeed(
  accessToken: string,
  igUserId: string,
  limit = 12
): Promise<any[]> {
  const cached = feedCache.get(igUserId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
  const url = `https://graph.instagram.com/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? "Instagram API error")
  }

  const data = await res.json()
  const posts = (data.data ?? []).filter(
    (p: any) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
  )

  feedCache.set(igUserId, { data: posts, ts: Date.now() })
  return posts
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query    = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const { data: [va] } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id"],
    filters: { id: req.auth_context.actor_id },
  })

  const vendorId = va?.vendor?.id
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const result = await pgClient.raw(
    `SELECT instagram_access_token, instagram_user_id, instagram_token_expires_at
     FROM vendor WHERE id = ?`,
    [vendorId]
  )

  const row = result.rows?.[0]
  if (!row?.instagram_access_token || !row?.instagram_user_id) {
    return res.json({ connected: false, posts: [] })
  }

  // Check if token is expired
  if (row.instagram_token_expires_at && new Date(row.instagram_token_expires_at) < new Date()) {
    return res.json({ connected: false, posts: [], reason: "token_expired" })
  }

  try {
    const posts = await fetchInstagramFeed(row.instagram_access_token, row.instagram_user_id)
    return res.json({ connected: true, posts })
  } catch (err: any) {
    console.error("[instagram/feed] fetch failed:", err.message)
    return res.status(502).json({ connected: true, posts: [], error: err.message })
  }
}
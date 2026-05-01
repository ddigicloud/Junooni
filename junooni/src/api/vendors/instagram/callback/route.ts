// src/api/vendors/instagram/callback/route.ts
// GET /vendors/instagram/callback
// Handles OAuth callback from Instagram — saves access token to vendor

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const INSTAGRAM_APP_ID       = process.env.INSTAGRAM_APP_ID!
const INSTAGRAM_APP_SECRET   = process.env.INSTAGRAM_APP_SECRET!
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!
const DASHBOARD_URL          = process.env.DASHBOARD_URL ?? "http://localhost:5173"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { code, state, error } = req.query as Record<string, string>

  if (error) {
    console.error("[instagram/callback] OAuth error:", error)
    return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=${error}`)
  }

  if (!code || !state) {
    return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=missing_params`)
  }

  // Decode state to get vendor_admin_id
  let vendorAdminId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"))
    vendorAdminId = decoded.vendor_admin_id

    // Reject if state is older than 10 minutes
    if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
      return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=expired`)
    }
  } catch {
    return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=invalid_state`)
  }

  try {
    // Step 1: Exchange code for short-lived token
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type:    "authorization_code",
        redirect_uri:  INSTAGRAM_REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      console.error("[instagram/callback] token exchange failed:", tokenData)
      return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=token_exchange_failed`)
    }

    const shortLivedToken = tokenData.access_token
    const igUserId        = tokenData.user_id

    // Step 2: Exchange for long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
    )
    const longTokenData = await longTokenRes.json()
    const accessToken   = longTokenData.access_token ?? shortLivedToken
    const expiresIn     = longTokenData.expires_in ?? 60 * 24 * 60 * 60 // 60 days

    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Step 3: Save token to vendor via raw SQL
    const query   = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // Get vendor_id from vendor_admin_id
    const { data: [va] } = await query.graph({
      entity: "vendor_admin",
      fields: ["id", "vendor.id"],
      filters: { id: vendorAdminId },
    })

    const vendorId = va?.vendor?.id
    if (!vendorId) {
      return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=vendor_not_found`)
    }

    await pgClient.raw(
      `UPDATE vendor SET
        instagram_access_token = ?,
        instagram_user_id = ?,
        instagram_token_expires_at = ?
       WHERE id = ?`,
      [accessToken, String(igUserId), expiresAt.toISOString(), vendorId]
    )

    console.log(`[instagram/callback] token saved for vendor ${vendorId} user ${igUserId}`)
    return res.redirect(`${DASHBOARD_URL}/store?instagram=connected`)

  } catch (err) {
    console.error("[instagram/callback] error:", err)
    return res.redirect(`${DASHBOARD_URL}/store?instagram=error&reason=server_error`)
  }
}
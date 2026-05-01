// src/api/vendors/me/instagram/connect/route.ts
// GET /vendors/me/instagram/connect
// Redirects vendor to Instagram OAuth authorization page

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const INSTAGRAM_APP_ID     = process.env.INSTAGRAM_APP_ID!
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  if (!INSTAGRAM_APP_ID || !INSTAGRAM_REDIRECT_URI) {
    return res.status(500).json({ message: "Instagram OAuth not configured" })
  }

  const vendorAdminId = req.auth_context?.actor_id
  if (!vendorAdminId) return res.status(401).json({ message: "Unauthorized" })

  // State param — encode vendor admin ID so callback knows who to save token for
  const state = Buffer.from(JSON.stringify({
    vendor_admin_id: vendorAdminId,
    timestamp: Date.now(),
  })).toString("base64url")

  const params = new URLSearchParams({
    client_id:     INSTAGRAM_APP_ID,
    redirect_uri:  INSTAGRAM_REDIRECT_URI,
    scope:         "instagram_business_basic",
    response_type: "code",
    state,
  })

  const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`

  console.log(`[instagram/connect] redirecting vendor ${vendorAdminId} to Instagram OAuth`)
  return res.redirect(authUrl)
}
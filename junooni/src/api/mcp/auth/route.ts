/**
 * JUNOONI MCP OAuth 2.0 Authorization  —  /mcp/auth
 *
 * GET  /mcp/auth/authorize
 *   Claude / ChatGPT redirects the creator here to start the OAuth flow.
 *   We bounce them to the Studio consent page with the OAuth params preserved.
 *
 * POST /mcp/auth/authorize
 *   Called by the Studio frontend AFTER the creator approves the connection.
 *   Body: { vendorId, scope, code_challenge (optional), state, redirect_uri }
 *   Returns: { auth_code }  — Studio then redirects to redirect_uri?code=...&state=...
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createAuthCode }                 from "../../../lib/mcp/tokenStore"

const STUDIO_BASE = process.env.STUDIO_URL ?? "https://studio.junooni.com"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

// ── GET /mcp/auth/authorize  ───────────────────────────────────────────────────
// Claude hits this URL. We redirect to the Studio consent page.

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const q = req.query as Record<string, string>

  const response_type = q.response_type ?? "code"
  const client_id     = q.client_id     ?? ""
  const redirect_uri  = q.redirect_uri  ?? ""
  const state         = q.state         ?? ""
  const scope         = q.scope         ?? "read"

  if (!redirect_uri) {
    return res.status(400).send("Missing redirect_uri")
  }

  // Build the Studio consent URL
  const params = new URLSearchParams({
    response_type,
    client_id,
    redirect_uri,
    state,
    scope,
  })
  const studioConsentUrl = `${STUDIO_BASE}/mcp/authorize?${params.toString()}`

  return res.redirect(302, studioConsentUrl)
}

// ── OPTIONS ────────────────────────────────────────────────────────────────────

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

// ── POST /mcp/auth/authorize  ──────────────────────────────────────────────────
// The Studio consent page calls this after the creator approves.
// We create an auth code and return it; Studio redirects to Claude.

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const { vendorId, scope, redirect_uri, state } = req.body as {
    vendorId:     string
    scope:        string
    redirect_uri: string
    state:        string
  }

  if (!vendorId || !redirect_uri) {
    return res.status(400).json({ error: "vendorId and redirect_uri are required" })
  }

  const grantedScope = scope?.startsWith("read+write") ? "read+write" : "read"
  const authCode     = createAuthCode(vendorId, grantedScope, redirect_uri)

  // Build the redirect URL for Studio to use
  const redirectParams = new URLSearchParams({ code: authCode })
  if (state) redirectParams.set("state", state)
  const redirectUrl = `${redirect_uri}?${redirectParams.toString()}`

  return res.json({ auth_code: authCode, redirect_url: redirectUrl })
}
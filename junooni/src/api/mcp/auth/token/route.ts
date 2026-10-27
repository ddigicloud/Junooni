/**
 * JUNOONI MCP OAuth 2.0 Token Exchange  —  /mcp/auth/token
 *
 * POST /mcp/auth/token
 *   Standard OAuth 2.0 token endpoint.
 *   Claude / ChatGPT calls this to exchange an auth code for an access token.
 *
 * Request body (application/x-www-form-urlencoded or application/json):
 *   grant_type    = "authorization_code"
 *   code          = <auth code from /mcp/auth/authorize>
 *   redirect_uri  = <same URI used in the authorize step>
 *   client_id     = <client identifier (for logging)>
 *
 * Response:
 *   { access_token, token_type: "bearer", scope, expires_in: null }
 */

import { MedusaRequest, MedusaResponse }         from "@medusajs/framework/http"
import { redeemAuthCode, generateAccessToken, saveAccessToken } from "../../../../lib/mcp/tokenStore"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  // Support both JSON and form-encoded bodies
  const body = req.body as any
  const grant_type  = body?.grant_type  ?? ""
  const code        = body?.code        ?? ""
  const redirect_uri = body?.redirect_uri ?? ""
  const client_id   = body?.client_id   ?? "unknown"

  // ── Validate grant type ─────────────────────────────────────────────────────
  if (grant_type !== "authorization_code") {
    return res.status(400).json({
      error:             "unsupported_grant_type",
      error_description: "Only authorization_code is supported",
    })
  }

  if (!code) {
    return res.status(400).json({
      error:             "invalid_request",
      error_description: "Missing code",
    })
  }

  // ── Redeem auth code ────────────────────────────────────────────────────────
  const entry = redeemAuthCode(code)
  if (!entry) {
    return res.status(400).json({
      error:             "invalid_grant",
      error_description: "Auth code is invalid or has expired",
    })
  }

  // Optionally validate redirect_uri matches (if provided)
  if (redirect_uri && entry.redirectUri && redirect_uri !== entry.redirectUri) {
    return res.status(400).json({
      error:             "invalid_grant",
      error_description: "redirect_uri mismatch",
    })
  }

  // ── Issue access token ──────────────────────────────────────────────────────
  const accessToken = generateAccessToken()
  const mcpService  = req.scope.resolve("mcpModule")

  try {
    await saveAccessToken(mcpService, entry.vendorId, accessToken, entry.scope, `claude-connector`)
    console.log(`[MCP token] Issued token for vendor=${entry.vendorId} scope=${entry.scope} client=${client_id}`)
  } catch (err) {
    console.error("[MCP token] Failed to save access token:", err)
    return res.status(500).json({
      error:             "server_error",
      error_description: "Failed to issue access token",
    })
  }

  return res.json({
    access_token: accessToken,
    token_type:   "bearer",
    scope:        entry.scope,
    expires_in:   null,  // tokens don't expire — revoke via Studio
  })
}
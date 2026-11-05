import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const BASE = process.env.BACKEND_URL ?? "https://api.junooni.com"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.json({
    issuer:                                BASE,
    authorization_endpoint:                `${BASE}/authorize`,
    token_endpoint:                        `${BASE}/token`,
    registration_endpoint:                 `${BASE}/mcp/auth/register`,
    scopes_supported:                      ["read", "read+write"],
    response_types_supported:              ["code"],
    grant_types_supported:                 ["authorization_code"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported:      ["S256"],
  })
}
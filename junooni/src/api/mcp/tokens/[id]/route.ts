/**
 * DELETE /mcp/tokens/:id
 * Revokes a single MCP token.
 * File: src/api/mcp/tokens/[id]/route.ts
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { revokeToken }                   from "../../../../lib/mcp/tokenStore"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const id       = (req.params as any).id       as string | undefined
  const vendorId = (req.body   as any)?.vendorId as string | undefined

  if (!id || !vendorId) {
    return res.status(400).json({ error: "id and vendorId are required" })
  }

  const mcpService = req.scope.resolve("mcpModule")
  const ok         = await revokeToken(mcpService, id, vendorId)

  if (!ok) {
    return res.status(404).json({ error: "Token not found or not yours" })
  }

  return res.json({ revoked: true })
}
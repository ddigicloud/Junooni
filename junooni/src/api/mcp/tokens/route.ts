/**
 * GET /mcp/tokens?vendorId=xxx
 * Lists all active MCP tokens for a vendor (Studio "Connected Apps" page).
 * File: src/api/mcp/tokens/route.ts
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listVendorTokens }              from "../../../lib/mcp/tokenStore"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const vendorId = (req.query as any).vendorId as string | undefined
  if (!vendorId) {
    return res.status(400).json({ error: "vendorId is required" })
  }

  const mcpService = req.scope.resolve("mcpModule")
  const tokens     = await listVendorTokens(mcpService, vendorId)

  return res.json({ tokens })
}
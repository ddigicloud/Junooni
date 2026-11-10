// src/api/mcp/upload-artwork-file/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { storeDesignFile } from "../../../lib/ai/inline-product-handlers"
import { uploadTempTokens, uploadResults } from "../../../lib/mcp/uploadTokenStore"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  const tempToken = (req.query?.token as string) ?? ""
  const tokenData = uploadTempTokens.get(tempToken)
  if (!tokenData) return res.status(401).json({ ok: false, error: "Invalid or expired token" })

  const files = (req as any).files as any[]
  const file  = files?.[0] ?? (req as any).file
  if (!file) return res.status(400).json({ ok: false, error: "No file uploaded" })

  const mimeType  = file.mimetype ?? "image/png"
  const filename  = file.originalname ?? `artwork-${Date.now()}.png`
  const base64    = `data:${mimeType};base64,${file.buffer.toString("base64")}`
  const sessionId = storeDesignFile(tokenData.vendorId, base64, filename, mimeType)

  // Store result BEFORE consuming the token so check_upload can retrieve it
  uploadResults.set(tempToken, {
    design_session_id: sessionId,
    filename,
    completedAt: Date.now(),
  })

  // One-time use — delete the pending token now
  uploadTempTokens.delete(tempToken)

  return res.json({ ok: true, design_session_id: sessionId, filename })
}
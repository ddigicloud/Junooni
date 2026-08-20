// src/api/vendors/ai-assistant/mockup/route.ts
// Serves stored mockup preview images by session ID.
// Called by MockupSlider in AIAssistant.tsx to fetch images via GET
// instead of embedding base64 in POST response bodies (which caused 413).
//
// Usage: GET /vendors/ai-assistant/mockup?session=mockup_xxx

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getMockupPreview } from "../../../../lib/ai/inline-product-handlers"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const session = (req.query as any)?.session as string | undefined

  if (!session) {
    return res.status(400).json({ error: "session query param is required" })
  }

  const mockup = getMockupPreview(session)

  if (!mockup) {
    return res.status(404).json({ error: "Mockup session not found or expired" })
  }

  // Strip data URI prefix, send raw image bytes
  const mimeMatch = mockup.match(/^data:([^;]+);base64,/)
  const mimeType  = mimeMatch?.[1] ?? "image/webp"
  const base64Raw = mockup.replace(/^data:[^;]+;base64,/, "")
  const buffer    = Buffer.from(base64Raw, "base64")

  res.setHeader("Content-Type", mimeType)
  res.setHeader("Content-Length", buffer.length)
  res.setHeader("Cache-Control", "private, max-age=7200")
  return res.status(200).send(buffer)
}
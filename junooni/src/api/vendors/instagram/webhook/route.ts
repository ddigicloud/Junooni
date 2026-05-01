// src/api/vendors/instagram/webhook/route.ts
// GET  /vendors/instagram/webhook  — Instagram webhook verification
// POST /vendors/instagram/webhook  — Instagram webhook events (optional)

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const WEBHOOK_VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN ?? "junooni-ig-webhook-2025"

// ── GET — verify webhook (Instagram calls this to confirm your endpoint) ──────
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const mode      = req.query["hub.mode"]        as string
  const token     = req.query["hub.verify_token"] as string
  const challenge = req.query["hub.challenge"]    as string

  console.log(`[instagram/webhook] verify: mode=${mode} token=${token}`)

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("[instagram/webhook] ✅ Webhook verified")
    return res.status(200).send(challenge)
  }

  console.warn("[instagram/webhook] ❌ Verification failed")
  return res.status(403).json({ error: "Verification failed" })
}

// ── POST — receive webhook events (token refresh, etc.) ─────────────────────
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Instagram sends deauthorize / data_deletion notifications here
  console.log("[instagram/webhook] event received:", JSON.stringify(req.body).slice(0, 200))
  return res.status(200).json({ status: "ok" })
}
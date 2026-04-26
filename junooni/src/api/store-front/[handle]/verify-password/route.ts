// src/api/store-front/[handle]/verify-password/route.ts
// POST /store-front/:handle/verify-password
// No auth required — public endpoint.
// Uses Node built-in crypto — no jsonwebtoken package needed.

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as crypto from "crypto"
import * as bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET ?? "junooni-store-access-secret"
const TOKEN_TTL  = 60 * 60 * 24 // 24 hours in seconds

// ── Minimal JWT builder using Node crypto (no jsonwebtoken package) ───────────
function createAccessToken(handle: string, storeId: string): string {
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify({
    handle,
    store_id: storeId,
    access: "granted",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL,
  })).toString("base64url")

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url")

  return `${header}.${payload}.${signature}`
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const { password } = req.body as { password?: string }

  if (!password) {
    return res.status(400).json({ verified: false, message: "Password is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Fetch store by subdomain
  let store: any = null
  try {
    const { data: [vendorStore] } = await query.graph({
      entity: "vendor_store",
      fields: ["id", "password_enabled", "store_password", "primary_color", "secondary_color"],
      filters: { subdomain: handle },
    })
    store = vendorStore
  } catch {
    return res.status(404).json({ verified: false, message: "Store not found" })
  }

  if (!store) {
    return res.status(404).json({ verified: false, message: "Store not found" })
  }

  // If password not enabled, grant access freely
  if (!store.password_enabled || !store.store_password) {
    return res.json({ verified: true, message: "Store is not password protected" })
  }

  // Compare against bcrypt hash
  const isMatch = await bcrypt.compare(password, store.store_password)

  if (!isMatch) {
    await new Promise(r => setTimeout(r, 500)) // brute force delay
    return res.status(401).json({ verified: false, message: "Incorrect password" })
  }

  const token = createAccessToken(handle, store.id)

  return res.json({
    verified: true,
    token,
    expires_in: TOKEN_TTL,
  })
}
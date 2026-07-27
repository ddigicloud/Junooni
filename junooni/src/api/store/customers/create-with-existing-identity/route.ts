import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, first_name, last_name, phone } = req.body as {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
  }

  if (!email) return res.status(400).json({ message: "Email required" })

  const authModuleService    = req.scope.resolve(Modules.AUTH)
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const query                = req.scope.resolve("query")
  const configModule         = req.scope.resolve("configModule")
  const jwtSecret            = configModule?.projectConfig?.http?.jwtSecret || "supersecret"

  // ── Find existing auth identity for this email ────────────────────────────
  const allIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  const existingIdentity = allIdentities.find(identity =>
    identity.provider_identities?.some(pi => {
      const piEmail = pi.provider === "emailpass"
        ? pi.entity_id || ""
        : (pi.user_metadata as any)?.email || ""
      return piEmail.toLowerCase() === email.toLowerCase()
    })
  )

  if (!existingIdentity) {
    return res.status(404).json({ message: "No existing identity found." })
  }

  // ── Check if customer record already exists ───────────────────────────────
  if (existingIdentity.app_metadata?.customer_id) {
    return res.status(409).json({
      message: "Customer account already exists for this email.",
      type: "customer_exists"
    })
  }

  // Also check customer table directly by email
  try {
    const { data: customers } = await query.graph({
      entity:  "customer",
      fields:  ["id", "email", "has_account"],
      filters: { email: email.toLowerCase() },
    })
    const existing = (customers as any[])[0]
    if (existing?.has_account) {
      return res.status(409).json({
        message: "Customer account already exists for this email.",
        type:    "customer_exists"
      })
    }
  } catch (_) {}

  // ── Create customer record directly via module — no HTTP, no publishable key
  let customer: any
  try {
    customer = await customerModuleService.createCustomers({
      email,
      first_name: first_name || "",
      last_name:  last_name  || "",
      phone:      phone      || undefined,
      has_account: true,
    })
    console.log("[create-with-existing-identity] customer created:", customer?.id)
  } catch (createErr: any) {
    console.error("[create-with-existing-identity] createCustomers failed:", createErr?.message)
    return res.status(500).json({ message: "Failed to create customer record." })
  }

  if (!customer?.id) {
    return res.status(500).json({ message: "Customer creation returned no ID." })
  }

  // ── Link customer_id to the shared auth identity ──────────────────────────
  await authModuleService.updateAuthIdentities({
    id:           existingIdentity.id,
    app_metadata: {
      ...existingIdentity.app_metadata,
      customer_id: customer.id,
    },
  })
  console.log("[create-with-existing-identity] linked customer_id:", customer.id, "to auth identity:", existingIdentity.id)

  // ── Return final JWT token with customer actor ─────────────────────────────
  const jwt        = await import("jsonwebtoken")
  const finalToken = jwt.default.sign(
    {
      actor_id:         customer.id,
      actor_type:       "customer",
      auth_identity_id: existingIdentity.id,
      app_metadata: {
        ...existingIdentity.app_metadata,
        customer_id: customer.id,
      },
    },
    jwtSecret,
    { expiresIn: "30d" }
  )

  return res.json({ token: finalToken, customer })
}
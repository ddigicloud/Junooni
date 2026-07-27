import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /customers/google-link
 *
 * Called from Google callback when a customer who registered with emailpass
 * tries to sign in with Google. Links both identities to the same customer.
 *
 * Medusa convention for customers:
 *   app_metadata.customer_id = customer.id
 *   JWT actor_id = app_metadata.customer_id
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email: string }

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)

  const allIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  // ── Find Google identity (from Bearer token) ──────────────────────────────
  const googleIdentity = allIdentities.find(identity =>
    identity.provider_identities?.some(pi => {
      if (pi.provider === "emailpass") return false
      const piEmail = (pi.user_metadata as any)?.email || ""
      return piEmail.toLowerCase() === email.toLowerCase()
    })
  )

  console.log("[customers/google-link] googleIdentity:", googleIdentity?.id, "app_metadata:", googleIdentity?.app_metadata)

  // ── Find existing emailpass identity for this email ───────────────────────
  const emailpassIdentity = allIdentities.find(identity =>
    identity.provider_identities?.some(
      pi => pi.provider === "emailpass" &&
            pi.entity_id?.toLowerCase() === email.toLowerCase()
    )
  )

  console.log("[customers/google-link] emailpassIdentity:", emailpassIdentity?.id, "app_metadata:", emailpassIdentity?.app_metadata)

  if (!emailpassIdentity) {
    return res.status(404).json({
      message: "No existing emailpass account found for this email.",
      isNewCustomer: true,
    })
  }

  // Medusa stores customer.id in app_metadata.customer_id for customers
  const customerId = emailpassIdentity.app_metadata?.customer_id || ""

  console.log("[customers/google-link] customer_id:", customerId)

  if (!customerId) {
    return res.status(404).json({
      message: "Emailpass account exists but customer record not found.",
      isNewCustomer: true,
    })
  }

  // ── Link Google identity → same customer ──────────────────────────────────
  if (googleIdentity) {
    await authModuleService.updateAuthIdentities({
      id:           googleIdentity.id,
      app_metadata: {
        ...googleIdentity.app_metadata,
        customer_id: customerId,  // Medusa reads this to set actor_id in JWT
      },
    })
    console.log("[customers/google-link] patched Google identity customer_id:", customerId)
  }

  // ── Generate fresh JWT with customer_id in app_metadata ───────────────────
  const configModule = req.scope.resolve("configModule")
  const jwtSecret    = configModule?.projectConfig?.http?.jwtSecret || "supersecret"

  const jwt   = await import("jsonwebtoken")
  const token = jwt.default.sign(
    {
      actor_id:         customerId,       // = customer.id
      actor_type:       "customer",
      auth_identity_id: googleIdentity?.id || emailpassIdentity.id,
      app_metadata: {
        customer_id: customerId,          // Medusa convention
      },
    },
    jwtSecret,
    { expiresIn: "30d" }
  )

  return res.json({
    token,
    isNewCustomer: false,
    message: "Google account linked to existing customer successfully.",
  })
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

/**
 * POST /admin/impersonate-incomplete
 * Body: { auth_identity_id: string }
 *
 * For vendors who registered but never completed onboarding.
 * They have an auth_identity but no vendor_admin record yet.
 * We sign a JWT that looks like a fresh unregistered vendor token
 * so the vendor dashboard drops them into onboarding.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { auth_identity_id } = req.body as { auth_identity_id: string }

  if (!auth_identity_id) {
    return res.status(400).json({ message: "auth_identity_id is required" })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET not configured on server" })
  }

  // Fetch the auth identity to get the email
  const authModuleService = req.scope.resolve(Modules.AUTH)
  const authIdentities = await authModuleService.listAuthIdentities(
    { id: [auth_identity_id] },
    { relations: ["provider_identities"] }
  )

  if (!authIdentities || authIdentities.length === 0) {
    return res.status(404).json({ message: "Auth identity not found" })
  }

  const identity = authIdentities[0]
  const email = identity.provider_identities?.[0]?.entity_id

  // Sign a token that matches what a freshly registered vendor would get.
  // actor_id is empty string because no vendor_admin exists yet —
  // this is exactly what the sign-in page checks with decodeTokenAndCheckActorId()
  // to decide: hasActorId = false → redirect to onboarding.
  const payload = {
    actor_id: "",              // empty = no vendor_admin yet = goes to onboarding
    actor_type: "vendor",
    auth_identity_id,
    app_metadata: {},          // no vendor_id yet
    impersonated_by_admin: true,
    // email in app_metadata so the onboarding form can be pre-filled
    email,
  }

  const token = jwt.sign(payload, secret, { expiresIn: "2h" })

  return res.json({
    token,
    email,
    expires_in: 7200,
  })
}
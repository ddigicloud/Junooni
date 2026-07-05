import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

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

  let hasEmailpass = false
  let hasGoogle    = false
  let isLinked     = false

  for (const identity of allIdentities) {
    for (const pi of identity.provider_identities || []) {
      const isEmailMatch =
        pi.provider === "emailpass"
          ? pi.entity_id?.toLowerCase() === email.toLowerCase()
          : ((pi.user_metadata as any)?.email || "").toLowerCase() === email.toLowerCase()

      if (!isEmailMatch) continue

      if (pi.provider === "emailpass") {
        hasEmailpass = true
        if (identity.app_metadata?.vendor_id) isLinked = true
      } else if (pi.provider === "google-vendor" || pi.provider === "google") {
        hasGoogle = true
      }
    }
  }

  console.log("[check-email]", email, "→ hasEmailpass:", hasEmailpass, "hasGoogle:", hasGoogle, "isLinked:", isLinked)

  // Case 1: New user
  if (!hasEmailpass && !hasGoogle) {
    return res.json({ exists: false })
  }

  // Case 2: Google only (no emailpass) → OTP flow to add password login
  if (!hasEmailpass && hasGoogle) {
    return res.json({ exists: true, provider: "google", isLinked: false, hasGoogle: true })
  }

  // Case 3: Emailpass only, no Google → "sign in or reset password", no OTP
  if (hasEmailpass && !hasGoogle) {
    return res.json({ exists: true, provider: "emailpass", isLinked: false, hasGoogle: false })
  }

  // Case 4: Both emailpass + Google, fully linked → "account exists, sign in with either"
  if (hasEmailpass && hasGoogle && isLinked) {
    return res.json({ exists: true, provider: "emailpass", isLinked: true, hasGoogle: true })
  }

  // Case 5: Both emailpass + Google, NOT linked yet → OTP to finish linking
  // (edge case: shouldn't normally happen since linking always sets isLinked)
  // But if it does — treat same as Case 4, no more OTP needed
  // Google button on sign-up page handles Google auth separately
  return res.json({ exists: true, provider: "emailpass", isLinked: true, hasGoogle: true })
}
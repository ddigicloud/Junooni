import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { VENDOR_OTP_MODULE } from "../../../modules/otp"
import crypto from "crypto"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email: string }

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  const authModuleService  = req.scope.resolve(Modules.AUTH)
  const notificationModule = req.scope.resolve(Modules.NOTIFICATION)
  const otpService         = req.scope.resolve(VENDOR_OTP_MODULE)

  // ── Confirm a Google identity exists for this email ───────────────────────
  const allIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  const googleIdentity = allIdentities.find(identity =>
    identity.provider_identities?.some(pi => {
      if (pi.provider === "emailpass") return false
      const piEmail = (pi.user_metadata as any)?.email || ""
      return piEmail.toLowerCase() === email.toLowerCase()
    })
  )

  if (!googleIdentity) {
    return res.status(404).json({
      message: "No existing Google account found for this email.",
      isNewVendor: true,
    })
  }

  // ── Invalidate previous unused OTPs ──────────────────────────────────────
  try {
    const existing = await otpService.listVendorOtps({ email, used: false })
    for (const old of existing) {
      await otpService.updateVendorOtps({ id: old.id, used: true })
    }
  } catch (_) {}

  // ── Generate and store OTP ────────────────────────────────────────────────
  const otp        = String(crypto.randomInt(100000, 999999))
  const expires_at = new Date(Date.now() + 10 * 60 * 1000)

  await otpService.createVendorOtps({ email, otp, expires_at, used: false })

  // ── Get first name from Google profile ───────────────────────────────────
  const googlePi   = googleIdentity.provider_identities?.find(pi => pi.provider !== "emailpass")
  const first_name = (googlePi?.user_metadata as any)?.given_name ||
                     (googlePi?.user_metadata as any)?.name?.split(" ")[0] || ""

  // ── Send via Resend ───────────────────────────────────────────────────────
  await notificationModule.createNotifications({
    to:       email,
    channel:  "email",
    template: "creator-otp",
    data:     { email, otp, first_name },
  })

  return res.json({ message: "OTP sent successfully" })
}
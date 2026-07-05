import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VENDOR_OTP_MODULE } from "../../../modules/otp"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, otp, password } = req.body as {
    email: string
    otp: string
    password: string
  }

  if (!email || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP and password are required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const otpService        = req.scope.resolve(VENDOR_OTP_MODULE)
  const query             = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ── Step 1: Validate OTP ──────────────────────────────────────────────────
  const otpRecords = await otpService.listVendorOtps({ email, used: false })
  const validOtp   = otpRecords.find(r =>
    new Date(r.expires_at) > new Date() && r.otp === otp.trim()
  )

  if (!validOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP. Please try again." })
  }

  await otpService.updateVendorOtps({ id: validOtp.id, used: true })

  // ── Step 2: Find Google auth identity for this email ──────────────────────
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

  console.log("[verify-otp] Google identity app_metadata:", googleIdentity?.app_metadata)

  // ── Step 3: Resolve vendor_admin by email (most reliable) ─────────────────
  // In this app: app_metadata.vendor_id = vendor_admin.id (actor_id)
  // The actual vendor.id comes from vendor_admin.vendor_id
  let vendorAdminId = ""  // = actor_id = what Medusa puts in token's actor_id
  let realVendorId  = ""  // = actual vendor.id
  let isNewVendor   = true

  try {
    const { data: admins } = await query.graph({
      entity: "vendor_admin",
      fields: ["id", "vendor_id", "email"],
      filters: { email: email.toLowerCase() },
    })

    console.log("[verify-otp] vendor_admins by email:", admins)

    const admin = (admins as any[])[0]
    if (admin) {
      vendorAdminId = admin.id          // this is actor_id
      realVendorId  = admin.vendor_id   // this is actual vendor.id

      const { data: [vendor] } = await query.graph({
        entity: "vendor",
        fields: ["id", "handle"],
        filters: { id: admin.vendor_id },
      })

      console.log("[verify-otp] vendor:", vendor)
      isNewVendor = !vendor?.handle
    }
  } catch (e) {
    console.warn("[verify-otp] vendor_admin lookup failed:", e)
  }

  console.log("[verify-otp] vendorAdminId (actor_id):", vendorAdminId, "| realVendorId:", realVendorId, "| isNewVendor:", isNewVendor)

  // ── Step 4: Register or authenticate emailpass identity ───────────────────
  let emailpassIdentityId: string | null = null

  const registerRes = await authModuleService.register("emailpass", {
    body: { email, password },
    authIdentityServiceInitialized: false,
  } as any) as any

  console.log("[verify-otp] register result:", JSON.stringify(registerRes))

  if (registerRes?.success !== false && registerRes?.authIdentity?.id) {
    emailpassIdentityId = registerRes.authIdentity.id
  } else {
    const authRes = await authModuleService.authenticate("emailpass", {
      body: { email, password },
      authIdentityServiceInitialized: false,
    } as any) as any

    console.log("[verify-otp] authenticate result:", JSON.stringify(authRes))

    if (!authRes?.success) {
      return res.status(401).json({ message: "Incorrect password. Please try again." })
    }
    emailpassIdentityId = authRes?.authIdentity?.id || null
  }

  if (!emailpassIdentityId) {
    return res.status(500).json({ message: "Could not resolve emailpass identity." })
  }

  // ── Step 5: Store app_metadata on emailpass identity ─────────────────────
  // IMPORTANT: Match your existing convention where:
  //   app_metadata.vendor_id = vendor_admin.id (what Medusa uses as actor_id in JWT)
  // This is how your Google identity is set up and how /vendors/me resolves the vendor.
  if (vendorAdminId) {
    await authModuleService.updateAuthIdentities({
      id:           emailpassIdentityId,
      app_metadata: {
        vendor_id: vendorAdminId,  // = vendor_admin.id → Medusa puts this in JWT actor_id
      },
    })
    console.log("[verify-otp] emailpass identity app_metadata set → vendor_id (actor_id):", vendorAdminId)
  }

  // ── Step 6: Generate JWT matching Medusa's convention ────────────────────
  // actor_id = vendor_admin.id (same as app_metadata.vendor_id in your setup)
  const configModule = req.scope.resolve("configModule")
  const jwtSecret    = configModule?.projectConfig?.http?.jwtSecret || "supersecret"

  const jwt   = await import("jsonwebtoken")
  const token = jwt.default.sign(
    {
      actor_id:         vendorAdminId,   // vendor_admin.id
      actor_type:       "vendor",
      auth_identity_id: emailpassIdentityId,
      app_metadata: {
        vendor_id: vendorAdminId,        // matches your convention
      },
    },
    jwtSecret,
    { expiresIn: "30d" }
  )

  return res.json({ token, isNewVendor })
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /vendors/link-emailpass
 *
 * Called when a creator who signed up with Google tries to register
 * again using the email/password form with the same email.
 *
 * Flow:
 * 1. Register a new emailpass identity for this email+password
 * 2. Find the existing auth identity (Google) for this email
 * 3. Merge: copy actor_id + app_metadata from Google identity → new emailpass token
 * 4. Return a valid token + whether onboarding is complete
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const query = req.scope.resolve("query")

  try {
    // ── Step 1: Try to register emailpass identity ─────────────────────────
    // This will succeed (creates new emailpass provider_identity) OR
    // fail if emailpass already exists for this email too.
    let emailpassToken: string | null = null

    try {
      const registerRes = await authModuleService.register("emailpass", {
        body: { email, password },
        authIdentityServiceInitialized: false,
      } as any)

      emailpassToken = registerRes?.token || null
    } catch (registerErr: any) {
      // emailpass identity might already exist (creator tried form before)
      // Try to authenticate instead
      try {
        const authRes = await authModuleService.authenticate("emailpass", {
          body: { email, password },
          authIdentityServiceInitialized: false,
        } as any)

        if (!authRes.success) {
          // Wrong password for existing emailpass identity
          return res.status(401).json({ message: "Invalid password for this account." })
        }
        emailpassToken = authRes.token || null
      } catch {
        return res.status(401).json({ message: "Could not authenticate with provided credentials." })
      }
    }

    if (!emailpassToken) {
      return res.status(500).json({ message: "Failed to generate token." })
    }

    // ── Step 2: Find the existing Google auth identity for this email ───────
    const allIdentities = await authModuleService.listAuthIdentities(
      {},
      { relations: ["provider_identities"] }
    )

    const googleIdentity = allIdentities.find(identity => {
      return identity.provider_identities?.some(pi => {
        if (pi.provider === "emailpass") return false
        const piEmail = (pi.user_metadata as any)?.email || ""
        return piEmail.toLowerCase() === email.toLowerCase()
      })
    })

    if (!googleIdentity) {
      // No Google identity found — this email truly doesn't exist yet
      // Return 404 so the frontend falls back to normal error handling
      return res.status(404).json({
        message: "No existing account found for this email.",
        isNewVendor: true,
      })
    }

    // ── Step 3: Check if Google vendor completed onboarding ─────────────────
    const vendorId = googleIdentity.app_metadata?.vendor_id
    let isNewVendor = true

    if (vendorId) {
      const { data: vendors } = await query.graph({
        entity: "vendor",
        fields: ["id", "handle"],
      })
      const vendor = (vendors as any[]).find(v => v.id === vendorId)
      isNewVendor = !vendor?.handle
    }

    // ── Step 4: Build a token carrying the Google vendor's actor_id ─────────
    // Decode the emailpass token, then re-issue with the correct actor_id
    // by authenticating via the Google identity's token approach.
    // Simplest: return the emailpass token but also patch app_metadata so
    // future /vendors/me calls work correctly.
    //
    // If Google identity has a vendor_id, copy it to the emailpass identity's
    // auth_identity so both point to the same vendor.
    if (vendorId) {
      // Find the emailpass auth identity that was just created/authenticated
      const emailpassIdentities = await authModuleService.listAuthIdentities(
        {},
        { relations: ["provider_identities"] }
      )

      const emailpassIdentity = emailpassIdentities.find(identity =>
        identity.provider_identities?.some(
          pi => pi.provider === "emailpass" &&
          pi.entity_id?.toLowerCase() === email.toLowerCase()
        )
      )

      if (emailpassIdentity && emailpassIdentity.id !== googleIdentity.id) {
        // Update the emailpass auth identity to point to the same vendor
        await authModuleService.updateAuthIdentities({
          id: emailpassIdentity.id,
          app_metadata: {
            ...emailpassIdentity.app_metadata,
            vendor_id: vendorId,
            actor_id: googleIdentity.app_metadata?.actor_id,
          },
        })
      }
    }

    return res.json({
      token: emailpassToken,
      isNewVendor,
      message: isNewVendor
        ? "Account linked. Please complete onboarding."
        : "Account linked. Welcome back!",
    })

  } catch (error: any) {
    console.error("[link-emailpass] error:", error)
    return res.status(500).json({ message: "Failed to link account. Please try again." })
  }
}
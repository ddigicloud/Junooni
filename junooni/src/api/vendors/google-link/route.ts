// FILE: src/api/vendors/google-link/route.ts

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"

// ─── Route handler ────────────────────────────────────────────────────────────
type RequestBody = {
  email: string
}

export async function POST(
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) {
  try {
    const googleAuthIdentityId = req.auth_context?.auth_identity_id

    if (!googleAuthIdentityId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "No Google auth identity found in request"
      )
    }

    const email = req.body?.email?.toLowerCase().trim()

    if (!email) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Email is required to link accounts"
      )
    }

    const authModuleService = req.scope.resolve(Modules.AUTH)

    // Find all auth identities with their provider_identities
    const existingIdentities = await authModuleService.listAuthIdentities(
      {},
      { relations: ["provider_identities"] }
    )

    // Find one where emailpass entity_id matches email AND has vendor_id
    const vendorIdentity = existingIdentities.find((identity) => {
      const hasMatchingEmail = identity.provider_identities?.some(
        (pi) =>
          pi.provider === "emailpass" &&
          pi.entity_id?.toLowerCase() === email
      )
      const hasVendorId = !!(identity.app_metadata as any)?.vendor_id
      return hasMatchingEmail && hasVendorId
    })

    if (!vendorIdentity) {
      return res.status(404).json({
        success: false,
        isNewVendor: true,
        message: "No existing vendor account found for this email",
      })
    }

    const vendorId = (vendorIdentity.app_metadata as any)?.vendor_id as string

    // Directly update the Google auth identity to link it to the vendor
    // Using updateAuthIdentities only — avoids setAuthAppMetadataStep conflict
    await authModuleService.updateAuthIdentities([
      {
        id: googleAuthIdentityId,
        app_metadata: {
          vendor_id: vendorId,
          actor_type: "vendor",
        },
      },
    ])

    // Generate fresh token — now includes vendor_id in app_metadata
    const token = await authModuleService.generateJwtToken(
      googleAuthIdentityId,
      "vendor"
    )

    return res.status(200).json({
      success: true,
      token,
      message: "Google account successfully linked",
    })
  } catch (error: any) {
    if (error instanceof MedusaError) {
      const status =
        error.type === MedusaError.Types.UNAUTHORIZED ? 401 :
        error.type === MedusaError.Types.NOT_FOUND ? 404 : 400
      return res.status(status).json({ success: false, message: error.message })
    }
    console.error("Google link error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to link accounts. Please try again.",
    })
  }
}
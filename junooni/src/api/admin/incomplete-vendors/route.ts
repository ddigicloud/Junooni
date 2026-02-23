import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const authModuleService = req.scope.resolve(Modules.AUTH)
  
  // List all auth identities for your vendor actor type
  const authIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  // Filter: ones that registered but never completed vendor creation
  // app_metadata will be empty {} or missing vendor_id if onboarding incomplete
  const incomplete = authIdentities
    .filter(identity => {
      const hasVendorId = identity.app_metadata?.vendor_id
      return !hasVendorId
    })
    .map(identity => ({
      email: identity.provider_identities?.[0]?.entity_id,
      created_at: identity.created_at,
      auth_identity_id: identity.id,
    }))
    .filter(i => i.email) // ensure email exists

  res.json({ incomplete_signups: incomplete, count: incomplete.length })
}
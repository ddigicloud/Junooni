// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { Modules } from "@medusajs/framework/utils"

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const authModuleService = req.scope.resolve(Modules.AUTH)
  
//   const authIdentities = await authModuleService.listAuthIdentities(
//     {},
//     { relations: ["provider_identities"] }
//   )

//   const incomplete = authIdentities
//     .filter(identity => {
//       const hasVendorId = identity.app_metadata?.vendor_id
//       return !hasVendorId
//     })
//     .map(identity => {
//       const providerIdentity = identity.provider_identities?.[0]
//       const provider = providerIdentity?.provider || ''

//       // emailpass stores email as entity_id
//       // Google/OAuth stores a numeric ID as entity_id, email is in user_metadata
//       let email = ''
//       if (provider === 'emailpass') {
//         email = providerIdentity?.entity_id || ''
//       } else {
//         // Google, GitHub etc — email is in user_metadata
//         email = (providerIdentity?.user_metadata as any)?.email || 
//                 providerIdentity?.entity_id || ''
//       }

//       return {
//         email,
//         provider,
//         created_at: identity.created_at,
//         auth_identity_id: identity.id,
//       }
//     })
//     .filter(i => i.email) // only include if we found an email

//   res.json({ incomplete_signups: incomplete, count: incomplete.length })
// }

// export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { auth_identity_id } = req.body as { auth_identity_id: string }

//   if (!auth_identity_id) {
//     return res.status(400).json({ message: "auth_identity_id is required" })
//   }

//   const authModuleService = req.scope.resolve(Modules.AUTH)

//   try {
//     const [identity] = await authModuleService.listAuthIdentities(
//       { id: auth_identity_id },
//       { relations: ["provider_identities"] }
//     )

//     if (!identity) {
//       return res.status(404).json({ message: "Auth identity not found" })
//     }

//     if (identity.app_metadata?.vendor_id) {
//       return res.status(400).json({ 
//         message: "This vendor has completed onboarding. Use the vendor delete endpoint instead." 
//       })
//     }

//     await authModuleService.deleteAuthIdentities(auth_identity_id)

//     return res.json({ 
//       message: "Incomplete signup deleted successfully",
//       auth_identity_id 
//     })
//   } catch (error) {
//     console.error("Error deleting incomplete signup:", error)
//     return res.status(500).json({ message: "Failed to delete incomplete signup" })
//   }
// }





import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const authModuleService = req.scope.resolve(Modules.AUTH)
  const query = req.scope.resolve("query")

  // Fetch ALL vendors that have a handle (truly completed onboarding)
  // Also fetch their admin emails so we can cross-reference by email
  const { data: vendors } = await query.graph({
    entity: "vendor",
    fields: ["id", "handle", "admins.email"],
  })

  // Build two sets for fast lookup:
  // 1. vendor IDs that are fully onboarded (have a handle)
  // 2. admin emails that belong to fully onboarded vendors
  const onboardedVendorIds = new Set<string>()
  const onboardedEmails = new Set<string>()

  for (const vendor of vendors as any[]) {
    if (!vendor.handle) continue // skip vendors without handle = not fully onboarded
    onboardedVendorIds.add(vendor.id)
    for (const admin of vendor.admins || []) {
      if (admin.email) onboardedEmails.add(admin.email.toLowerCase())
    }
  }

  // Fetch all auth identities
  const authIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  const incomplete = authIdentities
    .filter(identity => {
      const vendorId = identity.app_metadata?.vendor_id

      // Check 1: vendor_id points to a fully onboarded vendor → exclude
      if (vendorId && onboardedVendorIds.has(vendorId)) return false

      // Check 2: cross-reference by email → exclude if this email is an admin of any onboarded vendor
      const providerIdentity = identity.provider_identities?.[0]
      const provider = providerIdentity?.provider || ''
      let email = ''
      if (provider === 'emailpass') {
        email = providerIdentity?.entity_id || ''
      } else {
        email = (providerIdentity?.user_metadata as any)?.email ||
                providerIdentity?.entity_id || ''
      }

      if (email && onboardedEmails.has(email.toLowerCase())) return false

      // Passed both checks → genuinely incomplete
      return true
    })
    .map(identity => {
      const providerIdentity = identity.provider_identities?.[0]
      const provider = providerIdentity?.provider || ''

      let email = ''
      if (provider === 'emailpass') {
        email = providerIdentity?.entity_id || ''
      } else {
        email = (providerIdentity?.user_metadata as any)?.email ||
                providerIdentity?.entity_id || ''
      }

      return {
        email,
        provider,
        created_at: identity.created_at,
        auth_identity_id: identity.id,
      }
    })
    .filter(i => i.email)

  res.json({ incomplete_signups: incomplete, count: incomplete.length })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { auth_identity_id } = req.body as { auth_identity_id: string }

  if (!auth_identity_id) {
    return res.status(400).json({ message: "auth_identity_id is required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const query = req.scope.resolve("query")

  try {
    const [identity] = await authModuleService.listAuthIdentities(
      { id: auth_identity_id },
      { relations: ["provider_identities"] }
    )

    if (!identity) {
      return res.status(404).json({ message: "Auth identity not found" })
    }

    const vendorId = identity.app_metadata?.vendor_id

    if (vendorId) {
      // Fetch vendor and check if it has a handle
      const { data: vendors } = await query.graph({
        entity: "vendor",
        fields: ["id", "handle"],
      })

      const vendor = (vendors as any[]).find(v => v.id === vendorId)

      if (vendor?.handle) {
        // Truly onboarded — block deletion
        return res.status(400).json({
          message: "This vendor has completed onboarding. Use the vendor delete endpoint instead."
        })
      }

      // Has vendor_id but no handle = stuck mid-onboarding
      // Try to clean up the orphaned vendor record
      try {
        const vendorModuleService = req.scope.resolve("vendor")
        if (vendorModuleService?.deleteVendors) {
          await vendorModuleService.deleteVendors(vendorId)
        }
      } catch (vendorDeleteErr) {
        console.warn("Could not delete orphaned vendor record:", vendorDeleteErr)
      }
    }

    await authModuleService.deleteAuthIdentities(auth_identity_id)

    return res.json({
      message: "Incomplete signup deleted successfully",
      auth_identity_id
    })
  } catch (error) {
    console.error("Error deleting incomplete signup:", error)
    return res.status(500).json({ message: "Failed to delete incomplete signup" })
  }
}
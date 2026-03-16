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
//     .map(identity => ({
//       email: identity.provider_identities?.[0]?.entity_id,
//       created_at: identity.created_at,
//       auth_identity_id: identity.id,
//     }))
//     .filter(i => i.email)

//   res.json({ incomplete_signups: incomplete, count: incomplete.length })
// }

// export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { auth_identity_id } = req.body as { auth_identity_id: string }

//   if (!auth_identity_id) {
//     return res.status(400).json({ message: "auth_identity_id is required" })
//   }

//   const authModuleService = req.scope.resolve(Modules.AUTH)

//   try {
//     // Verify it exists and is truly incomplete (no vendor_id) before deleting
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
  
  const authIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  const incomplete = authIdentities
    .filter(identity => {
      const hasVendorId = identity.app_metadata?.vendor_id
      return !hasVendorId
    })
    .map(identity => {
      const providerIdentity = identity.provider_identities?.[0]
      const provider = providerIdentity?.provider || ''

      // emailpass stores email as entity_id
      // Google/OAuth stores a numeric ID as entity_id, email is in user_metadata
      let email = ''
      if (provider === 'emailpass') {
        email = providerIdentity?.entity_id || ''
      } else {
        // Google, GitHub etc — email is in user_metadata
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
    .filter(i => i.email) // only include if we found an email

  res.json({ incomplete_signups: incomplete, count: incomplete.length })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { auth_identity_id } = req.body as { auth_identity_id: string }

  if (!auth_identity_id) {
    return res.status(400).json({ message: "auth_identity_id is required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)

  try {
    const [identity] = await authModuleService.listAuthIdentities(
      { id: auth_identity_id },
      { relations: ["provider_identities"] }
    )

    if (!identity) {
      return res.status(404).json({ message: "Auth identity not found" })
    }

    if (identity.app_metadata?.vendor_id) {
      return res.status(400).json({ 
        message: "This vendor has completed onboarding. Use the vendor delete endpoint instead." 
      })
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


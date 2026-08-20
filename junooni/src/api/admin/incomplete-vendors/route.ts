// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { Modules } from "@medusajs/framework/utils"

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const authModuleService = req.scope.resolve(Modules.AUTH)
//   const query             = req.scope.resolve("query")

//   const authIdentities = await authModuleService.listAuthIdentities(
//     {},
//     { relations: ["provider_identities"] }
//   )

//   // Get all vendors with a handle = truly completed onboarding
//   const { data: vendors } = await query.graph({
//     entity: "vendor",
//     fields: ["id", "handle", "admins.email"],
//   })

//   const onboardedVendorIds = new Set<string>()
//   const onboardedEmails    = new Set<string>()

//   for (const vendor of vendors as any[]) {
//     if (!vendor.handle) continue
//     onboardedVendorIds.add(vendor.id)
//     for (const admin of vendor.admins || []) {
//       if (admin.email) onboardedEmails.add(admin.email.toLowerCase())
//     }
//   }

//   // Build raw incomplete list
//   const raw = authIdentities
//     .filter(identity => {
//       const vendorId = identity.app_metadata?.vendor_id
//       if (vendorId && onboardedVendorIds.has(vendorId)) return false

//       const providerIdentity = identity.provider_identities?.[0]
//       const provider = providerIdentity?.provider || ''
//       let email = ''
//       if (provider === 'emailpass') {
//         email = providerIdentity?.entity_id || ''
//       } else {
//         email = (providerIdentity?.user_metadata as any)?.email ||
//                 providerIdentity?.entity_id || ''
//       }

//       if (email && onboardedEmails.has(email.toLowerCase())) return false
//       return true
//     })
//     .map(identity => {
//       const providerIdentity = identity.provider_identities?.[0]
//       const provider = providerIdentity?.provider || ''

//       let email = ''
//       if (provider === 'emailpass') {
//         email = providerIdentity?.entity_id || ''
//       } else {
//         email = (providerIdentity?.user_metadata as any)?.email ||
//                 providerIdentity?.entity_id || ''
//       }

//       return {
//         email:           email.toLowerCase(),
//         provider,
//         created_at:      identity.created_at,
//         auth_identity_id: identity.id,
//       }
//     })
//     .filter(i => i.email)

//   // ── Deduplicate by email — keep the most recent entry per email ────────────
//   const emailMap = new Map<string, typeof raw[0]>()

//   for (const entry of raw) {
//     const existing = emailMap.get(entry.email)
//     if (!existing) {
//       emailMap.set(entry.email, entry)
//     } else {
//       // Keep whichever was created more recently
//       const existingDate = new Date(existing.created_at).getTime()
//       const entryDate    = new Date(entry.created_at).getTime()
//       if (entryDate > existingDate) {
//         emailMap.set(entry.email, entry)
//       }
//     }
//   }

//   const incomplete = Array.from(emailMap.values())
//     .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

//   res.json({ incomplete_signups: incomplete, count: incomplete.length })
// }

// export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { auth_identity_id } = req.body as { auth_identity_id: string }

//   if (!auth_identity_id) {
//     return res.status(400).json({ message: "auth_identity_id is required" })
//   }

//   const authModuleService = req.scope.resolve(Modules.AUTH)
//   const query             = req.scope.resolve("query")

//   try {
//     const [identity] = await authModuleService.listAuthIdentities(
//       { id: auth_identity_id },
//       { relations: ["provider_identities"] }
//     )

//     if (!identity) {
//       return res.status(404).json({ message: "Auth identity not found" })
//     }

//     const vendorId = identity.app_metadata?.vendor_id

//     if (vendorId) {
//       const { data: vendors } = await query.graph({
//         entity: "vendor",
//         fields: ["id", "handle"],
//       })
//       const vendor = (vendors as any[]).find(v => v.id === vendorId)
//       if (vendor?.handle) {
//         return res.status(400).json({
//           message: "This vendor has completed onboarding. Use the vendor delete endpoint instead."
//         })
//       }

//       // Orphaned vendor record — clean it up
//       try {
//         const vendorModuleService = req.scope.resolve("marketplaceModuleService")
//         if (vendorModuleService?.deleteVendors) {
//           await vendorModuleService.deleteVendors(vendorId)
//         }
//       } catch (e) {
//         console.warn("Could not delete orphaned vendor record:", e)
//       }
//     }

//     // Also delete ALL auth identities with the same email (cleanup duplicates)
//     const providerIdentity = identity.provider_identities?.[0]
//     const provider = providerIdentity?.provider || ''
//     let email = ''
//     if (provider === 'emailpass') {
//       email = providerIdentity?.entity_id || ''
//     } else {
//       email = (providerIdentity?.user_metadata as any)?.email || ''
//     }

//     if (email) {
//       const allIdentities = await authModuleService.listAuthIdentities(
//         {},
//         { relations: ["provider_identities"] }
//       )

//       const duplicates = allIdentities.filter(id => {
//         if (id.id === auth_identity_id) return false // already deleting this one
//         if (id.app_metadata?.vendor_id) return false // skip onboarded ones
//         return id.provider_identities?.some(pi => {
//           const piEmail = pi.provider === 'emailpass'
//             ? pi.entity_id || ''
//             : (pi.user_metadata as any)?.email || ''
//           return piEmail.toLowerCase() === email.toLowerCase()
//         })
//       })

//       for (const dup of duplicates) {
//         try {
//           await authModuleService.deleteAuthIdentities(dup.id)
//         } catch (e) {
//           console.warn("Could not delete duplicate identity:", dup.id, e)
//         }
//       }
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
  const query             = req.scope.resolve("query")

  const authIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  // Get all vendors with a handle = truly completed onboarding
  const { data: vendors } = await query.graph({
    entity: "vendor",
    fields: ["id", "handle", "admins.email"],
  })

  const onboardedVendorIds = new Set<string>()
  const onboardedEmails    = new Set<string>()

  for (const vendor of vendors as any[]) {
    if (!vendor.handle) continue
    onboardedVendorIds.add(vendor.id)
    for (const admin of vendor.admins || []) {
      if (admin.email) onboardedEmails.add(admin.email.toLowerCase())
    }
  }

  // Fetch all registered customer emails to exclude them
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const customers = await customerModuleService.listCustomers(
    { has_account: true },
    { select: ["email"] }
  )
  const customerEmails = new Set(
    customers.map((c: any) => c.email?.toLowerCase()).filter(Boolean)
  )

  // Build raw incomplete list
  const raw = authIdentities
    .filter(identity => {
      // Fix 1: cast vendorId to string before passing to Set.has()
      const vendorId = identity.app_metadata?.vendor_id as string | undefined
      if (vendorId && onboardedVendorIds.has(vendorId)) return false

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

      // Skip if this email belongs to a regular customer
      if (email && customerEmails.has(email.toLowerCase())) return false

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
        email:            email.toLowerCase(),
        provider,
        // Fix 2: AuthIdentityDTO has no created_at — read from provider_identities metadata
        // or fall back to a string cast from app_metadata
        created_at:       (identity as any).created_at as string ?? new Date().toISOString(),
        auth_identity_id: identity.id,
      }
    })
    .filter(i => i.email)

  // Deduplicate by email — keep the most recent entry per email
  const emailMap = new Map<string, typeof raw[0]>()

  for (const entry of raw) {
    const existing = emailMap.get(entry.email)
    if (!existing) {
      emailMap.set(entry.email, entry)
    } else {
      const existingDate = new Date(existing.created_at).getTime()
      const entryDate    = new Date(entry.created_at).getTime()
      if (entryDate > existingDate) {
        emailMap.set(entry.email, entry)
      }
    }
  }

  const incomplete = Array.from(emailMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({ incomplete_signups: incomplete, count: incomplete.length })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { auth_identity_id } = req.body as { auth_identity_id: string }

  if (!auth_identity_id) {
    return res.status(400).json({ message: "auth_identity_id is required" })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const query             = req.scope.resolve("query")

  try {
    // Fix 3: listAuthIdentities filter id expects string[] not string
    const identities = await authModuleService.listAuthIdentities(
      { id: [auth_identity_id] },
      { relations: ["provider_identities"] }
    )
    const identity = identities[0]

    if (!identity) {
      return res.status(404).json({ message: "Auth identity not found" })
    }

    // Fix 4: cast vendorId to string
    const vendorId = identity.app_metadata?.vendor_id as string | undefined

    if (vendorId) {
      const { data: vendors } = await query.graph({
        entity: "vendor",
        fields: ["id", "handle"],
      })
      const vendor = (vendors as any[]).find(v => v.id === vendorId)
      if (vendor?.handle) {
        return res.status(400).json({
          message: "This vendor has completed onboarding. Use the vendor delete endpoint instead."
        })
      }

      // Orphaned vendor record — clean it up
      try {
        const vendorModuleService = req.scope.resolve("marketplaceModuleService")
        if (vendorModuleService?.deleteVendors) {
          // Fix 4: cast vendorId to string to satisfy type
          await vendorModuleService.deleteVendors(vendorId as string)
        }
      } catch (e) {
        console.warn("Could not delete orphaned vendor record:", e)
      }
    }

    // Also delete ALL auth identities with the same email (cleanup duplicates)
    const providerIdentity = identity.provider_identities?.[0]
    const provider = providerIdentity?.provider || ''
    let email = ''
    if (provider === 'emailpass') {
      email = providerIdentity?.entity_id || ''
    } else {
      email = (providerIdentity?.user_metadata as any)?.email || ''
    }

    if (email) {
      const allIdentities = await authModuleService.listAuthIdentities(
        {},
        { relations: ["provider_identities"] }
      )

      const duplicates = allIdentities.filter(id => {
        if (id.id === auth_identity_id) return false
        if (id.app_metadata?.vendor_id) return false
        return id.provider_identities?.some(pi => {
          const piEmail = pi.provider === 'emailpass'
            ? pi.entity_id || ''
            : (pi.user_metadata as any)?.email || ''
          return piEmail.toLowerCase() === email.toLowerCase()
        })
      })

      for (const dup of duplicates) {
        try {
          // Fix 5: deleteAuthIdentities expects string[]
          await authModuleService.deleteAuthIdentities([dup.id])
        } catch (e) {
          console.warn("Could not delete duplicate identity:", dup.id, e)
        }
      }
    }

    // Fix 5: deleteAuthIdentities expects string[]
    await authModuleService.deleteAuthIdentities([auth_identity_id])

    return res.json({
      message: "Incomplete signup deleted successfully",
      auth_identity_id
    })
  } catch (error) {
    console.error("Error deleting incomplete signup:", error)
    return res.status(500).json({ message: "Failed to delete incomplete signup" })
  }
}
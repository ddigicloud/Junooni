// src/api/store-front/by-domain/route.ts
// GET /store-front/by-domain?domain=sunozara.store
// Returns { handle } for a given custom domain — used by middleware for routing

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const domain = (req.query.domain as string)?.toLowerCase().trim()

  if (!domain) {
    return res.status(400).json({ error: "domain query param required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: stores } = await query.graph({
      entity: "vendor_store",
      fields: ["subdomain", "custom_domain", "domain_verified"],
      filters: { custom_domain: domain },
    })

    const store = stores?.[0]

    if (!store || !store.domain_verified) {
      return res.status(404).json({ handle: null })
    }

    return res.json({ handle: store.subdomain })

  } catch (err) {
    console.error("[by-domain] lookup failed:", err)
    return res.status(404).json({ handle: null })
  }
}
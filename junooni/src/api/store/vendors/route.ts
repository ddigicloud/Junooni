// Place this file at: src/api/store/vendors/route.ts in your Medusa backend
// Purpose: public, unauthenticated list of active creator stores, for the MCP
// server's list_creator_stores tool (and reusable for any public "browse creators" page).
//
// SAFE BY DESIGN: only exposes id, name, handle, logo — nothing from the
// financial/PII fields on the vendor model (GSTIN, PAN, bank details, etc).
// Do NOT add more fields here without checking they're safe for public/agent access.
// Confirmed against your actual vendor model (src/modules/marketplace/models/vendor.ts):
// handle, logo, and marketplace_status enum ["none","pending","approved","rejected"].

import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: vendors } = await query.graph({
    entity: "vendor",
    fields: ["id", "name", "handle", "logo"],
    filters: {
      marketplace_status: "approved",
      sell_on_marketplace: true,
    },
  })

  res.json({ vendors: vendors ?? [] })
}
// src/api/vendors/me/stats/route.ts
// GET /vendors/me/stats — lightweight order count only
// Revenue is fetched client-side from /vendors/:id/payout (which already works)

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

async function getVendorId(req: AuthenticatedMedusaRequest): Promise<string | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  if (req.auth_context?.actor_type === "vendor") {
    const { data: [vendorAdmin] } = await query.graph({
      entity: "vendor_admin",
      fields: ["vendor.id"],
      filters: { id: [req.auth_context.actor_id] },
    })
    return vendorAdmin?.vendor?.id ?? null
  }
  if (req.auth_context?.actor_type === "user") {
    return (req.query.vendor_id as string) ?? null
  }
  return null
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const vendorId = await getVendorId(req)
  if (!vendorId) return res.status(404).json({ message: "Vendor not found" })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Order count — fetch only IDs via vendor relation, nothing else loaded
  let orderCount = 0
  try {
    const { data: [vendor] } = await query.graph({
      entity: "vendor",
      fields: ["orders.id"],
      filters: { id: vendorId },
    })
    orderCount = vendor?.orders?.length ?? 0
  } catch (e) {
    console.error("[stats] order count failed:", e)
  }

  // Revenue is intentionally NOT returned here —
  // the client fetches it from /vendors/:id/payout which is already working
  return res.json({
    order_count: orderCount,
  })
}
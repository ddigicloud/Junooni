import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

/**
 * POST /admin/impersonate
 * Body: { vendor_admin_id: string }
 *
 * Returns a short-lived JWT that the vendor dashboard accepts
 * to log in as that vendor without knowing their password.
 */
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { vendor_admin_id } = req.body as { vendor_admin_id: string }

  if (!vendor_admin_id) {
    return res.status(400).json({ message: "vendor_admin_id is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Fetch the vendor_admin and its linked vendor
  const { data: vendorAdmins } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor.id", "vendor.name", "vendor.handle"],
    filters: { id: [vendor_admin_id] },
  })

  if (!vendorAdmins || vendorAdmins.length === 0) {
    return res.status(404).json({ message: "Vendor admin not found" })
  }

  const vendorAdmin = vendorAdmins[0]
  const vendor = vendorAdmin.vendor

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found for this admin" })
  }

  // Build the same shape as a normal vendor JWT so all existing
  // vendor dashboard auth checks keep working without changes.
  const payload = {
    actor_id: vendorAdmin.id,
    actor_type: "vendor",
    app_metadata: {
      vendor_id: vendor.id,
    },
    // Extra flag so the vendor dashboard can show the "Admin Mode" banner
    impersonated_by_admin: true,
    impersonated_by_user_id: req.auth_context?.actor_id ?? "unknown",
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res
      .status(500)
      .json({ message: "JWT_SECRET not configured on server" })
  }

  // Short-lived — 2 hours is enough to help a vendor with onboarding
  const token = jwt.sign(payload, secret, { expiresIn: "2h" })

  return res.json({
    token,
    vendor: {
      id: vendor.id,
      name: vendor.name,
      handle: vendor.handle,
    },
    expires_in: 7200,
  })
}
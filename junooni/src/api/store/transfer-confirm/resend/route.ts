import { 
  AuthenticatedMedusaRequest,  // ← use this instead of MedusaRequest
  MedusaResponse 
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/utils"
import jwt from "jsonwebtoken"

export async function POST(
  req: AuthenticatedMedusaRequest,  // ← this has auth_context built in
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ error: "You must be logged in." })
  }

  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const notificationModuleService = req.scope.resolve(Modules.NOTIFICATION)

  const customer = await customerModuleService.retrieveCustomer(customerId, {
    select: ["id", "email", "first_name", "metadata"],
  })

  if (!customer.metadata?.pending_transfer_token) {
    return res.status(404).json({
      error: "No pending transfer found for your account.",
    })
  }

  const [guestCustomers] = await customerModuleService.listAndCountCustomers({
    email: customer.email,
    has_account: false,
  })

  if (!guestCustomers?.length) {
    return res.status(404).json({ error: "No guest orders found to transfer." })
  }

  const newToken = jwt.sign(
    {
      new_customer_id: customerId,
      guest_customer_id: guestCustomers[0].id,
      email: customer.email,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  )

  await customerModuleService.updateCustomers(customerId, {
    metadata: {
      ...customer.metadata,
      pending_transfer_token: newToken,
      pending_transfer_expires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  })

  const confirmUrl = `${process.env.STOREFRONT_URL}/in/transfer-confirm?token=${newToken}`

  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template: "account-merge-confirmation",
    data: {
      first_name: customer.first_name || "there",
      email: customer.email,
      confirm_url: confirmUrl,
    },
  })

  return res.status(200).json({ success: true })
}
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/utils"
import jwt from "jsonwebtoken"

type CustomerCreatedData = {
  id: string
}

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<CustomerCreatedData>) {
  const { id: newCustomerId } = data

  const customerModuleService = container.resolve(Modules.CUSTOMER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Fetch the newly registered customer
  const newCustomer = await customerModuleService.retrieveCustomer(newCustomerId, {
    select: ["id", "email", "first_name"],
  })

  // Look for an existing guest customer (has_account: false) with same email
  const [guestCustomers] = await customerModuleService.listAndCountCustomers({
    email: newCustomer.email,
    has_account: false,
  })

  // No guest history found — nothing to do
  if (!guestCustomers || guestCustomers.length === 0) {
    return
  }

  const guestCustomer = guestCustomers[0]

  // Generate a signed JWT token — expires in 24 hours
  const token = jwt.sign(
    {
      new_customer_id: newCustomerId,
      guest_customer_id: guestCustomer.id,
      email: newCustomer.email,
    },
    process.env.JWT_SECRET!, // reuse your existing JWT_SECRET
    { expiresIn: "24h" }
  )

  // Store token in new customer's metadata so they can re-trigger later
  await customerModuleService.updateCustomers(newCustomerId, {
    metadata: {
      pending_transfer_token: token,
      pending_transfer_expires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  })

  // Build confirmation URL
  const confirmUrl = `${process.env.STORE_URL}/in/transfer-confirm?token=${token}`

  // Send confirmation email
  await notificationModuleService.createNotifications({
    to: newCustomer.email,
    channel: "email",
    template: "account-merge-confirmation",
    data: {
      first_name: newCustomer.first_name || "there",
      email: newCustomer.email,
      confirm_url: confirmUrl,
      guest_order_count: guestCustomers.length,
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
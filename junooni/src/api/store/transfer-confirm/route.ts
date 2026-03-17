import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/utils"
import jwt from "jsonwebtoken"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { token } = req.body as { token: string }

  if (!token) {
    return res.status(400).json({ error: "Token is required" })
  }

  // 1. Verify and decode JWT
  let decoded: {
    new_customer_id: string
    guest_customer_id: string
    email: string
  }

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as typeof decoded
  } catch (err) {
    return res.status(401).json({
      error: "This link has expired or is invalid. Please request a new one from your account.",
    })
  }

  const { new_customer_id, guest_customer_id } = decoded

  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const orderModuleService = req.scope.resolve(Modules.ORDER)

  // 2. Validate both customers still exist
  let newCustomer, guestCustomer
  try {
    newCustomer = await customerModuleService.retrieveCustomer(new_customer_id, {
      select: ["id", "email", "metadata"],
    })
    guestCustomer = await customerModuleService.retrieveCustomer(guest_customer_id, {
      select: ["id", "email", "addresses"],
      relations: ["addresses"],
    })
  } catch {
    return res.status(404).json({ error: "Customer account not found." })
  }

  // 3. Check token hasn't already been used
  if (!newCustomer.metadata?.pending_transfer_token) {
    return res.status(409).json({
      error: "This transfer has already been completed or the link was already used.",
    })
  }

  // 4. Transfer Orders — find all orders belonging to guest customer
  const [guestOrders] = await orderModuleService.listAndCountOrders({
    customer_id: guest_customer_id,
  })

  // Reassign each order to the new registered customer
  if (guestOrders.length > 0) {
    await Promise.all(
      guestOrders.map((order) =>
        orderModuleService.updateOrders(order.id, {
          customer_id: new_customer_id,
        })
      )
    )
  }

  // 5. Transfer Addresses
  if (guestCustomer.addresses?.length > 0) {
    await Promise.all(
      guestCustomer.addresses.map((address) =>
        customerModuleService.createCustomerAddresses({
          customer_id: new_customer_id,
          address_1: address.address_1,
          address_2: address.address_2,
          city: address.city,
          country_code: address.country_code,
          province: address.province,
          postal_code: address.postal_code,
          phone: address.phone,
          first_name: address.first_name,
          last_name: address.last_name,
          company: address.company,
          metadata: address.metadata,
        })
      )
    )
  }

  // 6. Clear the pending token from metadata — marks transfer as done
  await customerModuleService.updateCustomers(new_customer_id, {
    metadata: {
      ...newCustomer.metadata,
      pending_transfer_token: null,
      pending_transfer_expires: null,
      transfer_completed_at: new Date().toISOString(),
    },
  })

  // 7. Generate a storefront auth token so frontend can auto-login
  // We return the customer ID — frontend uses it to create a session
  return res.status(200).json({
    success: true,
    customer_id: new_customer_id,
    message: "Transfer complete. Your order history is now in your account.",
  })
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VENDOR_OTP_MODULE } from "../../../../../../modules/otp"
import crypto from "crypto"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderId = req.params.id
  const query   = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Fetch order with all fields needed for validation + branding
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "email",
      "status",
      "payment_status",
      "created_at",
      "custom_display_id",
      "metadata",
      "sales_channel.name",
      "shipping_address.first_name",
      "fulfillments.shipped_at",
      "fulfillments.delivered_at",
    ],
    filters: { id: orderId },
  })

  if (!order) {
    return res.status(404).json({ message: "Order not found." })
  }

  // ── Cancellability checks ─────────────────────────────────────────────────

  const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000
  const createdAt = new Date(order.created_at).getTime()

  if (Date.now() - createdAt > CANCEL_WINDOW_MS) {
    return res.status(400).json({ message: "The 2-hour cancellation window has passed." })
  }

  const isFulfilled = (order.fulfillments as any[])?.some(
    (f: any) => f.shipped_at || f.delivered_at
  )
  if (order.status === "canceled" || isFulfilled) {
    return res.status(400).json({ message: "This order can no longer be cancelled." })
  }

  // ── Resolve vendor branding ───────────────────────────────────────────────

  const vendorOrders  = (order as any).metadata?.vendor_orders ?? []
  const vendorId      = vendorOrders[0]?.vendor_id ?? null

  let storeLogo         = ""
  let storeName         = ""
  let storePrimaryColor = "#e65100"
  let storeUrl          = ""
  let storeHandle       = ""

  if (vendorId) {
    try {
      const { data: vendors } = await query.graph({
        entity: "vendor",
        fields: [
          "id",
          "name",
          "handle",
          "vendor_store.store_logo",
          "vendor_store.custom_domain",
          "vendor_store.subdomain",
          "vendor_store.primary_color",
        ],
        filters: { id: vendorId },
      })

      const vendor      = vendors?.[0]
      const vendorStore = (vendor as any)?.vendor_store

      storeLogo         = vendorStore?.store_logo        ?? ""
      storeName         = (vendor?.name || vendor?.handle) ?? ""
      storePrimaryColor = vendorStore?.primary_color     ?? "#e65100"
      storeHandle       = vendor?.handle                 ?? "" 

      if (vendorStore?.custom_domain) {
        storeUrl = `https://${vendorStore.custom_domain}`
      } else if (vendorStore?.subdomain) {
        storeUrl = `https://${vendorStore.subdomain}.junooni.com`
      } else if (vendor?.handle) {
        storeUrl = `https://${vendor.handle}.junooni.com`
      }
    } catch (e) {
      console.warn("[request-cancel-otp] vendor branding lookup failed:", e)
    }
  }

  // ── OTP generation ────────────────────────────────────────────────────────

  const otpService         = req.scope.resolve(VENDOR_OTP_MODULE)
  const notificationModule = req.scope.resolve(Modules.NOTIFICATION)

  // Invalidate any previous unused OTPs for this email
  try {
    const existing = await otpService.listVendorOtps({ email: order.email, used: false })
    for (const old of existing) {
      await otpService.updateVendorOtps({ id: old.id, used: true })
    }
  } catch (_) {}

  const otp        = String(crypto.randomInt(100000, 999999))
  const expires_at = new Date(Date.now() + 10 * 60 * 1000)

  await otpService.createVendorOtps({ email: order.email, otp, expires_at, used: false })

  // ── Send email ────────────────────────────────────────────────────────────

  await notificationModule.createNotifications({
    to:       order.email,
    channel:  "email",
    template: "order-cancel-otp",
    data: {
        otp,
        order_id:         (order as any).custom_display_id ?? orderId,
        customer_name:    (order as any).shipping_address?.first_name ?? "",
        storeLogo,
        storeName,
        storePrimaryColor,
        storeUrl,
        storeHandle, // 👈 this is what the provider uses to build "Name <handle@junooni.com>"
    },
    })

  return res.json({ message: "OTP sent to your email." })
}
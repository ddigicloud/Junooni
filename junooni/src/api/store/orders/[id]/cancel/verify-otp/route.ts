import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VENDOR_OTP_MODULE } from "../../../../../../modules/otp"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"


export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const orderId    = req.params.id
  const { otp }    = req.body as { otp: string }
  const query      = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const otpService = req.scope.resolve(VENDOR_OTP_MODULE)

  if (!otp) {
    return res.status(400).json({ message: "OTP is required." })
  }

  // ── Fetch fresh order — never trust client ────────────────────────────────
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "email",
      "status",
      "created_at",
      "fulfillments.shipped_at",
      "fulfillments.delivered_at",
    ],
    filters: { id: orderId },
  })

  if (!order) {
    return res.status(404).json({ message: "Order not found." })
  }

  // ── Re-validate cancellability server-side ────────────────────────────────
  const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000
  if (Date.now() - new Date(order.created_at).getTime() > CANCEL_WINDOW_MS) {
    return res.status(400).json({ message: "The 2-hour cancellation window has passed." })
  }

  const isFulfilled = (order.fulfillments as any[])?.some(
    (f: any) => f.shipped_at || f.delivered_at
  )
  if (order.status === "canceled" || isFulfilled) {
    return res.status(400).json({ message: "This order can no longer be cancelled." })
  }

  // ── Validate OTP — filter manually to avoid ORM filter issues ────────────
  const allOtpRecords = await otpService.listVendorOtps({})
  const validOtp = allOtpRecords.find(r =>
    r.email === order.email &&
    r.used === false &&
    new Date(r.expires_at) > new Date() &&
    r.otp === otp.trim()
  )

  if (!validOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP. Please try again." })
  }

  // ── Mark OTP used ─────────────────────────────────────────────────────────
  await otpService.updateVendorOtps({ id: validOtp.id, used: true })

  // ── Cancel order via module service — no HTTP call needed ─────────────────
  try {
  await cancelOrderWorkflow(req.scope).run({
    input: {
      order_id: orderId,
      no_notification: true,
    },
  })
} catch (e: any) {
  console.error("[cancel-with-otp] cancel failed:", e)
  return res.status(500).json({ message: "Failed to cancel order. Please contact support." })
}

  return res.json({ success: true })
}
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body as any

    const { session_id, cart_id, store_handle, return_to } = req.query as any

    // 1. Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET ?? ""
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected !== razorpay_signature) {
      console.error("[razorpay-callback] Invalid signature")
      return res.status(400).json({ error: "Invalid signature" })
    }

    // 2. Authorize the payment session
    const paymentModule = req.scope.resolve(Modules.PAYMENT)
    await paymentModule.authorizePaymentSession(session_id, {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    })

    // 3. Complete the cart → creates the order
    if (!cart_id) {
      return res.status(400).json({ error: "cart_id missing from callback URL" })
    }

    const { result } = await completeCartWorkflow(req.scope).run({
      input: { id: cart_id },
    })

    // 4. Extract order ID from workflow result
    const orderId = (result as any)?.id ?? (result as any)?.order?.id

    // 5. Extract base URL from return_to — this is always the custom domain
    //    because we only use this callback route for custom domain checkouts.
    //    return_to = "https://sunozara.store/checkout?step=confirmation"
    //    → origin  = "https://sunozara.store"
    const decodedReturnTo = return_to ? decodeURIComponent(return_to as string) : null
    const baseUrl = decodedReturnTo ? new URL(decodedReturnTo).origin : null

    if (!baseUrl) {
      return res.status(400).json({ error: "return_to missing from callback URL" })
    }

    // 6. Redirect to order page on the custom domain
    //    Falls back to return_to if no order ID (shouldn't happen)
    const destination = orderId
      ? `${baseUrl}/order/${orderId}`
      : decodedReturnTo

    console.log(`[razorpay-callback] ✅ Order ${orderId} created, redirecting to ${destination}`)
    return res.redirect(destination)

  } catch (err: any) {
    console.error("[razorpay-callback] error:", err.message)
    return res.status(500).json({ error: err.message })
  }
}
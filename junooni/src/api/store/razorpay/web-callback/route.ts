import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body as any

    const { collection_id, session_id, store_handle, return_to } = req.query as any

    // 1. Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET ?? ""
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" })
    }

    // 2. Authorize payment
    const container = req.scope
    const paymentService = container.resolve("paymentService")
    await paymentService.authorizePayment(session_id, {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    })

    // 3. Place order
    const cartService  = container.resolve("cartService")
    const orderService = container.resolve("orderService")
    const cart = await cartService.retrieveByPaymentCollection(collection_id)
    await orderService.createFromCart(cart.id)

    // 4. Redirect back to the custom domain confirmation page
    const destination = return_to
      ? decodeURIComponent(return_to as string)
      : `https://${store_handle}.junooni.com/checkout?step=confirmation`

    return res.redirect(destination)

  } catch (err: any) {
    console.error("[razorpay web-callback]", err)
    return res.status(500).json({ error: err.message })
  }
}
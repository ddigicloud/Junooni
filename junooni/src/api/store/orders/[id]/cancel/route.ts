import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const { result } = await cancelOrderWorkflow(req.scope).run({
      input: {
        order_id: id,
        no_notification: true, // sends cancellation email to customer
      },
    })
    res.json({ order: result })
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Could not cancel order" })
  }
}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import {
  addCodFeeWorkflow,
  removeCodFeeWorkflow,
} from "../../../../workflows/add-cod-fee"

// POST /store/cart/cod-fee — add COD fee line item
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cart_id } = req.body as { cart_id: string }

  if (!cart_id) {
    return res.status(400).json({ error: "cart_id is required" })
  }

  try {
    const { result } = await addCodFeeWorkflow(req.scope).run({
      input: { cart_id },
    })

    return res.json({ success: true, result })
  } catch (error: any) {
    console.error("❌ Add COD fee error:", error)
    return res.status(500).json({ error: error.message })
  }
}

// DELETE /store/cart/cod-fee?cart_id=xxx — remove COD fee line item
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cart_id } = req.query as { cart_id: string }

  if (!cart_id) {
    return res.status(400).json({ error: "cart_id is required" })
  }

  try {
    const { result } = await removeCodFeeWorkflow(req.scope).run({
      input: { cart_id },
    })

    return res.json({ success: true, result })
  } catch (error: any) {
    console.error("❌ Remove COD fee error:", error)
    return res.status(500).json({ error: error.message })
  }
}
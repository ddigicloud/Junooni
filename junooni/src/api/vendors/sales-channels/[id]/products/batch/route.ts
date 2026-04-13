import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { product_ids } = req.body as { product_ids: { id: string }[] }

  if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({ message: "product_ids is required" })
  }

  const remoteLink = req.scope.resolve("remoteLink")

  await remoteLink.create(
    product_ids.map(({ id: productId }) => ({
      [Modules.PRODUCT]: { product_id: productId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: id },
    }))
  )

  return res.json({ success: true, sales_channel_id: id, product_ids })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { product_ids } = req.body as { product_ids: { id: string }[] }

  if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({ message: "product_ids is required" })
  }

  const remoteLink = req.scope.resolve("remoteLink")

  await remoteLink.dismiss(
    product_ids.map(({ id: productId }) => ({
      [Modules.PRODUCT]: { product_id: productId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: id },
    }))
  )

  return res.json({ success: true, sales_channel_id: id, product_ids })
}
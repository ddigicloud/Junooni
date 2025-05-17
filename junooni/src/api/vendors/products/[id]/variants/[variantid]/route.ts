import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId, variantid } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: [variant] } = await query.graph(
      {
        entity: "product_variant",
        filters: {
          id: variantid,
          $and: [{ product_id: { $eq: productId } }],
        },
        // Optional: remove this if not using it
        fields: (req.query?.fields as string[]) ?? [],
      },
      { throwIfKeyNotFound: false }
    )

    if (!variant) {
      return res.status(404).json({
        message: `Variant with id '${variantid}' not found for product '${productId}'`,
      })
    }

    return res.status(200).json({ variant })
  } catch (err) {
    console.error("Error fetching variant:", err)
    return res.status(500).json({
      message: "Internal server error",
    })
  }
}

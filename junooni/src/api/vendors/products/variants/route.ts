import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const { product_id, variant_id } = req.query

  if (!product_id || !variant_id) {
    return res.status(400).json({ message: "Product ID and Variant ID are required" })
  }

  const variant = await productModuleService.retrieveProductVariant(variant_id as string)

  if (variant.product_id !== product_id) {
    return res.status(404).json({ message: "Variant not found for the given product" })
  }

  res.json({ variant })
}

export const PUT = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const { variant_id } = req.query

  if (!variant_id) {
    return res.status(400).json({ message: "Variant ID is required" })
  }

  const updatedVariant = await productModuleService.updateProductVariants(
    variant_id as string,
    req.body
  )

  res.json({ variant: updatedVariant })
}


import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"


export async function linkBrand(
  { products, additional_data },
  { container }
) {
  if (!additional_data?.brand_id) {
    // No brand to link, nothing to do
    return new StepResponse([], [])
  }

  // Ensure the brand exists
  const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE)
  await brandModuleService.retrieveBrand(additional_data.brand_id as string)

  // Link the brand to each product
  const link = container.resolve("link")
  const links = products.map(product => ({
    [Modules.PRODUCT]: { product_id: product.id },
    [BRAND_MODULE]: { brand_id: additional_data.brand_id },
  }))
  await link.create(links)

  return new StepResponse(links, links)
}
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"
import { LinkDefinition } from "@medusajs/framework/types"

// Import sizechart module and its service
import { SIZECHART_MODULE } from "../../modules/size-chart"
import SizeChartModuleService from "../../modules/size-chart/service"


createProductsWorkflow.hooks.productsCreated(
  (async ({ products, additional_data }, { container }) => {
    if (!additional_data?.brand_id || !additional_data?.sizechart_id) {
      return new StepResponse([], [])
    }

   // Validate brand if provided
   if (additional_data?.brand_id) {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE)
    // This will throw an error if the brand doesn't exist
    await brandModuleService.retrieveBrand(additional_data.brand_id as string)
  }

  // Validate sizechart if provided
  if (additional_data?.sizechart_id) {
    const sizechartModuleService: SizeChartModuleService = container.resolve(SIZECHART_MODULE)
    // This will throw an error if the sizechart doesn't exist
    await sizechartModuleService.retrieveSizeChart(additional_data.sizechart_id as string)
  }

    const link = container.resolve("link")
const logger = container.resolve("logger")

const links: LinkDefinition[] = []


for (const product of products) {
  // Create a link definition and add the product field
  const linkDefinition: any = {
    [Modules.PRODUCT]: {
      product_id: product.id,
    },
  }
  // Add brand if it exists
  if (additional_data?.brand_id) {
    linkDefinition[BRAND_MODULE] = {
      brand_id: additional_data.brand_id,
    }
  }
  // Add sizechart if it exists
  if (additional_data?.sizechart_id) {
    linkDefinition[SIZECHART_MODULE] = {
      sizechart_id: additional_data.sizechart_id,
    }
  }
  links.push(linkDefinition)
}

await link.create(links)

logger.info("Linked brand and sizechart to products")

return new StepResponse(links, links)
}),
(async (links, { container }) => {
if (!links?.length) {
  return
}
const link = container.resolve("link")
await link.dismiss(links)
})
)
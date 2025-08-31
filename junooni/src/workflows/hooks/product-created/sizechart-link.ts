import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { SIZECHART_MODULE } from "../../../modules/size-chart"
import SizeChartModuleService from "../../../modules/size-chart/service"

export async function linkSizeChart(
  { products, additional_data },
  { container }
) {
  if (!additional_data?.size_chart_id) {
    // No size chart to link
    return new StepResponse([], [])
  }

  // Ensure the size chart exists
  const sizeChartModuleService: SizeChartModuleService = container.resolve(SIZECHART_MODULE)
  await sizeChartModuleService.retrieveSizeChart(additional_data.size_chart_id as string)

  // Link the size chart to each product
  const link = container.resolve("link")
  const links = products.map(product => ({
    [Modules.PRODUCT]: { product_id: product.id },
    [SIZECHART_MODULE]: { size_chart_id: additional_data.size_chart_id },
  }))
  await link.create(links)

  return new StepResponse(links, links)
}
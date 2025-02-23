import { defineLink } from "@medusajs/framework/utils"
import SizeChartModule from "../modules/size-chart"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
    {
      linkable: ProductModule.linkable.product,
      isList: true,
    },
    SizeChartModule.linkable.sizeChart
  )
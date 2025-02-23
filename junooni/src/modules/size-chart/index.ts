import { Module } from "@medusajs/framework/utils"
import SizeChartModuleService from "./service"

export const SIZECHART_MODULE = "sizeChart"

export default Module(SIZECHART_MODULE, {
  service: SizeChartModuleService,
})
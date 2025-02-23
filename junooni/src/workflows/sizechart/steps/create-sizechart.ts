import {
    createStep,
    StepResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { CreateSizeChartInput } from ".."
  import { SIZECHART_MODULE } from "../../../modules/size-chart"
  import SizeChartModuleService from "../../../modules/size-chart/service"
  
  export const createSizeChartStep = createStep(
    "create-sizechart-step",
    async (input: CreateSizeChartInput, { container }) => {
      const sizeChartModuleService: SizeChartModuleService = container.resolve(
        SIZECHART_MODULE
      )
  
      const sizechart = await sizeChartModuleService.createSizeCharts(input)
  
      return new StepResponse(sizechart, sizechart.id)
    },
    async (id: string, { container }) => {
      const sizeChartModuleService: SizeChartModuleService = container.resolve(
        SIZECHART_MODULE
      )
  
      await sizeChartModuleService.deleteSizeCharts(id)
    }
  )
  
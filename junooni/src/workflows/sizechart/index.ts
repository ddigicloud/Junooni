import {
    createWorkflow,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { createSizeChartStep } from "./steps/create-sizechart"
  
  export type CreateSizeChartInput = {
    chart_url: string
  }
  
  export const createSizeChartWorkflow = createWorkflow(
    "create-sizechart",
    (input: CreateSizeChartInput) => {
      const sizechart = createSizeChartStep(input)
      return new WorkflowResponse(sizechart)
    }
  )
  
import {
    createWorkflow,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { createSizeChartStep } from "./steps/create-sizechart"
  
  export type CreateSizeChartInput = {
    
    chart: string,
    name?: string | null,
    sku: string,
    manufacturer?: string | null,
    manufacturer_sku?: string | null,
    chart_url?: string | null
  }
  
  export const createSizeChartWorkflow = createWorkflow(
    "create-sizechart",
    (input: CreateSizeChartInput) => {
      const sizechart = createSizeChartStep(input)
      return new WorkflowResponse(sizechart)
    }
  )
  
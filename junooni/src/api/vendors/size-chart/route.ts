import { 
    createSizeChartWorkflow,
  } from "../../../workflows/sizechart"
import sizeChart from "src/modules/size-chart"
import { z } from "zod"
import { PostAdminCreateSizeChartType } from "./validators"

import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const sizeChartModuleService: typeof sizeChartModuleService = req.scope.resolve(
          sizeChart
        )

    const limit = req.query.limit || 15
    const offset = req.query.offset || 0
    const query = req.scope.resolve("query")

    // const [sizeChart, count] = await SizeChartModuleService.listAndCountBrands({}, {
    //   skip: offset as number,
    //   take: limit as number,
    // })
    
    const { data: sizeChart } = await query.graph({
      entity: "sizeChart",
      fields: ["*", "products.*"],
    })
  
    res.json({ sizeChart })

    // If you have a type, import it and use as type annotation:
    // import type { SizeChartModuleService } from "src/modules/size-chart"
    // const sizeChartModuleService = req.scope.resolve<SizeChartModuleService>(sizeChart)

    // Or, if you want to use typeof:
    // const sizeChartModuleService: typeof sizeChart = req.scope.resolve(sizeChart)
  }

  
  

type PostAdminCreateSizeChartType = z.infer<typeof PostAdminCreateSizeChartType>
  
  
  
  export const POST = async (
    req: MedusaRequest<PostAdminCreateSizeChartType>,
    res: MedusaResponse
  ) => {
    const { result } = await createSizeChartWorkflow(req.scope)
      .run({
        input: req.validatedBody,
      })
  
    res.json({ sizeChart: result })
  }
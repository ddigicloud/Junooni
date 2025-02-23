import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const query = req.scope.resolve("query")
    
    const { data: sizeChart } = await query.graph({
      entity: "sizeChart",
      fields: ["*", "products.*"],
    })
  
    res.json({ sizeChart })
  }

  
  import { 
    createSizeChartWorkflow,
  } from "../../../workflows/sizechart"
import sizeChart from "src/modules/size-chart"
import { z } from "zod"
import { PostAdminCreateSizeChartType } from "./validators"

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
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
// import 
//   updateSizeChartWorkflow from "../../../../workflows/sizechart/update-sizechart"
import { z } from "zod"
import { PostAdminCreateSizeChartType } from "../validators"

type PutAdminUpdateSizeChartType = z.infer<typeof PostAdminCreateSizeChartType>

// GET /admin/size-chart/[id] - Get single size chart
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params
  
  const { data: sizeChart } = await query.graph({
    entity: "size_chart",
    fields: ["*", "products.*"],
    filters: {
      id: id
    }
  })

  if (!sizeChart || sizeChart.length === 0) {
    return res.status(404).json({ 
      message: "Size chart not found" 
    })
  }

  res.json(sizeChart[0])
}

// PUT /admin/size-chart/[id] - Update size chart
// export const PUT = async (
//   req: MedusaRequest<PutAdminUpdateSizeChartType>,
//   res: MedusaResponse
// ) => {
//   const { id } = req.params
  
//   const { result } = await updateSizeChartWorkflow(req.scope)
//     .run({
//       input: {
//         id,
//         ...req.validatedBody,
//       },
//     })

//   res.json({ sizeChart: result })
// }

// DELETE /admin/size-chart/[id] - Delete size chart
// export const DELETE = async (
//   req: MedusaRequest,
//   res: MedusaResponse
// ) => {
//   const { id } = req.params
  
//   const { result } = await deleteSizeChartWorkflow(req.scope)
//     .run({
//       input: { id },
//     })

//   res.json({ 
//     id,
//     deleted: true,
//     object: "size_chart"
//   })
// }
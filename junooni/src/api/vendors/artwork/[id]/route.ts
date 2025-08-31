import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
// import 
//   updateSizeChartWorkflow from "../../../../workflows/sizechart/update-sizechart"
import { z } from "zod"
//import { PostAdminCreateSizeChartType } from "../validators"

//type PutAdminUpdateSizeChartType = z.infer<typeof PostAdminCreateSizeChartType>

// GET /admin/size-chart/[id] - Get single size chart
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params
  
  const { data: artwork } = await query.graph({
    entity: "vendor_artwork",
    fields: ["*", "medias.*", "products.*"],
    filters: {
      id: id
    }
  })

  if (!artwork || artwork.length === 0) {
    return res.status(404).json({ 
      message: "Artwork not found" 
    })
  }

  res.json(artwork[0])
}
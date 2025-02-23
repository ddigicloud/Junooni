import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(
    ContainerRegistrationKeys.QUERY
  )

  const { data: [product] } = await query.graph({
    entity: "product",
    fields: ["brand.*"],
    filters: {
      id: req.params.productId,
    },
  })

  res.json({ brand: product.brand })
}


import { 
  createBrandWorkflow,
} from "../../../../../workflows/create-brand"

type PostAdminCreateBrandType = {
  name: string
}

export const POST = async (
  req: MedusaRequest<PostAdminCreateBrandType>,
  res: MedusaResponse
) => {
  const { result } = await createBrandWorkflow(req.scope)
    .run({
      input: req.validatedBody,
    })

  res.json({ brand: result })
}
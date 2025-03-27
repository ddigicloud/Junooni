import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createFollowWorkflow } from "../../../../../workflows/follow/create-follows";
import { MedusaError } from "@medusajs/framework/utils";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
 
  const { result } = await createFollowWorkflow(req.scope)
    .run({
      input: {
        customer_id: req.auth_context.actor_id,
       
      }
    })

  res.json({
    follow: result.follow
  })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "follow",
    fields: ["*", "creators.*","creators.vendor.*"],
    filters: {
      customer_id: req.auth_context.actor_id
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "customer do not follow any creator yet"
    )
  }

  return res.json({
    follow: data[0]
  })
}

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { UnfollowCreatorWorkflow } from "../../../../../../../workflows/follow/unfollow-creator";

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await UnfollowCreatorWorkflow(req.scope)
    .run({
      input: {
       follow_creator_id: req.params.id,
        customer_id: req.auth_context.actor_id
      }
    })

  res.json({
   follow: result.follow
  })
}
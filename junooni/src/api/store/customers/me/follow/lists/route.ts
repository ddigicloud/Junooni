import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { createFollowListWorkflow } from "../../../../../../workflows/follow/create-follow-list"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import { PostStoreCreateFollowList } from "./validators"

type PostStoreCreateFollowListType = z.infer<typeof PostStoreCreateFollowList>

export async function POST (
  req: AuthenticatedMedusaRequest<PostStoreCreateFollowListType>,
  res: MedusaResponse
) {
  
  const { result } = await createFollowListWorkflow(req.scope)
    .run({
      input: {
        vendor_id: req.validatedBody.vendor_id,
        customer_id: req.auth_context.actor_id,
        
      }
    })

  res.json({
    follow: result.follow
  })
}
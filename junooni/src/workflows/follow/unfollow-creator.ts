import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { unfollowCreatorStep } from "./steps/remove-follow"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { validateVendorInFollowStep } from "./steps/validate-vendor-follow-list"
import { validateFollowExistsStep } from "./steps/validate-follow-list"

type UnfollowCreatorWorkflowInput = {
    follow_creator_id: string
  customer_id: string
}

export const UnfollowCreatorWorkflow = createWorkflow(
  "unfollow-creator",
  (input: UnfollowCreatorWorkflowInput) => {
    const { data: follows } = useQueryGraphStep({
      entity: "follow",
      fields: ["*","creators.*"],
      filters: {
        customer_id: input.customer_id,
      },
    })
    
    validateFollowExistsStep({
      follows
    })

    validateVendorInFollowStep({
        follow: follows[0],
        follow_creator_id: input.follow_creator_id
    })

    unfollowCreatorStep(input)

    // refetch follow
    const { data: updatedFollows } = useQueryGraphStep({
      entity: "follow",
      fields: ["*", "creators.*", "creators.vendor.*"],
      filters: {
        id: follows[0].id
      }
    }).config({ name: "refetch-follow" })

    return new WorkflowResponse({
     follow: updatedFollows[0]
    })
  }
)
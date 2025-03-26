import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createFollowListStep } from "./steps/create-follow-list"
import { validateVendorFollowStep } from "./steps/validate-creator-list"
import { validateFollowExistsStep } from "./steps/validate-follow-list"

type CreateFollowListWorkflowInput = {
  vendor_id: string
  customer_id: string
 
}

export const createFollowListWorkflow = createWorkflow(
  "create-follow-list-item",
  (input: CreateFollowListWorkflowInput) => {
    const { data: follows } = useQueryGraphStep({
      entity: "follow",
      fields: ["*", "creators.*"],
      filters: {
        customer_id: input.customer_id,
      },
    })

    validateFollowExistsStep({
      follows
    })

   

    validateVendorFollowStep({
      vendor_id: input.vendor_id,
      follow: follows[0]
    })

    createFollowListStep({
     vendor_id: input.vendor_id,
      follow_id: follows[0].id
    })

    // refetch follows
    const { data: updatedFollows } = useQueryGraphStep({
      entity: "follow",
      fields: ["*", "creators.*"],
      filters: {
        id: follows[0].id
      },
    }).config({ name: "refetch-follows" })

    return new WorkflowResponse({
      follow: updatedFollows[0],
    })
  }
)
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateCustomerCreateFollowStep } from "./steps/validate-customer-follow-list"
import { createFollowStep } from "./steps/create-follow"

type CreateFollowWorkflowInput = {
  customer_id: string
  
}

export const createFollowWorkflow = createWorkflow(
  "create-follow",
  (input: CreateFollowWorkflowInput) => {
    validateCustomerCreateFollowStep({
      customer_id: input.customer_id
    })

    const follow = createFollowStep(input)

    return new WorkflowResponse({
      follow
    })
  }
)
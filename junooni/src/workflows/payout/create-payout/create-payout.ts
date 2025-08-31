import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVendorCreatePayoutStep } from "./steps/validate-vendor-create-payout"
import { createPayoutStep } from "./steps/create-payout"

type CreatePayoutWorkflowInput = {
  vendor_id: string

}

export const createPayoutWorkflow = createWorkflow(
  "create-payout",
  (input: CreatePayoutWorkflowInput) => {
    validateVendorCreatePayoutStep({
      vendor_id: input.vendor_id
    })

    const payout = createPayoutStep(input)

    return new WorkflowResponse({
      payout
    })
  }
)
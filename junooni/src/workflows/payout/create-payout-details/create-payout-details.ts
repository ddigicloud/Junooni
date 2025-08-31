import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { validatePayoutAccessStep } from "./steps/validate-payout-access"
import { createPayoutDetailStep } from "./steps/create-payout-detail-step"
import  validatePayoutDetailInputStep  from "./steps/validate-payout-detail-input-step"

type CreatePayoutDetailWorkflowInput = {
  payout_id: string
  vendor_id: string
  type: "adjustment" | "refund"
  amount: number
  reason: string
  notes?: string
  order_id?: string
  order_item_id?: string
  product_id?: string
}

export const createPayoutDetailWorkflow = createWorkflow(
  "create-payout-detail",
  (input: CreatePayoutDetailWorkflowInput) => {
    // Fetch the payout to validate access and get current state
    const { data: payouts } = useQueryGraphStep({
      entity: "payout",
      fields: ["*", "payout_details.*"],
      filters: {
        id: input.payout_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // Validate user has access to this payout
    validatePayoutAccessStep({
      payout: payouts[0],
      vendor_id: input.vendor_id,
    })

    // Validate input data
    validatePayoutDetailInputStep({
      input,
      payout: payouts[0],
    })

    // Create the payout detail
    const payoutDetail = createPayoutDetailStep({
      payout_id: input.payout_id,
      vendor_id: input.vendor_id,
      type: input.type,
      amount: input.amount,
      reason: input.reason,
      notes: input.notes,
      order_id: input.order_id,
      order_item_id: input.order_item_id,
      product_id: input.product_id,
    })

    // Refetch updated payout with all details
    const { data: updatedPayouts } = useQueryGraphStep({
      entity: "payout",
      fields: ["*", "payout_details.*"],
      filters: {
        id: input.payout_id,
      },
    }).config({ name: "refetch-payout" })

    return new WorkflowResponse({
      payout_detail: payoutDetail,
      payout: updatedPayouts[0],
    })
  }
)
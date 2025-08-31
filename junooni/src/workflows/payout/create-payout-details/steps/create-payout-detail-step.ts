//this is from claude and do not delete

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

type CreatePayoutDetailStepInput = {
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

export const createPayoutDetailStep = createStep(
  "create-payout-detail",
  async (input: CreatePayoutDetailStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService =
      container.resolve(PAYOUT_MODULE)

    let payoutDetail

    try {
      switch (input.type) {
        case "adjustment":
          // Use the addAdjustment method which handles balance updates
          payoutDetail = await payoutModuleService.addAdjustment(
            input.vendor_id,
            input.amount,
            input.reason
          )
          break

        case "refund":
          // For refunds, use negative adjustment
          const refundAmount = -Math.abs(input.amount)
          payoutDetail = await payoutModuleService.addAdjustment(
            input.vendor_id,
            refundAmount,
            `Refund: ${input.reason}`
          )
          
          // Update the payout detail with additional refund information
          if (input.order_id || input.order_item_id || input.product_id || input.notes) {
            payoutDetail = await payoutModuleService.updatePayoutDetails({
              id: payoutDetail.id,
              type: "refund", // Change type from adjustment to refund
              order_id: input.order_id,
              order_item_id: input.order_item_id,
              product_id: input.product_id,
              notes: input.notes,
            })
          }
          break

        default:
          throw new Error("Invalid payout detail type")
      }

      console.log(`Created ${input.type} payout detail:`, payoutDetail.id)

      return new StepResponse(payoutDetail, payoutDetail.id)

    } catch (error) {
      console.error(`Failed to create ${input.type} payout detail:`, error)
      throw error
    }
  },
  async (payoutDetailId, { container }) => {
    // Compensation logic - if the step fails, we should reverse the payout detail
    if (!payoutDetailId) {
      return
    }

    try {
      const payoutModuleService: PayoutModuleService =
        container.resolve(PAYOUT_MODULE)

      // Get the payout detail to understand what we need to reverse
      const payoutDetail = await payoutModuleService.retrievePayoutDetails(payoutDetailId)
      
      if (payoutDetail && payoutDetail.status !== "cancelled") {
        // Mark as cancelled and reverse the balance impact
        await payoutModuleService.updatePayoutDetailStatus(
          payoutDetailId,
          "cancelled",
          "Workflow compensation - step failed"
        )

        console.log(`Compensated payout detail: ${payoutDetailId}`)
      }
    } catch (compensationError) {
      console.error(`Failed to compensate payout detail ${payoutDetailId}:`, compensationError)
      // Don't throw here as it would mask the original error
    }
  }
)

export default createPayoutDetailStep
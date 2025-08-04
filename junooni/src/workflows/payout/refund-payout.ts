import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

// Use string constant directly - no need to import
const PAYOUT_MODULE = "payout"

export interface ProcessRefundPayoutWorkflowInput {
  orderId: string
  refundAmount?: number
  refundedItems?: Array<{
    itemId: string
    vendorId: string
    refundQuantity: number
    originalEarnings: number
  }>
  isFullRefund: boolean
  reason: string
}

// Step to calculate refund adjustments for vendors
export const calculateRefundAdjustmentsStep = createStep(
  "calculate-refund-adjustments",
  async function (input: ProcessRefundPayoutWorkflowInput) {
    if (!input.orderId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order ID is required for refund processing"
      )
    }

    const vendorAdjustments = new Map<string, number>()

    if (input.isFullRefund) {
      // For full refunds, we need to reverse all vendor earnings for this order
      // This would require fetching the original payout records
      return new StepResponse({
        type: "full_refund",
        orderId: input.orderId,
        reason: input.reason,
      })
    } else if (input.refundedItems) {
      // For partial refunds, calculate adjustments per vendor
      input.refundedItems.forEach(item => {
        const currentAdjustment = vendorAdjustments.get(item.vendorId) || 0
        vendorAdjustments.set(item.vendorId, currentAdjustment + item.originalEarnings)
      })

      return new StepResponse({
        type: "partial_refund",
        orderId: input.orderId,
        vendorAdjustments: Array.from(vendorAdjustments.entries()).map(([vendorId, amount]) => ({
          vendorId,
          adjustmentAmount: -amount, // Negative to deduct from balance
        })),
        reason: input.reason,
      })
    }

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Either full refund flag or refunded items must be provided"
    )
  }
)

// Step to process vendor refund adjustments
export const processVendorRefundAdjustmentsStep = createStep(
  "process-vendor-refund-adjustments",
  async function (
    input: {
      type: "full_refund" | "partial_refund"
      orderId: string
      vendorAdjustments?: Array<{ vendorId: string; adjustmentAmount: number }>
      reason: string
    },
    { container }
  ) {
    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    const results: Array<{
      vendorId: string
      adjustmentAmount: number
      success: boolean
      error?: string
    }> = []

    if (input.type === "full_refund") {
      // For full refunds, we need to find all vendors who received earnings for this order
      // and reverse their earnings
      try {
        const orderPayouts = await payoutModuleService.listPayouts({
          order_id: input.orderId,
          type: "earning",
        })

        for (const payout of orderPayouts) {
          try {
            await payoutModuleService.addAdjustment(
              payout.vendor_id,
              -payout.amount,
              `Full refund for order ${input.orderId}: ${input.reason}`
            )

            results.push({
              vendorId: payout.vendor_id,
              adjustmentAmount: -payout.amount,
              success: true,
            })
          } catch (error) {
            console.error(`Failed to process refund adjustment for vendor ${payout.vendor_id}:`, error)
            results.push({
              vendorId: payout.vendor_id,
              adjustmentAmount: -payout.amount,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            })
          }
        }
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Could not find payout records for order ${input.orderId}`
        )
      }
    } else if (input.vendorAdjustments) {
      // Process partial refund adjustments
      for (const adjustment of input.vendorAdjustments) {
        try {
          await payoutModuleService.addAdjustment(
            adjustment.vendorId,
            adjustment.adjustmentAmount,
            `Partial refund for order ${input.orderId}: ${input.reason}`
          )

          results.push({
            vendorId: adjustment.vendorId,
            adjustmentAmount: adjustment.adjustmentAmount,
            success: true,
          })
        } catch (error) {
          console.error(`Failed to process refund adjustment for vendor ${adjustment.vendorId}:`, error)
          results.push({
            vendorId: adjustment.vendorId,
            adjustmentAmount: adjustment.adjustmentAmount,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }
    }

    return new StepResponse(results, async () => {
      // Compensation: reverse the adjustments if workflow fails
      for (const result of results) {
        if (result.success) {
          try {
            await payoutModuleService.addAdjustment(
              result.vendorId,
              -result.adjustmentAmount,
              `Reversal of failed refund adjustment for order ${input.orderId}`
            )
          } catch (error) {
            console.error(`Failed to reverse refund adjustment for vendor ${result.vendorId}:`, error)
          }
        }
      }
    })
  }
)

export const processRefundPayoutWorkflow = createWorkflow(
  "process-refund-payout",
  function (input: ProcessRefundPayoutWorkflowInput) {
    // Step 1: Calculate what adjustments need to be made
    const refundCalculations = calculateRefundAdjustmentsStep(input)

    // Step 2: Process the vendor adjustments
    const adjustmentResults = processVendorRefundAdjustmentsStep(refundCalculations)

    return new WorkflowResponse(adjustmentResults)
  }
)

export default processRefundPayoutWorkflow
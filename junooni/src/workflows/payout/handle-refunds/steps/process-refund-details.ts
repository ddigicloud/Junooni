import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

type ProcessRefundDetailsStepInput = {
  orderId: string
  order: any
  payment_id: string
  refundInfo: {
    hasRefunds: boolean
    totalRefundAmount: number
    refundCount: number
    latestRefund: any
    allRefunds: any[]
    isFullRefund: boolean
    isPartialRefund: boolean
    refundReason: string
  }
  manual_refund_items?: Array<{
    order_item_id: string
    refund_amount?: number
  }>
}

export const processRefundDetailsStep = createStep(
  "process-refund-details",
  async (input: ProcessRefundDetailsStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
    
    console.log(`Processing refund details for order ${input.orderId}`)

    try {
      // Early return if no refunds
      if (!input.refundInfo.hasRefunds) {
        console.log(`No refunds found for payment ${input.payment_id}`)
        return new StepResponse({
          refundDetails: [],
          vendorsAffected: 0,
          totalRefundAmount: 0,
          skipped: true,
          reason: "No refunds in payment"
        })
      }

      // Check if this order has already been processed for refunds
      const { isRefunded, refundDetails: existingRefunds } = await payoutModuleService.isOrderRefunded(input.orderId)
      
      if (isRefunded && input.refundInfo.isFullRefund) {
        console.log(`Order ${input.orderId} already has refund records. Skipping duplicate processing.`)
        return new StepResponse({
          refundDetails: existingRefunds,
          vendorsAffected: 0,
          totalRefundAmount: 0,
          skipped: true,
          reason: "Order already refunded"
        })
      }

      let refundResult
      
      if (input.manual_refund_items && input.manual_refund_items.length > 0) {
        // Process partial/manual refund for specific items
        console.log(`Processing manual refund for ${input.manual_refund_items.length} items`)
        
        refundResult = await payoutModuleService.processOrderRefund(
          input.orderId,
          `${input.refundInfo.refundReason} (Payment: ${input.payment_id})`,
          input.manual_refund_items
        )
      } else if (input.refundInfo.isFullRefund) {
        // Process full order refund
        console.log(`Processing full order refund`)
        
        refundResult = await payoutModuleService.processOrderRefund(
          input.orderId,
          `Full refund - ${input.refundInfo.refundReason} (Payment: ${input.payment_id})`
        )
      } else if (input.refundInfo.isPartialRefund) {
        // Enhanced partial refund handling
        console.log(`Processing partial refund with amount: ${input.refundInfo.totalRefundAmount}`)
        
        // Get the calculated or actual order total
        const orderTotal = input.order.total || 0
        
        if (orderTotal <= 0) {
          // Fallback: calculate total from items
          const calculatedTotal = input.order.items?.reduce((sum: number, item: any) => {
            return sum + (item.total || (item.unit_price * item.quantity) || 0)
          }, 0) || 0
          
          if (calculatedTotal <= 0) {
            console.error(`Cannot calculate order total for proportional refund. Order: ${input.orderId}`)
            return new StepResponse({
              refundDetails: [],
              vendorsAffected: 0,
              totalRefundAmount: 0,
              skipped: true,
              reason: "Cannot calculate order total for proportional refund"
            })
          }
          
          // Use calculated total
          input.order.total = calculatedTotal
          console.log(`Using calculated order total: ${calculatedTotal} for order ${input.orderId}`)
        }
        
        // Calculate proportional refund
        const partialRefundRatio = input.refundInfo.totalRefundAmount / input.order.total
        console.log(`Partial refund ratio: ${partialRefundRatio} (${input.refundInfo.totalRefundAmount}/${input.order.total})`)
        
        // Create proportional refund items based on the refund ratio
        const proportionalRefundItems = input.order.items?.map((item: any) => {
          const itemTotal = item.total || (item.unit_price * item.quantity) || 0
          const refundAmount = Math.floor(itemTotal * partialRefundRatio)
          
          return {
            order_item_id: item.id,
            refund_amount: refundAmount
          }
        }).filter((item: any) => item.refund_amount > 0) || []
        
        console.log(`Created ${proportionalRefundItems.length} proportional refund items`)
        
        if (proportionalRefundItems.length > 0) {
          refundResult = await payoutModuleService.processOrderRefund(
            input.orderId,
            `Proportional refund (${(partialRefundRatio * 100).toFixed(2)}%) - ${input.refundInfo.refundReason} (Payment: ${input.payment_id})`,
            proportionalRefundItems
          )
        } else {
          console.log(`No items to refund for partial refund amount ${input.refundInfo.totalRefundAmount}`)
          return new StepResponse({
            refundDetails: [],
            vendorsAffected: 0,
            totalRefundAmount: 0,
            skipped: true,
            reason: "No items to refund for partial amount"
          })
        }
      } else {
        console.log(`No refund amount detected for payment ${input.payment_id}`)
        return new StepResponse({
          refundDetails: [],
          vendorsAffected: 0,
          totalRefundAmount: 0,
          skipped: true,
          reason: "No refund amount detected"
        })
      }

      console.log(`Successfully processed refund for order ${input.orderId}:`, {
        refundDetailsCreated: refundResult.refundDetails.length,
        vendorsAffected: refundResult.vendorsAffected,
        totalRefundAmount: refundResult.totalRefundAmount
      })

      return new StepResponse({
        ...refundResult,
        skipped: false,
        payment_id: input.payment_id,
        processed_at: new Date()
      })

    } catch (error) {
      console.error(`Failed to process refund details for order ${input.orderId}:`, error)
      
      if (error instanceof MedusaError) {
        throw error
      }
      
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to process refund details for order ${input.orderId}: ${error.message}`
      )
    }
  },
  // Compensation function - if step fails, try to reverse any refund details created
  async (data, { container }) => {
    if (!data || data.skipped || !data.refundDetails || data.refundDetails.length === 0) {
      return
    }
    
    console.log(`Compensating refund details for order - rolling back ${data.refundDetails.length} refund details`)
    
    try {
      const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
      
      // Mark refund details as cancelled and restore vendor balances
      for (const refundDetail of data.refundDetails) {
        try {
          await payoutModuleService.updatePayoutDetailStatus(
            refundDetail.id,
            "cancelled",
            "Workflow compensation - refund step failed"
          )
          
          console.log(`Cancelled refund detail ${refundDetail.id}`)
        } catch (compensationError) {
          console.warn(`Failed to cancel refund detail ${refundDetail.id}:`, compensationError)
        }
      }
      
    } catch (error) {
      console.error("Failed to compensate refund details:", error)
      // Don't throw here as it would mask the original error
    }
  }
)

export default processRefundDetailsStep
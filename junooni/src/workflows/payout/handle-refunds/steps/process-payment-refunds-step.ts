import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type ProcessPaymentRefundsStepInput = {
  payment: any
  order: any
}

export const processPaymentRefundsStep = createStep(
  "process-payment-refunds",
  async ({ payment, order }: ProcessPaymentRefundsStepInput) => {
    console.log(`📊 Processing payment refunds for payment ${payment.id}`)
    
    if (!payment.refunds || !Array.isArray(payment.refunds)) {
      return new StepResponse({
        hasRefunds: false,
        totalRefundAmount: 0,
        refundCount: 0,
        latestRefund: null,
        allRefunds: [],
        isFullRefund: false,
        isPartialRefund: false,
        refundReason: "No refunds found"
      })
    }

    const refunds = payment.refunds.filter(refund => refund && refund.amount > 0)
    
    if (refunds.length === 0) {
      return new StepResponse({
        hasRefunds: false,
        totalRefundAmount: 0,
        refundCount: 0,
        latestRefund: null,
        allRefunds: [],
        isFullRefund: false,
        isPartialRefund: false,
        refundReason: "No valid refunds found"
      })
    }

    // Calculate totals
    const totalRefundAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0)
    const paymentAmount = payment.amount || 0
    
    // Determine refund type
    const isFullRefund = totalRefundAmount >= paymentAmount
    const isPartialRefund = totalRefundAmount > 0 && totalRefundAmount < paymentAmount
    
    // Get latest refund
    const latestRefund = refunds.sort((a, b) => 
      new Date(b.created_at || b.updated_at || 0).getTime() - 
      new Date(a.created_at || a.updated_at || 0).getTime()
    )[0]
    
    // Collect refund reasons
    const refundReasons = refunds
      .map(refund => refund.refund_reason?.reason || refund.reason || "Refund processed")
      .filter(reason => reason)
    
    const refundReason = refundReasons.length > 0 
      ? refundReasons.join("; ") 
      : "Refund processed"

    const processedRefundInfo = {
      hasRefunds: true,
      totalRefundAmount,
      refundCount: refunds.length,
      latestRefund,
      allRefunds: refunds,
      isFullRefund,
      isPartialRefund,
      refundReason
    }

    console.log(`📊 Processed refund info:`, {
      refundCount: processedRefundInfo.refundCount,
      totalRefundAmount: processedRefundInfo.totalRefundAmount,
      isFullRefund: processedRefundInfo.isFullRefund,
      isPartialRefund: processedRefundInfo.isPartialRefund
    })

    return new StepResponse(processedRefundInfo)
  }
)

export default processPaymentRefundsStep
// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import { MedusaError } from "@medusajs/framework/utils"

// type GetOrderFromPaymentStepInput = {
//   payment_id: string
// }

// export const getOrderFromPaymentStep = createStep(
//   "get-order-from-payment",
//   async (input: GetOrderFromPaymentStepInput, { container }) => {
//     console.log(`Getting order information for payment: ${input.payment_id}`)

//     try {
//       // Query the payment to get order information and refund details
//       const query = container.resolve("query")
      
//       const { data: payments } = await query.graph({
//         entity: "payment",
//         fields: [
//           "id",
//           "amount",
//           "status",
//           "order_id",
//           "refunds.*",
//           "refunds.id",
//           "refunds.amount",
//           "refunds.reason",
//           "refunds.created_at"
//         ],
//         filters: {
//           id: input.payment_id,
//         },
//         options: {
//           throwIfKeyNotFound: true,
//         },
//       })

//       const payment = payments[0]
      
//       if (!payment) {
//         throw new MedusaError(
//           MedusaError.Types.NOT_FOUND,
//           `Payment ${input.payment_id} not found`
//         )
//       }

//       if (!payment.order_id) {
//         throw new MedusaError(
//           MedusaError.Types.INVALID_DATA,
//           `Payment ${input.payment_id} is not associated with an order`
//         )
//       }

//       // Get refund information
//       const refunds = payment.refunds || []
//       const totalRefundAmount = refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0)
//       const latestRefund = refunds.length > 0 ? refunds[refunds.length - 1] : null

//       const refundInfo = {
//         hasRefunds: refunds.length > 0,
//         totalRefundAmount,
//         refundCount: refunds.length,
//         latestRefund,
//         allRefunds: refunds,
//         isFullRefund: totalRefundAmount >= payment.amount,
//         isPartialRefund: totalRefundAmount > 0 && totalRefundAmount < payment.amount
//       }

//       console.log(`📊 Payment ${input.payment_id} refund info:`, {
//         orderId: payment.order_id,
//         hasRefunds: refundInfo.hasRefunds,
//         totalRefundAmount,
//         isFullRefund: refundInfo.isFullRefund,
//         isPartialRefund: refundInfo.isPartialRefund
//       })

//       return new StepResponse({
//         orderId: payment.order_id,
//         paymentAmount: payment.amount,
//         paymentStatus: payment.status,
//         refundInfo
//       })

//     } catch (error) {
//       console.error(`Failed to get order from payment ${input.payment_id}:`, error)
      
//       if (error instanceof MedusaError) {
//         throw error
//       }
      
//       throw new MedusaError(
//         MedusaError.Types.UNEXPECTED_STATE,
//         `Failed to retrieve order information for payment ${input.payment_id}: ${error.message}`
//       )
//     }
//   }
// )

// export default getOrderFromPaymentStep
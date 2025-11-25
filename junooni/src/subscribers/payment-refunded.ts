import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import handleOrderRefundPayoutsWorkflow from "../workflows/payout/handle-refunds/handle-refunded-payouts"

export default async function refundPayoutSubscriber({
  event,
  container,
}: SubscriberArgs<{
  id: string
  payment_id?: string
}>) {
  

  try {
    const payment_id = event.data.payment_id || event.data.id
    
    if (!payment_id) {
     
      return
    }

   
    // Execute the refund workflow
    const { result } = await handleOrderRefundPayoutsWorkflow(container)
      .run({
        input: {
          payment_id,
        }
      })

   
    // Log the result for monitoring
    if (result.refundResult?.skipped) {
      console.log(`Refund processing skipped: ${result.refundResult.reason}`)
    } else {
      console.log(`Successfully processed refund for order ${result.orderId}`)
    }

  } catch (error) {
    console.error(`Failed to process refund payouts for event ${event.name}:`, error)
    
    // Log error details for monitoring/debugging
    console.error("Error details:", {
      eventName: event.name,
      eventData: event.data,
      errorMessage: error.message,
      errorStack: error.stack
    })

    // Don't throw error to prevent subscriber from failing
    // In production, you might want to send this to an error monitoring service
  }
}

export const config: SubscriberConfig = {
  event: [
    "payment.refund_created",
    "payment.refunded", 
    "refund.created",
    // Add other relevant refund events based on your Medusa version
  ],
  context: {
    subscriberId: "refund-payout-processor",
  },
}
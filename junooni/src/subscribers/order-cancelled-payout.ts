import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { PAYOUT_MODULE } from "../modules/payout"
import PayoutModuleService from "../modules/payout/service"

export default async function orderCancelledPayoutSubscriber({
  event,
  container,
}: SubscriberArgs<{
  id: string
}>) {
  const orderId = event.data.id

  if (!orderId) {
    console.warn("⚠️ [order-cancelled] No order ID in event data, skipping")
    return
  }

  console.log(`🚫 [order-cancelled] Order ${orderId} was cancelled, reversing payouts...`)

  try {
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)

    // Check if this order has any earnings to refund
    const { isRefunded, refundDetails } = await payoutModuleService.isOrderRefunded(orderId)

    if (isRefunded) {
      console.log(`⚠️ [order-cancelled] Order ${orderId} already has refund records, skipping`)
      return
    }

    // Check if order has any earnings at all
    const existingEarnings = await payoutModuleService['listPayoutDetails']({
      order_id: orderId,
      type: "earning",
      status: "completed",
    })

    if (existingEarnings.length === 0) {
      console.log(`⚠️ [order-cancelled] No earnings found for order ${orderId}, nothing to reverse`)
      return
    }

    console.log(`💰 [order-cancelled] Found ${existingEarnings.length} earning(s) to reverse for order ${orderId}`)

    // Reverse the payouts
    const result = await payoutModuleService.processOrderRefund(
      orderId,
      "Order cancelled by admin/customer"
    )

    console.log(`✅ [order-cancelled] Successfully reversed payouts for order ${orderId}:`, {
      refundDetailsCreated: result.refundDetails.length,
      vendorsAffected: result.vendorsAffected,
      totalRefundAmount: result.totalRefundAmount,
    })

  } catch (error) {
    console.error(`❌ [order-cancelled] Failed to reverse payouts for order ${orderId}:`, error.message)
    // Don't throw - we don't want to block the cancellation flow
  }
}

export const config: SubscriberConfig = {
  event: ["order.canceled"],
  context: {
    subscriberId: "order-cancelled-payout-reversal",
  },
}
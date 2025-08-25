// Create: src/modules/payout/subscribers/debug-all-events.ts
// This will help us see what events are actually being fired

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function debugAllEventsHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  const eventName = typeof event === 'object' && 'name' in event ? event.name : 'unknown'
  const eventData = typeof event === 'object' && 'data' in event ? event.data : event
  
  console.log(`🔔 [EVENT-DEBUG] Event received:`, {
    eventName,
    eventType: typeof event,
    eventData: JSON.stringify(eventData, null, 2),
    timestamp: new Date().toISOString(),
    hasOrderId: eventData?.id ? true : false,
    orderId: eventData?.id || 'none'
  })
  
  // If it's an order event, log more details
  if (eventData?.id && eventName?.includes?.('order')) {
    try {
      const orderModuleService = container.resolve("orderModuleService")
      const order = await orderModuleService.retrieveOrder(eventData.id)
      
      console.log(`🔔 [EVENT-DEBUG] Order details:`, {
        id: order.id,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        payment_status: order.payment_status,
        total: order.total
      })
    } catch (error) {
      console.log(`🔔 [EVENT-DEBUG] Could not retrieve order details:`, error.message)
    }
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.*",           // All order events
    "order.completed",   // Specific event we're looking for
    "order.payment_captured",
    "order.placed",
    "order.updated",
    "order.fulfilled"
  ],
}
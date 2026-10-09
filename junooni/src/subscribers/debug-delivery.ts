import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function debugDeliveryHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  console.log("🔥🔥🔥 DEBUG EVENT FIRED:", event.name)
  console.log("🔥🔥🔥 DEBUG EVENT DATA:", JSON.stringify(event.data, null, 2))
}

export const config: SubscriberConfig = {
  event: [
    "delivery.created",
    "fulfillment.delivered",
    "order.fulfillment_delivered",
    "fulfillment.delivery_created",
    "order.delivered",
  ],
}
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/loyalty-points/handle-order-points"
import { sendOrderConfirmationWorkflow } from "../workflows/resend/send-order-confirmation"
import { handleOrderPayoutsWorkflow } from "../workflows/payout/handle-earnings/handle-add-earnings-payout"

export 
default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  
   await handleOrderPayoutsWorkflow(container).run({
    input: {
      order_id: data.id,
    },

  })

  console.log("Handling payouts for order:", data.id);
  await handleOrderPointsWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  })



  await sendOrderConfirmationWorkflow(container)
    .run({
      input: {
        id: data.id
      }
    })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
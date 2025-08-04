// import type {
//   SubscriberArgs,
//   SubscriberConfig,
// } from "@medusajs/framework"
// import { handleOrderPointsWorkflow } from "../workflows/loyalty-points/handle-order-points"
// import { sendOrderConfirmationWorkflow } from "../workflows/resend/send-order-confirmation"

// export 
// default async function orderPlacedHandler({
//   event: { data },
//   container,
// }: SubscriberArgs<{ id: string }>) {
//   await handleOrderPointsWorkflow(container).run({
//     input: {
//       order_id: data.id,
//     },
//   })

//   await sendOrderConfirmationWorkflow(container)
//     .run({
//       input: {
//         id: data.id
//       }
//     })
// }

// export const config: SubscriberConfig = {
//   event: "order.placed",
// }

import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/loyalty-points/handle-order-points"
import { sendOrderConfirmationWorkflow } from "../workflows/resend/send-order-confirmation"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
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

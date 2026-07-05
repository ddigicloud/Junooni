// import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
// import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
// import { sendNotificationStep } from "./steps/send-notification";

// type WorkflowInput = {
//   id: string
// }

// export const sendOrderConfirmationWorkflow = createWorkflow(
//   "send-order-confirmation",
//   ({ id }: WorkflowInput) => {
//     // @ts-ignore
//     const { data: orders } = useQueryGraphStep({
//       entity: "order",
//       fields: [
//         "id",
//         "custom_display_id",
//         "email",
//         "currency_code",
//         "total",
//         "items.*",
//         "items.variant.*",
//         "shipping_address.*",
//         "billing_address.*",
//         "shipping_methods.*",
//         "customer.*",
//         "total",
//         "subtotal",
//         "discount_total",
//         "shipping_total",
//         "tax_total",
//         "item_subtotal",
//         "item_total",
//         "item_tax_total",
//       ],
//       filters: {
//         id
//       }
//     })
    
//     const notification = sendNotificationStep([{
//       to: orders[0].email,
//       channel: "email",
//       template: "order-placed",
//       data: {
//         order: orders[0]
//       }
//     }])

//     return new WorkflowResponse(notification)
//   }
// )


import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { getOrderEmailBrandingStep } from "./steps/get-order-email-branding";

type WorkflowInput = {
  id: string
}

export const sendOrderConfirmationWorkflow = createWorkflow(
  "send-order-confirmation",
  ({ id }: WorkflowInput) => {
    // @ts-ignore
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "custom_display_id",
        "email",
        "currency_code",
        "total",
        "items.*",
        "items.variant.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "customer.*",
        "total",
        "subtotal",
        "discount_total",
        "shipping_total",
        "tax_total",
        "item_subtotal",
        "item_total",
        "item_tax_total",
        "sales_channel.id",
        "metadata",
      ],
      filters: {
        id
      }
    })

    const order = transform({ orders }, (data) => data.orders[0])

    const brandingInput = transform({ order }, (data) => ({
      sales_channel_id: data.order.sales_channel?.id,
      vendor_id: (data.order.metadata as any)?.vendor_ids?.[0],
    }))

    const { storeLogo, storeName, storePrimaryColor, storeUrl } =
      getOrderEmailBrandingStep(brandingInput)

    const notificationData = transform(
      { order, storeLogo, storeName, storePrimaryColor, storeUrl },
      (data) => [{
        to: data.order.email,
        channel: "email",
        template: "order-placed",
        data: {
          order: data.order,
          storeLogo: data.storeLogo,
          storeName: data.storeName,
          storePrimaryColor: data.storePrimaryColor,
          storeUrl: data.storeUrl,
        }
      }]
    )

    const notification = sendNotificationStep(notificationData)

    return new WorkflowResponse(notification)
  }
)
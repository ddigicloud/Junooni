import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import {
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification: boolean }>) {
  if (data.no_notification) return

  console.log("🚢 shipment.created fired", data)

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Single query — "order.*" traverses the Fulfillment→Order link directly
  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: [
      "id",
      "shipped_at",
      "labels.*",
      "order.id",
      "order.email",
      "order.display_id",
      "order.custom_display_id",
      "order.currency_code",
      "order.total",
      "order.item_total",
      "order.shipping_total",
      "order.tax_total",
      "order.metadata",           // ← ADD: vendor_orders lives here
      "order.sales_channel.id",
      "order.sales_channel.name",
      "order.items.*",
      "order.items.variant.*",
      "order.items.variant.metadata",
      "order.shipping_address.*",
      "order.shipping_methods.*",
      "order.customer.*",
    ],
    filters: { id: data.id },
  })

  if (!fulfillment) {
    console.warn(`Fulfillment ${data.id} not found`)
    return
  }

  const order = fulfillment.order

  if (!order?.email) {
    console.warn(`No email on order for fulfillment ${data.id}, skipping`)
    return
  }

  // ── Resolve vendor sender info from order metadata ──────────────────────
  // vendor_orders[0].vendor_handle is the store handle (e.g. "junocreator2")
  // vendor_orders[0].vendor_name   is the display name (e.g. "Junocreator2")
  // The Resend provider uses these to build: "Name <handle@junooni.com>"
  const vendorOrders = (order as any).metadata?.vendor_orders ?? []
  const isJunooniMarketplace = (order as any).sales_channel?.name === "Default Sales Channel"

  const vendorHandle = isJunooniMarketplace ? null : (vendorOrders[0]?.vendor_handle ?? null)
  const vendorName   = isJunooniMarketplace ? null : (vendorOrders[0]?.vendor_name   ?? null)

  const label = fulfillment.labels?.[0]

  console.log("📧 Sending shipped email to", order.email, "from", vendorHandle ?? "default")

  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-shipped",
    data: {
      order: {
        ...order,
        fulfillments: [fulfillment],
      },
      trackingNumber: label?.tracking_number ?? null,
      trackingUrl:    label?.tracking_url    ?? null,
      shippedAt:      fulfillment.shipped_at ?? null,
      storeName:      vendorName,    // ← provider uses this for "from" display name
      storeHandle:    vendorHandle,  // ← provider uses this for "handle@junooni.com"
    },
  })

  console.log("✅ Shipped email sent to", order.email)
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
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
      "order.metadata",
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
  const vendorOrders = (order as any).metadata?.vendor_orders ?? []
  const isJunooniMarketplace = (order as any).sales_channel?.name === "Default Sales Channel"

  const vendorHandle = isJunooniMarketplace ? null : (vendorOrders[0]?.vendor_handle ?? null)
  const vendorName   = isJunooniMarketplace ? null : (vendorOrders[0]?.vendor_name   ?? null)
  const vendorId     = isJunooniMarketplace ? null : (vendorOrders[0]?.vendor_id     ?? null)

  // ── Resolve vendor store branding (same logic as getOrderEmailBrandingStep) ──
  let storeLogo: string | null = null
  let storePrimaryColor: string | null = null
  let storeUrl: string | null = null

  if (vendorId) {
    try {
      const { data: vendors } = await query.graph({
        entity: "vendor",
        fields: [
          "id",
          "name",
          "handle",
          "vendor_store.store_logo",
          "vendor_store.custom_domain",
          "vendor_store.subdomain",
          "vendor_store.primary_color",
        ],
        filters: { id: vendorId },
      })

      const vendor = vendors?.[0]
      const vendorStore = vendor?.vendor_store

      if (vendorStore?.store_logo) {
        storeLogo = vendorStore.store_logo

        if (vendorStore.custom_domain) {
          storeUrl = `https://${vendorStore.custom_domain}`
        } else if (vendorStore.subdomain) {
          storeUrl = `https://${vendorStore.subdomain}.junooni.com`
        }

        storePrimaryColor = vendorStore.primary_color || null
      }
    } catch (e) {
      console.warn("Could not resolve vendor branding for shipped email:", e)
    }
  }

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
      trackingNumber:    label?.tracking_number ?? null,
      trackingUrl:       label?.tracking_url    ?? null,
      shippedAt:         fulfillment.shipped_at ?? null,
      storeName:         vendorName,
      storeHandle:       vendorHandle,
      storeLogo:         storeLogo,
      storePrimaryColor: storePrimaryColor,
      storeUrl:          storeUrl,
    },
  })

  console.log("✅ Shipped email sent to", order.email)
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
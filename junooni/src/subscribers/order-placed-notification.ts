import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../modules/marketplace"

// ✅ Rate limit helper — Resend allows 2 requests/sec
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default async function orderPlacedNotificationSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info(`📧 Order placed notification subscriber triggered for order: ${orderId}`)

  try {
    // ─── 1. Fetch full order details ─────────────────────────────────────────
    const { result: orders } = await getOrdersListWorkflow(container).run({
      input: {
        fields: [
          "id", "custom_display_id", "created_at", "metadata", "status",
          "total", "subtotal", "shipping_total", "tax_total",
          "currency_code", "email",
          "items.*", "items.tax_lines", "items.variant",
          "items.variant.product", "items.variant.product.metadata",
          "items.variant.metadata", "items.metadata",
          "items.product_id", "items.variant_id", "items.total",
          "shipping_methods.*", "shipping_methods.tax_total",
          "payment_collections.*", "payment_collections.payments.*",
          "fulfillments.*", "fulfillments.items.*", "fulfillments.labels.*",
          "customer.*", "shipping_address.*", "billing_address.*",
          "payment_status",
        ],
        variables: { filters: { id: [orderId] } },
      },
    })

    const order = orders?.[0]
    if (!order) {
      logger.error(`❌ Order ${orderId} not found`)
      return
    }

    logger.info(`✅ Order ${order.custom_display_id} fetched, processing notifications...`)

    // ─── 2. Get all vendor IDs from order metadata ────────────────────────────
    const vendorOrders: any[] = order.metadata?.vendor_orders || []
    logger.info(`📦 Found ${vendorOrders.length} vendor(s) in order`)

    // ─── 3. Send email to each creator with their own items ───────────────────
    for (const vendorMeta of vendorOrders) {
      const vendorId = vendorMeta.vendor_id

      try {
        // Fetch vendor basic info
        const { data: vendorData } = await query.graph({
          entity: "vendor",
          fields: ["id", "name", "handle"],
          filters: { id: vendorId },
        })

        const vendor = vendorData?.[0]
        if (!vendor) {
          logger.warn(`⚠️ Vendor ${vendorId} not found, skipping`)
          continue
        }

        // Get vendor email directly from vendor admin record
        const marketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
        const vendorAdmins = await marketplaceModuleService.listVendorAdmins({
          vendor_id: vendorId,
        })

        const vendorEmail = vendorAdmins?.[0]?.email

        if (!vendorEmail) {
          logger.warn(`⚠️ No email found for vendor ${vendorId}, skipping`)
          continue
        }

        // Filter items belonging to this vendor
        const vendorItems = (order.items || []).filter((item: any) => {
          return vendorMeta.vendor_items?.some(
            (vi: any) =>
              vi.title?.toLowerCase().trim() === item.title?.toLowerCase().trim() &&
              vi.unit_price === item.unit_price
          )
        })

        if (vendorItems.length === 0) {
          logger.warn(`⚠️ No items found for vendor ${vendorId}`)
          continue
        }

        const vendorSubtotal = vendorItems.reduce(
          (sum: number, item: any) => sum + item.unit_price * item.quantity, 0
        )

        logger.info(`📧 Sending order notification to vendor: ${vendorEmail}`)

        await notificationService.createNotifications({
          to: vendorEmail,
          channel: "email",
          template: "vendor-order-placed",
          data: {
            vendor_name: vendor.name || "Creator",
            order_id: order.custom_display_id,
            order_date: new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            }),
            customer_name: order.customer
              ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
              : "Customer",
            shipping_address: order.shipping_address
              ? [
                  order.shipping_address.address_1,
                  order.shipping_address.city,
                  order.shipping_address.province,
                  order.shipping_address.postal_code,
                ].filter(Boolean).join(", ")
              : "N/A",
            items: vendorItems.map((item: any) => ({
              title: item.title,
              subtitle: item.subtitle || item.variant?.title || "",
              sku: item.variant_sku || "",
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.unit_price * item.quantity,
            })),
            vendor_subtotal: vendorSubtotal,
            currency: order.currency_code?.toUpperCase() || "INR",
            studio_url: "https://studio.junooni.com",
          },
        })

        logger.info(`✅ Vendor order email sent to ${vendorEmail}`)

        // ✅ Wait 600ms to stay under Resend's 2 requests/sec limit
        await delay(600)

      } catch (vendorError) {
        logger.error(`❌ Failed to send email to vendor ${vendorId}:`, vendorError)
        // Delay even on error to avoid cascading rate limit hits
        await delay(600)
      }
    }

    // ─── 4. Send combined email to admin ──────────────────────────────────────
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@junooni.com"

    const allItems = (order.items || []).map((item: any) => {
      const itemVendorMeta = vendorOrders.find((vo: any) =>
        vo.vendor_items?.some(
          (vi: any) =>
            vi.title?.toLowerCase().trim() === item.title?.toLowerCase().trim() &&
            vi.unit_price === item.unit_price
        )
      )

      return {
        title: item.title,
        subtitle: item.subtitle || item.variant?.title || "",
        sku: item.variant_sku || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.unit_price * item.quantity,
        vendor_id: itemVendorMeta?.vendor_id || "unknown",
        vendor_handle: itemVendorMeta?.vendor_handle || "unknown",
      }
    })

    // ✅ Wait before admin email too
    await delay(600)

    await notificationService.createNotifications({
      to: adminEmail,
      channel: "email",
      template: "admin-order-placed",
      data: {
        order_id: order.custom_display_id,
        order_date: new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        }),
        customer_name: order.customer
          ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
          : "Customer",
        customer_email: order.email || order.customer?.email || "",
        shipping_address: order.shipping_address
          ? [
              order.shipping_address.address_1,
              order.shipping_address.city,
              order.shipping_address.province,
              order.shipping_address.postal_code,
            ].filter(Boolean).join(", ")
          : "N/A",
        items: allItems,
        total_vendors: vendorOrders.length,
        order_total: order.total,
        order_subtotal: order.subtotal,
        shipping_total: order.shipping_total,
        tax_total: order.tax_total,
        currency: order.currency_code?.toUpperCase() || "INR",
        payment_status: order.payment_status,
        store_url: "https://junooni.com",
        admin_url: `https://admin.junooni.com/orders/${order.id}`,
      },
    })

    logger.info(`✅ Admin order email sent to ${adminEmail}`)

  } catch (error) {
    logger.error(`❌ Order placed notification failed for order ${orderId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
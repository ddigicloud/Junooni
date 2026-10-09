import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { PAYOUT_MODULE } from "../modules/payout"
import PayoutModuleService from "../modules/payout/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function fulfillmentDeliveredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification: boolean }>) {
  try {
    const fulfillmentId = data.id
    console.log(`📦 Fulfillment delivered event: ${fulfillmentId}`)

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)

    // ── Get fulfillment with delivered_at ─────────────────────────────────
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "delivered_at", "items.line_item_id"],
      filters: { id: fulfillmentId },
    })

    const fulfillment = fulfillments?.[0]
    if (!fulfillment) {
      console.warn(`⚠️ Fulfillment ${fulfillmentId} not found`)
      return
    }

    console.log(`🔍 Fulfillment items:`, JSON.stringify(fulfillment.items, null, 2))

    // ── Get order_id via order_fulfillment link table ──────────────────────
    const { data: orderFulfillmentLinks } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id", "fulfillment_id"],
      filters: { fulfillment_id: fulfillmentId },
    })

    console.log(`🔍 Order fulfillment links:`, JSON.stringify(orderFulfillmentLinks, null, 2))

    const orderId = orderFulfillmentLinks?.[0]?.order_id

    if (!orderId) {
      console.warn(`⚠️ Could not resolve order_id from fulfillment ${fulfillmentId}`)
      return
    }

    console.log(`✅ Resolved order: ${orderId} from fulfillment: ${fulfillmentId}`)

    // ── Calculate release_after = delivered_at + 8 days ───────────────────
    const deliveredAt = fulfillment.delivered_at
      ? new Date(fulfillment.delivered_at)
      : new Date()

    const releaseAfter = new Date(deliveredAt.getTime() + 8 * 24 * 60 * 60 * 1000)

    console.log(`📅 Delivered: ${deliveredAt.toISOString()} | Release after: ${releaseAfter.toISOString()}`)

    // ── Find all pending earnings for this order ──────────────────────────
    const pendingEarnings = await payoutModuleService.listPayoutDetails({
      order_id: orderId,
      type: "earning",
      status: "pending",
    })

    if (pendingEarnings.length === 0) {
      console.log(`ℹ️ No pending earnings for order ${orderId}`)
      return
    }

    console.log(`💰 Found ${pendingEarnings.length} pending earnings — updating release dates`)

    // ── Update each earning's release_after date ──────────────────────────
    for (const earning of pendingEarnings) {
      let existingNotes: any = {}
      try {
        existingNotes = earning.notes ? JSON.parse(earning.notes) : {}
      } catch {}

      await payoutModuleService.updatePayoutDetails({
        id: earning.id,
        notes: JSON.stringify({
          ...existingNotes,
          hold: true,
          release_after: releaseAfter.toISOString(),
          hold_reason: "refund_window",
          delivered_at: deliveredAt.toISOString(),
          refund_window_days: 8,
        }),
      })
    }

    console.log(
      `✅ Updated ${pendingEarnings.length} earnings — ` +
      `eligible for release on ${releaseAfter.toISOString()}`
    )

  } catch (error) {
    console.error("❌ Error in fulfillmentDeliveredHandler:", error)
  }
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}
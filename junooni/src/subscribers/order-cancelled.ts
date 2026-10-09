import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { PAYOUT_MODULE } from "../modules/payout"
import PayoutModuleService from "../modules/payout/service"

// ─── Shared handler ───────────────────────────────────────────────────────────
async function handleOrderCancelOrRefund(
  orderId: string,
  reason: "order_cancelled" | "order_refunded",
  container: any
) {
  try {
    console.log(`🚫 Order ${reason}: ${orderId} — cancelling pending earnings`)

    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)

    // ── STEP 1: Handle pending earnings (not yet released) ────────────────
    const pendingEarnings = await payoutModuleService.listPayoutDetails({
      order_id: orderId,
      type: "earning",
      status: "pending",
    })

    let totalCancelledFromPendingPaise = 0

    if (pendingEarnings.length > 0) {
      console.log(`💰 Found ${pendingEarnings.length} pending earnings to cancel`)

      for (const earning of pendingEarnings) {
        await payoutModuleService.updatePayoutDetails({
          id: earning.id,
          status: "cancelled",
          notes: JSON.stringify({
            ...(earning.notes ? (() => { try { return JSON.parse(earning.notes) } catch { return {} } })() : {}),
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason,
          }),
        })
        totalCancelledFromPendingPaise += Number(earning.amount)
      }
    }

    // ── STEP 2: Handle completed earnings (already released to current_balance) ──
    // These exist if the order was delivered and 8-day window passed before refund
    const completedEarnings = await payoutModuleService.listPayoutDetails({
      order_id: orderId,
      type: "earning",
      status: "completed",
    })

    let totalClawbackFromCurrentPaise = 0

    if (completedEarnings.length > 0) {
      console.log(`💰 Found ${completedEarnings.length} completed earnings to claw back`)

      for (const earning of completedEarnings) {
        // Create a refund transaction to offset the completed earning
        const payoutId = typeof earning.payout === "string"
          ? earning.payout
          : (earning.payout as any)?.id

        if (payoutId) {
          await payoutModuleService.createPayoutDetails({
            payout_id: payoutId,
            order_id: orderId,
            order_item_id: earning.order_item_id,
            product_id: earning.product_id,
            amount: -Number(earning.amount),   // negative to offset
            tax_amount: -Number(earning.tax_amount),
            tax_type: earning.tax_type || "igst",
            payment_processing_fee: 0,
            type: "refund",
            fulfillment_type: earning.fulfillment_type,
            cost_price: earning.cost_price,
            commission_rate: earning.commission_rate,
            selling_price: earning.selling_price,
            status: "completed",
            reason: `${reason} — offsetting earning ${earning.id}`,
            notes: JSON.stringify({
              original_earning_id: earning.id,
              cancel_reason: reason,
              refunded_at: new Date().toISOString(),
            }),
          } as any)

          totalClawbackFromCurrentPaise += Number(earning.amount)
        }
      }
    }

    // ── STEP 3: Update vendor payout balances ──────────────────────────────
    // Get payout_id from whichever earnings we found
    const allAffectedEarnings = [...pendingEarnings, ...completedEarnings]
    if (allAffectedEarnings.length === 0) {
      console.log(`ℹ️ No earnings found for order ${orderId}`)
      return
    }

    const payoutId = typeof allAffectedEarnings[0].payout === "string"
      ? allAffectedEarnings[0].payout
      : (allAffectedEarnings[0].payout as any)?.id

    if (!payoutId) {
      console.warn(`⚠️ No payout ID found on earnings for order ${orderId}`)
      return
    }

    const vendorPayout = await payoutModuleService.retrievePayout(payoutId)
    if (!vendorPayout) {
      console.warn(`⚠️ Vendor payout account not found for payout ${payoutId}`)
      return
    }

    const updates: any = {
      id: payoutId,
      total_earned: Math.max(0,
        Number(vendorPayout.total_earned)
        - totalCancelledFromPendingPaise
        - totalClawbackFromCurrentPaise
      ),
      total_orders: Math.max(0, Number(vendorPayout.total_orders) - 1),
    }

    // Decrement pending_balance for cancelled pending earnings
    if (totalCancelledFromPendingPaise > 0) {
      updates.pending_balance = Math.max(0,
        Number(vendorPayout.pending_balance) - totalCancelledFromPendingPaise
      )
    }

    // Decrement current_balance for clawed-back completed earnings
    if (totalClawbackFromCurrentPaise > 0) {
      updates.current_balance = Math.max(0,
        Number(vendorPayout.current_balance) - totalClawbackFromCurrentPaise
      )
    }

    await payoutModuleService.updatePayouts(updates)

    console.log(
      `✅ Done | ` +
      `Pending cancelled: ₹${(totalCancelledFromPendingPaise / 100).toFixed(2)} | ` +
      `Current clawed back: ₹${(totalClawbackFromCurrentPaise / 100).toFixed(2)}`
    )

  } catch (error) {
    console.error(`❌ Error in handleOrderCancelOrRefund:`, error)
  }
}

// ─── Cancelled handler ────────────────────────────────────────────────────────
export default async function orderCancelledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await handleOrderCancelOrRefund(data.id, "order_cancelled", container)
}

export const config: SubscriberConfig = {
  event: ["order.canceled", "order.refund_created"],
}
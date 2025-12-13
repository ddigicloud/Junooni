import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/loyalty-points/handle-order-points"
import { sendOrderConfirmationWorkflow } from "../workflows/resend/send-order-confirmation"
import { handleOrderPayoutsWorkflow } from "../workflows/payout/handle-earnings/handle-add-earnings-payout"
import { checkManufacturerFulfillmentWorkflow } from "../workflows/manufacturers/check-manufacturer-fulfillment"

/**
 * Subscriber for order.placed event
 * Handles multiple workflows concurrently:
 * 1. Order payouts calculation
 * 2. Loyalty points assignment
 * 3. Order confirmation email
 * 4. Manufacturer fulfillment sync (Qikink, etc.)
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  console.log("🎯 Processing order workflows for order:", orderId)

  // Define all workflow promises with error handling
  const workflowPromises = [
    // Handle Order Payouts
    handleOrderPayoutsWorkflow(container)
      .run({ input: { order_id: orderId } })
      .then(() => {
        console.log("✅ Order payouts workflow completed")
        return { workflow: "payouts", success: true }
      })
      .catch((error) => {
        console.error("❌ Order payouts workflow failed:", error)
        return { workflow: "payouts", success: false, error }
      }),

    // Handle Order Points
    handleOrderPointsWorkflow(container)
      .run({ input: { order_id: orderId } })
      .then(() => {
        console.log("✅ Order points workflow completed")
        return { workflow: "points", success: true }
      })
      .catch((error) => {
        console.error("❌ Order points workflow failed:", error)
        return { workflow: "points", success: false, error }
      }),

    // Send Order Confirmation
    sendOrderConfirmationWorkflow(container)
      .run({ input: { id: orderId } })
      .then(() => {
        console.log("✅ Order confirmation workflow completed")
        return { workflow: "confirmation", success: true }
      })
      .catch((error) => {
        console.error("❌ Order confirmation workflow failed:", error)
        return { workflow: "confirmation", success: false, error }
      }),

    // Check and Handle Manufacturer Fulfillment (Qikink, etc.)
    checkManufacturerFulfillmentWorkflow(container)
      .run({ input: { order_id: orderId } })
      .then((result) => {
        if (result.order_synced) {
          console.log(`✅ Order synced to ${result.manufacturer}:`, {
            qikink_order_id: result.qikink_order_id,
            qikink_order_number: result.qikink_order_number,
            has_tracking: !!result.tracking?.tracking_number,
          })
        } else {
          console.log(`ℹ️ ${result.message}`)
        }
        return { workflow: "manufacturer_fulfillment", success: true, result }
      })
      .catch((error) => {
        console.error("❌ Manufacturer fulfillment workflow failed:", error)
        return { workflow: "manufacturer_fulfillment", success: false, error }
      }),
  ]

  // Execute all workflows concurrently and wait for all to complete
  const results = await Promise.allSettled(workflowPromises)

  // Process results and log summary
  const workflowResults = results.map((result) =>
    result.status === "fulfilled" ? result.value : { success: false, error: result.reason }
  )

  const successCount = workflowResults.filter((result) => result.success).length
  const totalCount = workflowResults.length

  console.log(`📊 Order workflows summary: ${successCount}/${totalCount} succeeded`)

  // Log details of each workflow
  workflowResults.forEach((result) => {
    if (result.success) {
      console.log(`   ✅ ${result.workflow}: Success`)
      if (result.workflow === "manufacturer_fulfillment" && result.result?.order_synced) {
        console.log(`      → Synced to ${result.result.manufacturer}`)
      }
    } else {
      console.log(`   ❌ ${result.workflow}: Failed`)
      console.error(`      Error:`, result.error?.message || result.error)
    }
  })

  // Optional: Store failed workflow information for monitoring
  const failedWorkflows = workflowResults.filter((result) => !result.success)
  if (failedWorkflows.length > 0) {
    console.warn(`⚠️ ${failedWorkflows.length} workflow(s) failed for order ${orderId}`)
    // You could emit an event here or store failure info for admin dashboard
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

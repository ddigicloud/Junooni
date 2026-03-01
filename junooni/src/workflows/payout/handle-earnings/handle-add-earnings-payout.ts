import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import getPayoutIdsForVendorsStep from "./steps/get-vendor-payouts-id-step"
import processAllPayoutDetailsStep from "./steps/process-payout-details"

type WorkflowInput = {
  order_id: string
}

export const handleOrderPayoutsWorkflow = createWorkflow(
  "handle-order-payouts",
  ({ order_id }: WorkflowInput) => {

    // Step 1: Fetch order data — include payment_collections so we can detect Razorpay vs COD
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "status",
        "payment_status",
        "metadata",
        // ── Items ──────────────────────────────────────────────
        "items.*",
        "items.id",
        "items.product_id",
        "items.variant_id",
        "items.unit_price",
        "items.quantity",
        "items.total",
        "items.tax_total",
        "items.product.*",
        "items.product.id",
        "items.product.metadata",
        "items.product.vendor.*",
        "items.product.vendor.id",
        "items.product.vendor.name",
        "items.product.vendor.metadata",
        "items.variant.*",
        "items.variant.id",
        "items.variant.metadata",
        // ── Payment collections — REQUIRED for Razorpay/COD detection ──
        "payment_collections.*",
        "payment_collections.id",
        "payment_collections.status",
        "payment_collections.payments.*",
        "payment_collections.payments.id",
        "payment_collections.payments.provider_id",
        "payment_collections.payments.amount",
        "payment_collections.payments.status",
        "payment_collections.payment_sessions.*",
        "payment_collections.payment_sessions.id",
        "payment_collections.payment_sessions.provider_id",
        "payment_collections.payment_sessions.status",
      ],
      filters: { id: order_id },
      options: { throwIfKeyNotFound: true },
    })

    const order = orders[0]

    // Step 2: Get payout IDs for all vendors involved
    const { vendorPayouts, vendorPayoutMap } = getPayoutIdsForVendorsStep({ order })

    // Step 3: Create all payout detail records
    const payoutDetailsResult = processAllPayoutDetailsStep({
      orderId: order_id,
      order,
      vendorPayoutMap,
    })

    return new WorkflowResponse({
      orderId: order_id,
      vendorPayouts,
      payoutDetailsResult,
      summary: {
        totalVendors: vendorPayouts.length,
      }
    })
  }
)

export default handleOrderPayoutsWorkflow
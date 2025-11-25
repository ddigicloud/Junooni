import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { validatePaymentRefundStep } from "./steps/validate-payment-refund"
import { processPaymentRefundsStep } from "./steps/process-payment-refunds-step"
import { processRefundDetailsStep } from "./steps/process-refund-details"
import { updateVendorRefundMetadataStep } from "./steps/update-vendor-refund-metadata"

type WorkflowInput = {
  payment_id: string
  manual_refund_items?: Array<{
    order_item_id: string
    refund_amount?: number
  }>
}

export const handleOrderRefundPayoutsWorkflow = createWorkflow(
  "handle-refund-payouts",
  ({ payment_id, manual_refund_items }: WorkflowInput) => {

    // Step 1: Fetch payment data with order relations and refunds
    const { data: payments } = useQueryGraphStep({
      entity: "payment",
      fields: [
        "id",
        "amount",
        "refunded_amount", 
        "payment_collection.*",
        "payment_collection.order.*",
        "payment_collection.order.id",
        "payment_collection.order.total",
        "payment_collection.order.subtotal",
        "payment_collection.order.tax_total",
        "payment_collection.order.shipping_total",
        "payment_collection.order.discount_total",
        "payment_collection.order.status",
        "payment_collection.order.metadata",
        "payment_collection.order.items.*",
        "payment_collection.order.items.id",
        "payment_collection.order.items.title",
        "payment_collection.order.items.product_id",
        "payment_collection.order.items.variant_id",
        "payment_collection.order.items.unit_price",
        "payment_collection.order.items.quantity", 
        "payment_collection.order.items.total",
        "payment_collection.order.items.detail.*",
        "payment_collection.order.items.detail.return_requested_quantity",
        "payment_collection.order.items.detail.return_received_quantity",
        "payment_collection.order.items.detail.quantity",
        "refunds.*",
        "refunds.id",
        "refunds.amount",
        "refunds.reason",
        "refunds.created_at",
        "refunds.refund_reason.*",
        "refunds.refund_reason.reason",
      ],
      filters: { id: payment_id },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const payment = payments[0]
    const order = payment.payment_collection?.order

    if (!order) {
      throw new Error(`No order found for payment ${payment_id}`)
    }

    // Step 2: Validate the payment refund
    const validation = validatePaymentRefundStep({
      payment,
      order,
    })

    // Step 3: Process payment refunds to extract refund information
    const refundInfo = processPaymentRefundsStep({
      payment,
      order,
    })

    // Step 4: Process refund details and update vendor balances
    const refundResult = processRefundDetailsStep({
      orderId: order.id,
      order,
      payment_id: payment_id,
      refundInfo: refundInfo,
      manual_refund_items: manual_refund_items,
    })

    // Step 5: Update vendor metadata with refund status
    const vendorMetadataResult = updateVendorRefundMetadataStep({
      order,
      refundInfo,
    })

    return new WorkflowResponse({
      orderId: order.id,
      paymentId: payment_id,
      orderTotal: order.total,
      validation,
      refundInfo,
      refundResult,
      vendorMetadataResult,
    })
  }
)

export default handleOrderRefundPayoutsWorkflow
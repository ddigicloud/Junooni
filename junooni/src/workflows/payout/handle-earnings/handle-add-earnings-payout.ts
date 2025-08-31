import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
//import { validateOrderExistsStep } from "./steps/validate-order-exists"
import getPayoutIdsForVendorsStep from "./steps/get-vendor-payouts-id-step"
import processAllPayoutDetailsStep from "./steps/process-payout-details"

type WorkflowInput = {
  order_id: string
}

export const handleOrderPayoutsWorkflow = createWorkflow(
  "handle-order-payouts",
  ({ order_id }: WorkflowInput) => {
    console.log("Starting payout workflow with payout_id resolution for order:", order_id)

    // Step 1: Fetch order data with variant metadata
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "status",
        "payment_status",
        "items.*",
        "items.id",
        "items.product_id",
        "items.variant_id", 
        "items.unit_price",
        "items.quantity",
        "items.total",
        "items.product.*",
        "items.product.id",
        "items.product.metadata",
        "items.product.vendor.*",
        "items.product.vendor.id",
        "items.product.vendor.name",
        "items.product.vendor.metadata",
        // Include variant metadata for cost price
        "items.variant.*",
        "items.variant.id", 
        "items.variant.metadata"
      ],
      filters: {
        id: order_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const order = orders[0]

    // Step 2: Validate order (optional)
    //const validationResult = validateOrderExistsStep({ order })

    // Step 3: Get payout IDs for all vendors involved
    const { vendorPayouts, vendorPayoutMap } = getPayoutIdsForVendorsStep({ order })

    // Step 4: Create all payout detail records using the payout ID mapping
    const payoutDetailsResult = processAllPayoutDetailsStep({
      orderId: order_id,
      order,
      vendorPayoutMap
    })

    return new WorkflowResponse({
      orderId: order_id,
      //validation: validationResult,
      vendorPayouts,
      payoutDetailsResult,
      summary: {
        totalVendors: vendorPayouts.length,
        //totalItems: itemPayoutInfos.length,
        //message: `Created individual payout detail records for ${itemPayoutInfos.length} items across ${vendorPayouts.length} vendors`
      }
    })
  }
)

export default handleOrderPayoutsWorkflow
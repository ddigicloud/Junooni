import {
  createWorkflow,
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  calculateVendorPayoutsStep,
  groupItemsByVendorStep,
  addVendorEarningsStep,
  validateOrderForPayoutStep,
} from "./steps"

export interface ProcessVendorPayoutWorkflowInput {
  orderId: string
  orderTotal: number
  items: Array<{
    id: string
    vendorId: string
    quantity: number
    costPrice: number
    productCost?: number
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
    lineItemTotal: number
  }>
}

export interface VendorPayoutResult {
  vendorId: string
  totalEarnings: number
  items: Array<{
    itemId: string
    earnings: number
    fulfillmentType: string
  }>
}

export const processVendorPayoutWorkflow = createWorkflow(
  "process-vendor-payout",
  function (input: ProcessVendorPayoutWorkflowInput) {
    // Step 1: Validate order for payout processing
    const validationResult = validateOrderForPayoutStep(input)

    // Step 2: Group items by vendor
    const vendorGroups = groupItemsByVendorStep(input.items)

    // Step 3: Calculate payouts for each vendor group
    const vendorPayouts = calculateVendorPayoutsStep({
      vendorGroups,
      orderId: input.orderId,
    })

    // Step 4: Process earnings for each vendor
    const payoutResults = addVendorEarningsStep({
      vendorPayouts,
      orderId: input.orderId,
    })

    return new WorkflowResponse(payoutResults)
  }
)

export default processVendorPayoutWorkflow
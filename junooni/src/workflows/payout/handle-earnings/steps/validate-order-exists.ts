import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidateOrderExistsStepInput = {
  order: {
    id: string
    status: string
    items?: any[]
  } | null | undefined
}

export const validateOrderExistsStep = createStep(
  "validate-order-exists",
  async ({ order }: ValidateOrderExistsStepInput) => {
    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Order not found"
      )
    }

    if (!order.items || order.items.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order has no items to process for payouts"
      )
    }

    // if (order.status !== "completed") {
    //   throw new MedusaError(
    //     MedusaError.Types.NOT_ALLOWED,
    //     `Cannot process payouts for order with status: ${order.status}. Order must be completed.`
    //   )
    // }
console.log("Order validation successful:", order.id)
    return new StepResponse({
      validated: true,
      orderId: order.id,
      itemCount: order.items.length
    })
  }
)

export default validateOrderExistsStep
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidatePayoutDetailDataStepInput = {
  input: {
    type: "adjustment" | "refund"
    amount: number
    reason: string
    notes?: string
    order_id?: string
    order_item_id?: string
    product_id?: string
  }
  payout: {
    id: string
    vendor_id: string
    current_balance: number
    minimum_payout_amount: number
  }
}

export const validatePayoutDetailDataStep = createStep(
  "validate-payout-detail-data",
  async ({ input, payout }: ValidatePayoutDetailDataStepInput) => {
    // Validate amount
    if (input.amount === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount cannot be zero"
      )
    }

    if (!Number.isFinite(input.amount)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount must be a valid number"
      )
    }

    // Validate reason
    if (!input.reason || input.reason.trim().length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Reason is required and cannot be empty"
      )
    }

    if (input.reason.trim().length < 5) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Reason must be at least 5 characters long"
      )
    }

    // Validate type-specific rules
    switch (input.type) {
      case "refund":
        // For refunds, ensure amount is positive (will be made negative in processing)
        if (input.amount < 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Refund amount should be positive"
          )
        }

        // Check if refund would result in negative balance
        const refundAmount = Math.abs(input.amount)
        if (payout.current_balance < refundAmount) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            `Insufficient balance for refund. Current balance: ₹${payout.current_balance}, Refund amount: ₹${refundAmount}`
          )
        }

        // Require order information for refunds
        if (!input.order_id) {
          console.warn("Refund created without order_id - this is allowed but not recommended")
        }
        break

      case "adjustment":
        // For negative adjustments, check balance impact
        if (input.amount < 0) {
          const adjustmentAmount = Math.abs(input.amount)
          if (payout.current_balance < adjustmentAmount) {
            throw new MedusaError(
              MedusaError.Types.NOT_ALLOWED,
              `Negative adjustment would result in insufficient balance. Current balance: ₹${payout.current_balance}, Adjustment: ₹${adjustmentAmount}`
            )
          }
        }
        break

      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Invalid payout detail type"
        )
    }

    // Validate optional order references
    if (input.order_id && input.order_id.trim().length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order ID cannot be empty if provided"
      )
    }

    if (input.order_item_id && input.order_item_id.trim().length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order item ID cannot be empty if provided"
      )
    }

    if (input.product_id && input.product_id.trim().length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product ID cannot be empty if provided"
      )
    }

    console.log("Payout detail input validation successful")
    
    return new StepResponse({
      validated: true,
      sanitizedInput: {
        ...input,
        reason: input.reason.trim(),
        notes: input.notes?.trim() || null,
      },
    })
  }
)

export default validatePayoutDetailDataStep
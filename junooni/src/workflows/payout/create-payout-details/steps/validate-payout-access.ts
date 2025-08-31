import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidatePayoutAccessStepInput = {
  payout: {
    id: string
    vendor_id: string
    is_payout_enabled: boolean
    hold_payouts: boolean
    hold_reason?: string
  }
  vendor_id: string
}

export const validatePayoutAccessStep = createStep(
  "validate-payout-access",
  async ({ payout, vendor_id }: ValidatePayoutAccessStepInput) => {
    if (!payout) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Payout account not found"
      )
    }

    // Check if the vendor owns this payout account
    if (payout.vendor_id !== vendor_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Access denied: You don't have permission to modify this payout account"
      )
    }

    // Check if payout account is enabled
    if (!payout.is_payout_enabled) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Payout account is disabled"
      )
    }

    // Warn if payouts are on hold (but allow adjustments)
    if (payout.hold_payouts) {
      console.warn(`Payout account ${payout.id} is on hold: ${payout.hold_reason}`)
    }

    console.log("Payout access validation successful:", payout.id)
    
    return new StepResponse({
      validated: true,
      payoutId: payout.id,
      vendorId: vendor_id,
    })
  }
)

export default validatePayoutAccessStep
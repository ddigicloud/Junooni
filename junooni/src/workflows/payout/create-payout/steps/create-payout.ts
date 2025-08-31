import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

type CreatePayoutStepInput = {
  vendor_id: string
}

export const createPayoutStep = createStep(
  "create-payout",
  async (input: CreatePayoutStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService =
      container.resolve(PAYOUT_MODULE)

    const payout = await payoutModuleService.createPayouts(input)

    return new StepResponse(payout, payout.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const payoutModuleService: PayoutModuleService =
      container.resolve(PAYOUT_MODULE)

    await payoutModuleService.deletePayouts(id)
  }
)
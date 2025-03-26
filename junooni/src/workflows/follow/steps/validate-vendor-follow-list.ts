import { InferTypeOf } from "@medusajs/framework/types"
import { Follow } from "../../../modules/follow/models/follow"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidateVendorInFollowStepInput = {
  follow: InferTypeOf<typeof Follow>
  follow_list_id: string
}

export const validateVendorInFollowStep = createStep(
  "validate-vendor-in-follow-list",
  async ({ follow, follow_list_id }: ValidateVendorInFollowStepInput, { container }) => {
    const list = follow.creators.find((list) => list.id === follow_list_id)

    if (!list) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Creator does not exist in customer's follows list",
      )
    }
  }
)
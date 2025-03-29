import { InferTypeOf } from "@medusajs/framework/types"
import { Follow } from "../../../modules/follow/models/follow"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidateVendorInFollowStepInput = {
  follow: InferTypeOf<typeof Follow>
  follow_creator_id: string
}

export const validateVendorInFollowStep = createStep(
  "validate-vendor-in-follow-list",
  async ({ follow, follow_creator_id }: ValidateVendorInFollowStepInput, { container }) => {
    const vendor = follow.creators.find((vendor) => vendor.id === follow_creator_id)

    if (!vendor) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Creator does not exist in customer's follows list",
      )
    }
  }
)
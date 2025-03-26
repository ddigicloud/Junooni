import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { InferTypeOf } from "@medusajs/framework/types"
import { Follow } from "../../../modules/follow/models/follow"

type Input = {
  follows?: InferTypeOf<typeof Follow>[]
}

export const validateFollowExistsStep = createStep(
  "validate-follow-list-exists",
  async (input: Input) => {
    if (!input.follows?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No follow list found for this customer"
      )
    }
  }
)
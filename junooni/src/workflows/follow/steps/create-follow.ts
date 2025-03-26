import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOLLOW_MODULE } from "../../../modules/follow"
import FollowModuleService from "../../../modules/follow/service"

type CreateFollowStepInput = {
  customer_id: string
}

export const createFollowStep = createStep(
  "create-follow",
  async (input: CreateFollowStepInput, { container }) => {
    const followModuleService: FollowModuleService = 
      container.resolve(FOLLOW_MODULE)

    const follow = await followModuleService.createFollows(input)

    return new StepResponse(follow, follow.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const followModuleService: FollowModuleService = 
      container.resolve(FOLLOW_MODULE)

    await followModuleService.deleteFollows(id)
  }
)
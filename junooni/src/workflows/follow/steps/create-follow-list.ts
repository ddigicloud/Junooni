import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import FollowModuleService from "../../../modules/follow/service"
import { FOLLOW_MODULE } from "../../../modules/follow"

type CreateFollowListStepInput = {
  follow_id: string
  vendor_id: string
}

export const createFollowListStep = createStep(
  "create-follow-list",
  async (input: CreateFollowListStepInput, { container }) => {
    const followModuleService: FollowModuleService = 
      container.resolve(FOLLOW_MODULE)

    const list = await followModuleService.createFollowLists(input)

    return new StepResponse(list, list.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const followModuleService: FollowModuleService = 
      container.resolve(FOLLOW_MODULE)

    await followModuleService.deleteFollowLists(id)
  }
)
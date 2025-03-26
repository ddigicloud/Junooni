import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import FollowModuleService from "../../../modules/follow/service"
import { FOLLOW_MODULE } from "../../../modules/follow"

type DeleteFollowListStepInput = {
  follow_list_id: string
}

export const unfollowCreatorStep = createStep(
  "remove-follow-list",
  async ({ follow_list_id }: DeleteFollowListStepInput, { container }) => {
    const followModuleService: FollowModuleService = container.resolve(FOLLOW_MODULE)

    await followModuleService.softDeleteFollowLists(follow_list_id)

    return new StepResponse(void 0, follow_list_id)
  },
  async (followListId, { container }) => {
    const followModuleService: FollowModuleService = container.resolve(FOLLOW_MODULE)

    await followModuleService.restoreFollowLists([followListId])
  }
)
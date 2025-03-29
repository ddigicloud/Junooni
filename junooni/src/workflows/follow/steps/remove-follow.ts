import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import FollowModuleService from "../../../modules/follow/service"
import { FOLLOW_MODULE } from "../../../modules/follow"

type DeleteFollowListStepInput = {
  follow_creator_id: string
}

export const unfollowCreatorStep = createStep(
  "unfollow-creator",
  async ({ follow_creator_id }: DeleteFollowListStepInput, { container }) => {
    const followModuleService: FollowModuleService = container.resolve(FOLLOW_MODULE)

    await followModuleService.softDeleteFollowLists(follow_creator_id)

    return new StepResponse(void 0, follow_creator_id)
  },
  async (followListId, { container }) => {
    const followModuleService: FollowModuleService = container.resolve(FOLLOW_MODULE)

    await followModuleService.restoreFollowLists([followListId])
  }
)
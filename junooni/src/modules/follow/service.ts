import { InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils"
import { Follow } from "./models/follow"
import { FollowList } from "./models/follow-list"

 class FollowModuleService extends MedusaService({
  Follow,
  FollowList
}) {

}

export default FollowModuleService
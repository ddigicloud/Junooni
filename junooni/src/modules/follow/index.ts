import FollowModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const FOLLOW_MODULE = "follow"

export default Module(FOLLOW_MODULE, {
  service: FollowModuleService,
})
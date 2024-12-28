import { Module } from "@medusajs/framework/utils";

import blankProductModuleService from "./service";

export const BLANK_MODULE = "blank"

export default Module(BLANK_MODULE, {
  service: blankProductModuleService,
})

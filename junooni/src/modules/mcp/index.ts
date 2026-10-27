import { Module } from "@medusajs/framework/utils"
import McpModuleService from "./service"

export const MCP_MODULE = "mcpModule"

export default Module(MCP_MODULE, {
  service: McpModuleService,
})
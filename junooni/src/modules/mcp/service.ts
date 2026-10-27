import { MedusaService } from "@medusajs/framework/utils"
import McpAccessToken from "./models/mcp-access-token"

class McpModuleService extends MedusaService({ McpAccessToken }) {}

export default McpModuleService
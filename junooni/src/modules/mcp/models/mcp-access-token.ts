import { model } from "@medusajs/framework/utils"

const McpAccessToken = model.define("mcp_access_token", {
  id: model.id().primaryKey(),
  vendor_id: model.text(),
  access_token: model.text(),
  scope: model.text().default("read"),
  label: model.text().nullable(),
  last_used_at: model.dateTime().nullable(),
})

export default McpAccessToken
import { model } from "@medusajs/framework/utils"
import { Follow } from "./follow"

export const FollowList = model.define("follow_list", {
  id: model.id().primaryKey(),
  vendor_id: model.text(),
  follow: model.belongsTo(() => Follow, {
    mappedBy: "creators"
  })
})
.indexes([
  {
    on: ["vendor_id", "follow_id"],
    unique: true
  }
])
// follow.ts
import { model } from "@medusajs/framework/utils"
import {FollowList } from "./follow-list"

export const Follow = model.define("follow", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  creators: model.hasMany(() => FollowList),
})
.indexes([
  {
    on: ["customer_id"],
    unique: true
  }
])

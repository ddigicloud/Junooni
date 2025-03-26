import { defineLink } from "@medusajs/framework/utils"
import FollowModule from "../modules/follow"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    ...FollowModule.linkable.follow.id,
    field: "customer_id",
  },
  CustomerModule.linkable.customer.id,
  {
    readOnly: true,
  }
)
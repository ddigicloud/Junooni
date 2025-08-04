// models/loyalty-transaction.ts
import { model } from "@medusajs/framework/utils"

const LoyaltyTransaction = model.define("loyalty_transaction", {
  id: model.id().primaryKey(),
  customer_id: model.text().searchable(),
  points: model.number(), // Can be positive or negative
  balance_after: model.number(),
  event_type: model.text().default("purchase"), // purchase, redemption, bonus, etc.
  description: model.text().nullable(),
  order_amount: model.number().nullable(),  
  reference_id: model.text().nullable(), // order_id, promotion_id, etc.
  reference_type: model.text().nullable(), // order, promotion, manual, etc.
})

export default LoyaltyTransaction
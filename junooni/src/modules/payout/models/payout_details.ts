// import { model } from "@medusajs/framework/utils"
// import Payout from "./payouts"

// // Individual transaction records for complete audit trail
// const PayoutDetails = model.define("payout_details", {
//   id: model.id().primaryKey(),
//   order_id: model.text().index("IDX_PAYOUT_ORDER_ID").nullable(),
//   order_item_id: model.text().index("IDX_PAYOUT_ORDER_ITEM_ID").nullable(),
//   product_id: model.text().index("IDX_PAYOUT_PRODUCT_ID").nullable(),
  
//   // Using float() instead of bigNumber() to store decimal values correctly
//   amount: model.float(),
//   tax_amount: model.float().default(0), 
//   tds_percentage: model.float().default(0), 
//   tds_amount: model.float().default(0), 
//   cost_price: model.float().nullable(),
//   commission_rate: model.float().nullable(), 
//   selling_price: model.float().nullable(),
  
//   type: model.enum(["earning", "payout", "adjustment", "refund"]),
//   fulfillment_type: model.enum(["creator_fulfillment", "junooni_fulfillment"]).nullable(),
//   tax_type: model.enum(["igst", "sgst-cgst"]).default("igst"),
//   status: model.enum(["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
//   reason: model.text(),
//   notes: model.text().nullable(),
//   payout: model.belongsTo(() => Payout, {
//     mappedBy: "payout_details",
//   })
// })

// export default PayoutDetails

import { model } from "@medusajs/framework/utils"
import Payout from "./payouts"

// Individual transaction records for complete audit trail
// All money fields stored as INTEGER in paise (₹1 = 100 paise) to avoid floating point issues
const PayoutDetails = model.define("payout_details", {
  id: model.id().primaryKey(),
  order_id: model.text().index("IDX_PAYOUT_ORDER_ID").nullable(),
  order_item_id: model.text().index("IDX_PAYOUT_ORDER_ITEM_ID").nullable(),
  product_id: model.text().index("IDX_PAYOUT_PRODUCT_ID").nullable(),

  // Money fields in PAISE (integer). e.g. ₹647.50 = 64750
  amount: model.number(),           // Final payout amount in paise
  tax_amount: model.number().default(0),
  tds_percentage: model.number().default(0),  // stored as basis points: 1% = 100
  tds_amount: model.number().default(0),
  cost_price: model.number().nullable(),
  commission_rate: model.number().nullable(),  // stored as basis points: 90% = 9000
  selling_price: model.number().nullable(),

  type: model.enum(["earning", "payout", "adjustment", "refund"]),
  fulfillment_type: model.enum(["creator_fulfillment", "junooni_fulfillment"]).nullable(),
  tax_type: model.enum(["igst", "sgst-cgst"]).default("igst"),
  status: model.enum(["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  reason: model.text(),
  notes: model.text().nullable(),
  payout: model.belongsTo(() => Payout, {
    mappedBy: "payout_details",
  })
})

export default PayoutDetails
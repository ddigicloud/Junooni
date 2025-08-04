import { model } from "@medusajs/framework/utils"
import Payout from "./payouts"

// Individual transaction records for complete audit trail
const PayoutDetails = model.define("payout_details", {
  id: model.id().primaryKey(),
  product_id: model.text().index("IDX_PAYOUT_PRODUCT_ID"),
  amount: model.number(), // Amount in rupees (+ for earnings, - for payouts)
  tax_amount: model.number().default(0), // Tax amount for earnings
  tax_type : model.enum(["igst", "sgst-cgst"]).default("igst"), // Type of tax applied
    tds_percentage: model.number().default(0), // TDS percentage for earnings
  tds_amount: model.number().default(0), // TDS amount deducted
  type: model.enum(["earning", "payout", "adjustment", "refund"]),
  fulfillment_type: model.enum(["creator_fulfillment", "junooni_fulfillment"]).nullable(),
   cost_price: model.number().nullable(),
    commission_rate: model.number().nullable(), 
    selling_price: model.number().nullable(),
  status: model.enum(["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  reason: model.text(),
  notes: model.text().nullable(),
  payout: model.belongsTo(() => Payout, {
    mappedBy: "payout_details",
  })
})

export default PayoutDetails
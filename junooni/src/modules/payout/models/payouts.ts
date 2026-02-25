import { model } from "@medusajs/framework/utils"
import PayoutDetails from "./payout_details"

// All money fields stored as INTEGER in paise (₹1 = 100 paise) to avoid floating point issues
const Payout = model.define("payout", {
  id: model.id().primaryKey(),
  vendor_id: model.text(),

  // Payout scheduling
  payout_period: model.text().nullable(),
  scheduled_payout_date: model.dateTime().nullable(),

  // Payment processing
  payment_method: model.enum(["bank_transfer", "paypal", "razorpay", "manual"]).nullable(),
  external_reference_id: model.text().nullable(),
  processor_response: model.text().nullable(),

  // Money fields in PAISE (integer). e.g. ₹647.50 = 64750
  payout_total: model.number().default(0).nullable(),
  current_balance: model.number().default(0),
  pending_balance: model.number().default(0),
  total_earned: model.number().default(0),
  total_paid: model.number().default(0),
  total_pending_payout: model.number().default(0),

  // Statistics
  total_orders: model.number().default(0),
  avg_order_value: model.number().default(0),  // in paise

  // Payout settings
  minimum_payout_amount: model.number().default(100000),  // ₹1000 = 100000 paise
  payout_schedule: model.enum(["weekly", "biweekly", "monthly"]).default("biweekly"),

  // Timestamps
  last_payout_at: model.dateTime().nullable(),
  last_earning_at: model.dateTime().nullable(),
  next_payout_date: model.dateTime().nullable(),

  // Status
  is_payout_enabled: model.boolean().default(true),
  hold_payouts: model.boolean().default(false),
  hold_reason: model.text().nullable(),

  payout_details: model.hasMany(() => PayoutDetails, {
    mappedBy: "payout",
  }),

  processed_at: model.dateTime().nullable(),
  created_by: model.text().nullable(),
})
.indexes([
  {
    on: ["vendor_id"],
    unique: true
  }
])

export default Payout
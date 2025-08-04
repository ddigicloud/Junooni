import { model } from "@medusajs/framework/utils"
import PayoutDetails from "./payout_details"
import PayoutBatch from "./payout_batch"

// Individual transaction records for complete audit trail
const Payout = model.define("payout", {
  id: model.id().primaryKey(),
  vendor_id: model.text().index("IDX_PAYOUT_VENDOR_ID"),
  order_id: model.text().index("IDX_PAYOUT_ORDER_ID"),
  amount: model.number(), // Amount in rupees (+ for earnings, - for payouts)
  type: model.enum(["earning", "payout", "adjustment", "refund"]),
  status: model.enum(["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  reason: model.text(),
  notes: model.text().nullable(),
   // Payout scheduling
  payout_period: model.text().nullable(), // e.g., "2025-W03"
  scheduled_payout_date: model.dateTime().nullable(),
  
  // Payment processing
  payment_method: model.enum(["bank_transfer", "paypal", "razorpay", "manual"]).nullable(),
  external_reference_id: model.text().nullable(), // Payment processor reference
  processor_response: model.text().nullable(), // JSON response from payment processor
  
  // Financial details for earnings
  payout_total: model.number().nullable(),

  current_balance: model.number().default(0), // Available for payout
  pending_balance: model.number().default(0), // Earnings not yet available for payout
  
  // Lifetime totals
  total_earned: model.number().default(0),
  total_paid: model.number().default(0),
  total_pending_payout: model.number().default(0),
  
  // Statistics
  total_orders: model.number().default(0),
  avg_order_value: model.number().default(0),
  
  // Payout settings
  minimum_payout_amount: model.number().default(1000), // $10.00 minimum
  payout_schedule: model.enum(["weekly", "biweekly", "monthly"]).default("weekly"),
  preferred_payment_method: model.enum(["bank_transfer", "paypal", "razorpay"]).default("bank_transfer"),
  
  // Timestamps
  last_payout_at: model.dateTime().nullable(),
  last_earning_at: model.dateTime().nullable(),
  next_payout_date: model.dateTime().nullable(),
  
  // Status
  is_payout_enabled: model.boolean().default(true),
  hold_payouts: model.boolean().default(false), // Admin can hold payouts
  hold_reason: model.text().nullable(),

 
  payout_details: model.hasMany(() => PayoutDetails, {
    mappedBy: "payout",
  }),
  
  // FIXED: Make payout_batch nullable so individual earnings don't require a batch
  payout_batch: model.belongsTo(() => PayoutBatch, {
    mappedBy: "payout",
  }).nullable(),
  
  // Audit fields
  processed_at: model.dateTime().nullable(),
  created_by: model.text().nullable(), // Admin user ID for manual transactions
  
})

export default Payout
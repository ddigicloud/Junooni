import { model } from "@medusajs/framework/utils"
import PayoutDetails from "./payout_details"


// Individual transaction records for complete audit trail
const Payout = model.define("payout", {
  id: model.id().primaryKey(),
  vendor_id: model.text(),
 
   // Payout scheduling
  payout_period: model.text().nullable(), // e.g., "2025-W03"
  scheduled_payout_date: model.dateTime().nullable(),
  
  // Payment processing
  payment_method: model.enum(["bank_transfer", "paypal", "razorpay", "manual"]).nullable(),
  external_reference_id: model.text().nullable(), // Payment processor reference
  processor_response: model.text().nullable(), // JSON response from payment processor
  
  // Financial details for earnings
  payout_total: model.bigNumber().default(0).nullable(),
  current_balance: model.bigNumber().default(0).nullable(),
  pending_balance: model.bigNumber().default(0).nullable(),
  total_earned: model.bigNumber().default(0).nullable(),
  total_paid: model.bigNumber().default(0).nullable(),
  total_pending_payout: model.bigNumber().default(0).nullable(),
  
  // Statistics
  total_orders: model.number().default(0),
  avg_order_value: model.bigNumber().default(0),
  
  // Payout settings
  minimum_payout_amount: model.number().default(1000), 
  payout_schedule: model.enum(["weekly", "biweekly", "monthly"]).default("biweekly"),
  //preferred_payment_method: model.enum(["bank_transfer", "paypal", "razorpay"]).default("bank_transfer"),
  
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
  
  processed_at: model.dateTime().nullable(),
  created_by: model.text().nullable(), // Admin user ID for manual transactions
  
})
.indexes([
  {
    on: ["vendor_id"],
    unique: true
  }
])




export default Payout

import { model } from "@medusajs/framework/utils"
import Payout from "./payouts"

const PayoutBatch = model.define("payout_batch", {
  id: model.id().primaryKey(),
  batch_reference: model.text().unique(),
  period: model.text(), // e.g., "2025-W03"
  status: model.enum(["pending", "processing", "completed", "failed", "partially_failed"]).default("pending"),
  
  // Batch statistics
  total_vendors: model.number().default(0),
  total_amount: model.number().default(0),
  successful_payouts: model.number().default(0),
  failed_payouts: model.number().default(0),
  
  // Processing details
  payment_method: model.enum(["bank_transfer", "paypal", "stripe", "manual"]),
  processor_batch_id: model.text().nullable(),
  processor_response: model.text().nullable(),
  
  // Timing
  scheduled_at: model.dateTime(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  // payout: model.hasMany(() => Payout, {
  //   mappedBy: "payout_batch",
  // }),

  // Metadata
  created_by: model.text().nullable(),
  notes: model.text().nullable(),
  
})

export default PayoutBatch
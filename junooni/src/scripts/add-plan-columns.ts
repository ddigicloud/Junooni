// src/scripts/add-plan-columns.ts
// Run: npx medusa exec src/scripts/add-plan-columns.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function addPlanColumns({ container }: ExecArgs) {
  const pgClient = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  console.log("Adding plan columns to vendor table...")

  await pgClient.raw(`
    ALTER TABLE "vendor"
      ADD COLUMN IF NOT EXISTS "plan"                      VARCHAR(50)  NOT NULL DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS "plan_billing_cycle"        VARCHAR(20)  DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "plan_activated_at"         TIMESTAMPTZ  DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "razorpay_subscription_id"  VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "razorpay_payment_id"       VARCHAR(255) DEFAULT NULL;
  `)

  console.log("✓ Done — 5 columns added to vendor table")
  console.log("  plan, plan_billing_cycle, plan_activated_at,")
  console.log("  razorpay_subscription_id, razorpay_payment_id")
}
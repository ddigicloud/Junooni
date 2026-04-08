// src/api/vendors/me/subscription/route.ts
// Handles GET (current), POST /create, POST /verify, POST /cancel

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import Razorpay from "razorpay"
import crypto from "crypto"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// ── Plan config ───────────────────────────────────────────────────────────────

const PLANS: Record<string, {
  product_limit: number
  custom_domain: boolean
  remove_branding: boolean
  priority_payouts: boolean
  store_live: boolean
}> = {
  free:       { product_limit: 10,  custom_domain: false, remove_branding: false, priority_payouts: false, store_live: false },
  starter:    { product_limit: 50,  custom_domain: false, remove_branding: true,  priority_payouts: false, store_live: true  },
  pro:        { product_limit: -1,  custom_domain: true,  remove_branding: true,  priority_payouts: true,  store_live: true  },
  enterprise: { product_limit: -1,  custom_domain: true,  remove_branding: true,  priority_payouts: true,  store_live: true  },
}

// Razorpay plan IDs — set these in your Razorpay dashboard and add to env
const RAZORPAY_PLAN_IDS: Record<string, string> = {
  starter_monthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY ?? "",
  starter_annual:  process.env.RAZORPAY_PLAN_STARTER_ANNUAL  ?? "",
  pro_monthly:     process.env.RAZORPAY_PLAN_PRO_MONTHLY     ?? "",
  pro_annual:      process.env.RAZORPAY_PLAN_PRO_ANNUAL      ?? "",
}

function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  })
}

async function getVendor(req: AuthenticatedMedusaRequest) {
  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendorAdminId = req.auth_context?.actor_id
  if (!vendorAdminId) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  const [vendorAdmin] = await svc.listVendorAdmins({ id: vendorAdminId }, { relations: ["vendor"] })
  if (!vendorAdmin?.vendor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
  return vendorAdmin.vendor
}

// ── GET — current subscription ────────────────────────────────────────────────

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const vendor = await getVendor(req)
  const subscriptionId = (vendor as any).razorpay_subscription_id

  if (!subscriptionId) {
    return res.json({ subscription: null, plan: (vendor as any).plan ?? "free" })
  }

  try {
    const rzp = getRazorpay()
    const sub = await rzp.subscriptions.fetch(subscriptionId)
    return res.json({ subscription: sub, plan: (vendor as any).plan ?? "free" })
  } catch (e) {
    // Razorpay fetch failed — still return plan
    return res.json({ subscription: null, plan: (vendor as any).plan ?? "free" })
  }
}

// ── POST /create — start Razorpay subscription ────────────────────────────────

const CreateSchema = z.object({
  plan_id:      z.enum(["starter", "pro"]),
  billing_cycle: z.enum(["monthly", "annual"]),
})

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { action } = req.query as { action?: string }

  if (action === "verify") return handleVerify(req, res)
  if (action === "cancel") return handleCancel(req, res)

  // Default: create subscription
  const body = CreateSchema.parse(req.body)
  const vendor = await getVendor(req)

  const rzpPlanKey = `${body.plan_id}_${body.billing_cycle}`
  const rzpPlanId = RAZORPAY_PLAN_IDS[rzpPlanKey]
  if (!rzpPlanId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `No Razorpay plan configured for ${rzpPlanKey}. Please set RAZORPAY_PLAN_${rzpPlanKey.toUpperCase()} in environment.`)
  }

  const rzp = getRazorpay()

  // Create Razorpay subscription
  const subscription = await rzp.subscriptions.create({
    plan_id:        rzpPlanId,
    total_count:    body.billing_cycle === "annual" ? 12 : 120, // 1 year or 10 years
    quantity:       1,
    customer_notify: 1,
    notes: {
      vendor_id:   vendor.id,
      vendor_name: vendor.name ?? "",
      plan_id:     body.plan_id,
      billing:     body.billing_cycle,
    },
  } as any)

  return res.json({
    subscription_id: subscription.id,
    key_id: process.env.RAZORPAY_ID,
  })
}

// ── Verify payment ────────────────────────────────────────────────────────────

async function handleVerify(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  console.log("🔵 handleVerify START")
  console.log("🔵 full body:", JSON.stringify(req.body))

  const { 
    razorpay_payment_id, 
    razorpay_subscription_id, 
    razorpay_signature, 
    plan_id, 
    billing_cycle 
  } = req.body as any

  console.log("🔵 plan_id:", plan_id)
  console.log("🔵 billing_cycle:", billing_cycle)
  console.log("🔵 payment_id:", razorpay_payment_id)
  console.log("🔵 subscription_id:", razorpay_subscription_id)
  console.log("🔵 signature:", razorpay_signature)

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    console.log("❌ Missing fields — returning early")
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing payment verification fields")
  }

  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex")

  console.log("🔵 sig match?", expectedSig === razorpay_signature)

  if (expectedSig !== razorpay_signature) {
    console.log("❌ Signature mismatch — verify failing")
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payment signature verification failed")
  }

  const vendor = await getVendor(req)
  console.log("🔵 vendor id:", vendor.id)
  console.log("🔵 vendor current plan:", (vendor as any).plan)

  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    const updateResult = await pgClient.raw(`
      UPDATE "vendor"
      SET
        plan                     = ?,
        plan_billing_cycle       = ?,
        razorpay_subscription_id = ?,
        razorpay_payment_id      = ?,
        plan_activated_at        = ?
      WHERE id = ?
    `, [
      plan_id,
      billing_cycle,
      razorpay_subscription_id,
      razorpay_payment_id,
      new Date().toISOString(),
      vendor.id,
    ])
    console.log("✅ SQL update result:", JSON.stringify(updateResult))

    // Immediately verify the update worked
    const check = await pgClient.raw(
      `SELECT plan, razorpay_subscription_id FROM "vendor" WHERE id = ?`,
      [vendor.id]
    )
    console.log("✅ DB after update:", JSON.stringify(check.rows?.[0]))

  } catch(sqlErr) {
    console.error("❌ SQL UPDATE FAILED:", sqlErr)
    throw sqlErr
  }

  const rzp = getRazorpay()
  const subscription = await rzp.subscriptions.fetch(razorpay_subscription_id)

  return res.json({ success: true, plan: plan_id, subscription })
}

// ── Cancel subscription ───────────────────────────────────────────────────────

async function handleCancel(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const vendor = await getVendor(req)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // ✅ Read subscription ID via raw SQL
  const result = await pgClient.raw(
    `SELECT razorpay_subscription_id FROM "vendor" WHERE id = ?`,
    [vendor.id]
  )
  const subscriptionId = result.rows?.[0]?.razorpay_subscription_id

  if (!subscriptionId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No active subscription found")
  }

  const rzp = getRazorpay()
  await rzp.subscriptions.cancel(subscriptionId, true)

  return res.json({ success: true, message: "Subscription will cancel at end of billing period" })
}
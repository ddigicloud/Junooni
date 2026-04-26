// src/api/vendors/me/subscription/route.ts
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import Razorpay from "razorpay"
import crypto from "crypto"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

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

// helper — read vendor with custom columns directly from DB
async function getVendorFromDB(req: AuthenticatedMedusaRequest) {
  const vendorAdminId = req.auth_context?.actor_id
  if (!vendorAdminId) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized")
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const result = await pgClient.raw(
    `SELECT v.* FROM "vendor_admin" va JOIN "vendor" v ON v.id = va.vendor_id WHERE va.id = ?`,
    [vendorAdminId]
  )
  const vendor = result.rows?.[0]
  if (!vendor) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")
  return vendor
}

// ── GET — current subscription + payment history ──────────────────────────────

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const vendor = await getVendorFromDB(req)
  const subscriptionId = vendor.razorpay_subscription_id

  if (!subscriptionId) {
    return res.json({ subscription: null, payments: [], plan: vendor.plan ?? "free" })
  }

  try {
    const rzp = getRazorpay()

    const [subResult, invoicesResult] = await Promise.allSettled([
      rzp.subscriptions.fetch(subscriptionId),
      (rzp as any).invoices.all({ subscription_id: subscriptionId, count: 100 }),
    ])

    const subscription = subResult.status === "fulfilled" ? subResult.value : null

    if (subResult.status === "rejected") {
      console.warn("[subscription] fetch failed:", subResult.reason)
    }

    if (invoicesResult.status === "rejected") {
      console.warn("[subscription] invoices.all failed:", invoicesResult.reason)
    }

    const invoices = invoicesResult.status === "fulfilled"
      ? ((invoicesResult.value as any)?.items ?? [])
      : []

    // Map invoices → payment shape the frontend expects
    // Only include invoices that have an associated payment
    const payments = invoices
      .filter((inv: any) => inv.payment_id)
      .map((inv: any) => ({
        id:              inv.payment_id,
        entity:          "payment",
        amount:          inv.amount,
        currency:        inv.currency ?? "INR",
        status:          inv.status === "paid" ? "captured" : inv.status,
        created_at:      inv.paid_at ?? inv.date,
        method:          inv.payment?.method ?? null,
        subscription_id: subscriptionId,
        invoice_id:      inv.id,
      }))

    return res.json({
      subscription,
      payments,
      plan: vendor.plan ?? "free",
    })
  } catch (e) {
    console.error("[subscription] GET failed:", e)
    return res.json({ subscription: null, payments: [], plan: vendor.plan ?? "free" })
  }
}

// ── POST — create / verify / cancel ──────────────────────────────────────────

const CreateSchema = z.object({
  plan_id:       z.enum(["starter", "pro"]),
  billing_cycle: z.enum(["monthly", "annual"]),
})

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { action } = req.query as { action?: string }

  if (action === "verify") return handleVerify(req, res)
  if (action === "cancel") return handleCancel(req, res)

  const body = CreateSchema.parse(req.body)
  const vendor = await getVendor(req)

  const rzpPlanKey = `${body.plan_id}_${body.billing_cycle}`
  const rzpPlanId = RAZORPAY_PLAN_IDS[rzpPlanKey]
  if (!rzpPlanId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `No Razorpay plan configured for ${rzpPlanKey}. Please set RAZORPAY_PLAN_${rzpPlanKey.toUpperCase()} in environment.`
    )
  }

  const rzp = getRazorpay()

  const subscription = await rzp.subscriptions.create({
    plan_id:         rzpPlanId,
    total_count:     body.billing_cycle === "annual" ? 12 : 120,
    quantity:        1,
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
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    plan_id,
    billing_cycle,
  } = req.body as any

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing payment verification fields")
  }

  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex")

  if (expectedSig !== razorpay_signature) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payment signature verification failed")
  }

  const vendor = await getVendor(req)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  await pgClient.raw(`
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

  const rzp = getRazorpay()
  const subscription = await rzp.subscriptions.fetch(razorpay_subscription_id)

  return res.json({ success: true, plan: plan_id, subscription })
}

// ── Cancel subscription ───────────────────────────────────────────────────────

async function handleCancel(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const vendor = await getVendor(req)
  const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

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
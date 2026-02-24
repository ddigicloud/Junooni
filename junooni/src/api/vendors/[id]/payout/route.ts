import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"
import { createPayoutWorkflow } from "../../../../workflows/payout/create-payout/create-payout"

const parseBigNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  if (typeof value === 'object' && value.value !== undefined) return parseFloat(value.value) || 0
  return 0
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const payoutModuleService: PayoutModuleService = req.scope.resolve(PAYOUT_MODULE)
  const { id } = req.params

  const payout = await payoutModuleService.getVendorPayout(id)

  if (!payout) {
    return res.status(404).json({ payout: null })
  }

  const parsedPayout = {
    ...payout,
    payout_total: parseBigNumber(payout.payout_total),
    current_balance: parseBigNumber(payout.current_balance),
    pending_balance: parseBigNumber(payout.pending_balance),
    total_earned: parseBigNumber(payout.total_earned),
    total_paid: parseBigNumber(payout.total_paid),
    total_pending_payout: parseBigNumber(payout.total_pending_payout),
    avg_order_value: parseBigNumber(payout.avg_order_value),
  }

  res.json({ payout: parsedPayout })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await createPayoutWorkflow(req.scope)
    .run({
      input: {
        vendor_id: id,
      }
    })

  res.json({
    Payout: result.payout
  })
}

export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const payoutModuleService: PayoutModuleService = req.scope.resolve(PAYOUT_MODULE)
  const { id } = req.params
  const { amount, notes, payment_reference } = req.body as {
    amount: number
    notes?: string
    payment_reference?: string
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" })
  }

  const payout = await payoutModuleService.getVendorPayout(id)

  if (!payout) {
    return res.status(404).json({ error: "Payout account not found" })
  }

  const currentBalance = parseBigNumber(payout.current_balance)
  const totalPaid = parseBigNumber(payout.total_paid)

  if (amount > currentBalance) {
    return res.status(400).json({
      error: `Amount (₹${amount}) exceeds current balance (₹${currentBalance.toFixed(2)})`
    })
  }

  const newCurrentBalance = Number((currentBalance - amount).toFixed(2))
  const newTotalPaid = Number((totalPaid + amount).toFixed(2))

  // Update balances first
  await payoutModuleService.updatePayouts({
    id: payout.id,
    current_balance: newCurrentBalance,
    total_paid: newTotalPaid,
    last_payout_at: new Date(),
  })

  // Record transaction in payout_details
  // Wrapped in try/catch — balance update already succeeded so don't fail the request
try {
  await payoutModuleService.createPayoutDetails({
    payout: payout.id,
    order_id: "manual_payout",        // ← placeholder, not null
    order_item_id: "manual_payout",   // ← placeholder, not null  
    product_id: "manual_payout",      // ← placeholder, not null
    amount: -amount,
    type: "payout",
    status: "completed",
    reason: `Manual payout${payment_reference ? ` - Ref: ${payment_reference}` : ''}`,
    notes: notes || null,
    tax_amount: 0,
    tds_percentage: 0,
    tds_amount: 0,
    tax_type: "igst",
  } as any)
  console.log(`✅ Payout transaction detail created for ₹${amount}`)
} catch (detailError) {
  console.warn(`⚠️ Balance updated but transaction detail failed: ${detailError.message}`)
}

  const updatedPayout = await payoutModuleService.getVendorPayout(id)

  res.json({
    success: true,
    message: `Successfully recorded payout of ₹${amount}`,
    payout: {
      ...updatedPayout,
      current_balance: parseBigNumber(updatedPayout.current_balance),
      total_paid: parseBigNumber(updatedPayout.total_paid),
      total_earned: parseBigNumber(updatedPayout.total_earned),
      pending_balance: parseBigNumber(updatedPayout.pending_balance),
      total_pending_payout: parseBigNumber(updatedPayout.total_pending_payout),
      avg_order_value: parseBigNumber(updatedPayout.avg_order_value),
    }
  })
}
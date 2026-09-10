//do not delete needed
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

type ProcessAllPayoutDetailsStepInput = {
  orderId: string
  order: any
  vendorPayoutMap: Record<string, string>
}

// ─── Money helpers ────────────────────────────────────────────────────────────
const toRupees = (paise: number): number => paise / 100
// ─────────────────────────────────────────────────────────────────────────────

const processAllPayoutDetailsStep = createStep(
  "process-all-payout-details",
  async ({ orderId, order, vendorPayoutMap }: ProcessAllPayoutDetailsStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)

    console.log(`Creating payout detail records for order ${orderId}`)

    if (!order?.items || order.items.length === 0) {
      throw new Error(`Order ${orderId} has no items`)
    }

    // ── STEP 1: Detect payment method ────────────────────────────────────────
    const payments        = order.payment_collections?.flatMap((col: any) => col.payments         || []) || []
    const paymentSessions = order.payment_collections?.flatMap((col: any) => col.payment_sessions || []) || []

    const actualProviderIds: string[] = [
      ...payments.map((p: any)        => p.provider_id),
      ...paymentSessions.map((s: any) => s.provider_id),
      order.metadata?.payment_provider,
      order.metadata?.provider_id,
    ].filter(Boolean).map((id: string) => String(id).toLowerCase())

    console.log("╔══════════════════════════════════════════════════════════╗")
    console.log(`║  processAllPayoutDetailsStep: ${orderId}`)
    console.log(`║  payment_collections count: ${order.payment_collections?.length ?? 0}`)
    console.log(`║  payments found: ${payments.length} | sessions found: ${paymentSessions.length}`)
    console.log(`║  Actual provider IDs: ${actualProviderIds.join(', ') || 'none'}`)
    console.log(`║  metadata.payment_method (excluded): ${order.metadata?.payment_method ?? 'not set'}`)
    console.log(`║  metadata.cod_order: ${order.metadata?.cod_order ?? 'not set'}`)
    console.log("╚══════════════════════════════════════════════════════════╝")

    const hasSystemDefault = actualProviderIds.some(id => id === "pp_system_default")
    const hasRazorpay      = actualProviderIds.some(id => id.includes('razorpay'))
    const hasCODProvider   = actualProviderIds.some(id =>
      id.includes('cod') || id.includes('cash_on_delivery') || id.includes('manual')
    )
    const metadataCodFlag  = order.metadata?.cod_order === true

    let isCOD: boolean
    let detectionSource: string

    if (hasSystemDefault) {
      isCOD = true
      detectionSource = "pp_system_default provider"
    } else if (hasRazorpay) {
      isCOD = false
      detectionSource = "razorpay provider"
    } else if (hasCODProvider) {
      isCOD = true
      detectionSource = "cod/manual provider string"
    } else if (metadataCodFlag) {
      isCOD = true
      detectionSource = "metadata.cod_order flag (fallback)"
    } else {
      isCOD = false
      detectionSource = "default (no COD signals found)"
    }

    const paymentMethod = isCOD ? 'cod' : 'razorpay'

    console.log(`💳 Detection source: ${detectionSource}`)
    console.log(`💳 Payment: ${paymentMethod} | hasSystemDefault=${hasSystemDefault} | hasRazorpay=${hasRazorpay} | hasCODProvider=${hasCODProvider} | metadataCodFlag=${metadataCodFlag}`)
    console.log(`💳 Fee: ${isCOD ? "COD — flat ₹35 split across vendor items" : "Online — Razorpay 2.36% will be deducted"}`)

    // ── STEP 2: Group items by vendor ─────────────────────────────────────────
    const vendorItemsMap = new Map<string, any[]>()
    for (const item of order.items) {
      if (!item.product?.vendor) continue
      const vendors = Array.isArray(item.product.vendor)
        ? item.product.vendor
        : [item.product.vendor]
      for (const vendor of vendors) {
        if (!vendor?.id) continue
        if (!vendorItemsMap.has(vendor.id)) vendorItemsMap.set(vendor.id, [])
        vendorItemsMap.get(vendor.id)!.push(item)
      }
    }

    const createdDetails: any[] = []
    const vendorBalanceUpdates  = new Map<string, number>() // paise

    // ── STEP 3: Process each vendor ──────────────────────────────────────────
    for (const [vendorId, vendorItems] of vendorItemsMap.entries()) {
      const payoutId = vendorPayoutMap[vendorId]
      if (!payoutId) {
        console.error(`No payout ID found for vendor ${vendorId}`)
        continue
      }

      console.log("──────────────────────────────────────────────────────────")
      console.log(`🏪 Vendor: ${vendorId} | Products: ${vendorItems.length}`)

      for (const item of vendorItems) {
        try {
          console.log(`\n📦 Item: ${item.id}`)

          // ── Parse fulfillment type ──────────────────────────────────────
          let fulfillmentType: "creator_fulfillment" | "junooni_fulfillment" = "creator_fulfillment"
          if (item.product.metadata?.fulfillment_type) {
            try {
              let fd = item.product.metadata.fulfillment_type
              if (typeof fd === 'string') fd = JSON.parse(fd)
              if (fd && typeof fd === 'object' && fd.type) {
                const t = fd.type.toLowerCase()
                if (t.includes('junooni'))      fulfillmentType = "junooni_fulfillment"
                else if (t.includes('creator')) fulfillmentType = "creator_fulfillment"
              }
            } catch (e) {
              console.error('💥 Failed to parse fulfillment type:', e)
            }
          }
          console.log(`🎯 Fulfillment: ${fulfillmentType}`)

          // ── Resolve unit price → rupees ───────────────────────────────
          const rawUnitPrice    = item.unit_price
          const rawTaxTotal     = item.tax_total
          const unitPriceRupees = rawUnitPrice > 10000 ? toRupees(rawUnitPrice) : rawUnitPrice
          const itemTotalRupees = unitPriceRupees * item.quantity
          const taxTotalRupees  = rawTaxTotal
            ? (rawTaxTotal > 10000 ? toRupees(rawTaxTotal) : rawTaxTotal)
            : 0

          const costPriceRupees = Number(
            item.variant?.metadata?.cost_price ||
            item.product?.metadata?.cost_price ||
            0
          )

          console.log('💰 Values (rupees):', {
            raw_unit_price: rawUnitPrice,
            unitPriceRupees,
            itemTotalRupees,
            taxTotalRupees,
            costPriceRupees,
            paymentMethod,
          })

          if (fulfillmentType === "junooni_fulfillment" && costPriceRupees > itemTotalRupees) {
            console.warn(`⚠️ Skipping ${item.id} — cost ₹${costPriceRupees} > total ₹${itemTotalRupees}`)
            continue
          }

          // ── Calculate earnings ────────────────────────────────────────
          // Deduction order (enforced in calculateEarningsFromOrder):
          //
          //  ONLINE (razorpay):
          //    junooni  → [1] GST  [2] Razorpay 2.36%  [3] cost
          //    creator  → [1] Razorpay 2.36%  [2] ×90%
          //
          //  COD:
          //    junooni  → [1] GST  [2] cost   ← NO processing fee
          //    creator  → [1] ×90%             ← NO processing fee
          const earnings = await payoutModuleService.calculateEarningsFromOrder(
            itemTotalRupees,
            fulfillmentType,
            costPriceRupees,
            item.quantity,
            taxTotalRupees,
            paymentMethod,
            undefined // never deduct COD fee from vendor — customer already paid it
          )

          console.log('📊 Earnings (rupees):', {
            gross:         earnings.grossAmount,
            tax:           earnings.taxAmount,
            processingFee: earnings.paymentProcessingFee,
            vendorShare:   earnings.commissionAmount,
            net:           earnings.netAmount,
          })

          // ── Store in DB ───────────────────────────────────────────────
          // All monetary values stored as PAISE (integer)
          const payoutDetailInput = {
            payout_id:              payoutId,
            order_id:               orderId,
            order_item_id:          item.id,
            product_id:             item.product_id,
            amount:                 Math.round(earnings.netAmount             * 100),
            tax_amount:             Math.round(earnings.taxAmount             * 100),
            tax_type:               "igst" as const,
            payment_processing_fee: Math.round(earnings.paymentProcessingFee * 100),
            type:                   "earning" as const,
            fulfillment_type:       fulfillmentType,
            cost_price:             Math.round(costPriceRupees                * 100),
            commission_rate:        Math.round(earnings.commissionRate        * 100), // 90 → 9000
            selling_price:          Math.round(itemTotalRupees                * 100),
            status:                 "completed" as const,
            reason:                 `Order earnings - ${orderId} - ${item.product_id}`,
            notes:                  null,
          }

          console.log('💾 Storing (paise):', {
            amount:        payoutDetailInput.amount,
            tax_amount:    payoutDetailInput.tax_amount,
            selling_price: payoutDetailInput.selling_price,
            cost_price:    payoutDetailInput.cost_price,
          })

          const payoutDetail = await payoutModuleService.createPayoutDetails(payoutDetailInput)

          createdDetails.push({
            payoutDetailId: payoutDetail.id,
            itemId:         item.id,
            vendorId,
            amount:         earnings.netAmount,
          })

          const prev = vendorBalanceUpdates.get(vendorId) || 0
          vendorBalanceUpdates.set(vendorId, prev + Math.round(earnings.netAmount * 100))

          console.log(`✅ Created ${payoutDetail.id} | Net: ₹${earnings.netAmount.toFixed(2)}`)

        } catch (error) {
          console.error(`Failed for item ${item.id}:`, error)
          throw new Error(`Failed to create payout detail for item ${item.id}: ${error.message}`)
        }
      }
    }

    // ── STEP 4: Update vendor balances ───────────────────────────────────────
    console.log(`\nUpdating balances for ${vendorBalanceUpdates.size} vendors`)

    for (const [vendorId, totalPaise] of vendorBalanceUpdates.entries()) {
      const vendorPayout = await payoutModuleService.getVendorPayout(vendorId)
      if (vendorPayout) {
        const newTotalEarned    = Number(vendorPayout.total_earned)    + totalPaise
        const newCurrentBalance = Number(vendorPayout.current_balance) + totalPaise
        const newTotalOrders    = Number(vendorPayout.total_orders)    + 1

        await payoutModuleService.updatePayouts({
          id:              vendorPayout.id,
          current_balance: newCurrentBalance,
          total_earned:    newTotalEarned,
          total_orders:    newTotalOrders,
          last_earning_at: new Date(),
          avg_order_value: Math.round(newTotalEarned / newTotalOrders),
        })

        console.log(`💼 Vendor ${vendorId}: +₹${toRupees(totalPaise).toFixed(2)} | Balance: ₹${toRupees(newCurrentBalance).toFixed(2)}`)
      }
    }

    console.log(`\n✅ Done — ${createdDetails.length} payout details created`)

    return new StepResponse({
      success: true,
      orderId,
      payoutDetailsCreated: createdDetails.length,
      vendorsUpdated:       vendorBalanceUpdates.size,
      createdDetails,
    })
  },

  // Compensation — rollback on workflow failure
  async (data, { container }) => {
    if (!data?.success || !data.createdDetails) return
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
    console.log(`Rolling back ${data.createdDetails.length} payout details for ${data.orderId}`)
    for (const detail of data.createdDetails) {
      try {
        await payoutModuleService.deletePayoutDetails(detail.payoutDetailId)
      } catch (e) {
        console.warn(`Failed to delete ${detail.payoutDetailId}:`, e)
      }
    }
  }
)

export default processAllPayoutDetailsStep
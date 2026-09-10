import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Payout from "./models/payouts"
import PayoutBatch from "./models/payout_batch"
import PayoutDetails from "./models/payout_details"
import { InferTypeOf } from "@medusajs/framework/types"

type Payout = InferTypeOf<typeof Payout>
type PayoutBatch = InferTypeOf<typeof PayoutBatch>
type PayoutDetails = InferTypeOf<typeof PayoutDetails>

// ─── Money helpers ────────────────────────────────────────────────────────────
/** Convert rupees (float) → paise (integer). ₹647.50 → 64750 */
const toPaise = (rupees: number): number => Math.round(rupees * 100)

/** Convert paise (integer) → rupees (float). 64750 → 647.50 */
const toRupees = (paise: number): number => paise / 100
// ─────────────────────────────────────────────────────────────────────────────

interface OrderLineItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
  payment_method?: string   // ← ADDED: payment method per line item (optional, order-level used instead)
  product: {
    id: string
    metadata?: {
      fulfillment_type?: string
    }
    vendor: Array<{
      id: string
      name: string
      metadata?: Record<string, any>
    }>
  }
  variant?: {
    id: string
    metadata?: {
      cost_price?: number
    }
  }
}

// EarningsCalculation always works in RUPEES internally, conversion happens at save time
interface EarningsCalculation {
  grossAmount: number          // rupees
  commissionAmount: number     // rupees
  taxAmount: number            // rupees
  paymentProcessingFee: number // rupees
  netAmount: number            // rupees
  commissionRate: number       // percentage (e.g. 90)
}

interface VendorEarningsReport {
  vendorId: string
  totalEarnings: number   // rupees
  totalPaid: number       // rupees
  currentBalance: number  // rupees
  totalOrders: number
  productBreakdown: Array<{
    productId: string
    totalAmount: number
    orderCount: number
  }>
}

function parseFulfillmentType(metadata?: any): "creator_fulfillment" | "junooni_fulfillment" {
  let fulfillmentType: "creator_fulfillment" | "junooni_fulfillment" = "creator_fulfillment"

  if (!metadata?.fulfillment_type) {
    return fulfillmentType
  }

  try {
    let fulfillmentData = metadata.fulfillment_type

    if (typeof fulfillmentData === 'string') {
      try {
        fulfillmentData = JSON.parse(fulfillmentData)
      } catch (e) {
        const typeMatch = fulfillmentData.match(/"type"\s*:\s*"([^"]+)"/i)
        if (typeMatch) {
          fulfillmentData = { type: typeMatch[1] }
        } else {
          const lowerStr = fulfillmentData.toLowerCase()
          if (lowerStr.includes('junooni')) return "junooni_fulfillment"
          if (lowerStr.includes('creator')) return "creator_fulfillment"
          return fulfillmentType
        }
      }
    }

    if (fulfillmentData && typeof fulfillmentData === 'object' && fulfillmentData.type) {
      const typeValue = fulfillmentData.type.toLowerCase()
      if (typeValue.includes('junooni')) fulfillmentType = "junooni_fulfillment"
      else if (typeValue.includes('creator')) fulfillmentType = "creator_fulfillment"
    }
  } catch (parseError) {
    // silent
  }

  return fulfillmentType
}

function extractCostPrice(variantMetadata?: any, productMetadata?: any): number {
  if (variantMetadata?.cost_price !== undefined && variantMetadata?.cost_price !== null) {
    const costPrice = Number(variantMetadata.cost_price)
    if (!isNaN(costPrice) && costPrice >= 0) return costPrice
  }

  if (productMetadata?.cost_price !== undefined && productMetadata?.cost_price !== null) {
    const costPrice = Number(productMetadata.cost_price)
    if (!isNaN(costPrice) && costPrice >= 0) return costPrice
  }

  if (productMetadata?.payload_integration) {
    try {
      let payloadData = productMetadata.payload_integration
      if (typeof payloadData === 'string') payloadData = JSON.parse(payloadData)
      if (payloadData.base_cost !== undefined && payloadData.base_cost !== null) {
        const baseCost = Number(payloadData.base_cost)
        if (!isNaN(baseCost) && baseCost >= 0) return baseCost
      }
    } catch (e) { /* silent */ }
  }

  return 0
}

class PayoutModuleService extends MedusaService({
  Payout,
  PayoutDetails,
  PayoutBatch,
}) {

  /**
   * Process order earnings
   *
   * FIX: paymentMethod is now a required parameter so Razorpay/COD fees
   * are correctly deducted. Pass it from your subscriber/workflow like:
   *
   *   await payoutModuleService.processOrderEarnings(
   *     order.id,
   *     order.items,
   *     order.payment_method ?? order.payments?.[0]?.provider_id
   *   )
   *
   * NOTE: unit_price from Medusa is in PAISE (Medusa stores all prices as integers)
   */
  async processOrderEarnings(
    orderId: string,
    lineItems: OrderLineItem[],
    paymentMethod?: string   // ← ADDED: e.g. "razorpay", "cod", "cash_on_delivery"
  ): Promise<void> {
    const existingDetails = await this.listPayoutDetails({ order_id: orderId })
    if (existingDetails.length > 0) return

    const isCOD = paymentMethod === 'cod' || paymentMethod === 'cash_on_delivery'

    console.log("╔══════════════════════════════════════════════════════════╗")
    console.log(`║  processOrderEarnings: ${orderId}`)
    console.log(`║  Payment Method: ${paymentMethod || "online (no method specified)"}`)
    console.log(`║  Fee Type: ${isCOD ? "COD flat ₹35" : "Razorpay 2.36% per product"}`)
    console.log("╚══════════════════════════════════════════════════════════╝")

    // ── Group line items by vendor so COD fee can be split correctly ──────
    const vendorItemsMap = new Map<string, OrderLineItem[]>()
    for (const item of lineItems) {
      if (!item.product.vendor?.length) continue
      for (const vendor of item.product.vendor) {
        if (!vendor?.id) continue
        if (!vendorItemsMap.has(vendor.id)) vendorItemsMap.set(vendor.id, [])
        vendorItemsMap.get(vendor.id)!.push(item)
      }
    }

    // ── Process per vendor ────────────────────────────────────────────────
    for (const [vendorId, vendorItems] of vendorItemsMap.entries()) {

      // COD ₹35 is a single charge per order — split equally across all
      // products of this vendor so total deduction = ₹35, not ₹35 × n
      const codFeePerItem = isCOD ? 35 / vendorItems.length : 0

      console.log("──────────────────────────────────────────────────────────")
      console.log(`🏪 Vendor: ${vendorId} | Products in order: ${vendorItems.length}`)
      if (isCOD) {
        console.log(`💳 COD ₹35 ÷ ${vendorItems.length} = ₹${codFeePerItem.toFixed(2)} deducted per product`)
      } else {
        console.log(`💳 Razorpay 2.36% will be deducted from each product's total`)
      }
      console.log("──────────────────────────────────────────────────────────")

      for (const item of vendorItems) {
        const existingItemDetail = await this.listPayoutDetails({
          order_id: orderId,
          order_item_id: item.id,
        })
        if (existingItemDetail.length > 0) continue

        try {
          const fulfillmentType = parseFulfillmentType(item.product.metadata)
          const costPriceRupees = extractCostPrice(item.variant?.metadata, item.product.metadata)

          // item.unit_price is in paise from Medusa → convert to rupees
          const itemTotalRupees = toRupees(item.unit_price * item.quantity)

          const earnings = await this.calculateEarningsFromOrder(
            itemTotalRupees,
            fulfillmentType,
            costPriceRupees,
            item.quantity,
            undefined,           // taxTotalRupees
            paymentMethod,       // ← FIXED: was never passed before
            isCOD ? codFeePerItem : undefined  // pre-split COD fee
          )

          await this.createPayoutDetailForProduct({
            vendorId,
            orderId,
            orderItemId: item.id,
            productId: item.product.id,
            earnings,
            fulfillmentType,
            costPrice: costPriceRupees,
            sellingPrice: itemTotalRupees,
            quantity: item.quantity,
          })

          await this.addEarningsToVendorAccount(vendorId, earnings.netAmount)

        } catch (error) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Failed to process earnings for vendor ${vendorId} on item ${item.id}: ${error.message}`
          )
        }
      }
    }
  }

  /**
   * Create payout detail for individual product
   * Converts rupees → paise before saving
   */
  private async createPayoutDetailForProduct(params: {
    vendorId: string
    orderId: string
    orderItemId: string
    productId: string
    earnings: EarningsCalculation
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
    costPrice: number    // rupees
    sellingPrice: number // rupees
    quantity: number
  }): Promise<PayoutDetails> {
    const vendorPayout = await this.getOrCreateVendorPayout(params.vendorId)

    return await this.createPayoutDetails({
      order_id: params.orderId,
      order_item_id: params.orderItemId,
      product_id: params.productId,
      amount: toPaise(params.earnings.netAmount),
      tax_amount: toPaise(params.earnings.taxAmount),
      tax_type: "igst",
      payment_processing_fee: toPaise(params.earnings.paymentProcessingFee),
      type: "earning",
      fulfillment_type: params.fulfillmentType,
      cost_price: toPaise(params.costPrice),
      commission_rate: Math.round(params.earnings.commissionRate * 100), // 90% → 9000
      selling_price: toPaise(params.sellingPrice),
      status: "completed",
      reason: `Order earnings - ${params.orderId} - ${params.productId}`,
      payout_id: vendorPayout.id,
    })
  }

  /**
   * Add earnings to vendor account balance
   * amount is in RUPEES, stored as PAISE
   */
  private async addEarningsToVendorAccount(vendorId: string, amountRupees: number): Promise<Payout> {
    if (amountRupees <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Earnings amount must be positive")
    }

    const vendorPayout = await this.getOrCreateVendorPayout(vendorId)
    const amountPaise = toPaise(amountRupees)

    return await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: vendorPayout.current_balance + amountPaise,
      total_earned: vendorPayout.total_earned + amountPaise,
      total_orders: vendorPayout.total_orders + 1,
      last_earning_at: new Date(),
      avg_order_value: Math.round((vendorPayout.total_earned + amountPaise) / (vendorPayout.total_orders + 1)),
    })
  }

  async getOrCreateVendorPayout(vendorId: string): Promise<Payout> {
    const existingPayout = await this.getVendorPayout(vendorId)
    if (existingPayout) return existingPayout

    return await this.createPayouts({
      vendor_id: vendorId,
      current_balance: 0,
      pending_balance: 0,
      total_earned: 0,
      total_paid: 0,
      total_pending_payout: 0,
      total_orders: 0,
      avg_order_value: 0,
      minimum_payout_amount: 100000, // ₹1000 in paise
      payout_schedule: "weekly",
      is_payout_enabled: true,
      hold_payouts: false,
      next_payout_date: this.getNextPayoutDate(),
    })
  }

  async getVendorPayout(vendorId: string): Promise<Payout | null> {
    const payouts = await this.listPayouts({ vendor_id: vendorId })
    return payouts[0] || null
  }

  async getBalance(vendorId: string): Promise<number> {
    const payout = await this.getVendorPayout(vendorId)
    return toRupees(payout?.current_balance || 0)
  }

  /**
   * Calculate earnings from a single order line item.
   * All inputs and outputs are in RUPEES. Conversion to paise happens at save time.
   *
   * ─── Fee logic ────────────────────────────────────────────────────────────
   *
   * ONLINE (Razorpay):
   *   creator_fulfillment  → (orderTotal - 2.36%) × 90% = net
   *   junooni_fulfillment  → (orderTotal - GST - 2.36%) - cost = net
   *
   * COD:
   *   creator_fulfillment  → (orderTotal × 90%) - codFeeShare = net
   *   junooni_fulfillment  → (orderTotal - GST - codFeeShare) - cost = net
   *   codFeeShare = ₹35 ÷ number of vendor's products in the order
   *                 (passed as overrideCodFee from processOrderEarnings)
   *
   * JUNOONI FULFILLMENT example (online, ₹2000 order, cost ₹800):
   *   GST (5/105)         = ₹95.24  → Net Revenue  = ₹1904.76
   *   Razorpay 2.36%      = ₹47.20  → After Gateway = ₹1857.56
   *   Cost                = ₹800.00 → Net payout    = ₹1057.56
   * ─────────────────────────────────────────────────────────────────────────
   *
   * @param overrideCodFee  Pre-split COD fee per product (supplied by processOrderEarnings).
   *                        When calling standalone (e.g. admin preview), omit this and the
   *                        full ₹35 is used as a safe default.
   */
  async calculateEarningsFromOrder(
    orderTotalRupees: number,
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment",
    costPriceRupees?: number,
    quantity: number = 1,
    taxTotalRupees?: number,
    paymentMethod?: string,
    overrideCodFee?: number  // ← pre-split COD fee from processOrderEarnings
  ): Promise<EarningsCalculation> {
    if (orderTotalRupees < 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Order total cannot be negative")
    }
    if (quantity <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Quantity must be positive")
    }

    const isCOD = paymentMethod === 'cod' || paymentMethod === 'cash_on_delivery'

    // ── STEP 1: Determine payment processing fee ──────────────────────────
    // ONLINE → Razorpay 2.36% of gross order total
    // COD    → Flat ₹35 per order split across vendor's products (or full ₹35 for standalone calls)
    const paymentProcessingFee: number = isCOD
      ? 0 // COD fee is collected from customer as a line item, not deducted from vendor
      : orderTotalRupees * 0.0236

    let netAmount = 0
    let commissionRate = 0
    let taxAmount = 0

    switch (fulfillmentType) {

      // ── CREATOR FULFILLMENT ─────────────────────────────────────────────
      // Deduction order:
      //   ONLINE → STEP 1: Razorpay fee  STEP 2: 90% commission
      //   COD    → STEP 1: 90% commission  STEP 2: COD fee
      case "creator_fulfillment": {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("🎨 CREATOR FULFILLMENT PAYOUT CALCULATION")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log(`📦 [GROSS]  Order Total:              ₹${orderTotalRupees.toFixed(2)}`)
        console.log(`🔢         Quantity:                  ${quantity}`)
        console.log(`💳         Payment Method:            ${paymentMethod || "online"}`)

        if (isCOD) {
          // COD: 90% first, then deduct flat fee
          const grossVendorShare = orderTotalRupees * 0.90
          const afterCodFee = grossVendorShare - paymentProcessingFee
          netAmount = afterCodFee
          commissionRate = 90
          taxAmount = 0

          console.log(`📊 [STEP 1] Commission (90%):         ₹${orderTotalRupees.toFixed(2)} × 0.90 = ₹${grossVendorShare.toFixed(2)}`)
          console.log(`💳 [STEP 2] COD Fee (this product):   ₹${grossVendorShare.toFixed(2)} - ₹${paymentProcessingFee.toFixed(2)} = ₹${afterCodFee.toFixed(2)}`)
        } else {
          // ONLINE: Razorpay fee first, then 90%
          const afterGateway = orderTotalRupees - paymentProcessingFee
          const afterCommission = afterGateway * 0.90
          netAmount = afterCommission
          commissionRate = 90
          taxAmount = 0

          console.log(`💳 [STEP 1] Razorpay Fee (2.36%):     ₹${orderTotalRupees.toFixed(2)} × 0.0236 = ₹${paymentProcessingFee.toFixed(2)}`)
          console.log(`📉 [STEP 1] After Gateway Fee:         ₹${orderTotalRupees.toFixed(2)} - ₹${paymentProcessingFee.toFixed(2)} = ₹${afterGateway.toFixed(2)}`)
          console.log(`📊 [STEP 2] Commission (90%):          ₹${afterGateway.toFixed(2)} × 0.90 = ₹${netAmount.toFixed(2)}`)
        }

        console.log(`🏛️          Tax Amount:                ₹0.00 (not applicable for creator fulfillment)`)
        console.log(`✅ [FINAL]  Net Payout to Vendor:       ₹${netAmount.toFixed(2)}`)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        break
      }

      // ── JUNOONI FULFILLMENT ─────────────────────────────────────────────
      // Deduction order (online):
      //   STEP 1: GST extracted (5/105 of gross)
      //   STEP 2: Razorpay 2.36% of gross (deducted from net revenue)
      //   STEP 3: Manufacturing cost deducted → this is vendor profit = net payout
      case "junooni_fulfillment": {
        if (costPriceRupees === undefined || costPriceRupees === null) {
          throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cost price is required for Junooni fulfillment")
        }

        const totalCostPrice = costPriceRupees * quantity

        // STEP 1 → Extract GST (tax is included in the order total)
        if (taxTotalRupees !== undefined && taxTotalRupees !== null && taxTotalRupees > 0) {
          taxAmount = taxTotalRupees
        } else {
          taxAmount = orderTotalRupees * 5 / 105
        }
        const netRevenue = orderTotalRupees - taxAmount

        // STEP 2 → Deduct payment processing fee from net revenue (after GST)
        const netAfterGateway = netRevenue - paymentProcessingFee

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("🏭 JUNOONI FULFILLMENT PAYOUT CALCULATION")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log(`📦 [GROSS]  Order Total:              ₹${orderTotalRupees.toFixed(2)}`)
        console.log(`🔢         Quantity:                  ${quantity}`)
        console.log(`💳         Payment Method:            ${paymentMethod || "online"}`)
        console.log(`🏛️  [STEP 1] GST Extracted (5/105):   ₹${orderTotalRupees.toFixed(2)} × 5/105 = ₹${taxAmount.toFixed(2)}`)
        console.log(`📉 [STEP 1] Net Revenue (after GST):  ₹${orderTotalRupees.toFixed(2)} - ₹${taxAmount.toFixed(2)} = ₹${netRevenue.toFixed(2)}`)
        if (isCOD) {
          console.log(`💳 [STEP 2] COD Fee (this product):   ₹${netRevenue.toFixed(2)} - ₹${paymentProcessingFee.toFixed(2)} = ₹${netAfterGateway.toFixed(2)}`)
        } else {
          console.log(`💳 [STEP 2] Razorpay Fee (2.36%):     ₹${orderTotalRupees.toFixed(2)} × 0.0236 = ₹${paymentProcessingFee.toFixed(2)}`)
          console.log(`📉 [STEP 2] Net After Gateway:        ₹${netRevenue.toFixed(2)} - ₹${paymentProcessingFee.toFixed(2)} = ₹${netAfterGateway.toFixed(2)}`)
        }
        console.log(`🧮 [STEP 3] Unit Cost = ₹${costPriceRupees} × Qty ${quantity} = ₹${totalCostPrice}`)

        if (totalCostPrice > netAfterGateway) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Total cost (₹${totalCostPrice}) exceeds net after fees (₹${netAfterGateway.toFixed(2)})`
          )
        }

        // STEP 3 → Deduct cost → vendor profit = net payout
        netAmount = netAfterGateway - totalCostPrice
        commissionRate = orderTotalRupees > 0 ? (netAmount / orderTotalRupees) * 100 : 0

        console.log(`✅ [FINAL]  Net Payout to Vendor:       ₹${netAfterGateway.toFixed(2)} - ₹${totalCostPrice} = ₹${netAmount.toFixed(2)}`)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        break
      }

      default:
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid fulfillment type: ${fulfillmentType}`)
    }

    return {
      grossAmount: orderTotalRupees,
      commissionAmount: netAmount,
      taxAmount,
      paymentProcessingFee,
      netAmount,
      commissionRate,
    }
  }

  /**
   * Process individual payout
   * amount is in RUPEES
   */
  async processPayout(
    vendorId: string,
    amountRupees: number,
    paymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual",
    reason: string
  ): Promise<PayoutDetails> {
    if (amountRupees <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payout amount must be positive")
    }

    const vendorPayout = await this.getVendorPayout(vendorId)
    if (!vendorPayout) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor payout record not found")

    const amountPaise = toPaise(amountRupees)

    if (vendorPayout.current_balance < amountPaise) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Insufficient balance for payout")
    }
    if (!vendorPayout.is_payout_enabled || vendorPayout.hold_payouts) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Payouts are currently disabled for this vendor")
    }
    if (amountPaise < vendorPayout.minimum_payout_amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Amount below minimum payout of ₹${toRupees(vendorPayout.minimum_payout_amount)}`
      )
    }

    const payoutTransaction = await this.createPayoutDetails({
      amount: -amountPaise,
      type: "payout",
      status: "processing",
      reason,
      payout_id: vendorPayout.id,
    })

    await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: vendorPayout.current_balance - amountPaise,
      total_paid: vendorPayout.total_paid + amountPaise,
      last_payout_at: new Date(),
      next_payout_date: this.getNextPayoutDate(vendorPayout.payout_schedule),
    })

    return payoutTransaction
  }

  async addAdjustment(vendorId: string, amountRupees: number, reason: string): Promise<PayoutDetails> {
    if (amountRupees === 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Adjustment amount cannot be zero")
    }

    const vendorPayout = await this.getOrCreateVendorPayout(vendorId)
    const amountPaise = toPaise(amountRupees)
    const newBalance = vendorPayout.current_balance + amountPaise

    if (newBalance < 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Adjustment would result in negative balance")
    }

    const adjustmentTransaction = await this.createPayoutDetails({
      amount: amountPaise,
      type: "adjustment",
      status: "completed",
      reason: `Manual adjustment: ${reason}`,
      payout_id: vendorPayout.id,
    })

    await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: newBalance,
      total_earned: amountRupees > 0 ? vendorPayout.total_earned + amountPaise : vendorPayout.total_earned,
    })

    return adjustmentTransaction
  }

  async updatePayoutDetailStatus(
    payoutDetailId: string,
    status: "pending" | "processing" | "completed" | "failed" | "cancelled",
    processorResponse?: string
  ): Promise<PayoutDetails> {
    const payoutDetail = await this.retrievePayoutDetails(payoutDetailId)
    if (!payoutDetail) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Payout detail not found")

    const updateData: any = { id: payoutDetailId, status }
    if (processorResponse) updateData.notes = processorResponse

    if (status === "failed" && payoutDetail.type === "payout") {
      const payoutId = typeof payoutDetail.payout === "string"
        ? payoutDetail.payout
        : (payoutDetail.payout && (payoutDetail.payout as any).id)

      const vendorPayout = payoutId ? await this.retrievePayout(payoutId) : null
      if (vendorPayout) {
        await this.updatePayouts({
          id: vendorPayout.id,
          current_balance: vendorPayout.current_balance + Math.abs(payoutDetail.amount),
          total_paid: vendorPayout.total_paid - Math.abs(payoutDetail.amount),
        })
      }
    }

    return await this.updatePayoutDetails(updateData)
  }

  /**
   * Get vendor payout details
   * Returns amounts in PAISE — the API route converts to rupees for the frontend
   */
  async getVendorPayoutDetails(vendorId: string, options: {
    orderId?: string
    type?: "earning" | "payout" | "adjustment" | "refund"
    limit?: number
    offset?: number
  } = {}): Promise<{
    account: Payout | null
    transactions: PayoutDetails[]
    summary: {
      totalEarnings: number   // paise
      totalPaid: number       // paise
      currentBalance: number  // paise
      totalOrders: number
      totalTransactions: number
    }
  }> {
    const vendorPayout = await this.getVendorPayout(vendorId)

    if (!vendorPayout) {
      return {
        account: null,
        transactions: [],
        summary: { totalEarnings: 0, totalPaid: 0, currentBalance: 0, totalOrders: 0, totalTransactions: 0 }
      }
    }

    const filters: any = { payout_id: vendorPayout.id }
    if (options.orderId) filters.order_id = options.orderId
    if (options.type) filters.type = options.type

    const [transactions, totalCount] = await this.listAndCountPayoutDetails(
      filters,
      {
        take: options.limit || 50,
        skip: options.offset || 0,
        order: { created_at: "DESC" },
        select: [
          "id", "order_id", "order_item_id", "product_id",
          "amount", "tax_amount", "tax_type",
          "payment_processing_fee",
          "type", "fulfillment_type",
          "cost_price", "commission_rate", "selling_price",
          "status", "reason", "notes",
          "created_at", "updated_at"
        ]
      }
    )

    return {
      account: vendorPayout,
      transactions,
      summary: {
        totalEarnings: vendorPayout.total_earned,
        totalPaid: vendorPayout.total_paid,
        currentBalance: vendorPayout.current_balance,
        totalOrders: vendorPayout.total_orders,
        totalTransactions: totalCount,
      }
    }
  }

  async getVendorProductEarnings(vendorId: string, productId?: string) {
    const vendorPayout = await this.getVendorPayout(vendorId)
    if (!vendorPayout) return []

    const filters: any = { payout_id: vendorPayout.id, type: "earning" }
    if (productId) filters.product_id = productId

    const transactions = await this.listPayoutDetails(filters)
    const productMap = new Map()

    transactions.forEach(transaction => {
      const key = transaction.product_id
      if (!productMap.has(key)) {
        productMap.set(key, { productId: key, totalAmount: 0, totalTax: 0, orderCount: 0, lastEarningDate: transaction.created_at })
      }
      const product = productMap.get(key)
      product.totalAmount += transaction.amount
      product.totalTax += transaction.tax_amount
      product.orderCount += 1
      if (transaction.created_at > product.lastEarningDate) product.lastEarningDate = transaction.created_at
    })

    return Array.from(productMap.values())
  }

  async getEligibleVendors(): Promise<Payout[]> {
    const allPayouts = await this.listPayouts({})
    return allPayouts.filter(payout =>
      payout.is_payout_enabled &&
      !payout.hold_payouts &&
      payout.current_balance >= payout.minimum_payout_amount &&
      (!payout.next_payout_date || payout.next_payout_date <= new Date())
    )
  }

  async createBatch(period: string, paymentMethod: "bank_transfer" | "paypal" | "stripe" | "manual"): Promise<PayoutBatch> {
    const eligibleVendors = await this.getEligibleVendors()
    if (eligibleVendors.length === 0) throw new MedusaError(MedusaError.Types.NOT_FOUND, "No vendors eligible for payout")

    const totalAmount = eligibleVendors.reduce((sum, vendor) => sum + vendor.current_balance, 0)
    const batchReference = `BATCH_${period}_${Date.now()}`

    return await this.createPayoutBatches({
      batch_reference: batchReference,
      period,
      status: "pending",
      total_vendors: eligibleVendors.length,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      scheduled_at: new Date(),
    })
  }

  async processBatch(batchId: string) {
    const batch = await this.retrievePayoutBatch(batchId)
    if (!batch) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Batch not found")

    await this.updatePayoutBatches({ id: batchId, status: "processing", started_at: new Date() })

    const eligibleVendors = await this.getEligibleVendors()
    let successfulCount = 0, failedCount = 0
    const results: Array<{ vendorId: string, success: boolean, error?: string }> = []

    const paymentMethodMap: Record<string, "bank_transfer" | "paypal" | "razorpay" | "manual"> = {
      "stripe": "razorpay", "bank_transfer": "bank_transfer", "paypal": "paypal", "manual": "manual",
    }
    const payoutPaymentMethod = paymentMethodMap[batch.payment_method] || "manual"

    for (const vendor of eligibleVendors) {
      try {
        // current_balance is in paise, convert to rupees for processPayout
        await this.processPayout(vendor.vendor_id, toRupees(vendor.current_balance), payoutPaymentMethod, `Batch payout - ${batch.period}`)
        successfulCount++
        results.push({ vendorId: vendor.vendor_id, success: true })
      } catch (error) {
        failedCount++
        results.push({ vendorId: vendor.vendor_id, success: false, error: error instanceof Error ? error.message : "Unknown error" })
      }
    }

    const finalStatus = failedCount === 0 ? "completed" : successfulCount === 0 ? "failed" : "partially_failed"
    const updatedBatch = await this.updatePayoutBatches({
      id: batchId, status: finalStatus,
      successful_payouts: successfulCount, failed_payouts: failedCount, completed_at: new Date(),
    })

    return { batch: updatedBatch, successful: successfulCount, failed: failedCount, results }
  }

  async processOrderRefund(
    orderId: string,
    refundReason: string = "Order refunded",
    partialRefundItems?: Array<{ order_item_id: string; refund_amount?: number }>
  ) {
    let existingEarnings = await this.listPayoutDetails({ order_id: orderId, type: "earning", status: "completed" })

    if (existingEarnings.length === 0) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `No completed earnings found for order ${orderId}`)
    }

    if (partialRefundItems?.length) {
      const itemIdsToRefund = partialRefundItems.map(item => item.order_item_id)
      existingEarnings = existingEarnings.filter(e => e.order_item_id && itemIdsToRefund.includes(e.order_item_id))
    }

    const existingRefunds = await this.listPayoutDetails({ order_id: orderId, type: "refund" })
    if (existingRefunds.length > 0) {
      const refundedItemIds = existingRefunds.map(r => r.order_item_id).filter(Boolean)
      existingEarnings = existingEarnings.filter(e => !e.order_item_id || !refundedItemIds.includes(e.order_item_id))
    }

    if (existingEarnings.length === 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No earnings available to refund for order ${orderId}`)
    }

    const refundDetails: PayoutDetails[] = []
    let totalRefundAmount = 0
    const vendorBalanceUpdates = new Map<string, number>()

    for (const earning of existingEarnings) {
      const payoutRef = typeof earning.payout === "string"
        ? earning.payout
        : (earning.payout && (earning.payout as any).id) || undefined

      const refundDetail = await this.createPayoutDetails({
        order_id: earning.order_id,
        order_item_id: earning.order_item_id,
        product_id: earning.product_id,
        amount: -earning.amount,          // already in paise
        tax_amount: -earning.tax_amount,
        tax_type: earning.tax_type,
        type: "refund",
        fulfillment_type: earning.fulfillment_type,
        cost_price: earning.cost_price,
        commission_rate: earning.commission_rate,
        selling_price: earning.selling_price,
        status: "completed",
        reason: `${refundReason} - Offsetting earning ${earning.id}`,
        notes: JSON.stringify({
          original_earning_id: earning.id,
          refund_type: partialRefundItems ? "partial" : "full",
          original_amount: earning.amount,
          refunded_at: new Date().toISOString(),
        }),
        payout: payoutRef,
      })

      refundDetails.push(refundDetail)
      totalRefundAmount += Math.abs(earning.amount)

      if (payoutRef) {
        const currentUpdate = vendorBalanceUpdates.get(payoutRef) || 0
        vendorBalanceUpdates.set(payoutRef, currentUpdate + Math.abs(earning.amount))
      }
    }

    for (const [payoutId, refundAmountPaise] of vendorBalanceUpdates.entries()) {
      const vendorPayout = await this.retrievePayout(payoutId)
      if (vendorPayout) {
        await this.updatePayouts({
          id: payoutId,
          current_balance: vendorPayout.current_balance - refundAmountPaise,
          total_earned: vendorPayout.total_earned - refundAmountPaise,
          avg_order_value: vendorPayout.total_orders > 0
            ? Math.round((vendorPayout.total_earned - refundAmountPaise) / vendorPayout.total_orders)
            : 0,
        })
      }
    }

    return { refundDetails, vendorsAffected: vendorBalanceUpdates.size, totalRefundAmount }
  }

  async isOrderRefunded(orderId: string) {
    const refundDetails = await this.listPayoutDetails({ order_id: orderId, type: "refund" })
    const totalRefundAmount = refundDetails.reduce((sum, d) => sum + Math.abs(d.amount), 0)
    const earnings = await this.listPayoutDetails({ order_id: orderId, type: "earning" })
    const totalEarningsAmount = earnings.reduce((sum, d) => sum + d.amount, 0)

    return {
      isRefunded: refundDetails.length > 0,
      hasPartialRefunds: totalRefundAmount > 0 && totalRefundAmount < totalEarningsAmount,
      refundDetails,
      totalRefundAmount,
    }
  }

  async getVendorRefundSummary(vendorId: string, options: { startDate?: Date; endDate?: Date; orderId?: string } = {}) {
    const vendorPayout = await this.getVendorPayout(vendorId)
    if (!vendorPayout) return { totalRefunds: 0, totalRefundAmount: 0, refundsByOrder: [] }

    const filters: any = { payout_id: vendorPayout.id, type: "refund" }
    if (options.orderId) filters.order_id = options.orderId

    let refundDetails = await this.listPayoutDetails(filters)

    if (options.startDate || options.endDate) {
      refundDetails = refundDetails.filter(refund => {
        const d = new Date(refund.created_at)
        if (options.startDate && d < options.startDate) return false
        if (options.endDate && d > options.endDate) return false
        return true
      })
    }

    const refundsByOrder = new Map()
    refundDetails.forEach(refund => {
      const orderId = refund.order_id
      if (!refundsByOrder.has(orderId)) {
        refundsByOrder.set(orderId, { orderId, refundAmount: 0, refundCount: 0, refundDate: refund.created_at })
      }
      const r = refundsByOrder.get(orderId)
      r.refundAmount += Math.abs(refund.amount)
      r.refundCount += 1
      if (refund.created_at > r.refundDate) r.refundDate = refund.created_at
    })

    return {
      totalRefunds: refundDetails.length,
      totalRefundAmount: refundDetails.reduce((sum, d) => sum + Math.abs(d.amount), 0),
      refundsByOrder: Array.from(refundsByOrder.values()),
    }
  }

  async setPayoutHold(vendorId: string, hold: boolean, reason?: string): Promise<Payout> {
    const vendorPayout = await this.getVendorPayout(vendorId)
    if (!vendorPayout) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")

    return await this.updatePayouts({
      id: vendorPayout.id,
      hold_payouts: hold,
      hold_reason: hold ? reason || "Administrative hold" : null,
    })
  }

  async getVendorEarningsReport(vendorId: string, options: { startDate?: Date; endDate?: Date; groupBy?: 'product' | 'month' | 'order' } = {}): Promise<VendorEarningsReport> {
    const { account, transactions } = await this.getVendorPayoutDetails(vendorId)
    if (!account) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Vendor not found")

    let filtered = transactions
    if (options.startDate || options.endDate) {
      filtered = transactions.filter(t => {
        const d = new Date(t.created_at)
        if (options.startDate && d < options.startDate) return false
        if (options.endDate && d > options.endDate) return false
        return true
      })
    }

    const productMap = new Map()
    filtered.filter(t => t.type === "earning" && t.product_id).forEach(t => {
      const pid = t.product_id!
      if (!productMap.has(pid)) productMap.set(pid, { productId: pid, totalAmount: 0, orderCount: 0 })
      productMap.get(pid).totalAmount += t.amount
      productMap.get(pid).orderCount += 1
    })

    return {
      vendorId,
      totalEarnings: toRupees(account.total_earned),
      totalPaid: toRupees(account.total_paid),
      currentBalance: toRupees(account.current_balance),
      totalOrders: account.total_orders,
      productBreakdown: Array.from(productMap.values()),
    }
  }

  private getNextPayoutDate(schedule: "weekly" | "biweekly" | "monthly" = "weekly"): Date {
    const now = new Date()
    const nextPayout = new Date(now)

    switch (schedule) {
      case "weekly":
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFriday)
        break
      case "biweekly":
        const daysUntilFridayBi = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFridayBi + 7)
        break
      case "monthly":
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0)
        const lastFriday = new Date(lastDay)
        lastFriday.setDate(lastDay.getDate() - ((lastDay.getDay() + 2) % 7))
        return lastFriday
    }

    nextPayout.setHours(17, 0, 0, 0)
    return nextPayout
  }
}

export default PayoutModuleService
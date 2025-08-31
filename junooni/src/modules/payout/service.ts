import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Payout from "./models/payouts"
import PayoutBatch from "./models/payout_batch"
import PayoutDetails from "./models/payout_details"
import { InferTypeOf } from "@medusajs/framework/types"

type Payout = InferTypeOf<typeof Payout>
type PayoutBatch = InferTypeOf<typeof PayoutBatch>
type PayoutDetails = InferTypeOf<typeof PayoutDetails>

interface OrderLineItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
  product: {
    id: string
    metadata?: {
      cost_price?: number
      fulfillment_type?: "creator_fulfillment" | "junooni_fulfillment"
    }
    vendor: Array<{  // Changed from 'vendors' to 'vendor'
      id: string
      name: string
      metadata?: Record<string, any>
    }>
  }
}

interface EarningsCalculation {
  grossAmount: number
  commissionAmount: number
  taxAmount: number
  tdsAmount: number
  netAmount: number
  commissionRate: number
  tdsPercentage: number
}

interface VendorEarningsReport {
  vendorId: string
  totalEarnings: number
  totalPaid: number
  currentBalance: number
  totalOrders: number
  productBreakdown: Array<{
    productId: string
    totalAmount: number
    orderCount: number
  }>
}

class PayoutModuleService extends MedusaService({
  Payout,
  PayoutDetails,
  PayoutBatch,
}) {

  /**
   * Process order earnings - main entry point for order fulfillment
   * Processes each item individually without grouping
   */
  async processOrderEarnings(orderId: string, lineItems: OrderLineItem[]): Promise<void> {
    console.log(`🔄 Processing earnings for order ${orderId} with ${lineItems.length} items`)
    
    // Check if this order has already been processed
    const existingDetails = await this.listPayoutDetails({
      order_id: orderId
    })
    
    if (existingDetails.length > 0) {
      console.log(`⚠️ Order ${orderId} already has ${existingDetails.length} payout details. Skipping to prevent duplicates.`)
      console.log(`Existing payout details:`, existingDetails.map(d => ({ id: d.id, order_item_id: d.order_item_id, vendor_id: d.payout })))
      return
    }
    
    // Process each item individually
    for (const item of lineItems) {
      console.log(`📦 Processing item ${item.id} for product ${item.product_id}`)
      console.log(`📦 Item vendor data:`, JSON.stringify(item.product.vendor, null, 2))
      
      if (!item.product.vendor || !Array.isArray(item.product.vendor) || item.product.vendor.length === 0) {
        console.warn(`⚠️ Item ${item.id} has no vendors, skipping`)
        continue
      }

      console.log(`📦 Item ${item.id} has ${item.product.vendor.length} vendor(s)`)

      // Process each vendor for this item
      for (const [vendorIndex, vendor] of item.product.vendor.entries()) {
        if (!vendor || !vendor.id) {
          console.warn(`⚠️ Invalid vendor data for item ${item.id} at index ${vendorIndex}, skipping`)
          continue
        }

        console.log(`💰 Processing earnings for vendor ${vendor.id} on item ${item.id} (vendor ${vendorIndex + 1}/${item.product.vendor.length})`)

        // Check if this specific item-vendor combination already exists
        const existingItemDetail = await this.listPayoutDetails({
          order_id: orderId,
          order_item_id: item.id,
        })

        if (existingItemDetail.length > 0) {
          console.log(`⚠️ Payout detail already exists for order ${orderId}, item ${item.id}. Skipping.`)
          continue
        }

        try {
          // Parse fulfillment type from JSON string in metadata
          let fulfillmentType: "creator_fulfillment" | "junooni_fulfillment" = "creator_fulfillment"
          
          if (item.product.metadata?.fulfillment_type) {
            try {
              const fulfillmentData = JSON.parse(item.product.metadata.fulfillment_type)
              if (fulfillmentData.type === "Junooni-fulfillment") {
                fulfillmentType = "junooni_fulfillment"
              } else if (fulfillmentData.type === "Creator-fulfilment") {
                fulfillmentType = "creator_fulfillment"
              }
            } catch (parseError) {
              console.warn(`Failed to parse fulfillment_type for item ${item.id}:`, parseError)
              // Use default fulfillmentType
            }
          }
          
          const costPrice = Number(item.product.metadata?.cost_price) || 0
          const itemTotal = item.unit_price * item.quantity
          
          console.log(`📋 Item details:`, {
            itemId: item.id,
            vendorId: vendor.id,
            fulfillmentType,
            costPrice,
            itemTotal,
            metadata: item.product.metadata
          })
          
          // Calculate earnings for this specific item
          const earnings = await this.calculateEarningsFromOrder(
            itemTotal, 
            fulfillmentType, 
            costPrice
          )
          
          console.log(`📊 Calculated earnings for item ${item.id}:`, {
            itemTotal,
            fulfillmentType,
            netAmount: earnings.netAmount,
            commissionRate: earnings.commissionRate
          })
          
          // Create individual payout detail record for this item
          const payoutDetail = await this.createPayoutDetailForProduct({
            vendorId: vendor.id,
            orderId,
            orderItemId: item.id,
            productId: item.product.id,
            earnings,
            fulfillmentType,
            costPrice,
            sellingPrice: itemTotal,
            quantity: item.quantity,
          })
          
          console.log(`📝 Created payout detail ${payoutDetail.id} for vendor ${vendor.id}, item ${item.id}`)
          
          // Update vendor account balance for this item
          await this.addEarningsToVendorAccount(vendor.id, earnings.netAmount)
          
          console.log(`✅ Successfully processed earnings for vendor ${vendor.id} on item ${item.id}`)
          
        } catch (error) {
          console.error(`❌ Error processing earnings for vendor ${vendor.id} on item ${item.id}:`, error)
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Failed to process earnings for vendor ${vendor.id} on item ${item.id}: ${error.message}`
          )
        }
      }
    }
    
    console.log(`🎉 Successfully processed all earnings for order ${orderId}`)
  }

  /**
   * Create payout detail for individual product
   */
  private async createPayoutDetailForProduct(params: {
    vendorId: string
    orderId: string
    orderItemId: string
    productId: string
    earnings: EarningsCalculation
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
    costPrice: number
    sellingPrice: number
    quantity: number
  }): Promise<PayoutDetails> {
    console.log(`🔨 Creating payout detail for vendor ${params.vendorId}, item ${params.orderItemId}`)
    
    // Get or create vendor payout account
    const vendorPayout = await this.getOrCreateVendorPayout(params.vendorId)
    
    return await this.createPayoutDetails({
      order_id: params.orderId,
      order_item_id: params.orderItemId,
      product_id: params.productId,
      amount: params.earnings.netAmount,
      tax_amount: params.earnings.taxAmount,
      tax_type: "igst",
      tds_percentage: params.earnings.tdsPercentage,
      tds_amount: params.earnings.tdsAmount,
      type: "earning",
      fulfillment_type: params.fulfillmentType,
      cost_price: params.costPrice,
      commission_rate: params.earnings.commissionRate,
      selling_price: params.sellingPrice,
      status: "completed",
      reason: `Order earnings - ${params.orderId} - ${params.productId}`,
      payout: vendorPayout.id,
    })
  }

  /**
   * Add earnings to vendor account balance
   */
  private async addEarningsToVendorAccount(vendorId: string, amount: number): Promise<Payout> {
    if (amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Earnings amount must be positive"
      )
    }

    const vendorPayout = await this.getOrCreateVendorPayout(vendorId)

    console.log(`💳 Updating balance for vendor ${vendorId}: ${vendorPayout.current_balance} + ${amount}`)

    return await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: vendorPayout.current_balance + amount,
      total_earned: vendorPayout.total_earned + amount,
      total_orders: vendorPayout.total_orders + 1,
      last_earning_at: new Date(),
      avg_order_value: (vendorPayout.total_earned + amount) / (vendorPayout.total_orders + 1),
    })
  }

  /**
   * Get or create vendor payout account
   */
  async getOrCreateVendorPayout(vendorId: string): Promise<Payout> {
    const existingPayout = await this.getVendorPayout(vendorId)
    
    if (existingPayout) {
      console.log(`📋 Found existing payout account for vendor ${vendorId}`)
      return existingPayout
    }

    console.log(`🆕 Creating new payout account for vendor ${vendorId}`)
    return await this.createPayouts({
      vendor_id: vendorId,
      current_balance: 0,
      pending_balance: 0,
      total_earned: 0,
      total_paid: 0,
      total_pending_payout: 0,
      total_orders: 0,
      avg_order_value: 0,
      minimum_payout_amount: 1000, // ₹10.00
      payout_schedule: "weekly",
      is_payout_enabled: true,
      hold_payouts: false,
      next_payout_date: this.getNextPayoutDate(),
    })
  }

  /**
   * Get vendor payout account
   */
  async getVendorPayout(vendorId: string): Promise<Payout | null> {
    const payouts = await this.listPayouts({
      vendor_id: vendorId,
    })

    // Return the account record (should be only one per vendor)
    return payouts[0] || null
  }

  /**
   * Get vendor current balance
   */
  async getBalance(vendorId: string): Promise<number> {
    const payout = await this.getVendorPayout(vendorId)
    return payout?.current_balance || 0
  }

  /**
   * Calculate earnings from order item
   */
  async calculateEarningsFromOrder(
    orderTotal: number, 
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment", 
    costPrice?: number
  ): Promise<EarningsCalculation> {
    if (orderTotal < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order total cannot be negative"
      )
    }

    let commissionAmount = 0
    let commissionRate = 0

    switch (fulfillmentType) {
      case "creator_fulfillment":
        commissionRate = 70 // 70%
        commissionAmount = Math.floor(orderTotal * 0.70)
        break

      case "junooni_fulfillment":
        if (!costPrice) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Cost price is required for Junooni fulfillment"
          )
        }
        if (costPrice > orderTotal) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Cost price cannot exceed order total"
          )
        }
        commissionAmount = orderTotal - costPrice
        commissionRate = Math.round(((orderTotal - costPrice) / orderTotal) * 100)
        break

      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Invalid fulfillment type"
        )
    }

    // Calculate tax (18% GST on commission)
    const taxAmount = Math.floor(commissionAmount * 0.18)
    
    // Calculate TDS (1% on commission)
    const tdsPercentage = 1
    const tdsAmount = Math.floor(commissionAmount * 0.01)
    
    // Net amount after TDS deduction
    const netAmount = commissionAmount - tdsAmount

    return {
      grossAmount: orderTotal,
      commissionAmount,
      taxAmount,
      tdsAmount,
      netAmount,
      commissionRate,
      tdsPercentage,
    }
  }

  /**
   * Process individual payout
   */
  async processPayout(
    vendorId: string, 
    amount: number, 
    paymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual",
    reason: string
  ): Promise<PayoutDetails> {
    if (amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payout amount must be positive"
      )
    }

    const vendorPayout = await this.getVendorPayout(vendorId)

    if (!vendorPayout) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Vendor payout record not found"
      )
    }

    if (vendorPayout.current_balance < amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient balance for payout"
      )
    }

    if (!vendorPayout.is_payout_enabled || vendorPayout.hold_payouts) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Payouts are currently disabled for this vendor"
      )
    }

    if (amount < vendorPayout.minimum_payout_amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Amount below minimum payout of ₹${vendorPayout.minimum_payout_amount}`
      )
    }

    // Create payout transaction record
    const payoutTransaction = await this.createPayoutDetails({
      amount: -amount, // Negative for payout
      type: "payout",
      status: "processing",
      reason: reason,
      payout: vendorPayout.id,
    })

    // Update vendor account balance
    await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: vendorPayout.current_balance - amount,
      total_paid: vendorPayout.total_paid + amount,
      last_payout_at: new Date(),
      next_payout_date: this.getNextPayoutDate(vendorPayout.payout_schedule),
    })

    return payoutTransaction
  }

  /**
   * Add manual adjustment
   */
  async addAdjustment(vendorId: string, amount: number, reason: string): Promise<PayoutDetails> {
    if (amount === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Adjustment amount cannot be zero"
      )
    }

    const vendorPayout = await this.getOrCreateVendorPayout(vendorId)
    const newBalance = vendorPayout.current_balance + amount

    if (newBalance < 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Adjustment would result in negative balance"
      )
    }

    // Create adjustment transaction record
    const adjustmentTransaction = await this.createPayoutDetails({
      amount: amount,
      type: "adjustment",
      status: "completed",
      reason: `Manual adjustment: ${reason}`,
      payout: vendorPayout.id,
    })

    // Update vendor account balance
    await this.updatePayouts({
      id: vendorPayout.id,
      current_balance: newBalance,
      total_earned: amount > 0 ? vendorPayout.total_earned + amount : vendorPayout.total_earned,
    })

    return adjustmentTransaction
  }

  /**
   * Update payout detail status
   */
  async updatePayoutDetailStatus(
    payoutDetailId: string, 
    status: "pending" | "processing" | "completed" | "failed" | "cancelled", 
    processorResponse?: string
  ): Promise<PayoutDetails> {
    const payoutDetail = await this.retrievePayoutDetails(payoutDetailId)
    if (!payoutDetail) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Payout detail not found"
      )
    }

    const updateData: any = {
      id: payoutDetailId,
      status,
    }

    if (processorResponse) {
      updateData.notes = processorResponse
    }

    // If payout failed, restore balance to vendor account
    if (status === "failed" && payoutDetail.type === "payout") {
      const vendorPayout = await this.retrievePayouts(payoutDetail.payout)
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
   * Get vendor payout details with transaction history
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
      totalEarnings: number
      totalPaid: number
      currentBalance: number
      totalOrders: number
      totalTransactions: number
    }
  }> {
    const vendorPayout = await this.getVendorPayout(vendorId)
    
    if (!vendorPayout) {
      return {
        account: null,
        transactions: [],
        summary: {
          totalEarnings: 0,
          totalPaid: 0,
          currentBalance: 0,
          totalOrders: 0,
          totalTransactions: 0,
        }
      }
    }

    // Build filters for transaction details
    const filters: any = { payout: vendorPayout.id }
    if (options.orderId) filters.order_id = options.orderId
    if (options.type) filters.type = options.type

    const [transactions, totalCount] = await this.listAndCountPayoutDetails(
      filters,
      {
        take: options.limit || 50,
        skip: options.offset || 0,
        order: { created_at: "DESC" },
        // Only select the fields defined in your model
        select: [
          "id",
          "order_id", 
          "order_item_id",
          "product_id",
          "amount",
          "tax_amount",
          "tax_type",
          "tds_percentage", 
          "tds_amount",
          "type",
          "fulfillment_type",
          "cost_price",
          "commission_rate",
          "selling_price", 
          "status",
          "reason",
          "notes",
          "created_at",
          "updated_at"
        ]
      }
    )

    const summary = {
      totalEarnings: vendorPayout.total_earned,
      totalPaid: vendorPayout.total_paid,
      currentBalance: vendorPayout.current_balance,
      totalOrders: vendorPayout.total_orders,
      totalTransactions: totalCount,
    }

    return {
      account: vendorPayout,
      transactions,
      summary,
    }
  }

  /**
   * Get vendor earnings by product
   */
  async getVendorProductEarnings(vendorId: string, productId?: string): Promise<Array<{
    productId: string
    totalAmount: number
    totalTax: number
    totalTds: number
    orderCount: number
    lastEarningDate: Date
  }>> {
    const vendorPayout = await this.getVendorPayout(vendorId)
    if (!vendorPayout) return []

    const filters: any = { 
      payout: vendorPayout.id,
      type: "earning"
    }
    if (productId) filters.product_id = productId

    const transactions = await this.listPayoutDetails(filters)

    // Group by product
    const productMap = new Map()
    
    transactions.forEach(transaction => {
      const key = transaction.product_id
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: key,
          totalAmount: 0,
          totalTax: 0,
          totalTds: 0,
          orderCount: 0,
          lastEarningDate: transaction.created_at,
        })
      }
      
      const product = productMap.get(key)
      product.totalAmount += transaction.amount
      product.totalTax += transaction.tax_amount
      product.totalTds += transaction.tds_amount
      product.orderCount += 1
      if (transaction.created_at > product.lastEarningDate) {
        product.lastEarningDate = transaction.created_at
      }
    })
    
    return Array.from(productMap.values())
  }

  /**
   * Get vendors eligible for payout
   */
  async getEligibleVendors(): Promise<Payout[]> {
    const allPayouts = await this.listPayouts({})
    
    return allPayouts.filter(payout => 
      payout.is_payout_enabled &&
      !payout.hold_payouts &&
      payout.current_balance >= payout.minimum_payout_amount &&
      (!payout.next_payout_date || payout.next_payout_date <= new Date())
    )
  }

  /**
   * Create batch payout
   */
  async createBatch(period: string, paymentMethod: "bank_transfer" | "paypal" | "stripe" | "manual"): Promise<PayoutBatch> {
    const eligibleVendors = await this.getEligibleVendors()
    
    if (eligibleVendors.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No vendors eligible for payout"
      )
    }

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

  /**
   * Process batch payout
   */
  async processBatch(batchId: string): Promise<{ 
    batch: PayoutBatch
    successful: number
    failed: number
    results: Array<{ vendorId: string, success: boolean, error?: string }>
  }> {
    const batch = await this.retrievePayoutBatches(batchId)
    if (!batch) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Batch not found"
      )
    }

    await this.updatePayoutBatches({
      id: batchId,
      status: "processing",
      started_at: new Date(),
    })

    const eligibleVendors = await this.getEligibleVendors()
    let successfulCount = 0
    let failedCount = 0
    const results: Array<{ vendorId: string, success: boolean, error?: string }> = []

    // Map payment methods between batch and payout models
    const paymentMethodMap: Record<string, "bank_transfer" | "paypal" | "razorpay" | "manual"> = {
      "stripe": "razorpay",
      "bank_transfer": "bank_transfer",
      "paypal": "paypal",
      "manual": "manual",
    }
    
    const payoutPaymentMethod = paymentMethodMap[batch.payment_method] || "manual"

    for (const vendor of eligibleVendors) {
      try {
        await this.processPayout(
          vendor.vendor_id,
          vendor.current_balance,
          payoutPaymentMethod,
          `Batch payout - ${batch.period}`
        )
        successfulCount++
        results.push({ vendorId: vendor.vendor_id, success: true })
      } catch (error) {
        failedCount++
        results.push({ 
          vendorId: vendor.vendor_id, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    const finalStatus = failedCount === 0 ? "completed" : 
                       successfulCount === 0 ? "failed" : "partially_failed"

    const updatedBatch = await this.updatePayoutBatches({
      id: batchId,
      status: finalStatus,
      successful_payouts: successfulCount,
      failed_payouts: failedCount,
      completed_at: new Date(),
    })

    return { 
      batch: updatedBatch, 
      successful: successfulCount, 
      failed: failedCount,
      results
    }
  }

  /**
 * Process order refund - creates negative payout details to offset original earnings
 */
async processOrderRefund(
  orderId: string, 
  refundReason: string = "Order refunded",
  partialRefundItems?: Array<{
    order_item_id: string
    refund_amount?: number
  }>
): Promise<{
  refundDetails: PayoutDetails[]
  vendorsAffected: number
  totalRefundAmount: number
}> {
  console.log(`🔄 Processing refund for order ${orderId}`)

  // Find existing earnings for this order
  let existingEarnings = await this.listPayoutDetails({
    order_id: orderId,
    type: "earning",
    status: "completed",
  })

  if (existingEarnings.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No completed earnings found for order ${orderId}`
    )
  }

  // Filter for partial refunds if specified
  if (partialRefundItems && partialRefundItems.length > 0) {
    const itemIdsToRefund = partialRefundItems.map(item => item.order_item_id)
    existingEarnings = existingEarnings.filter(earning => 
      earning.order_item_id && itemIdsToRefund.includes(earning.order_item_id)
    )
  }

  // Check for existing refunds to avoid duplicates
  const existingRefunds = await this.listPayoutDetails({
    order_id: orderId,
    type: "refund",
  })

  if (existingRefunds.length > 0) {
    const refundedItemIds = existingRefunds
      .map(refund => refund.order_item_id)
      .filter(Boolean)

    existingEarnings = existingEarnings.filter(earning => 
      !earning.order_item_id || !refundedItemIds.includes(earning.order_item_id)
    )
  }

  if (existingEarnings.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `No earnings available to refund for order ${orderId}`
    )
  }

  const refundDetails: PayoutDetails[] = []
  let totalRefundAmount = 0
  const vendorBalanceUpdates = new Map<string, number>()

  // Create refund details for each earning
  for (const earning of existingEarnings) {
    console.log(`💸 Creating refund for earning ${earning.id}`)

    const refundDetail = await this.createPayoutDetails({
      order_id: earning.order_id,
      order_item_id: earning.order_item_id,
      product_id: earning.product_id,
      amount: -earning.amount, // Negative amount
      tax_amount: -earning.tax_amount,
      tax_type: earning.tax_type,
      tds_percentage: earning.tds_percentage,
      tds_amount: -earning.tds_amount,
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
      payout: earning.payout,
    })

    refundDetails.push(refundDetail)
    totalRefundAmount += Math.abs(earning.amount)

    // Track balance updates per vendor
    const currentUpdate = vendorBalanceUpdates.get(earning.payout) || 0
    vendorBalanceUpdates.set(earning.payout, currentUpdate + Math.abs(earning.amount))
  }

  // Update vendor account balances
  for (const [payoutId, refundAmount] of vendorBalanceUpdates.entries()) {
    const vendorPayout = await this.retrievePayout(payoutId)
    if (vendorPayout) {
      await this.updatePayouts({
        id: payoutId,
        current_balance: vendorPayout.current_balance - refundAmount,
        total_earned: vendorPayout.total_earned - refundAmount,
        avg_order_value: vendorPayout.total_orders > 0 
          ? (vendorPayout.total_earned - refundAmount) / vendorPayout.total_orders 
          : 0,
      })
      console.log(`💳 Updated vendor balance for ${payoutId}: -${refundAmount}`)
    }
  }

  console.log(`✅ Processed refund for order ${orderId}: ${refundDetails.length} details, ${totalRefundAmount} total`)

  return {
    refundDetails,
    vendorsAffected: vendorBalanceUpdates.size,
    totalRefundAmount,
  }
}

/**
 * Check if an order has already been refunded
 */
async isOrderRefunded(orderId: string): Promise<{
  isRefunded: boolean
  hasPartialRefunds: boolean
  refundDetails: PayoutDetails[]
  totalRefundAmount: number
}> {
  const refundDetails = await this.listPayoutDetails({
    order_id: orderId,
    type: "refund",
  })

  const totalRefundAmount = refundDetails.reduce((sum, detail) => 
    sum + Math.abs(detail.amount), 0
  )

  // Check if there are also earnings for comparison
  const earnings = await this.listPayoutDetails({
    order_id: orderId,
    type: "earning",
  })

  const totalEarningsAmount = earnings.reduce((sum, detail) => sum + detail.amount, 0)

  return {
    isRefunded: refundDetails.length > 0,
    hasPartialRefunds: totalRefundAmount > 0 && totalRefundAmount < totalEarningsAmount,
    refundDetails,
    totalRefundAmount,
  }
}

/**
 * Get refund summary for a vendor
 */
async getVendorRefundSummary(vendorId: string, options: {
  startDate?: Date
  endDate?: Date
  orderId?: string
} = {}): Promise<{
  totalRefunds: number
  totalRefundAmount: number
  refundsByOrder: Array<{
    orderId: string
    refundAmount: number
    refundCount: number
    refundDate: Date
  }>
}> {
  const vendorPayout = await this.getVendorPayout(vendorId)
  if (!vendorPayout) {
    return {
      totalRefunds: 0,
      totalRefundAmount: 0,
      refundsByOrder: [],
    }
  }

  const filters: any = { 
    payout: vendorPayout.id,
    type: "refund"
  }
  
  if (options.orderId) filters.order_id = options.orderId

  const refundDetails = await this.listPayoutDetails(filters)

  // Filter by date range if specified
  let filteredRefunds = refundDetails
  if (options.startDate || options.endDate) {
    filteredRefunds = refundDetails.filter(refund => {
      const refundDate = new Date(refund.created_at)
      if (options.startDate && refundDate < options.startDate) return false
      if (options.endDate && refundDate > options.endDate) return false
      return true
    })
  }

  // Group by order
  const refundsByOrder = new Map()
  
  filteredRefunds.forEach(refund => {
    const orderId = refund.order_id
    if (!refundsByOrder.has(orderId)) {
      refundsByOrder.set(orderId, {
        orderId,
        refundAmount: 0,
        refundCount: 0,
        refundDate: refund.created_at,
      })
    }
    
    const orderRefund = refundsByOrder.get(orderId)
    orderRefund.refundAmount += Math.abs(refund.amount)
    orderRefund.refundCount += 1
    
    // Use the latest refund date
    if (refund.created_at > orderRefund.refundDate) {
      orderRefund.refundDate = refund.created_at
    }
  })

  const totalRefundAmount = filteredRefunds.reduce((sum, detail) => 
    sum + Math.abs(detail.amount), 0
  )

  return {
    totalRefunds: filteredRefunds.length,
    totalRefundAmount,
    refundsByOrder: Array.from(refundsByOrder.values()),
  }
}

  /**
   * Hold or release vendor payouts
   */
  async setPayoutHold(vendorId: string, hold: boolean, reason?: string): Promise<Payout> {
    const vendorPayout = await this.getVendorPayout(vendorId)
    
    if (!vendorPayout) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Vendor not found"
      )
    }

    return await this.updatePayouts({
      id: vendorPayout.id,
      hold_payouts: hold,
      hold_reason: hold ? reason || "Administrative hold" : null,
    })
  }

  /**
   * Get vendor earnings report
   */
  async getVendorEarningsReport(vendorId: string, options: {
    startDate?: Date
    endDate?: Date
    groupBy?: 'product' | 'month' | 'order'
  } = {}): Promise<VendorEarningsReport> {
    const { account, transactions } = await this.getVendorPayoutDetails(vendorId)
    
    if (!account) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Vendor not found"
      )
    }

    // Filter by date range
    let filteredTransactions = transactions
    if (options.startDate || options.endDate) {
      filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.created_at)
        if (options.startDate && transactionDate < options.startDate) return false
        if (options.endDate && transactionDate > options.endDate) return false
        return true
      })
    }

    // Product breakdown
    const productMap = new Map()
    filteredTransactions
      .filter(t => t.type === "earning" && t.product_id)
      .forEach(transaction => {
        const productId = transaction.product_id!
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            totalAmount: 0,
            orderCount: 0,
          })
        }
        
        const product = productMap.get(productId)
        product.totalAmount += transaction.amount
        product.orderCount += 1
      })

    return {
      vendorId,
      totalEarnings: account.total_earned,
      totalPaid: account.total_paid,
      currentBalance: account.current_balance,
      totalOrders: account.total_orders,
      productBreakdown: Array.from(productMap.values()),
    }
  }

  // Private helper methods
  private getCurrentPayoutPeriod(): string {
    const now = new Date()
    const year = now.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`
  }

  private getNextPayoutDate(schedule: "weekly" | "biweekly" | "monthly" = "weekly"): Date {
    const now = new Date()
    const nextPayout = new Date(now)

    switch (schedule) {
      case "weekly":
        // Next Friday
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFriday)
        break
      
      case "biweekly":
        // Every other Friday
        const daysUntilFridayBi = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFridayBi + 7)
        break
      
      case "monthly":
        // Last Friday of next month
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0)
        const lastFridayOfNextMonth = new Date(lastDayOfNextMonth)
        lastFridayOfNextMonth.setDate(lastDayOfNextMonth.getDate() - ((lastDayOfNextMonth.getDay() + 2) % 7))
        return lastFridayOfNextMonth
    }

    nextPayout.setHours(17, 0, 0, 0) // 5 PM
    return nextPayout
  }
}

export default PayoutModuleService
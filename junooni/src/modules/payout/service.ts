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

interface EarningsCalculation {
  grossAmount: number
  commissionAmount: number
  taxAmount: number
  tdsAmount: number
  paymentProcessingFee: number
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

/**
 * Helper function to parse fulfillment type from metadata
 * Handles various formats:
 * - {"type":"JUNOONI-fulfillment"} -> junooni_fulfillment
 * - {"type":"Creator-fulfilment"} -> creator_fulfillment
 * - String that needs parsing
 */
function parseFulfillmentType(metadata?: any): "creator_fulfillment" | "junooni_fulfillment" {
  let fulfillmentType: "creator_fulfillment" | "junooni_fulfillment" = "creator_fulfillment"
  
  if (!metadata?.fulfillment_type) {
    return fulfillmentType
  }

  try {
    let fulfillmentData = metadata.fulfillment_type
    
    // If it's a string, try to parse it as JSON
    if (typeof fulfillmentData === 'string') {
      try {
        fulfillmentData = JSON.parse(fulfillmentData)
      } catch (e) {
        // If parsing fails, try to extract type using regex
        const typeMatch = fulfillmentData.match(/"type"\s*:\s*"([^"]+)"/i)
        if (typeMatch) {
          fulfillmentData = { type: typeMatch[1] }
        } else {
          // Last resort: check if the string itself contains the keywords
          const lowerStr = fulfillmentData.toLowerCase()
          if (lowerStr.includes('junooni')) {
            return "junooni_fulfillment"
          } else if (lowerStr.includes('creator')) {
            return "creator_fulfillment"
          }
          return fulfillmentType
        }
      }
    }
    
    // Check the type field (case-insensitive)
    if (fulfillmentData && typeof fulfillmentData === 'object' && fulfillmentData.type) {
      const typeValue = fulfillmentData.type.toLowerCase()
      
      if (typeValue.includes('junooni')) {
        fulfillmentType = "junooni_fulfillment"
      } else if (typeValue.includes('creator')) {
        fulfillmentType = "creator_fulfillment"
      }
    }
  } catch (parseError) {
    // Silent fail
  }
  
  return fulfillmentType
}

/**
 * Helper function to extract cost price from variant metadata
 * Checks variant metadata first, then product metadata as fallback
 */
function extractCostPrice(variantMetadata?: any, productMetadata?: any): number {
  // PRIORITY 1: Check variant metadata for cost_price (this is where it should be!)
  if (variantMetadata?.cost_price !== undefined && variantMetadata?.cost_price !== null) {
    const costPrice = Number(variantMetadata.cost_price)
    if (!isNaN(costPrice) && costPrice >= 0) {
      return costPrice
    }
  }
  
  // PRIORITY 2: Check product metadata as fallback
  if (productMetadata?.cost_price !== undefined && productMetadata?.cost_price !== null) {
    const costPrice = Number(productMetadata.cost_price)
    if (!isNaN(costPrice) && costPrice >= 0) {
      return costPrice
    }
  }
  
  // PRIORITY 3: Try payload_integration in product metadata
  if (productMetadata?.payload_integration) {
    try {
      let payloadData = productMetadata.payload_integration
      
      if (typeof payloadData === 'string') {
        payloadData = JSON.parse(payloadData)
      }
      
      if (payloadData.base_cost !== undefined && payloadData.base_cost !== null) {
        const baseCost = Number(payloadData.base_cost)
        if (!isNaN(baseCost) && baseCost >= 0) {
          return baseCost
        }
      }
    } catch (e) {
      // Silent fail
    }
  }
  
  return 0
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
    // Check if this order has already been processed
    const existingDetails = await this.listPayoutDetails({
      order_id: orderId
    })
    
    if (existingDetails.length > 0) {
      return
    }
    
    // Process each item individually
    for (const item of lineItems) {
      if (!item.product.vendor || !Array.isArray(item.product.vendor) || item.product.vendor.length === 0) {
        continue
      }

      // Process each vendor for this item
      for (const vendor of item.product.vendor) {
        if (!vendor || !vendor.id) {
          continue
        }

        // Check if this specific item-vendor combination already exists
        const existingItemDetail = await this.listPayoutDetails({
          order_id: orderId,
          order_item_id: item.id,
        })

        if (existingItemDetail.length > 0) {
          continue
        }

        try {
          // ✅ FIX: Parse fulfillment type from PRODUCT metadata
          const fulfillmentType = parseFulfillmentType(item.product.metadata)
          
          // ✅ FIX: Extract cost price from VARIANT metadata (with product fallback)
          const costPrice = extractCostPrice(item.variant?.metadata, item.product.metadata)
          
          const itemTotal = item.unit_price * item.quantity
          
          // Calculate earnings for this specific item
          const earnings = await this.calculateEarningsFromOrder(
            itemTotal, 
            fulfillmentType, 
            costPrice
          )
          
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
          
          // Update vendor account balance for this item
          await this.addEarningsToVendorAccount(vendor.id, earnings.netAmount)
          
        } catch (error) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Failed to process earnings for vendor ${vendor.id} on item ${item.id}: ${error.message}`
          )
        }
      }
    }
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
      return existingPayout
    }

    return await this.createPayouts({
      vendor_id: vendorId,
      current_balance: 0,
      pending_balance: 0,
      total_earned: 0,
      total_paid: 0,
      total_pending_payout: 0,
      total_orders: 0,
      avg_order_value: 0,
      minimum_payout_amount: 1000,
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
   * 
   * CORRECT CALCULATION LOGIC:
   * 
   * ═══════════════════════════════════════════════════════════════════
   * JUNOONI FULFILLMENT (Creator pays Junooni for blank + printing)
   * ═══════════════════════════════════════════════════════════════════
   * Example: Product listed for ₹700 (tax inclusive), Creator cost = ₹400
   * 
   * Step 1: Extract GST (5% for apparel < ₹1000)
   *   GST = ₹700 × 5/105 = ₹33.33
   *   Net Revenue (ex-GST) = ₹700 - ₹33.33 = ₹666.67
   * 
   * Step 2: Deduct Razorpay fee (2% + 18% GST on fee = 2.36% total)
   *   Razorpay Fee = ₹700 × 0.0236 = ₹16.52
   *   Net after gateway = ₹666.67 - ₹16.52 = ₹650.15
   * 
   * Step 3: Deduct creator cost (what creator pays Junooni)
   *   Creator Profit = ₹650.15 - ₹400 = ₹250.15
   * 
   * Step 4: Deduct TDS (1% of creator profit)
   *   TDS = ₹250.15 × 0.01 = ₹2.50
   *   Final Payout = ₹250.15 - ₹2.50 = ₹247.65
   * 
   * ═══════════════════════════════════════════════════════════════════
   * CREATOR FULFILLMENT (Creator handles everything, Junooni takes 10%)
   * ═══════════════════════════════════════════════════════════════════
   * Example: Product listed for ₹700 (tax inclusive)
   * 
   * Step 1: Deduct Razorpay fee (2% + 18% GST = 2.36% total)
   *   Razorpay Fee = ₹700 × 0.0236 = ₹16.52
   *   After gateway = ₹700 - ₹16.52 = ₹683.48
   * 
   * Step 2: Creator gets 90% of amount after gateway
   *   Creator Share = ₹683.48 × 0.90 = ₹615.13
   * 
   * Step 3: Deduct TDS (1% of creator share)
   *   TDS = ₹615.13 × 0.01 = ₹6.15
   *   Final Payout = ₹615.13 - ₹6.15 = ₹608.98
   * 
   * Note: GST is NOT deducted separately in creator fulfillment as
   * creator handles their own tax compliance.
   * 
   * All amounts are kept to 2 decimal places for accurate accounting.
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

    let vendorShare = 0
    let commissionRate = 0
    let paymentProcessingFee = 0
    let taxAmount = 0

    // Helper to round to 2 decimal places
    const round2 = (num: number) => Math.round(num * 100) / 100

    // Razorpay fee: 2% + 18% GST on fee = 2.36% of gross amount
    const RAZORPAY_FEE_RATE = 0.0236
    paymentProcessingFee = round2(orderTotal * RAZORPAY_FEE_RATE)

    switch (fulfillmentType) {
      case "creator_fulfillment":
        // Creator Fulfillment: ₹700 → Razorpay ₹16.52 → ₹683.48 → 90% = ₹615.13
        const afterGatewayCreator = orderTotal - paymentProcessingFee
        vendorShare = round2(afterGatewayCreator * 0.90)
        commissionRate = 90
        
        // GST not separately extracted for creator fulfillment
        taxAmount = 0
        break

      case "junooni_fulfillment":
        if (costPrice === undefined || costPrice === null) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Cost price is required for Junooni fulfillment"
          )
        }

        // Step 1: Extract GST (5% for apparel < ₹1000, adjust as needed)
        // GST = orderTotal × 5/105 (GST included in selling price)
        taxAmount = round2(orderTotal * 5 / 105)
        const netRevenue = orderTotal - taxAmount  // Ex-GST amount
        
        // Step 2: Net after gateway fee
        const netAfterGateway = netRevenue - paymentProcessingFee
        
        if (costPrice > netAfterGateway) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Cost price (₹${costPrice}) cannot exceed net amount after fees (₹${round2(netAfterGateway)})`
          )
        }
        
        // Step 3: Creator profit = Net after gateway - Cost price
        vendorShare = round2(netAfterGateway - costPrice)
        
        // Calculate commission rate for reporting purposes
        commissionRate = orderTotal > 0 
          ? Math.round((vendorShare / orderTotal) * 100) 
          : 0
        break

      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid fulfillment type: ${fulfillmentType}`
        )
    }

    // Calculate TDS (1% of vendor share/profit)
    const tdsPercentage = 1
    const tdsAmount = round2(vendorShare * 0.01)
    
    // Net amount = Vendor share - TDS
    const netAmount = round2(vendorShare - tdsAmount)

    return {
      grossAmount: orderTotal,           // Total amount customer paid
      commissionAmount: vendorShare,     // Creator profit/share before TDS
      taxAmount,                         // GST extracted (only for Junooni fulfillment)
      tdsAmount,                         // TDS deducted from creator
      paymentProcessingFee,              // Razorpay gateway fee
      netAmount,                         // Final payout to creator
      commissionRate,                    // Percentage for reference
      tdsPercentage,                     // TDS rate (1%)
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

    const payoutTransaction = await this.createPayoutDetails({
      amount: -amount,
      type: "payout",
      status: "processing",
      reason: reason,
      payout: vendorPayout.id,
    })

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

    const adjustmentTransaction = await this.createPayoutDetails({
      amount: amount,
      type: "adjustment",
      status: "completed",
      reason: `Manual adjustment: ${reason}`,
      payout: vendorPayout.id,
    })

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

    if (status === "failed" && payoutDetail.type === "payout") {
      const payoutId = typeof payoutDetail.payout === "string"
        ? payoutDetail.payout
        : (payoutDetail.payout && (payoutDetail.payout as any).id);

      const vendorPayout = payoutId ? await this.retrievePayout(payoutId) : null;
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

    const filters: any = { payout: vendorPayout.id }
    if (options.orderId) filters.order_id = options.orderId
    if (options.type) filters.type = options.type

    const [transactions, totalCount] = await this.listAndCountPayoutDetails(
      filters,
      {
        take: options.limit || 50,
        skip: options.offset || 0,
        order: { created_at: "DESC" },
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
    const batch = await this.retrievePayoutBatch(batchId)
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

    if (partialRefundItems && partialRefundItems.length > 0) {
      const itemIdsToRefund = partialRefundItems.map(item => item.order_item_id)
      existingEarnings = existingEarnings.filter(earning => 
        earning.order_item_id && itemIdsToRefund.includes(earning.order_item_id)
      )
    }

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

    for (const earning of existingEarnings) {
      // Resolve payout id if earning.payout is an object (some relations may populate the full object)
      const payoutRef = typeof earning.payout === "string"
        ? earning.payout
        : (earning.payout && (earning.payout as any).id) || undefined

      const refundDetail = await this.createPayoutDetails({
        order_id: earning.order_id,
        order_item_id: earning.order_item_id,
        product_id: earning.product_id,
        amount: -earning.amount,
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
        payout: payoutRef,
      })

      refundDetails.push(refundDetail)
      totalRefundAmount += Math.abs(earning.amount)

      const payoutId = payoutRef
      if (!payoutId) {
        // If we don't have a payout id, skip updating balances for this entry
      } else {
        const currentUpdate = vendorBalanceUpdates.get(payoutId) || 0
        vendorBalanceUpdates.set(payoutId, currentUpdate + Math.abs(earning.amount))
      }
    }

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
      }
    }

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

    let filteredRefunds = refundDetails
    if (options.startDate || options.endDate) {
      filteredRefunds = refundDetails.filter(refund => {
        const refundDate = new Date(refund.created_at)
        if (options.startDate && refundDate < options.startDate) return false
        if (options.endDate && refundDate > options.endDate) return false
        return true
      })
    }

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

    let filteredTransactions = transactions
    if (options.startDate || options.endDate) {
      filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.created_at)
        if (options.startDate && transactionDate < options.startDate) return false
        if (options.endDate && transactionDate > options.endDate) return false
        return true
      })
    }

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
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFriday)
        break
      
      case "biweekly":
        const daysUntilFridayBi = (5 - now.getDay() + 7) % 7 || 7
        nextPayout.setDate(now.getDate() + daysUntilFridayBi + 7)
        break
      
      case "monthly":
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0)
        const lastFridayOfNextMonth = new Date(lastDayOfNextMonth)
        lastFridayOfNextMonth.setDate(lastDayOfNextMonth.getDate() - ((lastDayOfNextMonth.getDay() + 2) % 7))
        return lastFridayOfNextMonth
    }

    nextPayout.setHours(17, 0, 0, 0)
    return nextPayout
  }
}

export default PayoutModuleService
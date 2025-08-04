import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Payout from "./models/payouts"
import PayoutBatch from "./models/payout_batch"
import PayoutDetails from "./models/payout_details"
import { InferTypeOf } from "@medusajs/framework/types"

type Payout = InferTypeOf<typeof Payout>
type PayoutBatch = InferTypeOf<typeof PayoutBatch>

class PayoutModuleService extends MedusaService({
  Payout,
  PayoutDetails,
  PayoutBatch,
}) {

  /**
   * Add earnings to vendor balance (similar to addPoints)
   */
  async addEarnings(vendorId: string, amount: number, orderId: string, fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"): Promise<Payout> {
    if (amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Earnings amount must be positive"
      )
    }

    const existingPayout = await this.getVendorPayout(vendorId)

    if (existingPayout) {
      return await this.updatePayouts({
        id: existingPayout.id,
        current_balance: existingPayout.current_balance + amount,
        total_earned: existingPayout.total_earned + amount,
        total_orders: existingPayout.total_orders + 1,
        last_earning_at: new Date(),
      })
    }

    return await this.createPayouts({
      vendor_id: vendorId,
      order_id: orderId,
      amount: amount,
      type: "earning",
      status: "completed",
      reason: `Order earnings - ${fulfillmentType}`,
      current_balance: amount,
      total_earned: amount,
      total_orders: 1,
      last_earning_at: new Date(),
    })
  }

  /**
   * Process payout (similar to deductPoints)
   */
  async processPayout(vendorId: string, amount: number, paymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual", reason: string): Promise<Payout> {
    if (amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payout amount must be positive"
      )
    }

    const existingPayout = await this.getVendorPayout(vendorId)

    if (!existingPayout) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Vendor payout record not found"
      )
    }

    if (existingPayout.current_balance < amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient balance for payout"
      )
    }

    if (!existingPayout.is_payout_enabled || existingPayout.hold_payouts) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Payouts are currently disabled for this vendor"
      )
    }

    if (amount < existingPayout.minimum_payout_amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Amount below minimum payout of ₹${existingPayout.minimum_payout_amount}`
      )
    }

    // Create payout transaction
    const payoutTransaction = await this.createPayouts({
      vendor_id: vendorId,
      amount: -amount,
      type: "payout",
      status: "processing",
      reason: reason,
      payment_method: paymentMethod,
    })

    // Update vendor balance
    await this.updatePayouts({
      id: existingPayout.id,
      current_balance: existingPayout.current_balance - amount,
      total_paid: existingPayout.total_paid + amount,
      last_payout_at: new Date(),
      next_payout_date: this.getNextPayoutDate(),
    })

    return payoutTransaction
  }

  /**
   * Get vendor current balance (similar to getPoints)
   */
  async getBalance(vendorId: string): Promise<number> {
    const payout = await this.getVendorPayout(vendorId)
    return payout?.current_balance || 0
  }

  /**
   * Get vendor payout record
   */
  async getVendorPayout(vendorId: string): Promise<Payout | null> {
    const payouts = await this.listPayouts({
      vendor_id: vendorId,
    })

    // Return the main record (non-payout transactions contain the balance)
    return payouts.find(p => p.current_balance !== undefined && p.current_balance !== null) || payouts[0] || null
  }

  /**
   * Calculate earnings from order (similar to calculatePointsFromAmount)
   */
  async calculateEarningsFromOrder(orderTotal: number, fulfillmentType: "creator_fulfillment" | "junooni_fulfillment", costPrice?: number): Promise<number> {
    if (orderTotal < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order total cannot be negative"
      )
    }

    let earnings = 0

    switch (fulfillmentType) {
      case "creator_fulfillment":
        // 70% commission
        earnings = Math.floor(orderTotal * 0.70)
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
        earnings = orderTotal - costPrice
        break

      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Invalid fulfillment type"
        )
    }

    // Apply TDS (1% deduction)
    const tdsAmount = Math.floor(earnings * 0.01)
    const netEarnings = earnings - tdsAmount

    return netEarnings
  }

  /**
   * Add manual adjustment
   */
  async addAdjustment(vendorId: string, amount: number, reason: string): Promise<Payout> {
    if (amount === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Adjustment amount cannot be zero"
      )
    }

    const existingPayout = await this.getVendorPayout(vendorId)

    if (!existingPayout && amount < 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cannot apply negative adjustment to non-existent vendor"
      )
    }

    const currentBalance = existingPayout?.current_balance || 0
    const newBalance = currentBalance + amount

    if (newBalance < 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Adjustment would result in negative balance"
      )
    }

    // Create adjustment transaction - using minimal fields
    const adjustmentTransaction = await this.createPayouts({
      vendor_id: vendorId,
      amount: amount,
      type: "adjustment",
      status: "completed",
      reason: `Manual adjustment: ${reason}`,
    })

    // Update main vendor record
    if (existingPayout) {
      await this.updatePayouts({
        id: existingPayout.id,
        current_balance: newBalance,
        total_earned: amount > 0 ? existingPayout.total_earned + amount : existingPayout.total_earned,
      })
    }

    return adjustmentTransaction
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(payoutId: string, status: "pending" | "processing" | "completed" | "failed" | "cancelled", processorResponse?: string): Promise<Payout> {
    const payout = await this.retrievePayout(payoutId)
    if (!payout) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Payout not found"
      )
    }

    const updateData: any = {
      id: payoutId,
      status,
    }

    if (status === "completed") {
      updateData.processed_at = new Date()
    }

    if (processorResponse) {
      updateData.processor_response = processorResponse
    }

    // If payout failed, restore balance
    if (status === "failed" && payout.type === "payout") {
      const vendorPayout = await this.getVendorPayout(payout.vendor_id)
      if (vendorPayout) {
        await this.updatePayouts({
          id: vendorPayout.id,
          current_balance: vendorPayout.current_balance + Math.abs(payout.amount),
          total_paid: vendorPayout.total_paid - Math.abs(payout.amount),
        })
      }
    }

    return await this.updatePayouts(updateData)
  }

  /**
   * Get vendors eligible for payout
   */
  async getEligibleVendors(): Promise<Payout[]> {
    const allPayouts = await this.listPayouts({})
    const vendorRecords = allPayouts.filter(p => p.current_balance !== undefined && p.current_balance !== null)
    
    return vendorRecords.filter(payout => 
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
  async processBatch(batchId: string): Promise<{ batch: PayoutBatch, successful: number, failed: number }> {
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

    // Map payment methods between batch and payout models
    let payoutPaymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual" = "manual"
    
    switch (batch.payment_method) {
      case "stripe":
        payoutPaymentMethod = "razorpay"
        break
      case "bank_transfer":
        payoutPaymentMethod = "bank_transfer"
        break
      case "paypal":
        payoutPaymentMethod = "paypal"
        break
      case "manual":
        payoutPaymentMethod = "manual"
        break
      default:
        payoutPaymentMethod = "manual"
    }

    for (const vendor of eligibleVendors) {
      try {
        await this.processPayout(
          vendor.vendor_id,
          vendor.current_balance,
          payoutPaymentMethod,
          `Batch payout - ${batch.period}`
        )
        successfulCount++
      } catch (error) {
        failedCount++
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
      failed: failedCount 
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

  // Private helper methods
  private getCurrentPayoutPeriod(): string {
    const now = new Date()
    const year = now.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`
  }

  private getNextPayoutDate(): Date {
    const now = new Date()
    const nextFriday = new Date(now)
    const dayOfWeek = nextFriday.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7
    
    if (daysUntilFriday === 0 && nextFriday.getHours() >= 17) {
      nextFriday.setDate(nextFriday.getDate() + 7)
    } else {
      nextFriday.setDate(nextFriday.getDate() + daysUntilFriday)
    }
    
    nextFriday.setHours(17, 0, 0, 0)
    return nextFriday
  }
}

export default PayoutModuleService
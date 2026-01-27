import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import LoyaltyPoint from "./models/loyalty-point"
import LoyaltyTransaction from "./models/loyalty-transaction"
import { InferTypeOf } from "@medusajs/framework/types"

type LoyaltyPoint = InferTypeOf<typeof LoyaltyPoint>
type LoyaltyTransaction = InferTypeOf<typeof LoyaltyTransaction>

class LoyaltyModuleService extends MedusaService({
  LoyaltyPoint,
  LoyaltyTransaction,
}) {
  
  // ✅ UPDATED: Changed signature to accept options object
  async addPoints(
    customerId: string, 
    points: number, 
    options?: {
      reason?: string
      description?: string
      order_id?: string
      reference_type?: string
      amount?: number
    }
  ): Promise<LoyaltyPoint> {
    console.log("[LOYALTY_SERVICE] addPoints called")
    console.log("[LOYALTY_SERVICE] Customer ID:", customerId)
    console.log("[LOYALTY_SERVICE] Points to add:", points)
    console.log("[LOYALTY_SERVICE] Options:", options)

    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    console.log("[LOYALTY_SERVICE] Existing points:", existingPoints.length > 0 ? existingPoints[0].points : 0)

    let loyaltyPoint: LoyaltyPoint
    const newBalance = existingPoints.length > 0 ? existingPoints[0].points + points : points

    console.log("[LOYALTY_SERVICE] New balance will be:", newBalance)

    if (existingPoints.length > 0) {
      loyaltyPoint = await this.updateLoyaltyPoints({
        id: existingPoints[0].id,
        points: newBalance,
      })
      console.log("[LOYALTY_SERVICE] Updated existing loyalty point record")
    } else {
      loyaltyPoint = await this.createLoyaltyPoints({
        customer_id: customerId,
        points: newBalance,
      })
      console.log("[LOYALTY_SERVICE] Created new loyalty point record")
    }

    // Record transaction
    await this.createLoyaltyTransactions({
      customer_id: customerId,
      points: points,
      balance_after: newBalance,
      event_type: options?.reason || "purchase",
      description: options?.description || `Added ${points} points`,
      reference_id: options?.order_id,
      reference_type: options?.reference_type || (options?.order_id ? "order" : undefined),
      order_amount: options?.amount,
    })

    console.log("[LOYALTY_SERVICE] Transaction recorded")
    console.log("[LOYALTY_SERVICE] Points added successfully. New balance:", newBalance)

    return loyaltyPoint
  }

  // ✅ UPDATED: Changed signature to accept options object
  async deductPoints(
    customerId: string, 
    points: number, 
    options?: {
      reason?: string
      description?: string
      order_id?: string
      reference_type?: string
      amount?: number
      note?: string
    }
  ): Promise<LoyaltyPoint> {
    console.log("[LOYALTY_SERVICE] deductPoints called")
    console.log("[LOYALTY_SERVICE] Customer ID:", customerId)
    console.log("[LOYALTY_SERVICE] Points to deduct:", points)
    console.log("[LOYALTY_SERVICE] Options:", options)

    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    console.log("[LOYALTY_SERVICE] Current balance:", existingPoints.length > 0 ? existingPoints[0].points : 0)

    if (existingPoints.length === 0 || existingPoints[0].points < points) {
      console.error("[LOYALTY_SERVICE] Insufficient points!")
      console.error("[LOYALTY_SERVICE] Required:", points)
      console.error("[LOYALTY_SERVICE] Available:", existingPoints.length > 0 ? existingPoints[0].points : 0)
      
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Insufficient loyalty points. Required: ${points}, Available: ${existingPoints.length > 0 ? existingPoints[0].points : 0}`
      )
    }

    const newBalance = existingPoints[0].points - points

    console.log("[LOYALTY_SERVICE] New balance will be:", newBalance)

    const loyaltyPoint = await this.updateLoyaltyPoints({
      id: existingPoints[0].id,
      points: newBalance,
    })

    console.log("[LOYALTY_SERVICE] Updated loyalty point record")

    // Record transaction
    const description = options?.description || 
                       options?.note || 
                       `Redeemed ${points} points`

    await this.createLoyaltyTransactions({
      customer_id: customerId,
      points: -points, // Negative for deduction
      balance_after: newBalance,
      event_type: options?.reason || "redemption",
      description: description,
      reference_id: options?.order_id,
      reference_type: options?.reference_type || (options?.order_id ? "order" : undefined),
      order_amount: options?.amount,
    })

    console.log("[LOYALTY_SERVICE] Transaction recorded")
    console.log("[LOYALTY_SERVICE] Points deducted successfully. New balance:", newBalance)

    return loyaltyPoint
  }

  // ✅ UPDATED: For backwards compatibility
  async addPointsForPurchase(
    customerId: string,
    orderId: string,
    orderTotal: number,
    description?: string
  ): Promise<LoyaltyPoint> {
    const points = await this.calculatePointsFromAmount(orderTotal)
    
    return this.addPoints(
      customerId,
      points,
      {
        reason: "purchase",
        description: description || `Earned ${points} points from order #${orderId}`,
        order_id: orderId,
        reference_type: "order",
        amount: orderTotal
      }
    )
  }

  // ✅ NEW: Get current balance
  async getBalance(customerId: string): Promise<number> {
    console.log("[LOYALTY_SERVICE] getBalance called for customer:", customerId)
    const points = await this.getPoints(customerId)
    console.log("[LOYALTY_SERVICE] Current balance:", points)
    return points
  }

  async getPoints(customerId: string): Promise<number> {
    const points = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    return points[0]?.points || 0
  }

  async getTransactionHistory(customerId: string, limit: number = 50, offset: number = 0): Promise<LoyaltyTransaction[]> {
    const transactions = await this.listLoyaltyTransactions({
      customer_id: customerId,
    }, {
      order: { created_at: "desc" },
      take: limit,
      skip: offset,
    })

    return transactions
  }

  async calculatePointsFromAmount(amount: number): Promise<number> {
    // Convert amount to points using a standard conversion rate
    // Rs 100 = 1 point
    const points = Math.floor(amount / 100)

    if (points < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount cannot be negative"
      )
    }

    console.log("[LOYALTY_SERVICE] calculatePointsFromAmount:", amount, "->", points, "points")
    return points
  }

  async calculateAmountFromPoints(points: number): Promise<number> {
    // 1 point = Rs 1
    if (points < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Points cannot be negative"
      )
    }
    const amount = points * 1
    console.log("[LOYALTY_SERVICE] calculateAmountFromPoints:", points, "->", amount, "rupees")
    return amount
  }
}

export default LoyaltyModuleService
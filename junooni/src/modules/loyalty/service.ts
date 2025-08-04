// import { MedusaError, MedusaService } from "@medusajs/framework/utils"
// import LoyaltyPoint from "./models/loyalty-point"
// import { InferTypeOf } from "@medusajs/framework/types"

// type LoyaltyPoint = InferTypeOf<typeof LoyaltyPoint>

// class LoyaltyModuleService extends MedusaService({
//   LoyaltyPoint,
// }) {
//   async addPoints(customerId: string, points: number): Promise<LoyaltyPoint> {
//     const existingPoints = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     if (existingPoints.length > 0) {
//       return await this.updateLoyaltyPoints({
//         id: existingPoints[0].id,
//         points: existingPoints[0].points + points,
//       })
//     }

//     return await this.createLoyaltyPoints({
//       customer_id: customerId,
//       points,
//     })
//   }

//   async deductPoints(customerId: string, points: number): Promise<LoyaltyPoint> {
//     const existingPoints = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     if (existingPoints.length === 0 || existingPoints[0].points < points) {
//       throw new MedusaError(
//         MedusaError.Types.NOT_ALLOWED,
//         "Insufficient loyalty points"
//       )
//     }

//     return await this.updateLoyaltyPoints({
//       id: existingPoints[0].id,
//       points: existingPoints[0].points - points,
//     })
//   }

//   async getPoints(customerId: string): Promise<number> {
//     const points = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     return points[0]?.points || 0
//   }

//   async calculatePointsFromAmount(amount: number): Promise<number> {
//     // Convert amount to points using a standard conversion rate
//     // For example, $1 = 1 point
//     // Round down to nearest whole point
//     const points = Math.floor(amount/ 100)

//     if (points < 0) {
//       throw new MedusaError(
//         MedusaError.Types.INVALID_DATA,
//         "Amount cannot be negative"
//       )
//     }

//     return points
//   }

//   async calculateAmountFromPoints(points: number): Promise<number> {
//     // 1 point = Rs 1
//     if (points < 0) {
//       throw new MedusaError(
//         MedusaError.Types.INVALID_DATA,
//         "Points cannot be negative"
//       )
//     }
//      const amount = points * 1
//   console.log('Calculated amount:', amount)
//   return amount
//   }

// }

// export default LoyaltyModuleService


// import { MedusaError, MedusaService } from "@medusajs/framework/utils"
// import LoyaltyPoint from "./models/loyalty-point"
// import LoyaltyTransaction from "./models/loyalty-transaction"
// import { InferTypeOf } from "@medusajs/framework/types"

// type LoyaltyPoint = InferTypeOf<typeof LoyaltyPoint>
// type LoyaltyTransaction = InferTypeOf<typeof LoyaltyTransaction>

// class LoyaltyModuleService extends MedusaService({
//   LoyaltyPoint,
//   LoyaltyTransaction,
// }) {
//   async addPoints(customerId: string, points: number, eventType: string = "purchase", description?: string, referenceId?: string, referenceType?: string): Promise<LoyaltyPoint> {
//     const existingPoints = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     let loyaltyPoint: LoyaltyPoint
//     const newBalance = existingPoints.length > 0 ? existingPoints[0].points + points : points

//     if (existingPoints.length > 0) {
//       loyaltyPoint = await this.updateLoyaltyPoints({
//         id: existingPoints[0].id,
//         points: newBalance,
//       })
//     } else {
//       loyaltyPoint = await this.createLoyaltyPoints({
//         customer_id: customerId,
//         points: newBalance,
//       })
//     }

//     // Record transaction
//     await this.createLoyaltyTransactions({
//       customer_id: customerId,
//       points: points,
//       balance_after: newBalance,
//       event_type: eventType,
//       description: description || `Added ${points} points`,
//       reference_id: referenceId,
//       reference_type: referenceType,
//     })

//     return loyaltyPoint
//   }

//   async deductPoints(customerId: string, points: number, eventType: string = "redemption", description?: string, referenceId?: string, referenceType?: string): Promise<LoyaltyPoint> {
//     const existingPoints = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     if (existingPoints.length === 0 || existingPoints[0].points < points) {
//       throw new MedusaError(
//         MedusaError.Types.NOT_ALLOWED,
//         "Insufficient loyalty points"
//       )
//     }

//     const newBalance = existingPoints[0].points - points

//     const loyaltyPoint = await this.updateLoyaltyPoints({
//       id: existingPoints[0].id,
//       points: newBalance,
//     })

//     // Record transaction
//     await this.createLoyaltyTransactions({
//       customer_id: customerId,
//       points: -points, // Negative for deduction
//       balance_after: newBalance,
//       event_type: eventType,
//       description: description || `Redeemed ${points} points`,
//       reference_id: referenceId,
//       reference_type: referenceType,
//     })

//     return loyaltyPoint
//   }

//   async getPoints(customerId: string): Promise<number> {
//     const points = await this.listLoyaltyPoints({
//       customer_id: customerId,
//     })

//     return points[0]?.points || 0
//   }

//   async getTransactionHistory(customerId: string, limit: number = 50, offset: number = 0): Promise<LoyaltyTransaction[]> {
//     const transactions = await this.listLoyaltyTransactions({
//       customer_id: customerId,
//     }, {
//       order: { created_at: "desc" },
//       take: limit,
//       skip: offset,
//     })

//     return transactions
//   }

//   async calculatePointsFromAmount(amount: number): Promise<number> {
//     // Convert amount to points using a standard conversion rate
//     // For example, Rs 100 = 1 point
//     // Round down to nearest whole point
//     const points = Math.floor(amount / 100)

//     if (points < 0) {
//       throw new MedusaError(
//         MedusaError.Types.INVALID_DATA,
//         "Amount cannot be negative"
//       )
//     }

//     return points
//   }

//   async calculateAmountFromPoints(points: number): Promise<number> {
//     // 1 point = Rs 1
//     if (points < 0) {
//       throw new MedusaError(
//         MedusaError.Types.INVALID_DATA,
//         "Points cannot be negative"
//       )
//     }
//     const amount = points * 1
//     console.log('Calculated amount:', amount)
//     return amount
//   }
// }

// export default LoyaltyModuleService

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
  
  // ✅ FIXED: Added orderAmount parameter
  async addPoints(
    customerId: string, 
    points: number, 
    eventType: string = "purchase", 
    description?: string, 
    referenceId?: string, 
    referenceType?: string,
    orderAmount?: number  // ✅ ADD THIS: New parameter for order amount
  ): Promise<LoyaltyPoint> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    let loyaltyPoint: LoyaltyPoint
    const newBalance = existingPoints.length > 0 ? existingPoints[0].points + points : points

    if (existingPoints.length > 0) {
      loyaltyPoint = await this.updateLoyaltyPoints({
        id: existingPoints[0].id,
        points: newBalance,
      })
    } else {
      loyaltyPoint = await this.createLoyaltyPoints({
        customer_id: customerId,
        points: newBalance,
      })
    }

    // ✅ FIXED: Record transaction WITH order amount
    await this.createLoyaltyTransactions({
      customer_id: customerId,
      points: points,
      balance_after: newBalance,
      event_type: eventType,
      description: description || `Added ${points} points`,
      reference_id: referenceId,
      reference_type: referenceType,
      order_amount: orderAmount,  // ✅ ADD THIS: Store the order amount
    })

    return loyaltyPoint
  }

  // ✅ UPDATED: Also add orderAmount to deductPoints for consistency
  async deductPoints(
    customerId: string, 
    points: number, 
    eventType: string = "redemption", 
    description?: string, 
    referenceId?: string, 
    referenceType?: string,
    orderAmount?: number  // ✅ ADD THIS: For consistency (usually null for redemptions)
  ): Promise<LoyaltyPoint> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existingPoints.length === 0 || existingPoints[0].points < points) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient loyalty points"
      )
    }

    const newBalance = existingPoints[0].points - points

    const loyaltyPoint = await this.updateLoyaltyPoints({
      id: existingPoints[0].id,
      points: newBalance,
    })

    // ✅ FIXED: Record transaction WITH order amount
    await this.createLoyaltyTransactions({
      customer_id: customerId,
      points: -points, // Negative for deduction
      balance_after: newBalance,
      event_type: eventType,
      description: description || `Redeemed ${points} points`,
      reference_id: referenceId,
      reference_type: referenceType,
      order_amount: orderAmount,  // ✅ ADD THIS: Store the order amount (usually null for redemptions)
    })

    return loyaltyPoint
  }

  // ✅ NEW: Convenience method specifically for purchase transactions
  async addPointsForPurchase(
    customerId: string,
    orderId: string,
    orderTotal: number,
    description?: string
  ): Promise<LoyaltyPoint> {
    // Calculate points based on order total
    const points = await this.calculatePointsFromAmount(orderTotal)
    
    return this.addPoints(
      customerId,
      points,
      "purchase",
      description || `Earned ${points} points from order #${orderId}`,
      orderId,
      "order",
      orderTotal  // ✅ IMPORTANT: Pass the order total as order amount
    )
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
    // For example, Rs 100 = 1 point
    // Round down to nearest whole point
    // const points = Math.floor(amount / 100)
    const points = Math.floor(amount * 100)

    if (points < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount cannot be negative"
      )
    }

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
    console.log('Calculated amount:', amount)
    return amount
  }
}

export default LoyaltyModuleService
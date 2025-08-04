// import { 
//   AuthenticatedMedusaRequest, 
//   MedusaResponse
// } from "@medusajs/framework/http";
// import { LOYALTY_MODULE } from "../../../../../modules/loyalty";
// import LoyaltyModuleService from "../../../../../modules/loyalty/service";

// // GET method - Fetch current loyalty points
// export async function GET(
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) {
//   console.log("🚀 LOYALTY POINTS ROUTE CALLED")
//   console.log("🔐 Auth context:", req.auth_context)
//   console.log("👤 Actor ID:", req.auth_context.actor_id)
  
//   const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
//     LOYALTY_MODULE
//   )

//   console.log("📊 Loyalty service resolved, calling getPoints...")
  
//   try {
//     const points = await loyaltyModuleService.getPoints(
//       req.auth_context.actor_id
//     )
    
//     console.log("✅ Points retrieved:", points)

//     res.json({
//       points,
//     })
//   } catch (error) {
//     console.error("❌ Error getting points:", error)
//     res.status(500).json({
//       error: "Failed to get loyalty points",
//       details: error.message
//     })
//   }
// }

// // POST method - Recalculate loyalty points balance
// export async function POST(
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) {
//   const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
//     LOYALTY_MODULE
//   )

//   const { action } = req.body
  
//   if (action === "recalculate") {
//     try {
//       console.log("🔧 Manual recalculate requested")
      
//       const customerId = req.auth_context.actor_id
//       const query = req.scope.resolve("query")
      
//       // Fetch orders in the route (not in the service)
//       console.log(`📋 Fetching orders for customer ${customerId}`)
      
//       const { data: orders } = await query.graph({
//         entity: "order",
//         fields: [
//           "id",
//           "total",
//           "original_total", 
//           "item_total",
//           "created_at",
//           "display_id",
//           "currency_code",
//           "summary.*",
//           "fulfillments.*"
//         ],
//         filters: {
//           customer_id: customerId
//         }
//       })

//       console.log(`📋 Found ${orders.length} orders for customer`)

//       let totalPoints = 0
      
//       // Calculate points from all delivered orders
//       for (const order of orders) {
//         const originalTotal = getOriginalOrderTotal(order)
//         const isDelivered = isOrderDelivered(order)
//         const refundedAmount = order.summary?.refunded_total ? (+order.summary.refunded_total) : 0
        
//         console.log(`📦 Order ${order.display_id || order.id.slice(-8)}: total=${originalTotal}, delivered=${isDelivered}, refunded=${refundedAmount}`)
        
//         if (originalTotal && originalTotal > 0 && isDelivered) {
//           // Points earned from purchase
//           const pointsEarned = Math.round(originalTotal / 100)
//           totalPoints += pointsEarned
          
//           console.log(`   ✅ Earned: +${pointsEarned} points from ${originalTotal}`)
          
//           // Points lost from refunds
//           if (refundedAmount > 0) {
//             const pointsLost = Math.round(refundedAmount / 100)
//             totalPoints -= pointsLost
//             console.log(`   🔄 Refunded: -${pointsLost} points from ${refundedAmount}`)
//           }
          
//           console.log(`   📊 Order net: ${pointsEarned - Math.round(refundedAmount / 100)} points`)
//         } else {
//           const reason = !originalTotal ? "no valid total" : !isDelivered ? "not delivered" : "total is 0"
//           console.log(`   ⏭️ Skipped: ${reason}`)
//         }
//       }

//       console.log(`💰 Calculated total points: ${totalPoints}`)

//       // Use simple service method to update the balance
//       const records = await loyaltyModuleService.listLoyaltyPoints({
//         customer_id: customerId,
//       })
      
//       if (records.length === 0) {
//         console.log(`🆕 Creating new balance record with ${totalPoints} points`)
//         await loyaltyModuleService.createLoyaltyPoints({
//           customer_id: customerId,
//           points: totalPoints,
//         })
//       } else {
//         console.log(`🔄 Updating balance from ${records[0].points} to ${totalPoints} points`)
//         await loyaltyModuleService.updateLoyaltyPoints({
//           id: records[0].id,
//           points: totalPoints,
//         })
//       }

//       console.log(`✅ Balance synchronized: ${totalPoints} points`)
      
//       res.json({
//         success: true,
//         points: totalPoints,
//         message: "Balance recalculated",
//         orders_processed: orders.length
//       })
//     } catch (error) {
//       console.error("❌ Recalculate failed:", error)
//       res.status(500).json({
//         error: "Failed to recalculate balance",
//         details: error.message
//       })
//     }
//   } else {
//     res.status(400).json({
//       error: "Invalid action. Use: { action: 'recalculate' }"
//     })
//   }
// }

// // Helper functions
// function getOriginalOrderTotal(order: any): number | null {
//   const toNumber = (value: any): number | null => {
//     if (value === null || value === undefined) return null;
    
//     if (value && typeof value === 'object' && value.raw_) {
//       return parseFloat(value.raw_.value);
//     }
    
//     const num = parseFloat(value);
//     return isNaN(num) ? null : num;
//   };

//   return toNumber(order.total) || toNumber(order.original_total) || toNumber(order.item_total);
// }

// function isOrderDelivered(order: any): boolean {
//   if (order.fulfillments && Array.isArray(order.fulfillments) && order.fulfillments.length > 0) {
//     return order.fulfillments.some((fulfillment: any) => 
//       fulfillment && (
//         fulfillment.delivered_at !== null && fulfillment.delivered_at !== undefined ||
//         fulfillment.status === 'delivered'
//       )
//     );
//   }
  
//   return false;
// }


import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../../../modules/loyalty";
import LoyaltyModuleService from "../../../../../modules/loyalty/service";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const points = await loyaltyModuleService.getPoints(
    req.auth_context.actor_id
  )

  res.json({
    points,
  })
}

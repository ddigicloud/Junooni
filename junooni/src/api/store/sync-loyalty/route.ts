// api/store/sync-loyalty/route.ts - SYNC POINTS WITH HISTORY
import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../modules/loyalty";
import LoyaltyModuleService from "../../../modules/loyalty/service";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  try {
    const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE);
    const query = req.scope.resolve("query");
    const customerId = req.auth_context.actor_id;

    console.log(`🔄 SYNCING LOYALTY POINTS for customer ${customerId}...`);

    // Get current points from loyalty service
    const currentPoints = await loyaltyModuleService.getPoints(customerId);
    console.log(`📊 Current loyalty points: ${currentPoints}`);

    // Get all delivered orders for this customer (same logic as history route)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "status", 
        "total",
        "original_total",
        "currency_code",
        "display_id",
        "created_at",
        "summary.*",
        "fulfillments.*",
        "cart.*",
        "cart.promotions.*",
        "cart.promotions.rules.*",
        "cart.promotions.rules.values.*",
        "cart.promotions.application_method.*"
      ],
      filters: {
        customer_id: customerId
      }
    });

    console.log(`📦 Found ${orders.length} orders for customer`);

    let totalPointsFromOrders = 0;
    let deliveredOrdersCount = 0;

    // Calculate total points from all delivered orders (same logic as history)
    for (const order of orders) {
      const orderTotal = getOrderTotal(order);
      const isDelivered = isOrderDelivered(order);
      const hasLoyaltyPromo = hasLoyaltyPromotion(order);

      if (orderTotal && orderTotal > 0 && isDelivered && !hasLoyaltyPromo) {
        const pointsEarned = await loyaltyModuleService.calculatePointsFromAmount(orderTotal / 100);
        totalPointsFromOrders += pointsEarned;
        deliveredOrdersCount++;
        
        console.log(`✅ Order ${order.display_id}: ${pointsEarned} points (total: ${orderTotal})`);
      }
    }

    console.log(`📊 SUMMARY:`);
    console.log(`   Current points in database: ${currentPoints}`);
    console.log(`   Points from delivered orders: ${totalPointsFromOrders}`);
    console.log(`   Delivered orders: ${deliveredOrdersCount}/${orders.length}`);

    // Sync the points if there's a discrepancy
    if (currentPoints !== totalPointsFromOrders) {
      const pointsToAdjust = totalPointsFromOrders - currentPoints;
      
      console.log(`🔧 SYNCING: Adjusting by ${pointsToAdjust} points`);
      
      if (pointsToAdjust > 0) {
        await loyaltyModuleService.addPoints(customerId, pointsToAdjust);
      } else {
        await loyaltyModuleService.deductPoints(customerId, Math.abs(pointsToAdjust));
      }
      
      const newBalance = await loyaltyModuleService.getPoints(customerId);
      
      return res.json({
        success: true,
        message: "Points synchronized successfully",
        before: currentPoints,
        after: newBalance,
        adjustment: pointsToAdjust,
        deliveredOrders: deliveredOrdersCount,
        totalOrders: orders.length
      });
    } else {
      return res.json({
        success: true,
        message: "Points already in sync",
        currentPoints: currentPoints,
        deliveredOrders: deliveredOrdersCount,
        totalOrders: orders.length
      });
    }

  } catch (error) {
    console.error("🔧 SYNC ERROR:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}

// Helper functions (same as history route)
function getOrderTotal(order: any): number | null {
  const toNumber = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    
    if (value && typeof value === 'object' && value.raw_) {
      return +value.raw_.value || null;
    }
    
    const num = +value;
    return isNaN(num) ? null : num;
  };

  let originalTotal = toNumber(order.total);
  if (!originalTotal) {
    originalTotal = toNumber(order.original_total);
  }

  if (!originalTotal || originalTotal <= 0) return null;

  let refundedAmount = 0;
  if (order.summary?.refunded_total) {
    refundedAmount = toNumber(order.summary.refunded_total) || 0;
  }

  const netAmount = originalTotal - refundedAmount;
  return netAmount > 0 ? netAmount : null;
}

function isOrderDelivered(order: any): boolean {
  if (order.fulfillments && Array.isArray(order.fulfillments) && order.fulfillments.length > 0) {
    return order.fulfillments.some((fulfillment: any) => 
      fulfillment && (
        fulfillment.delivered_at !== null && fulfillment.delivered_at !== undefined ||
        fulfillment.shipped_at !== null && fulfillment.shipped_at !== undefined ||
        fulfillment.status === 'delivered' ||
        fulfillment.status === 'shipped'
      )
    );
  }
  return false;
}

function hasLoyaltyPromotion(order: any): boolean {
  // Check if order used loyalty points for payment
  if (order.cart?.promotions && Array.isArray(order.cart.promotions)) {
    return order.cart.promotions.some((promo: any) => 
      promo.code && promo.code.includes('LOYALTY')
    );
  }
  return false;
}

/*
USAGE:
POST http://localhost:9000/store/sync-loyalty

This will:
1. Calculate total points from all delivered orders
2. Compare with current loyalty points balance  
3. Sync them if there's a discrepancy
4. Show you the before/after
*/
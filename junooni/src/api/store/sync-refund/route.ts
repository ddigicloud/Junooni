// api/store/sync-refunds/route.ts - SYNC POINTS AFTER REFUNDS
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

    console.log(`🔄 SYNCING POINTS AFTER REFUNDS for customer ${customerId}...`);

    // Get current points from loyalty service (database)
    const currentPointsInDatabase = await loyaltyModuleService.getPoints(customerId);
    console.log(`📊 Current points in database: ${currentPointsInDatabase}`);

    // Get all orders with current states (including refunds)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "status", 
        "total",
        "original_total",
        "currency_code",
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

    console.log(`📦 Found ${orders.length} orders for analysis`);

    let correctPointsAfterRefunds = 0;
    let orderAnalysis = [];

    // Calculate what points should be based on CURRENT order states
    for (const order of orders) {
      const originalTotal = getOriginalOrderTotal(order);
      const netTotalAfterRefunds = getNetOrderTotal(order);
      const isDelivered = isOrderDelivered(order);
      const hasLoyaltyPromo = hasLoyaltyPromotion(order);
      const wasRefunded = order.summary?.refunded_total && (+order.summary.refunded_total) > 0;

      const analysis = {
        order_id: order.display_id || order.id.slice(-8),
        original_total: originalTotal,
        refunded_amount: wasRefunded ? (+order.summary.refunded_total) : 0,
        net_total_after_refunds: netTotalAfterRefunds,
        is_delivered: isDelivered,
        has_loyalty_promo: hasLoyaltyPromo,
        was_refunded: wasRefunded,
        points_calculation: null,
        created_at: order.created_at
      };

      // Only award points for delivered orders that haven't been fully refunded
      if (netTotalAfterRefunds && netTotalAfterRefunds > 0 && isDelivered && !hasLoyaltyPromo) {
        const exactPoints = netTotalAfterRefunds / 100;
        const pointsEarned = Math.round(exactPoints);
        correctPointsAfterRefunds += pointsEarned;
        
        analysis.points_calculation = {
          exact_points: exactPoints,
          rounded_points: pointsEarned,
          calculation: `${netTotalAfterRefunds} ÷ 100 = ${exactPoints} → ${pointsEarned}`
        };

        console.log(`✅ Order ${order.display_id}: ${netTotalAfterRefunds} → ${pointsEarned} points ${wasRefunded ? '(after refund)' : ''}`);
      } else {
        analysis.points_calculation = {
          exact_points: 0,
          rounded_points: 0,
          reason: !isDelivered ? "not delivered" : 
                  hasLoyaltyPromo ? "used loyalty points" :
                  !netTotalAfterRefunds ? "fully refunded or invalid total" : "unknown"
        };

        console.log(`⏭️ Order ${order.display_id}: 0 points - ${analysis.points_calculation.reason}`);
      }

      orderAnalysis.push(analysis);
    }

    const discrepancy = currentPointsInDatabase - correctPointsAfterRefunds;

    console.log(`📊 REFUND SYNC ANALYSIS:`);
    console.log(`   Points in database: ${currentPointsInDatabase}`);
    console.log(`   Correct points after refunds: ${correctPointsAfterRefunds}`);
    console.log(`   Discrepancy: ${discrepancy}`);

    // Find refunded orders for detailed analysis
    const refundedOrders = orderAnalysis.filter(o => o.was_refunded);
    const refundImpact = refundedOrders.map(o => ({
      order_id: o.order_id,
      original_total: o.original_total,
      refunded_amount: o.refunded_amount,
      net_after_refund: o.net_total_after_refunds,
      points_now: o.points_calculation?.rounded_points || 0,
      points_impact: `Originally would give ${Math.round((o.original_total || 0) / 100)} points, now gives ${o.points_calculation?.rounded_points || 0} points`
    }));

    if (discrepancy === 0) {
      return res.json({
        success: true,
        message: "Points are already correctly synced with refunds",
        current_points: currentPointsInDatabase,
        correct_points: correctPointsAfterRefunds,
        refunded_orders: refundedOrders.length,
        refund_impact: refundImpact,
        order_analysis: orderAnalysis
      });
    }

    // Fix the discrepancy
    if (discrepancy > 0) {
      console.log(`🔧 REMOVING ${discrepancy} excess points due to refunds`);
      await loyaltyModuleService.deductPoints(customerId, discrepancy);
    } else {
      console.log(`🔧 ADDING ${Math.abs(discrepancy)} missing points`);
      await loyaltyModuleService.addPoints(customerId, Math.abs(discrepancy));
    }

    const finalPoints = await loyaltyModuleService.getPoints(customerId);

    res.json({
      success: true,
      message: "Points synced successfully after accounting for refunds",
      before: currentPointsInDatabase,
      correct_amount_after_refunds: correctPointsAfterRefunds,
      after: finalPoints,
      adjustment: discrepancy > 0 ? -discrepancy : Math.abs(discrepancy),
      refund_analysis: {
        total_orders: orders.length,
        refunded_orders: refundedOrders.length,
        refund_impact: refundImpact,
        points_removed_due_to_refunds: discrepancy > 0 ? discrepancy : 0
      },
      order_analysis: orderAnalysis
    });

  } catch (error) {
    console.error("🔧 REFUND SYNC ERROR:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}

// Helper functions
function getOriginalOrderTotal(order: any): number | null {
  const toNumber = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    
    if (value && typeof value === 'object' && value.raw_) {
      return +value.raw_.value || null;
    }
    
    const num = +value;
    return isNaN(num) ? null : num;
  };

  return toNumber(order.total) || toNumber(order.original_total);
}

function getNetOrderTotal(order: any): number | null {
  const toNumber = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    
    if (value && typeof value === 'object' && value.raw_) {
      return +value.raw_.value || null;
    }
    
    const num = +value;
    return isNaN(num) ? null : num;
  };

  let originalTotal = toNumber(order.total) || toNumber(order.original_total);
  
  if (!originalTotal || originalTotal <= 0) return null;

  // Subtract refunds to get net amount
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
        fulfillment.status === 'delivered' ||
        fulfillment.shipped_at !== null && fulfillment.shipped_at !== undefined ||
        fulfillment.status === 'shipped'
      )
    );
  }
  return false;
}

function hasLoyaltyPromotion(order: any): boolean {
  if (order.cart?.promotions && Array.isArray(order.cart.promotions)) {
    return order.cart.promotions.some((promo: any) => 
      promo.code && promo.code.includes('LOYALTY')
    );
  }
  return false;
}

/*
USAGE: POST http://localhost:9000/store/sync-refunds

This will:
1. Calculate what your points should be based on current order states (including refunds)
2. Compare with your current loyalty balance  
3. Fix any discrepancy caused by refunds not being processed
4. Show detailed analysis of how refunds affected your points

Expected: Your loyalty balance will be reduced to match the history (after refund)
*/
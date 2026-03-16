// subscribers/order-refunded.ts - NEW REFUND HANDLING
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { LOYALTY_MODULE } from "../modules/loyalty";
import LoyaltyModuleService from "../modules/loyalty/service";

export default async function orderRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    console.log(`💸 ORDER REFUND EVENT TRIGGERED: ${JSON.stringify(data)}`);
    
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(LOYALTY_MODULE);
    const query = container.resolve("query");
    
    // Get the refunded order details
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "custom_display_id",
        "customer.*",
        "total",
        "original_total",
        "summary.*",
        "fulfillments.*",
        "cart.*",
        "cart.promotions.*",
        "cart.promotions.rules.*",
        "cart.promotions.rules.values.*",
        "cart.promotions.application_method.*"
      ],
      filters: {
        id: data.id
      }
    });

    if (orders.length === 0) {
      console.log(`❌ Refunded order ${data.id} not found`);
      return;
    }

    const order = orders[0];
    
    console.log(`📋 Processing refund for order ${order.custom_display_id}:`);
    console.log(`   Customer: ${order.customer?.id}`);
    console.log(`   Original Total: ${order.total}`);
    console.log(`   Refunded Total: ${order.summary?.refunded_total}`);

    // Check if this order previously earned points
    const wasDelivered = isOrderDelivered(order);
    const hadLoyaltyPromo = hasLoyaltyPromotion(order);
    const originalTotal = getOrderTotal(order, false); // Get original total without refund deduction
    
    console.log(`   Was Delivered: ${wasDelivered}`);
    console.log(`   Had Loyalty Promo: ${hadLoyaltyPromo}`);
    console.log(`   Original Order Total: ${originalTotal}`);

    // Only deduct points if the order was delivered and earned points originally
    if (wasDelivered && !hadLoyaltyPromo && originalTotal && originalTotal > 0 && order.customer?.id) {
      
      // Calculate how many points were originally awarded
      const exactPoints = originalTotal / 100;
      const pointsToDeduct = Math.round(exactPoints);
      
      console.log(`💰 Points to deduct: ${originalTotal} ÷ 100 = ${exactPoints} → ${pointsToDeduct} points`);
      
      try {
        // Get current points to check if deduction is possible
        const currentPoints = await loyaltyModuleService.getPoints(order.customer.id);
        
        if (currentPoints >= pointsToDeduct) {
          await loyaltyModuleService.deductPoints(order.customer.id, pointsToDeduct);
          
          console.log(`✅ Deducted ${pointsToDeduct} points from customer ${order.customer.id} due to refund`);
          console.log(`   Customer points: ${currentPoints} → ${currentPoints - pointsToDeduct}`);
        } else {
          console.log(`⚠️ Cannot deduct ${pointsToDeduct} points - customer only has ${currentPoints} points`);
          // Could optionally set points to 0 or log this as an issue
        }
        
      } catch (deductError) {
        console.error(`❌ Error deducting points for refunded order ${order.custom_display_id}:`, deductError);
      }
    } else {
      console.log(`⏭️ No points to deduct: delivered=${wasDelivered}, loyaltyPromo=${hadLoyaltyPromo}, total=${originalTotal}`);
    }

  } catch (error) {
    console.error(`❌ Error in order refund handler:`, error);
    // Don't throw - loyalty points shouldn't break refund process
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.refunded",
    "order.return_requested", 
    "order.canceled",
    // Try multiple refund-related events
    "return.created",
    "refund.created"
  ],
}

// Helper functions
function getOrderTotal(order: any, includeRefunds: boolean = true): number | null {
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

  if (includeRefunds) {
    // Subtract refunds to get net amount
    let refundedAmount = 0;
    if (order.summary?.refunded_total) {
      refundedAmount = toNumber(order.summary.refunded_total) || 0;
    }
    const netAmount = originalTotal - refundedAmount;
    return netAmount > 0 ? netAmount : null;
  } else {
    // Return original total before refunds
    return originalTotal;
  }
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
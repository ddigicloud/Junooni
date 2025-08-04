// ✅ UPDATED: /vendors/orders route with vendor-specific payment status
// Enhanced with claims, returns, order lifecycle data, and VENDOR-SPECIFIC PAYMENT STATUS

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";

// ✅ ENHANCED: Calculate vendor revenue based on fulfillment type
const calculateVendorRevenue = (item: any, vendorId: string) => {
  console.log(`💰 Calculating revenue for item ${item.id}`);
  
  const itemTotal = item.unit_price * item.quantity;
  let vendorRevenue = itemTotal;
  let revenueCalculationType = "default";
  let productCost = 0;
  let fulfillmentType = "unknown";
  
  // Try to get metadata from different sources
  let metadata = null;
  
  // Check item metadata first
  if (item.metadata) {
    metadata = item.metadata;
  }
  // Check variant metadata
  else if (item.variant?.metadata) {
    metadata = item.variant.metadata;
  }
  // Check product metadata
  else if (item.variant?.product?.metadata) {
    metadata = item.variant.product.metadata;
  }
  
  if (metadata) {
    console.log(`📋 Found metadata for item ${item.id}:`, metadata);
    
    // Parse fulfillment_type (could be string or object)
    let fulfillmentTypeData = metadata.fulfillment_type;
    
    // If it's a string, try to parse it as JSON
    if (typeof fulfillmentTypeData === 'string') {
      try {
        fulfillmentTypeData = JSON.parse(fulfillmentTypeData);
      } catch (e) {
        console.log(`⚠️ Could not parse fulfillment_type as JSON: ${fulfillmentTypeData}`);
      }
    }
    
    // Extract fulfillment type
    if (fulfillmentTypeData?.type) {
      fulfillmentType = fulfillmentTypeData.type;
    }
    
    // Extract product cost
    productCost = parseFloat(metadata.product_cost) || 0;
    
    console.log(`🏷️ Item ${item.id} - Fulfillment: ${fulfillmentType}, Cost: ${productCost}`);
    
    // ✅ REVENUE CALCULATION LOGIC
    switch (fulfillmentType) {
      case "Junooni-fulfilment":
        // Vendor gets: Total - Fixed Product Cost
        vendorRevenue = Math.max(0, itemTotal - productCost);
        revenueCalculationType = "cost_deduction";
        console.log(`💰 Junooni fulfillment: ${itemTotal} - ${productCost} = ${vendorRevenue}`);
        break;
        
      case "Creator-fulfilment":
        // Vendor gets: 70% of Total
        vendorRevenue = itemTotal * 0.70;
        revenueCalculationType = "percentage_split";
        console.log(`💰 Creator fulfillment: ${itemTotal} × 70% = ${vendorRevenue}`);
        break;
        
      default:
        // Default: 70% of total (safe fallback)
        vendorRevenue = itemTotal * 0.70;
        revenueCalculationType = "default_percentage";
        console.log(`💰 Default calculation: ${itemTotal} × 70% = ${vendorRevenue}`);
        break;
    }
  } else {
    // No metadata found, use default 70%
    vendorRevenue = itemTotal * 0.70;
    revenueCalculationType = "no_metadata";
    console.log(`💰 No metadata found, using default: ${itemTotal} × 70% = ${vendorRevenue}`);
  }
  
  return {
    item_total: itemTotal,
    vendor_revenue: vendorRevenue,
    product_cost: productCost,
    fulfillment_type: fulfillmentType,
    calculation_type: revenueCalculationType,
    platform_commission: itemTotal - vendorRevenue
  };
};

// ✅ NEW: Calculate vendor payment status using item-level data (same as single order page)
const calculateAndStoreVendorPaymentStatus = async (order: any) => {
  console.log(`🔄 INDEX: Calculating vendor payment status using item-level data for order ${order.id}...`);
  
  if (!order.metadata?.vendor_orders || !order.items) {
    return order;
  }
  
  const updatedVendorOrders = [];
  
  for (const vendorOrder of order.metadata.vendor_orders) {
    console.log(`\n💳 INDEX: Processing vendor: ${vendorOrder.vendor_id}`);
    
    // Find this vendor's items in the order
    const vendorItems = order.items.filter(item => {
      // Match by title and price from vendor metadata
      return vendorOrder.vendor_items?.some(vi => 
        vi.title === item.title && vi.unit_price === item.unit_price
      );
    });
    
    console.log(`   Found ${vendorItems.length} items for this vendor`);
    
    if (vendorItems.length > 0) {
      let totalAmount = 0;
      let totalRefunded = 0;
      
      // Calculate using item-level refund data
      vendorItems.forEach((item, index) => {
        const itemTotal = item.total || (item.unit_price * item.quantity);
        const itemRefunded = item.return_requested_total || 0;
        
        totalAmount += itemTotal;
        totalRefunded += itemRefunded;
        
        console.log(`   Item ${index + 1}: ${item.title}`);
        console.log(`     Total: ${itemTotal}, Refunded: ${itemRefunded}`);
      });
      
      // Determine payment status
      let paymentStatus = 'paid';
      if (totalRefunded >= totalAmount) {
        paymentStatus = 'refunded';
      } else if (totalRefunded > 0) {
        paymentStatus = 'partially_refunded';
      }
      
      console.log(`   📊 Vendor totals: ${totalAmount} total, ${totalRefunded} refunded`);
      console.log(`   ✅ Payment status: ${paymentStatus}`);
      
      // ✅ ADD: Payment status to vendor metadata
      const updatedVendorOrder = {
        ...vendorOrder,
        vendor_payment_status: paymentStatus,
        vendor_payment_details: {
          total_amount: totalAmount,
          refunded_amount: totalRefunded,
          net_amount: totalAmount - totalRefunded,
          calculation_method: 'item_level_data',
          calculated_at: new Date().toISOString()
        }
      };
      
      updatedVendorOrders.push(updatedVendorOrder);
    } else {
      // No items found, keep original
      updatedVendorOrders.push({
        ...vendorOrder,
        vendor_payment_status: 'unknown'
      });
    }
  }
  
  // Return order with updated metadata
  return {
    ...order,
    metadata: {
      ...order.metadata,
      vendor_orders: updatedVendorOrders,
      vendor_payment_status_calculated: true
    }
  };
};

// ✅ NEW: Get vendor payment status from metadata (same as single order page)
const getVendorPaymentStatusFromMetadata = (order: any, vendorId: string) => {
  console.log(`🔍 INDEX: Getting vendor payment status from metadata...`);
  
  const vendorOrders = order.metadata?.vendor_orders || [];
  const vendorInfo = vendorOrders.find(vo => vo.vendor_id === vendorId);
  
  if (vendorInfo?.vendor_payment_status) {
    console.log(`✅ Found vendor payment status in metadata: ${vendorInfo.vendor_payment_status}`);
    return {
      status: vendorInfo.vendor_payment_status,
      ...vendorInfo.vendor_payment_details,
      source: 'metadata'
    };
  }
  
  console.log(`⚠️ No payment status in metadata, using fallback`);
  return {
    status: 'unknown',
    source: 'fallback'
  };
};

// ✅ NEW: Analyze claims and returns for vendor items
const analyzeClaimsAndReturns = (order: any, vendorItems: any[], vendorId: string) => {
  console.log(`🔍 Analyzing claims and returns for vendor ${vendorId} in order ${order.id}`);
  
  const claims = order.claims || [];
  const returns = order.returns || [];
  
  console.log(`📋 Found ${claims.length} claims and ${returns.length} returns`);
  
  // Track item statuses
  const itemStatuses = new Map();
  const claimItems = [];
  const returnItems = [];
  
  // Process returns
  returns.forEach((returnOrder: any) => {
    console.log(`🔄 Processing return ${returnOrder.id}:`, returnOrder);
    
    if (returnOrder.items) {
      returnOrder.items.forEach((returnItem: any) => {
        console.log(`   📦 Return item:`, returnItem);
        
        // Check if this return item belongs to vendor
        const isVendorItem = vendorItems.some(vi => 
          vi.id === returnItem.item_id || 
          vi.id === returnItem.id ||
          vi.title === returnItem.title
        );
        
        if (isVendorItem) {
          itemStatuses.set(returnItem.item_id || returnItem.id, {
            status: 'returned',
            return_id: returnOrder.id,
            return_reason: returnItem.reason || 'Customer request',
            returned_quantity: returnItem.quantity,
            received_quantity: returnItem.received_quantity || 0,
            created_at: returnOrder.created_at
          });
          
          returnItems.push({
            id: returnItem.id,
            item_id: returnItem.item_id,
            return_id: returnOrder.id,
            quantity: returnItem.quantity,
            reason: returnItem.reason,
            received_quantity: returnItem.received_quantity || 0,
            created_at: returnOrder.created_at
          });
          
          console.log(`   ✅ Added vendor return item: ${returnItem.item_id}`);
        }
      });
    }
  });
  
  // Process claims
  claims.forEach((claim: any) => {
    console.log(`🔄 Processing claim ${claim.id}:`, claim);
    
    // Check claim items (items being returned/replaced)
    if (claim.claim_items) {
      claim.claim_items.forEach((claimItem: any) => {
        console.log(`   📦 Claim item:`, claimItem);
        
        // Check if this claim item belongs to vendor
        const isVendorItem = vendorItems.some(vi => 
          vi.id === claimItem.item_id ||
          vi.title === claimItem.item?.title
        );
        
        if (isVendorItem) {
          const existingStatus = itemStatuses.get(claimItem.item_id);
          itemStatuses.set(claimItem.item_id, {
            ...existingStatus,
            claim_status: 'claimed',
            claim_id: claim.id,
            claim_type: claim.type,
            claim_reason: claimItem.reason || 'Product issue',
            created_at: claim.created_at
          });
          
          claimItems.push({
            id: claimItem.id,
            item_id: claimItem.item_id,
            claim_id: claim.id,
            quantity: claimItem.quantity,
            reason: claimItem.reason,
            created_at: claim.created_at
          });
          
          console.log(`   ✅ Added vendor claim item: ${claimItem.item_id}`);
        }
      });
    }
    
    // Check additional items (replacement items)
    if (claim.additional_items) {
      claim.additional_items.forEach((additionalItem: any) => {
        console.log(`   🆕 Additional item:`, additionalItem);
        
        // Check if this replacement item belongs to vendor
        // This is trickier as we need to check product/variant ownership
        const productId = additionalItem.variant?.product_id || additionalItem.product_id;
        const variantId = additionalItem.variant_id;
        
        // Simple check - you may need to enhance this based on your data structure
        const isVendorItem = vendorItems.some(vi => 
          vi.product_id === productId || 
          vi.variant_id === variantId ||
          (additionalItem.title && vi.title === additionalItem.title)
        );
        
        if (isVendorItem) {
          // Add this as a new vendor item
          vendorItems.push({
            id: additionalItem.id,
            title: additionalItem.title || 'Replacement Item',
            subtitle: additionalItem.variant?.title || 'Claim Replacement',
            quantity: additionalItem.quantity,
            unit_price: additionalItem.unit_price || 0,
            total: (additionalItem.unit_price || 0) * additionalItem.quantity,
            variant_id: additionalItem.variant_id,
            product_id: productId,
            variant_sku: additionalItem.variant?.sku,
            product_handle: additionalItem.variant?.product?.handle,
            // Mark as claim item
            is_claim_item: true,
            claim_id: claim.id,
            claim_status: 'active',
            return_status: 'none',
            metadata: {
              vendor_id: vendorId,
              is_claim_replacement: true
            }
          });
          
          console.log(`   ✅ Added vendor replacement item: ${additionalItem.title}`);
        }
      });
    }
  });
  
  return {
    itemStatuses,
    claimItems,
    returnItems,
    claims,
    returns
  };
};

// ✅ ENHANCED: Improved filtering function with vendor-specific payment status
const filterOrderForVendor = (order: any, vendorId: string) => {
  console.log(`🔍 INDEX: Filtering order ${order.id} for vendor ${vendorId}`);
  
  if (!order || !vendorId) {
    return null;
  }

  // Get vendor information from order metadata
  const vendorOrders = order.metadata?.vendor_orders || [];
  const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);
  
  if (!vendorInfo) {
    console.log(`❌ Vendor ${vendorId} not found in order ${order.id}`);
    return null;
  }

  console.log(`✅ Found vendor info for ${vendorId}:`, vendorInfo);

  // Enhanced item filtering logic
  const vendorItems = order.items?.filter((item: any) => {
    console.log(`🔍 Checking item ${item.id} for vendor ${vendorId}`);
    
    // Method 1: Check item metadata for vendor_id
    if (item.metadata?.vendor_id === vendorId) {
      console.log(`✅ Item ${item.id} matches via item metadata`);
      return true;
    }
    
    // Method 2: Check variant metadata for vendor_id
    if (item.variant?.metadata?.vendor_id === vendorId) {
      console.log(`✅ Item ${item.id} matches via variant metadata`);
      return true;
    }
    
    // Method 3: Check product metadata for vendor_id
    if (item.variant?.product?.metadata?.vendor_id === vendorId) {
      console.log(`✅ Item ${item.id} matches via product metadata`);
      return true;
    }
    
    // Method 4: Check if item ID exists in vendor_items metadata
    const vendorMetadataItems = vendorInfo.vendor_items || [];
    const foundInMetadata = vendorMetadataItems.some((vi: any) => {
      return vi.id === item.id || 
             vi.id === item.cart_id ||
             vi.title === item.title ||
             (vi.product_id && vi.product_id === item.product_id) ||
             (vi.variant_id && vi.variant_id === item.variant_id);
    });
    
    if (foundInMetadata) {
      console.log(`✅ Item ${item.id} matches via vendor metadata items`);
      return true;
    }
    
    // Method 5: Check by product/variant title matching (fallback)
    const titleMatch = vendorMetadataItems.some((vi: any) => 
      vi.title && item.title && vi.title.toLowerCase() === item.title.toLowerCase()
    );
    
    if (titleMatch) {
      console.log(`✅ Item ${item.id} matches via title comparison`);
      return true;
    }
    
    console.log(`❌ Item ${item.id} does not match vendor ${vendorId}`);
    return false;
  }) || [];

  console.log(`📦 Filtered ${vendorItems.length} items for vendor ${vendorId}`);

  // Fallback: If no items filtered but vendor_items exist in metadata, use metadata items
  let finalVendorItems = vendorItems;
  if (vendorItems.length === 0 && vendorInfo.vendor_items && vendorInfo.vendor_items.length > 0) {
    console.log(`🔄 Using fallback: creating items from vendor metadata`);
    
    finalVendorItems = vendorInfo.vendor_items.map((metaItem: any) => ({
      id: metaItem.id,
      title: metaItem.title,
      quantity: metaItem.quantity,
      unit_price: metaItem.unit_price,
      total: metaItem.total,
      variant: null,
      product: null,
      product_id: metaItem.product_id,
      variant_id: metaItem.variant_id,
      variant_sku: metaItem.variant_sku,
      product_handle: metaItem.product_handle,
      metadata: { 
        vendor_id: vendorId,
        // Try to preserve original metadata if available
        product_cost: metaItem.product_cost,
        fulfillment_type: metaItem.fulfillment_type
      }
    }));
    
    console.log(`✅ Created ${finalVendorItems.length} items from metadata`);
  }

  // ✅ NEW: Analyze claims and returns to update item statuses
  const claimsAnalysis = analyzeClaimsAndReturns(order, finalVendorItems, vendorId);
  
  // ✅ ENHANCED: Calculate vendor revenue for each item with claim/return status
  const itemsWithRevenue = finalVendorItems.map(item => {
    const revenueData = calculateVendorRevenue(item, vendorId);
    const itemStatus = claimsAnalysis.itemStatuses.get(item.id) || {};
    
    return {
      ...item,
      // Add revenue calculation data
      vendor_revenue: revenueData.vendor_revenue,
      product_cost: revenueData.product_cost,
      fulfillment_type: revenueData.fulfillment_type,
      calculation_type: revenueData.calculation_type,
      platform_commission: revenueData.platform_commission,
      
      // ✅ NEW: Add claim/return status
      claim_status: item.is_claim_item ? 'active' : (itemStatus.claim_status ? 'replaced' : (itemStatus.status === 'returned' ? 'returned' : 'active')),
      return_status: itemStatus.status === 'returned' ? (itemStatus.received_quantity > 0 ? 'received' : 'requested') : 'none',
      is_claim_item: item.is_claim_item || false,
      claim_id: item.claim_id || itemStatus.claim_id,
      return_id: itemStatus.return_id,
      return_reason: itemStatus.return_reason,
      claim_reason: itemStatus.claim_reason,
      
      // Enhanced item data
      subtitle: item.variant?.title || item.variant_title || item.subtitle || "Handcrafted Item"
    };
  });

  // ✅ ENHANCED: Calculate vendor totals based on revenue calculations
  const vendorSubtotal = itemsWithRevenue.reduce((total: number, item: any) => {
    return total + (item.unit_price * item.quantity);
  }, 0);

  // ✅ NEW: Calculate total vendor revenue (sum of all item revenues)
  const calculatedVendorRevenue = itemsWithRevenue.reduce((total: number, item: any) => {
    return total + item.vendor_revenue;
  }, 0);

  // Use calculated revenue instead of metadata amount for more accuracy
  const vendorTotal = calculatedVendorRevenue;

  // Calculate total platform commission
  const totalPlatformCommission = vendorSubtotal - vendorTotal;

  // Calculate proportional shipping and taxes (unchanged)
  const orderSubtotal = order.subtotal || 0;
  const proportionalShipping = orderSubtotal > 0 ? 
    Math.round((vendorSubtotal / orderSubtotal) * (order.shipping_total || 0)) : 0;
  
  const proportionalTax = orderSubtotal > 0 ? 
    Math.round((vendorSubtotal / orderSubtotal) * (order.tax_total || 0)) : 0;

  // ✅ NEW: Get vendor-specific payment status from metadata
  const vendorPaymentData = getVendorPaymentStatusFromMetadata(order, vendorId);
  
  console.log(`💳 INDEX: Vendor payment status for ${vendorId}:`, vendorPaymentData);

  // ✅ ENHANCED: Revenue breakdown summary with claims/returns
  const revenueBreakdown = {
    total_items: itemsWithRevenue.length,
    junooni_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Junooni-fulfilment").length,
    creator_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Creator-fulfilment").length,
    unknown_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "unknown").length,
    total_cost_deductions: itemsWithRevenue
      .filter(item => item.calculation_type === "cost_deduction")
      .reduce((sum, item) => sum + item.product_cost, 0),
    total_percentage_deductions: itemsWithRevenue
      .filter(item => item.calculation_type === "percentage_split")
      .reduce((sum, item) => sum + item.platform_commission, 0),
    calculated_vendor_revenue: calculatedVendorRevenue,
    total_platform_commission: totalPlatformCommission,
    revenue_percentage: vendorSubtotal > 0 ? (vendorTotal / vendorSubtotal * 100) : 0,
    
    // ✅ NEW: Claims and returns summary
    returned_items: itemsWithRevenue.filter(item => item.claim_status === 'returned').length,
    replaced_items: itemsWithRevenue.filter(item => item.claim_status === 'replaced').length,
    claim_items: itemsWithRevenue.filter(item => item.is_claim_item).length,
    active_items: itemsWithRevenue.filter(item => item.claim_status === 'active' && !item.is_claim_item).length
  };

  console.log(`💰 Enhanced vendor totals calculated:`, {
    subtotal: vendorSubtotal,
    calculated_revenue: calculatedVendorRevenue,
    platform_commission: totalPlatformCommission,
    revenue_percentage: revenueBreakdown.revenue_percentage.toFixed(1) + '%',
    payment_status: vendorPaymentData.status,
    claims_returns: {
      returned: revenueBreakdown.returned_items,
      replaced: revenueBreakdown.replaced_items,
      new_claim_items: revenueBreakdown.claim_items,
      active: revenueBreakdown.active_items
    }
  });

  // Return enhanced vendor-specific order view with vendor payment status
  return {
    id: order.id,
    display_id: order.display_id,
    status: order.status,
    payment_status: vendorPaymentData.status, // ✅ VENDOR-SPECIFIC PAYMENT STATUS
    fulfillment_status: order.fulfillment_status,
    customer: order.customer,
    email: order.email,
    created_at: order.created_at,
    updated_at: order.updated_at,
    
    // ✅ ENHANCED: Vendor-specific data with revenue calculations
    vendor_items: itemsWithRevenue,  // Items now include revenue data + claim/return status
    vendor_total: vendorTotal,       // Calculated based on fulfillment types
    vendor_subtotal: vendorSubtotal,
    vendor_shipping_total: proportionalShipping,
    vendor_tax_total: proportionalTax,
    
    // ✅ NEW: Revenue breakdown
    revenue_breakdown: revenueBreakdown,
    
    // ✅ NEW: Vendor payment details
    vendor_payment_details: vendorPaymentData,
    vendor_payment_status: vendorPaymentData.status,
    
    // ✅ NEW: Claims and returns data
    claims: claimsAnalysis.claims,
    returns: claimsAnalysis.returns,
    claim_items: claimsAnalysis.claimItems,
    return_items: claimsAnalysis.returnItems,
    
    // Shared data
    shipping_address: order.shipping_address,
    billing_address: order.billing_address,
    shipping_methods: order.shipping_methods,
    payment_collections: order.payment_collections,
    fulfillments: order.fulfillments,
    
    // ✅ ENHANCED: Payment info with calculated revenue
    vendor_payment_amount: vendorTotal,  // Use calculated amount
    currency_code: order.currency_code,
    
    // Reference data
    original_order_id: order.id,
    vendor_id: vendorId,
    vendor_handle: vendorInfo.vendor_handle || vendorId,
    
    // ✅ ENHANCED: Metadata with revenue calculation info
    is_vendor_filtered: true,
    contains_only_vendor_products: true,
    filtering_method: finalVendorItems.length > 0 ? "item_match" : "metadata_fallback",
    revenue_calculation_applied: true,
    claims_returns_analyzed: true,
    vendor_payment_calculated: true, // ✅ NEW FLAG
    has_mixed_fulfillment: revenueBreakdown.junooni_fulfillment_items > 0 && revenueBreakdown.creator_fulfillment_items > 0,
    has_claims: claimsAnalysis.claims.length > 0,
    has_returns: claimsAnalysis.returns.length > 0
  };
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log("🏪 INDEX: Fetching vendor-specific orders with ENHANCED revenue calculation + VENDOR PAYMENT STATUS + claims/returns...");
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    // Get vendor information
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      {
        relations: ["vendor"],
      }
    );

    const vendorId = vendorAdmin.vendor.id;
    console.log(`🔍 INDEX: Processing orders for vendor: ${vendorId}`);

    // Get vendor orders
    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      fields: ["orders.*", "orders.customer.*"],
      filters: {
        id: vendorId,
      },
    });

    if (!vendor.orders || vendor.orders.length === 0) {
      console.log("📭 No orders found for vendor");
      return res.json({
        orders: [],
        count: 0,
        vendor_id: vendorId
      });
    }

    console.log(`📋 Found ${vendor.orders.length} linked orders for vendor`);

    // ✅ ENHANCED: Get detailed order information including claims and returns + payment data
    const { result: detailedOrders } = await getOrdersListWorkflow(req.scope).run({
      input: {
        fields: [
          "id",           // ✅ ADD: Explicitly request id
          "display_id",   // ✅ ADD: Explicitly request display_id
          "metadata",
          "total",
          "subtotal", 
          "shipping_total",
          "tax_total",
          "items.*",
          "items.tax_lines",
          "items.adjustments",
          "items.variant",
          "items.variant.product",
          "items.variant.metadata",
          "items.variant.product.metadata",
          "items.metadata",
          "items.detail",
          "items.cart_id",
          "items.product_id",
          "items.variant_id",
          "items.return_requested_total", // ✅ ADD: For payment status calculation
          "items.total",
          "shipping_methods",
          "payment_collections",
          "fulfillments",
          "customer.*",
          "shipping_address.*",
          "billing_address.*",
          "payment_status", // ✅ ADD: For comparison
        ],
        variables: {
          filters: {
            id: vendor.orders.map((order) => order.id),
          },
        },
      },
    });

    console.log(`📄 INDEX: Retrieved detailed data for ${detailedOrders.length} orders`);

    // ✅ NEW: Calculate vendor payment status for each order before filtering
    const ordersWithVendorPaymentStatus = [];
    for (const order of detailedOrders) {
      console.log(`🔄 INDEX: Calculating vendor payment status for order ${order.id}...`);
      const orderWithPaymentStatus = await calculateAndStoreVendorPaymentStatus(order);
      ordersWithVendorPaymentStatus.push(orderWithPaymentStatus);
      
      // ✅ LOG: Show what was calculated
      console.log(`📋 INDEX: Vendor payment status results for order ${order.id}:`);
      orderWithPaymentStatus.metadata?.vendor_orders?.forEach(vo => {
        console.log(`   Vendor ${vo.vendor_id}: ${vo.vendor_payment_status}`);
      });
    }

    // ✅ ENHANCED: Filter each order and calculate vendor revenue + analyze claims/returns + use vendor payment status
    const vendorFilteredOrders = [];

    for (const order of ordersWithVendorPaymentStatus) {
      console.log(`🔄 INDEX: Processing order ${order.id} for vendor filtering, revenue calculation, payment status, and claims/returns analysis...`);
      
      const vendorOrderView = filterOrderForVendor(order, vendorId);
      
      if (vendorOrderView) {
        vendorFilteredOrders.push(vendorOrderView);
        console.log(`✅ INDEX: Added filtered order ${order.id} with ${vendorOrderView.vendor_items.length} items (Revenue: ${vendorOrderView.vendor_total})`);
        console.log(`💰 Revenue breakdown: ${vendorOrderView.revenue_breakdown.revenue_percentage.toFixed(1)}% of subtotal`);
        console.log(`💳 Payment status: ${vendorOrderView.payment_status} (global: ${order.payment_status})`);
        if (vendorOrderView.has_claims || vendorOrderView.has_returns) {
          console.log(`🔄 Claims/Returns: ${vendorOrderView.claims?.length || 0} claims, ${vendorOrderView.returns?.length || 0} returns`);
        }
      } else {
        console.log(`⚠️ Order ${order.id} skipped - no products for vendor ${vendorId}`);
      }
    }

    // ✅ ENHANCED: Calculate aggregate vendor statistics
    const totalVendorRevenue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_total, 0);
    const totalOrderValue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_subtotal, 0);
    const totalPlatformCommission = totalOrderValue - totalVendorRevenue;
    const averageRevenuePercentage = totalOrderValue > 0 ? (totalVendorRevenue / totalOrderValue * 100) : 0;
    
    // ✅ NEW: Aggregate claims/returns statistics
    const totalClaims = vendorFilteredOrders.reduce((sum, order) => sum + (order.claims?.length || 0), 0);
    const totalReturns = vendorFilteredOrders.reduce((sum, order) => sum + (order.returns?.length || 0), 0);
    const ordersWithClaims = vendorFilteredOrders.filter(order => order.has_claims).length;
    const ordersWithReturns = vendorFilteredOrders.filter(order => order.has_returns).length;

    // ✅ NEW: Payment status statistics
    const paymentStatusCounts = vendorFilteredOrders.reduce((counts, order) => {
      const status = order.payment_status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    console.log(`✅ INDEX: Returning ${vendorFilteredOrders.length} vendor-filtered orders with enhanced revenue calculation + VENDOR PAYMENT STATUS + claims/returns`);

    // ✅ ENHANCED: Return vendor-specific filtered data with revenue analytics + payment status + claims/returns
    res.json({
      orders: vendorFilteredOrders,
      count: vendorFilteredOrders.length,
      vendor_id: vendorId,
      total_linked_orders: vendor.orders.length,
      filtered_orders: vendorFilteredOrders.length,
      filtering_applied: true,
      revenue_calculation_applied: true,
      vendor_payment_calculated: true, // ✅ NEW FLAG
      claims_returns_analyzed: true,
      
      // ✅ NEW: Vendor revenue analytics
      vendor_analytics: {
        total_vendor_revenue: totalVendorRevenue,
        total_order_value: totalOrderValue,
        total_platform_commission: totalPlatformCommission,
        average_revenue_percentage: parseFloat(averageRevenuePercentage.toFixed(2)),
        currency_code: "INR"
      },
      
      // ✅ NEW: Payment status analytics
      payment_status_analytics: {
        payment_status_counts: paymentStatusCounts,
        vendor_specific_calculation: true,
        orders_with_vendor_payment_status: vendorFilteredOrders.filter(o => o.vendor_payment_calculated).length
      },
      
      // ✅ NEW: Claims and returns analytics
      claims_returns_analytics: {
        total_claims: totalClaims,
        total_returns: totalReturns,
        orders_with_claims: ordersWithClaims,
        orders_with_returns: ordersWithReturns,
        claim_rate: vendorFilteredOrders.length > 0 ? (ordersWithClaims / vendorFilteredOrders.length * 100) : 0,
        return_rate: vendorFilteredOrders.length > 0 ? (ordersWithReturns / vendorFilteredOrders.length * 100) : 0
      }
    });

  } catch (error: any) {
    console.error("❌ INDEX: Error in enhanced vendor orders endpoint:", error);
    res.status(500).json({
      error: "Failed to fetch vendor orders",
      message: error.message
    });
  }
};

// // SIMPLIFIED /vendors/orders route for debugging
// // This version removes complex dependencies to isolate the error

// SIMPLIFIED /vendors/orders route for debugging
// This version removes complex dependencies to isolate the error

// FIXED /vendors/orders route - ES module import issue resolved
// This version fixes the marketplace module import problem

// import {
//   AuthenticatedMedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http";
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   try {
//     console.log("🔧 FIXED: Starting vendor orders fetch...");
    
//     // ✅ STEP 1: Test basic authentication
//     console.log("🔧 STEP 1: Checking authentication...");
//     if (!req.auth_context?.actor_id) {
//       console.log("❌ No auth context found");
//       return res.status(401).json({
//         error: "Authentication required",
//         message: "No auth context"
//       });
//     }
//     console.log("✅ Auth context found:", req.auth_context.actor_id);

//     // ✅ STEP 2: Test basic query resolution
//     console.log("🔧 STEP 2: Testing query resolution...");
//     let query;
//     try {
//       query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//       console.log("✅ Query resolved successfully");
//     } catch (queryError) {
//       console.error("❌ Query resolution failed:", queryError);
//       return res.status(500).json({
//         error: "Query resolution failed",
//         message: queryError.message,
//         step: "query_resolution"
//       });
//     }

//     // ✅ STEP 3: FIXED - Test marketplace module resolution without directory import
//     console.log("🔧 STEP 3: Testing marketplace module resolution (FIXED)...");
//     let marketplaceModuleService;
//     try {
//       // ✅ FIX 1: Try multiple possible service keys without importing constants
//       const possibleKeys = [
//         "marketplace",
//         "marketplaceService", 
//         "marketplaceModuleService",
//         "MARKETPLACE_MODULE",
//         "marketplace-module"
//       ];
      
//       let serviceFound = false;
      
//       for (const key of possibleKeys) {
//         try {
//           console.log(`🔍 Trying service key: "${key}"`);
//           marketplaceModuleService = req.scope.resolve(key);
//           console.log(`✅ Marketplace service resolved with key: "${key}"`);
//           serviceFound = true;
//           break;
//         } catch (keyError) {
//           console.log(`⚠️ Key "${key}" failed: ${keyError.message}`);
//         }
//       }
      
//       if (!serviceFound) {
//         // ✅ FIX 2: Try to get all available services for debugging
//         console.log("🔍 Getting list of available services...");
//         try {
//           const container = req.scope;
//           console.log("📋 Container type:", typeof container);
          
//           // List some common service keys that might be available
//           const commonKeys = [
//             "productService",
//             "orderService", 
//             "customerService",
//             "userService",
//             "vendorService"
//           ];
          
//           const availableServices = [];
//           for (const testKey of commonKeys) {
//             try {
//               const service = container.resolve(testKey);
//               if (service) {
//                 availableServices.push(testKey);
//               }
//             } catch (e) {
//               // Service not available
//             }
//           }
          
//           console.log("📋 Available services found:", availableServices);
          
//           throw new Error(`Marketplace service not found. Available services: ${availableServices.join(', ')}`);
//         } catch (listError) {
//           throw new Error(`Marketplace service not found and couldn't list services: ${listError.message}`);
//         }
//       }
//     } catch (marketplaceError) {
//       console.error("❌ Marketplace module resolution failed:", marketplaceError);
      
//       // ✅ FIX 3: Return mock data instead of failing completely
//       console.log("🔧 Marketplace service failed, returning mock data...");
//       return res.json({
//         orders: [
//           {
//             id: "mock_order_1",
//             display_id: 1001,
//             customer: {
//               first_name: "Mock",
//               last_name: "Customer", 
//               email: "mock@example.com"
//             },
//             created_at: new Date().toISOString(),
//             vendor_total: 1500,
//             vendor_subtotal: 1200,
//             vendor_shipping_total: 200,
//             vendor_tax_total: 100,
//             vendor_items: [{
//               id: "mock_item_1",
//               title: "Mock Product",
//               subtitle: "Mock Variant",
//               quantity: 1,
//               unit_price: 1200,
//               total: 1200,
//               claim_status: 'active',
//               return_status: 'none',
//               is_claim_item: false
//             }],
//             payment_status: "captured",
//             fulfillment_status: "fulfilled",
//             currency_code: "INR",
//             vendor_id: "mock_vendor",
//             vendor_handle: "mock_vendor",
//             vendor_payment_amount: 1500,
//             has_claims: false,
//             has_returns: false
//           }
//         ],
//         count: 1,
//         vendor_id: "mock_vendor",
//         debug_mode: true,
//         mock_data: true,
//         error_step: "marketplace_module_resolution",
//         error_message: marketplaceError.message,
//         suggestion: "Fix marketplace module registration or import path"
//       });
//     }

//     // ✅ STEP 4: Test vendor admin retrieval
//     console.log("🔧 STEP 4: Testing vendor admin retrieval...");
//     let vendorAdmin;
//     let vendorId;
//     try {
//       // ✅ Check if the service has the expected method
//       if (typeof marketplaceModuleService.retrieveVendorAdmin !== 'function') {
//         console.log("⚠️ retrieveVendorAdmin method not found, checking available methods...");
//         console.log("📋 Service methods:", Object.getOwnPropertyNames(marketplaceModuleService));
//         throw new Error("retrieveVendorAdmin method not available on marketplace service");
//       }
      
//       vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//         req.auth_context.actor_id,
//         {
//           relations: ["vendor"],
//         }
//       );
      
//       vendorId = vendorAdmin?.vendor?.id;
//       console.log("✅ Vendor admin retrieved:", vendorId);
      
//       if (!vendorId) {
//         throw new Error("No vendor ID found in vendor admin response");
//       }
//     } catch (vendorError) {
//       console.error("❌ Vendor admin retrieval failed:", vendorError);
      
//       // ✅ FIX 4: Use fallback vendor ID
//       vendorId = "fallback_vendor_" + req.auth_context.actor_id;
//       console.log(`🔧 Using fallback vendor ID: ${vendorId}`);
//     }

//     // ✅ STEP 5: Test basic vendor query (SIMPLIFIED)
//     console.log("🔧 STEP 5: Testing basic vendor query...");
//     let vendor;
//     try {
//       const result = await query.graph({
//         entity: "vendor",
//         fields: ["id", "handle"], // MINIMAL fields to avoid expansion issues
//         filters: {
//           id: vendorId,
//         },
//       });
      
//       vendor = result.data?.[0];
//       console.log("✅ Basic vendor query successful:", vendor?.id);
//     } catch (vendorQueryError) {
//       console.error("❌ Basic vendor query failed:", vendorQueryError);
//       console.log("🔧 Vendor query failed, continuing with mock data...");
//       vendor = { id: vendorId, handle: vendorId };
//     }

//     // ✅ STEP 6: Test vendor orders query (VERY SIMPLIFIED)
//     console.log("🔧 STEP 6: Testing vendor orders query...");
//     let vendorOrders = [];
//     try {
//       const ordersResult = await query.graph({
//         entity: "vendor",
//         fields: ["orders.id", "orders.display_id"], // MINIMAL order fields
//         filters: {
//           id: vendorId,
//         },
//       });
      
//       vendorOrders = ordersResult.data?.[0]?.orders || [];
//       console.log(`✅ Found ${vendorOrders.length} linked orders`);
//     } catch (ordersQueryError) {
//       console.error("❌ Vendor orders query failed:", ordersQueryError);
//       console.log("🔧 Using empty orders array...");
//       vendorOrders = [];
//     }

//     // ✅ SUCCESS: Return working data (mock or real)
//     console.log("✅ All tests completed, returning data...");
    
//     const responseOrders = vendorOrders.length > 0 ? 
//       vendorOrders.map((order, index) => ({
//         id: order.id,
//         display_id: order.display_id || (1000 + index),
//         customer: {
//           first_name: "Customer",
//           last_name: "Name", 
//           email: "customer@example.com"
//         },
//         created_at: new Date().toISOString(),
//         vendor_total: 1000 + (index * 100),
//         vendor_subtotal: 800 + (index * 100),
//         vendor_shipping_total: 100,
//         vendor_tax_total: 100,
//         vendor_items: [{
//           id: `item_${index}`,
//           title: `Product ${index + 1}`,
//           subtitle: "Handcrafted Item",
//           quantity: 1,
//           unit_price: 800 + (index * 100),
//           total: 800 + (index * 100),
//           claim_status: 'active',
//           return_status: 'none',
//           is_claim_item: false,
//           tracking_numbers: [],
//           tracking_urls: [],
//           has_tracking: false
//         }],
//         payment_status: "captured",
//         fulfillment_status: "fulfilled",
//         currency_code: "INR",
//         vendor_id: vendorId,
//         vendor_handle: vendor?.handle || vendorId,
//         vendor_payment_amount: 1000 + (index * 100),
//         has_claims: false,
//         has_returns: false
//       })) :
//       // Return at least one mock order for testing UI
//       [{
//         id: "test_order_1",
//         display_id: 1001,
//         customer: {
//           first_name: "Test",
//           last_name: "Customer", 
//           email: "test@example.com"
//         },
//         created_at: new Date().toISOString(),
//         vendor_total: 1500,
//         vendor_subtotal: 1200,
//         vendor_shipping_total: 200,
//         vendor_tax_total: 100,
//         vendor_items: [{
//           id: "test_item_1",
//           title: "Test Product",
//           subtitle: "Test Variant",
//           quantity: 1,
//           unit_price: 1200,
//           total: 1200,
//           claim_status: 'active',
//           return_status: 'none',
//           is_claim_item: false,
//           tracking_numbers: [],
//           tracking_urls: [],
//           has_tracking: false
//         }],
//         payment_status: "captured",
//         fulfillment_status: "fulfilled",
//         currency_code: "INR",
//         vendor_id: vendorId,
//         vendor_handle: vendor?.handle || vendorId,
//         vendor_payment_amount: 1500,
//         has_claims: false,
//         has_returns: false
//       }];
    
//     return res.json({
//       orders: responseOrders,
//       count: responseOrders.length,
//       vendor_id: vendorId,
//       filtering_applied: true,
//       debug_mode: true,
//       success_steps: [
//         "authentication", 
//         "query_resolution", 
//         "marketplace_module_resolution",
//         "vendor_admin_retrieval",
//         "basic_vendor_query",
//         "vendor_orders_query"
//       ]
//     });

//   } catch (error: any) {
//     console.error("❌ FIXED DEBUG ERROR:", error);
//     console.error("Stack trace:", error.stack);
    
//     return res.status(500).json({
//       error: "Server error",
//       message: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//       suggestion: "Check backend logs for detailed error information"
//     });
//   }
// };

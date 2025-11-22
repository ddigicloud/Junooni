// // ✅ UPDATED: /vendors/orders route with vendor-specific payment status
// // Enhanced with claims, returns, order lifecycle data, and VENDOR-SPECIFIC PAYMENT STATUS

// import {
//   AuthenticatedMedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http";
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
// import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
// import MarketplaceModuleService from "../../../modules/marketplace/service";
// import { MARKETPLACE_MODULE } from "../../../modules/marketplace";

// // ✅ ENHANCED: Calculate vendor revenue based on fulfillment type
// const calculateVendorRevenue = (item: any, vendorId: string) => {
//   console.log(`💰 Calculating revenue for item ${item.id}`);
  
//   const itemTotal = item.unit_price * item.quantity;
//   let vendorRevenue = itemTotal;
//   let revenueCalculationType = "default";
//   let productCost = 0;
//   let fulfillmentType = "unknown";
  
//   // Try to get metadata from different sources
//   let metadata = null;
  
//   // Check item metadata first
//   if (item.metadata) {
//     metadata = item.metadata;
//   }
//   // Check variant metadata
//   else if (item.variant?.metadata) {
//     metadata = item.variant.metadata;
//   }
//   // Check product metadata
//   else if (item.variant?.product?.metadata) {
//     metadata = item.variant.product.metadata;
//   }
  
//   if (metadata) {
//     console.log(`📋 Found metadata for item ${item.id}:`, metadata);
    
//     // Parse fulfillment_type (could be string or object)
//     let fulfillmentTypeData = metadata.fulfillment_type;
    
//     // If it's a string, try to parse it as JSON
//     if (typeof fulfillmentTypeData === 'string') {
//       try {
//         fulfillmentTypeData = JSON.parse(fulfillmentTypeData);
//       } catch (e) {
//         console.log(`⚠️ Could not parse fulfillment_type as JSON: ${fulfillmentTypeData}`);
//       }
//     }
    
//     // Extract fulfillment type
//     if (fulfillmentTypeData?.type) {
//       fulfillmentType = fulfillmentTypeData.type;
//     }
    
//     // Extract product cost
//     productCost = parseFloat(metadata.product_cost) || 0;
    
//     console.log(`🏷️ Item ${item.id} - Fulfillment: ${fulfillmentType}, Cost: ${productCost}`);
    
//     // ✅ REVENUE CALCULATION LOGIC
//     switch (fulfillmentType) {
//       case "Junooni-fulfilment":
//         // Vendor gets: Total - Fixed Product Cost
//         vendorRevenue = Math.max(0, itemTotal - productCost);
//         revenueCalculationType = "cost_deduction";
//         console.log(`💰 Junooni fulfillment: ${itemTotal} - ${productCost} = ${vendorRevenue}`);
//         break;
        
//       case "Creator-fulfilment":
//         // Vendor gets: 70% of Total
//         vendorRevenue = itemTotal * 0.70;
//         revenueCalculationType = "percentage_split";
//         console.log(`💰 Creator fulfillment: ${itemTotal} × 70% = ${vendorRevenue}`);
//         break;
        
//       default:
//         // Default: 70% of total (safe fallback)
//         vendorRevenue = itemTotal * 0.70;
//         revenueCalculationType = "default_percentage";
//         console.log(`💰 Default calculation: ${itemTotal} × 70% = ${vendorRevenue}`);
//         break;
//     }
//   } else {
//     // No metadata found, use default 70%
//     vendorRevenue = itemTotal * 0.70;
//     revenueCalculationType = "no_metadata";
//     console.log(`💰 No metadata found, using default: ${itemTotal} × 70% = ${vendorRevenue}`);
//   }
  
//   return {
//     item_total: itemTotal,
//     vendor_revenue: vendorRevenue,
//     product_cost: productCost,
//     fulfillment_type: fulfillmentType,
//     calculation_type: revenueCalculationType,
//     platform_commission: itemTotal - vendorRevenue
//   };
// };

// // ✅ NEW: Calculate vendor payment status using item-level data (same as single order page)
// const calculateAndStoreVendorPaymentStatus = async (order: any) => {
//   console.log(`🔄 INDEX: Calculating vendor payment status using item-level data for order ${order.id}...`);
  
//   if (!order.metadata?.vendor_orders || !order.items) {
//     return order;
//   }
  
//   const updatedVendorOrders = [];
  
//   for (const vendorOrder of order.metadata.vendor_orders) {
//     console.log(`\n💳 INDEX: Processing vendor: ${vendorOrder.vendor_id}`);
    
//     // Find this vendor's items in the order
//     const vendorItems = order.items.filter(item => {
//       // Match by title and price from vendor metadata
//       return vendorOrder.vendor_items?.some(vi => 
//         vi.title === item.title && vi.unit_price === item.unit_price
//       );
//     });
    
//     console.log(`   Found ${vendorItems.length} items for this vendor`);
    
//     if (vendorItems.length > 0) {
//       let totalAmount = 0;
//       let totalRefunded = 0;
      
//       // Calculate using item-level refund data
//       vendorItems.forEach((item, index) => {
//         const itemTotal = item.total || (item.unit_price * item.quantity);
//         const itemRefunded = item.return_requested_total || 0;
        
//         totalAmount += itemTotal;
//         totalRefunded += itemRefunded;
        
//         console.log(`   Item ${index + 1}: ${item.title}`);
//         console.log(`     Total: ${itemTotal}, Refunded: ${itemRefunded}`);
//       });
      
//       // Determine payment status
//       let paymentStatus = 'paid';
//       if (totalRefunded >= totalAmount) {
//         paymentStatus = 'refunded';
//       } else if (totalRefunded > 0) {
//         paymentStatus = 'partially_refunded';
//       }
      
//       console.log(`   📊 Vendor totals: ${totalAmount} total, ${totalRefunded} refunded`);
//       console.log(`   ✅ Payment status: ${paymentStatus}`);
      
//       // ✅ ADD: Payment status to vendor metadata
//       const updatedVendorOrder = {
//         ...vendorOrder,
//         vendor_payment_status: paymentStatus,
//         vendor_payment_details: {
//           total_amount: totalAmount,
//           refunded_amount: totalRefunded,
//           net_amount: totalAmount - totalRefunded,
//           calculation_method: 'item_level_data',
//           calculated_at: new Date().toISOString()
//         }
//       };
      
//       updatedVendorOrders.push(updatedVendorOrder);
//     } else {
//       // No items found, keep original
//       updatedVendorOrders.push({
//         ...vendorOrder,
//         vendor_payment_status: 'unknown'
//       });
//     }
//   }
  
//   // Return order with updated metadata
//   return {
//     ...order,
//     metadata: {
//       ...order.metadata,
//       vendor_orders: updatedVendorOrders,
//       vendor_payment_status_calculated: true
//     }
//   };
// };

// // ✅ NEW: Get vendor payment status from metadata (same as single order page)
// const getVendorPaymentStatusFromMetadata = (order: any, vendorId: string) => {
//   console.log(`🔍 INDEX: Getting vendor payment status from metadata...`);
  
//   const vendorOrders = order.metadata?.vendor_orders || [];
//   const vendorInfo = vendorOrders.find(vo => vo.vendor_id === vendorId);
  
//   if (vendorInfo?.vendor_payment_status) {
//     console.log(`✅ Found vendor payment status in metadata: ${vendorInfo.vendor_payment_status}`);
//     return {
//       status: vendorInfo.vendor_payment_status,
//       ...vendorInfo.vendor_payment_details,
//       source: 'metadata'
//     };
//   }
  
//   console.log(`⚠️ No payment status in metadata, using fallback`);
//   return {
//     status: 'unknown',
//     source: 'fallback'
//   };
// };

// // ✅ NEW: Analyze claims and returns for vendor items
// const analyzeClaimsAndReturns = (order: any, vendorItems: any[], vendorId: string) => {
//   console.log(`🔍 Analyzing claims and returns for vendor ${vendorId} in order ${order.id}`);
  
//   const claims = order.claims || [];
//   const returns = order.returns || [];
  
//   console.log(`📋 Found ${claims.length} claims and ${returns.length} returns`);
  
//   // Track item statuses
//   const itemStatuses = new Map();
//   const claimItems = [];
//   const returnItems = [];
  
//   // Process returns
//   returns.forEach((returnOrder: any) => {
//     console.log(`🔄 Processing return ${returnOrder.id}:`, returnOrder);
    
//     if (returnOrder.items) {
//       returnOrder.items.forEach((returnItem: any) => {
//         console.log(`   📦 Return item:`, returnItem);
        
//         // Check if this return item belongs to vendor
//         const isVendorItem = vendorItems.some(vi => 
//           vi.id === returnItem.item_id || 
//           vi.id === returnItem.id ||
//           vi.title === returnItem.title
//         );
        
//         if (isVendorItem) {
//           itemStatuses.set(returnItem.item_id || returnItem.id, {
//             status: 'returned',
//             return_id: returnOrder.id,
//             return_reason: returnItem.reason || 'Customer request',
//             returned_quantity: returnItem.quantity,
//             received_quantity: returnItem.received_quantity || 0,
//             created_at: returnOrder.created_at
//           });
          
//           returnItems.push({
//             id: returnItem.id,
//             item_id: returnItem.item_id,
//             return_id: returnOrder.id,
//             quantity: returnItem.quantity,
//             reason: returnItem.reason,
//             received_quantity: returnItem.received_quantity || 0,
//             created_at: returnOrder.created_at
//           });
          
//           console.log(`   ✅ Added vendor return item: ${returnItem.item_id}`);
//         }
//       });
//     }
//   });
  
//   // Process claims
//   claims.forEach((claim: any) => {
//     console.log(`🔄 Processing claim ${claim.id}:`, claim);
    
//     // Check claim items (items being returned/replaced)
//     if (claim.claim_items) {
//       claim.claim_items.forEach((claimItem: any) => {
//         console.log(`   📦 Claim item:`, claimItem);
        
//         // Check if this claim item belongs to vendor
//         const isVendorItem = vendorItems.some(vi => 
//           vi.id === claimItem.item_id ||
//           vi.title === claimItem.item?.title
//         );
        
//         if (isVendorItem) {
//           const existingStatus = itemStatuses.get(claimItem.item_id);
//           itemStatuses.set(claimItem.item_id, {
//             ...existingStatus,
//             claim_status: 'claimed',
//             claim_id: claim.id,
//             claim_type: claim.type,
//             claim_reason: claimItem.reason || 'Product issue',
//             created_at: claim.created_at
//           });
          
//           claimItems.push({
//             id: claimItem.id,
//             item_id: claimItem.item_id,
//             claim_id: claim.id,
//             quantity: claimItem.quantity,
//             reason: claimItem.reason,
//             created_at: claim.created_at
//           });
          
//           console.log(`   ✅ Added vendor claim item: ${claimItem.item_id}`);
//         }
//       });
//     }
    
//     // Check additional items (replacement items)
//     if (claim.additional_items) {
//       claim.additional_items.forEach((additionalItem: any) => {
//         console.log(`   🆕 Additional item:`, additionalItem);
        
//         // Check if this replacement item belongs to vendor
//         // This is trickier as we need to check product/variant ownership
//         const productId = additionalItem.variant?.product_id || additionalItem.product_id;
//         const variantId = additionalItem.variant_id;
        
//         // Simple check - you may need to enhance this based on your data structure
//         const isVendorItem = vendorItems.some(vi => 
//           vi.product_id === productId || 
//           vi.variant_id === variantId ||
//           (additionalItem.title && vi.title === additionalItem.title)
//         );
        
//         if (isVendorItem) {
//           // Add this as a new vendor item
//           vendorItems.push({
//             id: additionalItem.id,
//             title: additionalItem.title || 'Replacement Item',
//             subtitle: additionalItem.variant?.title || 'Claim Replacement',
//             quantity: additionalItem.quantity,
//             unit_price: additionalItem.unit_price || 0,
//             total: (additionalItem.unit_price || 0) * additionalItem.quantity,
//             variant_id: additionalItem.variant_id,
//             product_id: productId,
//             variant_sku: additionalItem.variant?.sku,
//             product_handle: additionalItem.variant?.product?.handle,
//             // Mark as claim item
//             is_claim_item: true,
//             claim_id: claim.id,
//             claim_status: 'active',
//             return_status: 'none',
//             metadata: {
//               vendor_id: vendorId,
//               is_claim_replacement: true
//             }
//           });
          
//           console.log(`   ✅ Added vendor replacement item: ${additionalItem.title}`);
//         }
//       });
//     }
//   });
  
//   return {
//     itemStatuses,
//     claimItems,
//     returnItems,
//     claims,
//     returns
//   };
// };

// // ✅ ENHANCED: Improved filtering function with vendor-specific payment status
// const filterOrderForVendor = (order: any, vendorId: string) => {
//   console.log(`🔍 INDEX: Filtering order ${order.id} for vendor ${vendorId}`);
  
//   if (!order || !vendorId) {
//     return null;
//   }

//   // Get vendor information from order metadata
//   const vendorOrders = order.metadata?.vendor_orders || [];
//   const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);
  
//   if (!vendorInfo) {
//     console.log(`❌ Vendor ${vendorId} not found in order ${order.id}`);
//     return null;
//   }

//   console.log(`✅ Found vendor info for ${vendorId}:`, vendorInfo);

//   // Enhanced item filtering logic
//   const vendorItems = order.items?.filter((item: any) => {
//     console.log(`🔍 Checking item ${item.id} for vendor ${vendorId}`);
    
//     // Method 1: Check item metadata for vendor_id
//     if (item.metadata?.vendor_id === vendorId) {
//       console.log(`✅ Item ${item.id} matches via item metadata`);
//       return true;
//     }
    
//     // Method 2: Check variant metadata for vendor_id
//     if (item.variant?.metadata?.vendor_id === vendorId) {
//       console.log(`✅ Item ${item.id} matches via variant metadata`);
//       return true;
//     }
    
//     // Method 3: Check product metadata for vendor_id
//     if (item.variant?.product?.metadata?.vendor_id === vendorId) {
//       console.log(`✅ Item ${item.id} matches via product metadata`);
//       return true;
//     }
    
//     // Method 4: Check if item ID exists in vendor_items metadata
//     const vendorMetadataItems = vendorInfo.vendor_items || [];
//     const foundInMetadata = vendorMetadataItems.some((vi: any) => {
//       return vi.id === item.id || 
//              vi.id === item.cart_id ||
//              vi.title === item.title ||
//              (vi.product_id && vi.product_id === item.product_id) ||
//              (vi.variant_id && vi.variant_id === item.variant_id);
//     });
    
//     if (foundInMetadata) {
//       console.log(`✅ Item ${item.id} matches via vendor metadata items`);
//       return true;
//     }
    
//     // Method 5: Check by product/variant title matching (fallback)
//     const titleMatch = vendorMetadataItems.some((vi: any) => 
//       vi.title && item.title && vi.title.toLowerCase() === item.title.toLowerCase()
//     );
    
//     if (titleMatch) {
//       console.log(`✅ Item ${item.id} matches via title comparison`);
//       return true;
//     }
    
//     console.log(`❌ Item ${item.id} does not match vendor ${vendorId}`);
//     return false;
//   }) || [];

//   console.log(`📦 Filtered ${vendorItems.length} items for vendor ${vendorId}`);

//   // Fallback: If no items filtered but vendor_items exist in metadata, use metadata items
//   let finalVendorItems = vendorItems;
//   if (vendorItems.length === 0 && vendorInfo.vendor_items && vendorInfo.vendor_items.length > 0) {
//     console.log(`🔄 Using fallback: creating items from vendor metadata`);
    
//     finalVendorItems = vendorInfo.vendor_items.map((metaItem: any) => ({
//       id: metaItem.id,
//       title: metaItem.title,
//       quantity: metaItem.quantity,
//       unit_price: metaItem.unit_price,
//       total: metaItem.total,
//       variant: null,
//       product: null,
//       product_id: metaItem.product_id,
//       variant_id: metaItem.variant_id,
//       variant_sku: metaItem.variant_sku,
//       product_handle: metaItem.product_handle,
//       metadata: { 
//         vendor_id: vendorId,
//         // Try to preserve original metadata if available
//         product_cost: metaItem.product_cost,
//         fulfillment_type: metaItem.fulfillment_type
//       }
//     }));
    
//     console.log(`✅ Created ${finalVendorItems.length} items from metadata`);
//   }

//   // ✅ NEW: Analyze claims and returns to update item statuses
//   const claimsAnalysis = analyzeClaimsAndReturns(order, finalVendorItems, vendorId);
  
//   // ✅ ENHANCED: Calculate vendor revenue for each item with claim/return status
//   const itemsWithRevenue = finalVendorItems.map(item => {
//     const revenueData = calculateVendorRevenue(item, vendorId);
//     const itemStatus = claimsAnalysis.itemStatuses.get(item.id) || {};
    
//     return {
//       ...item,
//       // Add revenue calculation data
//       vendor_revenue: revenueData.vendor_revenue,
//       product_cost: revenueData.product_cost,
//       fulfillment_type: revenueData.fulfillment_type,
//       calculation_type: revenueData.calculation_type,
//       platform_commission: revenueData.platform_commission,
      
//       // ✅ NEW: Add claim/return status
//       claim_status: item.is_claim_item ? 'active' : (itemStatus.claim_status ? 'replaced' : (itemStatus.status === 'returned' ? 'returned' : 'active')),
//       return_status: itemStatus.status === 'returned' ? (itemStatus.received_quantity > 0 ? 'received' : 'requested') : 'none',
//       is_claim_item: item.is_claim_item || false,
//       claim_id: item.claim_id || itemStatus.claim_id,
//       return_id: itemStatus.return_id,
//       return_reason: itemStatus.return_reason,
//       claim_reason: itemStatus.claim_reason,
      
//       // Enhanced item data
//       subtitle: item.variant?.title || item.variant_title || item.subtitle || "Handcrafted Item"
//     };
//   });

//   // ✅ ENHANCED: Calculate vendor totals based on revenue calculations
//   const vendorSubtotal = itemsWithRevenue.reduce((total: number, item: any) => {
//     return total + (item.unit_price * item.quantity);
//   }, 0);

//   // ✅ NEW: Calculate total vendor revenue (sum of all item revenues)
//   const calculatedVendorRevenue = itemsWithRevenue.reduce((total: number, item: any) => {
//     return total + item.vendor_revenue;
//   }, 0);

//   // Use calculated revenue instead of metadata amount for more accuracy
//   const vendorTotal = calculatedVendorRevenue;

//   // Calculate total platform commission
//   const totalPlatformCommission = vendorSubtotal - vendorTotal;

//   // Calculate proportional shipping and taxes (unchanged)
//   const orderSubtotal = order.subtotal || 0;
//   const proportionalShipping = orderSubtotal > 0 ? 
//     Math.round((vendorSubtotal / orderSubtotal) * (order.shipping_total || 0)) : 0;
  
//   const proportionalTax = orderSubtotal > 0 ? 
//     Math.round((vendorSubtotal / orderSubtotal) * (order.tax_total || 0)) : 0;

//   // ✅ NEW: Get vendor-specific payment status from metadata
//   const vendorPaymentData = getVendorPaymentStatusFromMetadata(order, vendorId);
  
//   console.log(`💳 INDEX: Vendor payment status for ${vendorId}:`, vendorPaymentData);

//   // ✅ ENHANCED: Revenue breakdown summary with claims/returns
//   const revenueBreakdown = {
//     total_items: itemsWithRevenue.length,
//     junooni_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Junooni-fulfilment").length,
//     creator_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Creator-fulfilment").length,
//     unknown_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "unknown").length,
//     total_cost_deductions: itemsWithRevenue
//       .filter(item => item.calculation_type === "cost_deduction")
//       .reduce((sum, item) => sum + item.product_cost, 0),
//     total_percentage_deductions: itemsWithRevenue
//       .filter(item => item.calculation_type === "percentage_split")
//       .reduce((sum, item) => sum + item.platform_commission, 0),
//     calculated_vendor_revenue: calculatedVendorRevenue,
//     total_platform_commission: totalPlatformCommission,
//     revenue_percentage: vendorSubtotal > 0 ? (vendorTotal / vendorSubtotal * 100) : 0,
    
//     // ✅ NEW: Claims and returns summary
//     returned_items: itemsWithRevenue.filter(item => item.claim_status === 'returned').length,
//     replaced_items: itemsWithRevenue.filter(item => item.claim_status === 'replaced').length,
//     claim_items: itemsWithRevenue.filter(item => item.is_claim_item).length,
//     active_items: itemsWithRevenue.filter(item => item.claim_status === 'active' && !item.is_claim_item).length
//   };

//   console.log(`💰 Enhanced vendor totals calculated:`, {
//     subtotal: vendorSubtotal,
//     calculated_revenue: calculatedVendorRevenue,
//     platform_commission: totalPlatformCommission,
//     revenue_percentage: revenueBreakdown.revenue_percentage.toFixed(1) + '%',
//     payment_status: vendorPaymentData.status,
//     claims_returns: {
//       returned: revenueBreakdown.returned_items,
//       replaced: revenueBreakdown.replaced_items,
//       new_claim_items: revenueBreakdown.claim_items,
//       active: revenueBreakdown.active_items
//     }
//   });

//   // Return enhanced vendor-specific order view with vendor payment status
//   return {
//     id: order.id,
//     display_id: order.display_id,
//     status: order.status,
//     payment_status: vendorPaymentData.status, // ✅ VENDOR-SPECIFIC PAYMENT STATUS
//     fulfillment_status: order.fulfillment_status,
//     customer: order.customer,
//     email: order.email,
//     created_at: order.created_at,
//     updated_at: order.updated_at,
    
//     // ✅ ENHANCED: Vendor-specific data with revenue calculations
//     vendor_items: itemsWithRevenue,  // Items now include revenue data + claim/return status
//     vendor_total: vendorTotal,       // Calculated based on fulfillment types
//     vendor_subtotal: vendorSubtotal,
//     vendor_shipping_total: proportionalShipping,
//     vendor_tax_total: proportionalTax,
    
//     // ✅ NEW: Revenue breakdown
//     revenue_breakdown: revenueBreakdown,
    
//     // ✅ NEW: Vendor payment details
//     vendor_payment_details: vendorPaymentData,
//     vendor_payment_status: vendorPaymentData.status,
    
//     // ✅ NEW: Claims and returns data
//     claims: claimsAnalysis.claims,
//     returns: claimsAnalysis.returns,
//     claim_items: claimsAnalysis.claimItems,
//     return_items: claimsAnalysis.returnItems,
    
//     // Shared data
//     shipping_address: order.shipping_address,
//     billing_address: order.billing_address,
//     shipping_methods: order.shipping_methods,
//     payment_collections: order.payment_collections,
//     fulfillments: order.fulfillments,
    
//     // ✅ ENHANCED: Payment info with calculated revenue
//     vendor_payment_amount: vendorTotal,  // Use calculated amount
//     currency_code: order.currency_code,
    
//     // Reference data
//     original_order_id: order.id,
//     vendor_id: vendorId,
//     vendor_handle: vendorInfo.vendor_handle || vendorId,
    
//     // ✅ ENHANCED: Metadata with revenue calculation info
//     is_vendor_filtered: true,
//     contains_only_vendor_products: true,
//     filtering_method: finalVendorItems.length > 0 ? "item_match" : "metadata_fallback",
//     revenue_calculation_applied: true,
//     claims_returns_analyzed: true,
//     vendor_payment_calculated: true, // ✅ NEW FLAG
//     has_mixed_fulfillment: revenueBreakdown.junooni_fulfillment_items > 0 && revenueBreakdown.creator_fulfillment_items > 0,
//     has_claims: claimsAnalysis.claims.length > 0,
//     has_returns: claimsAnalysis.returns.length > 0
//   };
// };

// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   try {
//     console.log("🏪 INDEX: Fetching vendor-specific orders with ENHANCED revenue calculation + VENDOR PAYMENT STATUS + claims/returns...");
    
//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);

//     // Get vendor information
//     const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       req.auth_context.actor_id,
//       {
//         relations: ["vendor"],
//       }
//     );

//     const vendorId = vendorAdmin.vendor.id;
//     console.log(`🔍 INDEX: Processing orders for vendor: ${vendorId}`);

//     // Get vendor orders
//     const {
//       data: [vendor],
//     } = await query.graph({
//       entity: "vendor",
//       fields: ["orders.*", "orders.customer.*"],
//       filters: {
//         id: vendorId,
//       },
//     });

//     if (!vendor.orders || vendor.orders.length === 0) {
//       console.log("📭 No orders found for vendor");
//       return res.json({
//         orders: [],
//         count: 0,
//         vendor_id: vendorId
//       });
//     }

//     console.log(`📋 Found ${vendor.orders.length} linked orders for vendor`);

//     // ✅ ENHANCED: Get detailed order information including claims and returns + payment data
//     const { result: detailedOrders } = await getOrdersListWorkflow(req.scope).run({
//       input: {
//         fields: [
//           "id",           // ✅ ADD: Explicitly request id
//           "display_id",   // ✅ ADD: Explicitly request display_id
//           "metadata",
//           "total",
//           "subtotal", 
//           "shipping_total",
//           "tax_total",
//           "items.*",
//           "items.tax_lines",
//           "items.adjustments",
//           "items.variant",
//           "items.variant.product",
//           "items.variant.metadata",
//           "items.variant.product.metadata",
//           "items.metadata",
//           "items.detail",
//           "items.cart_id",
//           "items.product_id",
//           "items.variant_id",
//           "items.return_requested_total", // ✅ ADD: For payment status calculation
//           "items.total",
//           "shipping_methods",
//           "payment_collections",
//           "fulfillments",
//           "customer.*",
//           "shipping_address.*",
//           "billing_address.*",
//           "payment_status", // ✅ ADD: For comparison
//         ],
//         variables: {
//           filters: {
//             id: vendor.orders.map((order) => order.id),
//           },
//         },
//       },
//     });

//     console.log(`📄 INDEX: Retrieved detailed data for ${detailedOrders.length} orders`);

//     // ✅ NEW: Calculate vendor payment status for each order before filtering
//     const ordersWithVendorPaymentStatus = [];
//     for (const order of detailedOrders) {
//       console.log(`🔄 INDEX: Calculating vendor payment status for order ${order.id}...`);
//       const orderWithPaymentStatus = await calculateAndStoreVendorPaymentStatus(order);
//       ordersWithVendorPaymentStatus.push(orderWithPaymentStatus);
      
//       // ✅ LOG: Show what was calculated
//       console.log(`📋 INDEX: Vendor payment status results for order ${order.id}:`);
//       orderWithPaymentStatus.metadata?.vendor_orders?.forEach(vo => {
//         console.log(`   Vendor ${vo.vendor_id}: ${vo.vendor_payment_status}`);
//       });
//     }

//     // ✅ ENHANCED: Filter each order and calculate vendor revenue + analyze claims/returns + use vendor payment status
//     const vendorFilteredOrders = [];

//     for (const order of ordersWithVendorPaymentStatus) {
//       console.log(`🔄 INDEX: Processing order ${order.id} for vendor filtering, revenue calculation, payment status, and claims/returns analysis...`);
      
//       const vendorOrderView = filterOrderForVendor(order, vendorId);
      
//       if (vendorOrderView) {
//         vendorFilteredOrders.push(vendorOrderView);
//         console.log(`✅ INDEX: Added filtered order ${order.id} with ${vendorOrderView.vendor_items.length} items (Revenue: ${vendorOrderView.vendor_total})`);
//         console.log(`💰 Revenue breakdown: ${vendorOrderView.revenue_breakdown.revenue_percentage.toFixed(1)}% of subtotal`);
//         console.log(`💳 Payment status: ${vendorOrderView.payment_status} (global: ${order.payment_status})`);
//         if (vendorOrderView.has_claims || vendorOrderView.has_returns) {
//           console.log(`🔄 Claims/Returns: ${vendorOrderView.claims?.length || 0} claims, ${vendorOrderView.returns?.length || 0} returns`);
//         }
//       } else {
//         console.log(`⚠️ Order ${order.id} skipped - no products for vendor ${vendorId}`);
//       }
//     }

//     // ✅ ENHANCED: Calculate aggregate vendor statistics
//     const totalVendorRevenue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_total, 0);
//     const totalOrderValue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_subtotal, 0);
//     const totalPlatformCommission = totalOrderValue - totalVendorRevenue;
//     const averageRevenuePercentage = totalOrderValue > 0 ? (totalVendorRevenue / totalOrderValue * 100) : 0;
    
//     // ✅ NEW: Aggregate claims/returns statistics
//     const totalClaims = vendorFilteredOrders.reduce((sum, order) => sum + (order.claims?.length || 0), 0);
//     const totalReturns = vendorFilteredOrders.reduce((sum, order) => sum + (order.returns?.length || 0), 0);
//     const ordersWithClaims = vendorFilteredOrders.filter(order => order.has_claims).length;
//     const ordersWithReturns = vendorFilteredOrders.filter(order => order.has_returns).length;

//     // ✅ NEW: Payment status statistics
//     const paymentStatusCounts = vendorFilteredOrders.reduce((counts, order) => {
//       const status = order.payment_status || 'unknown';
//       counts[status] = (counts[status] || 0) + 1;
//       return counts;
//     }, {});

//     console.log(`✅ INDEX: Returning ${vendorFilteredOrders.length} vendor-filtered orders with enhanced revenue calculation + VENDOR PAYMENT STATUS + claims/returns`);

//     // ✅ ENHANCED: Return vendor-specific filtered data with revenue analytics + payment status + claims/returns
//     res.json({
//       orders: vendorFilteredOrders,
//       count: vendorFilteredOrders.length,
//       vendor_id: vendorId,
//       total_linked_orders: vendor.orders.length,
//       filtered_orders: vendorFilteredOrders.length,
//       filtering_applied: true,
//       revenue_calculation_applied: true,
//       vendor_payment_calculated: true, // ✅ NEW FLAG
//       claims_returns_analyzed: true,
      
//       // ✅ NEW: Vendor revenue analytics
//       vendor_analytics: {
//         total_vendor_revenue: totalVendorRevenue,
//         total_order_value: totalOrderValue,
//         total_platform_commission: totalPlatformCommission,
//         average_revenue_percentage: parseFloat(averageRevenuePercentage.toFixed(2)),
//         currency_code: "INR"
//       },
      
//       // ✅ NEW: Payment status analytics
//       payment_status_analytics: {
//         payment_status_counts: paymentStatusCounts,
//         vendor_specific_calculation: true,
//         orders_with_vendor_payment_status: vendorFilteredOrders.filter(o => o.vendor_payment_calculated).length
//       },
      
//       // ✅ NEW: Claims and returns analytics
//       claims_returns_analytics: {
//         total_claims: totalClaims,
//         total_returns: totalReturns,
//         orders_with_claims: ordersWithClaims,
//         orders_with_returns: ordersWithReturns,
//         claim_rate: vendorFilteredOrders.length > 0 ? (ordersWithClaims / vendorFilteredOrders.length * 100) : 0,
//         return_rate: vendorFilteredOrders.length > 0 ? (ordersWithReturns / vendorFilteredOrders.length * 100) : 0
//       }
//     });

//   } catch (error: any) {
//     console.error("❌ INDEX: Error in enhanced vendor orders endpoint:", error);
//     res.status(500).json({
//       error: "Failed to fetch vendor orders",
//       message: error.message
//     });
//   }
// };


// ✅ COMPLETE FIXED /vendors/orders/route.ts
// Enhanced with proper vendor payout calculations matching single order route
// Includes: metadata fetching, payment processing fees, tax/shipping separation, fulfillment status

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";

// Cache for product metadata
const productMetadataCache = new Map<string, any>();
const cacheTimestamps = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000;

const batchFetchProductMetadata = async (productIds: string[], scope: any) => {
  const uniqueIds = [...new Set(productIds)];
  const now = Date.now();
  
  const uncachedIds = uniqueIds.filter(id => {
    const timestamp = cacheTimestamps.get(id);
    return !timestamp || now - timestamp > CACHE_TTL;
  });
  
  if (uncachedIds.length > 0) {
    console.log(`🔍 Batch fetching metadata for ${uncachedIds.length} products`);
    
    try {
      const query = scope.resolve(ContainerRegistrationKeys.QUERY);
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "metadata"],
        filters: { id: uncachedIds },
      });
      
      products.forEach((product: any) => {
        productMetadataCache.set(product.id, product.metadata || {});
        cacheTimestamps.set(product.id, now);
      });
    } catch (error) {
      console.error(`❌ Batch fetch error:`, error);
    }
  }
  
  return new Map(uniqueIds.map(id => [id, productMetadataCache.get(id) || {}]));
};

const calculateVendorFulfillmentStatus = (vendorItems: any[], order: any) => {
  console.log(`📦 Calculating vendor fulfillment status for ${vendorItems.length} items...`);
  
  if (vendorItems.length === 0) {
    return { status: 'not_fulfilled', breakdown: {}, item_statuses: {} };
  }

  const vendorItemIds = new Set(vendorItems.map(item => item.id));
  const fulfillments = order.fulfillments || [];
  const itemFulfillmentStatus = new Map();
  let totalVendorQuantity = 0;
  
  vendorItems.forEach(item => {
    itemFulfillmentStatus.set(item.id, {
      status: 'not_fulfilled',
      quantity: item.quantity,
      fulfilled_quantity: 0,
      shipped_quantity: 0,
      delivered_quantity: 0,
      fulfillment_ids: []
    });
    totalVendorQuantity += item.quantity;
  });

  fulfillments.forEach((fulfillment) => {
    if (fulfillment.canceled_at || !fulfillment.items) return;
    
    const vendorFulfillmentItems = fulfillment.items.filter(fulfillmentItem => 
      vendorItemIds.has(fulfillmentItem.line_item_id) || 
      vendorItemIds.has(fulfillmentItem.item_id)
    );
    
    vendorFulfillmentItems.forEach((fulfillmentItem) => {
      const vendorItemId = fulfillmentItem.line_item_id || fulfillmentItem.item_id;
      const vendorItem = vendorItems.find(vi => vi.id === vendorItemId);
      
      if (!vendorItem) return;
      
      const currentStatus = itemFulfillmentStatus.get(vendorItem.id);
      const fulfilledQty = fulfillmentItem.quantity || 0;
      
      currentStatus.fulfilled_quantity += fulfilledQty;
      currentStatus.fulfillment_ids.push(fulfillment.id);
      
      let newStatus = currentStatus.status;
      
      if (fulfillment.delivered_at) {
        currentStatus.delivered_quantity += fulfilledQty;
        currentStatus.shipped_quantity += fulfilledQty;
        newStatus = currentStatus.delivered_quantity >= currentStatus.quantity ? 'delivered' : 'partially_delivered';
      } else if (fulfillment.shipped_at) {
        currentStatus.shipped_quantity += fulfilledQty;
        newStatus = currentStatus.shipped_quantity >= currentStatus.quantity ? 'shipped' : 'partially_shipped';
      } else if (fulfillment.status === 'fulfilled') {
        newStatus = currentStatus.fulfilled_quantity >= currentStatus.quantity ? 'fulfilled' : 'partially_fulfilled';
      }
      
      const statusHierarchy = ['not_fulfilled', 'partially_fulfilled', 'fulfilled', 'partially_shipped', 'shipped', 'partially_delivered', 'delivered'];
      if (statusHierarchy.indexOf(newStatus) > statusHierarchy.indexOf(currentStatus.status)) {
        currentStatus.status = newStatus;
      }
      
      itemFulfillmentStatus.set(vendorItem.id, currentStatus);
    });
  });

  let deliveredQuantity = 0, shippedQuantity = 0, fulfilledQuantity = 0;
  
  itemFulfillmentStatus.forEach((status) => {
    fulfilledQuantity += status.fulfilled_quantity;
    shippedQuantity += status.shipped_quantity;
    deliveredQuantity += status.delivered_quantity;
  });

  let vendorFulfillmentStatus = 'not_fulfilled';
  
  if (deliveredQuantity === totalVendorQuantity) vendorFulfillmentStatus = 'delivered';
  else if (deliveredQuantity > 0) vendorFulfillmentStatus = 'partially_delivered';
  else if (shippedQuantity === totalVendorQuantity) vendorFulfillmentStatus = 'shipped';
  else if (shippedQuantity > 0) vendorFulfillmentStatus = 'partially_shipped';
  else if (fulfilledQuantity === totalVendorQuantity) vendorFulfillmentStatus = 'fulfilled';
  else if (fulfilledQuantity > 0) vendorFulfillmentStatus = 'partially_fulfilled';

  return {
    status: vendorFulfillmentStatus,
    breakdown: {
      total_quantity: totalVendorQuantity,
      delivered_quantity: deliveredQuantity,
      shipped_quantity: shippedQuantity,
      fulfilled_quantity: fulfilledQuantity,
      not_fulfilled_quantity: totalVendorQuantity - fulfilledQuantity
    },
    item_statuses: Object.fromEntries(itemFulfillmentStatus)
  };
};

const calculatePaymentProcessingFee = (totalAmount: number) => {
  const gatewayFee = totalAmount * 0.02;
  const gstOnFee = gatewayFee * 0.18;
  const totalProcessingFee = gatewayFee + gstOnFee;
  return { gatewayFee, gstOnFee, totalProcessingFee };
};

// ✅ FIXED: Enhanced revenue calculation with return/refund handling
const calculateVendorRevenue = async (item: any, vendorId: string, scope: any, productMetadataMap: Map<string, any>) => {
  console.log(`💰 Calculating revenue for item ${item.id} (${item.title})`);
  
  const itemTotal = item.unit_price * item.quantity;
  let vendorRevenue = itemTotal;
  let revenueCalculationType = "default";
  let productCost = 0;
  let fulfillmentType = "unknown";
  let metadataSource = "none";
  
  // ✅ FIX 1: Check for returns/refunds FIRST
  const returnRequestedTotal = item.return_requested_total || item.refunded_total || 0;
  const isFullyReturned = returnRequestedTotal >= itemTotal;
  
  if (isFullyReturned) {
    console.log(`🔴 Item fully returned/refunded - ₹0 revenue`);
    return {
      item_total: itemTotal,
      vendor_revenue: 0,
      product_cost: 0,
      total_product_cost: 0,
      quantity: item.quantity,
      fulfillment_type: "returned",
      calculation_type: "fully_returned",
      platform_commission: 0,
      metadata_source: "returned",
      has_original_product_metadata: false,
      is_returned: true,
      return_amount: returnRequestedTotal
    };
  }
  
  // Adjust item total if partially returned
  const adjustedItemTotal = itemTotal - returnRequestedTotal;
  
  // STEP 1: Get order item metadata
  let orderMetadata = null;
  let orderMetadataSource = "none";
  
  const orderMetadataSources = [
    { name: "item", data: item.metadata },
    { name: "variant", data: item.variant?.metadata },
    { name: "product_via_variant", data: item.variant?.product?.metadata },
    { name: "direct_product", data: item.product?.metadata }
  ];
  
  for (const source of orderMetadataSources) {
    if (source.data && typeof source.data === 'object' && Object.keys(source.data).length > 0) {
      orderMetadata = source.data;
      orderMetadataSource = `order_${source.name}`;
      console.log(`✅ Found order metadata in ${source.name}`);
      break;
    }
  }
  
  // STEP 2: Get original product metadata
  let originalProductMetadata = null;
  let productId = item.product_id || item.variant?.product_id || item.variant?.product?.id || item.product?.id;
  
  if (productId) {
    originalProductMetadata = productMetadataMap.get(productId);
    if (originalProductMetadata && Object.keys(originalProductMetadata).length > 0) {
      console.log(`✅ Got original product metadata from cache`);
    }
  }
  
  // STEP 3: Merge metadata
  let mergedMetadata = {};
  
  if (orderMetadata) {
    mergedMetadata = { ...orderMetadata };
    metadataSource = orderMetadataSource;
  }
  
  if (originalProductMetadata) {
    if (originalProductMetadata.fulfillment_type !== undefined) {
      mergedMetadata.fulfillment_type = originalProductMetadata.fulfillment_type;
      metadataSource += " + original_product(fulfillment_type)";
    }
    if (originalProductMetadata.cost_price !== undefined) {
      mergedMetadata.cost_price = originalProductMetadata.cost_price;
      metadataSource += " + original_product(cost_price)";
    }
  }
  
  // STEP 4: Process metadata and calculate revenue
  if (Object.keys(mergedMetadata).length > 0) {
    let fulfillmentTypeData = mergedMetadata.fulfillment_type;
    
    if (fulfillmentTypeData) {
      if (typeof fulfillmentTypeData === 'string') {
        try {
          fulfillmentTypeData = JSON.parse(fulfillmentTypeData);
        } catch (e) {
          const typeMatch = fulfillmentTypeData.match(/"type":"([^"]+)"/);
          if (typeMatch) fulfillmentType = typeMatch[1];
        }
      }
      if (fulfillmentTypeData && typeof fulfillmentTypeData === 'object' && fulfillmentTypeData.type) {
        fulfillmentType = fulfillmentTypeData.type;
      }
    }
    
    if (mergedMetadata.cost_price !== undefined && mergedMetadata.cost_price !== null) {
      productCost = typeof mergedMetadata.cost_price === 'string' 
        ? parseFloat(mergedMetadata.cost_price) || 0
        : mergedMetadata.cost_price;
    }
    
    // ✅ FIX 2: Ensure Creator fulfillment is calculated correctly
    switch (fulfillmentType) {
      case "Junooni-fulfilment":
        const totalProductCost = productCost * item.quantity;
        vendorRevenue = Math.max(0, adjustedItemTotal - totalProductCost);
        revenueCalculationType = "cost_deduction";
        console.log(`💰 Junooni: ${adjustedItemTotal} - (${productCost} × ${item.quantity}) = ${vendorRevenue}`);
        break;
        
      case "Creator-fulfilment":
        vendorRevenue = adjustedItemTotal * 0.90;
        revenueCalculationType = "percentage_split";
        console.log(`💰 Creator: ${adjustedItemTotal} × 90% = ${vendorRevenue}`);
        break;
        
      default:
        vendorRevenue = adjustedItemTotal * 0.90;
        revenueCalculationType = "default_percentage";
        console.log(`💰 Default: ${adjustedItemTotal} × 90% = ${vendorRevenue}`);
        break;
    }
  } else {
    vendorRevenue = adjustedItemTotal * 0.90;
    revenueCalculationType = "no_metadata";
  }
  
  // Adjust for partial returns
  if (returnRequestedTotal > 0 && returnRequestedTotal < itemTotal) {
    console.log(`⚠️ Partial return: Original ₹${itemTotal} - Returned ₹${returnRequestedTotal} = ₹${adjustedItemTotal}`);
  }
  
  return {
    item_total: itemTotal,
    vendor_revenue: vendorRevenue,
    product_cost: productCost,
    total_product_cost: fulfillmentType === "Junooni-fulfilment" ? productCost * item.quantity : 0,
    quantity: item.quantity,
    fulfillment_type: fulfillmentType,
    calculation_type: revenueCalculationType,
    platform_commission: adjustedItemTotal - vendorRevenue,
    metadata_source: metadataSource,
    has_original_product_metadata: !!originalProductMetadata,
    is_returned: returnRequestedTotal > 0,
    return_amount: returnRequestedTotal,
    adjusted_item_total: adjustedItemTotal
  };
};

const calculateVendorTaxAndShipping = (order, vendorItems, vendorSubtotal) => {
  console.log(`💰 Calculating vendor tax and shipping...`);
  
  let vendorProductTax = 0;
  let vendorShippingTax = 0;
  let vendorShippingAmount = 0;
  
  vendorItems.forEach(item => {
    // Skip returned items for tax calculation
    if (item.is_returned && item.return_amount >= item.item_total) {
      return;
    }
    
    if (item.tax_lines && item.tax_lines.length > 0) {
      const itemTax = item.tax_lines.reduce((sum, taxLine) => {
        const taxAmount = typeof taxLine.amount === 'number' ? taxLine.amount : parseFloat(taxLine.amount) || 0;
        return sum + taxAmount;
      }, 0);
      vendorProductTax += itemTax;
    } else if (item.tax_total) {
      const itemTax = typeof item.tax_total === 'number' ? item.tax_total : parseFloat(item.tax_total) || 0;
      vendorProductTax += itemTax;
    }
  });
  
  if (vendorProductTax === 0 && order.tax_total && order.subtotal && vendorSubtotal > 0) {
    const orderTaxTotal = typeof order.tax_total === 'number' ? order.tax_total : parseFloat(order.tax_total) || 0;
    const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
    
    let orderShippingTax = 0;
    if (order.shipping_methods && order.shipping_methods.length > 0) {
      order.shipping_methods.forEach(method => {
        if (method.tax_total) {
          orderShippingTax += typeof method.tax_total === 'number' ? method.tax_total : parseFloat(method.tax_total) || 0;
        }
      });
    }
    
    const orderProductTax = orderTaxTotal - orderShippingTax;
    const vendorProportion = vendorSubtotal / orderSubtotal;
    vendorProductTax = orderProductTax * vendorProportion;
  }
  
  if (order.shipping_total && vendorItems.length > 0) {
    const orderShippingTotal = typeof order.shipping_total === 'number' ? order.shipping_total : parseFloat(order.shipping_total) || 0;
    const isMultiVendor = order.metadata?.vendor_orders?.length > 1;
    
    if (!isMultiVendor) {
      vendorShippingAmount = orderShippingTotal;
    } else {
      const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
      if (orderSubtotal > 0) {
        const vendorProportion = vendorSubtotal / orderSubtotal;
        vendorShippingAmount = orderShippingTotal * vendorProportion;
      }
    }
  }
  
  if (order.shipping_methods && order.shipping_methods.length > 0) {
    order.shipping_methods.forEach(method => {
      if (method.tax_total) {
        const shippingMethodTax = typeof method.tax_total === 'number' ? method.tax_total : parseFloat(method.tax_total) || 0;
        const isMultiVendor = order.metadata?.vendor_orders?.length > 1;
        
        if (!isMultiVendor) {
          vendorShippingTax += shippingMethodTax;
        } else {
          const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
          if (orderSubtotal > 0) {
            const vendorProportion = vendorSubtotal / orderSubtotal;
            vendorShippingTax += shippingMethodTax * vendorProportion;
          }
        }
      }
    });
  }
  
  if (vendorShippingTax === 0 && vendorShippingAmount > 0 && vendorProductTax > 0 && vendorSubtotal > 0) {
    const productTaxRate = vendorProductTax / vendorSubtotal;
    vendorShippingTax = vendorShippingAmount * productTaxRate;
  }
  
  const vendorTaxTotal = vendorProductTax + vendorShippingTax;
  
  return {
    vendorTaxTotal: Math.round(vendorTaxTotal * 100) / 100,
    vendorShippingTotal: Math.round(vendorShippingAmount * 100) / 100,
    vendorProductTax: Math.round(vendorProductTax * 100) / 100,
    vendorShippingTax: Math.round(vendorShippingTax * 100) / 100
  };
};

const filterOrderForVendor = async (order: any, vendorId: string, scope: any, productMetadataMap: Map<string, any>) => {
  console.log(`🔍 Filtering order ${order.id} for vendor ${vendorId}`);
  
  if (!order || !vendorId) return null;

  const vendorOrders = order.metadata?.vendor_orders || [];
  const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);
  
  if (!vendorInfo) return null;

  const vendorMetadataItems = vendorInfo.vendor_items || [];
  const vendorItems = [];
  
  for (const metaItem of vendorMetadataItems) {
    const matchingOrderItem = order.items?.find((item: any) => 
      (item.title && metaItem.title && item.title.toLowerCase().trim() === metaItem.title.toLowerCase().trim()) &&
      (item.unit_price === metaItem.unit_price)
    );
    
    if (matchingOrderItem) {
      vendorItems.push(matchingOrderItem);
    }
  }

  if (vendorItems.length === 0) return null;

  // ✅ Calculate revenue with return handling
  const itemsWithRevenue = [];
  let totalReturnedAmount = 0;
  
  for (const item of vendorItems) {
    const revenueData = await calculateVendorRevenue(item, vendorId, scope, productMetadataMap);
    
    if (revenueData.is_returned) {
      totalReturnedAmount += revenueData.return_amount;
    }
    
    const trackingNumbers = [];
    const trackingUrls = [];
    let fulfillmentStatus = 'pending';
    let shippedAt = null;
    let deliveredAt = null;
    let packedAt = null;
    let fulfillmentId = null;
    let canShip = false;

    const itemFulfillments = order.fulfillments?.filter(fulfillment => 
      fulfillment.items?.some(fulItem => fulItem.line_item_id === item.id)
    ) || [];

    itemFulfillments.forEach((fulfillment) => {
      if (fulfillment.labels && fulfillment.labels.length > 0) {
        fulfillment.labels.forEach((label) => {
          if (label.tracking_number) trackingNumbers.push(label.tracking_number);
          if (label.tracking_url) trackingUrls.push(label.tracking_url);
        });
      }

      fulfillmentId = fulfillment.id;
      packedAt = fulfillment.packed_at || packedAt;
      shippedAt = fulfillment.shipped_at || shippedAt;
      deliveredAt = fulfillment.delivered_at || deliveredAt;

      if (fulfillment.delivered_at) fulfillmentStatus = 'delivered';
      else if (fulfillment.shipped_at) fulfillmentStatus = 'shipped';
      else if (fulfillment.packed_at) fulfillmentStatus = 'fulfilled';
    });

    canShip = fulfillmentStatus === 'fulfilled' && !shippedAt;
    
    itemsWithRevenue.push({
      ...item,
      vendor_revenue: revenueData.vendor_revenue,
      product_cost: revenueData.product_cost,
      fulfillment_type: revenueData.fulfillment_type,
      calculation_type: revenueData.calculation_type,
      platform_commission: revenueData.platform_commission,
      is_returned: revenueData.is_returned || false,
      return_amount: revenueData.return_amount || 0,
      
      claim_status: revenueData.is_returned ? 'returned' : 'active',
      return_status: revenueData.is_returned ? 'returned' : 'none',
      is_claim_item: false,
      
      subtitle: item.subtitle || item.variant?.title || "Handcrafted Item",
      variant_sku: item.variant_sku || item.sku || "",
      
      tracking_numbers: trackingNumbers,
      tracking_urls: trackingUrls,
      has_tracking: trackingNumbers.length > 0,
      fulfillment_status: fulfillmentStatus,
      fulfillment_id: fulfillmentId,
      packed_at: packedAt,
      shipped_at: shippedAt,
      delivered_at: deliveredAt,
      can_ship: canShip
    });
  }

  // Calculate subtotal (excluding returned amounts)
  const vendorSubtotal = itemsWithRevenue.reduce((total, item) => {
    const itemTotal = item.unit_price * item.quantity;
    const returnAmount = item.return_amount || 0;
    return total + (itemTotal - returnAmount);
  }, 0);
  
  const calculatedVendorRevenue = itemsWithRevenue.reduce((total, item) => total + item.vendor_revenue, 0);

  const { gatewayFee, gstOnFee, totalProcessingFee } = calculatePaymentProcessingFee(vendorSubtotal);
  const finalVendorRevenue = calculatedVendorRevenue - totalProcessingFee;

  const vendorFulfillmentData = calculateVendorFulfillmentStatus(itemsWithRevenue, order);

  const revenue_breakdown = {
    total_items: itemsWithRevenue.length,
    junooni_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Junooni-fulfilment").length,
    creator_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Creator-fulfilment").length,
    unknown_fulfillment_items: itemsWithRevenue.filter(item => !item.fulfillment_type || item.fulfillment_type === "unknown").length,
    returned_items: itemsWithRevenue.filter(item => item.is_returned).length,
    revenue_percentage: vendorSubtotal > 0 ? (calculatedVendorRevenue / vendorSubtotal * 100) : 0,
  };

  const vendorPaymentData = {
    status: vendorInfo.vendor_payment_status || order.payment_status || 'paid',
  };
  
  const { vendorTaxTotal, vendorShippingTotal } = calculateVendorTaxAndShipping(order, itemsWithRevenue, vendorSubtotal);

  console.log(`✅ Order ${order.display_id}: Subtotal=₹${vendorSubtotal}, Revenue=₹${calculatedVendorRevenue}, Returns=₹${totalReturnedAmount}, Final=₹${finalVendorRevenue}`);

  return {
    id: order.id,
    display_id: order.display_id,
    status: order.status,
    payment_status: vendorPaymentData.status,
    fulfillment_status: vendorFulfillmentData.status,
    fulfillment_breakdown: vendorFulfillmentData.breakdown,
    item_fulfillment_statuses: vendorFulfillmentData.item_statuses,
    customer: order.customer,
    email: order.email,
    created_at: order.created_at,
    updated_at: order.updated_at,
    
    vendor_items: itemsWithRevenue,
    vendor_total: finalVendorRevenue,
    vendor_subtotal: vendorSubtotal,
    vendor_shipping_total: vendorShippingTotal,
    vendor_tax_total: vendorTaxTotal,
    total_returned_amount: totalReturnedAmount,
    
    revenue_breakdown: revenue_breakdown,
    
    vendor_payment_details: {
      status: vendorPaymentData.status,
      gateway_fee: gatewayFee,
      gst_on_fee: gstOnFee,
      total_processing_fee: totalProcessingFee,
      final_vendor_payout: finalVendorRevenue
    },
    
    shipping_address: order.shipping_address,
    billing_address: order.billing_address,
    shipping_methods: order.shipping_methods,
    payment_collections: order.payment_collections,
    fulfillments: order.fulfillments?.filter(fulfillment => {
      return fulfillment.items?.some(fulfillmentItem => {
        const itemId = fulfillmentItem.line_item_id || fulfillmentItem.item_id;
        return itemsWithRevenue.some(vendorItem => vendorItem.id === itemId);
      });
    }) || [],
    
    vendor_payment_amount: finalVendorRevenue,
    currency_code: order.currency_code,
    
    original_order_id: order.id,
    vendor_id: vendorId,
    vendor_handle: vendorInfo.vendor_handle || vendorId,
    
    is_vendor_filtered: true,
    contains_only_vendor_products: true,
    revenue_calculation_applied: true,
    has_returns: totalReturnedAmount > 0,
  };
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log("🏪 Fetching vendor orders with RETURN HANDLING...");
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE);

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      { relations: ["vendor"] }
    );

    const vendorId = vendorAdmin.vendor.id;

    const { data: [vendor] } = await query.graph({
      entity: "vendor",
      fields: ["orders.*", "orders.customer.*"],
      filters: { id: vendorId },
    });

    if (!vendor.orders || vendor.orders.length === 0) {
      return res.json({ orders: [], count: 0, vendor_id: vendorId });
    }

    console.log(`📋 Found ${vendor.orders.length} orders`);

    const { result: detailedOrders } = await getOrdersListWorkflow(req.scope).run({
      input: {
        fields: [
          "id", "display_id", "metadata", "total", "subtotal", "shipping_total", "tax_total",
          "items.*", "items.tax_lines", "items.variant", "items.variant.product",
          "items.variant.metadata", "items.variant.product.metadata", "items.metadata",
          "items.product_id", "items.variant_id", "items.return_requested_total", "items.total",
          "items.refunded_total", "items.refundable_total",
          "shipping_methods", "shipping_methods.tax_total", "payment_collections",
          "fulfillments", "fulfillments.items.*", "fulfillments.labels.*",
          "customer.*", "shipping_address.*", "billing_address.*",
          "payment_status", "status", "email", "created_at", "updated_at", "currency_code"
        ],
        variables: {
          filters: { id: vendor.orders.map((order) => order.id) },
        },
      },
    });

    const allProductIds = new Set<string>();
    detailedOrders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product_id || item.variant?.product_id;
        if (productId) allProductIds.add(productId);
      });
    });

    const productMetadataMap = await batchFetchProductMetadata([...allProductIds], req.scope);

    const vendorFilteredOrders = [];
    for (const order of detailedOrders) {
      const filtered = await filterOrderForVendor(order, vendorId, req.scope, productMetadataMap);
      if (filtered) vendorFilteredOrders.push(filtered);
    }

    const totalVendorRevenue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_total, 0);
    const totalOrderValue = vendorFilteredOrders.reduce((sum, order) => sum + order.vendor_subtotal, 0);
    const totalReturns = vendorFilteredOrders.reduce((sum, order) => sum + (order.total_returned_amount || 0), 0);

    console.log(`✅ Total Revenue: ₹${totalVendorRevenue.toFixed(2)} | Returns: ₹${totalReturns.toFixed(2)}`);

    res.json({
      orders: vendorFilteredOrders,
      count: vendorFilteredOrders.length,
      vendor_id: vendorId,
      total_linked_orders: vendor.orders.length,
      filtered_orders: vendorFilteredOrders.length,
      
      vendor_analytics: {
        total_vendor_revenue: totalVendorRevenue,
        total_order_value: totalOrderValue,
        total_platform_commission: totalOrderValue - totalVendorRevenue,
        total_returns: totalReturns,
        currency_code: "INR"
      }
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to fetch vendor orders", message: error.message });
  }
};
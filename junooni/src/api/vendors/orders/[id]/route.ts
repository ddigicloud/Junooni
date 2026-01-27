// Complete fixed route.ts - /vendors/orders/[id]
// Enhanced with proper claims, returns, replacement item handling, and VENDOR-SPECIFIC fulfillment status
// FIXED: Proper vendor ID retrieval using listVendorAdmins
// FIXED: Junooni fulfillment payout calculation now deducts tax_total

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";

// ✅ FIXED: Calculate vendor-specific fulfillment status with proper delivered/shipped handling
// ✅ CRITICAL FIX: Enhanced vendor item filtering for calculateVendorFulfillmentStatus
const calculateVendorFulfillmentStatus = (vendorItems: any[], order: any) => {
  // //console.log(`📦 ===========================================`);
  // //console.log(`📦 VENDOR FULFILLMENT STATUS CALCULATION`);
  // //console.log(`📦 ===========================================`);
  // //console.log(`📦 Calculating vendor-specific fulfillment status for ${vendorItems.length} vendor items...`);
  
  // ✅ ENHANCED: Log all vendor items with IDs for debugging
  ////console.log(`📋 VENDOR ITEMS (${vendorItems.length}):`);
  vendorItems.forEach((item, index) => {
  //   //console.log(`  ${index + 1}. ID: ${item.id}`);
  //   //console.log(`     Title: ${item.title}`);
  //   //console.log(`     Quantity: ${item.quantity}`);
  //   //console.log(`     SKU: ${item.variant_sku || 'N/A'}`);
  //   //console.log(`     Is Claim Item: ${item.is_claim_item || false}`);
   });
  
  if (vendorItems.length === 0) {
    ////console.log(`❌ No vendor items found, returning 'not_fulfilled'`);
    return {
      status: 'not_fulfilled',
      breakdown: {},
      item_statuses: {}
    };
  }

  // ✅ CRITICAL: Create a Set of vendor item IDs for fast lookup
  const vendorItemIds = new Set(vendorItems.map(item => item.id));
  ////console.log(`📋 VENDOR ITEM IDS SET:`, Array.from(vendorItemIds));

  // Get all fulfillments from the order
  const fulfillments = order.fulfillments || [];
  ////console.log(`📋 Order has ${fulfillments.length} fulfillments`);
  
  // ✅ ENHANCED: Log all fulfillments and their items in detail
  fulfillments.forEach((fulfillment, index) => {
    ////console.log(`\n📦 FULFILLMENT ${index + 1} (${fulfillment.id}):`);
    ////console.log(`     Status: ${fulfillment.status}`);
    ////console.log(`     Shipped: ${fulfillment.shipped_at}`);
    ////console.log(`     Delivered: ${fulfillment.delivered_at}`);
    ////console.log(`     Canceled: ${fulfillment.canceled_at}`);
    ////console.log(`     Items: ${fulfillment.items?.length || 0}`);
    
    if (fulfillment.items && fulfillment.items.length > 0) {
      fulfillment.items.forEach((item, itemIndex) => {
        const belongsToVendor = vendorItemIds.has(item.line_item_id) || vendorItemIds.has(item.item_id);
        ////console.log(`       Item ${itemIndex + 1}:`);
        ////console.log(`         line_item_id: ${item.line_item_id}`);
        ////console.log(`         item_id: ${item.item_id || 'N/A'}`);
        ////console.log(`         title: ${item.title}`);
        ////console.log(`         quantity: ${item.quantity}`);
        ////console.log(`         BELONGS TO VENDOR: ${belongsToVendor ? '✅ YES' : '❌ NO'}`);
      });
    }
  });
  
  // Track fulfillment status for each vendor item
  const itemFulfillmentStatus = new Map();
  let totalVendorQuantity = 0;
  
  // Initialize all vendor items as not fulfilled
  vendorItems.forEach(item => {
    itemFulfillmentStatus.set(item.id, {
      status: 'not_fulfilled',
      quantity: item.quantity,
      fulfilled_quantity: 0,
      shipped_quantity: 0,
      delivered_quantity: 0,
      fulfillment_ids: [],
      fulfillment_details: []
    });
    totalVendorQuantity += item.quantity;
  });

  ////console.log(`\n📊 Initialized tracking for ${vendorItems.length} vendor items (total quantity: ${totalVendorQuantity})`);

  // ✅ CRITICAL: Process each fulfillment but ONLY count vendor items
  fulfillments.forEach((fulfillment, fulfillmentIndex) => {
    ////console.log(`\n🔍 PROCESSING FULFILLMENT ${fulfillmentIndex + 1}/${fulfillments.length} (${fulfillment.id})`);
    
    // Skip canceled fulfillments
    if (fulfillment.canceled_at) {
      ////console.log(`   ⏭️ SKIPPING: Fulfillment is canceled`);
      return;
    }
    
    if (!fulfillment.items || fulfillment.items.length === 0) {
      ////console.log(`   ⏭️ SKIPPING: Fulfillment has no items`);
      return;
    }
    
    ////console.log(`   📦 Fulfillment has ${fulfillment.items.length} total items`);
    
    // ✅ CRITICAL: Filter fulfillment items to only include vendor's items
    const vendorFulfillmentItems = fulfillment.items.filter(fulfillmentItem => {
      const belongsToVendor = vendorItemIds.has(fulfillmentItem.line_item_id) || 
                             vendorItemIds.has(fulfillmentItem.item_id);
      
      // //console.log(`   🔍 Checking item: ${fulfillmentItem.title} (${fulfillmentItem.line_item_id})`);
      // //console.log(`       Belongs to vendor: ${belongsToVendor ? '✅ YES' : '❌ NO'}`);
      
      return belongsToVendor;
    });
    
    ////console.log(`   ✅ VENDOR ITEMS IN THIS FULFILLMENT: ${vendorFulfillmentItems.length} out of ${fulfillment.items.length}`);
    
    if (vendorFulfillmentItems.length === 0) {
      ////console.log(`   ⏭️ SKIPPING: No vendor items in this fulfillment`);
      return;
    }
    
    // Process only the vendor's items in this fulfillment
    vendorFulfillmentItems.forEach((fulfillmentItem, itemIndex) => {
      ////console.log(`\n   📋 PROCESSING VENDOR ITEM ${itemIndex + 1}/${vendorFulfillmentItems.length}:`);
      
      // ✅ FIXED: Match by both line_item_id and item_id
      const vendorItemId = fulfillmentItem.line_item_id || fulfillmentItem.item_id;
      const vendorItem = vendorItems.find(vi => vi.id === vendorItemId);
      
      if (!vendorItem) {
        ////console.log(`       ❌ ERROR: Could not find vendor item with ID ${vendorItemId}`);
        return;
      }
      
      ////console.log(`       ✅ MATCHED VENDOR ITEM: ${vendorItem.title} (${vendorItem.id})`);
      
      const currentStatus = itemFulfillmentStatus.get(vendorItem.id);
      const fulfilledQty = fulfillmentItem.quantity || 0;
      
      // //console.log(`       📊 Status update for ${vendorItem.title}:`);
      // //console.log(`          Current status: ${currentStatus.status}`);
      // //console.log(`          Item total quantity: ${vendorItem.quantity}`);
      // //console.log(`          Fulfillment quantity: ${fulfilledQty}`);
      // //console.log(`          Fulfillment delivered_at: ${fulfillment.delivered_at}`);
      // //console.log(`          Fulfillment shipped_at: ${fulfillment.shipped_at}`);
      
      // Update fulfillment tracking
      currentStatus.fulfilled_quantity += fulfilledQty;
      currentStatus.fulfillment_ids.push(fulfillment.id);
      currentStatus.fulfillment_details.push({
        fulfillment_id: fulfillment.id,
        status: fulfillment.status,
        quantity: fulfilledQty,
        shipped_at: fulfillment.shipped_at,
        delivered_at: fulfillment.delivered_at
      });
      
      // ✅ ENHANCED: Determine item status based on fulfillment dates and status
      let newStatus = currentStatus.status;
      
      if (fulfillment.delivered_at) {
        // DELIVERED is the highest status
        currentStatus.delivered_quantity += fulfilledQty;
        currentStatus.shipped_quantity += fulfilledQty; // delivered items are also shipped
        if (currentStatus.delivered_quantity >= currentStatus.quantity) {
          newStatus = 'delivered';
        } else {
          newStatus = 'partially_delivered';
        }
        ////console.log(`       🚚 Item marked as DELIVERED: ${fulfilledQty} units`);
      } else if (fulfillment.shipped_at) {
        // SHIPPED but not delivered
        currentStatus.shipped_quantity += fulfilledQty;
        if (currentStatus.shipped_quantity >= currentStatus.quantity) {
          newStatus = 'shipped';
        } else {
          newStatus = 'partially_shipped';
        }
        ////console.log(`       📦 Item marked as SHIPPED: ${fulfilledQty} units`);
      } else if (fulfillment.status === 'fulfilled') {
        // FULFILLED but not shipped
        if (currentStatus.fulfilled_quantity >= currentStatus.quantity) {
          newStatus = 'fulfilled';
        } else {
          newStatus = 'partially_fulfilled';
        }
        //console.log(`       ✅ Item marked as FULFILLED: ${fulfilledQty} units`);
      }
      
      // Only update if new status is "higher" than current
      const statusHierarchy = ['not_fulfilled', 'partially_fulfilled', 'fulfilled', 'partially_shipped', 'shipped', 'partially_delivered', 'delivered'];
      if (statusHierarchy.indexOf(newStatus) > statusHierarchy.indexOf(currentStatus.status)) {
        currentStatus.status = newStatus;
        //console.log(`       ⬆️ STATUS UPGRADED: ${currentStatus.status} → ${newStatus}`);
      } else {
        //console.log(`       ➡️ STATUS UNCHANGED: ${currentStatus.status}`);
      }
      
      itemFulfillmentStatus.set(vendorItem.id, currentStatus);
    });
  });

  // ✅ ENHANCED: Calculate overall quantities and status
  let deliveredQuantity = 0;
  let shippedQuantity = 0;
  let fulfilledQuantity = 0;
  let deliveredItems = 0;
  let shippedItems = 0;
  let fulfilledItems = 0;
  let notFulfilledItems = 0;

  //console.log(`\n📊 FINAL ITEM STATUS SUMMARY:`);
  itemFulfillmentStatus.forEach((status, itemId) => {
    const item = vendorItems.find(vi => vi.id === itemId);
    fulfilledQuantity += status.fulfilled_quantity;
    shippedQuantity += status.shipped_quantity;
    deliveredQuantity += status.delivered_quantity;
    
    //console.log(`   📋 ${item?.title} (${itemId}):`);
    //console.log(`      Status: ${status.status}`);
    //console.log(`      Quantities: delivered(${status.delivered_quantity})/${status.quantity}, shipped(${status.shipped_quantity})/${status.quantity}, fulfilled(${status.fulfilled_quantity})/${status.quantity}`);
    //console.log(`      Fulfillments: ${status.fulfillment_ids.length}`);
    
    // Count items by final status
    if (status.status.includes('delivered')) deliveredItems++;
    else if (status.status.includes('shipped')) shippedItems++;
    else if (status.status.includes('fulfilled')) fulfilledItems++;
    else notFulfilledItems++;
  });

  // ✅ ENHANCED: Determine overall vendor fulfillment status
  let vendorFulfillmentStatus = 'not_fulfilled';
  
  //console.log(`\n📊 OVERALL STATUS CALCULATION:`);
  //console.log(`   Total vendor quantity: ${totalVendorQuantity}`);
  //console.log(`   Delivered quantity: ${deliveredQuantity}`);
  //console.log(`   Shipped quantity: ${shippedQuantity}`);
  //console.log(`   Fulfilled quantity: ${fulfilledQuantity}`);
  
  if (deliveredQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'delivered';
    //console.log(`   ✅ STATUS: DELIVERED (all ${deliveredQuantity}/${totalVendorQuantity} delivered)`);
  } else if (deliveredQuantity > 0) {
    vendorFulfillmentStatus = 'partially_delivered';
    //console.log(`   ⚠️ STATUS: PARTIALLY_DELIVERED (${deliveredQuantity}/${totalVendorQuantity} delivered)`);
  } else if (shippedQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'shipped';
    //console.log(`   ✅ STATUS: SHIPPED (all ${shippedQuantity}/${totalVendorQuantity} shipped)`);
  } else if (shippedQuantity > 0) {
    vendorFulfillmentStatus = 'partially_shipped';
    //console.log(`   ⚠️ STATUS: PARTIALLY_SHIPPED (${shippedQuantity}/${totalVendorQuantity} shipped)`);
  } else if (fulfilledQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'fulfilled';
    //console.log(`   ✅ STATUS: FULFILLED (all ${fulfilledQuantity}/${totalVendorQuantity} fulfilled)`);
  } else if (fulfilledQuantity > 0) {
    vendorFulfillmentStatus = 'partially_fulfilled';
    //console.log(`   ⚠️ STATUS: PARTIALLY_FULFILLED (${fulfilledQuantity}/${totalVendorQuantity} fulfilled)`);
  } else {
    //console.log(`   ❌ STATUS: NOT_FULFILLED`);
  }

  // Create detailed fulfillment breakdown
  const fulfillmentBreakdown = {
    total_items: vendorItems.length,
    total_quantity: totalVendorQuantity,
    delivered_items: deliveredItems,
    shipped_items: shippedItems,
    fulfilled_items: fulfilledItems,
    //not_fulfilled_items: notFulfilledItems,
    delivered_quantity: deliveredQuantity,
    shipped_quantity: shippedQuantity,
    fulfilled_quantity: fulfilledQuantity,
    not_fulfilled_quantity: totalVendorQuantity - fulfilledQuantity,
    // Legacy fields for compatibility
    not_fulfilled_items: notFulfilledItems,
    partially_fulfilled_items: 0,
    partially_shipped_items: 0,
    partially_delivered_items: 0,
    partially_fulfilled_quantity: 0,
    partially_shipped_quantity: 0,
    partially_delivered_quantity: 0
  };

  //console.log(`\n📦 ==========================================`);
  //console.log(`📦 FINAL VENDOR FULFILLMENT STATUS: ${vendorFulfillmentStatus}`);
  //console.log(`📦 ==========================================`);
  //console.log(`📦 Breakdown:`, fulfillmentBreakdown);

  return {
    status: vendorFulfillmentStatus,
    breakdown: fulfillmentBreakdown,
    item_statuses: Object.fromEntries(itemFulfillmentStatus)
  };
};

// ✅ NEW: Calculate payment processing fee (2% + 18% GST)
// ✅ UPDATED: Calculate payment processing fee based on payment method
const calculatePaymentProcessingFee = (totalAmount: number, paymentStatus: string = 'paid', paymentMethod: string = 'unknown') => {
  // If payment is refunded, no processing fees apply
  if (paymentStatus === 'refunded') {
    return {
      gatewayFee: 0,
      gstOnFee: 0,
      totalProcessingFee: 0,
      feeType: 'none'
    };
  }
  
  // For COD or manual payments - flat ₹35 fee
  if (paymentMethod === 'cod' || paymentMethod === 'manual' || paymentMethod === 'cash_on_delivery') {
    return {
      gatewayFee: 35,
      gstOnFee: 0,
      totalProcessingFee: 35,
      feeType: 'flat_cod'
    };
  }
  
  // For online payments (Razorpay) - 2% + 18% GST
  const gatewayFee = totalAmount * 0.02;
  const gstOnFee = gatewayFee * 0.18;
  const totalProcessingFee = gatewayFee + gstOnFee;
  
  return { 
    gatewayFee, 
    gstOnFee, 
    totalProcessingFee,
    feeType: 'razorpay_online'
  };
};

// ✅ NEW: Detect payment method from order
const detectPaymentMethod = (order: any): string => {
  // Check payment collections for Razorpay
  if (order.payment_collections && order.payment_collections.length > 0) {
    for (const collection of order.payment_collections) {
      // Check payment providers
      if (collection.payment_providers) {
        const hasRazorpay = collection.payment_providers.some(provider => 
          provider.id?.toLowerCase().includes('razorpay') || 
          provider.provider_id?.toLowerCase().includes('razorpay')
        );
        if (hasRazorpay) return 'razorpay';
      }
      
      // Check payments
      if (collection.payments && collection.payments.length > 0) {
        const hasRazorpay = collection.payments.some(payment => 
          payment.provider_id?.toLowerCase().includes('razorpay')
        );
        if (hasRazorpay) return 'razorpay';
      }
    }
  }
  
  // If not Razorpay, treat as COD
  return 'cod';
};

// ✅ NEW: Fetch claims and returns separately to avoid field expansion issues
const fetchOrderClaimsAndReturns = async (orderId: string, scope: any) => {
  //console.log(`🔍 Fetching claims and returns for order: ${orderId}`);
  
  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    
    // Try to get claims for this order
    let claims = [];
    let returns = [];
    
    // ✅ ENHANCED: Try multiple approaches to fetch claims with expanded fields
    try {
      //console.log(`🔍 Attempting to fetch claims with expanded fields for order ${orderId}...`);
      
      // Try different field expansion patterns
      const claimFieldPatterns = [
        // Pattern 1: Full expansion
        [
          "*",
          "claim_items.*",
          "additional_items.*",
          "additional_items.variant.*",
          "additional_items.variant.product.*",
          "fulfillments.*"
        ],
        // Pattern 2: Basic expansion
        [
          "id",
          "type", 
          "order_id",
          "created_at",
          "claim_items.*",
          "additional_items.*"
        ],
        // Pattern 3: Minimal expansion
        ["*"]
      ];
      
      for (let i = 0; i < claimFieldPatterns.length; i++) {
        try {
          //console.log(`🔍 Trying claims pattern ${i + 1}:`, claimFieldPatterns[i]);
          
          const claimsResult = await query.graph({
            entity: "order_claim", // Use order_claim since "claim" didn't work
            fields: claimFieldPatterns[i],
            filters: {
              order_id: orderId,
            },
          });
          
          claims = claimsResult.data || [];
          //console.log(`✅ Found ${claims.length} claims using pattern ${i + 1}`);
          
          if (claims.length > 0) {
            // console.log(`📋 First claim structure:`, {
            //   id: claims[0].id,
            //   type: claims[0].type,
            //   claim_items_count: claims[0].claim_items?.length || 0,
            //   additional_items_count: claims[0].additional_items?.length || 0,
            //   fulfillments_count: claims[0].fulfillments?.length || 0
            // });
            break; // Success, stop trying patterns
          }
        } catch (patternError) {
          //console.log(`⚠️ Pattern ${i + 1} failed:`, patternError.message);
          continue;
        }
      }
      
      if (claims.length === 0) {
        //console.log(`⚠️ No claims found with any expansion pattern`);
      }
      
    } catch (claimsError) {
      //console.log(`⚠️ Could not fetch claims:`, claimsError.message);
    }
    
    // ✅ ENHANCED: Try multiple approaches to fetch returns with expanded fields
    try {
      //console.log(`🔍 Attempting to fetch returns with expanded fields for order ${orderId}...`);
      
      const returnFieldPatterns = [
        // Pattern 1: Full expansion
        [
          "*",
          "items.*",
          "shipping_methods.*"
        ],
        // Pattern 2: Basic expansion
        [
          "id",
          "order_id", 
          "status",
          "created_at",
          "items.*"
        ],
        // Pattern 3: Minimal
        ["*"]
      ];
      
      for (let i = 0; i < returnFieldPatterns.length; i++) {
        try {
          //console.log(`🔍 Trying returns pattern ${i + 1}:`, returnFieldPatterns[i]);
          
          const returnsResult = await query.graph({
            entity: "return",
            fields: returnFieldPatterns[i],
            filters: {
              order_id: orderId,
            },
          });
          
          returns = returnsResult.data || [];
          //console.log(`✅ Found ${returns.length} returns using pattern ${i + 1}`);
          
          if (returns.length > 0) {
            // console.log(`📋 First return structure:`, {
            //   id: returns[0].id,
            //   status: returns[0].status,
            //   items_count: returns[0].items?.length || 0
            // });
            break;
          }
        } catch (patternError) {
          //console.log(`⚠️ Returns pattern ${i + 1} failed:`, patternError.message);
          continue;
        }
      }
      
    } catch (returnsError) {
      //console.log(`⚠️ Could not fetch returns:`, returnsError.message);
    }
    
    // ✅ NEW: If we have claims but no claim_items/additional_items, try to fetch them separately
    if (claims.length > 0 && claims.every(claim => !claim.claim_items?.length && !claim.additional_items?.length)) {
      //console.log(`🔍 Claims found but missing details, attempting separate queries...`);
      
      for (const claim of claims) {
        try {
          // Try to fetch claim items separately
          const claimItemsResult = await query.graph({
            entity: "claim_item",
            fields: ["*"],
            filters: {
              claim_id: claim.id,
            },
          });
          
          claim.claim_items = claimItemsResult.data || [];
          //console.log(`✅ Found ${claim.claim_items.length} claim items for claim ${claim.id}`);
        } catch (claimItemsError) {
          //console.log(`⚠️ Could not fetch claim items separately:`, claimItemsError.message);
        }
        
        try {
          // Try to fetch additional items separately
          const additionalItemsResult = await query.graph({
            entity: "claim_additional_item",
            fields: ["*"],
            filters: {
              claim_id: claim.id,
            },
          });
          
          claim.additional_items = additionalItemsResult.data || [];
          //console.log(`✅ Found ${claim.additional_items.length} additional items for claim ${claim.id}`);
        } catch (additionalItemsError) {
          //console.log(`⚠️ Could not fetch additional items separately:`, additionalItemsError.message);
        }
      }
    }
    
    return { claims, returns };
    
  } catch (error) {
    //console.error(`❌ Error fetching claims and returns:`, error);
    return { claims: [], returns: [] };
  }
};

// ✅ NEW: Enhanced replacement item enhancement with better product/variant detection
const enhanceReplacementItem = async (replacementItem: any, originalClaimedItems: any[], scope: any) => {
  //console.log(`🔧 Enhancing replacement item: ${replacementItem.title}`);
  // console.log(`📋 Current replacement item data:`, {
  //   id: replacementItem.id,
  //   title: replacementItem.title,
  //   unit_price: replacementItem.unit_price,
  //   variant_sku: replacementItem.variant_sku,
  //   variant_id: replacementItem.variant_id,
  //   product_id: replacementItem.product_id
  // });
  
  let enhanced = { ...replacementItem };
  let enhancements = [];
  
  // ✅ STEP 1: Try to fetch variant details if variant_id is available
  if (enhanced.variant_id && (!enhanced.unit_price || !enhanced.variant_sku || !enhanced.title || enhanced.title === 'Replacement Item')) {
    //console.log(`🔍 Fetching variant details for replacement item...`);
    
    const variantDetails = await fetchVariantDetails(enhanced.variant_id, scope);
    if (variantDetails) {
      // Update title if needed
      if (!enhanced.title || enhanced.title === 'Replacement Item') {
        if (variantDetails.product?.title) {
          enhanced.title = variantDetails.product.title;
          enhanced.subtitle = variantDetails.title || variantDetails.variant_title || 'Variant';
          enhancements.push(`title_from_variant_product(${enhanced.title})`);
          //console.log(`✅ Got title from variant product: ${enhanced.title}`);
        }
      }
      
      // Get price from variant prices
      if (!enhanced.unit_price && variantDetails.prices && variantDetails.prices.length > 0) {
        // Try to find a price (prefer the first one or match currency)
        const price = variantDetails.prices[0];
        if (price && price.amount) {
          enhanced.unit_price = price.amount / 100; // Convert from cents
          enhanced.total = enhanced.unit_price * enhanced.quantity;
          enhancements.push(`price_from_variant(${enhanced.unit_price})`);
          //console.log(`✅ Got price from variant: ${enhanced.unit_price}`);
        }
      }
      
      // Get SKU from variant
      if (!enhanced.variant_sku && variantDetails.sku) {
        enhanced.variant_sku = variantDetails.sku;
        enhancements.push(`sku_from_variant(${enhanced.variant_sku})`);
        //console.log(`✅ Got SKU from variant: ${enhanced.variant_sku}`);
      }
      
      // Update product info if available
      if (variantDetails.product) {
        enhanced.product_id = variantDetails.product.id;
        enhanced.product_handle = variantDetails.product.handle;
      }
    }
  }
  
  // ✅ STEP 2: If we still don't have complete data and have a title, try to search for the product
  if ((!enhanced.unit_price || !enhanced.variant_sku) && enhanced.title && enhanced.title !== 'Replacement Item') {
    //console.log(`🔍 Searching for product by title to get missing details...`);
    
    const productDetails = await searchProductByTitle(enhanced.title, scope);
    if (productDetails && productDetails.variants && productDetails.variants.length > 0) {
      // Try to find the best matching variant
      let bestVariant = null;
      
      // Method 1: Try to match by SKU pattern if we have partial SKU info
      if (enhanced.variant_sku && enhanced.variant_sku !== '') {
        bestVariant = productDetails.variants.find(v => v.sku && v.sku.includes(enhanced.variant_sku));
      }
      
      // Method 2: Try to match by title/subtitle
      if (!bestVariant && enhanced.subtitle) {
        bestVariant = productDetails.variants.find(v => 
          v.title && v.title.toLowerCase().includes(enhanced.subtitle.toLowerCase())
        );
      }
      
      // Method 3: Use first variant as fallback
      if (!bestVariant) {
        bestVariant = productDetails.variants[0];
      }
      
      if (bestVariant) {
        //console.log(`✅ Found matching variant:`, bestVariant.title || bestVariant.id);
        
        // Update missing price
        if (!enhanced.unit_price && bestVariant.prices && bestVariant.prices.length > 0) {
          const price = bestVariant.prices[0];
          if (price && price.amount) {
            enhanced.unit_price = price.amount / 100;
            enhanced.total = enhanced.unit_price * enhanced.quantity;
            enhancements.push(`price_from_product_search(${enhanced.unit_price})`);
            //console.log(`✅ Got price from product search: ${enhanced.unit_price}`);
          }
        }
        
        // Update missing SKU
        if (!enhanced.variant_sku && bestVariant.sku) {
          enhanced.variant_sku = bestVariant.sku;
          enhancements.push(`sku_from_product_search(${enhanced.variant_sku})`);
          //console.log(`✅ Got SKU from product search: ${enhanced.variant_sku}`);
        }
        
        // Update variant_id if needed
        if (!enhanced.variant_id) {
          enhanced.variant_id = bestVariant.id;
        }
        
        // Update product details
        enhanced.product_id = productDetails.id;
        enhanced.product_handle = productDetails.handle;
        
        // Update subtitle from variant title
        if (bestVariant.title) {
          enhanced.subtitle = bestVariant.title;
        }
      }
    }
  }
  
  // ✅ STEP 3: If still missing price, try to inherit from original claimed item
  if (!enhanced.unit_price && originalClaimedItems.length > 0) {
    //console.log(`🔍 Trying to inherit price from original claimed item...`);
    
    // Try to find a matching claimed item (by title similarity or product relation)
    const matchingClaimedItem = originalClaimedItems.find(claimedItem => {
      // Method 1: Same product
      if (enhanced.product_id && claimedItem.product_id === enhanced.product_id) {
        return true;
      }
      
      // Method 2: Similar title
      if (enhanced.title && claimedItem.title) {
        const replacementTitle = enhanced.title.toLowerCase();
        const claimedTitle = claimedItem.title.toLowerCase();
        return replacementTitle.includes(claimedTitle) || claimedTitle.includes(replacementTitle);
      }
      
      return false;
    });
    
    if (matchingClaimedItem && matchingClaimedItem.unit_price) {
      enhanced.unit_price = matchingClaimedItem.unit_price;
      enhanced.total = enhanced.unit_price * enhanced.quantity;
      enhancements.push(`price_from_claimed_item(${enhanced.unit_price})`);
      //console.log(`✅ Inherited price from claimed item: ${enhanced.unit_price}`);
      
      // Also try to inherit SKU if still missing
      if (!enhanced.variant_sku && matchingClaimedItem.variant_sku) {
        enhanced.variant_sku = matchingClaimedItem.variant_sku;
        enhancements.push(`sku_from_claimed_item(${enhanced.variant_sku})`);
        //console.log(`✅ Inherited SKU from claimed item: ${enhanced.variant_sku}`);
      }
    }
  }
  
  // ✅ STEP 4: If still missing data, set reasonable defaults
  if (!enhanced.unit_price) {
    //console.log(`⚠️ Could not determine price for replacement item, setting to 0`);
    enhanced.unit_price = 0;
    enhanced.total = 0;
    enhancements.push('price_default_zero');
  }
  
  if (!enhanced.variant_sku) {
    //console.log(`⚠️ Could not determine SKU for replacement item, setting default`);
    enhanced.variant_sku = `REPLACEMENT-${enhanced.id || 'UNKNOWN'}`;
    enhancements.push('sku_default_generated');
  }
  
  // Add enhancement tracking
  enhanced.enhancement_applied = enhancements.length > 0;
  enhanced.enhancement_methods = enhancements;
  
  // console.log(`✅ Enhanced replacement item:`, {
  //   title: enhanced.title,
  //   subtitle: enhanced.subtitle,
  //   unit_price: enhanced.unit_price,
  //   variant_sku: enhanced.variant_sku,
  //   enhancements: enhancements
  // });
  
  return enhanced;
};

// ✅ ENHANCED: Calculate vendor revenue by merging order metadata + original product metadata
// ✅ FIXED: Junooni fulfillment now deducts tax_total from item_total before calculating vendor revenue
// ✅ UPDATED: Enhanced vendor revenue calculation with order metadata from vendor_items
// ✅ FIXED: Junooni fulfillment now deducts tax_total from item_total before calculating vendor revenue
const calculateVendorRevenue = async (item: any, vendorId: string, scope: any, order: any, paymentStatus: string = 'paid') => {
  //console.log(`💰 Calculating revenue for item ${item.id} (${item.title})`);

  // If payment is refunded, vendor gets nothing
  if (paymentStatus === 'refunded') {
    return {
      item_total: item.unit_price * item.quantity,
      vendor_revenue: 0,
      product_cost: 0,
      total_product_cost: 0,
      quantity: item.quantity,
      fulfillment_type: 'unknown',
      calculation_type: 'refunded_payment',
      platform_commission: 0,
      metadata_source: 'none',
      has_original_product_metadata: false,
      payment_refunded: true
    };
  }
  
  const itemTotal = item.unit_price * item.quantity;

  // Get item tax total for Junooni fulfillment calculation
  let itemTaxTotal = 0;
  if (item.tax_total !== undefined && item.tax_total !== null) {
    itemTaxTotal = typeof item.tax_total === 'number' ? item.tax_total : parseFloat(item.tax_total) || 0;
  } else if (item.tax_lines && item.tax_lines.length > 0) {
    itemTaxTotal = item.tax_lines.reduce((sum, taxLine) => {
      const taxAmount = typeof taxLine.subtotal === 'number' ? taxLine.subtotal : parseFloat(taxLine.subtotal) || 0;
      return sum + taxAmount;
    }, 0);
  }
  //console.log(`💰 Item tax total: ${itemTaxTotal}`);

  let vendorRevenue = itemTotal;
  let revenueCalculationType = "default";
  let productCost = 0;
  let fulfillmentType = "unknown";
  let metadataSource = "none";
  
  // ✅ STEP 1: Get cost_price AND fulfillment_type from order metadata vendor_items
  const vendorOrders = order?.metadata?.vendor_orders || [];
  const vendorOrder = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);

  if (vendorOrder?.vendor_items) {
    // Find matching vendor item by comparing title and unit_price
    const matchingVendorItem = vendorOrder.vendor_items.find((vi: any) => 
      vi.title === item.title && vi.unit_price === item.unit_price
    );
    
    if (matchingVendorItem) {
      // Get cost_price
      if (matchingVendorItem.cost_price !== undefined && matchingVendorItem.cost_price !== null) {
        productCost = typeof matchingVendorItem.cost_price === 'number' 
          ? matchingVendorItem.cost_price 
          : parseFloat(matchingVendorItem.cost_price) || 0;
        metadataSource = "order_metadata_vendor_items(cost_price)";
        //console.log(`✅ Found cost_price in order metadata: ${productCost}`);
      }
      
      // ✅ NEW: Get fulfillment_type from order metadata
      if (matchingVendorItem.fulfillment_type) {
        let fulfillmentTypeData = matchingVendorItem.fulfillment_type;
        
        // Parse if it's a string
        if (typeof fulfillmentTypeData === 'string') {
          try {
            fulfillmentTypeData = JSON.parse(fulfillmentTypeData);
          } catch (e) {
            const typeMatch = fulfillmentTypeData.match(/"type":"([^"]+)"/);
            if (typeMatch) {
              fulfillmentType = typeMatch[1];
            }
          }
        }
        
        // Extract type from object
        if (fulfillmentTypeData && typeof fulfillmentTypeData === 'object' && fulfillmentTypeData.type) {
          fulfillmentType = fulfillmentTypeData.type;
        }
        
        metadataSource += " + order_metadata_vendor_items(fulfillment_type)";
        //console.log(`✅ Found fulfillment_type in order metadata: ${fulfillmentType}`);
      }
    }
  }
  
  // ✅ FALLBACK: If fulfillment_type not found in order metadata, try product metadata
  if (fulfillmentType === "unknown") {
    const productMetadata = item.variant?.product?.metadata || item.product?.metadata || {};
    let fulfillmentTypeData = productMetadata.fulfillment_type;

    if (fulfillmentTypeData) {
      if (typeof fulfillmentTypeData === 'string') {
        try {
          fulfillmentTypeData = JSON.parse(fulfillmentTypeData);
        } catch (e) {
          const typeMatch = fulfillmentTypeData.match(/"type":"([^"]+)"/);
          if (typeMatch) {
            fulfillmentType = typeMatch[1];
          }
        }
      }
      
      if (fulfillmentTypeData && typeof fulfillmentTypeData === 'object' && fulfillmentTypeData.type) {
        fulfillmentType = fulfillmentTypeData.type;
      }
      
      metadataSource += " + product_metadata_fallback(fulfillment_type)";
      //console.log(`⚠️ Using fallback fulfillment_type from product metadata: ${fulfillmentType}`);
    }
  }
  
  // Revenue calculation logic
  switch (fulfillmentType) {
    case "JUNOONI-fulfillment":
      const totalProductCost = productCost * item.quantity;
      const itemTotalWithoutTax = itemTotal - itemTaxTotal;
      vendorRevenue = Math.max(0, itemTotalWithoutTax - totalProductCost);
      revenueCalculationType = "cost_deduction_minus_tax";
      //console.log(`💰 Junooni: (${itemTotal} - ${itemTaxTotal}) - (${productCost} × ${item.quantity}) = ${vendorRevenue}`);
      break;
      
    case "Creator-fulfilment":
      vendorRevenue = itemTotal * 0.90;
      revenueCalculationType = "percentage_split";
      //console.log(`💰 Creator: ${itemTotal} × 90% = ${vendorRevenue}`);
      break;
      
    default:
      vendorRevenue = itemTotal * 0.90;
      revenueCalculationType = "default_percentage";
      //console.log(`💰 Default: ${itemTotal} × 90% = ${vendorRevenue}`);
      break;
  }
  
  return {
    item_total: itemTotal,
    item_tax_total: itemTaxTotal,
    item_total_without_tax: itemTotal - itemTaxTotal,
    vendor_revenue: vendorRevenue,
    product_cost: productCost,
    total_product_cost: fulfillmentType === "JUNOONI-fulfillment" ? productCost * item.quantity : 0,
    quantity: item.quantity,
    fulfillment_type: fulfillmentType,
    calculation_type: revenueCalculationType,
    platform_commission: itemTotal - vendorRevenue,
    metadata_source: metadataSource,
    has_original_product_metadata: metadataSource.includes("order_metadata_vendor_items")
  };
};

// ✅ FIXED: Enhanced vendor detection for replacement items - checks full order + database
// ✅ FIXED: Enhanced claims analysis to remove original items that have replacements
// ✅ FIXED: Enhanced replacement item detection to prevent cross-vendor assignments
const analyzeClaimsAndReturns = async (claims: any[], returns: any[], vendorItems: any[], vendorId: string, scope: any, order: any) => {
  //console.log(`🔍 Analyzing ${claims.length} claims and ${returns.length} returns for vendor ${vendorId}`);
  
  // Track item statuses and replacement relationships
  const itemStatuses = new Map();
  const claimItems = [];
  const returnItems = [];
  const newReplacementItems = [];
  const replacedItemIds = new Set();
  
  // Process returns
  returns.forEach((returnOrder: any) => {
    //console.log(`🔄 Processing return ${returnOrder.id}:`, returnOrder);
    
    if (returnOrder.items) {
      returnOrder.items.forEach((returnItem: any) => {
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
          
          //console.log(`   ✅ Added vendor return item: ${returnItem.item_id}`);
        }
      });
    }
  });
  
  // Collect original claimed items for price/SKU inheritance
  const originalClaimedItems = [];
  
  // Process claims
  for (const claim of claims) {
    //console.log(`🔄 Processing claim ${claim.id}:`, claim);
    //console.log(`📋 Claim type: ${claim.type}`);
    
    // Check claim items (items being returned/replaced)
    if (claim.claim_items) {
      for (const claimItem of claim.claim_items) {
        //console.log(`   📦 Claim item (being returned):`, claimItem);
        
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
          
          // Store original item for price/SKU inheritance
          const originalItem = vendorItems.find(vi => vi.id === claimItem.item_id) || 
                              order.items?.find(item => item.id === claimItem.item_id);
          if (originalItem) {
            originalClaimedItems.push(originalItem);
            //console.log(`   📋 Stored original item for inheritance: ${originalItem.title} (${originalItem.unit_price})`);
          }
          
          //console.log(`   ✅ Added vendor claim item: ${claimItem.item_id}`);
        }
      }
    }
    
    // ✅ ENHANCED: Check additional items (replacement items) with strict vendor verification
    if (claim.additional_items && claim.additional_items.length > 0) {
      //console.log(`🔍 Processing ${claim.additional_items.length} additional items (replacements):`);
      
      for (let index = 0; index < claim.additional_items.length; index++) {
        const additionalItem = claim.additional_items[index];
        // console.log(`   🆕 Additional item ${index + 1}:`, {
        //   id: additionalItem.id,
        //   title: additionalItem.title,
        //   item_id: additionalItem.item_id,
        //   variant_id: additionalItem.variant_id,
        //   product_id: additionalItem.product_id
        // });
        
        let isVendorReplacement = false;
        let matchMethod = '';
        
        // ✅ STEP 1: Check if the ORIGINAL item being replaced belongs to this vendor
        let originalItemBelongsToVendor = false;
        if (additionalItem.item_id) {
          originalItemBelongsToVendor = vendorItems.some(vi => vi.id === additionalItem.item_id);
          //console.log(`   🔍 Original item ${additionalItem.item_id} belongs to vendor: ${originalItemBelongsToVendor}`);
        }
        
        // ✅ STEP 2: Check if the REPLACEMENT item itself belongs to this vendor
        let replacementItemBelongsToVendor = false;
        
        // Method 1: Check the referenced order item (the actual replacement in the order)
        const referencedOrderItem = order.items?.find(orderItem => orderItem.id === additionalItem.item_id);
        if (referencedOrderItem) {
          //console.log(`   📦 Found referenced order item for replacement check: ${referencedOrderItem.title}`);
          // console.log(`   📋 Referenced item details:`, {
          //   id: referencedOrderItem.id,
          //   title: referencedOrderItem.title,
          //   variant_sku: referencedOrderItem.variant_sku,
          //   product_id: referencedOrderItem.product_id
          // });
          
          // ✅ CRITICAL: Check if replacement item belongs to vendor by SKU pattern or database lookup
          const productId = referencedOrderItem.product_id || referencedOrderItem.variant?.product_id;
          
          // Check by SKU pattern first (most reliable for your case)
          if (referencedOrderItem.variant_sku) {
            if (referencedOrderItem.variant_sku.startsWith('JUNI-')) {
              // Check if this vendor has other JUNI items (indicating they own JUNI products)
              const vendorHasJuniProducts = vendorItems.some(vi => 
                vi.variant_sku && vi.variant_sku.startsWith('JUNI-')
              );
              
              if (vendorHasJuniProducts) {
                replacementItemBelongsToVendor = true;
                //console.log(`   ✅ Replacement belongs to vendor via JUNI SKU pattern match`);
              } else {
                //console.log(`   ❌ Replacement has JUNI SKU but vendor doesn't have other JUNI products`);
              }
            } else {
              //console.log(`   📋 Replacement has non-JUNI SKU: ${referencedOrderItem.variant_sku}`);
            }
          }
          
          // Fallback: Check database for product metadata
          if (!replacementItemBelongsToVendor && productId) {
            try {
              const productMetadata = await fetchProductMetadata(productId, scope);
              if (productMetadata?.vendor_id === vendorId) {
                replacementItemBelongsToVendor = true;
                //console.log(`   ✅ Replacement belongs to vendor via database metadata`);
              } else {
                //console.log(`   ❌ Database shows replacement belongs to different vendor: ${productMetadata?.vendor_id}`);
              }
            } catch (error) {
              //console.log(`   ⚠️ Could not check replacement product in database:`, error.message);
            }
          }
        }
        
        // ✅ STEP 3: Only add replacement if BOTH original and replacement belong to this vendor
        if (originalItemBelongsToVendor && replacementItemBelongsToVendor) {
          isVendorReplacement = true;
          matchMethod = 'both_original_and_replacement_belong_to_vendor';
          replacedItemIds.add(additionalItem.item_id);
          //console.log(`   ✅ VALID REPLACEMENT: Both original and replacement belong to vendor ${vendorId}`);
        } else {
          //console.log(`   ❌ INVALID REPLACEMENT for vendor ${vendorId}:`);
          //console.log(`      - Original belongs to vendor: ${originalItemBelongsToVendor}`);
          //console.log(`      - Replacement belongs to vendor: ${replacementItemBelongsToVendor}`);
        }
        
        if (isVendorReplacement) {
          // Build replacement item with data
          let itemTitle = additionalItem.title || 'Replacement Item';
          let itemSubtitle = 'Claim Replacement';
          let itemUnitPrice = additionalItem.unit_price || 0;
          let itemVariantSku = additionalItem.variant?.sku || additionalItem.sku || '';
          let itemVariantId = additionalItem.variant_id;
          let itemProductId = additionalItem.product_id || additionalItem.variant?.product_id;
          
          // Use referenced order item data if available
          if (referencedOrderItem) {
            itemTitle = referencedOrderItem.title || itemTitle;
            itemSubtitle = referencedOrderItem.subtitle || referencedOrderItem.variant_title || itemSubtitle;
            itemUnitPrice = referencedOrderItem.unit_price || itemUnitPrice;
            itemVariantSku = referencedOrderItem.variant_sku || itemVariantSku;
            itemVariantId = referencedOrderItem.variant_id || itemVariantId;
            itemProductId = referencedOrderItem.product_id || itemProductId;
            //console.log(`   ✅ Got complete data from referenced order item: ${itemTitle} - ₹${itemUnitPrice} - ${itemVariantSku}`);
          }
          
          //console.log(`   📝 Final replacement item data: "${itemTitle}" - ₹${itemUnitPrice} - ${itemVariantSku}`);
          
          // Create replacement item
          let replacementItem = {
            id: additionalItem.id || `replacement_${claim.id}_${index}`,
            title: itemTitle,
            subtitle: itemSubtitle,
            quantity: additionalItem.quantity || 1,
            unit_price: itemUnitPrice,
            total: itemUnitPrice * (additionalItem.quantity || 1),
            variant_id: itemVariantId,
            product_id: itemProductId,
            variant_sku: itemVariantSku,
            // Mark as claim item
            is_claim_item: true,
            claim_id: claim.id,
            claim_status: 'active',
            return_status: 'none',
            metadata: {
              vendor_id: vendorId,
              is_claim_replacement: true,
              original_claim_id: claim.id,
              match_method: matchMethod,
              referenced_item_id: additionalItem.item_id
            }
          };
          
          // Enhance replacement item
          //console.log(`🔧 Enhancing replacement item...`);
          replacementItem = await enhanceReplacementItem(replacementItem, originalClaimedItems, scope);
          
          // Add to arrays
          newReplacementItems.push(replacementItem);
          vendorItems.push(replacementItem);
          
          //console.log(`   ✅ Added valid vendor replacement item: "${replacementItem.title}" (${matchMethod})`);
        } else {
          //console.log(`   ❌ Replacement item SKIPPED - does not belong to vendor ${vendorId}`);
        }
      }
    }
  }
  
  // ✅ Remove original items that have been replaced
  if (replacedItemIds.size > 0) {
    //console.log(`🗑️ Removing ${replacedItemIds.size} original items that have replacements:`, Array.from(replacedItemIds));
    
    const originalVendorItemsCount = vendorItems.length;
    
    // Filter out the replaced items - remove from end to avoid index issues
    for (let i = vendorItems.length - 1; i >= 0; i--) {
      const item = vendorItems[i];
      
      // Remove if: item ID is in replaced list AND it's not a replacement item itself
      if (replacedItemIds.has(item.id) && !item.is_claim_item) {
        //console.log(`   🗑️ Removing original item: ${item.title} (${item.id}) - has replacement`);
        vendorItems.splice(i, 1);
      }
    }
    
    //console.log(`✅ Vendor items after removing replaced originals: ${vendorItems.length} (was ${originalVendorItemsCount})`);
    
    // ✅ DEBUG: Log final vendor items
    //console.log(`📋 Final vendor items list:`);
    vendorItems.forEach((item, index) => {
      //console.log(`   ${index + 1}. ${item.title} (${item.id}) ${item.is_claim_item ? '[REPLACEMENT]' : '[ORIGINAL]'} - SKU: ${item.variant_sku || 'N/A'}`);
    });
  }
  
  //console.log(`📊 Claims analysis summary:`);
  //console.log(`   - Claims processed: ${claims.length}`);
  //console.log(`   - Returns processed: ${returns.length}`);
  //console.log(`   - Claim items: ${claimItems.length}`);
  //console.log(`   - Return items: ${returnItems.length}`);
  //console.log(`   - New replacement items added: ${newReplacementItems.length}`);
  //console.log(`   - Original items removed: ${replacedItemIds.size}`);
  //console.log(`   - Total vendor items after processing: ${vendorItems.length}`);
  
  return {
    itemStatuses,
    claimItems,
    returnItems,
    claims,
    returns,
    newReplacementItems
  };
};


// ✅ FIXED: Separate shipping amount from shipping tax to prevent double counting
const calculateVendorTaxAndShipping = (order, vendorItems, vendorSubtotal) => {
  //console.log(`💰 Calculating vendor tax and shipping (with proper separation)...`);
  //console.log(`📋 Order tax_total: ${order.tax_total}`);
  //console.log(`📋 Order shipping_total: ${order.shipping_total}`);
  //console.log(`📋 Order subtotal: ${order.subtotal}`);
  //console.log(`📋 Vendor subtotal: ${vendorSubtotal}`);
  
  let vendorProductTax = 0;        // Tax on vendor products only
  let vendorShippingTax = 0;       // Tax on shipping only
  let vendorShippingAmount = 0;    // Base shipping amount (no tax)
  
  // ✅ STEP 1: Calculate tax from individual vendor items (PRODUCT TAX ONLY)
  vendorItems.forEach(item => {
    // Check for item-level tax
    if (item.tax_lines && item.tax_lines.length > 0) {
      const itemTax = item.tax_lines.reduce((sum, taxLine) => {
        const taxAmount = typeof taxLine.amount === 'number' ? taxLine.amount : parseFloat(taxLine.amount) || 0;
        //console.log(`   📋 Item ${item.title} tax line: ${taxAmount}`);
        return sum + taxAmount;
      }, 0);
      vendorProductTax += itemTax;
    }
    // Fallback: check for direct tax properties on item
    else if (item.tax_total) {
      const itemTax = typeof item.tax_total === 'number' ? item.tax_total : parseFloat(item.tax_total) || 0;
      vendorProductTax += itemTax;
      //console.log(`   📋 Item ${item.title} direct tax: ${itemTax}`);
    }
  });
  
  // ✅ STEP 2: Calculate PRODUCT TAX proportionally if item-level tax not available
  if (vendorProductTax === 0 && order.tax_total && order.subtotal && vendorSubtotal > 0) {
    const orderTaxTotal = typeof order.tax_total === 'number' ? order.tax_total : parseFloat(order.tax_total) || 0;
    const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
    const orderShippingTotal = typeof order.shipping_total === 'number' ? order.shipping_total : parseFloat(order.shipping_total) || 0;
    
    if (orderSubtotal > 0) {
      // Calculate vendor's proportional share of PRODUCT tax only
      // We need to separate product tax from shipping tax in the order total
      
      // ✅ METHOD A: If we can identify shipping tax separately
      let orderProductTax = orderTaxTotal;
      let orderShippingTax = 0;
      
      // Try to extract shipping tax from shipping methods
      if (order.shipping_methods && order.shipping_methods.length > 0) {
        order.shipping_methods.forEach(method => {
          if (method.tax_total) {
            const shippingMethodTax = typeof method.tax_total === 'number' ? method.tax_total : parseFloat(method.tax_total) || 0;
            orderShippingTax += shippingMethodTax;
          }
          // Alternative: check tax_lines on shipping method
          else if (method.tax_lines && method.tax_lines.length > 0) {
            const methodTax = method.tax_lines.reduce((sum, taxLine) => {
              const taxAmount = typeof taxLine.amount === 'number' ? taxLine.amount : parseFloat(taxLine.amount) || 0;
              return sum + taxAmount;
            }, 0);
            orderShippingTax += methodTax;
          }
        });
      }
      
      // ✅ If we couldn't extract shipping tax separately, estimate it
      if (orderShippingTax === 0 && orderShippingTotal > 0) {
        // Estimate shipping tax rate from total tax rate
        const totalOrderAmount = orderSubtotal + orderShippingTotal;
        if (totalOrderAmount > 0) {
          const estimatedTaxRate = orderTaxTotal / totalOrderAmount;
          orderShippingTax = orderShippingTotal * estimatedTaxRate;
          //console.log(`📋 Estimated shipping tax rate: ${(estimatedTaxRate * 100).toFixed(2)}%`);
          //console.log(`📋 Estimated shipping tax: ${orderShippingTax}`);
        }
      }
      
      // Subtract shipping tax from total tax to get product tax
      orderProductTax = orderTaxTotal - orderShippingTax;
      
      // Calculate vendor's proportional share of product tax
      const vendorProportion = vendorSubtotal / orderSubtotal;
      vendorProductTax = orderProductTax * vendorProportion;
      
      //console.log(`💰 Proportional PRODUCT tax calculation:`);
      //console.log(`   📋 Order total tax: ${orderTaxTotal}`);
      //console.log(`   📋 Order shipping tax: ${orderShippingTax}`);
      //console.log(`   📋 Order product tax: ${orderProductTax}`);
      //console.log(`   📋 Order subtotal: ${orderSubtotal}`);
      //console.log(`   📋 Vendor subtotal: ${vendorSubtotal}`);
      //console.log(`   📋 Vendor proportion: ${(vendorProportion * 100).toFixed(2)}%`);
      //console.log(`   📋 Vendor product tax: ${vendorProductTax}`);
    }
  }
  
  // ✅ STEP 3: Calculate SHIPPING AMOUNT (base amount without tax) and SHIPPING TAX separately
  if (order.shipping_total && vendorItems.length > 0) {
    const orderShippingTotal = typeof order.shipping_total === 'number' ? order.shipping_total : parseFloat(order.shipping_total) || 0;
    
    // Check if this is a single-vendor order
    const isMultiVendor = order.metadata?.vendor_orders?.length > 1;
    
    if (!isMultiVendor) {
      // Single vendor gets full shipping amount (without tax)
      vendorShippingAmount = orderShippingTotal;
      //console.log(`📦 Single vendor order: full shipping amount (${vendorShippingAmount}) to vendor`);
    } else {
      // Multi-vendor: split shipping proportionally
      const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
      if (orderSubtotal > 0) {
        const vendorProportion = vendorSubtotal / orderSubtotal;
        vendorShippingAmount = orderShippingTotal * vendorProportion;
        //console.log(`📦 Multi-vendor order: proportional shipping amount (${vendorShippingAmount}) to vendor`);
      }
    }
  }
  
  // ✅ STEP 4: Calculate SHIPPING TAX separately
  if (order.shipping_methods && order.shipping_methods.length > 0) {
    order.shipping_methods.forEach(method => {
      // Get shipping tax from shipping method
      if (method.tax_total) {
        const shippingMethodTax = typeof method.tax_total === 'number' ? method.tax_total : parseFloat(method.tax_total) || 0;
        
        // For multi-vendor, split shipping tax proportionally
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
        
        //console.log(`📦 Shipping method ${method.name} tax: ${shippingMethodTax}`);
      }
      // Alternative: check tax_lines on shipping method
      else if (method.tax_lines && method.tax_lines.length > 0) {
        const methodTax = method.tax_lines.reduce((sum, taxLine) => {
          const taxAmount = typeof taxLine.amount === 'number' ? taxLine.amount : parseFloat(taxLine.amount) || 0;
          return sum + taxAmount;
        }, 0);
        
        // Apply same proportional logic
        const isMultiVendor = order.metadata?.vendor_orders?.length > 1;
        if (!isMultiVendor) {
          vendorShippingTax += methodTax;
        } else {
          const orderSubtotal = typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0;
          if (orderSubtotal > 0) {
            const vendorProportion = vendorSubtotal / orderSubtotal;
            vendorShippingTax += methodTax * vendorProportion;
          }
        }
        
        //console.log(`📦 Shipping method ${method.name} tax from tax_lines: ${methodTax}`);
      }
    });
  }
  
  // ✅ STEP 5: If shipping tax is still 0, estimate it
  if (vendorShippingTax === 0 && vendorShippingAmount > 0 && vendorProductTax > 0 && vendorSubtotal > 0) {
    // Estimate shipping tax using the same rate as product tax
    const productTaxRate = vendorProductTax / vendorSubtotal;
    vendorShippingTax = vendorShippingAmount * productTaxRate;
    //console.log(`📋 Estimated shipping tax using product tax rate (${(productTaxRate * 100).toFixed(2)}%): ${vendorShippingTax}`);
  }
  
  // ✅ FINAL CALCULATION: Total tax = Product tax + Shipping tax
  const vendorTaxTotal = vendorProductTax + vendorShippingTax;
  
  //console.log(`✅ Final vendor tax and shipping (SEPARATED):`);
  //console.log(`   💰 Vendor product tax: ${vendorProductTax}`);
  //console.log(`   📦 Vendor shipping tax: ${vendorShippingTax}`);
  //console.log(`   💰 Vendor total tax: ${vendorTaxTotal}`);
  //console.log(`   📦 Vendor shipping amount (no tax): ${vendorShippingAmount}`);
  //console.log(`   ✅ VERIFICATION: Shipping amount + shipping tax = ${vendorShippingAmount + vendorShippingTax}`);
  
  return {
    vendorTaxTotal: Math.round(vendorTaxTotal * 100) / 100,           // Product tax + Shipping tax
    vendorShippingTotal: Math.round(vendorShippingAmount * 100) / 100, // Base shipping amount only (NO TAX)
    vendorProductTax: Math.round(vendorProductTax * 100) / 100,       // For debugging
    vendorShippingTax: Math.round(vendorShippingTax * 100) / 100      // For debugging
  };
};

// ✅ ENHANCED: Complete vendor item filtering with database lookup and replacement detection
// ✅ CRITICAL FIX: Enhanced vendor filtering to prevent cross-vendor replacement items
const filterOrderForVendor = async (order: any, vendorId: string, scope: any) => {
  //console.log(`🔍 Enhanced filtering for order ${order.id} and vendor ${vendorId}`);
  
  if (!order || !vendorId) {
    return null;
  }

  const vendorOrders = order.metadata?.vendor_orders || [];
  const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);
  
  if (!vendorInfo) {
    return null;
  }

  //console.log(`✅ Found vendor info for ${vendorId}:`, vendorInfo);

  // ✅ CRITICAL: Get vendor-specific payment status from metadata EARLY
  const getVendorPaymentStatusFromMetadata = (order: any, vendorId: string) => {
    const vendorOrders = order.metadata?.vendor_orders || [];
    const vendorInfo = vendorOrders.find(vo => vo.vendor_id === vendorId);
    
    if (vendorInfo?.vendor_payment_status) {
      return {
        status: vendorInfo.vendor_payment_status,
        ...vendorInfo.vendor_payment_details,
        source: 'metadata'
      };
    }
    
    return {
      status: 'unknown',
      source: 'fallback'
    };
  };

  const vendorPaymentData = getVendorPaymentStatusFromMetadata(order, vendorId);
  const paymentStatus = vendorPaymentData.status;
  ////console.log(`💳 Vendor Payment Status: ${paymentStatus} (source: ${vendorPaymentData.source})`);

// ===== DEBUG: VENDOR IDENTIFICATION =====
//console.log('\n🔐 ===== VENDOR AUTHENTICATION CHECK =====');
//console.log('🆔 Logged-in Vendor ID:', vendorId);
// console.log('📋 Available vendor_orders in metadata:', 
//   order.metadata?.vendor_orders?.map(vo => ({
//     vendor_id: vo.vendor_id,
//     vendor_handle: vo.vendor_handle,
//     items_count: vo.vendor_items?.length || 0
//   }))
// );
// console.log('🎯 Selected vendorInfo:', {
//   vendor_id: vendorInfo?.vendor_id,
//   vendor_handle: vendorInfo?.vendor_handle,
//   items_count: vendorInfo?.vendor_items?.length || 0
// });
//console.log('✅ Vendor ID match:', vendorInfo?.vendor_id === vendorId);
//console.log('============================================\n');
  // ✅ STEP 1: Start with vendor metadata items and find matching order items
  // ✅ STEP 1: Match vendor metadata items to order items using multiple strategies
// ✅ STEP 1: Trust the vendor metadata (it's already correct)
const vendorMetadataItems = vendorInfo.vendor_items || [];
const vendorItems = [];
  
//console.log(`📦 Vendor metadata claims ${vendorMetadataItems.length} items for ${vendorId}`);
//console.log(`📦 Order has ${order.items?.length || 0} total items`);

// ✅ TRUST THE METADATA: Match order items to metadata items by title + price
for (const metaItem of vendorMetadataItems) {
  //console.log(`\n🔍 Looking for metadata item: "${metaItem.title}" @ ₹${metaItem.unit_price}`);
  
  // Find matching order item by exact title and price
  const matchingOrderItem = order.items?.find((orderItem: any) => {
    const titleMatch = orderItem.title && metaItem.title && 
                      orderItem.title.toLowerCase().trim() === metaItem.title.toLowerCase().trim();
    const priceMatch = orderItem.unit_price === metaItem.unit_price;
    
    return titleMatch && priceMatch;
  });
  
  if (matchingOrderItem) {
    //console.log(`✅ FOUND & ADDING: ${matchingOrderItem.title} - SKU: ${matchingOrderItem.variant_sku}`);
    vendorItems.push(matchingOrderItem);
  } else {
    //console.log(`❌ No matching order item found`);
  }
}

//console.log(`\n📦 STEP 1 complete: ${vendorItems.length} items added for vendor ${vendorId}`);
//console.log(`📋 Items:`, vendorItems.map(item => ({ title: item.title, sku: item.variant_sku })));

  // ✅ STEP 2: STRICT vendor validation - only check database for items NOT already found
  ////console.log(`🔍 Checking remaining order items for potential vendor matches...`);
  
  
  // ✅ STEP 3: Process claims and returns (this will ONLY add replacements that belong to THIS vendor)
  const { claims, returns } = await fetchOrderClaimsAndReturns(order.id, scope);
  //console.log(`🔍 Processing claims for vendor ${vendorId}...`);
  
  // ✅ CRITICAL: The claimsAnalysis will now use our strict vendor filtering
  const claimsAnalysis = await analyzeClaimsAndReturns(claims, returns, vendorItems, vendorId, scope, order);

  // ✅ STEP 4: Final validation - remove any items that shouldn't be here
  //console.log(`🔍 Final validation of vendor items for ${vendorId}...`);
  
  const validatedVendorItems = [];
  for (const item of vendorItems) {
    let isValid = true;
    
    // For replacement items, do extra validation
    if (item.is_claim_item) {
      //console.log(`🔍 Validating replacement item: ${item.title} - SKU: ${item.variant_sku}`);
      
      // Check if this vendor has other items with the same SKU pattern
      const otherVendorItems = vendorItems.filter(vi => !vi.is_claim_item);
      const hasMatchingSKUPattern = otherVendorItems.some(vi => {
        if (!vi.variant_sku || !item.variant_sku) return false;
        
        const vendorSKUPrefix = vi.variant_sku.split('-')[0];
        const itemSKUPrefix = item.variant_sku.split('-')[0];
        
        return vendorSKUPrefix === itemSKUPrefix;
      });
      
      if (!hasMatchingSKUPattern) {
        //console.log(`   ❌ Replacement item ${item.title} doesn't match vendor SKU pattern - REMOVING`);
        isValid = false;
      } else {
        //console.log(`   ✅ Replacement item ${item.title} matches vendor SKU pattern - KEEPING`);
      }
    }
    
    if (isValid) {
      validatedVendorItems.push(item);
    }
  }

  //console.log(`📦 Validated vendor items for ${vendorId}: ${validatedVendorItems.length}`);
  validatedVendorItems.forEach((item, index) => {
    //console.log(`   ${index + 1}. ${item.title} ${item.is_claim_item ? '[REPLACEMENT]' : '[ORIGINAL]'} - SKU: ${item.variant_sku || 'N/A'}`);
  });

  // ✅ STEP 5: Process all validated items for revenue calculation
  const itemsWithRevenue = [];
  for (const item of validatedVendorItems) {
    // const revenueData = await calculateVendorRevenue(item, vendorId, scope, paymentStatus);
    const revenueData = await calculateVendorRevenue(item, vendorId, scope, order, paymentStatus);
    const itemStatus = claimsAnalysis.itemStatuses.get(item.id) || {};
    
    itemsWithRevenue.push({
      ...item,
      vendor_revenue: revenueData.vendor_revenue,
      product_cost: revenueData.product_cost,
      fulfillment_type: revenueData.fulfillment_type,
      calculation_type: revenueData.calculation_type,
      platform_commission: revenueData.platform_commission,

      
      
      // Status
      claim_status: item.is_claim_item ? 'active' : (itemStatus.status === 'returned' ? 'returned' : 'active'),
      return_status: itemStatus.status === 'returned' ? 'requested' : 'none',
      is_claim_item: item.is_claim_item || false,
      
      // Enhanced data
      subtitle: item.subtitle || item.variant?.title || "Handcrafted Item",
      variant_sku: item.variant_sku || item.sku || "",
      
      // ✅ EXTRACT REAL TRACKING DATA from fulfillments
...(() => {
  const trackingNumbers = [];
  const trackingUrls = [];
  let fulfillmentStatus = 'pending';
  let shippedAt = null;
  let deliveredAt = null;
  let packedAt = null;
  let fulfillmentId = null;
  let canShip = false;

  // Find fulfillments that contain this item
  const itemFulfillments = order.fulfillments?.filter(fulfillment => 
    fulfillment.items?.some(fulItem => fulItem.line_item_id === item.id)
  ) || [];

  //console.log(`🔍 Found ${itemFulfillments.length} fulfillments for item ${item.title} (${item.id})`);

  itemFulfillments.forEach((fulfillment, index) => {
    //console.log(`  📦 Fulfillment ${index + 1}: ${fulfillment.id}`);
    //console.log(`     Status: ${fulfillment.status}`);
    //console.log(`     Shipped: ${fulfillment.shipped_at}`);
    //console.log(`     Delivered: ${fulfillment.delivered_at}`);
    //console.log(`     Labels: ${fulfillment.labels?.length || 0}`);

    // Extract tracking from labels
    if (fulfillment.labels && fulfillment.labels.length > 0) {
      fulfillment.labels.forEach((label, labelIndex) => {
        // console.log(`     Label ${labelIndex + 1}:`, {
        //   tracking_number: label.tracking_number,
        //   tracking_url: label.tracking_url
        // });
        
        if (label.tracking_number) {
          trackingNumbers.push(label.tracking_number);
        }
        if (label.tracking_url) {
          trackingUrls.push(label.tracking_url);
        }
      });
    }

    // Update fulfillment status and dates
    fulfillmentId = fulfillment.id;
    packedAt = fulfillment.packed_at || packedAt;
    shippedAt = fulfillment.shipped_at || shippedAt;
    deliveredAt = fulfillment.delivered_at || deliveredAt;

    // Determine status
    if (fulfillment.delivered_at) {
      fulfillmentStatus = 'delivered';
    } else if (fulfillment.shipped_at) {
      fulfillmentStatus = 'shipped';
    } else if (fulfillment.packed_at) {
      fulfillmentStatus = 'fulfilled';
    }
  });

  // Determine if item can be shipped
  canShip = fulfillmentStatus === 'fulfilled' && !shippedAt;

  // console.log(`✅ Final tracking data for ${item.title}:`, {
  //   tracking_numbers: trackingNumbers,
  //   tracking_urls: trackingUrls,
  //   fulfillment_status: fulfillmentStatus,
  //   can_ship: canShip
  // });

  return {
    tracking_numbers: trackingNumbers,
    tracking_urls: trackingUrls,
    has_tracking: trackingNumbers.length > 0,
    fulfillment_status: fulfillmentStatus,
    fulfillment_id: fulfillmentId,
    packed_at: packedAt,
    shipped_at: shippedAt,
    delivered_at: deliveredAt,
    can_ship: canShip
  };
})()
      
    });
  }

  // Calculate totals
  const vendorSubtotal = itemsWithRevenue.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  const calculatedVendorRevenue = itemsWithRevenue.reduce((total, item) => total + item.vendor_revenue, 0);

  // ✅ NEW: Calculate payment processing fee
// ✅ NEW: Calculate payment processing fee - pass vendor-specific payment status
  //const { gatewayFee, gstOnFee, totalProcessingFee } = calculatePaymentProcessingFee(vendorSubtotal, paymentStatus);

  // ✅ UPDATED: Detect payment method and calculate processing fee accordingly
  const paymentMethod = detectPaymentMethod(order);
  console.log(`💳 Payment method detected: ${paymentMethod}`);

  const { gatewayFee, gstOnFee, totalProcessingFee, feeType } = calculatePaymentProcessingFee(
    vendorSubtotal, 
    paymentStatus,
    paymentMethod
  );
  console.log(`💰 Processing fee: ₹${totalProcessingFee} (type: ${feeType})`);

  // If payment is refunded, vendor payout is zero
  let finalVendorRevenue = 0;
  if (paymentStatus === 'refunded') {
    finalVendorRevenue = 0;
    //console.log(`⚠️ Payment refunded - Vendor payout set to 0`);
  } else {
    finalVendorRevenue = calculatedVendorRevenue - totalProcessingFee;
  }

  // ✅ DEBUG: Log vendor items before fulfillment calculation
  //console.log(`🔍 DEBUG: Vendor items going into fulfillment calculation (${itemsWithRevenue.length}):`);
  itemsWithRevenue.forEach((item, index) => {
    // console.log(`  Vendor Item ${index + 1}:`, {
    //   id: item.id,
    //   title: item.title,
    //   quantity: item.quantity,
    //   variant_sku: item.variant_sku,
    //   is_claim_item: item.is_claim_item || false
    // });
  });

  // ✅ NEW: Calculate vendor-specific fulfillment status
  const vendorFulfillmentData = calculateVendorFulfillmentStatus(itemsWithRevenue, order);
  
  // ✅ DEBUG: Log fulfillment calculation result
  // console.log(`🔍 DEBUG: Fulfillment calculation result:`, {
  //   calculated_status: vendorFulfillmentData.status,
  //   breakdown: vendorFulfillmentData.breakdown,
  //   item_statuses_count: Object.keys(vendorFulfillmentData.item_statuses || {}).length
  // });

  // Create revenue breakdown
  const revenue_breakdown = {
    total_items: itemsWithRevenue.length,
    junooni_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "JUNOONI-fulfillment").length,
    creator_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Creator-fulfilment").length,
    unknown_fulfillment_items: itemsWithRevenue.filter(item => !item.fulfillment_type || item.fulfillment_type === "unknown").length,
    revenue_percentage: vendorSubtotal > 0 ? (calculatedVendorRevenue / vendorSubtotal * 100) : 0,
    returned_items: itemsWithRevenue.filter(item => item.claim_status === 'returned').length,
    replaced_items: itemsWithRevenue.filter(item => item.claim_status === 'replaced').length,
    claim_items: itemsWithRevenue.filter(item => item.is_claim_item).length,
    active_items: itemsWithRevenue.filter(item => item.claim_status === 'active' && !item.is_claim_item).length,
    replacement_items_enhanced: itemsWithRevenue.filter(item => item.enhancement_applied).length,
    items_with_valid_price: itemsWithRevenue.filter(item => item.unit_price > 0).length,
    items_with_sku: itemsWithRevenue.filter(item => item.variant_sku && item.variant_sku !== '').length
  };


//const vendorPaymentData = calculateVendorPaymentStatus(order, itemsWithRevenue, calculatedVendorRevenue, vendorId);


////console.log(`💳 Vendor payment status for ${vendorId}:`, vendorPaymentData);
  //console.log(`✅ FINAL RESULT for vendor ${vendorId}: ${itemsWithRevenue.length} items`);
  const { vendorTaxTotal, vendorShippingTotal } = calculateVendorTaxAndShipping(order, itemsWithRevenue, vendorSubtotal);
  const ensureVendorPaymentStatus = (vendorPaymentData: any, globalOrderStatus: string) => {
  //console.log(`🔒 PAYMENT STATUS ISOLATION CHECK:`);
  //console.log(`   Global order status: ${globalOrderStatus}`);
  //console.log(`   Vendor calculated status: ${vendorPaymentData.status}`);
  //console.log(`   Isolation applied: ${vendorPaymentData.isolation_applied}`);
  //console.log(`   Using vendor status: ${vendorPaymentData.status} (global ignored)`);
  
  return vendorPaymentData.status;
};
 const finalPaymentStatus = ensureVendorPaymentStatus(vendorPaymentData, order.payment_status);
  return {
    id: order.id,
    display_id: order.display_id,
    status: order.status,
    payment_status: finalPaymentStatus, // ✅ FIXED: Use the ensured status
    fulfillment_status: vendorFulfillmentData.status, // ✅ NOW VENDOR-SPECIFIC!
    fulfillment_breakdown: vendorFulfillmentData.breakdown, // ✅ NEW: Detailed breakdown
    item_fulfillment_statuses: vendorFulfillmentData.item_statuses, // ✅ NEW: Individual item statuses
    customer: order.customer,
    email: order.email,
    created_at: order.created_at,
    updated_at: order.updated_at,
    
    vendor_items: itemsWithRevenue,
    // vendor_total: calculatedVendorRevenue,
    vendor_total: finalVendorRevenue, // ✅ NEW: After processing fee
    vendor_subtotal: vendorSubtotal,
    vendor_shipping_total: vendorShippingTotal,
    vendor_tax_total: vendorTaxTotal,   
    
    revenue_breakdown: revenue_breakdown,
    // ✅ NEW: Add detailed payment information
  vendor_payment_details: {
    status: vendorPaymentData.status,
    captured_amount: vendorPaymentData.captured_amount,
    refunded_amount: vendorPaymentData.refunded_amount,
    authorized_amount: vendorPaymentData.authorized_amount,
    net_amount: vendorPaymentData.net_amount,
    amount_owed: vendorPaymentData.amount_owed,
    payment_method: paymentMethod, // ✅ ADDED
    fee_type: feeType, // ✅ ADDED
    global_payment_status: order.payment_status // For comparison
  },
    
    claims: claimsAnalysis.claims,
    returns: claimsAnalysis.returns,
    claim_items: claimsAnalysis.claimItems,
    return_items: claimsAnalysis.returnItems,
    
    shipping_address: order.shipping_address,
    billing_address: order.billing_address,
    shipping_methods: order.shipping_methods,
    payment_collections: order.payment_collections,
    // fulfillments: order.fulfillments,
    // ✅ FIX: Filter fulfillments to only include vendor's fulfillments
  fulfillments: order.fulfillments?.filter(fulfillment => {
    // Only include fulfillments that contain at least one vendor item
    return fulfillment.items?.some(fulfillmentItem => {
      const itemId = fulfillmentItem.line_item_id || fulfillmentItem.item_id;
      return itemsWithRevenue.some(vendorItem => vendorItem.id === itemId);
    });
  }) || [],
    
    // vendor_payment_amount: calculatedVendorRevenue,
    vendor_payment_amount: finalVendorRevenue, // ✅ NEW: After processing fee
    currency_code: order.currency_code,
    
    original_order_id: order.id,
    vendor_id: vendorId,
    vendor_handle: vendorInfo.vendor_handle || vendorId,
    
    is_vendor_filtered: true,
    contains_only_vendor_products: true,
    revenue_calculation_applied: true,
    claims_returns_analyzed: true,
    has_claims: claimsAnalysis.claims.length > 0,
    has_returns: claimsAnalysis.returns.length > 0,
    vendor_fulfillment_calculated: true ,
     vendor_payment_calculated: true// ✅ NEW: Flag to indicate vendor-specific fulfillment
  };
};

const calculateAndStoreVendorPaymentStatus = async (order: any) => {
  //console.log(`🔄 Calculating vendor payment status using item-level data...`);
  
  if (!order.metadata?.vendor_orders || !order.items) {
    return order;
  }
  
  const updatedVendorOrders = [];
  
  for (const vendorOrder of order.metadata.vendor_orders) {
    //console.log(`\n💳 Processing vendor: ${vendorOrder.vendor_id}`);
    
    // Find this vendor's items in the order
    const vendorItems = order.items.filter(item => {
      // Match by title and price from vendor metadata
      return vendorOrder.vendor_items?.some(vi => 
        vi.title === item.title && vi.unit_price === item.unit_price
      );
    });
    
    //console.log(`   Found ${vendorItems.length} items for this vendor`);
    
    if (vendorItems.length > 0) {
      let totalAmount = 0;
      let totalRefunded = 0;
      
      // Calculate using item-level refund data
      vendorItems.forEach((item, index) => {
        const itemTotal = item.total || (item.unit_price * item.quantity);
        const itemRefunded = item.return_requested_total || 0;
        
        totalAmount += itemTotal;
        totalRefunded += itemRefunded;
        
        //console.log(`   Item ${index + 1}: ${item.title}`);
        //console.log(`     Total: ${itemTotal}, Refunded: ${itemRefunded}`);
      });
      
      // Determine payment status
      let paymentStatus = 'paid';
      if (totalRefunded >= totalAmount) {
        paymentStatus = 'refunded';
      } else if (totalRefunded > 0) {
        paymentStatus = 'partially_refunded';
      }
      
      //console.log(`   📊 Vendor totals: ${totalAmount} total, ${totalRefunded} refunded`);
      //console.log(`   ✅ Payment status: ${paymentStatus}`);
      
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

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: orderId } = req.params;
    
    //console.log(`🏪 Fetching vendor order: ${orderId}`);
    // console.log(`🔐 Auth context:`, {
    //   actor_id: req.auth_context.actor_id,
    //   actor_type: req.auth_context.actor_type,
    //   app_metadata: req.auth_context.app_metadata
    // });

    // ✅ Get admin ID from token
    const adminId = req.auth_context?.actor_id;

    if (!adminId) {
      //console.error('❌ No admin ID in auth token');
      return res.status(401).json({
        error: "Unauthorized",
        message: "No vendor admin ID found in token"
      });
    }

    //console.log(`🔍 Admin ID: ${adminId}`);

    // ✅ Look up vendor_id using the admin ID
    let vendorId = null;
    const maxRetries = 3;
    let retryCount = 0;

    // ✅ METHOD 1: Try marketplace module service first (most reliable)
    while (!vendorId && retryCount < maxRetries) {
      try {
        const marketplaceModuleService: MarketplaceModuleService =
          req.scope.resolve(MARKETPLACE_MODULE);
        
        //console.log(`🔍 Attempt ${retryCount + 1}/${maxRetries}: Querying listVendorAdmins with id: ${adminId}`);
        
        const vendorAdmins = await marketplaceModuleService.listVendorAdmins({
          id: adminId
        });

        if (vendorAdmins && vendorAdmins.length > 0) {
          vendorId = vendorAdmins[0].vendor_id;
          //console.log(`✅ Found vendor_id via listVendorAdmins: ${vendorId} (attempt ${retryCount + 1})`);
          break;
        } else {
          //console.log(`⚠️ listVendorAdmins returned empty for id: ${adminId} (attempt ${retryCount + 1})`);
        }
      } catch (serviceError) {
        //console.error(`❌ listVendorAdmins attempt ${retryCount + 1} failed:`, serviceError.message);
      }
      
      retryCount++;
      
      // Small delay before retry to allow for any async operations to complete
      if (retryCount < maxRetries && !vendorId) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // ✅ METHOD 2: Fallback to query.graph if service method failed
    if (!vendorId) {
      retryCount = 0;
      
      while (!vendorId && retryCount < maxRetries) {
        try {
          const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
          
          //console.log(`🔍 Fallback attempt ${retryCount + 1}/${maxRetries}: Querying vendor_admin via graph`);
          
          const { data: adminRecords } = await query.graph({
            entity: "vendor_admin",
            fields: ["id", "vendor_id"],
            filters: {
              id: adminId
            }
          });

          if (adminRecords && adminRecords.length > 0) {
            vendorId = adminRecords[0].vendor_id;
            //console.log(`✅ Found vendor_id via query.graph: ${vendorId} (attempt ${retryCount + 1})`);
            break;
          } else {
            //console.log(`⚠️ query.graph returned empty for id: ${adminId} (attempt ${retryCount + 1})`);
          }
        } catch (queryError) {
          //console.error(`❌ query.graph attempt ${retryCount + 1} failed:`, queryError.message);
        }
        
        retryCount++;
        
        if (retryCount < maxRetries && !vendorId) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // ✅ Final validation with detailed error
    if (!vendorId) {
      //console.error(`❌ CRITICAL: Could not find vendor_id for admin ${adminId} after all attempts`);
      //console.error(`   - listVendorAdmins attempts: ${maxRetries}`);
      //console.error(`   - query.graph attempts: ${maxRetries}`);
      
      return res.status(403).json({
        error: "Access denied",
        message: "Could not determine your vendor account. Please try logging out and logging back in.",
        debug: {
          admin_id: adminId,
          reason: "vendor_lookup_failed_all_methods",
          attempts: maxRetries * 2
        }
      });
    }
    //console.log(`✅ Vendor ID resolved: ${vendorId}`);

    // ==========================================
    // Get order data
    // ==========================================

    const { result: orders } = await getOrdersListWorkflow(req.scope).run({
      input: {
        fields: [
          "id",
          "display_id",
          "metadata",
          "created_at",
          "total",
          "subtotal",
          "shipping_total",
          "tax_total",
          "items.*",
          "items.id",
          "items.title",
          "items.quantity",
          "items.unit_price",
          "items.total",
          "items.product_id",
          "items.variant_id",
          "items.metadata",
          "items.variant",
          "items.variant.product_id",
          "items.variant.product",
          "items.variant.product.id",
          "items.variant.sku",
          "items.product",
          "items.product.id",
          "items.variant.metadata",
          "shipping_methods",
          "payment_collections",
          "payment_collections",
          "payment_collections.*",
          "payment_collections.id",
          "payment_collections.status",
          "payment_collections.amount",
          "payment_collections.authorized_amount",
          "payment_collections.captured_amount",
          "payment_collections.refunded_amount",
          "payment_collections.payment_providers",
          "payment_collections.payment_providers.*",
          "payment_collections.payments",
          "payment_collections.payments.*",
          "payment_collections.payments.id",
          "payment_collections.payments.amount",
          "payment_collections.payments.provider_id",
          "payment_collections.payments.captured_at",
          "payment_collections.payments.captured_amount",
          "fulfillments",
          "fulfillments.id",
          "fulfillments.status",
          "fulfillments.shipped_at",
          "fulfillments.delivered_at",
          "fulfillments.canceled_at",
          "fulfillments.created_at",
          "fulfillments.items",
          "fulfillments.items.*",
          "fulfillments.labels.*",
          "fulfillments.labels.id",
          "fulfillments.labels.tracking_number",
          "fulfillments.labels.tracking_url",
          "fulfillments.labels.label_url",
          "fulfillments.labels.created_at",
          "customer.*",
          "shipping_address.*",
          "billing_address.*"
        ],
        variables: {
          filters: {
            id: [orderId],
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      //console.log(`❌ Order not found: ${orderId}`);
      return res.status(404).json({
        error: "Order not found"
      });
    }

    const order = orders[0];
    //console.log(`📄 Found order ${orderId}`);
    // ✅ NEW: Enrich payment collections with full details
if (order.payment_collections && order.payment_collections.length > 0) {
  console.log(`🔄 Checking payment collections for enrichment...`);
  console.log(`   Payment collections count: ${order.payment_collections.length}`);
  
  // Check if payments array is missing or empty
  const needsEnrichment = order.payment_collections.some(pc => {
    const hasPayments = pc.payments && Array.isArray(pc.payments) && pc.payments.length > 0;
    console.log(`   Payment collection ${pc.id}: has payments = ${hasPayments}`);
    return !hasPayments;
  });
  
  if (needsEnrichment) {
    console.log(`🔄 Enriching payment collections...`);
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const paymentCollectionIds = order.payment_collections.map(pc => pc.id);
    
    try {
      const { data: enrichedPaymentCollections } = await query.graph({
        entity: "payment_collection",
        fields: [
          "id",
          "status",
          "amount",
          "authorized_amount",
          "captured_amount",
          "refunded_amount",
          "payment_providers",
          "payment_providers.*",
          "payments",
          "payments.*",
          "payments.id",
          "payments.amount",
          "payments.provider_id",
          "payments.captured_at",
          "payments.captured_amount"
        ],
        filters: {
          id: paymentCollectionIds
        }
      });
      
      if (enrichedPaymentCollections && enrichedPaymentCollections.length > 0) {
        order.payment_collections = enrichedPaymentCollections;
        console.log(`✅ Payment collections enriched with provider details`);
        console.log(`   First payment collection:`, {
          id: enrichedPaymentCollections[0].id,
          status: enrichedPaymentCollections[0].status,
          payments_count: enrichedPaymentCollections[0].payments?.length || 0,
          first_payment_provider: enrichedPaymentCollections[0].payments?.[0]?.provider_id
        });
      } else {
        console.log(`⚠️ Enrichment query returned empty`);
      }
    } catch (error) {
      console.error(`❌ Error enriching payment collections:`, error.message);
    }
  } else {
    console.log(`✅ Payment collections already have complete data`);
    console.log(`   First payment provider_id:`, order.payment_collections[0].payments?.[0]?.provider_id);
  }
} else {
  console.log(`⚠️ No payment collections found on order`);
}

    // ✅ Verify vendor has access to this order
    const vendorHasAccess = order.metadata?.vendor_orders?.some(
      vo => vo.vendor_id === vendorId
    );

    if (!vendorHasAccess) {
      //console.log(`❌ Vendor ${vendorId} does not have access to order ${orderId}`);
      // console.log(`   Available vendors:`, 
      //   order.metadata?.vendor_orders?.map(vo => vo.vendor_id) || []
      // );
      
      return res.status(403).json({
        error: "Access denied",
        message: `This order does not contain products from your vendor account`,
        debug: {
          your_vendor_id: vendorId,
          order_vendors: order.metadata?.vendor_orders?.map(vo => vo.vendor_id) || []
        }
      });
    }

    //console.log(`✅ Vendor ${vendorId} verified for order ${orderId}`);

    // ==========================================
    // Calculate vendor payment status
    // ==========================================
    //console.log(`🔄 Processing order for vendor ${vendorId}...`);

    const orderWithVendorPaymentStatus = await calculateAndStoreVendorPaymentStatus(order);

    // ==========================================
    // Filter order for vendor
    // ==========================================
    const vendorOrderView = await filterOrderForVendor(
      orderWithVendorPaymentStatus, 
      vendorId, 
      req.scope
    );

    if (!vendorOrderView) {
      //console.log(`❌ Failed to filter order for vendor ${vendorId}`);
      return res.status(404).json({
        error: "Order not found for this vendor"
      });
    }

    // ==========================================
    // Prepare response
    // ==========================================
    const revenueBreakdown = vendorOrderView.revenue_breakdown || {};

    // console.log(`✅ Successfully processed vendor order ${orderId}:`, {
    //   vendor_id: vendorId,
    //   admin_id: adminId,
    //   items_found: vendorOrderView.vendor_items.length,
    //   vendor_revenue: vendorOrderView.vendor_total,
    //   fulfillment_status: vendorOrderView.fulfillment_status
    // });

    res.json({
      order: vendorOrderView,
      vendor_id: vendorId,
      admin_id: adminId,
      revenue_calculation_applied: true,
      claims_returns_analyzed: true,
      vendor_fulfillment_calculated: true,
      payment_status_info: {
        vendor_payment_status: vendorOrderView.payment_status,
        global_payment_status: order.payment_status,
        status_source: 'vendor_metadata'
      },
      revenue_insights: {
        total_items: revenueBreakdown.total_items,
        junooni_fulfillment_items: revenueBreakdown.junooni_fulfillment_items,
        creator_fulfillment_items: revenueBreakdown.creator_fulfillment_items,
        revenue_percentage: revenueBreakdown.revenue_percentage,
        currency_code: vendorOrderView.currency_code
      },
      claims_returns_insights: {
        has_claims: vendorOrderView.has_claims,
        has_returns: vendorOrderView.has_returns,
        total_claims: vendorOrderView.claims?.length || 0,
        total_returns: vendorOrderView.returns?.length || 0
      },
      fulfillment_insights: {
        vendor_fulfillment_status: vendorOrderView.fulfillment_status,
        global_fulfillment_status: order.fulfillment_status,
        fulfillment_breakdown: vendorOrderView.fulfillment_breakdown
      }
    });

  } catch (error: any) {
    //console.error("❌ Error fetching vendor order:", error);
    //console.error("Stack trace:", error.stack);
    res.status(500).json({
      error: "Failed to fetch vendor order details",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
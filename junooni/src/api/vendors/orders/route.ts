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

// ✅ ADDED: Calculate vendor-specific fulfillment status
const calculateVendorFulfillmentStatus = (vendorItems: any[], order: any) => {
  //console.log(`📦 Calculating vendor fulfillment status for ${vendorItems.length} items...`);
  
  if (vendorItems.length === 0) {
    return {
      status: 'not_fulfilled',
      breakdown: {},
      item_statuses: {}
    };
  }

  const vendorItemIds = new Set(vendorItems.map(item => item.id));
  const fulfillments = order.fulfillments || [];
  const itemFulfillmentStatus = new Map();
  let totalVendorQuantity = 0;
  
  // Initialize tracking
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

  // Process fulfillments
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

  // Calculate overall status
  let deliveredQuantity = 0;
  let shippedQuantity = 0;
  let fulfilledQuantity = 0;
  
  itemFulfillmentStatus.forEach((status) => {
    fulfilledQuantity += status.fulfilled_quantity;
    shippedQuantity += status.shipped_quantity;
    deliveredQuantity += status.delivered_quantity;
  });

  let vendorFulfillmentStatus = 'not_fulfilled';
  
  if (deliveredQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'delivered';
  } else if (deliveredQuantity > 0) {
    vendorFulfillmentStatus = 'partially_delivered';
  } else if (shippedQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'shipped';
  } else if (shippedQuantity > 0) {
    vendorFulfillmentStatus = 'partially_shipped';
  } else if (fulfilledQuantity === totalVendorQuantity) {
    vendorFulfillmentStatus = 'fulfilled';
  } else if (fulfilledQuantity > 0) {
    vendorFulfillmentStatus = 'partially_fulfilled';
  }

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


// ✅ SIMPLIFIED: Detect payment method from order
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

// ✅ ADDED: Calculate payment processing fee (2% + 18% GST)
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

// ✅ ADDED: Enhance replacement item with missing data
const enhanceReplacementItem = async (replacementItem: any, originalClaimedItems: any[], scope: any) => {
  //console.log(`🔧 Enhancing replacement item: ${replacementItem.title}`);
  
  let enhanced = { ...replacementItem };
  let enhancements = [];
  
  // Try to fetch variant details
  if (enhanced.variant_id && (!enhanced.unit_price || !enhanced.variant_sku)) {
    const variantDetails = await fetchVariantDetails(enhanced.variant_id, scope);
    if (variantDetails) {
      if (!enhanced.title && variantDetails.product?.title) {
        enhanced.title = variantDetails.product.title;
        enhanced.subtitle = variantDetails.title || 'Variant';
        enhancements.push('title_from_variant');
      }
      
      if (!enhanced.unit_price && variantDetails.prices?.[0]?.amount) {
        enhanced.unit_price = variantDetails.prices[0].amount / 100;
        enhanced.total = enhanced.unit_price * enhanced.quantity;
        enhancements.push('price_from_variant');
      }
      
      if (!enhanced.variant_sku && variantDetails.sku) {
        enhanced.variant_sku = variantDetails.sku;
        enhancements.push('sku_from_variant');
      }
    }
  }
  
  // Try to search by title if still missing data
  if ((!enhanced.unit_price || !enhanced.variant_sku) && enhanced.title && enhanced.title !== 'Replacement Item') {
    const productDetails = await searchProductByTitle(enhanced.title, scope);
    if (productDetails?.variants?.[0]) {
      const bestVariant = productDetails.variants[0];
      
      if (!enhanced.unit_price && bestVariant.prices?.[0]?.amount) {
        enhanced.unit_price = bestVariant.prices[0].amount / 100;
        enhanced.total = enhanced.unit_price * enhanced.quantity;
        enhancements.push('price_from_search');
      }
      
      if (!enhanced.variant_sku && bestVariant.sku) {
        enhanced.variant_sku = bestVariant.sku;
        enhancements.push('sku_from_search');
      }
    }
  }
  
  // Try to inherit from original claimed item
  if (!enhanced.unit_price && originalClaimedItems.length > 0) {
    const matchingClaimedItem = originalClaimedItems.find(claimedItem => {
      if (enhanced.product_id && claimedItem.product_id === enhanced.product_id) return true;
      if (enhanced.title && claimedItem.title) {
        const replacementTitle = enhanced.title.toLowerCase();
        const claimedTitle = claimedItem.title.toLowerCase();
        return replacementTitle.includes(claimedTitle) || claimedTitle.includes(replacementTitle);
      }
      return false;
    });
    
    if (matchingClaimedItem?.unit_price) {
      enhanced.unit_price = matchingClaimedItem.unit_price;
      enhanced.total = enhanced.unit_price * enhanced.quantity;
      enhancements.push('price_from_claimed');
      
      if (!enhanced.variant_sku && matchingClaimedItem.variant_sku) {
        enhanced.variant_sku = matchingClaimedItem.variant_sku;
        enhancements.push('sku_from_claimed');
      }
    }
  }
  
  // Set defaults if still missing
  if (!enhanced.unit_price) {
    enhanced.unit_price = 0;
    enhanced.total = 0;
    enhancements.push('price_default_zero');
  }
  
  if (!enhanced.variant_sku) {
    enhanced.variant_sku = `REPLACEMENT-${enhanced.id || 'UNKNOWN'}`;
    enhancements.push('sku_default_generated');
  }
  
  enhanced.enhancement_applied = enhancements.length > 0;
  enhanced.enhancement_methods = enhancements;
  
  return enhanced;
};

// ✅ ADDED: Fetch claims and returns with proper field expansion
const fetchOrderClaimsAndReturns = async (orderId: string, scope: any) => {
  //console.log(`🔍 Fetching claims and returns for order: ${orderId}`);
  
  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    let claims = [];
    let returns = [];
    
    // Try to fetch claims
    try {
      const claimFieldPatterns = [
        ["*", "claim_items.*", "additional_items.*"],
        ["id", "type", "order_id", "claim_items.*", "additional_items.*"],
        ["*"]
      ];
      
      for (let i = 0; i < claimFieldPatterns.length; i++) {
        try {
          const claimsResult = await query.graph({
            entity: "order_claim",
            fields: claimFieldPatterns[i],
            filters: { order_id: orderId },
          });
          
          claims = claimsResult.data || [];
          if (claims.length > 0) break;
        } catch (patternError) {
          continue;
        }
      }
    } catch (claimsError) {
      //console.log(`⚠️ Could not fetch claims`);
    }
    
    // Try to fetch returns
    try {
      const returnFieldPatterns = [
        ["*", "items.*"],
        ["id", "order_id", "status", "items.*"],
        ["*"]
      ];
      
      for (let i = 0; i < returnFieldPatterns.length; i++) {
        try {
          const returnsResult = await query.graph({
            entity: "return",
            fields: returnFieldPatterns[i],
            filters: { order_id: orderId },
          });
          
          returns = returnsResult.data || [];
          if (returns.length > 0) break;
        } catch (patternError) {
          continue;
        }
      }
    } catch (returnsError) {
      //console.log(`⚠️ Could not fetch returns`);
    }
    
    return { claims, returns };
  } catch (error) {
    //console.error(`❌ Error fetching claims/returns:`, error);
    return { claims: [], returns: [] };
  }
};

// ✅ UPDATED: Enhanced vendor revenue calculation with metadata fetching
// ✅ UPDATED: Enhanced vendor revenue calculation with order metadata
const calculateVendorRevenue = async (item: any, vendorId: string, scope: any, order: any, paymentStatus: string = 'paid') => {
  console.log(`💰 Calculating revenue for item ${item.id} (${item.title})`);

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
  console.log(`💰 Item tax total: ${itemTaxTotal}`);

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
        console.log(`✅ Found cost_price in order metadata: ${productCost}`);
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
        console.log(`✅ Found fulfillment_type in order metadata: ${fulfillmentType}`);
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
      console.log(`⚠️ Using fallback fulfillment_type from product metadata: ${fulfillmentType}`);
    }
  }
  
  // Revenue calculation logic
  switch (fulfillmentType) {
    case "JUNOONI-fulfillment":
      const totalProductCost = productCost * item.quantity;
      const itemTotalWithoutTax = itemTotal - itemTaxTotal;
      vendorRevenue = Math.max(0, itemTotalWithoutTax - totalProductCost);
      revenueCalculationType = "cost_deduction_minus_tax";
      console.log(`💰 Junooni: (${itemTotal} - ${itemTaxTotal}) - (${productCost} × ${item.quantity}) = ${vendorRevenue}`);
      break;
      
    case "Creator-fulfilment":
      vendorRevenue = itemTotal * 0.90;
      revenueCalculationType = "percentage_split";
      console.log(`💰 Creator: ${itemTotal} × 90% = ${vendorRevenue}`);
      break;
      
    default:
      vendorRevenue = itemTotal * 0.90;
      revenueCalculationType = "default_percentage";
      console.log(`💰 Default: ${itemTotal} × 90% = ${vendorRevenue}`);
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

// ✅ ADDED: Calculate vendor tax and shipping with proper separation
const calculateVendorTaxAndShipping = (order, vendorItems, vendorSubtotal) => {
  console.log(`💰 Calculating vendor tax and shipping...`);
  
  let vendorProductTax = 0;
  let vendorShippingTax = 0;
  let vendorShippingAmount = 0;
  
  // Calculate product tax from items
  vendorItems.forEach(item => {
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
  
  // Calculate proportional product tax if not available
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
  
  // Calculate shipping amount
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
  
  // Calculate shipping tax
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
  
  // Estimate shipping tax if still 0
  if (vendorShippingTax === 0 && vendorShippingAmount > 0 && vendorProductTax > 0 && vendorSubtotal > 0) {
    const productTaxRate = vendorProductTax / vendorSubtotal;
    vendorShippingTax = vendorShippingAmount * productTaxRate;
  }
  
  const vendorTaxTotal = vendorProductTax + vendorShippingTax;
  
  return {
    vendorTaxTotal: vendorTaxTotal,
    vendorShippingTotal: vendorShippingAmount,
    vendorProductTax: vendorProductTax,
    vendorShippingTax: vendorShippingTax
  };
};

// ✅ UPDATED: Enhanced claims and returns analysis
const analyzeClaimsAndReturns = async (claims: any[], returns: any[], vendorItems: any[], vendorId: string, scope: any, order: any) => {
  console.log(`🔍 Analyzing ${claims.length} claims and ${returns.length} returns for vendor ${vendorId}`);
  
  const itemStatuses = new Map();
  const claimItems = [];
  const returnItems = [];
  const newReplacementItems = [];
  const replacedItemIds = new Set();
  
  // Process returns
  returns.forEach((returnOrder: any) => {
    if (returnOrder.items) {
      returnOrder.items.forEach((returnItem: any) => {
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
        }
      });
    }
  });
  
  const originalClaimedItems = [];
  
  // Process claims
  for (const claim of claims) {
    if (claim.claim_items) {
      for (const claimItem of claim.claim_items) {
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
          
          const originalItem = vendorItems.find(vi => vi.id === claimItem.item_id) || 
                              order.items?.find(item => item.id === claimItem.item_id);
          if (originalItem) {
            originalClaimedItems.push(originalItem);
          }
        }
      }
    }
    
    // Process replacement items
    if (claim.additional_items && claim.additional_items.length > 0) {
      for (let index = 0; index < claim.additional_items.length; index++) {
        const additionalItem = claim.additional_items[index];
        
        let isVendorReplacement = false;
        let originalItemBelongsToVendor = false;
        
        if (additionalItem.item_id) {
          originalItemBelongsToVendor = vendorItems.some(vi => vi.id === additionalItem.item_id);
        }
        
        let replacementItemBelongsToVendor = false;
        const referencedOrderItem = order.items?.find(orderItem => orderItem.id === additionalItem.item_id);
        
        if (referencedOrderItem) {
          const productId = referencedOrderItem.product_id || referencedOrderItem.variant?.product_id;
          
          if (referencedOrderItem.variant_sku) {
            if (referencedOrderItem.variant_sku.startsWith('JUNI-')) {
              const vendorHasJuniProducts = vendorItems.some(vi => 
                vi.variant_sku && vi.variant_sku.startsWith('JUNI-')
              );
              
              if (vendorHasJuniProducts) {
                replacementItemBelongsToVendor = true;
              }
            }
          }
          
          if (!replacementItemBelongsToVendor && productId) {
            try {
              const productMetadata = await fetchProductMetadata(productId, scope);
              if (productMetadata?.vendor_id === vendorId) {
                replacementItemBelongsToVendor = true;
              }
            } catch (error) {
              //console.log(`⚠️ Could not check replacement product in database`);
            }
          }
        }
        
        if (originalItemBelongsToVendor && replacementItemBelongsToVendor) {
          isVendorReplacement = true;
          replacedItemIds.add(additionalItem.item_id);
        }
        
        if (isVendorReplacement) {
          let itemTitle = additionalItem.title || 'Replacement Item';
          let itemSubtitle = 'Claim Replacement';
          let itemUnitPrice = additionalItem.unit_price || 0;
          let itemVariantSku = additionalItem.variant?.sku || additionalItem.sku || '';
          let itemVariantId = additionalItem.variant_id;
          let itemProductId = additionalItem.product_id || additionalItem.variant?.product_id;
          
          if (referencedOrderItem) {
            itemTitle = referencedOrderItem.title || itemTitle;
            itemSubtitle = referencedOrderItem.subtitle || referencedOrderItem.variant_title || itemSubtitle;
            itemUnitPrice = referencedOrderItem.unit_price || itemUnitPrice;
            itemVariantSku = referencedOrderItem.variant_sku || itemVariantSku;
            itemVariantId = referencedOrderItem.variant_id || itemVariantId;
            itemProductId = referencedOrderItem.product_id || itemProductId;
          }
          
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
            is_claim_item: true,
            claim_id: claim.id,
            claim_status: 'active',
            return_status: 'none',
            metadata: {
              vendor_id: vendorId,
              is_claim_replacement: true,
              original_claim_id: claim.id,
              referenced_item_id: additionalItem.item_id
            }
          };
          
          replacementItem = await enhanceReplacementItem(replacementItem, originalClaimedItems, scope);
          
          newReplacementItems.push(replacementItem);
          vendorItems.push(replacementItem);
        }
      }
    }
  }
  
  // Remove original items that have replacements
  if (replacedItemIds.size > 0) {
    for (let i = vendorItems.length - 1; i >= 0; i--) {
      const item = vendorItems[i];
      if (replacedItemIds.has(item.id) && !item.is_claim_item) {
        vendorItems.splice(i, 1);
      }
    }
  }
  
  return {
    itemStatuses,
    claimItems,
    returnItems,
    claims,
    returns,
    newReplacementItems
  };
};

const fetchPaymentCollectionDetails = async (paymentCollectionIds: string[], scope: any) => {
  if (!paymentCollectionIds || paymentCollectionIds.length === 0) {
    return [];
  }
  
  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    
    const { data: paymentCollections } = await query.graph({
      entity: "payment_collection",
      fields: [
        "id",
        "status",
        "amount",
        "captured_amount",
        "refunded_amount",
        "payment_providers.*",
        "payments.*",
        "payments.provider_id"
      ],
      filters: {
        id: paymentCollectionIds
      }
    });
    
    return paymentCollections || [];
  } catch (error) {
    console.log("⚠️ Could not fetch payment collection details:", error);
    return [];
  }
};

// ✅ UPDATED: Calculate and store vendor payment status
const calculateAndStoreVendorPaymentStatus = async (order: any) => {
  console.log(`🔄 INDEX: Calculating vendor payment status for order ${order.id}...`);
  
  if (!order.metadata?.vendor_orders || !order.items) {
    return order;
  }
  
  const updatedVendorOrders = [];
  
  for (const vendorOrder of order.metadata.vendor_orders) {
    const vendorItems = order.items.filter(item => {
      return vendorOrder.vendor_items?.some(vi => 
        vi.title === item.title && vi.unit_price === item.unit_price
      );
    });
    
    if (vendorItems.length > 0) {
      let totalAmount = 0;
      let totalRefunded = 0;
      
      vendorItems.forEach((item) => {
        const itemTotal = item.total || (item.unit_price * item.quantity);
        const itemRefunded = item.return_requested_total || 0;
        
        totalAmount += itemTotal;
        totalRefunded += itemRefunded;
      });
      
      let paymentStatus = 'paid';
      if (totalRefunded >= totalAmount) {
        paymentStatus = 'refunded';
      } else if (totalRefunded > 0) {
        paymentStatus = 'partially_refunded';
      }
      
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
      updatedVendorOrders.push({
        ...vendorOrder,
        vendor_payment_status: 'unknown'
      });
    }
  }
  
  return {
    ...order,
    metadata: {
      ...order.metadata,
      vendor_orders: updatedVendorOrders,
      vendor_payment_status_calculated: true
    }
  };
};

// ✅ UPDATED: Get vendor payment status from metadata
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

// ✅ UPDATED: Enhanced filter order for vendor with all improvements
const filterOrderForVendor = async (order: any, vendorId: string, scope: any) => {
  console.log(`🔍 INDEX: Filtering order ${order.id} for vendor ${vendorId}`);
  
  if (!order || !vendorId) {
    return null;
  }

  const vendorOrders = order.metadata?.vendor_orders || [];
  const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId);
  
  if (!vendorInfo) {
    return null;
  }

  // Start with vendor metadata items
  const vendorMetadataItems = vendorInfo.vendor_items || [];
  const vendorItems = [];
  
  for (const metaItem of vendorMetadataItems) {
    const matchingOrderItem = order.items?.find((item: any) => 
      (item.title && metaItem.title && item.title.toLowerCase().trim() === metaItem.title.toLowerCase().trim()) &&
      (item.unit_price === metaItem.unit_price)
    );
    
    if (matchingOrderItem) {
      vendorItems.push(matchingOrderItem);
    } else {
      const looseMatch = order.items?.find((item: any) => 
        item.title && metaItem.title && 
        item.title.toLowerCase().includes(metaItem.title.toLowerCase())
      );
      
      if (looseMatch) {
        vendorItems.push(looseMatch);
      }
    }
  }

  // Check remaining items for vendor ownership
  

  if (vendorItems.length === 0) {
    return null;
  }

  // Fetch and analyze claims/returns
  const { claims, returns } = await fetchOrderClaimsAndReturns(order.id, scope);
  const claimsAnalysis = await analyzeClaimsAndReturns(claims, returns, vendorItems, vendorId, scope, order);

  // Validate vendor items
  const validatedVendorItems = [];
  for (const item of vendorItems) {
    let isValid = true;
    
    if (item.is_claim_item) {
      const otherVendorItems = vendorItems.filter(vi => !vi.is_claim_item);
      const hasMatchingSKUPattern = otherVendorItems.some(vi => {
        if (!vi.variant_sku || !item.variant_sku) return false;
        
        const vendorSKUPrefix = vi.variant_sku.split('-')[0];
        const itemSKUPrefix = item.variant_sku.split('-')[0];
        
        return vendorSKUPrefix === itemSKUPrefix;
      });
      
      if (!hasMatchingSKUPattern) {
        isValid = false;
      }
    }
    
    if (isValid) {
      validatedVendorItems.push(item);
    }
  }

  // ✅ CRITICAL FIX: Get vendor-specific payment status from metadata instead of parent order
  const vendorPaymentData = getVendorPaymentStatusFromMetadata(order, vendorId);
  const paymentStatus = vendorPaymentData.status;
  console.log(`💳 Vendor Payment Status: ${paymentStatus} (source: ${vendorPaymentData.source})`);

  // Calculate revenue for each item
  const itemsWithRevenue = [];
  for (const item of validatedVendorItems) {
    // const revenueData = await calculateVendorRevenue(item, vendorId, scope, paymentStatus);
    const revenueData = await calculateVendorRevenue(item, vendorId, scope, order, paymentStatus);
    const itemStatus = claimsAnalysis.itemStatuses.get(item.id) || {};
    
    // Extract tracking data
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
          if (label.tracking_number) {
            trackingNumbers.push(label.tracking_number);
          }
          if (label.tracking_url) {
            trackingUrls.push(label.tracking_url);
          }
        });
      }

      fulfillmentId = fulfillment.id;
      packedAt = fulfillment.packed_at || packedAt;
      shippedAt = fulfillment.shipped_at || shippedAt;
      deliveredAt = fulfillment.delivered_at || deliveredAt;

      if (fulfillment.delivered_at) {
        fulfillmentStatus = 'delivered';
      } else if (fulfillment.shipped_at) {
        fulfillmentStatus = 'shipped';
      } else if (fulfillment.packed_at) {
        fulfillmentStatus = 'fulfilled';
      }
    });

    canShip = fulfillmentStatus === 'fulfilled' && !shippedAt;
    
    itemsWithRevenue.push({
      ...item,
      vendor_revenue: revenueData.vendor_revenue,
      product_cost: revenueData.product_cost,
      fulfillment_type: revenueData.fulfillment_type,
      calculation_type: revenueData.calculation_type,
      platform_commission: revenueData.platform_commission,
      
      claim_status: item.is_claim_item ? 'active' : (itemStatus.status === 'returned' ? 'returned' : 'active'),
      return_status: itemStatus.status === 'returned' ? 'requested' : 'none',
      is_claim_item: item.is_claim_item || false,
      
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

  // Calculate totals
  const vendorSubtotal = itemsWithRevenue.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  const calculatedVendorRevenue = itemsWithRevenue.reduce((total, item) => total + item.vendor_revenue, 0);

  // Calculate payment processing fee - pass vendor-specific payment status
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

  // Calculate vendor-specific fulfillment status
  const vendorFulfillmentData = calculateVendorFulfillmentStatus(itemsWithRevenue, order); 

  // Revenue breakdown
  const revenue_breakdown = {
    total_items: itemsWithRevenue.length,
    junooni_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "JUNOONI-fulfillment").length,
    creator_fulfillment_items: itemsWithRevenue.filter(item => item.fulfillment_type === "Creator-fulfilment").length,
    unknown_fulfillment_items: itemsWithRevenue.filter(item => !item.fulfillment_type || item.fulfillment_type === "unknown").length,
    revenue_percentage: vendorSubtotal > 0 ? (calculatedVendorRevenue / vendorSubtotal * 100) : 0,
    returned_items: itemsWithRevenue.filter(item => item.claim_status === 'returned').length,
    replaced_items: itemsWithRevenue.filter(item => item.claim_status === 'replaced').length,
    claim_items: itemsWithRevenue.filter(item => item.is_claim_item).length,
    active_items: itemsWithRevenue.filter(item => item.claim_status === 'active' && !item.is_claim_item).length
  };
  
  // Calculate tax and shipping
  const { vendorTaxTotal, vendorShippingTotal } = calculateVendorTaxAndShipping(order, itemsWithRevenue, vendorSubtotal);

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
    
    revenue_breakdown: revenue_breakdown,
    
    vendor_payment_details: {
      status: vendorPaymentData.status,
      captured_amount: vendorPaymentData.captured_amount,
      refunded_amount: vendorPaymentData.refunded_amount,
      net_amount: vendorPaymentData.net_amount,
      payment_method: paymentMethod, // ✅ ADDED
      fee_type: feeType, // ✅ ADDED
      gateway_fee: gatewayFee,
      gst_on_fee: gstOnFee,
      total_processing_fee: totalProcessingFee,
      final_vendor_payout: finalVendorRevenue,
      payment_status_applied: paymentStatus,
      is_payment_refunded: paymentStatus === 'refunded'
    },
    
    payment_refund_applied: paymentStatus === 'refunded',
    vendor_payout_zero_due_to_refund: paymentStatus === 'refunded',
    claims: claimsAnalysis.claims,
    returns: claimsAnalysis.returns,
    claim_items: claimsAnalysis.claimItems,
    return_items: claimsAnalysis.returnItems,
    
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
    claims_returns_analyzed: true,
    has_claims: claimsAnalysis.claims.length > 0,
    has_returns: claimsAnalysis.returns.length > 0,
    vendor_fulfillment_calculated: true,
    vendor_payment_calculated: true
  };
};

// ✅ MAIN GET HANDLER
// MINIMAL CHANGES TO YOUR EXISTING GET HANDLER
// Only add these lines - don't change anything else!

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log("🏪 INDEX: Fetching vendor orders with COMPLETE enhanced calculations...");
    
    // ✅ ADD THIS: Get limit and offset from query params
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || 0;
    console.log(`📊 Query params - Limit: ${limit}, Offset: ${offset}`);
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    // Get vendor information
    // ✅ CORRECT - Same as detail route
    const vendorAdmins = await marketplaceModuleService.listVendorAdmins({
      id: req.auth_context.actor_id
    });

    if (!vendorAdmins || vendorAdmins.length === 0) {
      //console.log(`❌ INDEX: No vendor admin found for user: ${req.auth_context.actor_id}`);
      return res.status(403).json({
        error: "Not authorized as vendor"
      });
    }

    const vendorId = vendorAdmins[0].vendor_id;
    //console.log(`✅ INDEX: Logged-in vendor ID: ${vendorId}`);
    //console.log(`🔍 INDEX: Processing orders for vendor: ${vendorId}`);

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
      //console.log("📭 No orders found for vendor");
      return res.json({
        orders: [],
        count: 0,
        vendor_id: vendorId
      });
    }

    //console.log(`📋 Found ${vendor.orders.length} linked orders for vendor`);
    
    // ✅ ADD THIS: Sort orders by date (newest first)
    const sortedOrders = [...vendor.orders].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    // ✅ ADD THIS: Slice orders based on limit/offset
    const ordersToProcess = limit 
      ? sortedOrders.slice(offset, offset + limit)
      : sortedOrders;
    
    const orderIdsToFetch = ordersToProcess.map(order => order.id);
    console.log(`📄 Will process ${orderIdsToFetch.length} orders (from total ${vendor.orders.length})`);

    // ✅ CHANGE THIS LINE ONLY: Use orderIdsToFetch instead of vendor.orders
    // Get detailed order information
    const { result: detailedOrders } = await getOrdersListWorkflow(req.scope).run({
      input: {
        fields: [
          "id",
          "display_id",
          "created_at",        // ✅ ADD THIS LINE
          "updated_at",        // ✅ ADD THIS LINE (optional but useful)
          "metadata",
          "total",
          "subtotal", 
          "shipping_total",
          "tax_total",
          "items.*",
          "items.tax_lines",
          "items.variant",
          "items.variant.product",
          "items.variant.metadata",
          "items.variant.product.metadata",
          "items.metadata",
          "items.product_id",
          "items.variant_id",
          "items.return_requested_total",
          "items.total",
          "shipping_methods",
          "shipping_methods.tax_total",
          "payment_collections",
          "payment_collections.payment_providers.*",
          "payment_collections.payments.*",
          "fulfillments",
          "fulfillments.items.*",
          "fulfillments.labels.*",
          "customer.*",
          "shipping_address.*",
          "billing_address.*",
          "payment_status",
        ],
        variables: {
          filters: {
            id: orderIdsToFetch, // ✅ CHANGED: Was vendor.orders.map((order) => order.id)
          },
        },
      },
    });

    //console.log(`📄 INDEX: Retrieved detailed data for ${detailedOrders.length} orders`);

    // ✅ EVERYTHING BELOW THIS LINE STAYS EXACTLY THE SAME
    // Enrich orders with complete payment collection data
    for (const order of detailedOrders) {
      if (order.payment_collections && order.payment_collections.length > 0) {
        const paymentCollectionIds = order.payment_collections.map(pc => pc.id);
        const detailedPaymentCollections = await fetchPaymentCollectionDetails(paymentCollectionIds, req.scope);
        
        if (detailedPaymentCollections.length > 0) {
          order.payment_collections = detailedPaymentCollections;
          console.log(`💳 Enriched payment collections for order ${order.id}:`, {
            payment_providers: detailedPaymentCollections[0]?.payment_providers,
            payments: detailedPaymentCollections[0]?.payments
          });
        }
      }
    }

    //console.log(`📄 INDEX: Retrieved detailed data for ${detailedOrders.length} orders`);

    // Calculate vendor payment status for each order
    const ordersWithVendorPaymentStatus = [];
    for (const order of detailedOrders) {
      const orderWithPaymentStatus = await calculateAndStoreVendorPaymentStatus(order);
      ordersWithVendorPaymentStatus.push(orderWithPaymentStatus);
    }

    // Filter each order for vendor with all enhancements
    const vendorFilteredOrders = [];

    for (const order of ordersWithVendorPaymentStatus) {
      //console.log(`🔄 INDEX: Processing order ${order.id}...`);
      
      const vendorOrderView = await filterOrderForVendor(order, vendorId, req.scope);
      
      if (vendorOrderView) {
        vendorFilteredOrders.push(vendorOrderView);
        //console.log(`✅ INDEX: Added order ${order.id} with ${vendorOrderView.vendor_items.length} items`);
      }
    }

    // Calculate aggregate statistics
    const nonRefundedOrders = vendorFilteredOrders.filter(order => order.payment_status !== 'refunded');
    const refundedOrders = vendorFilteredOrders.filter(order => order.payment_status === 'refunded');

    const totalVendorRevenue = nonRefundedOrders.reduce((sum, order) => sum + order.vendor_total, 0);
    const totalOrderValue = nonRefundedOrders.reduce((sum, order) => sum + order.vendor_subtotal, 0);

    const totalPlatformCommission = totalOrderValue - totalVendorRevenue;
    const averageRevenuePercentage = totalOrderValue > 0 ? (totalVendorRevenue / totalOrderValue * 100) : 0;
    
    const totalClaims = vendorFilteredOrders.reduce((sum, order) => sum + (order.claims?.length || 0), 0);
    const totalReturns = vendorFilteredOrders.reduce((sum, order) => sum + (order.returns?.length || 0), 0);
    const ordersWithClaims = vendorFilteredOrders.filter(order => order.has_claims).length;
    const ordersWithReturns = vendorFilteredOrders.filter(order => order.has_returns).length;

    const paymentStatusCounts = vendorFilteredOrders.reduce((counts, order) => {
      const status = order.payment_status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    const totalProcessingFees = vendorFilteredOrders.reduce((sum, order) => 
      sum + (order.vendor_payment_details?.total_processing_fee || 0), 0
    );

    //console.log(`✅ INDEX: Returning ${vendorFilteredOrders.length} vendor-filtered orders with COMPLETE enhancements`);

    // ✅ ADD THIS: Include pagination info in response
    res.json({
      orders: vendorFilteredOrders,
      count: vendor.orders.length,
      // count: vendorFilteredOrders.length,
      total_count: vendor.orders.length, // ✅ ADDED: Total available orders
      limit: limit, // ✅ ADDED
      offset: offset, // ✅ ADDED
      has_more: limit ? (offset + limit) < vendor.orders.length : false, // ✅ ADDED
      vendor_id: vendorId,
      total_linked_orders: vendor.orders.length,
      filtered_orders: vendorFilteredOrders.length,
      filtering_applied: true,
      revenue_calculation_applied: true,
      vendor_payment_calculated: true,
      claims_returns_analyzed: true,
      
      vendor_analytics: {
        total_vendor_revenue: totalVendorRevenue,
        total_order_value: totalOrderValue,
        total_platform_commission: totalPlatformCommission,
        total_processing_fees: totalProcessingFees,
        net_vendor_payout: totalVendorRevenue - totalProcessingFees,
        average_revenue_percentage: parseFloat(averageRevenuePercentage.toFixed(2)),
        currency_code: "INR",
        refunded_orders_count: refundedOrders.length,
        non_refunded_orders_count: nonRefundedOrders.length,
        total_refunded_amount: refundedOrders.reduce((sum, order) => sum + order.vendor_subtotal, 0)
      },
      
      payment_status_analytics: {
        payment_status_counts: paymentStatusCounts,
        vendor_specific_calculation: true,
        orders_with_vendor_payment_status: vendorFilteredOrders.filter(o => o.vendor_payment_calculated).length
      },
      
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
    //console.error("❌ INDEX: Error in vendor orders endpoint:", error);
    res.status(500).json({
      error: "Failed to fetch vendor orders",
      message: error.message
    });
  }
};
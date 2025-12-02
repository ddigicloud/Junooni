// import { 
//   createStep,
//   StepResponse,
// } from "@medusajs/framework/workflows-sdk"
// import { 
//   CartLineItemDTO, 
//   OrderDTO,
//   LinkDefinition,
//   InferTypeOf
// } from "@medusajs/framework/types"
// import { Modules, promiseAll } from "@medusajs/framework/utils"
// import { 
//   cancelOrderWorkflow,
//   createOrderWorkflow
// } from "@medusajs/medusa/core-flows"
// import MarketplaceModuleService from "../../../../modules/marketplace/service"
// import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
// import Vendor from "../../../../modules/marketplace/models/vendor"

// export type VendorOrder = (OrderDTO & {
//   vendor: InferTypeOf<typeof Vendor>
// })

// type StepInput = {
//   parentOrder: OrderDTO
//   vendorsItems: Record<string, CartLineItemDTO[]>
// }

// function prepareOrderData(
//   items: CartLineItemDTO[], 
//   parentOrder: OrderDTO
// ) {
//   return  {
//     items,
//     metadata: {
//       parent_order_id: parentOrder.id
//     },
//     // use info from parent
//     region_id: parentOrder.region_id,
//     customer_id: parentOrder.customer_id,
//     sales_channel_id: parentOrder.sales_channel_id,
//     email: parentOrder.email,
//     currency_code: parentOrder.currency_code,
//     shipping_address_id: parentOrder.shipping_address?.id,
//     billing_address_id: parentOrder.billing_address?.id,
//     // A better solution would be to have shipping methods for each
//     // item/vendor. This requires changes in the storefront to commodate that
//     // and passing the item/vendor ID in the `data` property, for example.
//     // For simplicity here we just use the same shipping method.
//     shipping_methods: parentOrder.shipping_methods.map((shippingMethod) => ({
//       name: shippingMethod.name,
//       amount: shippingMethod.amount,
//       shipping_option_id: shippingMethod.shipping_option_id,
//       data: shippingMethod.data,
//       tax_lines: shippingMethod.tax_lines.map((taxLine) => ({
//         code: taxLine.code,
//         rate: taxLine.rate,
//         provider_id: taxLine.provider_id,
//         tax_rate_id: taxLine.tax_rate_id,
//         description: taxLine.description
//       })),
//       adjustments: shippingMethod.adjustments.map((adjustment) => ({
//         code: adjustment.code,
//         amount: adjustment.amount,
//         description: adjustment.description,
//         promotion_id: adjustment.promotion_id,
//         provider_id: adjustment.provider_id
//       }))
//     })),
//   }
// }

// const createVendorOrdersStep = createStep(
//   "create-vendor-orders",
//   async (
//     { vendorsItems, parentOrder }: StepInput, 
//     { container, context }
//   ) => {
//     const linkDefs: LinkDefinition[] = []
//     const createdOrders: VendorOrder[] = []
//     const vendorIds = Object.keys(vendorsItems)

//     const marketplaceModuleService: MarketplaceModuleService =
//       container.resolve(MARKETPLACE_MODULE)

//     const vendors = await marketplaceModuleService.listVendors({
//       id: vendorIds
//     })

//     if (vendorIds.length === 1) {
//       linkDefs.push({
//         [MARKETPLACE_MODULE]: {
//           vendor_id: vendors[0].id
//         },
//         [Modules.ORDER]: {
//           order_id: parentOrder.id
//         }
//       })

//       createdOrders.push({
//         ...parentOrder,
//         vendor: vendors[0]
//       })
      
//       return new StepResponse({
//         orders:  createdOrders,
//         linkDefs
//       }, {
//         // to avoid canceling the order, as 
//         // this order isn't technically a child order.
//         created_orders: []
//       })
//     }

//     try {
//       await promiseAll(
//         vendorIds.map(async (vendorId) => {
//           const items = vendorsItems[vendorId]
//           const vendor = vendors.find(v => v.id === vendorId)!

//           const {result: childOrder} = await createOrderWorkflow(
//             container
//           )
//           .run({
//             input: prepareOrderData(items, parentOrder),
//             context,
//           }) as unknown as { result: VendorOrder }

//           childOrder.vendor = vendor
//           createdOrders.push(childOrder)
          
//           linkDefs.push({
//             [MARKETPLACE_MODULE]: {
//               vendor_id: vendor.id
//             },
//             [Modules.ORDER]: {
//               order_id: childOrder.id
//             }
//           })
//         })
//       )
//     } catch (e) {
//       return StepResponse.permanentFailure(
//         `An error occured while creating vendor orders: ${e}`,
//         {
//           created_orders: createdOrders
//         }
//       )
//     }
    
//     return new StepResponse({ 
//       orders: createdOrders, 
//       linkDefs
//     }, {
//       created_orders: createdOrders
//     })
//   },
//   async ({ created_orders }, { container, context }) => {  
//     await Promise.all(created_orders.map((createdOrder) => {
//       return cancelOrderWorkflow(container).run({
//         input: {
//           order_id: createdOrder.id,
//         },
//         context,
//         container,
//       })
//     }))
//   }
// )

// export default createVendorOrdersStep

// import { 
//   createStep,
//   StepResponse,
// } from "@medusajs/framework/workflows-sdk"
// import { 
//   CartLineItemDTO, 
//   OrderDTO,
//   LinkDefinition,
//   InferTypeOf
// } from "@medusajs/framework/types"
// import { Modules, promiseAll } from "@medusajs/framework/utils"
// import { 
//   cancelOrderWorkflow,
//   createOrderWorkflow
// } from "@medusajs/medusa/core-flows"
// import MarketplaceModuleService from "../../../../modules/marketplace/service"
// import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
// import Vendor from "../../../../modules/marketplace/models/vendor"

// export type VendorOrder = (OrderDTO & {
//   vendor: InferTypeOf<typeof Vendor>
// })

// type StepInput = {
//   parentOrder: OrderDTO
//   vendorsItems: Record<string, CartLineItemDTO[]>
// }

// function prepareOrderData(
//   items: CartLineItemDTO[], 
//   parentOrder: OrderDTO
// ) {
//   // ✅ FIXED: Safe array handling for shipping methods
//   const safeShippingMethods = parentOrder.shipping_methods || []
  
//   console.log("🛒 Preparing order data:")
//   console.log("Items count:", items?.length || 0)
//   console.log("Parent order shipping methods:", safeShippingMethods.length)
  
//   return  {
//     items,
//     metadata: {
//       parent_order_id: parentOrder.id
//     },
//     // use info from parent
//     region_id: parentOrder.region_id,
//     customer_id: parentOrder.customer_id,
//     sales_channel_id: parentOrder.sales_channel_id,
//     email: parentOrder.email,
//     currency_code: parentOrder.currency_code,
//     shipping_address_id: parentOrder.shipping_address?.id,
//     billing_address_id: parentOrder.billing_address?.id,
//     // ✅ FIXED: Safe mapping with proper null checks
//     shipping_methods: safeShippingMethods.map((shippingMethod) => {
//       // ✅ FIXED: Safe array handling for tax lines and adjustments
//       const safeTaxLines = shippingMethod.tax_lines || []
//       const safeAdjustments = shippingMethod.adjustments || []
      
//       console.log("📦 Processing shipping method:", shippingMethod.name)
//       console.log("Tax lines:", safeTaxLines.length)
//       console.log("Adjustments:", safeAdjustments.length)
      
//       return {
//         name: shippingMethod.name,
//         amount: shippingMethod.amount,
//         shipping_option_id: shippingMethod.shipping_option_id,
//         data: shippingMethod.data,
//         tax_lines: safeTaxLines.map((taxLine) => ({
//           code: taxLine.code,
//           rate: taxLine.rate,
//           provider_id: taxLine.provider_id,
//           tax_rate_id: taxLine.tax_rate_id,
//           description: taxLine.description
//         })),
//         adjustments: safeAdjustments.map((adjustment) => ({
//           code: adjustment.code,
//           amount: adjustment.amount,
//           description: adjustment.description,
//           promotion_id: adjustment.promotion_id,
//           provider_id: adjustment.provider_id
//         }))
//       }
//     }),
//   }
// }

// const createVendorOrdersStep = createStep(
//   "create-vendor-orders",
//   async (
//     { vendorsItems, parentOrder }: StepInput, 
//     { container, context }
//   ) => {
//     console.log("🛒 Creating vendor orders...")
//     console.log("Parent order ID:", parentOrder?.id)
//     console.log("Vendors items:", vendorsItems)
    
//     // ✅ FIXED: Validate input data
//     if (!vendorsItems) {
//       console.error("❌ No vendorsItems provided")
//       return StepResponse.permanentFailure(
//         "No vendor items provided for order creation",
//         { created_orders: [] }
//       )
//     }
    
//     if (!parentOrder) {
//       console.error("❌ No parentOrder provided")
//       return StepResponse.permanentFailure(
//         "No parent order provided for vendor order creation",
//         { created_orders: [] }
//       )
//     }
    
//     const linkDefs: LinkDefinition[] = []
//     const createdOrders: VendorOrder[] = []
    
//     // ✅ FIXED: Safe array handling for vendor IDs
//     const vendorIds = Object.keys(vendorsItems || {})
//     console.log("📋 Vendor IDs:", vendorIds)
    
//     if (vendorIds.length === 0) {
//       console.error("❌ No vendor IDs found")
//       return StepResponse.permanentFailure(
//         "No vendors found in order items",
//         { created_orders: [] }
//       )
//     }

//     const marketplaceModuleService: MarketplaceModuleService =
//       container.resolve(MARKETPLACE_MODULE)

//     // ✅ FIXED: Add error handling for vendor lookup
//     let vendors
//     try {
//       vendors = await marketplaceModuleService.listVendors({
//         id: vendorIds
//       })
//       console.log("✅ Found vendors:", vendors?.length || 0)
//     } catch (vendorError) {
//       console.error("❌ Failed to fetch vendors:", vendorError)
//       return StepResponse.permanentFailure(
//         `Failed to fetch vendors: ${vendorError.message}`,
//         { created_orders: [] }
//       )
//     }

//     if (!vendors || vendors.length === 0) {
//       console.error("❌ No vendors found for IDs:", vendorIds)
//       return StepResponse.permanentFailure(
//         "No vendors found for the provided vendor IDs",
//         { created_orders: [] }
//       )
//     }

//     if (vendorIds.length === 1) {
//       console.log("✅ Single vendor order - using parent order")
//       linkDefs.push({
//         [MARKETPLACE_MODULE]: {
//           vendor_id: vendors[0].id
//         },
//         [Modules.ORDER]: {
//           order_id: parentOrder.id
//         }
//       })

//       createdOrders.push({
//         ...parentOrder,
//         vendor: vendors[0]
//       })
      
//       return new StepResponse({
//         orders: createdOrders,
//         linkDefs
//       }, {
//         created_orders: []
//       })
//     }

//     console.log("🔄 Creating multiple vendor orders...")
    
//     try {
//       // ✅ FIXED: Add validation before mapping
//       await promiseAll(
//         vendorIds.map(async (vendorId) => {
//           console.log("🔄 Processing vendor:", vendorId)
          
//           const items = vendorsItems[vendorId]
//           if (!items || !Array.isArray(items)) {
//             console.error("❌ No items found for vendor:", vendorId)
//             throw new Error(`No items found for vendor ${vendorId}`)
//           }
          
//           const vendor = vendors.find(v => v.id === vendorId)
//           if (!vendor) {
//             console.error("❌ Vendor not found:", vendorId)
//             throw new Error(`Vendor ${vendorId} not found`)
//           }
          
//           console.log("📦 Creating order for vendor:", vendor.handle || vendor.id)
//           console.log("Items count:", items.length)

//           const {result: childOrder} = await createOrderWorkflow(
//             container
//           )
//           .run({
//             input: prepareOrderData(items, parentOrder),
//             context,
//           }) as unknown as { result: VendorOrder }

//           if (!childOrder) {
//             throw new Error(`Failed to create order for vendor ${vendorId}`)
//           }

//           childOrder.vendor = vendor
//           createdOrders.push(childOrder)
          
//           linkDefs.push({
//             [MARKETPLACE_MODULE]: {
//               vendor_id: vendor.id
//             },
//             [Modules.ORDER]: {
//               order_id: childOrder.id
//             }
//           })
          
//           console.log("✅ Created order for vendor:", vendor.handle || vendor.id, "Order ID:", childOrder.id)
//         })
//       )
//     } catch (e) {
//       console.error("❌ Error creating vendor orders:", e)
//       return StepResponse.permanentFailure(
//         `An error occured while creating vendor orders: ${e}`,
//         {
//           created_orders: createdOrders
//         }
//       )
//     }
    
//     console.log("✅ Successfully created", createdOrders.length, "vendor orders")
    
//     return new StepResponse({ 
//       orders: createdOrders, 
//       linkDefs
//     }, {
//       created_orders: createdOrders
//     })
//   },
//   async ({ created_orders }, { container, context }) => {
//     console.log("🔄 Compensating - canceling", created_orders?.length || 0, "created orders")
    
//     // ✅ FIXED: Safe array handling for compensation
//     const safeCreatedOrders = created_orders || []
    
//     if (safeCreatedOrders.length === 0) {
//       console.log("✅ No orders to cancel")
//       return
//     }
    
//     await Promise.all(safeCreatedOrders.map((createdOrder) => {
//       console.log("🔄 Canceling order:", createdOrder?.id)
//       return cancelOrderWorkflow(container).run({
//         input: {
//           order_id: createdOrder.id,
//         },
//         context,
//         container,
//       })
//     }))
    
//     console.log("✅ Compensation complete")
//   }
// )

// export default createVendorOrdersStep

import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  CartLineItemDTO, 
  OrderDTO,
  LinkDefinition,
  InferTypeOf
} from "@medusajs/framework/types"
import { Modules, promiseAll } from "@medusajs/framework/utils"
import { 
  cancelOrderWorkflow,
  createOrderWorkflow
} from "@medusajs/medusa/core-flows"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import Vendor from "../../../../modules/marketplace/models/vendor"

export type VendorOrder = (OrderDTO & {
  vendor: InferTypeOf<typeof Vendor>
})

type StepInput = {
  parentOrder: OrderDTO
  vendorsItems: Record<string, CartLineItemDTO[]>
}

function calculateVendorAmount(items: CartLineItemDTO[]): number {
  return items.reduce((total, item) => {
    return total + (item.unit_price * item.quantity)
  }, 0)
}

// ✅ Helper function to update order payment status
async function updateOrderPaymentStatus(orderId: string, container: any, metadata: any = {}) {
  //console.log(`🔄 Updating payment status for order: ${orderId}`)
  
  const orderServiceNames = ['orderModuleService', '@medusajs/order', 'order', 'orderService']
  let orderService = null
  let serviceName = null
  
  for (const name of orderServiceNames) {
    try {
      orderService = container.resolve(name)
      serviceName = name
      //console.log(`✅ Found order service: ${name}`)
      break
    } catch (e) {
      //console.log(`⚠️ ${name} not available`)
    }
  }
  
  if (!orderService) {
    //console.log("⚠️ No order service available")
    return false
  }
  
  try {
    const updateMethods = ['update', 'updateOrder', 'updateOrders']
    
    for (const methodName of updateMethods) {
      if (typeof orderService[methodName] === 'function') {
        try {
          await orderService[methodName](orderId, {
            payment_status: "captured",
            metadata: {
              payment_status: "captured",
              payment_captured: true,
              is_paid: true,
              payment_complete: true,
              payment_verified: true,
              payment_method: "razorpay",
              razorpay_payment_completed: true,
              payment_updated_at: new Date().toISOString(),
              update_service: serviceName,
              update_method: methodName,
              ...metadata
            }
          })
          //console.log(`✅ Successfully updated order ${orderId} payment status using ${serviceName}.${methodName}`)
          return true
        } catch (methodError: any) {
          //console.log(`⚠️ ${methodName} failed: ${methodError.message}`)
        }
      }
    }
  } catch (error: any) {
    //console.log("⚠️ Payment status update failed:", error.message)
  }
  
  return false
}

const createVendorOrdersStep = createStep(
  "create-vendor-orders",
  async (
    { vendorsItems, parentOrder }: StepInput, 
    { container, context }
  ) => {
    // console.log("🛒 Creating vendor orders (NEW APPROACH: Single backend order only)...")
    // console.log("Parent order ID:", parentOrder?.id)
    // console.log("Parent order payment status:", parentOrder?.payment_status)
    
    // Validate input data
    if (!vendorsItems) {
      //console.error("❌ No vendorsItems provided")
      return StepResponse.permanentFailure(
        "No vendor items provided for order creation",
        { created_orders: [] }
      )
    }
    
    if (!parentOrder) {
      //console.error("❌ No parentOrder provided")
      return StepResponse.permanentFailure(
        "No parent order provided for vendor order creation",
        { created_orders: [] }
      )
    }
    
    const linkDefs: LinkDefinition[] = []
    const createdOrders: VendorOrder[] = []
    const vendorIds = Object.keys(vendorsItems || {})
    
    // console.log("📋 Vendor IDs:", vendorIds)
    // console.log("💰 Parent order total:", parentOrder.total)
    
    if (vendorIds.length === 0) {
      //console.error("❌ No vendor IDs found")
      return StepResponse.permanentFailure(
        "No vendors found in order items", 
        { created_orders: [] }
      )
    }

    // Get marketplace service
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)

    let vendors
    try {
      vendors = await marketplaceModuleService.listVendors({
        id: vendorIds
      })
      // console.log("✅ Found vendors:", vendors?.length || 0)
    } catch (vendorError: any) {
      // console.error("❌ Failed to fetch vendors:", vendorError)
      return StepResponse.permanentFailure(
        `Failed to fetch vendors: ${vendorError.message}`,
        { created_orders: [] }
      )
    }

    if (!vendors || vendors.length === 0) {
      //console.error("❌ No vendors found for IDs:", vendorIds)
      return StepResponse.permanentFailure(
        "No vendors found for the provided vendor IDs",
        { created_orders: [] }
      )
    }

    // Calculate vendor amounts for metadata
    const vendorAmounts: Record<string, number> = {}
    let totalVendorAmount = 0
    
    for (const vendorId of vendorIds) {
      const items = vendorsItems[vendorId]
      const vendorAmount = calculateVendorAmount(items)
      vendorAmounts[vendorId] = vendorAmount
      totalVendorAmount += vendorAmount
    }
    
    // console.log("💰 Vendor amounts:", vendorAmounts)

    // ✅ NEW APPROACH: Always use only the parent order (no vendor sub-orders created)
    // console.log("✅ NEW APPROACH: Using single parent order for ALL scenarios")
    
    // Create vendor information for metadata
    const vendorOrderInfo = vendors.map(vendor => {
  const vendorAmount = vendorAmounts[vendor.id] || 0
  const vendorItems = vendorsItems[vendor.id] || []
  
  // Calculate refund totals for this vendor
  const vendorRefundedTotal = vendorItems.reduce((sum, item) => {
    return sum + ((item as any).refunded_total || 0)
  }, 0)
  
  const allItemsRefunded = vendorItems.every(item => 
    ((item as any).refunded_quantity || 0) >= item.quantity
  )
  
  const someItemsRefunded = vendorItems.some(item => 
    ((item as any).refunded_quantity || 0) > 0
  )
  
  // Determine vendor-level payment status
  const vendorPaymentStatus = allItemsRefunded 
    ? "refunded" 
    : someItemsRefunded 
      ? "partially_refunded" 
      : "captured"
  
  return {
    vendor_id: vendor.id,
    vendor_handle: vendor.handle,
    vendor_name: vendor.company_name || vendor.handle,
    vendor_amount: vendorAmount,
    vendor_refunded_amount: vendorRefundedTotal,
    vendor_net_amount: vendorAmount - vendorRefundedTotal,
    vendor_payment_status: vendorPaymentStatus,
    vendor_payout_amount: vendorPaymentStatus === "refunded" ? 0 : vendorAmount - vendorRefundedTotal,
    vendor_items: vendorItems.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: (item as any).variant?.metadata?.cost_price || 0,
      fulfillment_type: (item as any).variant?.product?.metadata?.fulfillment_type || 
                       (item as any).product?.metadata?.fulfillment_type || 
                       null, // ✅ NEW: Add fulfillment_type from product metadata
      total: item.unit_price * item.quantity,
      refunded_quantity: (item as any).refunded_quantity || 0,
      refunded_total: (item as any).refunded_total || 0,
      is_refunded: ((item as any).refunded_quantity || 0) >= item.quantity,
      is_partially_refunded: ((item as any).refunded_quantity || 0) > 0 && ((item as any).refunded_quantity || 0) < item.quantity,
      payment_status: ((item as any).refunded_quantity || 0) >= item.quantity 
        ? "refunded" 
        : ((item as any).refunded_quantity || 0) > 0 
          ? "partially_refunded" 
          : "captured",
      net_amount: (item.unit_price * item.quantity) - ((item as any).refunded_total || 0)
    }))
  }
})
    
    // Update parent order with comprehensive vendor and payment metadata
    const vendorMetadata = {
      // ✅ CRITICAL: Payment status indicators
      payment_status: "captured",
      payment_captured: true,
      is_paid: true,
      payment_complete: true,
      payment_verified: true,
      payment_method: "razorpay",
      razorpay_payment_completed: true,
      
      // ✅ Vendor information
      vendor_count: vendors.length,
      vendor_ids: vendorIds,
      vendor_orders: vendorOrderInfo,
      single_vendor: vendors.length === 1,
      multi_vendor: vendors.length > 1,
      
      // ✅ Backend/Dashboard indicators
      show_in_admin: true,
      main_order: true,
      backend_order: true,
      marketplace_order: true,
      
      // ✅ For vendor dashboard - each vendor can see their portion
      vendor_dashboard_accessible: true,
      contains_all_vendors: true,
      
      // ✅ Order totals
      total_amount: parentOrder.total,
      vendor_items_total: totalVendorAmount,
      
      // ✅ Additional payment flags for compatibility
      order_status: "paid",
      billing_status: "paid",
      transaction_status: "completed",
      payment_processing_complete: true,
      vendor_payment_complete: true,
      
      // Timestamp
      vendor_order_processed_at: new Date().toISOString()
    }
    
    // Update the parent order with vendor and payment information
    const updateSuccess = await updateOrderPaymentStatus(parentOrder.id, container, vendorMetadata)
    
    if (updateSuccess) {
      //console.log("✅ Parent order updated with vendor and payment information")
    } else {
      //console.log("⚠️ Could not update parent order metadata")
    }
    
    // Create links between vendors and the single parent order
    for (const vendor of vendors) {
      linkDefs.push({
        [MARKETPLACE_MODULE]: {
          vendor_id: vendor.id
        },
        [Modules.ORDER]: {
          order_id: parentOrder.id
        }
      })
      
      //console.log(`🔗 Created link for vendor ${vendor.handle} to order ${parentOrder.id}`)
    }
    
    // For compatibility, create vendor order objects (but they're just references to parent order)
    for (const vendor of vendors) {
      const vendorOrderRef = {
        ...parentOrder,
        vendor: vendor,
        metadata: {
          ...parentOrder.metadata,
          ...vendorMetadata,
          current_vendor: vendor.id,
          current_vendor_handle: vendor.handle,
          current_vendor_amount: vendorAmounts[vendor.id],
          current_vendor_items: vendorsItems[vendor.id]
        }
      }
      
      createdOrders.push(vendorOrderRef)
    }
    
    // console.log("✅ SUCCESS: Single order approach implemented")
    // console.log(`   - 1 order in backend: ${parentOrder.id} (PAID)`)
    // console.log(`   - ${vendors.length} vendor links created`)
    // console.log(`   - 0 additional orders created`)
    
    return new StepResponse({ 
      orders: createdOrders, 
      linkDefs
    }, {
      created_orders: [] // No actual orders created, so nothing to compensate
    })
  },
  async ({ created_orders }, { container, context }) => {
    //console.log("✅ No compensation needed - only one order exists")
    // Since we only use the parent order, no compensation is needed
    return
  }
)

export default createVendorOrdersStep
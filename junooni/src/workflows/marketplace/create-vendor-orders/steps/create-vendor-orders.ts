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

// function calculateVendorAmount(items: CartLineItemDTO[]): number {
//   return items.reduce((total, item) => {
//     return total + (item.unit_price * item.quantity)
//   }, 0)
// }

// // function detectPaymentMethod(parentOrder: OrderDTO): string {
// //   const hasCodFee = (parentOrder.items || []).some(
// //     (item: any) => item?.metadata?.is_cod_fee === true
// //   )
// //   return hasCodFee ? "cod" : "razorpay"
// // }

// function detectPaymentMethod(parentOrder: OrderDTO): string {
//   // Check 1: COD fee line item in order items
//   const hasCodFeeItem = (parentOrder.items || []).some(
//     (item: any) => item?.metadata?.is_cod_fee === true
//   )
//   if (hasCodFeeItem) return "cod"

//   // Check 2: Payment provider is pp_system_default (COD uses this)
//   const paymentCollections = (parentOrder as any).payment_collections || []
//   for (const collection of paymentCollections) {
//     const payments = collection.payments || []
//     for (const payment of payments) {
//       if (payment.provider_id === "pp_system_default") return "cod"
//     }
//     const sessions = collection.payment_sessions || []
//     for (const session of sessions) {
//       if (session.provider_id === "pp_system_default") return "cod"
//     }
//   }

//   // Check 3: Top-level payments array (some Medusa versions expose this)
//   const topLevelPayments = (parentOrder as any).payments || []
//   for (const payment of topLevelPayments) {
//     if (payment.provider_id === "pp_system_default") return "cod"
//   }

//   return "razorpay"
// }

// // ✅ Helper function to update order payment status
// async function updateOrderPaymentStatus(orderId: string, container: any, metadata: any = {}, paymentMethod: string = "razorpay") {
//   //console.log(`🔄 Updating payment status for order: ${orderId}`)
  
//   const orderServiceNames = ['orderModuleService', '@medusajs/order', 'order', 'orderService']
//   let orderService = null
//   let serviceName = null
  
//   for (const name of orderServiceNames) {
//     try {
//       orderService = container.resolve(name)
//       serviceName = name
//       //console.log(`✅ Found order service: ${name}`)
//       break
//     } catch (e) {
//       //console.log(`⚠️ ${name} not available`)
//     }
//   }
  
//   if (!orderService) {
//     //console.log("⚠️ No order service available")
//     return false
//   }
  
//   try {
//     const updateMethods = ['update', 'updateOrder', 'updateOrders']
    
//     for (const methodName of updateMethods) {
//       if (typeof orderService[methodName] === 'function') {
//         try {
//           await orderService[methodName](orderId, {
//             payment_status: "captured",
//             metadata: {
//               payment_status: "captured",
//               payment_captured: true,
//               is_paid: true,
//               payment_complete: true,
//               payment_verified: true,
//               payment_method: paymentMethod,
//               razorpay_payment_completed: paymentMethod === "razorpay",
//               payment_updated_at: new Date().toISOString(),
//               update_service: serviceName,
//               update_method: methodName,
//               ...metadata
//             }
//           })
//           //console.log(`✅ Successfully updated order ${orderId} payment status using ${serviceName}.${methodName}`)
//           return true
//         } catch (methodError: any) {
//           //console.log(`⚠️ ${methodName} failed: ${methodError.message}`)
//         }
//       }
//     }
//   } catch (error: any) {
//     //console.log("⚠️ Payment status update failed:", error.message)
//   }
  
//   return false
// }

// const createVendorOrdersStep = createStep(
//   "create-vendor-orders",
//   async (
//     { vendorsItems, parentOrder }: StepInput, 
//     { container, context }
//   ) => {
//     // console.log("🛒 Creating vendor orders (NEW APPROACH: Single backend order only)...")
//     // console.log("Parent order ID:", parentOrder?.id)
//     // console.log("Parent order payment status:", parentOrder?.payment_status)
    
//     // Validate input data
//     if (!vendorsItems) {
//       //console.error("❌ No vendorsItems provided")
//       return StepResponse.permanentFailure(
//         "No vendor items provided for order creation",
//         { created_orders: [] }
//       )
//     }
    
//     if (!parentOrder) {
//       //console.error("❌ No parentOrder provided")
//       return StepResponse.permanentFailure(
//         "No parent order provided for vendor order creation",
//         { created_orders: [] }
//       )
//     }
    
//     const linkDefs: LinkDefinition[] = []
//     const createdOrders: VendorOrder[] = []
//     const vendorIds = Object.keys(vendorsItems || {})
    
//     // console.log("📋 Vendor IDs:", vendorIds)
//     // console.log("💰 Parent order total:", parentOrder.total)
    
//     if (vendorIds.length === 0) {
//       //console.error("❌ No vendor IDs found")
//       return StepResponse.permanentFailure(
//         "No vendors found in order items", 
//         { created_orders: [] }
//       )
//     }

//     // Get marketplace service
//     const marketplaceModuleService: MarketplaceModuleService =
//       container.resolve(MARKETPLACE_MODULE)

//     let vendors
//     try {
//       vendors = await marketplaceModuleService.listVendors({
//         id: vendorIds
//       })
//       // console.log("✅ Found vendors:", vendors?.length || 0)
//     } catch (vendorError: any) {
//       // console.error("❌ Failed to fetch vendors:", vendorError)
//       return StepResponse.permanentFailure(
//         `Failed to fetch vendors: ${vendorError.message}`,
//         { created_orders: [] }
//       )
//     }

//     if (!vendors || vendors.length === 0) {
//       //console.error("❌ No vendors found for IDs:", vendorIds)
//       return StepResponse.permanentFailure(
//         "No vendors found for the provided vendor IDs",
//         { created_orders: [] }
//       )
//     }

//     // Calculate vendor amounts for metadata
//     const vendorAmounts: Record<string, number> = {}
//     let totalVendorAmount = 0
    
//     for (const vendorId of vendorIds) {
//       const items = vendorsItems[vendorId]
//       const vendorAmount = calculateVendorAmount(items)
//       vendorAmounts[vendorId] = vendorAmount
//       totalVendorAmount += vendorAmount
//     }
    
//     // console.log("💰 Vendor amounts:", vendorAmounts)

//     // ✅ NEW APPROACH: Always use only the parent order (no vendor sub-orders created)
//     // console.log("✅ NEW APPROACH: Using single parent order for ALL scenarios")
    
//     // Create vendor information for metadata
//     const vendorOrderInfo = vendors.map(vendor => {
//   const vendorAmount = vendorAmounts[vendor.id] || 0
//   const vendorItems = vendorsItems[vendor.id] || []
  
//   // Calculate refund totals for this vendor
//   const vendorRefundedTotal = vendorItems.reduce((sum, item) => {
//     return sum + ((item as any).refunded_total || 0)
//   }, 0)
  
//   const allItemsRefunded = vendorItems.every(item => 
//     ((item as any).refunded_quantity || 0) >= item.quantity
//   )
  
//   const someItemsRefunded = vendorItems.some(item => 
//     ((item as any).refunded_quantity || 0) > 0
//   )
  
//   // Determine vendor-level payment status
//   const vendorPaymentStatus = allItemsRefunded 
//     ? "refunded" 
//     : someItemsRefunded 
//       ? "partially_refunded" 
//       : "captured"
  
//   return {
//     vendor_id: vendor.id,
//     vendor_handle: vendor.handle,
//     vendor_name: vendor.company_name || vendor.handle,
//     vendor_amount: vendorAmount,
//     vendor_refunded_amount: vendorRefundedTotal,
//     vendor_net_amount: vendorAmount - vendorRefundedTotal,
//     vendor_payment_status: vendorPaymentStatus,
//     vendor_payout_amount: vendorPaymentStatus === "refunded" ? 0 : vendorAmount - vendorRefundedTotal,
//     vendor_items: vendorItems.map(item => ({
//       id: item.id,
//       title: item.title,
//       quantity: item.quantity,
//       unit_price: item.unit_price,
//       cost_price: (item as any).variant?.metadata?.cost_price || 0,
//       fulfillment_type: (item as any).variant?.product?.metadata?.fulfillment_type || 
//                        (item as any).product?.metadata?.fulfillment_type || 
//                        null, // ✅ NEW: Add fulfillment_type from product metadata
//       total: item.unit_price * item.quantity,
//       refunded_quantity: (item as any).refunded_quantity || 0,
//       refunded_total: (item as any).refunded_total || 0,
//       is_refunded: ((item as any).refunded_quantity || 0) >= item.quantity,
//       is_partially_refunded: ((item as any).refunded_quantity || 0) > 0 && ((item as any).refunded_quantity || 0) < item.quantity,
//       payment_status: ((item as any).refunded_quantity || 0) >= item.quantity 
//         ? "refunded" 
//         : ((item as any).refunded_quantity || 0) > 0 
//           ? "partially_refunded" 
//           : "captured",
//       net_amount: (item.unit_price * item.quantity) - ((item as any).refunded_total || 0)
//     }))
//   }
// })
    
//     // Update parent order with comprehensive vendor and payment metadata
//     const detectedPaymentMethod = detectPaymentMethod(parentOrder)

//     const vendorMetadata = {
//       // ✅ CRITICAL: Payment status indicators
//       payment_status: "captured",
//       payment_captured: true,
//       is_paid: true,
//       payment_complete: true,
//       payment_verified: true,
//       payment_method: detectedPaymentMethod,
//       razorpay_payment_completed: detectedPaymentMethod === "razorpay",
      
//       // ✅ Vendor information
//       vendor_count: vendors.length,
//       vendor_ids: vendorIds,
//       vendor_orders: vendorOrderInfo,
//       single_vendor: vendors.length === 1,
//       multi_vendor: vendors.length > 1,
      
//       // ✅ Backend/Dashboard indicators
//       show_in_admin: true,
//       main_order: true,
//       backend_order: true,
//       marketplace_order: true,
      
//       // ✅ For vendor dashboard - each vendor can see their portion
//       vendor_dashboard_accessible: true,
//       contains_all_vendors: true,
      
//       // ✅ Order totals
//       total_amount: parentOrder.total,
//       vendor_items_total: totalVendorAmount,
      
//       // ✅ Additional payment flags for compatibility
//       order_status: "paid",
//       billing_status: "paid",
//       transaction_status: "completed",
//       payment_processing_complete: true,
//       vendor_payment_complete: true,
      
//       // Timestamp
//       vendor_order_processed_at: new Date().toISOString()
//     }
    
//     // Update the parent order with vendor and payment information
//     const updateSuccess = await updateOrderPaymentStatus(parentOrder.id, container, vendorMetadata, detectedPaymentMethod)
    
//     if (updateSuccess) {
//       //console.log("✅ Parent order updated with vendor and payment information")
//     } else {
//       //console.log("⚠️ Could not update parent order metadata")
//     }
    
//     // Create links between vendors and the single parent order
//     for (const vendor of vendors) {
//       linkDefs.push({
//         [MARKETPLACE_MODULE]: {
//           vendor_id: vendor.id
//         },
//         [Modules.ORDER]: {
//           order_id: parentOrder.id
//         }
//       })
      
//       //console.log(`🔗 Created link for vendor ${vendor.handle} to order ${parentOrder.id}`)
//     }
    
//     // For compatibility, create vendor order objects (but they're just references to parent order)
//     for (const vendor of vendors) {
//       const vendorOrderRef = {
//         ...parentOrder,
//         vendor: vendor,
//         metadata: {
//           ...parentOrder.metadata,
//           ...vendorMetadata,
//           current_vendor: vendor.id,
//           current_vendor_handle: vendor.handle,
//           current_vendor_amount: vendorAmounts[vendor.id],
//           current_vendor_items: vendorsItems[vendor.id]
//         }
//       }
      
//       createdOrders.push(vendorOrderRef)
//     }
    
//     // console.log("✅ SUCCESS: Single order approach implemented")
//     // console.log(`   - 1 order in backend: ${parentOrder.id} (PAID)`)
//     // console.log(`   - ${vendors.length} vendor links created`)
//     // console.log(`   - 0 additional orders created`)
    
//     return new StepResponse({ 
//       orders: createdOrders, 
//       linkDefs
//     }, {
//       created_orders: [] // No actual orders created, so nothing to compensate
//     })
//   },
//   async ({ created_orders }, { container, context }) => {
//     //console.log("✅ No compensation needed - only one order exists")
//     // Since we only use the parent order, no compensation is needed
//     return
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
    return total + (Number(item.unit_price) * Number(item.quantity))
  }, 0)
}

function detectPaymentMethod(order: any): string {
  console.log("🔍 [detectPaymentMethod] Starting detection...")
  console.log("🔍 [detectPaymentMethod] order keys:", Object.keys(order))

  // ── CHECK 1: payment_collections → payments / payment_sessions ──────────
  const paymentCollections = order.payment_collections || []
  console.log(`🔍 [detectPaymentMethod] Check 1 — payment_collections count: ${paymentCollections.length}`)

  for (const collection of paymentCollections) {
    console.log(`   Collection ID: ${collection.id} | status: ${collection.status}`)

    const payments = collection.payments || []
    console.log(`   payments count: ${payments.length}`)
    for (const payment of payments) {
      console.log(`   💳 payment.provider_id: "${payment.provider_id}"`)
      if (payment.provider_id === "pp_system_default") {
        console.log("✅ [detectPaymentMethod] Detected COD via payment provider pp_system_default")
        return "cod"
      }
      if (payment.provider_id?.includes("razorpay")) {
        console.log("✅ [detectPaymentMethod] Detected RAZORPAY via payment provider")
        return "razorpay"
      }
    }

    const sessions = collection.payment_sessions || []
    console.log(`   payment_sessions count: ${sessions.length}`)
    for (const session of sessions) {
      console.log(`   💳 session.provider_id: "${session.provider_id}"`)
      if (session.provider_id === "pp_system_default") {
        console.log("✅ [detectPaymentMethod] Detected COD via session provider pp_system_default")
        return "cod"
      }
      if (session.provider_id?.includes("razorpay")) {
        console.log("✅ [detectPaymentMethod] Detected RAZORPAY via session provider")
        return "razorpay"
      }
    }
  }

  // ── CHECK 2: top-level payments array ────────────────────────────────────
  const topLevelPayments = order.payments || []
  console.log(`🔍 [detectPaymentMethod] Check 2 — top-level payments count: ${topLevelPayments.length}`)
  for (const payment of topLevelPayments) {
    console.log(`   💳 top-level payment.provider_id: "${payment.provider_id}"`)
    if (payment.provider_id === "pp_system_default") {
      console.log("✅ [detectPaymentMethod] Detected COD via top-level payment pp_system_default")
      return "cod"
    }
    if (payment.provider_id?.includes("razorpay")) {
      console.log("✅ [detectPaymentMethod] Detected RAZORPAY via top-level payment")
      return "razorpay"
    }
  }

  // ── CHECK 3: COD fee line item ────────────────────────────────────────────
  const items = order.items || []
  console.log(`🔍 [detectPaymentMethod] Check 3 — order items count: ${items.length}`)
  for (const item of items) {
    console.log(`   Item title: "${item.title}" | metadata: ${JSON.stringify(item.metadata)}`)
  }
  const hasCodFeeItem = items.some((item: any) => item?.metadata?.is_cod_fee === true)
  console.log(`🔍 [detectPaymentMethod] Check 3 — hasCodFeeItem: ${hasCodFeeItem}`)
  if (hasCodFeeItem) {
    console.log("✅ [detectPaymentMethod] Detected COD via is_cod_fee line item")
    return "cod"
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  console.log("⚠️ [detectPaymentMethod] No COD signals found — defaulting to razorpay")
  return "razorpay"
}

async function fetchEnrichedOrder(orderId: string, container: any): Promise<any | null> {
  console.log(`🔄 [fetchEnrichedOrder] Fetching order ${orderId} with full relations...`)

  // ── APPROACH 1: Use Medusa v2 query (remoteQuery) ─────────────────────
  // This is the correct way to load cross-module relations in Medusa v2
  try {
    const query = container.resolve("query")
    console.log("✅ [fetchEnrichedOrder] Resolved query service")

    const { data: orders } = await query.graph({
      entity: "order",
      filters: { id: orderId },
      fields: [
        "id",
        "status",
        "payment_status",
        "total",
        "currency_code",
        "metadata",
        "items.*",
        "items.metadata",
        "payment_collections.*",
        "payment_collections.payments.*",
        "payment_collections.payment_sessions.*",
      ],
    })

    const order = orders?.[0]
    if (order) {
      console.log(`✅ [fetchEnrichedOrder] Retrieved via query.graph()`)
      console.log(`   items count: ${order.items?.length ?? "n/a"}`)
      console.log(`   payment_collections count: ${order.payment_collections?.length ?? "n/a"}`)
      console.log(`   payment_collections[0].payments count: ${order.payment_collections?.[0]?.payments?.length ?? "n/a"}`)
      console.log(`   payment_collections[0].payment_sessions count: ${order.payment_collections?.[0]?.payment_sessions?.length ?? "n/a"}`)

      // Log provider IDs for debugging
      for (const col of (order.payment_collections || [])) {
        for (const p of (col.payments || [])) {
          console.log(`   💳 payment provider_id: "${p.provider_id}"`)
        }
        for (const s of (col.payment_sessions || [])) {
          console.log(`   💳 session provider_id: "${s.provider_id}"`)
        }
      }

      return order
    }
  } catch (e: any) {
    console.log(`⚠️ [fetchEnrichedOrder] query.graph() failed: ${e.message}`)
  }

  // ── APPROACH 2: remoteQuery directly ──────────────────────────────────
  try {
    const remoteQuery = container.resolve("remoteQuery")
    console.log("✅ [fetchEnrichedOrder] Resolved remoteQuery service")

    const orders = await remoteQuery({
      order: {
        __args: { filters: { id: orderId } },
        fields: [
          "id", "status", "payment_status", "total",
          "currency_code", "metadata",
        ],
        items: { fields: ["id", "title", "metadata", "unit_price", "quantity"] },
        payment_collections: {
          fields: ["id", "status", "amount"],
          payments: { fields: ["id", "provider_id", "amount"] },
          payment_sessions: { fields: ["id", "provider_id", "amount"] },
        },
      },
    })

    const order = Array.isArray(orders) ? orders[0] : orders
    if (order) {
      console.log(`✅ [fetchEnrichedOrder] Retrieved via remoteQuery()`)
      console.log(`   items count: ${order.items?.length ?? "n/a"}`)
      console.log(`   payment_collections[0].payments count: ${order.payment_collections?.[0]?.payments?.length ?? "n/a"}`)
      return order
    }
  } catch (e: any) {
    console.log(`⚠️ [fetchEnrichedOrder] remoteQuery() failed: ${e.message}`)
  }

  // ── APPROACH 3: order service list() with relations ───────────────────
  try {
    const orderService = container.resolve("order")
    console.log("✅ [fetchEnrichedOrder] Resolved order service for list()")

    if (typeof orderService.list === 'function') {
      const orders = await orderService.list(
        { id: [orderId] },
        {
          relations: [
            "payment_collections",
            "payment_collections.payments",
            "payment_collections.payment_sessions",
            "items",
          ],
        }
      )
      const order = orders?.[0]
      if (order) {
        console.log(`✅ [fetchEnrichedOrder] Retrieved via order.list()`)
        console.log(`   items count: ${order.items?.length ?? "n/a"}`)
        console.log(`   payment_collections[0].payments count: ${order.payment_collections?.[0]?.payments?.length ?? "n/a"}`)
        return order
      }
    }
  } catch (e: any) {
    console.log(`⚠️ [fetchEnrichedOrder] order.list() failed: ${e.message}`)
  }

  console.log("❌ [fetchEnrichedOrder] All fetch approaches failed")
  return null
}

async function updateOrderPaymentStatus(
  orderId: string,
  container: any,
  metadata: any = {},
  paymentMethod: string = "razorpay"
) {
  console.log(`🔄 [updateOrderPaymentStatus] Updating order: ${orderId} | paymentMethod: ${paymentMethod}`)

  const orderServiceNames = ['orderModuleService', '@medusajs/order', 'order', 'orderService']
  let orderService: any = null
  let serviceName: string | null = null

  for (const name of orderServiceNames) {
    try {
      orderService = container.resolve(name)
      serviceName = name
      console.log(`✅ [updateOrderPaymentStatus] Resolved service: ${name}`)
      break
    } catch (e) {
      console.log(`⚠️ [updateOrderPaymentStatus] ${name} not available`)
    }
  }

  if (!orderService) {
    console.log("❌ [updateOrderPaymentStatus] No order service found — cannot update")
    return false
  }

  const updatePayload = {
    payment_status: "captured",
    metadata: {
      payment_status: "captured",
      payment_captured: true,
      is_paid: true,
      payment_complete: true,
      payment_verified: true,
      payment_method: paymentMethod,
      razorpay_payment_completed: paymentMethod === "razorpay",
      cod_order: paymentMethod === "cod",
      payment_updated_at: new Date().toISOString(),
      update_service: serviceName,
      ...metadata,
    },
  }

  console.log(`📝 [updateOrderPaymentStatus] Payload preview:`)
  console.log(`   payment_method: "${updatePayload.metadata.payment_method}"`)
  console.log(`   cod_order: ${updatePayload.metadata.cod_order}`)
  console.log(`   razorpay_payment_completed: ${updatePayload.metadata.razorpay_payment_completed}`)

  const updateMethods = ['update', 'updateOrder', 'updateOrders']
  for (const methodName of updateMethods) {
    if (typeof orderService[methodName] === 'function') {
      try {
        console.log(`🔄 [updateOrderPaymentStatus] Trying ${serviceName}.${methodName}()`)
        await orderService[methodName](orderId, updatePayload)
        console.log(`✅ [updateOrderPaymentStatus] Success with ${serviceName}.${methodName}()`)
        return true
      } catch (methodError: any) {
        console.log(`⚠️ [updateOrderPaymentStatus] ${methodName} failed: ${methodError.message}`)
      }
    }
  }

  console.log("❌ [updateOrderPaymentStatus] All update methods failed")
  return false
}

const createVendorOrdersStep = createStep(
  "create-vendor-orders",
  async (
    { vendorsItems, parentOrder }: StepInput,
    { container, context }
  ) => {
    console.log("╔══════════════════════════════════════════════════════════╗")
    console.log("║  create-vendor-orders STEP START")
    console.log(`║  parentOrder.id: ${parentOrder?.id}`)
    console.log(`║  parentOrder.payment_status: ${(parentOrder as any)?.payment_status}`)
    console.log(`║  parentOrder.items count: ${parentOrder?.items?.length ?? "undefined"}`)
    console.log(`║  parentOrder.payment_collections count: ${(parentOrder as any)?.payment_collections?.length ?? "undefined"}`)
    console.log(`║  parentOrder.payments count: ${(parentOrder as any)?.payments?.length ?? "undefined"}`)
    console.log("╚══════════════════════════════════════════════════════════╝")

    // ── VALIDATE INPUT ────────────────────────────────────────────────────
    if (!vendorsItems) {
      console.error("❌ No vendorsItems provided")
      return StepResponse.permanentFailure(
        "No vendor items provided for order creation",
        { created_orders: [] }
      )
    }

    if (!parentOrder) {
      console.error("❌ No parentOrder provided")
      return StepResponse.permanentFailure(
        "No parent order provided for vendor order creation",
        { created_orders: [] }
      )
    }

    const vendorIds = Object.keys(vendorsItems || {})
    console.log("📋 [createVendorOrdersStep] vendorIds:", vendorIds)

    if (vendorIds.length === 0) {
      console.error("❌ No vendor IDs found in vendorsItems")
      return StepResponse.permanentFailure(
        "No vendors found in order items",
        { created_orders: [] }
      )
    }

    // ── RE-FETCH ORDER WITH FULL RELATIONS ────────────────────────────────
    // The parentOrder passed in by the workflow has payment_collections but
    // WITHOUT nested payments/payment_sessions — so we must re-fetch to get
    // provider_id fields needed for COD detection.
    console.log("🔄 [createVendorOrdersStep] Re-fetching order with full relations...")
    const enrichedOrder = await fetchEnrichedOrder(parentOrder.id, container)

    if (enrichedOrder) {
      console.log("✅ [createVendorOrdersStep] Using enrichedOrder for payment detection")
    } else {
      console.log("⚠️ [createVendorOrdersStep] enrichedOrder fetch failed — falling back to parentOrder (detection may be wrong)")
    }

    const orderForDetection = enrichedOrder ?? parentOrder

    // Log items from enriched order
    const enrichedItems = (orderForDetection as any).items || []
    console.log(`📦 [createVendorOrdersStep] items on orderForDetection (${enrichedItems.length}):`)
    for (const item of enrichedItems) {
      console.log(`   - "${item.title}" | metadata: ${JSON.stringify(item.metadata)}`)
    }

    // ── FETCH VENDORS ─────────────────────────────────────────────────────
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)

    let vendors
    try {
      vendors = await marketplaceModuleService.listVendors({ id: vendorIds })
      console.log(`✅ [createVendorOrdersStep] Found ${vendors?.length ?? 0} vendors`)
    } catch (vendorError: any) {
      console.error("❌ [createVendorOrdersStep] Failed to fetch vendors:", vendorError.message)
      return StepResponse.permanentFailure(
        `Failed to fetch vendors: ${vendorError.message}`,
        { created_orders: [] }
      )
    }

    if (!vendors || vendors.length === 0) {
      console.error("❌ [createVendorOrdersStep] No vendors found for IDs:", vendorIds)
      return StepResponse.permanentFailure(
        "No vendors found for the provided vendor IDs",
        { created_orders: [] }
      )
    }

    // ── CALCULATE VENDOR AMOUNTS ──────────────────────────────────────────
    const vendorAmounts: Record<string, number> = {}
    let totalVendorAmount = 0
    for (const vendorId of vendorIds) {
      const items = vendorsItems[vendorId]
      const vendorAmount = calculateVendorAmount(items)
      vendorAmounts[vendorId] = vendorAmount
      totalVendorAmount += vendorAmount
      console.log(`💰 [createVendorOrdersStep] Vendor ${vendorId} amount: ₹${vendorAmount}`)
    }

    // ── BUILD VENDOR ORDER INFO ───────────────────────────────────────────
    const vendorOrderInfo = vendors.map(vendor => {
      const vendorAmount = vendorAmounts[vendor.id] || 0
      const vendorItems = vendorsItems[vendor.id] || []

      const vendorRefundedTotal = vendorItems.reduce((sum, item) => {
        return sum + ((item as any).refunded_total || 0)
      }, 0)

      const allItemsRefunded = vendorItems.every(item =>
        ((item as any).refunded_quantity || 0) >= item.quantity
      )
      const someItemsRefunded = vendorItems.some(item =>
        ((item as any).refunded_quantity || 0) > 0
      )

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
          fulfillment_type:
            (item as any).variant?.product?.metadata?.fulfillment_type ||
            (item as any).product?.metadata?.fulfillment_type ||
            null,
          total: Number(item.unit_price) * Number(item.quantity),
          refunded_quantity: (item as any).refunded_quantity || 0,
          refunded_total: (item as any).refunded_total || 0,
          is_refunded: ((item as any).refunded_quantity || 0) >= item.quantity,
          is_partially_refunded:
            ((item as any).refunded_quantity || 0) > 0 &&
            ((item as any).refunded_quantity || 0) < item.quantity,
          payment_status:
            ((item as any).refunded_quantity || 0) >= item.quantity
              ? "refunded"
              : ((item as any).refunded_quantity || 0) > 0
              ? "partially_refunded"
              : "captured",
          net_amount:
            Number(item.unit_price) * Number(item.quantity) - ((item as any).refunded_total || 0),
        })),
      }
    })

    // ── DETECT PAYMENT METHOD ─────────────────────────────────────────────
    const detectedPaymentMethod = detectPaymentMethod(orderForDetection)
    console.log(`✅ [createVendorOrdersStep] FINAL detectedPaymentMethod: "${detectedPaymentMethod}"`)

    // ── BUILD METADATA ────────────────────────────────────────────────────
    const vendorMetadata = {
      payment_status: "captured",
      payment_captured: true,
      is_paid: true,
      payment_complete: true,
      payment_verified: true,
      payment_method: detectedPaymentMethod,
      razorpay_payment_completed: detectedPaymentMethod === "razorpay",
      cod_order: detectedPaymentMethod === "cod",

      vendor_count: vendors.length,
      vendor_ids: vendorIds,
      vendor_orders: vendorOrderInfo,
      single_vendor: vendors.length === 1,
      multi_vendor: vendors.length > 1,

      show_in_admin: true,
      main_order: true,
      backend_order: true,
      marketplace_order: true,

      vendor_dashboard_accessible: true,
      contains_all_vendors: true,

      total_amount: parentOrder.total,
      vendor_items_total: totalVendorAmount,

      order_status: "paid",
      billing_status: "paid",
      transaction_status: "completed",
      payment_processing_complete: true,
      vendor_payment_complete: true,

      vendor_order_processed_at: new Date().toISOString(),
    }

    console.log(`📝 [createVendorOrdersStep] vendorMetadata.payment_method: "${vendorMetadata.payment_method}"`)
    console.log(`📝 [createVendorOrdersStep] vendorMetadata.cod_order: ${vendorMetadata.cod_order}`)
    console.log(`📝 [createVendorOrdersStep] vendorMetadata.razorpay_payment_completed: ${vendorMetadata.razorpay_payment_completed}`)

    // ── UPDATE ORDER METADATA ─────────────────────────────────────────────
    const updateSuccess = await updateOrderPaymentStatus(
      parentOrder.id,
      container,
      vendorMetadata,
      detectedPaymentMethod
    )

    if (updateSuccess) {
      console.log("✅ [createVendorOrdersStep] Parent order metadata updated successfully")
    } else {
      console.log("⚠️ [createVendorOrdersStep] Parent order metadata update failed")
    }

    // ── CREATE VENDOR → ORDER LINKS ───────────────────────────────────────
    const linkDefs: LinkDefinition[] = []
    for (const vendor of vendors) {
      linkDefs.push({
        [MARKETPLACE_MODULE]: { vendor_id: vendor.id },
        [Modules.ORDER]: { order_id: parentOrder.id },
      })
      console.log(`🔗 [createVendorOrdersStep] Link: vendor ${vendor.handle} → order ${parentOrder.id}`)
    }

    // ── BUILD VENDOR ORDER REFS ───────────────────────────────────────────
    const createdOrders: VendorOrder[] = []
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
          current_vendor_items: vendorsItems[vendor.id],
        },
      }
      createdOrders.push(vendorOrderRef)
    }

    console.log("╔══════════════════════════════════════════════════════════╗")
    console.log("║  create-vendor-orders STEP COMPLETE")
    console.log(`║  payment_method written: "${detectedPaymentMethod}"`)
    console.log(`║  cod_order: ${detectedPaymentMethod === "cod"}`)
    console.log(`║  vendors linked: ${vendors.length}`)
    console.log("╚══════════════════════════════════════════════════════════╝")

    return new StepResponse(
      { orders: createdOrders, linkDefs },
      { created_orders: [] }
    )
  },
  async ({ created_orders }, { container, context }) => {
    console.log("✅ [createVendorOrdersStep] Compensation — no orders to cancel")
    return
  }
)

export default createVendorOrdersStep
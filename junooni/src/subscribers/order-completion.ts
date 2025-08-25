// Replace your order-completion-subscriber.ts with this version
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { processVendorPayoutWorkflow } from "../workflows/payout/process-vendor-payout"

// Subscriber that listens to order completion events
export default async function orderCompletionHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log(`🎯 [SUBSCRIBER] Order completion event triggered for order: ${data.id}`)
  console.log(`🎯 [SUBSCRIBER] Event data:`, JSON.stringify(data, null, 2))
  
  const orderModuleService = container.resolve("orderModuleService")
  const productModuleService = container.resolve("productModuleService")
  
  try {
    console.log(`📦 [SUBSCRIBER] Retrieving order details for: ${data.id}`)
    
    // Get the completed order
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items", "items.product", "items.variant"],
    })

    console.log(`📦 [SUBSCRIBER] Order retrieved:`, {
      id: order.id,
      total: order.total,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      payment_status: order.payment_status,
      itemCount: order.items?.length || 0,
      metadata: order.metadata
    })

    if (!order || !order.items?.length) {
      console.log(`❌ [SUBSCRIBER] Order ${data.id} has no items, skipping payout processing`)
      return
    }

    // Transform order items to the format expected by our workflow
    const workflowItems = []
    let skippedItems = 0
    let processedItems = 0
    
    console.log(`🔍 [SUBSCRIBER] Processing ${order.items.length} order items...`)
    
    for (const item of order.items) {
      console.log(`\n🔍 [SUBSCRIBER] Processing item ${item.id}:`)
      console.log(`   - Product ID: ${item.product_id}`)
      console.log(`   - Quantity: ${item.quantity}`)
      console.log(`   - Unit Price: ${item.unit_price}`)
      console.log(`   - Total: ${item.total}`)
      
      try {
        // Get product details to determine vendor and fulfillment settings
        const product = await productModuleService.retrieveProduct(item.product_id, {
          relations: ["variants"],
        })

        console.log(`📊 [SUBSCRIBER] Product metadata for ${item.product_id}:`, {
          title: product.title,
          metadata: product.metadata,
          availableKeys: Object.keys(product.metadata || {})
        })

        // Check vendor ID
        const vendorId = product.metadata?.vendor_id as string
        if (!vendorId) {
          console.log(`⚠️ [SUBSCRIBER] Product ${item.product_id} has no vendor_id, skipping`)
          skippedItems++
          continue
        }

        // Get cost price and fulfillment type from product metadata with better defaults
        const costPrice = product.metadata?.cost_price ? parseFloat(product.metadata.cost_price as string) : 0
        const productCost = product.metadata?.product_cost ? parseFloat(product.metadata.product_cost as string) : 0
        const fulfillmentType = (product.metadata?.fulfillment_type as "creator_fulfillment" | "junooni_fulfillment") || "creator_fulfillment"

        console.log(`🏷️ [SUBSCRIBER] Product settings:`, {
          vendorId,
          fulfillmentType,
          costPrice,
          productCost,
          rawFulfillmentType: product.metadata?.fulfillment_type,
          rawCostPrice: product.metadata?.cost_price,
          rawProductCost: product.metadata?.product_cost
        })

        // FIXED: More lenient validation
        // Only skip if fulfillment type is junooni and no cost data is available
        if (fulfillmentType === "junooni_fulfillment" && !productCost && !costPrice) {
          console.log(`⚠️ [SUBSCRIBER] Product ${item.product_id} is junooni_fulfillment but missing cost data, skipping`)
          skippedItems++
          continue
        }

        console.log(`✅ [SUBSCRIBER] Valid item found - adding to workflow`)

        workflowItems.push({
          id: item.id,
          vendorId: vendorId,
          quantity: item.quantity,
          costPrice: costPrice,
          productCost: fulfillmentType === "junooni_fulfillment" ? (productCost || costPrice) : undefined,
          fulfillmentType: fulfillmentType,
          lineItemTotal: item.total || 0,
        })
        
        processedItems++

      } catch (productError) {
        console.error(`❌ [SUBSCRIBER] Error processing product ${item.product_id}:`, productError)
        skippedItems++
        continue
      }
    }

    console.log(`\n📋 [SUBSCRIBER] Item processing summary:`)
    console.log(`   - Total items: ${order.items.length}`)
    console.log(`   - Processed: ${processedItems}`)
    console.log(`   - Skipped: ${skippedItems}`)
    console.log(`   - Workflow items: ${workflowItems.length}`)

    if (workflowItems.length === 0) {
      console.log(`⚠️ [SUBSCRIBER] No eligible items found for payout in order ${data.id}`)
      console.log(`🔍 [SUBSCRIBER] Possible reasons:`)
      console.log(`   - Products missing vendor_id in metadata`)
      console.log(`   - Junooni fulfillment products missing cost data`)
      console.log(`   - All items were skipped due to errors`)
      return
    }

    console.log(`\n🚀 [SUBSCRIBER] Executing vendor payout workflow for order ${data.id}`)
    console.log(`📤 [SUBSCRIBER] Workflow input:`, {
      orderId: order.id,
      orderTotal: order.total,
      itemCount: workflowItems.length,
      items: workflowItems
    })

    // Execute the vendor payout workflow
    const workflowResult = await processVendorPayoutWorkflow.run({
      input: {
        orderId: order.id,
        orderTotal: order.total || 0,
        items: workflowItems,
      },
      container,
    })

    console.log(`✅ [SUBSCRIBER] Vendor payout workflow completed for order ${data.id}`)
    console.log(`📊 [SUBSCRIBER] Workflow result:`, JSON.stringify(workflowResult.result, null, 2))

    // ADDITIONAL VERIFICATION: Check if payouts were actually created
    const payoutService = container.resolve("payout")
    for (const item of workflowItems) {
      const balance = await payoutService.getBalance(item.vendorId)
      console.log(`💰 [SUBSCRIBER] Post-workflow balance for vendor ${item.vendorId}: ${balance}`)
    }

  } catch (error) {
    console.error(`💥 [SUBSCRIBER] Error processing vendor payouts for order ${data.id}:`, error)
    console.error(`💥 [SUBSCRIBER] Full error stack:`, error.stack)
    
    // Log the error details for debugging
    if (error.message) {
      console.error(`💥 [SUBSCRIBER] Error message: ${error.message}`)
    }
    
    // Don't throw - we don't want to break the order completion process
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}

// Alternative subscriber for when order is paid (if you prefer this trigger)
export async function orderPaidHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log(`💳 [SUBSCRIBER] Order payment captured event: ${data.id}`)
  return orderCompletionHandler({ event: { data }, container })
}

export const paidConfig: SubscriberConfig = {
  event: "order.payment_captured",
}
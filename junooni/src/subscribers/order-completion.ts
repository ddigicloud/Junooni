// src/modules/payout/subscribers/order-completion.ts
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { processVendorPayoutWorkflow } from "../workflows/payout/process-vendor-payout"

export default async function orderCompletionHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve("orderModuleService")
  const productModuleService = container.resolve("productModuleService")
  
  console.log(`🎯 Order completion detected: ${data.id}`)
  
  try {
    // Get the completed order
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items", "items.product", "items.variant"],
    })

    console.log(`📦 Processing order ${data.id} with ${order.items?.length || 0} items`)

    if (!order || !order.items?.length) {
      console.log(`❌ Order ${data.id} has no items, skipping payout processing`)
      return
    }

    // Transform order items to the format expected by our workflow
    const workflowItems = []
    
    for (const item of order.items) {
      console.log(`🔍 Processing item ${item.id} for product ${item.product_id}`)
      
      try {
        // Get product details to determine vendor and fulfillment settings
        const product = await productModuleService.retrieveProduct(item.product_id, {
          relations: ["variants"],
        })

        console.log(`📊 Product metadata:`, product.metadata)

        if (!product.metadata?.vendor_id) {
          console.log(`⚠️ Product ${item.product_id} has no vendor, skipping`)
          continue
        }

        // Get cost price and fulfillment type from product metadata
        const costPrice = product.metadata?.cost_price ? parseFloat(product.metadata.cost_price as string) : 0
        const productCost = product.metadata?.product_cost ? parseFloat(product.metadata.product_cost as string) : 0
        const fulfillmentType = product.metadata?.fulfillment_type as "creator_fulfillment" | "junooni_fulfillment"

        if (!fulfillmentType || !costPrice) {
          console.log(`⚠️ Product ${item.product_id} missing required metadata:`, {
            fulfillmentType,
            costPrice,
            hasVendorId: !!product.metadata?.vendor_id
          })
          continue
        }

        console.log(`✅ Valid item found:`, {
          itemId: item.id,
          vendorId: product.metadata.vendor_id,
          costPrice,
          fulfillmentType
        })

        workflowItems.push({
          id: item.id,
          vendorId: product.metadata.vendor_id as string,
          quantity: item.quantity,
          costPrice: costPrice,
          productCost: fulfillmentType === "junooni_fulfillment" ? productCost : undefined,
          fulfillmentType: fulfillmentType,
          lineItemTotal: item.total || 0,
        })
      } catch (productError) {
        console.error(`❌ Error processing product ${item.product_id}:`, productError)
        continue
      }
    }

    if (workflowItems.length === 0) {
      console.log(`⚠️ No eligible items found for payout in order ${data.id}`)
      return
    }

    console.log(`🚀 Executing payout workflow for ${workflowItems.length} items`)

    // Execute the vendor payout workflow - using the same pattern as your existing subscriber
    const { result } = await processVendorPayoutWorkflow(container).run({
      input: {
        orderId: order.id,
        orderTotal: order.total || 0,
        items: workflowItems,
      },
    })

    console.log(`✅ Vendor payout processing completed for order ${data.id}:`, result)
  } catch (error) {
    console.error(`💥 Error processing vendor payouts for order ${data.id}:`, error)
    // Don't throw - we don't want to break the order completion process
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}
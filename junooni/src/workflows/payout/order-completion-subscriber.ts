import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { processVendorPayoutWorkflow } from "../../workflows/payout/process-vendor-payout"

// Subscriber that listens to order completion events
export default async function orderCompletionHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve("orderModuleService")
  const productModuleService = container.resolve("productModuleService")
  
  try {
    // Get the completed order
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items", "items.product", "items.variant"],
    })

    if (!order || !order.items?.length) {
      console.log(`Order ${data.id} has no items, skipping payout processing`)
      return
    }

    // Transform order items to the format expected by our workflow
    const workflowItems = []
    
    for (const item of order.items) {
      // Get product details to determine vendor and fulfillment settings
      const product = await productModuleService.retrieveProduct(item.product_id, {
        relations: ["variants"],
      })

      if (!product.metadata?.vendor_id) {
        console.log(`Product ${item.product_id} has no vendor, skipping`)
        continue
      }

      // Get cost price and fulfillment type from product metadata
      const costPrice = product.metadata?.cost_price ? parseFloat(product.metadata.cost_price as string) : 0
      const productCost = product.metadata?.product_cost ? parseFloat(product.metadata.product_cost as string) : 0
      const fulfillmentType = product.metadata?.fulfillment_type as "creator_fulfillment" | "junooni_fulfillment"

      if (!fulfillmentType || !costPrice) {
        console.log(`Product ${item.product_id} missing required metadata, skipping`)
        continue
      }

      workflowItems.push({
        id: item.id,
        vendorId: product.metadata.vendor_id as string,
        quantity: item.quantity,
        costPrice: costPrice,
        productCost: fulfillmentType === "junooni_fulfillment" ? productCost : undefined,
        fulfillmentType: fulfillmentType,
        lineItemTotal: item.total || 0,
      })
    }

    if (workflowItems.length === 0) {
      console.log(`No eligible items found for payout in order ${data.id}`)
      return
    }

    // Execute the vendor payout workflow
    const { result } = await processVendorPayoutWorkflow.run({
      input: {
        orderId: order.id,
        orderTotal: order.total || 0,
        items: workflowItems,
      },
      container,
    })

    console.log(`Vendor payout processing completed for order ${data.id}:`, result)
  } catch (error) {
    console.error(`Error processing vendor payouts for order ${data.id}:`, error)
    // You might want to add error handling, notifications, or retry logic here
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
  // Same logic as above, but triggered on order.payment_captured or order.paid
  return orderCompletionHandler({ event: { data }, container })
}

export const paidConfig: SubscriberConfig = {
  event: "order.payment_captured",
}
// src/workflows/payout/handle-refunds/steps/update-vendor-refund-metadata.ts

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type StepInput = {
  order: any
  refundInfo: any
}

export const updateVendorRefundMetadataStep = createStep(
  "update-vendor-refund-metadata",
  async ({ order, refundInfo }: StepInput, { container }) => {
    console.log("🔄 Updating vendor metadata with refund status...")
    
    if (!order?.metadata?.vendor_orders) {
      console.log("⚠️ No vendor_orders metadata found, skipping update")
      return new StepResponse({
        success: false,
        reason: "No vendor_orders metadata found"
      })
    }

    const orderService = container.resolve(Modules.ORDER)
    const orderItems = order.items || []
    const vendorOrders = order.metadata.vendor_orders || []

    // Recalculate vendor payment status based on actual item return data
    const updatedVendorOrders = vendorOrders.map((vendorOrder: any) => {
      let vendorRefundedTotal = 0
      let allItemsRefunded = true
      let someItemsRefunded = false
      let hasVendorItems = false

      const updatedVendorItems = vendorOrder.vendor_items.map((vendorItem: any) => {
        // Find matching order item by title or id
        const orderItem = orderItems.find((item: any) => 
          item.title === vendorItem.title || 
          item.id === vendorItem.id ||
          item.id === vendorItem.order_item_id
        )

        if (!orderItem) {
          console.log(`⚠️ No matching order item found for vendor item: ${vendorItem.title}`)
          return vendorItem
        }

        hasVendorItems = true
        const detail = orderItem.detail || orderItem
        const returnRequestedQty = Number(detail.return_requested_quantity) || 0
        const returnReceivedQty = Number(detail.return_received_quantity) || 0
        const quantity = Number(detail.quantity) || Number(orderItem.quantity) || vendorItem.quantity

        // Use the higher of requested or received for refund calculation
        const effectiveReturnQty = Math.max(returnRequestedQty, returnReceivedQty)
        
        const isFullyRefunded = effectiveReturnQty >= quantity
        const isPartiallyRefunded = effectiveReturnQty > 0 && effectiveReturnQty < quantity

        // Calculate refunded amount for this item
        const itemRefundedTotal = isFullyRefunded 
          ? vendorItem.total 
          : (vendorItem.unit_price * effectiveReturnQty)

        if (effectiveReturnQty > 0) {
          vendorRefundedTotal += itemRefundedTotal
          someItemsRefunded = true
        }
        
        if (!isFullyRefunded) {
          allItemsRefunded = false
        }

        // Determine item payment status
        let itemPaymentStatus = "captured"
        if (isFullyRefunded) {
          itemPaymentStatus = "refunded"
        } else if (isPartiallyRefunded) {
          itemPaymentStatus = "partially_refunded"
        }

        console.log(`📦 Item "${vendorItem.title}": qty=${quantity}, returned=${effectiveReturnQty}, status=${itemPaymentStatus}`)

        return {
          ...vendorItem,
          refunded_quantity: effectiveReturnQty,
          refunded_total: itemRefundedTotal,
          is_refunded: isFullyRefunded,
          is_partially_refunded: isPartiallyRefunded,
          payment_status: itemPaymentStatus,
          net_amount: vendorItem.total - itemRefundedTotal,
          // Keep track of return details
          return_requested_quantity: returnRequestedQty,
          return_received_quantity: returnReceivedQty,
        }
      })

      // If no items matched, keep original status
      if (!hasVendorItems) {
        return vendorOrder
      }

      // Determine vendor-level payment status
      let vendorPaymentStatus = "captured"
      if (allItemsRefunded && someItemsRefunded) {
        vendorPaymentStatus = "refunded"
      } else if (someItemsRefunded) {
        vendorPaymentStatus = "partially_refunded"
      }

      const vendorNetAmount = vendorOrder.vendor_amount - vendorRefundedTotal
      const vendorPayoutAmount = vendorPaymentStatus === "refunded" ? 0 : vendorNetAmount

      console.log(`👤 Vendor "${vendorOrder.vendor_handle}": status=${vendorPaymentStatus}, payout=${vendorPayoutAmount}`)

      return {
        ...vendorOrder,
        vendor_items: updatedVendorItems,
        vendor_refunded_amount: vendorRefundedTotal,
        vendor_net_amount: vendorNetAmount,
        vendor_payment_status: vendorPaymentStatus,
        vendor_payout_amount: vendorPayoutAmount,
        refund_updated_at: new Date().toISOString(),
      }
    })

    // Calculate overall vendor payment status
    const allVendorsRefunded = updatedVendorOrders.every(
      (vo: any) => vo.vendor_payment_status === "refunded"
    )
    const someVendorsRefunded = updatedVendorOrders.some(
      (vo: any) => vo.vendor_payment_status === "refunded" || vo.vendor_payment_status === "partially_refunded"
    )

    let overallVendorPaymentStatus = "captured"
    if (allVendorsRefunded) {
      overallVendorPaymentStatus = "refunded"
    } else if (someVendorsRefunded) {
      overallVendorPaymentStatus = "partially_refunded"
    }

    // Update order metadata
    try {
      await orderService.updateOrders(order.id, {
        metadata: {
          ...order.metadata,
          vendor_orders: updatedVendorOrders,
          vendor_payment_status: overallVendorPaymentStatus,
          vendor_refund_processed_at: new Date().toISOString(),
        }
      })

      console.log(`✅ Successfully updated vendor metadata for order ${order.id}`)
      console.log(`   Overall vendor payment status: ${overallVendorPaymentStatus}`)

      return new StepResponse({
        success: true,
        orderId: order.id,
        updatedVendorOrders,
        overallVendorPaymentStatus,
      })
    } catch (error: any) {
      console.error(`❌ Failed to update vendor metadata: ${error.message}`)
      
      return new StepResponse({
        success: false,
        reason: error.message,
        orderId: order.id,
      })
    }
  },
  // Compensation function (optional - restore previous metadata if needed)
  async (data, { container }) => {
    // In case of workflow failure, you could restore the previous metadata here
    console.log("⚠️ Compensation called for update-vendor-refund-metadata step")
  }
)

export default updateVendorRefundMetadataStep
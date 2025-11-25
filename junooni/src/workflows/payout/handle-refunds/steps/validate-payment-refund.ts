import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidatePaymentRefundStepInput = {
  payment: any
  order: any
}

export const validatePaymentRefundStep = createStep(
  "validate-payment-refund",
  async ({ payment, order }: ValidatePaymentRefundStepInput) => {
    console.log(`Validating payment refund for payment ${payment.id}, order ${order.id}`)

    // Basic validation
    if (!payment) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment is required"
      )
    }

    if (!order) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order is required"
      )
    }

    // Check if payment has valid amount
    if (!payment.amount || payment.amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment must have a valid amount"
      )
    }

    // Check if order has items
    if (!order.items || order.items.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order ${order.id} has no items to process refund for`
      )
    }

    // Validate order total - calculate if missing
    let orderTotal = order.total
    if (!orderTotal || orderTotal <= 0) {
      console.warn(`Order ${order.id} missing total, calculating from items`)
      
      orderTotal = order.items.reduce((sum: number, item: any) => {
        return sum + (item.total || (item.unit_price * item.quantity) || 0)
      }, 0)
      
      // Add other totals if available
      orderTotal += (order.tax_total || 0) + (order.shipping_total || 0) - (order.discount_total || 0)
      
      if (orderTotal <= 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Order ${order.id} has invalid total (${orderTotal}). Cannot process refund.`
        )
      }
      
      console.log(`Calculated order total: ${orderTotal} for order ${order.id}`)
      // Update the order object for downstream steps
      order.total = orderTotal
    }

    // Check if payment has refunds
    const hasRefunds = payment.refunds && Array.isArray(payment.refunds) && payment.refunds.length > 0
    if (!hasRefunds) {
      console.log(`Payment ${payment.id} has no refunds, but validation passed`)
    }

    // Validate refund amounts don't exceed payment amount
    if (hasRefunds) {
      const totalRefundAmount = payment.refunds.reduce((sum: number, refund: any) => {
        return sum + (refund.amount || 0)
      }, 0)

      if (totalRefundAmount > payment.amount) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Total refund amount (${totalRefundAmount}) exceeds payment amount (${payment.amount})`
        )
      }

      // Warn if refund amount exceeds order total
      if (totalRefundAmount > orderTotal) {
        console.warn(`Refund amount (${totalRefundAmount}) exceeds order total (${orderTotal}) for order ${order.id}`)
      }
    }

    // Enhanced order status validation
    const allowedOrderStatuses = ["completed", "shipped", "fulfilled", "partially_returned", "returned"]
    const warningStatuses = ["pending", "processing", "canceled", "cancelled"]
    
    if (order.status) {
      if (warningStatuses.includes(order.status)) {
        console.warn(`Order ${order.id} has status '${order.status}' which may not be ideal for refund processing`)
      } else if (!allowedOrderStatuses.includes(order.status)) {
        console.warn(`Order ${order.id} has unusual status '${order.status}' for refund processing`)
      }
    }

    // Validate order items have required data for payout calculations
    const invalidItems = order.items.filter((item: any) => {
      return !item.id || !item.product_id || (!item.total && (!item.unit_price || !item.quantity))
    })

    if (invalidItems.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order ${order.id} has ${invalidItems.length} items with missing required data for refund processing`
      )
    }

    // Check for vendors on items (important for payout processing)
    const itemsWithoutVendors = order.items.filter((item: any) => {
      return !item.product?.vendor || (Array.isArray(item.product.vendor) && item.product.vendor.length === 0)
    })

    if (itemsWithoutVendors.length > 0) {
      console.warn(`Order ${order.id} has ${itemsWithoutVendors.length} items without vendor information. These may be skipped in refund processing.`)
    }

    return new StepResponse({
      valid: true,
      paymentId: payment.id,
      orderId: order.id,
      paymentAmount: payment.amount,
      refundedAmount: payment.refunded_amount || 0,
      orderTotal: orderTotal,
      hasRefunds: hasRefunds,
      refundCount: hasRefunds ? payment.refunds.length : 0,
      orderItemCount: order.items?.length || 0,
      itemsWithVendors: order.items?.length - itemsWithoutVendors.length || 0,
      itemsWithoutVendors: itemsWithoutVendors.length,
      orderStatus: order.status,
      validatedAt: new Date(),
      // warnings: []
      //   .concat(orderTotal !== order.total ? [`Order total calculated from items (${orderTotal})`] : [])
      //   .concat(warningStatuses.includes(order.status) ? [`Order status is '${order.status}'`] : [])
      //   .concat(itemsWithoutVendors.length > 0 ? [`${itemsWithoutVendors.length} items without vendors`] : [])
    })
  }
)

export default validatePaymentRefundStep
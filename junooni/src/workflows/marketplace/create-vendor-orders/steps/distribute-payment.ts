import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { OrderDTO, CartLineItemDTO } from "@medusajs/framework/types"

type PaymentDistributionInput = {
  parentOrder: OrderDTO
  vendorOrders: OrderDTO[]
  vendorsItems: Record<string, CartLineItemDTO[]>
}

// Helper function to calculate vendor amounts
function calculateVendorAmount(items: CartLineItemDTO[]): number {
  return items.reduce((total, item) => {
    return total + (Number(item.unit_price) * Number(item.quantity))
  }, 0)
}

const distributePaymentStep = createStep(
  "distribute-payment",
  async (
    { parentOrder, vendorOrders, vendorsItems }: PaymentDistributionInput,
    { container, context }
  ) => {
    console.log("💰 Payment distribution logging (SINGLE ORDER APPROACH)...")
    console.log("THE SINGLE ORDER ID:", parentOrder.id)
    //console.log("Payment status:", parentOrder.payment_status)
    console.log("Vendor count:", Object.keys(vendorsItems).length)

    // Calculate vendor amounts for logging purposes
    const vendorAmounts: Record<string, number> = {}
    let totalVendorAmount = 0
    
    for (const [vendorId, items] of Object.entries(vendorsItems || {})) {
      const amount = calculateVendorAmount(items)
      vendorAmounts[vendorId] = amount
      totalVendorAmount += amount
    }
    
    console.log("💰 Payment breakdown (SINGLE ORDER):")
    console.log("Total order amount:", parentOrder.total)
    console.log("Vendor items total:", totalVendorAmount)
    console.log("Individual vendor amounts:", vendorAmounts)

    const vendorCount = Object.keys(vendorAmounts).length

    // ✅ SINGLE ORDER APPROACH: No matter how many vendors, only ONE order exists
    console.log("✅ SINGLE ORDER APPROACH: All vendors share the same order")
    
    const paymentDistributions = []
    
    // The main order contains everything and shows as paid
    paymentDistributions.push({
      order_id: parentOrder.id,
      order_type: "main_order",
      amount: parentOrder.total,
      status: "paid",
      method: "single_order_approach",
      display_location: "medusa_backend",
      vendor_count: vendorCount,
      contains_all_vendors: true,
      payment_status: "captured",
      explanation: "Single order in backend containing all vendors' products, showing as PAID"
    })
    
    // Log vendor information for dashboard access (but no separate orders)
    for (const [vendorId, amount] of Object.entries(vendorAmounts)) {
      paymentDistributions.push({
        vendor_id: vendorId,
        vendor_amount: amount,
        parent_order_id: parentOrder.id,
        vendor_access_method: "linked_to_main_order",
        status: "paid_via_main_order",
        display_location: "vendor_dashboard_via_link",
        explanation: `Vendor accesses their ${amount} portion through link to main order ${parentOrder.id}`
      })
      
      console.log(`💳 Vendor ${vendorId}: ${amount} (accessed via main order link)`)
    }

    console.log("✅ SINGLE ORDER payment distribution summary:")
    console.log(`   - 1 order in Medusa backend: ${parentOrder.total} (PAID)`)
    console.log(`   - ${vendorCount} vendors access via links (PAID)`)
    console.log(`   - 0 additional orders created`)

    return new StepResponse({
      payment_distributions: paymentDistributions,
      method: "single_order_approach",
      total_distributions: paymentDistributions.length,
      approach: "single_backend_order_with_vendor_links",
      summary: {
        backend_orders: 1,
        backend_order_total: parentOrder.total,
        backend_order_status: "paid",
        vendor_count: vendorCount,
        vendor_access_method: "linked_to_main_order",
        additional_orders_created: 0,
        total_orders_in_system: 1
      },
      explanation: {
        backend_view: "Single order showing full amount as PAID",
        vendor_view: "Access their portion of the main order via vendor links",
        customer_view: "Single order with full amount paid",
        admin_view: "Only one order exists in the system",
        approach: "No vendor sub-orders created, everything through main order"
      }
    })
  }
)

export default distributePaymentStep
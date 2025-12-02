//do not delete needed
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

interface ItemPayoutInfo {
  itemId: string
  productId: string
  variantId: string
  vendorId: string
  payoutId: string
  unitPrice: number
  quantity: number
  total: number
  costPrice: number
  fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
}

type ProcessAllPayoutDetailsStepInput = {
  orderId: string
  order: any
  vendorPayoutMap: Record<string, string>
}

const processAllPayoutDetailsStep = createStep(
  "process-all-payout-details",
  async ({ orderId, order, vendorPayoutMap }: ProcessAllPayoutDetailsStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
    
    console.log(`Creating payout detail records for order ${orderId}`)

    if (!order?.items || order.items.length === 0) {
      throw new Error(`Order ${orderId} has no items`)
    }

    const createdDetails = []
    const vendorBalanceUpdates = new Map<string, number>()

    // Process each item in the order
    for (const item of order.items) {
      if (!item.product?.vendor) {
        console.warn(`Item ${item.id} has no vendor, skipping`)
        continue
      }

      // Handle single vendor object vs array
      const vendors = Array.isArray(item.product.vendor) 
        ? item.product.vendor 
        : [item.product.vendor]

      // Process each vendor for this item
      for (const vendor of vendors) {
        if (!vendor?.id) {
          console.warn(`Invalid vendor for item ${item.id}`)
          continue
        }

        const payoutId = vendorPayoutMap[vendor.id]
        if (!payoutId) {
          console.error(`No payout ID found for vendor ${vendor.id}`)
          continue
        }

        try {
          console.log(`Processing payout detail for item ${item.id}, vendor ${vendor.id}`)

          // Parse fulfillment type
          let fulfillmentType: "creator_fulfillment" | "junooni_fulfillment" = "creator_fulfillment"

console.log('🔍 Checking product metadata for fulfillment_type...')

if (item.product.metadata?.fulfillment_type) {
  console.log('🔍 Raw fulfillment_type:', item.product.metadata.fulfillment_type)
  console.log('🔍 Type:', typeof item.product.metadata.fulfillment_type)
  
  try {
    let fulfillmentData = item.product.metadata.fulfillment_type
    
    // If it's a string, parse it as JSON
    if (typeof fulfillmentData === 'string') {
      console.log('🔍 Parsing JSON string...')
      fulfillmentData = JSON.parse(fulfillmentData)
      console.log('✅ Parsed:', JSON.stringify(fulfillmentData, null, 2))
    }
    
    // ✅ FIX: Use case-insensitive match instead of exact string comparison
    if (fulfillmentData && typeof fulfillmentData === 'object' && fulfillmentData.type) {
      const typeValue = fulfillmentData.type.toLowerCase()  // Convert to lowercase
      console.log('🔍 Type value (lowercase):', typeValue)
      
      // Check if it contains "junooni" (case-insensitive, flexible spelling)
      if (typeValue.includes('junooni')) {
        fulfillmentType = "junooni_fulfillment"
        console.log('✅ Detected: JUNOONI fulfillment')
      } else if (typeValue.includes('creator')) {
        fulfillmentType = "creator_fulfillment"
        console.log('✅ Detected: CREATOR fulfillment')
      } else {
        console.log('⚠️ Unknown type value:', typeValue, '- defaulting to creator_fulfillment')
      }
    }
    
  } catch (parseError) {
    console.error('💥 Failed to parse fulfillment type:', parseError)
  }
} else {
  console.log('⚠️ No fulfillment_type in metadata, using default: creator_fulfillment')
}

console.log('🎯 FINAL fulfillment type:', fulfillmentType)

          // Get cost price (variant priority)
          const costPrice = Number(
            item.variant?.metadata?.cost_price || 
            item.product?.metadata?.cost_price || 
            0
          )

          const itemTotal = item.unit_price * item.quantity
          const taxTotal = item.tax_total || 0

          // Skip if cost price exceeds total (business logic)
          if (fulfillmentType === "junooni_fulfillment" && costPrice > itemTotal) {
            console.warn(`Skipping item ${item.id} - cost price (${costPrice}) exceeds total (${itemTotal})`)
            continue
          }

          // Calculate earnings
          const earnings = await payoutModuleService.calculateEarningsFromOrder(
            itemTotal,
            fulfillmentType,
            costPrice,
            item.quantity,
            taxTotal  
          )

          // Create payout detail record
          const payoutDetailInput = {
            payout_id: payoutId,
            order_id: orderId,
            order_item_id: item.id,
            product_id: item.product_id,
            amount: earnings.netAmount,
            tax_amount: earnings.taxAmount,
            tax_type: "igst" as const,
            tds_percentage: earnings.tdsPercentage,
            tds_amount: earnings.tdsAmount,
            type: "earning" as const,
            fulfillment_type: fulfillmentType,
            cost_price: costPrice,
            commission_rate: earnings.commissionRate,
            selling_price: itemTotal,
            status: "completed" as const,
            reason: `Order earnings - ${orderId} - ${item.product_id}`,
            notes: null,
          }

          console.log('📦 FULL PAYOUT DETAIL INPUT:', JSON.stringify(payoutDetailInput, null, 2))
          const payoutDetail = await payoutModuleService.createPayoutDetails(payoutDetailInput)

          createdDetails.push({
            payoutDetailId: payoutDetail.id,
            itemId: item.id,
            vendorId: vendor.id,
            amount: earnings.netAmount
          })

          // Track balance updates per vendor
          const currentUpdate = vendorBalanceUpdates.get(vendor.id) || 0
          vendorBalanceUpdates.set(vendor.id, currentUpdate + earnings.netAmount)

          console.log(`Created payout detail ${payoutDetail.id} for item ${item.id}`)

        } catch (error) {
          console.error(`Failed to create payout detail for item ${item.id}:`, error)
          throw new Error(`Failed to create payout detail for item ${item.id}: ${error.message}`)
        }
      }
    }

    // Update vendor account balances
    console.log(`Updating balances for ${vendorBalanceUpdates.size} vendors`)
    for (const [vendorId, totalEarnings] of vendorBalanceUpdates.entries()) {
      const vendorPayout = await payoutModuleService.getVendorPayout(vendorId)
      if (vendorPayout) {
        await payoutModuleService.updatePayouts({
          id: vendorPayout.id,
          current_balance: vendorPayout.current_balance + totalEarnings,
          total_earned: vendorPayout.total_earned + totalEarnings,
          total_orders: vendorPayout.total_orders + 1,
          last_earning_at: new Date(),
          avg_order_value: (vendorPayout.total_earned + totalEarnings) / (vendorPayout.total_orders + 1),
        })
        console.log(`Updated balance for vendor ${vendorId}: +${totalEarnings}`)
      }
    }

    console.log(`Successfully created ${createdDetails.length} payout detail records`)

    return new StepResponse({
      success: true,
      orderId,
      payoutDetailsCreated: createdDetails.length,
      vendorsUpdated: vendorBalanceUpdates.size,
      createdDetails
    })
  },
  // Compensation function - rollback created records
  async (data, { container }) => {
    if (!data || !data.success || !data.createdDetails) return
    
    console.log(`Rolling back ${data.createdDetails.length} payout details for order ${data.orderId}`)
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
    
    // Delete created payout details
    for (const detail of data.createdDetails) {
      try {
        await payoutModuleService.deletePayoutDetails(detail.payoutDetailId)
        console.log(`Deleted payout detail ${detail.payoutDetailId}`)
      } catch (error) {
        console.warn(`Failed to delete payout detail ${detail.payoutDetailId}:`, error)
      }
    }
  }
)

export default processAllPayoutDetailsStep
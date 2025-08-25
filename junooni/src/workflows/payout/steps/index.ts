// src/modules/payout/workflows/payout/steps/index.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

const PAYOUT_MODULE = "payout"

// Step 1: Validate order for payout processing
export const validateOrderForPayoutStep = createStep(
  "validate-order-for-payout",
  async function (input: { orderId: string; orderTotal: number; items: any[] }) {
    console.log(`🔍 [STEP] Validating order ${input.orderId} for payout processing`)
    
    if (!input.orderId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order ID is required"
      )
    }
    
    if (!input.items || input.items.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order must have items for payout processing"
      )
    }
    
    console.log(`✅ [STEP] Order validation passed for ${input.orderId}`)
    return new StepResponse({ isValid: true })
  }
)

// Step 2: Group items by vendor
export const groupItemsByVendorStep = createStep(
  "group-items-by-vendor",
  async function (items: Array<{
    id: string
    vendorId: string
    quantity: number
    costPrice: number
    productCost?: number
    fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
    lineItemTotal: number
  }>) {
    console.log(`📊 [STEP] Grouping ${items.length} items by vendor`)
    
    const vendorGroups = new Map<string, typeof items>()
    
    items.forEach(item => {
      if (!vendorGroups.has(item.vendorId)) {
        vendorGroups.set(item.vendorId, [])
      }
      vendorGroups.get(item.vendorId)!.push(item)
    })
    
    const result = Array.from(vendorGroups.entries()).map(([vendorId, items]) => ({
      vendorId,
      items,
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.lineItemTotal, 0)
    }))
    
    console.log(`📋 [STEP] Grouped into ${result.length} vendor groups:`, 
      result.map(g => ({ vendorId: g.vendorId, items: g.totalItems, value: g.totalValue }))
    )
    
    return new StepResponse(result)
  }
)

// Step 3: Calculate payouts for each vendor group
export const calculateVendorPayoutsStep = createStep(
  "calculate-vendor-payouts",
  async function (
    input: {
      vendorGroups: Array<{
        vendorId: string
        items: Array<{
          id: string
          vendorId: string
          quantity: number
          costPrice: number
          productCost?: number
          fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
          lineItemTotal: number
        }>
      }>
      orderId: string
    },
    { container }
  ) {
    console.log(`💰 [STEP] Calculating payouts for ${input.vendorGroups.length} vendor groups`)
    
    const payoutService = container.resolve(PAYOUT_MODULE)
    const vendorPayouts: Array<{
      vendorId: string
      totalEarnings: number
      items: Array<{
        itemId: string
        earnings: number
        fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
        lineItemTotal?: number
        error?: string
      }>
    }> = []
    
    for (const group of input.vendorGroups) {
      console.log(`🧮 [STEP] Calculating for vendor ${group.vendorId}`)
      
      const vendorEarnings: Array<{
        itemId: string
        earnings: number
        fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
        lineItemTotal?: number
        error?: string
      }> = []
      let totalVendorEarnings = 0
      
      for (const item of group.items) {
        try {
          let earnings = 0
          
          if (item.fulfillmentType === "creator_fulfillment") {
            earnings = await payoutService.calculateEarningsFromOrder(
              item.lineItemTotal,
              "creator_fulfillment"
            )
          } else if (item.fulfillmentType === "junooni_fulfillment") {
            const costToUse = item.productCost || item.costPrice
            earnings = await payoutService.calculateEarningsFromOrder(
              item.lineItemTotal,
              "junooni_fulfillment",
              costToUse
            )
          }
          
          console.log(`💡 [STEP] Item ${item.id}: ${item.lineItemTotal} → ${earnings} (${item.fulfillmentType})`)
          
          vendorEarnings.push({
            itemId: item.id,
            earnings,
            fulfillmentType: item.fulfillmentType,
            lineItemTotal: item.lineItemTotal
          })
          
          totalVendorEarnings += earnings
          
        } catch (error) {
          console.error(`❌ [STEP] Error calculating earnings for item ${item.id}:`, error)
          vendorEarnings.push({
            itemId: item.id,
            earnings: 0,
            fulfillmentType: item.fulfillmentType,
            error: error.message
          })
        }
      }
      
      vendorPayouts.push({
        vendorId: group.vendorId,
        totalEarnings: totalVendorEarnings,
        items: vendorEarnings
      })
      
      console.log(`📊 [STEP] Vendor ${group.vendorId} total earnings: ${totalVendorEarnings}`)
    }
    
    return new StepResponse(vendorPayouts)
  }
)

// Step 4: Add vendor earnings (THIS IS THE CRUCIAL STEP!)
export const addVendorEarningsStep = createStep(
  "add-vendor-earnings",
  async function (
    input: {
      vendorPayouts: Array<{
        vendorId: string
        totalEarnings: number
        items: Array<{
          itemId: string
          earnings: number
          fulfillmentType: string
        }>
      }>
      orderId: string
    },
    { container }
  ) {
    console.log(`🚀 [STEP] Adding earnings for ${input.vendorPayouts.length} vendors`)
    
    const payoutService = container.resolve(PAYOUT_MODULE)
    const results: Array<{
      vendorId: string
      earnings: number
      payoutRecordId?: string
      newBalance?: number
      success: boolean
      reason?: string
      error?: string
    }> = []
    
    for (const vendorPayout of input.vendorPayouts) {
      console.log(`💰 [STEP] Processing earnings for vendor ${vendorPayout.vendorId}: ${vendorPayout.totalEarnings}`)
      
      try {
        if (vendorPayout.totalEarnings > 0) {
          // Get the primary fulfillment type for this vendor's items
          const primaryFulfillmentType = vendorPayout.items[0]?.fulfillmentType as "creator_fulfillment" | "junooni_fulfillment" || "creator_fulfillment"
          
          // THIS IS THE CRUCIAL CALL THAT WAS MISSING!
          const payoutRecord = await payoutService.addEarnings(
            vendorPayout.vendorId,
            vendorPayout.totalEarnings,
            input.orderId,
            primaryFulfillmentType
          )
          
          console.log(`✅ [STEP] Earnings added successfully for vendor ${vendorPayout.vendorId}:`, {
            recordId: payoutRecord.id,
            amount: vendorPayout.totalEarnings
          })
          
          // Verify the balance was updated
          const newBalance = await payoutService.getBalance(vendorPayout.vendorId)
          console.log(`💰 [STEP] New balance for vendor ${vendorPayout.vendorId}: ${newBalance}`)
          
          results.push({
            vendorId: vendorPayout.vendorId,
            earnings: vendorPayout.totalEarnings,
            payoutRecordId: payoutRecord.id,
            newBalance,
            success: true
          })
        } else {
          console.log(`⚠️ [STEP] No earnings to add for vendor ${vendorPayout.vendorId}`)
          results.push({
            vendorId: vendorPayout.vendorId,
            earnings: 0,
            success: false,
            reason: "No earnings calculated"
          })
        }
        
      } catch (error) {
        console.error(`❌ [STEP] Error adding earnings for vendor ${vendorPayout.vendorId}:`, error)
        results.push({
          vendorId: vendorPayout.vendorId,
          earnings: vendorPayout.totalEarnings,
          success: false,
          error: error.message
        })
      }
    }
    
    console.log(`📋 [STEP] Earnings processing completed:`, {
      totalVendors: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
    
    return new StepResponse(results)
  }
)
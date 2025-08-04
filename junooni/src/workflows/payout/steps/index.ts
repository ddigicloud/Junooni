import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
//import { PAYOUT_MODULE } from "../../index"


// Use string constant instead of importing - this avoids circular dependency issues
const PAYOUT_MODULE = "payout"
// Types for step inputs and outputs
interface OrderItem {
  id: string
  vendorId: string
  quantity: number
  costPrice: number
  productCost?: number
  fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
  lineItemTotal: number
}

interface VendorGroup {
  vendorId: string
  items: OrderItem[]
  totalItems: number
}

interface VendorPayout {
  vendorId: string
  totalEarnings: number
  fulfillmentType: "creator_fulfillment" | "junooni_fulfillment"
  items: Array<{
    itemId: string
    earnings: number
    costPrice: number
    productCost?: number
  }>
}

// Step 1: Validate order for payout processing
export const validateOrderForPayoutStep = createStep(
  "validate-order-for-payout",
  async function (input: { orderId: string; orderTotal: number; items: OrderItem[] }) {
    if (!input.orderId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order ID is required for payout processing"
      )
    }

    if (!input.items || input.items.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order must contain items for payout processing"
      )
    }

    // Validate each item has required fields
    for (const item of input.items) {
      if (!item.vendorId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Item ${item.id} missing vendor ID`
        )
      }

      if (item.costPrice <= 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Item ${item.id} has invalid cost price`
        )
      }

      if (item.fulfillmentType === "junooni_fulfillment" && (!item.productCost || item.productCost < 0)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Item ${item.id} requires valid product cost for Junooni fulfillment`
        )
      }

      if (item.fulfillmentType === "junooni_fulfillment" && item.productCost! > item.costPrice) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Item ${item.id} product cost cannot exceed cost price`
        )
      }
    }

    return new StepResponse({
      isValid: true,
      orderId: input.orderId,
      totalItems: input.items.length,
    })
  }
)

// Step 2: Group items by vendor
export const groupItemsByVendorStep = createStep(
  "group-items-by-vendor",
  async function (items: OrderItem[]): Promise<VendorGroup[]> {
    const vendorMap = new Map<string, OrderItem[]>()

    // Group items by vendor ID
    items.forEach(item => {
      if (!vendorMap.has(item.vendorId)) {
        vendorMap.set(item.vendorId, [])
      }
      vendorMap.get(item.vendorId)!.push(item)
    })

    // Convert to array format
    const vendorGroups: VendorGroup[] = Array.from(vendorMap.entries()).map(
      ([vendorId, vendorItems]) => ({
        vendorId,
        items: vendorItems,
        totalItems: vendorItems.length,
      })
    )

    return new StepResponse(vendorGroups)
  }
)

// Step 3: Calculate payouts for each vendor group
export const calculateVendorPayoutsStep = createStep(
  "calculate-vendor-payouts",
  async function (input: { 
    vendorGroups: VendorGroup[]
    orderId: string
  }): Promise<VendorPayout[]> {
    const vendorPayouts: VendorPayout[] = []

    for (const vendorGroup of input.vendorGroups) {
      let totalEarnings = 0
      const itemEarnings: Array<{
        itemId: string
        earnings: number
        costPrice: number
        productCost?: number
      }> = []

      // Determine the fulfillment type for this vendor's items
      // All items from same vendor should have same fulfillment type
      const fulfillmentType = vendorGroup.items[0].fulfillmentType
      
      // Validate all items have same fulfillment type
      const allSameFulfillment = vendorGroup.items.every(
        item => item.fulfillmentType === fulfillmentType
      )
      
      if (!allSameFulfillment) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `All items from vendor ${vendorGroup.vendorId} must have the same fulfillment type`
        )
      }

      // Calculate earnings for each item
      for (const item of vendorGroup.items) {
        let itemEarnings = 0

        switch (item.fulfillmentType) {
          case "creator_fulfillment":
            // 70% of cost price
            itemEarnings = Math.floor(item.costPrice * item.quantity * 0.70)
            break

          case "junooni_fulfillment":
            // Cost price - product cost
            if (!item.productCost) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Product cost required for item ${item.id} with Junooni fulfillment`
              )
            }
            itemEarnings = Math.floor((item.costPrice - item.productCost) * item.quantity)
            break

          default:
            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Invalid fulfillment type: ${item.fulfillmentType}`
            )
        }

        // Apply TDS (1% deduction) as per service logic
        const tdsAmount = Math.floor(itemEarnings * 0.01)
        const netItemEarnings = itemEarnings - tdsAmount

        totalEarnings += netItemEarnings
        itemEarnings.push({
          itemId: item.id,
          earnings: netItemEarnings,
          costPrice: item.costPrice,
          productCost: item.productCost,
        })
      }

      vendorPayouts.push({
        vendorId: vendorGroup.vendorId,
        totalEarnings,
        fulfillmentType,
        items: itemEarnings,
      })
    }

    return new StepResponse(vendorPayouts)
  }
)

// Step 4: Add earnings to vendor accounts
export const addVendorEarningsStep = createStep(
  "add-vendor-earnings",
  async function (
    input: {
      vendorPayouts: VendorPayout[]
      orderId: string
    },
    { container }
  ) {
    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    const results: Array<{
      vendorId: string
      payoutRecord: any
      totalEarnings: number
      success: boolean
      error?: string
    }> = []

    for (const vendorPayout of input.vendorPayouts) {
      try {
        // Add earnings to vendor balance using the payout service
        const payoutRecord = await payoutModuleService.addEarnings(
          vendorPayout.vendorId,
          vendorPayout.totalEarnings,
          input.orderId,
          vendorPayout.fulfillmentType
        )

        results.push({
          vendorId: vendorPayout.vendorId,
          payoutRecord,
          totalEarnings: vendorPayout.totalEarnings,
          success: true,
        })
      } catch (error) {
        console.error(`Failed to add earnings for vendor ${vendorPayout.vendorId}:`, error)
        
        results.push({
          vendorId: vendorPayout.vendorId,
          payoutRecord: null,
          totalEarnings: vendorPayout.totalEarnings,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return new StepResponse(results, async () => {
      // Compensation logic: reverse the earnings if workflow fails
      for (const result of results) {
        if (result.success && result.payoutRecord) {
          try {
            await payoutModuleService.addAdjustment(
              result.vendorId,
              -result.totalEarnings,
              `Reversal for failed order ${input.orderId}`
            )
          } catch (error) {
            console.error(`Failed to reverse earnings for vendor ${result.vendorId}:`, error)
          }
        }
      }
    })
  }
)
// do not delete
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"

type GetPayoutIdsStepInput = {
  order: any
}

interface VendorPayoutMapping {
  vendorId: string
  payoutId: string
}

const getPayoutIdsForVendorsStep = createStep(
  "get-payout-ids-for-vendors",
  async ({ order }: GetPayoutIdsStepInput, { container }) => {
    const payoutModuleService: PayoutModuleService = container.resolve(PAYOUT_MODULE)
    
    console.log(`Collecting vendor payout IDs for order ${order.id}`)

    if (!order?.items || order.items.length === 0) {
      throw new Error(`Order ${order.id} has no items`)
    }

    const vendorPayouts = new Map<string, string>() // vendorId -> payoutId
    const processedVendors = new Set<string>()

    // First pass: collect all unique vendors
    for (const item of order.items) {
      if (!item.product?.vendor) {
        console.warn(`Item ${item.id} has no vendor data`)
        continue
      }

      // Handle both single vendor object and array of vendors
      const vendors = Array.isArray(item.product.vendor) 
        ? item.product.vendor 
        : [item.product.vendor]

      for (const vendor of vendors) {
        if (!vendor?.id) {
          console.warn(`Invalid vendor in item ${item.id}`)
          continue
        }

        if (!processedVendors.has(vendor.id)) {
          processedVendors.add(vendor.id)
          
          try {
            console.log(`Getting payout account for vendor: ${vendor.id}`)
            
            // Get or create vendor payout account
            const vendorPayout = await payoutModuleService.getOrCreateVendorPayout(vendor.id)
            vendorPayouts.set(vendor.id, vendorPayout.id)
            
            console.log(`Vendor ${vendor.id} -> Payout ${vendorPayout.id}`)
            
          } catch (error) {
            console.error(`Failed to get payout for vendor ${vendor.id}:`, error)
            throw new Error(`Failed to get payout account for vendor ${vendor.id}: ${error.message}`)
          }
        }
      }
    }

    const vendorPayoutMappings: VendorPayoutMapping[] = Array.from(vendorPayouts.entries()).map(
      ([vendorId, payoutId]) => ({ vendorId, payoutId })
    )

    console.log(`Collected ${vendorPayoutMappings.length} vendor payout mappings:`)
    vendorPayoutMappings.forEach(mapping => {
      console.log(`  - Vendor ${mapping.vendorId} -> Payout ${mapping.payoutId}`)
    })

    return new StepResponse({
      vendorPayouts: vendorPayoutMappings,
      vendorPayoutMap: Object.fromEntries(vendorPayouts) // For easier lookup
    })
  }
)

export default getPayoutIdsForVendorsStep
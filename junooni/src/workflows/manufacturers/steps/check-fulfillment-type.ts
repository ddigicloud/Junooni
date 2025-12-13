import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CheckFulfillmentTypeInput = {
  order_id: string
  items: any[]
}

type FulfillmentCheckOutput = {
  has_junooni_fulfillment: boolean
  junooni_items: any[]
  creator_items: any[]
  summary: {
    total_items: number
    junooni_count: number
    creator_count: number
    uncategorized_count: number
  }
}

/**
 * Step to check fulfillment type for each order item
 * Returns items categorized by fulfillment type
 */
export const checkFulfillmentTypeStep = createStep(
  "check-fulfillment-type-step",
  async (input: CheckFulfillmentTypeInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    console.log(`🔍 Checking fulfillment type for ${input.items.length} items`)

    const junooniItems: any[] = []
    const creatorItems: any[] = []
    const uncategorizedItems: any[] = []

    // Check each item's product for fulfillment type
    for (const item of input.items) {
      const productId = item.product_id || item.variant?.product_id

      if (!productId) {
        console.warn(`⚠️ Item ${item.id} has no product_id, skipping`)
        uncategorizedItems.push(item)
        continue
      }

      try {
        // Fetch product with metadata
        const { data: [product] } = await query.graph({
          entity: "product",
          fields: ["id", "title", "metadata"],
          filters: {
            id: productId,
          },
        })

        if (!product) {
          console.warn(`⚠️ Product ${productId} not found`)
          uncategorizedItems.push(item)
          continue
        }

        // Parse fulfillment_type from metadata
        const fulfillmentTypeRaw = product.metadata?.fulfillment_type

        if (!fulfillmentTypeRaw) {
          console.log(`ℹ️ Product ${product.title} has no fulfillment_type`)
          uncategorizedItems.push(item)
          continue
        }

        let fulfillmentData: any
        try {
          fulfillmentData =
            typeof fulfillmentTypeRaw === "string"
              ? JSON.parse(fulfillmentTypeRaw)
              : fulfillmentTypeRaw
        } catch (e) {
          console.warn(`⚠️ Failed to parse fulfillment_type for product ${productId}:`, e)
          uncategorizedItems.push(item)
          continue
        }

        const fulfillmentType = fulfillmentData?.type

        // Categorize item based on fulfillment type
        if (fulfillmentType === "JUNOONI-fulfillment") {
          console.log(`✅ Product ${product.title}: JUNOONI-fulfillment`)
          junooniItems.push({
            ...item,
            product,
            fulfillment_data: fulfillmentData,
          })
        } else if (fulfillmentType === "creator_fulfilment") {
          console.log(`📦 Product ${product.title}: creator_fulfilment`)
          creatorItems.push({
            ...item,
            product,
            fulfillment_data: fulfillmentData,
          })
        } else {
          console.log(`❓ Product ${product.title}: unknown type (${fulfillmentType})`)
          uncategorizedItems.push(item)
        }
      } catch (error) {
        console.error(`❌ Error checking product ${productId}:`, error)
        uncategorizedItems.push(item)
      }
    }

    const result: FulfillmentCheckOutput = {
      has_junooni_fulfillment: junooniItems.length > 0,
      junooni_items: junooniItems,
      creator_items: creatorItems,
      summary: {
        total_items: input.items.length,
        junooni_count: junooniItems.length,
        creator_count: creatorItems.length,
        uncategorized_count: uncategorizedItems.length,
      },
    }

    console.log("📊 Fulfillment check summary:", result.summary)

    return new StepResponse(result)
  }
)

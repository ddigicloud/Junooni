import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CheckManufacturerBrandInput = {
  order_id: string
  items: any[]
}

type ManufacturerCheckOutput = {
  manufacturer: string | null
  manufacturer_items: any[]
  summary: {
    qikink_count: number
    other_brands_count: number
    no_brand_count: number
  }
}

// Manufacturer brand ID constants
const MANUFACTURER_BRANDS = {
  QIKINK: "01JMY0V6FDZ0E096N0CVNG2J40",
  // Add other manufacturers here as needed
}

/**
 * Step to check manufacturer brand for JUNOONI-fulfilled items
 * Identifies which manufacturer (Qikink, etc.) should fulfill each item
 */
export const checkManufacturerBrandStep = createStep(
  "check-manufacturer-brand-step",
  async (input: CheckManufacturerBrandInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    console.log(`🏭 Checking manufacturer brand for ${input.items.length} items`)

    const qikinkItems: any[] = []
    const otherBrandItems: any[] = []
    const noBrandItems: any[] = []

    // Check each item's product for brand
    for (const item of input.items) {
      const productId = item.product_id || item.product?.id

      if (!productId) {
        console.warn(`⚠️ Item ${item.id} has no product_id`)
        noBrandItems.push(item)
        continue
      }

      try {
        const brandId = await checkProductBrand(query, productId)

        if (!brandId) {
          console.log(`ℹ️ Product ${productId} has no brand`)
          noBrandItems.push(item)
          continue
        }

        // Check if brand matches Qikink
        if (brandId === MANUFACTURER_BRANDS.QIKINK) {
          console.log(`✅ Product ${productId}: Qikink brand matched`)
          qikinkItems.push({
            ...item,
            brand_id: brandId,
            manufacturer: "qikink",
          })
        } else {
          console.log(`📦 Product ${productId}: Other brand (${brandId})`)
          otherBrandItems.push({
            ...item,
            brand_id: brandId,
          })
        }
      } catch (error) {
        console.error(`❌ Error checking brand for product ${productId}:`, error)
        noBrandItems.push(item)
      }
    }

    // Determine primary manufacturer based on item count
    let manufacturer: string | null = null
    if (qikinkItems.length > 0) {
      manufacturer = "qikink"
    }
    // Add logic for other manufacturers here

    const result: ManufacturerCheckOutput = {
      manufacturer,
      manufacturer_items: qikinkItems, // Currently only Qikink supported
      summary: {
        qikink_count: qikinkItems.length,
        other_brands_count: otherBrandItems.length,
        no_brand_count: noBrandItems.length,
      },
    }

    console.log("🏭 Manufacturer check summary:", result.summary)
    console.log(`📦 Selected manufacturer: ${manufacturer || "none"}`)

    return new StepResponse(result)
  }
)

/**
 * Helper function to check product brand across multiple data sources
 */
async function checkProductBrand(
  query: any,
  productId: string
): Promise<string | null> {
  // Try direct brand_id field
  try {
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "brand_id", "brand.*", "metadata"],
      filters: {
        id: productId,
      },
    })

    if (!product) {
      return null
    }

    // Check direct brand_id
    if (product.brand_id) {
      console.log(`📋 Found brand_id on product: ${product.brand_id}`)
      return product.brand_id
    }

    // Check brand relationship
    if (product.brand?.id) {
      console.log(`📋 Found brand through relationship: ${product.brand.id}`)
      return product.brand.id
    }

    // Check metadata.brand_id
    if (product.metadata?.brand_id) {
      const brandId = parseBrandIdFromMetadata(product.metadata.brand_id)
      if (brandId) {
        console.log(`📋 Found brand_id in metadata: ${brandId}`)
        return brandId
      }
    }
  } catch (error) {
    console.warn("⚠️ Error querying product brand:", error)
  }

  // Try link table as fallback
  try {
    const { data: links } = await query.graph({
      entity: "link",
      fields: ["*"],
      filters: {
        product_id: productId,
      },
    })

    if (links && links.length > 0) {
      const brandLink = links.find(
        (link: any) => link.brand_id || link.data?.brand_id
      )

      if (brandLink) {
        const brandId = brandLink.brand_id || brandLink.data?.brand_id
        console.log(`📋 Found brand_id through link: ${brandId}`)
        return brandId
      }
    }
  } catch (error) {
    console.warn("⚠️ Error querying link table:", error)
  }

  return null
}

/**
 * Helper to parse brand_id from various metadata formats
 */
function parseBrandIdFromMetadata(brandIdRaw: any): string | null {
  try {
    if (typeof brandIdRaw === "string") {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(brandIdRaw)
        return parsed?.id || parsed?.brand_id || brandIdRaw
      } catch {
        return brandIdRaw
      }
    } else if (typeof brandIdRaw === "object" && brandIdRaw !== null) {
      return brandIdRaw.id || brandIdRaw.brand_id || String(brandIdRaw)
    }
    return String(brandIdRaw)
  } catch {
    return null
  }
}

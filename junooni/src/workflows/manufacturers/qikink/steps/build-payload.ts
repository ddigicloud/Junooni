import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type BuildQikinkPayloadInput = {
  order: any
  items: any[]
}

type BuildQikinkPayloadOutput = {
  payload: any
  shortOrderId: string
}

// Print technology mapping - Qikink IDs
const PRINT_TECHNOLOGY_MAP: Record<string, string> = {
  "dtg": "1",
  "direct to garment": "1",
  "all over printed": "2",
  "aop": "2",
  "embroidery": "3",
  "accessories": "5",
  "puff print": "6",
  "puff": "6",
  "glow in dark": "7",
  "glow-in-dark": "7",
  "rainbow vinyl": "12",
  "rainbow vinyl printing": "12",
  "gold vinyl": "13",
  "gold vinyl printing": "13",
  "silver vinyl": "14",
  "silver vinyl printing": "14",
  "reflective grey vinyl": "15",
  "reflective grey vinyl printing": "15",
  "dtf": "17",
  "direct to film": "17",
}

/**
 * Step to build complete Qikink API payload
 * Handles all the complex logic for artwork, designs, and item mapping
 */
export const buildQikinkPayloadStep = createStep(
  "build-qikink-payload-step",
  async (input: BuildQikinkPayloadInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    console.log("📦 Building Qikink payload...")

    // Generate short order ID for Qikink (max 50 chars)
    const shortOrderId = generateShortOrderId()
    console.log(`📋 Generated Qikink order number: ${shortOrderId}`)

    // Determine payment gateway
    const gateway = determineGateway(input.order)
    console.log(`💳 Payment gateway: ${gateway}`)

    // Process each item to build line_items array
    const lineItems = await processItems(query, input.items)
    console.log(`✅ Processed ${lineItems.length} line items for Qikink`)

    // Build complete payload
    const payload = {
      order_number: shortOrderId,
      qikink_shipping: "1",
      gateway: gateway,
      total_order_value: ((input.order.total || 0) / 100).toFixed(2),
      line_items: lineItems,
      shipping_address: {
        first_name: input.order.shipping_address?.first_name || "",
        last_name: input.order.shipping_address?.last_name || "",
        address1: input.order.shipping_address?.address_1 || "",
        phone: input.order.shipping_address?.phone || "",
        email: input.order.email || "",
        city: input.order.shipping_address?.city || "",
        zip: input.order.shipping_address?.postal_code || "",
        province: input.order.shipping_address?.province || "",
        country_code: (
          input.order.shipping_address?.country_code || "IN"
        ).toUpperCase(),
      },
    }

    console.log("📦 Qikink payload built successfully")
    console.log(`   - Line items: ${lineItems.length}`)
    console.log(`   - Total value: ₹${payload.total_order_value}`)
    console.log(`   - Shipping to: ${payload.shipping_address.city}, ${payload.shipping_address.country_code}`)

    return new StepResponse({
      payload,
      shortOrderId,
    })
  }
)

/**
 * Generate short order ID for Qikink (max 50 chars)
 */
function generateShortOrderId(): string {
  const timestamp = Date.now().toString().slice(-9)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ORD${timestamp}${random}`
}

/**
 * Determine payment gateway based on payment provider
 */
function determineGateway(order: any): string {
  const paymentSession = order.payment_collection?.payment_sessions?.[0]
  const providerId = paymentSession?.provider_id?.toLowerCase() || ""

  console.log(`🔍 Payment provider: ${providerId}`)

  if (providerId.includes("razorpay") || providerId === "razorpay") {
    return "Prepaid"
  }

  if (providerId.includes("manual") || providerId === "pp_system_default") {
    return "COD"
  }

  if (providerId.includes("stripe")) {
    return "PREPAID"
  }

  console.log("⚠️ Unknown provider, defaulting to COD")
  return "COD"
}

/**
 * Process items to build Qikink line_items array
 */
async function processItems(query: any, items: any[]): Promise<any[]> {
  const lineItems: any[] = []

  for (const item of items) {
    console.log(`🎨 Processing item: ${item.variant?.title || item.title}`)

    const product = item.product
    if (!product) {
      console.warn(`⚠️ Item ${item.id} has no product data`)
      continue
    }

    // Get artwork data
    const artworkData = await fetchArtworkForProduct(
      query,
      product.id,
      item.metadata || {}
    )

    // Determine print type
    const printTypeId = determinePrintTypeId(item, product)

    // Get manufacturer SKU
    const manufacturerSku =
      item.variant?.metadata?.manufacturer_sku ||
      item.metadata?.manufacturer_sku ||
      "MVnHs-Wh-S"

    // Build designs array from artwork
    const designs = buildDesigns(artworkData, item)

    const lineItem = {
      search_from_my_products: 0,
      quantity: (item.quantity || 1).toString(),
      price: ((item.unit_price || 0) / 100).toFixed(2),
      sku: manufacturerSku,
      print_type_id: printTypeId,
      designs,
    }

    lineItems.push(lineItem)

    console.log(`✅ Added line item:`)
    console.log(`   - SKU: ${manufacturerSku}`)
    console.log(`   - Quantity: ${lineItem.quantity}`)
    console.log(`   - Print type: ${printTypeId}`)
    console.log(`   - Designs: ${designs.length}`)
  }

  return lineItems
}

/**
 * Determine print type ID from product metadata
 */
function determinePrintTypeId(item: any, product: any): string {
  // Check item metadata first
  const itemPrintType =
    item.metadata?.qikink_print_type_id ||
    item.variant?.metadata?.qikink_print_type_id

  if (itemPrintType) {
    console.log(`✅ Using print_type_id from item: ${itemPrintType}`)
    return String(itemPrintType)
  }

  // Check product print technology name
  const printTechName = product.metadata?.print_technology_name
  if (printTechName) {
    const normalized = String(printTechName).toLowerCase().trim()
    const mapped = PRINT_TECHNOLOGY_MAP[normalized]

    if (mapped) {
      console.log(`✅ Mapped '${normalized}' to print_type_id: ${mapped}`)
      return mapped
    }
  }

  // Check product metadata
  const productPrintType = product.metadata?.qikink_print_type_id
  if (productPrintType) {
    console.log(`✅ Using print_type_id from product: ${productPrintType}`)
    return String(productPrintType)
  }

  // Default to DTG
  console.log("⚠️ No print type found, defaulting to DTG (1)")
  return "1"
}

/**
 * Fetch artwork for product
 */
async function fetchArtworkForProduct(
  query: any,
  productId: string,
  itemMetadata: Record<string, any>
) {
  // Try to resolve artwork ID
  const artworkId = await resolveArtworkId(query, productId, itemMetadata)

  if (!artworkId) {
    console.log(`ℹ️ No artwork ID found for product ${productId}`)
    return null
  }

  // Fetch artwork data
  try {
    const { data: artwork } = await query.graph({
      entity: "vendor_artwork",
      fields: ["*", "medias.*"],
      filters: {
        id: artworkId,
      },
    })

    if (!artwork || artwork.length === 0) {
      console.warn(`⚠️ Artwork ${artworkId} not found`)
      return null
    }

    const artworkData = artwork[0]
    const mediaFiles = artworkData?.medias || []

    console.log(`✅ Found artwork with ${mediaFiles.length} media files`)

    return {
      artworkData,
      mediaFiles,
    }
  } catch (error) {
    console.error(`❌ Error fetching artwork:`, error)
    return null
  }
}

/**
 * Resolve artwork ID from various sources
 */
async function resolveArtworkId(
  query: any,
  productId: string,
  itemMetadata: Record<string, any>
): Promise<string | null> {
  // Check item metadata first
  const fromItem =
    itemMetadata?.artwork_id ||
    itemMetadata?.artworkId ||
    itemMetadata?.design_artwork_id ||
    itemMetadata?.vendor_artwork_id

  if (fromItem) {
    console.log(`🎯 Found artwork ID in item metadata: ${fromItem}`)
    return String(fromItem)
  }

  // Check item design_artwork
  if (itemMetadata?.design_artwork) {
    try {
      const da =
        typeof itemMetadata.design_artwork === "string"
          ? JSON.parse(itemMetadata.design_artwork)
          : itemMetadata.design_artwork

      if (Array.isArray(da) && da[0]?.artwork_id) {
        console.log(`🎯 Found artwork ID in design_artwork: ${da[0].artwork_id}`)
        return String(da[0].artwork_id)
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse design_artwork from item")
    }
  }

  // Check product metadata
  try {
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: productId,
      },
    })

    if (!product) return null

    const designArtworkRaw = product.metadata?.design_artwork
    if (designArtworkRaw) {
      try {
        const designArtwork =
          typeof designArtworkRaw === "string"
            ? JSON.parse(designArtworkRaw)
            : designArtworkRaw

        if (Array.isArray(designArtwork) && designArtwork.length > 0) {
          const first = designArtwork[0]
          const artworkId =
            first?.artwork_id ||
            first?.vendor_artwork_id ||
            first?.artwork_data?.vendor_artwork?.id

          if (artworkId) {
            console.log(`🎯 Found artwork ID in product design_artwork: ${artworkId}`)
            return String(artworkId)
          }
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse design_artwork from product")
      }
    }

    // Check other product fields
    const candidates = [
      product.metadata?.artwork_id,
      product.metadata?.vendor_artwork_id,
    ]

    for (const c of candidates) {
      if (c) {
        console.log(`🎯 Found artwork ID in product metadata: ${c}`)
        return String(c)
      }
    }
  } catch (error) {
    console.error("❌ Error resolving artwork ID:", error)
  }

  return null
}

/**
 * Build designs array from artwork data
 */
function buildDesigns(artworkData: any, item: any): any[] {
  if (!artworkData?.mediaFiles || artworkData.mediaFiles.length === 0) {
    console.log("⚠️ No artwork media files, using fallback design")
    return buildFallbackDesign(item)
  }

  const designs: any[] = []
  const baseUrl = process.env.BACKEND_URL || "https://files.junooni.com"

  // Group designs by area
  const designsByArea: Record<string, any[]> = {}
  const layoutsByArea: Record<string, string> = {}

  artworkData.mediaFiles.forEach((media: any) => {
    const area = getAreaFromDescription(media.file_description || "")
    const desc = String(media.file_description || "").toLowerCase()
    const url = media.fileId
      ? `${baseUrl}/junooni-files/${media.fileId}`
      : media.url || media.file_url || ""

    if (!isValidUrl(url)) return

    if (desc.includes("design element") && !desc.includes("manufacturing layout")) {
      if (!designsByArea[area]) {
        designsByArea[area] = []
      }
      designsByArea[area].push({
        area,
        url,
        description: media.file_description,
      })
    } else if (desc.includes("manufacturing layout")) {
      layoutsByArea[area] = url
    }
  })

  // Build design objects
  Object.entries(designsByArea).forEach(([area, elements]) => {
    elements.forEach((element) => {
      const placementSku = getPlacementSku(area)
      const variantTitle = item.variant?.title || "default"
      const designCode =
        variantTitle.length > 17
          ? `${variantTitle.substring(0, 17)}-${placementSku}`
          : `${variantTitle}-${placementSku}`

      designs.push({
        design_code: designCode,
        width_inches: "",
        height_inches: "",
        placement_sku: placementSku,
        mockup_link: layoutsByArea[area] || item.thumbnail || "",
        design_link: element.url,
      })

      console.log(`   ✅ Added ${area} design: ${element.url}`)
    })
  })

  if (designs.length === 0) {
    console.log("⚠️ No valid designs found in artwork, using fallback")
    return buildFallbackDesign(item)
  }

  return designs
}

/**
 * Build fallback design when no artwork is available
 */
function buildFallbackDesign(item: any): any[] {
  const fallbackDesignLink =
    item.metadata?.qikink_design_link ||
    item.variant?.metadata?.qikink_design_link ||
    item.thumbnail ||
    ""

  const design: any = {
    design_code: item.variant?.title || "default",
    width_inches: "",
    height_inches: "",
    placement_sku: "fr",
    mockup_link: item.thumbnail || "",
  }

  if (isValidUrl(fallbackDesignLink)) {
    design.design_link = fallbackDesignLink
    console.log(`✅ Using fallback design: ${fallbackDesignLink}`)
  } else {
    console.warn("⚠️ No valid design link available")
  }

  return [design]
}

/**
 * Helper: Get area from file description
 */
function getAreaFromDescription(desc: string): string {
  const lower = desc.toLowerCase()
  if (lower.includes("front area")) return "front"
  if (lower.includes("back area")) return "back"
  if (lower.includes("left sleeve")) return "left_sleeve"
  if (lower.includes("right sleeve")) return "right_sleeve"
  return "front"
}

/**
 * Helper: Get placement SKU from area
 */
function getPlacementSku(area: string): string {
  const mapping: Record<string, string> = {
    front: "fr",
    back: "bk",
    left_sleeve: "sl",
    right_sleeve: "sr",
  }
  return mapping[area] || "fr"
}

/**
 * Helper: Validate URL
 */
function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith("http://") || url.startsWith("https://")
  } catch {
    return false
  }
}

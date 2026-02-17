import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CreateQikinkOrderInput = {
  order: any
  items: any[]
  token: string
}

type CreateQikinkOrderOutput = {
  order_id: number
  order_number: string
  tracking: {
    tracking_number: string | null
    tracking_url: string | null
    carrier: string | null
  }
  message: string
  raw_response?: any
}

/**
 * Complete Qikink order creation step - fully self-contained
 * Does NOT call other steps to avoid invoke() errors
 */
export const createQikinkOrderStep = createStep(
  "create-qikink-order-step",
  async (input: CreateQikinkOrderInput, { container }) => {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎯 Starting Qikink Order Creation")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`📦 Order: ${input.order.display_id}`)
    console.log(`📦 Items: ${input.items.length}`)

    try {
      const token = input.token

      if (!token) {
        throw new Error("Qikink access token not provided")
      }

      console.log("✅ Token validated")

      // Environment variables
      const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
      const QIKINK_API_URL = process.env.QIKINK_API_URL || "https://sandbox.qikink.com/api/order/create"

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // BUILD PAYLOAD
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log("\n📦 Building Qikink payload...")

      // Use original order number (display_id)
      const orderNumber = input.order.display_id || input.order.id

      console.log(`📋 Order number: ${orderNumber}`)

      // Determine payment gateway
      const paymentCollections = input.order.payment_collections || []
      let gateway = "COD"

      console.log(`📦 Payment collections count: ${paymentCollections.length}`)

      if (paymentCollections.length > 0) {
        const paymentCollection = paymentCollections[0] // Get first collection
        
        console.log(`✓ Payment collection found: ${paymentCollection.id}`)
        console.log(`✓ Status: ${paymentCollection.status}`)
        
        // Check completed payments first (most reliable)
        const completedPayments = paymentCollection.payments || []
        const paymentSessions = paymentCollection.payment_sessions || []
        
        console.log(`✓ Completed payments: ${completedPayments.length}`)
        console.log(`✓ Payment sessions: ${paymentSessions.length}`)
        
        // Combine and check all payments
        const allPayments = [...completedPayments, ...paymentSessions]
        
        for (const payment of allPayments) {
          const providerId = (payment?.provider_id || "").toLowerCase()
          
          console.log(`  🔍 Checking provider: "${providerId}"`)
          
          // Check for Razorpay (can be "razorpay" or "pp_razorpay_razorpay")
          if (providerId.includes("razorpay")) {
            gateway = "Prepaid"
            console.log(`  ✅ Razorpay detected -> Gateway: ${gateway}`)
            break
          } 
          // Check for Stripe
          else if (providerId.includes("stripe")) {
            gateway = "PREPAID"
            console.log(`  ✅ Stripe detected -> Gateway: ${gateway}`)
            break
          }
        }
        
        if (gateway === "COD" && allPayments.length > 0) {
          console.log(`  ⚠️ Unknown payment provider: ${allPayments[0]?.provider_id}`)
          console.log(`  ⚠️ Defaulting to COD`)
        }
      } else {
        console.log("  ⚠️ No payment collections found - defaulting to COD")
      }

      console.log(`\n💳 FINAL Gateway: ${gateway}`)

      // Build line items with proper artwork resolution
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const lineItems = []

      for (let index = 0; index < input.items.length; index++) {
        const item = input.items[index]
        //console.log(`\n🎨 Item ${index + 1}: ${item.variant?.title || item.title}`)

        // Get SKU
        const sku = item.variant?.metadata?.manufacturer_sku ||
                   item.metadata?.manufacturer_sku ||
                   "MVnHs-Wh-S"

        //console.log(`   SKU: ${sku}`)

        // Determine print type
        const printTypeId = await determinePrintTypeId(item, item.product)
        //console.log(`   Print type: ${printTypeId}`)

        // Fetch artwork and build designs
        const designs = await buildDesignsForItem(query, item)
        //console.log(`   Designs: ${designs.length}`)

        const lineItem = {
          search_from_my_products: 0,
          quantity: item.quantity.toString(),
          price: ((item.unit_price || 0)).toFixed(2),
          sku: sku,
          print_type_id: printTypeId,
          designs,
        }

        lineItems.push(lineItem)
      }

      // Build shipping address
      const shippingAddress = {
        first_name: input.order.shipping_address?.first_name || "Customer",
        last_name: input.order.shipping_address?.last_name || "",
        address1: input.order.shipping_address?.address_1 || "",
        phone: input.order.shipping_address?.phone || "",
        email: input.order.email || "",
        city: input.order.shipping_address?.city || "",
        zip: input.order.shipping_address?.postal_code || "",
        province: input.order.shipping_address?.province || "",
        country_code: (input.order.shipping_address?.country_code || "IN").toUpperCase(),
      }

      console.log("\n✅ Shipping address:")
      console.log(`   ${shippingAddress.first_name} ${shippingAddress.last_name}`)
      console.log(`   ${shippingAddress.address1}`)
      console.log(`   ${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.country_code} - ${shippingAddress.zip}`)
      console.log(`   Phone: ${shippingAddress.phone}`)
      console.log(`   Email: ${shippingAddress.email}`)

      // Build complete payload
      const payload = {
        order_number: orderNumber,
        qikink_shipping: "1",
        gateway: gateway,
        total_order_value: ((input.order.total || 0)).toFixed(2), // Use item_total which includes discounts
        line_items: lineItems,
        shipping_address: shippingAddress,
      }

      console.log(`\n✅ Payload ready:`)
      console.log(`Payload Summary: `)
      console.log(`   Items: ${lineItems.length}`)
      console.log(`   Item Total (after discounts): ₹${payload.total_order_value}`)
      console.log(`   Order Total: ₹${((input.order.total || 0)).toFixed(2)}`)
      console.log(`   Discount Applied: ₹${((input.order.discount_total || 0)).toFixed(2)}`)
      console.log(`   Shipping: ${shippingAddress.city}, ${shippingAddress.country_code}`)
      console.log("Total payload", JSON.stringify(payload, null, 2))
      
      // DEBUG: Log designs array specifically
      console.log("\n🔍 DEBUG - Designs being sent:")
      payload.line_items.forEach((item: any, index: number) => {
        console.log(`\n   Item ${index + 1} - SKU: ${item.sku}`)
        item.designs.forEach((design: any, designIndex: number) => {
          console.log(`      Design ${designIndex + 1}:`)
          console.log(`         - design_code: "${design.design_code}"`)
          console.log(`         - width_inches: "${design.width_inches}" (type: ${typeof design.width_inches})`)
          console.log(`         - height_inches: "${design.height_inches}" (type: ${typeof design.height_inches})`)
          console.log(`         - placement_sku: "${design.placement_sku}"`)
        })
      })

      
      // console.log(`\n📤 Submitting to Qikink...`)
      // console.log(`🔗 URL: ${QIKINK_API_URL}`)
      // console.log(`🔑 Client ID: ${QIKINK_CLIENT_ID}`)
      // console.log(`🔑 Token preview: ${token ? token.substring(0, 20) + '...' : 'MISSING'}`)

      const response = await fetch(QIKINK_API_URL, {
        method: "POST",
        headers: {
          ClientId: QIKINK_CLIENT_ID,
          Accesstoken: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      console.log(`📥 Response status: ${response.status}`)
      console.log(`📦 Response:`, JSON.stringify(responseData, null, 2))

      if (!response.ok) {
        throw new Error(
          responseData.message || responseData.error || `Qikink API error: ${response.status}`
        )
      }

      const qikinkOrderId = responseData.order_id
      const qikinkOrderNumber = responseData.number || orderNumber

      console.log(`\n✅ Order created in Qikink!`)
      console.log(`   ID: ${qikinkOrderId}`)
      console.log(`   Number: ${qikinkOrderNumber}`)

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // FETCH TRACKING (optional)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      //console.log(`\n📡 Fetching tracking info...`)
      let trackingInfo = {
        tracking_number: null as string | null,
        tracking_url: null as string | null,
        carrier: null as string | null,
      }

      try {
        // FIX: Remove /api from base URL to avoid double /api/api/
        const baseUrl = QIKINK_API_URL.replace("/api/order/create", "")
        const trackingUrl = `${baseUrl}/api/order?id=${qikinkOrderId}`
        
        //console.log(`🔗 Tracking URL: ${trackingUrl}`)

        const trackingResponse = await fetch(trackingUrl, {
          method: "GET",
          headers: {
            ClientId: QIKINK_CLIENT_ID,
            Accesstoken: token,
          },
        })

        //console.log(`📥 Tracking response status: ${trackingResponse.status}`)

        if (trackingResponse.ok) {
          const trackingData = await trackingResponse.json()
          //console.log(`📦 Tracking data:`, JSON.stringify(trackingData, null, 2))
          
          const orderData = Array.isArray(trackingData) ? trackingData[0] : trackingData

          // Check for tracking in shipping object
          if (orderData?.shipping) {
            const shipping = orderData.shipping
            trackingInfo = {
              tracking_number: shipping.awb || null,
              tracking_url: shipping.tracking_link || null,
              carrier: shipping.courier_provider_name || "Qikink",
            }
            
            if (trackingInfo.tracking_number) {
              //console.log(`✅ Tracking found: ${trackingInfo.tracking_number}`)
            } else if (trackingInfo.tracking_url) {
              //console.log(`✅ Tracking URL found: ${trackingInfo.tracking_url}`)
            } else {
              //console.log(`ℹ️ Tracking not yet assigned (AWB pending)`)
            }
          } else {
            //console.log(`ℹ️ No shipping data in response`)
          }
        } else {
          const errorText = await trackingResponse.text()
          //console.log(`⚠️ Tracking request failed: ${errorText}`)
        }
      } catch (error) {
        //console.log(`⚠️ Tracking fetch error:`, error)
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // UPDATE MEDUSA ORDER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // console.log(`\n💾 Updating Medusa order...`)
      // console.log(`📋 Order ID: ${input.order.id}`)
      
      try {
        const orderService = container.resolve("order")
        
        const updatedMetadata = {
          ...input.order.metadata,
          qikink_order_id: qikinkOrderId,
          qikink_order_number: qikinkOrderNumber,
          qikink_synced_at: new Date().toISOString(),
          qikink_tracking_number: trackingInfo.tracking_number,
          qikink_tracking_url: trackingInfo.tracking_url,
          qikink_carrier: trackingInfo.carrier,
        }
        
        // console.log(`📦 Updating with metadata:`)
        // console.log(`   - qikink_order_id: ${qikinkOrderId}`)
        // console.log(`   - qikink_order_number: ${qikinkOrderNumber}`)
        // console.log(`   - qikink_tracking_url: ${trackingInfo.tracking_url || 'pending'}`)
        // console.log(`   - qikink_tracking_number: ${trackingInfo.tracking_number || 'pending'}`)
        // console.log(`   - qikink_carrier: ${trackingInfo.carrier || 'pending'}`)
        
        // Use updateOrders with proper payload structure (array of updates)
        const result = await orderService.updateOrders([{
          id: input.order.id,
          metadata: updatedMetadata,
        }])
        
        // console.log(`✅ Order metadata update call completed`)
        // console.log(`📦 Update result:`, JSON.stringify(result, null, 2))
        
        // Verify the update by fetching the order back
        try {
          const updatedOrder = await orderService.retrieveOrder(input.order.id, {
            select: ["id", "metadata"]
          })
          
          // console.log(`\n📦 Verified order metadata:`)
          // console.log(`   - qikink_order_id: ${updatedOrder.metadata?.qikink_order_id || 'NOT SET'}`)
          // console.log(`   - qikink_tracking_url: ${updatedOrder.metadata?.qikink_tracking_url || 'NOT SET'}`)
          // console.log(`   - qikink_tracking_number: ${updatedOrder.metadata?.qikink_tracking_number || 'NOT SET'}`)
          // console.log(`   - qikink_carrier: ${updatedOrder.metadata?.qikink_carrier || 'NOT SET'}`)
        } catch (verifyError) {
          //console.log(`⚠️ Could not verify order metadata:`, verifyError)
        }
        
      } catch (error) {
        // console.error(`❌ Failed to update order metadata:`)
        // console.error(error)
        // Don't throw - we still want to return success since Qikink order was created
      }

      // Return result
      const result: CreateQikinkOrderOutput = {
        order_id: qikinkOrderId,
        order_number: qikinkOrderNumber,
        tracking: trackingInfo,
        message: "Qikink order created successfully",
        raw_response: responseData,
      }

      // console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      // console.log("🎉 SUCCESS!")
      // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      // console.log(`✅ Medusa Order: ${input.order.display_id}`)
      // console.log(`✅ Qikink Order: ${qikinkOrderNumber} (ID: ${qikinkOrderId})`)
      if (trackingInfo.tracking_number) {
        // console.log(`✅ Tracking Number: ${trackingInfo.tracking_number}`)
      }
      if (trackingInfo.tracking_url) {
        //console.log(`✅ Tracking URL: ${trackingInfo.tracking_url}`)
      }
      //console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

      return new StepResponse(result, {
        qikink_order_id: result.order_id,
        qikink_order_number: result.order_number,
      })
    } catch (error) {
      // console.error("\n❌━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      // console.error("❌ FAILED")
      // console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      // console.error(error)
      // console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
      throw error
    }
  },

  // Compensation
  async (compensationData) => {
    if (compensationData?.qikink_order_id) {
      //console.log(`\n⚠️ Qikink order ${compensationData.qikink_order_id} may need manual cancellation\n`)
    }
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Print technology mapping
const PRINT_TECHNOLOGY_MAP: Record<string, string> = {
  "dtg": "1",
  "direct to garment": "1",
  "all over printed": "2",
  "aop": "2"  ,
  "sublimation": "2",
  "embroidery": "3",
  "accessories": "5",
  "digital": "5",
  "puff print": "6",
  "puff": "6",
  "glow in dark": "7",
  "glow-in-dark": "7",
  "rainbow vinyl": "12",
  "gold vinyl": "13",
  "silver vinyl": "14",
  "reflective grey vinyl": "15",
  "dtf": "17",
  "direct to film": "17",
}

/**
 * Determine print type ID from product metadata
 */
async function determinePrintTypeId(item: any, product: any): Promise<string> {
  // Check item metadata first
  const itemPrintType =
    item.metadata?.qikink_print_type_id ||
    item.variant?.metadata?.qikink_print_type_id

  if (itemPrintType) {
    //console.log(`   ✅ Using print_type_id from item: ${itemPrintType}`)
    return String(itemPrintType)
  }

  // Check product print technology name
  const printTechName = product?.metadata?.print_technology_name
  if (printTechName) {
    const normalized = String(printTechName).toLowerCase().trim()
    const mapped = PRINT_TECHNOLOGY_MAP[normalized]

    if (mapped) {
      //console.log(`   ✅ Mapped '${normalized}' to print_type_id: ${mapped}`)
      return mapped
    }
  }

  // Check product metadata
  const productPrintType = product?.metadata?.qikink_print_type_id
  if (productPrintType) {
    //console.log(`   ✅ Using print_type_id from product: ${productPrintType}`)
    return String(productPrintType)
  }

  // Default to DTG
  //console.log("   ⚠️ No print type found, defaulting to DTG (1)")
  return "1"
}

/**
 * Build designs for item by fetching artwork
 */
async function buildDesignsForItem(query: any, item: any): Promise<any[]> {
  const product = item.product

  if (!product) {
    //console.log(`   ⚠️ No product data, using fallback design`)
    return buildFallbackDesign(item)
  }

  // Fetch artwork
  const artworkData = await fetchArtworkForProduct(query, product.id, item.metadata || {})

  if (!artworkData?.mediaFiles || artworkData.mediaFiles.length === 0) {
    //console.log("   ⚠️ No artwork found, using fallback design")
    return buildFallbackDesign(item)
  }

  const designs: any[] = []
  const baseUrl = process.env.BACKEND_URL || "https://files.junooni.com"

  // Group designs by area
  const designsByArea: Record<string, any[]> = {}
  const layoutsByArea: Record<string, string> = {}
  const dimensionsByArea: Record<string, { width: string; height: string }> = {}

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
      
      // Extract dimensions from "Printable Area" section in manufacturing layout
      const dimensions = extractPrintableAreaDimensions(media.file_description)
      if (dimensions.width && dimensions.height) {
        dimensionsByArea[area] = dimensions
        console.log(`   📏 Extracted ${area} printable area dimensions: ${dimensions.width}" x ${dimensions.height}"`)
      }
    }
  })

  // Build design objects
Object.entries(designsByArea).forEach(([area, elements]) => {
  elements.forEach((element) => {
    const placementSku = getPlacementSku(area)
    
    // Get dimensions for this area from manufacturing layout
    const dimensions = dimensionsByArea[area] || { width: "", height: "" }
    
    console.log(`   📏 ${area} final dimensions: ${dimensions.width}" x ${dimensions.height}"`)
    
    // Extract date and random part from variant SKU
    // Expected format: JUNI-golden-yellow-x-271225-MJNYKZ9N
    const variantSku = item?.variant?.sku || ""
    
    console.log("🔍 Debug SKU extraction:")
    console.log("   variant SKU:", variantSku)
    
    let baseDesignCode = ""
    
    // Split by dash and get the last two parts (date and random)
    const skuParts = variantSku.split("-")
    
    if (skuParts.length >= 2) {
      // Get last two parts: date (271225) and random (MJNYKZ9N)
      const datePart = skuParts[skuParts.length - 2]
      const randomPart = skuParts[skuParts.length - 1]
      
      // Check if datePart looks like a date (6 digits: DDMMYY)
      if (datePart && /^\d{6}$/.test(datePart)) {
        baseDesignCode = `${datePart}-${randomPart}`
        console.log("   ✅ Extracted base design code:", baseDesignCode)
      } else {
        // Fallback: use just the last part
        baseDesignCode = randomPart || "default"
        console.log("   ⚠️ Date format not found, using last part:", baseDesignCode)
      }
    } else {
      // Fallback for unexpected format - keep under 20 chars
      const randomSuffix = Math.floor(Math.random() * 9000) + 1000
      baseDesignCode = `def-${randomSuffix}` // Max 9 chars
      console.log("   ⚠️ SKU format unexpected, using random:", baseDesignCode)
    }

    // 🔥 CRITICAL: Make design_code unique per area (Qikink requirement)
    // Use area suffix to differentiate designs for different placements
    const areaCode = area.substring(0, 2).toUpperCase() // FR, BA, LS, RS, LP
    const designCode = `${baseDesignCode}-${areaCode}`
    
    console.log(`   ✅ Created unique design code for ${area}: ${designCode}`)

    designs.push({
      design_code: designCode,  // ✅ Now unique per area!
      width_inches: dimensions.width || "",
      height_inches: dimensions.height || "",
      placement_sku: placementSku,
      mockup_link: layoutsByArea[area] || item.thumbnail || "",
      design_link: element.url,
    })

    console.log(`   ✅ Added ${area} design with code ${designCode}: ${element.url}`)
  })
})

  if (designs.length === 0) {
    //console.log("   ⚠️ No valid designs found in artwork, using fallback")
    return buildFallbackDesign(item)
  }

  return designs
}

/**
 * Fetch artwork for product
 */
async function fetchArtworkForProduct(
  query: any,
  productId: string,
  itemMetadata: Record<string, any>
) {
  // Resolve artwork ID
  const artworkId = await resolveArtworkId(query, productId, itemMetadata)

  if (!artworkId) {
    //console.log(`   ℹ️ No artwork ID found for product ${productId}`)
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
      console.log(`   ⚠️ Artwork ${artworkId} not found`)
      return null
    }

    const artworkData = artwork[0]
    const mediaFiles = artworkData?.medias || []

    //console.log(`   ✅ Found artwork with ${mediaFiles.length} media files`)

    return {
      artworkData,
      mediaFiles,
    }
  } catch (error) {
    console.error(`   ❌ Error fetching artwork:`, error)
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
    console.log(`   🎯 Found artwork ID in item metadata: ${fromItem}`)
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
        console.log(`   🎯 Found artwork ID in design_artwork: ${da[0].artwork_id}`)
        return String(da[0].artwork_id)
      }
    } catch (e) {
      console.log("   ⚠️ Failed to parse design_artwork from item")
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
            console.log(`   🎯 Found artwork ID in product design_artwork: ${artworkId}`)
            return String(artworkId)
          }
        }
      } catch (e) {
        console.log("   ⚠️ Failed to parse design_artwork from product")
      }
    }

    // Check other product fields
    const candidates = [
      product.metadata?.artwork_id,
      product.metadata?.vendor_artwork_id,
    ]

    for (const c of candidates) {
      if (c) {
        console.log(`   🎯 Found artwork ID in product metadata: ${c}`)
        return String(c)
      }
    }
  } catch (error) {
    console.error("   ❌ Error resolving artwork ID:", error)
  }

  return null
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
    console.log(`   ✅ Using fallback design: ${fallbackDesignLink}`)
  } else {
    console.log("   ⚠️ No valid design link available")
  }

  return [design]
}

/**
 * Helper: Get area from file description
 */
function getAreaFromDescription(desc: string): string {
  const lower = desc.toLowerCase()
  
  console.log(`\n🔍 DEBUG getAreaFromDescription:`)
  console.log(`   Input: "${desc.substring(0, 100)}..."`)
  
  // Extract area from the TITLE line (most reliable)
  // Match "MANUFACTURING LAYOUT - {AREA} AREA" or "{area} design element"
  const titleMatch = desc.match(/(?:MANUFACTURING LAYOUT -|design element \d+ -)\s*([A-Z_a-z]+)\s+(?:AREA|design)/i)
  if (titleMatch) {
    const area = titleMatch[1].toLowerCase().replace(/sleeves?/, 'sleeve')
    console.log(`   ✅ Extracted from title: ${area}`)
    
    // Normalize area names
    if (area === 'left_sleeve' || area === 'left' || area === 'left_sleeves') return 'left_sleeve'
    if (area === 'right_sleeve' || area === 'right' || area === 'right_sleeves') return 'right_sleeve'
    if (area === 'left_pocket') return 'left_pocket'
    if (area === 'right_pocket') return 'right_pocket'
    if (area === 'back') return 'back'
    if (area === 'front') return 'front'
  }
  
  // Fallback: Check for specific area keywords using word boundaries
  if (/\bleft[_\s]sleeve/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): left_sleeve`)
    return "left_sleeve"
  }
  if (/\bright[_\s]sleeve/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): right_sleeve`)
    return "right_sleeve"
  }
  if (/\bleft[_\s]pocket/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): left_pocket`)
    return "left_pocket"
  }
  if (/\bright[_\s]pocket/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): right_pocket`)
    return "right_pocket"
  }
  if (/\bfront\b/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): front`)
    return "front"
  }
  if (/\bback\b/i.test(desc)) {
    console.log(`   ✅ Matched (fallback): back`)
    return "back"
  }
  
  console.log(`   ⚠️ No match - defaulting to front`)
  return "front"
}

/**
 * Helper: Get placement SKU from area
 */
function getPlacementSku(area: string): string {
  const mapping: Record<string, string> = {
    front: "fr",
    back: "bk",
    left_sleeve: "ls",
    left_sleeves: "ls",  // Handle plural
    right_sleeve: "rs",
    right_sleeves: "rs", // Handle plural
    left_pocket: "lp",
    right_pocket: "rp",
  }
  const sku = mapping[area.toLowerCase()] || "fr"
  
  if (!mapping[area.toLowerCase()]) {
    console.log(`⚠️ Unknown area "${area}" - defaulting placement_sku to "fr"`)
  }
  
  return sku
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

/**
 * Extract width and height from "Printable Area" in manufacturing layout description
 * Format: "Printable Area: 180 x 225 pixels (10.7\" x 10.7\")"
 * We want to extract the inch values: 10.7 x 10.7
 */
function extractPrintableAreaDimensions(description: string): { width: string; height: string } {
  if (!description) {
    return { width: "", height: "" }
  }

  // Match pattern: "Printable Area: ... (10.7\" x 10.7\")" or "(10.7\\\" x 10.7\\\")"
  // Handle both escaped and non-escaped quotes
  const printableAreaMatch = description.match(/Printable Area:[^(]*\((\d+(?:\.\d+)?)\s*\\*"\s*x\s*(\d+(?:\.\d+)?)\s*\\*"\)/i)
  
  if (printableAreaMatch && printableAreaMatch.length >= 3) {
    const width = printableAreaMatch[1]
    const height = printableAreaMatch[2]
    console.log(`   ✅ Extracted Printable Area dimensions: ${width}" x ${height}"`)
    return { width, height }
  }

  // Fallback: try without "Printable Area:" prefix
  const fallbackMatch = description.match(/\((\d+(?:\.\d+)?)\s*\\*"\s*x\s*(\d+(?:\.\d+)?)\s*\\*"\)/)
  
  if (fallbackMatch && fallbackMatch.length >= 3) {
    const width = fallbackMatch[1]
    const height = fallbackMatch[2]
    console.log(`   ✅ Extracted dimensions (fallback): ${width}" x ${height}"`)
    return { width, height }
  }

  console.log("   ⚠️ Could not extract Printable Area dimensions from description")
  return { width: "", height: "" }
}
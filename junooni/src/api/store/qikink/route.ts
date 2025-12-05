import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Qikink brand ID constant
const QIKINK_BRAND_ID = "01JMY0V6FDZ0E096N0CVNG2J40"

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

// Response type for Qikink single order
interface QikinkOrderResponse {
  order_id: number
  number: string
  created_on: string
  live_date: string | null
  status: string
  shipping_type: string
  payment_type: string
  total_order_value: string
  shipping: {
    first_name: string
    last_name: string
    phone: string
    email: string
    city: string
    zip: string
    province: string | null
    country_code: string
    awb: string | null
    tracking_link: string
    courier_provider_name: string | null
  }
  line_items: any[]
}

/* ============================
   TRACKING HELPER FUNCTIONS
   ============================ */

/**
 * Get Qikink access token
 */
async function getQikinkToken(clientId: string, clientSecret: string): Promise<string> {
  const tokenUrl = "https://sandbox.qikink.com/api/token"
  
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `ClientId=${clientId}&client_secret=${clientSecret}`
  })

  if (!response.ok) {
    throw new Error(`Failed to get Qikink token: ${response.status}`)
  }

  const data = await response.json()
  console.log("✅ Qikink Token Response:", data)
  
  return data.Accesstoken
}

/**
 * Fetch tracking information from Qikink order
 */
async function fetchQikinkOrderTracking(
  qikinkOrderId: number,
  accessToken: string
): Promise<{
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  order_status: string
  shipping_details: any
}> {
  const QIKINK_BASE_URL = process.env.QIKINK_API_URL?.replace('/order/create', '') || "https://sandbox.qikink.com/api"
  const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
  const orderUrl = `${QIKINK_BASE_URL}/order?id=${qikinkOrderId}`
  
  console.log(`📡 Fetching tracking from: ${orderUrl}`)
  
  const response = await fetch(orderUrl, {
    method: "GET",
    headers: {
      "ClientId": QIKINK_CLIENT_ID,
      "Accesstoken": accessToken,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.status}`)
  }

  const responseData = await response.json()
  
  // ✅ FIX: Qikink returns an array, get first element
  const orderData: QikinkOrderResponse = Array.isArray(responseData) ? responseData[0] : responseData
  
  if (!orderData) {
    throw new Error(`Order ${qikinkOrderId} not found in Qikink response`)
  }
  
  // ✅ Check if shipping object exists
  if (!orderData.shipping) {
    console.warn(`⚠️ No shipping data available for order ${qikinkOrderId}`)
    return {
      tracking_number: null,
      tracking_url: null,
      carrier: "Qikink",
      order_status: orderData.status || "Unknown",
      shipping_details: null
    }
  }
  
  console.log("📦 Qikink Order Details:", {
    order_id: orderData.order_id,
    number: orderData.number,
    status: orderData.status,
    awb: orderData.shipping?.awb,
    tracking_link: orderData.shipping?.tracking_link,
    courier: orderData.shipping?.courier_provider_name
  })

  // Extract and clean tracking info
  const awb = orderData.shipping?.awb || null
  let tracking_url = orderData.shipping?.tracking_link || ""
  const carrier = orderData.shipping?.courier_provider_name || "Qikink"

  // Fix incomplete tracking URLs
  if (tracking_url && tracking_url.includes("?awb=") && awb) {
    const urlBase = tracking_url.split("?awb=")[0]
    tracking_url = `${urlBase}?awb=${awb}`
    console.log(`🔧 Fixed tracking URL: ${tracking_url}`)
  } else if (!tracking_url || tracking_url === "#" || !tracking_url.startsWith("http")) {
    if (awb) {
      tracking_url = `https://courierupdates.com/?awb=${awb}`
      console.log(`⚠️ Generated tracking URL from AWB: ${tracking_url}`)
    } else {
      tracking_url = null
      console.log(`⏳ No tracking available yet - order status: ${orderData.status}`)
    }
  }

  return {
    tracking_number: awb,
    tracking_url: tracking_url,
    carrier: carrier,
    order_status: orderData.status,
    shipping_details: orderData.shipping
  }
}

/**
 * Format tracking data for shipment creation
 */
export function formatTrackingForShipment(trackingData: {
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  order_status: string
}) {
  if (!trackingData.tracking_number) {
    throw new Error(`Order is not ready to ship. Current status: ${trackingData.order_status}`)
  }

  return {
    tracking_number: trackingData.tracking_number,
    tracking_url: trackingData.tracking_url || `https://courierupdates.com/?awb=${trackingData.tracking_number}`,
    carrier: trackingData.carrier || "Qikink",
    label_url: "" // Qikink doesn't provide label URLs in their response
  }
}

/* ============================
   PAYMENT & PRODUCT HELPERS
   ============================ */

/**
 * Determine payment gateway based on payment provider
 */
function determineGateway(cart: any): string {
  const paymentSession = cart?.payment_collection?.payment_sessions?.[0]
  const providerId = paymentSession?.provider_id?.toLowerCase() || ""
  
  console.log("🔍 Payment Provider ID:", providerId)
  
  if (providerId.includes("razorpay") || providerId === "razorpay") {
    console.log("✅ Gateway: PREPAID (Razorpay)")
    return "Prepaid"
  }
  
  if (providerId.includes("manual") || providerId === "pp_system_default") {
    console.log("✅ Gateway: COD (Manual Payment)")
    return "COD"
  }
  
  if (providerId.includes("stripe")) {
    console.log("✅ Gateway: PREPAID (Stripe)")
    return "PREPAID"
  }
  
  console.log("⚠️ Unknown provider, defaulting to COD")
  return "COD"
}

/**
 * Determine print type ID from product metadata
 */
function determinePrintTypeId(item: any, product: any): string {
  const metadataPrintType = 
    item.metadata?.qikink_print_type_id ||
    item.variant?.metadata?.qikink_print_type_id

  if (metadataPrintType) {
    console.log("✅ Using print_type_id from item metadata:", metadataPrintType)
    return String(metadataPrintType)
  }

  const printTechName = product?.metadata?.print_technology_name
  
  if (printTechName) {
    const normalizedTech = String(printTechName).toLowerCase().trim()
    console.log("🔍 Found print_technology_name in product:", normalizedTech)
    
    const printTypeId = PRINT_TECHNOLOGY_MAP[normalizedTech]
    
    if (printTypeId) {
      console.log(`✅ Mapped '${normalizedTech}' to print_type_id: ${printTypeId}`)
      return printTypeId
    } else {
      console.warn(`⚠️ Unknown print technology '${normalizedTech}', defaulting to DTG (1)`)
    }
  } else {
    console.warn("⚠️ No print_technology_name found in product metadata")
  }

  const productPrintType = product?.metadata?.qikink_print_type_id
  if (productPrintType) {
    console.log("✅ Using print_type_id from product metadata:", productPrintType)
    return String(productPrintType)
  }

  console.log("⚠️ No print type found, defaulting to DTG (1)")
  return "1"
}

/* ============================
   Fulfillment Type Check
   ============================ */

async function shouldUseFulfillment(
  query: any,
  productId: string,
  itemMetadata?: Record<string, any>
): Promise<boolean> {
  try {
    if (!productId) {
      console.log("⚠️ No product ID provided, skipping Qikink")
      return false
    }

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: productId,
      },
    })

    if (!product) {
      console.warn(`⚠️ Could not fetch product ${productId}, skipping Qikink`)
      return false
    }

    const fulfillmentTypeRaw = product?.metadata?.fulfillment_type
    
    if (!fulfillmentTypeRaw) {
      console.log("⏭️ Skipping Qikink - no fulfillment_type found in product metadata")
      return false
    }

    let fulfillmentTypeData: any
    try {
      fulfillmentTypeData = typeof fulfillmentTypeRaw === "string" 
        ? JSON.parse(fulfillmentTypeRaw) 
        : fulfillmentTypeRaw
    } catch (e) {
      console.warn("⚠️ Failed to parse fulfillment_type JSON:", e)
      return false
    }

    console.log("📋 Parsed fulfillment_type:", fulfillmentTypeData)

    const fulfillmentType = fulfillmentTypeData?.type

    if (fulfillmentType === "creator_fulfilment") {
      console.log("⏭️ Skipping Qikink - product has creator_fulfilment")
      return false
    }

    if (fulfillmentType === "JUNOONI-fulfillment") {
      console.log("✅ Using Qikink - product has JUNOONI-fulfillment")
      console.log(`   - Handling time: ${fulfillmentTypeData?.handling_time || 'N/A'}`)
      console.log(`   - Shipping time: ${fulfillmentTypeData?.shipping_time || 'N/A'}`)
      return true
    }

    console.log("⏭️ Skipping Qikink - fulfillment type is:", fulfillmentType)
    return false

  } catch (err) {
    console.error("❌ Error checking fulfillment type:", err)
    return false
  }
}

/* ============================
   Brand ID Check
   ============================ */

async function hasQikinkBrand(
  query: any,
  productId: string
): Promise<boolean> {
  try {
    if (!productId) {
      console.log("⚠️ No product ID provided for brand check")
      return false
    }

    try {
      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id", 
          "brand_id",
          "brand.*"
        ],
        filters: {
          id: productId,
        },
      })

      if (!products || products.length === 0) {
        console.warn(`⚠️ Could not fetch product ${productId} for brand check`)
        return false
      }

      const product = products[0]

      if (product.brand_id) {
        console.log("📋 Found brand_id directly on product:", product.brand_id)
        
        if (product.brand_id === QIKINK_BRAND_ID) {
          console.log("✅ Brand ID match:", product.brand_id)
          return true
        }
        
        console.log("⏭️ Skipping Qikink - brand ID mismatch:", product.brand_id, "!==", QIKINK_BRAND_ID)
        return false
      }

      if (product.brand?.id) {
        console.log("📋 Found brand through relationship:", product.brand.id)
        
        if (product.brand.id === QIKINK_BRAND_ID) {
          console.log("✅ Brand ID match:", product.brand.id)
          return true
        }
        
        console.log("⏭️ Skipping Qikink - brand ID mismatch:", product.brand.id, "!==", QIKINK_BRAND_ID)
        return false
      }

    } catch (graphError) {
      console.warn("⚠️ Graph query failed, trying link query:", graphError)
    }

    try {
      const { data: links } = await query.graph({
        entity: "link",
        fields: ["*"],
        filters: {
          product_id: productId,
        },
      })

      if (links && links.length > 0) {
        const brandLink = links.find((link: any) => 
          link.brand_id || (link.data && link.data.brand_id)
        )

        if (brandLink) {
          const brandId = brandLink.brand_id || brandLink.data?.brand_id
          console.log("📋 Found brand_id through link table:", brandId)
          
          if (brandId === QIKINK_BRAND_ID) {
            console.log("✅ Brand ID match:", brandId)
            return true
          }
          
          console.log("⏭️ Skipping Qikink - brand ID mismatch:", brandId, "!==", QIKINK_BRAND_ID)
          return false
        }
      }
    } catch (linkError) {
      console.warn("⚠️ Link query failed:", linkError)
    }

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: productId,
      },
    })

    if (product?.metadata?.brand_id) {
      let brandId: string
      const brandIdRaw = product.metadata.brand_id

      try {
        if (typeof brandIdRaw === "string") {
          try {
            const parsed = JSON.parse(brandIdRaw)
            brandId = parsed?.id || parsed?.brand_id || brandIdRaw
          } catch {
            brandId = brandIdRaw
          }
        } else if (typeof brandIdRaw === "object" && brandIdRaw !== null) {
          brandId = brandIdRaw.id || brandIdRaw.brand_id || String(brandIdRaw)
        } else {
          brandId = String(brandIdRaw)
        }

        console.log("📋 Found brand_id in metadata:", brandId)

        if (brandId === QIKINK_BRAND_ID) {
          console.log("✅ Brand ID match:", brandId)
          return true
        }

        console.log("⏭️ Skipping Qikink - brand ID mismatch:", brandId, "!==", QIKINK_BRAND_ID)
        return false

      } catch (e) {
        console.warn("⚠️ Failed to parse brand_id from metadata:", e)
      }
    }

    console.log("⏭️ Skipping Qikink - no brand_id found anywhere")
    return false

  } catch (err) {
    console.error("❌ Error checking brand ID:", err)
    return false
  }
}

/* ============================
   Artwork Resolution Helpers
   ============================ */

async function resolveArtworkIdForProduct(
  query: any,
  productId: string,
  itemMetadata?: Record<string, any>
): Promise<string | null> {
  const maybeFromItem =
    itemMetadata?.artwork_id || 
    itemMetadata?.artworkId || 
    itemMetadata?.design_artwork_id ||
    itemMetadata?.vendor_artwork_id

  if (maybeFromItem) {
    console.log("🎯 artwork id from item metadata:", maybeFromItem)
    return String(maybeFromItem)
  }

  if (itemMetadata?.design_artwork) {
    try {
      const da =
        typeof itemMetadata.design_artwork === "string"
          ? JSON.parse(itemMetadata.design_artwork)
          : itemMetadata.design_artwork
      
      if (Array.isArray(da) && da[0]?.artwork_id) {
        console.log("🎯 artwork id from item.metadata.design_artwork:", da[0].artwork_id)
        return String(da[0].artwork_id)
      }
    } catch (e) {
      console.warn("⚠️ failed to parse item.metadata.design_artwork", e)
    }
  }

  try {
    if (!productId) return null

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: productId,
      },
    })

    if (!product) {
      console.warn(`⚠️ Could not fetch product ${productId}`)
      return null
    }

    const designArtworkRaw = product?.metadata?.design_artwork
    if (designArtworkRaw) {
      try {
        const designArtwork =
          typeof designArtworkRaw === "string"
            ? JSON.parse(designArtworkRaw)
            : designArtworkRaw

        if (Array.isArray(designArtwork) && designArtwork.length > 0) {
          const first = designArtwork[0]
          const artworkIdCandidate =
            first?.artwork_id ||
            first?.vendor_artwork_id ||
            first?.artwork_data?.vendor_artwork?.id ||
            first?.artwork_data?.vendor_artwork?.artwork_id ||
            first?.artwork_data?.vendor_artwork?.vendor_artwork_id

          if (artworkIdCandidate) {
            console.log("🎯 artwork id from product.metadata.design_artwork:", artworkIdCandidate)
            return String(artworkIdCandidate)
          }

          const vendorArtwork = first?.artwork_data?.vendor_artwork
          if (vendorArtwork?.id) {
            console.log("🎯 artwork id from vendor_artwork.id:", vendorArtwork.id)
            return String(vendorArtwork.id)
          }
        }
      } catch (e) {
        console.warn("⚠️ failed to parse product.metadata.design_artwork", e)
      }
    }

    const candidates = [
      product?.metadata?.artwork_id,
      product?.metadata?.vendor_artwork_id,
      product?.artwork_id,
      product?.vendor_artwork_id,
      product?.artwork?.id
    ]
    
    for (const c of candidates) {
      if (c) {
        console.log("🎯 artwork id from product field:", c)
        return String(c)
      }
    }

    console.log("ℹ️ No artwork id found on product", productId)
    return null
  } catch (err) {
    console.error("❌ Error resolving artwork id for product:", err)
    return null
  }
}

async function fetchArtworkById(query: any, artworkId: string) {
  try {
    if (!artworkId) return null

    const { data: artwork } = await query.graph({
      entity: "vendor_artwork",
      fields: ["*", "medias.*", "products.*"],
      filters: {
        id: artworkId,
      },
    })

    if (!artwork || artwork.length === 0) {
      console.warn(`⚠️ vendor_artwork not found for id: ${artworkId}`)
      return null
    }

    const artworkData = artwork[0]
    const mediaFiles = artworkData?.medias || []

    console.log("📋 === FULL ARTWORK DATA ===")
    console.log(JSON.stringify(artworkData, null, 2))
    console.log("📋 === END ARTWORK DATA ===")
    
    console.log(`✅ Found vendor_artwork ${artworkId} with ${mediaFiles.length} media files`)
    
    mediaFiles.forEach((media: any, index: number) => {
      console.log(`📁 Media File ${index + 1}:`, {
        id: media.id,
        name: media.name,
        filename: media.filename,
        file_description: media.file_description,
        url: media.url,
        file_url: media.file_url,
        fileId: media.fileId
      })
    })

    const toUrl = (f: any) => {
      if (!f) return ""
      const baseUrl = process.env.BACKEND_URL || "http://localhost:9000"
      return f?.fileId ? `${baseUrl}/static/${f.fileId}` : (f?.url || f?.file_url || "")
    }

    const getAreaFromDescription = (desc: string): string => {
      const lowerDesc = desc.toLowerCase()
      if (lowerDesc.includes("front area")) return "front"
      if (lowerDesc.includes("back area")) return "back"
      if (lowerDesc.includes("left sleeve")) return "left_sleeve"
      if (lowerDesc.includes("right sleeve")) return "right_sleeve"
      return "front"
    }

    const getPlacementSku = (area: string): string => {
      const mapping: Record<string, string> = {
        "front": "fr",
        "back": "bk",
        "left_sleeve": "sl",
        "right_sleeve": "sr",
      }
      return mapping[area] || "fr"
    }

    const designsByArea: Record<string, any[]> = {}
    const canvasLayoutsByArea: Record<string, any> = {}
    
    mediaFiles.forEach((element: any) => {
      const area = getAreaFromDescription(element.file_description || "")
      const desc = String(element.file_description || "").toLowerCase()
      
      if (desc.includes("design element") && !desc.includes("manufacturing layout")) {
        if (!designsByArea[area]) {
          designsByArea[area] = []
        }
        designsByArea[area].push({
          area,
          placementSku: getPlacementSku(area),
          designUrl: toUrl(element),
          fileDescription: element.file_description
        })
      } else if (desc.includes("manufacturing layout")) {
        canvasLayoutsByArea[area] = toUrl(element)
      }
    })

    console.log("🎨 Design elements grouped by area:", Object.keys(designsByArea))
    console.log("🎨 Canvas layouts by area:", Object.keys(canvasLayoutsByArea))

    return {
      designsByArea,
      canvasLayoutsByArea,
      artworkId: artworkData?.id || artworkId,
      raw: artworkData
    }
  } catch (err) {
    console.error("❌ fetchArtworkById error:", err)
    return null
  }
}

async function fetchArtworkForProduct(
  query: any,
  productId: string,
  itemMetadata?: Record<string, any>
) {
  try {
    const artworkId = await resolveArtworkIdForProduct(query, productId, itemMetadata || {})
    if (artworkId) {
      const art = await fetchArtworkById(query, artworkId)
      if (art) return art
    }

    console.log("🔁 fallback to product_id lookup")
    
    try {
      const { data: artworks } = await query.graph({
        entity: "vendor_artwork",
        fields: ["*", "medias.*"],
        filters: {
          product_id: productId,
        },
      })

      if (artworks && artworks.length > 0) {
        const artwork = artworks[0]
        const mediaFiles = artwork?.medias || []
        
        console.log(`✅ Fallback found vendor_artwork for product ${productId}`)
        
        const toUrl = (f: any) => {
          if (!f) return ""
          const baseUrl = process.env.BACKEND_URL || "http://localhost:9000"
          return f?.fileId ? `${baseUrl}/static/${f.fileId}` : (f?.url || f?.file_url || "")
        }

        const getAreaFromDescription = (desc: string): string => {
          const lowerDesc = desc.toLowerCase()
          if (lowerDesc.includes("front area")) return "front"
          if (lowerDesc.includes("back area")) return "back"
          if (lowerDesc.includes("left sleeve")) return "left_sleeve"
          if (lowerDesc.includes("right sleeve")) return "right_sleeve"
          return "front"
        }

        const getPlacementSku = (area: string): string => {
          const mapping: Record<string, string> = {
            "front": "fr",
            "back": "bk",
            "left_sleeve": "sl",
            "right_sleeve": "sr",
          }
          return mapping[area] || "fr"
        }

        const designsByArea: Record<string, any[]> = {}
        const canvasLayoutsByArea: Record<string, any> = {}
        
        mediaFiles.forEach((element: any) => {
          const area = getAreaFromDescription(element.file_description || "")
          const desc = String(element.file_description || "").toLowerCase()
          
          if (desc.includes("design element") && !desc.includes("manufacturing layout")) {
            if (!designsByArea[area]) {
              designsByArea[area] = []
            }
            designsByArea[area].push({
              area,
              placementSku: getPlacementSku(area),
              designUrl: toUrl(element),
              fileDescription: element.file_description
            })
          } else if (desc.includes("manufacturing layout")) {
            canvasLayoutsByArea[area] = toUrl(element)
          }
        })

        return {
          designsByArea,
          canvasLayoutsByArea,
          artworkId: artwork?.id || productId,
          raw: artwork
        }
      }
    } catch (fallbackErr) {
      console.warn("⚠️ fallback artwork lookup failed:", fallbackErr)
    }

    return null
  } catch (err) {
    console.error("❌ fetchArtworkForProduct error:", err)
    return null
  }
}

async function processCartItems(
  query: any,
  items: any[]
) {
  const lineItemsPromises = items.map(async (item) => {
    console.log("🎨 Processing item:", item.product_id, item.variant?.title)

    const shouldFulfill = await shouldUseFulfillment(
      query,
      item.product_id || "",
      item.metadata || {}
    )

    if (!shouldFulfill) {
      console.log("⏭️ Skipping item - not JUNOONI-fulfillment")
      return null
    }

    const hasBrand = await hasQikinkBrand(
      query,
      item.product_id || ""
    )

    if (!hasBrand) {
      console.log("⏭️ Skipping item - brand ID does not match Qikink brand")
      return null
    }

    console.log("✅✅ Item passed both checks - proceeding with Qikink processing")

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: {
        id: item.product_id,
      },
    })

    const artworkData = await fetchArtworkForProduct(
      query,
      item.product_id || "",
      item.metadata || {}
    )
    console.log("🎨 Artwork data for product:", item.product_id, artworkData)

    const printTypeId = determinePrintTypeId(item, product)

    const isValidUrl = (url: string) => {
      if (!url) return false
      try {
        new URL(url)
        return url.startsWith("http://") || url.startsWith("https://")
      } catch {
        return false
      }
    }

    const designs: any[] = []

    if (artworkData?.designsByArea && Object.keys(artworkData.designsByArea).length > 0) {
      Object.entries(artworkData.designsByArea).forEach(([area, elements]: [string, any]) => {
        elements.forEach((element: any) => {
          if (isValidUrl(element.designUrl)) {
            const variantTitle = item.variant?.title || "default"
            const areaAbbrev = element.placementSku
            const designCode = variantTitle.length > 17 
              ? `${variantTitle.substring(0, 17)}-${areaAbbrev}` 
              : `${variantTitle}-${areaAbbrev}`
            
            const mockupLink = artworkData.canvasLayoutsByArea?.[area] || item.thumbnail || ""
            
            const designObj: any = {
              design_code: designCode,
              width_inches: "",
              height_inches: "",
              placement_sku: element.placementSku,
              mockup_link: mockupLink,
              design_link: element.designUrl
            }

            designs.push(designObj)
            console.log(`✅ Added design for ${area}:`)
            console.log(`   - design_link: ${element.designUrl}`)
            console.log(`   - mockup_link: ${mockupLink}`)
            console.log(`   - placement_sku: ${element.placementSku}`)
            console.log(`   - design_code: ${designCode}`)
          }
        })
      })
    }

    if (designs.length === 0) {
      console.warn("⚠️ No designs found in artwork, using fallback")
      
      const fallbackDesignLink =
        item.metadata?.qikink_design_link ||
        item.variant?.metadata?.qikink_design_link ||
        item.thumbnail ||
        ""

      const designData: any = {
        design_code: item.variant?.title || "default",
        width_inches: "",
        height_inches: "",
        placement_sku: "fr",
        mockup_link: item.thumbnail || ""
      }

      if (isValidUrl(fallbackDesignLink)) {
        designData.design_link = fallbackDesignLink
        designs.push(designData)
        console.log("✅ Valid fallback design link added:", fallbackDesignLink)
      } else {
        console.warn("⚠️ No valid design link found for item:", item.product_id)
      }
    }

    const manufacturerSku = item.variant?.metadata?.manufacturer_sku || 
                        item.metadata?.manufacturer_sku || 
                        "MVnHs-Wh-S"

    console.log(`📦 Using manufacturer_sku for variant ${item.variant?.title}:`, manufacturerSku)

    return {
      search_from_my_products: 0,
      quantity: (item.quantity || 1).toString(),
      price: ((item.unit_price || 0) / 100).toString(),
      sku: manufacturerSku,
      print_type_id: printTypeId,
      designs: designs.length > 0 ? designs : [{
        design_code: item.variant?.title || "default",
        width_inches: "",
        height_inches: "",
        placement_sku: "fr",
        mockup_link: item.thumbnail || ""
      }]
    }
  })

  const results = await Promise.all(lineItemsPromises)
  return results.filter(item => item !== null)
}

/* ============================
   MAIN ORDER CREATION ROUTE
   ============================ */

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cartPayload = req.body

    console.log("📦 === QIKINK INTEGRATION START (SERVER-SIDE) ===")
    console.log("📦 Received cart payload:", JSON.stringify(cartPayload, null, 2))

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    console.log("🔍 Checking cart items for JUNOONI-fulfillment and brand ID...")
    const lineItems = await processCartItems(
      query,
      cartPayload.items || []
    )

    if (lineItems.length === 0) {
      console.log("⏭️ No items require Qikink fulfillment - skipping Qikink integration")
      res.status(200).json({
        success: true,
        skipped: true,
        message: "No items require Qikink fulfillment or match brand requirements"
      })
      return
    }

    console.log(`✅ Found ${lineItems.length} items requiring Qikink fulfillment with correct brand`)

    const gateway = determineGateway(cartPayload)

    const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
    const QIKINK_CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET || ""
    const QIKINK_API_URL = process.env.QIKINK_API_URL || "https://sandbox.qikink.com/api/order/create"

    console.log("🔑 Getting Qikink access token...")
    const accessToken = await getQikinkToken(QIKINK_CLIENT_ID, QIKINK_CLIENT_SECRET)
    console.log("✅ Token obtained:", accessToken ? "Yes" : "No")

    const shortOrderId = `ORD${Date.now().toString().slice(-9)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    console.log("📦 Short Order ID for Qikink:", shortOrderId, `(${shortOrderId.length} chars)`)

    const qikinkPayload = {
      order_number: shortOrderId,
      qikink_shipping: "1",
      gateway: gateway,
      total_order_value: ((cartPayload.total || 0) / 100).toString(),
      line_items: lineItems,
      shipping_address: {
        first_name: cartPayload.shipping_address?.first_name || "",
        last_name: cartPayload.shipping_address?.last_name || "",
        address1: cartPayload.shipping_address?.address_1 || "",
        phone: cartPayload.shipping_address?.phone || "",
        email: cartPayload.email || "",
        city: cartPayload.shipping_address?.city || "",
        zip: cartPayload.shipping_address?.postal_code || "",
        province: cartPayload.shipping_address?.province || "",
        country_code: (cartPayload.shipping_address?.country_code || "IN").toUpperCase()
      }
    }

    console.log("📦 === QIKINK PAYLOAD ===")
    console.log(JSON.stringify(qikinkPayload, null, 2))
    console.log("📦 === END PAYLOAD ===")

    console.log("📤 Sending request to Qikink...")
    const response = await fetch(QIKINK_API_URL, {
      method: "POST",
      headers: {
        "ClientId": QIKINK_CLIENT_ID,
        "Accesstoken": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(qikinkPayload)
    })

    const result = await response.json()
    console.log("📦 Qikink Response Status:", response.status)
    console.log("📦 Qikink Response:", JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error("❌ Qikink API Error:", result)
      res.status(response.status).json({
        success: false,
        error: result.message || result.error || "Failed to create Qikink order",
        details: result
      })
      return
    }

    console.log("✅ ✅ ✅ QIKINK ORDER CREATED SUCCESSFULLY ✅ ✅ ✅")
    
    // ✅ FETCH TRACKING INFORMATION FROM QIKINK
    let trackingInfo = null
    
    try {
      console.log("🔍 Fetching tracking information from Qikink order...")
      
      const trackingData = await fetchQikinkOrderTracking(result.order_id, accessToken)
      
      trackingInfo = trackingData
      console.log("✅ Tracking info extracted:", trackingInfo)
      
    } catch (trackingError) {
      console.warn("⚠️ Failed to fetch tracking info immediately (this is OK, order is still created):", trackingError)
      console.log("💡 Tracking will be available once Qikink processes the order")
    }

    console.log("📦 === QIKINK INTEGRATION END ===")

    res.status(200).json({
      success: true,
      data: result,
      qikink_order_id: result.order_id,
      qikink_order_number: result.number,
      tracking: trackingInfo,
      message: trackingInfo?.tracking_number 
        ? "Qikink order created with tracking information"
        : "Qikink order created. Tracking will be available once order is processed.",
      instructions: {
        note: "Store qikink_order_id in fulfillment metadata",
        next_step: "Use qikink_order_id to create shipment with tracking when ready"
      }
    })

  } catch (error) {
    console.error("❌ ❌ ❌ QIKINK ERROR:", error)
    console.error("Error details:", error instanceof Error ? error.message : error)
    console.log("📦 === QIKINK INTEGRATION END (WITH ERROR) ===")
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
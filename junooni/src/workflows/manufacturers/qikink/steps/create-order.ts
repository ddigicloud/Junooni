// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// type CreateQikinkOrderInput = {
//   order: any
//   items: any[]
//   token: string
// }

// type CreateQikinkOrderOutput = {
//   order_id: number
//   order_number: string
//   tracking: {
//     tracking_number: string | null
//     tracking_url: string | null
//     carrier: string | null
//   }
//   message: string
//   raw_response?: any
// }

// /**
//  * Complete Qikink order creation step - fully self-contained
//  * Does NOT call other steps to avoid invoke() errors
//  */
// export const createQikinkOrderStep = createStep(
//   "create-qikink-order-step",
//   async (input: CreateQikinkOrderInput, { container }) => {
//     console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//     console.log("🎯 Starting Qikink Order Creation")
//     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//     console.log(`📦 Order: ${input.order.display_id}`)
//     console.log(`📦 Items: ${input.items.length}`)

//     try {
//       const token = input.token

//       if (!token) {
//         throw new Error("Qikink access token not provided")
//       }

//       console.log("✅ Token validated")

//       // Environment variables
//       const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
//       const QIKINK_API_URL = process.env.QIKINK_API_URL || "https://sandbox.qikink.com/api/order/create"

//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       // BUILD PAYLOAD
//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       console.log("\n📦 Building Qikink payload...")

//       // Generate short order ID
//       const timestamp = Date.now().toString().slice(-9)
//       const random = Math.random().toString(36).substring(2, 5).toUpperCase()
//       const shortOrderId = `ORD${timestamp}${random}`

//       console.log(`📋 Order number: ${shortOrderId}`)

//       // Determine payment gateway
//       const paymentCollections = input.order.payment_collections || []
//       let gateway = "COD"

//       console.log(`📦 Payment collections count: ${paymentCollections.length}`)

//       if (paymentCollections.length > 0) {
//         const paymentCollection = paymentCollections[0] // Get first collection
        
//         console.log(`✓ Payment collection found: ${paymentCollection.id}`)
//         console.log(`✓ Status: ${paymentCollection.status}`)
        
//         // Check completed payments first (most reliable)
//         const completedPayments = paymentCollection.payments || []
//         const paymentSessions = paymentCollection.payment_sessions || []
        
//         console.log(`✓ Completed payments: ${completedPayments.length}`)
//         console.log(`✓ Payment sessions: ${paymentSessions.length}`)
        
//         // Combine and check all payments
//         const allPayments = [...completedPayments, ...paymentSessions]
        
//         for (const payment of allPayments) {
//           const providerId = (payment?.provider_id || "").toLowerCase()
          
//           console.log(`  🔍 Checking provider: "${providerId}"`)
          
//           // Check for Razorpay (can be "razorpay" or "pp_razorpay_razorpay")
//           if (providerId.includes("razorpay")) {
//             gateway = "Prepaid"
//             console.log(`  ✅ Razorpay detected -> Gateway: ${gateway}`)
//             break
//           } 
//           // Check for Stripe
//           else if (providerId.includes("stripe")) {
//             gateway = "PREPAID"
//             console.log(`  ✅ Stripe detected -> Gateway: ${gateway}`)
//             break
//           }
//         }
        
//         if (gateway === "COD" && allPayments.length > 0) {
//           console.log(`  ⚠️ Unknown payment provider: ${allPayments[0]?.provider_id}`)
//           console.log(`  ⚠️ Defaulting to COD`)
//         }
//       } else {
//         console.log("  ⚠️ No payment collections found - defaulting to COD")
//       }

//       console.log(`\n💳 FINAL Gateway: ${gateway}`)

//       // Build line items with proper artwork resolution
//       const query = container.resolve(ContainerRegistrationKeys.QUERY)
//       const lineItems = []
//       let junooniTotal = 0 // Track Junooni fulfillment items total

//       for (let index = 0; index < input.items.length; index++) {
//         const item = input.items[index]
//         //console.log(`\n🎨 Item ${index + 1}: ${item.variant?.title || item.title}`)

//         // Get SKU
//         const sku = item.variant?.metadata?.manufacturer_sku ||
//                    item.metadata?.manufacturer_sku ||
//                    "MVnHs-Wh-S"

//         //console.log(`   SKU: ${sku}`)

//         // Determine print type
//         const printTypeId = await determinePrintTypeId(item, item.product)
//         //console.log(`   Print type: ${printTypeId}`)

//         // Fetch artwork and build designs
//         const designs = await buildDesignsForItem(query, item)
//         //console.log(`   Designs: ${designs.length}`)

//         // Calculate item total (unit_price * quantity)
//         const itemTotal = (item.unit_price || 0) * item.quantity
//         junooniTotal += itemTotal // Add to Junooni total

//         const lineItem = {
//           search_from_my_products: 0,
//           quantity: item.quantity.toString(),
//           price: ((item.unit_price || 0)).toFixed(2),
//           sku: sku,
//           print_type_id: printTypeId,
//           designs,
//         }

//         lineItems.push(lineItem)
//       }

//       // Build shipping address
//       const shippingAddress = {
//         first_name: input.order.shipping_address?.first_name || "Customer",
//         last_name: input.order.shipping_address?.last_name || "",
//         address1: input.order.shipping_address?.address_1 || "",
//         phone: input.order.shipping_address?.phone || "",
//         email: input.order.email || "",
//         city: input.order.shipping_address?.city || "",
//         zip: input.order.shipping_address?.postal_code || "",
//         province: input.order.shipping_address?.province || "",
//         country_code: (input.order.shipping_address?.country_code || "IN").toUpperCase(),
//       }

//       console.log("\n✅ Shipping address:")
//       console.log(`   ${shippingAddress.first_name} ${shippingAddress.last_name}`)
//       console.log(`   ${shippingAddress.address1}`)
//       console.log(`   ${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.country_code} - ${shippingAddress.zip}`)
//       console.log(`   Phone: ${shippingAddress.phone}`)
//       console.log(`   Email: ${shippingAddress.email}`)

//       // Build complete payload
//       const payload = {
//         order_number: shortOrderId,
//         qikink_shipping: "1",
//         gateway: gateway,
//         total_order_value: (junooniTotal).toFixed(2), // Use Junooni items total only
//         line_items: lineItems,
//         shipping_address: shippingAddress,
//       }

//       console.log(`\n✅ Payload ready:`)
//       console.log(`Payload Summary: `)
//       console.log(`   Items: ${lineItems.length}`)
//       console.log(`   Junooni Fulfillment Total: ₹${payload.total_order_value}`)
//       console.log(`   Original Order Total: ₹${((input.order.total || 0)).toFixed(2)}`)
//       console.log(`   Shipping: ${shippingAddress.city}, ${shippingAddress.country_code}`)
//       console.log("Total payload", payload)

      
//       // console.log(`\n📤 Submitting to Qikink...`)
//       // console.log(`🔗 URL: ${QIKINK_API_URL}`)
//       // console.log(`🔑 Client ID: ${QIKINK_CLIENT_ID}`)
//       // console.log(`🔑 Token preview: ${token ? token.substring(0, 20) + '...' : 'MISSING'}`)

//       const response = await fetch(QIKINK_API_URL, {
//         method: "POST",
//         headers: {
//           ClientId: QIKINK_CLIENT_ID,
//           Accesstoken: token,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       })

//       const responseData = await response.json()

//       console.log(`📥 Response status: ${response.status}`)
//       console.log(`📦 Response:`, JSON.stringify(responseData, null, 2))

//       if (!response.ok) {
//         throw new Error(
//           responseData.message || responseData.error || `Qikink API error: ${response.status}`
//         )
//       }

//       const qikinkOrderId = responseData.order_id
//       const qikinkOrderNumber = responseData.number || shortOrderId

//       console.log(`\n✅ Order created in Qikink!`)
//       console.log(`   ID: ${qikinkOrderId}`)
//       console.log(`   Number: ${qikinkOrderNumber}`)

//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       // FETCH TRACKING (optional)
//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       //console.log(`\n📡 Fetching tracking info...`)
//       let trackingInfo = {
//         tracking_number: null as string | null,
//         tracking_url: null as string | null,
//         carrier: null as string | null,
//       }

//       try {
//         // FIX: Remove /api from base URL to avoid double /api/api/
//         const baseUrl = QIKINK_API_URL.replace("/api/order/create", "")
//         const trackingUrl = `${baseUrl}/api/order?id=${qikinkOrderId}`
        
//         //console.log(`🔗 Tracking URL: ${trackingUrl}`)

//         const trackingResponse = await fetch(trackingUrl, {
//           method: "GET",
//           headers: {
//             ClientId: QIKINK_CLIENT_ID,
//             Accesstoken: token,
//           },
//         })

//         //console.log(`📥 Tracking response status: ${trackingResponse.status}`)

//         if (trackingResponse.ok) {
//           const trackingData = await trackingResponse.json()
//           //console.log(`📦 Tracking data:`, JSON.stringify(trackingData, null, 2))
          
//           const orderData = Array.isArray(trackingData) ? trackingData[0] : trackingData

//           // Check for tracking in shipping object
//           if (orderData?.shipping) {
//             const shipping = orderData.shipping
//             trackingInfo = {
//               tracking_number: shipping.awb || null,
//               tracking_url: shipping.tracking_link || null,
//               carrier: shipping.courier_provider_name || "Qikink",
//             }
            
//             if (trackingInfo.tracking_number) {
//               //console.log(`✅ Tracking found: ${trackingInfo.tracking_number}`)
//             } else if (trackingInfo.tracking_url) {
//               //console.log(`✅ Tracking URL found: ${trackingInfo.tracking_url}`)
//             } else {
//               //console.log(`ℹ️ Tracking not yet assigned (AWB pending)`)
//             }
//           } else {
//             //console.log(`ℹ️ No shipping data in response`)
//           }
//         } else {
//           const errorText = await trackingResponse.text()
//           //console.log(`⚠️ Tracking request failed: ${errorText}`)
//         }
//       } catch (error) {
//         //console.log(`⚠️ Tracking fetch error:`, error)
//       }

//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       // UPDATE MEDUSA ORDER
//       // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       // console.log(`\n💾 Updating Medusa order...`)
//       // console.log(`📋 Order ID: ${input.order.id}`)
      
//       try {
//         const orderService = container.resolve("order")
        
//         const updatedMetadata = {
//           ...input.order.metadata,
//           qikink_order_id: qikinkOrderId,
//           qikink_order_number: qikinkOrderNumber,
//           qikink_short_order_id: shortOrderId,
//           qikink_synced_at: new Date().toISOString(),
//           qikink_tracking_number: trackingInfo.tracking_number,
//           qikink_tracking_url: trackingInfo.tracking_url,
//           qikink_carrier: trackingInfo.carrier,
//         }
        
//         // console.log(`📦 Updating with metadata:`)
//         // console.log(`   - qikink_order_id: ${qikinkOrderId}`)
//         // console.log(`   - qikink_order_number: ${qikinkOrderNumber}`)
//         // console.log(`   - qikink_tracking_url: ${trackingInfo.tracking_url || 'pending'}`)
//         // console.log(`   - qikink_tracking_number: ${trackingInfo.tracking_number || 'pending'}`)
//         // console.log(`   - qikink_carrier: ${trackingInfo.carrier || 'pending'}`)
        
//         // Use updateOrders with proper payload structure (array of updates)
//         const result = await orderService.updateOrders([{
//           id: input.order.id,
//           metadata: updatedMetadata,
//         }])
        
//         // console.log(`✅ Order metadata update call completed`)
//         // console.log(`📦 Update result:`, JSON.stringify(result, null, 2))
        
//         // Verify the update by fetching the order back
//         try {
//           const updatedOrder = await orderService.retrieveOrder(input.order.id, {
//             select: ["id", "metadata"]
//           })
          
//           // console.log(`\n📦 Verified order metadata:`)
//           // console.log(`   - qikink_order_id: ${updatedOrder.metadata?.qikink_order_id || 'NOT SET'}`)
//           // console.log(`   - qikink_tracking_url: ${updatedOrder.metadata?.qikink_tracking_url || 'NOT SET'}`)
//           // console.log(`   - qikink_tracking_number: ${updatedOrder.metadata?.qikink_tracking_number || 'NOT SET'}`)
//           // console.log(`   - qikink_carrier: ${updatedOrder.metadata?.qikink_carrier || 'NOT SET'}`)
//         } catch (verifyError) {
//           //console.log(`⚠️ Could not verify order metadata:`, verifyError)
//         }
        
//       } catch (error) {
//         // console.error(`❌ Failed to update order metadata:`)
//         // console.error(error)
//         // Don't throw - we still want to return success since Qikink order was created
//       }

//       // Return result
//       const result: CreateQikinkOrderOutput = {
//         order_id: qikinkOrderId,
//         order_number: qikinkOrderNumber,
//         tracking: trackingInfo,
//         message: "Qikink order created successfully",
//         raw_response: responseData,
//       }

//       // console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       // console.log("🎉 SUCCESS!")
//       // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       // console.log(`✅ Medusa Order: ${input.order.display_id}`)
//       // console.log(`✅ Qikink Order: ${qikinkOrderNumber} (ID: ${qikinkOrderId})`)
//       if (trackingInfo.tracking_number) {
//         // console.log(`✅ Tracking Number: ${trackingInfo.tracking_number}`)
//       }
//       if (trackingInfo.tracking_url) {
//         //console.log(`✅ Tracking URL: ${trackingInfo.tracking_url}`)
//       }
//       //console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

//       return new StepResponse(result, {
//         qikink_order_id: result.order_id,
//         qikink_order_number: result.order_number,
//         short_order_id: shortOrderId,
//       })
//     } catch (error) {
//       // console.error("\n❌━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       // console.error("❌ FAILED")
//       // console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
//       // console.error(error)
//       // console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
//       throw error
//     }
//   },

//   // Compensation
//   async (compensationData) => {
//     if (compensationData?.qikink_order_id) {
//       //console.log(`\n⚠️ Qikink order ${compensationData.qikink_order_id} may need manual cancellation\n`)
//     }
//   }
// )

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // HELPER FUNCTIONS
// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // Print technology mapping
// const PRINT_TECHNOLOGY_MAP: Record<string, string> = {
//   "dtg": "1",
//   "direct to garment": "1",
//   "all over printed": "2",
//   "aop": "2",
//   "embroidery": "3",
//   "accessories": "5",
//   "puff print": "6",
//   "puff": "6",
//   "glow in dark": "7",
//   "glow-in-dark": "7",
//   "rainbow vinyl": "12",
//   "gold vinyl": "13",
//   "silver vinyl": "14",
//   "reflective grey vinyl": "15",
//   "dtf": "17",
//   "direct to film": "17",
// }

// /**
//  * Determine print type ID from product metadata
//  */
// async function determinePrintTypeId(item: any, product: any): Promise<string> {
//   // Check item metadata first
//   const itemPrintType =
//     item.metadata?.qikink_print_type_id ||
//     item.variant?.metadata?.qikink_print_type_id

//   if (itemPrintType) {
//     //console.log(`   ✅ Using print_type_id from item: ${itemPrintType}`)
//     return String(itemPrintType)
//   }

//   // Check product print technology name
//   const printTechName = product?.metadata?.print_technology_name
//   if (printTechName) {
//     const normalized = String(printTechName).toLowerCase().trim()
//     const mapped = PRINT_TECHNOLOGY_MAP[normalized]

//     if (mapped) {
//       //console.log(`   ✅ Mapped '${normalized}' to print_type_id: ${mapped}`)
//       return mapped
//     }
//   }

//   // Check product metadata
//   const productPrintType = product?.metadata?.qikink_print_type_id
//   if (productPrintType) {
//     //console.log(`   ✅ Using print_type_id from product: ${productPrintType}`)
//     return String(productPrintType)
//   }

//   // Default to DTG
//   //console.log("   ⚠️ No print type found, defaulting to DTG (1)")
//   return "1"
// }

// /**
//  * Build designs for item by fetching artwork
//  */
// async function buildDesignsForItem(query: any, item: any): Promise<any[]> {
//   const product = item.product

//   if (!product) {
//     //console.log(`   ⚠️ No product data, using fallback design`)
//     return buildFallbackDesign(item)
//   }

//   // Fetch artwork
//   const artworkData = await fetchArtworkForProduct(query, product.id, item.metadata || {})

//   if (!artworkData?.mediaFiles || artworkData.mediaFiles.length === 0) {
//     //console.log("   ⚠️ No artwork found, using fallback design")
//     return buildFallbackDesign(item)
//   }

//   const designs: any[] = []
//   const baseUrl = process.env.BACKEND_URL || "https://files.junooni.com"

//   // Group designs by area
//   const designsByArea: Record<string, any[]> = {}
//   const layoutsByArea: Record<string, string> = {}

//   artworkData.mediaFiles.forEach((media: any) => {
//     const area = getAreaFromDescription(media.file_description || "")
//     const desc = String(media.file_description || "").toLowerCase()
//     const url = media.fileId
//       ? `${baseUrl}/junooni-files/${media.fileId}`
//       : media.url || media.file_url || ""

//     if (!isValidUrl(url)) return

//     if (desc.includes("design element") && !desc.includes("manufacturing layout")) {
//       if (!designsByArea[area]) {
//         designsByArea[area] = []
//       }
//       designsByArea[area].push({
//         area,
//         url,
//         description: media.file_description,
//       })
//     } else if (desc.includes("manufacturing layout")) {
//       layoutsByArea[area] = url
//     }
//   })

//   // Build design objects
//   Object.entries(designsByArea).forEach(([area, elements]) => {
//     elements.forEach((element) => {
//       const placementSku = getPlacementSku(area)
      
//       // Extract date and random part from variant SKU
//       // Expected format: JUNI-golden-yellow-x-271225-MJNYKZ9N
//       const variantSku = item?.variant?.sku || ""
      
//       console.log("🔍 Debug SKU extraction:")
//       console.log("   variant SKU:", variantSku)
      
//       let designCode = ""
      
//       // Split by dash and get the last two parts (date and random)
//       const skuParts = variantSku.split("-")
      
//       if (skuParts.length >= 2) {
//         // Get last two parts: date (271225) and random (MJNYKZ9N)
//         const datePart = skuParts[skuParts.length - 2]
//         const randomPart = skuParts[skuParts.length - 1]
        
//         // Check if datePart looks like a date (6 digits: DDMMYY)
//         if (datePart && /^\d{6}$/.test(datePart)) {
//           designCode = `${datePart}-${randomPart}`
//           console.log("   ✅ Extracted design code:", designCode)
//         } else {
//           // Fallback: use just the last part
//           designCode = randomPart || "default"
//           console.log("   ⚠️ Date format not found, using last part:", designCode)
//         }
//       } else {
//         // Fallback for unexpected format
//         const randomSuffix = Math.floor(Math.random() * 9000) + 1000
//         designCode = `default-${randomSuffix}-${placementSku}`
//         console.log("   ⚠️ SKU format unexpected, using random:", designCode)
//       }

//       designs.push({
//         design_code: designCode,
//         width_inches: "",
//         height_inches: "",
//         placement_sku: placementSku,
//         mockup_link: layoutsByArea[area] || item.thumbnail || "",
//         design_link: element.url,
//       })

//       console.log(`   ✅ Added ${area} design with code ${designCode}: ${element.url}`)
//     })
//   })

//   if (designs.length === 0) {
//     //console.log("   ⚠️ No valid designs found in artwork, using fallback")
//     return buildFallbackDesign(item)
//   }

//   return designs
// }

// /**
//  * Fetch artwork for product
//  */
// async function fetchArtworkForProduct(
//   query: any,
//   productId: string,
//   itemMetadata: Record<string, any>
// ) {
//   // Resolve artwork ID
//   const artworkId = await resolveArtworkId(query, productId, itemMetadata)

//   if (!artworkId) {
//     //console.log(`   ℹ️ No artwork ID found for product ${productId}`)
//     return null
//   }

//   // Fetch artwork data
//   try {
//     const { data: artwork } = await query.graph({
//       entity: "vendor_artwork",
//       fields: ["*", "medias.*"],
//       filters: {
//         id: artworkId,
//       },
//     })

//     if (!artwork || artwork.length === 0) {
//       console.log(`   ⚠️ Artwork ${artworkId} not found`)
//       return null
//     }

//     const artworkData = artwork[0]
//     const mediaFiles = artworkData?.medias || []

//     //console.log(`   ✅ Found artwork with ${mediaFiles.length} media files`)

//     return {
//       artworkData,
//       mediaFiles,
//     }
//   } catch (error) {
//     console.error(`   ❌ Error fetching artwork:`, error)
//     return null
//   }
// }

// /**
//  * Resolve artwork ID from various sources
//  */
// async function resolveArtworkId(
//   query: any,
//   productId: string,
//   itemMetadata: Record<string, any>
// ): Promise<string | null> {
//   // Check item metadata first
//   const fromItem =
//     itemMetadata?.artwork_id ||
//     itemMetadata?.artworkId ||
//     itemMetadata?.design_artwork_id ||
//     itemMetadata?.vendor_artwork_id

//   if (fromItem) {
//     console.log(`   🎯 Found artwork ID in item metadata: ${fromItem}`)
//     return String(fromItem)
//   }

//   // Check item design_artwork
//   if (itemMetadata?.design_artwork) {
//     try {
//       const da =
//         typeof itemMetadata.design_artwork === "string"
//           ? JSON.parse(itemMetadata.design_artwork)
//           : itemMetadata.design_artwork

//       if (Array.isArray(da) && da[0]?.artwork_id) {
//         console.log(`   🎯 Found artwork ID in design_artwork: ${da[0].artwork_id}`)
//         return String(da[0].artwork_id)
//       }
//     } catch (e) {
//       console.log("   ⚠️ Failed to parse design_artwork from item")
//     }
//   }

//   // Check product metadata
//   try {
//     const { data: [product] } = await query.graph({
//       entity: "product",
//       fields: ["id", "metadata"],
//       filters: {
//         id: productId,
//       },
//     })

//     if (!product) return null

//     const designArtworkRaw = product.metadata?.design_artwork
//     if (designArtworkRaw) {
//       try {
//         const designArtwork =
//           typeof designArtworkRaw === "string"
//             ? JSON.parse(designArtworkRaw)
//             : designArtworkRaw

//         if (Array.isArray(designArtwork) && designArtwork.length > 0) {
//           const first = designArtwork[0]
//           const artworkId =
//             first?.artwork_id ||
//             first?.vendor_artwork_id ||
//             first?.artwork_data?.vendor_artwork?.id

//           if (artworkId) {
//             console.log(`   🎯 Found artwork ID in product design_artwork: ${artworkId}`)
//             return String(artworkId)
//           }
//         }
//       } catch (e) {
//         console.log("   ⚠️ Failed to parse design_artwork from product")
//       }
//     }

//     // Check other product fields
//     const candidates = [
//       product.metadata?.artwork_id,
//       product.metadata?.vendor_artwork_id,
//     ]

//     for (const c of candidates) {
//       if (c) {
//         console.log(`   🎯 Found artwork ID in product metadata: ${c}`)
//         return String(c)
//       }
//     }
//   } catch (error) {
//     console.error("   ❌ Error resolving artwork ID:", error)
//   }

//   return null
// }

// /**
//  * Build fallback design when no artwork is available
//  */
// function buildFallbackDesign(item: any): any[] {
//   const fallbackDesignLink =
//     item.metadata?.qikink_design_link ||
//     item.variant?.metadata?.qikink_design_link ||
//     item.thumbnail ||
//     ""

//   const design: any = {
//     design_code: item.variant?.title || "default",
//     width_inches: "",
//     height_inches: "",
//     placement_sku: "fr",
//     mockup_link: item.thumbnail || "",
//   }

//   if (isValidUrl(fallbackDesignLink)) {
//     design.design_link = fallbackDesignLink
//     console.log(`   ✅ Using fallback design: ${fallbackDesignLink}`)
//   } else {
//     console.log("   ⚠️ No valid design link available")
//   }

//   return [design]
// }

// /**
//  * Helper: Get area from file description
//  */
// function getAreaFromDescription(desc: string): string {
//   const lower = desc.toLowerCase()
//   if (lower.includes("front area")) return "front"
//   if (lower.includes("back area")) return "back"
//   if (lower.includes("left sleeve")) return "left_sleeve"
//   if (lower.includes("right sleeve")) return "right_sleeve"
//   return "front"
// }

// /**
//  * Helper: Get placement SKU from area
//  */
// function getPlacementSku(area: string): string {
//   const mapping: Record<string, string> = {
//     front: "fr",
//     back: "bk",
//     left_sleeve: "sl",
//     right_sleeve: "sr",
//   }
//   return mapping[area] || "fr"
// }

// /**
//  * Helper: Validate URL
//  */
// function isValidUrl(url: string): boolean {
//   if (!url) return false
//   try {
//     new URL(url)
//     return url.startsWith("http://") || url.startsWith("https://")
//   } catch {
//     return false
//   }
// }

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

      // Generate short order ID
      const timestamp = Date.now().toString().slice(-9)
      const random = Math.random().toString(36).substring(2, 5).toUpperCase()
      const shortOrderId = `ORD${timestamp}${random}`

      console.log(`📋 Order number: ${shortOrderId}`)

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
        order_number: shortOrderId,
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
      const qikinkOrderNumber = responseData.number || shortOrderId

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
          qikink_short_order_id: shortOrderId,
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
        short_order_id: shortOrderId,
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
  "aop": "2",
  "embroidery": "3",
  "accessories": "5",
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
      
      // Extract dimensions from file_description
      const dimensions = extractDimensionsFromDescription(element.description)
      
      console.log(`   📏 ${area} dimensions: ${dimensions.width}" x ${dimensions.height}"`)
      
      // Extract date and random part from variant SKU
      // Expected format: JUNI-golden-yellow-x-271225-MJNYKZ9N
      const variantSku = item?.variant?.sku || ""
      
      console.log("🔍 Debug SKU extraction:")
      console.log("   variant SKU:", variantSku)
      
      let designCode = ""
      
      // Split by dash and get the last two parts (date and random)
      const skuParts = variantSku.split("-")
      
      if (skuParts.length >= 2) {
        // Get last two parts: date (271225) and random (MJNYKZ9N)
        const datePart = skuParts[skuParts.length - 2]
        const randomPart = skuParts[skuParts.length - 1]
        
        // Check if datePart looks like a date (6 digits: DDMMYY)
        if (datePart && /^\d{6}$/.test(datePart)) {
          designCode = `${datePart}-${randomPart}`
          console.log("   ✅ Extracted design code:", designCode)
        } else {
          // Fallback: use just the last part
          designCode = randomPart || "default"
          console.log("   ⚠️ Date format not found, using last part:", designCode)
        }
      } else {
        // Fallback for unexpected format - keep under 20 chars
        const randomSuffix = Math.floor(Math.random() * 9000) + 1000
        designCode = `def-${randomSuffix}` // Max 9 chars
        console.log("   ⚠️ SKU format unexpected, using random:", designCode)
      }

      designs.push({
        design_code: designCode,
        width_inches: dimensions.width ? parseFloat(dimensions.width) : "",
        height_inches: dimensions.height ? parseFloat(dimensions.height) : "",
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

/**
 * Extract width and height from file_description
 * Format: "Dimensions: 13.922" x 15.005""
 */
function extractDimensionsFromDescription(description: string): { width: string; height: string } {
  if (!description) {
    return { width: "", height: "" }
  }

  // Match pattern: "Dimensions: X.XXX" x Y.YYY""
  const dimensionMatch = description.match(/Dimensions:\s*([\d.]+)"\s*x\s*([\d.]+)"/)
  
  if (dimensionMatch && dimensionMatch.length >= 3) {
    return {
      width: dimensionMatch[1],
      height: dimensionMatch[2],
    }
  }

  // Fallback: try to find any dimensions pattern
  const fallbackMatch = description.match(/([\d.]+)"\s*x\s*([\d.]+)"/)
  
  if (fallbackMatch && fallbackMatch.length >= 3) {
    return {
      width: fallbackMatch[1],
      height: fallbackMatch[2],
    }
  }

  console.log("   ⚠️ Could not extract dimensions from description")
  return { width: "", height: "" }
}
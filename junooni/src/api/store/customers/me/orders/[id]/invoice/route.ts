// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { INVOICE_MODULE } from "../../../../../../../modules/invoice-generator"

// function generateSafeDisplayId(orderDisplayId?: string | number): number {
//   if (orderDisplayId) {
//     const orderStr = orderDisplayId.toString()
//     const orderNum = parseInt(orderStr.replace(/\D/g, '')) || 1
//     return 1000000 + orderNum
//   }
  
//   const timestampInSeconds = Math.floor(Date.now() / 1000)
//   const randomSuffix = Math.floor(Math.random() * 999)
//   const displayId = parseInt(`${timestampInSeconds.toString().slice(-6)}${randomSuffix.toString().padStart(3, '0')}`)
  
//   return Math.min(displayId, 2147483647)
// }

// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {
//   try {
//     console.log('\n\n=== INVOICE GENERATION STARTED ===')
//     console.log('Step 1: Checking authentication...')
    
//     const { id: orderId } = req.params
//     const customerId = req.user?.customer_id || req.auth_context?.actor_id

//     if (!customerId) {
//       console.error('❌ Step 1 FAILED: Authentication required')
//       return res.status(401).json({
//         message: "Authentication required"
//       })
//     }
    
//     console.log('✅ Step 1 PASSED: Customer authenticated:', customerId)

//     if (!orderId) {
//       console.error('❌ Order ID missing')
//       return res.status(400).json({
//         message: "Order ID is required"
//       })
//     }
    
//     console.log('✅ Order ID received:', orderId)

//     console.log('\nStep 2: Resolving query service...')
//     const query = req.scope.resolve("query")
//     console.log('✅ Step 2 PASSED: Query service resolved')
    
//     console.log('\nStep 3: Fetching order with items and fulfillments...')
    
//     let orders
//     try {
//       const result = await query.graph({
//         entity: "order",
//         fields: [
//           "id",
//           "display_id", 
//           "customer_id",
//           "status",
//           "total",
//           "subtotal",
//           "tax_total",
//           "shipping_total",
//           "shipping_subtotal",
//           "shipping_tax_total",
//           "discount_total",
//           "currency_code",
//           "created_at",
//           "metadata",
//           "items.*",
//           "items.metadata",
//           "items.tax_lines.*",
//           "fulfillments.*",
//           "fulfillments.location_id",
//           "shipping_methods.*",
//           "shipping_methods.tax_lines.*",
//           "billing_address.*",
//           "shipping_address.*",
//           "customer.*"
//         ],
//         filters: {
//           id: orderId
//         }
//       })
      
//       orders = result.data
//       console.log('✅ Step 3 PASSED: Order query successful')
      
//     } catch (queryError) {
//       console.error('❌ Step 3 FAILED: Order query error')
//       console.error('Error message:', queryError.message)
      
//       return res.status(500).json({
//         message: "Failed to fetch order",
//         error: queryError.message,
//         step: "Order Query"
//       })
//     }

//     console.log('\nStep 4: Validating order data...')
//     const order = orders?.[0]
    
//     if (!order) {
//       console.error('❌ Step 4 FAILED: Order not found')
//       return res.status(404).json({
//         message: "Order not found"
//       })
//     }
    
//     console.log('✅ Step 4 PASSED: Order found')

//     console.log('\nStep 5: Checking order ownership...')
//     if (order.customer_id !== customerId) {
//       console.error('❌ Step 5 FAILED: Access denied')
//       return res.status(403).json({
//         message: "Access denied"
//       })
//     }
    
//     console.log('✅ Step 5 PASSED: Customer owns this order')

//     console.log('\nStep 6: Checking order items...')
    
//     if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
//       console.error('❌ Step 6 FAILED: No items in order')
//       return res.status(400).json({
//         message: "Order has no items"
//       })
//     }
    
//     console.log('✅ Step 6 PASSED: Order has', order.items.length, 'items')

//     // ✅ FETCH PRODUCT DATA WITH ALL POSSIBLE FIELDS
//     console.log('\n=== FETCHING PRODUCT DATA ===')
//     const firstItem = order.items[0]
//     const productId = firstItem.product_id
    
//     console.log('📦 Item ID:', firstItem.id)
//     console.log('📦 Item Title:', firstItem.title)
//     console.log('📦 Product ID:', productId)
    
//     let productData = null
//     let fulfillmentType = 'junooni' // Default
//     let vendorId = null
    
//     if (productId) {
//       try {
//         console.log('📡 Fetching product data with ALL fields...')
//         const productResult = await query.graph({
//           entity: "product",
//           fields: [
//             "id",
//             "title",
//             "metadata",
//             "hs_code",
//             "vendor.*",
//             "*"  // Get ALL fields
//           ],
//           filters: {
//             id: productId
//           }
//         })
        
//         productData = productResult?.data?.[0]
        
//         if (productData) {
//           console.log('✅ Product found:', productData.title)
//           console.log('\n🔍 ALL PRODUCT FIELDS:')
//           console.log('Product keys:', Object.keys(productData))
//           console.log('\n📊 FULL PRODUCT DATA:')
//           console.log(JSON.stringify(productData, null, 2))
          
//           // ✅ AGGRESSIVE VENDOR_ID SEARCH
//           console.log('\n🔍🔍🔍 AGGRESSIVE VENDOR_ID SEARCH 🔍🔍🔍')
          
//           // 1. Direct property
//           if (productData.vendor_id) {
//             vendorId = productData.vendor_id
//             console.log('✅ Found vendor_id as DIRECT PROPERTY:', vendorId)
//           }
          
//           // 2. vendorId (camelCase)
//           if (!vendorId && productData.vendorId) {
//             vendorId = productData.vendorId
//             console.log('✅ Found vendorId as DIRECT PROPERTY (camelCase):', vendorId)
//           }
          
//           // 3. In metadata.vendor_id
//           if (!vendorId && productData.metadata?.vendor_id) {
//             vendorId = productData.metadata.vendor_id
//             console.log('✅ Found vendor_id in METADATA:', vendorId)
//           }
          
//           // 4. In metadata.vendorId
//           if (!vendorId && productData.metadata?.vendorId) {
//             vendorId = productData.metadata.vendorId
//             console.log('✅ Found vendorId in METADATA (camelCase):', vendorId)
//           }
          
//           // 5. In metadata.vendor (object with id)
//           if (!vendorId && productData.metadata?.vendor?.id) {
//             vendorId = productData.metadata.vendor.id
//             console.log('✅ Found vendor.id in METADATA:', vendorId)
//           }
          
//           // 6. In metadata.vendor as string
//           if (!vendorId && typeof productData.metadata?.vendor === 'string') {
//             vendorId = productData.metadata.vendor
//             console.log('✅ Found vendor as STRING in METADATA:', vendorId)
//           }
          
//           // 7. Check if vendor is a JSON string
//           if (!vendorId && productData.metadata?.vendor && typeof productData.metadata.vendor === 'string') {
//             try {
//               const vendorData = JSON.parse(productData.metadata.vendor)
//               if (vendorData.id) {
//                 vendorId = vendorData.id
//                 console.log('✅ Found vendor_id by PARSING vendor JSON:', vendorId)
//               } else if (vendorData.vendor_id) {
//                 vendorId = vendorData.vendor_id
//                 console.log('✅ Found vendor_id in PARSED vendor JSON:', vendorId)
//               }
//             } catch (e) {
//               console.log('⚠️ metadata.vendor is string but not JSON')
//             }
//           }
          
//           // 8. Search ALL metadata keys for vendor-related fields
//           if (!vendorId && productData.metadata) {
//             console.log('\n🔍 Searching ALL metadata keys for vendor...')
//             console.log('Available metadata keys:', Object.keys(productData.metadata))
            
//             for (const key of Object.keys(productData.metadata)) {
//               const lowerKey = key.toLowerCase()
              
//               // Check if key contains "vendor"
//               if (lowerKey.includes('vendor')) {
//                 console.log(`  ➡️ Found vendor-related key: "${key}"`)
//                 console.log(`     Value:`, productData.metadata[key])
                
//                 // If it's a string that looks like an ID
//                 const value = productData.metadata[key]
//                 if (typeof value === 'string' && (value.startsWith('vendor_') || value.startsWith('vnd_'))) {
//                   vendorId = value
//                   console.log(`  ✅ Using this as vendor_id: ${vendorId}`)
//                   break
//                 }
                
//                 // If it's an object with id
//                 if (typeof value === 'object' && value?.id) {
//                   vendorId = value.id
//                   console.log(`  ✅ Using id from object: ${vendorId}`)
//                   break
//                 }
                
//                 // Try to parse if it's a JSON string
//                 if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
//                   try {
//                     const parsed = JSON.parse(value)
//                     if (parsed.id || parsed.vendor_id || parsed.vendorId) {
//                       vendorId = parsed.id || parsed.vendor_id || parsed.vendorId
//                       console.log(`  ✅ Found vendor_id in parsed JSON: ${vendorId}`)
//                       break
//                     }
//                   } catch (e) {
//                     console.log(`  ⚠️ Could not parse as JSON`)
//                   }
//                 }
//               }
//             }
//           }
          
//           // 9. Check if there's a vendor relationship loaded
//           if (!vendorId && productData.vendor) {
//             if (typeof productData.vendor === 'object') {
//               vendorId = productData.vendor.id || productData.vendor.vendor_id
//               console.log('✅ Found vendor_id from VENDOR RELATIONSHIP:', vendorId)
//             } else if (typeof productData.vendor === 'string') {
//               vendorId = productData.vendor
//               console.log('✅ Found vendor_id from VENDOR PROPERTY (string):', vendorId)
//             }
//           }
          
//           if (vendorId) {
//             console.log('\n🎉 VENDOR_ID FOUND:', vendorId)
//           } else {
//             console.log('\n⚠️ NO VENDOR_ID FOUND ANYWHERE IN PRODUCT DATA')
//             console.log('   Available product keys:', Object.keys(productData))
//             console.log('   Available metadata keys:', Object.keys(productData.metadata || {}))
//           }
          
//           // ✅ PARSE FULFILLMENT TYPE
//           console.log('\n🔍 EXTRACTING FULFILLMENT TYPE')
//           if (productData.metadata?.fulfillment_type) {
//             console.log('🔍 Raw fulfillment_type:', productData.metadata.fulfillment_type)
            
//             try {
//               const fulfillmentData = JSON.parse(productData.metadata.fulfillment_type)
//               console.log('✅ Parsed fulfillment data:', fulfillmentData)
              
//               if (fulfillmentData.type) {
//                 const rawType = fulfillmentData.type.toLowerCase()
//                   .replace(/-/g, '_')
//                   .replace(/\s+/g, '_')
                
//                 console.log('🎯 Normalized type:', rawType)
                
//                 if (rawType.includes('creator')) {
//                   fulfillmentType = 'creator'
//                   console.log('✅ Detected CREATOR fulfillment')
//                 } else if (rawType.includes('junooni')) {
//                   fulfillmentType = 'junooni'
//                   console.log('✅ Detected JUNOONI fulfillment')
//                 }
//               }
//             } catch (parseError) {
//               console.log('⚠️ Failed to parse fulfillment_type JSON:', parseError.message)
//             }
//           } else {
//             console.log('⚠️ No fulfillment_type in product metadata')
//           }
//         } else {
//           console.log('⚠️ Product query returned no data')
//         }
//       } catch (productError) {
//         console.log('⚠️ Error fetching product:', productError.message)
//       }
//     }
    
//     console.log('\n=== FULFILLMENT TYPE: ' + fulfillmentType.toUpperCase() + ' ===\n')
    
//     // Get location_id from fulfillment
//     let locationId = null
//     if (order.fulfillments && order.fulfillments.length > 0) {
//       locationId = order.fulfillments[0].location_id
//       if (locationId) {
//         console.log('✅ Found location_id from fulfillment:', locationId)
//       }
//     }
    
//     // Initialize addresses
//     let billFromAddress = null
//     let shipFromAddress = null
    
//     // ✅ CASE 1: CREATOR FULFILLMENT
//     if (fulfillmentType === 'creator') {
//       console.log('🎨 CREATOR FULFILLMENT - Need to fetch vendor address')
      
//       if (vendorId) {
//         console.log('🔍 Vendor ID found:', vendorId)
        
//         try {
//           console.log('📡 Fetching vendor data...')
//           const vendorResult = await query.graph({
//             entity: "vendor",
//             fields: [
//               "*"  // Get all vendor fields
//             ],
//             filters: {
//               id: vendorId
//             }
//           })
          
//           const vendor = vendorResult?.data?.[0]
          
//           if (vendor) {
//             console.log('✅ Vendor found!')
//             console.log('📊 Vendor keys:', Object.keys(vendor))
//             console.log('📊 Full vendor data:', JSON.stringify(vendor, null, 2))
            
//             // Build vendor address
//             const vendorAddress = {
//               company: vendor.companyname || 'Vendor',
//               address_1: vendor.address || '',
//               city: vendor.city || '',
//               province:  vendor.state || '',
//               postal_code: vendor.pincode || '',
//               phone: vendor.phonenumber || ''
//             }
            
//             billFromAddress = vendorAddress
//             shipFromAddress = vendorAddress
            
//             console.log('✅ Using vendor address for both BILL FROM and SHIP FROM')
//             console.log('   Company:', vendorAddress.company)
//             console.log('   Address:', vendorAddress.address_1, vendorAddress.city)
//           } else {
//             console.log('⚠️ Vendor query returned no data, falling back to Junooni')
//             fulfillmentType = 'junooni'
//           }
//         } catch (vendorError) {
//           console.log('⚠️ Error fetching vendor:', vendorError.message)
//           console.log('   Falling back to Junooni fulfillment')
//           fulfillmentType = 'junooni'
//         }
//       } else {
//         console.log('⚠️ No vendor_id found in product, falling back to Junooni')
//         fulfillmentType = 'junooni'
//       }
//     }
    
//     // ✅ CASE 2: JUNOONI FULFILLMENT
//     if (fulfillmentType === 'junooni') {
//       console.log('🏢 JUNOONI FULFILLMENT')
      
//       // BILL FROM = Invoice Config
//       console.log('📄 Getting invoice config for BILL FROM address...')
//       const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
      
//       try {
//         const invoiceConfigs = await invoiceGeneratorService.listInvoiceConfigs()
//         const config = invoiceConfigs?.[0]
        
//         if (config && config.company_name) {
//           console.log('✅ Invoice config found:', config.company_name)
          
//           const addressLines = config.company_address?.split('\n').filter(Boolean) || []
          
//           billFromAddress = {
//             company: config.company_name || 'Junooni',
//             address_1: addressLines[0] || '',
//             address_2: addressLines[1] || '',
//             city: addressLines[2]?.split(',')[0]?.trim() || '',
//             province: addressLines[2]?.split(',')[1]?.trim() || '',
//             postal_code: addressLines[2]?.split(',')[2]?.trim() || '',
//             country_code: 'IN',
//             phone: config.company_phone || '',
//             email: config.company_email || ''
//           }
          
//           console.log('✅ BILL FROM set to:', billFromAddress.company)
//         } else {
//           console.log('⚠️ No invoice config found, using default')
//           billFromAddress = {
//             company: 'Junooni',
//             address_1: 'C-30, Vasant Vihar',
//             address_2: 'Saharanpur',
//             city: 'Saharanpur',
//             province: 'Uttar Pradesh',
//             postal_code: '247001',
//             country_code: 'IN',
//             phone: '9090909090',
//             email: 'ddigicloud@gmail.com'
//           }
//         }
//       } catch (error) {
//         console.log('⚠️ Error getting invoice config:', error.message)
//         billFromAddress = {
//           company: 'Junooni',
//           address_1: 'C-30, Vasant Vihar',
//           address_2: 'Saharanpur',
//           city: 'Saharanpur',
//           province: 'Uttar Pradesh',
//           postal_code: '247001',
//           country_code: 'IN',
//           phone: '9090909090',
//           email: 'ddigicloud@gmail.com'
//         }
//       }
      
//       // SHIP FROM = Location
//       console.log('📍 Getting location from fulfillment for SHIP FROM...')
      
//       if (locationId) {
//         console.log('🔍 Location ID found:', locationId)
        
//         try {
//           console.log('📡 Fetching location data...')
//           const locationResult = await query.graph({
//             entity: "stock_location",
//             fields: [
//               "id",
//               "name",
//               "address.*"
//             ],
//             filters: {
//               id: locationId
//             }
//           })
          
//           const location = locationResult?.data?.[0]
          
//           if (location && location.address) {
//             console.log('✅ Location found:', location.name)
            
//             shipFromAddress = {
//               company: location.name || 'Junooni Warehouse',
//               address_1: location.address.address_1 || '',
//               address_2: location.address.address_2 || '',
//               city: location.address.city || '',
//               province: location.address.province || '',
//               postal_code: location.address.postal_code || '',
//               country_code: location.address.country_code || 'IN',
//               phone: location.address.phone || '',
//               email: ''
//             }
            
//             console.log('✅ SHIP FROM set to:', shipFromAddress.company)
//           } else {
//             console.log('⚠️ Location has no address, using BILL FROM')
//             shipFromAddress = billFromAddress
//           }
//         } catch (locationError) {
//           console.log('⚠️ Error fetching location:', locationError.message)
//           shipFromAddress = billFromAddress
//         }
//       } else {
//         console.log('⚠️ No location_id, using BILL FROM for SHIP FROM')
//         shipFromAddress = billFromAddress
//       }
//     }
    
//     // Final safety check
//     if (!billFromAddress) {
//       billFromAddress = {
//         company: 'Junooni',
//         address_1: 'C-30, Vasant Vihar',
//         address_2: 'Saharanpur',
//         city: 'Saharanpur',
//         province: 'Uttar Pradesh',
//         postal_code: '247001',
//         country_code: 'IN',
//         phone: '9090909090',
//         email: 'ddigicloud@gmail.com'
//       }
//     }
    
//     if (!shipFromAddress) {
//       shipFromAddress = billFromAddress
//     }
    
//     console.log('\n=== FULFILLMENT DETECTION COMPLETE ===')
//     console.log('📋 Final fulfillment type:', fulfillmentType)
//     console.log('🏢 Bill From:', billFromAddress.company)
//     console.log('📦 Ship From:', shipFromAddress.company)
//     console.log('=====================================\n')

//     console.log('\nStep 7: Getting/Creating invoice...')
//     const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
    
//     let invoice
//     try {
//       const existingInvoices = await invoiceGeneratorService.listInvoices({
//         order_id: orderId
//       })
//       invoice = existingInvoices?.[0]
//     } catch (error) {
//       console.log("⚠️ No existing invoice found")
//     }

//     if (!invoice) {
//       const statusesToTry = ["generated", "unpaid", "open", "created", "new", "active"]
//       let createdInvoice = null
      
//       for (const statusValue of statusesToTry) {
//         try {
//           const [invoiceResult] = await invoiceGeneratorService.createInvoices([{
//             order_id: orderId,
//             customer_id: customerId,
//             status: statusValue,
//             display_id: generateSafeDisplayId(order.display_id),
//             pdfContent: {}
//           }])
//           createdInvoice = invoiceResult
//           console.log(`✅ Created invoice with status: ${statusValue}`)
//           break
//         } catch (error) {
//           continue
//         }
//       }
      
//       if (!createdInvoice) {
//         const [invoiceResult] = await invoiceGeneratorService.createInvoices([{
//           order_id: orderId,
//           customer_id: customerId,
//           display_id: generateSafeDisplayId(order.display_id),
//           pdfContent: {}
//         }])
//         createdInvoice = invoiceResult
//       }
      
//       invoice = createdInvoice
//     }
    
//     console.log('✅ Step 7 PASSED: Invoice ready')

//     const extractNumeric = (value: any): number => {
//       if (value && typeof value === 'object' && value.numeric_ !== undefined) {
//         return Number(value.numeric_) || 0
//       }
//       return isNaN(Number(value)) ? 0 : Number(value)
//     }

//     const orderData = {
//       id: order.id,
//       display_id: order.display_id,
//       created_at: order.created_at,
//       subtotal: extractNumeric(order.subtotal),
//       tax_total: extractNumeric(order.tax_total),
//       discount_total: extractNumeric(order.discount_total),
//       total: extractNumeric(order.total),
//       shipping_total: extractNumeric(order.shipping_total),
//       shipping_subtotal: extractNumeric(order.shipping_subtotal || 0),
//       shipping_tax_total: extractNumeric(order.shipping_tax_total || 0),
//       currency_code: order.currency_code || 'INR',
//       shipping_methods: order.shipping_methods?.map((method: any) => ({
//         name: method.name || "Standard Shipping",
//         total: extractNumeric(method.total),
//         subtotal: extractNumeric(method.subtotal || 0),
//         tax_total: extractNumeric(method.tax_total || 0),
//         tax_lines: method.tax_lines || []
//       })) || [],
//       billing_address: order.billing_address || {},
//       shipping_address: order.shipping_address || {},
//       customer: order.customer || {},
//       status: order.status,
//       email: order.email,
//       items: order.items || []
//     }

//     const itemsData = (order.items || []).map((item: any) => {
//       const hsCode = productData?.hs_code || item.metadata?.hs_code || 'N/A'
      
//       return {
//         title: item.title || 'Unknown Item',
//         quantity: extractNumeric(item.quantity),
//         unit_price: extractNumeric(item.unit_price),
//         total: extractNumeric(item.total),
//         tax_total: extractNumeric(item.tax_total || 0),
//         hs_code: hsCode,
//         subtitle: item.subtitle,
//         thumbnail: item.thumbnail,
//         variant_id: item.variant_id,
//         product_id: item.product_id,
//         tax_lines: item.tax_lines || []
//       }
//     })

//     console.log('\nStep 10: Generating PDF...')
//     let pdfBuffer
//     try {
//       pdfBuffer = await invoiceGeneratorService.generatePdf({
//         order: orderData,
//         items: itemsData,
//         invoice_id: invoice.id,
//         bill_from_address: billFromAddress,
//         ship_from_address: shipFromAddress
//       })

//       console.log('✅ PDF generated successfully')
      
//       if (!pdfBuffer || pdfBuffer.length === 0) {
//         throw new Error('PDF service returned empty buffer')
//       }
      
//     } catch (pdfError) {
//       console.error('❌ PDF generation error:', pdfError.message)
      
//       return res.status(500).json({
//         message: "Failed to generate PDF",
//         error: pdfError.message
//       })
//     }

//     res.setHeader('Content-Type', 'application/pdf')
//     res.setHeader('Content-Disposition', `attachment; filename="invoice_${order.display_id}.pdf"`)
//     res.setHeader('Content-Length', pdfBuffer.length.toString())

//     console.log('\n=== INVOICE GENERATION COMPLETED ===\n')
//     return res.send(pdfBuffer)

//   } catch (error) {
//     console.error('\n❌❌❌ INVOICE GENERATION FAILED ❌❌❌')
//     console.error('Error:', error.message)
    
//     return res.status(500).json({
//       message: "Failed to generate invoice",
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     })
//   }
// }

// export async function GET(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {
//   try {
//     const { id: orderId } = req.params
//     const customerId = req.user?.customer_id || req.auth_context?.actor_id

//     if (!customerId) {
//       return res.status(401).json({
//         message: "Authentication required"
//       })
//     }

//     const query = req.scope.resolve("query")
    
//     const { data: orders } = await query.graph({
//       entity: "order",
//       fields: ["id", "display_id", "customer_id", "status", "total", "currency_code", "created_at"],
//       filters: { id: orderId }
//     })

//     const order = orders?.[0]
    
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" })
//     }

//     if (order.customer_id !== customerId) {
//       return res.status(403).json({ message: "Access denied" })
//     }

//     const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
    
//     try {
//       const existingInvoices = await invoiceGeneratorService.listInvoices({
//         order_id: orderId
//       })
      
//       const invoice = existingInvoices?.[0]
      
//       return res.json({
//         invoice: invoice || null,
//         order: {
//           id: order.id,
//           display_id: order.display_id,
//           status: order.status,
//           created_at: order.created_at,
//           total: order.total,
//           currency_code: order.currency_code
//         },
//         can_generate_invoice: true
//       })
//     } catch (error) {
//       return res.json({
//         invoice: null,
//         order: {
//           id: order.id,
//           display_id: order.display_id,
//           status: order.status,
//           created_at: order.created_at,
//           total: order.total,
//           currency_code: order.currency_code
//         },
//         can_generate_invoice: true
//       })
//     }

//   } catch (error) {
//     console.error('Error fetching invoice info:', error)
    
//     return res.status(500).json({
//       message: "Failed to fetch invoice information",
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     })
//   }
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICE_MODULE } from "../../../../../../../modules/invoice-generator"

function generateSafeDisplayId(orderDisplayId?: string | number): number {
  if (orderDisplayId) {
    const orderStr = orderDisplayId.toString()
    const orderNum = parseInt(orderStr.replace(/\D/g, '')) || 1
    return 1000000 + orderNum
  }
  
  const timestampInSeconds = Math.floor(Date.now() / 1000)
  const randomSuffix = Math.floor(Math.random() * 999)
  const displayId = parseInt(`${timestampInSeconds.toString().slice(-6)}${randomSuffix.toString().padStart(3, '0')}`)
  
  return Math.min(displayId, 2147483647)
}

// ✅ NEW: Helper function to fetch vendor data
async function fetchVendorData(vendorId: string, query: any) {
  try {
    console.log('📡 Fetching vendor data for:', vendorId)
    const vendorResult = await query.graph({
      entity: "vendor",
      fields: [
        "id",
        "companyname",
        "address",
        "city",
        "state",
        "pincode",
        "phonenumber",
        "email",
        "*"
      ],
      filters: {
        id: vendorId
      }
    })
    
    const vendor = vendorResult?.data?.[0]
    
    if (vendor) {
      console.log('✅ Vendor found:', vendor.companyname || vendorId)
      console.log('📊 Vendor data:', JSON.stringify(vendor, null, 2))
      
      return {
        company: vendor.companyname || vendor.company_name || 'Vendor',
        address_1: vendor.address || vendor.address_1 || '',
        address_2: vendor.address_2 || '',
        city: vendor.city || '',
        province: vendor.state || vendor.province || '',
        postal_code: vendor.pincode || vendor.postal_code || '',
        phone: vendor.phonenumber || vendor.phone || '',
        country_code: 'IN',
        email: vendor.email || ''
      }
    } else {
      console.log('⚠️ No vendor data returned from query')
    }
  } catch (error) {
    console.log('⚠️ Error fetching vendor:', error.message)
    console.error(error)
  }
  return null
}

// ✅ NEW: Extract vendor_id from product data
function extractVendorId(productData: any): string | null {
  if (!productData) return null
  
  console.log('\n🔍 Extracting vendor_id from product:', productData.title)
  
  // 1. Direct property
  if (productData.vendor_id) {
    console.log('✅ Found vendor_id as direct property:', productData.vendor_id)
    return productData.vendor_id
  }
  
  // 2. camelCase
  if (productData.vendorId) {
    console.log('✅ Found vendorId (camelCase):', productData.vendorId)
    return productData.vendorId
  }
  
  // 3. In metadata.vendor_id
  if (productData.metadata?.vendor_id) {
    console.log('✅ Found vendor_id in metadata:', productData.metadata.vendor_id)
    return productData.metadata.vendor_id
  }
  
  // 4. In metadata.vendorId
  if (productData.metadata?.vendorId) {
    console.log('✅ Found vendorId in metadata:', productData.metadata.vendorId)
    return productData.metadata.vendorId
  }
  
  // 5. In metadata.vendor.id
  if (productData.metadata?.vendor?.id) {
    console.log('✅ Found vendor.id in metadata:', productData.metadata.vendor.id)
    return productData.metadata.vendor.id
  }
  
  // 6. metadata.vendor as string
  if (typeof productData.metadata?.vendor === 'string') {
    console.log('✅ Found vendor as string in metadata:', productData.metadata.vendor)
    return productData.metadata.vendor
  }
  
  // 7. Parse JSON string
  if (productData.metadata?.vendor && typeof productData.metadata.vendor === 'string') {
    try {
      const vendorData = JSON.parse(productData.metadata.vendor)
      if (vendorData.id) {
        console.log('✅ Found vendor_id by parsing JSON:', vendorData.id)
        return vendorData.id
      }
    } catch (e) {
      // Not JSON
    }
  }
  
  // 8. Vendor relationship
  if (productData.vendor) {
    if (typeof productData.vendor === 'object') {
      const id = productData.vendor.id || productData.vendor.vendor_id
      if (id) {
        console.log('✅ Found vendor_id from relationship:', id)
        return id
      }
    } else if (typeof productData.vendor === 'string') {
      console.log('✅ Found vendor as string property:', productData.vendor)
      return productData.vendor
    }
  }
  
  console.log('⚠️ No vendor_id found for product:', productData.title)
  return null
}

// ✅ NEW: Extract fulfillment type
function extractFulfillmentType(productData: any): string {
  if (!productData?.metadata?.fulfillment_type) {
    return 'junooni'
  }
  
  try {
    const fulfillmentData = JSON.parse(productData.metadata.fulfillment_type)
    
    if (fulfillmentData.type) {
      const rawType = fulfillmentData.type.toLowerCase()
        .replace(/-/g, '_')
        .replace(/\s+/g, '_')
      
      if (rawType.includes('creator')) {
        console.log('✅ Detected CREATOR fulfillment for:', productData.title)
        return 'creator'
      } else if (rawType.includes('junooni')) {
        console.log('✅ Detected JUNOONI fulfillment for:', productData.title)
        return 'junooni'
      }
    }
  } catch (parseError) {
    console.log('⚠️ Failed to parse fulfillment_type for:', productData.title)
  }
  
  return 'junooni'
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    console.log('\n\n=== INVOICE GENERATION STARTED ===')
    console.log('Step 1: Checking authentication...')
    
    const { id: orderId } = req.params
    const customerId = req.user?.customer_id || req.auth_context?.actor_id

    if (!customerId) {
      console.error('❌ Step 1 FAILED: Authentication required')
      return res.status(401).json({
        message: "Authentication required"
      })
    }
    
    console.log('✅ Step 1 PASSED: Customer authenticated:', customerId)

    if (!orderId) {
      console.error('❌ Order ID missing')
      return res.status(400).json({
        message: "Order ID is required"
      })
    }
    
    console.log('✅ Order ID received:', orderId)

    console.log('\nStep 2: Resolving query service...')
    const query = req.scope.resolve("query")
    console.log('✅ Step 2 PASSED: Query service resolved')
    
    console.log('\nStep 3: Fetching order with items and fulfillments...')
    
    let orders
    try {
      const result = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id", 
          "customer_id",
          "status",
          "total",
          "subtotal",
          "tax_total",
          "shipping_total",
          "shipping_subtotal",
          "shipping_tax_total",
          "discount_total",
          "currency_code",
          "created_at",
          "metadata",
          "items.*",
          "items.metadata",
          "items.tax_lines.*",
          "fulfillments.*",
          "fulfillments.location_id",
          "shipping_methods.*",
          "shipping_methods.tax_lines.*",
          "billing_address.*",
          "shipping_address.*",
          "customer.*"
        ],
        filters: {
          id: orderId
        }
      })
      
      orders = result.data
      console.log('✅ Step 3 PASSED: Order query successful')
      
    } catch (queryError) {
      console.error('❌ Step 3 FAILED: Order query error')
      console.error('Error message:', queryError.message)
      
      return res.status(500).json({
        message: "Failed to fetch order",
        error: queryError.message,
        step: "Order Query"
      })
    }

    console.log('\nStep 4: Validating order data...')
    const order = orders?.[0]
    
    if (!order) {
      console.error('❌ Step 4 FAILED: Order not found')
      return res.status(404).json({
        message: "Order not found"
      })
    }
    
    console.log('✅ Step 4 PASSED: Order found')

    console.log('\nStep 5: Checking order ownership...')
    if (order.customer_id !== customerId) {
      console.error('❌ Step 5 FAILED: Access denied')
      return res.status(403).json({
        message: "Access denied"
      })
    }
    
    console.log('✅ Step 5 PASSED: Customer owns this order')

    console.log('\nStep 6: Checking order items...')
    
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error('❌ Step 6 FAILED: No items in order')
      return res.status(400).json({
        message: "Order has no items"
      })
    }
    
    console.log('✅ Step 6 PASSED: Order has', order.items.length, 'items')

    // ✅ NEW: Fetch product data for ALL items
    console.log('\n=== FETCHING PRODUCT DATA FOR ALL ITEMS ===')
    
    const productDataMap = new Map()
    const uniqueProductIds = [...new Set(order.items.map(item => item.product_id).filter(Boolean))]
    
    console.log('📦 Found', uniqueProductIds.length, 'unique products')
    
    for (const productId of uniqueProductIds) {
      try {
        console.log('\n📡 Fetching product:', productId)
        const productResult = await query.graph({
          entity: "product",
          fields: [
            "id",
            "title",
            "metadata",
            "hs_code",
            "vendor.*",
            "*"
          ],
          filters: {
            id: productId
          }
        })
        
        const productData = productResult?.data?.[0]
        
        if (productData) {
          console.log('✅ Product found:', productData.title)
          productDataMap.set(productId, productData)
        } else {
          console.log('⚠️ Product not found:', productId)
        }
      } catch (productError) {
        console.log('⚠️ Error fetching product:', productId, productError.message)
      }
    }
    
    console.log('✅ Fetched data for', productDataMap.size, 'products')

    // ✅ NEW: Get location for Junooni fulfillment
    let locationId = null
    let locationAddress = null
    
    if (order.fulfillments && order.fulfillments.length > 0) {
      locationId = order.fulfillments[0].location_id
      
      if (locationId) {
        console.log('\n📍 Fetching location data:', locationId)
        try {
          const locationResult = await query.graph({
            entity: "stock_location",
            fields: [
              "id",
              "name",
              "address.*"
            ],
            filters: {
              id: locationId
            }
          })
          
          const location = locationResult?.data?.[0]
          
          if (location && location.address) {
            console.log('✅ Location found:', location.name)
            locationAddress = {
              company: location.name || 'Junooni Warehouse',
              address_1: location.address.address_1 || '',
              address_2: location.address.address_2 || '',
              city: location.address.city || '',
              province: location.address.province || '',
              postal_code: location.address.postal_code || '',
              country_code: location.address.country_code || 'IN',
              phone: location.address.phone || '',
              email: ''
            }
          }
        } catch (locationError) {
          console.log('⚠️ Error fetching location:', locationError.message)
        }
      }
    }

    // ✅ NEW: Get invoice config
    console.log('\n📄 Getting invoice config...')
    const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
    let invoiceConfigAddress = null
    
    try {
      const invoiceConfigs = await invoiceGeneratorService.listInvoiceConfigs()
      const config = invoiceConfigs?.[0]
      
      if (config && config.company_name) {
        console.log('✅ Invoice config found:', config.company_name)
        
        const addressLines = config.company_address?.split('\n').filter(Boolean) || []
        
        invoiceConfigAddress = {
          company: config.company_name || 'Junooni',
          address_1: addressLines[0] || '',
          address_2: addressLines[1] || '',
          city: addressLines[2]?.split(',')[0]?.trim() || '',
          province: addressLines[2]?.split(',')[1]?.trim() || '',
          postal_code: addressLines[2]?.split(',')[2]?.trim() || '',
          country_code: 'IN',
          phone: config.company_phone || '',
          email: config.company_email || ''
        }
      }
    } catch (error) {
      console.log('⚠️ Error getting invoice config:', error.message)
    }
    
    // Default fallback
    if (!invoiceConfigAddress) {
      invoiceConfigAddress = {
        company: 'Junooni',
        address_1: 'C-30, Vasant Vihar',
        address_2: 'Saharanpur',
        city: 'Saharanpur',
        province: 'Uttar Pradesh',
        postal_code: '247001',
        country_code: 'IN',
        phone: '9090909090',
        email: 'ddigicloud@gmail.com'
      }
    }

    // ✅ NEW: Process each item with its own product data
    console.log('\n=== PROCESSING ITEMS WITH VENDOR DATA ===')
    
    const extractNumeric = (value: any): number => {
      if (value && typeof value === 'object' && value.numeric_ !== undefined) {
        return Number(value.numeric_) || 0
      }
      return isNaN(Number(value)) ? 0 : Number(value)
    }
    
    const itemsDataWithVendors = await Promise.all(
      order.items.map(async (item: any) => {
        const productData = productDataMap.get(item.product_id)
        const hsCode = productData?.hs_code || item.metadata?.hs_code || 'N/A'
        
        console.log('\n📦 Processing item:', item.title)
        
        // Extract fulfillment type for this item
        const fulfillmentType = extractFulfillmentType(productData)
        console.log('   Fulfillment:', fulfillmentType)
        
        // Extract vendor_id for this item
        const vendorId = extractVendorId(productData)
        console.log('   Vendor ID:', vendorId || 'none')
        
        let vendorAddress = null
        let vendorName = null
        
        // If creator fulfillment and has vendor_id, fetch vendor data
        if (fulfillmentType === 'creator' && vendorId) {
          vendorAddress = await fetchVendorData(vendorId, query)
          if (vendorAddress) {
            vendorName = vendorAddress.company
            console.log('   ✅ Using vendor address:', vendorName)
          } else {
            console.log('   ⚠️ Vendor address not found, will use Junooni')
          }
        }
        
        // Determine bill_from and ship_from for this item
        let itemBillFrom = null
        let itemShipFrom = null
        
        if (fulfillmentType === 'creator' && vendorAddress) {
          // Creator: Use vendor for both
          itemBillFrom = vendorAddress
          itemShipFrom = vendorAddress
        } else {
          // Junooni: Use invoice config for bill, location for ship
          itemBillFrom = invoiceConfigAddress
          itemShipFrom = locationAddress || invoiceConfigAddress
        }
        
        return {
          title: item.title || 'Unknown Item',
          quantity: extractNumeric(item.quantity),
          unit_price: extractNumeric(item.unit_price),
          total: extractNumeric(item.total),
          tax_total: extractNumeric(item.tax_total || 0),
          hs_code: hsCode,
          subtitle: item.subtitle,
          thumbnail: item.thumbnail,
          variant_id: item.variant_id,
          product_id: item.product_id,
          tax_lines: item.tax_lines || [],
          // ✅ NEW: Vendor information per item
          vendor_id: vendorId,
          vendor_name: vendorName,
          vendor_address: vendorAddress,
          fulfillment_type: fulfillmentType,
          // ✅ NEW: Addresses per item
          bill_from: itemBillFrom,
          ship_from: itemShipFrom
        }
      })
    )
    
    console.log('\n✅ All items processed with vendor data')
    console.log('   Total items:', itemsDataWithVendors.length)
    console.log('   Creator items:', itemsDataWithVendors.filter(i => i.fulfillment_type === 'creator').length)
    console.log('   Junooni items:', itemsDataWithVendors.filter(i => i.fulfillment_type === 'junooni').length)

    console.log('\nStep 7: Getting/Creating invoice...')
    
    let invoice
    try {
      const existingInvoices = await invoiceGeneratorService.listInvoices({
        order_id: orderId
      })
      invoice = existingInvoices?.[0]
    } catch (error) {
      console.log("⚠️ No existing invoice found")
    }

    if (!invoice) {
      const statusesToTry = ["generated", "unpaid", "open", "created", "new", "active"]
      let createdInvoice = null
      
      for (const statusValue of statusesToTry) {
        try {
          const [invoiceResult] = await invoiceGeneratorService.createInvoices([{
            order_id: orderId,
            customer_id: customerId,
            status: statusValue,
            display_id: generateSafeDisplayId(order.display_id),
            pdfContent: {}
          }])
          createdInvoice = invoiceResult
          console.log(`✅ Created invoice with status: ${statusValue}`)
          break
        } catch (error) {
          continue
        }
      }
      
      if (!createdInvoice) {
        const [invoiceResult] = await invoiceGeneratorService.createInvoices([{
          order_id: orderId,
          customer_id: customerId,
          display_id: generateSafeDisplayId(order.display_id),
          pdfContent: {}
        }])
        createdInvoice = invoiceResult
      }
      
      invoice = createdInvoice
    }
    
    console.log('✅ Step 7 PASSED: Invoice ready')

    const orderData = {
      id: order.id,
      display_id: order.display_id,
      created_at: order.created_at,
      subtotal: extractNumeric(order.subtotal),
      tax_total: extractNumeric(order.tax_total),
      discount_total: extractNumeric(order.discount_total),
      total: extractNumeric(order.total),
      shipping_total: extractNumeric(order.shipping_total),
      shipping_subtotal: extractNumeric(order.shipping_subtotal || 0),
      shipping_tax_total: extractNumeric(order.shipping_tax_total || 0),
      currency_code: order.currency_code || 'INR',
      shipping_methods: order.shipping_methods?.map((method: any) => ({
        name: method.name || "Standard Shipping",
        total: extractNumeric(method.total),
        subtotal: extractNumeric(method.subtotal || 0),
        tax_total: extractNumeric(method.tax_total || 0),
        tax_lines: method.tax_lines || []
      })) || [],
      billing_address: order.billing_address || {},
      shipping_address: order.shipping_address || {},
      customer: order.customer || {},
      status: order.status,
      email: order.email,
      items: order.items || []
    }

    console.log('\nStep 10: Generating PDF...')
    let pdfBuffer
    try {
      // ✅ Pass items with vendor data to PDF generator
      pdfBuffer = await invoiceGeneratorService.generatePdf({
        order: orderData,
        items: itemsDataWithVendors,
        invoice_id: invoice.id
      })

      console.log('✅ PDF generated successfully')
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF service returned empty buffer')
      }
      
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError.message)
      
      return res.status(500).json({
        message: "Failed to generate PDF",
        error: pdfError.message
      })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${order.display_id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length.toString())

    console.log('\n=== INVOICE GENERATION COMPLETED ===\n')
    return res.send(pdfBuffer)

  } catch (error) {
    console.error('\n❌❌❌ INVOICE GENERATION FAILED ❌❌❌')
    console.error('Error:', error.message)
    
    return res.status(500).json({
      message: "Failed to generate invoice",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id: orderId } = req.params
    const customerId = req.user?.customer_id || req.auth_context?.actor_id

    if (!customerId) {
      return res.status(401).json({
        message: "Authentication required"
      })
    }

    const query = req.scope.resolve("query")
    
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "customer_id", "status", "total", "currency_code", "created_at"],
      filters: { id: orderId }
    })

    const order = orders?.[0]
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.customer_id !== customerId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
    
    try {
      const existingInvoices = await invoiceGeneratorService.listInvoices({
        order_id: orderId
      })
      
      const invoice = existingInvoices?.[0]
      
      return res.json({
        invoice: invoice || null,
        order: {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          total: order.total,
          currency_code: order.currency_code
        },
        can_generate_invoice: true
      })
    } catch (error) {
      return res.json({
        invoice: null,
        order: {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          total: order.total,
          currency_code: order.currency_code
        },
        can_generate_invoice: true
      })
    }

  } catch (error) {
    console.error('Error fetching invoice info:', error)
    
    return res.status(500).json({
      message: "Failed to fetch invoice information",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}
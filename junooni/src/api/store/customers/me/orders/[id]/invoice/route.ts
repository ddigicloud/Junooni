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

// ✅ FIXED: Helper function to fetch vendor data - now includes GSTIN
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
        "GSTIN",
        "*"
      ],
      filters: {
        id: vendorId
      }
    })
    
    const vendor = vendorResult?.data?.[0]
    
    if (vendor) {
      console.log('✅ Vendor found:', vendor.companyname || vendorId)
      console.log('📊 Vendor GSTIN:', vendor.GSTIN)
      
      return {
        // Formatted address
        company: vendor.companyname || vendor.company_name || 'Vendor',
        address_1: vendor.address || vendor.address_1 || '',
        address_2: vendor.address_2 || '',
        city: vendor.city || '',
        province: vendor.state || vendor.province || '',
        postal_code: vendor.pincode || vendor.postal_code || '',
        phone: vendor.phonenumber || vendor.phone || '',
        country_code: 'IN',
        email: vendor.email || '',
        gstin: vendor.GSTIN || null, // ✅ FIXED: Include GSTIN in address
        // ✅ FIXED: Include complete raw vendor data
        raw_vendor_data: vendor
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
    
    // Separate COD fee from regular items
        const codFeeItem = order.items.find((item: any) => item.metadata?.is_cod_fee === true)
        const regularItems = order.items.filter((item: any) => !item.metadata?.is_cod_fee)

        const itemsDataWithVendors = await Promise.all(
          regularItems.map(async (item: any) => {
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
        let vendorData = null // ✅ FIXED: Store complete vendor data
        
        // If creator fulfillment and has vendor_id, fetch vendor data
        if (fulfillmentType === 'creator' && vendorId) {
          vendorAddress = await fetchVendorData(vendorId, query)
          if (vendorAddress) {
            vendorName = vendorAddress.company
            vendorData = vendorAddress.raw_vendor_data // ✅ FIXED: Get raw vendor data
            console.log('   ✅ Using vendor address:', vendorName)
            console.log('   ✅ Vendor GSTIN:', vendorAddress.gstin)
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
          // ✅ FIXED: Vendor information per item with complete data
          vendor_id: vendorId,
          vendor_name: vendorName,
          vendor_address: vendorAddress,
          vendor_data: vendorData, // ✅ FIXED: Include raw vendor data with GSTIN
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
      cod_fee: codFeeItem ? extractNumeric(codFeeItem.unit_price) : 0,
      is_cod_order: !!codFeeItem,
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
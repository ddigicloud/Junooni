import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateInvoiceConfigWorkflow } from "../../../../../../../workflows/invoice-generator/update-invoice-config"
import { INVOICE_MODULE } from "../../../../../../../modules/invoice-generator"

// Helper function to prepare order data for PDF generation
function prepareOrderForInvoice(order: any) {
  // Calculate item subtotal from items if not available
  const itemsSubtotal = order.items?.reduce((sum: number, item: any) => {
    const itemTotal = (item.unit_price || 0) * (item.quantity || 0)
    return sum + itemTotal
  }, 0) || 0

  return {
    ...order,
    // Ensure all financial fields are numbers, not NaN
    subtotal: order.subtotal || itemsSubtotal || 0,
    tax_total: order.tax_total || 0,
    shipping_total: order.shipping_total || 0,
    discount_total: order.discount_total || 0,
    total: order.total || 0,
    
    // Prepare items with proper calculations
    items: order.items?.map((item: any) => ({
      ...item,
      unit_price: item.unit_price || 0,
      quantity: item.quantity || 0,
      total: (item.unit_price || 0) * (item.quantity || 0)
    })) || [],
    
    // Include shipping methods for shipping details
    shipping_methods: order.shipping_methods || [],
    
    // Include discounts for discount details  
    discounts: order.discounts || [],
    
    // Include adjustments for additional charges/discounts
    adjustments: order.adjustments || []
  }
}
function generateSafeDisplayId(orderDisplayId?: string | number): number {
  // Option 1: Use order-based invoice numbering
  if (orderDisplayId) {
    // Convert to string first, then extract numbers
    const orderStr = orderDisplayId.toString()
    const orderNum = parseInt(orderStr.replace(/\D/g, '')) || 1
    return 1000000 + orderNum // Invoice starts at 1000001, 1000002, etc.
  }
  
  // Option 2: Use timestamp in seconds + random suffix
  const timestampInSeconds = Math.floor(Date.now() / 1000)
  const randomSuffix = Math.floor(Math.random() * 999)
  const displayId = parseInt(`${timestampInSeconds.toString().slice(-6)}${randomSuffix.toString().padStart(3, '0')}`)
  
  // Ensure it's within PostgreSQL integer range
  return Math.min(displayId, 2147483647)
}

export async function POST(
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

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required"
      })
    }

    // Use query service to get order data
    const query = req.scope.resolve("query")
    
    // Get order with essential fields for invoice generation
    const { data: orders } = await query.graph({
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
        "discount_total",
        "currency_code",
        "hs_code",
        "created_at",
        "items.*",
        "billing_address.*",
        "shipping_address.*"
      ],
      filters: {
        id: orderId
      }
    })

    const order = orders?.[0]
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    // Verify that the order belongs to the authenticated customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({
        message: "Access denied: Order does not belong to authenticated customer"
      })
    }

    // Get or create invoice record
    const invoiceGeneratorService = req.scope.resolve(INVOICE_MODULE)
    
    // Debug: Check if service is properly configured
    console.log('Invoice service available:', !!invoiceGeneratorService)
    console.log('Invoice service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(invoiceGeneratorService)))
    
    let invoice
    try {
      // Try to find existing invoice for this order
      const existingInvoices = await invoiceGeneratorService.listInvoices({
        order_id: orderId
      })
      invoice = existingInvoices?.[0]
    } catch (error) {
      console.log("No existing invoice found, will create new one")
    }

    // Create invoice if it doesn't exist
    if (!invoice) {
      // Try different status values until one works
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
          console.log(`✅ Successfully created invoice with status: ${statusValue}`)
          break // Success! Exit the loop
        } catch (error) {
          console.log(`❌ Failed with status "${statusValue}":`, error.message)
          // Continue to next status
        }
      }
      
      // If all status values fail, try without status (let service set default)
      if (!createdInvoice) {
        try {
          const [invoiceResult] = await invoiceGeneratorService.createInvoices([{
            order_id: orderId,
            customer_id: customerId,
            // No status - let service set default
            display_id: generateSafeDisplayId(order.display_id),
            pdfContent: {}
          }])
          createdInvoice = invoiceResult
          console.log(`✅ Successfully created invoice without explicit status`)
        } catch (error) {
          throw new Error(`Failed to create invoice with any status: ${error.message}`)
        }
      }
      
      invoice = createdInvoice
    } // 🔧 FIXED: Added missing closing brace for if (!invoice) block

    // Generate PDF using the exact structure expected by the service template
    let pdfBuffer
    try {
      console.log('=== DETAILED DEBUGGING FOR POSTMAN ===')
      
      // Helper function to extract numeric value from BigNumber or regular number
      const extractNumeric = (value: any): number => {
        if (value && typeof value === 'object' && value.numeric_ !== undefined) {
          console.log(`🔍 Converting BigNumber: ${value.numeric_}`)
          return Number(value.numeric_) || 0
        }
        console.log(`🔍 Converting regular value: ${value}`)
        return isNaN(Number(value)) ? 0 : Number(value)
      }
      
      // Extract numeric values from BigNumber objects
      const safeSubtotal = extractNumeric(order.subtotal)
      const safeTaxTotal = extractNumeric(order.tax_total)
      const safeShippingTotal = extractNumeric(order.shipping_total)
      const safeDiscountTotal = extractNumeric(order.discount_total)
      const safeTotal = extractNumeric(order.total)
      
      console.log('✅ EXTRACTED VALUES:', {
        subtotal: safeSubtotal,
        tax_total: safeTaxTotal,
        shipping_total: safeShippingTotal,
        discount_total: safeDiscountTotal,
        total: safeTotal
      })
      
      // Test formatAmount function directly here
      try {
        console.log('🧪 TESTING formatAmount DIRECTLY:')
        const testSubtotal = await invoiceGeneratorService.formatAmount(safeSubtotal, 'INR')
        const testTax = await invoiceGeneratorService.formatAmount(safeTaxTotal, 'INR')
        const testShipping = await invoiceGeneratorService.formatAmount(safeShippingTotal, 'INR')
        const testDiscount = await invoiceGeneratorService.formatAmount(safeDiscountTotal, 'INR')
        const testTotal = await invoiceGeneratorService.formatAmount(safeTotal, 'INR')
        
        console.log('✅ FORMAT TEST RESULTS:', {
          subtotal: testSubtotal,
          tax: testTax,
          shipping: testShipping,
          discount: testDiscount,
          total: testTotal
        })
      } catch (formatError) {
        console.error('❌ FORMAT TEST FAILED:', formatError.message)
      }
      
      // Completely rebuild the order object (don't spread original to avoid BigNumber conflicts)
      const correctOrderStructure = {
        // Core identifiers
        id: order.id,
        display_id: order.display_id,
        created_at: order.created_at,
        
        // Financial values (converted from BigNumber)
        subtotal: safeSubtotal,
        tax_total: safeTaxTotal,
        discount_total: safeDiscountTotal,
        total: safeTotal,
        
        // Currency
        currency_code: 'INR', // Force INR to avoid any currency issues
        
        // Shipping methods with converted totals
        shipping_methods: [{
          name: "Standard Shipping",
          total: safeShippingTotal
        }],
        
        // Addresses
        billing_address: order.billing_address || {},
        shipping_address: order.shipping_address || {},
        
        // Customer info
        customer: order.customer || {},
        
        // Any other essential fields
        status: order.status,
        email: order.email
      }
      
      // Process items with BigNumber conversion
      const correctItems = (order.items || []).map(item => ({
        title: item.title || 'Unknown Item',
        quantity: extractNumeric(item.quantity),
        unit_price: extractNumeric(item.unit_price),
        total: extractNumeric(item.total),
        // Keep other item properties that aren't financial
        subtitle: item.subtitle,
        thumbnail: item.thumbnail,
        variant_id: item.variant_id,
        product_id: item.product_id
      }))

      console.log('📦 FINAL DATA BEING SENT TO PDF SERVICE:')
      console.log('Order:', JSON.stringify({
        subtotal: correctOrderStructure.subtotal,
        tax_total: correctOrderStructure.tax_total,
        shipping_methods: correctOrderStructure.shipping_methods,
        discount_total: correctOrderStructure.discount_total,
        total: correctOrderStructure.total,
        currency_code: correctOrderStructure.currency_code
      }, null, 2))
      
      console.log('Items:', JSON.stringify(correctItems.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      })), null, 2))

      console.log('🚀 CALLING PDF SERVICE...')
      
      pdfBuffer = await invoiceGeneratorService.generatePdf({
        order: correctOrderStructure,
        items: correctItems,
        invoice_id: invoice.id
      })

      console.log('✅ PDF SERVICE COMPLETED SUCCESSFULLY')
      console.log('📊 PDF Buffer size:', pdfBuffer.length, 'bytes')
      
    } catch (pdfError) {
      console.error('❌ PDF GENERATION ERROR DETAILS:')
      console.error('Error message:', pdfError.message)
      console.error('Error stack:', pdfError.stack)
      console.error('Error object:', pdfError)
      throw new Error(`PDF generation failed: ${pdfError.message}`)
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${order.display_id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length.toString())

    // Send the PDF
    return res.send(pdfBuffer)

  } catch (error) {
    console.error('Error generating customer invoice:', error)
    
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

    // Use query service to get order data
    const query = req.scope.resolve("query")
    
    // Get basic order information
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "customer_id", 
        "status",
        "total",
        "currency_code",
        "created_at"
      ],
      filters: {
        id: orderId
      }
    })

    const order = orders?.[0]
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    // Verify that the order belongs to the authenticated customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({
        message: "Access denied: Order does not belong to authenticated customer"
      })
    }

    // Get invoice information
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
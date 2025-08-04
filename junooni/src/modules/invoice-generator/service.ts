import { MedusaService } from "@medusajs/framework/utils"
import { InvoiceConfig } from "./models/invoice-config";
import { Invoice, InvoiceStatus } from "./models/invoice";
import PdfPrinter from "pdfmake"
import { InferTypeOf, OrderDTO, OrderLineItemDTO } from "@medusajs/framework/types"
import axios from "axios"

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
}

const printer = new PdfPrinter(fonts)

type GeneratePdfParams = {
  order: OrderDTO
  items: OrderLineItemDTO[]
}

class InvoiceGeneratorService extends MedusaService({
  InvoiceConfig,
  Invoice
}) {
  
  // Helper function to safely extract numeric values from BigNumber objects
  private extractNumeric(value: any): number {
    if (value && typeof value === 'object' && value.numeric_ !== undefined) {
      const result = Number(value.numeric_)
      return isNaN(result) ? 0 : result
    }
    const result = Number(value)
    return isNaN(result) ? 0 : result
  }

  // CHANGED METHOD NAME to avoid conflict with base class
  async updateInvoiceConfigData(data: {
  id?: string
  company_name?: string
  company_address?: string
  company_phone?: string
  company_email?: string
  company_logo?: string
  notes?: string
}): Promise<InferTypeOf<typeof InvoiceConfig>> {
  try {
    const existingConfigs = await this.listInvoiceConfigs()

    if (existingConfigs && existingConfigs.length > 0) {
      const existingConfig = existingConfigs[0]

      const updated = await this.updateInvoiceConfigs([
        {
          id: existingConfig.id,
          company_name: data.company_name ?? existingConfig.company_name,
          company_address: data.company_address ?? existingConfig.company_address,
          company_phone: data.company_phone ?? existingConfig.company_phone,
          company_email: data.company_email ?? existingConfig.company_email,
          company_logo: data.company_logo ?? existingConfig.company_logo,
          notes: data.notes ?? existingConfig.notes,
        }
      ])

      return updated[0]
    } else {
      const newConfig = {
        company_name: data.company_name || "",
        company_address: data.company_address || "",
        company_phone: data.company_phone || "",
        company_email: data.company_email || "",
        company_logo: data.company_logo || "",
        notes: data.notes || "",
      }

      const [created] = await this.createInvoiceConfigs([newConfig])
      return created
    }
  } catch (error) {
    throw error
  }
}


  async generatePdf(params: GeneratePdfParams & {
    invoice_id: string
    forceRegenerate?: boolean
  }): Promise<Buffer> {
    const invoice = await this.retrieveInvoice(params.invoice_id)

    // Always regenerate PDF content with latest data (no caching)
    console.log('🔄 REGENERATING PDF with latest order data...')
    const pdfContent = await this.createInvoiceContent(params, invoice)

    // Update the stored PDF content
    await this.updateInvoices({
      id: invoice.id,
      pdfContent
    })

    // get PDF as a Buffer
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
  
      const pdfDoc = printer.createPdfKitDocument(pdfContent as any)
      
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on('error', err => reject(err));
  
      pdfDoc.end(); // Finalize PDF stream
    });
  }

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service
// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service

// Updated createInvoiceContent method - replace the existing one in your service
private async createInvoiceContent(
  params: GeneratePdfParams, 
  invoice: InferTypeOf<typeof Invoice>
): Promise<Record<string, any>> {
  // Get invoice configuration
  const invoiceConfigs = await this.listInvoiceConfigs()
  const config = invoiceConfigs[0] || {}

  // Convert BigNumber values to regular numbers for safe processing
  const safeOrderTotals = {
    subtotal: this.extractNumeric(params.order.subtotal),
    tax_total: this.extractNumeric(params.order.tax_total),
    shipping_subtotal: this.extractNumeric(params.order.shipping_subtotal || params.order.shipping_methods?.[0]?.subtotal || 0),
    shipping_tax_total: this.extractNumeric(params.order.shipping_tax_total || params.order.shipping_methods?.[0]?.tax_total || 0),
    shipping_total: this.extractNumeric(params.order.shipping_total || params.order.shipping_methods?.[0]?.total || 0),
    discount_total: this.extractNumeric(params.order.discount_total),
    total: this.extractNumeric(params.order.total)
  }

  console.log('🔧 SERVICE: Safe order totals:', safeOrderTotals)

  // Process items with BigNumber conversion
  const safeItems = params.items.map(item => ({
    ...item,
    quantity: this.extractNumeric(item.quantity),
    unit_price: this.extractNumeric(item.unit_price),
    total: this.extractNumeric(item.total) || (this.extractNumeric(item.unit_price) * this.extractNumeric(item.quantity)),
    discount_total: this.extractNumeric(item.discount_total || 0)
  }))

  // Calculate GST breakdown from tax_lines
  const gstBreakdown = this.calculateGSTBreakdown(params.order, safeItems)
  
  console.log('🧾 GST Breakdown:', gstBreakdown)

  // PRE-FORMAT ALL AMOUNTS TO AVOID ASYNC ISSUES IN PDF STRUCTURE
  const formattedTotals = {
    subtotal: await this.formatAmount(safeOrderTotals.subtotal, params.order.currency_code),
    tax_total: await this.formatAmount(safeOrderTotals.tax_total, params.order.currency_code),
    shipping_total: await this.formatAmount(safeOrderTotals.shipping_total, params.order.currency_code),
    discount_total: await this.formatAmount(safeOrderTotals.discount_total, params.order.currency_code),
    total: await this.formatAmount(safeOrderTotals.total, params.order.currency_code)
  }

  // PRE-FORMAT ITEM VALUES USING INDIVIDUAL ITEM DATA
  const formattedItems = await Promise.all(
    safeItems.map(async item => {
      // Find the original item to get individual values and HS code
      console.log(`🔍 Looking for original item with title: "${item.title}"`)
      console.log(`📋 Available items in order:`, params.order.items?.map(oi => oi.title))
      
      const originalItem = params.order.items?.find((oi: any) => oi.title === item.title)
      const hsCode = originalItem?.variant?.product?.hs_code || originalItem?.product?.hs_code || 'N/A'
      
      if (!originalItem) {
        console.warn(`⚠️ Original item not found for: ${item.title}, calculating from available data`)
      }
      
      // FIXED: Use the correct tax-exclusive unit price
      // For single items, ensure we get the actual unit price before tax
      let itemUnitPrice = this.extractNumeric(originalItem?.unit_price || item.unit_price)
      let itemTotal = this.extractNumeric(originalItem?.total || item.total)
      
      // If unit_price includes tax, we need to extract the tax-exclusive price
      // Check if unit_price * quantity equals total (meaning unit_price is tax-exclusive)
      const calculatedSubtotalFromUnitPrice = itemUnitPrice * this.extractNumeric(item.quantity)
      
      // If the calculated subtotal doesn't match what we expect, recalculate
      if (Math.abs(calculatedSubtotalFromUnitPrice - safeOrderTotals.subtotal) > 0.01 && safeItems.length === 1) {
        // For single product orders, use order subtotal divided by quantity
        itemUnitPrice = safeOrderTotals.subtotal / this.extractNumeric(item.quantity)
        console.log(`🔧 Recalculated unit price for single item: ${itemUnitPrice}`)
      }
      
      // Calculate tax total from the difference between total and unit_price * quantity
      const itemSubtotal = itemUnitPrice * this.extractNumeric(item.quantity)
      const calculatedItemTaxTotal = itemTotal - itemSubtotal
      const itemTaxTotal = this.extractNumeric(originalItem?.tax_total || calculatedItemTaxTotal)
      
      console.log(`📊 Tax calculation for ${item.title}:`, {
        unit_price: itemUnitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        total: itemTotal,
        calculated_tax: calculatedItemTaxTotal,
        final_tax_total: itemTaxTotal
      })
      
      // FIXED: Proper boolean conversion for isIntraState
      // Remove the problematic line that was causing issues
      const isIntraState = Boolean(gstBreakdown.isIntraState)
      
      // FIXED: Calculate individual tax components correctly
      // Ensure we actually calculate amounts, not just rates
      let itemCgstAmount = 0
      let itemSgstAmount = 0
      let itemIgstAmount = 0
      
      if (isIntraState) {
        // For intra-state: CGST + SGST = Total Tax (split equally)
        itemCgstAmount = itemTaxTotal / 2
        itemSgstAmount = itemTaxTotal / 2
        itemIgstAmount = 0
      } else {
        // For inter-state: IGST = Total Tax
        itemCgstAmount = 0
        itemSgstAmount = 0
        itemIgstAmount = itemTaxTotal
      }
      
      console.log(`💰 Final calculated amounts for ${item.title}:`, {
        unit_price: itemUnitPrice,
        total: itemTotal,
        tax_total: itemTaxTotal,
        isIntraState: isIntraState,
        cgst_amount: itemCgstAmount,
        sgst_amount: itemSgstAmount,
        igst_amount: itemIgstAmount
      })
      
      return {
        title: item.title || 'Unknown Item',
        hs_code: hsCode,
        sale_price: await this.formatAmount(itemUnitPrice, params.order.currency_code), // Tax-exclusive unit price
        quantity: item.quantity.toString(),
        cgst_rate: isIntraState ? `${gstBreakdown.cgst.rate.toFixed(2)}` : '0.00',
        cgst_amount: await this.formatAmount(itemCgstAmount, params.order.currency_code),
        sgst_rate: isIntraState ? `${gstBreakdown.sgst.rate.toFixed(2)}` : '0.00',
        sgst_amount: await this.formatAmount(itemSgstAmount, params.order.currency_code),
        igst_rate: !isIntraState ? `${gstBreakdown.igst.rate.toFixed(2)}` : '0.00',
        igst_amount: await this.formatAmount(itemIgstAmount, params.order.currency_code),
        net_amount: await this.formatAmount(itemTotal, params.order.currency_code) // Tax-inclusive total
      }
    })
  )

  // Add service charges as separate line items if they exist (excluding GiftWrap)
  const serviceCharges = []
  
  // Shipping Charges - only if shipping cost > 0
  if (safeOrderTotals.shipping_total > 0) {
    // Extract shipping subtotal and tax from order data
    const shippingSubtotal = this.extractNumeric(params.order.shipping_subtotal || params.order.shipping_methods?.[0]?.subtotal || safeOrderTotals.shipping_total)
    const shippingTaxTotal = this.extractNumeric(params.order.shipping_tax_total || params.order.shipping_methods?.[0]?.tax_total || 0)
    const shippingTotal = this.extractNumeric(params.order.shipping_total || params.order.shipping_methods?.[0]?.total || safeOrderTotals.shipping_total)
    
    console.log('🚚 Shipping calculation:', {
      subtotal: shippingSubtotal,
      tax_total: shippingTaxTotal,
      total: shippingTotal
    })
    
    // Calculate shipping tax components based on GST breakdown
    const isIntraState = Boolean(gstBreakdown.isIntraState)
    let shippingCgstAmount = 0
    let shippingSgstAmount = 0
    let shippingIgstAmount = 0
    
    if (shippingTaxTotal > 0) {
      if (isIntraState) {
        // For intra-state: CGST + SGST = Total Tax (split equally)
        shippingCgstAmount = shippingTaxTotal / 2
        shippingSgstAmount = shippingTaxTotal / 2
        shippingIgstAmount = 0
      } else {
        // For inter-state: IGST = Total Tax
        shippingCgstAmount = 0
        shippingSgstAmount = 0
        shippingIgstAmount = shippingTaxTotal
      }
    }
    
    serviceCharges.push({
      title: 'Shipping Charge',
      hs_code: '996819',
      sale_price: await this.formatAmount(shippingSubtotal, params.order.currency_code), // Tax-exclusive shipping amount
      quantity: '',
      cgst_rate: (shippingTaxTotal > 0 && isIntraState) ? `${gstBreakdown.cgst.rate.toFixed(2)}` : '0.00',
      cgst_amount: await this.formatAmount(shippingCgstAmount, params.order.currency_code),
      sgst_rate: (shippingTaxTotal > 0 && isIntraState) ? `${gstBreakdown.sgst.rate.toFixed(2)}` : '0.00',
      sgst_amount: await this.formatAmount(shippingSgstAmount, params.order.currency_code),
      igst_rate: (shippingTaxTotal > 0 && !isIntraState) ? `${gstBreakdown.igst.rate.toFixed(2)}` : '0.00',
      igst_amount: await this.formatAmount(shippingIgstAmount, params.order.currency_code),
      net_amount: await this.formatAmount(shippingTotal, params.order.currency_code) // Tax-inclusive total
    })
  }

  const invoiceId = `INV-${invoice.display_id.toString().padStart(6, '0')}`
  const invoiceDate = new Date(invoice.created_at).toLocaleDateString()

  // Create detailed items table body with proper GST column headers (removed DISC column)
  const itemsTableBody = [
    // First header row - main headers
    [
      { text: 'Product\nDescription', style: 'tableHeader', alignment: 'left', rowSpan: 2 },
      { text: 'SALE\nPRICE', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
      { text: 'QTY', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
      { text: 'CGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
      {},
      { text: 'SGST/UGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
      {},
      { text: 'IGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
      {},
      { text: 'NET\nAMT', style: 'tableHeader', alignment: 'center', rowSpan: 2 }
    ],
    // Second header row - sub headers
    [
      {}, // rowSpan from above
      {}, // rowSpan from above
      {}, // rowSpan from above
      { text: 'Rate', style: 'tableHeader', alignment: 'center' },
      { text: 'Amt', style: 'tableHeader', alignment: 'center' },
      { text: 'Rate', style: 'tableHeader', alignment: 'center' },
      { text: 'Amt', style: 'tableHeader', alignment: 'center' },
      { text: 'Rate', style: 'tableHeader', alignment: 'center' },
      { text: 'Amt', style: 'tableHeader', alignment: 'center' },
      {} // rowSpan from above
    ],
    // Product rows (removed discount column)
    ...formattedItems.map(item => [
      { 
        text: `${item.title}\nHSN# : ${item.hs_code}`, 
        style: 'tableRow', 
        alignment: 'left',
        margin: [3, 4, 3, 4] // Slightly more margin for product description
      },
      { text: item.sale_price, style: 'tableRow', alignment: 'center' },
      { text: item.quantity, style: 'tableRow', alignment: 'center' },
      { text: item.cgst_rate, style: 'tableRow', alignment: 'center' },
      { text: item.cgst_amount, style: 'tableRow', alignment: 'center' },
      { text: item.sgst_rate, style: 'tableRow', alignment: 'center' },
      { text: item.sgst_amount, style: 'tableRow', alignment: 'center' },
      { text: item.igst_rate, style: 'tableRow', alignment: 'center' },
      { text: item.igst_amount, style: 'tableRow', alignment: 'center' },
      { text: item.net_amount, style: 'tableRow', alignment: 'right', bold: true }
    ]),
    // Service charges rows (removed discount column)
    ...serviceCharges.map(charge => [
      { 
        text: `${charge.title}\nHSN# : ${charge.hs_code}`, 
        style: 'tableRow', 
        alignment: 'left',
        margin: [3, 4, 3, 4] // Consistent with products
      },
      { text: charge.sale_price, style: 'tableRow', alignment: 'center' },
      { text: charge.quantity, style: 'tableRow', alignment: 'center' },
      { text: charge.cgst_rate, style: 'tableRow', alignment: 'center' },
      { text: charge.cgst_amount, style: 'tableRow', alignment: 'center' },
      { text: charge.sgst_rate, style: 'tableRow', alignment: 'center' },
      { text: charge.sgst_amount, style: 'tableRow', alignment: 'center' },
      { text: charge.igst_rate, style: 'tableRow', alignment: 'center' },
      { text: charge.igst_amount, style: 'tableRow', alignment: 'center' },
      { text: charge.net_amount, style: 'tableRow', alignment: 'right' }
    ]),
    // Total row (removed discount column)
    [
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { text: '', style: 'tableRow', border: [false, true, false, false] },
      { 
        text: formattedTotals.total, 
        style: 'totalValue', 
        alignment: 'right', 
        bold: true,
        fontSize: 9, // Slightly larger than regular rows but still compact
        fillColor: '#f8f9fa',
        border: [true, true, true, true]
      }
    ]
  ]

  // Build the final PDF content structure
  const pdfStructure = {
    pageSize: 'A4',
    pageMargins: [25, 120, 25, 60], // Minimal margins for maximum table space
    header: {
      margin: [25, 30, 25, 20], // Match the page margins
      columns: [
        {
          width: '*',
          stack: [
            ...(config.company_logo ? [
              {
                image: await this.imageUrlToBase64(config.company_logo),
                width: 100,
                height: 50,
                fit: [100, 50],
                margin: [0, 0, 0, 10]
              }
            ] : []),
            {
              text: config.company_name || 'Your Company Name',
              style: 'companyName',
              margin: [0, 0, 0, 0]
            }
          ]
        },
        {
          width: 200,
          stack: [
            {
              text: 'INVOICE',
              style: 'invoiceTitle',
              alignment: 'right',
              margin: [0, 10, 0, 0]
            }
          ]
        }
      ]
    },
    content: [
      {
        margin: [0, 10, 0, 20],
        columns: [
          {
            width: '55%',
            stack: [
              {
                text: 'COMPANY DETAILS',
                style: 'sectionHeader',
                margin: [0, 0, 0, 12]
              },
              config.company_address && {
                text: config.company_address,
                style: 'companyAddress',
                margin: [0, 0, 0, 8]
              },
              config.company_phone && {
                text: `Phone: ${config.company_phone}`,
                style: 'companyContact',
                margin: [0, 0, 0, 5]
              },
              config.company_email && {
                text: `Email: ${config.company_email}`,
                style: 'companyContact',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            width: '45%',
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  { text: 'Invoice ID:', style: 'label' },
                  { text: invoiceId, style: 'value', alignment: 'right' }
                ],
                [
                  { text: 'Invoice Date:', style: 'label' },
                  { text: invoiceDate, style: 'value', alignment: 'right' }
                ],
                [
                  { text: 'Order ID:', style: 'label' },
                  { 
                    text: params.order.display_id.toString().padStart(6, '0'), 
                    style: 'value',
                    alignment: 'right'
                  }
                ],
                [
                  { text: 'Order Date:', style: 'label' },
                  { 
                    text: new Date(params.order.created_at).toLocaleDateString(), 
                    style: 'value',
                    alignment: 'right'
                  }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [20, 0, 0, 0]
          }
        ]
      },
      {
        text: '\n'
      },
      {
        margin: [0, 20, 0, 30],
        columns: [
          {
            width: '48%',
            stack: [
              {
                text: 'BILL TO',
                style: 'sectionHeader',
                margin: [0, 0, 0, 12]
              },
              {
                text: params.order.billing_address ? 
                  `${params.order.billing_address.first_name || ''} ${params.order.billing_address.last_name || ''}
${params.order.billing_address.address_1 || ''}${params.order.billing_address.address_2 ? `\n${params.order.billing_address.address_2}` : ''}
${params.order.billing_address.city || ''}, ${params.order.billing_address.province || ''} ${params.order.billing_address.postal_code || ''}
${params.order.billing_address.country_code?.toUpperCase() || ''}${params.order.billing_address.phone ? `\nPhone: ${params.order.billing_address.phone}` : ''}` : 
                  'No billing address provided',
                style: 'addressText',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            width: '4%',
            text: ''
          },
          {
            width: '48%',
            stack: [
              {
                text: 'SHIP TO',
                style: 'sectionHeader',
                margin: [0, 0, 0, 12]
              },
              {
                text: params.order.shipping_address ? 
                  `${params.order.shipping_address.first_name || ''} ${params.order.shipping_address.last_name || ''}
                  ${params.order.shipping_address.address_1 || ''}${params.order.shipping_address.address_2 ? `\n${params.order.shipping_address.address_2}` : ''}
                  ${params.order.shipping_address.city || ''}, ${params.order.shipping_address.province || ''} ${params.order.shipping_address.postal_code || ''}
                  ${params.order.shipping_address.country_code?.toUpperCase() || ''}${params.order.shipping_address.phone ? `\nPhone: ${params.order.shipping_address.phone}` : ''}` : 
                                    'No shipping address provided',
                style: 'addressText',
                margin: [0, 0, 0, 0]
              }
            ]
          }
        ]
      },
      // Updated Items Table with proper GST headers and NET AMT visible (removed DISC column)
      {
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 2, // Changed from 1 to 2 for the double header
          widths: [110, 50, 25, 30, 40, 30, 40, 30, 40, 75], // Reduced Product Description, optimized all columns
          body: itemsTableBody
        },
        layout: {
          fillColor: function (rowIndex: number, node: any, columnIndex: number) {
            return (rowIndex === 0 || rowIndex === 1) ? '#495057' : null
          },
          hLineWidth: function (i: number, node: any) {
            return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 1 : 0.5
          },
          vLineWidth: function (i: number, node: any) {
            return 0.5
          },
          hLineColor: function (i: number, node: any) {
            return '#cccccc'
          },
          vLineColor: function (i: number, node: any) {
            return '#cccccc'
          }
        }
      },
      {
        text: '\n\n'
      },
      ...(config.notes ? [
        {
          text: 'NOTES',
          style: 'sectionHeader',
          margin: [0, 30, 0, 10]
        },
        {
          text: config.notes,
          style: 'notesText',
          margin: [0, 0, 0, 30]
        }
      ] : []),
      {
        text: 'Thank you for your business!',
        style: 'thankYouText',
        alignment: 'center',
        margin: [0, 40, 0, 30]
      },
      // Registered Address Section
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 515, y2: 0, // Full width dashed line
            dash: { length: 3, space: 2 },
            lineWidth: 1,
            lineColor: '#666666'
          }
        ],
        margin: [0, 30, 0, 20]
      },
      {
        text: `Registered Address for ${config.company_name || 'Your Company Name'}`,
        style: 'registeredAddressHeader',
        alignment: 'center',
        margin: [0, 0, 0, 8]
      },
      {
        text: config.company_address || 'Your registered company address here',
        style: 'registeredAddressText',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: `For more information on your order or to return an item write to ${config.company_email || 'support@yourcompany.com'}`,
        style: 'contactInfoText',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          {
            width: '*',
            text: '• All disputes will be subjected to local jurisdiction only.',
            style: 'footerText',
            margin: [0, 0, 0, 0]
          },
          {
            width: 80,
            text: 'PAGE    1 / 1',
            style: 'pageText',
            alignment: 'right',
            margin: [0, 0, 0, 0]
          }
        ],
        margin: [0, 10, 0, 0]
      }
    ],
    styles: {
      companyName: {
        fontSize: 24,
        bold: true,
        color: '#1a365d'
      },
      companyAddress: {
        fontSize: 12,
        color: '#4a5568',
        lineHeight: 1.4
      },
      companyContact: {
        fontSize: 11,
        color: '#4a5568',
        lineHeight: 1.3
      },
      invoiceTitle: {
        fontSize: 28,
        bold: true,
        color: '#2c3e50'
      },
      label: {
        fontSize: 11,
        color: '#6c757d',
        bold: true
      },
      value: {
        fontSize: 11,
        bold: true,
        color: '#2c3e50'
      },
      sectionHeader: {
        fontSize: 13,
        bold: true,
        color: '#2c3e50',
        fillColor: '#f8f9fa',
        margin: [5, 8, 5, 8]
      },
      addressText: {
        fontSize: 11,
        color: '#495057',
        lineHeight: 1.4
      },
      tableHeader: {
        fontSize: 7, // Further reduced for better fit
        bold: true,
        color: '#ffffff',
        fillColor: '#495057',
        alignment: 'center',
        margin: [1, 3, 1, 3] // Tighter margins
      },
      tableRow: {
        fontSize: 7, // Matched with header for consistency
        color: '#495057',
        margin: [1, 2, 1, 2] // Tighter margins
      },
      totalValue: {
        fontSize: 10,
        bold: true,
        color: '#2c3e50'
      },
      notesText: {
        fontSize: 11,
        color: '#6c757d',
        italics: true,
        lineHeight: 1.5
      },
      thankYouText: {
        fontSize: 14,
        color: '#28a745',
        italics: true,
        bold: true
      },
      registeredAddressHeader: {
        fontSize: 12,
        bold: true,
        color: '#2c3e50'
      },
      registeredAddressText: {
        fontSize: 10,
        color: '#495057',
        lineHeight: 1.3
      },
      contactInfoText: {
        fontSize: 10,
        color: '#495057',
        lineHeight: 1.3
      },
      footerText: {
        fontSize: 9,
        color: '#6c757d'
      },
      pageText: {
        fontSize: 9,
        color: '#6c757d',
        bold: true
      }
    },
    defaultStyle: {
      font: 'Helvetica'
    }
  }

  console.log('✅ PDF structure created successfully with detailed tax breakdown')
  return pdfStructure
}

  private calculateGSTBreakdown(order: any, items: any[]) {
    console.log('🧮 Calculating GST breakdown for order:', order.id)
    
    // Extract total tax amounts from order with safety checks
    const totalTaxAmount = this.extractNumeric(order.tax_total) || 0
    const itemTaxAmount = this.extractNumeric(order.items?.[0]?.tax_total || 0) || 0
    const shippingTaxAmount = this.extractNumeric(order.shipping_tax_total || 0) || 0
    
    console.log('📊 Tax amounts:', { totalTaxAmount, itemTaxAmount, shippingTaxAmount })
    
    // Check if intra-state or inter-state based on addresses
    const isIntraState = this.checkIfIntraState(order.billing_address, order.shipping_address)
    console.log('🏠 Is intra-state:', isIntraState)
    
    // Get tax rate from first item's tax line with safety checks
    let taxRate = 5 // Default fallback
    if (order.items?.[0]?.tax_lines?.[0]) {
      const extractedRate = this.extractNumeric(order.items[0].tax_lines[0].rate || order.items[0].tax_lines[0].raw_rate?.value)
      taxRate = extractedRate || 5 // Use extracted rate or fallback to 5
    }
    
    console.log('📈 Tax rate found:', taxRate)
    
    // Initialize with safe values
    let cgstTotal = 0, sgstTotal = 0, igstTotal = 0, ugstTotal = 0
    let cgstRate = 0, sgstRate = 0, igstRate = 0, ugstRate = 0
    
    // Only calculate if we have valid tax amounts
    if (totalTaxAmount > 0 && !isNaN(totalTaxAmount)) {
      if (isIntraState) {
        // Intra-state: Split into CGST + SGST
        cgstRate = Number((taxRate / 2).toFixed(2))
        sgstRate = Number((taxRate / 2).toFixed(2))
        cgstTotal = Number((totalTaxAmount / 2).toFixed(2))
        sgstTotal = Number((totalTaxAmount / 2).toFixed(2))
      } else {
        // Inter-state: Use IGST
        igstRate = Number(taxRate.toFixed(2))
        igstTotal = Number(totalTaxAmount.toFixed(2))
      }
    }

    const breakdown = {
      cgst: { rate: cgstRate, amount: cgstTotal },
      sgst: { rate: sgstRate, amount: sgstTotal },
      igst: { rate: igstRate, amount: igstTotal },
      ugst: { rate: ugstRate, amount: ugstTotal },
      total: Number((cgstTotal + sgstTotal + igstTotal + ugstTotal).toFixed(2)),
      isIntraState,
      taxRate: Number(taxRate.toFixed(2))
    }
    
    // Validate all values are not NaN
    Object.keys(breakdown).forEach(key => {
      if (typeof breakdown[key] === 'object' && breakdown[key] !== null) {
        // Check nested objects like cgst, sgst, etc.
        Object.keys(breakdown[key]).forEach(subKey => {
          if (isNaN(breakdown[key][subKey])) {
            console.warn(`⚠️ NaN detected in ${key}.${subKey}, setting to 0`)
            breakdown[key][subKey] = 0
          }
        })
      } else if (typeof breakdown[key] === 'number' && isNaN(breakdown[key])) {
        console.warn(`⚠️ NaN detected in ${key}, setting to 0`)
        breakdown[key] = 0
      }
    })
    
    console.log('✅ Final GST breakdown:', breakdown)
    return breakdown
  }

  private checkIfIntraState(billingAddress: any, shippingAddress: any): boolean {
    // Check if billing and shipping are in same state
    const billingState = billingAddress?.province?.toLowerCase()
    const shippingState = shippingAddress?.province?.toLowerCase()
    
    const result = billingState === shippingState && billingState && shippingState
    console.log('🏠 State comparison:', { billingState, shippingState, result })
    return result
  }

  private async formatAmount(amount: number, currency: string): Promise<string> {
    console.log('🔍 formatAmount called with:', { amount, currency, type: typeof amount })
    
    // Ensure amount is a valid number
    if (isNaN(amount) || amount === null || amount === undefined) {
      console.warn('⚠️ Invalid amount received:', amount)
      return 'Rs.0.00'
    }
    
    try {
      // Use simple number formatting with Rs. prefix (no space to avoid font issues)
      const formattedNumber = Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      
      const result = `Rs.${formattedNumber}`
      console.log('✅ formatAmount success:', result)
      return result
    } catch (error) {
      console.error('❌ formatAmount error:', error)
      
      // Fallback to simple formatting
      const formattedAmount = Number(amount).toFixed(2)
      const fallbackResult = `Rs.${formattedAmount}`
      console.log('🔄 formatAmount fallback:', fallbackResult)
      return fallbackResult
    }
  }

  private async imageUrlToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const base64 = Buffer.from(response.data).toString('base64')
    const mimeType = response.headers['content-type'] || 'image/png'
    return `data:${mimeType};base64,${base64}`
  }
}

export default InvoiceGeneratorService
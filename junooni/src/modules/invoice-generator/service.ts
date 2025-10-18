// import { MedusaService } from "@medusajs/framework/utils"
// import { InvoiceConfig } from "./models/invoice-config";
// import { Invoice, InvoiceStatus } from "./models/invoice";
// import PdfPrinter from "pdfmake"
// import { InferTypeOf, OrderDTO, OrderLineItemDTO } from "@medusajs/framework/types"
// import axios from "axios"

// const fonts = {
//   Helvetica: {
//     normal: 'Helvetica',
//     bold: 'Helvetica-Bold',
//     italics: 'Helvetica-Oblique',
//     bolditalics: 'Helvetica-BoldOblique'
//   },
// }

// const printer = new PdfPrinter(fonts)

// // ✅ Extended type to include vendor information per item
// type GeneratePdfParams = {
//   order: OrderDTO
//   items: (OrderLineItemDTO & {
//     vendor_id?: string
//     vendor_name?: string
//     vendor_address?: any
//   })[]
//   bill_from_address?: any
//   ship_from_address?: any
// }

// class InvoiceGeneratorService extends MedusaService({
//   InvoiceConfig,
//   Invoice
// }) {
  
//   // Helper function to safely extract numeric values from BigNumber objects
//   private extractNumeric(value: any): number {
//     if (value && typeof value === 'object' && value.numeric_ !== undefined) {
//       const result = Number(value.numeric_)
//       return isNaN(result) ? 0 : result
//     }
//     const result = Number(value)
//     return isNaN(result) ? 0 : result
//   }

//   async updateInvoiceConfigData(data: {
//     id?: string
//     company_name?: string
//     company_address?: string
//     company_phone?: string
//     company_email?: string
//     company_logo?: string
//     notes?: string
//   }): Promise<InferTypeOf<typeof InvoiceConfig>> {
//     try {
//       const existingConfigs = await this.listInvoiceConfigs()

//       if (existingConfigs && existingConfigs.length > 0) {
//         const existingConfig = existingConfigs[0]

//         const updated = await this.updateInvoiceConfigs([
//           {
//             id: existingConfig.id,
//             company_name: data.company_name ?? existingConfig.company_name,
//             company_address: data.company_address ?? existingConfig.company_address,
//             company_phone: data.company_phone ?? existingConfig.company_phone,
//             company_email: data.company_email ?? existingConfig.company_email,
//             company_logo: data.company_logo ?? existingConfig.company_logo,
//             notes: data.notes ?? existingConfig.notes,
//           }
//         ])

//         return updated[0]
//       } else {
//         const newConfig = {
//           company_name: data.company_name || "",
//           company_address: data.company_address || "",
//           company_phone: data.company_phone || "",
//           company_email: data.company_email || "",
//           company_logo: data.company_logo || "",
//           notes: data.notes || "",
//         }

//         const [created] = await this.createInvoiceConfigs([newConfig])
//         return created
//       }
//     } catch (error) {
//       throw error
//     }
//   }

//   async generatePdf(params: GeneratePdfParams & {
//     invoice_id: string
//     forceRegenerate?: boolean
//   }): Promise<Buffer> {
//     const invoice = await this.retrieveInvoice(params.invoice_id)

//     console.log('🔄 REGENERATING PDF with latest order data...')
//     const pdfContent = await this.createInvoiceContent(params, invoice)

//     await this.updateInvoices({
//       id: invoice.id,
//       pdfContent
//     })

//     return new Promise((resolve, reject) => {
//       const chunks: Buffer[] = [];
//       const pdfDoc = printer.createPdfKitDocument(pdfContent as any)
      
//       pdfDoc.on('data', chunk => chunks.push(chunk));
//       pdfDoc.on('end', () => {
//         const result = Buffer.concat(chunks);
//         resolve(result);
//       });
//       pdfDoc.on('error', err => reject(err));
  
//       pdfDoc.end();
//     });
//   }

//   // ✅ NEW: Group items by vendor
//   // ✅ UPDATED: Group items by vendor AND fulfillment_type
//   private groupItemsByVendor(items: any[]): Map<string, any[]> {
//     const vendorGroups = new Map<string, any[]>()
    
//     items.forEach(item => {
//       // Create composite key combining vendor identifier with fulfillment_type
//       const vendorIdentifier = item.vendor_id || 'junooni'
//       const fulfillmentType = item.fulfillment_type || 'junooni'
      
//       // ✅ Group by BOTH vendor and fulfillment type
//       const vendorKey = `${vendorIdentifier}_${fulfillmentType}`
      
//       if (!vendorGroups.has(vendorKey)) {
//         vendorGroups.set(vendorKey, [])
//       }
      
//       vendorGroups.get(vendorKey)!.push(item)
//     })
    
//     console.log(`📦 Grouped items into ${vendorGroups.size} vendor group(s)`)
  
//   // Log each group
//   for (const [vendorKey, items] of vendorGroups.entries()) {
//     console.log(`   Group "${vendorKey}": ${items.length} item(s)`)
//     console.log(`      Fulfillment Type: ${items[0].fulfillment_type}`)
//     console.log(`      Bill From: ${items[0].bill_from?.company || 'Unknown'}`)
//     console.log(`      Ship From: ${items[0].ship_from?.company || 'Unknown'}`)
//   }
  
//   return vendorGroups
// }

//   private async createInvoiceContent(
//     params: GeneratePdfParams, 
//     invoice: InferTypeOf<typeof Invoice>
//   ): Promise<Record<string, any>> {
//     const invoiceConfigs = await this.listInvoiceConfigs()
//     const config = invoiceConfigs[0] || {}

//     // const defaultBillFromAddress = params.bill_from_address || {
//     //   company: 'Junooni',
//     //   address_1: 'C-30, Vasant Vihar',
//     //   address_2: 'Saharanpur',
//     //   city: 'Saharanpur',
//     //   province: 'Uttar Pradesh',
//     //   postal_code: '247001',
//     //   country_code: 'IN',
//     //   phone: '9090909090',
//     //   email: 'ddigicloud@gmail.com'
//     // }

//     // Convert BigNumber values
//     const safeOrderTotals = {
//       subtotal: this.extractNumeric(params.order.subtotal),
//       tax_total: this.extractNumeric(params.order.tax_total),
//       shipping_subtotal: this.extractNumeric(params.order.shipping_subtotal || params.order.shipping_methods?.[0]?.subtotal || 0),
//       shipping_tax_total: this.extractNumeric(params.order.shipping_tax_total || params.order.shipping_methods?.[0]?.tax_total || 0),
//       shipping_total: this.extractNumeric(params.order.shipping_total || params.order.shipping_methods?.[0]?.total || 0),
//       discount_total: this.extractNumeric(params.order.discount_total),
//       total: this.extractNumeric(params.order.total)
//     }

//     console.log('🔧 SERVICE: Safe order totals:', safeOrderTotals)

//     // Process items with BigNumber conversion
//     const safeItems = params.items.map(item => ({
//       ...item,
//       quantity: this.extractNumeric(item.quantity),
//       unit_price: this.extractNumeric(item.unit_price),
//       total: this.extractNumeric(item.total) || (this.extractNumeric(item.unit_price) * this.extractNumeric(item.quantity)),
//       tax_total: this.extractNumeric(item.tax_total || 0),
//       discount_total: this.extractNumeric(item.discount_total || 0)
//     }))

//     // ✅ NEW: Group items by vendor
//     const vendorGroups = this.groupItemsByVendor(safeItems)
//     const totalVendorPages = vendorGroups.size

//     const invoiceId = `INV-${invoice.display_id.toString().padStart(6, '0')}`
//     const invoiceDate = new Date(invoice.created_at).toLocaleDateString()

//     // ✅ NEW: Build content array with pages for each vendor
//     const allPagesContent: any[] = []
//     let currentPageNumber = 1

//     for (const [vendorKey, vendorItems] of vendorGroups.entries()) {
//       console.log(`\n📄 Creating page ${currentPageNumber}/${totalVendorPages} for vendor: ${vendorKey}`)
      
//       // Get vendor-specific addresses
//       const firstVendorItem = vendorItems[0]
//        const billFromAddress = firstVendorItem.bill_from
//     const shipFromAddress = firstVendorItem.ship_from

//       console.log('🏢 Using Bill From:', billFromAddress.company || billFromAddress.address_1)
//       console.log('📦 Using Ship From:', shipFromAddress.company || shipFromAddress.address_1)

//       // Calculate vendor-specific totals
//       const vendorSubtotal = vendorItems.reduce((sum, item) => 
//         sum + (item.total - item.tax_total), 0
//       )
//       const vendorTaxTotal = vendorItems.reduce((sum, item) => 
//         sum + item.tax_total, 0
//       )
//       const vendorTotal = vendorItems.reduce((sum, item) => 
//         sum + item.total, 0
//       )

//       // Calculate GST breakdown for this vendor's items
//       const gstBreakdown = this.calculateGSTBreakdown(params.order, vendorItems)
      
//       console.log('🧾 GST Breakdown for vendor:', gstBreakdown)

//       // Format vendor-specific amounts
//       const formattedVendorTotals = {
//         subtotal: await this.formatAmount(vendorSubtotal, params.order.currency_code),
//         tax_total: await this.formatAmount(vendorTaxTotal, params.order.currency_code),
//         total: await this.formatAmount(vendorTotal, params.order.currency_code)
//       }

//       // Format vendor's items
//       const formattedItems = await Promise.all(
//         vendorItems.map(async item => {
//           console.log(`\n🔍 Processing item: "${item.title}"`)
          
//           const hsCode = item.hs_code || 'N/A'
//           const quantity = this.extractNumeric(item.quantity)
//           const taxInclusiveUnitPrice = this.extractNumeric(item.unit_price)
//           const taxInclusiveTotal = this.extractNumeric(item.total)
//           const itemTaxTotal = this.extractNumeric(item.tax_total || 0)
          
//           const taxExclusiveTotal = taxInclusiveTotal - itemTaxTotal
//           const taxExclusiveUnitPrice = taxExclusiveTotal / quantity
          
//           const isIntraState = Boolean(gstBreakdown.isIntraState)
//           let itemCgstAmount = 0
//           let itemSgstAmount = 0
//           let itemIgstAmount = 0
          
//           if (itemTaxTotal > 0) {
//             if (isIntraState) {
//               itemCgstAmount = itemTaxTotal / 2
//               itemSgstAmount = itemTaxTotal / 2
//             } else {
//               itemIgstAmount = itemTaxTotal
//             }
//           }
          
//           return {
//             title: item.title || 'Unknown Item',
//             hs_code: hsCode,
//             sale_price: await this.formatAmount(taxExclusiveUnitPrice, params.order.currency_code),
//             quantity: quantity.toString(),
//             cgst_rate: isIntraState ? `${gstBreakdown.cgst.rate.toFixed(2)}` : '0.00',
//             cgst_amount: await this.formatAmount(itemCgstAmount, params.order.currency_code),
//             sgst_rate: isIntraState ? `${gstBreakdown.sgst.rate.toFixed(2)}` : '0.00',
//             sgst_amount: await this.formatAmount(itemSgstAmount, params.order.currency_code),
//             igst_rate: !isIntraState ? `${gstBreakdown.igst.rate.toFixed(2)}` : '0.00',
//             igst_amount: await this.formatAmount(itemIgstAmount, params.order.currency_code),
//             net_amount: await this.formatAmount(taxInclusiveTotal, params.order.currency_code)
//           }
//         })
//       )

//       // Build items table for this vendor
//       const itemsTableBody = [
//         [
//           { text: 'Product\nDescription', style: 'tableHeader', alignment: 'left', rowSpan: 2 },
//           { text: 'SALE\nPRICE', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
//           { text: 'QTY', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
//           { text: 'CGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
//           {},
//           { text: 'SGST/UGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
//           {},
//           { text: 'IGST', style: 'tableHeader', alignment: 'center', colSpan: 2 },
//           {},
//           { text: 'NET\nAMT', style: 'tableHeader', alignment: 'center', rowSpan: 2 }
//         ],
//         [
//           {}, {}, {},
//           { text: 'Rate', style: 'tableHeader', alignment: 'center' },
//           { text: 'Amt', style: 'tableHeader', alignment: 'center' },
//           { text: 'Rate', style: 'tableHeader', alignment: 'center' },
//           { text: 'Amt', style: 'tableHeader', alignment: 'center' },
//           { text: 'Rate', style: 'tableHeader', alignment: 'center' },
//           { text: 'Amt', style: 'tableHeader', alignment: 'center' },
//           {}
//         ],
//         ...formattedItems.map(item => [
//           { 
//             text: `${item.title}\nHSN# : ${item.hs_code}`, 
//             style: 'tableRow', 
//             alignment: 'left',
//             margin: [3, 4, 3, 4]
//           },
//           { text: item.sale_price, style: 'tableRow', alignment: 'center' },
//           { text: item.quantity, style: 'tableRow', alignment: 'center' },
//           { text: item.cgst_rate, style: 'tableRow', alignment: 'center' },
//           { text: item.cgst_amount, style: 'tableRow', alignment: 'center' },
//           { text: item.sgst_rate, style: 'tableRow', alignment: 'center' },
//           { text: item.sgst_amount, style: 'tableRow', alignment: 'center' },
//           { text: item.igst_rate, style: 'tableRow', alignment: 'center' },
//           { text: item.igst_amount, style: 'tableRow', alignment: 'center' },
//           { text: item.net_amount, style: 'tableRow', alignment: 'right', bold: true }
//         ]),
//         [
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { text: '', style: 'tableRow', border: [false, true, false, false] },
//           { 
//             text: formattedVendorTotals.total, 
//             style: 'totalValue', 
//             alignment: 'right', 
//             bold: true,
//             fontSize: 9,
//             fillColor: '#f8f9fa',
//             border: [true, true, true, true]
//           }
//         ]
//       ]

//       const formatAddress = (addr: any): string => {
//         if (!addr) return 'No address provided'
        
//         const parts = []
//         if (addr.company) parts.push(addr.company)
//         if (addr.address_1) parts.push(addr.address_1)
//         if (addr.address_2) parts.push(addr.address_2)
        
//         const cityLine = [addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')
//         if (cityLine) parts.push(cityLine)
        
//         if (addr.country_code) parts.push(addr.country_code.toUpperCase())
//         if (addr.phone) parts.push(`Phone: ${addr.phone}`)
//         if (addr.email) parts.push(`Email: ${addr.email}`)
        
//         return parts.join('\n')
//       }

//       // ✅ Build vendor page content
//       const vendorPageContent = [
//         {
//           margin: [0, 5, 0, 10],
//           columns: [
//             {
//               width: '23%',
//               stack: [
//                 {
//                   text: 'BILL FROM',
//                   style: 'sectionHeader',
//                   margin: [0, 0, 0, 8]
//                 },
//                 {
//                   text: formatAddress(billFromAddress),
//                   style: 'addressText',
//                   margin: [0, 0, 0, 0]
//                 }
//               ]
//             },
//             {
//               width: '2%',
//               text: ''
//             },
//             {
//               width: '23%',
//               stack: [
//                 {
//                   text: 'SHIP FROM',
//                   style: 'sectionHeader',
//                   margin: [0, 0, 0, 8]
//                 },
//                 {
//                   text: formatAddress(shipFromAddress),
//                   style: 'addressText',
//                   margin: [0, 0, 0, 0]
//                 }
//               ]
//             },
//             {
//               width: '18%',
//               text: ''
//             },
//             {
//               width: '34%',
//               table: {
//                 widths: [60, '*'],
//                 body: [
//                   [
//                     { text: 'Invoice ID:', style: 'label' },
//                     { text: invoiceId, style: 'value', alignment: 'right' }
//                   ],
//                   [
//                     { text: 'Invoice Date:', style: 'label' },
//                     { text: invoiceDate, style: 'value', alignment: 'right' }
//                   ],
//                   [
//                     { text: 'Order ID:', style: 'label' },
//                     { 
//                       text: params.order.display_id.toString().padStart(6, '0'), 
//                       style: 'value',
//                       alignment: 'right'
//                     }
//                   ],
//                   [
//                     { text: 'Order Date:', style: 'label' },
//                     { 
//                       text: new Date(params.order.created_at).toLocaleDateString(), 
//                       style: 'value',
//                       alignment: 'right'
//                     }
//                   ]
//                 ]
//               },
//               layout: {
//                 hLineWidth: () => 0,
//                 vLineWidth: () => 0,
//                 paddingTop: () => 0,
//                 paddingBottom: () => 0,
//                 paddingLeft: () => 2,
//                 paddingRight: () => 2
//               },
//               margin: [0, 0, 0, 0]
//             }
//           ]
//         },
//         {
//           margin: [0, 10, 0, 15],
//           columns: [
//             {
//               width: '23%',
//               stack: [
//                 {
//                   text: 'BILL TO',
//                   style: 'sectionHeader',
//                   margin: [0, 0, 0, 8]
//                 },
//                 {
//                   text: params.order.billing_address ? 
//                     `${params.order.billing_address.first_name || ''} ${params.order.billing_address.last_name || ''}
// ${params.order.billing_address.address_1 || ''}${params.order.billing_address.address_2 ? `\n${params.order.billing_address.address_2}` : ''}
// ${params.order.billing_address.city || ''}, ${params.order.billing_address.province || ''} ${params.order.billing_address.postal_code || ''}
// ${params.order.billing_address.country_code?.toUpperCase() || ''}${params.order.billing_address.phone ? `\nPhone: ${params.order.billing_address.phone}` : ''}` : 
//                     'No billing address provided',
//                   style: 'addressText',
//                   margin: [0, 0, 0, 0]
//                 }
//               ]
//             },
//             {
//               width: '2%',
//               text: ''
//             },
//             {
//               width: '23%',
//               stack: [
//                 {
//                   text: 'SHIP TO',
//                   style: 'sectionHeader',
//                   margin: [0, 0, 0, 8]
//                 },
//                 {
//                   text: params.order.shipping_address ? 
//                     `${params.order.shipping_address.first_name || ''} ${params.order.shipping_address.last_name || ''}
// ${params.order.shipping_address.address_1 || ''}${params.order.shipping_address.address_2 ? `\n${params.order.shipping_address.address_2}` : ''}
// ${params.order.shipping_address.city || ''}, ${params.order.shipping_address.province || ''} ${params.order.shipping_address.postal_code || ''}
// ${params.order.shipping_address.country_code?.toUpperCase() || ''}${params.order.shipping_address.phone ? `\nPhone: ${params.order.shipping_address.phone}` : ''}` : 
//                     'No shipping address provided',
//                   style: 'addressText',
//                   margin: [0, 0, 0, 0]
//                 }
//               ]
//             },
//             {
//               width: '52%',
//               text: ''
//             }
//           ]
//         },
//         {
//           margin: [0, 15, 0, 0],
//           table: {
//             headerRows: 2,
//             widths: [110, 50, 25, 30, 40, 30, 40, 30, 40, 75],
//             body: itemsTableBody
//           },
//           layout: {
//             fillColor: function (rowIndex: number, node: any, columnIndex: number) {
//               return (rowIndex === 0 || rowIndex === 1) ? '#495057' : null
//             },
//             hLineWidth: function (i: number, node: any) {
//               return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 1 : 0.5
//             },
//             vLineWidth: function (i: number, node: any) {
//               return 0.5
//             },
//             hLineColor: function (i: number, node: any) {
//               return '#cccccc'
//             },
//             vLineColor: function (i: number, node: any) {
//               return '#cccccc'
//             }
//           }
//         },
//         ...(config.notes ? [
//           {
//             text: 'NOTES',
//             style: 'sectionHeader',
//             margin: [0, 15, 0, 8]
//           },
//           {
//             text: config.notes,
//             style: 'notesText',
//             margin: [0, 0, 0, 15]
//           }
//         ] : []),
//         {
//           text: 'Thank you for your business!',
//           style: 'thankYouText',
//           alignment: 'center',
//           margin: [0, 20, 0, 15]
//         },
//         {
//           canvas: [
//             {
//               type: 'line',
//               x1: 0, y1: 0,
//               x2: 515, y2: 0,
//               dash: { length: 3, space: 2 },
//               lineWidth: 1,
//               lineColor: '#666666'
//             }
//           ],
//           margin: [0, 15, 0, 10]
//         },
//         {
//           text: `Registered Address for ${billFromAddress.company || 'Your Company Name'}`,
//           style: 'registeredAddressHeader',
//           alignment: 'center',
//           margin: [0, 0, 0, 6]
//         },
//         {
//           text: formatAddress(billFromAddress),
//           style: 'registeredAddressText',
//           alignment: 'center',
//           margin: [0, 0, 0, 10]
//         },
//         {
//           text: `For more information on your order or to return an item write to ${billFromAddress.email || 'support@yourcompany.com'}`,
//           style: 'contactInfoText',
//           alignment: 'center',
//           margin: [0, 0, 0, 10]
//         },
//         {
//           columns: [
//             {
//               width: '*',
//               text: '• All disputes will be subjected to local jurisdiction only.',
//               style: 'footerText',
//               margin: [0, 0, 0, 0]
//             },
//             {
//               width: 100,
//               text: `PAGE    ${currentPageNumber} / ${totalVendorPages}`,
//               style: 'pageText',
//               alignment: 'right',
//               margin: [0, 0, 0, 0]
//             }
//           ],
//           margin: [0, 5, 0, 0]
//         }
//       ]

//       // Add page break between vendors (except for last vendor)
//       if (currentPageNumber < totalVendorPages) {
//         vendorPageContent.push({
//           text: '',
//           pageBreak: 'after'
//         })
//       }

//       allPagesContent.push(...vendorPageContent)
//       currentPageNumber++
//     }

//     // ✅ Final PDF structure with all vendor pages
//     const pdfStructure = {
//       pageSize: 'A4',
//       pageMargins: [25, 100, 25, 40],
//       header: {
//         margin: [25, 20, 25, 15],
//         columns: [
//           {
//             width: '*',
//             stack: [
//               ...(config.company_logo ? [
//                 {
//                   image: await this.imageUrlToBase64(config.company_logo),
//                   width: 100,
//                   height: 50,
//                   fit: [100, 50],
//                   margin: [0, 0, 0, 8]
//                 }
//               ] : []),
//               {
//                 text: 'JUNOONI',
//                 style: 'companyName',
//                 margin: [0, 0, 0, 0]
//               }
//             ]
//           },
//           {
//             width: 200,
//             stack: [
//               {
//                 text: 'INVOICE',
//                 style: 'invoiceTitle',
//                 alignment: 'right',
//                 margin: [0, 10, 0, 0]
//               }
//             ]
//           }
//         ]
//       },
//       content: allPagesContent,
//       styles: {
//         companyName: {
//           fontSize: 24,
//           bold: true,
//           color: '#1a365d'
//         },
//         addressText: {
//           fontSize: 9,
//           color: '#495057',
//           lineHeight: 1.3
//         },
//         invoiceTitle: {
//           fontSize: 28,
//           bold: true,
//           color: '#2c3e50'
//         },
//         label: {
//           fontSize: 10,
//           color: '#6c757d',
//           bold: true
//         },
//         value: {
//           fontSize: 10,
//           bold: true,
//           color: '#2c3e50'
//         },
//         sectionHeader: {
//           fontSize: 10,
//           bold: true,
//           color: '#2c3e50',
//           fillColor: '#f8f9fa',
//           margin: [5, 6, 5, 6]
//         },
//         tableHeader: {
//           fontSize: 7,
//           bold: true,
//           color: '#ffffff',
//           fillColor: '#495057',
//           alignment: 'center',
//           margin: [1, 3, 1, 3]
//         },
//         tableRow: {
//           fontSize: 7,
//           color: '#495057',
//           margin: [1, 2, 1, 2]
//         },
//         totalValue: {
//           fontSize: 10,
//           bold: true,
//           color: '#2c3e50'
//         },
//         notesText: {
//           fontSize: 10,
//           color: '#6c757d',
//           italics: true,
//           lineHeight: 1.4
//         },
//         thankYouText: {
//           fontSize: 13,
//           color: '#28a745',
//           italics: true,
//           bold: true
//         },
//         registeredAddressHeader: {
//           fontSize: 11,
//           bold: true,
//           color: '#2c3e50'
//         },
//         registeredAddressText: {
//           fontSize: 9,
//           color: '#495057',
//           lineHeight: 1.2
//         },
//         contactInfoText: {
//           fontSize: 9,
//           color: '#495057',
//           lineHeight: 1.2
//         },
//         footerText: {
//           fontSize: 8,
//           color: '#6c757d'
//         },
//         pageText: {
//           fontSize: 8,
//           color: '#6c757d',
//           bold: true
//         }
//       },
//       defaultStyle: {
//         font: 'Helvetica'
//       }
//     }

//     console.log(`✅ PDF structure created successfully with ${totalVendorPages} vendor page(s)`)
//     return pdfStructure
//   }

//   private calculateGSTBreakdown(order: any, items: any[]) {
//     console.log('🧮 Calculating GST breakdown for items')
    
//     const totalTaxAmount = items.reduce((sum, item) => sum + this.extractNumeric(item.tax_total || 0), 0)
    
//     const isIntraState = this.checkIfIntraState(order.billing_address, order.shipping_address)
//     console.log('🏠 Is intra-state:', isIntraState)
    
//     let taxRate = 5
//     if (order.items?.[0]?.tax_lines?.[0]) {
//       const extractedRate = this.extractNumeric(order.items[0].tax_lines[0].rate || order.items[0].tax_lines[0].raw_rate?.value)
//       taxRate = extractedRate || 5
//     }
    
//     console.log('📈 Tax rate found:', taxRate)
    
//     let cgstTotal = 0, sgstTotal = 0, igstTotal = 0, ugstTotal = 0
//     let cgstRate = 0, sgstRate = 0, igstRate = 0, ugstRate = 0
    
//     if (totalTaxAmount > 0 && !isNaN(totalTaxAmount)) {
//       if (isIntraState) {
//         cgstRate = Number((taxRate / 2).toFixed(2))
//         sgstRate = Number((taxRate / 2).toFixed(2))
//         cgstTotal = Number((totalTaxAmount / 2).toFixed(2))
//         sgstTotal = Number((totalTaxAmount / 2).toFixed(2))
//       } else {
//         igstRate = Number(taxRate.toFixed(2))
//         igstTotal = Number(totalTaxAmount.toFixed(2))
//       }
//     }

//     const breakdown = {
//       cgst: { rate: cgstRate, amount: cgstTotal },
//       sgst: { rate: sgstRate, amount: sgstTotal },
//       igst: { rate: igstRate, amount: igstTotal },
//       ugst: { rate: ugstRate, amount: ugstTotal },
//       total: Number((cgstTotal + sgstTotal + igstTotal + ugstTotal).toFixed(2)),
//       isIntraState,
//       taxRate: Number(taxRate.toFixed(2))
//     }
    
//     Object.keys(breakdown).forEach(key => {
//       if (typeof breakdown[key] === 'object' && breakdown[key] !== null) {
//         Object.keys(breakdown[key]).forEach(subKey => {
//           if (isNaN(breakdown[key][subKey])) {
//             console.warn(`⚠️ NaN detected in ${key}.${subKey}, setting to 0`)
//             breakdown[key][subKey] = 0
//           }
//         })
//       } else if (typeof breakdown[key] === 'number' && isNaN(breakdown[key])) {
//         console.warn(`⚠️ NaN detected in ${key}, setting to 0`)
//         breakdown[key] = 0
//       }
//     })
    
//     console.log('✅ Final GST breakdown:', breakdown)
//     return breakdown
//   }

//   private checkIfIntraState(billingAddress: any, shippingAddress: any): boolean {
//     const billingState = billingAddress?.province?.toLowerCase()
//     const shippingState = shippingAddress?.province?.toLowerCase()
    
//     const result = billingState === shippingState && billingState && shippingState
//     console.log('🏠 State comparison:', { billingState, shippingState, result })
//     return result
//   }

//   private async formatAmount(amount: number, currency: string): Promise<string> {
//     if (isNaN(amount) || amount === null || amount === undefined) {
//       console.warn('⚠️ Invalid amount received:', amount)
//       return 'Rs.0.00'
//     }
    
//     try {
//       const formattedNumber = Number(amount).toLocaleString('en-IN', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//       })
      
//       return `Rs.${formattedNumber}`
//     } catch (error) {
//       console.error('❌ formatAmount error:', error)
//       return `Rs.${Number(amount).toFixed(2)}`
//     }
//   }

//   private async imageUrlToBase64(url: string): Promise<string> {
//     const response = await axios.get(url, { responseType: 'arraybuffer' })
//     const base64 = Buffer.from(response.data).toString('base64')
//     const mimeType = response.headers['content-type'] || 'image/png'
//     return `data:${mimeType};base64,${base64}`
//   }
// }

// export default InvoiceGeneratorService

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

// ✅ Extended type to include vendor information per item
type GeneratePdfParams = {
  order: OrderDTO
  items: (OrderLineItemDTO & {
    vendor_id?: string
    vendor_name?: string
    vendor_address?: any
  })[]
  bill_from_address?: any
  ship_from_address?: any
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

    console.log('🔄 REGENERATING PDF with latest order data...')
    const pdfContent = await this.createInvoiceContent(params, invoice)

    await this.updateInvoices({
      id: invoice.id,
      pdfContent
    })

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pdfDoc = printer.createPdfKitDocument(pdfContent as any)
      
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on('error', err => reject(err));
  
      pdfDoc.end();
    });
  }

  // ✅ NEW: Group items by vendor
  // ✅ UPDATED: Group items by vendor AND fulfillment_type
  private groupItemsByVendor(items: any[]): Map<string, any[]> {
    const vendorGroups = new Map<string, any[]>()
    
    items.forEach(item => {
      // Create composite key combining vendor identifier with fulfillment_type
      const vendorIdentifier = item.vendor_id || 'junooni'
      const fulfillmentType = item.fulfillment_type || 'junooni'
      
      // ✅ Group by BOTH vendor and fulfillment type
      const vendorKey = `${vendorIdentifier}_${fulfillmentType}`
      
      if (!vendorGroups.has(vendorKey)) {
        vendorGroups.set(vendorKey, [])
      }
      
      vendorGroups.get(vendorKey)!.push(item)
    })
    
    console.log(`📦 Grouped items into ${vendorGroups.size} vendor group(s)`)
  
  // Log each group
  for (const [vendorKey, items] of vendorGroups.entries()) {
    console.log(`   Group "${vendorKey}": ${items.length} item(s)`)
    console.log(`      Fulfillment Type: ${items[0].fulfillment_type}`)
    console.log(`      Bill From: ${items[0].bill_from?.company || 'Unknown'}`)
    console.log(`      Ship From: ${items[0].ship_from?.company || 'Unknown'}`)
  }
  
  return vendorGroups
}

  private async createInvoiceContent(
    params: GeneratePdfParams, 
    invoice: InferTypeOf<typeof Invoice>
  ): Promise<Record<string, any>> {
    const invoiceConfigs = await this.listInvoiceConfigs()
    const config = invoiceConfigs[0] || {}

    // const defaultBillFromAddress = params.bill_from_address || {
    //   company: 'Junooni',
    //   address_1: 'C-30, Vasant Vihar',
    //   address_2: 'Saharanpur',
    //   city: 'Saharanpur',
    //   province: 'Uttar Pradesh',
    //   postal_code: '247001',
    //   country_code: 'IN',
    //   phone: '9090909090',
    //   email: 'ddigicloud@gmail.com'
    // }

    // Convert BigNumber values
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
      tax_total: this.extractNumeric(item.tax_total || 0),
      discount_total: this.extractNumeric(item.discount_total || 0)
    }))

    // ✅ NEW: Group items by vendor
    const vendorGroups = this.groupItemsByVendor(safeItems)
    const totalVendorPages = vendorGroups.size

    const invoiceId = `INV-${invoice.display_id.toString().padStart(6, '0')}`
    const invoiceDate = new Date(invoice.created_at).toLocaleDateString()

    // Get company name from first vendor for header
    const firstVendorItems = Array.from(vendorGroups.values())[0]
    const headerCompanyName = firstVendorItems?.[0]?.bill_from?.company?.toUpperCase() || 'JUNOONI'

    // ✅ NEW: Build content array with pages for each vendor
    const allPagesContent: any[] = []
    let currentPageNumber = 1

    for (const [vendorKey, vendorItems] of vendorGroups.entries()) {
      console.log(`\n📄 Creating page ${currentPageNumber}/${totalVendorPages} for vendor: ${vendorKey}`)
      
      // Get vendor-specific addresses
      const firstVendorItem = vendorItems[0]
       const billFromAddress = firstVendorItem.bill_from
    const shipFromAddress = firstVendorItem.ship_from

      console.log('🏢 Using Bill From:', billFromAddress.company || billFromAddress.address_1)
      console.log('📦 Using Ship From:', shipFromAddress.company || shipFromAddress.address_1)

      // Calculate vendor-specific totals
      const vendorSubtotal = vendorItems.reduce((sum, item) => 
        sum + (item.total - item.tax_total), 0
      )
      const vendorTaxTotal = vendorItems.reduce((sum, item) => 
        sum + item.tax_total, 0
      )
      const vendorTotal = vendorItems.reduce((sum, item) => 
        sum + item.total, 0
      )

      // Calculate GST breakdown for this vendor's items
      const gstBreakdown = this.calculateGSTBreakdown(params.order, vendorItems)
      
      console.log('🧾 GST Breakdown for vendor:', gstBreakdown)

      // Format vendor-specific amounts
      const formattedVendorTotals = {
        subtotal: await this.formatAmount(vendorSubtotal, params.order.currency_code),
        tax_total: await this.formatAmount(vendorTaxTotal, params.order.currency_code),
        total: await this.formatAmount(vendorTotal, params.order.currency_code)
      }

      // Format vendor's items
      const formattedItems = await Promise.all(
        vendorItems.map(async item => {
          console.log(`\n🔍 Processing item: "${item.title}"`)
          
          const hsCode = item.hs_code || 'N/A'
          const quantity = this.extractNumeric(item.quantity)
          const taxInclusiveUnitPrice = this.extractNumeric(item.unit_price)
          const taxInclusiveTotal = this.extractNumeric(item.total)
          const itemTaxTotal = this.extractNumeric(item.tax_total || 0)
          
          const taxExclusiveTotal = taxInclusiveTotal - itemTaxTotal
          const taxExclusiveUnitPrice = taxExclusiveTotal / quantity
          
          const isIntraState = Boolean(gstBreakdown.isIntraState)
          let itemCgstAmount = 0
          let itemSgstAmount = 0
          let itemIgstAmount = 0
          
          if (itemTaxTotal > 0) {
            if (isIntraState) {
              itemCgstAmount = itemTaxTotal / 2
              itemSgstAmount = itemTaxTotal / 2
            } else {
              itemIgstAmount = itemTaxTotal
            }
          }
          
          return {
            title: item.title || 'Unknown Item',
            hs_code: hsCode,
            sale_price: await this.formatAmount(taxExclusiveUnitPrice, params.order.currency_code),
            quantity: quantity.toString(),
            cgst_rate: isIntraState ? `${gstBreakdown.cgst.rate.toFixed(2)}` : '0.00',
            cgst_amount: await this.formatAmount(itemCgstAmount, params.order.currency_code),
            sgst_rate: isIntraState ? `${gstBreakdown.sgst.rate.toFixed(2)}` : '0.00',
            sgst_amount: await this.formatAmount(itemSgstAmount, params.order.currency_code),
            igst_rate: !isIntraState ? `${gstBreakdown.igst.rate.toFixed(2)}` : '0.00',
            igst_amount: await this.formatAmount(itemIgstAmount, params.order.currency_code),
            net_amount: await this.formatAmount(taxInclusiveTotal, params.order.currency_code)
          }
        })
      )

      // Build items table for this vendor
      const itemsTableBody = [
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
        [
          {}, {}, {},
          { text: 'Rate', style: 'tableHeader', alignment: 'center' },
          { text: 'Amt', style: 'tableHeader', alignment: 'center' },
          { text: 'Rate', style: 'tableHeader', alignment: 'center' },
          { text: 'Amt', style: 'tableHeader', alignment: 'center' },
          { text: 'Rate', style: 'tableHeader', alignment: 'center' },
          { text: 'Amt', style: 'tableHeader', alignment: 'center' },
          {}
        ],
        ...formattedItems.map(item => [
          { 
            text: `${item.title}\nHSN# : ${item.hs_code}`, 
            style: 'tableRow', 
            alignment: 'left',
            margin: [3, 4, 3, 4]
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
            text: formattedVendorTotals.total, 
            style: 'totalValue', 
            alignment: 'right', 
            bold: true,
            fontSize: 9,
            fillColor: '#f8f9fa',
            border: [true, true, true, true]
          }
        ]
      ]

      const formatAddress = (addr: any): string => {
        if (!addr) return 'No address provided'
        
        const parts = []
        if (addr.company) parts.push(addr.company)
        if (addr.address_1) parts.push(addr.address_1)
        if (addr.address_2) parts.push(addr.address_2)
        
        const cityLine = [addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')
        if (cityLine) parts.push(cityLine)
        
        if (addr.country_code) parts.push(addr.country_code.toUpperCase())
        if (addr.phone) parts.push(`Phone: ${addr.phone}`)
        if (addr.email) parts.push(`Email: ${addr.email}`)
        
        return parts.join('\n')
      }

      // ✅ Build vendor page content with professional Myntra-style layout
      const vendorPageContent = [
        // Invoice details section in two columns
        {
          margin: [0, 0, 0, 15],
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Invoice Number: ${invoiceId}`, style: 'invoiceDetailLeft', margin: [0, 0, 0, 4] },
                { text: `Order Number: #${params.order.display_id}`, style: 'invoiceDetailLeft', margin: [0, 0, 0, 4] },
                { text: `Nature of Transaction: ${gstBreakdown.isIntraState ? 'Intra-State' : 'Inter-State'}`, style: 'invoiceDetailLeft', margin: [0, 0, 0, 4] },
                { text: `Place of Supply: ${billFromAddress.province?.toUpperCase() || 'N/A'}`, style: 'invoiceDetailLeft', margin: [0, 0, 0, 0] }
              ]
            },
            {
              width: '50%',
              stack: [
                // { text: `PacketID: ${params.order.display_id.toString().padStart(6, '0')}`, style: 'invoiceDetailRight', margin: [0, 0, 0, 4] },
                { text: `Invoice Date: ${invoiceDate}`, style: 'invoiceDetailRight', margin: [0, 0, 0, 4] },
                { text: `Order Date: ${new Date(params.order.created_at).toLocaleDateString()}`, style: 'invoiceDetailRight', margin: [0, 0, 0, 4] },
                { text: `Nature of Supply: Goods`, style: 'invoiceDetailRight', margin: [0, 0, 0, 0] }
              ]
            }
          ]
        },
        // Horizontal line separator
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 545, y2: 0,
              lineWidth: 1,
              lineColor: '#000000'
            }
          ],
          margin: [0, 0, 0, 15]
        },
        // Bill From / Ship From section (TOP ROW)
        {
          margin: [0, 0, 0, 15],
          columns: [
            {
              width: '48%',
              stack: [
                {
                  text: 'Bill From:',
                  style: 'sectionHeader',
                  bold: true,
                  margin: [0, 0, 0, 6]
                },
                {
                  text: formatAddress(billFromAddress),
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
                  text: 'Ship From:',
                  style: 'sectionHeader',
                  bold: true,
                  margin: [0, 0, 0, 6]
                },
                {
                  text: formatAddress(shipFromAddress),
                  style: 'addressText',
                  margin: [0, 0, 0, 0]
                }
              ]
            }
          ]
        },
        // Bill To / Ship To section (BOTTOM ROW)
        {
          margin: [0, 0, 0, 15],
          columns: [
            {
              width: '48%',
              stack: [
                {
                  text: 'Bill To:',
                  style: 'sectionHeader',
                  bold: true,
                  margin: [0, 0, 0, 6]
                },
                {
                  text: params.order.billing_address ? 
                    `${params.order.billing_address.first_name || ''} ${params.order.billing_address.last_name || ''}
${params.order.billing_address.address_1 || ''}${params.order.billing_address.address_2 ? ` ${params.order.billing_address.address_2}` : ''}
${params.order.billing_address.city || ''} - ${params.order.billing_address.postal_code || ''} ${params.order.billing_address.province || ''}, ${params.order.billing_address.country_code?.toUpperCase() || ''}` : 
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
                  text: 'Ship To:',
                  style: 'sectionHeader',
                  bold: true,
                  margin: [0, 0, 0, 6]
                },
                {
                  text: params.order.shipping_address ? 
                    `${params.order.shipping_address.first_name || ''} ${params.order.shipping_address.last_name || ''}
${params.order.shipping_address.address_1 || ''}${params.order.shipping_address.address_2 ? ` ${params.order.shipping_address.address_2}` : ''}
${params.order.shipping_address.city || ''} - ${params.order.shipping_address.postal_code || ''} ${params.order.shipping_address.province || ''}, ${params.order.shipping_address.country_code?.toUpperCase() || ''}` : 
                    'No shipping address provided',
                  style: 'addressText',
                  margin: [0, 0, 0, 0]
                }
              ]
            }
          ]
        },
        // GSTIN Number section
        {
          text: `GSTIN Number: ${billFromAddress.gstin || 'N/A'}`,
          style: 'gstin',
          margin: [0, 0, 0, 15]
        },
        // Horizontal line before table
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 545, y2: 0,
              lineWidth: 1,
              lineColor: '#000000'
            }
          ],
          margin: [0, 0, 0, 10]
        },
        {
          margin: [0, 15, 0, 0],
          table: {
            headerRows: 2,
            widths: [110, 50, 25, 30, 40, 30, 40, 30, 40, 75],
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
        ...(config.notes ? [
          {
            text: 'NOTES',
            style: 'sectionHeader',
            margin: [0, 15, 0, 8]
          },
          {
            text: config.notes,
            style: 'notesText',
            margin: [0, 0, 0, 15]
          }
        ] : []),
        // Company name at bottom
        {
          text: billFromAddress.company?.toUpperCase() || 'COMPANY NAME',
          style: 'companyFooter',
          margin: [0, 30, 0, 15]
        },
        // Declaration section
        {
          text: 'DECLARATION',
          style: 'declarationHeader',
          margin: [0, 10, 0, 6]
        },
        {
          text: 'The goods sold as part of this shipment are intended for end-user consumption and are not for retail sale',
          style: 'declarationText',
          margin: [0, 0, 0, 15]
        },
        // Horizontal line
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 545, y2: 0,
              lineWidth: 0.5,
              lineColor: '#cccccc'
            }
          ],
          margin: [0, 5, 0, 10]
        },
        {
          text: `Reg Address: ${billFromAddress.company || 'Company Name'}, ${billFromAddress.address_1 || ''}, ${billFromAddress.city || ''}, ${billFromAddress.province || ''}-${billFromAddress.postal_code || ''}`,
          style: 'registeredAddressText',
          margin: [0, 0, 0, 15]
        },
        {
          columns: [
            {
              width: '*',
              text: `If you have any questions, feel free to call customer care at ${billFromAddress.phone || '+91 00 0000 0000'} or use Contact Us section in our App, or log on to www.junooni.com/contactus`,
              style: 'footerText',
              margin: [0, 0, 0, 0]
            }
          ],
          margin: [0, 0, 0, 10]
        }
      ]

      // Add page break between vendors (except for last vendor)
      if (currentPageNumber < totalVendorPages) {
        vendorPageContent.push({
          text: '',
          pageBreak: 'after'
        })
      }

      allPagesContent.push(...vendorPageContent)
      currentPageNumber++
    }

    // ✅ Final PDF structure with all vendor pages
    const pdfStructure = {
      pageSize: 'A4',
      pageMargins: [25, 80, 25, 40],
      header: {
        margin: [25, 30, 25, 10],
        columns: [
          {
            width: '*',
            text: 'JUNOONI',
            style: 'companyName',
            margin: [0, 0, 0, 0]
          },
          {
            width: 'auto',
            text: 'Tax Invoice',
            style: 'invoiceTitle',
            alignment: 'right',
            margin: [0, 0, 0, 0]
          }
        ]
      },
      content: allPagesContent,
      styles: {
        companyName: {
          fontSize: 18,
          bold: true,
          color: '#000000'
        },
        addressText: {
          fontSize: 11,
          bold: true,
          color: '#495057',
          lineHeight: 1.3
        },
        invoiceTitle: {
          fontSize: 20,
          bold: true,
          color: '#000000'
        },
        invoiceDetailLeft: {
          fontSize: 12,
          color: '#000000',
          lineHeight: 1.4
        },
        invoiceDetailRight: {
          fontSize: 12,
          color: '#000000',
          alignment: 'right',
          lineHeight: 1.4
        },
        gstin: {
          fontSize: 10,
          color: '#000000',
          bold: false,
          decoration: 'underline'
        },
        label: {
          fontSize: 12,
          color: '#6c757d',
          bold: true
        },
        value: {
          fontSize: 12,
          bold: true,
          color: '#2c3e50'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#000000'
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: '#ffffff',
          fillColor: '#495057',
          alignment: 'center',
          margin: [1, 3, 1, 3]
        },
        tableRow: {
          fontSize: 9,
          color: '#495057',
          margin: [1, 2, 1, 2]
        },
        totalValue: {
          fontSize: 12,
          bold: true,
          color: '#2c3e50'
        },
        notesText: {
          fontSize: 12,
          color: '#6c757d',
          italics: true,
          lineHeight: 1.4
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
          fontSize: 9,
          color: '#000000',
          lineHeight: 1.3
        },
        contactInfoText: {
          fontSize: 10,
          color: '#495057',
          lineHeight: 1.2
        },
        footerText: {
          fontSize: 9,
          color: '#6c757d'
        },
        pageText: {
          fontSize: 9,
          color: '#6c757d',
          bold: true
        },
        companyFooter: {
          fontSize: 12,
          bold: true,
          color: '#000000'
        },
        declarationHeader: {
          fontSize: 11,
          bold: true,
          color: '#000000',
          decoration: 'underline'
        },
        declarationText: {
          fontSize: 10,
          color: '#000000',
          lineHeight: 1.3
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    }

    console.log(`✅ PDF structure created successfully with ${totalVendorPages} vendor page(s)`)
    return pdfStructure
  }

  private calculateGSTBreakdown(order: any, items: any[]) {
    console.log('🧮 Calculating GST breakdown for items')
    
    const totalTaxAmount = items.reduce((sum, item) => sum + this.extractNumeric(item.tax_total || 0), 0)
    
    const isIntraState = this.checkIfIntraState(order.billing_address, order.shipping_address)
    console.log('🏠 Is intra-state:', isIntraState)
    
    let taxRate = 5
    if (order.items?.[0]?.tax_lines?.[0]) {
      const extractedRate = this.extractNumeric(order.items[0].tax_lines[0].rate || order.items[0].tax_lines[0].raw_rate?.value)
      taxRate = extractedRate || 5
    }
    
    console.log('📈 Tax rate found:', taxRate)
    
    let cgstTotal = 0, sgstTotal = 0, igstTotal = 0, ugstTotal = 0
    let cgstRate = 0, sgstRate = 0, igstRate = 0, ugstRate = 0
    
    if (totalTaxAmount > 0 && !isNaN(totalTaxAmount)) {
      if (isIntraState) {
        cgstRate = Number((taxRate / 2).toFixed(2))
        sgstRate = Number((taxRate / 2).toFixed(2))
        cgstTotal = Number((totalTaxAmount / 2).toFixed(2))
        sgstTotal = Number((totalTaxAmount / 2).toFixed(2))
      } else {
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
    
    Object.keys(breakdown).forEach(key => {
      if (typeof breakdown[key] === 'object' && breakdown[key] !== null) {
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
    const billingState = billingAddress?.province?.toLowerCase()
    const shippingState = shippingAddress?.province?.toLowerCase()
    
    const result = billingState === shippingState && billingState && shippingState
    console.log('🏠 State comparison:', { billingState, shippingState, result })
    return result
  }

  private async formatAmount(amount: number, currency: string): Promise<string> {
    if (isNaN(amount) || amount === null || amount === undefined) {
      console.warn('⚠️ Invalid amount received:', amount)
      return 'Rs.0.00'
    }
    
    try {
      const formattedNumber = Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      
      return `Rs.${formattedNumber}`
    } catch (error) {
      console.error('❌ formatAmount error:', error)
      return `Rs.${Number(amount).toFixed(2)}`
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
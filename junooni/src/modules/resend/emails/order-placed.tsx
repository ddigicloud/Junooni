// import { 
//   Text, 
//   Column, 
//   Container, 
//   Heading, 
//   Html, 
//   Img, 
//   Row, 
//   Section, 
//   Tailwind, 
//   Head, 
//   Preview, 
//   Body, 
//   Link 
// } from "@react-email/components"
// import { BigNumberValue, CustomerDTO, OrderDTO } from "@medusajs/framework/types"

// type OrderPlacedEmailProps = {
//   order: OrderDTO & {
//     customer: CustomerDTO
//   }
//   email_banner?: {
//     body: string
//     title: string
//     url: string
//   }
// }

// function OrderPlacedEmailComponent({ order, email_banner }: OrderPlacedEmailProps) {
//   const shouldDisplayBanner = email_banner && "title" in email_banner

//   const formatter = new Intl.NumberFormat([], {
//     style: "currency",
//     currencyDisplay: "narrowSymbol",
//     currency: order.currency_code,
//   })

//   const formatPrice = (price: BigNumberValue) => {
//     if (typeof price === "number") {
//       return formatter.format(price)
//     }

//     if (typeof price === "string") {
//       return formatter.format(parseFloat(price))
//     }

//     return price?.toString() || ""
//   }

//   return (
//     <Tailwind>
//       <Html className="font-sans bg-gray-100">
//         <Head />
//         <Preview>Thank you for your order from Junooni</Preview>
//         <Body className="w-full max-w-2xl mx-auto my-10 bg-white">
//           {/* Header */}
//           <Section className="bg-[#e65100] text-white px-6 py-5">
//             <Row>
//               <Column align="center">
//                 <Text className="m-0 text-2xl font-bold tracking-wide">JUNOONI</Text>
//                 <Text className="m-0 mt-1 text-xs tracking-widest uppercase">Premium Lifestyle</Text>
//               </Column>
//             </Row>
//           </Section>

//           {/* Thank You Message */}
//           <Container className="p-8">
//             <Heading className="text-2xl font-bold text-center text-gray-800">
//               Thank you for your order, {order.customer?.first_name || order.shipping_address?.first_name}
//             </Heading>
//             <Text className="mt-3 text-center text-gray-600">
//               We're processing your order and will notify you when it ships. Your estimated delivery date is 3-5 business days from today.
//             </Text>
//           </Container>

//           {/* Promotional Banner */}
//           {shouldDisplayBanner && (
//             <Container
//               className="mb-6 rounded-lg p-7"
//               style={{
//                 background: 'linear-gradient(135deg, #e65100, #ff9800)'
//               }}
//             >
//               <Section>
//                 <Row>
//                   <Column align="left">
//                     <Heading className="text-xl font-semibold text-white">
//                       {email_banner.title}
//                     </Heading>
//                     <Text className="mt-2 text-white">{email_banner.body}</Text>
//                   </Column>
//                   <Column align="right">
//                     <Link 
//                       href={email_banner.url} 
//                       className="bg-white text-[#e65100] py-2 px-4 rounded font-semibold no-underline inline-block"
//                     >
//                       Shop Now
//                     </Link>
//                   </Column>
//                 </Row>
//               </Section>
//             </Container>
//           )}

//           {/* Order Items */}
//           <Container className="px-8">
//             <Heading className="pb-2 mb-4 text-xl font-semibold text-gray-800 border-b border-gray-200">
//               Your Items
//             </Heading>
//             <Row>
//               <Column>
//                 <Text className="m-0 my-2 text-sm text-gray-500">Order ID: #{order.custom_display_id} • Placed on {new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
//               </Column>
//             </Row>
//             {order.items?.map((item) => (
//               <Section key={item.id} className="py-6 border-b border-gray-200">
//                 <Row>
//                   <Column className="w-1/3">
//                     <Img
//                       src={item.thumbnail ?? ''}
//                       alt={item.product_title ?? ''}
//                       className="border border-gray-200 rounded-lg"
//                       width="100%"
//                     />
//                   </Column>
//                   <Column className="w-2/3 pl-6">
//                     <Text className="m-0 text-lg font-semibold text-gray-800">
//                       {item.product_title}
//                     </Text>
//                     <Text className="m-0 mt-1 text-gray-600">Size: {item.variant_title}</Text>
//                     <Text className="m-0 mt-1 text-gray-600">Quantity: {item.quantity}</Text>
//                     <Text className="text-[#e65100] mt-3 font-bold m-0">
//                       {formatPrice(item.total)}
//                     </Text>
//                   </Column>
//                 </Row>
//               </Section>
//             ))}

//             {/* Order Summary */}
//             <Section className="p-6 mt-8 rounded-lg bg-gray-50">
//               <Heading className="pb-2 mb-4 text-xl font-semibold text-gray-800 border-b border-gray-200">
//                 Order Summary
//               </Heading>
//               <Row className="py-2 text-gray-600">
//                 <Column className="w-1/2">
//                   <Text className="m-0">Subtotal</Text>
//                 </Column>
//                 <Column className="w-1/2 text-right">
//                   <Text className="m-0">
//                     {formatPrice(order.item_total)}
//                   </Text>
//                 </Column>
//               </Row>
//               {order.shipping_methods?.map((method) => (
//                 <Row className="py-2 text-gray-600" key={method.id}>
//                   <Column className="w-1/2">
//                     <Text className="m-0">{method.name}</Text>
//                   </Column>
//                   <Column className="w-1/2 text-right">
//                     <Text className="m-0">{formatPrice(method.total)}</Text>
//                   </Column>
//                 </Row>
//               ))}
//               <Row className="py-2 text-gray-600">
//                 <Column className="w-1/2">
//                   <Text className="m-0">Tax</Text>
//                 </Column>
//                 <Column className="w-1/2 text-right">
//                   <Text className="m-0">{formatPrice(order.tax_total || 0)}</Text>
//                 </Column>
//               </Row>
//               <Row className="pt-4 mt-4 font-bold text-gray-800 border-t border-gray-200">
//                 <Column className="w-1/2">
//                   <Text className="m-0 text-lg">Total</Text>
//                 </Column>
//                 <Column className="w-1/2 text-right">
//                   <Text className="text-lg m-0 text-[#e65100]">{formatPrice(order.total)}</Text>
//                 </Column>
//               </Row>
//             </Section>
//           </Container>

//           {/* Footer */}
//           <Section className="p-6 mt-10 bg-gray-50">
//             <Text className="text-sm text-center text-gray-500">
//               If you have any questions, Please contact our support team at support@junooni.com.
//             </Text>
//             <Text className="text-sm text-center text-gray-500">
//               Order Token: {order.id}
//             </Text>
//             <Text className="mt-4 text-xs text-center text-gray-400">
//               © {new Date().getFullYear()} Junooni, Inc. All rights reserved.
//             </Text>
//           </Section>
//         </Body>
//       </Html>
//     </Tailwind >
//   )
// }

// export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
//   <OrderPlacedEmailComponent {...props} />
// )


// const mockOrder = {
//   "order": {
//     "id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
//     "custom_display_id": 1,
//     "email": "customer@example.com",
//     "currency_code": "eur",
//     "total": 20,
//     "subtotal": 20,
//     "discount_total": 0,
//     "shipping_total": 10,
//     "tax_total": 0,
//     "item_subtotal": 10,
//     "item_total": 10,
//     "item_tax_total": 0,
//     "customer_id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
//     "items": [
//       {
//         "id": "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
//         "title": "L",
//         "subtitle": "Junooni T-Shirt",
//         "thumbnail": "https://example.com/images/tshirt-front.png",
//         "variant_id": "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
//         "product_id": "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
//         "product_title": "Junooni T-Shirt",
//         "product_description": "Express your unique style with our premium cotton t-shirt. Comfortable, durable, and designed for everyday wear.",
//         "product_subtitle": null,
//         "product_type": null,
//         "product_type_id": null,
//         "product_collection": null,
//         "product_handle": "tshirt",
//         "variant_sku": "TSHIRT-L",
//         "variant_barcode": null,
//         "variant_title": "L",
//         "variant_option_values": null,
//         "requires_shipping": true,
//         "is_giftcard": false,
//         "is_discountable": true,
//         "is_tax_inclusive": false,
//         "is_custom_price": false,
//         "metadata": {},
//         "raw_compare_at_unit_price": null,
//         "raw_unit_price": {
//           "value": "10",
//           "precision": 20
//         },
//         "created_at": new Date(),
//         "updated_at": new Date(),
//         "deleted_at": null,
//         "tax_lines": [],
//         "adjustments": [],
//         "compare_at_unit_price": null,
//         "unit_price": 10,
//         "quantity": 1,
//         "raw_quantity": {
//           "value": "1",
//           "precision": 20
//         },
//         "detail": {
//           "id": "orditem_01JSNXDH9DK1XMESEZPADYFWKY",
//           "version": 1,
//           "metadata": null,
//           "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
//           "raw_unit_price": null,
//           "raw_compare_at_unit_price": null,
//           "raw_quantity": {
//             "value": "1",
//             "precision": 20
//           },
//           "raw_fulfilled_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_delivered_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_shipped_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_return_requested_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_return_received_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_return_dismissed_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "raw_written_off_quantity": {
//             "value": "0",
//             "precision": 20
//           },
//           "created_at": new Date(),
//           "updated_at": new Date(),
//           "deleted_at": null,
//           "item_id": "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
//           "unit_price": null,
//           "compare_at_unit_price": null,
//           "quantity": 1,
//           "fulfilled_quantity": 0,
//           "delivered_quantity": 0,
//           "shipped_quantity": 0,
//           "return_requested_quantity": 0,
//           "return_received_quantity": 0,
//           "return_dismissed_quantity": 0,
//           "written_off_quantity": 0
//         },
//         "subtotal": 10,
//         "total": 10,
//         "original_total": 10,
//         "discount_total": 0,
//         "discount_subtotal": 0,
//         "discount_tax_total": 0,
//         "tax_total": 0,
//         "original_tax_total": 0,
//         "refundable_total_per_unit": 10,
//         "refundable_total": 10,
//         "fulfilled_total": 0,
//         "shipped_total": 0,
//         "return_requested_total": 0,
//         "return_received_total": 0,
//         "return_dismissed_total": 0,
//         "write_off_total": 0,
//         "raw_subtotal": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_total": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_original_total": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_discount_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_discount_subtotal": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_discount_tax_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_tax_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_original_tax_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_refundable_total_per_unit": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_refundable_total": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_fulfilled_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_shipped_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_return_requested_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_return_received_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_return_dismissed_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_write_off_total": {
//           "value": "0",
//           "precision": 20
//         }
//       }
//     ],
//     "shipping_address": {
//       "id": "caaddr_01JSNXD6W0TGPH2JQD18K97B25",
//       "customer_id": null,
//       "company": "",
//       "first_name": "John",
//       "last_name": "Doe",
//       "address_1": "123 Main St",
//       "address_2": "",
//       "city": "New York",
//       "country_code": "us",
//       "province": "NY",
//       "postal_code": "10001",
//       "phone": "",
//       "metadata": null,
//       "created_at": "2025-04-25T07:25:48.801Z",
//       "updated_at": "2025-04-25T07:25:48.801Z",
//       "deleted_at": null
//     },
//     "billing_address": {
//       "id": "caaddr_01JSNXD6W0V7RNZH63CPG26K5W",
//       "customer_id": null,
//       "company": "",
//       "first_name": "John",
//       "last_name": "Doe",
//       "address_1": "123 Main St",
//       "address_2": "",
//       "city": "New York",
//       "country_code": "us",
//       "province": "NY",
//       "postal_code": "10001",
//       "phone": "",
//       "metadata": null,
//       "created_at": "2025-04-25T07:25:48.801Z",
//       "updated_at": "2025-04-25T07:25:48.801Z",
//       "deleted_at": null
//     },
//     "shipping_methods": [
//       {
//         "id": "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
//         "name": "Standard Shipping",
//         "description": null,
//         "is_tax_inclusive": false,
//         "is_custom_amount": false,
//         "shipping_option_id": "so_01JSNXAQA64APG6BNHGCMCTN6V",
//         "data": {},
//         "metadata": null,
//         "raw_amount": {
//           "value": "10",
//           "precision": 20
//         },
//         "created_at": new Date(),
//         "updated_at": new Date(),
//         "deleted_at": null,
//         "tax_lines": [],
//         "adjustments": [],
//         "amount": 10,
//         "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
//         "detail": {
//           "id": "ordspmv_01JSNXDH9B5RAF4FH3M1HH3TEA",
//           "version": 1,
//           "order_id": "order_01JSNXDH9BPJWWKVW03B9E9KW8",
//           "return_id": null,
//           "exchange_id": null,
//           "claim_id": null,
//           "created_at": new Date(),
//           "updated_at": new Date(),
//           "deleted_at": null,
//           "shipping_method_id": "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1"
//         },
//         "subtotal": 10,
//         "total": 10,
//         "original_total": 10,
//         "discount_total": 0,
//         "discount_subtotal": 0,
//         "discount_tax_total": 0,
//         "tax_total": 0,
//         "original_tax_total": 0,
//         "raw_subtotal": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_total": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_original_total": {
//           "value": "10",
//           "precision": 20
//         },
//         "raw_discount_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_discount_subtotal": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_discount_tax_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_tax_total": {
//           "value": "0",
//           "precision": 20
//         },
//         "raw_original_tax_total": {
//           "value": "0",
//           "precision": 20
//         }
//       }
//     ],
//     "customer": {
//       "id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
//       "company_name": null,
//       "first_name": "John",
//       "last_name": "Doe",
//       "email": "customer@example.com",
//       "phone": null,
//       "has_account": false,
//       "metadata": null,
//       "created_by": null,
//       "created_at": "2025-04-25T07:25:48.791Z",
//       "updated_at": "2025-04-25T07:25:48.791Z",
//       "deleted_at": null
//     }
//   }
// }
// // @ts-ignore
// export default () => <OrderPlacedEmailComponent {...mockOrder} />

import { 
  Text, 
  Column, 
  Container, 
  Heading, 
  Html, 
  Img, 
  Row, 
  Section, 
  Tailwind, 
  Head, 
  Preview, 
  Body, 
  Link,
  Hr,
} from "@react-email/components"
import { BigNumberValue, CustomerDTO, OrderDTO } from "@medusajs/framework/types"

type OrderPlacedEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO
  }
}

// Brand color
const BRAND_COLOR = '#e65100'

function OrderPlacedEmailComponent({ order }: OrderPlacedEmailProps) {
  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: order.currency_code,
  })

  const formatPrice = (price: BigNumberValue) => {
    if (typeof price === "number") {
      return formatter.format(price)
    }
    if (typeof price === "string") {
      return formatter.format(parseFloat(price))
    }
    return price?.toString() || ""
  }

  const customerName = order.customer?.first_name || order.shipping_address?.first_name || "there"

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
  const deliveryDateStr = estimatedDelivery.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  })

  const trackOrderUrl = `https://junooni.com/in/order/${order.id}/confirmed`

  // Logo URLs
  const shortLogoUrl = "https://junooni.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FJUNOONI_logo.703fd026.ico&w=256&q=75"
  const fullLogoUrl = "https://files.junooni.com/junooni-files/junooni_logo_brand_color%20(2)-01K8SXB0AC1NWQV3YQJ5B4N942.png"

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Order #{String(order.custom_display_id)} confirmed! Your items are on their way.</Preview>
        <Body style={{ backgroundColor: '#f5f3f0', margin: 0, padding: '32px 16px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
          <Container style={{ maxWidth: '520px', margin: '0 auto' }}>
            
            {/* Main Card */}
            <Section style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>

              {/* Header with Logos - Side by Side */}
              <Section style={{ 
                padding: '28px 32px',
                textAlign: 'center'
              }}>
                <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                  <tbody>
                    <tr>
                      {/* Short Logo */}
                      <td style={{ verticalAlign: 'middle', paddingRight: '12px' }}>
                        <Img 
                          src={shortLogoUrl}
                          alt="Junooni"
                          width="40"
                          height="40"
                        />
                      </td>
                      {/* Full Logo */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <Img 
                          src={fullLogoUrl}
                          alt="Junooni"
                          width="140"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
              
              {/* Hero Section */}
              <Section style={{ 
                padding: '32px 32px 28px 32px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #fff9f6 0%, #ffffff 100%)'
              }}>
                {/* Success Checkmark */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto 20px auto' }}>
                  <tbody>
                    <tr>
                      <td style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: BRAND_COLOR,
                        borderRadius: '50%',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <Heading style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1a1a1a',
                  margin: '0 0 8px 0'
                }}>
                  Thank you, {customerName}!
                </Heading>
                <Text style={{ 
                  fontSize: '15px', 
                  color: '#666666',
                  margin: '0 0 20px 0',
                  lineHeight: '1.5'
                }}>
                  Your order has been confirmed and is being prepared.
                </Text>
                
                {/* Order Number Badge */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                  <tbody>
                    <tr>
                      <td style={{
                        backgroundColor: BRAND_COLOR,
                        borderRadius: '24px',
                        padding: '10px 24px'
                      }}>
                        <Text style={{ 
                          color: '#ffffff', 
                          fontSize: '13px', 
                          fontWeight: '600',
                          margin: 0,
                          letterSpacing: '0.5px'
                        }}>
                          ORDER #{order.custom_display_id}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>

              {/* Order Progress Tracker */}
              <Section style={{ backgroundColor: '#fafafa', padding: '24px 32px' }}>
                <table cellPadding={0} cellSpacing={0} width="100%">
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', width: '30%' }}>
                        <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                          <tbody>
                            <tr>
                              <td style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: BRAND_COLOR,
                                borderRadius: '50%',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                color: '#ffffff',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                ✓
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <Text style={{ fontSize: '11px', color: BRAND_COLOR, fontWeight: '600', margin: '8px 0 0 0' }}>
                          Confirmed
                        </Text>
                      </td>
                      
                      <td style={{ width: '10%', verticalAlign: 'middle', paddingBottom: '20px' }}>
                        <Hr style={{ borderTop: '2px dashed #e0e0e0', margin: 0 }} />
                      </td>
                      
                      <td style={{ textAlign: 'center', width: '30%' }}>
                        <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                          <tbody>
                            <tr>
                              <td style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #e0e0e0',
                                borderRadius: '50%',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                color: '#999999',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                2
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <Text style={{ fontSize: '11px', color: '#999999', fontWeight: '500', margin: '8px 0 0 0' }}>
                          Processing
                        </Text>
                      </td>
                      
                      <td style={{ width: '10%', verticalAlign: 'middle', paddingBottom: '20px' }}>
                        <Hr style={{ borderTop: '2px dashed #e0e0e0', margin: 0 }} />
                      </td>
                      
                      <td style={{ textAlign: 'center', width: '20%' }}>
                        <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                          <tbody>
                            <tr>
                              <td style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #e0e0e0',
                                borderRadius: '50%',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                color: '#999999',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                3
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <Text style={{ fontSize: '11px', color: '#999999', fontWeight: '500', margin: '8px 0 0 0' }}>
                          Shipped
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>

              {/* Estimated Delivery */}
              <Section style={{ padding: '20px 32px', borderBottom: '1px solid #f0f0f0' }}>
                <Row>
                  <Column>
                    <Text style={{ fontSize: '11px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>
                      Estimated Delivery
                    </Text>
                    <Text style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '600', margin: 0 }}>
                      {deliveryDateStr}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Link 
                      href={trackOrderUrl}
                      style={{ fontSize: '13px', color: BRAND_COLOR, fontWeight: '600', textDecoration: 'none' }}
                    >
                      Track Order →
                    </Link>
                  </Column>
                </Row>
              </Section>

              {/* Order Items */}
              <Section style={{ padding: '24px 32px' }}>
                <Text style={{ fontSize: '11px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0' }}>
                  Your Items ({order.items?.length || 0})
                </Text>
                
                {order.items?.map((item, index) => {
                  console.log('=== EMAIL TEMPLATE DEBUG START ===')
                  console.log('📧 Item ID:', item.id)
                  console.log('📧 Product Title:', item.product_title)
                  console.log('📧 Variant Title:', item.variant_title)
                  console.log('📧 Item Thumbnail:', item.thumbnail)
                  console.log('📧 Item Metadata:', item.metadata)
                  console.log('📧 Variant Object:', item.variant)
                  console.log('📧 Variant Metadata:', item.variant?.metadata)
                  
                  // Get variant image from variant.metadata (NOT item.metadata)
                  const getVariantImage = () => {
                    console.log('🔍 Starting variant image search...')
                    
                    // Check if variant exists
                    if (!item.variant) {
                      console.log('❌ No variant object found')
                      return item.thumbnail ?? ''
                    }
                    
                    const variantMetadata = item.variant.metadata
                    console.log('📦 Variant Metadata:', variantMetadata)
                    
                    // First priority: Check variant_images in variant.metadata
                    if (variantMetadata?.variant_images) {
                      console.log('✅ Found variant_images in variant.metadata:', variantMetadata.variant_images)
                      console.log('📝 Type of variant_images:', typeof variantMetadata.variant_images)
                      
                      try {
                        const variantImages = typeof variantMetadata.variant_images === 'string' 
                          ? JSON.parse(variantMetadata.variant_images) 
                          : variantMetadata.variant_images
                        
                        console.log('📦 Parsed variant_images:', variantImages)
                        console.log('📦 Is Array:', Array.isArray(variantImages))
                        console.log('📦 Array Length:', variantImages?.length)
                        
                        if (Array.isArray(variantImages) && variantImages.length > 0) {
                          console.log('✅ Using variant image from variant_images[0]:', variantImages[0])
                          return variantImages[0]
                        } else {
                          console.log('❌ variant_images exists but is empty or not an array')
                        }
                      } catch (e) {
                        console.error('❌ Error parsing variant_images:', e)
                      }
                    } else {
                      console.log('❌ No variant_images in variant.metadata')
                    }
                    
                    // Second priority: Check color_images in variant.metadata
                    if (variantMetadata?.color_images) {
                      console.log('✅ Found color_images in variant.metadata:', variantMetadata.color_images)
                      console.log('📝 Type of color_images:', typeof variantMetadata.color_images)
                      
                      try {
                        const colorImages = typeof variantMetadata.color_images === 'string'
                          ? JSON.parse(variantMetadata.color_images)
                          : variantMetadata.color_images
                        
                        console.log('📦 Parsed color_images:', colorImages)
                        console.log('📦 Is Array:', Array.isArray(colorImages))
                        
                        if (Array.isArray(colorImages) && colorImages.length > 0) {
                          // color_images has structure: [{color: "Orange", url: "...", imageId: "..."}]
                          const firstImage = colorImages[0]
                          if (firstImage && firstImage.url) {
                            console.log('✅ Using color image from color_images[0].url:', firstImage.url)
                            return firstImage.url
                          } else if (typeof firstImage === 'string') {
                            console.log('✅ Using color image (string):', firstImage)
                            return firstImage
                          }
                          console.log('❌ color_images exists but no valid url found')
                        } else {
                          console.log('❌ color_images exists but is empty or not an array')
                        }
                      } catch (e) {
                        console.error('❌ Error parsing color_images:', e)
                      }
                    } else {
                      console.log('❌ No color_images in variant.metadata')
                    }
                    
                    // Third priority: Check option_images in variant.metadata
                    if (variantMetadata?.option_images) {
                      console.log('✅ Found option_images in variant.metadata')
                      
                      try {
                        const optionImages = typeof variantMetadata.option_images === 'string'
                          ? JSON.parse(variantMetadata.option_images)
                          : variantMetadata.option_images
                        
                        if (Array.isArray(optionImages) && optionImages.length > 0 && optionImages[0].url) {
                          console.log('✅ Using option image:', optionImages[0].url)
                          return optionImages[0].url
                        }
                      } catch (e) {
                        console.error('❌ Error parsing option_images:', e)
                      }
                    }
                    
                    // Fallback to thumbnail
                    console.log('⚠️ No variant image found, using thumbnail:', item.thumbnail)
                    return item.thumbnail ?? ''
                  }

                  const itemImage = getVariantImage()
                  console.log('🎯 FINAL IMAGE USED:', itemImage)
                  console.log('=== EMAIL TEMPLATE DEBUG END ===\n')

                  return (
                    <Section key={item.id}>
                      <Row style={{ paddingBottom: '16px', paddingTop: index > 0 ? '16px' : '0' }}>
                        <Column style={{ width: '72px', verticalAlign: 'top' }}>
                          <Img
                            src={itemImage}
                            alt={item.product_title ?? ''}
                            width="72"
                            height="72"
                            style={{ borderRadius: '10px', backgroundColor: '#f8f8f8', objectFit: 'cover' }}
                          />
                        </Column>
                        <Column style={{ paddingLeft: '16px', verticalAlign: 'top' }}>
                          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px 0' }}>
                            {item.product_title}
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#888888', margin: '0 0 8px 0' }}>
                            {item.variant_title} · Qty: {item.quantity}
                          </Text>
                          <Text style={{ fontSize: '14px', fontWeight: '700', color: BRAND_COLOR, margin: 0 }}>
                            {formatPrice(item.total)}
                          </Text>
                        </Column>
                      </Row>
                      {index < ((order.items?.length ?? 0) - 1) && (
                        <Hr style={{ borderTop: '1px solid #f0f0f0', margin: 0 }} />
                      )}
                    </Section>
                  )
                })}
              </Section>

              {/* Order Summary */}
              <Section style={{ padding: '20px 32px', backgroundColor: '#fafafa' }}>
                <Row style={{ paddingBottom: '8px' }}>
                  <Column>
                    <Text style={{ fontSize: '13px', color: '#666666', margin: 0 }}>Subtotal</Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                      {formatPrice(order.item_total)}
                    </Text>
                  </Column>
                </Row>
                
                {order.shipping_methods?.map((method) => (
                  <Row style={{ paddingBottom: '8px' }} key={method.id}>
                    <Column>
                      <Text style={{ fontSize: '13px', color: '#666666', margin: 0 }}>Shipping</Text>
                    </Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                        {Number(method.total) === 0 ? 'Free' : formatPrice(method.total)}
                      </Text>
                    </Column>
                  </Row>
                ))}
                
                {order.tax_total && Number(order.tax_total) > 0 && (
                  <Row style={{ paddingBottom: '8px' }}>
                    <Column>
                      <Text style={{ fontSize: '13px', color: '#666666', margin: 0 }}>Tax</Text>
                    </Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                        {formatPrice(order.tax_total)}
                      </Text>
                    </Column>
                  </Row>
                )}
                
                <Hr style={{ borderTop: '1px solid #e0e0e0', margin: '12px 0' }} />
                
                <Row>
                  <Column>
                    <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Total</Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: '17px', fontWeight: '700', color: BRAND_COLOR, margin: 0 }}>
                      {formatPrice(order.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Shipping & Billing */}
              <Section style={{ padding: '24px 32px', borderTop: '1px solid #f0f0f0' }}>
                <Row>
                  <Column style={{ width: '50%', paddingRight: '16px', verticalAlign: 'top' }}>
                    <Text style={{ fontSize: '11px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                      Ship To
                    </Text>
                    <Text style={{ fontSize: '13px', color: '#444444', margin: 0, lineHeight: '1.6' }}>
                      {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
                      {order.shipping_address?.address_1}<br />
                      {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}
                    </Text>
                  </Column>
                  <Column style={{ width: '50%', paddingLeft: '16px', borderLeft: '1px solid #f0f0f0', verticalAlign: 'top' }}>
                    <Text style={{ fontSize: '11px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                      Bill To
                    </Text>
                    <Text style={{ fontSize: '13px', color: '#444444', margin: 0, lineHeight: '1.6' }}>
                      {order.billing_address?.first_name} {order.billing_address?.last_name}<br />
                      {order.billing_address?.address_1}<br />
                      {order.billing_address?.city}, {order.billing_address?.province} {order.billing_address?.postal_code}
                    </Text>
                  </Column>
                </Row>
              </Section>

            </Section>

            {/* Help Section */}
            <Section style={{ padding: '28px 32px', textAlign: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#666666', margin: '0 0 4px 0' }}>
                Questions about your order?
              </Text>
              <Link 
                href="https://junooni.com/in/contact-us" 
                style={{ fontSize: '13px', color: BRAND_COLOR, fontWeight: '600', textDecoration: 'none' }}
              >
                Contact Support
              </Link>
            </Section>

            {/* Quick Links */}
            <Section style={{ textAlign: 'center', paddingBottom: '16px' }}>
              <Link href="https://junooni.com/in/orders-shipping" style={{ fontSize: '11px', color: '#888888', textDecoration: 'none', margin: '0 10px' }}>
                Shipping Info
              </Link>
              <Link href="https://junooni.com/in/refund-exchange" style={{ fontSize: '11px', color: '#888888', textDecoration: 'none', margin: '0 10px' }}>
                Returns
              </Link>
              <Link href="https://junooni.com/in/product-care" style={{ fontSize: '11px', color: '#888888', textDecoration: 'none', margin: '0 10px' }}>
                Product Care
              </Link>
            </Section>

            {/* Social & Footer */}
            <Section style={{ textAlign: 'center', paddingBottom: '32px' }}>
              <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto 16px auto' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0 8px' }}>
                      <Link href="https://www.instagram.com/junooni">
                        <Img 
                          src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" 
                          alt="Instagram" 
                          width="22" 
                          height="22"
                          style={{ opacity: 0.5 }}
                        />
                      </Link>
                    </td>
                    <td style={{ padding: '0 8px' }}>
                      <Link href="https://www.facebook.com/profile.php?id=61577994639087">
                        <Img 
                          src="https://cdn-icons-png.flaticon.com/512/733/733547.png" 
                          alt="Facebook" 
                          width="22" 
                          height="22"
                          style={{ opacity: 0.5 }}
                        />
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <Text style={{ fontSize: '11px', color: '#999999', margin: '0 0 4px 0' }}>
                © {new Date().getFullYear()} Junooni · India's #1 Creator Merch Marketplace
              </Text>
              <Text style={{ fontSize: '10px', color: '#bbbbbb', margin: 0 }}>
                <Link href="https://junooni.com/in/terms-condition" style={{ color: '#bbbbbb', textDecoration: 'none' }}>Terms</Link>
                {' · '}
                <Link href="https://junooni.com/in/contact-us" style={{ color: '#bbbbbb', textDecoration: 'none' }}>Contact</Link>
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
)

const mockOrder = {
  "order": {
    "id": "order_01K8QYSV2PDYB2DVT5TF1DWH11",
    "custom_display_id": 1042,
    "email": "customer@example.com",
    "currency_code": "inr",
    "total": 1299,
    "subtotal": 999,
    "discount_total": 0,
    "shipping_total": 99,
    "tax_total": 201,
    "item_subtotal": 999,
    "item_total": 999,
    "item_tax_total": 0,
    "customer_id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
    "items": [
      {
        "id": "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
        "title": "L",
        "subtitle": "Creator Edition Hoodie",
        "thumbnail": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop",
        "variant_id": "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
        "product_id": "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
        "product_title": "Creator Edition Hoodie",
        "variant_title": "Black / L",
        "quantity": 1,
        "unit_price": 999,
        "subtotal": 999,
        "total": 999,
      }
    ],
    "shipping_address": {
      "first_name": "Priya",
      "last_name": "Sharma",
      "address_1": "42 MG Road, Indiranagar",
      "address_2": "",
      "city": "Bangalore",
      "country_code": "in",
      "province": "Karnataka",
      "postal_code": "560038",
    },
    "billing_address": {
      "first_name": "Priya",
      "last_name": "Sharma",
      "address_1": "42 MG Road, Indiranagar",
      "address_2": "",
      "city": "Bangalore",
      "country_code": "in",
      "province": "Karnataka",
      "postal_code": "560038",
    },
    "shipping_methods": [
      {
        "id": "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
        "name": "Standard Shipping",
        "total": 99,
        "amount": 99,
      }
    ],
    "customer": {
      "id": "cus_01JSNXD6VQC1YH56E4TGC81NWX",
      "first_name": "Priya",
      "last_name": "Sharma",
      "email": "priya@example.com",
    }
  }
}
// @ts-ignore
export default () => <OrderPlacedEmailComponent {...mockOrder} />
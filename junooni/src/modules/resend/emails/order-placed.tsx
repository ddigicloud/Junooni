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
  storeLogo?: string | null
  storeName?: string | null
  storePrimaryColor?: string | null
  storeUrl?: string | null
}

// Brand color (fallback when no vendor store color is present)
const BRAND_COLOR = '#e65100'

function OrderPlacedEmailComponent({ order, storeLogo, storeName, storePrimaryColor, storeUrl }: OrderPlacedEmailProps) {
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

  const trackOrderUrl = storeUrl
    ? `${storeUrl}/order/${order.id}/confirmed`
    : `https://junooni.com/in/order/${order.id}/confirmed`

  const contactUrl = storeUrl
    ? `${storeUrl}/pages/contact`
    : "https://junooni.com/in/contact-us"

  // Use the vendor store's brand color when this order came from their own store
  const brandColor = storePrimaryColor || BRAND_COLOR

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

              {/* Header with Logo(s) */}
              <Section style={{ 
                padding: '28px 32px',
                textAlign: 'center'
              }}>
                {storeLogo ? (
                  <Img 
                    src={storeLogo}
                    alt={storeName || "Store"}
                    height="40"
                    style={{ margin: '0 auto', maxWidth: '200px', objectFit: 'contain' }}
                  />
                ) : (
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
                )}
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
                        backgroundColor: brandColor,
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
                        backgroundColor: brandColor,
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
                                backgroundColor: brandColor,
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
                        <Text style={{ fontSize: '11px', color: brandColor, fontWeight: '600', margin: '8px 0 0 0' }}>
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
                      style={{ fontSize: '13px', color: brandColor, fontWeight: '600', textDecoration: 'none' }}
                    >
                      Track Order →
                    </Link>
                  </Column>
                </Row>
              </Section>

              {/* Order Items */}
              <Section style={{ padding: '24px 32px' }}>
                <Text style={{ fontSize: '11px', color: '#888888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0' }}>
                  Your Items ({order.items?.filter((item: any) => !item.metadata?.is_cod_fee).length || 0})
                </Text>
                
                {order.items?.filter((item: any) => !item.metadata?.is_cod_fee).map((item, index) => {
                  // Get variant image from variant.metadata (NOT item.metadata)
                  const getVariantImage = () => {
                    // Check if variant exists
                    if (!item.variant) {
                      return item.thumbnail ?? ''
                    }
                    
                    const variantMetadata = item.variant.metadata
                    
                    // First priority: Check variant_images in variant.metadata
                    if (variantMetadata?.variant_images) {
                      try {
                        const variantImages = typeof variantMetadata.variant_images === 'string' 
                          ? JSON.parse(variantMetadata.variant_images) 
                          : variantMetadata.variant_images
                        
                        if (Array.isArray(variantImages) && variantImages.length > 0) {
                          return variantImages[0]
                        }
                      } catch (e) {
                        // fall through to next priority
                      }
                    }
                    
                    // Second priority: Check color_images in variant.metadata
                    if (variantMetadata?.color_images) {
                      try {
                        const colorImages = typeof variantMetadata.color_images === 'string'
                          ? JSON.parse(variantMetadata.color_images)
                          : variantMetadata.color_images
                        
                        if (Array.isArray(colorImages) && colorImages.length > 0) {
                          // color_images has structure: [{color: "Orange", url: "...", imageId: "..."}]
                          const firstImage = colorImages[0]
                          if (firstImage && firstImage.url) {
                            return firstImage.url
                          } else if (typeof firstImage === 'string') {
                            return firstImage
                          }
                        }
                      } catch (e) {
                        // fall through to next priority
                      }
                    }
                    
                    // Third priority: Check option_images in variant.metadata
                    if (variantMetadata?.option_images) {
                      try {
                        const optionImages = typeof variantMetadata.option_images === 'string'
                          ? JSON.parse(variantMetadata.option_images)
                          : variantMetadata.option_images
                        
                        if (Array.isArray(optionImages) && optionImages.length > 0 && optionImages[0].url) {
                          return optionImages[0].url
                        }
                      } catch (e) {
                        // fall through to fallback
                      }
                    }
                    
                    // Fallback to thumbnail
                    return item.thumbnail ?? ''
                  }

                  const itemImage = getVariantImage()

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
                          <Text style={{ fontSize: '14px', fontWeight: '700', color: brandColor, margin: 0 }}>
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
                      {(() => {
                        const codItem = (order.items as any[])?.find((item: any) => item.metadata?.is_cod_fee)
                        const codAmount = codItem ? Number(codItem.total) : 0
                        return formatPrice(Number(order.item_total) - codAmount)
                      })()}
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

                {/* COD Fee line item */}
                {(() => {
                  const codItem = (order.items as any[])?.find((item: any) => item.metadata?.is_cod_fee)
                  if (!codItem) return null
                  return (
                    <Row style={{ paddingBottom: '8px' }}>
                      <Column>
                        <Text style={{ fontSize: '13px', color: '#666666', margin: 0 }}>
                          Cash on Delivery Fee
                        </Text>
                      </Column>
                      <Column style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                          {formatPrice(codItem.total)}
                        </Text>
                      </Column>
                    </Row>
                  )
                })()}
                
                <Hr style={{ borderTop: '1px solid #e0e0e0', margin: '12px 0' }} />
                
                <Row>
                  <Column>
                    <Text style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Total</Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: '17px', fontWeight: '700', color: brandColor, margin: 0 }}>
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
                href={contactUrl} 
                style={{ fontSize: '13px', color: brandColor, fontWeight: '600', textDecoration: 'none' }}
              >
                Contact Support
              </Link>
            </Section>

            {/* Quick Links + Social & Footer — Junooni marketplace branding only.
                Hidden entirely for orders placed on a vendor's own store. */}
            {!storeLogo && (
              <>
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
                          <Link href="https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0">
                            <Img 
                              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" 
                              alt="Instagram" 
                              width="22" 
                              height="22"
                              style={{ opacity: 0.9 }}
                            />
                          </Link>
                        </td>
                        <td style={{ padding: '0 8px' }}>
                          <Link href="https://www.facebook.com/p/Junooni-61577994639087">
                            <Img 
                              src="https://cdn-icons-png.flaticon.com/512/733/733547.png" 
                              alt="Facebook" 
                              width="22" 
                              height="22"
                              style={{ opacity: 0.9 }}
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
              </>
            )}

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
export default () => <OrderPlacedEmailComponent {...mockOrder} storeLogo={null} storeName={null} storePrimaryColor={null} storeUrl={null} />

// To preview the vendor-store variant (no Junooni footer, vendor logo/color/link),
// swap the export above for something like:
// export default () => (
//   <OrderPlacedEmailComponent
//     {...mockOrder}
//     storeLogo="https://example.com/vendor-logo.png"
//     storeName="Some Creator Store"
//     storePrimaryColor="#7c3aed"
//     storeUrl="https://someborder.junooni.com"
//   />
// )
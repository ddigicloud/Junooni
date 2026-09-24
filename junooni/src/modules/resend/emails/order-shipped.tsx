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
import { CustomerDTO, OrderDTO } from "@medusajs/framework/types"

type OrderShippedEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO
    fulfillments?: any[]
  }
  storeLogo?: string | null
  storeName?: string | null
  storePrimaryColor?: string | null
  storeUrl?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  shippedAt?: string | null
  estimatedDeliveryDays?: number
}

const BRAND_COLOR = "#e65100"

function OrderShippedEmailComponent({
  order,
  storeLogo,
  storeName,
  storePrimaryColor,
  storeUrl,
  trackingNumber,
  trackingUrl,
  shippedAt,
  estimatedDeliveryDays = 5,
}: OrderShippedEmailProps) {

  // ── Safe helpers ────────────────────────────────────────────────────────────
  // query.graph returns BigNumber objects { value: "998", precision: 20 }
  // for all numeric fields. These helpers convert everything to safe primitives
  // before rendering, preventing "Objects are not valid as a React child" errors.

  const safeNum = (val: any): number => {
    if (val === null || val === undefined) return 0
    if (typeof val === "number") return val
    if (typeof val === "string") return parseFloat(val) || 0
    if (typeof val === "object" && "value" in val) return parseFloat(val.value) || 0
    return Number(val) || 0
  }

  const str = (val: any): string => {
    if (val === null || val === undefined) return ""
    if (typeof val === "object" && "value" in val) return String(parseFloat(val.value) || 0)
    return String(val)
  }

  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: order.currency_code || "INR",
  })

  const formatPrice = (val: any): string => formatter.format(safeNum(val))

  // ── Derived values ──────────────────────────────────────────────────────────
  const brandColor = storePrimaryColor || BRAND_COLOR

  const customerName = str(
    order.customer?.first_name ||
    order.shipping_address?.first_name ||
    "there"
  )

  const baseDate = shippedAt ? new Date(shippedAt) : new Date()
  const estimatedDelivery = new Date(baseDate)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDeliveryDays)
  const deliveryDateStr = estimatedDelivery.toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric",
  })

  const shippedDateStr = shippedAt
    ? new Date(shippedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null

  const trackOrderUrl = storeUrl
    ? `${storeUrl}/order/${order.id}`
    : `https://junooni.com/in/order/${order.id}`

  const contactUrl = storeUrl
    ? `${storeUrl}/pages/contact`
    : "https://junooni.com/in/contact-us"

  const shortLogoUrl = "https://junooni.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FJUNOONI_logo.703fd026.ico&w=256&q=75"
  const fullLogoUrl  = "https://files.junooni.com/junooni-files/junooni_logo_brand_color%20(2)-01K8SXB0AC1NWQV3YQJ5B4N942.png"

  const resolvedTrackingUrl    = trackingUrl    || order.fulfillments?.[0]?.labels?.[0]?.tracking_url    || null
  const resolvedTrackingNumber = trackingNumber || order.fulfillments?.[0]?.labels?.[0]?.tracking_number || null

  const realItems = (order.items ?? []).filter((i: any) => !i.metadata?.is_cod_fee)
  const codItem   = (order.items ?? []).find((i: any) => i.metadata?.is_cod_fee)

  const getVariantImage = (item: any): string => {
    if (!item.variant) return str(item.thumbnail)
    const vm = item.variant.metadata
    if (vm?.variant_images) {
      try {
        const imgs = typeof vm.variant_images === "string" ? JSON.parse(vm.variant_images) : vm.variant_images
        if (Array.isArray(imgs) && imgs.length > 0) return str(imgs[0])
      } catch {}
    }
    if (vm?.color_images) {
      try {
        const imgs = typeof vm.color_images === "string" ? JSON.parse(vm.color_images) : vm.color_images
        if (Array.isArray(imgs) && imgs.length > 0) {
          const first = imgs[0]
          return str(first?.url || (typeof first === "string" ? first : ""))
        }
      } catch {}
    }
    return str(item.thumbnail)
  }

  const subtotalAmount = safeNum(order.item_total) - safeNum(codItem?.total)

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>🚚 Your order #{str(order.custom_display_id)} is on its way! Track it here.</Preview>
        <Body style={{
          backgroundColor: "#f5f3f0", margin: 0, padding: "32px 16px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}>
          <Container style={{ maxWidth: "520px", margin: "0 auto" }}>

            {/* ── Main Card ── */}
            <Section style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

              {/* Logo */}
              <Section style={{ padding: "28px 32px", textAlign: "center" }}>
                {storeLogo ? (
                  <Img src={storeLogo} alt={storeName || "Store"} height="60"
                    style={{ margin: "0 auto", maxWidth: "280px", objectFit: "contain" }} />
                ) : (
                  <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                    <tbody><tr>
                      <td style={{ verticalAlign: "middle", paddingRight: "12px" }}>
                        <Img src={shortLogoUrl} alt="Junooni" width="40" height="40" />
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <Img src={fullLogoUrl} alt="Junooni" width="140" />
                      </td>
                    </tr></tbody>
                  </table>
                )}
              </Section>

              {/* Hero */}
              <Section style={{ padding: "32px 32px 28px 32px", textAlign: "center", background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)" }}>
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 20px auto" }}>
                  <tbody><tr>
                    <td style={{ width: "64px", height: "64px", backgroundColor: brandColor, borderRadius: "50%", textAlign: "center", verticalAlign: "middle", fontSize: "28px" }}>
                      🚚
                    </td>
                  </tr></tbody>
                </table>

                <Heading style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 8px 0" }}>
                  {"It's on its way, "}{customerName}{"!"}
                </Heading>
                <Text style={{ fontSize: "15px", color: "#666666", margin: "0 0 20px 0", lineHeight: "1.5" }}>
                  Your order has been shipped and is heading to you.
                </Text>

                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                  <tbody><tr>
                    <td style={{ backgroundColor: brandColor, borderRadius: "24px", padding: "10px 24px" }}>
                      <Text style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600", margin: 0, letterSpacing: "0.5px" }}>
                        {"ORDER #"}{str(order.custom_display_id)}
                      </Text>
                    </td>
                  </tr></tbody>
                </table>
              </Section>

              {/* Progress tracker */}
              <Section style={{ backgroundColor: "#fafafa", padding: "24px 32px" }}>
                <table cellPadding={0} cellSpacing={0} width="100%">
                  <tbody><tr>
                    {/* Confirmed */}
                    <td style={{ textAlign: "center", width: "22%" }}>
                      <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                        <tbody><tr><td style={{ width: "36px", height: "36px", backgroundColor: brandColor, borderRadius: "50%", textAlign: "center", verticalAlign: "middle", color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>✓</td></tr></tbody>
                      </table>
                      <Text style={{ fontSize: "10px", color: brandColor, fontWeight: "600", margin: "6px 0 0 0" }}>Confirmed</Text>
                    </td>
                    <td style={{ width: "6%", verticalAlign: "middle", paddingBottom: "18px" }}>
                      <Hr style={{ borderTop: `2px solid ${brandColor}`, margin: 0 }} />
                    </td>
                    {/* Processing */}
                    <td style={{ textAlign: "center", width: "22%" }}>
                      <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                        <tbody><tr><td style={{ width: "36px", height: "36px", backgroundColor: brandColor, borderRadius: "50%", textAlign: "center", verticalAlign: "middle", color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>✓</td></tr></tbody>
                      </table>
                      <Text style={{ fontSize: "10px", color: brandColor, fontWeight: "600", margin: "6px 0 0 0" }}>Processing</Text>
                    </td>
                    <td style={{ width: "6%", verticalAlign: "middle", paddingBottom: "18px" }}>
                      <Hr style={{ borderTop: `2px solid ${brandColor}`, margin: 0 }} />
                    </td>
                    {/* Shipped — active */}
                    <td style={{ textAlign: "center", width: "22%" }}>
                      <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                        <tbody><tr><td style={{ width: "36px", height: "36px", backgroundColor: brandColor, borderRadius: "50%", textAlign: "center", verticalAlign: "middle", color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>✓</td></tr></tbody>
                      </table>
                      <Text style={{ fontSize: "10px", color: brandColor, fontWeight: "700", margin: "6px 0 0 0" }}>Shipped ✦</Text>
                    </td>
                    <td style={{ width: "6%", verticalAlign: "middle", paddingBottom: "18px" }}>
                      <Hr style={{ borderTop: "2px dashed #e0e0e0", margin: 0 }} />
                    </td>
                    {/* Delivered */}
                    <td style={{ textAlign: "center", width: "16%" }}>
                      <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                        <tbody><tr><td style={{ width: "36px", height: "36px", backgroundColor: "#ffffff", border: "2px solid #e0e0e0", borderRadius: "50%", textAlign: "center", verticalAlign: "middle", color: "#999999", fontSize: "13px", fontWeight: "600" }}>4</td></tr></tbody>
                      </table>
                      <Text style={{ fontSize: "10px", color: "#999999", fontWeight: "500", margin: "6px 0 0 0" }}>Delivered</Text>
                    </td>
                  </tr></tbody>
                </table>
              </Section>

              {/* Tracking card */}
              {resolvedTrackingUrl && (
                <Section style={{ padding: "0 24px 16px 24px" }}>
                    <Section
                    style={{
                        padding: "20px 24px",
                        backgroundColor: "#fff8f5",
                        border: `2px solid ${brandColor}30`,
                        borderRadius: "12px",
                    }}
                    >
                    <Row>
                        <Column style={{ verticalAlign: "middle" }}>
                        <Text
                            style={{
                            fontSize: "12px",
                            color: "#888888",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            margin: "0 0 4px 0",
                            }}
                        >
                            Tracking Number
                        </Text>
                        <Text
                            style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                            margin: 0,
                            fontFamily: "monospace",
                            }}
                        >
                            {str(resolvedTrackingNumber) || "Available soon"}
                        </Text>
                        </Column>
                        <Column style={{ textAlign: "right", verticalAlign: "middle" }}>
                        <Link
                            href={resolvedTrackingUrl}
                            style={{
                            display: "inline-block",
                            backgroundColor: brandColor,
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: "700",
                            textDecoration: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            letterSpacing: "0.2px",
                            }}
                        >
                            Track Package →
                        </Link>
                        </Column>
                    </Row>
                    </Section>
                </Section>
                )}

              {/* Dates */}
              <Section style={{ padding: "20px 32px", borderBottom: "1px solid #f0f0f0" }}>
                <Row>
                  <Column>
                    <Text style={{ fontSize: "11px", color: "#888888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>
                      Estimated Delivery
                    </Text>
                    <Text style={{ fontSize: "15px", color: "#1a1a1a", fontWeight: "600", margin: 0 }}>
                      {deliveryDateStr}
                    </Text>
                  </Column>
                  {shippedDateStr && (
                    <Column style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "11px", color: "#888888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>
                        Shipped On
                      </Text>
                      <Text style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: "600", margin: 0 }}>
                        {shippedDateStr}
                      </Text>
                    </Column>
                  )}
                </Row>
              </Section>

              {/* Items */}
              <Section style={{ padding: "24px 32px" }}>
                <Text style={{ fontSize: "11px", color: "#888888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px 0" }}>
                  {"Items Shipped ("}{String(realItems.length)}{")"}
                </Text>

                {realItems.map((item: any, index: number) => (
                  <Section key={str(item.id)}>
                    <Row style={{ paddingBottom: "16px", paddingTop: index > 0 ? "16px" : "0" }}>
                      <Column style={{ width: "72px", verticalAlign: "top" }}>
                        <Img
                          src={getVariantImage(item)}
                          alt={str(item.product_title)}
                          width="72" height="72"
                          style={{ borderRadius: "10px", backgroundColor: "#f8f8f8", objectFit: "cover" }}
                        />
                      </Column>
                      <Column style={{ paddingLeft: "16px", verticalAlign: "top" }}>
                        <Text style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", margin: "0 0 4px 0" }}>
                          {str(item.product_title)}
                        </Text>
                        <Text style={{ fontSize: "12px", color: "#888888", margin: "0 0 8px 0" }}>
                          {str(item.variant_title)}{" · Qty: "}{String(safeNum(item.quantity))}
                        </Text>
                        <Text style={{ fontSize: "14px", fontWeight: "700", color: brandColor, margin: 0 }}>
                          {formatPrice(item.total)}
                        </Text>
                      </Column>
                    </Row>
                    {index < realItems.length - 1 && (
                      <Hr style={{ borderTop: "1px solid #f0f0f0", margin: 0 }} />
                    )}
                  </Section>
                ))}
              </Section>

              {/* Totals */}
              <Section style={{ padding: "20px 32px", backgroundColor: "#fafafa" }}>
                <Row style={{ paddingBottom: "8px" }}>
                  <Column>
                    <Text style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Subtotal</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={{ fontSize: "13px", color: "#1a1a1a", margin: 0 }}>
                      {formatPrice(subtotalAmount)}
                    </Text>
                  </Column>
                </Row>

                {(order.shipping_methods ?? []).map((method: any) => (
                  <Row style={{ paddingBottom: "8px" }} key={str(method.id)}>
                    <Column>
                      <Text style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Shipping</Text>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "13px", color: "#1a1a1a", margin: 0 }}>
                        {safeNum(method.total) === 0 ? "Free" : formatPrice(method.total)}
                      </Text>
                    </Column>
                  </Row>
                ))}

                {codItem && (
                  <Row style={{ paddingBottom: "8px" }}>
                    <Column>
                      <Text style={{ fontSize: "13px", color: "#666666", margin: 0 }}>Cash on Delivery Fee</Text>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "13px", color: "#1a1a1a", margin: 0 }}>
                        {formatPrice(codItem.total)}
                      </Text>
                    </Column>
                  </Row>
                )}

                <Hr style={{ borderTop: "1px solid #e0e0e0", margin: "12px 0" }} />

                <Row>
                  <Column>
                    <Text style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Total</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={{ fontSize: "17px", fontWeight: "700", color: brandColor, margin: 0 }}>
                      {formatPrice(order.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Shipping address */}
              <Section style={{ padding: "24px 32px", borderTop: "1px solid #f0f0f0" }}>
                <Text style={{ fontSize: "11px", color: "#888888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                  Delivering To
                </Text>
                <Text style={{ fontSize: "13px", color: "#444444", margin: 0, lineHeight: "1.6" }}>
                  {str(order.shipping_address?.first_name)}{" "}{str(order.shipping_address?.last_name)}
                  <br />
                  {str(order.shipping_address?.address_1)}
                  <br />
                  {str(order.shipping_address?.city)}{", "}{str(order.shipping_address?.province)}{" "}{str(order.shipping_address?.postal_code)}
                </Text>
              </Section>

              {/* CTA */}
              <Section style={{ padding: "8px 32px 28px 32px", textAlign: "center" }}>
                <Link
                  href={resolvedTrackingUrl || trackOrderUrl}
                  style={{ display: "inline-block", background: `linear-gradient(135deg, ${brandColor} 0%, #ac1900 100%)`, color: "#ffffff", fontSize: "14px", fontWeight: "700", textDecoration: "none", padding: "14px 36px", borderRadius: "10px", letterSpacing: "0.3px" }}
                >
                  🚚 Track My Order
                </Link>
                <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0 0" }}>
                  {"Or view order details at "}
                  <Link href={trackOrderUrl} style={{ color: brandColor, textDecoration: "none" }}>
                    your order page
                  </Link>
                </Text>
              </Section>

            </Section>

            {/* Help */}
            <Section style={{ padding: "28px 32px", textAlign: "center" }}>
              <Text style={{ fontSize: "13px", color: "#666666", margin: "0 0 4px 0" }}>
                Questions about your shipment?
              </Text>
              <Link href={contactUrl} style={{ fontSize: "13px", color: brandColor, fontWeight: "600", textDecoration: "none" }}>
                Contact Support
              </Link>
            </Section>

            {/* Footer — Junooni marketplace only */}
            {!storeLogo && (
              <>
                <Section style={{ textAlign: "center", paddingBottom: "16px" }}>
                  <Link href="https://junooni.com/in/orders-shipping" style={{ fontSize: "11px", color: "#888888", textDecoration: "none", margin: "0 10px" }}>Shipping Info</Link>
                  <Link href="https://junooni.com/in/refund-exchange"  style={{ fontSize: "11px", color: "#888888", textDecoration: "none", margin: "0 10px" }}>Returns</Link>
                  <Link href="https://junooni.com/in/product-care"     style={{ fontSize: "11px", color: "#888888", textDecoration: "none", margin: "0 10px" }}>Product Care</Link>
                </Section>

                <Section style={{ textAlign: "center", paddingBottom: "32px" }}>
                  <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 16px auto" }}>
                    <tbody><tr>
                      <td style={{ padding: "0 8px" }}>
                        <Link href="https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0">
                          <Img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="22" height="22" style={{ opacity: 0.9 }} />
                        </Link>
                      </td>
                      <td style={{ padding: "0 8px" }}>
                        <Link href="https://www.facebook.com/p/Junooni-61577994639087">
                          <Img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="22" height="22" style={{ opacity: 0.9 }} />
                        </Link>
                      </td>
                    </tr></tbody>
                  </table>
                  <Text style={{ fontSize: "11px", color: "#999999", margin: "0 0 4px 0" }}>
                    {"© "}{String(new Date().getFullYear())}{" Junooni · India's #1 Creator Merch Marketplace"}
                  </Text>
                  <Text style={{ fontSize: "10px", color: "#bbbbbb", margin: 0 }}>
                    <Link href="https://junooni.com/in/terms-condition" style={{ color: "#bbbbbb", textDecoration: "none" }}>Terms</Link>
                    {" · "}
                    <Link href="https://junooni.com/in/contact-us" style={{ color: "#bbbbbb", textDecoration: "none" }}>Contact</Link>
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

export const orderShippedEmail = (props: OrderShippedEmailProps) => (
  <OrderShippedEmailComponent {...props} />
)

// ── Mock preview ──────────────────────────────────────────────────────────────
const mockOrder = {
  order: {
    id: "order_01M2MXQMEWG04EK5DH3S0GX8WD",
    custom_display_id: "FRLE0",
    email: "abhi.iyengar@gmail.com",
    currency_code: "inr",
    total: 998,
    item_total: 998,
    shipping_total: 0,
    tax_total: 47.52,
    items: [
      {
        id: "ordli_01",
        product_title: "Average Liberal Crew T-Shirt",
        variant_title: "Black / L",
        thumbnail: "https://files.junooni.com/junooni-files/mockup-front-black-01M1XG74T087HFAGJ4EKA6TTKK.png",
        quantity: 2,
        total: 998,
        metadata: {},
        variant: { metadata: {} },
      },
    ],
    shipping_address: {
      first_name: "Abhishek", last_name: "Iyengar",
      address_1: "No 89 Satyanarayana Layout, Basaweshwaranagar",
      city: "Bengaluru", province: "Karnataka", postal_code: "560079",
    },
    shipping_methods: [{ id: "ordsm_01", name: "Free Shipping", total: 0 }],
    fulfillments: [{
      shipped_at: "2026-09-17T11:33:07.666Z",
      labels: [{ tracking_number: "46576810417826", tracking_url: "https://www.delhivery.com/track-v2/package/46576810417826" }],
    }],
    customer: { first_name: "Abhishek", last_name: "Iyengar", email: "abhi.iyengar@gmail.com" },
  },
}

// @ts-ignore
export default () => (
  <OrderShippedEmailComponent
    {...mockOrder}
    shippedAt={mockOrder.order.fulfillments?.[0]?.shipped_at ?? null}
    storeLogo={null} storeName={null} storePrimaryColor={null} storeUrl={null}
  />
)
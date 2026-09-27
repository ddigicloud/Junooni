import {
  Text,
  Container,
  Html,
  Img,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
  Hr,
  Heading,
} from "@react-email/components"
import * as React from "react"

const BRAND_COLOR = "#e65100"

type OrderCancelOtpEmailProps = {
  otp: string
  order_id: string | number
  customer_name?: string
  storeLogo: string
  storeName: string
  storePrimaryColor: string
  storeUrl: string
}

function OrderCancelOtpEmailComponent({
  otp,
  order_id,
  customer_name,
  storeLogo,
  storeName,
  storePrimaryColor,
  storeUrl,
}: OrderCancelOtpEmailProps) {
  const brandColor   = storePrimaryColor || BRAND_COLOR
  const contactUrl   = `${storeUrl}/pages/contact`

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>{"Your cancellation code for Order #"}{String(order_id)}{": "}{otp}</Preview>
        <Body style={{
          backgroundColor: "#f5f3f0",
          margin: 0,
          padding: "32px 16px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}>
          <Container style={{ maxWidth: "520px", margin: "0 auto" }}>

            {/* ── Main Card ── */}
            <Section style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>

              {/* Logo */}
              <Section style={{ padding: "28px 32px", textAlign: "center" }}>
                <Img
                  src={storeLogo}
                  alt={storeName}
                  height="60"
                  style={{ margin: "0 auto", maxWidth: "280px", objectFit: "contain" }}
                />
              </Section>

              {/* Hero */}
              <Section style={{
                padding: "32px 32px 28px 32px",
                textAlign: "center",
                background: "linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)",
              }}>
                {/* Warning circle */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 20px auto" }}>
                  <tbody><tr>
                    <td style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#fef2f2",
                      border: "2px solid #fecaca",
                      borderRadius: "50%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontSize: "28px",
                    }}>
                      ⚠️
                    </td>
                  </tr></tbody>
                </table>

                <Heading style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  margin: "0 0 8px 0",
                }}>
                  {"Cancel Order #"}{String(order_id)}{"?"}
                </Heading>

                <Text style={{
                  fontSize: "14px",
                  color: "#666666",
                  margin: "0 0 20px 0",
                  lineHeight: "1.5",
                }}>
                  {"Hi "}{customer_name || "there"}{", use the code below to confirm your cancellation request."}
                </Text>

                {/* Order badge */}
                <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
                  <tbody><tr>
                    <td style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "24px",
                      padding: "10px 24px",
                    }}>
                      <Text style={{
                        color: "#b91c1c",
                        fontSize: "13px",
                        fontWeight: "600",
                        margin: 0,
                        letterSpacing: "0.5px",
                      }}>
                        {"ORDER #"}{String(order_id)}
                      </Text>
                    </td>
                  </tr></tbody>
                </table>
              </Section>

              {/* OTP Block */}
              <Section style={{ padding: "28px 32px" }}>

                <Text style={{
                  fontSize: "11px",
                  color: "#888888",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 12px 0",
                  textAlign: "center",
                }}>
                  Your verification code
                </Text>

                <div style={{
                  backgroundColor: "#fff8f5",
                  border: `2px dashed ${brandColor}`,
                  borderRadius: "12px",
                  padding: "28px 0",
                  textAlign: "center",
                  marginBottom: "20px",
                }}>
                  <Text style={{
                    fontSize: "48px",
                    fontWeight: "800",
                    color: brandColor,
                    letterSpacing: "14px",
                    margin: 0,
                    fontFamily: "monospace",
                  }}>
                    {otp}
                  </Text>
                  <Text style={{
                    color: "#999999",
                    fontSize: "12px",
                    margin: "10px 0 0",
                  }}>
                    {"Expires in "}
                    <strong>10 minutes</strong>
                  </Text>
                </div>

                {/* Warning note */}
                <div style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "24px",
                }}>
                  <Text style={{
                    fontSize: "13px",
                    color: "#b91c1c",
                    margin: 0,
                    lineHeight: "1.5",
                  }}>
                    {"⚠️ Cancellations are "}
                    <strong>permanent</strong>
                    {" and cannot be reversed. If you did not request this, ignore this email — your order is safe."}
                  </Text>
                </div>

                <Hr style={{ borderTop: "1px solid #f0f0f0", margin: "0 0 20px" }} />

                <Text style={{
                  fontSize: "12px",
                  color: "#bbbbbb",
                  margin: 0,
                  lineHeight: "1.6",
                }}>
                  {"This code was requested for order "}
                  <strong>{"#"}{String(order_id)}</strong>
                  {". If you need help, "}
                  <Link href={contactUrl} style={{ color: brandColor, textDecoration: "none" }}>
                    contact our support
                  </Link>
                  {"."}
                </Text>

                <Text style={{ fontSize: "12px", color: "#bbbbbb", margin: "8px 0 0" }}>
                  {"— "}{storeName}
                </Text>

              </Section>

            </Section>

            {/* Help */}
            <Section style={{ padding: "28px 32px", textAlign: "center" }}>
              <Text style={{ fontSize: "13px", color: "#666666", margin: "0 0 4px 0" }}>
                Questions about your order?
              </Text>
              <Link
                href={contactUrl}
                style={{ fontSize: "13px", color: brandColor, fontWeight: "600", textDecoration: "none" }}
              >
                Contact Support
              </Link>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const orderCancelOtpEmail = (props: OrderCancelOtpEmailProps) => (
  <OrderCancelOtpEmailComponent {...props} />
)

// ── Mock preview ──────────────────────────────────────────────────────────────
export default () => (
  <OrderCancelOtpEmailComponent
    otp="482910"
    order_id="BX3R6"
    customer_name="Priya"
    storeLogo="https://files.junooni.com/junooni-files/junooni_logo_brand_color%20(2)-01K8SXB0AC1NWQV3YQJ5B4N942.png"
    storeName="Tanishk Bagchi Official"
    storePrimaryColor="#7c3aed"
    storeUrl="https://tanishkbagchi.junooni.com"
  />
)
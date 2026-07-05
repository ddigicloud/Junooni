import * as React from "react"
import {
  Html, Head, Body, Container,
  Text, Hr, Preview, Heading
} from "@react-email/components"

interface Props {
  first_name?: string
  otp: string
  email: string
}

export const creatorOtpEmail = ({ first_name, otp, email }: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Your JUNOONI verification code: {otp}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5" }}>
        <Container style={{
          maxWidth: 560,
          margin: "40px auto",
          backgroundColor: "#fff",
          padding: "40px 32px",
          borderRadius: 8,
        }}>
          <Heading style={{ fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 8 }}>
            Hey {first_name || "Creator"} 👋
          </Heading>

          <Text style={{ color: "#555", lineHeight: "1.6" }}>
            We received a request to link a new password-based login to your
            existing JUNOONI creator account (<strong>{email}</strong>).
          </Text>

          <Text style={{ color: "#555", lineHeight: "1.6" }}>
            Enter this code to verify it's really you:
          </Text>

          {/* OTP Block */}
          <div style={{
            backgroundColor: "#fff8f5",
            border: "2px dashed #e65100",
            borderRadius: 10,
            padding: "24px 0",
            textAlign: "center" as const,
            margin: "24px 0",
          }}>
            <Text style={{
              fontSize: 42,
              fontWeight: "bold",
              color: "#e65100",
              letterSpacing: 12,
              margin: 0,
              fontFamily: "monospace",
            }}>
              {otp}
            </Text>
            <Text style={{ color: "#999", fontSize: 13, margin: "8px 0 0" }}>
              This code expires in <strong>10 minutes</strong>
            </Text>
          </div>

          <Text style={{ color: "#555", lineHeight: "1.6" }}>
            Once verified, you'll be able to sign in with either Google
            or your email & password — whichever is convenient.
          </Text>

          <Hr style={{ margin: "28px 0", borderColor: "#eee" }} />

          <Text style={{ color: "#bbb", fontSize: 12 }}>
            If you did <strong>not</strong> make this request, ignore this
            email — your account is safe and nothing has changed.
          </Text>

          <Text style={{ color: "#bbb", fontSize: 12, marginTop: 4 }}>
            — The JUNOONI Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
import * as React from "react"
import {
  Html, Head, Body, Container,
  Text, Button, Hr, Preview, Heading
} from "@react-email/components"

interface Props {
  first_name: string
  email: string
  confirm_url: string
}

export const accountMergeConfirmationEmail = ({
  first_name,
  email,
  confirm_url,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Did you just create a JUNOONI account?</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5" }}>
        <Container style={{
          maxWidth: 560,
          margin: "40px auto",
          backgroundColor: "#fff",
          padding: "40px 32px",
          borderRadius: 8,
        }}>
          <Heading style={{ fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 8 }}>
            Hey {first_name} 👋
          </Heading>

          <Text style={{ color: "#555", lineHeight: "1.6" }}>
            Someone just created a JUNOONI account using{" "}
            <strong>{email}</strong> — the same email you previously
            used to place orders.
          </Text>

          <Text style={{ color: "#555", lineHeight: "1.6" }}>
            If that was <strong>you</strong>, click the button below.
            We'll instantly move all your previous order history and
            saved addresses into your new account.
          </Text>

          <Button
            href={confirm_url}
            style={{
              backgroundColor: "#e65100",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 6,
              display: "inline-block",
              marginTop: 8,
              marginBottom: 8,
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Yes, that was me — merge my orders
          </Button>

          <Text style={{ color: "#999", fontSize: 13 }}>
            This link expires in <strong>24 hours</strong>. If it
            expires, you can request a new one from your account page.
          </Text>

          <Hr style={{ margin: "28px 0", borderColor: "#eee" }} />

          <Text style={{ color: "#bbb", fontSize: 12 }}>
            If you did NOT create this account, please ignore this email.
            Your previous orders are safe and no action is needed.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
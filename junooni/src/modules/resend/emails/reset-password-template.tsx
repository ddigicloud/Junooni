import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Row,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
  Button
} from "@react-email/components"

type ResetPasswordEmailProps = {
  url: string
  email?: string
}

function ResetPasswordEmailComponent({ url, email }: ResetPasswordEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Reset your Junooni account password</Preview>
        <Body className="bg-white my-10 mx-auto w-full max-w-2xl">
          {/* Header */}
          <Section className="bg-[#e65100] text-white px-6 py-5">
            <Row>
              <Column align="center">
                <Text className="text-2xl font-bold tracking-wide m-0">JUNOONI</Text>
                <Text className="text-xs uppercase tracking-widest m-0 mt-1">Premium Lifestyle</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Container className="p-8">
            <Heading className="text-2xl font-bold text-center text-gray-800">
              Reset Your Password
            </Heading>
            
            <Text className="text-center text-gray-600 mt-3">
              We received a request to reset the password for your Junooni account
              {email ? ` (${email})` : ''}. 
              Click the button below to set a new password:
            </Text>

            {/* Reset Password Button */}
            <Section className="text-center my-8">
              <Button
                href={url}
                className="bg-[#e65100] text-white py-3 px-6 rounded font-semibold no-underline inline-block"
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-gray-600 mt-6">
              This password reset link will expire in 1 hour. If you didn't request a password reset, 
              you can safely ignore this email.
            </Text>

            {/* Security Notice */}
            <Section className="mt-8 bg-gray-50 rounded-lg p-6">
              <Heading className="text-lg font-semibold text-gray-800 mb-2">
                Security Tips
              </Heading>
              <Text className="text-gray-600 text-sm m-0">
                • Create a strong password that's at least 8 characters long
              </Text>
              <Text className="text-gray-600 text-sm m-0">
                • Use a combination of letters, numbers, and symbols
              </Text>
              <Text className="text-gray-600 text-sm m-0">
                • Don't reuse passwords from other websites
              </Text>
              <Text className="text-gray-600 text-sm m-0 mt-4">
                For your security, Junooni will never ask for your password via email or phone.
              </Text>
            </Section>

            {/* Manual Link Info */}
            <Section className="mt-8 border-t border-gray-200 pt-6">
              <Text className="text-gray-600 text-sm">
                If the button above doesn't work, copy and paste this URL into your browser:
              </Text>
              <Text className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-3 rounded border border-gray-200 my-2">
                {url}
              </Text>
            </Section>
          </Container>

          {/* Footer */}
          <Section className="bg-gray-50 p-6 mt-10">
            <Text className="text-center text-gray-500 text-sm">
              If you didn't request this password reset, please contact our support team at support@junooni.com.
            </Text>
            <Text className="text-center text-gray-400 text-xs mt-4">
              © {new Date().getFullYear()} Junooni, Inc. All rights reserved.
            </Text>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const resetPasswordEmail = (props: ResetPasswordEmailProps) => (
  <ResetPasswordEmailComponent {...props} />
)

// Mock data for preview
const mockResetData = {
  url: "http://localhost:8000/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMDFBQkNERUYiLCJleHAiOjE3MTQ5ODkwMzB9.a1b2c3d4e5f6g7h8i9j0&email=customer@example.com",
  email: "customer@example.com"
}

// Default export for previewing the email
export default () => <ResetPasswordEmailComponent {...mockResetData} />
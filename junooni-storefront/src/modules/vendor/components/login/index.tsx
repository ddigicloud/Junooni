// src/modules/vendors/components/login/index.tsx

"use client"

import { useFormState } from "react-dom"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { VendorView } from "@modules/vendor/templates/vendor-onboarding-template"

type Props = {
  setCurrentView: (view: VendorView) => void
}

async function loginVendor(prevState: any, formData: FormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/vendors/login`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return error.message
    }

    return null
  } catch (error) {
    return "An error occurred during login"
  }
}

const VendorLogin = ({ setCurrentView }: Props) => {
  const [message, formAction] = useFormState(loginVendor, null)

  return (
    <div className="max-w-sm flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Welcome Back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to your vendor account
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter your email address"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            title="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>
        <ErrorMessage error={message} />
        <SubmitButton className="w-full mt-6">Sign in</SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a vendor yet?{" "}
        <button
          onClick={() => setCurrentView("REGISTER")}
          className="underline"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default VendorLogin
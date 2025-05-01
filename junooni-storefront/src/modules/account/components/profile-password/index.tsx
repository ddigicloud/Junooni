"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import { Lock } from "lucide-react"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updateCustomerPassword = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const oldPassword = formData.get("old_password") as string
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    // Validate that passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "New password and confirmation do not match",
      }
    }

    try {
      // Update the customer password
      await updateCustomer({
        password: newPassword,
        old_password: oldPassword,
      })
      return { success: true, error: null }
    } catch (error: any) {
      // Handle specific password errors
      if (
        error.toString().toLowerCase().includes("invalid") ||
        error.toString().toLowerCase().includes("incorrect")
      ) {
        return {
          success: false,
          error: "Current password is incorrect",
        }
      }
      return {
        success: false,
        error: error.toString(),
      }
    }
  }

  const [state, formAction] = useActionState(updateCustomerPassword, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#fff2e5] flex items-center justify-center">
              <Lock size={16} className="text-[#e65100]" />
            </div>
            <span className="italic text-gray-700">
              Password hidden for security
            </span>
          </div>
        }
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="space-y-6">
          <Input
            label="Current password"
            name="old_password"
            required
            type="password"
            data-testid="old-password-input"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="New password"
              type="password"
              name="new_password"
              required
              data-testid="new-password-input"
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirm_password"
              required
              data-testid="confirm-password-input"
            />
          </div>
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { updatePasswordWithToken } from "@lib/reset-password"
import { sdk } from "@lib/config"

const ResetPassword = () => {
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [isValid, setIsValid] = useState(true)

  // Extract token/email from URL on mount using URLSearchParams
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = queryParams.get("token")
    const emailFromUrl = queryParams.get("email")

    if (!tokenFromUrl || !emailFromUrl) {
      setIsValid(false)
      setMessage({
        type: "error",
        text: "Invalid or missing reset information. Please request a new password reset link.",
      })
    } else {
      setToken(tokenFromUrl)
      setEmail(emailFromUrl)
    }
  }, [])




  const validatePassword = () => {
    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long." })
      return false
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      return false
    }
    setMessage(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token || !email) {
      setMessage({ type: "error", text: "Missing token or email." })
      return
    }

    if (!validatePassword()) return

    setIsSubmitting(true)
    console.log("Payload being sent:", {
        email,
        password,
        token,
      })

    try {
      
      await updatePasswordWithToken("customer", email, password, token)

      setMessage({
        type: "success",
        text: "Password reset successfully. Redirecting to login...",
      })

      setTimeout(() => router.push("/account"), 3000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Couldn't reset password. Try requesting a new link.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isValid) {
    return (
      <div className="p-4 text-red-600">
        {message?.text}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto">
      <h2 className="mb-4 text-xl font-semibold">Reset Your Password</h2>

      {message && (
        <div className={`mb-4 text-${message.type === "error" ? "red" : "green"}-600`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label>Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="mt-1 text-sm">
          {showPassword ? "Hide" : "Show"} Password
        </button>
      </div>

      <div className="mb-4">
        <label>Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="mt-1 text-sm">
          {showConfirmPassword ? "Hide" : "Show"} Confirm Password
        </button>
      </div>

      <button
        type="submit"
        className="px-4 py-2 text-white bg-orange-600 rounded disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}

export default ResetPassword

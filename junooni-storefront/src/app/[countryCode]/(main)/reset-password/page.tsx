// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { updatePasswordWithToken } from "@lib/reset-password"
// import { sdk } from "@lib/config"

// const ResetPassword = () => {
//   const router = useRouter()

//   const [token, setToken] = useState<string | null>(null)
//   const [email, setEmail] = useState<string | null>(null)
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
//   const [isValid, setIsValid] = useState(true)

//   // Extract token/email from URL on mount using URLSearchParams
//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search)
//     const tokenFromUrl = queryParams.get("token")
//     const emailFromUrl = queryParams.get("email")

//     if (!tokenFromUrl || !emailFromUrl) {
//       setIsValid(false)
//       setMessage({
//         type: "error",
//         text: "Invalid or missing reset information. Please request a new password reset link.",
//       })
//     } else {
//       setToken(tokenFromUrl)
//       setEmail(emailFromUrl)
//     }
//   }, [])




//   const validatePassword = () => {
//     if (password.length < 8) {
//       setMessage({ type: "error", text: "Password must be at least 8 characters long." })
//       return false
//     }
//     if (password !== confirmPassword) {
//       setMessage({ type: "error", text: "Passwords do not match." })
//       return false
//     }
//     setMessage(null)
//     return true
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     if (!token || !email) {
//       setMessage({ type: "error", text: "Missing token or email." })
//       return
//     }

//     if (!validatePassword()) return

//     setIsSubmitting(true)
//     console.log("Payload being sent:", {
//         email,
//         password,
//         token,
//       })

//     try {
      
//       await updatePasswordWithToken("customer", email, password, token)

//       setMessage({
//         type: "success",
//         text: "Password reset successfully. Redirecting to login...",
//       })

//       setTimeout(() => router.push("/account"), 3000)
//     } catch (error: any) {
//       setMessage({
//         type: "error",
//         text: error.message || "Couldn't reset password. Try requesting a new link.",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (!isValid) {
//     return (
//       <div className="p-4 text-red-600">
//         {message?.text}
//       </div>
//     )
//   }

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto">
//       <h2 className="mb-4 text-xl font-semibold">Reset Your Passwordddd</h2>

//       {message && (
//         <div className={`mb-4 text-${message.type === "error" ? "red" : "green"}-600`}>
//           {message.text}
//         </div>
//       )}

//       <div className="mb-4">
//         <label>Password</label>
//         <input
//           type={showPassword ? "text" : "password"}
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//         <button type="button" onClick={() => setShowPassword(!showPassword)} className="mt-1 text-sm">
//           {showPassword ? "Hide" : "Show"} Password
//         </button>
//       </div>

//       <div className="mb-4">
//         <label>Confirm Password</label>
//         <input
//           type={showConfirmPassword ? "text" : "password"}
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="mt-1 text-sm">
//           {showConfirmPassword ? "Hide" : "Show"} Confirm Password
//         </button>
//       </div>

//       <button
//         type="submit"
//         className="px-4 py-2 text-white bg-orange-600 rounded disabled:opacity-50"
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Resetting..." : "Reset Password"}
//       </button>
//     </form>
//   )
// }

// export default ResetPassword


"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import loginbanner from "@assets/login-banner.png"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

// ─── Shared sub-components (mirrors Login page) ──────────────────────────────

const EnhancedInput = ({
  id,
  name,
  type,
  label,
  placeholder,
  required = false,
  value,
  onChange,
  icon: Icon,
  rightElement,
  error,
}: {
  id: string
  name: string
  type: string
  label: string
  placeholder: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: any
  rightElement?: React.ReactNode
  error?: boolean
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 md:text-gray-200">
      {label}
      {required && <span className="text-[#e65100] ml-1 md:text-gray-200">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 pointer-events-none">
          <Icon
            size={18}
            className={`${error ? "text-red-400" : "text-gray-400"} transition-colors duration-200`}
          />
        </div>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full h-12 px-4 ${Icon ? "pl-11" : ""} ${rightElement ? "pr-11" : ""}
          bg-white border ${error ? "border-red-300" : "border-gray-300"} rounded-lg
          text-gray-900 placeholder-gray-400 text-sm
          focus:outline-none focus:border-[#e65100] focus:ring-4 focus:ring-orange-50
          transition-all duration-200
          hover:border-gray-400
        `}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
          {rightElement}
        </div>
      )}
    </div>
  </div>
)

const EnhancedButton = ({
  children,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
}: {
  children: React.ReactNode
  type?: "button" | "submit"
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className="relative w-full h-12 rounded-lg font-semibold text-sm transition-all duration-200
      focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed
      flex items-center justify-center gap-2
      bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm hover:shadow-md focus:ring-orange-100"
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-inherit">
        <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
      </div>
    )}
    <div className={`${loading ? "opacity-0" : "opacity-100"} flex flex-row items-center gap-2`}>
      {children}
    </div>
  </button>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const ResetPassword = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (!tokenFromUrl) {
      setIsValid(false)
      setMessage({
        type: "error",
        text: "Invalid or missing reset information. Please request a new password reset link.",
      })
    } else {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const validatePassword = () => {
    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" })
      return false
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return false
    }
    setMessage(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword() || !token) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
            }),
          },
          body: JSON.stringify({ password }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to reset password. The link may have expired.")
      }

      setMessage({
        type: "success",
        text: "Your password has been successfully reset. Redirecting you to login…",
      })

      setTimeout(() => {
        router.push("/account")
      }, 3000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to reset password. The link may have expired.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Shared page shell (background identical to Login) ──────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Mobile background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 md:hidden">
        <div className="absolute top-0 left-0 w-64 h-64 -mt-32 -ml-32 bg-orange-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 -mb-48 -mr-48 bg-purple-200 rounded-full w-96 h-96 opacity-20 blur-3xl" />
      </div>

      {/* Desktop banner — same as Login */}
      <div
        className="absolute inset-0 hidden bg-center bg-no-repeat bg-cover md:block"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%), url(${loginbanner.src})`,
        }}
      />
      <div className="absolute inset-0 hidden md:block bg-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 py-6 md:px-0 md:py-0">
        {children}
      </div>
    </div>
  )

  // ── Invalid token state ────────────────────────────────────────────────────
  if (!isValid) {
    return (
      <Shell>
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl md:text-white">
              Link Invalid
            </h1>
            <p className="text-sm text-gray-600 md:text-white/80">
              This password reset link is no longer valid.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-xl md:p-8 rounded-2xl md:bg-white/10 md:border-white/30 md:backdrop-blur-lg space-y-4">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-red-700">{message?.text}</span>
              </div>
            </div>
            <EnhancedButton onClick={() => router.push("/account")}>
              Back to Login <ArrowRight size={18} />
            </EnhancedButton>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Main reset-password form ───────────────────────────────────────────────
  return (
    <Shell>
      <div className="w-full max-w-md mt-8">
        {/* Back link */}
        <button
          onClick={() => router.push("/account")}
          className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700 transition-colors md:mb-6 md:text-white hover:text-gray-900 md:hover:text-gray-200"
        >
          <ArrowRight size={16} className="rotate-180" />
          Back to Login
        </button>

        {/* Header */}
        <div className="mb-6 text-center md:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl md:text-white">
            Reset Your Password
          </h1>
          <p className="text-sm text-gray-600 md:text-white/80">
            Please enter your new password below
          </p>
        </div>

        {/* Card — same style as Login card */}
        <div className="p-6 bg-white border border-gray-200 shadow-xl md:p-8 rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <EnhancedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              error={message?.type === "error"}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-[#e65100] transition-colors p-1 rounded-lg hover:bg-orange-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <p className="!mt-1 text-xs text-gray-500 md:text-gray-300">
              Password must be at least 8 characters long
            </p>

            {/* Confirm Password */}
            <EnhancedInput
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              error={message?.type === "error"}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-[#e65100] transition-colors p-1 rounded-lg hover:bg-orange-50"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Status message */}
            {message && (
              <div
                className={`p-4 rounded-xl border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === "success" ? (
                    <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      message.type === "success" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {message.text}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <EnhancedButton type="submit" loading={isSubmitting}>
                {isSubmitting ? "Resetting Password…" : (
                  <>Reset Password <ArrowRight size={18} /></>
                )}
              </EnhancedButton>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-sm text-center text-gray-700 md:text-white/80">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="text-[#e65100] md:text-orange-300 hover:underline font-medium transition-colors"
          >
            Back to Login
          </button>
        </p>
      </div>
    </Shell>
  )
}

export default ResetPassword
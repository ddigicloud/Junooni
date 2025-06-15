"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { sdk } from "@lib/config"

const ResetPassword = () => {
  const searchParams = useSearchParams()
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

  // Extract token from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
     const emailFromUrl = searchParams.get("email")
     
     if (!tokenFromUrl || !emailFromUrl) {
    setIsValid(false)
    setMessage({ 
      type: "error", 
      text: "Invalid or missing reset information. Please request a new password reset link." 
    })
  } else {
    setToken(tokenFromUrl)
    setEmail(emailFromUrl) // Add a state variable for email
  }
}, [searchParams])

  // Password validation
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword() || !token) return
    
    setIsSubmitting(true)
    setMessage(null)
    
    try {
      // Call SDK to update password using the new method
      await sdk.auth.updateProvider(
        "customer",
        "emailpass",
        {
          // Note: In a real implementation, you might need to extract the email 
          // from the token or from URL parameters if your backend requires it
          email: email, // This should be dynamically set based on your requirements
          password
        },
        token
      )
      
      setMessage({ 
        type: "success", 
        text: "Your password has been successfully reset. You will be redirected to the login page." 
      })
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push("/account")
      }, 3000)
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to reset password. The link may have expired." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show error if token is invalid
  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto p-6">
        <div className="w-full p-4 mb-4 border border-red-100 rounded-md bg-red-50">
          <p className="text-red-700">{message?.text}</p>
        </div>
        <button 
          onClick={() => router.push("/account")}
          className="w-full bg-[#e65100] hover:bg-[#d84315] text-white py-3 rounded-md font-medium transition-colors"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center max-w-md px-4 py-8 mx-auto">
      <h1 className="text-2xl font-bold text-[#e65100] mb-2">Reset Your Password</h1>
      <p className="mb-6 text-center text-gray-600">
        Please enter your new password below
      </p>
      
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-sm text-gray-700">
            New Password<span className="text-[#e65100]">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
              placeholder="••••••••"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.9 4.24c.4-.13.82-.24 1.24-.25C15.57 3.86 19.27 7.1 21.47 12.1c.32.73.32 1.56 0 2.29-.16.36-.33.71-.51 1.05-.18.33-.69.44-1.02.26-.33-.17-.44-.69-.26-1.02.15-.29.29-.58.42-.88.22-.52.22-1.08 0-1.6-1.98-4.51-5.13-7.31-8.76-7.17-.6.02-1.18.13-1.76.32-.34.11-.72-.08-.83-.42-.11-.34.08-.72.42-.83 0 0 .48-.16.73-.22ZM2.78 7.29c.17-.34.67-.48 1.01-.31.34.17.48.67.31 1.01-1.63 3.29-1.87 6.56-.45 9.28 2 3.78 6.02 5.74 10.35 5.23.35-.04.8.23.8.71 0 .35-.28.64-.63.69-4.98.6-9.65-1.73-11.96-6.13-1.62-3.07-1.37-6.77.43-10.42l.14-.06ZM12.02 8.55c.33 0 .66.03.98.1.36.08.59.44.51.8-.08.36-.44.59-.8.51-.57-.13-1.17-.13-1.74 0-.59.14-1.12.42-1.59.83-.29.26-.74.23-1-.06-.26-.29-.23-.74.06-1 .64-.56 1.39-.95 2.2-1.14.46-.03.92-.04 1.38-.04ZM21.4 4.17c.32-.28.8-.25 1.08.07.28.32.25.8-.07 1.08l-17.7 15.3c-.32.28-.8.25-1.08-.07-.28-.32-.25-.8.07-1.08 0 0 17.7-15.3 17.7-15.3Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5c4.44 0 8.13 3.24 10.35 8.21.23.53.23 1.14 0 1.66-2.22 4.98-5.91 8.23-10.35 8.23s-8.13-3.25-10.35-8.21c-.23-.54-.23-1.15 0-1.68C3.87 7.73 7.56 4.5 12 4.5Zm0 2c-3.26 0-6.18 2.58-8.04 6.71-.09.21-.09.39 0 .58C5.82 17.93 8.74 20.5 12 20.5s6.18-2.57 8.04-6.73c.09-.18.09-.39 0-.6C18.18 9.04 15.26 6.5 12 6.5Zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm0-2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>
        
        {/* Confirm Password Field */}
        <div className="flex flex-col">
          <label htmlFor="confirm-password" className="mb-1 text-sm text-gray-700">
            Confirm Password<span className="text-[#e65100]">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
            >
              {showConfirmPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.9 4.24c.4-.13.82-.24 1.24-.25C15.57 3.86 19.27 7.1 21.47 12.1c.32.73.32 1.56 0 2.29-.16.36-.33.71-.51 1.05-.18.33-.69.44-1.02.26-.33-.17-.44-.69-.26-1.02.15-.29.29-.58.42-.88.22-.52.22-1.08 0-1.6-1.98-4.51-5.13-7.31-8.76-7.17-.6.02-1.18.13-1.76.32-.34.11-.72-.08-.83-.42-.11-.34.08-.72.42-.83 0 0 .48-.16.73-.22ZM2.78 7.29c.17-.34.67-.48 1.01-.31.34.17.48.67.31 1.01-1.63 3.29-1.87 6.56-.45 9.28 2 3.78 6.02 5.74 10.35 5.23.35-.04.8.23.8.71 0 .35-.28.64-.63.69-4.98.6-9.65-1.73-11.96-6.13-1.62-3.07-1.37-6.77.43-10.42l.14-.06ZM12.02 8.55c.33 0 .66.03.98.1.36.08.59.44.51.8-.08.36-.44.59-.8.51-.57-.13-1.17-.13-1.74 0-.59.14-1.12.42-1.59.83-.29.26-.74.23-1-.06-.26-.29-.23-.74.06-1 .64-.56 1.39-.95 2.2-1.14.46-.03.92-.04 1.38-.04ZM21.4 4.17c.32-.28.8-.25 1.08.07.28.32.25.8-.07 1.08l-17.7 15.3c-.32.28-.8.25-1.08-.07-.28-.32-.25-.8.07-1.08 0 0 17.7-15.3 17.7-15.3Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5c4.44 0 8.13 3.24 10.35 8.21.23.53.23 1.14 0 1.66-2.22 4.98-5.91 8.23-10.35 8.23s-8.13-3.25-10.35-8.21c-.23-.54-.23-1.15 0-1.68C3.87 7.73 7.56 4.5 12 4.5Zm0 2c-3.26 0-6.18 2.58-8.04 6.71-.09.21-.09.39 0 .58C5.82 17.93 8.74 20.5 12 20.5s6.18-2.57 8.04-6.73c.09-.18.09-.39 0-.6C18.18 9.04 15.26 6.5 12 6.5Zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm0-2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Display any error or success messages */}
        {message && (
          <div className={`p-3 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}
        
        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#e65100] hover:bg-[#d84315] text-white py-3 rounded-md font-medium transition-colors mt-2 disabled:bg-orange-300"
        >
          {isSubmitting ? "Resetting Password..." : "Reset Password"}
        </button>
        
        {/* Back to Login */}
        <p className="mt-4 text-center text-gray-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => router.push("/account/login")}
            className="text-[#e65100] hover:underline font-medium"
          >
            Back to Login
          </button>
        </p>
      </form>
    </div>
  )
}

export default ResetPassword
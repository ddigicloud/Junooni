"use client"

import { useState } from "react"
import { useActionState } from "react"
import { login } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { sdk } from "@lib/config"
import Image from "next/image"
import BrandLogo from "@assets/brand-logo.png"

import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle, AlertCircle } from "lucide-react"

type Props = {
  setCurrentView: (view: string) => void
}

// Move EnhancedInput OUTSIDE the Login component
const EnhancedInput = ({ 
  id, 
  name, 
  type, 
  label, 
  placeholder, 
  required = false, 
  autoComplete, 
  value, 
  onChange, 
  icon: Icon,
  rightElement 
}: {
  id: string
  name: string
  type: string
  label: string
  placeholder: string
  required?: boolean
  autoComplete?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: any
  rightElement?: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-[#e65100] ml-1">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
          <Icon size={16} className="text-gray-400 group-focus-within:text-[#e65100] transition-colors duration-200" />
        </div>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full h-10 px-3 ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} 
          bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400
          focus:outline-none focus:border-[#e65100] focus:ring-2 focus:ring-orange-100
          transition-all duration-200 ease-in-out
          hover:border-gray-300
          group
        `}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightElement}
        </div>
      )}
    </div>
  </div>
)

// Move EnhancedButton OUTSIDE the Login component
const EnhancedButton = ({ 
  children, 
  type = "button", 
  variant = "primary", 
  disabled = false, 
  loading = false,
  onClick,
  className = ""
}: {
  children: React.ReactNode
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}) => {
  const baseClasses = "relative w-full h-10 rounded-lg font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  
  const variants = {
    primary: "bg-gradient-to-r from-[#e65100] to-[#f57c00] hover:from-[#d84315] hover:to-[#ef6c00] text-white shadow-md hover:shadow-lg focus:ring-orange-200 transform hover:scale-[1.01] active:scale-[0.99]",
    secondary: "bg-white border-2 border-gray-200 hover:border-[#e65100] text-gray-700 hover:text-[#e65100] focus:ring-orange-100",
    ghost: "text-[#e65100] hover:bg-orange-50 focus:ring-orange-100"
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </button>
  )
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordView, setForgotPasswordView] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  
  // Add state for controlled inputs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleForgotPassword = () => {
    setForgotPasswordView(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail) {
      setResetMessage({ type: "error", text: "Please enter your email address" })
      return
    }
    
    setIsSubmitting(true)
    setResetMessage(null)
    
    try {
      await sdk.auth.resetPassword("customer", "emailpass", { identifier: resetEmail })
      
      setResetMessage({ 
        type: "success", 
        text: "If an account exists with the specified email, it'll receive instructions to reset the password."
      })
      setResetEmail("")
      
      setTimeout(() => {
        setForgotPasswordView(false)
        setResetMessage(null)
      }, 3000)
    } catch (error: any) {
      setResetMessage({ 
        type: "error", 
        text: error.message || "Failed to send reset email. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginSubmit = async (formData: FormData) => {
    setIsLoginSubmitting(true)
    try {
      // Create FormData with the state values
      const data = new FormData()
      data.append('email', email)
      data.append('password', password)
      await formAction(data)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  // Show forgot password form
  if (forgotPasswordView) {
    return (
      <div className="flex items-start justify-center min-h-screen px-0 py-6 bg-white sm:p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-3 shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm leading-relaxed text-gray-600">
              Enter your email address and we'll send you a secure link to reset your password
            </p>
          </div>

          {/* Form */}
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <EnhancedInput
                id="reset-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                icon={Mail}
              />
              
              {resetMessage && (
                <div className={`p-3 rounded-lg border-l-4 ${
                  resetMessage.type === "success" 
                    ? "bg-green-50 border-green-400 text-green-700" 
                    : "bg-red-50 border-red-400 text-red-700"
                }`}>
                  <div className="flex items-center gap-2">
                    {resetMessage.type === "success" ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600" />
                    )}
                    <span className="text-sm font-medium">{resetMessage.text}</span>
                  </div>
                </div>
              )}
              
              <div className="pt-2 space-y-3">
                <EnhancedButton type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
                </EnhancedButton>
                
                <EnhancedButton 
                  type="button" 
                  variant="ghost"
                  onClick={() => {
                    setForgotPasswordView(false)
                    setResetMessage(null)
                  }}
                >
                  Back to Sign In
                </EnhancedButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Main login view
  return (
    <div className="flex items-center justify-center min-h-screen px-0 py-6 bg-white sm:p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-4 shadow-lg">
            <Image
              src={BrandLogo}
              alt="Brand Logo"
              className="object-cover w-8 h-8 rounded-full"
            />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm leading-relaxed text-gray-600">
            Sign in to your account to continue your shopping journey with exclusive deals and personalized recommendations
          </p>
        </div>

        {/* Login Form */}
        <div className="px-3 py-6 mb-4 bg-white border border-gray-200 shadow-lg rounded-xl sm:p-6">
          <form action={handleLoginSubmit} className="space-y-4">
            <EnhancedInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              required
              autoComplete="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <EnhancedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-[#e65100] transition-colors duration-200 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            
            {/* Options Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 text-[#e65100] border-2 border-gray-300 rounded focus:ring-[#e65100] focus:ring-2 transition-colors"
                />
                <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#e65100] hover:text-[#d84315] font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Error Message */}
            {message && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <ErrorMessage error={message} data-testid="login-error-message" />
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-2">
              <EnhancedButton type="submit" loading={isLoginSubmitting}>
                {isLoginSubmitting ? (
                  "Signing In..."
                ) : (
                  <span className="flex items-center gap-1">
                    Sign In
                    <ArrowRight size={16} />
                  </span>
                )}
              </EnhancedButton>
            </div>
          </form>
        </div>

        {/* Sign Up Prompt */}
        <div className="p-4 text-center bg-white border border-gray-200 shadow-lg rounded-xl">
          <p className="mb-3 text-sm text-gray-600">
            New to our store? Join thousands of satisfied customers
          </p>
          <EnhancedButton 
            variant="secondary"
            onClick={() => setCurrentView("register")}
          >
            Create Account
          </EnhancedButton>
        </div>
      </div>
    </div>
  )
}

export default Login
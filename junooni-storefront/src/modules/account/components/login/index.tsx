"use client"

import { useState } from "react"
import { useActionState } from "react"
import { login, getGoogleAuthUrl } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { sdk } from "@lib/config"
import loginbanner from "@assets/login-banner.png"

import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

type Props = {
  setCurrentView: (view: string) => void
}

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
  rightElement,
  error
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
          <Icon size={18} className={`${error ? 'text-red-400' : 'text-gray-400'} transition-colors duration-200`} />
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
          w-full h-12 px-4 ${Icon ? 'pl-11' : ''} ${rightElement ? 'pr-11' : ''} 
          bg-white border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg 
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
  const baseClasses = "relative w-full h-12 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  
  const variants = {
    primary: "bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm hover:shadow-md focus:ring-orange-100",
    secondary: "bg-white border-2 border-gray-300 hover:border-[#e65100] text-gray-700 hover:text-[#e65100] focus:ring-orange-50",
    ghost: "text-[#e65100] hover:bg-orange-50 focus:ring-orange-50"
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-inherit">
          <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
        </div>
      )}
      <div className={`${loading ? "opacity-0" : "opacity-100"} flex flex-row items-center gap-2`}>
        {children}
      </div>
    </button>
  )
}

const GoogleButton = ({ isRegister = false }: { isRegister?: boolean }) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const url = await getGoogleAuthUrl(isRegister)
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="relative flex items-center justify-center w-full gap-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm h-11 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{loading ? "Redirecting…" : "Continue with Google"}</span>
    </button>
  )
}

const Divider = ({ label = "or" }: { label?: string }) => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200 md:border-white/20" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="px-3 text-gray-400 bg-white md:bg-transparent md:text-white/60">
        {label}
      </span>
    </div>
  </div>
)

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordView, setForgotPasswordView] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  
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
        text: "Password reset link sent! Please check your email."
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
      const data = new FormData()
      data.append('email', email)
      data.append('password', password)
      await formAction(data)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  // Forgot Password View
  if (forgotPasswordView) {
    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 md:hidden">
          <div className="absolute top-0 left-0 w-64 h-64 -mt-32 -ml-32 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 -mb-48 -mr-48 bg-purple-200 rounded-full w-96 h-96 opacity-20 blur-3xl"></div>
        </div>

        <div 
          className="absolute inset-0 hidden bg-center bg-no-repeat bg-cover md:block"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%), url(${loginbanner.src})`
          }}
        ></div>
        <div className="absolute inset-0 hidden md:block bg-black/50"></div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 py-6 md:px-0 md:py-0 md:justify-center">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setForgotPasswordView(false)
                setResetMessage(null)
              }}
              className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700 transition-colors md:mb-6 md:text-white hover:text-gray-900 md:hover:text-gray-200"
            >
              <ArrowRight size={16} className="rotate-180" />
              Back to Sign In
            </button>

            <div className="mb-6 text-center md:mb-8">
              <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl md:text-white">Reset Password</h1>
              <p className="text-sm text-gray-600 md:text-white">
                Enter your email and we'll send you a link to reset your password
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-xl md:p-8 rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <EnhancedInput
                  id="reset-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  icon={Mail}
                />
                
                {resetMessage && (
                  <div className={`p-4 rounded-xl border ${
                    resetMessage.type === "success" 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      {resetMessage.type === "success" ? (
                        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm font-medium ${
                        resetMessage.type === "success" ? "text-green-700" : "text-red-700"
                      }`}>
                        {resetMessage.text}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <EnhancedButton type="submit" loading={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </EnhancedButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Login View
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Mobile Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 md:hidden">
        <div className="absolute top-0 left-0 w-64 h-64 -mt-32 -ml-32 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mb-48 -mr-48 bg-purple-200 rounded-full w-96 h-96 opacity-20 blur-3xl"></div>
      </div>

      {/* Desktop Background */}
      <div 
        className="absolute inset-0 hidden bg-center bg-no-repeat bg-cover md:block"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%), url(${loginbanner.src})`
        }}
      ></div>
      <div className="absolute inset-0 hidden md:block bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 py-6 md:px-0 md:py-0">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mt-10 mb-8 text-center md:mt-20">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl md:text-white">Welcome Back</h1>
            <p className="text-sm text-gray-600 md:text-white">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* Login Form Card */}
          <div className="p-6 bg-white border border-gray-200 shadow-2xl md:p-8 rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
            <form action={handleLoginSubmit} className="space-y-5">
              <EnhancedInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                required
                autoComplete="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!message}
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
                error={!!message}
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
              
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 text-[#e65100] border-gray-300 rounded focus:ring-[#e65100] focus:ring-2"
                  />
                  <span className="text-sm text-gray-200 transition-colors group-hover:text-gray-900">
                    Remember me
                  </span>
                </label>
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#e65100] hover:text-[#d84315] font-medium transition-colors hover:underline text-left md:text-right md:text-gray-200"
                >
                  Forgot password?
                </button>
              </div>
              
              {message && (
                <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <ErrorMessage error={message} data-testid="login-error-message" />
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <EnhancedButton type="submit" loading={isLoginSubmitting}>
                  {isLoginSubmitting ? "Signing In..." : (
                    <>Sign In <ArrowRight size={18} /></>
                  )}
                </EnhancedButton>
              </div>
            </form>

            {/* Google OAuth */}
            <Divider label="Or" />
            <GoogleButton />
          </div>

          {/* Divider */}
          <div className="relative my-6 md:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 md:border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-700 bg-orange-50 md:bg-transparent md:text-white">
                New to Junooni?
              </span>
            </div>
          </div>

          {/* Create Account Card */}
          <div className="p-6 mb-4 text-center bg-white border border-gray-200 shadow-xl rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 md:text-white">
              Start Your Journey
            </h3>
            <p className="mb-4 text-sm text-gray-600 md:text-gray-200">
              Create an account to unlock exclusive deals and rewards
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
    </div>
  )
}

export default Login
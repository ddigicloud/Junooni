// "use client"

// import { useState } from "react"
// import { useActionState } from "react"
// import { login } from "@lib/data/customer"
// import ErrorMessage from "@modules/checkout/components/error-message"

// type Props = {
//   setCurrentView: (view: string) => void
// }

// const Login = ({ setCurrentView }: Props) => {
//   const [message, formAction] = useActionState(login, null)
//   const [showPassword, setShowPassword] = useState(false)

//   return (
//     <div className="flex flex-col items-center w-full">
//       <h1 className="text-2xl font-bold text-[#e65100] mb-2">Welcome Back</h1>
//       <p className="mb-6 text-center text-gray-600">
//         Sign in to access your account and continue your shopping journey
//       </p>
      
//       <form className="w-full space-y-4" action={formAction}>
//         <div className="flex flex-col">
//           <label htmlFor="email" className="mb-1 text-sm text-gray-700">
//             Email<span className="text-[#e65100]">*</span>
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             required
//             autoComplete="email"
//             placeholder="your.email@example.com"
//             className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
//           />
//         </div>
        
//         <div className="flex flex-col">
//           <label htmlFor="password" className="mb-1 text-sm text-gray-700">
//             Password<span className="text-[#e65100]">*</span>
//           </label>
//           <div className="relative">
//             <input
//               id="password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               required
//               autoComplete="current-password"
//               placeholder="••••••••"
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
//             >
//               {showPassword ? (
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M9.9 4.24c.4-.13.82-.24 1.24-.25C15.57 3.86 19.27 7.1 21.47 12.1c.32.73.32 1.56 0 2.29-.16.36-.33.71-.51 1.05-.18.33-.69.44-1.02.26-.33-.17-.44-.69-.26-1.02.15-.29.29-.58.42-.88.22-.52.22-1.08 0-1.6-1.98-4.51-5.13-7.31-8.76-7.17-.6.02-1.18.13-1.76.32-.34.11-.72-.08-.83-.42-.11-.34.08-.72.42-.83 0 0 .48-.16.73-.22ZM2.78 7.29c.17-.34.67-.48 1.01-.31.34.17.48.67.31 1.01-1.63 3.29-1.87 6.56-.45 9.28 2 3.78 6.02 5.74 10.35 5.23.35-.04.8.23.8.71 0 .35-.28.64-.63.69-4.98.6-9.65-1.73-11.96-6.13-1.62-3.07-1.37-6.77.43-10.42l.14-.06ZM12.02 8.55c.33 0 .66.03.98.1.36.08.59.44.51.8-.08.36-.44.59-.8.51-.57-.13-1.17-.13-1.74 0-.59.14-1.12.42-1.59.83-.29.26-.74.23-1-.06-.26-.29-.23-.74.06-1 .64-.56 1.39-.95 2.2-1.14.46-.03.92-.04 1.38-.04ZM21.4 4.17c.32-.28.8-.25 1.08.07.28.32.25.8-.07 1.08l-17.7 15.3c-.32.28-.8.25-1.08-.07-.28-.32-.25-.8.07-1.08 0 0 17.7-15.3 17.7-15.3Z" fill="currentColor"/>
//                 </svg>
//               ) : (
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 4.5c4.44 0 8.13 3.24 10.35 8.21.23.53.23 1.14 0 1.66-2.22 4.98-5.91 8.23-10.35 8.23s-8.13-3.25-10.35-8.21c-.23-.54-.23-1.15 0-1.68C3.87 7.73 7.56 4.5 12 4.5Zm0 2c-3.26 0-6.18 2.58-8.04 6.71-.09.21-.09.39 0 .58C5.82 17.93 8.74 20.5 12 20.5s6.18-2.57 8.04-6.73c.09-.18.09-.39 0-.6C18.18 9.04 15.26 6.5 12 6.5Zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm0-2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z" fill="currentColor"/>
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
        
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <input
//               id="remember"
//               name="remember"
//               type="checkbox"
//               className="w-4 h-4 text-[#e65100] border-gray-300 rounded focus:ring-[#e65100]"
//             />
//             <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
//               Remember me
//             </label>
//           </div>
//           <button
//             type="button"
//             className="text-sm text-[#e65100] hover:underline"
//           >
//             Forgot password?
//           </button>
//         </div>
        
//         <ErrorMessage error={message} data-testid="login-error-message" />
        
//         <button 
//           type="submit"
//           className="w-full bg-[#e65100] hover:bg-[#d84315] text-white py-3 rounded-md font-medium transition-colors mt-2"
//         >
//           Sign in
//         </button>
//       </form>
      
//       <p className="mt-6 text-center text-gray-600">
//         Don't have an account?{" "}
//         <button
//           onClick={() => setCurrentView("register")}
//           className="text-[#e65100] hover:underline font-medium"
//           data-testid="register-button"
//         >
//           Create one now
//         </button>
//       </p>
      
    
//     </div>
//   )
// }

// export default Login

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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-3 shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your password
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
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
              
              <div className="space-y-3 pt-2">
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-4 shadow-lg">
            <Image
              src={BrandLogo}
              alt="Brand Logo"
              className="w-8 h-8 object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sign in to your account to continue your shopping journey with exclusive deals and personalized recommendations
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
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
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600 text-sm mb-3">
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
// "use client"

// import { useState } from "react"
// import { useActionState } from "react"
// import { login } from "@lib/data/customer"
// import ErrorMessage from "@modules/checkout/components/error-message"
// import { sdk } from "@lib/config"
// import Image from "next/image"
// import BrandLogo from "@assets/brand-logo.png"

// import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle, AlertCircle } from "lucide-react"

// type Props = {
//   setCurrentView: (view: string) => void
// }

// // Move EnhancedInput OUTSIDE the Login component
// const EnhancedInput = ({ 
//   id, 
//   name, 
//   type, 
//   label, 
//   placeholder, 
//   required = false, 
//   autoComplete, 
//   value, 
//   onChange, 
//   icon: Icon,
//   rightElement 
// }: {
//   id: string
//   name: string
//   type: string
//   label: string
//   placeholder: string
//   required?: boolean
//   autoComplete?: string
//   value?: string
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
//   icon?: any
//   rightElement?: React.ReactNode
// }) => (
//   <div className="space-y-1.5">
//     <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
//       {label}
//       {required && <span className="text-[#e65100] ml-1">*</span>}
//     </label>
//     <div className="relative group">
//       {Icon && (
//         <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
//           <Icon size={16} className="text-gray-400 group-focus-within:text-[#e65100] transition-colors duration-200" />
//         </div>
//       )}
//       <input
//         id={id}
//         name={name}
//         type={type}
//         required={required}
//         autoComplete={autoComplete}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         className={`
//           w-full h-10 px-3 ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} 
//           bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400
//           focus:outline-none focus:border-[#e65100] focus:ring-2 focus:ring-orange-100
//           transition-all duration-200 ease-in-out
//           hover:border-gray-300
//           group
//         `}
//       />
//       {rightElement && (
//         <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//           {rightElement}
//         </div>
//       )}
//     </div>
//   </div>
// )

// // Move EnhancedButton OUTSIDE the Login component
// const EnhancedButton = ({ 
//   children, 
//   type = "button", 
//   variant = "primary", 
//   disabled = false, 
//   loading = false,
//   onClick,
//   className = ""
// }: {
//   children: React.ReactNode
//   type?: "button" | "submit"
//   variant?: "primary" | "secondary" | "ghost"
//   disabled?: boolean
//   loading?: boolean
//   onClick?: () => void
//   className?: string
// }) => {
//   const baseClasses = "relative w-full h-10 rounded-lg font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  
//   const variants = {
//     primary: "bg-gradient-to-r from-[#e65100] to-[#f57c00] hover:from-[#d84315] hover:to-[#ef6c00] text-white shadow-md hover:shadow-lg focus:ring-orange-200 transform hover:scale-[1.01] active:scale-[0.99]",
//     secondary: "bg-white border-2 border-gray-200 hover:border-[#e65100] text-gray-700 hover:text-[#e65100] focus:ring-orange-100",
//     ghost: "text-[#e65100] hover:bg-orange-50 focus:ring-orange-100"
//   }
  
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled || loading}
//       className={`${baseClasses} ${variants[variant]} ${className}`}
//     >
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//         </div>
//       )}
//       <span className={loading ? "opacity-0" : ""}>{children}</span>
//     </button>
//   )
// }

// const Login = ({ setCurrentView }: Props) => {
//   const [message, formAction] = useActionState(login, null)
//   const [showPassword, setShowPassword] = useState(false)
//   const [forgotPasswordView, setForgotPasswordView] = useState(false)
//   const [resetEmail, setResetEmail] = useState("")
//   const [resetMessage, setResetMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  
//   // Add state for controlled inputs
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")

//   const handleForgotPassword = () => {
//     setForgotPasswordView(true)
//   }

//   const handleResetPassword = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!resetEmail) {
//       setResetMessage({ type: "error", text: "Please enter your email address" })
//       return
//     }
    
//     setIsSubmitting(true)
//     setResetMessage(null)
    
//     try {
//       await sdk.auth.resetPassword("customer", "emailpass", { identifier: resetEmail })
      
//       setResetMessage({ 
//         type: "success", 
//         text: "If an account exists with the specified email, it'll receive instructions to reset the password."
//       })
//       setResetEmail("")
      
//       setTimeout(() => {
//         setForgotPasswordView(false)
//         setResetMessage(null)
//       }, 3000)
//     } catch (error: any) {
//       setResetMessage({ 
//         type: "error", 
//         text: error.message || "Failed to send reset email. Please try again."
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleLoginSubmit = async (formData: FormData) => {
//     setIsLoginSubmitting(true)
//     try {
//       // Create FormData with the state values
//       const data = new FormData()
//       data.append('email', email)
//       data.append('password', password)
//       await formAction(data)
//     } finally {
//       setIsLoginSubmitting(false)
//     }
//   }

//   // Show forgot password form
//   if (forgotPasswordView) {
//     return (
//       <div className="flex items-start justify-center min-h-screen px-0 py-6 bg-white sm:p-4">
//         <div className="w-full max-w-lg">
//           {/* Header */}
//           <div className="mb-6 text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-3 shadow-lg">
//               <Shield size={24} className="text-white" />
//             </div>
//             <h1 className="mb-2 text-2xl font-bold text-gray-900">Reset Password</h1>
//             <p className="text-sm leading-relaxed text-gray-600">
//               Enter your email address and we'll send you a secure link to reset your password
//             </p>
//           </div>

//           {/* Form */}
//           <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
//             <form onSubmit={handleResetPassword} className="space-y-4">
//               <EnhancedInput
//                 id="reset-email"
//                 name="email"
//                 type="email"
//                 label="Email Address"
//                 placeholder="Enter your email address"
//                 required
//                 value={resetEmail}
//                 onChange={(e) => setResetEmail(e.target.value)}
//                 icon={Mail}
//               />
              
//               {resetMessage && (
//                 <div className={`p-3 rounded-lg border-l-4 ${
//                   resetMessage.type === "success" 
//                     ? "bg-green-50 border-green-400 text-green-700" 
//                     : "bg-red-50 border-red-400 text-red-700"
//                 }`}>
//                   <div className="flex items-center gap-2">
//                     {resetMessage.type === "success" ? (
//                       <CheckCircle size={16} className="text-green-600" />
//                     ) : (
//                       <AlertCircle size={16} className="text-red-600" />
//                     )}
//                     <span className="text-sm font-medium">{resetMessage.text}</span>
//                   </div>
//                 </div>
//               )}
              
//               <div className="pt-2 space-y-3">
//                 <EnhancedButton type="submit" loading={isSubmitting}>
//                   {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
//                 </EnhancedButton>
                
//                 <EnhancedButton 
//                   type="button" 
//                   variant="ghost"
//                   onClick={() => {
//                     setForgotPasswordView(false)
//                     setResetMessage(null)
//                   }}
//                 >
//                   Back to Sign In
//                 </EnhancedButton>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Main login view
//   return (
//     <div className="flex items-center justify-center min-h-screen px-0 py-6 bg-white sm:p-4">
//       <div className="w-full max-w-lg">
//         {/* Header */}
//         <div className="mb-6 text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#f57c00] rounded-xl mb-4 shadow-lg">
//             <Image
//               src={BrandLogo}
//               alt="Brand Logo"
//               className="object-cover w-8 h-8 rounded-full"
//             />
//           </div>
//           <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-sm leading-relaxed text-gray-600">
//             Sign in to your account to continue your shopping journey with exclusive deals and personalized recommendations
//           </p>
//         </div>

//         {/* Login Form */}
//         <div className="px-3 py-6 mb-4 bg-white border border-gray-200 shadow-lg rounded-xl sm:p-6">
//           <form action={handleLoginSubmit} className="space-y-4">
//             <EnhancedInput
//               id="email"
//               name="email"
//               type="email"
//               label="Email Address"
//               placeholder="Enter your email address"
//               required
//               autoComplete="email"
//               icon={Mail}
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
            
//             <EnhancedInput
//               id="password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               label="Password"
//               placeholder="Enter your password"
//               required
//               autoComplete="current-password"
//               icon={Lock}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               rightElement={
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="text-gray-400 hover:text-[#e65100] transition-colors duration-200 p-1"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               }
//             />
            
//             {/* Options Row */}
//             <div className="flex items-center justify-between">
//               <label className="flex items-center gap-2 cursor-pointer group">
//                 <input
//                   type="checkbox"
//                   name="remember"
//                   className="w-4 h-4 text-[#e65100] border-2 border-gray-300 rounded focus:ring-[#e65100] focus:ring-2 transition-colors"
//                 />
//                 <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">
//                   Remember me
//                 </span>
//               </label>
              
//               <button
//                 type="button"
//                 onClick={handleForgotPassword}
//                 className="text-sm text-[#e65100] hover:text-[#d84315] font-semibold transition-colors"
//               >
//                 Forgot password?
//               </button>
//             </div>
            
//             {/* Error Message */}
//             {message && (
//               <div className="p-3 border border-red-200 rounded-lg bg-red-50">
//                 <ErrorMessage error={message} data-testid="login-error-message" />
//               </div>
//             )}
            
//             {/* Submit Button */}
//             <div className="pt-2">
//               <EnhancedButton type="submit" loading={isLoginSubmitting}>
//                 {isLoginSubmitting ? (
//                   "Signing In..."
//                 ) : (
//                   <span className="flex items-center gap-1">
//                     Sign In
//                     <ArrowRight size={16} />
//                   </span>
//                 )}
//               </EnhancedButton>
//             </div>
//           </form>
//         </div>

//         {/* Sign Up Prompt */}
//         <div className="p-4 text-center bg-white border border-gray-200 shadow-lg rounded-xl">
//           <p className="mb-3 text-sm text-gray-600">
//             New to our store? Join thousands of satisfied customers
//           </p>
//           <EnhancedButton 
//             variant="secondary"
//             onClick={() => setCurrentView("register")}
//           >
//             Create Account
//           </EnhancedButton>
//         </div>
//       </div>
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
import loginbanner from "@assets/login-banner.png"
import Image from "next/image"
import BrandLogo from "@assets/brand-logo.png"

import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle, AlertCircle, Heart, Sparkles } from "lucide-react"

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
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      {/* <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span> */}
      <div className={`${loading ? "opacity-0" : "opacity-100"} flex flex-row items-center gap-2`}>
        {children}
      </div>

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
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Mobile Background - Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 md:hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full opacity-20 -ml-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 -mr-48 -mb-48 blur-3xl"></div>
        </div>

        {/* Desktop Background - Banner Image */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%), url(${loginbanner.src})`
          }}
        ></div>

        {/* Overlay for better text readability on desktop */}
        <div className="hidden md:block absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 w-full flex-1 px-4 py-6 md:px-0 md:py-0 flex flex-col items-center justify-center md:justify-center">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setForgotPasswordView(false)
                setResetMessage(null)
              }}
              className="flex items-center gap-2 mb-4 md:mb-6 text-sm font-medium text-gray-700 md:text-white hover:text-gray-900 md:hover:text-gray-200 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              Back to Sign In
            </button>

            <div className="mb-6 md:mb-8 text-center">
              <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900 md:text-white">Reset Password</h1>
              <p className="text-sm text-gray-600 md:text-white">
                Enter your email and we'll send you a link to reset your password
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white border border-gray-200 shadow-xl rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Mobile Background - Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 md:hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full opacity-20 -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 -mr-48 -mb-48 blur-3xl"></div>
      </div>

      {/* Desktop Background - Banner Image */}
      <div 
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%), url(${loginbanner.src})`
        }}
      ></div>

      {/* Overlay for better text readability on desktop */}
      <div className="hidden md:block absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 w-full flex-1 px-4 py-6 md:px-0 md:py-0 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center mt-10 md:mt-20">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900 md:text-white">Welcome Back</h1>
            <p className="text-sm text-gray-600 md:text-white">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* Login Form Card */}
          <div className="p-6 md:p-8 bg-white border border-gray-200 shadow-2xl rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
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
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
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
                <EnhancedButton type="submit" loading={isLoginSubmitting} className="flex flex-row items-center gap-x-2">
                  {isLoginSubmitting ? (
                    "Signing In..."
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </EnhancedButton>
              </div>
            </form>
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
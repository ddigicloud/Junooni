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
import { login } from "@lib/data/customer"  // Keep your original login function
import ErrorMessage from "@modules/checkout/components/error-message"
import { sdk } from "@lib/config"

type Props = {
  setCurrentView: (view: string) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordView, setForgotPasswordView] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    console.log('🚀 Google Sign-In button clicked!')
    setGoogleLoading(true)
    
    try {
      console.log('📡 Making POST request to Medusa auth endpoint...')
      
      // Get country code from current URL path
      const pathSegments = window.location.pathname.split('/')
      const countryCode = pathSegments[1] || 'in' // Default to 'in' if not found
      const callbackUrl = `${window.location.origin}/${countryCode}/auth/google/callback`
      console.log('📍 Using callback URL:', callbackUrl)
      
      const result = await sdk.auth.login("customer", "google", {
        callback_url: callbackUrl
      })
      
      console.log('📋 Auth response:', result)
      
      if (typeof result === "object" && result.location) {
        console.log('✅ Redirecting to Google OAuth:', result.location)
        window.location.href = result.location // Redirect to Google
      } else if (result.success) {
        console.log('✅ Already authenticated or direct login successful')
        setGoogleLoading(false)
      } else {
        console.log('⚠️ Unexpected response format:', result)
        setGoogleLoading(false)
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error)
      setGoogleLoading(false)
    }
  }

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
      // Use SDK to send password reset email
      await sdk.auth.resetPassword("customer", "emailpass", { identifier: resetEmail })
      
      // If successful
      setResetMessage({ 
        type: "success", 
        text: "If an account exists with the specified email, it'll receive instructions to reset the password."
      })
      setResetEmail("")
      
      // Automatically return to login view after success message
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

  // Social Button Component
  const SocialButton = ({ provider, icon, onClick, loading = false }: { 
    provider: string, 
    icon: React.ReactNode, 
    onClick: () => void,
    loading?: boolean 
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#e65100] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon
      )}
      {loading ? 'Signing in...' : `Continue with ${provider}`}
    </button>
  )

  // Show forgot password form if in that view
  if (forgotPasswordView) {
    return (
      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold text-[#e65100] mb-2">Reset Password</h1>
        <p className="mb-6 text-center text-gray-600">
          Enter your email address and we'll send you instructions to reset your password
        </p>
        
        <form className="w-full space-y-4" onSubmit={handleResetPassword}>
          <div className="flex flex-col">
            <label htmlFor="reset-email" className="mb-1 text-sm text-gray-700">
              Email<span className="text-[#e65100]">*</span>
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
            />
          </div>
          
          {resetMessage && (
            <div className={`p-3 rounded-md ${resetMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {resetMessage.text}
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e65100] hover:bg-[#d84315] text-white py-3 rounded-md font-medium transition-colors mt-2 disabled:bg-orange-300"
          >
            {isSubmitting ? "Sending..." : "Reset Password"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setForgotPasswordView(false)
              setResetMessage(null)
            }}
            className="w-full text-gray-600 hover:text-[#e65100] py-2 rounded-md font-medium transition-colors"
          >
            Back to Login
          </button>
        </form>
      </div>
    )
  }

  // Original login view with Google OAuth added
  return (
    <div className="flex flex-col items-center w-full p-8">
      <h1 className="text-2xl font-bold text-[#e65100] mb-2">Welcome Back</h1>
      <p className="mb-6 text-center text-gray-600">
        Sign in to access your account and continue your shopping journey
      </p>
      
      {/* Google OAuth Button */}
      <div className="w-full mb-6">
        <SocialButton
          provider="Google"
          loading={googleLoading}
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
          onClick={handleGoogleSignIn}
        />
        
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 font-medium text-gray-500 bg-white">Or continue with email</span>
          </div>
        </div>
      </div>
      
      {/* Original Email/Password Form */}
      <form className="w-full space-y-4" action={formAction}>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm text-gray-700">
            Email<span className="text-[#e65100]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="your.email@example.com"
            className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-sm text-gray-700">
            Password<span className="text-[#e65100]">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e65100] focus:border-[#e65100]"
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
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="w-4 h-4 text-[#e65100] border-gray-300 rounded focus:ring-[#e65100]"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-[#e65100] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        
        <ErrorMessage error={message} data-testid="login-error-message" />
        
        <button 
          type="submit"
          className="w-full bg-[#e65100] hover:bg-[#d84315] text-white py-3 rounded-md font-medium transition-colors mt-2"
        >
          Sign in
        </button>
      </form>
      
      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{" "}
        <button
          onClick={() => setCurrentView("register")}
          className="text-[#e65100] hover:underline font-medium"
          data-testid="register-button"
        >
          Create one now
        </button>
      </p>
    </div>
  )
}

export default Login
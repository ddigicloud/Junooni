"use client"

import { useState } from "react"
import { useActionState } from "react"
import { signup, getGoogleAuthUrl } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Link from "next/link"
import loginbanner from "@assets/login-banner.png"

type Props = {
  setCurrentView: (view: string) => void
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
      className="relative flex items-center justify-center w-full gap-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm  h-11 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
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
      <span>{loading ? "Redirecting…" : "Sign up with Google"}</span>
    </button>
  )
}

const Divider = ({ label = "or" }: { label?: string }) => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="px-3 text-gray-400 bg-white">
        {label}
      </span>
    </div>
  </div>
)

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen px-0 py-6 bg-center bg-no-repeat bg-cover sm:p-4"
      style={{ backgroundImage: `url(${loginbanner.src})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 w-full max-w-2xl mt-0 sm:mt-6 md:mt-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-sm leading-relaxed text-white/90">
            Join us for an enhanced shopping experience with exclusive benefits
          </p>
        </div>

        {/* Registration Form Container */}
        <div className="px-3 py-6 mb-4 bg-white border border-gray-200 shadow-2xl rounded-2xl sm:p-6 backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
          
          {/* Google Sign Up — top of form */}
          <div className="mb-2">
            <GoogleButton isRegister />
          </div>

          <Divider label="or sign up with email" />

          <div className="w-full space-y-4" role="form">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                  First Name<span className="text-[#e65100] ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 group-focus-within:text-[#e65100] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="Your first name"
                    className="w-full h-10 px-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/20 transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-100 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="last_name" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                  Last Name<span className="text-[#e65100] ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 group-focus-within:text-[#e65100] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Your last name"
                    className="w-full h-10 px-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/20 transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-100 shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                Email<span className="text-[#e65100] ml-1">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 group-focus-within:text-[#e65100] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  className="w-full h-10 px-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/20 transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-100 shadow-sm"
                />
              </div>
            </div>
            
            {/* Phone Field */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                Phone (Optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 group-focus-within:text-[#e65100] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 123-456-7890"
                  className="w-full h-10 px-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/20 transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-100 shadow-sm"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                Password<span className="text-[#e65100] ml-1">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 group-focus-within:text-[#e65100] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Choose a secure password"
                  className="w-full h-10 px-3 pl-10 pr-10 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/20 transition-all duration-300 ease-in-out hover:border-gray-400 hover:bg-gray-100 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-[#e65100] transition-colors duration-300 p-1 rounded-lg hover:bg-[#e65100]/10"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 md:text-gray-300">
                Must be at least 8 characters long
              </p>
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-[#e65100] border-2 border-gray-400 rounded focus:ring-[#e65100] focus:ring-2 transition-colors"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="leading-relaxed text-gray-700">
                  I agree to the{" "}
                  <Link href="/privacy-policy" className="text-[#e65100] hover:text-[#d84315] font-semibold hover:underline transition-colors">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms-condition" className="text-[#e65100] hover:text-[#d84315] font-semibold hover:underline transition-colors">
                    Terms of Use
                  </Link>
                </label>
              </div>
            </div>
            
            {/* Error Message */}
            {message && (
              <div className="p-3 border border-red-200 rounded-lg shadow-sm bg-red-50">
                <ErrorMessage error={message} data-testid="register-error" />
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget.closest('[role="form"]');
                  if (form) {
                    const formData = new FormData();
                    const inputs = form.querySelectorAll('input[name]');
                    inputs.forEach((input: any) => {
                      if (input.type === 'checkbox') {
                        if (input.checked) formData.append(input.name, 'on');
                      } else {
                        formData.append(input.name, input.value);
                      }
                    });
                    formAction(formData);
                  }
                }}
                className="relative w-full h-10 bg-[#e65100] hover:bg-[#d84315] text-white rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#e65100]/20 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Sign In Prompt */}
        <div className="p-4 text-center bg-white border border-gray-200 shadow-xl rounded-2xl backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
          <p className="mb-3 text-sm font-medium text-gray-700 md:text-gray-200">
            Already have an account?
          </p>
          <button
            onClick={() => setCurrentView("sign-in")}
            className="w-full h-10 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#e65100]/20 shadow-md hover:shadow-lg flex items-center justify-center gap-2 md:bg-white/10 md:border-white/30 md:text-gray-200"
          >
            Sign In Instead
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-white">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Secure Registration</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Trusted Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
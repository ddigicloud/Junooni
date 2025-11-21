"use client"

import { useState } from "react"
import { useActionState } from "react"
import { signup } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Link from "next/link"
import loginbanner from "@assets/login-banner.png"

type Props = {
  setCurrentView: (view: string) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-0 py-6 sm:p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${loginbanner.src})` }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="w-full max-w-2xl relative z-10 mt-0 sm:mt-6 md:mt-12">
        {/* Header */}
        <div className="text-center mb-6">
          {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-[#e65100] rounded-xl mb-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div> */}
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-white/90 text-sm leading-relaxed">
            Join us for an enhanced shopping experience with exclusive benefits
          </p>
        </div>

        {/* Registration Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-3 py-6 sm:p-6 mb-4 backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
          <div className="w-full space-y-4" role="form">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="block text-sm font-semibold text-gray-800 md:text-gray-200">
                  First Name<span className="text-[#e65100] ml-1">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
              <p className="text-xs text-gray-500 mt-1 md:text-gray-300">
                Must be at least 8 characters long
              </p>
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                <label htmlFor="terms" className="text-gray-700 leading-relaxed">
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 text-center backdrop-blur-sm md:bg-white/10 md:border-white/30 md:backdrop-blur-lg">
          <p className="text-gray-700 text-sm mb-3 font-medium md:text-gray-200">
            Already have an account?
          </p>
          <button
            onClick={() => setCurrentView("sign-in")}
            className="w-full h-10 bg-white border-2 border-gray-300  text-gray-700  rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#e65100]/20 shadow-md hover:shadow-lg flex items-center justify-center gap-2 md:bg-white/10 md:border-white/30 md:text-gray-200"
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
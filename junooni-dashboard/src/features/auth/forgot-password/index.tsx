import { Link } from '@tanstack/react-router'
import { ForgotForm } from './components/forgot-password-form'
import { KeyRound } from 'lucide-react'
import CreatorJunooni from '../../../assets/forget-password.png'
import JunooniLogo from "@/assets/junooni-favicon.png";
import Junoonibrandlogo from "@/assets/junooni_logo_brand_color.png";

export default function ForgotPassword() {
  return (
    <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Enhanced Branded Section */}
      <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
        {/* Main background image with enhanced overlay */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${CreatorJunooni})`,
            filter: 'brightness(0.85) contrast(1.1)',
            
          }}
        />
                
        {/* Enhanced gradient overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
        
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating elements with subtle animation */}
          <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>
            🔐
          </div>
          
          <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>
            🔑
          </div>
          
          <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>
            ✨
          </div>
          
          <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>
            💝
          </div>
          
          {/* Geometric shapes */}
          <div className="absolute top-[20%] right-[30%] w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
          <div className="absolute bottom-[30%] right-[25%] w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1500ms' }} />
        </div>
        
        {/* Content container with enhanced styling */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Enhanced Branding */}
          <div className="flex items-center gap-4 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-[#e65100] shadow-xl">
              <img src={JunooniLogo} alt="Junooni Logo" className="w-12 h-12 lg:h-11 sm:h-8 lg:w-11" />
            </div>
            <h1 className="text-3xl font-black tracking-wide text-white drop-shadow-2xl">JUNOONI</h1>
          </div>
          
          {/* Additional content for forgot password context */}
          {/* <div className="flex items-center justify-center flex-1 px-8">
            <div className="text-center text-white">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
              <h2 className="mb-4 text-2xl font-bold drop-shadow-lg">Secure Password Recovery</h2>
              <p className="max-w-md text-lg leading-relaxed text-white/90">
                We'll help you regain access to your creative workspace safely and securely.
              </p>
            </div>
          </div> */}
        </div>
      </div>
      
      {/* Right Panel - Enhanced Forgot Password Form */}
      <div className="flex flex-col items-center justify-start h-screen px-6 pt-12 sm:justify-center lg:pt-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo - Enhanced */}
          <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg">
              <img 
                src={JunooniLogo} 
                alt="Junooni Logo" 
                className="object-contain w-10 h-8" 
              />
            </div>
            <img 
              src={Junoonibrandlogo} 
              alt="Junooni Brand Logo" 
              className="object-fill h-10 w-26" 
            />  
          </div>

          {/* Enhanced Header with icon */}
          <div className="mb-8 -mt-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e65100] to-[#ff8a50] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg lg:hidden">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-gray-900 lg:mb-2 sm:text-3xl">
              Forgot Password?
            </h1>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              No worries! Enter your email address below and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <ForgotForm />

          {/* Enhanced Footer Links */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/sign-in"
                className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our{' '}
              <a
                href="mailto:support@junooni.com"
                className="text-[#e65100] hover:text-[#d84315] underline"
              >
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
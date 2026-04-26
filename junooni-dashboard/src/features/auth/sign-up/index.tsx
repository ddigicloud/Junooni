// import { Link } from '@tanstack/react-router'
// import { SignUpForm } from './components/sign-up-form'
// import CreatorJunooni from '../../../assets/junooni-creators.png'
// import JunooniLogo from "@/assets/junooni-favicon.png";
// import Junoonibrandlogo from "@/assets/junooni_logo_brand_color.png";
// import { useState } from 'react';
// import { Loader2 } from 'lucide-react';
// import axios from 'axios';

// // ─── Google Sign Up Button ────────────────────────────────────────────────────
// function GoogleSignUpButton() {
//   const [loading, setLoading] = useState(false)

//   const handleClick = async () => {
//     setLoading(true)
//     // Store intent so callback knows this is a sign-up
//     localStorage.setItem('googleAuthIntent', 'signup')
//     try {
//       const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
//       const response = await axios.post(`${backendUrl}/auth/vendor/google-vendor`, {})
//       const location = response.data?.location
//       if (location) {
//         window.location.href = location
//       } else {
//         throw new Error('No redirect URL from Google auth')
//       }
//     } catch (err) {
//       console.error('Google sign-up error:', err)
//       localStorage.removeItem('googleAuthIntent')
//       setLoading(false)
//     }
//   }

//   return (
//     <button
//       type="button"
//       onClick={handleClick}
//       disabled={loading}
//       className="flex items-center justify-center w-full h-12 gap-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm // hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
//     >
//       {loading ? (
//         <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
//       ) : (
//         <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
//           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
//           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
//           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
//         </svg>
//       )}
//       <span>{loading ? 'Redirecting…' : 'Sign up with Google'}</span>
//     </button>
//   )
// }

// export default function SignUp() {
//   return (
//     <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
//       {/* Left Panel */}
//       <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
//         <div className="absolute inset-0 bg-top bg-no-repeat bg-cover" style={{ backgroundImage: `url(${CreatorJunooni})`, filter: 'brightness(0.85) contrast(1.1)' }} />
//         <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>👕</div>
//           <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>🧢</div>
//           <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>✨</div>
//           <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>❤️</div>
//           <div className="absolute top-[20%] right-[30%] w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
//           <div className="absolute bottom-[30%] right-[25%] w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1500ms' }} />
//         </div>
//         <div className="relative z-10 flex flex-col h-full">
//           <div className="flex items-center gap-4 p-8">
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-[#e65100] shadow-xl">
//               <img src={JunooniLogo} alt="Junooni Logo" className="w-12 h-12 lg:h-11 sm:h-8 lg:w-11" />
//             </div>
//             <h1 className="text-3xl font-black tracking-wide text-white drop-shadow-2xl">JUNOONI</h1>
//           </div>
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div className="flex flex-col items-center justify-start h-screen px-6 pt-12 sm:justify-center lg:pt-8 bg-gradient-to-br from-gray-50 to-white">
//         <div className="w-full max-w-md mx-auto">
//           {/* Mobile Logo */}
//           <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg">
//               <img src={JunooniLogo} alt="Junooni Logo" className="object-contain w-10 h-8" />
//             </div>
//             <img src={Junoonibrandlogo} alt="Junooni Brand Logo" className="object-fill h-10 w-26" />
//           </div>

//           {/* Header */}
//           <div className="-mt-8 text-center">
//             <h1 className="mb-0 text-2xl font-extrabold text-gray-900 lg:mb-2 sm:text-3xl">
//               Create Your Account
//             </h1>
//             <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
//               Join thousands of creators on Junooni
//             </p>
//           </div>

//           {/* Google Sign Up */}
//           <div className="mt-5 mb-4">
//             <GoogleSignUpButton />
//           </div>

//           {/* Divider */}
//           <div className="relative mb-4">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-200" />
//             </div>
//             <div className="relative flex justify-center text-xs">
//               <span className="px-3 text-gray-400 bg-gradient-to-br from-gray-50 to-white">or sign up with email</span>
//             </div>
//           </div>

//           <SignUpForm />

//           {/* Footer */}
//           <div className="mt-2 space-y-1 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link to="/sign-in" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
//                 Sign In
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { Link } from '@tanstack/react-router'
import { SignUpForm } from './components/sign-up-form'
import CreatorJunooni from '../../../assets/junooni-creators.png'
import JunooniLogo from "@/assets/junooni-favicon.png";
import Junoonibrandlogo from "@/assets/junooni_logo_brand_color.png";
import { useState, useEffect } from 'react';
import { Loader2, X, UserPlus } from 'lucide-react';
import axios from 'axios';

// ─── Google Sign Up Button ────────────────────────────────────────────────────
function GoogleSignUpButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    localStorage.setItem('googleAuthIntent', 'signup')
    try {
      const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
      const response = await axios.post(`${backendUrl}/auth/vendor/google-vendor`, {})
      const location = response.data?.location
      if (location) {
        window.location.href = location
      } else {
        throw new Error('No redirect URL from Google auth')
      }
    } catch (err) {
      console.error('Google sign-up error:', err)
      localStorage.removeItem('googleAuthIntent')
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center w-full h-12 gap-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{loading ? 'Redirecting…' : 'Sign up with Google'}</span>
    </button>
  )
}

// ─── Redirect Toast ───────────────────────────────────────────────────────────
function RedirectToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed z-50 w-full max-w-sm -translate-x-1/2 top-4 left-1/2 lg:left-auto lg:translate-x-0 lg:right-4"
      style={{ animation: 'slideInDown 0.35s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <div className="relative p-4 overflow-hidden border border-orange-200 shadow-2xl bg-orange-50 rounded-xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
            <UserPlus className="w-4 h-4 text-orange-600" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-900">
              No account found — sign up first! 👋
            </p>
            <p className="mt-0.5 text-xs text-orange-700 leading-relaxed">
              Looks like you're new here. Create your Junooni creator account below — it only takes a minute.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 transition-colors rounded-lg hover:bg-amber-100"
          >
            <X className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-amber-400 rounded-full"
          style={{ width: '100%', animation: 'shrinkWidth 8s linear forwards' }} />
      </div>

      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (min-width: 1024px) {
          @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SignUp() {
  const [showRedirectToast, setShowRedirectToast] = useState(false)

  // Show toast if redirected here from Google sign-in attempt with no account
  useEffect(() => {
    if (sessionStorage.getItem('googleSignUpPrompt')) {
      sessionStorage.removeItem('googleSignUpPrompt')
      setShowRedirectToast(true)
    }
  }, [])

  return (
    <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">

      {/* ── Toast ── */}
      {showRedirectToast && (
        <RedirectToast onClose={() => setShowRedirectToast(false)} />
      )}

      {/* Left Panel */}
      <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
        <div className="absolute inset-0 bg-top bg-no-repeat bg-cover" style={{ backgroundImage: `url(${CreatorJunooni})`, filter: 'brightness(0.85) contrast(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>👕</div>
          <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>🧢</div>
          <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>✨</div>
          <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>❤️</div>
          <div className="absolute top-[20%] right-[30%] w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
          <div className="absolute bottom-[30%] right-[25%] w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1500ms' }} />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-4 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-[#e65100] shadow-xl">
              <img src={JunooniLogo} alt="Junooni Logo" className="w-12 h-12 lg:h-11 sm:h-8 lg:w-11" />
            </div>
            <h1 className="text-3xl font-black tracking-wide text-white drop-shadow-2xl">JUNOONI</h1>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col items-center justify-start h-screen px-6 pt-12 sm:justify-center lg:pt-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg">
              <img src={JunooniLogo} alt="Junooni Logo" className="object-contain w-10 h-8" />
            </div>
            <img src={Junoonibrandlogo} alt="Junooni Brand Logo" className="object-fill h-10 w-26" />
          </div>

          {/* Header */}
          <div className="-mt-8 text-center">
            <h1 className="mb-0 text-2xl font-extrabold text-gray-900 lg:mb-2 sm:text-3xl">
              Create Your Account
            </h1>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Join thousands of creators on Junooni
            </p>
          </div>

          {/* Google Sign Up */}
          <div className="mt-5 mb-4">
            <GoogleSignUpButton />
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-gray-400 bg-gradient-to-br from-gray-50 to-white">or sign up with email</span>
            </div>
          </div>

          <SignUpForm />

          {/* Footer */}
          <div className="mt-2 space-y-1 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// import { Link } from '@tanstack/react-router'
// import { Card } from '@/components/ui/card'
// import AuthLayout from '../auth-layout'
// import { SignUpForm } from './components/sign-up-form'

// export default function SignUp() {
//   return (
//     <AuthLayout>
//       <Card className='p-6'>
//         <div className='flex flex-col mb-2 space-y-2 text-left'>
//           <h1 className='text-lg font-semibold tracking-tight'>
//             Create an account
//           </h1>
//           <p className='text-sm text-muted-foreground'>
//             Enter your email and password to create an account. <br />
//             Already have an account?{' '}
//             <Link
//               to='/sign-in'
//               className='underline underline-offset-4 hover:text-primary'
//             >
//               Sign In
//             </Link>
//           </p>
//         </div>
//         <SignUpForm />
//         <p className='px-8 mt-4 text-sm text-center text-muted-foreground'>
//           By creating an account, you agree to our{' '}
//           <a
//             href='/terms'
//             className='underline underline-offset-4 hover:text-primary'
//           >
//             Terms of Service
//           </a>{' '}
//           and{' '}
//           <a
//             href='/privacy'
//             className='underline underline-offset-4 hover:text-primary'
//           >
//             Privacy Policy
//           </a>
//           .
//         </p>
//       </Card>
//     </AuthLayout>
//   )
// }

import { Link } from '@tanstack/react-router'
import { SignUpForm } from './components/sign-up-form'
import CreatorJunooni from '../../../assets/junooni-creators.png'
import JunooniLogo from "@/assets/junooni-favicon.png";
import Junoonibrandlogo from "@/assets/junooni_logo_brand_color.png";

export default function SignUp() {
  return (
    <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Enhanced Branded Section */}
      <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
        {/* Main background image with enhanced overlay */}
        <div 
          className="absolute inset-0 bg-top bg-no-repeat bg-cover" 
          style={{ 
            backgroundImage: `url(${CreatorJunooni})`,
            filter: 'brightness(0.85) contrast(1.1)' 
          }}
        />
        
        {/* Enhanced gradient overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
        
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating elements with subtle animation */}
          <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>
            👕
          </div>
          
          <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>
            🧢
          </div>
          
          <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>
            ✨
          </div>
          
          <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>
            ❤️
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
          
          {/* Centered Content with enhanced design */}
          <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
            {/* <div className="p-8 mb-12 border shadow-2xl rounded-3xl bg-white/10 backdrop-blur-lg border-white/20">
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mx-auto drop-shadow-2xl"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div> */}
            
            {/* <div className="max-w-lg p-8 border shadow-2xl bg-black/30 backdrop-blur-lg rounded-2xl border-white/10">
              <h2 className="mb-6 text-4xl font-black text-white drop-shadow-2xl">Join Our Community</h2>
              <p className="max-w-md text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
                Start your creator journey today. Build your brand, connect with fans, and monetize your passion.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mt-10">
                <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">Free</div>
                  <div className="mt-1 text-sm font-medium text-white/90">To get started</div>
                </div>
                <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">24/7</div>
                  <div className="mt-1 text-sm font-medium text-white/90">Support available</div>
                </div>
                <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">∞</div>
                  <div className="mt-1 text-sm font-medium text-white/90">Earning potential</div>
                </div>
              </div>
            </div> */}
          </div>
          
          {/* Enhanced Footer Quote */}
          {/* <div className="p-8">
            <blockquote className="p-6 border border-l-4 shadow-xl bg-black/20 backdrop-blur-lg rounded-2xl border-white/10 border-l-white">
              <p className="text-lg italic font-medium leading-relaxed text-white">
                "Every creator's journey begins with a single step. Take yours today with Junooni."
              </p>
              <footer className="mt-3 text-base font-semibold text-white/95">
                — Junooni Team
              </footer>
            </blockquote>
          </div> */}
        </div>
      </div>
      
      {/* Right Panel - Enhanced Sign Up Form */}
      <div className="flex flex-col items-center justify-center h-screen px-6 lg:pt-8 pt-2 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo - Enhanced */}
          <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg">
              <img 
                src={JunooniLogo} 
                alt="Junooni Logo" 
                className="w-10 h-8 object-contain" 
              />
            </div>
            <img 
              src={Junoonibrandlogo} 
              alt="Junooni Brand Logo" 
              className="w-26 h-10 object-fill" 
            />  
          </div>
       
          {/* Enhanced Header */}
          <div className="-mt-8 text-center">
            <h1 className="lg:mb-2 mb-0 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Join thousands of creators on Junooni
            </p>

          </div>
          
          <SignUpForm />
          
          {/* Enhanced Footer Links */}
          <div className="mt-2 space-y-1 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Sign In
              </Link>
            </p>
            
            {/* <p className="max-w-sm mx-auto text-sm leading-relaxed text-gray-500">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Terms of Servicess
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  )
}

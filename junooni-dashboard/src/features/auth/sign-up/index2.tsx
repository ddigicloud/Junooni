// import { Link } from '@tanstack/react-router'
// import { Card } from '@/components/ui/card'
// import AuthLayout from '../auth-layout'
// import { SignUpForm } from './components/sign-up-form'

// export default function SignUp() {
//   return (
//     <AuthLayout>
//       <Card className='p-6'>
//         <div className='mb-2 flex flex-col space-y-2 text-left'>
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
//         <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
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
import CreatorJunooni from '../../../assets/pictures.png'

export default function SignUp() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Enhanced Branded Section */}
      <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
        {/* Main background image with enhanced overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#e65100] shadow-xl">
              <span className="text-2xl font-black">J</span>
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-2xl tracking-wide">JUNOONI</h1>
          </div>
          
          {/* Centered Content with enhanced design */}
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-12 rounded-3xl bg-white/10 p-8 backdrop-blur-lg shadow-2xl border border-white/20">
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="drop-shadow-2xl mx-auto"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10 max-w-lg">
              <h2 className="mb-6 text-4xl font-black text-white drop-shadow-2xl">Join Our Community</h2>
              <p className="max-w-md text-xl text-white/95 drop-shadow-lg leading-relaxed font-medium">
                Start your creator journey today. Build your brand, connect with fans, and monetize your passion.
              </p>
              
              <div className="mt-10 grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">Free</div>
                  <div className="text-sm text-white/90 font-medium mt-1">To get started</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">24/7</div>
                  <div className="text-sm text-white/90 font-medium mt-1">Support available</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="text-3xl font-black text-white drop-shadow-lg">∞</div>
                  <div className="text-sm text-white/90 font-medium mt-1">Earning potential</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Footer Quote */}
          <div className="p-8">
            <blockquote className="bg-black/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10 border-l-4 border-l-white">
              <p className="italic text-white text-lg font-medium leading-relaxed">
                "Every creator's journey begins with a single step. Take yours today with Junooni."
              </p>
              <footer className="mt-3 text-base font-semibold text-white/95">
                — Junooni Team
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Enhanced Sign Up Form */}
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo - Enhanced */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg">
              <span className="text-2xl font-black">J</span>
            </div>
            <h1 className="text-3xl font-black text-[#e65100]">JUNOONI</h1>
          </div>
          
          {/* Enhanced Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Join thousands of creators building their brands on Junooni
            </p>
          </div>
          
          <SignUpForm />
          
          {/* Enhanced Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-base text-gray-600">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Sign In
              </Link>
            </p>
            
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Terms of Servicessssss
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
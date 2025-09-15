// import { Link } from '@tanstack/react-router'
// import { Card } from '@/components/ui/card'
// import AuthLayout from '../auth-layout'
// import { ForgotForm } from './components/forgot-password-form'

// export default function ForgotPassword() {
//   return (
//     <AuthLayout>
//       <Card className='p-6'>
//         <div className='flex flex-col mb-2 space-y-2 text-left'>
//           <h1 className='font-semibold tracking-tight text-md'>
//             Forgot Password
//           </h1>
//           <p className='text-sm text-muted-foreground'>
//             Enter your registered email and <br /> we will send you a link to
//             reset your password.
//           </p>
//         </div>
//         <ForgotForm />
//         <p className='px-8 mt-4 text-sm text-center text-muted-foreground'>
//           Don't have an account?{' '}
//           <Link
//             to='/sign-up'
//             className='underline underline-offset-4 hover:text-primary'
//           >
//             Sign up
//           </Link>
//           .
//         </p>
//       </Card>
//     </AuthLayout>
//   )
// }


import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ForgotForm } from './components/forgot-password-form'
import { KeyRound, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Back to login link */}
        {/* <Link
          to="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#e65100] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link> */}

        <Card className="px-8 py-6 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          {/* Header with icon */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e65100] to-[#ff8a50] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Forgot Password?
            </h1>
            <p className="leading-relaxed text-gray-600">
              No worries! Enter your email address below and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <ForgotForm />

          {/* Footer */}
          <div className="pt-6 mt-8 border-t border-gray-100">
            <p className="text-sm text-center text-gray-600">
              Remember your password?{' '}
              <Link
                to="/sign-in"
                className="font-medium text-[#e65100] hover:text-[#d84315] underline underline-offset-4 transition-colors"
              >
                Sign in here
              </Link>
            </p>
            <p className="mt-3 text-sm text-center text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                className="font-medium text-[#e65100] hover:text-[#d84315] underline underline-offset-4 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </Card>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our{' '}
            <a href="/help-center" className="text-[#e65100] hover:text-[#d84315] underline">
              support team
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
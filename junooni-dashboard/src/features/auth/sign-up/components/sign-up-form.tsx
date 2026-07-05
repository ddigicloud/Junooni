// import { HTMLAttributes, useState } from 'react'
// import { z } from 'zod'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { IconLoader2 } from '@tabler/icons-react'
// import { cn } from '@/lib/utils'
// import axios from 'axios'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { PasswordInput } from '@/components/password-input'
// import { useToast } from '@/hooks/use-toast'
// import { useNavigate } from '@tanstack/react-router'

// type SignUpFormProps = HTMLAttributes<HTMLDivElement>

// const formSchema = z
//   .object({
//     email: z
//       .string()
//       .min(1, { message: 'Please enter your email' })
//       .email({ message: 'Invalid email address' }),
//     password: z
//       .string()
//       .min(1, { message: 'Please enter your password' })
//       .min(7, { message: 'Password must be at least 7 characters long' }),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match.",
//     path: ['confirmPassword'],
//   })

// export function SignUpForm({ className, ...props }: SignUpFormProps) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const { toast } = useToast()
//   const navigate = useNavigate()

//   const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
//   const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { email: '', password: '', confirmPassword: '' },
//   })

//   async function onSubmit(data: z.infer<typeof formSchema>) {
//     try {
//       setIsLoading(true)
//       setError(null)

//       // ── Step 1: Try normal emailpass registration ────────────────────────
//       const response = await axios.post(
//         `${backendUrl}/auth/vendor/emailpass/register`,
//         { email: data.email, password: data.password }
//       )

//       // Success — brand new account
//       localStorage.setItem('vendorToken', response.data.token)
//       localStorage.setItem('vendorEmail', data.email)
//       localStorage.setItem('vendorTokenTimestamp', Date.now().toString())

//       toast({
//         title: 'Account created successfully',
//         description: 'Redirecting you to onboarding...',
//       })

//       setTimeout(() => navigate({ to: '/onboarding' }), 1000)

//     } catch (err: any) {
//       const status = err.response?.status
//       const message: string = err.response?.data?.message || ''

//       // ── Step 2: Email already exists — try linking emailpass to Google account ──
//       // This fires when a creator previously signed up with Google and now
//       // tries to register with the same email via the form.
//       const isConflict =
//         status === 409 ||
//         status === 422 ||
//         message.toLowerCase().includes('already') ||
//         message.toLowerCase().includes('exists') ||
//         message.toLowerCase().includes('identity with') ||
//         message.toLowerCase().includes('taken')

//       if (isConflict) {
//         try {
//           const linkRes = await axios.post(
//             `${backendUrl}/vendors/link-emailpass`,
//             { email: data.email, password: data.password },
//             {
//               headers: {
//                 'x-publishable-api-key': publishableKey,
//               },
//             }
//           )

//           const { token, isNewVendor } = linkRes.data

//           if (token) {
//             localStorage.setItem('vendorToken', token)
//             localStorage.setItem('vendorEmail', data.email)
//             localStorage.setItem('vendorTokenTimestamp', Date.now().toString())

//             if (isNewVendor) {
//               // Google account exists but onboarding was never completed
//               toast({
//                 title: 'Account found!',
//                 description: 'Continuing your onboarding...',
//               })
//               setTimeout(() => navigate({ to: '/onboarding' }), 800)
//             } else {
//               // Fully onboarded Google vendor — just log them in
//               toast({
//                 title: 'Welcome back!',
//                 description: 'You already have a Junooni account. Logging you in...',
//               })
//               setTimeout(() => navigate({ to: '/dashboard' }), 800)
//             }
//             return
//           }
//         } catch (linkErr: any) {
//           const linkMessage: string = linkErr.response?.data?.message || ''

//           // Wrong password for an existing account
//           if (linkErr.response?.status === 401 || linkMessage.toLowerCase().includes('invalid')) {
//             setError('An account with this email already exists. Please sign in instead.')
//             return
//           }
//         }

//         // Fallback: account exists but linking failed for unknown reason
//         setError('An account with this email already exists. Please sign in or use "Sign in with Google".')
//         return
//       }

//       // Any other error
//       setError(message || 'An unknown error occurred. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className={cn('grid gap-6 mt-3 lg:mt-6', className)} {...props}>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//           <div className='grid gap-5'>
//             {error && (
//               <div className="p-4 text-sm text-red-700 border-2 border-red-200 rounded-lg bg-red-50/80 backdrop-blur-sm">
//                 <div className="flex items-center gap-2">
//                   <svg className="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                   {error}
//                 </div>
//               </div>
//             )}

//             <FormField
//               control={form.control}
//               name='email'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder='Enter your email address'
//                       {...field}
//                       className="h-12 px-4 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
//                     />
//                   </FormControl>
//                   <FormMessage className="text-sm text-red-500" />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name='password'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
//                   <FormControl>
//                     <PasswordInput
//                       placeholder='Create a strong password'
//                       {...field}
//                       className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
//                     />
//                   </FormControl>
//                   <FormMessage className="text-sm text-red-500" />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name='confirmPassword'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel className="text-sm font-semibold text-gray-700">Confirm Password</FormLabel>
//                   <FormControl>
//                     <PasswordInput
//                       placeholder='Confirm your password'
//                       {...field}
//                       className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
//                     />
//                   </FormControl>
//                   <FormMessage className="text-sm text-red-500" />
//                 </FormItem>
//               )}
//             />

//             <Button
//               className='mt-0 h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg'
//               disabled={isLoading}
//               type="submit"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <IconLoader2 className="w-5 h-5 animate-spin" />
//                   Creating Account...
//                 </div>
//               ) : (
//                 'Create Your Account'
//               )}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   )
// }

import { HTMLAttributes, useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2, IconShieldCheck, IconMail } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, Link } from '@tanstack/react-router'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    email:           z.string().min(1, { message: 'Please enter your email' }).email({ message: 'Invalid email address' }),
    password:        z.string().min(1, { message: 'Please enter your password' }).min(7, { message: 'Password must be at least 7 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path:    ['confirmPassword'],
  })

type Stage       = 'form' | 'otp'
type EmailStatus = 'idle' | 'checking' | 'new' | 'google' | 'emailpass'

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [stage, setStage]                 = useState<Stage>('form')
  const [otpValue, setOtpValue]           = useState('')
  const [otpLoading, setOtpLoading]       = useState(false)
  const [otpError, setOtpError]           = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailStatus, setEmailStatus]     = useState<EmailStatus>('idle')
  const [pendingEmail, setPendingEmail]   = useState('')
  const [pendingPassword, setPendingPassword] = useState('')
  const [emailCheckData, setEmailCheckData] = useState<{
  exists: boolean
  provider?: string
  isLinked?: boolean
  hasGoogle?: boolean
} | null>(null)
  const emailCheckRef = useRef<string>('')

  const { toast }  = useToast()
  const navigate   = useNavigate()
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL

  const form = useForm<z.infer<typeof formSchema>>({
    resolver:      zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  // ── Email blur: check what kind of account exists ──────────────────────────
  async function onEmailBlur(email: string) {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return
    if (emailCheckRef.current === trimmed) return // already checked this email
    emailCheckRef.current = trimmed

    setEmailStatus('checking')
    setError(null)

    try {
      const res = await axios.post(`${backendUrl}/vendors/check-email`, { email: trimmed })
      // { exists: false } → new user
      // { exists: true, provider: 'google' } → Google account
      // { exists: true, provider: 'emailpass' } → emailpass account
      const { exists, provider, isLinked, hasGoogle } = res.data
        setEmailCheckData(res.data)
        if (!exists) {
          setEmailStatus('new')
        } else if (provider === 'emailpass') {
          setEmailStatus('emailpass')
        } else {
          setEmailStatus('google')
        }
    } catch {
      setEmailStatus('idle') // silently fail, let submit handle it
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setError(null)

    // Block submit if emailpass account already exists
    if (emailStatus === 'emailpass') return

    // If Google account detected → skip registration, go straight to OTP
    if (emailStatus === 'google') {
      await triggerOtp(data.email, data.password)
      return
    }

    try {
      setIsLoading(true)

      const response = await axios.post(
        `${backendUrl}/auth/vendor/emailpass/register`,
        { email: data.email, password: data.password }
      )

      localStorage.setItem('vendorToken', response.data.token)
      localStorage.setItem('vendorEmail', data.email)
      localStorage.setItem('vendorTokenTimestamp', Date.now().toString())

      toast({ title: 'Account created!', description: 'Redirecting to onboarding...' })
      setTimeout(() => navigate({ to: '/onboarding' }), 800)

    } catch (err: any) {
      const status  = err.response?.status
      const message: string = err.response?.data?.message || ''

      const isConflict =
        status === 409 || status === 422 ||
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('exists') ||
        message.toLowerCase().includes('identity with') ||
        message.toLowerCase().includes('taken')

      if (isConflict) {
        // Re-check what type of conflict (email check may have been 'idle')
        try {
          const checkRes = await axios.post(`${backendUrl}/vendors/check-email`, { email: data.email })
          if (checkRes.data.provider === 'google') {
            await triggerOtp(data.email, data.password)
            return
          }
        } catch (_) {}

        setError('An account with this email already exists. Please sign in or reset your password.')
        return
      }

      setError(message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Trigger OTP send + move to OTP stage ──────────────────────────────────
  async function triggerOtp(email: string, password: string) {
    try {
      setIsLoading(true)
      await axios.post(`${backendUrl}/vendors/send-otp`, { email })
      setPendingEmail(email)
      setPendingPassword(password)
      setStage('otp')
      startResendCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  async function onVerifyOtp() {
    if (otpValue.length !== 6) { setOtpError('Please enter the 6-digit code.'); return }

    try {
      setOtpLoading(true)
      setOtpError(null)

      const res = await axios.post(`${backendUrl}/vendors/verify-otp`, {
        email:    pendingEmail,
        otp:      otpValue,
        password: pendingPassword,
      })

      const { token, isNewVendor } = res.data
      localStorage.setItem('vendorToken', token)
      localStorage.setItem('vendorEmail', pendingEmail)
      localStorage.setItem('vendorTokenTimestamp', Date.now().toString())

      if (isNewVendor) {
        toast({ title: 'Verified!', description: 'Continuing your onboarding...' })
        setTimeout(() => navigate({ to: '/onboarding' }), 800)
      } else {
        toast({ title: 'Welcome back!', description: 'Accounts linked. Taking you to your dashboard...' })
        setTimeout(() => navigate({ to: '/dashboard' }), 800)
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  function startResendCooldown() {
    setResendCooldown(30)
    const t = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(t); return 0 } return prev - 1 })
    }, 1000)
  }

  async function onResendOtp() {
    if (resendCooldown > 0) return
    try {
      await axios.post(`${backendUrl}/vendors/send-otp`, { email: pendingEmail })
      setOtpValue(''); setOtpError(null)
      startResendCooldown()
      toast({ title: 'Code resent!', description: `Check ${pendingEmail} for a new code.` })
    } catch { setOtpError('Failed to resend. Please try again.') }
  }

  // ── OTP Screen ─────────────────────────────────────────────────────────────
  if (stage === 'otp') {
    return (
      <div className={cn('grid gap-5 mt-3 lg:mt-6', className)} {...props}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-3 rounded-full w-14 h-14 bg-orange-50">
            <IconShieldCheck className="w-7 h-7 text-[#e65100]" />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            We sent a 6-digit code to<br />
            <strong className="text-gray-900">{pendingEmail}</strong>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter it below to link your password login to your existing account.
          </p>
        </div>

        <Input
          value={otpValue}
          onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(null) }}
          placeholder="• • • • • •"
          maxLength={6}
          inputMode="numeric"
          className="h-14 text-center text-2xl font-mono tracking-widest border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10"
        />

        {otpError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 -mt-2">
            <IconShieldCheck className="w-4 h-4 shrink-0" />{otpError}
          </p>
        )}

        <Button
          onClick={onVerifyOtp}
          disabled={otpLoading || otpValue.length !== 6}
          className="h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {otpLoading
            ? <span className="flex items-center gap-2"><IconLoader2 className="w-5 h-5 animate-spin" />Verifying...</span>
            : 'Verify & Link Account'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setStage('form'); setOtpValue(''); setOtpError(null) }}
            className="text-gray-400 transition-colors hover:text-gray-600">← Back</button>
          <button type="button" onClick={onResendOtp} disabled={resendCooldown > 0}
            className="text-[#e65100] hover:text-[#d84315] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
            <IconMail className="w-4 h-4" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    )
  }

  // ── Sign-up Form ───────────────────────────────────────────────────────────
  return (
    <div className={cn('grid gap-6 mt-3 lg:mt-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className='grid gap-5'>

            <FormField control={form.control} name='email' render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder='Enter your email address'
                      {...field}
                      onBlur={e => { field.onBlur(); onEmailBlur(e.target.value) }}
                      onChange={e => {
                        field.onChange(e)
                        // Reset status if email changes
                        if (e.target.value !== emailCheckRef.current) {
                          setEmailStatus('idle')
                          emailCheckRef.current = ''
                          setError(null)
                          setEmailCheckData(null)
                        }
                      }}
                      className={cn(
                        "h-12 px-4 text-base border-gray-200 rounded-lg transition-all duration-200 bg-white",
                        emailStatus === 'new'       && "border-green-400 focus:border-green-500 focus:ring-green-100",
                        emailStatus === 'google'    && "border-blue-400 focus:border-blue-500 focus:ring-blue-100",
                        emailStatus === 'emailpass' && "border-red-400 focus:border-red-500 focus:ring-red-100",
                        (emailStatus === 'idle' || emailStatus === 'checking') && "focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10",
                      )}
                    />
                    {/* Status indicator */}
                    {emailStatus === 'checking' && (
                      <div className="absolute -translate-y-1/2 right-3 top-1/2">
                        <IconLoader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                    {emailStatus === 'new' && (
                      <div className="absolute w-2 h-2 -translate-y-1/2 bg-green-400 rounded-full right-3 top-1/2" />
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-sm text-red-500" />

                {/* Inline email status messages */}
                {emailStatus === 'emailpass' && (
                  <div className="p-3 text-sm border rounded-lg bg-amber-50 border-amber-200">
                    <p className="font-medium text-amber-800">You already have an account</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {emailCheckData?.hasGoogle
                        ? <>This email is linked to both Google and password login.{' '}
                            <Link to="/sign-in" className="font-semibold underline hover:text-amber-900">Sign in with password</Link>
                            {', '}
                            <Link to="/sign-in" className="font-semibold underline hover:text-amber-900">use Google</Link>
                            {', or '}
                            <Link to="/forgot-password" className="font-semibold underline hover:text-amber-900">reset your password</Link>.
                          </>
                        : <>This email is registered.{' '}
                            <Link to="/sign-in" className="font-semibold underline hover:text-amber-900">Sign in</Link>
                            {' or '}
                            <Link to="/forgot-password" className="font-semibold underline hover:text-amber-900">reset your password</Link>.
                          </>
                      }
                    </p>
                  </div>
                )}

                {emailStatus === 'google' && (
                  <div className="p-3 text-sm border border-orange-200 rounded-lg bg-orange-50">
                    <p className="font-medium text-orange-800">Google account found</p>
                    <p className="text-orange-700 text-xs mt-0.5">
                      You previously signed up with Google. Fill in your password below and we'll send a verification code to link both logins.
                    </p>
                  </div>
                )}
              </FormItem>
            )} />

            <FormField control={form.control} name='password' render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='Create a strong password' {...field}
                    className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white" />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )} />

            <FormField control={form.control} name='confirmPassword' render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel className="text-sm font-semibold text-gray-700">Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='Confirm your password' {...field}
                    className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-[#e65100]/10 transition-all duration-200 bg-white" />
                </FormControl>
                <FormMessage className="text-sm text-red-500" />
              </FormItem>
            )} />

            {error && (
              <div className="p-3 text-sm text-red-700 border-2 border-red-200 rounded-lg bg-red-50/80">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <Button
              className='mt-0 h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg'
              disabled={isLoading || emailStatus === 'emailpass' || emailStatus === 'checking'}
              type="submit"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  {emailStatus === 'google' ? 'Sending Code...' : 'Creating Account...'}
                </span>
              ) : emailStatus === 'google'
                  ? 'Send Verification Code'
                  : 'Create Your Account'}
            </Button>

          </div>
        </form>
      </Form>
    </div>
  )
}
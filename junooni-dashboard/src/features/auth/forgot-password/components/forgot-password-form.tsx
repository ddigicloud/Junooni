import { HTMLAttributes, useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
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
import axios from 'axios'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { IconLoader2 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>
type EmailStatus = 'idle' | 'checking' | 'new' | 'google' | 'emailpass'

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email address' })
    .email({ message: 'Please enter a valid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading]       = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailStatus, setEmailStatus]   = useState<EmailStatus>('idle')
  const emailCheckRef                   = useRef<string>('')
  const backendUrl                      = import.meta.env.VITE_MEDUSA_BACKEND_URL

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '' },
  })

  // ── Email blur: same check as sign-up ─────────────────────────────────────
  async function onEmailBlur(email: string) {
  const trimmed = email.trim().toLowerCase()
  console.log('[ForgotForm] onEmailBlur triggered | email:', trimmed)
  
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    console.log('[ForgotForm] email invalid or empty — skipping check')
    return
  }
  if (emailCheckRef.current === trimmed) {
    console.log('[ForgotForm] same email as last check — skipping')
    return
  }
  emailCheckRef.current = trimmed
  setEmailStatus('checking')

  try {
    const res = await axios.post(`${backendUrl}/vendors/check-email`, { email: trimmed })
    console.log('[ForgotForm] check-email response:', res.data)
    const { exists, provider } = res.data

    if (!exists) {
      console.log('[ForgotForm] → new user')
      setEmailStatus('new')
    } else if (provider === 'emailpass') {
      console.log('[ForgotForm] → emailpass account')
      setEmailStatus('emailpass')
    } else {
      console.log('[ForgotForm] → google account')
      setEmailStatus('google')
    }
  } catch (e) {
    console.log('[ForgotForm] check-email error:', e)
    setEmailStatus('idle')
  }
}

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('[ForgotForm] onSubmit | emailStatus:', emailStatus)
    // Block if Google-only account — message already shown inline
    if (emailStatus === 'google') return

    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await axios.post(
        `${backendUrl}/auth/vendor/emailpass/reset-password`,
        { identifier: data.identifier }
      )

      const token = response.data.token
      localStorage.setItem('vendorToken', token)

      setSuccessMessage(
        'Password reset instructions have been sent to your email address. Please check your inbox and spam folder.'
      )
      form.reset()
      setEmailStatus('idle')
      emailCheckRef.current = ''
    } catch (error: any) {
      console.error('Password reset request error:', error)
      setErrorMessage(
        error.response?.data?.message ||
          'Unable to send reset email. Please check your email address and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Success Alert */}
      {successMessage && (
        <Alert className="text-green-800 border-green-200 shadow-sm bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="font-medium">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="text-red-800 border-red-200 shadow-sm bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      placeholder="Enter your email address"
                      className={cn(
                        'pl-11 h-12 border-gray-200 transition-all duration-200 text-gray-900 placeholder:text-gray-500',
                        emailStatus === 'google'    && 'border-blue-400 focus:border-blue-500',
                        emailStatus === 'emailpass' && 'border-green-400 focus:border-green-500',
                        emailStatus === 'new'       && 'border-gray-300',
                        (emailStatus === 'idle' || emailStatus === 'checking') &&
                          'focus:border-[#e65100] focus:ring-[#e65100] focus:ring-2 focus:ring-opacity-20',
                      )}
                      {...field}
                      onBlur={e => { field.onBlur(); onEmailBlur(e.target.value) }}
                      onChange={e => {
                        field.onChange(e)
                        if (e.target.value.trim().toLowerCase() !== emailCheckRef.current) {
                          setEmailStatus('idle')
                          emailCheckRef.current = ''
                          setErrorMessage('')
                          setSuccessMessage('')
                        }
                      }}
                      disabled={isLoading}
                    />
                    {/* Spinner while checking */}
                    {emailStatus === 'checking' && (
                      <div className="absolute -translate-y-1/2 right-3 top-1/2">
                        <IconLoader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-sm text-red-600" />

                {/* Google-only account — inline block, same style as sign-up */}
                {emailStatus === 'google' && (
                  <div className="p-3 text-sm border border-orange-200 rounded-lg bg-orange-50">
                    <p className="font-medium text-orange-800">This account uses Google Sign-In</p>
                    <p className="text-orange-700 text-xs mt-0.5">
                      Your account was created with Google and doesn't have a password.{' '}
                      <Link
                        to="/sign-in"
                        className="font-semibold underline hover:text-orange-900"
                      >
                        Sign in with Google
                      </Link>
                      {' instead, or '}
                      <Link
                        to="/sign-up"
                        className="font-semibold underline hover:text-orange-900"
                      >
                        set a password on the sign-up page
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {/* No account found */}
                {emailStatus === 'new' && (
                  <div className="p-3 text-sm border border-amber-200 rounded-lg bg-amber-50">
                    <p className="font-medium text-amber-800">No account found</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      We don't recognise this email.{' '}
                      <Link
                        to="/sign-up"
                        className="font-semibold underline hover:text-amber-900"
                      >
                        Create an account
                      </Link>
                      {' instead.'}
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading || emailStatus === 'google' || emailStatus === 'checking' || emailStatus === 'new'}
            className="w-full h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
import { HTMLAttributes, useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import { PasswordInput } from '@/components/password-input'
import axios from 'axios'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Shield } from 'lucide-react'

type ResetPasswordFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  password: z
    .string()
    .min(1, { message: 'Please enter your new password' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function ResetPasswordForm({ className, ...props }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const navigate = useNavigate()

  // Get token and email from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setToken(searchParams.get('token'))
    setEmail(searchParams.get('email'))
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token || !email) {
      setErrorMessage('Reset link is invalid or incomplete. Please use the link from your email.')
      return
    }

    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await axios.post(
        `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/update?token=` + token,
        {
          email,
          password: data.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setSuccessMessage('Your password has been successfully reset!')
      setTimeout(() => {
        navigate({ to: '/sign-in' })
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className={cn('grid gap-6', className)} {...props}>
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Invalid Reset Link</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The password reset link is invalid or has expired
            </p>
          </div>
          <Button 
            onClick={() => navigate({ to: '/sign-in' })} 
            className="w-full"
            style={{ backgroundColor: '#e65100' }}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full" style={{ backgroundColor: '#e6510020' }}>
          <Shield className="w-6 h-6" style={{ color: '#e65100' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter a new password for {email}
          </p>
        </div>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Enter your new password' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Confirm your new password' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              className='mt-2' 
              disabled={isLoading || !!successMessage} 
              type="submit"
              style={{ backgroundColor: '#e65100' }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate({ to: '/sign-in' })}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
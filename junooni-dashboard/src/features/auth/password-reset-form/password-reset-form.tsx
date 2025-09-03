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
import { Alert, AlertDescription } from '@/components/ui/alert'

type CreatorResetPasswordFormProps = HTMLAttributes<HTMLDivElement>

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

export function CreatorResetPasswordForm({ className, ...props }: CreatorResetPasswordFormProps) {
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
      const response = await fetch(
        `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/update?token=` + token,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password: data.password,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reset password')
      }

      setSuccessMessage('Your password has been successfully reset!')
      
      // Clear the form
      form.reset()
      
      // Redirect to profile page after success
      setTimeout(() => {
        navigate({ to: '/profile' })
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setErrorMessage(error.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="mb-4 text-center">
        <h1 className="mb-2 text-2xl font-bold" style={{ color: '#ac1900' }}>
          Reset Your Password
        </h1>
        <p className="text-gray-600">
          Enter your new password below to secure your creator account.
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">
            {successMessage}
            <br />
            <span className="text-sm">Redirecting you to your profile...</span>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!token || !email ? (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">
            The password reset link is invalid or has expired. Please request a new one from your profile settings.
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='Enter your new password' {...field} />
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
                      <PasswordInput placeholder='Confirm your new password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                className='mt-4' 
                disabled={isLoading} 
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #e65100 0%, #ac1900 100%)',
                  color: 'white'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-b-transparent" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Back to your{' '}
          <a 
            href="/profile" 
            className="text-orange-600 underline hover:text-orange-700"
          >
            Creator Profile
          </a>
        </p>
      </div>
    </div>
  )
}
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
        'http://localhost:9000/auth/vendor/emailpass/update?token=' + token,
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

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!token || !email ? (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription>
            The password reset link is invalid or has expired. Please request a new one.
          </AlertDescription>
        </Alert>
      ) : (
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
                      <PasswordInput placeholder='********' {...field} />
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
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading} type="submit">
                {isLoading ? 'Processing...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}

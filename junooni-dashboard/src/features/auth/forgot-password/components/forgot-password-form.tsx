import { HTMLAttributes, useState } from 'react'
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

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
    // Make API call to reset password endpoint
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/reset-password`, {
      identifier: data.identifier,
    })
      // ✅ Save the token returned from backend
      const token = response.data.token // Adjust based on actual API shape
      localStorage.setItem('vendorToken', token)
      
      // Show success message
      setSuccessMessage('If an account exists with this email, you will receive password reset instructions shortly.')
      form.reset() // Clear the form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Password reset request error:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to send password reset email. Please try again.')
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
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='identifier'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading} type="submit">
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
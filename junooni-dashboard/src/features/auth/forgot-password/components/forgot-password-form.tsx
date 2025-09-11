// import { HTMLAttributes, useState } from 'react'
// import { z } from 'zod'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { cn } from '@/lib/utils'
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
// import axios from 'axios'
// import { Alert, AlertDescription } from '@/components/ui/alert'

// type ForgotFormProps = HTMLAttributes<HTMLDivElement>

// const formSchema = z.object({
//   identifier: z
//     .string()
//     .min(1, { message: 'Please enter your email' })
//     .email({ message: 'Invalid email address' }),
// })

// export function ForgotForm({ className, ...props }: ForgotFormProps) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [successMessage, setSuccessMessage] = useState('')
//   const [errorMessage, setErrorMessage] = useState('')

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { identifier: '' },
//   })

//   async function onSubmit(data: z.infer<typeof formSchema>) {
//     setIsLoading(true)
//     setSuccessMessage('')
//     setErrorMessage('')
    
//     try {
//     // Make API call to reset password endpoint
//       const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/reset-password`, {
//       identifier: data.identifier,
//     })
//       // ✅ Save the token returned from backend
//       const token = response.data.token // Adjust based on actual API shape
//       localStorage.setItem('vendorToken', token)
      
//       // Show success message
//       setSuccessMessage('If an account exists with this email, you will receive password reset instructions shortly.')
//       form.reset() // Clear the form
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       // eslint-disable-next-line no-console
//       console.error('Password reset request error:', error)
//       setErrorMessage(error.response?.data?.message || 'Failed to send password reset email. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className={cn('grid gap-6', className)} {...props}>
//       {successMessage && (
//         <Alert className="border-green-500 bg-green-50">
//           <AlertDescription>{successMessage}</AlertDescription>
//         </Alert>
//       )}

//       {errorMessage && (
//         <Alert className="border-red-500 bg-red-50">
//           <AlertDescription>{errorMessage}</AlertDescription>
//         </Alert>
//       )}
      
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)}>
//           <div className='grid gap-2'>
//             <FormField
//               control={form.control}
//               name='identifier'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder='name@example.com' {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button className='mt-2' disabled={isLoading} type="submit">
//               {isLoading ? 'Processing...' : 'Continue'}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   )
// }

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
import { Mail, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email address' })
    .email({ message: 'Please enter a valid email address' }),
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
      
      // Save the token returned from backend
      const token = response.data.token // Adjust based on actual API shape
      localStorage.setItem('vendorToken', token)
      
      // Show success message
      setSuccessMessage('Password reset instructions have been sent to your email address. Please check your inbox and spam folder.')
      form.reset() // Clear the form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Password reset request error:', error)
      setErrorMessage(error.response?.data?.message || 'Unable to send reset email. Please check your email address and try again.')
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
          <AlertDescription className="font-medium">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="text-red-800 border-red-200 shadow-sm bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="font-medium">
            {errorMessage}
          </AlertDescription>
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
                      className="pl-11 h-12 border-gray-200 focus:border-[#e65100] focus:ring-[#e65100] focus:ring-2 focus:ring-opacity-20 transition-all duration-200 text-gray-900 placeholder:text-gray-500"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
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

          {/* Security note */}
          {/* <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-medium">Security Notice</p>
                <p className="text-blue-700">
                  For your security, the reset link will expire in 15 minutes. If you don't receive an email, please check your spam folder.
                </p>
              </div>
            </div>
          </div> */}
        </form>
      </Form>
    </div>
  )
}
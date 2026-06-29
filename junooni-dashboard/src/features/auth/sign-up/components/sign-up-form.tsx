import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandFacebook, IconBrandGithub, IconLoader2 } from '@tabler/icons-react'
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
import { useNavigate } from '@tanstack/react-router'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Please enter your email' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(1, {
        message: 'Please enter your password',
      })
      .min(7, {
        message: 'Password must be at least 7 characters long',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Submitting data:', data)
      
      // Use axios just like in your login form
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/register`, {
        email: data.email,
        password: data.password
      })
      
      console.log('Response data:', response.data)
      
      // Save token exactly like your login form does
      localStorage.setItem('vendorToken', response.data.token)
      
      // IMPORTANT: Also save the email for use in onboarding
      localStorage.setItem('vendorEmail', data.email)
      
      // Show success notification
      toast({
        title: "Account created successfully",
        description: "Redirecting you to the onboarding process...",
      })
      
      // Redirect to onboarding or dashboard
      setTimeout(() => {
        navigate({ to: '/onboarding' })
      }, 1000)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6 mt-3 lg:mt-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className='grid gap-5'>
            {error && (
              <div className="p-4 text-sm text-red-700 border-2 border-red-200 rounded-lg bg-red-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Enter your email address' 
                      {...field} 
                      className="h-12 px-4 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Create a strong password' 
                      {...field} 
                      className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Confirm your password' 
                      {...field} 
                      className="h-10 px-0 text-base border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            
            <Button 
              className='mt-0 h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg' 
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Create Your Account'
              )}
            </Button>

          </div>
        </form>
      </Form>
    </div>
  )
}
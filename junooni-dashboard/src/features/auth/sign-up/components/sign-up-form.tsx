import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
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

    // async function onSubmit(data: z.infer<typeof formSchema>) {
    //   setIsLoading(true)
    //   try {
    //     const response = await axios.post('http://localhost:9000/auth/vendor/emailpass/register', {
    //       email: data.email,
    //       password: data.password,
    //     })
  
    //     // Save token from Medusa API response and navigate to dashboard
    //     localStorage.setItem('vendorToken', response.data.token)
    //     alert('Login successful!')
    //     navigate({ to: '/onboarding' }) // Adjust the path if necessary
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   } catch (error: any) {
    //     // eslint-disable-next-line no-console
    //     console.error('Login error:', error)
    //     alert(error.response?.data?.message || 'Invalid email or password.')
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    async function onSubmit(data: z.infer<typeof formSchema>) {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Submitting data:', data)
        
        // Use axios just like in your login form
        const response = await axios.post('http://localhost:9000/auth/vendor/emailpass/register', {
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
        
      } catch (error) {
        console.error('Registration error:', error)
        const errorMessage = error.response?.data?.message || 'An unknown error occurred'
        setError(errorMessage)
      }
    }
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            {error && (
              <div className="p-3 mb-3 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
                {error}
              </div>
            )}
            
            <FormField
              control={form.control}
              name='email'
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
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Password</FormLabel>
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='px-2 bg-background text-muted-foreground'>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGithub className='w-4 h-4' /> GitHub
              </Button>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
              >
                <IconBrandFacebook className='w-4 h-4' /> Facebook
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
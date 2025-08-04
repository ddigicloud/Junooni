// import { HTMLAttributes, useState } from 'react'
// import { z } from 'zod'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
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
//       .min(1, {
//         message: 'Please enter your password',
//       })
//       .min(7, {
//         message: 'Password must be at least 7 characters long',
//       }),
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

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//       confirmPassword: '',
//     },
//   })

//     // async function onSubmit(data: z.infer<typeof formSchema>) {
//     //   setIsLoading(true)
//     //   try {
//     //     const response = await axios.post('http://localhost:9000/auth/vendor/emailpass/register', {
//     //       email: data.email,
//     //       password: data.password,
//     //     })
  
//     //     // Save token from Medusa API response and navigate to dashboard
//     //     localStorage.setItem('vendorToken', response.data.token)
//     //     alert('Login successful!')
//     //     navigate({ to: '/onboarding' }) // Adjust the path if necessary
//     //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     //   } catch (error: any) {
//     //     // eslint-disable-next-line no-console
//     //     console.error('Login error:', error)
//     //     alert(error.response?.data?.message || 'Invalid email or password.')
//     //   } finally {
//     //     setIsLoading(false)
//     //   }
//     // }
//     async function onSubmit(data: z.infer<typeof formSchema>) {
//       try {
//         setIsLoading(true)
//         setError(null)
        
//         console.log('Submitting data:', data)
        
//         // Use axios just like in your login form
//         const response = await axios.post('http://localhost:9000/auth/vendor/emailpass/register', {
//           email: data.email,
//           password: data.password
//         })
        
//         console.log('Response data:', response.data)
        
//         // Save token exactly like your login form does
//         localStorage.setItem('vendorToken', response.data.token)
        
//         // IMPORTANT: Also save the email for use in onboarding
//         localStorage.setItem('vendorEmail', data.email)
        
//         // Show success notification
//         toast({
//           title: "Account created successfully",
//           description: "Redirecting you to the onboarding process...",
//         })
        
//         // Redirect to onboarding or dashboard
//         setTimeout(() => {
//           navigate({ to: '/onboarding' })
//         }, 1000)
        
//       } catch (error) {
//         console.error('Registration error:', error)
//         const errorMessage = error.response?.data?.message || 'An unknown error occurred'
//         setError(errorMessage)
//       }
//     }
//   return (
//     <div className={cn('grid gap-6', className)} {...props}>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)}>
//           <div className='grid gap-2'>
//             {error && (
//               <div className="p-3 mb-3 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
//                 {error}
//               </div>
//             )}
            
//             <FormField
//               control={form.control}
//               name='email'
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
//             <FormField
//               control={form.control}
//               name='password'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <PasswordInput placeholder='********' {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name='confirmPassword'
//               render={({ field }) => (
//                 <FormItem className='space-y-1'>
//                   <FormLabel>Confirm Password</FormLabel>
//                   <FormControl>
//                     <PasswordInput placeholder='********' {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button className='mt-2' disabled={isLoading}>
//               {isLoading ? 'Creating Account...' : 'Create Account'}
//             </Button>

//             <div className='relative my-2'>
//               <div className='absolute inset-0 flex items-center'>
//                 <span className='w-full border-t' />
//               </div>
//               <div className='relative flex justify-center text-xs uppercase'>
//                 <span className='px-2 bg-background text-muted-foreground'>
//                   Or continue with
//                 </span>
//               </div>
//             </div>

//             <div className='flex items-center gap-2'>
//               <Button
//                 variant='outline'
//                 className='w-full'
//                 type='button'
//                 disabled={isLoading}
//               >
//                 <IconBrandGithub className='w-4 h-4' /> GitHub
//               </Button>
//               <Button
//                 variant='outline'
//                 className='w-full'
//                 type='button'
//                 disabled={isLoading}
//               >
//                 <IconBrandFacebook className='w-4 h-4' /> Facebook
//               </Button>
//             </div>
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
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6 mt-6', className)} {...props}>
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
                <FormItem className='space-y-2'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Enter your email address' 
                      {...field} 
                      className="h-12 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Create a strong password' 
                      {...field} 
                      className="h-10 px-0 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Confirm your password' 
                      {...field} 
                      className="h-10 px-0 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            
            <Button 
              className='mt-6 h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg' 
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

            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-gray-200' />
              </div>
              <div className='relative flex justify-center text-sm uppercase'>
                <span className='px-4 bg-white text-gray-500 font-medium tracking-wide'>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                className='w-full h-12 border-2 border-gray-200 hover:border-[#e65100] hover:bg-[#e65100]/5 text-gray-700 hover:text-[#e65100] font-medium transition-all duration-200 rounded-lg'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGithub className='w-5 h-5 mr-2' /> 
                GitHub
              </Button>
              <Button
                variant='outline'
                className='w-full h-12 border-2 border-gray-200 hover:border-[#e65100] hover:bg-[#e65100]/5 text-gray-700 hover:text-[#e65100] font-medium transition-all duration-200 rounded-lg'
                type='button'
                disabled={isLoading}
              >
                <IconBrandFacebook className='w-5 h-5 mr-2' /> 
                Facebook
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { IconBrandFacebook, IconBrandGithub, IconLoader2 } from '@tabler/icons-react'
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
import { PasswordInput } from '@/components/password-input'
import axios from 'axios'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Please enter your password' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
})

// Simple function to decode JWT token and check for actor_id
const decodeTokenAndCheckActorId = (token: string) => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      //console.error('Invalid JWT token format');
      return { hasActorId: false, payload: null, isValid: false };
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    //console.log('🔍 Token payload:', payload);
    
    // Check if actor_id exists in the token
    const hasActorId = !!(payload.actor_id || payload.actorId || payload.actor);
    
    // console.log('🎭 Actor ID check:', { 
    //   hasActorId, 
    //   actor_id: payload.actor_id,
    //   actorId: payload.actorId,
    //   actor: payload.actor 
    // });

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < currentTime : false;

    return {
      hasActorId,
      payload,
      isValid: true,
      isExpired,
      actorId: payload.actor_id || payload.actorId || payload.actor
    };

  } catch (error) {
    //console.error('❌ Error decoding JWT token:', error);
    return { hasActorId: false, payload: null, isValid: false, isExpired: true };
  }
};

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      //console.log('🔐 Attempting vendor login...');
      
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass`, {
        email: data.email,
        password: data.password,
      })

      //console.log('✅ Login response:', response.data);

      const token = response.data.token;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Save token and email to localStorage
      localStorage.setItem('vendorToken', token);
      localStorage.setItem('vendorEmail', data.email);
      
      //console.log('💾 Token saved to localStorage');

      // 🎭 CHECK FOR ACTOR ID IN TOKEN
      //console.log('🔍 Checking for actor_id in token...');
      const tokenCheck = decodeTokenAndCheckActorId(token);
      
      if (!tokenCheck.isValid) {
        throw new Error('Invalid token received from server');
      }

      if (tokenCheck.isExpired) {
        throw new Error('Token is expired');
      }

      // Set navigation tracking for onboarding page
      sessionStorage.setItem('navigationSource', 'sign-in');

      // 🚀 ROUTE BASED ON ACTOR ID PRESENCE
      if (tokenCheck.hasActorId) {
        //console.log('🏠 Actor ID found in token → Redirecting to Dashboard');
        //console.log('🎭 Actor ID:', tokenCheck.actorId);
        
        alert('Welcome back! Redirecting to your dashboard...');
        navigate({ to: '/dashboard' });
        
      } else {
        //console.log('📝 No Actor ID found in token → Redirecting to Onboarding');
        
        alert('Welcome! Let\'s complete your profile setup...');
        navigate({ 
          to: '/onboarding',
          search: { 
            step: 'basic-info'
          }
        });
      }

    } catch (error: any) {
      //console.error('❌ Login error:', error);
      
      // Clear any stored data on error
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorEmail');
      sessionStorage.removeItem('navigationSource');
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6 mt-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className='grid gap-5'>
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
                  <div className='flex items-center justify-between'>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Password
                    </FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput 
                      placeholder='Enter your password' 
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
              type='submit'
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In to Your Account'
              )}
            </Button>

            <div className='relative my-1'>
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
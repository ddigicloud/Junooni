// import { Card } from '@/components/ui/card'
// import { Link } from '@tanstack/react-router'
// import AuthLayout from '../auth-layout'
// import { UserAuthForm } from './components/user-auth-form'

// export default function SignIn() {
//   return (
//     <AuthLayout>
//       <div className="relative">
//         {/* Brand accent line */}
//         <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#e65100] to-[#ff8a50] rounded-full shadow-lg"></div>
        
//         <Card className='relative max-w-md p-8 mx-auto overflow-hidden bg-white border-0 shadow-2xl rounded-2xl'>
//           {/* Subtle gradient overlay */}
//           <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e65100]/30 to-transparent"></div>
          
//           <div className='flex flex-col mb-2 space-y-3 text-center'>
//             <h1 className='mb-2 text-3xl font-bold tracking-tight text-gray-900'>
//               Welcome Back
//             </h1>
//             <p className='max-w-sm mx-auto text-base leading-relaxed text-gray-600'>
//               Sign in to your account to continue to your dashboard
//             </p>
//           </div>
          
//           <UserAuthForm />
          
//           {/* Enhanced footer with better styling */}
//           <div className='pt-6 mt-2 border-t border-gray-100'>
//             <p className='text-sm leading-relaxed text-center text-gray-500'>
//               By signing in, you agree to our{' '}
//               <Link
//                 to='/terms'
//                 className='font-medium text-[#e65100] hover:text-[#d84315] underline underline-offset-2 transition-colors duration-200'
//               >
//                 Terms of Service
//               </Link>{' '}
//               and{' '}
//               <Link
//                 to='/privacy'
//                 className='font-medium text-[#e65100] hover:text-[#d84315] underline underline-offset-2 transition-colors duration-200'
//               >
//                 Privacy Policy
//               </Link>
//             </p>
            
//             {/* Sign up link */}
//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <Link
//                   to='/sign-up'
//                   className='font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline'
//                 >
//                   Create one here
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </Card>
        
//         {/* Decorative elements */}
//         <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#e65100]/10 to-transparent rounded-full blur-xl"></div>
//         <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-bl from-[#ff8a50]/10 to-transparent rounded-full blur-xl"></div>
//       </div>
//     </AuthLayout>
//   )
// }

import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LockKeyhole, Mail, Loader2, CheckCircle, XCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JunooniLogo from "@/assets/junooni-favicon.png";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import CreatorJunooni from '../../../assets/creator_merch.png';

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Please enter your password' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

// Simple function to decode JWT token and check for actor_id
const decodeTokenAndCheckActorId = (token: string) => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
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
    
    console.log('🔍 Token payload:', payload);
    
    // Check if actor_id exists in the token
    const hasActorId = !!(payload.actor_id || payload.actorId || payload.actor);
    
    console.log('🎭 Actor ID check:', { 
      hasActorId, 
      actor_id: payload.actor_id,
      actorId: payload.actorId,
      actor: payload.actor 
    });

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
    console.error('❌ Error decoding JWT token:', error);
    return { hasActorId: false, payload: null, isValid: false, isExpired: true };
  }
};

export default function JunooniLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });
  const navigate = useNavigate();

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting vendor login...');
      
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass`, {
        email: data.email,
        password: data.password,
      });

      console.log('✅ Login response:', response.data);

      const token = response.data.token;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Save token and email to localStorage
      localStorage.setItem('vendorToken', token);
      localStorage.setItem('vendorEmail', data.email);
      
      console.log('💾 Token saved to localStorage');

      // 🎭 CHECK FOR ACTOR ID IN TOKEN
      console.log('🔍 Checking for actor_id in token...');
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
        console.log('🏠 Actor ID found in token → Redirecting to Dashboard');
        console.log('🎭 Actor ID:', tokenCheck.actorId);
        
        showToast('success', 'Welcome back!', 'Redirecting to your dashboard...');
        // Delay navigation to show the toast
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
        
      } else {
        console.log('📝 No Actor ID found in token → Redirecting to Onboarding');
        
        showToast('success', 'Welcome to Junooni!', 'Let\'s complete your profile setup...');
        // Delay navigation to show the toast
        setTimeout(() => {
          navigate({ 
            to: '/onboarding',
            search: { 
              step: 'basic-info'
            }
          });
        }, 1500);
      }

    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Clear any stored data on error
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorEmail');
      sessionStorage.removeItem('navigationSource');
      
      let errorTitle = 'Sign In Failed';
      let errorMessage = 'Please check your credentials and try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorTitle = 'Invalid Credentials';
        errorMessage = 'The email or password you entered is incorrect.';
      } else if (error.response?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Our servers are experiencing issues. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast('error', errorTitle, errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="relative w-full min-h-screen">
      {/* Professional Toast Notification */}
      {toast.show && (
        <div 
          className="fixed z-50 w-full max-w-md top-4 right-4"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className={`
            relative p-4 rounded-xl shadow-2xl border backdrop-blur-lg transform transition-all duration-300 ease-out
            ${toast.type === 'success' 
              ? 'bg-orange-50/95 border-orange-200 text-orange-800' 
              : toast.type === 'error' 
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-orange-50/95 border-orange-200 text-orange-800'
            }
          `}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                )}
                {toast.type === 'error' && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {toast.type === 'info' && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {toast.title}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {toast.message}
                </p>
              </div>
              
              <button
                onClick={hideToast}
                className="flex-shrink-0 p-1 ml-2 transition-colors duration-200 rounded-lg hover:bg-black/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div 
              className={`
                absolute bottom-0 left-0 h-1 rounded-b-xl
                ${toast.type === 'success' 
                  ? 'bg-orange-500' 
                  : toast.type === 'error' 
                  ? 'bg-red-500'
                  : 'bg-blue-500'
                }
              `} 
              style={{
                width: '100%',
                animation: 'shrinkWidth 5s linear forwards'
              }}
            />
          </div>
        </div>
      )}

      <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Enhanced Branded Section */}
        <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
          {/* Main background image with enhanced overlay */}
          <div 
            className="absolute inset-0 bg-center bg-no-repeat bg-cover" 
            style={{ 
              backgroundImage: `url(${CreatorJunooni})`,
              filter: 'brightness(0.85) contrast(1.1)' 
            }}
          />
          
          {/* Enhanced gradient overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
          
          {/* Subtle animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating elements with subtle animation */}
            <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>
              👕
            </div>
            
            <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>
              🧢
            </div>
            
            <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>
              ✨
            </div>
            
            <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>
              ❤️
            </div>
            
            {/* Geometric shapes */}
            <div className="absolute top-[20%] right-[30%] w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
            <div className="absolute bottom-[30%] right-[25%] w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1500ms' }} />
          </div>
          
          {/* Content container with enhanced styling */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Enhanced Branding */}
            <div className="flex items-center gap-4 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-[#e65100] shadow-xl">
                <img src={JunooniLogo} alt="Junooni Logo" className="w-12 h-12 lg:h-11 sm:h-8 lg:w-11" />
              </div>
              <h1 className="text-3xl font-black tracking-wide text-white drop-shadow-2xl">JUNOONI</h1>
            </div>
            
            {/* Centered Content with enhanced design */}
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
              <div className="p-4 mb-12 border shadow-2xl rounded-3xl bg-white/10 backdrop-blur-sm border-white/20">
                <svg 
                  width="120" 
                  height="120" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mx-auto drop-shadow-2xl"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              
              <div className="max-w-lg p-4 mt-8 border shadow-xl bg-black/10 backdrop-blur-sm rounded-2xl border-white/10">
                <h2 className="mb-6 text-4xl font-black text-white drop-shadow-2xl">Creator Dashboard</h2>
                <p className="max-w-md text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
                  Turn your passion into profit. Create, manage, and grow your business all in one place.
                </p>
                
                <div className="grid grid-cols-3 gap-6 mt-10">
                  <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                    <div className="text-3xl font-black text-white drop-shadow-lg">1000+</div>
                    <div className="mt-1 text-sm font-medium text-white/90">Active creators</div>
                  </div>
                  <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                    <div className="text-3xl font-black text-white drop-shadow-lg">₹10M+</div>
                    <div className="mt-1 text-sm font-medium text-white/90">Revenue generated</div>
                  </div>
                  <div className="flex flex-col items-center p-4 border bg-white/10 rounded-xl backdrop-blur-sm border-white/20">
                    <div className="text-3xl font-black text-white drop-shadow-lg">50k+</div>
                    <div className="mt-1 text-sm font-medium text-white/90">Happy customers</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Footer Quote */}
            <div className="p-8">
              <blockquote className="p-6 border border-l-4 shadow-xl bg-black/20 backdrop-blur-lg rounded-2xl border-white/10 border-l-white">
                <p className="text-lg italic font-medium leading-relaxed text-white">
                  "Your passion fuels our universe—log in and become a part of the creator verse."
                </p>
                <footer className="mt-3 text-base font-semibold text-white/95">
                  — Junooni Team
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Enhanced Login Form */}
        <div className="flex flex-col items-center justify-center h-screen px-6 pt-12 bg-gradient-to-br from-gray-50 to-white pb-28">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo - Enhanced */}
            <div className="flex items-center justify-center gap-3 mt-4 mb-10 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-lg"> 
                <span className="text-2xl font-black">J</span>
              </div>
              <h1 className="text-3xl font-black text-[#e65100]">JUNOONI</h1>
            </div>
            
            {/* Enhanced Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-base leading-relaxed text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Enhanced Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                          <Input 
                            placeholder="creator@junooni.com" 
                            type="email" 
                            autoCapitalize="none" 
                            autoComplete="email" 
                            autoCorrect="off" 
                            className="pl-12 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                
                {/* Enhanced Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                        <Link 
                          to="/forgot-password" 
                          className="text-sm font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                          <Input 
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"} 
                            className="pl-12 pr-12 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white" 
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e65100] transition-colors duration-200"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                
                {/* Enhanced Remember Me */}
                {/* <div className="flex items-center space-x-3">
                  <Checkbox id="remember" className="border-2 border-gray-300 data-[state=checked]:bg-[#e65100] data-[state=checked]:border-[#e65100]" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Remember me for 30 days
                  </label>
                </div> */}
                
                {/* Enhanced Sign In Button */}
                <Button 
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
              
            {/* Enhanced Divider */}
            {/* <div className="relative flex items-center justify-center my-6">
              <Separator className="w-full bg-gray-200" />
              <span className="absolute px-4 text-sm font-medium text-gray-500 bg-white">OR</span>
            </div> */}
            
            {/* Enhanced Google Button */}
              {/* <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 border-gray-200 hover:border-[#e65100] hover:bg-[#e65100]/5 text-gray-700 hover:text-[#e65100] font-medium transition-all duration-200 rounded-lg"
                  disabled={isLoading}
                  type="button"
                >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </Button> */}
            
            {/* Enhanced Footer Links */}
            <div className="mt-8 space-y-4 text-center">
              <p className="text-base text-gray-600">
                Don't have an account?{" "}
                <Link to="/sign-up" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                  Sign up
                </Link>
              </p>
              
              {/* <p className="max-w-sm mx-auto text-sm leading-relaxed text-gray-500">
                By clicking sign in, you agree to our{" "}
                <Link to="/terms" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                  Privacy Policy
                </Link>
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
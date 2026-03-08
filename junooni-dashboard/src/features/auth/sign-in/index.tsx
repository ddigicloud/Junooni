import { useState, useEffect } from 'react';
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
import JunooniFavicon from '../../../assets/junooni-favicon.png'
import Junoonilogo from '../../../assets/junooni_logo_brand_color.png'
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
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { hasActorId: false, payload: null, isValid: false };
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const hasActorId = !!(payload.actor_id || payload.actorId || payload.actor);
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

  // ─── IMPERSONATION AUTO-LOGIN ────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const impersonateToken = params.get('impersonate')

    if (!impersonateToken) return

    console.log('[Impersonate] Token detected in URL, auto-logging in...')

    const tokenCheck = decodeTokenAndCheckActorId(impersonateToken)

    if (!tokenCheck.isValid) {
      showToast('error', 'Invalid Token', 'The impersonation token is invalid.')
      return
    }

    if (tokenCheck.isExpired) {
      showToast('error', 'Token Expired', 'The impersonation session has expired. Please try again from the admin panel.')
      return
    }

    // ✅ FIX 1: Clear ALL previous vendor session data first
    // localStorage is shared across tabs on the same origin —
    // without this, switching vendors keeps the old vendor's token
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendorTokenTimestamp')
    localStorage.removeItem('vendorEmail')
    localStorage.removeItem('isAdminImpersonation')

    // Store new token fresh
    localStorage.setItem('vendorToken', impersonateToken)
    localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
    localStorage.setItem('isAdminImpersonation', 'true')

    // Clean token from URL so it's not visible or accidentally shared
    window.history.replaceState({}, '', '/sign-in')

    // ✅ FIX 2: Route based on actor_id
    // hasActorId = true  → existing vendor    → /dashboard
    // hasActorId = false → incomplete vendor  → /onboarding
    if (tokenCheck.hasActorId) {
      console.log('[Impersonate] Existing vendor → dashboard')
      showToast('success', 'Admin Access', 'Entering vendor dashboard...')
      setTimeout(() => navigate({ to: '/dashboard' }), 800)
    } else {
      console.log('[Impersonate] Incomplete vendor → onboarding')
      showToast('success', 'Admin Access', 'Entering vendor onboarding...')
      setTimeout(() => navigate({ to: '/onboarding', search: { step: 'basic-info' } }), 800)
    }
  }, [])
  // ─────────────────────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
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
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass`, {
        email: data.email,
        password: data.password,
      });

      const token = response.data.token;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem("vendorToken", token);
      localStorage.setItem("vendorTokenTimestamp", Date.now().toString());
      localStorage.setItem('vendorEmail', data.email);

      const tokenCheck = decodeTokenAndCheckActorId(token);
      
      if (!tokenCheck.isValid) {
        throw new Error('Invalid token received from server');
      }

      if (tokenCheck.isExpired) {
        throw new Error('Token is expired');
      }

      sessionStorage.setItem('navigationSource', 'sign-in');

      if (tokenCheck.hasActorId) {
        showToast('success', 'Welcome back!', 'Redirecting to your dashboard...');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      } else {
        showToast('success', 'Welcome to Junooni!', 'Let\'s complete your profile setup...');
        setTimeout(() => {
          navigate({ 
            to: '/onboarding',
            search: { step: 'basic-info' }
          });
        }, 1500);
      }

    } catch (error: any) {
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
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed z-50 w-full max-w-md -translate-x-1/2 top-4 right-4 lg:right-4 lg:left-auto left-1/2 lg:translate-x-0"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
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
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-orange-600" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {toast.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={hideToast}
                className="flex-shrink-0 p-1 ml-2 transition-colors duration-200 rounded-lg hover:bg-black/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div 
              className={`
                absolute bottom-0 left-0 h-1 rounded-b-xl
                ${toast.type === 'success' ? 'bg-orange-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
              `} 
              style={{ width: '100%', animation: 'shrinkWidth 5s linear forwards' }}
            />
          </div>
        </div>
      )}

      <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
          <div 
            className="absolute inset-0 bg-top bg-no-repeat bg-cover" 
            style={{ 
              backgroundImage: `url(${CreatorJunooni})`,
              filter: 'brightness(0.85) contrast(1.1)' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#e65100]/30 via-[#e65100]/20 to-[#d84315]/40" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[15%] left-[10%] text-white/5 animate-pulse" style={{ fontSize: '120px' }}>👕</div>
            <div className="absolute top-[60%] right-[15%] text-white/5 animate-pulse" style={{ fontSize: '80px', animationDelay: '300ms' }}>🧢</div>
            <div className="absolute top-[30%] right-[20%] text-white/5 animate-pulse" style={{ fontSize: '100px', animationDelay: '700ms' }}>✨</div>
            <div className="absolute bottom-[25%] left-[20%] text-white/5 animate-pulse" style={{ fontSize: '90px', animationDelay: '500ms' }}>❤️</div>
            <div className="absolute top-[20%] right-[30%] w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
            <div className="absolute bottom-[30%] right-[25%] w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1500ms' }} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-[#e65100] shadow-xl">
                <img src={JunooniLogo} alt="Junooni Logo" className="w-12 h-12 lg:h-11 sm:h-8 lg:w-11" />
              </div>
              <h1 className="text-3xl font-black tracking-wide text-white drop-shadow-2xl">JUNOONI</h1>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center" />
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="flex flex-col items-center justify-start h-screen px-6 pt-12 pb-4 sm:justify-center sm:pt-20 bg-gradient-to-br from-gray-50 to-white sm:pb-28">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-1 mt-0 mb-5 sm:gap-3 lg:hidden">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-xl mr-2 sm:mr-3">
                <img src={JunooniFavicon} alt="Junooni favicon" className="object-contain w-10 h-8 sm:h-8 sm:w-8" />
              </div>
              <img src={Junoonilogo} alt="Junooni Logo" className="h-10 w-36 sm:h-10 sm:w-36" />
            </div>
            
            {/* Header */}
            <div className="mb-4 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-base leading-relaxed text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                
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
            
            <div className="mt-4 space-y-4 text-center">
              <p className="text-base text-gray-600">
                Don't have an account?{" "}
                <Link to="/sign-up" className="font-semibold text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
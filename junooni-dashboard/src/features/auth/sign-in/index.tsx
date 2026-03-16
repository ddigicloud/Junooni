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

const decodeTokenAndCheckActorId = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { hasActorId: false, payload: null, isValid: false };
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(jsonPayload);
    const hasActorId = !!(payload.actor_id || payload.actorId || payload.actor);
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < currentTime : false;
    return { hasActorId, payload, isValid: true, isExpired, actorId: payload.actor_id || payload.actorId || payload.actor };
  } catch {
    return { hasActorId: false, payload: null, isValid: false, isExpired: true };
  }
};

// ─── Google Sign In Button ────────────────────────────────────────────────────
function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    // Store intent so callback knows this is a sign-in
    localStorage.setItem('googleAuthIntent', 'signin')
    try {
      const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
      const response = await axios.post(`${backendUrl}/auth/vendor/google-vendor`, {})
      const location = response.data?.location
      if (location) {
        window.location.href = location
      } else {
        throw new Error('No redirect URL from Google auth')
      }
    } catch (err) {
      console.error('Google sign-in error:', err)
      localStorage.removeItem('googleAuthIntent')
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        w-full h-12 flex items-center justify-center gap-3
        bg-white border-2 border-gray-200 rounded-lg
        text-gray-700 font-semibold text-sm
        hover:border-gray-300 hover:bg-gray-50
        focus:outline-none focus:ring-4 focus:ring-gray-100
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
      "
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
    </button>
  )
}

export default function JunooniLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({ show: false, type: 'info', title: '', message: '' });
  const navigate = useNavigate();

  // ─── IMPERSONATION AUTO-LOGIN ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const impersonateToken = params.get('impersonate')
    if (!impersonateToken) return

    const tokenCheck = decodeTokenAndCheckActorId(impersonateToken)
    if (!tokenCheck.isValid) { showToast('error', 'Invalid Token', 'The impersonation token is invalid.'); return }
    if (tokenCheck.isExpired) { showToast('error', 'Token Expired', 'The impersonation session has expired.'); return }

    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendorTokenTimestamp')
    localStorage.removeItem('vendorEmail')
    localStorage.removeItem('isAdminImpersonation')

    localStorage.setItem('vendorToken', impersonateToken)
    localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
    localStorage.setItem('isAdminImpersonation', 'true')
    window.history.replaceState({}, '', '/sign-in')

    if (tokenCheck.hasActorId) {
      showToast('success', 'Admin Access', 'Entering vendor dashboard...')
      setTimeout(() => navigate({ to: '/dashboard' }), 800)
    } else {
      showToast('success', 'Admin Access', 'Entering vendor onboarding...')
      setTimeout(() => navigate({ to: '/onboarding', search: { step: 'basic-info' } }), 800)
    }
  }, [])
  // ─────────────────────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass`, {
        email: data.email,
        password: data.password,
      });
      const token = response.data.token;
      if (!token) throw new Error('No token received from server');

      localStorage.setItem("vendorToken", token);
      localStorage.setItem("vendorTokenTimestamp", Date.now().toString());
      localStorage.setItem('vendorEmail', data.email);

      const tokenCheck = decodeTokenAndCheckActorId(token);
      if (!tokenCheck.isValid) throw new Error('Invalid token received from server');
      if (tokenCheck.isExpired) throw new Error('Token is expired');

      sessionStorage.setItem('navigationSource', 'sign-in');

      if (tokenCheck.hasActorId) {
        showToast('success', 'Welcome back!', 'Redirecting to your dashboard...');
        setTimeout(() => navigate({ to: '/dashboard' }), 1500);
      } else {
        showToast('success', 'Welcome to Junooni!', "Let's complete your profile setup...");
        setTimeout(() => navigate({ to: '/onboarding', search: { step: 'basic-info' } }), 1500);
      }
    } catch (error: any) {
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorEmail');
      sessionStorage.removeItem('navigationSource');

      let errorTitle = 'Sign In Failed';
      let errorMessage = 'Please check your credentials and try again.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 401) { errorTitle = 'Invalid Credentials'; errorMessage = 'The email or password you entered is incorrect.'; }
      else if (error.response?.status >= 500) { errorTitle = 'Server Error'; errorMessage = 'Our servers are experiencing issues. Please try again later.'; }
      else if (error.message) errorMessage = error.message;

      showToast('error', errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className="fixed z-50 w-full max-w-md -translate-x-1/2 top-4 right-4 lg:right-4 lg:left-auto left-1/2 lg:translate-x-0" style={{ animation: 'slideInRight 0.3s ease-out' }}>
          <div className={`relative p-4 rounded-xl shadow-2xl border backdrop-blur-lg ${toast.type === 'success' ? 'bg-orange-50/95 border-orange-200 text-orange-800' : toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' : 'bg-orange-50/95 border-orange-200 text-orange-800'}`}>
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
              <button onClick={hideToast} className="flex-shrink-0 p-1 ml-2 transition-colors duration-200 rounded-lg hover:bg-black/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 rounded-b-xl ${toast.type === 'success' ? 'bg-orange-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: '100%', animation: 'shrinkWidth 5s linear forwards' }} />
          </div>
        </div>
      )}

      <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="relative hidden h-full lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#e65100] to-[#d84315]">
          <div className="absolute inset-0 bg-top bg-no-repeat bg-cover" style={{ backgroundImage: `url(${CreatorJunooni})`, filter: 'brightness(0.85) contrast(1.1)' }} />
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
          </div>
        </div>

        {/* Right Panel */}
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
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-base leading-relaxed text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Google Sign In */}
            <div className="mb-5">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-gray-400 bg-gradient-to-br from-gray-50 to-white">or sign in with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                          <Input placeholder="creator@junooni.com" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off"
                            className="pl-12 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                            {...field} />
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
                        <Link to="/forgot-password" className="text-sm font-medium text-[#e65100] hover:text-[#d84315] transition-colors duration-200 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                          <Input placeholder="••••••••" type={showPassword ? "text" : "password"}
                            className="pl-12 pr-12 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 transition-all duration-200 bg-white"
                            {...field} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e65100] transition-colors duration-200">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <Button type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Signing In...</div>
                  ) : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center">
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
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  )
}
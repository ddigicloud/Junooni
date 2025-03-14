import ViteLogo from '@/assets/vite.svg'
import { UserAuthForm } from './components/user-auth-form'
// import { useEffect, useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'

export default function SignIn2() {
  // const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  // const [isLoggedIn, setIsLoggedIn] = useState(false)
  // const navigate = useNavigate()

  // useEffect(() => {
  //   // Check if user is already logged in by looking for token in localStorage
  //   const checkAuthStatus = async () => {
  //     setIsCheckingAuth(true)
  //     const vendorToken = localStorage.getItem('vendorToken')
      
  //     // if (vendorToken) {
  //     //   // Set isLoggedIn to true to prevent UI from flashing
  //     //   setIsLoggedIn(true)
        
  //     //   // Adding a small delay to show the loading animation
  //     //   // In a real app, this would be the time to validate the token with your backend
  //     //   await new Promise(resolve => setTimeout(resolve, 800))
        
  //     //   // If token exists, navigate to dashboard
  //     //   navigate({ to: '/dashboard' })
  //     // }
      
  //     // If no token found, we're done checking
  //     setIsCheckingAuth(false)
  //   }
    
  //   checkAuthStatus()
  // }, [navigate]) 

  // Display full-screen loading spinner when checking auth or if logged in
  // This prevents any flashing of the login UI when already logged in
  // if (isCheckingAuth || isLoggedIn) {
  //   return (
  //     <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
  //       <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
  //       <p className="text-lg font-medium text-primary">
  //         {isLoggedIn ? "Welcome back! Redirecting..." : "Checking login status..."}
  //       </p>
  //     </div>
  //   )
  // }

  // Only render the login UI if user is not logged in and we're done checking
  return (
    <div className='container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Junooni Creator Verse
        </div>

        <img
          src={ViteLogo}
          className='relative m-auto'
          width={301}
          height={60}
          alt='Vite'
        />

        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Your passion fuels our universe—log in and become a part of the creator verse.&rdquo;
            </p>
            <footer className='text-sm'>I am Junooni</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-left'>
            <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below <br />
              to log into your account
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By clicking login, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
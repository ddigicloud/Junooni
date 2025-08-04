// components/AuthSuccessNotification.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AuthSuccessNotification() {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  const authStatus = searchParams?.get('auth')

  useEffect(() => {
    if (authStatus === 'success') {
      setShowSuccessMessage(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
        // Optional: Clean up URL
        window.history.replaceState({}, '', window.location.pathname)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [authStatus])

  if (!showSuccessMessage) return null

  return (
    <div className="fixed z-50 top-4 right-4 animate-slide-in">
      <div className="max-w-sm p-4 rounded-md shadow-lg bg-green-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Successfully signed in with Google!
            </p>
            <p className="mt-1 text-xs text-green-600">
              Welcome back to our store
            </p>
          </div>
          <div className="pl-3 ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this CSS to your global styles or Tailwind config for the animation
// @keyframes slide-in {
//   from {
//     transform: translateX(100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateX(0);
//     opacity: 1;
//   }
// }
// .animate-slide-in {
//   animation: slide-in 0.3s ease-out;
// }
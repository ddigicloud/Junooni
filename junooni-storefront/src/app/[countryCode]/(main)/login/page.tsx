// src/app/[countryCode]/(main)/login/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const countryCode = params?.countryCode as string || 'in'
  const error = searchParams?.get('error')

  useEffect(() => {
    if (error) {
      switch (error) {
        case 'server_error':
          setErrorMessage('Something went wrong. Please try again.')
          break
        case 'session_expired':
          setErrorMessage('Your session expired. Please try signing in again.')
          break
        case 'auth_failed':
        case 'authentication_failed':
          setErrorMessage('Authentication failed. Please try again.')
          break
        case 'missing_code':
          setErrorMessage('Authorization code missing. Please try again.')
          break
        case 'no_token':
          setErrorMessage('Authentication completed but no token received. Please try again.')
          break
        default:
          setErrorMessage('Login failed. Please try again.')
      }
    }
  }, [error])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      // Use Medusa's built-in auth route
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
      const redirectUri = `${window.location.origin}/${countryCode}/auth/google/callback`
      
      console.log('Starting Google OAuth with redirect URI:', redirectUri)
      
      // Call Medusa's built-in auth route
      const response = await fetch(`${backendUrl}/auth/customer/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_url: redirectUri
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Auth request failed:', response.status, errorText)
        throw new Error(`Auth request failed: ${response.status}`)
      }

      const authResult = await response.json()
      console.log('Auth result:', authResult)
      
      if (authResult.location) {
        console.log('Redirecting to Google:', authResult.location)
        // Redirect to Google for authentication
        window.location.href = authResult.location
      } else {
        console.error('No location received:', authResult)
        throw new Error('No location received from auth service')
      }
      
    } catch (error) {
      console.error('Google login error:', error)
      setErrorMessage('Failed to start Google authentication. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md group hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-b-2 border-gray-700 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </span>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>

          <div className="text-center">
            <a 
              href={`/${countryCode}`}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
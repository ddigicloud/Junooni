// src/app/[countryCode]/(main)/auth/google/callback/route.ts
// Frontend Next.js callback that validates OAuth with Medusa's built-in routes

import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { countryCode: string } }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const countryCode = params.countryCode

  console.log('=== FRONTEND CALLBACK DEBUG ===')
  console.log('All query params:', Object.fromEntries(searchParams.entries()))
  console.log('Country code:', countryCode)

  // Get base URL - fallback to localhost if env not set
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'
  
  // Handle OAuth error from Google
  if (error) {
    console.error('OAuth error from Google:', error)
    return Response.redirect(new URL(`/${countryCode}/login?error=${encodeURIComponent(error)}`, baseUrl))
  }

  if (!code) {
    console.error('Missing authorization code')
    return Response.redirect(new URL(`/${countryCode}/login?error=missing_code`, baseUrl))
  }

  try {
    // Use Medusa's built-in callback validation route
    const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const callbackUrl = `${backendUrl}/auth/customer/google/callback`
    
    console.log('Calling Medusa callback:', callbackUrl)
    
    // Prepare the request body with ALL query parameters as Medusa expects
    const requestBody = Object.fromEntries(searchParams.entries())
    console.log('Sending to backend:', requestBody)
    
    // Call Medusa's built-in auth callback route
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      
      // Handle specific errors
      if (response.status === 401 && errorText.includes('state')) {
        return Response.redirect(new URL(`/${countryCode}/login?error=session_expired`, baseUrl))
      }
      
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const authResult = await response.json()
    console.log('Auth result received:', Object.keys(authResult))
    
    if (authResult.token) {
      console.log('OAuth SUCCESS - received token')
      
      // For now, just redirect with success. In production, you'd want to:
      // 1. Store the token securely (httpOnly cookie)
      // 2. Set up session management
      return Response.redirect(new URL(`/${countryCode}?auth=success`, baseUrl))
      
    } else {
      console.error('No token in auth result:', authResult)
      return Response.redirect(new URL(`/${countryCode}/login?error=no_token`, baseUrl))
    }

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return Response.redirect(new URL(`/${countryCode}/login?error=server_error`, baseUrl))
  }
}
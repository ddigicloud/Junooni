// import { useEffect, useState, useRef } from 'react'
// import { useNavigate } from '@tanstack/react-router'

// export default function GoogleAuthCallback() {
//   const navigate = useNavigate()
//   const [error, setError] = useState('')
//   const hasRun = useRef(false)

//   const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
//   const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''

//   useEffect(() => {
//     if (hasRun.current) return
//     hasRun.current = true

//     async function handleCallback() {
//       try {
//         // Step 1 — collect all query params from Google redirect
//         const params = new URLSearchParams(window.location.search)
//         const queryObject: Record<string, string> = {}
//         params.forEach((value, key) => { queryObject[key] = value })

//         if (!queryObject.code) throw new Error('No authorization code received from Google')

//         const intent = localStorage.getItem('googleAuthIntent') || 'signin'
//         localStorage.removeItem('googleAuthIntent')

//         // Step 2 — validate Google OAuth code with Medusa
//         // This creates the auth identity (same as POST /auth/vendor/emailpass/register)
//         // and returns a JWT token
//         const callbackUrl = new URL(`${backendUrl}/auth/vendor/google-vendor/callback`)
//         Object.entries(queryObject).forEach(([key, value]) => {
//           callbackUrl.searchParams.append(key, value)
//         })

//         const response = await fetch(callbackUrl.toString(), {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-publishable-api-key': publishableKey,
//           },
//         })

//         const data = await response.json()
//         if (!response.ok) throw new Error(data?.message || `Auth failed: ${response.status}`)

//         let token = data.token
//         if (!token) throw new Error('No token received from Medusa')

//         // Step 3 — decode JWT
//         const payload = JSON.parse(atob(token.split('.')[1]))
//         const email = payload?.user_metadata?.email || ''
//         const firstName = payload?.user_metadata?.given_name ||
//                           payload?.user_metadata?.name?.split(' ')[0] || ''
//         const lastName = payload?.user_metadata?.family_name ||
//                          payload?.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
//         const actorId = payload?.actor_id || ''

//         // ─── SIGN UP FLOW ─────────────────────────────────────────────────
//         // Exactly mirrors emailpass sign-up form:
//         // emailpass: POST /auth/vendor/emailpass/register → token → localStorage → /onboarding
//         // Google:    /auth/vendor/google-vendor/callback  → token → localStorage → /onboarding
//         // No POST /vendors here — that happens during onboarding (basic-info step)
//         if (intent === 'signup') {
//           if (actorId) {
//             // Auth identity already linked to vendor profile → dashboard
//             storeToken(token, email)
//             navigate({ to: '/dashboard' })
//             return
//           }

//           // Auth identity created ✅ — store token exactly like emailpass sign-up
//           localStorage.setItem('vendorToken', token)
//           localStorage.setItem('vendorEmail', email)
//           localStorage.setItem('vendorTokenTimestamp', Date.now().toString())

//           // Bonus: store Google name for onboarding pre-fill
//           if (firstName) localStorage.setItem('googleFirstName', firstName)
//           if (lastName) localStorage.setItem('googleLastName', lastName)

//           navigate({ to: '/onboarding' })
//           return
//         }

//         // ─── SIGN IN FLOW ─────────────────────────────────────────────────

//         // actor_id exists = Google identity linked to vendor profile
//         if (actorId) {
//           storeToken(token, email)
//           navigate({ to: '/dashboard' })
//           return
//         }

//         // actor_id empty — try auto-link by email
//         // (emailpass vendor using Google for first time)
//         const linkResponse = await fetch(`${backendUrl}/vendors/google-link`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             'x-publishable-api-key': publishableKey,
//           },
//           body: JSON.stringify({ email }),
//         })

//         const linkData = await linkResponse.json()

//         if (linkResponse.ok && linkData.token) {
//           // Linked to existing emailpass vendor
//           const linkedPayload = JSON.parse(atob(linkData.token.split('.')[1]))
//           storeToken(linkData.token, email)
//           linkedPayload?.actor_id
//             ? navigate({ to: '/dashboard' })
//             : navigate({ to: '/onboarding' })
//           return
//         }

//         if (linkResponse.status === 404 && linkData.isNewVendor) {
//           // No existing vendor with this email
//           // Auth identity exists, no vendor profile → onboarding
//           // (same as emailpass sign-up that never completed onboarding)
//           localStorage.setItem('vendorToken', token)
//           localStorage.setItem('vendorEmail', email)
//           localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
//           if (firstName) localStorage.setItem('googleFirstName', firstName)
//           if (lastName) localStorage.setItem('googleLastName', lastName)
//           navigate({ to: '/onboarding' })
//           return
//         }

//         throw new Error(linkData?.message || 'Failed to sign in. Please try again.')

//       } catch (err: any) {
//         console.error('Google vendor callback error:', err)
//         setError(err?.message || 'Google sign-in failed. Please try again.')
//       }
//     }

//     handleCallback()
//   }, [])

//   function storeToken(token: string, email: string) {
//     localStorage.removeItem('vendorToken')
//     localStorage.removeItem('vendorTokenTimestamp')
//     localStorage.removeItem('vendorEmail')
//     localStorage.removeItem('isAdminImpersonation')
//     localStorage.setItem('vendorToken', token)
//     localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
//     if (email) localStorage.setItem('vendorEmail', email)
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
//         <div className="w-full max-w-sm p-8 mx-4 text-center bg-white border border-red-100 shadow-xl rounded-2xl">
//           <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-red-50">
//             <svg className="text-red-500 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </div>
//           <h2 className="mb-2 text-lg font-bold text-gray-900">Sign In Failed</h2>
//           <p className="mb-6 text-sm text-gray-500">{error}</p>
//           <button
//             onClick={() => navigate({ to: '/sign-in' })}
//             className="w-full h-11 bg-[#e65100] hover:bg-[#d84315] text-white rounded-lg font-semibold text-sm transition-colors duration-200"
//           >
//             Back to Sign In
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
//       <div className="w-full max-w-sm p-8 mx-4 text-center bg-white border border-gray-100 shadow-xl rounded-2xl">
//         <div className="flex items-center justify-center mx-auto mb-5 rounded-full w-14 h-14 bg-orange-50">
//           <div className="w-7 h-7 border-2 border-[#e65100]/20 border-t-[#e65100] rounded-full animate-spin" />
//         </div>
//         <h2 className="mb-1 text-lg font-bold text-gray-900">Signing you in…</h2>
//         <p className="text-sm text-gray-500">Verifying your Google account with Junooni.</p>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const hasRun = useRef(false)

  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
  const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search)
        const queryObject: Record<string, string> = {}
        params.forEach((value, key) => { queryObject[key] = value })

        if (!queryObject.code) throw new Error('No authorization code received from Google')

        const intent = localStorage.getItem('googleAuthIntent') || 'signin'
        localStorage.removeItem('googleAuthIntent')

        const callbackUrl = new URL(`${backendUrl}/auth/vendor/google-vendor/callback`)
        Object.entries(queryObject).forEach(([key, value]) => {
          callbackUrl.searchParams.append(key, value)
        })

        const response = await fetch(callbackUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': publishableKey,
          },
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `Auth failed: ${response.status}`)

        let token = data.token
        if (!token) throw new Error('No token received from Medusa')

        const payload = JSON.parse(atob(token.split('.')[1]))
        const email = payload?.user_metadata?.email || ''
        const firstName = payload?.user_metadata?.given_name ||
                          payload?.user_metadata?.name?.split(' ')[0] || ''
        const lastName = payload?.user_metadata?.family_name ||
                         payload?.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
        const actorId = payload?.actor_id || ''

        // ─── SIGN UP FLOW ──────────────────────────────────────────────────
        if (intent === 'signup') {
          if (actorId) {
            storeToken(token, email)
            navigate({ to: '/dashboard' })
            return
          }
          localStorage.setItem('vendorToken', token)
          localStorage.setItem('vendorEmail', email)
          localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
          if (firstName) localStorage.setItem('googleFirstName', firstName)
          if (lastName) localStorage.setItem('googleLastName', lastName)
          navigate({ to: '/onboarding' })
          return
        }

        // ─── SIGN IN FLOW ──────────────────────────────────────────────────
        if (actorId) {
          storeToken(token, email)
          navigate({ to: '/dashboard' })
          return
        }

        // Try to auto-link by email (emailpass vendor using Google for first time)
        const linkResponse = await fetch(`${backendUrl}/vendors/google-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-publishable-api-key': publishableKey,
          },
          body: JSON.stringify({ email }),
        })

        const linkData = await linkResponse.json()

        if (linkResponse.ok && linkData.token) {
          const linkedPayload = JSON.parse(atob(linkData.token.split('.')[1]))
          storeToken(linkData.token, email)
          linkedPayload?.actor_id
            ? navigate({ to: '/dashboard' })
            : navigate({ to: '/onboarding' })
          return
        }

        if (linkResponse.status === 404 && linkData.isNewVendor) {
          // ✅ Brand new user — no Junooni account exists yet.
          // Send them to sign-up and show a friendly prompt toast there.
          sessionStorage.setItem('googleSignUpPrompt', 'true')
          navigate({ to: '/sign-up' })
          return
        }

        throw new Error(linkData?.message || 'Failed to sign in. Please try again.')

      } catch (err: any) {
        console.error('Google vendor callback error:', err)
        setError(err?.message || 'Google sign-in failed. Please try again.')
      }
    }

    handleCallback()
  }, [])

  function storeToken(token: string, email: string) {
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendorTokenTimestamp')
    localStorage.removeItem('vendorEmail')
    localStorage.removeItem('isAdminImpersonation')
    localStorage.setItem('vendorToken', token)
    localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
    if (email) localStorage.setItem('vendorEmail', email)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-sm p-8 mx-4 text-center bg-white border border-red-100 shadow-xl rounded-2xl">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-red-50">
            <svg className="text-red-500 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">Sign In Failed</h2>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate({ to: '/sign-in' })}
            className="w-full h-11 bg-[#e65100] hover:bg-[#d84315] text-white rounded-lg font-semibold text-sm transition-colors duration-200"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-sm p-8 mx-4 text-center bg-white border border-gray-100 shadow-xl rounded-2xl">
        <div className="flex items-center justify-center mx-auto mb-5 rounded-full w-14 h-14 bg-orange-50">
          <div className="w-7 h-7 border-2 border-[#e65100]/20 border-t-[#e65100] rounded-full animate-spin" />
        </div>
        <h2 className="mb-1 text-lg font-bold text-gray-900">Signing you in…</h2>
        <p className="text-sm text-gray-500">Verifying your Google account with Junooni.</p>
      </div>
    </div>
  )
}
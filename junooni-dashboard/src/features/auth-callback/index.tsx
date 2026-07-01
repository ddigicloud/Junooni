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
//         const params = new URLSearchParams(window.location.search)
//         const queryObject: Record<string, string> = {}
//         params.forEach((value, key) => { queryObject[key] = value })

//         if (!queryObject.code) throw new Error('No authorization code received from Google')

//         const intent = localStorage.getItem('googleAuthIntent') || 'signin'
//         localStorage.removeItem('googleAuthIntent')

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

//         const payload = JSON.parse(atob(token.split('.')[1]))
//         const email = payload?.user_metadata?.email || ''
//         const firstName = payload?.user_metadata?.given_name ||
//                           payload?.user_metadata?.name?.split(' ')[0] || ''
//         const lastName = payload?.user_metadata?.family_name ||
//                          payload?.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
//         const actorId = payload?.actor_id || ''

//         // ─── SIGN UP FLOW ──────────────────────────────────────────────────
//         if (intent === 'signup') {
//           if (actorId) {
//             storeToken(token, email)
//             navigate({ to: '/dashboard' })
//             return
//           }
//           localStorage.setItem('vendorToken', token)
//           localStorage.setItem('vendorEmail', email)
//           localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
//           if (firstName) localStorage.setItem('googleFirstName', firstName)
//           if (lastName) localStorage.setItem('googleLastName', lastName)
//           navigate({ to: '/onboarding' })
//           return
//         }

//         // ─── SIGN IN FLOW ──────────────────────────────────────────────────
//         if (actorId) {
//           storeToken(token, email)
//           navigate({ to: '/dashboard' })
//           return
//         }

//         // Try to auto-link by email (emailpass vendor using Google for first time)
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
//           const linkedPayload = JSON.parse(atob(linkData.token.split('.')[1]))
//           storeToken(linkData.token, email)
//           linkedPayload?.actor_id
//             ? navigate({ to: '/dashboard' })
//             : navigate({ to: '/onboarding' })
//           return
//         }

//         if (linkResponse.status === 404 && linkData.isNewVendor) {
//           // ✅ Brand new user — no Junooni account exists yet.
//           // Send them to sign-up and show a friendly prompt toast there.
//           sessionStorage.setItem('googleSignUpPrompt', 'true')
//           navigate({ to: '/sign-up' })
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

        console.log('[GoogleAuth] intent:', intent)

        // ── Step 1: Exchange code for token ────────────────────────────────
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

        const token = data.token
        if (!token) throw new Error('No token received from Medusa')

        // ── Step 2: Decode token for profile data ──────────────────────────
        const payload = JSON.parse(atob(token.split('.')[1]))
        const email = payload?.user_metadata?.email || ''
        const firstName = payload?.user_metadata?.given_name ||
                          payload?.user_metadata?.name?.split(' ')[0] || ''
        const lastName = payload?.user_metadata?.family_name ||
                         payload?.user_metadata?.name?.split(' ').slice(1).join(' ') || ''

        console.log('[GoogleAuth] email:', email, '| actor_id:', payload?.actor_id)

        // ── Step 3: Ground-truth onboarding check via /vendors/me ──────────
        let fullyOnboarded = false
        let activeToken = token

        try {
          const vendorRes = await fetch(`${backendUrl}/vendors/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-publishable-api-key': publishableKey,
            },
          })
          if (vendorRes.ok) {
            const vendorData = await vendorRes.json()
            fullyOnboarded = !!vendorData?.vendor?.handle
            console.log('[GoogleAuth] vendor handle:', vendorData?.vendor?.handle, '| fullyOnboarded:', fullyOnboarded)
          }
        } catch (e) {
          console.warn('[GoogleAuth] /vendors/me check failed', e)
        }

        // ── Step 4: If not yet onboarded via Google, try linking to existing emailpass account ──
        // This handles two scenarios:
        // (a) Creator forgot password → clicks "Sign in with Google"
        // (b) Creator has emailpass account → accidentally clicks "Sign up with Google"
        // In both cases: if their email matches an existing vendor → link and log in
        if (!fullyOnboarded) {
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
            // Successfully linked Google to existing emailpass account
            const linkedPayload = JSON.parse(atob(linkData.token.split('.')[1]))
            activeToken = linkData.token
            fullyOnboarded = !!linkedPayload?.actor_id
            console.log('[GoogleAuth] google-link succeeded | fullyOnboarded after link:', fullyOnboarded)

            storeToken(activeToken, email)
            fullyOnboarded
              ? navigate({ to: '/dashboard' })
              : navigate({ to: '/onboarding' })
            return
          }

          if (linkResponse.status === 404 && linkData.isNewVendor) {
            // Confirmed: no existing account with this email at all
            // → brand new user, fall through to intent-based routing below
            console.log('[GoogleAuth] google-link: no existing account found for', email)
          } else if (!linkResponse.ok) {
            // Unexpected error from link endpoint
            console.warn('[GoogleAuth] google-link unexpected error:', linkData)
          }
        }

        // ── Step 5: Route based on intent + onboarding status ─────────────
        if (fullyOnboarded) {
          // Fully onboarded vendor (Google-native account)
          storeToken(activeToken, email)
          navigate({ to: '/dashboard' })
          return
        }

        // Not onboarded and no existing emailpass account found
        if (intent === 'signup') {
          // Genuinely new user coming from sign-up page → onboarding
          localStorage.setItem('vendorToken', activeToken)
          localStorage.setItem('vendorEmail', email)
          localStorage.setItem('vendorTokenTimestamp', Date.now().toString())
          if (firstName) localStorage.setItem('googleFirstName', firstName)
          if (lastName) localStorage.setItem('googleLastName', lastName)
          navigate({ to: '/onboarding' })
          return
        }

        // intent === 'signin' but no account found → send to sign-up
        sessionStorage.setItem('googleSignUpPrompt', 'true')
        navigate({ to: '/sign-up' })

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
          <h2 className="mb-2 text-lg font-bold text-gray-900">Authentication Failed</h2>
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
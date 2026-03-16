"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@lib/config"
import { setGoogleAuthCookie } from "@lib/data/customer"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        // Step 1 — collect all query params Google sent back
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        // Step 2 — validate with Medusa, get JWT token string
        const result = await sdk.auth.callback("customer", "google", params)

        let token: string | null = null

        if (typeof result === "string") {
          token = result
        } else if (result && typeof result === "object") {
          token = (result as any).token || (result as any).jwt || null
        }

        if (!token) {
          throw new Error(`No token received. Result: ${JSON.stringify(result)}`)
        }

        // Step 3 — decode JWT payload to get Google user info
        const payload = JSON.parse(atob(token.split(".")[1]))
        const email = payload?.user_metadata?.email || payload?.email || ""
        const firstName = payload?.user_metadata?.given_name ||
                          payload?.user_metadata?.name?.split(" ")[0] || ""
        const lastName = payload?.user_metadata?.family_name ||
                         payload?.user_metadata?.name?.split(" ").slice(1).join(" ") || ""

        const authHeaders = {
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        }

        // Step 4 — check if customer record exists
        let isNewCustomer = false
        try {
          await sdk.client.fetch("/store/customers/me", {
            method: "GET",
            headers: authHeaders,
          })
        } catch {
          isNewCustomer = true
        }

        if (isNewCustomer) {
          // Step 5a — NEW customer: create record with full name from Google
          await sdk.store.customer.create(
            { email, first_name: firstName, last_name: lastName },
            {},
            authHeaders
          )
          // Refresh token so it includes the new customer's actor_id
          const refreshed = await sdk.auth.refresh()
          if (typeof refreshed === "string") token = refreshed

        } else {
          // Step 5b — EXISTING customer: update name if Google has it
          if (firstName || lastName) {
            await sdk.store.customer.update(
              { first_name: firstName, last_name: lastName },
              {},
              authHeaders
            ).catch(() => null) // don't fail login if update fails
          }
        }

        // Step 6 — save token to Next.js HTTP cookie via server action
        await setGoogleAuthCookie(token)

        // Step 7 — small delay to ensure cookie propagates before navigation
        await new Promise(resolve => setTimeout(resolve, 300))

        // Step 8 — redirect to account dashboard
        router.replace("/in/account")

      } catch (err: any) {
        console.error("Google callback error:", err)
        setError(err?.message || "Google sign-in failed. Please try again.")
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <div className="w-full max-w-sm p-8 mx-4 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Sign In Failed</h2>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => router.replace("/in/account")}
            className="w-full h-10 bg-[#e65100] hover:bg-[#d84315] text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="w-full max-w-sm p-8 mx-4 text-center bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
          <div className="w-6 h-6 border-2 border-[#e65100]/30 border-t-[#e65100] rounded-full animate-spin" />
        </div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Signing you in…</h2>
        <p className="text-sm text-gray-500">Verifying your Google account.</p>
      </div>
    </div>
  )
}
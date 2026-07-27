"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@lib/config"
import { setGoogleAuthCookie, wishListCreate, followerCreate } from "@lib/data/customer"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        // ── Step 1: Collect query params ──────────────────────────────────
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => { params[key] = value })

        if (!params.code) throw new Error("No authorization code received from Google")

        // ── Step 2: Exchange code for token ───────────────────────────────
        const result = await sdk.auth.callback("customer", "google", params)
        console.log("[google-callback] raw result:", typeof result, result)

        if (result && typeof result === "object" && "location" in result) {
          window.location.href = (result as any).location
          return
        }

        let token: string | null = null
        if (typeof result === "string") {
          token = result
        } else if (result && typeof result === "object") {
          token = (result as any).token || (result as any).jwt || null
        }

        if (!token) throw new Error(`No token received. Result: ${JSON.stringify(result)}`)

        // ── Step 3: Decode token ──────────────────────────────────────────
        // Medusa docs: actor_id is empty if customer not yet registered
        // actor_id gets populated after customer.create() + token refresh
        const payload   = JSON.parse(atob(token.split(".")[1]))
        const email     = payload?.user_metadata?.email || payload?.email || ""
        const firstName = payload?.user_metadata?.given_name ||
                          payload?.user_metadata?.name?.split(" ")[0] || ""
        const lastName  = payload?.user_metadata?.family_name ||
                          payload?.user_metadata?.name?.split(" ").slice(1).join(" ") || ""
        const actorId   = payload?.actor_id || ""

        console.log("[google-callback] email:", email, "| actor_id:", actorId)

        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
        const pubKey     = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        const authHeaders: Record<string, string> = {
          Authorization:            `Bearer ${token}`,
          "Content-Type":           "application/json",
          "x-publishable-api-key":  pubKey,
        }

        if (actorId) {
          // ── Existing customer: already registered, just log in ──────────
          console.log("[google-callback] existing customer, actor_id:", actorId)

          // Optionally update name from Google profile
          if (firstName || lastName) {
            await fetch(`${backendUrl}/store/customers/me`, {
              method:  "POST",
              headers: authHeaders,
              body:    JSON.stringify({ first_name: firstName, last_name: lastName }),
            }).catch(() => null)
          }

          await setGoogleAuthCookie(token)
          await new Promise(r => setTimeout(r, 300))
          router.replace("/in/account")
          return
        }

        // actor_id is empty — customer not registered with this Google identity yet
        // ── Step 4: Try linking to existing emailpass account ─────────────
        let finalToken = token
        let isLinked   = false

        try {
          const linkRes  = await fetch(`${backendUrl}/store/customers/google-link`, {
            method:  "POST",
            headers: authHeaders,
            body:    JSON.stringify({ email }),
          })
          const linkData = await linkRes.json()
          console.log("[google-callback] google-link:", linkRes.status, linkData)

          if (linkRes.ok && linkData.token) {
            finalToken = linkData.token
            isLinked   = true
            console.log("[google-callback] linked to existing emailpass customer")
          }
        } catch (e) {
          console.warn("[google-callback] google-link error:", e)
        }

        if (isLinked) {
          await setGoogleAuthCookie(finalToken)
          await new Promise(r => setTimeout(r, 300))
          router.replace("/in/account")
          return
        }

        // ── Step 5: Truly new customer — create record ────────────────────
        console.log("[google-callback] creating new customer:", email)
        try {
          await fetch(`${backendUrl}/store/customers`, {
            method:  "POST",
            headers: authHeaders,
            body:    JSON.stringify({
              email,
              first_name: firstName,
              last_name:  lastName,
            }),
          })
        } catch (createErr: any) {
          console.warn("[google-callback] create customer error:", createErr?.message)
          // May have been created between our check — continue
        }

        // ── Step 6: Refresh token to get actor_id populated ───────────────
        // Per Medusa docs: after creating customer, call /auth/token/refresh
        // with the original Google token to get a new token with actor_id set
        try {
          const refreshRes  = await fetch(`${backendUrl}/auth/token/refresh`, {
            method:  "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
          const refreshData = await refreshRes.json()
          console.log("[google-callback] token refresh:", refreshRes.status, refreshData)
          if (refreshRes.ok && refreshData.token) {
            finalToken = refreshData.token
          }
        } catch (refreshErr) {
          console.warn("[google-callback] token refresh failed:", refreshErr)
        }

        // ── Step 7: Save token, create wishlist + follow list ─────────────
        await setGoogleAuthCookie(finalToken)
        await new Promise(r => setTimeout(r, 400))

        try { await wishListCreate() } catch (e) { console.warn("wishlist:", e) }
        try { await followerCreate() } catch (e) { console.warn("follower:", e) }

        router.replace("/in/account")

      } catch (err: any) {
        console.error("[google-callback] error:", err)
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
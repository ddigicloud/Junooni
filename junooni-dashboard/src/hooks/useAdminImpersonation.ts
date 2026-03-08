// =============================================================================
// FILE 2: src/hooks/useAdminImpersonation.ts
//
// Call this hook in your root layout / App.tsx to decode the token and
// know whether to show the admin banner.
// =============================================================================


import { useMemo } from "react"

type ImpersonationState = {
  isImpersonating: boolean
  vendorId: string | null
  adminUserId: string | null
  expiresAt: Date | null
  clearImpersonation: () => void
}

const decodeJWT = (token: string) => {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
  } catch {
    return null
  }
}

export const useAdminImpersonation = (): ImpersonationState => {
  const token = localStorage.getItem("vendorToken")
  const isAdminSession = localStorage.getItem("isAdminImpersonation") === "true"

  const state = useMemo((): ImpersonationState => {
    if (!token || !isAdminSession) {
      return {
        isImpersonating: false,
        vendorId: null,
        adminUserId: null,
        expiresAt: null,
        clearImpersonation: () => {},
      }
    }

    const decoded = decodeJWT(token)

    const clearImpersonation = () => {
      localStorage.removeItem("vendorToken")
      localStorage.removeItem("isAdminImpersonation")
      window.location.href = "/sign-in"
    }

    return {
      isImpersonating: !!decoded?.impersonated_by_admin,
      vendorId: decoded?.app_metadata?.vendor_id ?? null,
      adminUserId: decoded?.impersonated_by_user_id ?? null,
      expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null,
      clearImpersonation,
    }
  }, [token, isAdminSession])

  return state
}
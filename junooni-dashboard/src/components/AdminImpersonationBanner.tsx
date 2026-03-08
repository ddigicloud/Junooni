// =============================================================================
// FILE 3: src/components/AdminImpersonationBanner.tsx
//
// Drop this at the top of your main layout, just above everything else.
// It only renders when isImpersonating is true.
// =============================================================================


import { useAdminImpersonation } from "../hooks/useAdminImpersonation"

const AdminImpersonationBanner = () => {
  const { isImpersonating, expiresAt, clearImpersonation } = useAdminImpersonation()

  if (!isImpersonating) return null

  const expiryStr = expiresAt
    ? expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "2h"

  return (
    <div className="w-full bg-purple-600 text-white text-sm flex items-center justify-between px-4 py-2 z-50">
      <span>
        🛡️ <strong>Admin Assist Mode</strong> — You are viewing this vendor's dashboard.
        Session expires at {expiryStr}.
      </span>
      <button
        onClick={clearImpersonation}
        className="ml-4 underline hover:no-underline text-white text-xs"
      >
        Exit Admin Mode
      </button>
    </div>
  )
}

export default AdminImpersonationBanner
// =============================================================================
// FILE 1: src/pages/auth/impersonate.tsx  (or .jsx)
//
// The admin widget opens:
//   https://studio.junooni.com/auth/impersonate?token=<jwt>
//
// This page reads the token, stores it as "vendorToken" (same key your
// existing dashboard already uses), then redirects to /dashboard.
// =============================================================================

// import { useEffect, useState } from "react"
// import { useNavigate, useSearchParams } from "react-router-dom"

// const ImpersonatePage = () => {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const token = searchParams.get("token")

//     if (!token) {
//       setError("No token provided.")
//       return
//     }

//     // Basic sanity check — JWT has 3 parts
//     if (token.split(".").length !== 3) {
//       setError("Invalid token format.")
//       return
//     }

//     // Store with the same key the rest of the dashboard uses
//     localStorage.setItem("vendorToken", token)

//     // Small flag so the banner knows this is an admin session
//     localStorage.setItem("isAdminImpersonation", "true")

//     // Redirect to the normal dashboard home
//     navigate("/dashboard", { replace: true })
//   }, [searchParams, navigate])

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
//           <p className="text-red-600 font-medium">Error</p>
//           <p className="text-gray-500 text-sm mt-2">{error}</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
//         <p className="text-gray-500 text-sm mt-3">Entering vendor dashboard…</p>
//       </div>
//     </div>
//   )
// }

// export default ImpersonatePage
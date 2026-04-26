// src/app/[handle]/loading.tsx
// Shown by Next.js while the server component fetches data.
// Auto-shows error message after 10 seconds so it never hangs forever.

"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [timedOut, setTimedOut] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    // Count seconds
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)

    // After 10s show error instead of spinning
    const timer = setTimeout(() => setTimedOut(true), 10000)

    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [])

  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-white">
        <div className="max-w-sm text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="mb-2 text-base font-bold text-gray-900">Store took too long to load</h2>
          <p className="mb-4 text-sm text-gray-500">
            The server didn't respond in time. This usually means the backend is restarting or unreachable.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 border-2 rounded-full border-t-transparent animate-spin"
          style={{ borderColor: "#e65100", borderTopColor: "transparent" }}
        />
        <p className="text-sm text-gray-500">Loading store...</p>
        {elapsed >= 3 && (
          <p className="text-xs text-gray-400">{elapsed}s — this is taking longer than usual</p>
        )}
      </div>
    </div>
  )
}
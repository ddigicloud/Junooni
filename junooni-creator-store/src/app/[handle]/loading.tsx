// src/app/[handle]/loading.tsx
// Shown by Next.js while the server component fetches data.
// Auto-shows error message after 10 seconds so it never hangs forever.

"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [timedOut, setTimedOut] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    const timer = setTimeout(() => setTimedOut(true), 10000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [])

  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6"
        style={{ backgroundColor: "var(--skeleton-card, #ffffff)" }}>
        <div className="max-w-sm text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
            style={{ backgroundColor: "var(--skeleton-light, #fee2e2)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="mb-2 text-base font-bold"
            style={{ color: "var(--skeleton-text, #111827)" }}>
            Store took too long to load
          </h2>
          <p className="mb-4 text-sm"
            style={{ color: "var(--skeleton-text-faint, #6b7280)" }}>
            The server didn't respond in time. This usually means the backend is restarting or unreachable.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg"
            style={{ backgroundColor: "var(--brand-primary, #111827)" }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "var(--skeleton-card, #ffffff)" }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--brand-primary, #e65100)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-sm" style={{ color: "var(--skeleton-text-faint, #6b7280)" }}>
          Loading store...
        </p>
        {elapsed >= 3 && (
          <p className="text-xs" style={{ color: "var(--skeleton-text-faint, #9ca3af)" }}>
            {elapsed}s — this is taking longer than usual
          </p>
        )}
      </div>
    </div>
  )
}
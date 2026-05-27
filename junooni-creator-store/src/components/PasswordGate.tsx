"use client"

import { useState } from "react"

interface Props {
  handle: string
  storeName: string
  store_id: string
  storeLogo?: string | null
  primaryColor?: string
  secondaryColor?: string
  backendUrl: string
  onSuccess: (token: string) => void
}

export default function PasswordGate({
  handle,
  storeName,
  store_id, 
  storeLogo,
  primaryColor = "#e65100",
  secondaryColor = "#ac1900",
  backendUrl,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)   // ← new
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${backendUrl}/storefront/${handle}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, store_id}),
      })

      const data = await res.json()

      if (data.verified && data.token) {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
        const cookieName = `store_access_${handle}`
        const cookieValue = `${cookieName}=${data.token}; expires=${expires}; path=/; SameSite=Lax`
        document.cookie = cookieValue
        const cookieSet = document.cookie.includes(`${cookieName}=`)
        if (!cookieSet) {
          document.cookie = `${cookieName}=${data.token}; expires=${expires}; path=/`
        }
        onSuccess(data.token)
      } else {
        setError(data.message ?? "Incorrect password. Please try again.")
      }
    } catch (err) {
      console.error("[PasswordGate] fetch error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      fontFamily: "Inter, sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e5e5e5",
        padding: "2.5rem 2rem",
        textAlign: "center",
      }}>
        {storeLogo ? (
          <img src={storeLogo} alt={storeName}
            style={{ height: "48px", objectFit: "contain", marginBottom: "1.25rem", display: "inline-block" }} />
        ) : (
          <div style={{
            width: "52px", height: "52px", borderRadius: "12px",
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.25rem",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        )}

        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.4rem" }}>
          {storeName}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.75rem" }}>
          This store is password protected. Enter the password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          {/* ── Password input with eye toggle ── */}
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem 2.75rem 0.75rem 1rem",
                borderRadius: "10px",
                border: error ? "1.5px solid #ef4444" : "1.5px solid #e5e5e5",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                color: "#aaa",
              }}
            >
              {showPassword ? (
                // Eye-off SVG
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                // Eye SVG
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem", textAlign: "left" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              background: loading || !password.trim()
                ? "#ccc"
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: loading || !password.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Checking..." : "Enter store"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#bbb" }}>
          Powered by <span style={{ color: primaryColor, fontWeight: 600 }}>JUNOONI</span>
        </p>
      </div>
    </div>
  )
}
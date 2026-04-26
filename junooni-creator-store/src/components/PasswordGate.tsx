"use client"

import { useState } from "react"

interface Props {
  handle: string
  storeName: string
  storeLogo?: string | null
  primaryColor?: string
  secondaryColor?: string
  backendUrl: string
  onSuccess: (token: string) => void
}

export default function PasswordGate({
  handle,
  storeName,
  storeLogo,
  primaryColor = "#e65100",
  secondaryColor = "#ac1900",
  backendUrl,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${backendUrl}/store-front/${handle}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.verified && data.token) {
        // Set cookie with explicit settings
        // SameSite=Lax works for both path-based (dev) and subdomain (prod)
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
        const cookieName = `store_access_${handle}`
        const cookieValue = `${cookieName}=${data.token}; expires=${expires}; path=/; SameSite=Lax`

        document.cookie = cookieValue

        // Verify cookie was actually set before calling onSuccess
        const cookieSet = document.cookie.includes(`${cookieName}=`)
        console.log(`[PasswordGate] Cookie set: ${cookieSet}, name: ${cookieName}`)
        console.log(`[PasswordGate] All cookies:`, document.cookie)

        if (!cookieSet) {
          // Cookie blocked (private browsing strict mode, etc)
          // Try with different settings
          document.cookie = `${cookieName}=${data.token}; expires=${expires}; path=/`
          console.log(`[PasswordGate] Retry cookie set, cookies now:`, document.cookie)
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
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              border: error ? "1.5px solid #ef4444" : "1.5px solid #e5e5e5",
              fontSize: "0.95rem",
              outline: "none",
              marginBottom: "0.75rem",
              boxSizing: "border-box",
            }}
          />

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
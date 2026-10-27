/**
 * JUNOONI Studio — MCP Authorization Consent Page
 * Route: /mcp/authorize
 *
 * Shown when a creator connects their JUNOONI store to Claude / ChatGPT.
 * The creator must already be logged in to the Studio.
 *
 * Flow:
 *  1. Claude redirects to /api/mcp/auth/authorize  → bounced to Studio here
 *  2. This page reads OAuth params from URL
 *  3. Shows the consent card (store name, scope, permissions)
 *  4. On "Allow": POST to /api/mcp/auth/authorize with vendorId
 *  5. Backend returns { redirect_url }  → we navigate there (back to Claude)
 *  6. On "Deny": redirect to redirect_uri?error=access_denied&state=...
 *
 * Assumptions:
 *  - `useVendor()` hook returns { vendorId, storeName } for the logged-in creator
 *  - VITE_MEDUSA_BACKEND_URL is the backend base URL
 */

import { useState }       from "react"

// ── Replace with your actual vendor hook ─────────────────────────────────────
// import { useVendor } from "../hooks/useVendor"

// Temporary: read vendorId from localStorage (adjust to your auth pattern)
function useVendorId(): { vendorId: string | null; storeName: string } {
  const vendorId  = localStorage.getItem("vendor_id")
  const storeName = localStorage.getItem("vendor_store_name") ?? "Your Store"
  return { vendorId, storeName }
}

const API = import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "https://api.junooni.com"

// ─────────────────────────────────────────────────────────────────────────────

export default function McpAuthorizePage() {
  const params = new URLSearchParams(window.location.search)
  const { vendorId, storeName } = useVendorId()

  const redirectUri  = params.get("redirect_uri")  ?? ""
  const state        = params.get("state")         ?? ""
  const scopeParam   = params.get("scope")         ?? "read"
  const clientId     = params.get("client_id")     ?? "claude"

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!vendorId) {
    return (
      <div className="mcp-auth-page">
        <div className="mcp-auth-card">
          <img src="/junooni-logo.svg" alt="JUNOONI" className="mcp-logo" />
          <h2>Please log in first</h2>
          <p>You need to be logged in to your JUNOONI creator account to connect it to {clientId}.</p>
          <a
            href={`/login?return_to=${encodeURIComponent(window.location.href)}`}
            className="btn-primary"
          >
            Log in to Studio
          </a>
        </div>
      </div>
    )
  }

  // ── Allow ─────────────────────────────────────────────────────────────────────
  async function handleAllow() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/mcp/auth/authorize`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, scope: scopeParam, redirect_uri: redirectUri, state }),
      })
      const data = await res.json()
      if (!res.ok || !data.redirect_url) {
        setError(data.error ?? "Something went wrong. Please try again.")
        setLoading(false)
        return
      }
      // Redirect back to Claude / ChatGPT with the auth code
      window.location.href = data.redirect_url
    } catch {
      setError("Network error. Please check your connection and try again.")
      setLoading(false)
    }
  }

  // ── Deny ──────────────────────────────────────────────────────────────────────
  function handleDeny() {
    if (!redirectUri) { window.history.back(); return }
    const denyParams = new URLSearchParams({ error: "access_denied" })
    if (state) denyParams.set("state", state)
    window.location.href = `${redirectUri}?${denyParams.toString()}`
  }

  // ── Permissions list ──────────────────────────────────────────────────────────
  const readPerms = [
    "View your store overview (plan, product count, sales channels)",
    "View your orders and payout details",
    "View your earnings and wallet balance",
    "View your products and storefront",
    "Search the JUNOONI product catalogue",
  ]
  const writePerms = scopeParam.includes("write") ? [
    "Create new product listings (without your design — you add artwork later)",
  ] : []

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="mcp-auth-page">
      <div className="mcp-auth-card">
        {/* Header */}
        <div className="mcp-auth-header">
          <img src="/junooni-logo.svg" alt="JUNOONI" className="mcp-logo" />
          <div className="mcp-auth-arrow">→</div>
          <div className="mcp-client-icon">
            {clientId === "claude" ? "🤖" : "✨"}
          </div>
        </div>

        <h2>
          {clientId === "claude" ? "Claude" : clientId} wants to connect to your JUNOONI store
        </h2>

        {/* Store info */}
        <div className="mcp-store-pill">
          🏪 <strong>{storeName}</strong>
        </div>

        {/* Permissions */}
        <div className="mcp-permissions">
          <p className="mcp-perms-label">This will allow {clientId === "claude" ? "Claude" : clientId} to:</p>
          <ul>
            {readPerms.map(p => <li key={p}>✅ {p}</li>)}
            {writePerms.map(p => <li key={p}>✏️ {p}</li>)}
          </ul>
          <p className="mcp-perms-note">
            ⛔ It will <strong>not</strong> have access to your login credentials, private settings, or customer personal data.
          </p>
        </div>

        {/* Error */}
        {error && <p className="mcp-error">{error}</p>}

        {/* Actions */}
        <div className="mcp-auth-actions">
          <button className="btn-primary" onClick={handleAllow} disabled={loading}>
            {loading ? "Connecting…" : "Allow Access"}
          </button>
          <button className="btn-secondary" onClick={handleDeny} disabled={loading}>
            Deny
          </button>
        </div>

        <p className="mcp-legal">
          You can revoke access at any time from <strong>Studio → Settings → Connected Apps</strong>.
        </p>
      </div>
    </div>
  )
}

/*
─────────────────────────────────────────────────────────────────────────────
  Styles  (add to your global CSS / Tailwind classes as you prefer)
─────────────────────────────────────────────────────────────────────────────

.mcp-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf8f5;
  padding: 24px;
}

.mcp-auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
}

.mcp-auth-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.mcp-logo { height: 40px; }

.mcp-auth-arrow { font-size: 20px; color: #999; }

.mcp-client-icon { font-size: 36px; }

.mcp-auth-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px;
  line-height: 1.4;
}

.mcp-store-pill {
  display: inline-block;
  background: #fff8f5;
  border: 1px solid #f0e0d6;
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 14px;
  margin-bottom: 24px;
  color: #e8621a;
}

.mcp-permissions {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 16px 20px;
  text-align: left;
  margin-bottom: 24px;
}

.mcp-perms-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin: 0 0 10px;
}

.mcp-permissions ul {
  list-style: none;
  padding: 0; margin: 0;
}

.mcp-permissions li {
  font-size: 13px;
  color: #333;
  padding: 4px 0;
  line-height: 1.5;
}

.mcp-perms-note {
  font-size: 12px;
  color: #888;
  margin: 12px 0 0;
}

.mcp-error {
  color: #d32f2f;
  font-size: 14px;
  margin-bottom: 16px;
}

.mcp-auth-actions {
  display: flex;
  gap: 12px;
  flex-direction: column;
  margin-bottom: 20px;
}

.btn-primary {
  background: #e8621a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background: #d4551a; }

.btn-secondary {
  background: transparent;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
}

.btn-secondary:hover { background: #f5f5f5; }

.mcp-legal {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.5;
}
*/
/**
 * JUNOONI Studio — MCP Authorization Consent Page
 * Route: /mcp/authorize
 */

import { useEffect, useMemo, useState, type ReactNode } from "react"
import JUNOONI_LOGO from "@/assets/junooni_logo_brand_color.png"

const API = import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "https://api.junooni.com"

/**
 * Hosts that may receive the authorization result. Add every MCP client you
 * support. Leave the array empty to allow any https:// host (not recommended).
 * http://localhost is always allowed for local development.
 */
const ALLOWED_REDIRECT_HOSTS: string[] = ["claude.ai", "claude.com"]

function isAllowedRedirect(uri: string): boolean {
  try {
    const u = new URL(uri)
    if (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname)) return true
    if (u.protocol !== "https:") return false
    if (ALLOWED_REDIRECT_HOSTS.length === 0) return true
    return ALLOWED_REDIRECT_HOSTS.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

function readVendor() {
  try {
    return {
      vendorId: localStorage.getItem("vendorId"),
      email: localStorage.getItem("vendorEmail") ?? "",
    }
  } catch {
    return { vendorId: null, email: "" }
  }
}

// ── Permission copy ─────────────────────────────────────────────────────────
const READ_PERMISSIONS = [
  "Store overview: plan, product count and sales channels",
  "Orders and payout details",
  "Earnings and wallet balance",
  "Products and storefront",
  "The JUNOONI blank product catalogue",
]
const WRITE_PERMISSIONS = [
  "Create draft product listings. Designs are never uploaded; you add artwork yourself afterwards.",
]
const NO_ACCESS = ["Login credentials", "Private account settings", "Customer personal data"]

// ── Icons (inline so the page has no extra dependencies) ────────────────────
function Icon({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}
const CheckIcon = () => <Icon><path d="M20 6 9 17l-5-5" /></Icon>
const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>
const XIcon = () => <Icon><path d="M18 6 6 18M6 6l12 12" /></Icon>
const LockIcon = () => <Icon><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>
const StoreIcon = () => <Icon className="h-6 w-6"><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11h16V9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></Icon>
const SparkIcon = () => <Icon className="h-6 w-6"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></Icon>
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
)

// ── Shared layout ───────────────────────────────────────────────────────────
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8621a] focus-visible:ring-offset-2"

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 py-8 sm:px-6">
      <img src={JUNOONI_LOGO} alt="JUNOONI" className="mb-6 h-8 w-auto" />
      <div className="w-full max-w-[480px] rounded-2xl border border-[#ece7e0] bg-white p-6 shadow-[0_8px_32px_rgba(40,25,10,0.07)] sm:p-9">
        {children}
      </div>
      <p className="mt-6 text-xs text-gray-400">JUNOONI Studio · Secure authorization</p>
    </main>
  )
}

function PermissionList({
  title,
  items,
  icon,
  tone,
}: {
  title: string
  items: string[]
  icon: ReactNode
  tone: "read" | "write"
}) {
  const badge = tone === "read" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-[#e8621a]"
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <ul className="space-y-2.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-3 text-sm leading-snug text-gray-800">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${badge}`}>
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function McpAuthorizePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const { vendorId, email } = useMemo(readVendor, [])

  const redirectUri = params.get("redirect_uri") ?? ""
  const state = params.get("state") ?? ""
  const clientId = params.get("client_id") ?? "claude"
  const scopes = (params.get("scope") ?? "read").split(/[\s,]+/).filter(Boolean)
  const wantsWrite = scopes.includes("write")

  const clientLabel = clientId === "claude" ? "Claude" : clientId
  const redirectValid = isAllowedRedirect(redirectUri)
  const redirectHost = redirectValid ? new URL(redirectUri).host : ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Authorize access · JUNOONI Studio"
    // If the user returns via the browser's back button, don't stay stuck on "Connecting…"
    const reset = (e: PageTransitionEvent) => { if (e.persisted) setLoading(false) }
    window.addEventListener("pageshow", reset)
    return () => window.removeEventListener("pageshow", reset)
  }, [])

  const loginUrl = `/login?return_to=${encodeURIComponent(window.location.href)}`

  // ── Invalid request ───────────────────────────────────────────────────────
  if (!redirectValid) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XIcon />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">This link isn’t valid</h1>
          <p className="text-sm leading-relaxed text-gray-500">
            The app that sent you here didn’t provide a trusted return address, so we can’t continue.
            Go back to {clientLabel} and start the connection again.
          </p>
        </div>
      </Shell>
    )
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!vendorId) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#e8621a]">
            <LockIcon />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">Log in to continue</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            Log in to your JUNOONI creator account to connect it to {clientLabel}. You’ll come back to
            this page afterwards.
          </p>
          <a
            href={loginUrl}
            className={`block w-full rounded-lg bg-[#e8621a] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#d4551a] ${focusRing}`}
          >
            Log in to Studio
          </a>
        </div>
      </Shell>
    )
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleAllow() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, scope: scopes.join(" "), redirect_uri: redirectUri, state }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.redirect_url || !isAllowedRedirect(data.redirect_url)) {
        setError(data.error ?? "Something went wrong. Please try again.")
        setLoading(false)
        return
      }
      window.location.assign(data.redirect_url)
    } catch {
      setError("Network error. Check your connection and try again.")
      setLoading(false)
    }
  }

  function handleDeny() {
    const url = new URL(redirectUri)
    url.searchParams.set("error", "access_denied")
    if (state) url.searchParams.set("state", state)
    window.location.assign(url.toString())
  }

  // ── Consent ───────────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Connection graphic */}
      <div className="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#e8621a]">
          <StoreIcon />
        </div>
        <div className="flex items-center gap-1.5 text-gray-300">
          <span className="h-px w-6 border-t border-dashed border-gray-300" />
          <LockIcon />
          <span className="h-px w-6 border-t border-dashed border-gray-300" />
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
          <SparkIcon />
        </div>
      </div>

      <h1 className="mb-1.5 text-center text-xl font-semibold leading-snug text-gray-900">
        Connect {clientLabel} to your JUNOONI store
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {clientLabel} is asking for access to your creator account.
      </p>

      {/* Signed-in account */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#ece7e0] bg-[#fdfbf8] px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8621a] text-sm font-semibold uppercase text-white">
          {(email[0] ?? "S")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-gray-900">{email || "Your store"}</p>
        </div>
        <a
          href={loginUrl}
          className={`rounded text-xs font-medium text-[#e8621a] hover:underline ${focusRing}`}
        >
          Switch
        </a>
      </div>

      {/* Permissions */}
      <div className="mb-6 space-y-5">
        <PermissionList title="View" items={READ_PERMISSIONS} icon={<CheckIcon />} tone="read" />
        {wantsWrite && (
          <PermissionList title="Create" items={WRITE_PERMISSIONS} icon={<PlusIcon />} tone="write" />
        )}
        <section className="rounded-xl bg-gray-50 px-4 py-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <LockIcon /> {clientLabel} will not have access to
          </h3>
          <p className="text-sm text-gray-600">{NO_ACCESS.join(", ")}.</p>
        </section>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAllow}
          disabled={loading}
          aria-busy={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#e8621a] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#d4551a] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
        >
          {loading && <Spinner />}
          {loading ? "Connecting…" : "Allow access"}
        </button>
        <button
          onClick={handleDeny}
          disabled={loading}
          className={`w-full rounded-lg border border-gray-200 bg-white px-6 py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          Deny
        </button>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-gray-400">
        You’ll be sent back to <span className="font-medium text-gray-500">{redirectHost}</span>.
        Revoke access anytime in{" "}
        <span className="font-medium text-gray-500">Studio → Settings → Connected Apps</span>.
      </p>
    </Shell>
  )
}
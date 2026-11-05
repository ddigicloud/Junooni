/**
 * JUNOONI Studio — Integrations / Connected Apps
 * Route: /integrations
 *
 * Shows MCP connectors (Claude, ChatGPT) with connect / revoke flow.
 * To add another connector, append an entry to CONNECTORS below.
 */

import { useState, useEffect, type ReactNode } from "react"
import claudeicon from "@/assets/claude-icon.png"
import chatgpticon from "@/assets/chatgpt.png"

const API = import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "https://api.junooni.com"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectedApp {
  id:         string
  scope:      string
  label:      string | null
  createdAt:  string
  lastUsedAt: string | null
}

interface ConnectorStep {
  label: string
  body:  ReactNode
}

interface ConnectorDef {
  id:            string          // must match the prefix of the token label stored by the backend
  name:          string
  description:   string
  icon:          string          // image URL
  mcpUrl:        string          // the URL creators paste into the client
  settingsUrl:   string          // where the creator adds the connector
  requirements?: string          // shown as a note in the connect modal
  steps:         ConnectorStep[]
}

// ─── Connector catalogue ──────────────────────────────────────────────────────

const CONNECTORS: ConnectorDef[] = [
  {
    id:          "claude",
    name:        "Claude",
    description: "Ask Claude about your store: orders, earnings, products and pricing, right inside Claude.ai or Claude Desktop.",
    icon:        claudeicon,
    mcpUrl:      `${API}/mcp`,
    settingsUrl: "https://claude.ai/settings/connectors",
    steps: [
      {
        label: "Open Claude Settings",
        body:  <>Go to <strong>claude.ai</strong> → <strong>Settings</strong> → <strong>Connectors</strong>.</>,
      },
      {
        label: "Add a custom connector",
        body:  <>Click <strong>Add custom connector</strong>, name it JUNOONI and paste the URL above.</>,
      },
      {
        label: "Approve access",
        body:  <>Click <strong>Connect</strong>. Claude opens a JUNOONI page. Sign in and click <strong>Allow access</strong>.</>,
      },
      {
        label: "Start asking",
        body:  <>Try “What are my last 5 orders?” or “What’s my wallet balance?”</>,
      },
    ],
  },
  {
    id:           "chatgpt",
    name:         "ChatGPT",
    description:  "Ask ChatGPT about your store: orders, earnings, products and pricing, from any ChatGPT conversation.",
    icon:         chatgpticon,
    mcpUrl:       `${API}/mcp`,
    settingsUrl:  "https://chatgpt.com/settings/plugins-settings",
    requirements: "Custom connectors need a paid ChatGPT plan with Developer mode. On Business, Enterprise or Edu workspaces, an admin may need to enable it first.",
    steps: [
      {
        label: "Turn on Developer mode",
        body:  <>In ChatGPT, open <strong>Settings</strong> → <strong>Apps &amp; Connectors</strong> → <strong>Advanced settings</strong> and switch on <strong>Developer mode</strong>.</>,
      },
      {
        label: "Create the connector",
        body:  <>Click <strong>Create</strong>, name it JUNOONI and paste the URL above as the MCP server URL.</>,
      },
      {
        label: "Approve access",
        body:  <>ChatGPT opens a JUNOONI page. Sign in and click <strong>Allow access</strong>.</>,
      },
      {
        label: "Use it in a chat",
        body:  <>In a new chat, switch JUNOONI on from the Developer mode menu, then ask “What are my last 5 orders?”</>,
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vendorId(): string | null {
  try {
    return localStorage.getItem("vendorId")
  } catch {
    return null
  }
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function timeSince(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const m    = Math.floor(diff / 60000)
  if (m < 1)   return "just now"
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/**
 * Assign tokens to connectors by label prefix (e.g. "chatgpt", "claude").
 * Tokens created before labels existed have no label and belong to Claude,
 * the only connector at the time.
 */
function tokensFor(connector: ConnectorDef, tokens: ConnectedApp[]): ConnectedApp[] {
  return tokens.filter(t =>
    t.label ? t.label.toLowerCase().startsWith(connector.id) : connector.id === "claude"
  )
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8621a] focus-visible:ring-offset-2"

// ─── Connector icon ───────────────────────────────────────────────────────────

function ConnectorIcon({ connector, className }: { connector: ConnectorDef; className: string }) {
  return <img src={connector.icon} alt="" className={`${className} object-contain`} />
}

// ─── Token list for one connector ─────────────────────────────────────────────

function TokenList({
  tokens,
  onRevoke,
}: {
  tokens:   ConnectedApp[]
  onRevoke: (id: string) => Promise<void>
}) {
  const [revoking, setRevoking] = useState<string | null>(null)

  async function handleRevoke(id: string) {
    setRevoking(id)
    await onRevoke(id)
    setRevoking(null)
  }

  if (tokens.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {tokens.map(t => (
        <div
          key={t.id}
          className="flex items-center justify-between bg-[#faf8f5] border border-[#ede8e1] rounded-lg px-4 py-2.5"
        >
          <div className="text-[13px]">
            <span className="text-gray-700 font-medium">{t.label ?? "Connected"}</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-400">Connected {fmt(t.createdAt)}</span>
            {t.lastUsedAt && (
              <>
                <span className="text-gray-300 mx-2">·</span>
                <span className="text-gray-400">Last used {timeSince(t.lastUsedAt)}</span>
              </>
            )}
          </div>
          <button
            onClick={() => handleRevoke(t.id)}
            disabled={revoking === t.id}
            className={`text-[12px] text-red-500 hover:text-red-600 disabled:opacity-40 transition-colors ml-4 shrink-0 rounded ${focusRing}`}
          >
            {revoking === t.id ? "Revoking…" : "Revoke"}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Connect modal ─────────────────────────────────────────────────────────────

function ConnectModal({
  connector,
  onClose,
}: {
  connector: ConnectorDef
  onClose:   () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  async function copy() {
    try {
      await navigator.clipboard.writeText(connector.mcpUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; the URL stays visible for manual copy.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-title"
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[660px] shadow-xl overflow-hidden"
      >

        {/* Header */}
        <div className="bg-[#faf8f5] border-b border-[#ede8e1] px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ConnectorIcon connector={connector} className="w-9 h-9 rounded-lg" />
            <div>
              <p id="connect-modal-title" className="text-[15px] font-semibold text-[#1a1a1a]">
                Connect {connector.name}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">Add JUNOONI as a connector in {connector.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors rounded ${focusRing}`}
          >
            ✕
          </button>
        </div>

        <div className="px-7 py-6 space-y-5">

          {/* Requirements */}
          {/* {connector.requirements && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[12px] leading-relaxed rounded-lg px-4 py-3">
              {connector.requirements}
            </div>
          )} */}

          {/* MCP URL copy box */}
          <div>
            <p className="text-[12px] font-semibold text-gray-500 mb-2">Server URL</p>
            <div className="flex items-center gap-2 bg-[#faf8f5] border border-[#ede8e1] rounded-lg px-4 py-2.5">
              <code className="text-[13px] text-[#1a1a1a] flex-1 truncate font-mono">
                {connector.mcpUrl}
              </code>
              <button
                onClick={copy}
                className={`shrink-0 text-[12px] font-semibold text-[#e8621a] hover:text-[#d4551a] transition-colors rounded ${focusRing}`}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          {/* Steps */}
          <ol className="space-y-3">
            {connector.steps.map((s, i) => (
              <li key={s.label} className="flex gap-3.5">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#fff3ee] border border-[#f0cfc0] flex items-center justify-center text-[12px] font-bold text-[#e8621a] mt-0.5">
                  {i + 1}
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-800">{s.label}. </span>
                  {s.body}
                </div>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <a
            href={connector.settingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full text-center bg-[#e8621a] hover:bg-[#d4551a] text-white font-semibold text-[14px] py-3 rounded-lg transition-colors ${focusRing}`}
          >
            Open {connector.name} settings
          </a>

          <p className="text-[12px] text-gray-400 text-center leading-relaxed">
            {connector.name} will ask you to log in with your JUNOONI account and confirm what it can access.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Connector card ────────────────────────────────────────────────────────────

function ConnectorCard({
  connector,
  tokens,
  onRevoke,
}: {
  connector: ConnectorDef
  tokens:    ConnectedApp[]
  onRevoke:  (id: string) => Promise<void>
}) {
  const [showModal, setShowModal] = useState(false)
  const isConnected = tokens.length > 0

  return (
    <>
      <div className="bg-white border border-[#ede8e1] rounded-xl p-5">

        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#faf8f5] border border-[#ede8e1] flex items-center justify-center shrink-0">
              <ConnectorIcon connector={connector} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-[#1a1a1a]">{connector.name}</p>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5 leading-snug max-w-[340px]">
                {connector.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={`shrink-0 text-[13px] font-semibold px-4 py-2 rounded-lg border transition-colors ${focusRing} ${
              isConnected
                ? "border-[#e8621a] text-[#e8621a] hover:bg-[#fff8f5]"
                : "bg-[#e8621a] text-white hover:bg-[#d4551a] border-transparent"
            }`}
          >
            {isConnected ? "Reconnect" : "Connect"}
          </button>
        </div>

        {/* Active connections */}
        {isConnected && (
          <div className="mt-4 border-t border-[#f0ece6] pt-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2">
              {tokens.length} active connection{tokens.length > 1 ? "s" : ""}
            </p>
            <TokenList tokens={tokens} onRevoke={onRevoke} />
          </div>
        )}
      </div>

      {showModal && (
        <ConnectModal connector={connector} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [tokens,  setTokens]  = useState<ConnectedApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const vid = vendorId()

  // Load tokens
  async function loadTokens() {
    if (!vid) { setLoading(false); return }
    try {
      const res  = await fetch(`${API}/mcp/tokens?vendorId=${vid}`)
      const data = await res.json()
      setTokens(Array.isArray(data.tokens) ? data.tokens : [])
    } catch {
      setError("Couldn't load connected apps. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTokens() }, [])

  // Revoke a token
  async function handleRevoke(tokenId: string) {
    if (!vid) return
    setError(null)
    try {
      const res = await fetch(`${API}/mcp/tokens/${tokenId}`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ vendorId: vid }),
      })
      if (!res.ok) throw new Error("revoke failed")
      setTokens(prev => prev.filter(t => t.id !== tokenId))
    } catch {
      setError("Failed to revoke access. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Connected Apps</h1>
          <p className="text-[14px] text-gray-500 mt-1.5 leading-relaxed">
            Connect AI assistants to your JUNOONI store. They only get the access you approve, and never your login credentials or customer personal information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Connector list */}
        {loading ? (
          <div className="space-y-3">
            {CONNECTORS.map(c => (
              <div key={c.id} className="bg-white border border-[#ede8e1] rounded-xl h-[88px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {CONNECTORS.map(c => (
              <ConnectorCard
                key={c.id}
                connector={c}
                tokens={tokensFor(c, tokens)}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-[12px] text-gray-400 leading-relaxed">
          Connected apps can only access what you approve. You can revoke access at any time from this page.
          Your login credentials and customer personal data are never shared.
        </p>
      </div>
    </div>
  )
}
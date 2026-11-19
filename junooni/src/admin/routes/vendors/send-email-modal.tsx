import { useState, useEffect, useRef } from "react"
import { Button, Text, Badge } from "@medusajs/ui"

export interface Vendor {
  id: string
  name: string
  handle?: string
  logo?: string
  sell_on_marketplace: boolean
  sell_on_own_store: boolean
  admins: { email: string; first_name?: string; last_name?: string }[]
}

interface SavedTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  created_at: string
}

const STORAGE_KEY = "junooni_vendor_email_templates"

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; padding: 24px; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 3px; }
    .body { background: #fff; padding: 32px; }
    .body h2 { color: #111; margin-top: 0; }
    .body p { color: #444; line-height: 1.7; }
    .cta { display: inline-block; background: #000; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 8px 0; }
    .footer { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; margin: 4px 0; }
    .footer a { color: #999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>JUNOONI</h1>
    </div>
    <div class="body">
      <h2>Hello Creator,</h2>
      <p>Your message goes here. Replace this with your actual content.</p>
      <p>You can add multiple paragraphs, links, and inline styles.</p>
      <a href="https://studio.junooni.com" class="cta">Go to Creator Studio</a>
    </div>
    <div class="footer">
      <p>JUNOONI Creator Commerce Platform</p>
      <p><a href="https://junooni.com">junooni.com</a> · support@junooni.com</p>
    </div>
  </div>
</body>
</html>`

interface Props {
  vendors: Vendor[]
  selectedIds: Set<string>
  onClose: () => void
}

export const SendEmailModal = ({ vendors, selectedIds, onClose }: Props) => {
  const [subject, setSubject] = useState("")
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML)
  const [sendTarget, setSendTarget] = useState<"selected" | "all">(
    selectedIds.size > 0 ? "selected" : "all"
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [activeTab, setActiveTab] = useState<"compose" | "preview" | "templates">("compose")
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [saveName, setSaveName] = useState("")
  const [showSaveForm, setShowSaveForm] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedTemplates(JSON.parse(stored))
    } catch {}
  }, [])

  // Write preview HTML into iframe when switching to preview tab
  useEffect(() => {
    if (activeTab !== "preview") return
    const iframe = iframeRef.current
    if (!iframe) return
    // small delay to ensure iframe is mounted
    const timer = setTimeout(() => {
      const doc = iframe.contentDocument
      if (doc) { doc.open(); doc.write(htmlContent); doc.close() }
    }, 50)
    return () => clearTimeout(timer)
  }, [activeTab, htmlContent])

  const targetVendors = sendTarget === "all"
    ? vendors
    : vendors.filter(v => selectedIds.has(v.id))

  const allEmails = targetVendors.flatMap(v => v.admins.map(a => a.email))
  const uniqueEmails = [...new Set(allEmails)]
  const skippedVendors = targetVendors.filter(v => v.admins.length === 0)

  const vendorNameByEmail: Record<string, string> = {}
  targetVendors.forEach(v =>
    v.admins.forEach(a => { vendorNameByEmail[a.email] = v.name })
  )

  const handleSend = async () => {
    setError(null)
    if (!subject.trim()) return setError("Subject line is required.")
    if (!htmlContent.trim()) return setError("Email content is required.")
    if (uniqueEmails.length === 0) return setError("No admin emails found for the selected vendors.")

    setSending(true)
    try {
      const res = await fetch("/admin/vendors/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          emails: uniqueEmails,
          vendor_names: vendorNameByEmail,
          subject: subject.trim(),
          html_content: htmlContent,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setResult({ sent: data.sent, failed: data.failed ?? 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send emails.")
    } finally {
      setSending(false)
    }
  }

  const persistTemplates = (list: SavedTemplate[]) => {
    setSavedTemplates(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const saveTemplate = () => {
    if (!saveName.trim()) return
    const tpl: SavedTemplate = {
      id: Date.now().toString(),
      name: saveName.trim(),
      subject,
      html_content: htmlContent,
      created_at: new Date().toISOString(),
    }
    persistTemplates([...savedTemplates, tpl])
    setSaveName("")
    setShowSaveForm(false)
  }

  const loadTemplate = (tpl: SavedTemplate) => {
    setSubject(tpl.subject)
    setHtmlContent(tpl.html_content)
    setActiveTab("compose")
  }

  const tabs = [
    { id: "compose" as const, label: "Compose" },
    { id: "preview" as const, label: "Preview" },
    { id: "templates" as const, label: `Saved Templates (${savedTemplates.length})` },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-ui-bg-subtle shrink-0">
          <div>
            <Text className="text-lg font-semibold">Send Email to Vendors</Text>
            <Text className="text-sm text-ui-fg-muted mt-0.5">
              {uniqueEmails.length} recipient{uniqueEmails.length !== 1 ? "s" : ""} across&nbsp;
              {targetVendors.length} vendor{targetVendors.length !== 1 ? "s" : ""}
            </Text>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ui-bg-base-hover transition-colors text-ui-fg-muted"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar — recipients */}
          <div className="w-60 border-r flex flex-col bg-ui-bg-subtle shrink-0 overflow-hidden">
            <div className="p-4 border-b">
              <Text className="text-xs font-semibold text-ui-fg-muted uppercase tracking-widest mb-3">
                Send to
              </Text>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio" name="sendTarget" value="selected"
                    checked={sendTarget === "selected"}
                    onChange={() => setSendTarget("selected")}
                    disabled={selectedIds.size === 0}
                    className="accent-black"
                  />
                  <Text className="text-sm">
                    Selected&nbsp;
                    <Badge color="blue" size="small">{selectedIds.size}</Badge>
                  </Text>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio" name="sendTarget" value="all"
                    checked={sendTarget === "all"}
                    onChange={() => setSendTarget("all")}
                    className="accent-black"
                  />
                  <Text className="text-sm">
                    All vendors&nbsp;
                    <Badge color="grey" size="small">{vendors.length}</Badge>
                  </Text>
                </label>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <Text className="text-xs font-semibold text-ui-fg-muted uppercase tracking-widest mb-1">
                Recipients
              </Text>
              {targetVendors.length === 0 ? (
                <Text className="text-xs text-ui-fg-muted">No vendors selected.</Text>
              ) : (
                targetVendors.map(v => (
                  <div key={v.id} className="bg-white rounded-lg p-2.5 border text-xs space-y-0.5">
                    <Text className="font-medium">{v.name}</Text>
                    {v.admins.length === 0 ? (
                      <Text className="text-orange-500">No admin — will be skipped</Text>
                    ) : (
                      v.admins.map((a, i) => (
                        <Text key={i} className="text-ui-fg-muted truncate">{a.email}</Text>
                      ))
                    )}
                  </div>
                ))
              )}
            </div>

            {skippedVendors.length > 0 && (
              <div className="p-3 bg-orange-50 border-t border-orange-100 shrink-0">
                <Text className="text-xs text-orange-600">
                  ⚠ {skippedVendors.length} vendor{skippedVendors.length !== 1 ? "s" : ""} without
                  admins will be skipped.
                </Text>
              </div>
            )}
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b px-6 shrink-0 bg-white">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.id
                      ? "border-black text-ui-fg-base"
                      : "border-transparent text-ui-fg-muted hover:text-ui-fg-subtle"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Compose */}
            {activeTab === "compose" && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-ui-fg-base mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Important update for JUNOONI creators"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-ui-fg-base">
                      HTML Content *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setHtmlContent(DEFAULT_HTML)}
                        className="text-xs text-ui-fg-muted hover:text-ui-fg-base underline"
                      >
                        Reset to default
                      </button>
                      <button
                        onClick={() => setShowSaveForm(!showSaveForm)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        {showSaveForm ? "Cancel save" : "Save as template"}
                      </button>
                    </div>
                  </div>

                  {showSaveForm && (
                    <div className="flex gap-2 mb-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <input
                        type="text"
                        value={saveName}
                        onChange={e => setSaveName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveTemplate()}
                        placeholder="Template name…"
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        onClick={saveTemplate}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <textarea
                    value={htmlContent}
                    onChange={e => setHtmlContent(e.target.value)}
                    placeholder="Paste or write your HTML email here…"
                    className="flex-1 font-mono text-xs border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black/20"
                    style={{ minHeight: "360px" }}
                  />
                  <Text className="text-xs text-ui-fg-muted mt-1">
                    {htmlContent.length.toLocaleString()} chars · Full HTML with inline styles supported
                  </Text>
                </div>
              </div>
            )}

            {/* Tab: Preview */}
            {activeTab === "preview" && (
              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="border rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="bg-ui-bg-subtle px-4 py-2 border-b flex items-center gap-2 shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"/>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                      <div className="w-3 h-3 rounded-full bg-green-400"/>
                    </div>
                    <Text className="text-xs text-ui-fg-muted ml-2 truncate">
                      {subject || "(no subject)"}
                    </Text>
                  </div>
                  <iframe
                    ref={iframeRef}
                    title="Email Preview"
                    className="flex-1 w-full"
                    style={{ border: "none" }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}

            {/* Tab: Saved Templates */}
            {activeTab === "templates" && (
              <div className="flex-1 overflow-y-auto p-6">
                {savedTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                    <Text className="text-ui-fg-muted">No saved templates yet.</Text>
                    <Text className="text-xs text-ui-fg-muted">
                      Compose an email, then click "Save as template" to store it here.
                    </Text>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {savedTemplates.map(tpl => (
                      <div
                        key={tpl.id}
                        className="border rounded-xl p-4 hover:border-ui-border-strong transition-colors bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Text className="font-medium truncate">{tpl.name}</Text>
                            <Text className="text-sm text-ui-fg-muted mt-0.5 truncate">
                              Subject: {tpl.subject || "(none)"}
                            </Text>
                            <Text className="text-xs text-ui-fg-muted mt-1">
                              Saved {new Date(tpl.created_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </Text>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => loadTemplate(tpl)}
                            >
                              Load
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => persistTemplates(savedTemplates.filter(t => t.id !== tpl.id))}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t px-6 py-4 bg-ui-bg-subtle flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7.5 4.5v3M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <Text className="text-sm truncate">{error}</Text>
              </div>
            )}
            {result && (
              <div className="flex items-center gap-2 text-green-600">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Text className="text-sm">
                  Sent to {result.sent} recipient{result.sent !== 1 ? "s" : ""}
                  {result.failed > 0 ? ` · ${result.failed} failed` : ""}
                </Text>
              </div>
            )}
          </div>

          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" onClick={onClose}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <button
                onClick={handleSend}
                disabled={sending || uniqueEmails.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-ui-bg-base-pressed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="2"
                        strokeDasharray="12 20" strokeLinecap="round"/>
                    </svg>
                    Sending…
                  </>
                ) : (
                  `Send to ${uniqueEmails.length} recipient${uniqueEmails.length !== 1 ? "s" : ""}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
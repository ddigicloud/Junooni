import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Button,
  Badge,
  Table,
  Heading,
  Text,
  Input,
  Textarea,
  Select,
  Switch,
  toast,
  usePrompt,
  Container,
  StatusBadge,
} from "@medusajs/ui"
import { PencilSquare, Trash, Plus, Eye, ArrowLeft, BookOpen, XMark } from "@medusajs/icons"

// ─── Authenticated fetch helper ───────────────────────────────────────────────

function getAdminToken(): string {
  try {
    return localStorage.getItem("medusa_admin_token") ?? ""
  } catch {
    return ""
  }
}

async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken()
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  category: string | null
  tags: string[] | null
  is_published: boolean
  published_at: string | null
  read_time_minutes: number | null
  seo_title?: string
  seo_description?: string
  created_at: string
}

type Category = {
  id: string
  label: string
  value: string
  sort_order: number
}

type View = "list" | "create" | "edit"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim()
}

// ─── Category Manager ─────────────────────────────────────────────────────────

function CategoryManager({
  categories,
  loading,
  onAdd,
  onDelete,
  onClose,
}: {
  categories: Category[]
  loading: boolean
  onAdd: (label: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}) {
  const [newLabel, setNewLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleAdd = async () => {
    const trimmed = newLabel.trim()
    if (!trimmed) { toast.error("Please enter a category name"); return }
    setSaving(true)
    try {
      await onAdd(trimmed)
      setNewLabel("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 460,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          display: "flex", flexDirection: "column", gap: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Heading level="h2">Manage Categories</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {loading ? "Loading..." : `${categories.length} ${categories.length === 1 ? "category" : "categories"} · saved to database`}
            </Text>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer",
              color: "#9ca3af", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}>
            <XMark />
          </button>
        </div>

        <div style={{
          display: "flex", gap: 8, padding: "10px 12px",
          background: "#f3f4f6", borderRadius: 8, border: "1px solid #e5e7eb",
        }}>
          <input
            ref={inputRef}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); handleAdd() }
            }}
            placeholder="e.g. Behind the Scenes"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#111827", fontSize: 14, padding: "2px 0",
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            style={{
              padding: "6px 16px",
              background: saving ? "#6b7280" : "#111827",
              color: "#fff",
              border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {saving ? "Adding..." : "+ Add"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Text size="small" className="text-ui-fg-subtle">Loading categories...</Text>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Text size="small" className="text-ui-fg-subtle">
                No categories yet — type above and click Add
              </Text>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", background: "#f9fafb",
                border: "1px solid #e5e7eb", borderRadius: 8,
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Text size="small" weight="plus">{cat.label}</Text>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>
                    {cat.value}
                  </span>
                </div>
                <button type="button" onClick={() => onDelete(cat.id)} title="Delete"
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#f87171", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}>
                  <Trash />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} type="button">Done</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Rich Text Editor (with HTML/CSS Source mode) ─────────────────────────────

type EditorMode = "visual" | "html" | "preview"

/**
 * Given arbitrary HTML (may include <style>, <meta>, <link>, <head>, <body>
 * wrapper tags produced by full-page templates), extract only the visible
 * body content so the Visual editor doesn't render leaked CSS or meta tags.
 *
 * Strategy:
 *  1. If a <body> tag exists, grab its inner HTML.
 *  2. Strip any remaining <style>, <script>, <meta>, <link>, <title>, <head>
 *     tags plus their contents.
 *  3. Return the cleaned fragment.
 */
function stripToBodyContent(html: string): string {
  // 1. Extract <body>…</body> if present
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let content = bodyMatch ? bodyMatch[1] : html

  // 2. Remove head-only tags (with their contents)
  content = content
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<meta[^>]*\/?>/gi, "")
    .replace(/<link[^>]*\/?>/gi, "")
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")

  return content.trim()
}

/** Returns true if the HTML contains custom CSS/head markup that must be preserved verbatim */
function hasCustomMarkup(html: string): boolean {
  return /<style[\s\S]*?>/i.test(html) ||
    /<meta\s/i.test(html) ||
    /<link\s/i.test(html) ||
    /<head[\s\S]*?>/i.test(html)
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const initialized = useRef(false)

  // sourceValue is the authoritative full HTML (with <style> etc.) shown in the HTML tab.
  const [sourceValue, setSourceValue] = useState(value)

  // Track whether current content has custom CSS/head markup.
  // When true: Visual tab is read-only (displays stripped preview), HTML tab is the only edit surface.
  const [isCustomHtml, setIsCustomHtml] = useState(() => hasCustomMarkup(value))

  // Default to HTML tab if the saved content already has custom markup.
  const [mode, setMode] = useState<EditorMode>(() =>
    hasCustomMarkup(value) ? "html" : "visual"
  )

  const handleModeChange = (newMode: EditorMode) => {
    if (newMode === "visual" && mode === "html") {
      // HTML → Visual: show stripped body content for preview.
      // Do NOT call onChange — source is already saved on every keystroke.
      if (editorRef.current) {
        editorRef.current.innerHTML = stripToBodyContent(sourceValue)
        initialized.current = true
      }
    }
    if ((newMode === "html" || newMode === "preview") && mode === "visual" && !isCustomHtml) {
      // Visual → HTML/Preview (only when no custom HTML): sync visual content into source.
      const latest = editorRef.current?.innerHTML ?? value
      setSourceValue(latest)
      // onChange already up-to-date from handleVisualInput
    }
    setMode(newMode)
  }

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val)
    editorRef.current?.focus()
    if (editorRef.current && !isCustomHtml) onChange(editorRef.current.innerHTML)
  }

  // Only meaningful when isCustomHtml is false (contenteditable is editable).
  const handleVisualInput = () => {
    if (editorRef.current && !isCustomHtml) onChange(editorRef.current.innerHTML)
  }

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value
    setSourceValue(newVal)
    onChange(newVal) // always save the full source including <style> tags
    const custom = hasCustomMarkup(newVal)
    setIsCustomHtml(custom)
  }

  const toolbarButtons = [
    { label: "B",  title: "Bold",           action: () => exec("bold"),                                                       style: "font-bold" },
    { label: "I",  title: "Italic",          action: () => exec("italic"),                                                    style: "italic" },
    { label: "U",  title: "Underline",       action: () => exec("underline"),                                                 style: "underline" },
    { label: "H2", title: "Heading 2",       action: () => exec("formatBlock", "h2"),                                         style: "" },
    { label: "H3", title: "Heading 3",       action: () => exec("formatBlock", "h3"),                                         style: "" },
    { label: "¶",  title: "Paragraph",       action: () => exec("formatBlock", "p"),                                          style: "" },
    { label: "UL", title: "Bullet List",     action: () => exec("insertUnorderedList"),                                       style: "" },
    { label: "OL", title: "Ordered List",    action: () => exec("insertOrderedList"),                                         style: "" },
    { label: '"',  title: "Blockquote",      action: () => exec("formatBlock", "blockquote"),                                 style: "" },
    { label: "🔗", title: "Insert Link",     action: () => { const url = prompt("Enter URL:"); if (url) exec("createLink", url) }, style: "" },
    { label: "—",  title: "Horizontal Rule", action: () => exec("insertHorizontalRule"),                                      style: "" },
    { label: "⎌",  title: "Undo",            action: () => exec("undo"),                                                      style: "" },
    { label: "⎏",  title: "Redo",            action: () => exec("redo"),                                                      style: "" },
  ]

  // Word count from the current HTML value
  const currentHtml = mode === "html" ? sourceValue : (editorRef.current?.innerHTML ?? value)
  const wordCount = currentHtml.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length

  // Tab styles helper
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    color: active ? "#111827" : "#6b7280",
    background: active ? "#ffffff" : "transparent",
    border: "none",
    borderRadius: "5px 5px 0 0",
    cursor: "pointer",
    borderBottom: active ? "2px solid #111827" : "2px solid transparent",
    transition: "all 0.15s",
  })

  return (
    <div className="flex flex-col overflow-hidden border rounded-lg border-ui-border-base">
      {/* ── Top bar: mode tabs + (visual-only) format buttons ── */}
      <div style={{
        display: "flex", alignItems: "stretch", flexWrap: "wrap", gap: 0,
        background: "var(--color-bg-subtle, #f9fafb)",
        borderBottom: "1px solid var(--color-border-base, #e5e7eb)",
        padding: "4px 6px 0",
      }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, marginRight: 12 }}>
          <button type="button" style={tabStyle(mode === "visual")} onClick={() => handleModeChange("visual")}>
            Visual
          </button>
          <button type="button" style={tabStyle(mode === "html")} onClick={() => handleModeChange("html")}>
            {"</>"}  HTML / CSS
          </button>
          <button type="button" style={tabStyle(mode === "preview")} onClick={() => handleModeChange("preview")}>
            Preview
          </button>
        </div>

        {/* Visual-mode toolbar — hidden when content has custom HTML/CSS */}
        {mode === "visual" && !isCustomHtml && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", paddingBottom: 4 }}>
            {toolbarButtons.map((btn) => (
              <button key={btn.title} title={btn.title} type="button"
                onMouseDown={(e) => { e.preventDefault(); btn.action() }}
                className={`px-2 py-1 text-xs rounded hover:bg-ui-bg-base-hover text-ui-fg-base transition-colors min-w-[28px] ${btn.style}`}>
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Visual read-only notice when custom HTML is present */}
        {mode === "visual" && isCustomHtml && (
          <div style={{ display: "flex", alignItems: "center", paddingBottom: 4 }}>
            <span style={{
              fontSize: 11, color: "#b45309", fontFamily: "monospace",
              background: "#fef3c7", padding: "2px 10px", borderRadius: 4,
              border: "1px solid #fcd34d",
            }}>
              ⚠ Read-only preview — this post has custom HTML/CSS. Edit in the HTML tab.
            </span>
          </div>
        )}

        {/* HTML-mode hint */}
        {mode === "html" && (
          <div style={{ display: "flex", alignItems: "center", paddingBottom: 4 }}>
            <span style={{
              fontSize: 11, color: "#6b7280", fontFamily: "monospace",
              background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, border: "1px solid #e5e7eb",
            }}>
              Raw HTML + inline CSS — changes saved on every keystroke
            </span>
          </div>
        )}

        <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", padding: "6px 4px 4px", alignSelf: "flex-end" }}>
          {mode === "visual" ? (isCustomHtml ? "Preview" : "Rich Text") : mode === "html" ? "Source" : "Preview"}
        </span>
      </div>

      {/* ── Visual editor ── */}
      {mode === "visual" && (
        <div
          ref={(el) => {
            editorRef.current = el
            if (el && !initialized.current) {
              el.innerHTML = stripToBodyContent(sourceValue)
              initialized.current = true
            }
          }}
          contentEditable={!isCustomHtml}
          suppressContentEditableWarning
          onInput={handleVisualInput}
          className="min-h-[320px] p-4 text-sm text-ui-fg-base focus:outline-none"
          style={{
            lineHeight: "1.7",
            // Visual cue that this is not editable when custom HTML is present
            ...(isCustomHtml ? {
              cursor: "default",
              background: "var(--color-bg-subtle, #f9fafb)",
              color: "var(--color-fg-subtle, #6b7280)",
              userSelect: "text",
            } : {}),
          }}
        />
      )}

      {/* ── HTML / CSS source editor ── */}
      {mode === "html" && (
        <div style={{ position: "relative" }}>
          <textarea
            value={sourceValue}
            onChange={handleSourceChange}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 320,
              padding: "16px",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
              fontSize: 13,
              lineHeight: "1.65",
              color: "#1e293b",
              //background: "#0f172a",
              border: "none",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              tabSize: 2,
              whiteSpace: "pre",
              overflowX: "auto",
            }}
            placeholder={`<!-- Write HTML here, including inline <style> tags or inline CSS -->
<style>
  .my-highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
  }
</style>

<div class="my-highlight">
  <h2>Custom styled section</h2>
  <p>Full HTML and CSS supported here.</p>
</div>`}
            onKeyDown={(e) => {
              // Tab key inserts spaces instead of moving focus
              if (e.key === "Tab") {
                e.preventDefault()
                const el = e.currentTarget
                const start = el.selectionStart
                const end = el.selectionEnd
                const newVal = el.value.substring(0, start) + "  " + el.value.substring(end)
                setSourceValue(newVal)
                onChange(newVal)
                // Restore cursor position after React re-render
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2
                })
              }
            }}
          />
          {/* Line count gutter overlay (cosmetic) */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: 40,
            height: "100%", background: "rgba(255,255,255,0.03)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }} />
        </div>
      )}

      {/* ── Preview mode ── */}
      {mode === "preview" && (
        <div style={{ position: "relative" }}>
          {/* Label */}
          <div style={{
            position: "absolute", top: 8, right: 12,
            fontSize: 11, color: "#9ca3af",
            background: "#f3f4f6", padding: "2px 8px",
            borderRadius: 4, border: "1px solid #e5e7eb", zIndex: 1,
          }}>
            Rendered preview
          </div>
          {/* Sandboxed iframe render */}
          <iframe
            key={sourceValue}  /* re-mount on content change */
            srcDoc={`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px; line-height: 1.7;
    color: #111827; padding: 20px 24px;
    margin: 0;
  }
  h1,h2,h3,h4 { margin: 1.2em 0 0.5em; font-weight: 700; }
  h2 { font-size: 1.4em; } h3 { font-size: 1.2em; }
  p { margin: 0.75em 0; }
  a { color: #3b82f6; }
  blockquote { border-left: 3px solid #d1d5db; margin: 1em 0; padding: 0.5em 1em; color: #6b7280; }
  ul,ol { padding-left: 1.5em; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
  img { max-width: 100%; border-radius: 6px; }
  pre,code { font-family: monospace; background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; }
</style>
</head>
<body>${sourceValue || "<p style='color:#9ca3af'>Nothing to preview yet.</p>"}</body>
</html>`}
            style={{
              width: "100%", minHeight: 320,
              border: "none", background: "#fff",
              display: "block",
            }}
            sandbox="allow-same-origin"
            title="Content preview"
          />
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid var(--color-border-base, #e5e7eb)",
        padding: "6px 12px",
        background: "var(--color-bg-subtle, #f9fafb)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {wordCount} words · ~{Math.ceil(wordCount / 200)} min read
        </Text>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {mode === "html" && (
            <span style={{ fontSize: 11, color: "#6b7280" }}>
              {sourceValue.length.toLocaleString()} chars
            </span>
          )}
          <Text size="xsmall" className="text-ui-fg-muted">
            {mode === "html" ? "HTML + CSS" : mode === "preview" ? "Preview mode" : "Rich Text"}
          </Text>
        </div>
      </div>
    </div>
  )
}

// ─── Cover Image Uploader ─────────────────────────────────────────────────────

function CoverImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const token = getAdminToken()
      const formData = new FormData()
      formData.append("files", file)
      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      const url = data.files?.[0]?.url ?? data.url ?? data[0]?.url
      if (url) onChange(url)
      else throw new Error("No URL in response")
    } catch (err) {
      console.error("[BLOG] upload error:", err)
      toast.error("Upload failed — try pasting a URL instead")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-1">
        <Text size="small" weight="plus">Image URL</Text>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex items-center gap-x-2">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        <Button variant="secondary" size="small" isLoading={uploading} type="button"
          onClick={() => fileInputRef.current?.click()}>
          {uploading ? "Uploading..." : "📁 Upload Image"}
        </Button>
        {value && (
          <Button variant="transparent" size="small" type="button" onClick={() => onChange("")}>Remove</Button>
        )}
      </div>
      {value && (
        <img src={value} alt="Cover preview"
          className="object-cover w-full border rounded-lg aspect-video border-ui-border-base"
          onError={(e) => { ;(e.target as HTMLImageElement).style.display = "none" }}
        />
      )}
    </div>
  )
}

// ─── Blog Admin Page (root) ───────────────────────────────────────────────────

export default function BlogPage() {
  const [view, setView]               = useState<View>("list")
  const [posts, setPosts]             = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showCatManager, setShowCatManager] = useState(false)

  const [categories, setCategories]     = useState<Category[]>([])
  const [loadingCats, setLoadingCats]   = useState(true)

  const dialog = usePrompt()

  const fetchCategories = useCallback(async () => {
    setLoadingCats(true)
    try {
      const res  = await adminFetch("/admin/blog/categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      toast.error("Failed to load categories")
    } finally {
      setLoadingCats(false)
    }
  }, [])

  const addCategory = async (label: string) => {
    const value = slugify(label)
    if (!value) { toast.error("Invalid category name"); return }
    try {
      const res = await adminFetch("/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, value, sort_order: categories.length }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message || "Failed to create category"); return }
      setCategories((prev) => [...prev, data.category])
      toast.success(`"${label}" saved to database`)
    } catch {
      toast.error("Network error — category not saved")
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const res = await adminFetch(`/admin/blog/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true)
    try {
      const res  = await adminFetch("/admin/blog")
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      toast.error("Failed to load posts")
    } finally {
      setLoadingPosts(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [fetchPosts, fetchCategories])

  const handleDelete = async (post: Post) => {
    const confirmed = await dialog({
      title: "Delete Post",
      description: `Delete "${post.title}"? This cannot be undone.`,
      confirmText: "Delete", cancelText: "Cancel",
    })
    if (!confirmed) return
    try {
      await adminFetch(`/admin/blog/${post.id}`, { method: "DELETE" })
      toast.success("Post deleted")
      fetchPosts()
    } catch {
      toast.error("Failed to delete post")
    }
  }

  return (
    <>
      {showCatManager && (
        <CategoryManager
          categories={categories}
          loading={loadingCats}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onClose={() => setShowCatManager(false)}
        />
      )}
      {view === "list" ? (
        <PostListView
          posts={posts} loading={loadingPosts} categories={categories}
          onNew={() => { setEditingPost(null); setView("create") }}
          onEdit={async (post) => {
            try {
              const res  = await adminFetch(`/admin/blog/${post.id}`)
              const data = await res.json()
              setEditingPost(data.post || post)
            } catch {
              setEditingPost(post)
            }
            setView("edit")
          }}
          onDelete={handleDelete}
          onRefresh={fetchPosts}
          onManageCategories={() => setShowCatManager(true)}
        />
      ) : (
        <PostFormView
          post={editingPost} categories={categories}
          onBack={() => { setView("list"); fetchPosts() }}
          onManageCategories={() => setShowCatManager(true)}
        />
      )}
    </>
  )
}

// ─── Post List ────────────────────────────────────────────────────────────────

function PostListView({
  posts, loading, categories, onNew, onEdit, onDelete, onRefresh, onManageCategories,
}: {
  posts: Post[]; loading: boolean; categories: Category[]
  onNew: () => void; onEdit: (p: Post) => void; onDelete: (p: Post) => void
  onRefresh: () => void; onManageCategories: () => void
}) {
  return (
    <div className="flex flex-col p-8 gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <BookOpen className="text-ui-fg-subtle" />
          <div>
            <Heading>Blog Posts</Heading>
            <Text className="text-ui-fg-subtle" size="small">Manage JUNOONI blog content</Text>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button variant="secondary" size="small" type="button" onClick={onManageCategories}>Categories</Button>
          <Button variant="secondary" size="small" type="button" onClick={onRefresh}>Refresh</Button>
          <Button size="small" type="button" onClick={onNew}><Plus className="mr-1" /> New Post</Button>
        </div>
      </div>

      <div className="flex gap-x-3">
        {[
          { label: "Total",     val: posts.length,                               color: "" },
          { label: "Published", val: posts.filter((p) => p.is_published).length, color: "text-ui-fg-interactive" },
          { label: "Drafts",    val: posts.filter((p) => !p.is_published).length, color: "" },
        ].map(({ label, val, color }) => (
          <Container key={label} className="flex-1 px-4 py-3">
            <Text size="small" className="text-ui-fg-subtle">{label}</Text>
            <Heading level="h2" className={color}>{val}</Heading>
          </Container>
        ))}
      </div>

      <Container className="p-0 overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Read time</Table.HeaderCell>
              <Table.HeaderCell>Published</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell style={{ gridColumn: "1 / -1" }}>
                  <Text className="py-8 text-center text-ui-fg-subtle">Loading...</Text>
                </Table.Cell>
              </Table.Row>
            ) : posts.length === 0 ? (
              <Table.Row>
                <Table.Cell style={{ gridColumn: "1 / -1" }}>
                  <div className="flex flex-col items-center py-12 gap-y-2">
                    <BookOpen className="text-ui-fg-muted" style={{ width: 32, height: 32 }} />
                    <Text className="text-ui-fg-subtle">No blog posts yet</Text>
                    <Button size="small" variant="secondary" type="button" onClick={onNew}>
                      Create your first post
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              posts.map((post) => (
                <Table.Row key={post.id} className="cursor-pointer hover:bg-ui-bg-base-hover">
                  <Table.Cell>
                    <Text weight="plus" size="small">{post.title}</Text>
                    <Text size="xsmall" className="font-mono text-ui-fg-subtle">/{post.slug}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {post.category
                      ? <Badge size="2xsmall" color="grey">
                          {categories.find((c) => c.value === post.category)?.label
                            ?? post.category.replace(/-/g, " ")}
                        </Badge>
                      : <Text size="small" className="text-ui-fg-muted">—</Text>}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={post.is_published ? "green" : "grey"}>
                      {post.is_published ? "Published" : "Draft"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle">
                      {post.read_time_minutes ? `${post.read_time_minutes} min` : "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-x-2">
                      {post.is_published && (
                        <a href={`https://junooni.com/blog/${post.slug}`} target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}>
                          <Button variant="transparent" size="small" type="button"><Eye /></Button>
                        </a>
                      )}
                      <Button variant="transparent" size="small" type="button" onClick={() => onEdit(post)}>
                        <PencilSquare />
                      </Button>
                      <Button variant="transparent" size="small" type="button" onClick={() => onDelete(post)}>
                        <Trash className="text-ui-fg-error" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Container>
    </div>
  )
}

// ─── Post Form ────────────────────────────────────────────────────────────────

type FormData = {
  title: string; slug: string; excerpt: string; content: string
  cover_image: string; author_name: string; category: string; tags: string
  seo_title: string; seo_description: string; is_published: boolean
}

function PostFormView({
  post, categories, onBack, onManageCategories,
}: {
  post: Post | null; categories: Category[]; onBack: () => void; onManageCategories: () => void
}) {
  const isEditing = !!post
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    title:           post?.title            || "",
    slug:            post?.slug             || "",
    excerpt:         post?.excerpt          || "",
    content:         post?.content          || "",
    cover_image:     post?.cover_image      || "",
    author_name:     post?.author_name      || "JUNOONI Team",
    category:        post?.category         || "",
    tags:            post?.tags?.join(", ") || "",
    seo_title:       post?.seo_title        || "",
    seo_description: post?.seo_description  || "",
    is_published:    post?.is_published     || false,
  })

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setForm((f) => ({
      ...f, title,
      slug: !f.slug || f.slug === slugify(f.title) ? slugify(title) : f.slug,
      seo_title: f.seo_title || title,
    }))
  }

  const handleSave = async (publishOverride?: boolean) => {
    if (!form.title.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: publishOverride !== undefined ? publishOverride : form.is_published,
      }
      const res = await adminFetch(
        isEditing ? `/admin/blog/${post!.id}` : "/admin/blog",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error("Save failed")
      toast.success(isEditing ? "Post updated!" : "Post created!")
      onBack()
    } catch {
      toast.error("Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col max-w-4xl p-8 gap-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <Button variant="transparent" size="small" type="button" onClick={onBack}><ArrowLeft /></Button>
          <div>
            <Heading>{isEditing ? "Edit Post" : "New Post"}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {isEditing ? `Editing: ${post!.title}` : "Create a new blog post"}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button variant="secondary" size="small" isLoading={saving} type="button" onClick={() => handleSave(false)}>
            Save Draft
          </Button>
          <Button size="small" isLoading={saving} type="button" onClick={() => handleSave(true)}>
            {form.is_published ? "Save & Keep Published" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left */}
        <div className="flex flex-col col-span-2 gap-y-4">
          <Container className="flex flex-col p-6 gap-y-4">
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Title *</Text>
              <Input value={form.title} onChange={handleTitleChange}
                placeholder="e.g. How Tanishk Bagchi launched his merch on JUNOONI" />
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Slug</Text>
              <Input value={form.slug} onChange={set("slug")}
                placeholder="auto-generated-from-title" className="font-mono text-sm" />
              <Text size="xsmall" className="text-ui-fg-subtle">
                junooni.com/blog/{form.slug || "your-slug"}
              </Text>
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Excerpt</Text>
              <Textarea value={form.excerpt} onChange={set("excerpt")}
                placeholder="Short summary shown in blog listing (160 chars recommended)" rows={2} />
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Content</Text>
              <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
            </div>
          </Container>

          <Container className="flex flex-col p-6 gap-y-4">
            <Heading level="h3">SEO</Heading>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">SEO Title</Text>
              <Input value={form.seo_title} onChange={set("seo_title")} placeholder="Defaults to post title" />
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Meta Description</Text>
              <Textarea value={form.seo_description} onChange={set("seo_description")}
                placeholder="Defaults to excerpt (max 160 chars)" rows={2} />
              <Text size="xsmall" className={form.seo_description.length > 160 ? "text-ui-fg-error" : "text-ui-fg-subtle"}>
                {form.seo_description.length}/160 characters
              </Text>
            </div>
          </Container>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-y-4">
          <Container className="flex flex-col p-6 gap-y-4">
            <Heading level="h3">Publish</Heading>
            <div className="flex items-center justify-between">
              <Text size="small">Published</Text>
              <Switch checked={form.is_published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))} />
            </div>
            <StatusBadge color={form.is_published ? "green" : "grey"}>
              {form.is_published ? "Live on website" : "Draft – not visible"}
            </StatusBadge>
          </Container>

          <Container className="flex flex-col p-6 gap-y-4">
            <Heading level="h3">Details</Heading>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Author</Text>
              <Input value={form.author_name} onChange={set("author_name")} placeholder="JUNOONI Team" />
            </div>
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center justify-between">
                <Text size="small" weight="plus">Category</Text>
                <button type="button" onClick={onManageCategories}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, color: "var(--color-fg-interactive, #60a5fa)", padding: 0 }}>
                  + Manage
                </button>
              </div>
              <Select
                key={`cat-select-${categories.length}-${form.category}`}
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <Select.Trigger><Select.Value placeholder="Select category" /></Select.Trigger>
                <Select.Content>
                  {categories.map((c) => (
                    <Select.Item key={c.id} value={c.value}>{c.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">Tags</Text>
              <Input value={form.tags} onChange={set("tags")}
                placeholder="creator, merch, music (comma-separated)" />
            </div>
          </Container>

          <Container className="flex flex-col p-6 gap-y-4">
            <Heading level="h3">Cover Image</Heading>
            <CoverImageUploader value={form.cover_image}
              onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))} />
          </Container>
        </div>
      </div>
    </div>
  )
}

// ─── Route Config ─────────────────────────────────────────────────────────────

export const config = defineRouteConfig({
  label: "Blog",
  icon: BookOpen,
})
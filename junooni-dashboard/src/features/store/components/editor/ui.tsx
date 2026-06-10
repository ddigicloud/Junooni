import { useState, useRef, useEffect } from "react"
import { ChevronRight, X, Plus, Loader2, Upload, Trash2, Link as LinkIcon } from "lucide-react"
import { sanitizeRichText } from "./helpers"

// ─── RichTextEditor ───────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange, placeholder, isDark, rows = 3, singleLine = false, showToolbar }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  isDark: boolean
  rows?: number
  singleLine?: boolean
  showToolbar?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const savedRange = useRef<Range | null>(null)

  useEffect(() => {
    if (!editorRef.current || focused) return
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value, focused])

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    if (!savedRange.current) return
    const sel = window.getSelection()
    if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current) }
  }

  const insertLink = () => {
    restoreSelection()
    if (linkUrl) {
      const normalized = linkUrl.trim().startsWith("http") || linkUrl.trim().startsWith("/")
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`
      execCmd("createLink", normalized)
    }
    setShowLinkDialog(false)
    setLinkUrl("")
  }

  const renderToolbar = showToolbar !== undefined ? showToolbar : !singleLine

  const btns: { cmd?: string; val?: string; icon: React.ReactNode; title: string; action?: () => void }[] = [
    { cmd: "bold",          icon: <span className="font-bold text-[11px]">B</span>,          title: "Bold"        },
    { cmd: "italic",        icon: <span className="italic text-[11px]">I</span>,              title: "Italic"      },
    { cmd: "underline",     icon: <span className="underline text-[11px]">U</span>,           title: "Underline"   },
    { cmd: "strikeThrough", icon: <span className="line-through text-[11px]">S</span>,        title: "Strikethrough" },
    { title: "|" },
    { cmd: "insertUnorderedList", icon: <span className="text-[11px]">≡</span>,              title: "Bullet list" },
    { title: "|" },
    { icon: <LinkIcon className="w-2.5 h-2.5" />, title: "Insert link",
      action: () => { saveSelection(); setShowLinkDialog(true) } },
    { cmd: "unlink", icon: <span className="text-[11px] opacity-60 line-through">🔗</span>,  title: "Remove link" },
  ]

  const toolbarBg = isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
  const editorBg  = isDark ? "bg-gray-800 text-gray-200"   : "bg-white text-gray-800"
  const minH = singleLine
    ? "min-h-[34px]"
    : rows <= 3 ? "min-h-[80px]"
    : rows <= 6 ? "min-h-[130px]"
    : "min-h-[200px]"

  return (
    <div className={`rounded-lg border overflow-hidden focus-within:border-orange-500 transition-colors ${isDark ? "border-gray-700" : "border-gray-300"}`}>
      {renderToolbar && (
        <div className={`flex items-center gap-0.5 px-1.5 py-1 border-b ${toolbarBg} flex-wrap`}>
          {btns.map((b, i) => b.title === "|"
            ? <div key={i} className={`w-px h-3.5 mx-0.5 ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />
            : (
              <button key={i} type="button" title={b.title}
                onMouseDown={e => { e.preventDefault(); b.action ? b.action() : b.cmd && execCmd(b.cmd, b.val) }}
                className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}>
                {b.icon}
              </button>
            )
          )}
        </div>
      )}

      {showLinkDialog && (
        <div className={`flex items-center gap-1.5 px-2 py-1.5 border-b ${toolbarBg}`}>
          <LinkIcon className={`w-3 h-3 shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") insertLink()
              if (e.key === "Escape") setShowLinkDialog(false)
            }}
            placeholder="https://..."
            className={`flex-1 text-xs px-1.5 py-1 rounded border focus:outline-none ${
              isDark
                ? "bg-gray-800 border-gray-600 text-gray-200"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          />
          <button type="button" onClick={insertLink}
            className="text-[10px] px-2 py-1 rounded bg-orange-500 text-white font-medium">
            Add
          </button>
          <button type="button" onClick={() => setShowLinkDialog(false)}
            className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          const raw = editorRef.current?.innerHTML ?? ""
          const sanitized = sanitizeRichText(raw)
          onChange(sanitized)
        }}
        onInput={() => {
          const raw = editorRef.current?.innerHTML ?? ""
          const sanitized = sanitizeRichText(raw)
          onChange(sanitized)
        }}
        onKeyDown={e => {
          if (singleLine && e.key === "Enter") {
            e.preventDefault()
            return
          }
          if (!singleLine && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            document.execCommand("insertLineBreak")
            onChange(editorRef.current?.innerHTML ?? "")
          }
        }}
        onMouseOver={e => {
          const target = e.target as HTMLElement
          if (target.tagName === "A") {
            target.title = (target as HTMLAnchorElement).href
          }
        }}
        onMouseOut={e => {
          const target = e.target as HTMLElement
          if (target.tagName === "A") target.title = ""
}}
        onPaste={e => {
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        data-placeholder={placeholder}
        className={`${minH} px-2.5 py-1.5 text-sm focus:outline-none ${editorBg} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none [&_a]:text-blue-400 [&_a]:underline [&_a]:cursor-pointer`}
        style={{ lineHeight: 1.6 }}
      />
    </div>
  )
}

// ─── StyleSection ─────────────────────────────────────────────────────────────

export function StyleSection({ title, isDark, children }: {
  title: string
  isDark: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
          isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
        }`}
      >
        <span className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{title}</span>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"} transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({ label, faint, children }: {
  label: string
  faint: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>
      {children}
    </div>
  )
}

// ─── EditorInput ─────────────────────────────────────────────────────────────

export function EditorInput({ value, onChange, placeholder, isDark }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  isDark: boolean
}) {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDark={isDark}
      singleLine
      rows={1}
    />
  )
}

// ─── EditorTextarea ───────────────────────────────────────────────────────────

export function EditorTextarea({ value, onChange, placeholder, rows = 3, isDark, mono }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  isDark: boolean
  mono?: boolean
}) {
  if (mono) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none font-mono text-xs ${
          isDark
            ? "bg-gray-800 border border-gray-700 text-gray-200"
            : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
        }`}
      />
    )
  }
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDark={isDark}
      rows={rows}
    />
  )
}

// ─── UploadOnlyImageField ─────────────────────────────────────────────────────

export function UploadOnlyImageField({ label, value, onChange, onUpload, isUploading, isDark, previewHeight = 100 }: {
  label: string
  value: string
  onChange: (v: string) => void
  onUpload: () => void
  isUploading: boolean
  isDark: boolean
  previewHeight?: number
}) {
  const faint = isDark ? "text-gray-500" : "text-gray-400"
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>
      {value ? (
        <div className="relative overflow-hidden border border-gray-700 rounded-xl" style={{ height: previewHeight }}>
          <img src={value} alt="preview" className="object-cover w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/40 hover:opacity-100">
            <button
              onClick={onUpload}
              disabled={isUploading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30 hover:bg-white/30 transition-colors"
            >
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Replace
            </button>
            <button
              onClick={() => onChange("")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/70 backdrop-blur-sm text-white text-xs font-medium hover:bg-red-500/90 transition-colors"
            >
              <Trash2 className="w-3 h-3" />Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onUpload}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors ${
            isDark
              ? "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          {isUploading
            ? <Loader2 className={`w-5 h-5 animate-spin ${faint}`} />
            : <Upload className={`w-5 h-5 ${faint}`} />
          }
          <span className={`text-xs ${faint}`}>
            {isUploading ? "Uploading..." : "Click to upload image"}
          </span>
        </button>
      )}
    </div>
  )
}
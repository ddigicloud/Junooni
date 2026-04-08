"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Image as ImageIcon,
  Heading1, Heading2, Heading3, Quote,
  Code, Minus, Type, Eye, EyeOff, Undo, Redo,
} from "lucide-react"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

type FormatMode = "wysiwyg" | "markdown" | "html"

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"]
const TEXT_COLORS = [
  "#ffffff", "#000000", "#e65100", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#6b7280", "#374151",
]

export default function RichContentEditor({ value, onChange, placeholder }: Props) {
  const [mode, setMode] = useState<FormatMode>("wysiwyg")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)

  // Sync HTML → contenteditable on mount / external change
  useEffect(() => {
    if (mode !== "wysiwyg" || !editorRef.current) return
    if (isUpdatingRef.current) return
    // Only update if content differs (avoid cursor jump)
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value, mode])

  const emitChange = useCallback(() => {
    if (!editorRef.current) return
    isUpdatingRef.current = true
    onChange(editorRef.current.innerHTML)
    setTimeout(() => { isUpdatingRef.current = false }, 0)
  }, [onChange])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    emitChange()
  }

  const insertBlock = (tag: string) => {
    document.execCommand("formatBlock", false, tag)
    editorRef.current?.focus()
    emitChange()
  }

  const insertHTML = (html: string) => {
    document.execCommand("insertHTML", false, html)
    editorRef.current?.focus()
    emitChange()
  }

  const handleLink = () => {
    const sel = window.getSelection()
    setLinkText(sel?.toString() ?? "")
    setShowLinkDialog(true)
  }

  const confirmLink = () => {
    if (linkUrl) {
      if (linkText) {
        insertHTML(`<a href="${linkUrl}" target="_blank" style="color:#e65100;text-decoration:underline">${linkText}</a>`)
      } else {
        exec("createLink", linkUrl)
      }
    }
    setShowLinkDialog(false)
    setLinkUrl(""); setLinkText("")
  }

  const ToolBtn = ({ onClick, title, children, active }: {
    onClick: () => void; title: string; children: React.ReactNode; active?: boolean
  }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all text-gray-300 hover:text-white hover:bg-gray-600 ${active ? "bg-gray-600 text-white" : ""}`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-gray-700 mx-0.5 shrink-0" />

  return (
    <div className="flex flex-col border border-gray-700 rounded-xl overflow-hidden bg-gray-900">

      {/* ── Mode switcher ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-1">
          {(["wysiwyg", "markdown", "html"] as FormatMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all ${
                mode === m
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "wysiwyg" ? "Visual" : m === "markdown" ? "Markdown" : "HTML"}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-gray-600">
          {mode === "wysiwyg" ? "WYSIWYG editor" : mode === "markdown" ? "Markdown text" : "Raw HTML/CSS/JS"}
        </span>
      </div>

      {/* ── Toolbar (wysiwyg only) ── */}
      {mode === "wysiwyg" && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-850 border-b border-gray-700 bg-gray-800">

          {/* Headings */}
          <ToolBtn onClick={() => insertBlock("h1")} title="Heading 1">
            <span className="text-[10px] font-bold">H1</span>
          </ToolBtn>
          <ToolBtn onClick={() => insertBlock("h2")} title="Heading 2">
            <span className="text-[10px] font-bold">H2</span>
          </ToolBtn>
          <ToolBtn onClick={() => insertBlock("h3")} title="Heading 3">
            <span className="text-[10px] font-bold">H3</span>
          </ToolBtn>
          <ToolBtn onClick={() => insertBlock("p")} title="Paragraph">
            <Type className="w-3.5 h-3.5" />
          </ToolBtn>

          <Divider />

          {/* Inline styles */}
          <ToolBtn onClick={() => exec("bold")} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("italic")} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("underline")} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

          <Divider />

          {/* Alignment */}
          <ToolBtn onClick={() => exec("justifyLeft")} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("justifyCenter")} title="Align center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("justifyRight")} title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>

          <Divider />

          {/* Blockquote & Code */}
          <ToolBtn onClick={() => insertBlock("blockquote")} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => insertHTML('<code style="background:#1e293b;color:#f97316;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em">code</code>')} title="Inline code">
            <Code className="w-3.5 h-3.5" />
          </ToolBtn>

          <Divider />

          {/* Divider / HR */}
          <ToolBtn onClick={() => insertHTML('<hr style="border:none;border-top:1px solid #374151;margin:16px 0"/>')} title="Horizontal rule">
            <Minus className="w-3.5 h-3.5" />
          </ToolBtn>

          {/* Link */}
          <ToolBtn onClick={handleLink} title="Insert link"><Link className="w-3.5 h-3.5" /></ToolBtn>

          <Divider />

          {/* Text color */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setShowColorPicker(v => !v) }}
              title="Text color"
              className="flex flex-col items-center justify-center w-7 h-7 rounded-md hover:bg-gray-600 transition-colors"
            >
              <span className="text-[11px] font-bold text-gray-300">A</span>
              <div className="w-4 h-1 rounded-full mt-0.5" style={{ background: "#e65100" }} />
            </button>
            {showColorPicker && (
              <div className="absolute top-9 left-0 z-50 p-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl grid grid-cols-6 gap-1 w-40">
                {TEXT_COLORS.map(c => (
                  <button key={c} type="button"
                    onMouseDown={e => { e.preventDefault(); exec("foreColor", c); setShowColorPicker(false) }}
                    className="w-5 h-5 rounded-md border border-gray-700 hover:scale-110 transition-transform"
                    style={{ background: c }} title={c}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Font size */}
          <select
            onMouseDown={e => e.stopPropagation()}
            onChange={e => { exec("fontSize", "7"); /* workaround */ insertHTML(`<span style="font-size:${e.target.value}px">\u200b</span>`) }}
            className="h-7 px-1 bg-gray-800 border border-gray-700 rounded-md text-[10px] text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Size</option>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          <Divider />

          {/* Undo / Redo */}
          <ToolBtn onClick={() => exec("undo")} title="Undo"><Undo className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={() => exec("redo")} title="Redo"><Redo className="w-3.5 h-3.5" /></ToolBtn>
        </div>
      )}

      {/* ── Editing area ── */}
      {mode === "wysiwyg" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder ?? "Start writing your page content..."}
          className="min-h-[220px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm text-gray-200 focus:outline-none wysiwyg-editor"
          style={{ lineHeight: 1.7 }}
        />
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={
            mode === "markdown"
              ? "## Heading\n\n**Bold text** and _italic_\n\n- List item\n- Another item\n\n[Link text](https://...)"
              : "<div>\n  <h2>Custom Section</h2>\n  <p>Add any HTML/CSS/JS here</p>\n</div>"
          }
          rows={12}
          className="px-4 py-3 text-sm text-gray-200 placeholder-gray-600 bg-transparent border-0 resize-none focus:outline-none font-mono leading-relaxed"
        />
      )}

      {/* ── Link dialog ── */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-80 shadow-2xl">
            <p className="text-sm font-semibold text-white mb-4">Insert link</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Link text</label>
                <input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Click here"
                  className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">URL</label>
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..."
                  className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  onKeyDown={e => e.key === "Enter" && confirmLink()} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={confirmLink}
                className="flex-1 py-2 text-sm font-semibold text-white rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors">
                Insert
              </button>
              <button onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WYSIWYG styles ── */}
      <style>{`
        .wysiwyg-editor:empty:before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
        }
        .wysiwyg-editor h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #f9fafb; line-height: 1.2; }
        .wysiwyg-editor h2 { font-size: 1.375rem; font-weight: 700; margin: 0.875rem 0 0.4rem; color: #f3f4f6; line-height: 1.3; }
        .wysiwyg-editor h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.3rem; color: #e5e7eb; line-height: 1.4; }
        .wysiwyg-editor p  { margin: 0.5rem 0; color: #d1d5db; }
        .wysiwyg-editor strong { font-weight: 700; }
        .wysiwyg-editor em { font-style: italic; }
        .wysiwyg-editor u  { text-decoration: underline; }
        .wysiwyg-editor s  { text-decoration: line-through; }
        .wysiwyg-editor a  { color: #e65100; text-decoration: underline; }
        .wysiwyg-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; color: #d1d5db; }
        .wysiwyg-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; color: #d1d5db; }
        .wysiwyg-editor li { margin: 0.2rem 0; }
        .wysiwyg-editor blockquote { border-left: 3px solid #e65100; padding-left: 1rem; margin: 0.75rem 0; color: #9ca3af; font-style: italic; }
        .wysiwyg-editor hr { border: none; border-top: 1px solid #374151; margin: 1rem 0; }
        .wysiwyg-editor code { background: #1e293b; color: #f97316; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
        .wysiwyg-editor pre { background: #1e293b; color: #f97316; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; font-family: monospace; font-size: 0.85em; }
      `}</style>
    </div>
  )
}
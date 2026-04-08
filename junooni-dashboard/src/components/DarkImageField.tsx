"use client"

// ─── DarkImageField ───────────────────────────────────────────────────────────
// Drop-in replacement for any "Image URL" field in the editor.
// Supports both URL input AND file upload.
// Usage:
//   <DarkImageField
//     label="Background image"
//     value={section.background_image ?? ""}
//     onChange={v => onChange({ background_image: v || undefined })}
//     token={token}
//     backendUrl={backendUrl}
//   />

import { useState, useRef } from "react"
import { Upload, Trash2, Loader2, Link as LinkIcon } from "lucide-react"

interface DarkImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  token: string
  backendUrl: string
  previewHeight?: number // px, default 80
}

export function DarkImageField({
  label, value, onChange, token, backendUrl, previewHeight = 80,
}: DarkImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [tab, setTab] = useState<"url" | "upload">("url")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("files", file)
      const res = await fetch(`${backendUrl}/vendors/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      const url = data.files?.[0]?.url
      if (url) { onChange(url); setTab("url") }
    } catch (e) {
      console.error("Image upload failed:", e)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        {/* Tab toggle */}
        <div className="flex items-center gap-0.5 p-0.5 bg-gray-800 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${tab === "url" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <LinkIcon className="w-2.5 h-2.5" />URL
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${tab === "upload" ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <Upload className="w-2.5 h-2.5" />Upload
          </button>
        </div>
      </div>

      {tab === "url" ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm text-gray-200 placeholder-gray-600 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
        />
      ) : (
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 w-full py-5 rounded-lg border-2 border-dashed cursor-pointer transition-all ${isUploading ? "border-orange-500/50 bg-orange-500/5" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"}`}
          >
            {isUploading ? (
              <><Loader2 className="w-5 h-5 text-orange-400 animate-spin" /><p className="text-xs text-gray-400">Uploading...</p></>
            ) : (
              <><Upload className="w-5 h-5 text-gray-500" /><p className="text-xs text-gray-400">Click to upload image</p><p className="text-[10px] text-gray-600">PNG, JPG, WebP, SVG</p></>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div
          className="relative mt-2 overflow-hidden border border-gray-700 rounded-lg group"
          style={{ height: previewHeight }}
        >
          <img src={value} alt="preview" className="object-cover w-full h-full" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute flex items-center gap-1 px-2 py-1 text-white transition-all -translate-x-1/2 rounded-lg opacity-0 top-2 left-1/2 bg-black/70 group-hover:opacity-100 text-[10px] whitespace-nowrap"
          >
            <Trash2 className="w-3 h-3 text-red-400" />Remove
          </button>
        </div>
      )}
    </div>
  )
}
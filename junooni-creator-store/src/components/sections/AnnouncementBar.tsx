"use client"
import type { AnnouncementSection } from "@/lib/types"

export default function AnnouncementBar({ section }: { section: AnnouncementSection }) {
  // Support both `text` (type field) and `title` (saved by studio sections)
  const message = (section as any).text || (section as any).title
  if (!message) return null
  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm font-medium"
      style={{
        background: (section as any).background_color ?? "var(--brand-primary)",
        color: (section as any).text_color ?? "#ffffff",
      }}
    >
      {message}
    </div>
  )
}
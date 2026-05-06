"use client"

import { useEffect, useRef } from "react"

export default function StorePreviewBridge() {
  const lastUrlRef = useRef<string>("")
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    lastUrlRef.current = window.location.href
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")

    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_SAVED") {
        // Hard reload on save to get fresh server data
        window.location.reload()
        return
      }

      if (e.data?.type !== "STORE_UPDATE") return
      const store = e.data.store
      if (!store) return

      // ── 1. CSS variables (instant) ──
      const root = document.documentElement
      if (store.primary_color)
        root.style.setProperty("--brand-primary", store.primary_color)
      if (store.secondary_color)
        root.style.setProperty("--brand-secondary", store.secondary_color)

      // ── 2. Collect all sections ──
      const homeSections: any[] = store.sections?.sections ?? []
      const pageLayouts = store.sections?.page_layouts ?? {}
      const allSections: any[] = [
        ...homeSections,
        ...Object.values(pageLayouts).flatMap((l: any) => l.sections ?? []),
      ]

      // ── 3. Patch colors via data-section-id ──
      for (const section of allSections) {
        if (!section.id) continue
        const el = document.querySelector(
          `[data-section-id="${section.id}"]`
        ) as HTMLElement | null
        if (!el) continue

        // Background — works fine on wrapper
        el.style.backgroundColor = section.background_color ?? ""

        // Text color — must patch ALL text elements inside
        // because Tailwind inline color classes block inheritance
        if (section.text_color) {
          el.style.setProperty("--section-text", section.text_color)
          // Directly patch known text elements inside this section
          el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,label,button")
            .forEach(child => {
              const c = child as HTMLElement
              // Don't override elements that have their own explicit color
              // (like brand-colored elements — check if they use inline style already)
              if (!c.style.color || c.style.color === "") {
                c.style.color = section.text_color!
              }
            })
        } else {
          // Clear overrides
          el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,a,li,label,button")
            .forEach(child => {
              const c = child as HTMLElement
              c.style.color = ""
            })
        }

        // Visibility
        el.style.display = section.hidden ? "none" : ""
      }

      // ── 4. Selected section highlight ──
      const selectedId = e.data.selectedId
      document.querySelectorAll("[data-section-id]").forEach(el => {
        const htmlEl = el as HTMLElement
        const isSelected = selectedId && htmlEl.dataset.sectionId === selectedId
        htmlEl.style.outline = isSelected ? "2px solid #e65100" : ""
        htmlEl.style.outlineOffset = isSelected ? "-2px" : ""
      })

      // ── 5. Structural changes → reload iframe ──
      // Debounced so rapid toggles don't cause rapid reloads
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
      reloadTimerRef.current = setTimeout(() => {
        window.location.reload()
      }, 1200)
    }

    window.addEventListener("message", handler)
    return () => {
      window.removeEventListener("message", handler)
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
    }
  }, [])

  return null
}
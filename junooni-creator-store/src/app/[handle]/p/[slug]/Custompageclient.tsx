"use client"

import { useEffect, useRef, useState } from "react"

function isHTML(content: string): boolean {
  return /^<[!a-zA-Z]/.test(content.trim())
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (b) => `<ul>${b}</ul>`)
    .replace(/^(?!<)(.+)$/gm, (l) => l.trim() ? `<p>${l}</p>` : "")
}

function extractEmbeddable(html: string): { styles: string; body: string; scripts: string } {
  const isFullDoc = /<!DOCTYPE|<html/i.test(html)
  if (!isFullDoc) return { styles: "", body: html, scripts: "" }

  // Extract styles
  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  let styles = styleMatches.map(m => m[1]).join("\n")

  // Strip ONLY the viewport-breaking properties from html/body/* selectors
  styles = styles.replace(
    /(html|body|\*)\s*\{([^}]*)\}/gi,
    (_, selector, inner) => {
      const cleaned = inner
        .replace(/\bmin-height\s*:\s*100vh\s*;?/gi, "")
        .replace(/\bheight\s*:\s*100vh\s*;?/gi, "")
        .replace(/\bheight\s*:\s*100%\s*;?/gi, "")
        .replace(/\boverflow\s*:[^;]+;?/gi, "")
        .replace(/\boverflow-y\s*:[^;]+;?/gi, "")
        .replace(/\bposition\s*:\s*fixed\s*;?/gi, "")
      return `${selector} { ${cleaned} }`
    }
  )

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const body = bodyMatch ? bodyMatch[1] : html

  // Extract inline scripts only (no src="...")
  const scriptMatches = [...html.matchAll(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi)]
  const scripts = scriptMatches.map(m => m[1]).join("\n")

  return { styles, body, scripts }
}

function InjectedHTML({ html, brandPrimary }: { html: string; brandPrimary: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const scopeRef = useRef<string>(`cpc-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scopeId = scopeRef.current
    container.setAttribute("data-scope", scopeId)

    const { styles, body, scripts } = extractEmbeddable(html)

    // Scope all CSS rules to [data-scope="..."] 
    const scopeAttr = `[data-scope="${scopeId}"]`
    const scopedCss = styles
      .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
      .replace(
        /([^{}]+)\{([^{}]*)\}/g,
        (_, selectors, declarations) => {
          const scoped = selectors
            .split(",")
            .map((s: string) => {
              const t = s.trim()
              if (!t || t.startsWith("@")) return t
              if (/^(html|body|\*)$/.test(t)) return scopeAttr
              return `${scopeAttr} ${t}`
            })
            .join(", ")
          return `${scoped} { ${declarations} }`
        }
      )

    // Remove old style tag if any
    styleRef.current?.remove()

    const styleEl = document.createElement("style")
    styleEl.setAttribute("data-cpc-scope", scopeId)
    styleEl.textContent = `
      ${scopeAttr} {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
      }
      ${scopeAttr} img { max-width: 100%; height: auto; }
      ${scopeAttr} a { color: ${brandPrimary}; }
      ${scopedCss}
    `
    document.head.appendChild(styleEl)
    styleRef.current = styleEl

    // Inject body HTML
    container.innerHTML = body

    // Run inline scripts
    if (scripts.trim()) {
      try {
        // eslint-disable-next-line no-new-func
        new Function(scripts)()
      } catch (e) {
        console.warn("Custom page script error:", e)
      }
    }

    return () => {
      styleRef.current?.remove()
    }
  }, [html, brandPrimary])

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}
    />
  )
}

// REPLACE WITH:
interface Props {
  page: { title: string; content: string; slug: string }
  brandPrimary: string
  isDark: boolean
}

export default function CustomPageClient({ page, brandPrimary, isDark }: Props) {
  const [livePage, setLivePage] = useState(page)

  useEffect(() => {
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        const pages = e.data.store?.pages?.pages ?? []
        const updated = pages.find((p: any) => p.slug === page.slug)
        if (updated) setLivePage(updated)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [page.slug])

  const content = livePage.content ?? ""
  const htmlMode = isHTML(content)

  // HTML mode: zero wrapper constraints, full width, let the HTML own its layout
  if (htmlMode) {
    return (
      <div style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <InjectedHTML html={content} brandPrimary={brandPrimary} />
      </div>
    )
  }

  // Markdown mode: normal constrained layout
  return (
    <div className={`flex-1 w-full px-4 py-16 sm:px-6 ${isDark ? "text-white" : "text-gray-900"}`}>
      <div className="w-full max-w-4xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
          {page.title}
        </h1>
        <div
          className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""}`}
          style={{ "--tw-prose-links": brandPrimary } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
    </div>
  )
}
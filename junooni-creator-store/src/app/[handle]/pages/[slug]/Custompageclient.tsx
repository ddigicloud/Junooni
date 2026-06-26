"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

// ── Helpers ───────────────────────────────────────────────────────────────────

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

  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  let styles = styleMatches.map(m => m[1]).join("\n")

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

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const body = bodyMatch ? bodyMatch[1] : html

  const scriptMatches = [...html.matchAll(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi)]
  const scripts = scriptMatches.map(m => m[1]).join("\n")

  return { styles, body, scripts }
}

function InjectedHTML({ html, brandPrimary }: { html: string; brandPrimary: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const styleRef     = useRef<HTMLStyleElement | null>(null)
  const scopeRef     = useRef<string>(`cpc-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scopeId   = scopeRef.current
    container.setAttribute("data-scope", scopeId)

    const { styles, body, scripts } = extractEmbeddable(html)

    const scopeAttr = `[data-scope="${scopeId}"]`
    const scopedCss = styles
      .replace(/\/\*[\s\S]*?\*\//g, "")
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

    container.innerHTML = body

    if (scripts.trim()) {
      try {
        // eslint-disable-next-line no-new-func
        new Function(scripts)()
      } catch (e) {
        console.warn("Custom page script error:", e)
      }
    }

    return () => { styleRef.current?.remove() }
  }, [html, brandPrimary])

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}
    />
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  page: { title: string; content: string; slug: string }
  brandPrimary: string
  isDark: boolean
  vendor: any
  initialStore: any
  categories?: any[]
  collections?: any[]
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CustomPageClient({
  page, brandPrimary, isDark,
  vendor, initialStore, categories = [], collections = [],
}: Props) {
  const [livePage, setLivePage]             = useState(page)
  const [store, setStore]                   = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isEditorMode, setIsEditorMode]     = useState(false)

  useEffect(() => {
    setIsEditorMode(window.parent !== window)
  }, [])

  useEffect(() => {
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setStore(e.data.store)
        const pages = e.data.store?.pages?.pages ?? []
        const updated = pages.find((p: any) => p.slug === page.slug)
        if (updated) setLivePage(updated)
      }
      if (e.data?.type === "STORE_UPDATE") {
        setSelectedSectionId(e.data.selectedId ?? null)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [page.slug])

  // ── Store-derived values ───────────────────────────────────────────────────
  const resolvedBrandPrimary   = store?.primary_color   ?? brandPrimary
  const resolvedBrandSecondary = store?.secondary_color ?? "#ac1900"
  const resolvedIsDark         = store?.template === "bold"

  const fontClass =
    store?.font === "poppins"       ? "font-poppins" :
    store?.font === "playfair"      ? "font-playfair" :
    store?.font === "dm-sans"       ? "font-dm-sans" :
    store?.font === "space-grotesk" ? "font-space-grotesk" :
    store?.font === "nunito"        ? "font-nunito" :
    store?.font === "raleway"       ? "font-raleway" :
    store?.font === "montserrat"    ? "font-montserrat" :
    "font-inter"

  const bgColor = resolvedIsDark ? "bg-black text-white" : "bg-white text-gray-900"

  const content  = livePage.content ?? ""
  const htmlMode = isHTML(content)

  // ── Editor-added sections keyed by page slug ───────────────────────────────
  const pageSections: any[] =
    store?.sections?.page_layouts?.[`page_${livePage.slug}`]?.sections ??
    store?.sections?.page_layouts?.pages?.sections ??
    []

  // ── Section renderer ───────────────────────────────────────────────────────
  const renderPageSection = (section: any) => {
    const sectionBg   = section.background_color ?? undefined
    const sectionText = section.text_color       ?? undefined
    const isSelected  = selectedSectionId === section.id

    return (
      <div
        key={section.id}
        data-section-id={section.id}
        onClick={() => {
          if (isEditorMode && section.id)
            window.parent?.postMessage({ type: "SECTION_CLICK", sectionId: section.id }, "*")
        }}
        onDoubleClick={() => {
          if (isEditorMode && section.id)
            window.parent?.postMessage({ type: "SECTION_DBLCLICK", sectionId: section.id }, "*")
        }}
        className={`relative transition-all ${isEditorMode ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: sectionBg,
          ...(isSelected ? { outline: "2px solid #e65100", outlineOffset: "-2px" } : {}),
        }}
      >
        {isSelected && (
          <div
            className="absolute top-0 left-0 z-50 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none"
            style={{ background: "#e65100", borderBottomRightRadius: "6px" }}
          >
            Editing
          </div>
        )}

        {/* Featured / upsell */}
        {section.type === "featured" && (
          <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div className="mx-auto max-w-7xl">
              {section.title && (
                <h2
                  className="mb-6 text-2xl font-bold"
                  style={{ color: sectionText ?? (resolvedIsDark ? "#fff" : "#111827") }}
                >
                  {section.title}
                </h2>
              )}
              <div className={`grid gap-6 ${
                section.columns === 2 ? "grid-cols-2" :
                section.columns === 4 ? "grid-cols-2 md:grid-cols-4" :
                "grid-cols-2 md:grid-cols-3"
              }`}>
                {(section.items ?? []).map((p: any) => (
                  <Link key={p.id} href={`/products/${p.handle}`} className="group">
                    <div className={`aspect-square relative rounded-xl overflow-hidden mb-3 ${
                      resolvedIsDark ? "bg-white/5" : "bg-gray-50"
                    }`}>
                      {p.thumbnail && (
                        <Image
                          src={p.thumbnail} alt={p.title} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className={`text-sm font-medium truncate ${resolvedIsDark ? "text-white" : "text-gray-900"}`}>
                      {p.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image with Text */}
        {section.type === "image_text" && (
          <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div className="max-w-6xl mx-auto">
              <div className={`flex gap-10 items-center ${
                (section.mobile_image_position ?? "top") === "top" ? "flex-col" : "flex-col-reverse"
              } ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="w-full md:w-1/2 shrink-0">
                  {section.image ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
                      <Image src={section.image} alt={section.title ?? "Image"} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-2xl bg-gray-100 aspect-[4/3]">
                      <span className="text-5xl opacity-20">🖼️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {section.title && (
                    <h2
                      className="mb-4 text-3xl font-bold leading-tight"
                      style={{ color: sectionText ?? (resolvedIsDark ? "#fff" : "#111827") }}
                      dangerouslySetInnerHTML={{ __html: section.title }}
                    />
                  )}
                  {section.text && (
                    <div
                      className="mb-6 text-base leading-relaxed prose prose-sm max-w-none"
                      style={{ color: sectionText ? `${sectionText}cc` : (resolvedIsDark ? "#d1d5db" : "#4b5563") }}
                      dangerouslySetInnerHTML={{ __html: section.text }}
                    />
                  )}
                  {section.cta_label && (
                    <Link
                      href={section.cta_url ?? "#"}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full hover:opacity-90 transition-all"
                      style={{ background: `linear-gradient(135deg, ${resolvedBrandPrimary} 0%, ${resolvedBrandSecondary} 100%)` }}
                    >
                      {section.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video with Text */}
        {section.type === "video_text" && (() => {
          const videoUrl = section.video_text_url ?? ""
          const getEmbed = (url: string) => {
            const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
            if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
            const vm = url.match(/vimeo\.com\/(\d+)/)
            if (vm) return `https://player.vimeo.com/video/${vm[1]}`
            return null
          }
          const embedUrl = videoUrl ? getEmbed(videoUrl) : null
          return (
            <div className="px-4 py-16 sm:px-6" style={{ backgroundColor: sectionBg }}>
              <div className="max-w-6xl mx-auto">
                <div className={`flex gap-10 items-center ${
                  (section.mobile_image_position ?? "top") === "top" ? "flex-col" : "flex-col-reverse"
                } ${(section.image_position ?? "left") === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="w-full md:w-1/2 shrink-0">
                    {embedUrl ? (
                      <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          src={embedUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 0 }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-gray-100 rounded-2xl aspect-video">
                        <span className="text-5xl opacity-20">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {section.title && (
                      <h2
                        className="mb-4 text-3xl font-bold leading-tight"
                        style={{ color: sectionText ?? (resolvedIsDark ? "#fff" : "#111827") }}
                        dangerouslySetInnerHTML={{ __html: section.title }}
                      />
                    )}
                    {section.text && (
                      <div
                        className="mb-6 text-base leading-relaxed prose prose-sm max-w-none"
                        style={{ color: sectionText ? `${sectionText}cc` : (resolvedIsDark ? "#d1d5db" : "#4b5563") }}
                        dangerouslySetInnerHTML={{ __html: section.text }}
                      />
                    )}
                    {section.cta_label && (
                      <Link
                        href={section.cta_url ?? "#"}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full hover:opacity-90 transition-all"
                        style={{ background: `linear-gradient(135deg, ${resolvedBrandPrimary} 0%, ${resolvedBrandSecondary} 100%)` }}
                      >
                        {section.cta_label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Text */}
        {section.type === "text" && section.text && (
          <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg }}>
            <div
              className="max-w-3xl mx-auto prose prose-lg"
              style={{ color: sectionText ?? (resolvedIsDark ? "#d1d5db" : "#374151") }}
              dangerouslySetInnerHTML={{ __html: section.text }}
            />
          </div>
        )}

        {/* Image */}
        {section.type === "image" && section.image && (() => {
          const heightMode     = (section as any).image_height_mode ?? "auto"
          const widthMode      = (section as any).image_width_mode  ?? "full"
          const fit            = (section as any).image_fit         ?? "cover"
          const overlayPct     = (section as any).overlay_opacity   ?? 0
          const radius         = (section as any).border_radius     ?? 0
          const titlePlacement = (section as any).title_placement   ?? "over"
          const titlePos       = (section as any).title_position    ?? "center"

          const justifyMap: Record<string, string> = {
            left: "justify-start", center: "justify-center", right: "justify-end",
          }

          const imgStyle: React.CSSProperties = {
            objectFit: fit as any,
            borderRadius: radius,
            ...(heightMode === "fixed"  ? { height: `${(section as any).image_height_px ?? 400}px` } : {}),
            ...(heightMode === "screen" ? { height: `${(section as any).image_height_vh ?? 70}vh`  } : {}),
            ...(heightMode === "auto"   ? { height: "auto", maxHeight: "600px" } : {}),
            width: "100%", display: "block",
          }

          const wrapStyle: React.CSSProperties = {
            backgroundColor: sectionBg,
            paddingTop:    `${(section as any).padding_top    ?? 0}px`,
            paddingBottom: `${(section as any).padding_bottom ?? 0}px`,
          }

          const innerStyle: React.CSSProperties = {
            ...(widthMode === "contained" ? { maxWidth: "1280px", margin: "0 auto", padding: "0 24px" } : {}),
            ...(widthMode === "custom"    ? { maxWidth: `${(section as any).image_width_pct ?? 80}%`, margin: "0 auto" } : {}),
          }

          const titleEl = section.title ? (
            <div className={`flex w-full ${justifyMap[titlePos]}`}>
              <h2
                className="px-2 py-1 text-2xl font-bold"
                style={{ color: (section as any).title_color ?? (resolvedIsDark ? "#ffffff" : "#111827") }}
              >
                {section.title}
              </h2>
            </div>
          ) : null

          const imgContent = (
            <div style={{ position: "relative", borderRadius: radius, overflow: "hidden" }}>
              <img
                src={section.image}
                alt={(section as any).image_alt ?? section.title ?? ""}
                style={imgStyle}
              />
              {overlayPct > 0 && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: (section as any).overlay_color ?? "#000000",
                  opacity: overlayPct / 100,
                }} />
              )}
              {section.title && titlePlacement === "over" && (
                <div className={`absolute inset-0 flex items-center px-6 ${justifyMap[titlePos]}`}>
                  <h2
                    className="text-2xl font-bold drop-shadow-lg"
                    style={{ color: (section as any).title_color ?? "#ffffff" }}
                  >
                    {section.title}
                  </h2>
                </div>
              )}
            </div>
          )

          return (
            <div style={wrapStyle}>
              <div style={innerStyle}>
                {titlePlacement === "above" && titleEl}
                {(section as any).image_link
                  ? <a href={(section as any).image_link}>{imgContent}</a>
                  : imgContent
                }
                {titlePlacement === "below" && titleEl}
              </div>
            </div>
          )
        })()}

        {/* Video */}
        {section.type === "video" && (() => {
          const raw = section.video_url ?? ""
          const yt  = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
          const vm  = raw.match(/vimeo\.com\/(\d+)/)
          const embedUrl = yt
            ? `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
            : vm ? `https://player.vimeo.com/video/${vm[1]}` : null
          if (!embedUrl) return null
          return (
            <div className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg }}>
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2
                    className="mb-6 text-2xl font-bold text-center"
                    style={{ color: sectionText ?? (resolvedIsDark ? "#fff" : "#111827") }}
                  >
                    {section.title}
                  </h2>
                )}
                <div
                  className="relative w-full overflow-hidden shadow-xl rounded-2xl"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                  />
                </div>
              </div>
            </div>
          )
        })()}

        {/* Ticker */}
        {section.type === "ticker" && (() => {
          const items: string[] = section.ticker_items ?? ["Official creator merchandise"]
          const sep      = section.ticker_separator ?? "✦"
          const speed    = section.ticker_speed ?? 40
          const bg       = sectionBg ?? "#111827"
          const fg       = sectionText ?? "#ffffff"
          const line     = items.join(`  ${sep}  `)
          const duration = Math.max(5, 100 - speed)
          return (
            <div className="overflow-hidden py-2.5" style={{ backgroundColor: bg }}>
              <style>{`
                @keyframes page-ticker {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .page-ticker-inner {
                  display: inline-flex;
                  white-space: nowrap;
                  animation: page-ticker ${duration}s linear infinite;
                }
              `}</style>
              <div className="text-sm font-medium tracking-wide page-ticker-inner" style={{ color: fg }}>
                {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => (
                  <span key={i} className="mr-8">{t}</span>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Divider */}
        {section.type === "divider" && (
          <div style={{
            paddingTop:    `${(section as any).padding_top    ?? 16}px`,
            paddingBottom: `${(section as any).padding_bottom ?? 16}px`,
          }}>
            <hr style={{
              borderColor:    (section as any).divider_color      ?? "#e5e7eb",
              borderTopWidth: `${(section as any).divider_thickness ?? 1}px`,
              borderStyle: "solid",
              margin: 0,
            }} />
          </div>
        )}

        {/* Custom HTML */}
        {section.type === "html" && section.html_content && (
          <div className="w-full" style={{ backgroundColor: sectionBg }}>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:system-ui,sans-serif}</style></head><body>${section.html_content}</body></html>`}
              className="w-full border-0"
              style={{ minHeight: "200px" }}
              sandbox="allow-scripts allow-same-origin"
              onLoad={e => {
                try {
                  const doc = (e.currentTarget as HTMLIFrameElement).contentDocument
                  if (doc?.body)
                    (e.currentTarget as HTMLIFrameElement).style.height =
                      doc.body.scrollHeight + 32 + "px"
                } catch {}
              }}
            />
          </div>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bgColor} ${fontClass}`}>
      <StoreHeader
        vendor={vendor}
        store={store}
        categories={categories}
        collections={collections}
        products={[]}
      />

      {/* Page content */}
      {htmlMode ? (
        <div style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <InjectedHTML html={content} brandPrimary={resolvedBrandPrimary} />
        </div>
      ) : (
        <div className={`flex-1 w-full px-4 py-16 sm:px-6 ${resolvedIsDark ? "text-white" : "text-gray-900"}`}>
          <div className="w-full max-w-4xl mx-auto">
            <h1 className={`text-4xl font-bold mb-8 ${resolvedIsDark ? "text-white" : "text-gray-900"}`}>
              {livePage.title}
            </h1>
            <div
              className={`prose prose-lg max-w-none ${resolvedIsDark ? "prose-invert" : ""}`}
              style={{ "--tw-prose-links": resolvedBrandPrimary } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        </div>
      )}

      {/* Editor-added sections below page content */}
      {pageSections.filter((s: any) => !s.hidden).map(renderPageSection)}

      <StoreFooter
        vendor={vendor}
        store={store}
        categories={categories}
        collections={collections}
      />
    </div>
  )
}
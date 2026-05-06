// // src/components/store/PageSections.tsx
// // Renders per-page sections from store.sections.page_layouts
// // Used on every storefront page except home

// import Link from "next/link"
// import Image from "next/image"

// interface StoreSection {
//   id?: string; type: string; hidden?: boolean
//   title?: string; headline?: string; text?: string; image?: string
//   image_position?: "left" | "right"; background_color?: string; text_color?: string
//   cta_label?: string; cta_url?: string; limit?: number; columns?: number
//   product_ids?: string[]; collection_ids?: string[]; show_sold_out?: boolean
//   links?: { id: string; label: string; url: string }[]
//   html_content?: string; video_url?: string
//   ticker_items?: string[]; ticker_speed?: number; ticker_separator?: string
//   position?: "top" | "bottom"  // which side of system content this section appears
//   [key: string]: any
// }

// interface Props {
//   layoutKey: string
//   store: any
//   vendor: any
//   products: any[]
//   categories: any[]
//   collections: any[]
//   brandPrimary: string
//   isDark: boolean
//   position?: "top" | "bottom" | "all"  // "top" = sections before system content, "bottom" = after
// }

// const DEFAULT_PAGE_SECTIONS: Record<string, StoreSection[]> = {
//   products:    [],
//   collections: [],
//   collection:  [],
//   product:     [{ id: "def_prod_upsell", type: "featured", title: "You might also like", limit: 4, columns: 4 }],
//   cart:        [{ id: "def_cart_upsell", type: "featured", title: "Complete your look",  limit: 4, columns: 4 }],
//   search:      [],
// }

// export default function PageSections({ layoutKey, store, vendor, products, categories, collections, brandPrimary, isDark, position = "all" }: Props) {
//   const stored: StoreSection[] = store?.sections?.page_layouts?.[layoutKey]?.sections ?? []
//   const sections = stored.length > 0 ? stored : (DEFAULT_PAGE_SECTIONS[layoutKey] ?? [])

//   // position="top" → only sections marked position:"top" or no position set (first half)
//   // position="bottom" → only sections marked position:"bottom"
//   // position="all" → all sections (for pages with no system content)
//   const visible = sections.filter(s => {
//     if (s.hidden) return false
//     if (position === "all") return true
//     const sPos = s.position ?? "bottom"  // default new sections go below system content
//     return sPos === position
//   })
//   if (!visible.length) return null

//   return (
//     <>
//       {visible.map((section, i) => (
//         <PageSection key={section.id ?? i} section={section} vendor={vendor}
//           products={products} collections={collections} brandPrimary={brandPrimary}
//           isDark={isDark} handle={vendor.handle} />
//       ))}
//     </>
//   )
// }

// function PageSection({ section, vendor, products, collections, brandPrimary, isDark, handle }: {
//   section: StoreSection; vendor: any; products: any[]; collections: any[]
//   brandPrimary: string; isDark: boolean; handle: string
// }) {
//   const bg   = section.background_color
//   const fg   = section.text_color
//   const textColor = fg ?? (isDark ? "#e5e7eb" : "#374151")
//   const headingColor = fg ?? (isDark ? "#ffffff" : "#111827")

//   switch (section.type) {

//     case "announcement": case "header": case "footer": return null

//     case "text": {
//       if (!section.text) return null
//       return (
//         <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="max-w-3xl mx-auto prose prose-lg" style={{ color: textColor }}
//             dangerouslySetInnerHTML={{ __html: section.text
//               .replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>")
//               .replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
//               .replace(/\*(.+?)\*/g, "<em>$1</em>")
//               .replace(/^- (.+)$/gm, "<li>$1</li>")
//               .replace(/(<li>[\s\S]*?<\/li>?)+/g, (b: string) => `<ul>${b}</ul>`)
//               .replace(/^(?!<)(.+)$/gm, (l: string) => l.trim() ? `<p>${l}</p>` : "")
//             }} />
//         </section>
//       )
//     }

//     case "featured":
//     case "collection": {
//       const items = section.product_ids?.length
//         ? products.filter(p => section.product_ids!.includes(p.id))
//         : products.slice(0, section.limit ?? 4)
//       if (!items.length) return null
//       const cols = section.columns ?? 4
//       const grid = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
//       return (
//         <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="mx-auto max-w-7xl">
//             {section.title && (
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-bold" style={{ color: headingColor }}>{section.title}</h2>
//                 <Link href={`/${handle}/products`} className="text-sm font-medium" style={{ color: brandPrimary }}>View all →</Link>
//               </div>
//             )}
//             <div className={`grid ${grid} gap-4`}>
//               {items.map((p: any) => (
//                 <Link key={p.id} href={`/${handle}/products/${p.handle}`}
//                   className={`group rounded-xl overflow-hidden border hover:shadow-md transition-all ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"}`}>
//                   <div className="aspect-square relative bg-gray-100 overflow-hidden">
//                     {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
//                   </div>
//                   <div className="p-3">
//                     <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{p.title}</p>
//                     {p.variants?.[0]?.prices?.[0]?.amount && (
//                       <p className="text-sm font-bold mt-0.5" style={{ color: brandPrimary }}>
//                         ₹{Number(p.variants[0].prices[0].amount).toLocaleString("en-IN")}
//                       </p>
//                     )}
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>
//       )
//     }

//     case "image_text": {
//       const imageLeft = (section.image_position ?? "left") === "left"
//       return (
//         <section className="px-4 py-14 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="mx-auto max-w-6xl">
//             <div className={`flex flex-col gap-10 items-center ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
//               <div className="w-full md:w-1/2 shrink-0">
//                 {section.image
//                   ? <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]"><Image src={section.image} alt={section.title ?? ""} fill className="object-cover" /></div>
//                   : <div className="flex items-center justify-center rounded-2xl bg-gray-100 aspect-[4/3]"><span className="text-5xl opacity-20">🖼️</span></div>
//                 }
//               </div>
//               <div className="flex-1">
//                 {section.title && <h2 className="mb-4 text-3xl font-bold" style={{ color: headingColor }} dangerouslySetInnerHTML={{ __html: section.title }} />}
//                 {section.text && <div className="text-base leading-relaxed mb-6 prose prose-sm max-w-none" style={{ color: fg ? `${fg}cc` : (isDark ? "#d1d5db" : "#4b5563") }} dangerouslySetInnerHTML={{ __html: section.text }} />}
//                 {section.cta_label && (
//                   <Link href={section.cta_url ?? "#"} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-all"
//                     style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}>
//                     {section.cta_label}
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>
//       )
//     }

//     case "video": {
//       const ytMatch = (section.video_url ?? "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
//       if (!ytMatch) return null
//       return (
//         <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="max-w-4xl mx-auto">
//             {section.title && <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: headingColor }}>{section.title}</h2>}
//             <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
//               <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`}
//                 className="absolute inset-0 w-full h-full" allowFullScreen style={{ border: 0 }} />
//             </div>
//           </div>
//         </section>
//       )
//     }

//     case "ticker": {
//       const items: string[] = section.ticker_items ?? ["Free shipping on orders above ₹999"]
//       const sep = section.ticker_separator ?? "✦"
//       const duration = Math.round(200 - (section.ticker_speed ?? 40) * 1.5)
//       const line = items.join(`  ${sep}  `)
//       return (
//         <section className="overflow-hidden py-2.5" style={{ backgroundColor: bg ?? "#111827" }}>
//           <style>{`@keyframes pgTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.pg-ticker{display:inline-flex;white-space:nowrap;animation:pgTicker ${duration}s linear infinite}`}</style>
//           <div className="pg-ticker text-sm font-medium tracking-wide" style={{ color: fg ?? "#ffffff" }}>
//             {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => <span key={i} className="mr-8">{t}</span>)}
//           </div>
//         </section>
//       )
//     }

//     case "divider":
//       return <hr className={`mx-6 ${isDark ? "border-white/10" : "border-gray-100"}`} />

//     case "links": {
//       const links = section.links ?? []
//       if (!links.length) return null
//       return (
//         <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="max-w-lg mx-auto">
//             {section.title && <h2 className="mb-6 text-xl font-bold text-center" style={{ color: headingColor }}>{section.title}</h2>}
//             <div className="space-y-3">
//               {links.map((link: any, i: number) => (
//                 <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
//                   className="flex items-center justify-center w-full px-6 py-3.5 rounded-full font-semibold text-sm border-2 transition-all hover:scale-[1.02]"
//                   style={{ borderColor: fg ?? brandPrimary, color: fg ?? brandPrimary }}>
//                   {link.label}
//                 </a>
//               ))}
//             </div>
//           </div>
//         </section>
//       )
//     }

//     case "featured_collections": {
//       const ids: string[] = section.collection_ids ?? []
//       const toShow = ids.length ? collections.filter(c => ids.includes((c as any).id) || ids.includes((c as any).handle)) : collections
//       if (!toShow.length) return null
//       const cols = section.columns ?? 3
//       const grid = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
//       return (
//         <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
//           <div className="mx-auto max-w-7xl">
//             {section.title && <h2 className="text-xl font-bold mb-6" style={{ color: headingColor }}>{section.title}</h2>}
//             <div className={`grid ${grid} gap-5`}>
//               {toShow.map((col: any) => {
//                 const ids2: string[] = col.product_ids ?? []
//                 const thumb = col.thumbnail ?? products.find((p: any) => ids2.includes(p.id))?.thumbnail
//                 return (
//                   <Link key={col.id} href={`/${handle}/collections/${col.handle}`}
//                     className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3] block">
//                     {thumb && <Image src={thumb} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                     <div className="absolute bottom-0 left-0 right-0 p-4">
//                       <p className="text-base font-bold text-white">{col.title}</p>
//                     </div>
//                   </Link>
//                 )
//               })}
//             </div>
//           </div>
//         </section>
//       )
//     }

//     case "html": {
//       if (!section.html_content) return null
//       const srcDoc = `<!DOCTYPE html><html><head><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif}</style></head><body>${section.html_content}</body></html>`
//       return (
//         <section className="w-full" style={{ backgroundColor: bg ?? "transparent" }}>
//           <iframe srcDoc={srcDoc} className="w-full border-0 min-h-[200px]"
//             sandbox="allow-scripts allow-same-origin"
//             onLoad={e => { try { const d = (e.currentTarget as any).contentDocument; if (d?.body) (e.currentTarget as any).style.height = d.body.scrollHeight + 32 + "px" } catch {} }} />
//         </section>
//       )
//     }

//     case "image":
//       if (!section.image) return null
//       return (
//         <section className="w-full" style={{ backgroundColor: bg ?? "transparent" }}>
//           <img src={section.image} alt={section.title ?? ""} className="w-full object-cover max-h-[500px]" />
//         </section>
//       )

//     default: return null
//   }
// }

// src/components/store/PageSections.tsx
// Renders per-page sections from store.sections.page_layouts
// Used on every storefront page except home

import Link from "next/link"
import Image from "next/image"

interface StoreSection {
  id?: string; type: string; hidden?: boolean
  title?: string; headline?: string; text?: string; image?: string
  image_position?: "left" | "right"; background_color?: string; text_color?: string
  cta_label?: string; cta_url?: string; limit?: number; columns?: number
  product_ids?: string[]; collection_ids?: string[]; show_sold_out?: boolean
  links?: { id: string; label: string; url: string }[]
  html_content?: string; video_url?: string
  ticker_items?: string[]; ticker_speed?: number; ticker_separator?: string
  position?: "top" | "bottom"
  [key: string]: any
}

interface Props {
  layoutKey: string
  store: any
  vendor: any
  products: any[]
  categories: any[]
  collections: any[]
  brandPrimary: string
  isDark: boolean
  position?: "top" | "bottom" | "all"
  skipTypes?: string[]   // ← section types to skip (e.g. ["collection"] on AllProductsPage)
}

const DEFAULT_PAGE_SECTIONS: Record<string, StoreSection[]> = {
  // NOTE: "products" intentionally has NO default collection section here —
  // AllProductsPage renders its own ProductGrid with filters.
  // If no extra sections are saved, nothing extra renders.
  products:    [],
  collections: [],
  collection:  [],
  product:     [{ id: "def_prod_upsell",  type: "featured", title: "You might also like", limit: 4, columns: 4 }],
  cart:        [{ id: "def_cart_upsell",  type: "featured", title: "Complete your look",  limit: 4, columns: 4 }],
  search:      [],
}

export default function PageSections({
  layoutKey, store, vendor, products, categories, collections,
  brandPrimary, isDark,
  position = "all",
  skipTypes = [],
}: Props) {
  const stored: StoreSection[] = store?.sections?.page_layouts?.[layoutKey]?.sections ?? []
  const sections = stored.length > 0 ? stored : (DEFAULT_PAGE_SECTIONS[layoutKey] ?? [])

  const visible = sections.filter(s => {
    if (s.hidden) return false
    if (skipTypes.includes(s.type)) return false   // skip types handled by the page itself
    if (position === "all") return true
    const sPos = s.position ?? "bottom"
    return sPos === position
  })

  if (!visible.length) return null

  return (
    <>
      {visible.map((section, i) => (
        <PageSection
          key={section.id ?? i}
          section={section}
          vendor={vendor}
          products={products}
          collections={collections}
          brandPrimary={brandPrimary}
          isDark={isDark}
          handle={vendor.handle}
        />
      ))}
    </>
  )
}

function PageSection({ section, vendor, products, collections, brandPrimary, isDark, handle }: {
  section: StoreSection; vendor: any; products: any[]; collections: any[]
  brandPrimary: string; isDark: boolean; handle: string
}) {
  const bg  = section.background_color
  const fg  = section.text_color
  const textColor    = fg ?? (isDark ? "#e5e7eb" : "#374151")
  const headingColor = fg ?? (isDark ? "#ffffff" : "#111827")

  switch (section.type) {

    case "announcement": case "header": case "footer": return null

    // ── TEXT ──────────────────────────────────────────────────────────────────
    case "text": {
      if (!section.text) return null
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="max-w-3xl mx-auto prose prose-lg" style={{ color: textColor }}
            dangerouslySetInnerHTML={{ __html: section.text
              .replace(/^### (.+)$/gm, "<h3>$1</h3>")
              .replace(/^## (.+)$/gm, "<h2>$1</h2>")
              .replace(/^# (.+)$/gm, "<h1>$1</h1>")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>")
              .replace(/^- (.+)$/gm, "<li>$1</li>")
              .replace(/(<li>[\s\S]*?<\/li>?)+/g, (b: string) => `<ul>${b}</ul>`)
              .replace(/^(?!<)(.+)$/gm, (l: string) => l.trim() ? `<p>${l}</p>` : "")
            }} />
        </section>
      )
    }

    // ── FEATURED / COLLECTION (used on non-products pages e.g. home, product detail) ──
    case "featured":
    case "collection": {
      const items = section.product_ids?.length
        ? products.filter(p => section.product_ids!.includes(p.id))
        : products.slice(0, section.limit ?? 4)
      if (!items.length) return null
      const cols = section.columns ?? 4
      const grid = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            {section.title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: headingColor }}>{section.title}</h2>
                <Link href={`/${handle}/products`} className="text-sm font-medium" style={{ color: brandPrimary }}>View all →</Link>
              </div>
            )}
            <div className={`grid ${grid} gap-4`}>
              {items.map((p: any) => (
                <Link key={p.id} href={`/${handle}/products/${p.handle}`}
                  className={`group rounded-xl overflow-hidden border hover:shadow-md transition-all ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"}`}>
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
                  </div>
                  <div className="p-3">
                    <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{p.title}</p>
                    {p.variants?.[0]?.prices?.[0]?.amount && (
                      <p className="text-sm font-bold mt-0.5" style={{ color: brandPrimary }}>
                        ₹{Number(p.variants[0].prices[0].amount).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    }

    // ── IMAGE WITH TEXT ───────────────────────────────────────────────────────
    case "image_text": {
      const imageLeft = (section.image_position ?? "left") === "left"
      return (
        <section className="px-4 py-14 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="mx-auto max-w-6xl">
            <div className={`flex flex-col gap-10 items-center ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="w-full md:w-1/2 shrink-0">
                {section.image
                  ? <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]"><Image src={section.image} alt={section.title ?? ""} fill className="object-cover" /></div>
                  : <div className="flex items-center justify-center rounded-2xl bg-gray-100 aspect-[4/3]"><span className="text-5xl opacity-20">🖼️</span></div>}
              </div>
              <div className="flex-1">
                {section.title && <h2 className="mb-4 text-3xl font-bold" style={{ color: headingColor }} dangerouslySetInnerHTML={{ __html: section.title }} />}
                {section.text && <div className="text-base leading-relaxed mb-6 prose prose-sm max-w-none"
                  style={{ color: fg ? `${fg}cc` : (isDark ? "#d1d5db" : "#4b5563") }} dangerouslySetInnerHTML={{ __html: section.text }} />}
                {section.cta_label && (
                  <Link href={section.cta_url ?? "#"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-all"
                    style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}>
                    {section.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    }

    // ── VIDEO ─────────────────────────────────────────────────────────────────
    case "video": {
      const ytMatch = (section.video_url ?? "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/)
      if (!ytMatch) return null
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="max-w-4xl mx-auto">
            {section.title && <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: headingColor }}>{section.title}</h2>}
            <div className="relative w-full overflow-hidden shadow-xl rounded-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full" allowFullScreen style={{ border: 0 }} />
            </div>
          </div>
        </section>
      )
    }

    // ── TICKER ────────────────────────────────────────────────────────────────
    case "ticker": {
      const items: string[] = section.ticker_items ?? ["Free shipping on orders above ₹999"]
      const sep = section.ticker_separator ?? "✦"
      const duration = Math.round(200 - (section.ticker_speed ?? 40) * 1.5)
      const line = items.join(`  ${sep}  `)
      return (
        <section className="overflow-hidden py-2.5" style={{ backgroundColor: bg ?? "#111827" }}>
          <style>{`@keyframes pgTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.pg-ticker{display:inline-flex;white-space:nowrap;animation:pgTicker ${duration}s linear infinite}`}</style>
          <div className="pg-ticker text-sm font-medium tracking-wide" style={{ color: fg ?? "#ffffff" }}>
            {[`${line}  ${sep}  `, `${line}  ${sep}  `].map((t, i) => <span key={i} className="mr-8">{t}</span>)}
          </div>
        </section>
      )
    }

    // ── DIVIDER ───────────────────────────────────────────────────────────────
    case "divider":
      return <hr className={`mx-6 ${isDark ? "border-white/10" : "border-gray-100"}`} />

    // ── LINKS ─────────────────────────────────────────────────────────────────
    case "links": {
      const links = section.links ?? []
      if (!links.length) return null
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="max-w-lg mx-auto">
            {section.title && <h2 className="mb-6 text-xl font-bold text-center" style={{ color: headingColor }}>{section.title}</h2>}
            <div className="space-y-3">
              {links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-6 py-3.5 rounded-full font-semibold text-sm border-2 transition-all hover:scale-[1.02]"
                  style={{ borderColor: fg ?? brandPrimary, color: fg ?? brandPrimary }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    }

    // ── FEATURED COLLECTIONS ──────────────────────────────────────────────────
    case "featured_collections": {
      const ids: string[] = section.collection_ids ?? []
      const toShow = ids.length
        ? collections.filter(c => ids.includes((c as any).id) || ids.includes((c as any).handle))
        : collections
      if (!toShow.length) return null
      const cols = section.columns ?? 3
      const grid = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
      return (
        <section className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg ?? "transparent" }}>
          <div className="mx-auto max-w-7xl">
            {section.title && <h2 className="text-xl font-bold mb-6" style={{ color: headingColor }}>{section.title}</h2>}
            <div className={`grid ${grid} gap-5`}>
              {toShow.map((col: any) => {
                const ids2: string[] = col.product_ids ?? []
                const thumb = col.thumbnail ?? products.find((p: any) => ids2.includes(p.id))?.thumbnail
                return (
                  <Link key={col.id} href={`/${handle}/collections/${col.handle}`}
                    className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3] block">
                    {thumb && <Image src={thumb} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-base font-bold text-white">{col.title}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )
    }

    // ── CUSTOM HTML ───────────────────────────────────────────────────────────
    case "html": {
      if (!section.html_content) return null
      const srcDoc = `<!DOCTYPE html><html><head><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif}</style></head><body>${section.html_content}</body></html>`
      return (
        <section className="w-full" style={{ backgroundColor: bg ?? "transparent" }}>
          <iframe srcDoc={srcDoc} className="w-full border-0 min-h-[200px]"
            sandbox="allow-scripts allow-same-origin"
            onLoad={e => { try { const d = (e.currentTarget as any).contentDocument; if (d?.body) (e.currentTarget as any).style.height = d.body.scrollHeight + 32 + "px" } catch {} }} />
        </section>
      )
    }

    // ── IMAGE ─────────────────────────────────────────────────────────────────
    case "image":
      if (!section.image) return null
      return (
        <section className="w-full" style={{ backgroundColor: bg ?? "transparent" }}>
          <img src={section.image} alt={section.title ?? ""} className="w-full object-cover max-h-[500px]" />
        </section>
      )

    default: return null
  }
}
import type { StoreSection, StorePage, FooterColumn, NavItem, VendorStore } from "./types"
import { PAGE_LAYOUT_META } from "./constants"

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function genId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function getLayoutKeyForPath(path: string): string {
  if (!path || path === "/") return "home"
  if (path === "/products")    return "products"
  if (path === "/categories")  return "categories"
  if (path === "/collections") return "collections"
  if (path === "/cart")        return "cart"
  if (path === "/search")      return "search"
  if (path.startsWith("/products/"))    return "product"
  if (path.startsWith("/collections/")) return "collection"
  if (path.startsWith("/categories/"))  return "category"
  if (path.startsWith("/pages/"))       return `page_${path.replace("/pages/", "")}`
  return "home"
}

export function getPageSections(store: VendorStore, layoutKey: string): StoreSection[] {
  if (layoutKey === "home") {
    return (store.sections?.sections ?? []).map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  }
  const stored = (store.sections as any)?.page_layouts?.[layoutKey]?.sections
  if (stored && stored.length > 0) {
    return stored.map((s: any, i: number) => ({ ...s, id: s.id ?? genId() }))
  }
  const meta = PAGE_LAYOUT_META[layoutKey]
  return (meta?.defaultSections ?? []).map((s: any) => ({ ...s, id: s.id ?? genId() }))
}

export function setPageSections(
  store: VendorStore,
  layoutKey: string,
  newSections: StoreSection[]
): VendorStore {
  if (layoutKey === "home") {
    return { ...store, sections: { ...(store.sections ?? {}), sections: newSections } }
  }
  const existingSections = store.sections ?? { sections: [] }
  const existingLayouts  = (existingSections as any).page_layouts ?? {}
  return {
    ...store,
    sections: {
      ...existingSections,
      page_layouts: {
        ...existingLayouts,
        [layoutKey]: { sections: newSections },
      },
    } as any,
  }
}

export function getDefaultFooterColumns(
  collections: { id: string; title: string; handle: string }[],
  categories:  { id: string; name: string; handle: string; product_count: number }[],
  pages: StorePage[],
  store?: Partial<VendorStore>
): FooterColumn[] {
  const followItems = [
    store?.instagram_url ? { id: "f_ig", label: "Instagram",   url: store.instagram_url } : null,
    store?.youtube_url   ? { id: "f_yt", label: "YouTube",     url: store.youtube_url   } : null,
    store?.twitter_url   ? { id: "f_tw", label: "Twitter / X", url: store.twitter_url   } : null,
    store?.facebook_url  ? { id: "f_fb", label: "Facebook",    url: store.facebook_url  } : null,
    store?.tiktok_url    ? { id: "f_tt", label: "TikTok",      url: store.tiktok_url    } : null,
  ].filter(Boolean) as NavItem[]

  const cols: FooterColumn[] = [
    {
      id: "col_shop",
      heading: "Shop",
      items: [
        { id: "f_products", label: "All Products", url: "/products" },
        ...collections.slice(0, 4).map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}` })),
      ],
    },
    {
      id: "col_categories",
      heading: "Categories",
      items: categories.slice(0, 5).map(c => ({ id: c.id, label: c.name, url: `/categories/${c.handle}` })),
    },
    {
      id: "col_info",
      heading: "Information",
      items: pages
        .filter(p => p.in_footer)
        .map(p => ({ id: p.id, label: p.title, url: `/pages/${p.slug}` })),
    },
    {
      id: "col_follow",
      heading: "Follow Us",
      items: followItems.length > 0 ? followItems : [
        { id: "f_ig_placeholder", label: "Instagram", url: "#" },
        { id: "f_yt_placeholder", label: "YouTube",   url: "#" },
      ],
    },
  ]

  // Deduplicate by heading
  const seen = new Set<string>()
  return cols.filter(c => {
    const key = c.heading.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function sanitizeRichText(html: string): string {
  if (!html) return ""
  const cleaned = html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/<(?!\/?(?:b|i|u|s|strong|em|a|br|p|ul|ol|li|span)(?:\s|>|\/))[^>]+>/gi, "")
  const text = cleaned.replace(/<[^>]*>/g, "").trim()
  return text ? cleaned : ""
}
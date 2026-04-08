// ── Creator category ─────────────────────────────────────────────────────────

export const CreatorCategoryEnum = [
  "Art",
  "Music",
  "Cinema",
  "Fashion",
  "Sports",
  "Comedy",
  "Gaming",
  "Influencer",
  "other"
] as const

export type CreatorCategory = (typeof CreatorCategoryEnum)[number]

// ── Store template ────────────────────────────────────────────────────────────

export const StoreTemplateEnum = ["minimal", "bold", "editorial"] as const
export type StoreTemplate = (typeof StoreTemplateEnum)[number]

// minimal   — clean, white, product-focused (think Apple Store)
// bold      — dark bg, big typography, merch-forward (think music artist sites)
// editorial — magazine-style, content + product mixed (think fashion brands)

// ── Store status ──────────────────────────────────────────────────────────────

export const StoreStatusEnum = ["draft", "live", "paused"] as const
export type StoreStatus = (typeof StoreStatusEnum)[number]

// draft  — creator is building, not publicly visible
// live   — publicly accessible at subdomain/custom domain
// paused — temporarily hidden (creator choice or admin action)

// ── Store section types (what the page builder supports) ─────────────────────

export type StoreSectionType =
  | "hero"        // full-width banner with headline + CTA
  | "featured"    // hand-picked product grid
  | "collection"  // auto product grid (all published products)
  | "about"       // text + optional image
  | "social"      // Instagram/YouTube/Twitter links
  | "announcement"// banner bar at top of page
  | "divider"     // visual separator

export interface StoreSectionHero {
  type: "hero"
  headline?: string
  subtext?: string
  cta_label?: string
  cta_url?: string
  background_image?: string
}

export interface StoreSectionFeatured {
  type: "featured"
  title?: string
  product_ids: string[]
}

export interface StoreSectionCollection {
  type: "collection"
  title?: string
  limit?: number  // how many products to show, default 12
}

export interface StoreSectionAbout {
  type: "about"
  title?: string
  text?: string
  image?: string
  image_position?: "left" | "right"
}

export interface StoreSectionSocial {
  type: "social"
  title?: string
  show_instagram?: boolean
  show_youtube?: boolean
  show_twitter?: boolean
  show_facebook?: boolean
}

export interface StoreSectionAnnouncement {
  type: "announcement"
  text: string
  background_color?: string
}

export interface StoreSectionDivider {
  type: "divider"
}

export type StoreSection =
  | StoreSectionHero
  | StoreSectionFeatured
  | StoreSectionCollection
  | StoreSectionAbout
  | StoreSectionSocial
  | StoreSectionAnnouncement
  | StoreSectionDivider

export interface StoreSections {
  sections: StoreSection[]
}
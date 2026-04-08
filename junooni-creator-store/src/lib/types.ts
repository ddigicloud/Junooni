// ── Store config ──────────────────────────────────────────────────────────────

export type StoreTemplate = "minimal" | "bold" | "editorial"
export type StoreStatus   = "draft" | "live" | "paused"
export type StoreFont     = "inter" | "poppins" | "playfair"

export interface VendorStore {
  id: string
  subdomain: string | null
  custom_domain: string | null
  domain_verified: boolean
  template: StoreTemplate
  status: StoreStatus
  primary_color: string
  secondary_color: string
  font: StoreFont
  hero_image: string | null
  tagline: string | null
  announcement_text: string | null
  sections: StoreSections | null
  seo_title: string | null
  seo_description: string | null
  pages: { pages: StorePage[] } | null
  sticky_header?: boolean
  sticky_announcement?: boolean
}

export interface StorePage {
  id: string
  title: string
  slug: string
  template: string
  content: string
  in_nav: boolean
  in_footer: boolean
  created_at: string
}

// ── Vendor ────────────────────────────────────────────────────────────────────

export interface PublicVendor {
  id: string
  handle: string
  name: string
  logo: string | null
  coverphoto: string | null
  creator_bio: string | null
  creator_title: string | null
  creator_category: string | null
  instagram: string | null
  youtube: string | null
  xtwitter: string | null
  facebook: string | null
  othersocial: string | null
}

// ── Sections ──────────────────────────────────────────────────────────────────

export interface StoreSections { sections: StoreSection[] }

// Base fields shared by all sections
interface BaseSectionFields {
  id?: string
  hidden?: boolean
}

export type StoreSection =
  | HeroSection | FeaturedSection | CollectionSection | AboutSection
  | SocialSection | AnnouncementSection | DividerSection
  | HtmlSection | TextSection | ImageSection

export interface HeroSection extends BaseSectionFields {
  type: "hero"; headline?: string; subtext?: string
  cta_label?: string; cta_url?: string; background_image?: string
}
export interface FeaturedSection extends BaseSectionFields {
  type: "featured"; title?: string; product_ids?: string[]
}
export interface CollectionSection extends BaseSectionFields {
  type: "collection"; title?: string; limit?: number
}
export interface AboutSection extends BaseSectionFields {
  type: "about"; title?: string; text?: string
  image?: string; image_position?: "left" | "right"
}
export interface SocialSection extends BaseSectionFields {
  type: "social"; title?: string
  show_instagram?: boolean; show_youtube?: boolean
  show_twitter?: boolean; show_facebook?: boolean
}
export interface AnnouncementSection extends BaseSectionFields {
  type: "announcement"; text?: string; title?: string
  background_color?: string; text_color?: string
}
export interface DividerSection extends BaseSectionFields { type: "divider" }
export interface HtmlSection extends BaseSectionFields {
  type: "html"; html_content?: string
}
export interface TextSection extends BaseSectionFields {
  type: "text"; text?: string; title?: string
}
export interface ImageSection extends BaseSectionFields {
  type: "image"; image?: string; title?: string
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  title: string
  prices: { amount: number; currency_code: string }[]
}

export interface ProductOption {
  id: string
  title: string
  values: { id: string; value: string }[]
}

export interface ProductCategory {
  id: string
  name: string
  handle: string
}

export interface ProductCollection {
  id: string
  title: string
  handle: string
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
  created_at: string
  variants: ProductVariant[]
  images: { id: string; url: string }[]
  options: ProductOption[]
  categories: ProductCategory[]
  collection: ProductCollection | null
}

// ── Category / Collection metadata ───────────────────────────────────────────

export interface CategoryMeta {
  id: string
  name: string
  handle: string
  product_count: number
}

export interface CollectionMeta {
  id: string
  title: string
  handle: string
  product_count: number
  // Vendor collections have extra fields
  description?: string
  thumbnail?: string | null
  product_ids?: string[]
  is_visible?: boolean
  sort_order?: number
}

// ── Full storefront API response ──────────────────────────────────────────────

export interface StorefrontData {
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories: CategoryMeta[]
  collections: CollectionMeta[]
}
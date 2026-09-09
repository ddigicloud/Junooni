// ── Store config (from vendor_store table) ────────────────────────────────────

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
  store_logo: string | null
  store_favicon: string | null
  og_image?: string | null
  sections: StoreSections | null
  pages?: { pages: StorePage[] } | null
  seo_title: string | null
  seo_description: string | null
  sticky_header?: boolean
  sticky_announcement?: boolean
  // Password protection — store_password hash is never returned from API
  password_enabled: boolean
}

// ── Vendor public profile ─────────────────────────────────────────────────────

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

// ── Custom pages ──────────────────────────────────────────────────────────────

export interface StorePage {
  id: string
  title: string
  slug: string
  template: "blank" | "about" | "faq" | "contact" | "links"
  content: string
  in_nav: boolean
  in_footer: boolean
  created_at: string
}

// ── Page sections ─────────────────────────────────────────────────────────────

export interface StoreSections {
  sections: StoreSection[]
}

export type StoreSection =
  | HeroSection
  | FeaturedSection
  | CollectionSection
  | AboutSection
  | SocialSection
  | AnnouncementSection
  | DividerSection
  | ImageSliderSection

export interface HeroSection {
  type: "hero"
  headline?: string
  subtext?: string
  cta_label?: string
  cta_url?: string
  background_image?: string
}

export interface FeaturedSection {
  type: "featured"
  title?: string
  product_ids: string[]
}

export interface CollectionSection {
  type: "collection"
  title?: string
  limit?: number
}

export interface AboutSection {
  type: "about"
  title?: string
  text?: string
  image?: string
  image_position?: "left" | "right"
}

export interface SocialSection {
  type: "social"
  title?: string
  show_instagram?: boolean
  show_youtube?: boolean
  show_twitter?: boolean
  show_facebook?: boolean
}

export interface AnnouncementSection {
  type: "announcement"
  text: string
  background_color?: string
}

export interface DividerSection {
  type: "divider"
}

export interface ImageSliderSection {
  type: "image_slider"
  slides?: { image: string; caption?: string; link?: string }[]
  slider_height?: number
  slider_autoplay?: boolean
  slider_interval?: number
  slider_fit?: "cover" | "contain"
  slider_show_dots?: boolean
  slider_show_arrows?: boolean
  background_color?: string
  text_color?: string
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  title: string
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
  variants: ProductVariant[]
  metadata?: Record<string, any>
  images: { id: string; url: string }[]
  options: {
    id: string
    title: string
    values: { id: string; value: string }[]
  }[]
}

// ── Full storefront API response ──────────────────────────────────────────────

export interface CollectionMeta {
  id: string
  title: string
  handle: string
  product_count?: number
  product_ids?: string[]
  is_visible?: boolean
  sort_order?: number
}

export interface CategoryMeta {
  id: string
  name: string
  handle: string
  product_count?: number
}

export interface StorefrontData {
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
  categories?: CategoryMeta[]
  collections?: CollectionMeta[]
}


interface ProductDetailSettings {
  element_order?: string[]
  title_size?: "sm" | "md" | "lg" | "xl"
  title_weight?: "normal" | "semibold" | "bold" | "extrabold"
  title_color?: string
  price_color?: string
  price_size?: "sm" | "md" | "lg" | "xl"
  colors_label?: string
  show_color_label?: boolean
  color_swatch_size?: "sm" | "md" | "lg"
  sizes_label?: string
  show_size_label?: boolean
  size_style?: "pill" | "box" | "underline"
  size_bg_color?: string
  size_text_color?: string
  size_border_color?: string
  atc_label?: string
  atc_style?: "filled" | "outline" | "pill"
  atc_full_width?: boolean
  atc_text_color?: string
  show_quantity?: boolean
  qty_bg_color?: string
  qty_text_color?: string
  qty_border_color?: string
  show_description?: boolean
  description_collapsed?: boolean
  show_secure_badge?: boolean
  secure_badge_text?: string
  accordion_text_color?: string
  show_short_description?: boolean
  page_bg_color?: string
  image_border_radius?: number
  thumbnail_position?: "below" | "left"
  related_heading?: string
  related_heading_size?: "sm" | "md" | "lg"
  related_heading_align?: "left" | "center" | "right"
  related_card_radius?: number
  related_card_bg?: string
  related_card_text?: string
  [key: string]: any
}
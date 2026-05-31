export type SectionType =
  | "header" | "hero" | "featured" | "collection" | "featured_collections"
  | "about" | "social" | "announcement" | "divider" | "image" | "text"
  | "html" | "video" | "links" | "footer" | "category_grid" | "category_products"
  | "ticker" | "image_text" | "video_text" | "featured_product"
  | "collections_grid" | "collection_products"

export type EditorTab = "layout" | "style" | "pages" | "theme"

export type PageTemplate =
  | "blank" | "about" | "faq" | "contact" | "links"
  | "terms" | "privacy" | "returns"

export interface NavItem {
  id: string
  label: string
  url: string
  external?: boolean
  children?: NavItem[]
}

export interface FooterColumn {
  id: string
  heading: string
  items: NavItem[]
}

export interface ProductDetailSettings {
  element_order?: Array<"title" | "price" | "colors" | "sizes" | "quantity" | "atc" | "description" | "meta">
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
  atc_label?: string
  atc_style?: "filled" | "outline" | "pill"
  atc_full_width?: boolean
  show_quantity?: boolean
  show_description?: boolean
  description_collapsed?: boolean
  show_secure_badge?: boolean
  secure_badge_text?: string
}

export interface StoreSection {
  id: string
  type: SectionType
  hidden?: boolean
  title?: string
  headline?: string
  headline_size?: "sm" | "md" | "lg"
  subtext?: string
  cta_label?: string
  cta_url?: string
  cta_secondary_label?: string
  cta_secondary_url?: string
  overlay_color?: string
  overlay_text_color?: string
  background_image?: string
  background_color?: string
  text_color?: string
  text?: string
  image?: string
  image_position?: "left" | "right"
  product_ids?: string[]
  collection_ids?: string[]
  limit?: number
  columns?: 2 | 3 | 4 | 5
  show_sold_out?: boolean
  show_product_count?: boolean
  show_instagram?: boolean
  show_youtube?: boolean
  show_twitter?: boolean
  show_facebook?: boolean
  html_content?: string
  video_url?: string
  video_autoplay?: boolean
  links?: { id: string; label: string; url: string; icon?: string }[]
  logo_position?: "left" | "center"
  show_social_icons?: boolean
  nav_items?: NavItem[]
  footer_nav_items?: NavItem[]
  show_newsletter?: boolean
  footer_columns?: FooterColumn[]
  footer_columns_per_row?: number
  footer_columns_per_row_mobile?: number
  logo_size_desktop?: number
  logo_size_mobile?: number
  footer_logo_size_desktop?: number
  footer_logo_size_mobile?: number
  ticker_items?: string[]
  ticker_speed?: number
  ticker_separator?: string
  video_text_url?: string
  mobile_image_position?: "top" | "bottom"
  featured_product_id?: string
  featured_product_heading?: string
  featured_product_show_title?: boolean
  featured_product_show_price?: boolean
  featured_product_show_colors?: boolean
  show_filters?: boolean
  show_sort?: boolean
  show_price_filter?: boolean
  show_category_filter?: boolean
  show_collection_filter?: boolean
  filter_order?: string[]
  [key: string]: any
}

export interface StorePage {
  id: string
  title: string
  slug: string
  template: PageTemplate
  content: string
  in_nav: boolean
  in_footer: boolean
  created_at: string
}

export interface ProductCardSettings {
  aspect_ratio?: "square" | "portrait" | "landscape"
  show_price?: boolean
  show_hover?: boolean
  alignment?: "left" | "center"
  show_sold_out_badge?: boolean
  columns_desktop?: 3 | 4 | 5
}

export interface VendorStore {
  id?: string
  subdomain?: string
  custom_domain?: string
  domain_verified?: boolean
  template?: string
  status?: string
  font?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  hero_image?: string
  tagline?: string
  announcement_text?: string
  store_logo?: string
  store_favicon?: string
  sections?: {
    sections: StoreSection[]
    page_layouts?: Partial<Record<string, { sections: StoreSection[] }>>
  }
  pages?: { pages: StorePage[] }
  seo_title?: string
  seo_description?: string
  og_image?: string
  border_radius?: "none" | "sm" | "md" | "lg" | "full"
  button_style?: "filled" | "outline" | "ghost"
  product_card?: ProductCardSettings
  sticky_header?: boolean
  sticky_announcement?: boolean
  instagram_url?: string
  youtube_url?: string
  twitter_url?: string
  facebook_url?: string
  tiktok_url?: string
  discord_url?: string
  product_detail?: ProductDetailSettings
  custom_css?: string
}